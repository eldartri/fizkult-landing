# SPEC.md — Design tokens · fizkult.ai лендинг

> ⚠️ **Это документ передачи от 01.06.2026, описывающий страницу «Какой ты спортсмен» с шестью архетипами. Та страница не выпускалась. Живая страница переделана 04.09.2026 — её тексты и состав держит `COPY.md`, ссылки — `DEEPLINKS.md`. Дизайн-система (цвета, шрифты, тени, состояния) осталась той же и здесь описана верно; всё, что про содержание, структуру, тарифы и диплинки, — история.**


**Версия:** 2026-06-01 · Constructivist Red + AI
**Источник правды:** живой код в `source/` (HTML + JSX). Этот файл — извлечённые токены.

---

## Палитра

| Токен | HEX | Использование |
|---|---|---|
| `--accent` (red) | `#C8261A` | акценты ≥24px, кнопки (текст), плашки, диагонали |
| `--bg` (beige) | `#EFE6D6` | основной фон |
| `--bg-alt` (sand) | `#E5D9C3` | фон чередующихся секций (галерея, «Что НЕ делаем») |
| `--ink` (black) | `#1A1A1A` | весь текст, контуры, тёмные секции/кнопки |
| `--panel` (white) | `#FFFFFF` | фон карточек (тарифы Free, блоки «Что внутри») |
| `--accent-ink` | `#EFE6D6` | текст поверх красного |
| muted (footer) | `#C9C2B5` / `#9F9A92` | вторичный текст на тёмном |

**WCAG:** мелкий текст (мета, цены, дисклеймеры, согласие) — **всегда `#1A1A1A` на беже**, никогда не красный. Красный — только для акцентов ≥24px и крупных заголовков.

Контраст `#C8261A` на `#EFE6D6` ≈ 4.8:1 — OK для текста ≥18px, FAIL для мелкого.

---

## Типографика

| Роль | Шрифт | Вес | Стиль |
|---|---|---|---|
| Headings (H1/H2/H3) | **Geist** | 900 | UPPERCASE, letter-spacing −0.03…−0.05em |
| Body | **Geist** | 400–500 | sentence case |
| AI-штампы / мета / цены-меты | **JetBrains Mono** (в коде Geist Mono) | 500–700 | UPPERCASE, letter-spacing 0.06–0.18em |

> В коде сейчас Geist Mono; для прода ТЗ требует **JetBrains Mono** для mono-роли — заменить переменную `MONO`.

### Шкала размеров (desktop → mobile ≤760px)

| Роль | Desktop | Mobile |
|---|---|---|
| Hero H1 | 98px | 46px |
| Section H2 | 68px | 34px |
| Block H3 | 24px | 20px |
| Hero number (card) | 100px | 100px |
| Body | 17–18px | 16px |
| Small / mono | 10–13px | 10–13px |

line-height: заголовки 0.84–0.94, body 1.5–1.55.

---

## Spacing (8-grid)

`8 · 16 · 24 · 32 · 48 · 64` (+ section padding 96px desktop / 56px mobile).

- Section vertical padding: **96px** desktop, **56px** mobile.
- Section horizontal padding: **48px** desktop, **20px** mobile.
- Card padding: 20px. Block padding: 26px.
- Grid gap: 28–36px.

## Border radius

**0** везде. Бруталистская сетка — ничего не закругляем (кроме индикаторных точек `border-radius:50%`).

## Borders

Жёсткие линии `3px solid #1A1A1A` (карты, сетки, nav, тарифы). Тонкие разделители `1px` / `1.5px` внутри карточек.

## Breakpoints

| | px |
|---|---|
| phone | ≤ 760 (в коде `m = vw <= 760`) |
| tablet | 761–1023 (галерея 2 кол) |
| desktop | 1024–1279 (галерея 3 кол) |
| max | 1280 (контейнер `max-width: 1280px`, центр) |

ТЗ-брейкпоинты 320 / 768 / 1024 / 1440 — текущая реализация fluid, проверена на 320–1440.

## Шрифты — подключение

**Решение: self-host woff2** (Geist + JetBrains Mono) — надёжнее для РФ, без внешнего CDN (Google Fonts может блокироваться).

```css
@font-face{font-family:"Geist";src:url("/fonts/Geist-Black.woff2") format("woff2");font-weight:900;font-display:swap;}
@font-face{font-family:"Geist";src:url("/fonts/Geist-Regular.woff2") format("woff2");font-weight:400;font-display:swap;}
@font-face{font-family:"JetBrains Mono";src:url("/fonts/JetBrainsMono-Medium.woff2") format("woff2");font-weight:500;font-display:swap;}
```

Источники: Geist — github.com/vercel/geist-font (OFL). JetBrains Mono — github.com/JetBrains/JetBrainsMono (OFL). Положить .woff2 в `/public/fonts/`.

## Анимации

- `@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }` — живые AI-индикаторы (точки в штампах), 1.2–1.6s steps(2) infinite.
- Hover/transition — см. `INTERACTIONS.md`.
