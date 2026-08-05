# DEEPLINKS.md — Куда ведут CTA и ссылки

**Бот:** `@fizkult_ai_bot`. Все архетип-CTA ведут в Telegram с deep-link параметром `start`.

| Элемент | Назначение |
|---|---|
| Hero CTA `Узнать архетип →` | `https://t.me/fizkult_ai_bot?start=archetype` |
| CTA #2 (после архетипов) `Узнать свой архетип бесплатно →` | `https://t.me/fizkult_ai_bot?start=archetype` |
| Free тариф `Узнать архетип →` | `https://t.me/fizkult_ai_bot?start=archetype` |
| Финальный CTA `Узнать архетип бесплатно →` | `https://t.me/fizkult_ai_bot?start=archetype` |
| Pro тариф `Оформить Pro` | `https://t.me/fizkult_ai_bot?start=pro` |
| Nav CTA `Архетип →` | `https://t.me/fizkult_ai_bot?start=archetype` |

## Якоря (внутренние)
- `Архетипы` → `#archetypes`
- `Что внутри` → `#inside`
- `Тарифы` → `#pricing`

## Footer ссылки (отдельные страницы)
- `Политика обработки ПДн` → `/privacy`
- `Privacy` → `/privacy` (или `/privacy-en`)
- `Terms` → `/terms`

## UTM / атрибуция
- На все Telegram deep-links параметр `start` уже служит источником атрибуции в боте (`archetype` / `pro`).
- Для платного трафика добавлять UTM на URL лендинга (не на deep-link): `?utm_source=…&utm_campaign=…`; бот читает `start`, аналитика лендинга — UTM.
- При шеринге портрета — отдельный механизм `fizkult.ai/p/<token>` (см. задачу VIRAL_URL_ON_PORTRAIT, не входит в этот handoff).

## Открытие
- Все `t.me` ссылки — `target="_blank" rel="noopener"`.
- На mobile — нативно открывают приложение Telegram; на desktop — web/desktop клиент.
