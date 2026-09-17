import { siApplepay, siGooglepay, siMastercard, siVisa } from 'simple-icons';

type BrandIconData = {
  title: string;
  hex: string;
  path: string;
};

type MarkProps = {
  className?: string;
};

function BrandSvg({ icon, className = 'h-4 w-auto max-w-full' }: { icon: BrandIconData; className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={icon.title}
    >
      <title>{icon.title}</title>
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  );
}

export function VisaMark(props: MarkProps) {
  return <BrandSvg icon={siVisa} className={props.className ?? 'h-[14px] w-auto max-w-[38px]'} />;
}

export function MastercardMark(props: MarkProps) {
  return <BrandSvg icon={siMastercard} className={props.className ?? 'h-[16px] w-auto max-w-[32px]'} />;
}

export function ApplePayMark(props: MarkProps) {
  return <BrandSvg icon={siApplepay} className={props.className ?? 'h-[14px] w-auto max-w-[40px]'} />;
}

export function GooglePayMark(props: MarkProps) {
  return <BrandSvg icon={siGooglepay} className={props.className ?? 'h-[14px] w-auto max-w-[40px]'} />;
}
