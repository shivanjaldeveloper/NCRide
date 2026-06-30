// Slide copy matches the design reference's ScreenOnb1 / ScreenOnb2 / ScreenOnb3
// exactly. Illustrations live inline in OnboardingScreen.tsx since each is a
// bespoke SVG composition rather than a reusable icon.

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
}

export const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Rides for every need in NCR.',
    subtitle:
      'Cars, bikes, autos, e-rickshaws and intercity rides — premium NCR mobility with one tap.',
  },
  {
    id: '2',
    title: 'Auto, E-Rickshaw & intercity — all in one.',
    subtitle:
      'Book an auto for quick errands, an e-rickshaw for short hops, or a premium car for longer trips. NCRide has it all.',
  },
  {
    id: '3',
    title: 'Live tracking. SOS. Ride safely.',
    subtitle:
      'Track your ride live, share with family, and tap SOS anytime. NCRide keeps every journey safe.',
  },
];
