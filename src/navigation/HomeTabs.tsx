import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HomeTabParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import { Colors, Typography, fscale } from '../theme';

import { Icon } from '../components/common';
import type { IconName } from '../components/common';

const Tab = createBottomTabNavigator<HomeTabParamList>();

// Placeholder screens for future development
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.bgOffWhite,
    }}
  >
    <Text style={{ ...Typography.h3, color: Colors.textSecondary }}>
      {name}
    </Text>
    <Text
      style={{ ...Typography.body, color: Colors.textTertiary, marginTop: 8 }}
    >
      Coming soon
    </Text>
  </View>
);

const TAB_ICONS: Record<keyof HomeTabParamList, IconName> = {
  Home: 'home',
  Activity: 'activity',
  Wallet: 'wallet',
  Account: 'account',
};

const HomeTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: fscale(60) + insets.bottom,
            paddingBottom: insets.bottom,
          },
        ],
        tabBarIcon: ({ focused }) => (
          <Icon
            name={TAB_ICONS[route.name as keyof HomeTabParamList]}
            size={24}
            stroke={focused ? Colors.textPrimary : Colors.textTertiary}
            sw={2}
          />
        ),
        tabBarLabel: ({ focused, children }) => (
          <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
            {children}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Activity"
        children={() => <PlaceholderScreen name="Activity" />}
      />
      <Tab.Screen
        name="Wallet"
        children={() => <PlaceholderScreen name="Wallet" />}
      />
      <Tab.Screen
        name="Account"
        children={() => <PlaceholderScreen name="Account" />}
      />
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
  tabLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  tabLabelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

export default HomeTabs;
