import { businessConfig } from '@/config/business';
import { IconFacebook, IconInstagram, IconTikTok } from './SocialIcons';

const { social } = businessConfig;

const links = [
  {
    href: social.instagram,
    label: `Instagram ${social.instagramHandle}`,
    Icon: IconInstagram,
    hoverClass: 'hover:border-[#E4405F]/60 hover:bg-[#E4405F]/15 hover:text-[#F77737]',
  },
  {
    href: social.facebook,
    label: social.facebookLabel,
    Icon: IconFacebook,
    hoverClass: 'hover:border-[#1877F2]/60 hover:bg-[#1877F2]/15 hover:text-[#1877F2]',
  },
  {
    href: social.tiktok,
    label: `TikTok ${social.tiktokHandle}`,
    Icon: IconTikTok,
    hoverClass: 'hover:border-white/40 hover:bg-white/15 hover:text-white',
  },
] as const;

type SocialLinksProps = {
  variant?: 'footer' | 'inline';
};

export function SocialLinks({ variant = 'footer' }: SocialLinksProps) {
  return (
    <div className={variant === 'footer' ? 'mt-1' : ''}>
      {variant === 'footer' ? (
        <p className="mb-3 font-arabic text-xs font-bold text-secondary">تابعينا</p>
      ) : null}
      <div className="flex items-center justify-center gap-3 lg:justify-start">
        {links.map(({ href, label, Icon, hoverClass }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            className={`group flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/90 transition duration-200 hover:scale-105 ${hoverClass}`}
          >
            <Icon className="h-[1.35rem] w-[1.35rem] transition-transform duration-200 group-hover:scale-110" />
          </a>
        ))}
      </div>
    </div>
  );
}
