# 06 — Design System

## Brand colors (chosen — place logo beside primary on header)

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-primary` | **#6B3F4A** | Headers, key text accents — deep rose mauve (premium, feminine) |
| `--color-primary-light` | **#8F5A66** | Hover states |
| `--color-accent-gold` | **#C9A227** | Stars, badges, premium highlights |
| `--color-cta` | **#2D6A4F** | Primary buttons — trust/growth green |
| `--color-cta-hover` | **#1B4332** | CTA hover |
| `--color-background` | **#FBF7F4** | Page background — warm cream |
| `--color-surface` | **#FFFFFF** | Cards, drawers |
| `--color-text` | **#1C1917** | Body text |
| `--color-text-muted` | **#78716C** | Secondary text |
| `--color-border` | **#E7E5E4** | Dividers |
| `--color-urgency` | **#B45309** | Scarcity badges |
| `--color-error` | **#DC2626** | Form errors |

### Tailwind extension (`tailwind.config.ts`)

```ts
colors: {
  lara: {
    primary: '#6B3F4A',
    'primary-light': '#8F5A66',
    gold: '#C9A227',
    cta: '#2D6A4F',
    'cta-hover': '#1B4332',
    cream: '#FBF7F4',
    urgency: '#B45309',
  },
}
```

## Typography

| Role | Font | Notes |
|------|------|-------|
| Arabic | **Tajawal** or **IBM Plex Sans Arabic** | Google Fonts, `font-arabic` |
| English | **Inter** | Subbrand, numbers |
| Scale | `text-base` body, `text-3xl`/`4xl` heroes | Mobile-first |

## Logo area (header)

```
┌─────────────────────────────────────────────┐
│  [64×64 logo slot]  لارا للجمال              │
│                     Lara Beauty    قائمة  🛒 │
└─────────────────────────────────────────────┘
```

User replaces `[logo slot]` — keep min height 56px.

## Components (shadcn)

- `Button` variants: `default` (cta), `outline`, `ghost`
- `Sheet` — cart drawer (RTL from left)
- `Dialog` — checkout popup
- `RadioGroup` — bundle selector
- `Input` — name, phone with `dir="ltr"` for phone field
- `Badge` — scarcity, "الأوفر"
- `Accordion` — FAQ
- `Card` — product, cross-sell

## Spacing & radius

- Section padding: `py-16 md:py-24`
- Card radius: `rounded-2xl`
- Button radius: `rounded-full` for primary CTAs (soft premium feel)

## Imagery (placeholders)

Until real photos:

- Use gradient placeholders with product name in AR
- Path: `frontend/public/images/sample/{slug}-{n}.jpg`
- Generate simple 1200×1200 JPG or WebP with brand colors + product title

## RTL

- `dir="rtl"` on `<html lang="ar">`
- Logical properties: `ms-`, `me-`, `ps-`, `pe-`
- Icons: mirror chevrons where needed
- Phone input: LTR inside field

## Motion

- Subtle `framer-motion` on section fade-in (respect `prefers-reduced-motion`)
- Cart drawer slide
- Upsell countdown progress bar

## Accessibility

- Contrast ratio ≥ 4.5:1 on body text
- Focus rings on all interactive elements
- `aria-label` on cart icon in Arabic
