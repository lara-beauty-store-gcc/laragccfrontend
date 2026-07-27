export type LastOrderItem = {
  sku: string;
  name: string;
  qty: number;
  price: number;
  offerId?: string;
};

export type LastOrder = {
  orderId: string;
  customerName: string;
  phone: string;
  area?: string;
  productSlug?: string;
  items: LastOrderItem[];
  total: number;
  currency: string;
  paymentMethod: string;
  upsellShown?: boolean;
};

const STORAGE_KEY = 'lara-last-order';

export function saveLastOrder(order: LastOrder) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function getLastOrder(): LastOrder | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastOrder;
  } catch {
    return null;
  }
}

export function buildWhatsAppConfirmUrl(order: LastOrder, whatsappNumber: string): string {
  const lines = [
    `مرحباً ${order.customerName} 👋`,
    `أريد تأكيد طلبي رقم: ${order.orderId}`,
    '',
    '📦 الطلب:',
    ...order.items.map((i) => `• ${i.name} × ${i.qty} — ${i.price * i.qty} ${order.currency}`),
    '',
    `💰 المجموع: ${order.total} ${order.currency}`,
    order.area ? `📍 المنطقة: ${order.area}` : '',
    `📱 الجوال: ${order.phone}`,
    '',
    'شكراً — لارا للجمال',
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join('\n'));
  const digits = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${text}`;
}
