import { Reader, WebServiceClient } from '@maxmind/geoip2-node';
import { runtimeEnv } from '@/lib/runtime-env';
import { isPrivateIp } from '@/lib/client-ip';

export type GeoLookupResult = {
  ip: string;
  country: string | null;
  isVpn: boolean;
  isProxy: boolean;
  isTor: boolean;
  isHosting: boolean;
  isValid: boolean;
  provider: string;
  reason: string;
};

const CACHE = new Map<string, { expires: number; value: GeoLookupResult }>();
const CACHE_MS = 15 * 60 * 1000;

function allowedCountries() {
  const raw = runtimeEnv('COD_GEO_ALLOWED_COUNTRIES', 'SA,AE');
  return raw
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function geoStrict() {
  return runtimeEnv('COD_GEO_STRICT', 'true') !== 'false';
}

function cacheGet(ip: string) {
  const hit = CACHE.get(ip);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    CACHE.delete(ip);
    return null;
  }
  return hit.value;
}

function cacheSet(ip: string, value: GeoLookupResult) {
  CACHE.set(ip, { expires: Date.now() + CACHE_MS, value });
}

function finalizeLookup(
  ip: string,
  country: string | null,
  flags: { isVpn: boolean; isProxy: boolean; isTor: boolean; isHosting: boolean },
  provider: string,
  reason: string,
): GeoLookupResult {
  const allowed = allowedCountries();
  const countryOk = Boolean(country && allowed.includes(country));
  const networkOk = !flags.isVpn && !flags.isProxy && !flags.isTor && !flags.isHosting;
  const isValid = countryOk && networkOk;

  return {
    ip,
    country,
    isVpn: flags.isVpn,
    isProxy: flags.isProxy,
    isTor: flags.isTor,
    isHosting: flags.isHosting,
    isValid,
    provider,
    reason: isValid ? 'valid' : reason,
  };
}

async function lookupMaxMindCountry(ip: string) {
  const dbPath = runtimeEnv('MAXMIND_COUNTRY_DB_PATH');
  if (dbPath) {
    const reader = await Reader.open(dbPath);
    const result = reader.country(ip);
    return result.country?.isoCode ?? null;
  }

  const accountId = Number(runtimeEnv('MAXMIND_ACCOUNT_ID'));
  const licenseKey = runtimeEnv('MAXMIND_LICENSE_KEY');
  if (!accountId || !licenseKey) return null;

  const client = new WebServiceClient(String(accountId), licenseKey);
  const result = await client.country(ip);
  return result.country?.isoCode ?? null;
}

async function lookupMaxMindAnonymous(ip: string) {
  const dbPath = runtimeEnv('MAXMIND_ANON_DB_PATH');
  if (!dbPath) return null;

  try {
    const reader = await Reader.open(dbPath);
    const result = reader.anonymousIP(ip);
    return {
      isVpn: Boolean(result.isAnonymousVpn),
      isProxy: Boolean(result.isPublicProxy || result.isResidentialProxy),
      isTor: Boolean(result.isTorExitNode),
      isHosting: Boolean(result.isHostingProvider),
    };
  } catch {
    return null;
  }
}

async function lookupIpqs(ip: string) {
  const apiKey = runtimeEnv('IPQS_API_KEY') || runtimeEnv('VPN_DETECTOR_API_KEY');
  if (!apiKey) return null;

  const url = `https://ipqualityscore.com/api/json/ip/${encodeURIComponent(apiKey)}/${encodeURIComponent(ip)}?strictness=1&allow_public_access_points=true`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    success?: boolean;
    country_code?: string;
    proxy?: boolean;
    vpn?: boolean;
    tor?: boolean;
    active_vpn?: boolean;
    active_tor?: boolean;
    recent_abuse?: boolean;
    is_crawler?: boolean;
    hosting?: boolean;
  };

  if (!data.success) return null;

  return {
    country: data.country_code?.toUpperCase() ?? null,
    isVpn: Boolean(data.vpn || data.active_vpn),
    isProxy: Boolean(data.proxy),
    isTor: Boolean(data.tor || data.active_tor),
    isHosting: Boolean(data.hosting),
  };
}

export async function lookupGeo(ipRaw: string): Promise<GeoLookupResult> {
  const ip = ipRaw.trim();
  if (!ip) {
    return finalizeLookup(
      ip,
      null,
      { isVpn: false, isProxy: false, isTor: false, isHosting: false },
      'none',
      'missing_ip',
    );
  }

  const cached = cacheGet(ip);
  if (cached) return cached;

  if (isPrivateIp(ip)) {
    const dev = finalizeLookup(
      ip,
      null,
      { isVpn: false, isProxy: false, isTor: false, isHosting: false },
      'private',
      geoStrict() ? 'private_ip' : 'valid',
    );
    if (!geoStrict()) dev.isValid = true;
    cacheSet(ip, dev);
    return dev;
  }

  let country: string | null = null;
  let flags = { isVpn: false, isProxy: false, isTor: false, isHosting: false };
  const providers: string[] = [];

  try {
    const ipqs = await lookupIpqs(ip);
    if (ipqs) {
      providers.push('ipqs');
      country = ipqs.country;
      flags = {
        isVpn: ipqs.isVpn,
        isProxy: ipqs.isProxy,
        isTor: ipqs.isTor,
        isHosting: ipqs.isHosting,
      };
    }
  } catch {
    // optional provider
  }

  try {
    const mmCountry = await lookupMaxMindCountry(ip);
    if (mmCountry) {
      providers.push('maxmind');
      country = country || mmCountry;
    }
  } catch {
    // optional provider
  }

  try {
    const mmAnon = await lookupMaxMindAnonymous(ip);
    if (mmAnon) {
      providers.push('maxmind-anon');
      flags = {
        isVpn: flags.isVpn || mmAnon.isVpn,
        isProxy: flags.isProxy || mmAnon.isProxy,
        isTor: flags.isTor || mmAnon.isTor,
        isHosting: flags.isHosting || mmAnon.isHosting,
      };
    }
  } catch {
    // optional provider
  }

  let reason = 'valid';
  if (!country) reason = geoStrict() ? 'country_unknown' : 'valid';
  else if (!allowedCountries().includes(country)) reason = 'country_not_allowed';
  else if (flags.isVpn) reason = 'vpn';
  else if (flags.isProxy) reason = 'proxy';
  else if (flags.isTor) reason = 'tor';
  else if (flags.isHosting) reason = 'hosting';

  const result = finalizeLookup(ip, country, flags, providers.join('+') || 'none', reason);
  if (!geoStrict() && reason === 'country_unknown') result.isValid = true;

  cacheSet(ip, result);
  return result;
}
