import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { NCButton, Icon } from '../../components/common';
import { Colors, Spacing, fscale, vscale, Radii } from '../../theme';
import { acceptTerms } from '../../utils/terms';
import { getSessionCookie } from '../../utils/auth';
import { checkFullLocationStatus } from '../../utils/location';
import { TERMS_URL, PRIVACY_URL } from '../../constants/legal';

type Props = NativeStackScreenProps<RootStackParamList, 'TermsUpdate'>;

// Reached ONLY from Splash, for an already-logged-in user whose locally
// stored terms version doesn't match the current TERMS_VERSION — they must
// explicitly re-accept before continuing into the app. Session/login state
// is untouched here; this is purely a re-consent gate.
const TermsUpdateScreen = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const cookie = await getSessionCookie();
      await acceptTerms(cookie ?? undefined);

      const locStatus = await checkFullLocationStatus();
      if (locStatus.allGood) {
        navigation.replace('HomeTabs');
      } else {
        navigation.replace('LocationPermission');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.iconWrap}>
        <Icon name="shield" size={30} stroke={Colors.ink} sw={1.8} />
      </View>

      <Text style={styles.heading}>Our Terms have been updated</Text>
      <Text style={styles.sub}>
        We've made changes to our Terms & Conditions and Privacy Policy. Please
        review and accept them to keep using Alo Alo.
      </Text>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
          <Text style={styles.link}>Terms & Conditions</Text>
        </TouchableOpacity>
        <Text style={styles.linksSep}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <NCButton
        label="Accept & continue"
        iconRight="arrowRight"
        onPress={handleAccept}
        loading={loading}
        variant="primary"
        size="lg"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgWhite,
    paddingHorizontal: Spacing.screen,
    paddingTop: vscale(48),
    paddingBottom: vscale(28),
  },
  iconWrap: {
    width: fscale(64),
    height: fscale(64),
    borderRadius: Radii.lg,
    backgroundColor: 'rgba(46,125,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  heading: {
    fontSize: fscale(26),
    fontWeight: '800',
    color: Colors.ink,
    lineHeight: fscale(36),
    marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: fscale(14.5),
    color: Colors.textSecondary,
    lineHeight: fscale(22),
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  link: { fontSize: fscale(14), fontWeight: '700', color: Colors.blue },
  linksSep: { fontSize: fscale(14), color: Colors.textTertiary },
});

export default TermsUpdateScreen;
