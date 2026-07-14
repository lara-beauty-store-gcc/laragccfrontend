import type { ProductConfig } from './types';
import { collectionImageFor, productPageImagesFull } from './product-images';

const bundleOffers = (labels: { one: string; two: string; three: string }) => [
  {
    id: 'one',
    quantity: 1,
    label: labels.one,
    subtitle: 'شهر كامل — 60 علكة',
    price: 189,
    compareAtPrice: 189,
    badge: '',
  },
  {
    id: 'two',
    quantity: 2,
    label: labels.two,
    subtitle: 'شهرين — ثبّتي النتيجة',
    price: 239,
    compareAtPrice: 378,
    badge: 'الأكثر اختياراً',
    defaultSelected: true,
  },
  {
    id: 'three',
    quantity: 3,
    label: labels.three,
    subtitle: '3 علب — أقوى توفير',
    price: 339,
    compareAtPrice: 567,
    badge: 'أكثر توفيراً',
  },
];

const defaultUpsell = {
  enabled: true,
  price: 99,
  label: 'علبة إضافية بسعر خاص',
  subtitle: 'كمّلي الروتين — عرض لمرة وحدة بعد الطلب',
};

const defaultImages = {
  heroBeforeAfter: '',
  heroProduct: '',
  problemImage: '',
  ingredientImage: '',
  authorityImage: '',
  lifestyleImage: '',
  testimonialImage: '',
  comparisonImage: '',
};

const uaeCities = [
  'دبي',
  'أبوظبي',
  'الشارقة',
  'عجمان',
  'رأس الخيمة',
  'الفجيرة',
  'أم القيوين',
  'دبي مارينا',
  'جبل علي',
  'العين',
];

export const products: ProductConfig[] = [
  {
    id: 'magnesium-sleep',
    slug: 'magnesium-sleep',
    sku: 'LARA-MG-01',
    name: 'علكات المغنيسيوم لتحسين جودة النوم',
    shortName: 'روتين النوم',
    routineNameLocal: 'روتين النوم',
    routineNameEnglish: 'Sleep Routine',
    category: 'sleep',
    format: 'gummies',
    targetCustomer: 'نساء وسكان الإمارات اللي يتعبون ينامون بسبب التوتر والشغل',
    problem: 'صعوبة النوم وتقلب الليل',
    emotionalPain: 'تتقلبين بالسرير وتصحين تعبانة — واليوم الثاني كله ثقيل',
    desiredOutcome: 'نوم أهدأ وجسم أخف من غير إدمان',
    mainIngredient: 'مغنيسيوم + L-ثيانين',
    ingredientStack: [
      { name: 'مغنيسيوم', dosage: 'جرعة يومية مدروسة', benefit: 'يساعد على استرخاء العضلات والجهاز العصبي', proof: 'مكوّن معروف لدعم جودة النوم' },
      { name: 'L-ثيانين', benefit: 'يساعد على هدوء الذهن قبل النوم', proof: 'يُستخدم في روتينات النوم اليومية' },
      { name: 'بكتين نباتي', benefit: 'علكة ناعمة بدون جيلاتين حيواني', proof: 'مناسبة لمن يفضّلون حلال' },
    ],
    mechanism: 'المغنيسيوم يساعد جسمك يسترخي قبل النوم — مو حبوب منومة ولا إدمان.',
    cardHeadline: 'نوم أهدأ بروتين بسيط',
    cardSubheadline: 'علكتين يومياً بعد العشا — تدعم استرخاء الجسم قبل النوم.',
    heroHeadline: 'تعبانة من الليل الطويل؟ — السبب مو دايماً «تفكير زايد»',
    heroSubheadline:
      'جسمك يحتاج دعم من الداخل. علكتان يومياً بمغنيسيوم وL-ثيانين — روتين بسيط يساعدك تهدئين قبل النوم.',
    rating: 4.9,
    reviewsCount: 186,
    badges: ['60 علكة / علبة', '30 يوم روتين', 'حلال • بكتين نباتي', 'دفع عند الاستلام'],
    offers: bundleOffers({
      one: 'علبة وحدة',
      two: 'علبتين',
      three: '3 علب',
    }),
    upsell: defaultUpsell,
    collectionImage: collectionImageFor('magnesium-sleep'),
    collectionImageAlt: 'روتين النوم — علكات مغنيسيوم و L-ثيانين، 60 علكة',
    images: { ...defaultImages, ...productPageImagesFull('magnesium-sleep') },
    imageAlts: {
      heroBeforeAfter: 'قبل وبعد روتين النوم',
      heroProduct: 'علكات المغنيسيوم',
      problemImage: 'تعب وقلة نوم',
      ingredientImage: 'مكونات المغنيسيوم',
      authorityImage: 'جودة وثقة',
      lifestyleImage: 'نوم هادئ',
      testimonialImage: 'رأي عميلة',
      comparisonImage: 'مقارنة الحلول',
    },
    placeholderHue: 'indigo',
    exclusions: ['بدون كافيين', 'بدون منومات', 'بدون جيلاتين حيواني', 'بدون ألوان صناعية'],
    authority: {
      certifications: ['GMP', 'حلال', 'جودة معتمدة', 'تصنيع مدروس'],
      expertTitle: 'تركيبة مدروسة للاستخدام اليومي',
      expertQuote:
        'المغنيسيوم من أكثر المكوّنات اللي الناس تستخدمها لدعم الاسترخاء. روتين علكتين يومياً أسهل من الحبوب المعقدة.',
      stats: [
        { value: '4.9', label: 'تقييم العملاء' },
        { value: '30', label: 'يوم لكل علبة' },
      ],
    },
    timeline: [
      { label: 'أول أسبوع', text: 'بعض العميلات يحسّون بهدوء أكثر قبل النوم — النتيجة تختلف من شخص لشخص.' },
      { label: 'الأسبوع الثاني', text: 'مع الاستمرار، الروتين يصير أسهل والنوم أكثر انتظاماً عند كثير من المستخدمات.' },
      { label: 'نهاية العلبة', text: 'العلبة الأولى تعطيك فكرة واضحة — علبتين وثلاث تثبّت الروتين وتوفّر أكثر.' },
    ],
    problemCards: [
      { pain: '«أتقلب بالسرير وساعات ما أنام»', solution: 'مغنيسيوم يساعد جسمك يسترخي — مو حبة منومة.' },
      { pain: '«أصحى تعبانة حتى لو نمت ساعات»', solution: 'روتين يومي بسيط قبل النوم — علكتين بعد العشا.' },
      { pain: '«جربت شاي وأدوية وما نفع»', solution: 'علكة بطعم لذيذ — بدون ماء وبدون تعقيد.' },
    ],
    failureAlternatives: [
      {
        name: 'منومات بدون وصفة',
        priceNote: 'تكلفة شهرية + مخاوف اعتماد',
        points: ['قد تسبب نعاس ثقيل الصبح', 'ما تحل سبب التوتر الجسدي', 'صعب الاستمرار طويل'],
      },
      {
        name: 'شاي / مشروبات عشوائية',
        priceNote: 'نتيجة غير ثابتة',
        points: ['جرعة غير واضحة', 'طعم ما يناسب الجميع', 'ما في روتين ثابت'],
      },
    ],
    testimonials: [
      { quote: 'صرت آخذ علكتين بعد العشا — النوم صار أهدأ وأنا مرتاحة أكثر.', name: 'نورة', meta: 'السالمية • 34 سنة', initial: 'ن' },
      { quote: 'أحب إنها علكة مو حبوب. الروتين سهل وأنا مستمرة ثلاث أسابيع.', name: 'مريم', meta: 'الفروانية • 41 سنة', initial: 'م' },
      { quote: 'الدفع عند الاستلام خلاني أجرّب بدون قلق — والتوصيل كان سريع.', name: 'هيا', meta: 'الأحمدي • 29 سنة', initial: 'ه' },
    ],
    insightStat: {
      value: '7',
      label: 'من 10 عميلات يفضّلن روتين بسيط قبل النوم بدل الحبوب',
      source: 'استطلاع داخلي — لارا للجمال',
    },
    scarcityLine: 'عرض الأسبوع: شحن مجاني لطلبات اليوم داخل الإمارات',
    delivery: { cities: uaeCities, carriers: ['شركات توصيل معتمدة داخل الإمارات'] },
    relatedSlugs: ['epimedium-energy', 'focus-clarity'],
  },
  {
    id: 'epimedium-energy',
    slug: 'epimedium-energy',
    sku: 'LARA-EP-01',
    name: 'علكات عشبة العنزة ضد الإرهاق والتعب',
    shortName: 'روتين الطاقة',
    routineNameLocal: 'روتين الطاقة',
    routineNameEnglish: 'Energy Routine',
    category: 'energy',
    format: 'gummies',
    targetCustomer: 'رجال ونساء في الإمارات يحسون تعب وإرهاق يومي',
    problem: 'الإرهاق وقلة الحيوية',
    emotionalPain: 'تصحين من النوم وتحسين نفسك لسا متعبة — والقهوة ما تكفي',
    desiredOutcome: 'حيوية أوضح بدون تهيج أو انهيار بعد الظهر',
    mainIngredient: 'عشبة العنزة + فيتامينات B',
    ingredientStack: [
      { name: 'عشبة العنزة', benefit: 'تُستخدم تقليدياً لدعم الحيوية والطاقة', proof: 'مكوّن معروف في المكملات اليومية' },
      { name: 'فيتامين B12', dosage: 'جرعة يومية', benefit: 'يساعد على تقليل الإرهاق ودعم الطاقة', proof: 'فيتامين أساسي للجسم' },
      { name: 'بكتين نباتي', benefit: 'علكة سهلة كل صباح', proof: 'حلال • نباتي' },
    ],
    mechanism: 'دعم يومي من الداخل — مو مشروط طاقة فيه سكر زايد ولا قهوة ليلية.',
    cardHeadline: 'طاقة أنعم بدون تهيج',
    cardSubheadline: 'علكتين صباحاً — تدعم حيويتك طول اليوم.',
    heroHeadline: 'تعب وإرهاق من غير سبب واضح؟ — جسمك يبي دعم مو كافيين زايد',
    heroSubheadline:
      'علكات عشبة العنزة مع فيتامينات B — روتين صباحي بسيط يساعدك تحسّين نشاطك من الداخل.',
    rating: 4.8,
    reviewsCount: 214,
    badges: ['60 علكة / علبة', 'صباحاً بعد الفطور', 'حلال • نباتي', 'دفع عند الاستلام'],
    offers: bundleOffers({
      one: 'علبة وحدة',
      two: 'علبتين',
      three: '3 علب',
    }),
    upsell: defaultUpsell,
    collectionImage: collectionImageFor('epimedium-energy'),
    collectionImageAlt: 'روتين الطاقة — علكات عشبة العنزة وفيتامين B12، 60 علكة',
    images: { ...defaultImages, ...productPageImagesFull('epimedium-energy') },
    imageAlts: {
      heroBeforeAfter: 'قبل وبعد الطاقة',
      heroProduct: 'علكات عشبة العنزة',
      problemImage: 'إرهاق يومي',
      ingredientImage: 'مكونات الطاقة',
      authorityImage: 'جودة',
      lifestyleImage: 'حيوية',
      testimonialImage: 'عميل',
      comparisonImage: 'مقارنة',
    },
    placeholderHue: 'amber',
    exclusions: ['بدون كافيين عالي', 'بدون سكر زائد', 'بدون جيلاتين حيواني', 'بدون محفزات قاسية'],
    authority: {
      certifications: ['GMP', 'حلال', 'جودة معتمدة', 'تصنيع مدروس'],
      expertTitle: 'روتين يومي للحيوية',
      expertQuote:
        'كثير ناس في الخليج يعتمدون على القهوة بس. روتين علكة صباحي أسهل للاستمرار ويدعم الجسم من الداخل.',
      stats: [
        { value: '4.8', label: 'تقييم العملاء' },
        { value: '60', label: 'علكة في العلبة' },
      ],
    },
    timeline: [
      { label: 'أول أسبوع', text: 'بعض العملاء يحسّون نشاط أوضح صباحاً — النتيجة تختلف.' },
      { label: 'الأسبوع الثاني', text: 'الاستمرار يساعد على ثبات الحيوية بدون اعتماد على القهوة فقط.' },
      { label: 'نهاية العلبة', text: 'علبتين أو ثلاث = توفير + روتين أطول.' },
    ],
    problemCards: [
      { pain: '«أتعب بسرعة حتى لو نمت كويس»', solution: 'دعم فيتامينات B + عشبة العنزة من الداخل.' },
      { pain: '«القهوة تخليني متوترة»', solution: 'علكة صباحية بدون جرعة كافيين قاسية.' },
      { pain: '«ما عندي وقت لروتين معقد»', solution: 'علكتين بعد الفطور — 30 ثانية.' },
    ],
    failureAlternatives: [
      {
        name: 'مشروبات طاقة',
        priceNote: 'سكر + تهيج',
        points: ['انهيار بعد ساعات', 'ما مناسب للجميع', 'تكلفة شهرية عالية'],
      },
      {
        name: 'فيتامينات عشوائية',
        priceNote: 'امتصاص غير مضمون',
        points: ['حبوب صعبة الاستمرار', 'جرعات غير واضحة', 'ما في متعة يومية'],
      },
    ],
    testimonials: [
      { quote: 'صرت آخذها الصبح — أحس يومي أخف وأنشط بدون قهوة زايدة.', name: 'فهد', meta: 'الجهراء • 38 سنة', initial: 'ف' },
      { quote: 'العلكة طعمها حلو — الروتين سهل وما نسيته.', name: 'سارة', meta: 'حولي • 32 سنة', initial: 'س' },
      { quote: 'طلبت علبتين ووفّرت — التوصيل كان خلال يومين.', name: 'عبدالله', meta: 'مبارك الكبير • 45 سنة', initial: 'ع' },
    ],
    insightStat: {
      value: '68%',
      label: 'من عملائنا يفضّلون روتين صباحي بدل مشروبات الطاقة',
      source: 'لارا للجمال — الإمارات',
    },
    scarcityLine: 'كمية محدودة هذا الأسبوع — اطلبي قبل نفاد المخزون',
    delivery: { cities: uaeCities, carriers: ['توصيل داخل الإمارات'] },
    relatedSlugs: ['magnesium-sleep', 'focus-clarity'],
  },
  {
    id: 'focus-clarity',
    slug: 'focus-clarity',
    sku: 'LARA-FC-01',
    name: 'علكات ضد التشتت وضعف التركيز',
    shortName: 'روتين التركيز',
    routineNameLocal: 'روتين التركيز',
    routineNameEnglish: 'Focus Routine',
    category: 'cognitive',
    format: 'gummies',
    targetCustomer: 'طلاب وموظفين في الإمارات — تشتت ونسيان',
    problem: 'التشتت وضعف التركيز',
    emotionalPain: 'تفتحين الموبايل وتنسين شنو كنتي بتسوين — والشغل يتراكم',
    desiredOutcome: 'تركيز أوضح وذاكرة أقوى لليوم المزدحم',
    mainIngredient: 'أوميغا 3 + فيتامينات B',
    ingredientStack: [
      { name: 'أوميغا 3', benefit: 'يدعم وظائف الدماغ والتركيز', proof: 'مكوّن معروف للصحة المعرفية' },
      { name: 'فيتامينات B', benefit: 'تساعد على تقليل التعب الذهني', proof: 'ضرورية للطاقة الذهنية' },
      { name: 'بكتين نباتي', benefit: 'علكة يومية سهلة', proof: 'مناسبة للاستخدام اليومي' },
    ],
    mechanism: 'دعم الدماغ من الداخل — مو مشروبات تركيز فيها سكر وانهيار.',
    cardHeadline: 'تركيز أوضح ليومك',
    cardSubheadline: 'علكتين يومياً — تدعم ذاكرتك وتركيزك.',
    heroHeadline: 'تشتتين وما تركّزين؟ — السبب مو دايماً «قلة اهتمام»',
    heroSubheadline:
      'دماغك يحتاج تغذية يومية. أوميغا 3 وفيتامينات B بروتين علكتين — يساعدك تحافظين على تركيزك.',
    rating: 4.9,
    reviewsCount: 192,
    badges: ['60 علكة / علبة', 'للشغل والدراسة', 'حلال • نباتي', 'دفع عند الاستلام'],
    offers: bundleOffers({
      one: 'علبة وحدة',
      two: 'علبتين',
      three: '3 علب',
    }),
    upsell: defaultUpsell,
    collectionImage: collectionImageFor('focus-clarity'),
    collectionImageAlt: 'روتين التركيز — علكات أوميغا 3 وفيتامينات B، 60 علكة',
    images: { ...defaultImages, ...productPageImagesFull('focus-clarity') },
    imageAlts: {
      heroBeforeAfter: 'قبل وبعد التركيز',
      heroProduct: 'علكات التركيز',
      problemImage: 'تشتت',
      ingredientImage: 'أوميغا 3',
      authorityImage: 'جودة',
      lifestyleImage: 'تركيز',
      testimonialImage: 'عميلة',
      comparisonImage: 'مقارنة',
    },
    placeholderHue: 'teal',
    exclusions: ['بدون منبهات قوية', 'بدون سكر زائد', 'بدون جيلاتين حيواني', 'بدون ألوان صناعية'],
    authority: {
      certifications: ['GMP', 'حلال', 'جودة معتمدة', 'تصنيع مدروس'],
      expertTitle: 'دعم يومي للتركيز',
      expertQuote:
        'أوميغا 3 وفيتامينات B من أكثر المكوّنات اللي الناس تبحث عنها لدعم التركيز — والعلكة تسهّل الالتزام.',
      stats: [
        { value: '4.9', label: 'تقييم' },
        { value: '2', label: 'علكة / يوم' },
      ],
    },
    timeline: [
      { label: 'أول أسبوع', text: 'بعض العميلات يحسّون بوضوح أفضل أثناء الشغل — النتيجة تختلف.' },
      { label: 'الأسبوع الثاني', text: 'الروتين يصير عادة — أقل تشتت عند كثير من المستخدمات.' },
      { label: 'نهاية العلبة', text: 'علبة واحدة للتجربة — اثنتين وثلاث للتوفير والاستمرار.' },
    ],
    problemCards: [
      { pain: '«أبدأ شغل وأتشتت بعد نص ساعة»', solution: 'دعم يومي للدماغ — مو طاقة مؤقتة.' },
      { pain: '«أنسى تفاصيل مهمة»', solution: 'روتين ثابت مع أوميغا 3 وفيتامينات B.' },
      { pain: '«ما أبي حبوب معقدة»', solution: 'علكتين بطعم لذيذ — بدون ماء.' },
    ],
    failureAlternatives: [
      {
        name: 'مشروبات تركيز سكرية',
        priceNote: 'انهيار بعد ساعتين',
        points: ['تركيز مؤقت', 'تعب بعدها', 'سعر يومي يتراكم'],
      },
      {
        name: 'تطبيقات وتنبيهات فقط',
        priceNote: 'ما تحل نقص التغذية',
        points: ['ما تدعم الدماغ', 'تحتاج انضباط فقط', 'نتيجة محدودة'],
      },
    ],
    testimonials: [
      { quote: 'استخدمتها وقت الدراسة — أحس تركيزي صار أطول.', name: 'دانة', meta: 'الإمارات • 22 سنة', initial: 'د' },
      { quote: 'شغلي يحتاج تركيز — الروتين سهل وما نسيته.', name: 'لمياء', meta: 'السالمية • 36 سنة', initial: 'ل' },
      { quote: 'طلبت 3 علب ووفّرت — الدفع عند الاستلام مريح.', name: 'شيماء', meta: 'الفحيحيل • 28 سنة', initial: 'ش' },
    ],
    insightStat: {
      value: '3',
      label: 'ساعات يضيعها الموظف الإماراتي يومياً بسبب التشتت (تقدير)',
      source: 'استطلاع داخلي',
    },
    scarcityLine: 'آخر طلبات اليوم — توصيل سريع داخل الإمارات',
    delivery: { cities: uaeCities, carriers: ['توصيل محلي'] },
    relatedSlugs: ['magnesium-sleep', 'epimedium-energy'],
  },
];

export type { ProductConfig, ProductOffer } from './types';

export function getProductBySlug(slug: string): ProductConfig | undefined {
  return products.find((p) => p.slug === slug);
}

export function getLowestOfferPrice(product: ProductConfig): number {
  return Math.min(...product.offers.map((o) => o.price));
}

export function getDefaultOffer(product: ProductConfig) {
  return (
    product.offers.find((o) => o.defaultSelected) ??
    product.offers[1] ??
    product.offers[0]
  );
}
