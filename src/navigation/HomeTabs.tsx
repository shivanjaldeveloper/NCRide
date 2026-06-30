import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HomeTabParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import Activity from '../screens/activity/ActivityScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import { Colors, Typography, fscale } from '../theme';
import { Icon } from '../components/common';
import type { IconName } from '../components/common';
import { useTranslation } from '../i18n';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const TAB_ICONS: Record<keyof HomeTabParamList, IconName> = {
  Home: 'home',
  Activity: 'activity',
  Wallet: 'wallet',
  Account: 'account',
};

const HomeTabs = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const TAB_LABELS: Record<keyof HomeTabParamList, string> = {
    Home: t.tabs.home,
    Activity: t.tabs.activity,
    Wallet: t.tabs.wallet,
    Account: t.tabs.account,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          { height: fscale(60) + insets.bottom, paddingBottom: insets.bottom },
        ],
        tabBarIcon: ({ focused }) => (
          <Icon
            name={TAB_ICONS[route.name as keyof HomeTabParamList]}
            size={24}
            stroke={focused ? Colors.textPrimary : Colors.textTertiary}
            sw={2}
          />
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {TAB_LABELS[route.name as keyof HomeTabParamList]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bgWhite,
    borderTopWidth: 0,
    elevation: 8,
    shadowOpacity: 0.08,
    paddingTop: 8,
  },
  tabLabel: { ...Typography.caption, color: Colors.textTertiary, marginTop: 2 },
  tabLabelActive: { color: Colors.textPrimary, fontWeight: '600' },
});

export default HomeTabs;
