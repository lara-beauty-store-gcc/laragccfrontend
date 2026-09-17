import { createHash } from 'crypto';
import { runtimeEnv } from '@/lib/runtime-env';

export type SnapCapiPayload = {
  orderId: string;
  value: number;
  currency: string;
  phone?: string;
  sourceUrl?: string;
  contentIds?: string[];
  eventId?: string;
};

export type SnapCapiContext = {
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
  if (event === 'Purchase') return 'PURCHASE';
  if (event === 'Lead') return 'START_CHECKOUT';
  if (event === 'AddToCart') return 'ADD_CART';
  if (event === 'ViewContent') return 'VIEW_CONTENT';
  return event.toUpperCase();
}

export async function sendSnapEvent(
  event: string,
  payload: SnapCapiPayload,
  ctx: SnapCapiContext = {},
) {
  const accessToken = runtimeEnv('SNAP_ACCESS_TOKEN');
  const pixelId = runtimeEnv('SNAP_PIXEL_ID', '998e0cce-14e8-4cfb-b55e-e7eea8fe5f25');
  const testEventCode = runtimeEnv('SNAP_TEST_EVENT_CODE');

  if (!accessToken) {
    return { ok: false as const, skipped: true as const, reason: 'missing_token' };
  }

  const eventName = mapEventName(event);
  const eventId = payload.eventId || `purchase_${payload.orderId}`;
  const contentIds = (payload.contentIds ?? []).filter(Boolean);

  const userData: Record<string, string | string[]> = {};

  if (payload.phone) {
    const hashedPhone = hashPhone(payload.phone);
    if (hashedPhone) userData.ph = [hashedPhone];
  }
  if (payload.orderId) userData.external_id = [sha256(payload.orderId)];
  if (ctx.ip) userData.client_ip_address = ctx.ip;
  if (ctx.userAgent) userData.client_user_agent = ctx.userAgent;

  const customData: Record<string, unknown> = {
    currency: payload.currency,
    value: payload.value,
    content_type: 'product',
  };

  if (contentIds.length) customData.content_ids = contentIds;
  if (eventName === 'PURCHASE') customData.order_id = payload.orderId;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'WEB',
        event_source_url: payload.sourceUrl,
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  if (testEventCode) body.test_event_code = testEventCode;

  const url = `https://tr.snapchat.com/v3/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(4000),
    });

    const data = (await res.json().catch(() => ({}))) as {
      status?: string;
      reason?: string;
      error?: string;
    };

    const ok = res.ok && data.status !== 'FAILED';
    return {
      ok,
      status: res.status,
      reason: ok ? undefined : data.reason || data.error || `http_${res.status}`,
    };
  } catch (err) {
    return {
      ok: false as const,
      reason: err instanceof Error ? err.message : 'network_error',
    };
  }
}
