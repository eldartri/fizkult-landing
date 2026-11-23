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
    ("oferta.html", "en/terms.html", "/en/terms", "/oferta"),
]

# Пары разборов серии «Метрики Garmin». Сверяются ПО-ДРУГОМУ, не как пары выше.
#
# У страниц лендинга состав блоков обязан совпадать: это одна и та же страница
# на двух языках, и лишняя карточка с одной стороны — потерянная секция с
# другой. У разбора состав различается ПО ДЕЛУ. В русской таблице полос стоит
# третья колонка с переводом английских названий; в английской переводить
# нечего, и колонки там две. Требовать от неё пустую колонку ради прибора
# значит портить страницу в угоду сторожу.
#
# Поэтому здесь сверяется не скелет, а то, чья поломка стоит денег:
# оформление (побайтно — иначе страница приедет с чужим видом), число блоков
# разметки, карта hreflang, объявленный язык, переключатель и забытый русский
# абзац. Выпустил английский близнец — допиши сюда строку, иначе дрейф между
# языками снова станет тихим.
ARTICLE_PAIRS = [
    ("garmin/index.html", "en/garmin/index.html", "/en/garmin/", "/garmin/"),
    # Витрина калькуляторов — та же порода, что витрина разборов: текст и
    # ссылки свои, а оформление и языковая обвязка общие.
    ("calc/index.html", "en/calc/index.html", "/en/calc/", "/calc/"),
    (
        "garmin/body-battery.html",
        "en/garmin/body-battery.html",
        "/en/garmin/body-battery",
        "/garmin/body-battery",
    ),
    (
        "garmin/stress.html",
        "en/garmin/stress.html",
        "/en/garmin/stress",
        "/garmin/stress",
    ),
    (
        "garmin/training-readiness.html",
        "en/garmin/training-readiness.html",
        "/en/garmin/training-readiness",
        "/garmin/training-readiness",
    ),
    (
        "garmin/vo2max.html",
        "en/garmin/vo2max.html",
        "/en/garmin/vo2max",
        "/garmin/vo2max",
    ),
    (
        "garmin/sleep-score.html",
        "en/garmin/sleep-score.html",
        "/en/garmin/sleep-score",
        "/garmin/sleep-score",
    ),
    (
        "garmin/training-status.html",
        "en/garmin/training-status.html",
        "/en/garmin/training-status",
        "/garmin/training-status",
    ),
    (
        "garmin/training-effect.html",
        "en/garmin/training-effect.html",
        "/en/garmin/training-effect",
        "/garmin/training-effect",
    ),
    (
        "garmin/recovery-time.html",
        "en/garmin/recovery-time.html",
        "/en/garmin/recovery-time",
        "/garmin/recovery-time",
    ),
    (
        "garmin/hrv-status.html",
        "en/garmin/hrv-status.html",
        "/en/garmin/hrv-status",
        "/garmin/hrv-status",
    ),
    (
        "garmin/training-load.html",
        "en/garmin/training-load.html",
        "/en/garmin/training-load",
        "/garmin/training-load",
    ),
    (
        "garmin/race-predictor.html",
        "en/garmin/race-predictor.html",
        "/en/garmin/race-predictor",
        "/garmin/race-predictor",
    ),
]


# Пары калькуляторов. Сверяются ТРЕТЬИМ способом, и вот почему.
#
# У разбора скрипта нет вовсе, и побайтная сверка <script> обходится даром.
# У калькулятора скрипт — это сам продукт, и он не может быть побайтно равен:
# внутри лежат надписи, которые человек читает («Нужны дистанция и темп»,
# «Финиш»), а они обязаны быть на своём языке. Требовать равенства значит
# требовать английскую страницу с русскими кнопками.
#
# Но дорого стоит не разница надписей, а разница АРИФМЕТИКИ: поправили
# перевод миль в одной странице и забыли в другой — и английский человек
# получает другое число на тот же вопрос, молча. Поэтому скрипт сверяется
# без строковых литералов и комментариев: что считается — одинаково, чем
# подписано — по-своему. Отсюда и устройство самих страниц: все надписи
# вынесены в объект T наверху файла, ниже него строк нет.
CALC_PAIRS = [
    ("calc/pace.html", "en/calc/pace.html", "/en/calc/pace", "/calc/pace"),
    ("calc/predict.html", "en/calc/predict.html", "/en/calc/predict", "/calc/predict"),
    ("calc/hr-zones.html", "en/calc/hr-zones.html", "/en/calc/hr-zones", "/calc/hr-zones"),
    ("calc/bmi.html", "en/calc/bmi.html", "/en/calc/bmi", "/calc/bmi"),
]

#: Строковый литерал и строчный комментарий — всё, чем двум языкам разрешено
#  различаться внутри <script>. Строки вырезаем первыми: иначе «//» внутри
#  надписи был бы принят за начало комментария и съел бы остаток строки.
JS_STRING = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"")
JS_COMMENT = re.compile(r"//[^\n]*")


def js_logic(block: str | None) -> str | None:
    """Скрипт без надписей: только то, что считается."""
    if block is None:
        return None
    text = JS_STRING.sub('""', block)
    text = JS_COMMENT.sub("", text)
    return re.sub(r"\s+", " ", text).strip()


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

    #: Метки подтверждения прав в панелях вебмастеров. Они принадлежат
    #  ДОМЕНУ, а не странице: панель смотрит на корень сайта и больше никуда.
    #  Повторять их на английской половине значило бы утверждать то же самое
    #  там, где никто не читает, и заводить токену второй дом. Поэтому они
    #  выпадают из скелета, как выпадают слова: сверяем остальное.
    VERIFICATION = {"yandex-verification", "google-site-verification", "msvalidate.01"}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        if tag == "meta" and a.get("name") in self.VERIFICATION:
            return
        self.tags.append(tag)
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

# Счётчик Метрики (22.11.2026) стоит на всех страницах обеих половин и
# побайтно одинаков — его ставит `scripts/apply-metrika.py` из одного
# исходника. Для сверки пар это не поведение страницы, а машинерия: если
# счётчик разъедется, это поймает не сторож пар, а повторный прогон
# установщика. Поэтому из сверки <script> он исключён так же, как разметка.
METRIKA = re.compile(
    r'<script\b[^>]*>\s*\(function\(m,e,t,r,i,k,a\).*?</script>', re.S
)


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
    hits = [
        h
        for h in blocks(text, tag)
        if not LDJSON.fullmatch(h) and not METRIKA.fullmatch(h)
    ]
    if len(hits) > 1:
        sys.exit(f"{where}: ожидали не больше одного блока <{tag}>, нашли {len(hits)}")
    return hits[0] if hits else None


def _norm_start(href: str, ru_slug: str = "", en_slug: str = "") -> str:
    """Сводит языковую метку deeplink к одному виду, чтобы сверять остальное.

    site_en_club → site_club, одинокий site_en → site_ru. Русскую сторону
    трогать не нужно: она и есть нормальная форма. Отдельный случай — метка
    по имени самой страницы: адреса пары разные по делу (tarify ↔ pricing),
    и метка повторяет адрес своей стороны; тогда сводим имя страницы
    к русскому.
    """
    href = re.sub(r"(start=site)_en_", r"\1_", href)
    href = re.sub(r"(start=site)_en\b", r"\1_ru", href)
    if ru_slug and en_slug and en_slug != ru_slug:
        href = re.sub(rf"(start=site)_{re.escape(en_slug)}\b", rf"\1_{ru_slug}", href)
    return href


def read_pair(ru_rel: str, en_rel: str) -> tuple[str, str]:
    out = []
    for rel in (ru_rel, en_rel):
        path = ROOT / rel
        if not path.exists():
            sys.exit(f"нет файла {path}")
        out.append(path.read_text(encoding="utf-8"))
    return out[0], out[1]


def check_shell(
    ru_rel: str, en_rel: str, ru_text: str, en_text: str, script: str = "bytes"
) -> list[str]:
    """Оформление, поведение и число блоков разметки.

    Общая часть всех трёх сверок: и у страницы лендинга, и у разбора, и у
    калькулятора эти вещи обязаны совпадать независимо от того, совпадает ли
    состав блоков.

    `script="logic"` — для калькуляторов: скрипт сверяется без надписей,
    см. комментарий к CALC_PAIRS.
    """
    problems: list[str] = []

    # 1. Оформление и поведение — побайтно. Разошлись — английская страница
    #    приедет с чужим видом или с мёртвыми кнопками.
    for tag in ("style", "script"):
        ru_block = one_block(ru_text, tag, ru_rel)
        en_block = one_block(en_text, tag, en_rel)
        if tag == "script" and script == "logic":
            if js_logic(ru_block) != js_logic(en_block):
                problems.append(
                    "<script> разъехался по арифметике (надписи в сверку не входят): "
                    f"{len(js_logic(ru_block) or '')} значимых знаков в русской против "
                    f"{len(js_logic(en_block) or '')} в английской. Считаться обе страницы "
                    "обязаны одинаково; на своём языке — только то, что лежит в объекте T."
                )
            continue
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

    return problems


def check_skeleton(ru_rel: str, en_rel: str, ru_s: Skeleton, en_s: Skeleton) -> list[str]:
    """Состав блоков: теги, якоря, классы.

    Только для пар страниц лендинга. У разборов состав различается по делу —
    см. комментарий к ARTICLE_PAIRS.
    """
    problems: list[str] = []

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

    return problems


def check_links(ru_rel: str, en_rel: str, ru_s: Skeleton, en_s: Skeleton) -> list[str]:
    """Ссылки наружу и якоря внутрь — общая часть обеих сверок."""
    problems: list[str] = []

    # 5. Ссылки наружу — отдельным прибором: битая ссылка на бота это прямая
    #    потеря человека, а не косметика.
    #
    #    Метка языка в deeplink сравнивается нормализованной. Английская
    #    страница обязана звать бота английской меткой — иначе источник в
    #    статистике слипнется с русским, а метка и заведена ради разделения.
    #    Сторож, который этого не знал, краснел на ровном месте с 21.11.2026 —
    #    а красный сторож перестают читать, и он умирает молча.
    #    Сверяем, что метки парные: site_X ↔ site_en_X, site_ru ↔ site_en.
    #    Всё остальное в ссылке — хост, путь, параметры — сверяется как прежде.
    ru_out = [h for h in ru_s.links if h.startswith(("http", "mailto:"))]
    en_out = [h for h in en_s.links if h.startswith(("http", "mailto:"))]
    ru_slug = ru_rel.rsplit("/", 1)[-1].removesuffix(".html")
    en_slug = en_rel.rsplit("/", 1)[-1].removesuffix(".html")
    if [_norm_start(h, ru_slug, en_slug) for h in ru_out] != [
        _norm_start(h, ru_slug, en_slug) for h in en_out
    ]:
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

    return problems


def check_lang(
    ru_rel: str, en_rel: str, ru_text: str, en_text: str, ru_switch: str, en_switch: str
) -> list[str]:
    """Языковая обвязка: переключатель, hreflang, объявленный язык, кириллица."""
    problems: list[str] = []

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

    return problems


def check_pair(ru_rel: str, en_rel: str, ru_switch: str, en_switch: str) -> list[str]:
    """Пара страниц лендинга: сверяется всё, включая состав блоков."""
    ru_text, en_text = read_pair(ru_rel, en_rel)
    ru_s, en_s = skeleton(ru_text), skeleton(en_text)

    problems = (
        check_shell(ru_rel, en_rel, ru_text, en_text)
        + check_skeleton(ru_rel, en_rel, ru_s, en_s)
        + check_links(ru_rel, en_rel, ru_s, en_s)
        + check_lang(ru_rel, en_rel, ru_text, en_text, ru_switch, en_switch)
    )

    if not problems:
        print(
            f"{ru_rel} ↔ {en_rel}: сходятся — {len(ru_s.tags)} тегов, "
            f"{len(ru_s.ids)} якорей, "
            f"{len({h for h in ru_s.links if h.startswith(('http', 'mailto:'))})} "
            "внешних ссылок; оформление и скрипт побайтно равны"
        )
    return [f"{ru_rel} ↔ {en_rel}: {p}" for p in problems]


def check_article_pair(
    ru_rel: str, en_rel: str, ru_switch: str, en_switch: str
) -> list[str]:
    """Пара разборов: всё то же, КРОМЕ состава блоков — см. ARTICLE_PAIRS.

    Ссылки тоже не сверяются: разбор зовёт из текста соседние разборы, а по
    русскую сторону их семь против одного по английскую — это и есть
    догоняющий выпуск английской половины, а не дрейф. Остаётся то, чья
    поломка стоит денег: оформление, число блоков разметки и языковая
    обвязка.
    """
    ru_text, en_text = read_pair(ru_rel, en_rel)

    problems = check_shell(ru_rel, en_rel, ru_text, en_text) + check_lang(
        ru_rel, en_rel, ru_text, en_text, ru_switch, en_switch
    )

    if not problems:
        print(
            f"{ru_rel} ↔ {en_rel}: сходятся — оформление побайтно равно, "
            "разметка на месте, языковая обвязка парная"
        )
    return [f"{ru_rel} ↔ {en_rel}: {p}" for p in problems]


def check_calc_pair(
    ru_rel: str, en_rel: str, ru_switch: str, en_switch: str
) -> list[str]:
    """Пара калькуляторов: оформление побайтно, арифметика — без надписей.

    Состав блоков не сверяется: у русского калькулятора свой список дистанций
    (3 км, 1500 м), у английского свой (10 миль) — это разные привычки, а не
    дрейф. Сверяется то, чья поломка стоит денег: вид, разметка, языковая
    обвязка и — главное — то, как страница считает.
    """
    ru_text, en_text = read_pair(ru_rel, en_rel)

    problems = check_shell(
        ru_rel, en_rel, ru_text, en_text, script="logic"
    ) + check_lang(ru_rel, en_rel, ru_text, en_text, ru_switch, en_switch)

    if not problems:
        print(
            f"{ru_rel} ↔ {en_rel}: сходятся — оформление побайтно равно, "
            "арифметика одна на двоих, языковая обвязка парная"
        )
    return [f"{ru_rel} ↔ {en_rel}: {p}" for p in problems]


def main() -> int:
    problems: list[str] = []
    for ru_rel, en_rel, ru_switch, en_switch in PAIRS:
        problems += check_pair(ru_rel, en_rel, ru_switch, en_switch)
    for ru_rel, en_rel, ru_switch, en_switch in ARTICLE_PAIRS:
        problems += check_article_pair(ru_rel, en_rel, ru_switch, en_switch)
    for ru_rel, en_rel, ru_switch, en_switch in CALC_PAIRS:
        problems += check_calc_pair(ru_rel, en_rel, ru_switch, en_switch)

    if problems:
        print("\nРАСХОЖДЕНИЯ:\n")
        for p in problems:
            print(f"  • {p}")
        print(f"\nвсего: {len(problems)}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
