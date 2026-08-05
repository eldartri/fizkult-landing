# Frontend Handoff — fizkult.ai лендинг

**Направление:** Constructivist Red + AI (типографически). **Дата:** 2026-06-01. Frontend старт — 2 июня, ETA live — 5 июня.

---

## Про Figma
Дизайн отдан **как рабочий код**, не Figma-файл. **Источник правды — `source/` (живой HTML + JSX) + `SPEC.md`.** Открой `source/Landing — Constructivist Red.html` в браузере — это пиксельный референс (адаптивный, 320–1440). Все токены, размеры, отступы извлечены в `SPEC.md`. Если нужен именно Figma — собирается по `SPEC.md`, либо могу выгрузить в Canva (по запросу).

## Состав пакета
```
handoff/
  README.md            ← этот файл
  SPEC.md              ← design tokens (цвета, шрифты, шкалы, spacing, breakpoints, шрифты-подключение)
  COPY.md              ← все финальные тексты (HTML), вкл. 200-словный sample-отчёт
  INTERACTIONS.md      ← hover, gated-CTA (152-ФЗ), анимации, cookie, reduced-motion
  DEEPLINKS.md         ← куда ведут CTA (t.me/fizkult_ai_bot?start=…) + якоря + /privacy /terms
  CHECKLIST.md         ← статус 11-пунктового pre-handoff verify
  source/              ← рабочий код (референс)
    Landing — Constructivist Red.html
    constructivist-landing.jsx   (Nav/Hero/How/Gallery/Pricing/FinalCTA/Footer + responsive hook)
    landing-inside.jsx           (секции «Что внутри» + «Что НЕ делаем»)
  assets/
    icons/   morning, portrait, coach, anomaly, plan, race, logo-mark, check, arrow (SVG)
    og/      og-share.png (беж, для соцсетей) + og-onsite.png (красный, on-site) · 1200×630
    favicon/ favicon-16/32/96/192/512.png
```

## Запуск референса
`source/*.html` — статичный React+Babel (CDN, inline JSX). Просто открыть в браузере. Для прода Frontend перепишет на свой стек (React/Next) по SPEC; код — справочный, не для копипасты в прод как есть (in-browser Babel — только для превью).

## Реализация — важное
- **Шрифты:** self-host woff2 (Geist 900/400 + JetBrains Mono). См. SPEC §Шрифты. (В превью-коде стоит Geist Mono — заменить на JetBrains Mono.)
- **Адаптив:** breakpoint `≤760px` = mobile (в коде через JS-хук `useVW`; на проде — обычные CSS media queries по SPEC: 320/768/1024/1440).
- **152-ФЗ:** gated-CTA — кнопка заблокирована до явного чекбокса (см. INTERACTIONS). Не click-wrap.
- **Border-radius: 0** везде (бруталист).

## НЕ входит в этот пакет (отдельные задачи / зависимости)
- **`cards/` — 6 портретов 9:16 (1080×1920):** это отдельная задача «Portrait 9:16 + viral-URL». В этот handoff не вошли (по согласованию). Карточки архетипов на лендинге — другой компонент (см. source).
- **`hero/` фоновые картинки:** дизайн hero — плоский конструктивизм (цвет + геометрия), растровых фонов нет. Папка не нужна.
- **favicon.ico:** даны PNG-размеры; `.ico` собрать из `favicon-32.png` любым конвертером (или RealFaviconGenerator) — формат .ico не генерится из дизайна напрямую.
- **Официальные логотипы Garmin / «Powered by Strava»:** сейчас текстовые wordmark-заглушки. Заменить после Strava badge approval (см. CHECKLIST).
- **Страницы `/privacy`, `/terms`, `/mcp`:** отдельные, не в составе лендинга.
