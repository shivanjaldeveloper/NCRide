// Thin client around the `auth.asmx` customer endpoints.
//
//   POST /apiv1/customer/auth.asmx/VerifyNumber      -> sends the OTP, returns an OtpTransaction id
//   POST /apiv1/customer/auth.asmx/VerifyOtp         -> verifies the OTP against that transaction id
//   POST /apiv1/customer/auth.asmx/ReSendOtp         -> resends the OTP for an existing transaction, returns a NEW OtpTransaction id
//   POST /apiv1/customer/auth.asmx/VerifyCookie      -> validates a stored session cookie, returns a (possibly rotated) Cookie/Username/Name(/Email)
//   POST /apiv1/customer/auth.asmx/UserProfileUpdate -> sets name+email on a validated cookie (Complete Profile screen)
//
// All of the above take PLAIN `application/x-www-form-urlencoded` bodies
// and are protected by a static bearer token (this is an app-level key, not
// a per-user session token — the per-user session is the `Cookie` value
// returned by VerifyOtp/VerifyCookie, which we store locally after login).
// Confirmed working against the live server — left as plain `post()`.
//
// `postEncrypted` further below is for FUTURE endpoints only, once a real
// encryption key exists — none of the above use it.

import { encrypt, decryptJson, ENCRYPTION_ENABLED } from '../utils/crypto';

const BASE_URL = 'https://aloapp.shop/apiv1/customer/auth.asmx';

// Same static app-auth bearer used across the auth.asmx endpoints.
const API_BEARER_TOKEN = 'LrhTJugsRqEnefmaykA4wKNY';

const logInfo = (tag: string, detail: string) => {
  if (__DEV__) {
    console.log(`[authApi] ${tag} → ${detail}`);
  }
};

const logError = (tag: string, detail: unknown) => {
  if (__DEV__) {
    console.warn(`[authApi] ${tag} → `, detail);
  }
};

export type ApiResult = 'Success' | 'Failed' | string;

export interface VerifyNumberResponse {
  Result: ApiResult;
  OtpTransaction: string;
  Mobile: string;
  ResponseDateTime: string;
  // Some backends surface a message field on failure — kept optional so we
  // don't break typing if it's absent.
  Message?: string;
}

export interface VerifyOtpResponse {
  Result: ApiResult;
  Cookie: string;
  Username: string;
  // Empty string ('') means this mobile number has no name on file yet ->
  // treat as a brand-new user and route to registration.
  Name: string;
  // CONFIRMED present on live responses alongside Name. Still optional
  // here since callers (OTPVerifyScreen) always follow this up with a
  // VerifyCookie call as the authoritative source and don't read this
  // field directly — kept tolerant in case a legacy/edge response omits it.
  Email?: string;
  ResponseDateTime: string;
  Message?: string;
}

export interface ReSendOtpResponse {
  Result: ApiResult;
  // "OTP resent successfully" on success — informational only, not relied
  // on for control flow.
  Message?: string;
  // A resend issues a NEW transaction id — the old one is no longer valid,
  // callers must swap this in before the next VerifyOtp call.
  OtpTransaction: string;
  ResponseDateTime: string;
}

export interface VerifyCookieResponse {
  Result: ApiResult;
  // The server may rotate the cookie on each verification — always persist
  // this value rather than assuming the cookie you sent is still current.
  Cookie: string;
  Username: string;
  Name: string;
  // CONFIRMED present on live VerifyCookie responses. Kept optional/
  // tolerant rather than required so a legacy/incomplete-profile account
  // (empty string, or genuinely absent) doesn't break the response shape —
  // Splash/OTPVerify/Registration all treat a missing-or-empty value the
  // same way (route to Registration to complete the profile).
  Email?: string;
  ResponseDateTime: string;
  Message?: string;
}

export interface UserProfileUpdateResponse {
  Result: ApiResult;
  // "Profile Updated Successfully" on success — informational only.
  Message?: string;
  ResponseDateTime: string;
  // CONFIRMED: this endpoint does NOT echo back Cookie/Username/Name/Email
  // — callers should follow up with a VerifyCookie call to get the
  // authoritative post-update values (RegistrationScreen already does
  // this).
}

export interface UserRefUpdateResponse {
  Result: ApiResult;
  // "Refer Updated Successfully" on success — informational only.
  Message?: string;
  ResponseDateTime: string;
  // CONFIRMED: same shape as UserProfileUpdate — no Cookie/Username echoed
  // back, so there's nothing to re-persist locally after this call.
}

class AuthApiError extends Error {
  // Duck-typing marker — belt-and-suspenders alongside `instanceof`, since
  // classes extending the built-in Error can lose their prototype chain
  // when transpiled for older JS targets (a classic RN/Metro/Babel/Hermes
  // gotcha). This flag lets callers reliably detect an AuthApiError even if
  // `instanceof AuthApiError` were to fail for that reason.
  isAuthApiError: true;

  // Exact form body that was sent, and the raw server response (status +
  // parsed JSON, when available) — surfaced so the UI can show *precisely*
  // what was sent/received without needing logcat/Metro access.
  requestBody?: string;
  responseStatus?: number;
  responseBody?: unknown;

  constructor(
    message: string,
    debug?: {
      requestBody?: string;
      responseStatus?: number;
      responseBody?: unknown;
    },
  ) {
    super(message);
    this.name = 'AuthApiError';
    // Restore the prototype chain — without this, `instanceof AuthApiError`
    // can return false after this error crosses a transpiled class
    // boundary, and callers silently fall through to a generic
    // "something went wrong" branch instead of the real handling.
    Object.setPrototypeOf(this, AuthApiError.prototype);
    // Plain constructor assignment rather than a class-field initializer —
    // avoids depending on the class-properties transform being configured
    // identically everywhere this file gets bundled.
    this.isAuthApiError = true;
    this.requestBody = debug?.requestBody;
    this.responseStatus = debug?.responseStatus;
    this.responseBody = debug?.responseBody;
  }
}

// Reliable check that doesn't depend on `instanceof` surviving
// transpilation — checks the duck-typing marker first, falls back to
// instanceof for environments where the prototype chain is intact.
export function isAuthApiError(err: unknown): err is AuthApiError {
  if (!err || typeof err !== 'object') return false;
  return err instanceof AuthApiError || (err as any).isAuthApiError === true;
}

const post = async <T>(
  path: string,
  form: Record<string, string>,
): Promise<T> => {
  const body = new URLSearchParams(form).toString();

  logInfo(path, `request ${body}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
      body,
    });
  } catch (err) {
    logError(path, err);
    throw new AuthApiError(
      'Unable to reach the server. Please check your internet connection and try again.',
      { requestBody: body },
    );
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    logError(path, err);
    throw new AuthApiError('Something went wrong. Please try again.', {
      requestBody: body,
      responseStatus: response.status,
    });
  }

  logInfo(path, `response ${JSON.stringify(json)}`);

  if (!response.ok || json?.Result !== 'Success') {
    // This backend's failure shape puts the human-readable reason in
    // `Error` (e.g. {"Result":"Error","Error":"Invalid OTP",...}), not
    // `Message` — `Message` is only populated on *success* responses (e.g.
    // ReSendOtp's "OTP resent successfully"). Check both so failures show
    // their real reason instead of falling through to the generic text.
    throw new AuthApiError(
      json?.Message || json?.Error || 'Something went wrong. Please try again.',
      {
        requestBody: body,
        responseStatus: response.status,
        responseBody: json,
      },
    );
  }

  return json as T;
};

/**
 * Encrypted counterpart to `post`, for FUTURE endpoints only — the 4
 * endpoints above are confirmed working as plain form data and are
 * deliberately left alone.
 *
 * Wire-format assumptions (best guess — confirm against the first real
 * encrypted endpoint and adjust if the backend actually expects something
 * different, e.g. a single encrypted JSON blob instead of per-field
 * encryption):
 *   - Field NAMES stay plain (server needs them to route the values); only
 *     each field VALUE is individually AES-encrypted + base58-encoded
 *     before being form-urlencoded, same shape as the plain endpoints.
 *   - The response is JSON where every string leaf (recursively, including
 *     nested objects/arrays) comes back encrypted the same way — decrypted
 *     via decryptJson before we ever look at Result/Error/etc.
 *   - Same bearer token + Content-Type as the plain endpoints.
 *
 * `baseUrl` is overridable since future endpoints may live under a
 * different .asmx service than auth.asmx.
 *
 * While ENCRYPTION_ENABLED (utils/crypto.ts) is false — i.e. no real key
 * yet — this sends/receives data COMPLETELY UNTOUCHED, identical to plain
 * `post()`. So it's safe to start wiring new endpoints through
 * `postEncrypted` right now: they'll work exactly like unencrypted calls
 * until the day you flip that one flag + drop in the real key, at which
 * point encryption turns on with zero other code changes.
 */
const postEncrypted = async <T>(
  path: string,
  form: Record<string, string>,
  options?: { baseUrl?: string },
): Promise<T> => {
  const baseUrl = options?.baseUrl ?? BASE_URL;

  const outgoingForm: Record<string, string> = {};
  for (const key in form) {
    outgoingForm[key] = ENCRYPTION_ENABLED ? encrypt(form[key]) : form[key];
  }
  const body = new URLSearchParams(outgoingForm).toString();

  logInfo(
    path,
    `${
      ENCRYPTION_ENABLED ? 'encrypted' : 'plain (encryption not yet enabled)'
    } request ${body}`,
  );

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
      body,
    });
  } catch (err) {
    logError(path, err);
    throw new AuthApiError(
      'Unable to reach the server. Please check your internet connection and try again.',
      { requestBody: body },
    );
  }

  let rawJson: any;
  try {
    rawJson = await response.json();
  } catch (err) {
    logError(path, err);
    throw new AuthApiError('Something went wrong. Please try again.', {
      requestBody: body,
      responseStatus: response.status,
    });
  }

  // Decrypt every string leaf in the response BEFORE looking at
  // Result/Error/Message — on encrypted endpoints those field values are
  // expected to come back encrypted too, not just business-data fields.
  // Skipped entirely while ENCRYPTION_ENABLED is false.
  let json: any;
  if (ENCRYPTION_ENABLED) {
    try {
      json = decryptJson(rawJson);
    } catch (err) {
      logError(path, err);
      throw new AuthApiError(
        'Received a response we could not decrypt. Please try again.',
        {
          requestBody: body,
          responseStatus: response.status,
          responseBody: rawJson,
        },
      );
    }
  } else {
    json = rawJson;
  }

  logInfo(
    path,
    `${ENCRYPTION_ENABLED ? 'decrypted' : 'plain'} response ${JSON.stringify(
      json,
    )}`,
  );

  if (!response.ok || json?.Result !== 'Success') {
    throw new AuthApiError(
      json?.Message || json?.Error || 'Something went wrong. Please try again.',
      {
        requestBody: body,
        responseStatus: response.status,
        responseBody: json,
      },
    );
  }

  return json as T;
};

export { postEncrypted };

/**
 * Step 1 — Send an OTP to `mobile`.
 * Returns the OtpTransaction id that must be echoed back in `verifyOtp`.
 */
export const verifyNumber = (mobile: string): Promise<VerifyNumberResponse> =>
  post<VerifyNumberResponse>('VerifyNumber', { mobile });

/**
 * Step 2 — Verify the OTP against the transaction id from `verifyNumber`.
 * On success returns a `Cookie` (session token) + `Username` + `Name`.
 * `Name` is empty for a brand-new user — the caller should route to the
 * registration screen in that case.
 *
 * UI-vs-backend digit mismatch: OTPVerifyScreen only collects 4 digits from
 * the user, but this backend still expects a 6-digit OTP — '56' is
 * appended here as a fixed suffix before the request goes out, so the
 * screen (and any other caller) only ever has to deal with the 4 digits
 * the user actually typed.
 */
export const verifyOtp = (
  otpTransaction: string,
  otp: string,
): Promise<VerifyOtpResponse> =>
  post<VerifyOtpResponse>('VerifyOtp', { otpTransaction, otp: `${otp}56` });

/**
 * Resend the OTP for an in-progress login. Takes the CURRENT otpTransaction
 * and returns a NEW one — the caller must swap it in (the old transaction
 * id is no longer valid for VerifyOtp after this call).
 */
export const resendOtp = (otpTransaction: string): Promise<ReSendOtpResponse> =>
  post<ReSendOtpResponse>('ReSendOtp', { otpTransaction });

/**
 * Validate a previously-stored session cookie (e.g. on app launch, before
 * trusting a locally-cached "logged in" flag). On success returns a
 * Cookie/Username/Name — the Cookie may be rotated, so always re-persist
 * whatever comes back rather than assuming the one you sent is still valid.
 * Throws (AuthApiError) if the cookie is no longer valid — callers should
 * treat that as "session expired" and route back to login.
 */
export const verifyCookie = (cookie: string): Promise<VerifyCookieResponse> =>
  post<VerifyCookieResponse>('VerifyCookie', { cookie });

/**
 * Complete/update the user's profile (name + email) against a validated
 * session cookie. Used by the "Complete Profile" screen right after a
 * VerifyCookie check comes back with Name/Email missing.
 */
export const updateUserProfile = (
  cookie: string,
  name: string,
  email: string,
): Promise<UserProfileUpdateResponse> =>
  post<UserProfileUpdateResponse>('UserProfileUpdate', { cookie, name, email });

/**
 * Attach a referral code to the account (Complete Profile screen, optional
 * field). Takes a validated session cookie + the referral code the new
 * user was given. Best-effort: callers should treat a failure here as
 * non-fatal to the signup flow (the account/profile is already created by
 * this point) — surface it as a soft warning rather than blocking Home.
 */
export const userRefUpdate = (
  cookie: string,
  refer: string,
): Promise<UserRefUpdateResponse> =>
  post<UserRefUpdateResponse>('UserRefUpdate', { cookie, refer });

export { AuthApiError };
