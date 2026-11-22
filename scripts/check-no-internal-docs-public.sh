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
  en/terms
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
  "garmin/ text/html https://fizkult.ai/garmin/"
  "garmin/training-effect.pdf application/pdf"
  "garmin/training-effect text/html https://fizkult.ai/garmin/training-effect"
  "garmin/sleep-score.pdf application/pdf"
  "garmin/sleep-score text/html https://fizkult.ai/garmin/sleep-score"
  "garmin/vo2max.pdf application/pdf"
  "garmin/vo2max text/html https://fizkult.ai/garmin/vo2max"
  "garmin/training-status.pdf application/pdf"
  "garmin/training-status text/html https://fizkult.ai/garmin/training-status"
  "garmin/body-battery.pdf application/pdf"
  "garmin/body-battery text/html https://fizkult.ai/garmin/body-battery"
  "garmin/stress.pdf application/pdf"
  "garmin/stress text/html https://fizkult.ai/garmin/stress"
  "garmin/training-readiness.pdf application/pdf"
  "garmin/training-readiness text/html https://fizkult.ai/garmin/training-readiness"
  "garmin/recovery-time.pdf application/pdf"
  "garmin/recovery-time text/html https://fizkult.ai/garmin/recovery-time"
  # Английская половина серии. Догоняет русскую (заказ владельца 21.11.2026
  # — обе половины за две недели) — выпустил близнец, допиши сюда строку. PDF у
  # английских разборов пока нет: русский генератор построен на русских
  # заголовках, и английский пак делается отдельной работой.
  "en/garmin/ text/html https://fizkult.ai/en/garmin/"
  "en/garmin/body-battery text/html https://fizkult.ai/en/garmin/body-battery"
  "en/garmin/stress text/html https://fizkult.ai/en/garmin/stress"
  "en/garmin/training-readiness text/html https://fizkult.ai/en/garmin/training-readiness"
  "en/garmin/vo2max text/html https://fizkult.ai/en/garmin/vo2max"
  # Калькуляторы. Считают в браузере, поэтому открытость адреса — это и есть
  # вся их доставка: страница не отвечает — сервиса нет. Выпустил новый
  # калькулятор, допиши сюда обе строки, русскую и английскую.
  "calc/pace text/html https://fizkult.ai/calc/pace"
  "en/calc/pace text/html https://fizkult.ai/en/calc/pace"
  "calc/predict text/html https://fizkult.ai/calc/predict"
  "en/calc/predict text/html https://fizkult.ai/en/calc/predict"
  "calc/hr-zones text/html https://fizkult.ai/calc/hr-zones"
  "en/calc/hr-zones text/html https://fizkult.ai/en/calc/hr-zones"
  "calc/ text/html https://fizkult.ai/calc/"
  "en/calc/ text/html https://fizkult.ai/en/calc/"
  "calc/bmi text/html https://fizkult.ai/calc/bmi"
  "en/calc/bmi text/html https://fizkult.ai/en/calc/bmi"
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

# Потолок на запрос. Повод (22.11.2026): прогон завис на восемнадцать минут —
# у curl не было ни --max-time, ни --connect-timeout, и одно подвисшее
# соединение остановило весь сторож молча. Сторож, который может не
# вернуться, не проверяется никем.
TIMEOUTS="--connect-timeout 10 --max-time 25"

fail=0

for p in "${PATHS[@]}"; do
  read -r code ctype <<<"$(curl -s $TIMEOUTS -o /dev/null -w "%{http_code} %{content_type}" "$BASE/$p")"
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
  code=$(curl -s $TIMEOUTS -o /dev/null -w "%{http_code}" "$BASE/$p")
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
  code=$(curl -s $TIMEOUTS -o /dev/null -w "%{http_code}" "$BASE/$p")
  if [ "$code" != "200" ]; then
    echo "СЛОМАН:  $BASE/$p отвечает $code — публичная страница перестала открываться"
    fail=1
  else
    echo "открыт:  /${p} (200)"
  fi
done

# Три попытки на адрес. Повод (22.11.2026): три прогона подряд дали три
# разных одиночных отказа — 000, обрезанное тело, снова полный ответ, —
# и каждый раз curl вручную показывал страницу целиком. Это не находка,
# а срез под частыми последовательными запросами; сторож, который врёт
# раз в прогон, перестаёт читаться как сторож.
for row in "${PUBLIC_FILES[@]}"; do
  read -r p want marker <<<"$row"
  typeok=0; markerok=0; code=000
  for attempt in 1 2 3; do
    read -r code ctype <<<"$(curl -s $TIMEOUTS --retry 2 --retry-all-errors -o /dev/null -w "%{http_code} %{content_type}" "$BASE/$p")"
    case "$ctype" in
      "$want"*) typeok=1 ;;
      *)        typeok=0 ;;
    esac
    markerok=1
    if [ -n "$marker" ] && ! curl -s $TIMEOUTS --retry 2 --retry-all-errors "$BASE/$p" | grep -qF "$marker"; then
      markerok=0
    fi
    [ "$code" = "200" ] && [ "$typeok" = "1" ] && [ "$markerok" = "1" ] && break
    [ "$attempt" != "3" ] && sleep 2
  done
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
  code=$(curl -s $TIMEOUTS -o /dev/null -w "%{http_code}" "$BASE/$p")
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
