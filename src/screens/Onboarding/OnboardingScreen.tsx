import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';
import { NCButton } from '../../components/common';
import { Colors, Spacing, fscale, vscale, SCREEN } from '../../theme';
import { SLIDES } from './onboardingData';
import {
  Onb1Illustration,
  Onb2Illustration,
  Onb3Illustration,
} from './OnboardingIllustrations';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const ILLUSTRATIONS = [Onb1Illustration, Onb2Illustration, Onb3Illustration];

const OnboardingScreen = ({ navigation }: Props) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      navigation.replace('OTPLogin');
      return;
    }
    flatListRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
  };

  const handleSkip = () => navigation.replace('OTPLogin');

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN.width);
    setActiveIndex(index);
  };

  const renderSlide = ({
    item,
    index,
  }: {
    item: (typeof SLIDES)[0];
    index: number;
  }) => {
    const Illustration = ILLUSTRATIONS[index];
    return (
      <View style={[styles.slide, { width: SCREEN.width }]}>
        <View style={styles.illuWrap}>
          <Illustration />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    );
  };

  return (
    <ScreenShell
      backgroundColor={Colors.bgOffWhite}
      topColor={Colors.bgOffWhite}
      bottomColor={Colors.bgOffWhite}
    >
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={{ flex: 1 }}
      />

      <View style={styles.bottomBar}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        <NCButton
          label={isLast ? 'Get started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          iconRight={isLast ? 'check' : 'arrowRight'}
          fullWidth={false}
          style={styles.nextBtn}
        />
      </View>
    </ScreenShell>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  skipBtn: {
    position: 'absolute',
    top: vscale(16),
    right: Spacing.screen,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: fscale(14),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: fscale(28),
  },
  illuWrap: {
    width: fscale(260),
    height: fscale(260),
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveChipText: {
    position: 'absolute',
    bottom: fscale(38),
    fontSize: fscale(9),
    fontWeight: '600',
    color: Colors.ink,
  },
  title: {
    marginTop: fscale(28),
    fontSize: fscale(30),
    fontWeight: '700',
    letterSpacing: -1,
    color: Colors.ink,
    lineHeight: fscale(33),
    textAlign: 'center',
  },
  subtitle: {
    marginTop: fscale(12),
    fontSize: fscale(15),
    color: Colors.textSecondary,
    lineHeight: fscale(21.75),
    maxWidth: fscale(300),
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: vscale(44),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(15,17,21,0.18)',
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.ink,
  },
  nextBtn: {
    paddingHorizontal: fscale(24),
  },
});
