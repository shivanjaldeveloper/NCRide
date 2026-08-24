// Ride-estimate API — given a pickup + drop coordinate, returns the
// resolved addresses, the route (distance/duration + an encoded polyline
// to draw), and every ride mode (Bike/Auto/E-Rickshaw/etc.) available for
// that trip with live fares, discounts, ETA, and driver counts.
//
// Same request/response conventions as services/authApi.ts (form-urlencoded
// POST, static app-auth bearer, `Result: "Success"` envelope) — mirrored
// here rather than imported since this hits a different .asmx service.
//
// Confirmed against the live backend via curl:
//   POST https://aloapp.shop/apiv1/customer/customer-riderequest.asmx/GetRideEstimate
//   Content-Type: application/x-www-form-urlencoded
//   Authorization: Bearer <same static app bearer as auth.asmx>
//   Body: cookie, pickupLatitude, pickupLongitude, pickupAddress,
//         dropLatitude, dropLongitude, dropAddress, region
const BASE_URL = 'https://aloapp.shop/apiv1/customer/customer-riderequest.asmx';
const PATH = 'GetRideEstimate';

// Same static app-auth bearer used across auth.asmx endpoints.
const API_BEARER_TOKEN = 'LrhTJugsRqEnefmaykA4wKNY';

const logInfo = (tag: string, detail: string) => {
  if (__DEV__) console.log(`[rideApi] ${tag} → ${detail}`);
};
const logError = (tag: string, detail: unknown) => {
  if (__DEV__) console.warn(`[rideApi] ${tag} → `, detail);
};

export interface RideModeEstimate {
  ModeCode: string; // "BIKE" | "AUTO" | "ERICKSHAW" | ...
  ModeName: string;
  OriginalFare: string;
  OriginalFareText: string;
  DiscountAmount: string;
  DiscountAmountText: string;
  DiscountPercentage: string;
  // Post-discount, pre-surge fare — i.e. what FinalFare would be if no
  // surge were currently active.
  FareBeforeSurge: string;
  FareBeforeSurgeText: string;
  SurgeApplied: string; // "YES" | "NO"
  SurgeMultiplier: string; // e.g. "1.5"
  SurgeText: string; // e.g. "1.5x surge" — empty when SurgeApplied is "NO"
  SurgeAmount: string;
  SurgeAmountText: string;
  FinalFare: string;
  FinalFareText: string;
  DriverArrivalMinutes: string;
  DriverArrivalText: string;
  AvailableDrivers: string;
  Capacity: string;
  CapacityText: string;
  Status: string; // "AVAILABLE" | "UNAVAILABLE" | ...
}

export interface RideEstimateResponse {
  Result: string;
  Message?: string;
  EstimateTran: string;
  Pickup: { Latitude: string; Longitude: string; Address: string };
  Drop: { Latitude: string; Longitude: string; Address: string };
  Route: {
    DistanceMeters: string;
    DistanceKM: string;
    DurationSeconds: string;
    DurationMinutes: string;
    EncodedPolyline: string;
    PolylineColor: string;
    PolylineWidth: string;
  };
  Modes: RideModeEstimate[];
  EstimateExpirySeconds: string;
  ResponseDateTime: string;
}

class RideApiError extends Error {
  isRideApiError: true = true;
  constructor(message: string) {
    super(message);
    this.name = 'RideApiError';
    Object.setPrototypeOf(this, RideApiError.prototype);
  }
}

export const isRideApiError = (err: unknown): err is RideApiError =>
  !!err && typeof err === 'object' && (err as any).isRideApiError === true;

// ── Shared POST helper (CreateRide / GetRideStatus) ─────────────────────
// Same conventions as getRideEstimate above (and authApi.ts's `post`):
// form-urlencoded body, static app-auth bearer, `Result: "Success"`
// envelope. Pulled into one helper here since CreateRide + GetRideStatus
// share it verbatim — getRideEstimate above is left as its own inline
// implementation rather than retrofitted, so as not to touch already-
// confirmed-working code.
const postRideApi = async <T>(
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
    throw new RideApiError(
      'Unable to reach the server. Please check your internet connection and try again.',
    );
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    logError(path, err);
    throw new RideApiError('Something went wrong. Please try again.');
  }

  logInfo(path, `response ${JSON.stringify(json)}`);

  if (!response.ok || json?.Result !== 'Success') {
    throw new RideApiError(
      json?.Message || json?.Error || 'Something went wrong. Please try again.',
    );
  }

  return json as T;
};

export interface RideLocation {
  Latitude: string;
  Longitude: string;
  Address: string;
}

export interface RideRouteInfo {
  DistanceKM: string;
  DurationMinutes: string;
  EncodedPolyline: string;
  PolylineColor: string;
  PolylineWidth: string;
}

// `*Text` display fields are inconsistently present across CreateRide vs
// GetRideStatus responses (confirmed via curl — GetRideStatus's sample
// dropped several of them) — kept optional here rather than assuming
// either shape.
export interface RideFareInfo {
  OriginalFare: string;
  OriginalFareText?: string;
  DiscountAmount: string;
  DiscountAmountText?: string;
  DiscountPercentage: string;
  FareBeforeSurge: string;
  FareBeforeSurgeText?: string;
  SurgeApplied: string; // "YES" | "NO"
  SurgeMultiplier: string;
  SurgeText?: string;
  SurgeAmount: string;
  SurgeAmountText?: string;
  FinalFare: string;
  FinalFareText: string;
}

// CONFIRMED live via curl against GetRideStatus for every phase of a full
// trip: SEARCHING (right after CreateRide) → ACCEPTED (driver assigned,
// StartOTP + Driver block appear) → ONGOING (OTP shared, trip started) →
// COMPLETED. CANCELLED confirmed separately. EXPIRED/NO_DRIVER are the
// remaining not-yet-observed terminal-failure strings from the spec, kept
// as best guesses. Kept as `| string` so an unrecognised value never
// breaks typing.
export type RideStatus =
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'NO_DRIVER'
  | string;

// Only present once a driver has accepted (Status ACCEPTED/ONGOING/
// COMPLETED) — confirmed via curl. Never present on SEARCHING.
export interface RideDriverInfo {
  Name: string;
  Mobile: string;
  VehicleModel: string;
  VehicleNumber: string;
  Location?: {
    Latitude: string;
    Longitude: string;
    UpdatedDate?: string;
    UpdatedTime?: string;
  };
}

export interface CreateRideResponse {
  Result: string;
  Message?: string;
  RideTran: string;
  Status: RideStatus;
  VehicleType: string;
  VehicleName?: string;
  Pickup: RideLocation;
  Drop: RideLocation;
  Route: RideRouteInfo;
  Fare: RideFareInfo;
  // Only present once Status is ACCEPTED — the code the rider reads out
  // to the driver to start the trip. Never hardcode this; always render
  // whatever the backend sends (or nothing, until it's assigned).
  StartOTP?: string;
  Driver?: RideDriverInfo;
  ResponseDateTime: string;
}

export interface RideStatusResponse {
  Result: string;
  Message?: string;
  RideTran: string;
  Status: RideStatus;
  VehicleType: string;
  Pickup: RideLocation;
  Drop: RideLocation;
  Route: RideRouteInfo;
  Fare: RideFareInfo;
  StartOTP?: string;
  Driver?: RideDriverInfo;
  ResponseDateTime: string;
}

// Statuses that mean "stop polling, this ride is dead" — no driver is
// coming. Kept as a named set (rather than `!== 'SEARCHING'`) so it reads
// clearly at call sites and is easy to extend once more terminal-failure
// strings are confirmed against the live backend.
const TERMINAL_FAILURE_STATUSES = new Set([
  'CANCELLED',
  'EXPIRED',
  'NO_DRIVER',
]);

export const isSearchingStatus = (status: string): boolean =>
  status === 'SEARCHING';

export const isTerminalFailureStatus = (status: string): boolean =>
  TERMINAL_FAILURE_STATUSES.has(status);

export const isAcceptedStatus = (status: string): boolean =>
  status === 'ACCEPTED';

export const isOngoingStatus = (status: string): boolean =>
  status === 'ONGOING';

export const isCompletedStatus = (status: string): boolean =>
  status === 'COMPLETED';

// Anything that's neither still-searching nor a known failure is treated
// as "a driver is now attached" (Accepted/Ongoing/Completed/etc) — the
// caller (SearchingScreen) hands off to the Driver screen at that point
// rather than gating on an exact status string that isn't confirmed yet.
export const isDriverAssignedStatus = (status: string): boolean =>
  !isSearchingStatus(status) && !isTerminalFailureStatus(status);

/**
 * Step 3 (after GetRideEstimate) — confirm the ride against a still-valid
 * `estimateTran` + the vehicle mode the person picked on RideScreen.
 * Returns a `RideTran` (used by getRideStatus below) and starts the ride
 * out in "SEARCHING" status while the backend looks for a driver.
 *
 * Confirmed against the live backend via curl:
 *   POST https://aloapp.shop/apiv1/customer/customer-riderequest.asmx/CreateRide
 *   Body: cookie, estimateTran, vehicleType
 */
export const createRide = (params: {
  cookie: string;
  estimateTran: string;
  vehicleType: string;
}): Promise<CreateRideResponse> =>
  postRideApi<CreateRideResponse>('CreateRide', {
    cookie: params.cookie,
    estimateTran: params.estimateTran,
    vehicleType: params.vehicleType,
  });

/**
 * Step 4 — poll for this ride's current status. Callers should call this
 * every 3–5 seconds while Status === "SEARCHING" (per the customer-flow
 * spec), then stop as soon as it isn't — either a driver is attached
 * (isDriverAssignedStatus) or the ride is dead (isTerminalFailureStatus).
 *
 * Confirmed against the live backend via curl:
 *   POST https://aloapp.shop/apiv1/customer/customer-riderequest.asmx/GetRideStatus
 *   Body: cookie, rideTran
 */
export const getRideStatus = (params: {
  cookie: string;
  rideTran: string;
}): Promise<RideStatusResponse> =>
  postRideApi<RideStatusResponse>('GetRideStatus', {
    cookie: params.cookie,
    rideTran: params.rideTran,
  });

export const getRideEstimate = async (params: {
  cookie: string;
  pickupLat: number;
  pickupLng: number;
  pickupAddress?: string;
  dropLat: number;
  dropLng: number;
  dropAddress?: string;
  // Operating-region code the backend uses to route/price this trip (e.g.
  // "BEED"). Required by the confirmed endpoint — caller must supply the
  // right one for wherever the pickup actually is.
  region: string;
}): Promise<RideEstimateResponse> => {
  const form: Record<string, string> = {
    cookie: params.cookie,
    pickupLatitude: String(params.pickupLat),
    pickupLongitude: String(params.pickupLng),
    pickupAddress: params.pickupAddress ?? '',
    dropLatitude: String(params.dropLat),
    dropLongitude: String(params.dropLng),
    dropAddress: params.dropAddress ?? '',
    region: params.region,
  };
  const body = new URLSearchParams(form).toString();

  logInfo(PATH, `request ${body}`);

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/${PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${API_BEARER_TOKEN}`,
      },
      body,
    });
  } catch (err) {
    logError(PATH, err);
    throw new RideApiError(
      'Unable to reach the server. Please check your internet connection and try again.',
    );
  }

  let json: any;
  try {
    json = await response.json();
  } catch (err) {
    logError(PATH, err);
    throw new RideApiError('Something went wrong. Please try again.');
  }

  logInfo(PATH, `response ${JSON.stringify(json)}`);

  if (!response.ok || json?.Result !== 'Success') {
    throw new RideApiError(
      json?.Message ||
        json?.Error ||
        'Could not fetch ride estimate. Please try again.',
    );
  }

  return json as RideEstimateResponse;
};

/**
 * A single entry in the rider's ride history list (Activity tab).
 *
 * CONFIRMED against the live backend via curl. `CompletedDate`/
 * `CompletedTime` come back as empty strings ('') for a CANCELLED ride
 * (no completion ever happened) — kept as plain `string` rather than
 * optional so callers don't need an extra undefined-check on top of the
 * empty-string check.
 */
export interface RideHistoryItem {
  RideId: string;
  RideTran: string;
  VehicleType: string;
  PickupAddress: string;
  DropAddress: string;
  DistanceKM: string;
  DurationMinutes: string;
  FinalFare: string;
  FinalFareText: string;
  Status: RideStatus;
  CreatedDate: string;
  CreatedTime: string;
  CompletedDate: string;
  CompletedTime: string;
}

export interface RideHistoryResponse {
  Result: string;
  Message?: string;
  Rides: RideHistoryItem[];
  ResponseDateTime?: string;
}

/**
 * Activity tab — the rider's full ride history (most recent first, per the
 * live sample). Pair with `getRideStatus(rideTran)` to fetch the full
 * detail (route polyline, fare breakup, driver) for any one entry when the
 * rider taps into it.
 *
 * Confirmed against the live backend via curl:
 *   POST https://aloapp.shop/apiv1/customer/customer-riderequest.asmx/GetRideHistory
 *   Body: cookie
 */
export const getRideHistory = (params: {
  cookie: string;
}): Promise<RideHistoryResponse> =>
  postRideApi<RideHistoryResponse>('GetRideHistory', {
    cookie: params.cookie,
  });

export { RideApiError };
