import type { ProductConfig } from '@/config/products';
import { getProductBySlug, getLowestOfferPrice, products } from '@/config/products';
import type { LastOrder } from '@/lib/order-session';

/** Products the customer did NOT buy — for post-purchase cross-sell (not same-product upsell). */
export function getCrossSellProducts(order: LastOrder, limit = 2): ProductConfig[] {
  const purchasedSkus = new Set(order.items.map((i) => i.sku));
  const current = order.productSlug ? getProductBySlug(order.productSlug) : undefined;

  if (current?.relatedSlugs?.length) {
    const related = current.relatedSlugs
      .map((slug) => getProductBySlug(slug))
      .filter((p): p is ProductConfig => !!p && !purchasedSkus.has(p.sku));
    if (related.length) return related.slice(0, limit);
  }

  return products.filter((p) => !purchasedSkus.has(p.sku)).slice(0, limit);
}

export function crossSellPrice(product: ProductConfig): number {
  return getLowestOfferPrice(product);
}

export function buildWhatsAppAddOnUrl(
  order: LastOrder,
  product: ProductConfig,
  whatsappNumber: string,
): string {
  const price = crossSellPrice(product);
  const lines = [
    `مرحباً ${order.customerName.split(' ')[0]} 👋`,
    `أريد إضافة منتج لطلبي رقم: ${order.orderId}`,
    '',
    `➕ ${product.shortName}`,
    product.cardHeadline,
    `💰 يبدأ من ${price} ${order.currency}`,
    '',
    'نأكد العنوان والكمية مع الطلب الحالي.',
    'شكراً — لارا للجمال',
  ];

  const digits = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join('\n'))}`;
}
