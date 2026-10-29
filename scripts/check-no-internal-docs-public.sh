#!/usr/bin/env bash
# Сторож: внутренние документы репозитория не отдаются живым сайтом.
#
# Почему он вообще нужен. Cloudflare Pages собирает этот сайт без build-команды,
# output — корень репозитория. Значит по умолчанию публичен КАЖДЫЙ файл, который
# сюда положили: не только страницы, но и тексты контура, чек-листы, спецы и
# исходники. 23.10.2026 так были публичны восемь .md (включая цену
# неанонсированного тарифа), два .jsx и каталог scripts/.
#
# Закрыто правилами в `_redirects`. Сторож проверяет, что правило живое.
#
# 🔴 Смотреть на КОД ОТВЕТА здесь нельзя, и это не придирка: Pages отдаёт 200 с
# главной страницей на любой несуществующий адрес, поэтому «200» одинаково
# значит и «файл публичен», и «файла нет вовсе». Признак — `content-type`:
# документ выдаёт себя своим типом (text/markdown, text/x-python, text/jsx), а
# закрытый адрес отвечает редиректом или отдаёт text/html.
#
# Запускать РУКАМИ после пуша (Actions в аккаунте не стартует с 20.09.2026) —
# деплой Pages идёт около минуты, раньше смысла нет.
#
# Новый внутренний файл в корне — строка в `_redirects` и строка здесь.
#
#   ./scripts/check-no-internal-docs-public.sh [база]
#   база по умолчанию https://fizkult.ai

set -u

BASE="${1:-https://fizkult.ai}"

PATHS=(
  COPY.md
  SPEC.md
  CHECKLIST.md
  DEPLOY.md
  DEEPLINKS.md
  INTERACTIONS.md
  EN.md
  README.md
  constructivist-landing.jsx
  landing-inside.jsx
  scripts/check-locale-parity.py
  scripts/check-no-internal-docs-public.sh
  source/constructivist-landing.jsx
  source/landing-inside.jsx
)

# Отдельный список для внутренних страниц (`.html`), и это не прихоть: признак
# `content-type` их не ловит — черновик страницы отдаётся тем же text/html, что
# и сайт, то есть пропал бы в проверке выше как «отдана страница сайта».
# Здесь закрытым считается ТОЛЬКО редирект.
PATHS_HTML=(
  drafts/oferta-next.html
)

# Зеркало: страницы, которые обязаны остаться публичными. Без него сторож
# зеленел бы и на правиле `/* / 302`, то есть на сломанном сайте. Адреса
# БЕЗ `.html`: Pages уводит `/tarify.html` на `/tarify` постоянным редиректом,
# и проверять надо тот адрес, который открывает человек.
PUBLIC=(
  ""
  tarify
  oferta
  privacy
  whitepaper
  en/
  en/pricing
  en/privacy
)

# Публичное, что обязано отдаваться: разборы серии «Метрики Garmin» и
# служебные файлы. Формат строки: `адрес ожидаемый-тип [маркер в теле]`.
#
# Почему мало кода ответа. До 29.10.2026 Pages отвечал 200 с текстом ГЛАВНОЙ
# на любой несуществующий адрес, то есть «200» одинаково значило «лежит» и
# «нет». Заведён `404.html` — теперь отсутствующее отдаётся как 404 (это и
# проверяется ниже отдельным блоком). Но у страницы того же типа, что
# главная, совпадения типа всё равно мало: маркер в теле — третье поле —
# отличает нашу страницу от любой другой, отданной вместо неё.
PUBLIC_FILES=(
  "garmin/training-effect.pdf application/pdf"
  "garmin/training-effect text/html https://fizkult.ai/garmin/training-effect"
  "garmin/sleep-efficiency.pdf application/pdf"
  "garmin/sleep-efficiency text/html https://fizkult.ai/garmin/sleep-efficiency"
  "robots.txt text/plain"
  "sitemap.xml application/xml"
  "llms.txt text/plain"
)

# Несуществующие адреса: обязаны отвечать 404, а не 200 с главной. Второй —
# внутри каталога разборов: там ошибка в адресе вероятнее всего.
MISSING_PATHS=(
  "zzz-such-page-never-existed"
  "garmin/zzz-such-page-never-existed"
)

fail=0

for p in "${PATHS[@]}"; do
  read -r code ctype <<<"$(curl -s -o /dev/null -w "%{http_code} %{content_type}" "$BASE/$p")"
  case "$code" in
    30*)
      echo "закрыт:  $p (редирект $code)"
      ;;
    200)
      case "$ctype" in
        text/html*)
          echo "закрыт:  $p (200, но отдана страница сайта, не файл)"
          ;;
        *)
          echo "ОТКРЫТ:  $BASE/$p — отдан сам файл ($ctype)"
          fail=1
          ;;
      esac
      ;;
    *)
      echo "закрыт:  $p ($code)"
      ;;
  esac
done

for p in "${PATHS_HTML[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$p")
  case "$code" in
    30*)
      echo "закрыт:  $p (редирект $code)"
      ;;
    200)
      echo "ОТКРЫТ:  $BASE/$p — внутренняя страница открывается"
      fail=1
      ;;
    *)
      echo "закрыт:  $p ($code)"
      ;;
  esac
done

for p in "${PUBLIC[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$p")
  if [ "$code" != "200" ]; then
    echo "СЛОМАН:  $BASE/$p отвечает $code — публичная страница перестала открываться"
    fail=1
  else
    echo "открыт:  /${p} (200)"
  fi
done

for row in "${PUBLIC_FILES[@]}"; do
  read -r p want marker <<<"$row"
  read -r code ctype <<<"$(curl -s -o /dev/null -w "%{http_code} %{content_type}" "$BASE/$p")"
  case "$ctype" in
    "$want"*) typeok=1 ;;
    *)        typeok=0 ;;
  esac
  markerok=1
  if [ -n "$marker" ] && ! curl -s "$BASE/$p" | grep -qF "$marker"; then
    markerok=0
  fi
  if [ "$code" != "200" ]; then
    echo "СЛОМАН:  $BASE/$p отвечает $code — публичный файл не отдаётся"
    fail=1
  elif [ "$typeok" = "0" ]; then
    echo "СЛОМАН:  $BASE/$p отдаёт '$ctype' вместо $want — публичный файл не отдаётся"
    fail=1
  elif [ "$markerok" = "0" ]; then
    echo "СЛОМАН:  $BASE/$p отдан, но без '$marker' — по адресу лежит не та страница"
    fail=1
  else
    echo "открыт:  /$p ($ctype)"
  fi
done

for p in "${MISSING_PATHS[@]}"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$p")
  if [ "$code" = "404" ]; then
    echo "404:     /$p (как и должно)"
  else
    echo "СЛОМАН:  $BASE/$p отвечает $code вместо 404 — несуществующий адрес выдаёт"
    echo "         страницу, и поисковик складывает такие адреса как дубли. Проверь,"
    echo "         что 404.html лежит в корне репозитория и доехал в сеть."
    fail=1
  fi
done

if [ "$fail" = "1" ]; then
  echo
  echo "Сторож красный. Правила — в ./_redirects."
  exit 1
fi

echo
echo "Сторож зелёный: внутреннее закрыто, публичное открыто."
