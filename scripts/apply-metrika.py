#!/usr/bin/env python3
"""Ставит счётчик Яндекс.Метрики на все публичные страницы сайта.

Почему скриптом, а не руками по файлам. Страниц 43 и будет больше:
линия разборов растёт парами RU + EN. Вставленный руками счётчик
живёт в 43 домах — поменял настройку (выключил вебвизор, сменил
номер) и обошёл 43 файла, забыв два. Здесь дом один: правится
СНИППЕТ ниже, скрипт прогоняется заново, и он сам заменяет старую
вставку новой.

Скрипт идемпотентен: повторный прогон ничего не ломает и ничего не
дублирует — он вырезает свой прежний блок по меткам и ставит свежий.

Применение:
    python3 scripts/apply-metrika.py            # показать, что изменится
    python3 scripts/apply-metrika.py --write    # записать

Не ставится на страницы производства (`carousels/`, `source/`) и на
черновики (`drafts/`): это не посещаемые страницы, а наши заготовки,
и хиты с них испортили бы статистику.
"""

import argparse
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

COUNTER_ID = "114508365"

SKIP_DIRS = {"drafts", "source", "carousels", ".git", "node_modules", "scripts"}

# Файлы подтверждения прав: их содержимое проверяет робот поисковика,
# и наш счётчик там не нужен — страницу никто не открывает глазами.
SKIP_FILES = {"yandex_fa413c079ba916e2.html"}

OPEN_MARK = "<!-- Yandex.Metrika counter -->"
CLOSE_MARK = "<!-- /Yandex.Metrika counter -->"

SNIPPET = f"""{OPEN_MARK}
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){{
        m[i]=m[i]||function(){{(m[i].a=m[i].a||[]).push(arguments)}};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {{if (document.scripts[j].src === r) {{ return; }}}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    }})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id={COUNTER_ID}', 'ym');

    ym({COUNTER_ID}, 'init', {{ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true}});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/{COUNTER_ID}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
{CLOSE_MARK}
"""

# Прежняя вставка вырезается вместе с отступом первой строки и переводом
# строки после последней — ровно тем, что добавляет вставка ниже. Иначе
# каждый прогон оставлял бы за собой лишнюю пустую строку, и «ничего не
# изменилось» переставало быть правдой со второго раза.
EXISTING = re.compile(
    r"[ \t]*" + re.escape(OPEN_MARK) + r".*?" + re.escape(CLOSE_MARK) + r"[ \t]*\n?",
    re.DOTALL,
)


def pages():
    for path in sorted(ROOT.rglob("*.html")):
        rel = path.relative_to(ROOT)
        if SKIP_DIRS & set(rel.parts[:-1]):
            continue
        if rel.name in SKIP_FILES:
            continue
        yield path


def place(html: str) -> str | None:
    """Возвращает новый текст страницы или None, если якорь не найден."""
    html = EXISTING.sub("", html)

    # Штатный якорь — конец <head>. Метрика просит ставить счётчик там:
    # чем раньше инициализация, тем меньше потерянных коротких визитов.
    m = re.search(r"([ \t]*)</head>", html, re.IGNORECASE)
    if m:
        indent = m.group(1)
        block = "".join(
            (indent + line + "\n") if line else "\n" for line in SNIPPET.splitlines()
        )
        return html[: m.start()] + block + html[m.start():]

    m = re.search(r"<body[^>]*>", html, re.IGNORECASE)
    if m:
        return html[: m.end()] + "\n" + SNIPPET.rstrip("\n") + html[m.end():]

    # whitepaper.html написан вообще без каркаса: ни <html>, ни <head>,
    # ни <body> — голый фрагмент, который браузер оборачивает сам.
    # Якорь последний: сразу после объявления кодировки, чтобы charset
    # остался первым, как требует спецификация.
    m = re.search(r"<meta[^>]*charset[^>]*>", html, re.IGNORECASE)
    if m:
        return html[: m.end()] + "\n" + SNIPPET.rstrip("\n") + html[m.end():]

    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="записать изменения")
    args = ap.parse_args()

    changed, skipped, failed = [], [], []

    for path in pages():
        rel = path.relative_to(ROOT)
        old = path.read_text(encoding="utf-8")
        new = place(old)
        if new is None:
            failed.append(rel)
            continue
        if new == old:
            skipped.append(rel)
            continue
        changed.append(rel)
        if args.write:
            path.write_text(new, encoding="utf-8")

    for rel in changed:
        print(f"{'записано' if args.write else 'изменится'}: {rel}")
    for rel in failed:
        print(f"❌ якорь не найден: {rel}", file=sys.stderr)

    print(f"\nСчётчик {COUNTER_ID}")
    print(f"  затронуто: {len(changed)}")
    print(f"  уже стоял, не трогал: {len(skipped)}")
    if failed:
        print(f"  БЕЗ СЧЁТЧИКА: {len(failed)}")
        return 1
    if not args.write and changed:
        print("\nЭто предпросмотр. Записать: --write")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
