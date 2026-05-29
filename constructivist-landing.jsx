// constructivist-landing.jsx — главная fizkult.ai · Конструктивизм + AI (типографически)
// Responsive: телефон / планшет / десктоп. Палитра-driven через CSS-переменные.
// Секции «Что внутри» / «Что НЕ делаем» — в landing-inside.jsx (window.WhatsInside / NotDoing).

const SANS = '"Geist", system-ui, sans-serif';
const MONO = '"Geist Mono", "JetBrains Mono", monospace';
const PAGE_W = 1280;

// ─── responsive context ───────────────────────────────────────
const RCtx = React.createContext({ m: false, vw: 1280 });
window.RCtx = RCtx;
function useVW() {
  const [w, setW] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  React.useEffect(() => {
    const f = () => setW(window.innerWidth);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return w;
}
const useR = () => React.useContext(RCtx);

// ─── 6 канонических архетипов ─────────────────────────────────
const ARCH = [
  { no: "01", name: "СТАЙЕР",     hero: "54.2",  unit: "VO2MAX · БЕГ",
    stats: [["680","ОБЪЁМ КМ"],["84","Z1—Z2 %"],["48","RHR"]],
    badge: "РАННИЕ СТАРТЫ · 80%", tag: "Дисциплина выше комфорта." },
  { no: "02", name: "ТЕМПОВИК",   hero: "3.7",   unit: "FTP/КГ · ВЕЛО",
    stats: [["540","ОБЪЁМ КМ"],["28","Z3—Z4 %"],["1.2","ТЕМП/НЕД"]],
    badge: "FTP +14 ВТ · Q1", tag: "Работает у порога." },
  { no: "03", name: "СИСТЕМЩИК",  hero: "127",   unit: "ДНЕЙ ПОДРЯД",
    stats: [["1.08","ACWR"],["87","НЕД 3+ %"],["78","ТРЕН 90Д"]],
    badge: "STREAK · 127 ДНЕЙ", tag: "Регулярность важнее объёма." },
  { no: "04", name: "МНОГОБОРЕЦ", hero: "127",   unit: "ЧАСОВ · 90 ДНЕЙ", multi: true,
    stats: [["380","БЕГ КМ"],["2 100","ВЕЛО КМ"],["32","ПЛАВ КМ"]],
    badge: "IRONMAN · FINISHER", tag: "Три дисциплины в балансе.",
    split: [0.30, 0.55, 0.15] },
  { no: "05", name: "ГОНЩИК",     hero: "1:38",  unit: "PR · ПОЛУМАРАФОН",
    stats: [["5","СТАРТОВ"],["3","PR / 90Д"],["540","ОБЪЁМ КМ"]],
    badge: "70.3 · 5:14", tag: "Сезон расписан за полгода." },
  { no: "06", name: "НОВИЧОК",    hero: "42",    unit: "ДЕНЬ · СТАРТ",
    stats: [["28","ТРЕН"],["156","КМ"],["3.4","/ НЕД"]],
    badge: "БАЗА НАБИРАЕТСЯ", tag: "Day one — это уже архетип." },
];

// ─── archetype card (fluid width, fixed height) ───────────────
function Card({ a, size = "md" }) {
  const H = size === "lg" ? 556 : 500;
  const maxW = size === "lg" ? 340 : 320;
  const archSize = size === "lg" ? 38 : 30;
  const heroSize = size === "lg" ? 100 : 86;
  return (
    <div style={{
      width: "100%", maxWidth: maxW, height: H, background: "var(--accent)", color: "var(--accent-ink)",
      fontFamily: SANS, position: "relative", overflow: "hidden",
      boxSizing: "border-box", padding: 20, border: "3px solid var(--ink)",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 72, height: 72,
        background: "var(--ink)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 1, fontSize: 10, fontWeight: 900,
        letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <span>● ФИЗКУЛЬТ</span>
        <span style={{ color: "var(--accent)", fontFamily: MONO }}>{a.no}/06</span>
      </div>
      <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 9, fontWeight: 700,
        letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.85,
        display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
        <span style={{ width: 5, height: 5, background: "var(--accent-ink)",
          animation: "blink 1.6s steps(2) infinite" }} />
        АНАЛИЗ · 90Д
      </div>
      <h3 style={{ margin: "6px 0 0", fontSize: archSize, fontWeight: 900,
        letterSpacing: "-0.03em", lineHeight: 0.88, textTransform: "uppercase" }}>{a.name}</h3>
      <div style={{ marginTop: 14, fontSize: heroSize, fontWeight: 900,
        letterSpacing: "-0.05em", lineHeight: 0.82, fontVariantNumeric: "tabular-nums" }}>{a.hero}</div>
      <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase" }}>{a.unit}</div>
      {a.split ? (
        <div style={{ marginTop: 16, display: "flex", gap: 3 }}>
          {a.split.map((f, i) => (
            <div key={i} style={{ flex: f, height: 14,
              background: i === 0 ? "var(--accent-ink)" : "var(--ink)",
              opacity: i === 2 ? 0.5 : 1 }} />
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 16, height: 8, background: "var(--ink)" }} />
      )}
      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {a.stats.map(([v, l], i) => (
          <div key={i} style={{ paddingRight: 6,
            borderRight: i < 2 ? "1.5px solid currentColor" : "none", paddingLeft: i > 0 ? 8 : 0 }}>
            <div style={{ fontSize: size === "lg" ? 22 : 19, fontWeight: 900,
              letterSpacing: "-0.02em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.06em",
              textTransform: "uppercase", marginTop: 4, opacity: 0.7, lineHeight: 1.2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
        <div style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", opacity: 0.7, marginBottom: 5 }}>
          ПРИМЕР · после 30 тренировок
        </div>
        <div style={{ background: "var(--ink)", color: "var(--accent)", textAlign: "center",
          padding: "9px 0", fontSize: size === "lg" ? 15 : 13, fontWeight: 900,
          letterSpacing: "0.04em", textTransform: "uppercase" }}>{a.badge}</div>
      </div>
    </div>
  );
}

// ─── shared bits ──────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ width: 40, height: 8, background: "var(--accent)" }} />
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em",
        color: "#1A1A1A", textTransform: "uppercase" }}>{children}</div>
    </div>
  );
}
function Title({ children }) {
  const { m } = useR();
  return (
    <h2 style={{ margin: 0, fontSize: m ? 34 : 68, fontWeight: 900, letterSpacing: "-0.04em",
      lineHeight: 0.94, color: "var(--ink)", textTransform: "uppercase",
      maxWidth: 900, textWrap: "balance" }}>{children}</h2>
  );
}
const btn = {
  background: "var(--ink)", color: "var(--accent)", border: "none", padding: "16px 26px",
  fontSize: 14, fontWeight: 900, letterSpacing: "0.04em", textTransform: "uppercase",
  cursor: "pointer", fontFamily: SANS, borderRadius: 0,
};
function Consent({ center }) {
  return (
    <p style={{ margin: "14px 0 0", fontSize: 11, lineHeight: 1.5, color: "#1A1A1A",
      maxWidth: 420, fontFamily: MONO, letterSpacing: "0.02em",
      textAlign: center ? "center" : "left", marginLeft: center ? "auto" : 0,
      marginRight: center ? "auto" : 0 }}>
      Подключая Garmin / Strava, ты соглашаешься на обработку и трансграничную передачу
      данных. <span style={{ textDecoration: "underline" }}>Политика обработки ПДн</span>
    </p>
  );
}
const pad = (m) => (m ? "56px 20px" : "96px 48px");

// 152-ФЗ gated CTA — кнопка заблокирована пока не отмечен явный чекбокс
 function GatedCTA({ label, hint, center, full }) {
  const [ok, setOk] = React.useState(false);
  return (
    <div style={{ textAlign: center ? "center" : "left" }}>
      <button disabled={!ok} style={{ background: "var(--ink)", color: "var(--accent)",
        border: "none", padding: "18px 30px", fontSize: 15, fontWeight: 900, letterSpacing: "0.04em",
        textTransform: "uppercase", fontFamily: SANS, borderRadius: 0,
        width: full ? "100%" : "auto", opacity: ok ? 1 : 0.4,
        cursor: ok ? "pointer" : "not-allowed", transition: "opacity .15s" }}>{label}</button>
      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 14,
        maxWidth: 440, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0,
        cursor: "pointer", textAlign: "left" }}>
        <input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: "var(--accent)", flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.5, color: "#1A1A1A" }}>
          Согласен на обработку и трансграничную передачу данных Garmin / Strava.{" "}
          <span style={{ textDecoration: "underline" }}>Политика обработки ПДн</span>
        </span>
      </label>
      {hint ? <div style={{ fontFamily: MONO, fontSize: 11, color: "#1A1A1A",
        letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 12 }}>{hint}</div> : null}
    </div>
  );
}

// ═══ SECTIONS ══════════════════════════════════════════════════
function Nav() {
  const { m } = useR();
  return (
    <nav style={{ borderBottom: "3px solid var(--ink)", background: "var(--bg)",
      position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: m ? "14px 20px" : "18px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 10, height: 28, background: "var(--accent)" }} />
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em",
            textTransform: "uppercase" }}>ФИЗКУЛЬТ</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 12,
          fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
          {m ? null : (<><span>Архетипы</span><span>Что внутри</span><span>Тарифы</span></>)}
          <button style={{ ...btn, padding: "10px 18px", fontSize: 11, whiteSpace: "nowrap" }}>Архетип →</button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const { m } = useR();
  return (
    <section style={{ background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      {m ? null : (<>
        <div style={{ position: "absolute", left: -140, bottom: -260, width: 460, height: 460,
          background: "var(--accent)", transform: "rotate(-12deg)", zIndex: 0 }} />
        <div style={{ position: "absolute", right: 360, top: -40, width: 8, height: 420,
          background: "var(--ink)", transform: "rotate(15deg)", zIndex: 0 }} />
      </>)}

      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: m ? "40px 20px 56px" : "60px 48px 84px",
        position: "relative", zIndex: 1, display: "grid",
        gridTemplateColumns: m ? "1fr" : "1.25fr 1fr", gap: m ? 36 : 40, alignItems: "center" }}>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", background: "var(--accent)", color: "var(--accent-ink)",
            fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", whiteSpace: "nowrap" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-ink)" }} />
            BETA · БЕСПЛАТНО
          </span>
          <h1 style={{ margin: "20px 0 0", fontSize: m ? 46 : 98, fontWeight: 900,
            letterSpacing: "-0.05em", lineHeight: 0.84, textTransform: "uppercase",
            color: "var(--ink)" }}>
            КАКОЙ ТЫ<br/><span style={{ color: "var(--accent)" }}>СПОРТСМЕН.</span>
          </h1>
          <p style={{ margin: "22px 0 0", fontSize: m ? 16 : 17, lineHeight: 1.5, color: "var(--ink)",
            maxWidth: 460, fontWeight: 500 }}>
            Подключаешь Garmin или Strava. Алгоритм читает 90 дней тренировок и собирает
            твой архетип за 2 минуты.
          </p>

          <div style={{ marginTop: 24, display: "block", boxSizing: "border-box",
            width: m ? "100%" : "auto", border: "2px solid var(--ink)", padding: "14px 18px",
            background: "var(--bg)" }}>
            <div style={{ fontFamily: MONO, fontSize: m ? 10 : 11, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "#1A1A1A" }}>
              GARMIN · STRAVA · ПЛАН ТРЕНЕРА · МЕД-ОГРАНИЧЕНИЯ
            </div>
            <div style={{ textAlign: "center", color: "var(--accent)", fontSize: 16, lineHeight: 1, margin: "4px 0" }}>↓</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--ink)", color: "var(--accent-ink)", padding: "4px 10px",
              fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", whiteSpace: "nowrap" }}>
              <span style={{ width: 5, height: 5, background: "var(--accent)",
                animation: "blink 1.6s steps(2) infinite" }} />
              ФИЗКУЛЬТ читает за 60 сек
            </div>
            <div style={{ textAlign: "center", color: "var(--accent)", fontSize: 16, lineHeight: 1, margin: "4px 0" }}>↓</div>
            <div style={{ fontFamily: MONO, fontSize: m ? 10 : 11, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--accent)" }}>
              АРХЕТИП + РАЗБОР + ЕЖЕДНЕВНЫЕ СОВЕТЫ
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <GatedCTA label="Узнать архетип →" hint="2 мин · без email" full={m} />
          </div>
          <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#1A1A1A",
              letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Работает с</span>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)" }}>GARMIN</span>
            <span style={{ width: 1, height: 16, background: "rgba(26,26,26,0.3)" }} />
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)" }}>STRAVA</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card a={ARCH[3]} size="lg" />
        </div>
      </div>
    </section>
  );
}

function How() {
  const { m } = useR();
  const steps = [
    ["01", "ПОДКЛЮЧИ GARMIN / STRAVA", "Один клик через OAuth. Берём только тренировки и сон, не GPS-треки."],
    ["02", "АЛГОРИТМ ЧИТАЕТ ПАТТЕРНЫ", "Анализирует 90 дней: когда, сколько, дисциплины, восстановление, нагрузку."],
    ["03", "ПОЛУЧАЕШЬ АРХЕТИП + РАЗБОР", "Карточка 9:16 для Stories + персональный разбор. Делишься — друзья узнают свой."],
  ];
  return (
    <section id="how" style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: pad(m) }}>
        <Label>Как это работает</Label>
        <Title>Три шага.<br/><span style={{ color: "var(--accent)" }}>Две минуты.</span></Title>
        <div style={{ marginTop: m ? 36 : 56, display: "grid",
          gridTemplateColumns: m ? "1fr" : "1fr 1fr 1fr", gap: 0, border: "3px solid var(--ink)" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ padding: "26px 24px 30px", minHeight: m ? 0 : 230,
              borderRight: (!m && i < 2) ? "3px solid var(--ink)" : "none",
              borderBottom: (m && i < 2) ? "3px solid var(--ink)" : "none" }}>
              <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.1em",
                color: "#1A1A1A", fontWeight: 700, marginBottom: 18 }}>{s[0]}</div>
              <div style={{ fontSize: m ? 22 : 26, fontWeight: 900, letterSpacing: "-0.03em",
                lineHeight: 0.98, textTransform: "uppercase" }}>{s[1]}</div>
              <p style={{ margin: "14px 0 0", fontSize: 15, lineHeight: 1.5,
                color: "var(--muted)" }}>{s[2]}</p>
              {i === 1 ? (
                <div style={{ marginTop: 18, display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--ink)", color: "var(--accent)", padding: "6px 10px",
                  fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  <span style={{ width: 6, height: 6, background: "var(--accent)",
                    animation: "blink 1.2s steps(2) infinite" }} />
                  АНАЛИЗ · 90Д · 50+ МЕТРИК
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const { m, vw } = useR();
  const cols = m ? "1fr" : (vw < 1024 ? "1fr 1fr" : "1fr 1fr 1fr");
  return (
    <section id="archetypes" style={{ background: "var(--bg-alt)" }}>
      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: pad(m) }}>
        <Label>6 архетипов</Label>
        <Title>Какой <span style={{ color: "var(--accent)" }}>твой.</span></Title>
        <p style={{ margin: "20px 0 0", fontSize: m ? 16 : 18, lineHeight: 1.5, color: "var(--muted)",
          maxWidth: 600 }}>
          Алгоритм определяет автоматически. Не личностный тест — паттерн тренировок и нагрузки за 90 дней.
        </p>
        <div style={{ marginTop: m ? 36 : 56, display: "grid", gridTemplateColumns: cols,
          gap: 36, justifyItems: "center" }}>
          {ARCH.map(a => (
            <div key={a.no} style={{ width: "100%", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 16 }}>
              <Card a={a} />
              <div style={{ fontSize: 16, fontWeight: 900, textTransform: "uppercase",
                letterSpacing: "-0.01em", textAlign: "center" }}>{a.tag}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: "32px 0 0", fontSize: 12, color: "#1A1A1A", fontFamily: MONO,
          letterSpacing: "0.04em", textAlign: "center" }}>
          Цифры на карточках — пример. Твои появятся после подключения (30+ тренировок).
        </p>
        <div style={{ marginTop: m ? 36 : 48, textAlign: "center" }}>
          <button style={{ ...btn, fontSize: m ? 14 : 16, padding: m ? "16px 24px" : "20px 40px" }}>
            Узнать свой архетип бесплатно →
          </button>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { m } = useR();
  return (
    <section id="pricing" style={{ background: "var(--bg)" }}>
      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: pad(m) }}>
        <Label>Тарифы</Label>
        <Title>Архетип — <span style={{ color: "var(--accent)" }}>всегда бесплатно.</span></Title>
        <p style={{ margin: "20px 0 0", fontSize: m ? 16 : 18, lineHeight: 1.5, color: "var(--muted)", maxWidth: 600 }}>
          Подписка — для ежедневного брифа, AI-аналитика и подготовки к старту.
        </p>

        <div style={{ marginTop: m ? 36 : 52, display: "grid",
          gridTemplateColumns: m ? "1fr" : "1fr 1.2fr", gap: 28 }}>
          {/* FREE */}
          <div style={{ background: "var(--panel)", color: "var(--ink)", padding: "30px 28px 28px",
            border: "3px solid var(--ink)", position: "relative" }}>
            <div style={{ position: "absolute", top: -13, left: 24, background: "var(--ink)",
              color: "var(--bg)", fontFamily: MONO, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", whiteSpace: "nowrap" }}>БЕСПЛАТНО</div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: "-0.02em" }}>Free</div>
            <div style={{ marginTop: 12, fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em",
              lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>₽0</div>
            <ul style={{ margin: "24px 0 0", padding: 0, listStyle: "none", fontSize: 15, lineHeight: 1.5 }}>
              {["Архетип и разбор за 5 минут",
                "Утром по понедельникам — что делать (sample)",
                "Карточка 9:16 для шеринга"].map((f, j) => (
                <li key={j} style={{ padding: "10px 0", borderTop: "1px solid rgba(26,26,26,0.14)",
                  display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 900 }}>✓</span>{f}</li>
              ))}
            </ul>
            <button style={{ marginTop: 24, width: "100%", padding: "15px 0", background: "var(--ink)",
              color: "var(--bg)", border: "none", fontSize: 13, fontWeight: 900, letterSpacing: "0.04em",
              textTransform: "uppercase", cursor: "pointer", fontFamily: SANS }}>Узнать архетип →</button>
          </div>
          {/* PRO */}
          <div style={{ background: "var(--ink)", color: "var(--bg)", padding: "30px 28px 28px",
            border: "3px solid var(--ink)", position: "relative" }}>
            <div style={{ position: "absolute", top: -13, left: 24, background: "var(--accent)",
              color: "var(--accent-ink)", fontFamily: MONO, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", whiteSpace: "nowrap" }}>ПОЛНЫЙ ДОСТУП</div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", justifyContent: "space-between",
              flexWrap: "wrap", gap: 6 }}>
              <div style={{ fontSize: 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>Pro</div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: "#E8E2D6", letterSpacing: "0.08em" }}>
                ₽12 990 / ГОД · <span style={{ color: "var(--accent)" }}>−27%</span></div>
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                fontVariantNumeric: "tabular-nums" }}>₽1 490</span>
              <span style={{ fontSize: 14, color: "#9F9A92" }}>/ мес</span>
            </div>
            <ul style={{ margin: "24px 0 0", padding: 0, listStyle: "none", fontSize: 15, lineHeight: 1.5 }}>
              {["Утром каждый день — что делать сегодня",
                "AI-аналитик — спроси про свои данные в любой момент",
                "Будит когда HRV ушёл в минус — push с разбором",
                "Подготовка к старту — фаза и план до 12 недель",
                "План тренера живёт в боте — твой контекст + AI комментарий"].map((f, j) => (
                <li key={j} style={{ padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.15)",
                  display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 900 }}>✓</span>{f}</li>
              ))}
            </ul>
            <button style={{ marginTop: 24, width: "100%", padding: "15px 0", background: "var(--accent)",
              color: "var(--accent-ink)", border: "none", fontSize: 13, fontWeight: 900,
              letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer",
              fontFamily: SANS }}>Оформить Pro</button>
            <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 10, color: "#C9C2B5",
              letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center" }}>
              Telegram Stars · Карта РФ · СБП через Tribute · отмена в любой момент
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const { m } = useR();
  return (
    <section style={{ background: "var(--accent)", color: "var(--accent-ink)",
      position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -80, left: -80, width: 300, height: 300,
        background: "var(--ink)", transform: "rotate(20deg)", opacity: 0.12 }} />
      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: m ? "72px 20px" : "104px 48px",
        textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{ margin: 0, fontSize: m ? 40 : 90, fontWeight: 900, letterSpacing: "-0.05em",
          lineHeight: 0.9, textTransform: "uppercase" }}>Узнай свой архетип.</h2>
        <p style={{ margin: "24px auto 0", fontSize: m ? 16 : 19, fontWeight: 700, maxWidth: 520,
          textTransform: "uppercase", letterSpacing: "0.02em" }}>
          Две минуты. Бесплатно. Без email.
        </p>
        <div style={{ marginTop: 36 }}>
          <GatedCTA label="Узнать архетип бесплатно →" center />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { m } = useR();
  const linkS = { color: "var(--bg)", display: "block", textDecoration: "underline",
    fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", padding: "3px 0" };
  return (
    <footer style={{ background: "var(--ink)", color: "var(--bg)" }}>
      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: m ? "40px 20px" : "40px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        flexWrap: "wrap", gap: 28 }}>
        <div style={{ minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 6, height: 22, background: "var(--accent)" }} />
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em",
              textTransform: "uppercase" }}>ФИЗКУЛЬТ</div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#C9C2B5", lineHeight: 1.5, maxWidth: 300 }}>
            Eldar Faizullin — Product Lead. Тихий аналитик, который читает твои данные.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#9F9A92", letterSpacing: "0.14em",
            textTransform: "uppercase" }}>Работает на</div>
          <div style={{ fontSize: 13, color: "#C9C2B5" }}>Garmin · Strava · технология Anthropic Claude</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "#9F9A92", letterSpacing: "0.06em" }}>
            * официальные логотипы + «Powered by Strava» — после approval
          </div>
        </div>
        <div>
          <span style={linkS}>Политика обработки ПДн</span>
          <span style={linkS}>Privacy</span>
          <span style={linkS}>Terms</span>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", padding: m ? "18px 20px" : "18px 48px",
        maxWidth: PAGE_W, margin: "0 auto" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 10, color: "#9F9A92",
          letterSpacing: "0.06em", lineHeight: 1.6 }}>
          Сервис не заменяет врача и тренера, не является медицинской рекомендацией.
          Обработка ПДн — с уведомлением РКН. © 2026 FIZKULT.AI
        </p>
      </div>
    </footer>
  );
}

// ─── full page · responsive ───────────────────────────────────
function ConstructivistLanding({ vars, forceVW }) {
  const auto = useVW();
  const vw = forceVW || auto;
  const m = vw <= 760;
  const Inside = window.WhatsInside, NotDoing = window.NotDoing;
  return (
    <RCtx.Provider value={{ m, vw }}>
      <div style={{ ...vars, width: "100%", maxWidth: PAGE_W, margin: "0 auto",
        fontFamily: SANS, background: "var(--bg)", color: "var(--ink)" }}>
        <Nav /><Hero /><How /><Gallery />
        {Inside ? <Inside /> : null}
        {NotDoing ? <NotDoing /> : null}
        <Pricing /><FinalCTA /><Footer />
      </div>
    </RCtx.Provider>
  );
}

Object.assign(window, { ConstructivistLanding, useR });
