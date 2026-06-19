import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { ScreenShell } from '../../components/layout';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Rides for every need in\nNCR.',
    subtitle:
      'Cars, bikes, autos, e-rickshaws and intercity rides — premium NCR mobility with one tap.',
    image: require('../../assets/icons/ride.gif'),
  },
  {
    id: '2',
    title: 'Fast pickups.\nReliable drivers.',
    subtitle:
      'Track rides in real time and get where you need to go without the hassle.',
    image: require('../../assets/icons/intro2.gif'),
  },
  {
    id: '3',
    title: 'Travel smarter.\nPay easier.',
    subtitle:
      'Secure payments, ride history and rewards designed for everyday commuters.',
    image: require('../../assets/icons/intro3.gif'),
  },
];

const OnboardingScreen = ({ navigation }: Props) => {
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    if (activeIndex === SLIDES.length - 1) {
      navigation.replace('OTPLogin');
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: activeIndex + 1,
      animated: true,
    });
  };

  const handleSkip = () => {
    navigation.replace('OTPLogin');
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);

    setActiveIndex(index);
  };

  const renderSlide = ({ item }: any) => {
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.illustrationWrap}>
          <View style={styles.illustrationInner}>
            <Image
              source={item.image}
              resizeMode="contain"
              style={styles.image}
            />
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    );
  };

  return (
    <ScreenShell
      backgroundColor="#F8F8F8"
      topColor="#F8F8F8"
      bottomColor="#F8F8F8"
    >
      {/* Skip */}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        activeOpacity={0.8}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}

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
      />

      {/* Bottom */}

      <View style={styles.bottomBar}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeIndex === index && styles.activeDot]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.nextText}>
            {activeIndex === SLIDES.length - 1 ? 'Start' : 'Next'}
          </Text>

          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </ScreenShell>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    zIndex: 10,
  },

  skipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7A7A7A',
  },

  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: -60,
  },

  illustrationWrap: {
    width: 185,
    height: 185,
    borderRadius: 92.5,
    backgroundColor: '#F8F8F8',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#C8D69A',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 18,

    elevation: 6,

    marginBottom: 48,
  },

  illustrationInner: {
    width: 155,
    height: 155,
    borderRadius: 77.5,
    backgroundColor: '#ECEEEE',

    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: 110,
    height: 110,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 14,
    paddingHorizontal: 10,
  },

  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },

  bottomBar: {
    position: 'absolute',
    left: 28,
    right: 28,
    bottom: 34,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4D4D4',
    marginRight: 6,
  },

  activeDot: {
    width: 24,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#111827',
  },

  nextButton: {
    width: 110,
    height: 56,

    borderRadius: 18,
    backgroundColor: '#090E1A',

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,

    elevation: 10,
  },

  nextText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },

  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: '700',
  },
});
