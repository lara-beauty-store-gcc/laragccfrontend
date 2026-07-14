import { notFound } from 'next/navigation';
import { getProductBySlug, products } from '@/config/products';
import { ProductLandingPage } from '@/components/product/ProductLandingPage';
import { SiteFooter } from '@/components/SiteFooter';

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} | لارا للجمال`,
    description: product.cardSubheadline,
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <>
      <ProductLandingPage product={product} />
      <SiteFooter />
    </>
  );
}
