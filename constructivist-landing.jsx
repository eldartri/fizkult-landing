// constructivist-landing.jsx — главная fizkult.ai · Конструктивизм + AI (типографически)
// Responsive: телефон / планшет / десктоп. Палитра-driven через CSS-переменные.
// Секции «Что внутри» / «Что НЕ делаем» — в landing-inside.jsx (window.WhatsInside / NotDoing).

const SANS = '"Geist", system-ui, sans-serif';
const MONO = '"Geist Mono", "JetBrains Mono", monospace';
const PAGE_W = 1280;
const BOT = "https://t.me/fizkult_ai_bot?start=";

// ─── responsive context ───────────────────────────────────────
const RCtx = React.createContext({ m: false, vw: 1280 });
window.RCtx = RCtx;
// общий 152-ФЗ consent: отметил один раз — разблокированы все CTA
const ConsentCtx = React.createContext({ consent: false, setConsent: () => {} });
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
  { no: "01", name: "СТАЙЕР",     viz: "zones", vizData: [84,70,42,20,8],
    tagline: "Длинно и ровно",
    desc: "Аэробная база и низкий пульс. Сила в дистанции и терпении, а не в спринте.",
    stats: [["680","ОБЪЁМ КМ · 90Д"],["84%","В ЗОНАХ Z1—Z2"],["48","ПУЛЬС ПОКОЯ"]] },
  { no: "02", name: "ТЕМПОВИК",   viz: "zones", vizData: [40,52,70,46,24],
    tagline: "Работа у порога",
    desc: "Острые интервалы и контроль FTP. Ты живёшь на грани темпа, а не в комфорте.",
    stats: [["540","ОБЪЁМ КМ · 90Д"],["3.7","FTP / КГ"],["28%","В ЗОНАХ Z3—Z4"]] },
  { no: "03", name: "СИСТЕМЩИК",  viz: "spark", vizData: [10,14,12,18,16,22,20,26,24,30,28,34,33,40],
    tagline: "Без пропусков",
    desc: "Постоянство важнее пиков. Форма растёт на регулярности, а не на подвигах.",
    stats: [["127","ДНЕЙ ПОДРЯД"],["1.08","ACWR · БАЛАНС"],["78","ТРЕНИРОВОК"]] },
  { no: "04", name: "МНОГОБОРЕЦ", viz: "radar", vizData: [0.62, 0.95, 0.42],
    tagline: "Три спорта, один объём",
    desc: "Бег, вело и плавание в балансе. Готовишь тело к длинной мультигонке.",
    stats: [["380","БЕГ · КМ"],["2 100","ВЕЛО · КМ"],["32","ПЛАВ · КМ"]] },
  { no: "05", name: "ГОНЩИК",     viz: "spark", vizData: [22,18,30,24,40,30,52,34,58,30,68,40,74,38],
    tagline: "Заточен под старт",
    desc: "Сезон расписан под гонки. Пики формы подведены точно к датам стартов.",
    stats: [["5","СТАРТОВ · 90Д"],["3","ЛИЧНЫХ РЕКОРДА"],["1:38","ПОЛУМАРАФОН"]] },
  { no: "06", name: "НОВИЧОК",    viz: "zones", vizData: [60,40,22,12,6],
    tagline: "База набирается",
    desc: "Первые недели в деле. Карточка станет точнее после 90 дней данных.",
    stats: [["28","ТРЕНИРОВОК"],["156","ОБЪЁМ КМ"],["3.4","ТРЕН / НЕД"]] },
];

// ─── рондель (знак бренда) ────────────────────────────────────
function Rondel({ size = 20, fg = "var(--ink)", accent = "var(--accent)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="29" stroke={accent} strokeWidth="13" />
      <rect x="44" y="6" width="12" height="88" fill={fg} />
    </svg>
  );
}

// ─── data-viz: зоны пульса ────────────────────────────────────
function ZoneBars({ data = [84,62,40,22,10], h = 46, w = 220 }) {
  const max = Math.max(...data);
  const bw = (w - (data.length - 1) * 6) / data.length;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" fill="none">
      {data.map((v, i) => {
        const bh = Math.max(3, (v / max) * (h - 12)), x = i * (bw + 6);
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={bw} height={bh} fill={i === 0 ? "var(--accent)" : "var(--ink)"}
              opacity={i === 0 ? 1 : 1 - i * 0.14} />
            <text x={x + bw / 2} y={h - 1} textAnchor="middle" fontFamily={MONO}
              fontSize="7" fontWeight="700" fill="var(--ink)" opacity="0.65">Z{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── data-viz: тренд нагрузки ─────────────────────────────────
function Sparkline({ data = [12,18,14,22,19,28,24,33,27,38,31,44,40,52], w = 220, h = 46 }) {
  const max = Math.max(...data), min = Math.min(...data), sx = w / (data.length - 1);
  const Y = v => h - 5 - ((v - min) / (max - min || 1)) * (h - 12);
  const d = data.map((v, i) => `${i ? "L" : "M"}${(i * sx).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const lx = (data.length - 1) * sx, ly = Y(data[data.length - 1]);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" fill="none">
      <line x1="0" y1={h - 5} x2={w} y2={h - 5} stroke="var(--ink)" strokeWidth="1" opacity="0.22" />
      <path d={d} stroke="var(--ink)" strokeWidth="2.4" fill="none" />
      <rect x={lx - 3.5} y={ly - 3.5} width="7" height="7" fill="var(--accent)" />
    </svg>
  );
}

// ─── data-viz: триатлон-радар ─────────────────────────────────
function TriRadar({ data = [0.82,0.95,0.55], size = 104 }) {
  const c = size / 2, R = size / 2 - 16;
  const ang = i => -Math.PI / 2 + (i * 2 * Math.PI) / 3;
  const pt = (i, r) => [c + Math.cos(ang(i)) * R * r, c + Math.sin(ang(i)) * R * r];
  const grid = r => [0,1,2].map(i => pt(i, r).join(",")).join(" ");
  const poly = data.map((v, i) => pt(i, v).join(",")).join(" ");
  const labels = ["БЕГ","ВЕЛО","ПЛАВ"];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      {[1,0.66,0.33].map((r, k) => <polygon key={k} points={grid(r)} fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.26" />)}
      {[0,1,2].map(i => { const [x, y] = pt(i, 1); return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--ink)" strokeWidth="1" opacity="0.26" />; })}
      <polygon points={poly} fill="var(--accent)" fillOpacity="0.85" stroke="var(--ink)" strokeWidth="2" />
      {labels.map((l, i) => { const [x, y] = pt(i, 1.28); return <text key={i} x={x} y={y + 3} textAnchor="middle" fontFamily={MONO} fontSize="7" fontWeight="700" fill="var(--ink)">{l}</text>; })}
    </svg>
  );
}

// ─── авто-подгон имени под ширину колонки (responsive) ────────
function FitName({ text, max = 50, min = 26 }) {
  const wrapRef = React.useRef(null), nameRef = React.useRef(null);
  React.useLayoutEffect(() => {
    const fit = () => {
      const wrap = wrapRef.current, el = nameRef.current;
      if (!wrap || !el) return;
      const avail = wrap.clientWidth;
      if (avail <= 1) return;            // ширина ещё не разрешена — не пинимся к min
      let s = max; el.style.fontSize = s + "px";
      while (el.scrollWidth > avail && s > min) { s -= 1; el.style.fontSize = s + "px"; }
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (wrapRef.current) ro.observe(wrapRef.current);
    // Geist 900 шире фолбэка. fonts.ready может быть уже resolved (шрифт в кеше)
    // и его .then сработает ДО раскладки грида — поэтому переобмеряем через
    // двойной rAF (после того как и ширина колонки, и метрики Geist применены).
    const refit = () => requestAnimationFrame(() => requestAnimationFrame(fit));
    if (document.fonts) {
      if (document.fonts.ready) document.fonts.ready.then(refit);
      try { document.fonts.load('900 50px "Geist"').then(refit); } catch {}
    }
    return () => ro.disconnect();
  }, [text, max, min]);
  return (
    <div ref={wrapRef} style={{ flex: 1, minWidth: 0 }}>
      <h3 ref={nameRef} style={{ margin: 0, fontSize: max, fontWeight: 900, letterSpacing: "-0.035em",
        lineHeight: 0.86, textTransform: "uppercase", whiteSpace: "nowrap", color: "var(--ink)" }}>{text}</h3>
    </div>
  );
}

// ─── archetype card v3 (shareable artefact) ───────────────────
function Card({ a, size = "md" }) {
  const H = size === "lg" ? 556 : 524;
  const maxW = size === "lg" ? 400 : 380;
  const vizLabel = a.viz === "radar" ? "БАЛАНС ДИСЦИПЛИН · 90Д"
    : a.viz === "spark" ? "ОБЪЁМ ТРЕНИРОВОК · ТРЕНД" : "РАСПРЕДЕЛЕНИЕ ПУЛЬСА · %";
  return (
    <div style={{
      width: "100%", maxWidth: maxW, height: H, background: "var(--bg)", color: "var(--ink)",
      fontFamily: SANS, position: "relative", overflow: "hidden", boxSizing: "border-box",
      padding: 24, border: "3px solid var(--ink)", display: "flex", flexDirection: "column",
    }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Rondel size={20} />
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "-0.01em" }}>
            fizkult<span style={{ color: "var(--accent)" }}>.</span>ai
          </span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          color: "var(--muted)" }}>АРХЕТИП {a.no} / 06</span>
      </div>

      {/* eyebrow */}
      <div style={{ marginTop: 22, fontFamily: MONO, fontSize: 10, fontWeight: 700,
        letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)" }}>
        ПРИМЕР · ПОСЛЕ 30 ТРЕНИРОВОК
      </div>

      {/* name — герой, с красным акцент-баром */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "stretch", gap: 12 }}>
        <div style={{ width: 6, background: "var(--accent)", flexShrink: 0 }} />
        <FitName text={a.name} max={size === "lg" ? 54 : 50} min={26} />
      </div>

      {/* tagline + описание */}
      <div style={{ marginTop: 14, fontSize: 14, fontWeight: 800 }}>{a.tagline}.</div>
      <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "var(--muted)", textWrap: "pretty" }}>{a.desc}</p>

      {/* один наглядный график */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>{vizLabel}</div>
        {a.viz === "zones" && <ZoneBars data={a.vizData} h={48} />}
        {a.viz === "spark" && <Sparkline data={a.vizData} h={48} />}
        {a.viz === "radar" && <TriRadar data={a.vizData} size={104} />}
      </div>

      {/* три факта */}
      <div style={{ marginTop: "auto", paddingTop: 18, borderTop: "2px solid var(--ink)",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {a.stats.map(([v, l], i) => (
          <div key={i}>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1,
              color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{v}</div>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.04em",
              textTransform: "uppercase", marginTop: 5, color: "var(--muted)", lineHeight: 1.25 }}>{l}</div>
          </div>
        ))}
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
const pad = (m) => (m ? "56px 20px" : "96px 48px");

// 152-ФЗ gated CTA — общий consent (отметил раз → все кнопки активны).
// Чекбокс НАД кнопкой (findability), tooltip + hint в disabled-состоянии.
function GatedCTA({ label, href, hint, center, full, dark, btnStyle }) {
  const { consent: ok, setConsent: setOk } = React.useContext(ConsentCtx);
  const txt = dark ? "#EFE6D6" : "#1A1A1A";
  const go = () => { if (ok && href) window.open(href, "_blank", "noopener"); };
  return (
    <div style={{ textAlign: center ? "center" : "left" }}>
      <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 12,
        maxWidth: 460, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0,
        cursor: "pointer", textAlign: "left" }}>
        <input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)}
          style={{ marginTop: 2, width: 16, height: 16, accentColor: "var(--accent)", flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.5, color: txt }}>
          Согласен на обработку и трансграничную передачу данных Garmin / Strava.{" "}
          <a href="/privacy-pdn.html" style={{ color: txt, textDecoration: "underline" }}>Политика обработки ПДн</a>
        </span>
      </label>
      <button onClick={go} disabled={!ok} title={ok ? "" : "Требуется согласие — отметь галочку выше"}
        style={{ background: "var(--ink)", color: "var(--accent)", border: "none",
          padding: "18px 30px", fontSize: 15, fontWeight: 900, letterSpacing: "0.04em",
          textTransform: "uppercase", fontFamily: SANS, borderRadius: 0,
          width: full ? "100%" : "auto", opacity: ok ? 1 : 0.4,
          cursor: ok ? "pointer" : "not-allowed", transition: "opacity .15s", ...(btnStyle || {}) }}>
        {label}
      </button>
      <div style={{ fontFamily: MONO, fontSize: 11, color: txt, letterSpacing: "0.1em",
        textTransform: "uppercase", marginTop: 12, minHeight: 14, opacity: ok ? 0.8 : 1 }}>
        {ok ? (hint || "") : "↑ Отметь согласие, чтобы продолжить"}
      </div>
    </div>
  );
}

// ═══ SECTIONS ══════════════════════════════════════════════════
function Nav() {
  const { m } = useR();
  const [open, setOpen] = React.useState(false);
  const links = [["Архетипы", "#archetypes"], ["Что внутри", "#inside"], ["Тарифы", "#pricing"]];
  const aS = { color: "var(--ink)", textDecoration: "none", cursor: "pointer",
    fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" };
  const loginBtn = { ...btn, padding: "10px 18px", fontSize: 11, whiteSpace: "nowrap",
    textDecoration: "none", display: "inline-block" };
  return (
    <nav style={{ borderBottom: "3px solid var(--ink)", background: "var(--bg)",
      position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: m ? "14px 20px" : "18px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Rondel size={26} />
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.03em",
            textTransform: "uppercase" }}>ФИЗКУЛЬТ</div>
        </div>
        {m ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href={BOT + "archetype_nav"} target="_blank" rel="noopener" style={{ ...loginBtn, padding: "9px 14px" }}>Войти →</a>
            <button onClick={() => setOpen(o => !o)} aria-label="Меню"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 6,
                display: "flex", flexDirection: "column", gap: 4 }}>
              {[0,1,2].map(i => <span key={i} style={{ width: 24, height: 3, background: "var(--ink)" }} />)}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {links.map(l => <a key={l[1]} href={l[1]} style={aS}>{l[0]}</a>)}
            <a href={BOT + "archetype_nav"} target="_blank" rel="noopener" style={loginBtn}>Войти →</a>
          </div>
        )}
      </div>
      {m && open ? (
        <div style={{ borderTop: "3px solid var(--ink)", background: "var(--bg)" }}>
          {links.map(l => (
            <a key={l[1]} href={l[1]} onClick={() => setOpen(false)}
              style={{ display: "block", padding: "16px 20px", color: "var(--ink)",
                textDecoration: "none", fontSize: 14, fontWeight: 900, textTransform: "uppercase",
                letterSpacing: "0.04em", borderBottom: "1px solid rgba(26,26,26,0.12)" }}>{l[0]}</a>
          ))}
        </div>
      ) : null}
    </nav>
  );
}

function Hero() {
  const { m } = useR();
  const sources = ["GARMIN", "STRAVA", "ПЛАН ТРЕНЕРА"];
  return (
    <section style={{ background: "var(--bg)", position: "relative", overflow: "hidden" }}>
      {m ? null : (<>
        <div style={{ position: "absolute", right: -150, bottom: -280, width: 460, height: 460,
          background: "var(--accent)", transform: "rotate(-12deg)", zIndex: 0 }} />
        <div style={{ position: "absolute", right: 360, top: -40, width: 8, height: 420,
          background: "var(--ink)", transform: "rotate(15deg)", zIndex: 0 }} />
      </>)}

      <div style={{ maxWidth: PAGE_W, margin: "0 auto", padding: m ? "40px 20px 56px" : "60px 48px 84px",
        position: "relative", zIndex: 1, display: "grid",
        gridTemplateColumns: m ? "1fr" : "1.25fr 1fr", gap: m ? 36 : 40, alignItems: "center" }}>
        <div style={{ display: m ? "flex" : "block", flexDirection: m ? "column" : undefined }}>
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
            КАКОЙ ТЫ<br/><span style={{ color: "var(--accent)" }}>СПОРТСМЕН?</span>
          </h1>
          <p style={{ margin: "22px 0 0", fontSize: m ? 16 : 17, lineHeight: 1.5, color: "var(--ink)",
            maxWidth: 460, fontWeight: 500 }}>
            Подключаешь Garmin или Strava. Алгоритм читает 90 дней тренировок и собирает
            твой архетип за 2 минуты.
          </p>

          <div style={{ marginTop: 24, display: "block", boxSizing: "border-box", order: m ? 5 : 0,
            width: m ? "100%" : "auto", border: "2px solid var(--ink)", padding: "14px 18px",
            background: "var(--bg)" }}>
            {m ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: MONO,
                fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#1A1A1A" }}>
                {sources.map(s => <div key={s}>· {s}</div>)}
              </div>
            ) : (
              <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
                textTransform: "uppercase", color: "#1A1A1A" }}>{sources.join(" · ")}</div>
            )}
            <div style={{ textAlign: "center", color: "var(--accent)", fontSize: 16, lineHeight: 1, margin: "6px 0" }}>↓</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--ink)", color: "var(--accent-ink)", padding: "4px 10px",
              fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", whiteSpace: "nowrap" }}>
              <span style={{ width: 5, height: 5, background: "var(--accent)",
                animation: "blink 1.6s steps(2) infinite" }} />
              ФИЗКУЛЬТ читает за 60 сек
            </div>
            <div style={{ textAlign: "center", color: "var(--accent)", fontSize: 16, lineHeight: 1, margin: "6px 0" }}>↓</div>
            <div style={{ fontFamily: MONO, fontSize: m ? 11 : 11, fontWeight: 700, letterSpacing: "0.06em",
              textTransform: "uppercase", color: "var(--accent)" }}>
              АРХЕТИП + РАЗБОР + ЕЖЕДНЕВНЫЕ СОВЕТЫ
            </div>
          </div>

          <div style={{ marginTop: 26, order: m ? 3 : 0 }}>
            <GatedCTA label="Узнать архетип →" href={BOT + "archetype_hero"} hint="2 мин · без email" full={m} />
          </div>
          <div style={{ marginTop: 18, order: m ? 4 : 0, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#1A1A1A",
              letterSpacing: "0.12em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Работает с</span>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)" }}>GARMIN</span>
            <span style={{ width: 1, height: 16, background: "rgba(26,26,26,0.3)" }} />
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--ink)" }}>STRAVA</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Card a={ARCH[3]} size={m ? "md" : "lg"} />
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
            <Card key={a.no} a={a} />
          ))}
        </div>
        <p style={{ margin: "32px 0 0", fontSize: 12, color: "#1A1A1A", fontFamily: MONO,
          letterSpacing: "0.04em", textAlign: "center" }}>
          Цифры на карточках — пример. Твои появятся после подключения (30+ тренировок).
        </p>
        <div style={{ marginTop: m ? 36 : 48, display: "flex", justifyContent: "center" }}>
          <GatedCTA label="Узнать свой архетип бесплатно →" href={BOT + "archetype_gallery"} center />
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { m } = useR();
  const [yearly, setYearly] = React.useState(false);
  const tBtn = (on) => ({ flex: 1, padding: "9px 0", fontFamily: MONO, fontSize: 11, fontWeight: 700,
    letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", borderRadius: 0,
    border: "2px solid var(--accent)", background: on ? "var(--accent)" : "transparent",
    color: on ? "var(--accent-ink)" : "#E8E2D6" });
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
            <ul style={{ margin: "24px 0 24px", padding: 0, listStyle: "none", fontSize: 15, lineHeight: 1.5 }}>
              {["Архетип и разбор за 5 минут",
                "Утром по понедельникам — что делать (sample)",
                "Карточка 9:16 для шеринга"].map((f, j) => (
                <li key={j} style={{ padding: "10px 0", borderTop: "1px solid rgba(26,26,26,0.14)",
                  display: "flex", gap: 10 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 900 }}>✓</span>{f}</li>
              ))}
            </ul>
            <GatedCTA label="Узнать архетип →" href={BOT + "archetype_pricing"} full
              btnStyle={{ background: "var(--ink)", color: "var(--bg)", padding: "15px 0", fontSize: 13 }} />
          </div>
          {/* PRO */}
          <div style={{ background: "var(--ink)", color: "var(--bg)", padding: "30px 28px 28px",
            border: "3px solid var(--ink)", position: "relative" }}>
            <div style={{ position: "absolute", top: -13, left: 24, background: "var(--accent)",
              color: "var(--accent-ink)", fontFamily: MONO, fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 10px", whiteSpace: "nowrap" }}>BETA · ВСЁ БЕСПЛАТНО ДО 1.07</div>
            <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>Pro</div>
            {/* toggle месяц / год */}
            <div style={{ marginTop: 14, display: "flex", gap: 0, maxWidth: 280 }}>
              <button onClick={() => setYearly(false)} style={tBtn(!yearly)}>Месяц</button>
              <button onClick={() => setYearly(true)} style={tBtn(yearly)}>Год · −27%</button>
            </div>
            <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 6, whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1,
                fontVariantNumeric: "tabular-nums" }}>{yearly ? "₽12 990" : "₽1 490"}</span>
              <span style={{ fontSize: 14, color: "#9F9A92" }}>{yearly ? "/ год" : "/ мес"}</span>
            </div>
            <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em",
              color: yearly ? "var(--accent)" : "#C9C2B5", textTransform: "uppercase", minHeight: 14 }}>
              {yearly ? "Экономия ₽4 890 в год" : "₽17 880 в год помесячно"}
            </div>
            <ul style={{ margin: "20px 0 24px", padding: 0, listStyle: "none", fontSize: 15, lineHeight: 1.5 }}>
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
            <GatedCTA label="Включить Pro" href={BOT + "pro_beta"} full dark
              btnStyle={{ background: "var(--accent)", color: "var(--accent-ink)", padding: "15px 0", fontSize: 13 }} />
            <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 10, color: "#C9C2B5",
              letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "center" }}>
              Beta: всё бесплатно до 1 июля · после — 1490 ₽/мес
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
        <div style={{ marginTop: 36, display: "flex", justifyContent: "center" }}>
          <GatedCTA label="Узнать архетип бесплатно →" href={BOT + "archetype_final"} center />
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
            <Rondel size={22} fg="var(--bg)" accent="var(--accent)" />
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.03em",
              textTransform: "uppercase" }}>ФИЗКУЛЬТ</div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#C9C2B5", lineHeight: 1.5, maxWidth: 300 }}>
            Тихий аналитик, который читает твои данные.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "#C9C2B5", letterSpacing: "0.14em",
            textTransform: "uppercase" }}>Работает на</div>
          <div style={{ fontSize: 13, color: "#C9C2B5" }}>Garmin · Strava · AI-движок</div>
        </div>
        <div>
          <a href="/privacy-pdn.html" style={linkS}>Политика обработки ПДн</a>
          <a href="/privacy.html" style={linkS}>Privacy</a>
          <a href="/terms.html" style={linkS}>Terms</a>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", padding: m ? "18px 20px" : "18px 48px",
        maxWidth: PAGE_W, margin: "0 auto" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 10, color: "#C9C2B5",
          letterSpacing: "0.06em", lineHeight: 1.6 }}>
          Сервис не заменяет врача и тренера, не является медицинской рекомендацией.
          Обработка ПДн — с уведомлением РКН. © 2026 FIZKULT.AI
        </p>
      </div>
    </footer>
  );
}

// ─── Instagram/FB in-app WebView fallback ─────────────────────
// OAuth Garmin/Strava ломается во встроенном браузере IG Stories —
// просим открыть в системном браузере. Конструктивистская модалка.
function IGFallback() {
  const [show, setShow] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    const ua = navigator.userAgent || "";
    const inApp = /Instagram|FBAN|FBAV|FB_IAB/i.test(ua);
    if (inApp && !sessionStorage.getItem("fk_ig_dismissed")) setShow(true);
  }, []);
  if (!show) return null;
  const close = () => { try { sessionStorage.setItem("fk_ig_dismissed", "1"); } catch {} setShow(false); };
  const copy = () => {
    const url = window.location.href;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done).catch(done); else done();
  };
  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(26,26,26,0.78)", display: "flex", alignItems: "flex-end",
      justifyContent: "center", fontFamily: SANS }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 460,
        background: "var(--bg)", border: "3px solid var(--ink)", borderBottom: "none",
        boxSizing: "border-box", padding: "24px 22px 28px", color: "var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Rondel size={24} />
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--accent)" }}>ОТКРОЙ В БРАУЗЕРЕ</div>
        </div>
        <h3 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em",
          lineHeight: 0.95, textTransform: "uppercase" }}>Подключение работает<br/>в Safari / Chrome</h3>
        <p style={{ margin: "12px 0 18px", fontSize: 14, lineHeight: 1.5, color: "var(--muted)" }}>
          Встроенный браузер Instagram не пускает на вход Garmin / Strava.
          Открой ссылку в обычном браузере — нажми «···» вверху и «Открыть в браузере».
        </p>
        <button onClick={copy} style={{ width: "100%", background: "var(--ink)", color: "var(--bg)",
          border: "none", padding: "15px 0", fontSize: 13, fontWeight: 900, letterSpacing: "0.04em",
          textTransform: "uppercase", cursor: "pointer", fontFamily: SANS }}>
          {copied ? "Ссылка скопирована ✓" : "Скопировать ссылку"}
        </button>
        <button onClick={close} style={{ width: "100%", background: "none", color: "var(--muted)",
          border: "none", padding: "12px 0 0", fontSize: 12, fontFamily: MONO, letterSpacing: "0.08em",
          textTransform: "uppercase", cursor: "pointer" }}>
          Продолжить здесь
        </button>
      </div>
    </div>
  );
}

// ─── full page · responsive + shared consent ─────────────────
function ConstructivistLanding({ vars, forceVW }) {
  const auto = useVW();
  const vw = forceVW || auto;
  const m = vw <= 760;
  const [consent, setConsent] = React.useState(false);
  const Inside = window.WhatsInside, NotDoing = window.NotDoing, Methodology = window.Methodology;
  return (
    <RCtx.Provider value={{ m, vw }}>
      <ConsentCtx.Provider value={{ consent, setConsent }}>
        <div style={{ ...vars, width: "100%", maxWidth: PAGE_W, margin: "0 auto",
          fontFamily: SANS, background: "var(--bg)", color: "var(--ink)" }}>
          <Nav /><Hero /><How /><Gallery />
          {Inside ? <Inside /> : null}
          {NotDoing ? <NotDoing /> : null}
          {Methodology ? <Methodology /> : null}
          <Pricing /><FinalCTA /><Footer />
          <IGFallback />
        </div>
      </ConsentCtx.Provider>
    </RCtx.Provider>
  );
}

Object.assign(window, { ConstructivistLanding, useR });
