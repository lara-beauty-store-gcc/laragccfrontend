import { readFileSync } from 'fs';
import path from 'path';
import { sheetsDefaults } from '@/config/sheets';

type RuntimeEnvFile = Record<string, string | undefined>;

let cachedFile: RuntimeEnvFile | null | undefined;

function readRuntimeEnvFile(): RuntimeEnvFile {
  if (cachedFile !== undefined) return cachedFile ?? {};

  const dataDir = process.env.ORDERS_DATA_DIR || path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'runtime.env.json');

  try {
    cachedFile = JSON.parse(readFileSync(filePath, 'utf8')) as RuntimeEnvFile;
  } catch {
    cachedFile = {};
  }

  return cachedFile ?? {};
}

/** Read server env at runtime — avoids Next.js build-time inlining of empty values. */
export function runtimeEnv(name: string, fallback = ''): string {
  const fromProcess = process.env[name];
  if (fromProcess) return fromProcess;

  const fromFile = readRuntimeEnvFile()[name];
  if (fromFile) return fromFile;

  return fallback;
}

export function sheetsWebhookUrl(): string {
  return (
    runtimeEnv('GOOGLE_SHEETS_WEBHOOK_URL') ||
    runtimeEnv('ORDERS_SHEETS_WEBHOOK_URL') ||
    sheetsDefaults.webhookUrl
  );
}

export function sheetsWebhookSecret(): string {
  return runtimeEnv('SHEETS_WEBHOOK_SECRET');
}

export function apiBaseUrl(): string {
  return runtimeEnv('NEXT_PUBLIC_API_URL', 'https://api.larabeauty.store');
}
