'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'lara_landing_url';

export function LandingUrlTracker() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/r/') || path.startsWith('/redirectkiller')) return;
    sessionStorage.setItem(STORAGE_KEY, window.location.href);
  }, []);

  return null;
}

export function getStoredLandingUrl() {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(STORAGE_KEY) || window.location.href;
}
