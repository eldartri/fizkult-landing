# Deploy fizkult-landing → Cloudflare Pages

GitHub repo: **https://github.com/eldartri/fizkult-landing**
(уже создан, первичный коммит index.html + README уже там)

## Шаг 1 — push остальных файлов в GitHub (1 мин)

**Вариант A — GitHub Desktop:**
1. File → Clone repository → https://github.com/eldartri/fizkult-landing
2. Скопируй ВСЕ файлы из этой папки `landing/` в локальный clone (можно через Finder drag-drop)
3. В GitHub Desktop — Commit "feat: landing assets + JSX + handoff docs" → Push origin

**Вариант B — git CLI:**
```bash
cd ~/Documents/Claude/Projects/AI\ Thriatlon\ coach
git clone https://github.com/eldartri/fizkult-landing
cd fizkult-landing
cp -r ../landing/* .
git add .
git commit -m "feat: landing assets + JSX + handoff docs"
git push
```

## Шаг 2 — Cloudflare Pages connect (2 мин)

1. https://dash.cloudflare.com → Workers & Pages → Create → **Pages** → Connect to Git
2. Authorize GitHub → выбрать `eldartri/fizkult-landing`
3. Build settings: **None** (static site, build command пустой, output `/`)
4. Save and Deploy
5. CF дает URL `<project>.pages.dev` — открой проверь, лендинг должен работать

## Шаг 3 — Custom domain fizkult.ai (2 мин)

В Cloudflare Pages:
1. Custom domains → Set up a custom domain → `fizkult.ai`
2. CF покажет CNAME запись (например: `<project>.pages.dev`)

В Porkbun:
1. https://porkbun.com → manage `fizkult.ai` → DNS
2. Удалить дефолтные A-records на parking
3. Добавить:
   - `CNAME @ → <project>.pages.dev` (apex) — если Porkbun поддерживает CNAME flattening; иначе используй ALIAS
   - `CNAME www → <project>.pages.dev`
4. Подожди 5–15 минут на propagation

## Готово
- `fizkult.ai` → откроется лендинг
- `www.fizkult.ai` → redirect на apex (CF делает автомат)
- SSL certificate Let's Encrypt — CF выпустит автоматически за 1–2 минуты

## После deploy — что делать дальше
- Frontend Dev перепишет inline React Babel на чистый bundle (production-ready)
- Backend подключит `/privacy` и `/terms` страницы
- Eldar: РКН уведомление + Strava badge approval (legal track)
