import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { NCButton, Icon } from '../../components/common';
import { Colors, Spacing, fscale, Radii } from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Logout'>;

const LogoutScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    // TODO: clear auth/session state here once auth storage is wired up.
    navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
  };

  return (
    <View style={styles.root}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => navigation.goBack()}
      />

      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, Spacing.xl) },
        ]}
      >
        <View style={styles.grabber} />

        <View style={styles.iconWrap}>
          <Icon name="logout" size={32} stroke={Colors.red} sw={1.8} />
        </View>

        <Text style={styles.title}>Log out of NCRide?</Text>
        <Text style={styles.sub}>
          You can sign back in anytime with your mobile number. Your trips,
          wallet and rewards stay safe.
        </Text>

        <View style={styles.actionsRow}>
          <View style={{ flex: 1 }}>
            <NCButton
              label="Stay logged in"
              onPress={() => navigation.goBack()}
              variant="ghost"
              size="lg"
            />
          </View>
          <View style={{ flex: 1 }}>
            <NCButton
              label="Log out"
              onPress={handleLogout}
              variant="danger"
              size="lg"
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(15,17,21,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgWhite,
    borderTopLeftRadius: Radii.xxl,
    borderTopRightRadius: Radii.xxl,
    paddingTop: fscale(12),
    paddingHorizontal: Spacing.screen,
    alignItems: 'center',
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(15,17,21,0.18)',
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    width: fscale(70),
    height: fscale(70),
    borderRadius: fscale(35),
    backgroundColor: '#FCE6E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fscale(22),
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.4,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  sub: {
    fontSize: fscale(13.5),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: fscale(20),
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    width: '100%',
  },
});

export default LogoutScreen;
