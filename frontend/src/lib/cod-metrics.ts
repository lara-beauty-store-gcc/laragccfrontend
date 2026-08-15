import { listClickEvents } from '@/lib/click-store';
import { listOrderBatches, listOrders } from '@/lib/order-store';

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function parseRange(from?: string | null, to?: string | null) {
  return {
    from: from || undefined,
    to: to || undefined,
  };
}

export async function buildCodMetrics(query: { from?: string | null; to?: string | null; slug?: string | null }) {
  const range = parseRange(query.from, query.to);
  const slug = query.slug?.trim().toLowerCase() || undefined;

  const [clicks, orders, batches] = await Promise.all([
    listClickEvents({ ...range, slug, validOnly: true }),
    listOrders({ ...range, slug }),
    listOrderBatches({ ...range, slug }),
  ]);

  const revenue = batches.reduce((sum, batch) => sum + batch.totalPrice, 0);
  const validClicks = clicks.length;
  const orderCount = batches.length;
  const conversionRate = validClicks > 0 ? (orderCount / validClicks) * 100 : 0;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  const byDayMap = new Map<string, { date: string; clicks: number; orders: number; revenue: number }>();

  for (const click of clicks) {
    const key = dayKey(click.createdAt);
    const row = byDayMap.get(key) || { date: key, clicks: 0, orders: 0, revenue: 0 };
    row.clicks += 1;
    byDayMap.set(key, row);
  }

  for (const batch of batches) {
    const key = dayKey(batch.createdAt);
    const row = byDayMap.get(key) || { date: key, clicks: 0, orders: 0, revenue: 0 };
    row.orders += 1;
    row.revenue += batch.totalPrice;
    byDayMap.set(key, row);
  }

  const byDay = Array.from(byDayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const clicksBySlug = new Map<string, number>();
  for (const click of clicks) {
    clicksBySlug.set(click.slug, (clicksBySlug.get(click.slug) || 0) + 1);
  }

  const ordersBySlug = new Map<string, number>();
  for (const batch of batches) {
    const key = batch.redirectSlug || 'direct';
    ordersBySlug.set(key, (ordersBySlug.get(key) || 0) + 1);
  }

  const topSlugs = Array.from(
    new Set([...Array.from(clicksBySlug.keys()), ...Array.from(ordersBySlug.keys())]),
  )
    .map((item) => ({
      slug: item,
      clicks: clicksBySlug.get(item) || 0,
      orders: ordersBySlug.get(item) || 0,
      conversionRate:
        (clicksBySlug.get(item) || 0) > 0
          ? ((ordersBySlug.get(item) || 0) / (clicksBySlug.get(item) || 1)) * 100
          : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    range,
    slug: slug || null,
    totals: {
      validClicks,
      orders: orderCount,
      revenue,
      conversionRate: Math.round(conversionRate * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      lineItems: orders.length,
    },
    byDay,
    topSlugs,
  };
}
