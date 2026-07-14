# Product images — sizes (موحّدة)

كل الصور **WebP**. التزمي بالمقاسات باش ما يتقصّو بزاف فالموقع.

| الملف | المقاس | أين تبان |
|--------|--------|----------|
| `{slug}/hero.webp` | **1200×1200** (1:1) | أعلى صفحة المنتج — before/after |
| `{slug}/problem.webp` | **960×1200** (4:5) | قسم المشكلة |
| `{slug}/ingredients.webp` | **960×1200** (4:5) | قسم المكوّنات |
| `{slug}.webp` | **1000×1000** (1:1) | بطاقة Homepage |
| `home-hero.webp` | **1200×800** (3:2) | Hero الرئيسية |

## مجلدات

```
products/
├── magnesium-sleep.webp
├── magnesium-sleep/
│   ├── hero.webp
│   ├── problem.webp
│   └── ingredients.webp
├── epimedium-energy.webp
├── epimedium-energy/
├── focus-clarity.webp
├── focus-clarity/
└── home-hero.webp
```

**مهم:** `hero.webp` ما يتكرّرش تحت — غير فوق. Homepage card منفصل عن `hero.webp`.
