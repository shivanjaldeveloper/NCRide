// Thin client around the `auth.asmx` customer endpoints.
//
//   POST /apiv1/customer/auth.asmx/VerifyNumber   -> sends the OTP, returns an OtpTransaction id
//   POST /apiv1/customer/auth.asmx/VerifyOtp      -> verifies the OTP against that transaction id
//
// Both endpoints take `application/x-www-form-urlencoded` bodies and are
// protected by a static bearer token (this is an app-level key, not a
// per-user session token — the per-user session is the `Cookie` value
// returned by VerifyOtp, which we store locally after login).

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
  ResponseDateTime: string;
  Message?: string;
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
    throw new AuthApiError(
      json?.Message || 'Something went wrong. Please try again.',
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
 */
export const verifyOtp = (
  otpTransaction: string,
  otp: string,
): Promise<VerifyOtpResponse> =>
  post<VerifyOtpResponse>('VerifyOtp', { otpTransaction, otp });

export { AuthApiError };
