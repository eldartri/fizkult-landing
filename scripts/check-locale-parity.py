#!/usr/bin/env python3
"""Сверка русской и английской страниц.

Английская страница — самостоятельный файл, а не сборка из общих кусков.
Так сделано нарочно: русская страница живёт на проде и зарабатывает, и
вытащить из неё стили в общий файл ради одной только стройности — значит
дать ей шанс однажды приехать к человеку без оформления.

Плата за самостоятельность — дрейф: правку внесли в одну страницу и забыли
про вторую. Этот скрипт делает дрейф громким.

    python3 scripts/check-locale-parity.py

Выход 0 — страницы сходятся. Выход 1 — расхождение, каждое названо поимённо.
"""

from __future__ import annotations

import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Пары страниц. Четвёртое и пятое поле — куда обязан вести переключатель
# языка с каждой стороны: у главной это корни разделов, у страницы тарифов —
# её собственный адрес на другом языке, иначе переключатель уводит человека
# с тарифов на главную и теряет его вопрос.
PAIRS = [
    ("index.html", "en/index.html", "/en/", "/"),
    ("tarify.html", "en/pricing.html", "/en/pricing", "/tarify"),
    ("privacy.html", "en/privacy.html", "/en/privacy", "/privacy"),
]


class Skeleton(HTMLParser):
    """Скелет страницы: теги, id, классы, ссылки — без единого слова текста.

    Слова обязаны различаться, на то и перевод. Различаться не должно всё
    остальное, и сверяем мы ровно это остальное.
    """

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.tags: list[str] = []
        self.ids: list[str] = []
        self.classes: list[str] = []
        self.links: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tags.append(tag)
        a = dict(attrs)
        if a.get("id"):
            self.ids.append(a["id"])
        if a.get("class"):
            self.classes.append(f"{tag}.{a['class']}")
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])


def skeleton(text: str) -> Skeleton:
    p = Skeleton()
    p.feed(text)
    return p


#: Разметка для поисковиков (`application/ld+json`) — не скрипт поведения.
#  Она обязана РАЗЛИЧАТЬСЯ на двух языках: внутри неё лежат те же слова,
#  что человек читает на странице. Поэтому из побайтной сверки она
#  исключена, но её число на двух сторонах сверяется отдельно: пропавший
#  блок на английской — это молча потерянная видимость, а не косметика.
LDJSON = re.compile(r'<script\b[^>]*type="application/ld\+json"[^>]*>.*?</script>', re.S)


def blocks(text: str, tag: str) -> list[str]:
    return re.findall(rf"<{tag}\b[^>]*>.*?</{tag}>", text, re.S)


def one_block(text: str, tag: str, where: str) -> str | None:
    """Единственный блок <tag> — или None, если его нет вовсе.

    Ноль блоков законен: политика и оферта — страницы без поведения, у них
    нет <script>, и требовать его значило бы требовать пустой тег ради
    прибора. Ноль обязан быть нулём с ОБЕИХ сторон — это проверяет
    вызывающий. Два и больше — всегда ошибка: сверять побайтно нечего,
    пока не сказано, какой из них главный.
    """
    hits = [h for h in blocks(text, tag) if not LDJSON.fullmatch(h)]
    if len(hits) > 1:
        sys.exit(f"{where}: ожидали не больше одного блока <{tag}>, нашли {len(hits)}")
    return hits[0] if hits else None


def check_pair(ru_rel: str, en_rel: str, ru_switch: str, en_switch: str) -> list[str]:
    RU = ROOT / ru_rel
    EN = ROOT / en_rel
    for path in (RU, EN):
        if not path.exists():
            sys.exit(f"нет файла {path}")

    ru_text = RU.read_text(encoding="utf-8")
    en_text = EN.read_text(encoding="utf-8")
    problems: list[str] = []

    # 1. Оформление и поведение — побайтно. Разошлись — английская страница
    #    приедет с чужим видом или с мёртвыми кнопками.
    for tag in ("style", "script"):
        ru_block = one_block(ru_text, tag, ru_rel)
        en_block = one_block(en_text, tag, en_rel)
        if ru_block != en_block:
            problems.append(
                f"<{tag}> разъехался: {len(ru_block) if ru_block else 'нет блока'} "
                f"в русской против {len(en_block) if en_block else 'нет блока'} "
                "в английской. Переносить блок целиком, а не правку."
            )

    # 1a. Разметка для поисковиков: сверяем НЕ содержимое, а наличие.
    ru_ld, en_ld = LDJSON.findall(ru_text), LDJSON.findall(en_text)
    if len(ru_ld) != len(en_ld):
        problems.append(
            f"блоков разметки ld+json разное число: {len(ru_ld)} в русской против "
            f"{len(en_ld)} в английской. Цена и ответы в разметке — то, что поисковик "
            "и ИИ показывают до перехода; пропал блок — пропала страница из их ответов."
        )

    ru_s, en_s = skeleton(ru_text), skeleton(en_text)

    # 2. Состав и порядок тегов. Ловит потерянную секцию и лишнюю карточку —
    #    то есть перевод, отставший от русской страницы по составу.
    if ru_s.tags != en_s.tags:
        problems.append(
            f"состав тегов разный: {len(ru_s.tags)} в русской против {len(en_s.tags)} в английской"
        )
        for i, (a, b) in enumerate(zip(ru_s.tags, en_s.tags)):
            if a != b:
                problems.append(f"первое расхождение на теге №{i}: <{a}> против <{b}>")
                break

    # 3. Якоря разделов: разъехались — ссылки в шапке ведут в никуда.
    if ru_s.ids != en_s.ids:
        problems.append(
            "якоря разделов разные: "
            f"только в русской {sorted(set(ru_s.ids) - set(en_s.ids))}, "
            f"только в английской {sorted(set(en_s.ids) - set(ru_s.ids))}"
        )

    # 4. Классы: ловит опечатку, из-за которой кусок молча теряет оформление.
    #    Разность множеств мало что говорит, когда класс повторяется по всей
    #    странице: выпади одна карточка из десяти — множества сойдутся, а
    #    вёрстка недосчитается блока. Поэтому сначала множества, а если они
    #    сошлись — первое расхождение по месту.
    if ru_s.classes != en_s.classes:
        only_ru = sorted(set(ru_s.classes) - set(en_s.classes))
        only_en = sorted(set(en_s.classes) - set(ru_s.classes))
        if only_ru or only_en:
            problems.append(
                f"классы разные: только в русской {only_ru}, только в английской {only_en}"
            )
        else:
            problems.append(
                f"классы те же, но их разное число: {len(ru_s.classes)} в русской "
                f"против {len(en_s.classes)} в английской"
            )
            for i, (a, b) in enumerate(zip(ru_s.classes, en_s.classes)):
                if a != b:
                    problems.append(f"первое расхождение на классе №{i}: {a!r} против {b!r}")
                    break

    # 5. Ссылки наружу — отдельным прибором: битая ссылка на бота это прямая
    #    потеря человека, а не косметика.
    ru_out = [h for h in ru_s.links if h.startswith(("http", "mailto:"))]
    en_out = [h for h in en_s.links if h.startswith(("http", "mailto:"))]
    if ru_out != en_out:
        problems.append(
            f"внешние ссылки разные: русская {sorted(set(ru_out))}, "
            f"английская {sorted(set(en_out))}"
        )

    # 5a. Ссылки внутрь страницы. Сверяем ТОЛЬКО якоря: ссылки на оферту и
    #     политику различаются по делу — английская страница лежит в /en/ и
    #     зовёт документы от корня, иначе попала бы в несуществующий
    #     /en/oferta.html. Якоря же обязаны совпадать до единого.
    ru_anchors = [h for h in ru_s.links if h.startswith("#")]
    en_anchors = [h for h in en_s.links if h.startswith("#")]
    if ru_anchors != en_anchors:
        problems.append(f"якорные ссылки разные: русская {ru_anchors}, английская {en_anchors}")

    # 5b. Каждый якорь ведёт в существующий раздел. Прибор 3 ловит
    #     переименованный id, но ссылку на него он не видит: переименуй раздел
    #     на обеих страницах разом — и обе молча получат мёртвое меню.
    for rel, s in ((ru_rel, ru_s), (en_rel, en_s)):
        known = set(s.ids)
        for href in s.links:
            if href.startswith("#") and href[1:] not in known:
                problems.append(f"{rel}: ссылка {href!r} ведёт в несуществующий раздел")

    # 6. Переключатель языка — ровно один на странице, и ведёт на другую сторону.
    for rel, text, expect in ((ru_rel, ru_text, ru_switch), (en_rel, en_text, en_switch)):
        found = re.findall(r'<a class="lang" href="([^"]+)"', text)
        if found != [expect]:
            problems.append(
                f"{rel}: переключатель языка должен быть один и вести на {expect!r}, "
                f"нашли {found}"
            )

    # 7. Карта hreflang: обе страницы называют оба языка и умолчание.
    for rel, text in ((ru_rel, ru_text), (en_rel, en_text)):
        for lang in ("ru", "en", "x-default"):
            if f'hreflang="{lang}"' not in text:
                problems.append(f"{rel}: нет строки hreflang={lang!r}")

    # 8. Язык страницы объявлен, и он разный.
    for rel, text, expect in ((ru_rel, ru_text, "ru"), (en_rel, en_text, "en")):
        if f'<html lang="{expect}">' not in text:
            problems.append(f'{rel}: ожидали <html lang="{expect}">')

    # 9. Непереведённый кусок на английской странице.
    #
    #    Ищем НЕ по всему файлу: <style> и <script> перенесены побайтно и
    #    комментарии в них русские по уговору всего репозитория — это
    #    исходник, а не текст для человека. Их равенство русской странице уже
    #    проверено прибором 1, и второй раз мерить их этим прибором значит
    #    получать красное на том, что нарочно одинаково. Вырезаем их и смотрим
    #    ровно то, что человек читает глазами.
    #    Разметку ld+json при этом НЕ вырезаем: в ней лежат те же слова, что
    #    читает человек, и русский ответ, забытый в английской разметке,
    #    уедет в выдачу так же, как русский абзац на странице.
    page = en_text
    for block in blocks(en_text, "style") + blocks(en_text, "script"):
        if LDJSON.fullmatch(block):
            continue
        page = page.replace(block, "<block/>")

    # Кириллица законна ровно в одном месте — у переключателя языка, где
    # человек ищет свой язык глазами и обязан увидеть именно «RU».
    for m in re.finditer(r"[А-Яа-яЁё][А-Яа-яЁё \-]{2,}", page):
        chunk = page[max(0, m.start() - 120) : m.end() + 30]
        if 'class="lang"' in chunk or 'lang="ru"' in chunk:
            continue
        line = page[: m.start()].count("\n") + 1
        problems.append(f"{en_rel}: непереведённый текст {m.group()!r} (строка ~{line})")

    if not problems:
        print(
            f"{ru_rel} ↔ {en_rel}: сходятся — {len(ru_s.tags)} тегов, "
            f"{len(ru_s.ids)} якорей, {len(set(ru_out))} внешних ссылок; "
            f"оформление и скрипт побайтно равны"
        )
    return [f"{ru_rel} ↔ {en_rel}: {p}" for p in problems]


def main() -> int:
    problems: list[str] = []
    for ru_rel, en_rel, ru_switch, en_switch in PAIRS:
        problems += check_pair(ru_rel, en_rel, ru_switch, en_switch)

    if problems:
        print("\nРАСХОЖДЕНИЯ:\n")
        for p in problems:
            print(f"  • {p}")
        print(f"\nвсего: {len(problems)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
