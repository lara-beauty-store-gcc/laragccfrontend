export const businessConfig = {
  brand: {
    nameLocal: 'لارا للجمال',
    nameEnglish: 'LARA BEAUTY',
    tagline: 'علكات يومية تدعم جسمك من الداخل',
    description:
      'علكات لارا — تركيبات مدروسة للنوم، الطاقة، والتركيز. دفع عند الاستلام داخل الإمارات.',
    logoUrl: '/images/logo-header.webp',
    logoIconUrl: '/images/logo-icon.webp',
    logoWhiteUrl: '/images/logo-white.webp',
    iconUrl: '/images/logo-icon.webp',
  },
  market: {
    countryName: 'الإمارات',
    countryCode: 'AE',
    language: 'ar',
    direction: 'rtl' as const,
    currency: 'AED',
    currencySymbol: 'د.إ',
    currencyName: 'درهم إماراتي',
    phoneCountryCode: '+971',
    phoneExample: '501234567',
  },
  cod: {
    enabled: true,
    paymentLabel: 'دفع عند الاستلام — بدون دفع أونلاين',
    deliveryPromise: 'توصيل 2–4 أيام عمل لكل إمارات الدولة',
    confirmationPromise: 'فريقنا يتصل فيك خلال ساعات لتأكيد العنوان',
    returnGuarantee: 'ضمان استرجاع 30 يوم — فلوسك ترجع إذا ما عجبك الروتين',
  },
  design: {
    primaryColor: '#134E3A',
    primaryDarkColor: '#0F3D2E',
    accentColor: '#C8A55C',
    backgroundColor: '#FBF8F2',
    cardColor: '#FFFFFF',
    textColor: '#1A2E22',
    mutedTextColor: '#5F6B62',
    borderColor: '#E5DFCD',
    primarySoftColor: '#E8EFE9',
    secondarySoftColor: '#F5EDD8',
    surfaceRoseColor: '#F5F0E5',
    themeColor: '#134E3A',
  },
};

/** @deprecated use businessConfig — kept for existing imports */
export const businessInputs = businessConfig;
