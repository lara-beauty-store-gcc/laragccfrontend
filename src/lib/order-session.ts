export type LastOrderItem = {
  sku: string;
  name: string;
  slug?: string;
  qty: number;
  price: number;
  offerId?: string;
};

export type LastOrder = {
  orderId: string;
  orderIds?: string[];
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

export function buildWhatsAppSupportUrl(order: LastOrder, whatsappNumber: string): string {
  const orderRef = (order.orderIds?.length ? order.orderIds : [order.orderId]).join(' · ');
  const lines = [
    `مرحباً ${order.customerName} 👋`,
    `عندي استفسار عن طلبي رقم: ${orderRef}`,
    '',
    'شكراً — لارا للجمال',
  ];

  const text = encodeURIComponent(lines.join('\n'));
  const digits = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${text}`;
}

/** @deprecated use buildWhatsAppSupportUrl */
export const buildWhatsAppConfirmUrl = buildWhatsAppSupportUrl;
