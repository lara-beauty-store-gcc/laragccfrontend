# رسالة المستخدم لـ AI Agent (n8n) — مع نجمة

الصق في **User Message** (أو Code قبل الـ Agent) باش نجمة عندها تاريخ دبي + جوال للشيت.

```
رقم العميل للبحث في الشيت: {{ $json.phone أو من Chatwoot }}

تاريخ اليوم (دبي): {{ $now.setZone('Asia/Dubai').toFormat('yyyy-MM-dd') }}

رسالة العميل:
{{ $json.ai_input أو $json.message أو finalMessage }}
```

في **System Message** الصق محتوى `najma-system-prompt.txt` كامل.
