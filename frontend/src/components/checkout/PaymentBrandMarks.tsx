type MarkProps = {
  className?: string;
};

/** Inline SVG marks — no external URLs, crisp at any size */
export function VisaMark({ className = 'h-[14px] w-[42px]' }: MarkProps) {
  return (
    <svg viewBox="0 0 48 16" className={className} aria-hidden role="img">
      <title>Visa</title>
      <path
        fill="#1434CB"
        d="M19.5 15.5h-3.6L18.2 0.5h3.6l-2.3 15zm13.2-10.2c-.7-.3-1.8-.6-3.2-.6-3.5 0-6 1.9-6 4.5 0 2 1.8 3.1 3.2 3.8 1.4.7 1.9 1.1 1.9 1.8 0 1-.6 1.4-1.8 1.4-1.2 0-2.4-.4-3.1-.7l-.4 2.4c.8.4 2.2.7 3.7.7 3.7 0 6.1-1.8 6.1-4.7 0-1.6-1-2.7-3.1-3.7-1.3-.6-2.1-1.1-2.1-1.8 0-.6.5-1.2 1.7-1.2.9 0 1.7.2 2.3.5l.6-2.8zm8.6 6.6h3.1l-1.9-10h-2.9c-.9 0-1.6.3-2 1.1L35.7 5h3.6l.6 10.5zM14.3 0.5l-3.4 15h-3.3L4 3.2C3.6 1.4 2.4.5.8.5H.3l-.1.4c2.2.5 4 1.9 4.6 4.1l2.2 10.5h3.4L14.3.5z"
      />
      <path fill="#F7B600" d="M7.4 10.5 9.1 0.5h3.3L10.3 10.5z" />
    </svg>
  );
}

export function MastercardMark({ className = 'h-[18px] w-[28px]' }: MarkProps) {
  return (
    <svg viewBox="0 0 36 22" className={className} aria-hidden role="img">
      <title>Mastercard</title>
      <circle cx="13" cy="11" r="8" fill="#EB001B" />
      <circle cx="23" cy="11" r="8" fill="#F79E1B" />
      <path fill="#FF5F00" d="M18 4.8a7.2 7.2 0 0 0 0 12.4 7.2 7.2 0 0 0 0-12.4z" />
    </svg>
  );
}

export function ApplePayMark({ className = 'h-[16px] w-[42px]' }: MarkProps) {
  return (
    <svg viewBox="0 0 50 20" className={className} aria-hidden role="img">
      <title>Apple Pay</title>
      <path
        fill="currentColor"
        d="M8.4 3.4c-.5.6-1.3 1-2 .9-.1-.8.3-1.6.8-2.1.5-.6 1.3-1 2-.9.1.8-.2 1.6-.8 2.1zm.8 1.2c-1.1-.1-2 .7-2.6.7-.6 0-1.3-.5-2.2-.5-1.1 0-2.1.6-2.7 1.7-1.2 1.9-.3 4.8.9 6.8.6.7 1.2 1.5 2 1.5.8 0 1-.5 2-.5s1.2.5 2 .5c.8 0 1.4-.7 2-1.4.6-.8 1-1.6 1-1.6s-1.8-.8-1.8-3.1c0-1.9 1.4-2.8 1.5-2.9-1-.8-2.3-1-2.8-1z"
      />
      <path
        fill="currentColor"
        d="M18.8 5h2v10.5h-2V5zm9.8 0c2.4 0 4 1.8 4 4.4s-1.6 4.4-4 4.4c-1.2 0-2.2-.4-2.9-1.2v4.3h-2V5h1.9v1.2c.7-.8 1.7-1.2 3-1.2zm-.5 7.2c1.4 0 2.4-1.1 2.4-2.8s-1-2.8-2.4-2.8-2.4 1.1-2.4 2.8 1 2.8 2.4 2.8zm8.8-7.2h2.1l2.3 6.3 2.3-6.3h2.1l-3.1 8.3h-2.1l-3.1-8.3z"
      />
    </svg>
  );
}

export function GooglePayMark({ className = 'h-[16px] w-[44px]' }: MarkProps) {
  return (
    <svg viewBox="0 0 52 20" className={className} aria-hidden role="img">
      <title>Google Pay</title>
      <path fill="#4285F4" d="M23.8 10.1V12.5h6.8c-.3 1.5-1.1 2.8-2.4 3.7-1.4 1-3.1 1.6-5.1 1.6-4.1 0-7.4-3.3-7.4-7.4s3.3-7.4 7.4-7.4c2 0 3.7.7 5 2l2.7-2.7C30.2 1.8 27.4.8 24.2.8c-6.9 0-12.4 5.5-12.4 12.4s5.5 12.4 12.4 12.4c3.3 0 6.1-1.1 8.2-3 2.2-2 3.4-4.9 3.4-8.4 0-.8-.1-1.5-.2-2.1H23.8z" />
      <path fill="#5F6368" d="M44.5 5.2h2.5v11.1h-2.5V5.2zm7.4 0h2.5l3.9 7.6V5.2h2.5v11.1h-2.5l-3.9-7.6v7.6h-2.5V5.2z" />
    </svg>
  );
}
