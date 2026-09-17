import type { ProductConfig } from '@/config/products';
import { MediaFrame } from '@/components/ui/MediaFrame';
import { PremiumImagePlaceholder } from './PremiumImagePlaceholder';

/** Homepage collection card — uses collectionImage only */
export function ProductCollectionImage({
  product,
  className = '',
  priority = false,
}: {
  product: ProductConfig;
  className?: string;
  priority?: boolean;
}) {
  if (product.collectionImage) {
    return (
      <MediaFrame
        src={product.collectionImage}
        alt={product.collectionImageAlt ?? product.name}
        layout="collection"
        priority={priority}
        className={className}
      />
    );
  }

  return <PremiumImagePlaceholder product={product} className={className} />;
}
