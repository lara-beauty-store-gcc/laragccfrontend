/** Same format as api.larabeauty.store backend orders */
export function generateLaraOrderId(): string {
  return `LARA-${Date.now().toString(36).toUpperCase()}`;
}

export function generateLaraOrderIds(count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [generateLaraOrderId()];

  const base = Date.now().toString(36).toUpperCase();
  return Array.from({ length: count }, (_, index) =>
    index === 0 ? `LARA-${base}` : `LARA-${base}-${index + 1}`,
  );
}

export function expandOrderIds(orderIds: string[], count: number): string[] {
  if (count <= 0) return [];
  if (orderIds.length === count) return orderIds.map(String);

  const primary = String(orderIds[0] || generateLaraOrderId());
  if (count === 1) return [primary];

  return Array.from({ length: count }, (_, index) =>
    index === 0 ? primary : `${primary}-${index + 1}`,
  );
}
