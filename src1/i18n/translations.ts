/**
 * NCRide – i18n translations
 * Supported locales: en | hi | mr
 */

export type Locale = 'en' | 'hi' | 'mr';

export type TranslationKeys = typeof en;

const en = {
  // ── Language Select Screen ─────────────────────────────────────────────
  langSelect: {
    title: 'Choose your language',
    subtitle: 'You can always change this later in your account settings.',
    cta: 'Continue',
  },

  // ── Common ────────────────────────────────────────────────────────────
  common: {
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get started',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading…',
    language: 'Language',
    changeLanguage: 'Change language',
    appVersion: 'NCRide · v 1.0.0 · Made for Noida & Delhi NCR',
  },

  // ── Onboarding ────────────────────────────────────────────────────────
  onboarding: {
    slides: [
      {
        title: 'Rides for every need in NCR.',
        subtitle:
          'Cars, bikes, autos, e-rickshaws and intercity rides — premium NCR mobility with one tap.',
      },
      {
        title: 'Auto, E-Rickshaw & intercity — all in one.',
        subtitle:
          'Book an auto for quick errands, an e-rickshaw for short hops, or a premium car for longer trips. NCRide has it all.',
      },
      {
        title: 'Live tracking. SOS. Ride safely.',
        subtitle:
          'Track your ride live, share with family, and tap SOS anytime. NCRide keeps every journey safe.',
      },
    ],
  },

  // ── Auth ──────────────────────────────────────────────────────────────
  auth: {
    enterPhone: 'Enter your phone number',
    phoneHint: "We'll send an OTP to verify.",
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    otpSentTo: 'OTP sent to',
    resend: 'Resend',
    resendIn: 'Resend in',
  },

  // ── Home ──────────────────────────────────────────────────────────────
  home: {
    greeting: 'Good morning',
    whereToGo: 'Where to go?',
    searchPlaceholder: 'Search destination…',
    services: 'Services',
  },

  // ── Account ───────────────────────────────────────────────────────────
  account: {
    title: 'Account',
    savedPlaces: 'Saved places',
    savedPlacesSub: '5 saved · Home, Work, Gym…',
    wallet: 'Wallet',
    paymentMethods: 'Payment methods',
    paymentMethodsSub: 'UPI · 1 card · 4 saved',
    coupons: 'Coupons & offers',
    couponsSub: '3 new offers',
    rewards: 'Rewards',
    rewardsSub: '840 points · Sapphire',
    referEarn: 'Refer & earn',
    referEarnSub: 'Earn ₹500 per invite',
    helpSupport: 'Help & support',
    sosContacts: 'SOS contacts',
    sosContactsSub: '3 added',
    settings: 'Settings',
    logout: 'Log out',
    language: 'Language',
    languageSub: 'English',
  },

  // ── Activity ──────────────────────────────────────────────────────────
  activity: {
    title: 'Activity',
    noRides: 'No rides yet',
    noRidesSub: 'Your completed trips will appear here.',
  },

  // ── Wallet ────────────────────────────────────────────────────────────
  wallet: {
    title: 'Wallet',
    balance: 'Balance',
    addMoney: 'Add money',
  },
} as const;

const hi: TranslationKeys = {
  langSelect: {
    title: 'अपनी भाषा चुनें',
    subtitle: 'आप इसे बाद में अपने अकाउंट सेटिंग्स में बदल सकते हैं।',
    cta: 'जारी रखें',
  },
  common: {
    skip: 'छोड़ें',
    next: 'आगे',
    getStarted: 'शुरू करें',
    back: 'वापस',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    loading: 'लोड हो रहा है…',
    language: 'भाषा',
    changeLanguage: 'भाषा बदलें',
    appVersion: 'NCRide · v 1.0.0 · नोएडा और दिल्ली NCR के लिए',
  },
  onboarding: {
    slides: [
      {
        title: 'NCR में हर ज़रूरत के लिए राइड।',
        subtitle:
          'कार, बाइक, ऑटो, ई-रिक्शा और इंटरसिटी राइड — एक टैप में प्रीमियम NCR मोबिलिटी।',
      },
      {
        title: 'ऑटो, ई-रिक्शा और इंटरसिटी — सब एक जगह।',
        subtitle:
          'छोटे काम के लिए ऑटो, छोटी दूरी के लिए ई-रिक्शा, या लंबे सफर के लिए प्रीमियम कार। NCRide में सब कुछ है।',
      },
      {
        title: 'लाइव ट्रैकिंग। SOS। सुरक्षित यात्रा।',
        subtitle:
          'अपनी राइड को लाइव ट्रैक करें, परिवार के साथ शेयर करें, और कभी भी SOS दबाएं। NCRide हर यात्रा को सुरक्षित बनाता है।',
      },
    ],
  },
  auth: {
    enterPhone: 'अपना फ़ोन नंबर दर्ज करें',
    phoneHint: 'हम सत्यापन के लिए OTP भेजेंगे।',
    sendOtp: 'OTP भेजें',
    verifyOtp: 'OTP सत्यापित करें',
    otpSentTo: 'OTP भेजा गया',
    resend: 'पुनः भेजें',
    resendIn: 'में पुनः भेजें',
  },
  home: {
    greeting: 'सुप्रभात',
    whereToGo: 'कहाँ जाना है?',
    searchPlaceholder: 'गंतव्य खोजें…',
    services: 'सेवाएं',
  },
  account: {
    title: 'अकाउंट',
    savedPlaces: 'सहेजे गए स्थान',
    savedPlacesSub: '5 सहेजे · घर, काम, जिम…',
    wallet: 'वॉलेट',
    paymentMethods: 'भुगतान के तरीके',
    paymentMethodsSub: 'UPI · 1 कार्ड · 4 सहेजे',
    coupons: 'कूपन और ऑफर',
    couponsSub: '3 नए ऑफर',
    rewards: 'पुरस्कार',
    rewardsSub: '840 पॉइंट · सफायर',
    referEarn: 'रेफर करें और कमाएं',
    referEarnSub: 'प्रति आमंत्रण ₹500 कमाएं',
    helpSupport: 'सहायता और समर्थन',
    sosContacts: 'SOS संपर्क',
    sosContactsSub: '3 जोड़े गए',
    settings: 'सेटिंग्स',
    logout: 'लॉग आउट',
    language: 'भाषा',
    languageSub: 'हिंदी',
  },
  activity: {
    title: 'गतिविधि',
    noRides: 'अभी तक कोई राइड नहीं',
    noRidesSub: 'आपकी पूरी की गई यात्राएं यहां दिखाई देंगी।',
  },
  wallet: {
    title: 'वॉलेट',
    balance: 'शेष राशि',
    addMoney: 'पैसे जोड़ें',
  },
};

const mr: TranslationKeys = {
  langSelect: {
    title: 'तुमची भाषा निवडा',
    subtitle: 'तुम्ही हे नंतर अकाउंट सेटिंग्जमध्ये बदलू शकता.',
    cta: 'पुढे चला',
  },
  common: {
    skip: 'वगळा',
    next: 'पुढे',
    getStarted: 'सुरू करा',
    back: 'मागे',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    confirm: 'पुष्टी करा',
    loading: 'लोड होत आहे…',
    language: 'भाषा',
    changeLanguage: 'भाषा बदला',
    appVersion: 'NCRide · v 1.0.0 · नोएडा आणि दिल्ली NCR साठी',
  },
  onboarding: {
    slides: [
      {
        title: 'NCR मध्ये प्रत्येक गरजेसाठी राइड।',
        subtitle:
          'कार, बाइक, ऑटो, ई-रिक्षा आणि इंटरसिटी राइड — एका टॅपमध्ये प्रीमियम NCR मोबिलिटी।',
      },
      {
        title: 'ऑटो, ई-रिक्षा आणि इंटरसिटी — एकाच ठिकाणी।',
        subtitle:
          'छोट्या कामांसाठी ऑटो, छोट्या अंतरासाठी ई-रिक्षा, किंवा लांब प्रवासासाठी प्रीमियम कार. NCRide कडे सर्व काही आहे.',
      },
      {
        title: 'थेट ट्रॅकिंग. SOS. सुरक्षित प्रवास.',
        subtitle:
          'तुमची राइड थेट ट्रॅक करा, कुटुंबासोबत शेअर करा, आणि कधीही SOS दाबा. NCRide प्रत्येक प्रवास सुरक्षित ठेवतो.',
      },
    ],
  },
  auth: {
    enterPhone: 'तुमचा फोन नंबर टाका',
    phoneHint: 'आम्ही पडताळणीसाठी OTP पाठवू.',
    sendOtp: 'OTP पाठवा',
    verifyOtp: 'OTP पडताळा',
    otpSentTo: 'OTP पाठवला',
    resend: 'पुन्हा पाठवा',
    resendIn: 'मध्ये पुन्हा पाठवा',
  },
  home: {
    greeting: 'सुप्रभात',
    whereToGo: 'कुठे जायचे आहे?',
    searchPlaceholder: 'गंतव्य शोधा…',
    services: 'सेवा',
  },
  account: {
    title: 'अकाउंट',
    savedPlaces: 'जतन केलेली ठिकाणे',
    savedPlacesSub: '5 जतन · घर, काम, जिम…',
    wallet: 'वॉलेट',
    paymentMethods: 'पेमेंट पद्धती',
    paymentMethodsSub: 'UPI · 1 कार्ड · 4 जतन',
    coupons: 'कूपन आणि ऑफर',
    couponsSub: '3 नवीन ऑफर',
    rewards: 'बक्षिसे',
    rewardsSub: '840 पॉइंट · सफायर',
    referEarn: 'रेफर करा आणि कमवा',
    referEarnSub: 'प्रति आमंत्रणावर ₹500 कमवा',
    helpSupport: 'मदत आणि आधार',
    sosContacts: 'SOS संपर्क',
    sosContactsSub: '3 जोडले',
    settings: 'सेटिंग्ज',
    logout: 'लॉग आउट',
    language: 'भाषा',
    languageSub: 'मराठी',
  },
  activity: {
    title: 'क्रियाकलाप',
    noRides: 'अद्याप कोणतीही राइड नाही',
    noRidesSub: 'तुमच्या पूर्ण झालेल्या ट्रिप येथे दिसतील.',
  },
  wallet: {
    title: 'वॉलेट',
    balance: 'शिल्लक',
    addMoney: 'पैसे जोडा',
  },
};

export const TRANSLATIONS: Record<Locale, TranslationKeys> = { en, hi, mr };

export const LANGUAGE_OPTIONS: {
  locale: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
}[] = [
  { locale: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { locale: 'hi', label: 'Hindi', nativeLabel: 'हिंदी', flag: '🇮🇳' },
  { locale: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳' },
];
