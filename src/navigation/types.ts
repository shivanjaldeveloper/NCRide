export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  OTPLogin: undefined;
  OTPVerify: { phone: string };
  LocationPermission: undefined;
  HomeTabs: undefined;
  Ride: { mode?: 'ride' | 'cab' | 'bike' | 'reserve' | 'intercity' } | undefined;
  Driver: undefined;
  Tracking: undefined;
  Completed: undefined;
  Chat: undefined;
  SOS: undefined;
};

export type HomeTabParamList = {
  Home: undefined;
  Activity: undefined;
  Wallet: undefined;
  Account: undefined;
};
