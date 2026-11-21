---
name: twin-page-drops-attribution-in-meta
description: Английский близнец разбора теряет оговорку «наше чтение» в og:description и JSON-LD Article.description, а тело страницы держит; плюс вопрос FAQ с существительным-ярлыком
metadata:
  type: feedback
---

При проверке перевода-близнеца сверять не только тело, но og:description, twitter:description и JSON-LD (Article.description, FAQ name) построчно с русским.

**Why:** 21.11.2026, en/garmin/stress.html: тело страницы переведено точно (все «our reading» на месте), а в og:description пропало «по нашему чтению» (наша трактовка «стресс кормит готовность» стала утверждением), в Article.description пропала оговорка «та же ли это величина — руководство не говорит». Вопрос FAQ получил «overtraining» там, где у русского «перегрузка» — существительное-ярлык в заголовке, хотя ответ глагольный.

**How to apply:** для каждой EN-страницы разбора: (1) diff мета-описаний и JSON-LD против RU; (2) искать overtraining/burnout в именах вопросов, а не только в тексте ответов; (3) CTA сверять с CTA en/garmin/body-battery.html (там уже утверждённая формулировка про /language).
