#!/usr/bin/env python3
"""Сторож разметки для поисковиков и ИИ.

Разметка `application/ld+json` — это текст, который поисковик и ИИ показывают
человеку ДО перехода на сайт. Она живёт в шапке и не видна глазами, поэтому
расходится с видимой страницей молча: цену поправили в карточке, ответ в FAQ
переписали — а в разметке остался прошлый. Для Яндекса и Google такое
расхождение не опечатка, а обман, и карается оно не предупреждением.

Заведён 29.10.2026 вместе с самой разметкой.

    python3 scripts/check-structured-data.py

Что проверяет:
  1. каждый блок ld+json — валидный JSON;
  2. вопросы и ответы FAQPage совпадают с видимым текстом секции «Вопросы»
     на той же странице, до знака;
  3. каждая цена из SoftwareApplication встречается на самой странице;
  4. карта сайта и страницы сходятся: всё из `sitemap.xml` отвечает сама за
     себя `canonical`, ничего закрытого `noindex` в карте нет.

Выход 0 — сходится. Выход 1 — расхождение, каждое названо поимённо.
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parent.parent

LDJSON = re.compile(r'<script type="application/ld\+json">(.*?)</script>', re.S)

# Страницы, у которых есть секция вопросов и разметка FAQPage.
FAQ_PAGES = ["index.html", "en/index.html"]
# Страницы с ценами в разметке.
PRICE_PAGES = ["tarify.html", "en/pricing.html"]
# Адрес в карте сайта → файл, который по нему отдаётся. Pages уводит
# `/tarify.html` на `/tarify`, поэтому в карте стоит адрес без расширения,
# а на диске лежит файл с ним.
SITEMAP_FILES = {
    "https://fizkult.ai/": "index.html",
    "https://fizkult.ai/tarify": "tarify.html",
    "https://fizkult.ai/oferta": "oferta.html",
    "https://fizkult.ai/privacy": "privacy.html",
    "https://fizkult.ai/en/": "en/index.html",
    "https://fizkult.ai/en/pricing": "en/pricing.html",
    "https://fizkult.ai/en/privacy": "en/privacy.html",
}


def nodes(text: str) -> list[dict]:
    """Все узлы разметки страницы, развёрнутые из @graph."""
    out: list[dict] = []
    for raw in LDJSON.findall(text):
        data = json.loads(raw)
        out += data.get("@graph", [data])
    return out


def visible_faq(text: str) -> list[tuple[str, str]]:
    """Вопросы и ответы так, как их читает человек: без тегов и ссылок."""
    section = re.search(r'<section id="faq">.*?</section>', text, re.S)
    if not section:
        return []
    t = re.sub(r"<a [^>]*>", "", section.group()).replace("</a>", "")
    t = re.sub(r"</?b>", "", t)
    pairs = []
    for d in re.findall(r"<details>(.*?)</details>", t, re.S):
        q = re.sub(r"\s+", " ", re.search(r"<summary>(.*?)<span", d, re.S).group(1)).strip()
        ps = [re.sub(r"\s+", " ", x).strip() for x in re.findall(r"<p>(.*?)</p>", d, re.S)]
        pairs.append((q, " ".join(ps)))
    return pairs


def prices(node: dict) -> list[tuple[str, str]]:
    """Пары (имя предложения, цена) из AggregateOffer."""
    offers = node.get("offers", {})
    out = []
    for o in offers.get("offers", []):
        out.append((o.get("name", "без имени"), str(o["price"])))
    for key in ("lowPrice", "highPrice"):
        if key in offers:
            out.append((key, str(offers[key])))
    return out


def on_page(price: str, text: str) -> bool:
    """Цена названа на странице.

    В вёрстке тысячи разбиты неразрывным пробелом («4 990 ₽»), а в разметке
    цена пишется подряд («4990») — требование schema.org. Поэтому ищем оба
    написания, иначе сторож краснел бы на верной странице.
    """
    forms = [price]
    if len(price) > 3:
        head, tail = price[:-3], price[-3:]
        forms += [f"{head} {tail}", f"{head}&nbsp;{tail}", f"{head} {tail}"]
    return any(f in text for f in forms)


def main() -> int:
    problems: list[str] = []

    for rel in FAQ_PAGES:
        text = (ROOT / rel).read_text(encoding="utf-8")
        page = visible_faq(text)
        marked: list[tuple[str, str]] = []
        for n in nodes(text):
            if n.get("@type") == "FAQPage":
                marked = [
                    (q["name"], q["acceptedAnswer"]["text"]) for q in n["mainEntity"]
                ]
        if not marked:
            problems.append(f"{rel}: на странице есть вопросы, а разметки FAQPage нет")
            continue
        if len(page) != len(marked):
            problems.append(
                f"{rel}: вопросов на странице {len(page)}, в разметке {len(marked)}"
            )
        for (q1, a1), (q2, a2) in zip(page, marked):
            if q1 != q2:
                problems.append(f"{rel}: вопрос разошёлся — {q1!r} против {q2!r}")
            elif a1 != a2:
                problems.append(f"{rel}: ответ разошёлся у вопроса {q1!r}")

    for rel in PRICE_PAGES:
        text = (ROOT / rel).read_text(encoding="utf-8")
        found = False
        for n in nodes(text):
            if n.get("@type") != "SoftwareApplication":
                continue
            found = True
            for name, price in prices(n):
                if not on_page(price, text):
                    problems.append(
                        f"{rel}: цена {price} из разметки ({name}) на самой странице "
                        "не названа — значит либо разметка протухла, либо карточку "
                        "убрали и забыли про шапку"
                    )
        if not found:
            problems.append(f"{rel}: нет разметки SoftwareApplication с ценами")

    sitemap = ET.parse(ROOT / "sitemap.xml").getroot()
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    listed = [u.findtext(f"{ns}loc") for u in sitemap.findall(f"{ns}url")]

    for loc in listed:
        rel = SITEMAP_FILES.get(loc)
        if rel is None:
            if loc.endswith(".pdf"):
                path = ROOT / loc.removeprefix("https://fizkult.ai/")
                if not path.exists():
                    problems.append(f"карта сайта: файла {loc} нет в репозитории")
                continue
            problems.append(
                f"карта сайта: адрес {loc} не привязан к файлу — допиши строку в "
                "SITEMAP_FILES этого скрипта"
            )
            continue
        text = (ROOT / rel).read_text(encoding="utf-8")
        canon = re.search(r'<link rel="canonical" href="([^"]+)"', text)
        if not canon:
            problems.append(f"{rel}: адрес в карте сайта есть, canonical в шапке нет")
        elif canon.group(1) != loc:
            problems.append(
                f"{rel}: canonical ведёт на {canon.group(1)}, а в карте сайта {loc}"
            )
        if re.search(r'<meta name="robots" content="[^"]*noindex', text):
            problems.append(f"{rel}: закрыт noindex, но стоит в карте сайта")

    for path in sorted(ROOT.glob("*.html")) + sorted(ROOT.glob("en/*.html")):
        rel = str(path.relative_to(ROOT))
        text = path.read_text(encoding="utf-8")
        has_canon = '<link rel="canonical"' in text
        noindex = re.search(r'<meta name="robots" content="[^"]*noindex', text)
        if not has_canon and not noindex:
            problems.append(
                f"{rel}: ни canonical, ни noindex — страница публична и ни за что "
                "не отвечает"
            )

    if problems:
        print("\nРАСХОЖДЕНИЯ:\n")
        for p in problems:
            print(f"  • {p}")
        print(f"\nвсего: {len(problems)}")
        return 1

    print(
        f"Разметка сходится: FAQ на {len(FAQ_PAGES)} страницах совпадает с текстом, "
        f"цены на {len(PRICE_PAGES)} — названы на самих страницах, "
        f"{len(listed)} адресов карты сайта отвечают сами за себя."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
