import type Stripe from 'stripe';

export type ParsedStripeItem = {
  sku: string;
  name: string;
  slug: string;
  quantity: number;
  lineTotalAed: number;
};

export function parseStripeItems(metadata: Stripe.Metadata): ParsedStripeItem[] {
  try {
    const raw = metadata.itemsJson;
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ParsedStripeItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
