import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import { I18nProvider } from '../i18n';

import SplashScreen from '../screens/splash/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LanguageSelectScreen from '../screens/language/LanguageSelectScreen';
import OTPLoginScreen from '../screens/auth/OTPLoginScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import LocationPermissionScreen from '../screens/Permissions/LocationPermissionScreen';
import LocationPickerScreen from '../screens/location/LocationPickerScreen';
import HomeTabs from './HomeTabs';
import RideScreen from '../screens/ride/RideScreen';
import DriverScreen from '../screens/ride/DriverScreen';
import TrackingScreen from '../screens/ride/TrackingScreen';
import CompletedScreen from '../screens/ride/CompletedScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import SOSScreen from '../screens/safety/SOSScreen';
import InvoiceScreen from '../screens/ride/InvoiceScreen';
import PayRideScreen from '../screens/ride/PayRideScreen';
import ReceiptScreen from '../screens/ride/ReceiptScreen';
import InvoiceReceiptScreen from '../screens/ride/InvoiceReceiptScreen';
import CourierScreen from '../screens/courier/CourierScreen';
import CourierSummary from '../screens/courier/CourierSummaryScreen';
import CourierPayment from '../screens/courier/CourierPaymentScreen';
import CourierConfirmed from '../screens/courier/CourierConfirmedScreen';
import BookingDetail from '../screens/activity/BookingDetailScreen';
import CouponsScreen from '../screens/wallet/CouponsScreen';
import RewardsScreen from '../screens/wallet/RewardsScreen';
import NotificationsScreen from '../screens/wallet/NotificationsScreen';
import SavedPlacesScreen from '../screens/profile/SavedPlacesScreen';
import ReferralsScreen from '../screens/profile/ReferralsScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import LogoutScreen from '../screens/profile/LogoutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen
        name="LanguageSelect"
        component={LanguageSelectScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="OTPLogin"
        component={OTPLoginScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="OTPVerify"
        component={OTPVerifyScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="LocationPermission"
        component={LocationPermissionScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="LocationPicker"
        component={LocationPickerScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
      />
      <Stack.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Ride"
        component={RideScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Driver"
        component={DriverScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: false }}
      />
      <Stack.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Completed"
        component={CompletedScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="SOS"
        component={SOSScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Invoice"
        component={InvoiceScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="PayRide"
        component={PayRideScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
      />
      <Stack.Screen
        name="InvoiceReceipt"
        component={InvoiceReceiptScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Courier"
        component={CourierScreen}
        options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
      />
      <Stack.Screen
        name="CourierSummary"
        component={CourierSummary}
        options={{ animation: 'slide_from_right', gestureEnabled: false }}
      />
      <Stack.Screen
        name="CourierPayment"
        component={CourierPayment}
        options={{ animation: 'slide_from_right', gestureEnabled: false }}
      />
      <Stack.Screen
        name="CourierConfirmed"
        component={CourierConfirmed}
        options={{ animation: 'slide_from_right', gestureEnabled: false }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetail}
        options={{ animation: 'slide_from_right', gestureEnabled: false }}
      />
      <Stack.Screen
        name="Coupons"
        component={CouponsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="SavedPlaces"
        component={SavedPlacesScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Referrals"
        component={ReferralsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ animation: 'slide_from_right', gestureEnabled: true }}
      />
      <Stack.Screen
        name="Logout"
        component={LogoutScreen}
        options={{
          animation: 'slide_from_bottom',
          gestureEnabled: true,
          presentation: 'transparentModal',
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

const RootNavigator = () => (
  <I18nProvider>
    <AppNavigator />
  </I18nProvider>
);

export default RootNavigator;
