export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  LanguageSelect: undefined;
  OTPLogin: undefined;
  OTPVerify: { phone: string };
  LocationPermission: undefined;
  HomeTabs: undefined;
  Ride: { mode?: 'auto' | 'erickshaw' } | undefined;
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
