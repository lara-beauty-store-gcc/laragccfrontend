import { FAQAccordion } from '@/components/FAQAccordion';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { FinalCTA } from '@/components/FinalCTA';
import { HomeHero } from '@/components/HomeHero';
import { HowItWorks } from '@/components/HowItWorks';
import { SiteFooter } from '@/components/SiteFooter';
import { Testimonials } from '@/components/Testimonials';
import { WhyBrand } from '@/components/WhyBrand';

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <FeaturedProducts />
      <WhyBrand />
      <Testimonials />
      <HowItWorks />
      <FinalCTA />
      <FAQAccordion />
      <SiteFooter />
    </>
  );
}
