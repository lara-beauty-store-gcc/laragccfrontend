# 05 — CRO & Conversion Playbook

## North star

**AOV 29 KWD** with **bundle_3** as aspirational default; accept **bundle_2** as workhorse.

## Pricing psychology (KWD)

| Tactic | Implementation |
|--------|----------------|
| Anchor high | Show "سعر القطعة 16 د.ك" then bundle savings |
| Decoy effect | Middle bundle "الأكثر اختياراً" badge on 2-pack |
| Bundle 3 value | "9.67 د.ك للعلكة" — only in 3-pack |
| No sitewide discounts | Except **9 KWD upsell** in checkout |
| COD zero risk | Repeat in header, cart, checkout popup |

## Scarcity & urgency (ethical)

Use **soft scarcity** — believable for DTC:

- "باقي X علبة" — X from env or static 8–23 random per session OK for v1; better: admin setting
- "العرض ينتهي الليلة" with date tied to Kuwait timezone `Asia/Kuwait`
- Stock bar visual (optional)

## Social proof layers

1. Star rating near title (4.8–4.9)
2. Review count
3. "X شخص شاهد هذا المنتج اليوم" (optional, session-based)
4. Testimonial cards with Kuwaiti first names
5. UGC-style image grid ("عملاؤنا")
6. Order notification toast (optional): "فاطمة من السالمية طلبت منذ 12 دقيقة"

## Authority stack (every PDP)

- Ingredient panel with icons
- "مكمل غذائي — ليس بديلاً عن العلاج" disclaimer
- Manufacturing quality line (no fake FDA logos)
- How to use + who should avoid (pregnant/nursing → consult doctor)

## Cart drawer CRO

| Element | Purpose |
|---------|---------|
| Line items with bundle breakdown | Clarity |
| Progress hint | "أضيفي قطعة ثانية ووفّري!" if qty=1 |
| Cross-sell cards | 2 products not in cart, one-click add |
| Subtotal + "شامل التوصيل" if applicable | |
| Primary CTA | **إتمام الطلب** → checkout popup |
| Secondary | مواصلة التسوق |

## Checkout popup CRO

| Element | Purpose |
|---------|---------|
| Order summary | Items, bundles, upsell if added |
| Trust row | COD · توصيل سريع · دعم واتساب |
| Scarcity line | "احجزي طلبك قبل نفاد الكمية" |
| Form | name + Kuwait phone only |
| Submit CTA | "تأكيد الطلب بالدفع عند الاستلام" |

## Post-submit upsell (10–15 seconds)

- Full-screen or modal overlay **after** valid form
- Timer 15s countdown
- One product: cross-sell SKU at **9 KWD**
- Buttons: **نعم أضيف بـ 9 د.ك** | **لا شكراً، أكمل طلبي**
- If yes → append upsell line to order before API submit
- If no or timer ends → submit order

## Confirmation / delivery rate

- Thank you page sets expectation: phone confirmation call/SMS
- Show order ID
- "تأكدين من رقمك صحيح" if typo risk

## A/B ideas (post-launch)

- Default bundle 2 vs 3
- Upsell product order
- Hero video vs static image

## Metrics events (see tracking doc)

`ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, `AddToWishlist` (optional)
