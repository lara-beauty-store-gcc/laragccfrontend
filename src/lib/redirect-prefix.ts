export const ADS_REDIRECT_PREFIX = '/ads';

export function adsRedirectPath(slug: string) {
  return `${ADS_REDIRECT_PREFIX}/${slug}`;
}

export function adsRedirectUrl(baseUrl: string, slug: string) {
  return `${baseUrl.replace(/\/$/, '')}${adsRedirectPath(slug)}`;
}
