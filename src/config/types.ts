export type ProductOffer = {
  id: string;
  quantity: number;
  label: string;
  subtitle: string;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  defaultSelected?: boolean;
};

export type ProductUpsell = {
  enabled: boolean;
  price: number;
  label: string;
  subtitle: string;
};

export type ProductImages = {
  heroBeforeAfter: string;
  heroProduct: string;
  problemImage: string;
  ingredientImage: string;
  authorityImage: string;
  lifestyleImage: string;
  testimonialImage: string;
  comparisonImage: string;
};

export type IngredientItem =
  | string
  | {
      name: string;
      dosage?: string;
      benefit?: string;
      proof?: string;
    };

export type TimelineItem = { label: string; text: string };

export type TestimonialItem = {
  quote: string;
  name: string;
  meta: string;
  initial: string;
};

export type ProblemSolutionCard = {
  pain: string;
  solution: string;
};

export type FailureAlternative = {
  name: string;
  priceNote: string;
  points: string[];
};

export type ComparisonRow = {
  label: string;
  product: string;
  alternative: string;
};

export type FaqItem = { question: string; answer: string };

export type ProductConfig = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortName: string;
  routineNameLocal: string;
  routineNameEnglish: string;
  category: string;
  format: string;
  targetCustomer: string;
  problem: string;
  emotionalPain: string;
  desiredOutcome: string;
  mainIngredient: string;
  ingredientStack: IngredientItem[];
  mechanism: string;
  cardHeadline: string;
  cardSubheadline: string;
  heroHeadline: string;
  heroSubheadline: string;
  rating: number;
  reviewsCount: number;
  badges: string[];
  offers: ProductOffer[];
  upsell: ProductUpsell;
  images: ProductImages;
  /** Homepage / collection card only — product page hero stays empty until set */
  collectionImage?: string;
  collectionImageAlt?: string;
  imageAlts: Record<keyof ProductImages, string>;
  placeholderHue: 'teal' | 'amber' | 'indigo';
  exclusions?: string[];
  authority?: {
    certifications: string[];
    expertTitle: string;
    expertQuote: string;
    stats: { value: string; label: string }[];
  };
  timeline?: TimelineItem[];
  problemCards?: ProblemSolutionCard[];
  failureAlternatives?: FailureAlternative[];
  testimonials?: TestimonialItem[];
  comparisonRows?: ComparisonRow[];
  usage?: { headline: string; steps: string[] };
  delivery?: { cities: string[]; carriers: string[] };
  faq?: FaqItem[];
  insightStat?: { value: string; label: string; source?: string };
  scarcityLine?: string;
  relatedSlugs?: string[];
};
