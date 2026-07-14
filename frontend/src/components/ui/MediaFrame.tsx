import Image from 'next/image';
import { IMAGE_LAYOUT, type ImageLayoutKey } from '@/config/image-layout';

export function MediaFrame({
  src,
  alt,
  layout = 'collection',
  priority = false,
  className = '',
  frameClassName = '',
}: {
  src: string;
  alt: string;
  layout?: ImageLayoutKey;
  priority?: boolean;
  className?: string;
  frameClassName?: string;
}) {
  const preset = IMAGE_LAYOUT[layout];

  if (!src) return null;

  return (
    <div className={`${preset.frame} ${frameClassName}`.trim()}>
      <div className={`relative ${preset.aspect} ${className}`.trim()}>
        <Image
          src={src}
          alt={alt}
          fill
          className={preset.object}
          sizes={preset.sizes}
          priority={priority}
          unoptimized
        />
      </div>
    </div>
  );
}
