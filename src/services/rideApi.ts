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
  FinalFare: string;
  FinalFareText: string;
  DriverArrivalMinutes: string;
  DriverArrivalText: string;
  AvailableDrivers: string;
  Capacity: string;
  CapacityText: string;
  Status: string; // "AVAILABLE" | ...
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

export { RideApiError };
