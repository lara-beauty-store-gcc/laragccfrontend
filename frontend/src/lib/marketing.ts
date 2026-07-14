import { businessConfig } from '@/config/business';
import type { ProductConfig } from '@/config/products';
import { getLowestOfferPrice, products } from '@/config/products';
import { formatPriceFrom } from '@/lib/pricing';

const { brand, market } = businessConfig;

export { formatPrice, formatPriceFrom } from '@/lib/pricing';

export function getHeroCopy() {
  return {
    eyebrow: 'علكات يومية مدروسة — دفع عند الاستلام',
    title: 'علكات لارا',
    titleAccent: 'لجسم أهدأ وطاقة أوضح',
    subtitle:
      'ثلاث تركيبات مستقلة — نوم، طاقة، وتركيز. حلال 100%، جرعات واضحة، وبدون دفع أونلاين داخل الإمارات.',
    cta: 'استكشفي العلكات',
    guarantee: 'ضمان استرجاع 30 يوم',
    guaranteeSub: 'GMP Quality',
    guaranteeSubLocal: 'جودة معتمدة · دفع عند الاستلام',
  };
}

export function getAnnouncementSlides() {
  return [
    { icon: 'shield' as const, text: `شحن داخل ${market.countryName} • دفع عند الاستلام` },
    { icon: 'heart' as const, text: 'حلال 100% • نباتي • بدون سكر مضاف' },
    { icon: 'truck' as const, text: 'ضمان استرجاع 30 يوم — تجربة بدون مخاطرة' },
  ];
}

export function getAnnouncementText(): string {
  return getAnnouncementSlides()[0].text;
}

export function getTrustBadges() {
  return [
    { icon: 'shield' as const, label: 'جودة GMP', sub: 'تصنيع معتمد' },
    { icon: 'leaf' as const, label: 'حلال 100%', sub: 'نباتي' },
    { icon: 'truck' as const, label: `شحن ${market.countryName}`, sub: '2–4 أيام' },
    { icon: 'heart' as const, label: 'ضمان 30 يوم', sub: 'استرجاع فلوس' },
  ];
}

export function getWhyBrandCards() {
  return [
    {
      icon: 'shield' as const,
      title: 'تركيبات واضحة، مو وعود فاضية',
      body: 'كل مكوّن مكتوب على العلبة بجرعة واضحة. ما عندنا مكونات سرية ولا خلطات عشوائية.',
    },
    {
      icon: 'microscope' as const,
      title: 'جرعات مدروسة لكل هدف',
      body: 'كل علكة لمشكلة محددة: نوم، طاقة، أو تركيز — مو علكة وحدة لكل شي.',
    },
    {
      icon: 'handshake' as const,
      title: 'دفع عند الاستلام + ضمان 30 يوم',
      body: 'تجرّبين الروتين كاملاً. ما عجبك؟ نرجّع لك فلوسك خلال 30 يوم.',
    },
    {
      icon: 'truck' as const,
      title: `توصيل ${market.countryName} بدون دفع أونلاين`,
      body: 'اسمك ورقم جوالك فقط. تدفعين كاش أو بطاقة لما يوصلك الطلب.',
    },
  ];
}

export function getHowItWorksSteps() {
  return [
    {
      n: '١',
      title: 'اختاري روتينك',
      body: 'ثلاث علكات: نوم، طاقة، أو تركيز. اختاري الواحدة أو الروتين الكامل.',
    },
    {
      n: '٢',
      title: 'أكّدي طلبك (بدون دفع)',
      body: `اسمك ورقم جوالك فقط (${market.phoneCountryCode}). الدفع عند الاستلام.`,
    },
    {
      n: '٣',
      title: 'استلمي وادفعي',
      body: `نوصّل لباب بيتك داخل ${market.countryName} خلال 2–4 أيام. كاش أو بطاقة عند الاستلام.`,
    },
  ];
}

export function getTestimonials(forProduct?: ProductConfig) {
  const focus = forProduct?.shortName ?? 'العلكات';
  return [
    {
      name: 'سارة العتيبي',
      meta: '32 سنة • الإمارات • مشترية مؤكدة',
      initial: 'س',
      text: `أهم شي عندي المكونات واضحة والجرعة مكتوبة. جرّبت ${focus} شهر — والدفع كان عند الاستلام.`,
      rating: 5,
    },
    {
      name: 'نورة الدوسري',
      meta: '38 سنة • دبي • مشترية مؤكدة',
      initial: 'ن',
      text: 'الروتين الكامل أنسب شي — نوم، طاقة، وتركيز. التوصيل سريع والطلب سهل.',
      rating: 5,
    },
    {
      name: 'فاطمة الخالدي',
      meta: '35 سنة • الشارقة • مشترية مؤكدة',
      initial: 'ف',
      text: 'علكات حلال وواضحة من أول الموقع. خدمة ممتازة وضمان الاسترجاع يطمن.',
      rating: 5,
    },
  ];
}

export function getFaqs(forProduct?: ProductConfig) {
  const ing = forProduct?.mainIngredient ?? 'المكوّنات';
  const from = forProduct ? formatPriceFrom(getLowestOfferPrice(forProduct)) : 'من 189 د.إ';
  return [
    {
      q: 'هل الدفع عند الاستلام متاح داخل الإمارات؟',
      a: `نعم. الدفع عند الاستلام (كاش أو بطاقة) متوفر في كل إمارات ${market.countryName}، والشحن لجميع الطلبات.`,
    },
    {
      q: 'كم الأسعار؟',
      a: `العروض ${from} — علبة 189 د.إ، علبتين 239 د.إ، 3 علب 339 د.إ.`,
    },
    {
      q: 'هل العلكات حلال وبدون جيلاتين حيواني؟',
      a: 'حلال 100%. العلكات نباتية بالكامل (بكتين بدل الجيلاتين الحيواني)، خالية من السكر المضاف.',
    },
    {
      q: 'كم يستغرق التوصيل؟',
      a: `2–4 أيام عمل داخل ${market.countryName}. فريقنا يتصل فيك لتأكيد العنوان.`,
    },
    {
      q: 'ما هو ضمان الاسترجاع؟',
      a: 'ضمان رضا 30 يوم كامل. إذا لم يناسبك الروتين، تواصلي معنا وسنسترد قيمة طلبك.',
    },
    {
      q: 'متى سألاحظ النتيجة؟',
      a: `تختلف من شخص لشخص. ${ing} يحتاج انتظام 2–4 أسابيع لنتيجة أوضح.`,
    },
  ];
}

export function getFinalCta() {
  return {
    eyebrow: 'BEGIN YOUR RITUAL',
    title: 'جسمك يستاهل دعم يومي، مو وعود',
    subtitle: `ابدئي روتين لارا اليوم. الدفع عند الاستلام، شحن ${market.countryName}، وضمان 30 يوم.`,
    cta: 'استكشفي العلكات الآن',
    chips: ['دفع عند الاستلام', 'حلال 100%', `شحن ${market.countryName}`, 'ضمان 30 يوم'],
  };
}

export { brand, market, products };
