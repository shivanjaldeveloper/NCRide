import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { HomeTabParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import { Colors, Typography, fscale, Spacing } from '../theme';

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

const TAB_ITEMS: {
  key: keyof HomeTabParamList;
  label: string;
  icon: string;
}[] = [
  { key: 'Home', label: 'Home', icon: '🏠' },
  { key: 'Activity', label: 'Activity', icon: '📈' },
  { key: 'Wallet', label: 'Wallet', icon: '💳' },
  { key: 'Account', label: 'Account', icon: '👤' },
];

const HomeTabs = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: Platform.OS === 'ios' ? insets.bottom : Spacing.sm },
        ],
        tabBarIcon: ({ focused }) => {
          const item = TAB_ITEMS.find(t => t.key === route.name);
          return (
            <Text style={{ fontSize: fscale(20), opacity: focused ? 1 : 0.45 }}>
              {item?.icon}
            </Text>
          );
        },
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
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    height: fscale(60) + (Platform.OS === 'android' ? Spacing.sm : 0),
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
