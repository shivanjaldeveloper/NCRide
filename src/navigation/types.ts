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
        mode?: 'auto' | 'erickshaw';
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
  Driver: undefined;
  Tracking: undefined;
  Completed: undefined;
  Chat: undefined;
  SOS: undefined;
  Invoice: undefined;
  PayRide: undefined;
  Receipt: undefined;
  InvoiceReceipt: undefined;
  Courier: undefined;
  CourierSummary: undefined;
  CourierPayment: undefined;
  CourierConfirmed: undefined;
  BookingDetail: { id: string; title: string; icon?: string };
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
