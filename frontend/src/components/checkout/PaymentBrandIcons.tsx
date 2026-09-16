type IconProps = {
  className?: string;
};

/** Mastercard — overlapping circles mark */
export function MastercardIcon({ className = 'h-5 w-8' }: IconProps) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden role="img">
      <title>Mastercard</title>
      <circle cx="15" cy="12" r="8" fill="#EB001B" />
      <circle cx="25" cy="12" r="8" fill="#F79E1B" />
      <path d="M20 5.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#FF5F00" />
    </svg>
  );
}

/** Visa wordmark */
export function VisaIcon({ className = 'h-4 w-10' }: IconProps) {
  return (
    <svg viewBox="0 0 48 16" className={className} aria-hidden role="img">
      <title>Visa</title>
      <path
        fill="#1A1F71"
        d="M19.3 15.5h-3.5L18 0.5h3.5l-2.2 15zm12.9-10.1c-.7-.3-1.8-.6-3.2-.6-3.5 0-6 1.9-6 4.5 0 2 1.8 3.1 3.2 3.8 1.4.7 1.9 1.1 1.9 1.8 0 1-.6 1.4-1.8 1.4-1.2 0-2.4-.4-3.1-.7l-.4 2.4c.8.4 2.2.7 3.7.7 3.7 0 6.1-1.8 6.1-4.7 0-1.6-1-2.7-3.1-3.7-1.3-.6-2.1-1.1-2.1-1.8 0-.6.5-1.2 1.7-1.2 1 0 1.7.2 2.3.5l.6-2.8zm8.5 6.6h3.1l-1.9-10h-2.9c-.9 0-1.6.3-2 1.1L35.5 5h3.6l.6 10.5zM14.1.5l-3.4 15h-3.3L3.7 3.2C3.3 1.4 2.1.5.5.5H0v.3C2.2.9 4 2.2 4.6 4l2.2 11.5h3.4L14.1.5z"
      />
      <path fill="#F7A600" d="M7.2 10.5 8.8.5h3.3L10.5 10.5z" />
    </svg>
  );
}

/** American Express */
export function AmexIcon({ className = 'h-5 w-8' }: IconProps) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden role="img">
      <title>American Express</title>
      <rect width="40" height="24" rx="3" fill="#2E77BC" />
      <path
        fill="#fff"
        d="M6.5 14.5 5 9.5h1.3l.9 3.5.9-3.5H9.5l-1.5 5h-1.5zm5.2 0V9.5h2.2c1.2 0 2 .7 2 1.7 0 .6-.3 1.1-.8 1.4l1.2 1.9h-1.6l-1-1.7h-.8v1.7H11.7zm1.4-2.8h.7c.5 0 .8-.2.8-.6 0-.4-.3-.6-.8-.6h-.7v1.2zm4.5 2.8V9.5h3.4v1.1h-2v.9h1.9v1h-1.9v1h2.1v1h-3.5zm5.2 0 1.3-2.7 1.3 2.7h1.5L24.8 9.5h-1.4l-1 2.2-1-2.2h-1.5l1.8 5h1.5zm6.2 0c.9 0 1.6-.4 2-1.1l-1.2-.6c-.2.3-.5.5-.9.5-.7 0-1.1-.5-1.1-1.3v-.1h3.3v-.4c0-1.5-.9-2.5-2.4-2.5-1.5 0-2.5 1.1-2.5 2.7 0 1.6 1 2.8 2.8 2.8zm-.1-4.3c.6 0 1 .3 1 .8h-2c0-.5.4-.8 1-.8z"
      />
    </svg>
  );
}

/** Discover */
export function DiscoverIcon({ className = 'h-5 w-8' }: IconProps) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden role="img">
      <title>Discover</title>
      <rect width="40" height="24" rx="3" fill="#fff" stroke="#E5E7EB" strokeWidth="0.5" />
      <circle cx="26" cy="12" r="6" fill="#F47216" />
      <path
        fill="#231F20"
        d="M8 9.5h1.8c1.1 0 1.8.6 1.8 1.5 0 .6-.3 1.1-.9 1.3l1.1 1.7H10l-.9-1.5H9.2v1.5H8V9.5zm1.7 2.3h.5c.4 0 .6-.2.6-.5 0-.3-.2-.5-.6-.5h-.5v1zm3.5-2.3h1.4v4H13.2V9.5zm2.2 0h1.3l.8 2.4.8-2.4h1.3l-1.4 4h-1.3l-1.4-4z"
      />
    </svg>
  );
}

/** Apple Pay */
export function ApplePayIcon({ className = 'h-5 w-12' }: IconProps) {
  return (
    <svg viewBox="0 0 50 20" className={className} aria-hidden role="img">
      <title>Apple Pay</title>
      <path
        fill="currentColor"
        d="M8.2 3.5c-.5.6-1.3 1.1-2.1 1-.1-.8.3-1.7.8-2.2.5-.6 1.4-1 2.1-1 .1.9-.2 1.7-.8 2.2zm.8 1.3c-1.2-.1-2.2.7-2.8.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.1-.3 5.3.9 7 .6.8 1.2 1.7 2.1 1.7.8 0 1.1-.5 2.2-.5 1.1 0 1.4.5 2.3.5.9 0 1.5-.8 2.1-1.6.7-.9 1-1.9 1-1.9s-1.9-.7-1.9-2.8c0-1.8 1.5-2.6 1.6-2.7-1-.9-2.4-1-2.9-1.1z"
      />
      <path
        fill="currentColor"
        d="M18.5 5.2h2.1v9.6h-2.1V5.2zm10.2 0c2.5 0 4.2 1.9 4.2 4.8s-1.7 4.8-4.2 4.8c-1.3 0-2.3-.5-3-1.4v5.4h-2.1V5.2h2v1.3c.7-.9 1.7-1.3 3.1-1.3zm-.5 7.8c1.5 0 2.5-1.2 2.5-3s-1-3-2.5-3-2.5 1.2-2.5 3 1 3 2.5 3zm8.5-7.8h2.1l2.4 6.7 2.4-6.7h2l-3.6 9.6h-2.1l-3.7-9.6z"
      />
    </svg>
  );
}

/** Google Pay */
export function GooglePayIcon({ className = 'h-5 w-12' }: IconProps) {
  return (
    <svg viewBox="0 0 50 20" className={className} aria-hidden role="img">
      <title>Google Pay</title>
      <path fill="#5F6368" d="M10.2 9.8V12h4.8c-.2 1.1-.8 2-1.7 2.6-1 .7-2.2 1.1-3.6 1.1-2.9 0-5.3-2.4-5.3-5.3S7.8 5.1 10.7 5.1c1.4 0 2.6.5 3.5 1.3l2-2C14.8 3.2 12.9 2.5 10.7 2.5 5.9 2.5 2 6.4 2 11.2s3.9 8.7 8.7 8.7c2.3 0 4.3-.8 5.8-2.1 1.5-1.4 2.4-3.5 2.4-6 0-.6-.1-1.1-.2-1.6H10.2z" />
      <path fill="#4285F4" d="M28.5 8.5c0 .5-.4.9-1 .9h-3.5v2h3.9c.2 1 .9 1.8 1.9 2.3.8.5 1.8.7 2.9.7 1.6 0 3-.5 4-1.5 1-1 1.5-2.4 1.5-4.1 0-1.6-.5-2.9-1.5-3.9-1-1-2.4-1.5-4-1.5-1.5 0-2.8.5-3.8 1.4-.5.4-.9 1-1.2 1.6l2.8 2.2c.6-.9 1.6-1.4 2.8-1.4.8 0 1.5.3 2 .8.5.5.8 1.2.8 2.1z" />
      <path fill="#34A853" d="M38.2 6.2c1.2 0 2.2.4 3 1.2l2.2-2.2c-1.3-1.2-3-1.9-5.2-1.9-3.2 0-5.9 2-6.9 4.8l2.8 2.2c.7-2 2.5-3.1 4.1-3.1z" />
      <path fill="#FBBC04" d="M31.3 14.8c.9.9 2.1 1.4 3.5 1.4 1.1 0 2-.3 2.8-.9l2.2 2.2c-1.3 1.2-3 1.9-5.2 1.9-3.2 0-5.9-2-6.9-4.8l2.8-2.2c.7 2 2.5 3.4 4.8 3.4z" />
      <path fill="#EA4335" d="M43.2 4.2 40.9 6.5c-.7-.7-1.7-1.1-2.8-1.1-1.6 0-3 1.1-3.5 2.8l-2.8-2.2c1.4-2.8 4.3-4.8 7.9-4.8 1.5 0 2.8.4 3.9 1.1l-2.5 2.5z" />
    </svg>
  );
}
