// landing-inside.jsx — секции «Что внутри» (6 блоков пользы) + «Что мы НЕ делаем»
// Палитра через CSS-переменные родителя. Загружается ПЕРЕД constructivist-landing.jsx.

const SANS_I = '"Geist", system-ui, sans-serif';
const MONO_I = '"Geist Mono", "JetBrains Mono", monospace';

// ─── простые конструктивистские иконки (примитивы) ────────────
function IconShape({ type, size = 40 }) {
  const s = size, ink = "var(--ink)", acc = "var(--accent)";
  const common = { width: s, height: s, display: "block" };
  if (type === "morning") return (
    <svg viewBox="0 0 40 40" style={common}><circle cx="20" cy="22" r="9" fill={acc}/>
      <rect x="4" y="33" width="32" height="3" fill={ink}/>
      <rect x="18.5" y="3" width="3" height="8" fill={ink}/></svg>
  );
  if (type === "portrait") return (
    <svg viewBox="0 0 40 40" style={common}><rect x="6" y="4" width="22" height="32" fill="none" stroke={ink} strokeWidth="3"/>
      <rect x="28" y="4" width="8" height="8" fill={acc}/></svg>
  );
  if (type === "coach") return (
    <svg viewBox="0 0 40 40" style={common}><rect x="4" y="6" width="22" height="16" fill={ink}/>
      <rect x="16" y="18" width="20" height="14" fill="none" stroke={acc} strokeWidth="3"/></svg>
  );
  if (type === "anomaly") return (
    <svg viewBox="0 0 40 40" style={common}><polygon points="20,5 37,35 3,35" fill="none" stroke={ink} strokeWidth="3"/>
      <rect x="18.5" y="15" width="3" height="10" fill={acc}/><rect x="18.5" y="28" width="3" height="3" fill={acc}/></svg>
  );
  if (type === "plan") return (
    <svg viewBox="0 0 40 40" style={common}><rect x="5" y="8" width="30" height="5" fill={ink}/>
      <rect x="5" y="18" width="22" height="5" fill={acc}/><rect x="5" y="28" width="14" height="5" fill={ink}/></svg>
  );
  if (type === "discipline") return (
    <svg viewBox="0 0 40 40" style={common}><circle cx="7" cy="20" r="6" fill={acc}/>
      <rect x="16" y="14" width="11" height="12" fill={ink}/>
      <polygon points="33,14 40,27 26,27" fill={ink}/></svg>
  );
  // race — target
  return (
    <svg viewBox="0 0 40 40" style={common}><circle cx="20" cy="20" r="15" fill="none" stroke={ink} strokeWidth="3"/>
      <circle cx="20" cy="20" r="5" fill={acc}/></svg>
  );
}

// ─── Telegram-мини-снимок (стилизованный, не реальный скрин) ───
function TgMock({ time, lines, tag }) {
  return (
    <div style={{ marginTop: 16, background: "var(--ink)", color: "var(--bg)",
      padding: "14px 14px 12px", border: "2px solid var(--ink)" }}>
      {tag ? (
        <div style={{ display: "inline-block", background: "var(--accent)", color: "var(--accent-ink)",
          fontFamily: MONO_I, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", padding: "3px 8px", marginBottom: 10 }}>{tag}</div>
      ) : null}
      <div style={{ fontFamily: MONO_I, fontSize: 9, letterSpacing: "0.12em",
        color: "var(--accent)", textTransform: "uppercase", marginBottom: 8,
        display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
        <span style={{ width: 5, height: 5, background: "var(--accent)" }} />
        @FIZKULT_AI_BOT{time ? " · " + time : ""}
      </div>
      {lines.map((l, i) => (
        <p key={i} style={{ margin: i ? "8px 0 0" : 0, fontSize: 13, lineHeight: 1.5,
          fontFamily: l.mono ? MONO_I : SANS_I, color: l.dim ? "#C9C2B5" : "var(--bg)" }}
          dangerouslySetInnerHTML={{ __html: l.t }} />
      ))}
    </div>
  );
}

// ─── 6 блоков пользы (copy из LANDING_FEATURES_BREAKDOWN) ──────
const FEATURES = [
  { icon: "portrait", tier: "FREE", head: "Архетип и разбор за 5 минут — бесплатно",
    body: "Подключаешь Garmin и Strava — за минуту читаем 90 дней тренировок и сна. Получаешь архетип (один из 6) — карточкой можно поделиться. Через 30 секунд приходит персональный разбор: что сильное, какой паттерн за 90 дней, аномалии, 3 рекомендации.",
    tg: { tag: "ПРИМЕР · ПОСЛЕ 30 ТРЕНИРОВОК", lines: [
      { t: "<b>МНОГОБОРЕЦ.</b> За 90 дней — 426 активностей, баланс трёх дисциплин почти ровный: бег 30%, вело 43%, плавание 27% по времени." },
      { t: "<b>Сильная сторона:</b> дисциплина объёма. 72% времени в Z1—Z2 — близко к поляризованной модели. Длинные сессии стабильны, не разваливаются к концу." },
      { t: "<b>Слабое место за 90 дней:</b> восстановление по средам. После интенсивных вторников HRV проседает в среднем на 18%, а ты всё равно выходишь на ключевую. Трижды за квартал это закончилось вялой тренировкой." },
      { t: "<b>Аномалия:</b> на 6-й неделе ACWR подскочил до 1.5 — резкий набор объёма перед сбором. Травмы не было, но это зона риска." },
      { t: "<b>Рекомендации:</b> сегодня — лёгкий день (HRV ниже нормы); на неделю — тяжёлую беговую со среды на пятницу; перед стартом — за 14 дней срезать вело на 30%, бег держать." },
      { t: "Это базовый разбор. С Pro он приходит каждое утро и пересчитывается под свежие данные.", dim: true },
    ] } },
  { icon: "morning", tier: "FREE · ПН / PRO · ЕЖЕДНЕВНО", head: "Утром знаешь что делать сегодня",
    body: "Каждое утро в 07:30 — ситуация одним сообщением. Сон, HRV, нагрузка за неделю, баланс свежести (TSB), готовность. И главное — что менять сегодня. На русском, без motivation-fluff. Free — раз в неделю, Pro — каждый день.",
    tg: { time: "07:30", lines: [
      { t: "Доброе утро. Сон 5ч 24м, качество 64/100 — главный фактор дня. HRV 36 мс, выше средней. Готовность 50/100." },
      { t: "→ <b>Рекомендую</b> сдвинуть интервальную на завтра. Сегодня — easy run в зоне 2." },
    ] } },
  { icon: "discipline", tier: "BETA-PRO ВКЛЮЧЁН", head: "Статус 3 дисциплин — без оценок",
    body: "Каждая дисциплина — отдельная история. /discipline показывает когда последний раз был бег, велосипед, плавание. Не оценивает, не торопит. Просто статус: что свежо, что выпало из ритма, что сбалансировано. И 2 варианта на сегодня — твой выбор.",
    tg: { tag: "/DISCIPLINE", lines: [
      { mono: true, t: '<span style="color:var(--accent)">●</span> <b>Плавание</b> · 4 дн · 2 км · 45 мин' },
      { mono: true, t: '<span style="color:var(--accent)">▬</span> <b>Велосипед</b> · 3 дн · 45 км · Z2 · 1:40' },
      { mono: true, t: '<span style="color:var(--accent)">▲</span> <b>Бег</b> · 1 дн · 8 км · 48 мин · 6:00/км' },
      { t: "<b>Паттерн:</b> все три за 7 дней. Бег 34%, вело 63%, плавание 3% — крен в вело." },
      { t: "<b>Что можно сейчас:</b>" },
      { dim: true, t: "— Плавание 1.5—2 км, техника: выровнять баланс к старту в Казани (76 дн)." },
      { dim: true, t: "— Бег Z2 60 мин: если ноги после вчера спокойные." },
    ] } },
  { icon: "coach", tier: "PRO", head: "AI-аналитик, который читает твои данные",
    body: "Любой вопрос: «стоит ли завтра темповую?», «почему я тащусь третью неделю?». Читает твою историю Garmin + Strava + план тренера + календарь стартов и отвечает с объяснением «почему». Не заменяет тренера — работает рядом.",
    tg: { lines: [
      { t: "<b>Q:</b> Темпуху завтра? ЧСС вчера странная." },
      { t: "<b>A:</b> HRV упал на 30% от средней, RHR +6 уд/мин — недовосстановление. Темповую лучше на четверг. Нужна сегодня — переведи в свободный темп, зона 2.", dim: false },
    ] } },
  { icon: "anomaly", tier: "PRO", head: "Видим аномалии раньше тебя",
    body: "Пять детекторов 24/7: HRV crash, скачок недельной нагрузки (ACWR spike), elevated RHR, дефицит сна, хронический стресс. Когда срабатывает — push в 10:00 с объяснением: что случилось, что делать, на что смотреть 3 дня.",
    tg: { time: "10:00", lines: [
      { t: "🟠 HRV упал на 32% за 3 дня (38 → 26 мс). Похоже на overreaching." },
      { t: "Рекомендую: сегодня recovery или rest, завтра — ре-оценка по утреннему HRV." },
    ] } },
  { icon: "plan", tier: "PRO", head: "План тренера в твоём контексте",
    body: "Перешли план от тренера — сохраняем, разбираем по дням. Каждое утро видишь: что должен сделать сегодня по плану и что предлагает AI с учётом реальной готовности. Тренер видит твои данные глазами AI, ты — план в живом контексте.",
    tg: { lines: [
      { t: "<b>План на чт:</b> 3×1km @ 4:00/km", mono: true },
      { t: "Готовность 78/100 — выше нормы. К выполнению: разогрев 15 мин, 3 повтора с паузой 90 сек. HR на 3-м не выше 178." },
    ] } },
  { icon: "race", tier: "PRO", head: "Подготовка к старту — за 12 недель до",
    body: "Добавляешь старт — Olympic, half, Ironman. Бот считает фазу (база / build / пик / тейпер) и каждый бриф её учитывает: приоритет недели, объём, когда test workout. За 14 дней — race-week brief: как спать, как разогреваться, на что смотреть в первые 10 минут.",
    tg: { lines: [
      { t: "Olympic Triathlon · 53 дня · фаза: build", mono: true },
      { t: "Приоритет — велосипед. Сегодня 90 мин endurance + 6×30 сек спринты. ACWR 0.77 — можно поднимать." },
    ] } },
];

function WhatsInside() {
  const { m } = React.useContext(window.RCtx);
  return (
    <section id="inside" style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: m ? "56px 20px" : "96px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 8, background: "var(--accent)" }} />
          <div style={{ fontFamily: MONO_I, fontSize: 11, letterSpacing: "0.18em",
            color: "#1A1A1A", textTransform: "uppercase" }}>Что внутри</div>
        </div>
        <h2 style={{ margin: 0, fontSize: m ? 34 : 68, fontWeight: 900, letterSpacing: "-0.04em",
          lineHeight: 0.92, color: "var(--ink)", textTransform: "uppercase", maxWidth: 900 }}>
          Что ты <span style={{ color: "var(--accent)" }}>получаешь.</span>
        </h2>
        <p style={{ margin: "20px 0 0", fontSize: m ? 16 : 18, lineHeight: 1.5, color: "var(--muted)", maxWidth: 600 }}>
          Не список команд — конкретные сценарии. Что AI сделает за тебя каждое утро и перед стартом.
        </p>

        <div style={{ marginTop: m ? 36 : 56, display: "grid",
          gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: m ? 20 : 28 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ border: "3px solid var(--ink)", padding: "26px 26px 28px",
              background: "var(--panel)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <IconShape type={f.icon} size={44} />
                <span style={{ fontFamily: MONO_I, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent-ink)",
                  background: "var(--ink)", padding: "4px 8px", whiteSpace: "nowrap" }}>{f.tier}</span>
              </div>
              <h3 style={{ margin: "20px 0 0", fontSize: m ? 20 : 24, fontWeight: 900, letterSpacing: "-0.02em",
                lineHeight: 1.0, textTransform: "uppercase", color: "var(--ink)" }}>{f.head}</h3>
              <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.55, color: "var(--muted)" }}>{f.body}</p>
              <TgMock time={f.tg.time} lines={f.tg.lines} tag={f.tg.tag} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NotDoing() {
  const { m } = React.useContext(window.RCtx);
  const items = [
    ["Не заменяем тренера", "работаем рядом с ним"],
    ["Не даём медицинских рекомендаций", "при болях направляем к врачу"],
    ["Не следим через GPS", "только агрегированные данные Garmin"],
    ["Не делаем benchmark vs другие", "фокус на твоей динамике"],
  ];
  return (
    <section style={{ background: "var(--bg-alt)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: m ? "48px 20px" : "80px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 40, height: 8, background: "var(--accent)" }} />
          <div style={{ fontFamily: MONO_I, fontSize: 11, letterSpacing: "0.18em",
            color: "#1A1A1A", textTransform: "uppercase" }}>Что мы НЕ делаем</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: m ? "1fr" : "1fr 1fr", gap: 0,
          border: "3px solid var(--ink)" }}>
          {items.map((it, i) => (
            <div key={i} style={{ padding: "24px 26px",
              borderRight: (!m && i % 2 === 0) ? "3px solid var(--ink)" : "none",
              borderBottom: (m ? i < 3 : i < 2) ? "3px solid var(--ink)" : "none",
              display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "var(--accent)", lineHeight: 1 }}>—</span>
              <div>
                <div style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.02em",
                  textTransform: "uppercase", color: "var(--ink)" }}>{it[0]}</div>
                <div style={{ fontSize: 15, color: "var(--muted)", marginTop: 4 }}>{it[1]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { WhatsInside, NotDoing });
