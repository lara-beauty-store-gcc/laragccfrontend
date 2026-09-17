# Najma — n8n AI Agent

## System Message
Copy the **entire** file:

`najma-sales-agent-system-prompt.txt`

(Regenerate from repo root: `python3 scripts/build_najma_enterprise_prompt.py`)

## User Message (per inbound message)

```text
رقم العميل للبحث في الشيت: {{ $json.phone }}

تاريخ اليوم (دبي): {{ $now.setZone('Asia/Dubai').toFormat('yyyy-MM-dd') }}

رسالة العميل:
{{ $json.ai_input }}
```

## Chatwoot reply body

```text
{{ $('AI Agent').item.json.output }}
```
