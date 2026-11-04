import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Radar, MapPin, QrCode,
  ArrowRight, BarChart3, BellRing, Users, Sparkles, Lock, Cloud,
  Github, Linkedin, Mail
} from "lucide-react";

import HeroCards from "../components/HeroCards.jsx";
import "../styles/landing-sections.css";

const FEATURES = [
  { icon: MapPin, title: "Geo-fence check-in", body: "marks a student the moment they cross into a live campus boundary — no manual roll call." },
  { icon: QrCode, title: "QR fallback", body: "A quick scan covers low-signal classrooms or acts as a second verification layer." },
  { icon: Users, title: "Live admin roster", body: "Real-time present and absent status across every section, updated as it happens." },
  { icon: BarChart3, title: "Attendance analytics", body: "Weekly trends, per-subject breakdowns, and check-in method split at a glance." },
  { icon: BellRing, title: "Smart alerts", body: "Low-attendance and proxy-risk notifications sent automatically to admins and students." },
];

const WHY = [
  { icon: Sparkles, title: "Accurate by design", body: "Geo-fence and QR stack together so proxy attendance stops being possible - without extra staff effort." },
  { icon: Lock, title: "Privacy first", body: "Location is scoped to the check-in window only. Nothing is tracked continuously or stored longer than it needs to be." },
  { icon: Cloud, title: "Built for scale", body: "Cloud-deployed REST APIs and a live dashboard that hold up across hundreds of concurrent check-ins at once." },
];

const STACK = [
  "React",
  "Node.js",
  "Express",
  "PostgreSql",
  "JWT Authentication",
  "REST API",
  "Cloud Deployment",
];

/* badge colour sets, cycled by index: lime / red / ink */
const BADGES = [
  { bg: "#c8f31d", fg: "#111111" },
  { bg: "#ff3b0f", fg: "#ffffff" },
  { bg: "#111111", fg: "#c8f31d" },
];

/* 10-bump scalloped circle, computed once */
const SCALLOP_POINTS = (() => {
  const bumps = 10, steps = 160, R = 46, amp = 0.07, pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = R * (1 + amp * Math.cos(bumps * t));
    pts.push(`${(50 + r * Math.cos(t) * 0.92).toFixed(2)},${(50 + r * Math.sin(t) * 0.92).toFixed(2)}`);
  }
  return pts.join(" ");
})();

function Scallop({ size = 52, bg, fg, children }) {
  return (
    <span className="scallop" style={{ width: size, height: size, color: fg }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <polygon points={SCALLOP_POINTS} fill={bg} />
      </svg>
      <span className="scallop-icon">{children}</span>
    </span>
  );
}

/* original GeoAttend map-pin mascot */
function PinMascot() {
  return (
    <svg className="kz-mascot" viewBox="0 0 200 250" role="img" aria-label="GeoAttend pin mascot">
      <ellipse cx="100" cy="240" rx="50" ry="7" fill="rgba(0,0,0,0.12)" />
      {/* legs + shoes */}
      <path d="M84 196 L80 224" stroke="#111" strokeWidth="9" strokeLinecap="round" />
      <path d="M116 196 L120 224" stroke="#111" strokeWidth="9" strokeLinecap="round" />
      <ellipse cx="76" cy="230" rx="18" ry="8" fill="#fff" stroke="#111" strokeWidth="5" />
      <ellipse cx="124" cy="230" rx="18" ry="8" fill="#fff" stroke="#111" strokeWidth="5" />
      {/* arms */}
      <path d="M166 112 Q196 98 190 64" fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" />
      <circle cx="190" cy="56" r="12" fill="#fff" stroke="#111" strokeWidth="5" />
      <path d="M34 112 Q8 130 22 158" fill="none" stroke="#111" strokeWidth="9" strokeLinecap="round" />
      <circle cx="24" cy="163" r="11" fill="#fff" stroke="#111" strokeWidth="5" />
      {/* pin body */}
      <path
        d="M100 18 C58 18 28 50 28 92 C28 142 100 204 100 204 C100 204 172 142 172 92 C172 50 142 18 100 18 Z"
        fill="#ff3b0f" stroke="#111" strokeWidth="6" strokeLinejoin="round"
      />
      {/* face */}
      <circle cx="100" cy="90" r="36" fill="#fff" stroke="#111" strokeWidth="5" />
      <circle cx="86" cy="84" r="6" fill="#111" />
      <circle cx="114" cy="84" r="6" fill="#111" />
      <circle cx="88" cy="82" r="2" fill="#fff" />
      <circle cx="116" cy="82" r="2" fill="#fff" />
      <path d="M82 102 Q100 120 118 102" fill="none" stroke="#111" strokeWidth="5" strokeLinecap="round" />
      <circle cx="74" cy="100" r="5" fill="#c8f31d" />
      <circle cx="126" cy="100" r="5" fill="#c8f31d" />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
      }
    }
  }, [location]);

  return (
    <div className="landing-page">
      {/* ---- navbar ---- */}
      <nav className="landing-nav">
        <div className="login-brand">
          <div className="mark"><Radar size={18} color="#fff" /></div>
          <div className="name disp">GeoAttend</div>
        </div>
        <div className="landing-nav-links">
          <a href="#home">Home</a>
          <span style={{ cursor: "pointer" }} onClick={() => navigate("/contact")}>Contact</span>
        </div>
      </nav>

      {/* ---- hero ---- */}
      <section className="landing-hero" id="home">
        <div className="hero-copy">
          <span className="kz-tag">Cloud attendance, geo-verified</span>
          <h1 className="kz-hero-title">Attendance that knows where your campus <span className="kz-sticker">really is.</span></h1>
          <p className="kz-hero-sub">GeoAttend checks students in the moment they enter a live geo-fence - backed by QR, so proxy attendance stops being possible.</p>
          <div className="hero-actions">
            <button className="kz-btn" onClick={() => navigate("/login")}>Get Started <ArrowRight size={15} /></button>
          </div>
        </div>

        <HeroCards />
      </section>

      {/* ---- features ---- */}
      <section className="features-section" id="features">
        <div className="kz-wrap">
          <div className="kz-head">
            <span className="kz-tag">Everything. One dashboard.</span>
            <h2 className="kz-title">Built for how your campus</h2>
            <span className="kz-sticker">actually runs.</span>
            <p className="kz-sub">
              Every check-in method feeds the same live dashboard, so admins see one accurate picture instead of five different apps.
            </p>
            <PinMascot />
          </div>

          <div className="kz-list">
            {FEATURES.map(({ icon: Icon, title, body }, i) => {
              const b = BADGES[i % BADGES.length];
              return (
                <div className="kz-card" key={title}>
                  <div>
                    <div className="kz-card-title">{title}</div>
                    <div className="kz-card-body">{body}</div>
                  </div>
                  <Scallop bg={b.bg} fg={b.fg}>
                    <Icon size={20} strokeWidth={2.4} />
                  </Scallop>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- about / why ---- */}
      <section className="about-section" id="about">
        <div className="kz-center">
          <span className="kz-tag lime">Why GeoAttend?</span>
          <h2 className="kz-title">Attendance, without</h2>
          <span className="kz-sticker">the guesswork.</span>
          <p className="kz-sub">
            Built as a college project to solve one problem properly: attendance that's automatic, hard to fake, and easy for admins to trust.
          </p>

          <div className="kz-why-grid">
            {WHY.map(({ icon: Icon, title, body }, i) => {
              const b = BADGES[i % BADGES.length];
              return (
                <div className="kz-why-card" key={title}>
                  <Scallop size={58} bg={b.bg} fg={b.fg}>
                    <Icon size={22} strokeWidth={2.4} />
                  </Scallop>
                  <div className="kz-why-title">{title}</div>
                  <div className="kz-why-body">{body}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---- technology stack ---- */}
      <section className="stack-section">
        <div className="kz-stack">
          <span className="kz-tag lime">Technology stack</span>
          <h2 className="kz-title">Built with</h2>

          <div className="kz-chips">
            {STACK.map((tech) => (
              <span className="kz-chip" key={tech}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---- footer ---- */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="footer-mark">
            <Radar size={18} color="#fff" />
          </div>
          <div className="footer-name disp">GeoAttend</div>
        </div>

        <div className="footer-text">
          A cloud-based attendance system built for smarter campuses.
        </div>

        <div className="footer-socials">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={20} />
          </a>

          <a
            href="mailto:hello@geoattend.app"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
        </div>
      </footer>

      {/* ---- contact: now a separate page at /contact ---- */}
    </div>
  );
}