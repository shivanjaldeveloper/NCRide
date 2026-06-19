export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  illustration: string; // emoji or icon key — swap with real image/SVG
  illustrationBg: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide_1',
    title: 'Rides for every need in NCR.',
    subtitle:
      'Cars, bikes, autos, e-rickshaws and intercity rides — premium NCR mobility with one tap.',
    illustration: '🚌',
    illustrationBg: '#F0F5E8',
  },
  {
    id: 'slide_2',
    title: 'Auto, E-Rickshaw & intercity — all in one.',
    subtitle:
      'Book an auto for quick errands, an e-rickshaw for short hops, or a premium car for longer trips. NCRide has it all.',
    illustration: '🛺',
    illustrationBg: '#EBF3FF',
  },
  {
    id: 'slide_3',
    title: 'Live tracking. SOS. Ride safely.',
    subtitle:
      'Track your ride live, share with family, and tap SOS anytime. NCRide keeps every journey safe.',
    illustration: '🛡️',
    illustrationBg: '#EAF5FF',
  },
];
