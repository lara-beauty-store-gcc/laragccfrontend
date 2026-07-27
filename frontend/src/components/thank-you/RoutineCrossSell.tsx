'use client';

import { useState } from 'react';
import type { LastOrder } from '@/lib/order-session';
import { RoutineCrossSellPanel } from '@/components/cross-sell/RoutineCrossSellPanel';
import { getCrossSellProducts } from '@/lib/cross-sell';

export function RoutineCrossSell({ order }: { order: LastOrder }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || getCrossSellProducts(order).length === 0) return null;

  return (
    <RoutineCrossSellPanel
      order={order}
      variant="thankyou"
      onSkip={() => setDismissed(true)}
      skipLabel="لا شكراً — أكملي التأكيد"
    />
  );
}
