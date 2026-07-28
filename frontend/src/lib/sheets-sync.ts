import {
  listUnsyncedOrderBatches,
  markOrdersSynced,
  type UnsyncedOrderBatch,
} from '@/lib/order-store';
import { forwardOrderToSheets } from '@/lib/sheets-webhook';

export async function syncUnsyncedOrdersToSheets() {
  const batches = await listUnsyncedOrderBatches();
  const results: Array<{
    key: string;
    orderIds: string[];
    ok: boolean;
    reason?: string;
    detail?: string;
  }> = [];

  for (const batch of batches) {
    const result = await syncBatchToSheets(batch);
    results.push({
      key: batch.key,
      orderIds: batch.orderIds,
      ok: result.ok,
      reason: result.ok ? undefined : result.reason,
      detail: result.ok ? undefined : result.detail,
    });
  }

  const synced = results.filter((row) => row.ok).length;
  const failed = results.length - synced;

  return {
    batches: batches.length,
    synced,
    failed,
    results,
  };
}

async function syncBatchToSheets(batch: UnsyncedOrderBatch) {
  const result = await forwardOrderToSheets({
    customerName: batch.customerName,
    phone: batch.phone,
    country: batch.country,
    currency: batch.currency,
    area: batch.area,
    sourceUrl: batch.sourceUrl,
    items: batch.items,
    orderIds: batch.orderIds,
    date: batch.createdAt,
  });

  if (result.ok) {
    await markOrdersSynced(batch.orderIds);
  }

  return result;
}
