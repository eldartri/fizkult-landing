#!/usr/bin/env bash
# Сообщает поисковикам, что адреса изменились — не дожидаясь обхода.
#
# IndexNow поддерживают Яндекс, Bing, Seznam, Naver. Google — нет: ему
# карта сайта и Search Console. Для нас главный получатель — Яндекс,
# стартовый рынок русскоязычный.
#
# Ключ лежит публично по адресу https://fizkult.ai/<KEY>.txt — так
# устроен протокол: сервер проверяет, что файл с таким именем и таким
# содержимым отдаётся нашим доменом. Это не секрет, его нельзя потерять.
#
# Применение:
#   scripts/indexnow.sh                      # все адреса из карты сайта
#   scripts/indexnow.sh /garmin/hrv-status /en/garmin/hrv-status
#
# Запускать ПОСЛЕ того, как пуш доехал до Cloudflare Pages и страница
# отдаёт 200: сообщаем о живом адресе, не о намерении.

set -euo pipefail

KEY="e6b724d2ecf947ea5fbe75d96485c88a"
HOST="fizkult.ai"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

# Сам ключ должен отдаваться, иначе приём отклонят целиком.
key_code=$(curl -s -o /dev/null -w "%{http_code}" "$KEY_LOCATION")
if [ "$key_code" != "200" ]; then
  echo "Ключ не отдаётся: $KEY_LOCATION → $key_code" >&2
  echo "Пуш ещё не доехал до Cloudflare Pages, либо файл не в корне репо." >&2
  exit 1
fi

if [ $# -gt 0 ]; then
  urls=()
  for p in "$@"; do
    case "$p" in
      https://*) urls+=("$p") ;;
      /*)        urls+=("https://${HOST}${p}") ;;
      *)         urls+=("https://${HOST}/${p}") ;;
    esac
  done
else
  # Без mapfile: на macOS штатный bash — 3.2, там его нет.
  urls=()
  while IFS= read -r line; do
    [ -n "$line" ] && urls+=("$line")
  done < <(curl -s "https://${HOST}/sitemap.xml" \
    | grep -oE '<loc>[^<]+' | sed 's|<loc>||')
fi

if [ ${#urls[@]} -eq 0 ]; then
  echo "Нечего отправлять." >&2
  exit 1
fi

# IndexNow берёт не больше 10 000 адресов за раз — нам до этого далеко.
payload=$(python3 - "$HOST" "$KEY" "$KEY_LOCATION" "${urls[@]}" <<'PY'
import json, sys
host, key, key_location, *urls = sys.argv[1:]
print(json.dumps({
    "host": host,
    "key": key,
    "keyLocation": key_location,
    "urlList": urls,
}, ensure_ascii=False))
PY
)

echo "Отправляю ${#urls[@]} адрес(ов) в IndexNow…"
code=$(curl -s -o /dev/stderr -w "%{http_code}" \
  -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-binary "$payload")

echo
case "$code" in
  200) echo "✅ 200 — приняты." ;;
  202) echo "✅ 202 — приняты, ключ проверяется." ;;
  400) echo "❌ 400 — неверный формат запроса." ;;
  403) echo "❌ 403 — ключ не прошёл проверку ($KEY_LOCATION)." ;;
  422) echo "❌ 422 — адрес не с этого домена, либо ключ не совпал." ;;
  429) echo "⚠️  429 — слишком часто. Повторить позже." ;;
  *)   echo "⚠️  код $code" ;;
esac
