import React from "react";

/* ---------- QR jaisa demo pattern (9x9) ---------- */
const QR_SIZE = 9;
const QR_CELLS = [];
for (let y = 0; y < QR_SIZE; y++) {
  for (let x = 0; x < QR_SIZE; x++) {
    const tl = x < 3 && y < 3;
    const tr = x > 5 && y < 3;
    const bl = x < 3 && y > 5;

    if (tl || tr || bl) {
      const lx = tr ? x - 6 : x;
      const ly = bl ? y - 6 : y;
      if (!(lx === 1 && ly === 1)) QR_CELLS.push([x, y]); // 3x3 ring
    } else if ((x * 7 + y * 13 + x * y) % 3 === 0) {
      QR_CELLS.push([x, y]);
    }
  }
}

const INK = "#111111";
const RED = "#ff3b0f";
const LIME = "#c8f31d";

const ROSTER = [
  { n: "Aditi", s: "Present", t: "green" },
  { n: "Rohan", s: "Present", t: "green" },
  { n: "Meera", s: "Late", t: "amber" },
  { n: "Kabir", s: "Not yet", t: "grey" },
];

const BARS = [
  { n: "DL", v: 90, c: INK },
  { n: "EPP", v: 82, c: RED },
  { n: "NCS", v: 74, c: "#FF9F1C" },
];

const BADGE = {
  green: { bg: LIME, fg: INK },
  amber: { bg: "#FFD9A8", fg: "#7A4B00" },
  grey: { bg: "#E8E6DF", fg: "#555555" },
};

/* ---------- 1. Geo-fence demo ---------- */
function GeoDemo() {
  return (
    <div className="hc-media" style={{ background: "#F0F9CF" }}>
      <svg viewBox="0 0 190 148" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {/* map streets */}
        <path d="M-10 108 L200 70" stroke="#DDEB9A" strokeWidth="9" />
        <path d="M52 -10 L84 160" stroke="#DDEB9A" strokeWidth="9" />
        <path d="M142 -10 L160 160" stroke="#E6F1B5" strokeWidth="6" />
        <path d="M-10 40 L200 24" stroke="#E6F1B5" strokeWidth="5" />

        {/* fence */}
        <circle
          className="hc-anim"
          cx="95" cy="72" r="50"
          fill="rgba(255,59,15,.10)" stroke={RED} strokeWidth="2" strokeDasharray="5 4"
          style={{ transformBox: "fill-box", transformOrigin: "center", animation: "hcPulse 3.2s ease-in-out infinite" }}
        />
        <circle cx="95" cy="72" r="26" fill="rgba(255,59,15,.12)" />

        {/* pin */}
        <g transform="translate(95 72)">
          <path
            d="M0 0 C-8 -10 -15 -17 -15 -26 A15 15 0 0 1 15 -26 C15 -17 8 -10 0 0 Z"
            fill={RED} stroke={INK} strokeWidth="2.5" strokeLinejoin="round"
          />
          <circle cx="0" cy="-26" r="5.5" fill="#fff" />
        </g>

        {/* student walking in */}
        <circle
          className="hc-anim"
          cx="24" cy="124" r="6"
          fill={INK} stroke="#fff" strokeWidth="2.5"
          style={{ animation: "hcWalk 5s ease-in-out infinite" }}
        />
      </svg>

      <span className="hc-pill" style={{ top: 10, left: 10, background: INK, color: LIME }}>XX m radius</span>
      <span
        className="hc-pill hc-anim"
        style={{ bottom: 10, right: 10, background: LIME, color: INK, animation: "hcPop 5s ease-in-out infinite" }}
      >
        ✓ Checked in
      </span>
    </div>
  );
}

/* ---------- 2. QR demo ---------- */
function QrDemo() {
  return (
    <div className="hc-media" style={{ background: "#FFE6DC" }}>
      <svg viewBox="0 0 190 148" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect x="39.5" y="18" width="111" height="111" rx="10" fill="#fff" stroke={INK} strokeWidth="3" />

        <g transform="translate(45.5 24)" fill={INK}>
          {QR_CELLS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x * 11} y={y * 11} width="9.6" height="9.6" rx="2" />
          ))}
        </g>

        {/* scan frame */}
        <g fill="none" stroke={RED} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M34 34 V14 H54" />
          <path d="M136 14 H156 V34" />
          <path d="M156 114 V134 H136" />
          <path d="M54 134 H34 V114" />
        </g>

        {/* moving scan line */}
        <rect
          className="hc-anim"
          x="40" y="22" width="110" height="2.8" rx="1.4" fill={RED} opacity="0.9"
          style={{ animation: "hcScan 2.8s ease-in-out infinite" }}
        />
      </svg>
    </div>
  );
}

/* ---------- 3. Live roster demo ---------- */
function RosterDemo() {
  return (
    <div className="hc-media" style={{ background: "#F1EFE8", padding: "10px 12px" }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".08em", color: INK, marginBottom: 6 }}>
        LIVE ROSTER · CS16
      </div>

      {ROSTER.map((r) => (
        <div
          key={r.n}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: "#fff",
            border: `2px solid ${INK}`, borderRadius: 10, padding: "3px 8px", marginBottom: 5,
          }}
        >
          <span
            style={{
              width: 20, height: 20, borderRadius: "50%", background: LIME, color: INK,
              fontSize: 10.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {r.n[0]}
          </span>
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: INK }}>{r.n}</span>
          <span
            style={{
              fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 999,
              background: BADGE[r.t].bg, color: BADGE[r.t].fg, border: `1.5px solid ${INK}`,
            }}
          >
            {r.s}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ---------- 4. Attendance % demo ---------- */
function StatDemo() {
  return (
    <div
      className="hc-media"
      style={{
        background: LIME, display: "flex", alignItems: "center",
        gap: 12, padding: "0 14px",
      }}
    >
      <div style={{ position: "relative", width: 78, height: 78, flexShrink: 0 }}>
        <svg viewBox="0 0 90 90" width="78" height="78" aria-hidden="true">
          <circle cx="45" cy="45" r="34" fill="none" stroke="#fff" strokeWidth="10" />
          <circle
            className="hc-anim"
            cx="45" cy="45" r="34" fill="none" stroke={INK} strokeWidth="10" strokeLinecap="round"
            strokeDasharray="213.63" strokeDashoffset="38.4" transform="rotate(-90 45 45)"
            style={{ animation: "hcDonut 1.6s ease-out both" }}
          />
        </svg>
        <div
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 17, fontWeight: 800, color: INK,
          }}
        >
          82%
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {BARS.map((b) => (
          <div key={b.n} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 800, color: INK, marginBottom: 3 }}>
              <span>{b.n}</span>
              <span>{b.v}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,.8)" }}>
              <div style={{ width: `${b.v}%`, height: "100%", borderRadius: 999, background: b.c }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Captions yahan se badal sakta hai. tone: lime | red | ink | paper */
const CARDS = [
  { tone: "lime", Demo: GeoDemo, label: "Tap to check-in inside the geo-fence" },
  { tone: "red", Demo: QrDemo, label: "Scan the class QR" },
  { tone: "ink", Demo: RosterDemo, label: "Live roster for every class" },
  { tone: "paper", Demo: StatDemo, label: "Know your real attendance" },
];

const CSS = `
.hero-visual.hc-visual { height: auto; display: flex; align-items: center; justify-content: center; padding: 8px 0 34px; }
.hc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 205px)); gap: 26px 20px; justify-content: center; width: 100%; }

.hc-card { --r: 0deg; position: relative; border-radius: 24px; overflow: hidden; background: var(--cap-bg);
  border: 3px solid #111; box-shadow: 0 7px 0 #111; transform: rotate(var(--r));
  transition: transform .25s ease, box-shadow .25s ease; }
.hc-card:hover { transform: rotate(0deg) translateY(-6px); box-shadow: 0 13px 0 #111; z-index: 2; }
.hc-card.lime  { --cap-bg: #c8f31d; --cap-fg: #111; }
.hc-card.red   { --cap-bg: #ff3b0f; --cap-fg: #fff; }
.hc-card.ink   { --cap-bg: #111;    --cap-fg: #c8f31d; }
.hc-card.paper { --cap-bg: #fff;    --cap-fg: #111; }
.hc-card:nth-child(1) { --r: -4deg; }
.hc-card:nth-child(2) { --r: 3deg; margin-top: 34px; }
.hc-card:nth-child(3) { --r: 2deg; }
.hc-card:nth-child(4) { --r: -3deg; margin-top: 34px; }

.hc-media { position: relative; height: 148px; overflow: hidden; }

.hc-cap { position: relative; background: var(--cap-bg); color: var(--cap-fg); min-height: 74px; padding: 16px 14px 18px;
  display: flex; align-items: center; justify-content: center; text-align: center;
  font-family: "Bowlby One", Impact, "Arial Black", sans-serif; text-transform: uppercase;
  font-size: 12.5px; font-weight: 400; letter-spacing: .02em; line-height: 1.25; }
.hc-cap::before { content: ""; position: absolute; left: 0; right: 0; top: -9px; height: 10px;
  background: radial-gradient(circle at 9px 10px, var(--cap-bg) 8px, transparent 8.5px) repeat-x; background-size: 18px 10px; }

.hc-pill { position: absolute; font-size: 10.5px; font-weight: 800; padding: 3px 9px; border-radius: 999px;
  border: 2px solid #111; }

@keyframes hcPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@keyframes hcWalk { 0% { transform: translate(0, 0); } 55%, 100% { transform: translate(88px, -34px); } }
@keyframes hcPop { 0%, 55% { opacity: 0; transform: translateY(6px); } 66%, 92% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; } }
@keyframes hcScan { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(104px); } }
@keyframes hcDonut { from { stroke-dashoffset: 213.63; } to { stroke-dashoffset: 38.4; } }

@media (prefers-reduced-motion: reduce) { .hc-anim { animation: none !important; } }
`;

export default function HeroCards() {
  return (
    <div className="hero-visual hc-visual" aria-label="GeoAttend feature previews">
      <style>{CSS}</style>

      <div className="hc-grid">
        {CARDS.map(({ tone, Demo, label }) => (
          <div key={label} className={`hc-card ${tone}`}>
            <Demo />
            <div className="hc-cap">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}