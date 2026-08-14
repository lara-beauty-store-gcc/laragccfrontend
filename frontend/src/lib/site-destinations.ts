import { products } from '@/config/products';

export type SiteDestination = {
  label: string;
  path: string;
  group: 'pages' | 'products';
};

export function getSiteDestinations(): SiteDestination[] {
  const pages: SiteDestination[] = [
    { label: 'Warmup page (/lp)', path: '/lp', group: 'pages' },
    { label: 'Homepage', path: '/', group: 'pages' },
    { label: 'Products section', path: '/#products', group: 'pages' },
  ];

  const productPages: SiteDestination[] = products.map((product) => ({
    label: product.shortName,
    path: `/products/${product.slug}`,
    group: 'products',
  }));

  return [...pages, ...productPages];
}
