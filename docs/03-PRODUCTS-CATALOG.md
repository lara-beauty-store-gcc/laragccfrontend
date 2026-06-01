# 03 — Products Catalog

## Bundle pricing (all products — same structure)

| Bundle ID | Pieces | Price (KWD) | Per-unit | Savings vs 1×3 |
|-----------|--------|-------------|----------|------------------|
| `bundle_1` | 1 | **16** | 16.00 | — |
| `bundle_2` | 2 | **23** | 11.50 | Save 25 vs 48 |
| `bundle_3` | 3 | **29** | 9.67 | Save 19 vs 48 |

**Default selected bundle on PDP:** `bundle_2` (best balance for AOV).

**Upsell (checkout popup only):** any single unit add-on at **9 KWD** (discounted — only place discount exists).

---

## Product 1 — Magnesium sleep gummies

| Field | Value |
|-------|--------|
| Arabic name | علكات المغنيسيوم لتحسين جودة النوم |
| English slug | `magnesium-sleep-gummies` |
| SKU base | `LARA-MAG` |
| Category | النوم والاسترخاء |
| Primary benefit | Sleep quality, fall asleep easier, wake refreshed |
| Cross-sell priority | Product 2 (energy), then Product 3 (focus) |

### Ingredient story (copy — verify with supplier label)

- Magnesium (citrate/glycinate — use label truth)
- Optional: L-theanine, chamomile — **only if on label**

### Sample image paths

- `/images/sample/magnesium-hero.jpg`
- `/images/sample/magnesium-2.jpg`
- `/images/sample/magnesium-3.jpg`
- `/images/sample/magnesium-lifestyle.jpg`

---

## Product 2 — Horny goat weed / energy gummies

| Field | Value |
|-------|--------|
| Arabic name | علكات عشبة العنزة ضد الإرهاق والتعب |
| English slug | `energy-anti-fatigue-gummies` |
| SKU base | `LARA-ENG` |
| Category | الطاقة والحيوية |
| Primary benefit | Fight fatigue, daily stamina, less afternoon crash |
| Cross-sell priority | Product 3 (focus), then Product 1 (sleep) |

### Ingredient story

- Horny goat weed (عشبة العنزة) — traditional vitality narrative
- B-vitamins / ginseng — **if on label only**

### Sample images

- `/images/sample/energy-hero.jpg` (+ 3 more)

---

## Product 3 — Focus gummies

| Field | Value |
|-------|--------|
| Arabic name | علكات ضد التشتت وضعف التركيز |
| English slug | `focus-concentration-gummies` |
| SKU base | `LARA-FOC` |
| Category | التركيز والإنتاجية |
| Primary benefit | Concentration, mental clarity, less distraction |
| Cross-sell priority | Product 1 (sleep), then Product 2 (energy) |

### Sample images

- `/images/sample/focus-hero.jpg` (+ 3 more)

---

## Cross-sell matrix

When product X is in cart, suggest Y in **cart drawer** and **checkout upsell modal**:

| In cart | Cross-sell 1 | Cross-sell 2 |
|---------|--------------|--------------|
| Magnesium | Energy | Focus |
| Energy | Focus | Magnesium |
| Focus | Magnesium | Energy |

Upsell modal (10–15s): show **highest-priority cross-sell not already in order** at **9 KWD**.

---

## Product card (collection / homepage)

Each card includes:

- Sample product image
- Star row (4.8–4.9) + review count placeholder
- **Headline** (benefit-led, 6–8 words AR)
- **Subhead** (one line pain → solution)
- Badge: "الأكثر مبيعاً" on best seller (Magnesium default)
- Mini bundle hint: "من 16 د.ك — وفّري مع الباقة"
- CTA: "اشتري الآن" → PDP

---

## JSON seed shape (for backend)

```json
{
  "slug": "magnesium-sleep-gummies",
  "name_ar": "علكات المغنيسيوم لتحسين جودة النوم",
  "name_en": "Magnesium Sleep Gummies",
  "sku_base": "LARA-MAG",
  "category_ar": "النوم والاسترخاء",
  "bundles": [
    { "id": "bundle_1", "qty": 1, "price_kwd": 16 },
    { "id": "bundle_2", "qty": 2, "price_kwd": 23 },
    { "id": "bundle_3", "qty": 3, "price_kwd": 29 }
  ],
  "upsell_eligible": true,
  "sort_order": 1
}
```
