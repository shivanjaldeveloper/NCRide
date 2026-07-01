import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Platform,
  Linking,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import type { HomeTabParamList } from './types';
import HomeScreen from '../screens/home/HomeScreen';
import Activity from '../screens/activity/ActivityScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import AccountScreen from '../screens/profile/AccountScreen';
import { Colors, Typography, fscale, vscale, Radii } from '../theme';
import { Icon } from '../components/common';
import type { IconName } from '../components/common';
import { useTranslation } from '../i18n';
import {
  checkFullLocationStatus,
  openLocationSourceSettings,
  goToLocationSettings,
  requestLocationPermission,
  type LocationStatus,
} from '../utils/location';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const TAB_ICONS: Record<keyof HomeTabParamList, IconName> = {
  Home: 'home',
  Activity: 'activity',
  Wallet: 'wallet',
  Account: 'account',
};

// ─── Open network/wireless settings ─────────────────────────────────────────

const openNetworkSettings = () => {
  if (Platform.OS === 'android') {
    // Open main device Settings — reliable across all OEMs and Android versions.
    // Deeper intents like WIRELESS_SETTINGS or WIFI_SETTINGS often open
    // sub-panels that vary per manufacturer and can dead-end the user.
    Linking.sendIntent('android.settings.SETTINGS').catch(() =>
      Linking.openSettings(),
    );
  } else {
    // iOS: no public deep link into WiFi settings — app settings is closest
    Linking.openSettings();
  }
};

// ─── Combined system guard modal ─────────────────────────────────────────────
// Monitors BOTH network connectivity and location in one place.
// Network has higher display priority — no point asking for GPS when offline.
// The modal is non-dismissible: the user must fix the issue to continue.

const SystemGuardModal = () => {
  const [networkOk, setNetworkOk] = useState(true);
  const [locationStatus, setLocationStatus] = useState<LocationStatus | null>(
    null,
  );
  const [acting, setActing] = useState(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Network listener ──────────────────────────────────────────────────────
  useEffect(() => {
    NetInfo.fetch().then(s => {
      setNetworkOk(s.isConnected !== false && s.isInternetReachable !== false);
    });
    const unsub = NetInfo.addEventListener(s => {
      setNetworkOk(s.isConnected !== false && s.isInternetReachable !== false);
    });
    return () => unsub();
  }, []);

  // ── Location listener ─────────────────────────────────────────────────────
  const recheckLocation = useCallback(async () => {
    const s = await checkFullLocationStatus();
    setLocationStatus(s);
  }, []);

  useEffect(() => {
    recheckLocation();

    // Poll every 4 seconds while app is active.
    // This is the only reliable way to catch location being toggled off
    // via the quick-settings panel without the app going to background.
    intervalRef.current = setInterval(() => {
      if (AppState.currentState === 'active') {
        recheckLocation();
      }
    }, 4000);

    // AppState handles returning from Settings app (GPS toggle / permission)
    const sub = AppState.addEventListener('change', nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        setTimeout(recheckLocation, 400);
      }
      appStateRef.current = nextState;
    });

    return () => {
      sub.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [recheckLocation]);

  // ── rest of component unchanged below ────────────────────────────────────

  // ── Decide what to show ───────────────────────────────────────────────────
  // Still doing initial checks — don't flash the modal yet
  if (locationStatus === null) return null;

  const locationOk = locationStatus.allGood;
  if (networkOk && locationOk) return null;

  // Network has priority — if offline, show network issue first
  const issue: 'network' | 'locationPerm' | 'locationServices' = !networkOk
    ? 'network'
    : !locationStatus.permissionGranted
    ? 'locationPerm'
    : 'locationServices';

  const config = {
    network: {
      iconName: 'wifi' as IconName,
      iconColor: Colors.amber,
      iconBg: '#FFF7E6',
      title: 'No Internet Connection',
      body: 'Alo Alo needs an active internet connection to find drivers and show your route. Please turn on Wi-Fi or mobile data.',
      btnLabel: 'Open Network Settings',
    },
    locationPerm: {
      iconName: 'locate' as IconName,
      iconColor: Colors.blue,
      iconBg: '#EEF4FF',
      title: 'Location Permission Required',
      body: 'Alo Alo needs location access to find nearby drivers and track your ride in real time.',
      btnLabel: locationStatus.permBlocked
        ? 'Open App Settings'
        : 'Allow Location',
    },
    locationServices: {
      iconName: 'locate' as IconName,
      iconColor: Colors.blue,
      iconBg: '#EEF4FF',
      title: 'Turn On Location Services',
      body:
        Platform.OS === 'android'
          ? 'Your device location (GPS) is turned off. Please enable it to use Alo Alo.'
          : 'Location Services are disabled. Go to Settings → Privacy → Location Services.',
      btnLabel: 'Open Location Settings',
    },
  }[issue];

  const handleAction = async () => {
    if (acting) return;
    setActing(true);
    try {
      if (issue === 'network') {
        await openNetworkSettings();
        // NetInfo listener auto-updates when user returns — no manual recheck needed
      } else if (issue === 'locationPerm') {
        if (locationStatus.permBlocked) {
          goToLocationSettings();
        } else {
          await requestLocationPermission();
          await recheckLocation();
        }
      } else {
        // locationServices — GPS toggle is off, send to system location settings
        await openLocationSourceSettings();
        // AppState listener rechecks on return from settings
      }
    } finally {
      setActing(false);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}} // blocks hardware back button
    >
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={[modal.iconCircle, { backgroundColor: config.iconBg }]}>
            <Icon
              name={config.iconName}
              size={26}
              stroke={config.iconColor}
              sw={1.6}
            />
          </View>

          <Text style={modal.title}>{config.title}</Text>
          <Text style={modal.body}>{config.body}</Text>

          <TouchableOpacity
            style={[modal.btn, acting && modal.btnDisabled]}
            activeOpacity={0.85}
            onPress={handleAction}
            disabled={acting}
          >
            <Text style={modal.btnText}>
              {acting ? 'Please wait…' : config.btnLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── HomeTabs ────────────────────────────────────────────────────────────────

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
    <>
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

      {/* Single modal handles both network + location — sits above everything */}
      <SystemGuardModal />
    </>
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

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,17,21,0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgWhite,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    paddingHorizontal: fscale(24),
    paddingTop: vscale(28),
    paddingBottom: vscale(48),
    alignItems: 'center',
  },
  iconCircle: {
    width: fscale(60),
    height: fscale(60),
    borderRadius: fscale(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vscale(16),
  },
  title: {
    fontSize: fscale(18),
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
    marginBottom: vscale(8),
  },
  body: {
    fontSize: fscale(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: fscale(22),
    marginBottom: vscale(28),
  },
  btn: {
    backgroundColor: Colors.ink,
    borderRadius: Radii.pill,
    paddingVertical: fscale(16),
    width: '100%',
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    fontSize: fscale(15),
    fontWeight: '700',
    color: Colors.lime,
    letterSpacing: 0.2,
  },
});

export default HomeTabs;
