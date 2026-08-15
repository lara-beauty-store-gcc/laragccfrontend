import { createHash } from 'crypto';
import { runtimeEnv } from '@/lib/runtime-env';

export type TiktokCapiPayload = {
  orderId: string;
  value: number;
  currency: string;
  phone?: string;
  sourceUrl?: string;
  contentIds?: string[];
  eventId?: string;
};

export type TiktokCapiContext = {
  ip?: string;
  userAgent?: string;
};

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function hashPhone(e164: string) {
  const digits = e164.replace(/\D/g, '');
  return digits ? sha256(digits) : '';
}

function mapEventName(event: string) {
  if (event === 'Purchase') return 'CompletePayment';
  if (event === 'Lead') return 'SubmitForm';
  return event;
}

export async function sendTiktokEvent(
  event: string,
  payload: TiktokCapiPayload,
  ctx: TiktokCapiContext = {},
) {
  const accessToken = runtimeEnv('TIKTOK_ACCESS_TOKEN');
  const pixelId = runtimeEnv('TIKTOK_PIXEL_ID', 'D9V4EIJC77U9RA6QKBL0');

  if (!accessToken) {
    return { ok: false as const, skipped: true as const, reason: 'missing_token' };
  }

  const user: Record<string, string> = {};
  if (payload.phone) {
    const hashedPhone = hashPhone(payload.phone);
    if (hashedPhone) user.phone = hashedPhone;
  }
  if (ctx.ip) user.ip = ctx.ip;
  if (ctx.userAgent) user.user_agent = ctx.userAgent;

  const contents = (payload.contentIds ?? [])
    .filter(Boolean)
    .map((contentId) => ({
      content_id: contentId,
      content_type: 'product',
    }));

  const body = {
    event_source: 'web',
    event_source_id: pixelId,
    data: [
      {
        event: mapEventName(event),
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId || `purchase_${payload.orderId}`,
        user,
        properties: {
          contents,
          content_type: 'product',
          currency: payload.currency,
          value: payload.value,
          order_id: payload.orderId,
        },
        page: payload.sourceUrl ? { url: payload.sourceUrl } : undefined,
      },
    ],
  };

  try {
    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    const data = (await res.json().catch(() => ({}))) as { code?: number; message?: string };
    const ok = res.ok && data.code === 0;
    return {
      ok,
      status: res.status,
      reason: ok ? undefined : data.message || `http_${res.status}`,
    };
  } catch (err) {
    return {
      ok: false as const,
      reason: err instanceof Error ? err.message : 'network_error',
    };
  }
}
