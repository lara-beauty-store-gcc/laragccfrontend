'use client';

import { useEffect, useState } from 'react';
import { buildWhatsAppChatUrl } from '@/lib/whatsapp';

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppFloatingButton() {
  const href = buildWhatsAppChatUrl();
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    const show = window.setTimeout(() => setHintVisible(true), 1200);
    const hide = window.setTimeout(() => setHintVisible(false), 9000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed z-[90] flex flex-col items-end gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] pe-[max(1rem,env(safe-area-inset-right))] bottom-4 end-4 sm:bottom-6 sm:end-6"
      dir="ltr"
    >
      <div
        className={`pointer-events-auto origin-bottom-right transition-all duration-500 ease-out ${
          hintVisible
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-2 scale-95 opacity-0'
        }`}
        aria-hidden={!hintVisible}
      >
        <div className="relative max-w-[min(17rem,calc(100vw-5.5rem))] rounded-2xl border border-white/20 bg-[#0f1f18]/95 px-4 py-3 text-right shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <p className="font-arabic text-[13px] font-bold leading-snug text-white" dir="rtl">
            محتاجة مساعدة؟
          </p>
          <p className="mt-0.5 font-arabic text-[11px] leading-relaxed text-white/75" dir="rtl">
            ردي على واتساب — فريق لارا يرد عليك بسرعة
          </p>
          <span
            className="absolute -bottom-1.5 end-6 h-3 w-3 rotate-45 border-b border-e border-white/20 bg-[#0f1f18]/95"
            aria-hidden
          />
        </div>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab pointer-events-auto group relative flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-105 hover:shadow-[0_12px_36px_rgba(37,211,102,0.55)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:h-16 sm:w-16"
        aria-label="تواصل معنا عبر واتساب"
      >
        <span className="whatsapp-fab-ping absolute inset-0 rounded-full bg-[#25D366]" aria-hidden />
        <span
          className="absolute inset-0 rounded-full ring-2 ring-[#25D366]/30 ring-offset-2 ring-offset-background transition group-hover:ring-[#25D366]/50"
          aria-hidden
        />
        <WhatsAppGlyph className="relative z-[1] h-8 w-8 sm:h-9 sm:w-9" />
      </a>
    </div>
  );
}
