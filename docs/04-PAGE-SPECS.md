# 04 — Page Specifications

## Global layout

### Header (sticky)

- RTL: logo + لارا للجمال / Lara Beauty (left in RTL = start)
- Nav links: الرئيسية · المجموعة · من نحن · تواصل
- Cart icon + count badge
- Mobile: hamburger → drawer with same links

### Footer

Columns:
1. **لارا للجمال** + short trust paragraph + social icons (placeholders)
2. **تسوق:** المجموعة + 3 product links
3. **الدعم:** تواصل · سياسة الاستبدال · الشحن والتوصيل · الخصوصية
4. **تواصل:** WhatsApp placeholder, email placeholder
- Payment badge row: **الدفع عند الاستلام فقط**
- Copyright © Lara Beauty

---

## Home (`/`)

**Goal:** Brand authority + route to 3 heroes + emotional connection.

| Order | Section | Layout | Notes |
|-------|---------|--------|-------|
| 1 | Hero | Image left / text right (desktop) | Headline + sub + CTA "تسوق المجموعة" + trust strip (COD, توصيل الكويت, تقييمات) |
| 2 | As seen / social proof bar | Logos or stat chips | "+٣٠٠٠ طلب" — update when real |
| 3 | Three product cards | 3-col grid | Use catalog card spec |
| 4 | Why Lara | Alternating rows | 3 pillars from positioning |
| 5 | How it works | 3 steps | اختاري · ادفعي عند الاستلام · استمتعي بالنتيجة |
| 6 | Testimonials | Carousel | 6 UGC-style quotes (AR) |
| 7 | Ingredients philosophy | Center | "شفافية المكونات" |
| 8 | FAQ accordion | | Sleep, COD, delivery, usage |
| 9 | Final CTA band | | Link to collection |

---

## Collection (`/collection`)

- Hero mini: "مجموعة لارا للجمال"
- Filter chips (optional v1): الكل · نوم · طاقة · تركيز
- 3 product cards (full spec)
- Trust band before footer
- Sample banner image: `/images/sample/collection-banner.jpg`

---

## Product PDP (`/products/[slug]`)

**Goal:** Max CRO — long-form sales page.

### Above the fold

- Gallery (main + thumbs) — sample images
- Title AR
- Stars + `(١٢٤) تقييم`
- Short benefit bullets (3)
- **Bundle selector** (radio cards): 1 / 2 / 3 pieces with prices — highlight "الأوفر"
- Scarcity: "باقي ١٤ علبة بهالسعر اليوم"
- Primary CTA: **أضيف للسلة وافتح السلة** → adds selected bundle, opens cart drawer

### Below fold sections (alternate image/text)

| # | Section | Image position |
|---|---------|----------------|
| 1 | المشكلة التي نحلها | Image left |
| 2 | كيف تعمل | Image right |
| 3 | المكونات والعلم | Image left |
| 4 | لمن هذا المنتج؟ | Image right |
| 5 | طريقة الاستخدام | Image left |
| 6 | النتائج المتوقعة (timeline) | Image right |
| 7 | مقارنة: قبل / بعد نمط الحياة | Image left |
| 8 | تقييمات العملاء | Grid |
| 9 | أسئلة شائعة | |
| 10 | عرض الباقات (repeat selector + CTA) | |
| 11 | Sticky mobile CTA bar | bottom fixed |

Use product-specific copy from [18-COPY-BANK.md](./18-COPY-BANK.md).

---

## About (`/about`)

- Brand story (Kuwait, mission, quality)
- Team/founder placeholder
- Values: الجودة · الشفافية · خدمة العملاء
- Certifications row (placeholder icons — replace when user provides)
- CTA to collection

---

## Contact (`/contact`)

- Short intro AR
- Form: الاسم، رقم الهاتف (+965)، الرسالة (optional)
- Or click-to-call / WhatsApp button
- Store hours placeholder
- **No order placement on contact form**

---

## Thank you (`/thank-you?order=...`)

- Order number
- Summary lines
- "راح نتصل فيك لتأكيد الطلب" (COD confirmation messaging)
- Cross-sell soft links (no hard checkout)
- Fire **Purchase** pixel once (deduped)

---

## 404 / legal pages

- `/privacy`, `/shipping`, `/returns` — content from [19-LEGAL-TRUST-PAGES.md](./19-LEGAL-TRUST-PAGES.md)

---

## Responsive rules

- Mobile: single column; sticky CTA on PDP
- Desktop: max-width container `1280px`; alternating sections
- Images: `next/image` with blur placeholder; sample SVG/gradient OK until photos ready
