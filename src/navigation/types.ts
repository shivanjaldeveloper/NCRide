import type { IconName } from '../components/common/iconPaths';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  LanguageSelect: undefined;
  OTPLogin: undefined;
  OTPVerify: { phone: string; otpTransaction: string };
  Registration: { phone: string; username: string; cookie: string };
  // Shown to an ALREADY-authenticated user (valid cookie + complete
  // profile) when their locally-accepted terms version no longer matches
  // constants/legal.ts's TERMS_VERSION — must accept again before Home.
  TermsUpdate: undefined;
  LocationPermission: undefined;
  HomeTabs: undefined;
  // New: full-screen map location picker
  LocationPicker: {
    field: 'pickup' | 'drop';
    initialLat?: number;
    initialLng?: number;
    initialAddress?: string;
    // 'gps' = initial point came from device location and can be silently
    // refreshed to a more accurate fix on open; 'manual' = user deliberately
    // chose this point (search or map drag) and must NOT be auto-overridden.
    initialSource?: 'gps' | 'manual';
    // Called directly with the result and then navigation.goBack() — this
    // hands the pick straight to whichever HomeScreen instance opened the
    // picker via closure, instead of round-tripping through route params
    // (which was liable to clobber whichever of FROM/TO was set second).
    onPick: (result: {
      address: string;
      lat: number;
      lng: number;
      accuracy?: number;
      source: 'gps' | 'manual';
    }) => void;
  };
  Ride:
    | {
        mode?: 'auto' | 'erickshaw' | 'bike';
        pickup?: string;
        drop?: string;
        // Real coordinates from HomeScreen's resolved pickup/drop points —
        // required for RideScreen to actually call getRideEstimate (it
        // treats lat/lng === 0 as "no coordinate yet" and skips the call).
        pickupLat?: number;
        pickupLng?: number;
        dropLat?: number;
        dropLng?: number;
      }
    | undefined;
  // Shown right after CreateRide, while Status === "SEARCHING". Polls
  // GetRideStatus every few seconds and hands off to Driver once a driver
  // is attached, or shows a cancelled/failed state otherwise.
  Searching: {
    rideTran: string;
    vehicleType: string;
    vehicleName?: string;
    pickup: string;
    pickupLat: number;
    pickupLng: number;
    drop: string;
    dropLat: number;
    dropLng: number;
    routePolyline?: string;
    routeColor?: string;
    routeWidth?: number;
    fareText: string;
  };
  // `undefined` kept for backwards-compat with any existing callers that
  // navigate here directly (e.g. dev shortcuts); SearchingScreen always
  // passes the full ride context once a driver is attached. DriverScreen
  // itself then polls GetRideStatus and refreshes StartOTP/Driver as they
  // arrive, and forwards the same shape (with fresher values) to Tracking.
  Driver:
    | {
        rideTran?: string;
        vehicleType?: string;
        pickup?: string;
        pickupLat?: number;
        pickupLng?: number;
        drop?: string;
        dropLat?: number;
        dropLng?: number;
        routePolyline?: string;
        routeColor?: string;
        routeWidth?: number;
        fareText?: string;
        // From GetRideStatus once Status is ACCEPTED — real OTP, never a
        // placeholder.
        startOtp?: string;
        driverName?: string;
        driverMobile?: string;
        vehicleModel?: string;
        vehicleNumber?: string;
      }
    | undefined;
  // Passed by DriverScreen once GetRideStatus reports Status "ONGOING".
  Tracking:
    | {
        rideTran?: string;
        vehicleType?: string;
        pickup?: string;
        pickupLat?: number;
        pickupLng?: number;
        drop?: string;
        dropLat?: number;
        dropLng?: number;
        routePolyline?: string;
        routeColor?: string;
        routeWidth?: number;
        fareText?: string;
        driverName?: string;
        vehicleModel?: string;
        vehicleNumber?: string;
      }
    | undefined;
  // Passed by TrackingScreen once GetRideStatus reports Status "COMPLETED".
  Completed:
    | {
        distanceKm?: string;
        durationMin?: string;
        pickup?: string;
        drop?: string;
        fareText?: string;
        driverName?: string;
        vehicleModel?: string;
        vehicleNumber?: string;
      }
    | undefined;
  Chat: undefined;
  SOS: undefined;
  InvoiceReceipt: undefined;
  Courier: undefined;
  CourierSummary: undefined;
  CourierPayment: undefined;
  CourierConfirmed: undefined;
  // `rideTran` drives the GetRideStatus call on this screen — `title`/
  // `icon` are passed through purely so the header/summary can render
  // instantly (from the Activity list item) instead of waiting on the
  // network round-trip.
  BookingDetail: { rideTran: string; title?: string; icon?: IconName };
  Coupons: undefined;
  Rewards: undefined;
  Notifications: undefined;
  SavedPlaces: undefined;
  Referrals: undefined;
  PaymentMethods: undefined;
  Settings: undefined;
  Logout: undefined;
};

export type HomeTabParamList = {
  Home: undefined;
  Activity: undefined;
  Wallet: undefined;
  Account: undefined;
};
