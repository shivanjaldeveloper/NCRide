export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
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
};

export type HomeTabParamList = {
  Home: undefined;
  Activity: undefined;
  Wallet: undefined;
  Account: undefined;
};
