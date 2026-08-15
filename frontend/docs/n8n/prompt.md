# n8n — AI Agent input formats (نجمة)

The **System Message** is in `najma-system-prompt.txt`.

The **User Message** must always receive a single string the model can read. Use **`finalMessage`** on each branch, then pass it to the Agent.

---

## Variable: `finalMessage` (per branch)

### Text (after Switch text / If Text true)

```javascript
={{ $json.body.content }}
```

### Voice (after **AdSkull Transcribe** — `$json` = transcribe response)

Append a label so the model knows this is a voice note, not typed text:

```javascript
={{ 'رسالة العميل (فويس مفرّغ): ' + ($json.transcript || $json.text || '').trim() || 'ما قدرنا نفهم الفويس، عافاك اكتب رسالة نصية.' }}
```

Optional metadata (if AdSkull returns it):

```javascript
={{ 
  'رسالة العميل (فويس مفرّغ): ' 
  + ($json.transcript || $json.text || '').trim() 
  + ($json.language_detected ? '\nلغة الفويس: ' + $json.language_detected : '')
  || 'ما قدرنا نفهم الفويس، عافاك اكتب رسالة نصية.'
}}
```

### Image (after **AdSkull Vision**)

```javascript
={{ 'العميل أرسل صورة، وصف الصورة: ' + ($json.description || 'ما قدرنا نقرأ الصورة') + ($json.ocr_text ? '\nالنص الموجود داخل الصورة: ' + $json.ocr_text : '') }}
```

---

## AI Agent → User Message (full prompt input)

After **Set** node(s), include phone for Sheets + `finalMessage`:

```javascript
={{
  'رقم العميل للبحث في الشيت: '
  + ($('Webhook').item.json.body.sender.phone_number
     || $('Webhook').item.json.body.conversation.meta.sender.phone_number
     || $('Webhook').item.json.body.conversation.contact_inbox.source_id)
  + '\n\n'
  + ($json.finalMessage || $json.body?.content || '')
}}
```

---

## YouTuber style (no Set / no Merge) — not recommended if Tool or multi-branch errors

Only use if **AdSkull Transcribe** ran on the audio branch; otherwise this breaks on image/text runs.

```javascript
={{
$('Webhook').item.json.body.content
|| (
  $('AdSkull Transcribe').isExecuted
    ? 'رسالة العميل (فويس مفرّغ): ' + ($('AdSkull Transcribe').item.json.transcript || '')
    : ''
)
|| (
  $('AdSkull Vision').isExecuted && $('AdSkull Vision').item.json.description
    ? 'العميل أرسل صورة، وصف الصورة: ' + $('AdSkull Vision').item.json.description
      + ($('AdSkull Vision').item.json.ocr_text
        ? '\nالنص الموجود داخل الصورة: ' + $('AdSkull Vision').item.json.ocr_text
        : '')
    : ''
)
}}
```

**Preferred:** Set `finalMessage` on each branch + `$json.finalMessage` in User Message.
