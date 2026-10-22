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

if [ "$fail" = "1" ]; then
  echo
  echo "Сторож красный. Правила — в ./_redirects."
  exit 1
fi

echo
echo "Сторож зелёный: внутреннее закрыто, публичное открыто."
