import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import SplashScreen from '../screens/splash/SplashScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import OTPLoginScreen from '../../src/screens/auth/OTPLoginScreen';
import OTPVerifyScreen from '../../src/screens/auth/OTPVerifyScreen';
import LocationPermissionScreen from '../screens/Permissions/LocationPermissionScreen';
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

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        gestureEnabled: false, // splash/onboarding should not swipe back
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
    </Stack.Navigator>
  </NavigationContainer>
);

export default RootNavigator;
