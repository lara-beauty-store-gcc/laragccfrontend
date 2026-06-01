# 02 — ICP & Copy Guidelines

## Ideal customer profile (Kuwait)

### Primary segments

| Segment | Age | Pain | Desire | Hook |
|---------|-----|------|--------|------|
| Working woman | 25–45 | Stress, poor sleep, fatigue | Calm nights, glow, energy for family/work | "نومك يستاهل أكثر" |
| Working man | 28–50 | Long hours, brain fog, tired afternoons | Focus + stamina without coffee crash | "تركيز بدون تعب" |
| Student / young pro | 18–28 | Distraction, exam stress | Study focus, routine | "قبل الامتحانات والشغل" |
| Health-conscious mom | 30–42 | Tired, multi-tasking | Natural support, safe ingredients | "من غير حبوب قاسية" |

### What Kuwaiti buyers trust

1. **COD** — "ما تدفعين إلا لما يوصل"
2. **Local phone / WhatsApp feel** — valid +965 number
3. **Real reviews** — Kuwaiti names, realistic photos (UGC style)
4. **Clear price in KWD** — no hidden shipping in v1 (bundle includes "شحن مجاني" in copy if true)
5. **Ingredient lists** — Arabic + scientific names
6. **Delivery speed claim** — only if ops can deliver (default: "توصيل لجميع مناطق الكويت")
7. **Return/refund policy** — stated clearly (see legal doc)

### Emotional copy framework (PAS + Proof)

For every major section:

1. **Problem** (pain in Gulf dialect) — "تتقلبين بالسرير والخاطر موقف؟"
2. **Agitate** — "وتصيرين تعبانة من الصبح بدون طاقة"
3. **Solution** — product as gentle daily ritual
4. **Proof** — stars, reviews, numbers, ingredients
5. **Action** — bundle CTA with scarcity

### Dialect notes (Gulf / Kuwait-friendly)

Prefer:
- "وايد" / "مرة" (very) sparingly
- "يستاهل"، "ذوق"، "عبالك"، "شلون"
- "دزّي طلبك" instead of formal "أرسلي"

Avoid:
- Heavy MSA that sounds like government ad
- Egyptian/Levantine slang (مش، ليش، كتير)
- Overly masculine tone for unisex products

### Phone validation (IMPORTANT)

**Primary market is Kuwait → validate `+965` numbers.**

User mentioned "KSA numbers" once; **do not use Saudi validation for v1** unless product owner explicitly expands to KSA. Implement:

| Rule | Detail |
|------|--------|
| Country | Kuwait `+965` |
| Local length | 8 digits after country code |
| Valid prefixes | `5`, `6`, `9` (mobile) |
| Normalized storage | `965XXXXXXXX` (digits only, no `+` in DB) |
| Display | `+965 XXXX XXXX` |

**TikTok CAPI:** hash E.164 with `+` before hash: `+96551234567`  
**Meta CAPI:** hash digits only with country code: `96551234567` (no `+`, no leading zero on local part)

See [13-TRACKING-PIXELS-CAPI.md](./13-TRACKING-PIXELS-CAPI.md).

### Trust words bank

- معتمد · موثوق · آلاف العملاء · تقييم 4.9 · مكونات مختارة · صنع بمعايير جودة · دفع عند الاستلام

### Science without overclaiming

Template: "**[مكون]** يساعد على **[فائدة]** — وهذا اللي يخلي **[نتيجة يومية]** أسهل."

Example: "المغنيسيوم يساعد على استرخاء العضلات والجهاز العصبي — عشان تنامين أسرع وتصحين أخف."
