import React, { useEffect, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { MapPin, QrCode, Search } from "lucide-react";
import { api } from "../api.js";
import { StatusBadge, MethodPill } from "../components/Bits.jsx";

const M = { gps: "GPS", qr: "QR", face: "Face", manual: "Manual" };

// KIIT Campus 1 se 25
const CAMPUS_OPTIONS = Array.from({ length: 25 }, (_, i) => `KIIT Campus ${i + 1}`);

const autoGrid = (min) => ({
  display: "grid",
  gap: 16,
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
});

const initials = (s) =>
  s.name
    ? s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : String(s.identifier || "?").slice(-2);

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--line)",
  background: "#fff",
  font: "inherit",
  fontSize: 14,
};

// section tabs (chips)
const tabBar = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 16,
};

const tabBtn = (active) => ({
  padding: "10px 18px",
  borderRadius: 999,
  border: "1px solid var(--line)",
  background: active ? "var(--blue)" : "#fff",
  color: active ? "#fff" : "inherit",
  font: "inherit",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
});

const sectionBody = {
  maxHeight: 520,
  overflowY: "auto",
  overflowX: "auto",
};

// ---------- QR nayi window me kholne ke helpers ----------
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

function writeQrWindow(win, { code, subject, section }) {
  const svg = renderToStaticMarkup(<QRCodeSVG value={code} size={440} level="L" />);
  win.document.open();
  win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Attendance QR · ${esc(subject)} · ${esc(section)}</title>
  <style>
    body { margin:0; min-height:100vh; display:flex; flex-direction:column; align-items:center;
           justify-content:center; gap:20px; background:#F5F3EE; font-family:system-ui,sans-serif; color:#111; }
    h1 { margin:0; font-size:30px; }
    p { margin:0; color:#555; font-size:16px; }
    .box { background:#fff; padding:24px; border-radius:20px; border:1px solid #ddd; }
    .box svg { display:block; width:min(80vw, 70vh); height:auto; }
    button { padding:10px 22px; border-radius:999px; border:1px solid #bbb; background:#fff; font-size:15px; cursor:pointer; }
  </style>
</head>
<body>
  <h1>${esc(subject)} · Section ${esc(section)}</h1>
  <p>Scan this QR in the GeoAttend app to mark attendance</p>
  <div class="box">${svg}</div>
  <button onclick="window.close()">Close</button>
</body>
</html>`);
  win.document.close();
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 42, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
        padding: 2, flexShrink: 0, background: on ? "var(--blue)" : "#CBD2DC",
        transition: "background .15s",
      }}
    >
      <span
        style={{
          display: "block", width: 20, height: 20, borderRadius: "50%", background: "#fff",
          transform: on ? "translateX(18px)" : "translateX(0)", transition: "transform .15s",
        }}
      />
    </button>
  );
}

export default function AdminDashboard() {
  const [roster, setRoster] = useState([]);
  const [mySections, setMySections] = useState([]);
  const [fences, setFences] = useState([]);
  const [methods, setMethods] = useState({ gps: true, qr: true, face: false });
  const [msg, setMsg] = useState("");

  const [ctx, setCtx] = useState(null); // teacher ka timetable context
  const [qrSubject, setQrSubject] = useState("");
  const [qrSection, setQrSection] = useState("");
  const [qr, setQr] = useState(null); // { code, subject, section }

  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("");
  const [busyId, setBusyId] = useState(null); // manual check-in chal raha hai kiska

  const [f, setF] = useState({
    name: "", latitude: "", longitude: "", radiusMeters: 120, activeFrom: "08:45", activeTo: "17:00",
  });

  const loadRoster = () =>
    api("/attendance/roster")
      .then((d) => {
        setRoster(d.roster);
        setMySections(d.sections || []);
      })
      .catch((e) => setMsg(e.message));

  const loadFences = () =>
    api("/geofences").then((d) => setFences(d.geofences)).catch((e) => setMsg(e.message));

  const loadQrContext = () =>
    api("/attendance/qr/context")
      .then((d) => {
        setCtx(d);
        const slot = d.current || d.next; // abhi ki class, warna agli
        const sec = slot ? slot.section : d.sections[0] || "";
        setQrSection(sec);
        setQrSubject(sec ? d.sectionSubject[sec] || "" : "");
      })
      .catch((e) => setMsg(e.message));

  useEffect(() => {
    loadRoster();
    loadFences();
    loadQrContext();
    api("/settings/checkin").then((d) => setMethods(d.methods)).catch((e) => setMsg(e.message));
    const t = setInterval(loadRoster, 15000);
    return () => clearInterval(t);
  }, []);

  const onSectionChange = (e) => {
    const sec = e.target.value;
    setQrSection(sec);
    setQrSubject(ctx?.sectionSubject?.[sec] || "");
  };

  const toggleMethod = async (key, val) => {
    setMsg("");
    const prev = methods;
    const next = { ...methods, face: false, [key]: val }; // face hamesha off
    setMethods(next);
    try {
      const d = await api("/settings/checkin", { method: "PUT", body: next });
      setMethods(d.methods);
    } catch (e) {
      setMethods(prev);
      setMsg(e.message);
    }
  };

  const generateQr = async () => {
    setMsg("");

    // popup blocker se bachne ke liye click par hi turant window kholo
    const win = window.open("", "_blank");
    if (!win) {
      setMsg("Popup blocked hai. Browser me is site ke liye popups allow karo.");
      return;
    }
    win.document.write("<p style='font-family:sans-serif;padding:24px'>Generating QR...</p>");

    try {
      const d = await api("/attendance/qr", {
        method: "POST",
        body: { subject: qrSubject.trim(), section: qrSection.trim() },
      });
      const data = { code: d.qrCode, subject: d.qr.subject, section: d.qr.section };
      setQr(data);
      writeQrWindow(win, data);
    } catch (e) {
      win.close();
      setMsg(e.message);
    }
  };

  const reopenQr = () => {
    if (!qr) return;
    const win = window.open("", "_blank");
    if (!win) return setMsg("Popup blocked hai. Browser me popups allow karo.");
    writeQrWindow(win, qr);
  };

  // ---------- Manual check-in (admin side) ----------
  const manualMark = async (s, status) => {
    setMsg("");
    setBusyId(s.identifier);
    try {
      await api("/attendance/manual", {
        method: "POST",
        body: { identifier: s.identifier, section: s.section, status }, // status: "present" | "absent"
      });
      await loadRoster();
      setMsg(
        status === "present"
          ? `${s.name || s.identifier} ko present mark kar diya`
          : `${s.name || s.identifier} ki attendance hata di`
      );
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

  const useMyLocation = () =>
    navigator.geolocation.getCurrentPosition(
      (p) => setF((s) => ({ ...s, latitude: p.coords.latitude, longitude: p.coords.longitude })),
      () => setMsg("Location permission denied")
    );

  const addFence = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api("/geofences", {
        method: "POST",
        body: {
          ...f,
          latitude: Number(f.latitude),
          longitude: Number(f.longitude),
          radiusMeters: Number(f.radiusMeters),
        },
      });
      setMsg("Geo-fence added");
      loadFences();
    } catch (e2) {
      setMsg(e2.message);
    }
  };

  const present = roster.filter((s) => s.status).length;
  const pct = roster.length ? Math.round((present / roster.length) * 100) : 0;

  // ---------- Search + section-wise grouping ----------
  const q = search.trim().toLowerCase();
  const filtered = roster.filter(
    (s) =>
      !q ||
      (s.name || "").toLowerCase().includes(q) ||
      String(s.identifier).toLowerCase().includes(q) ||
      (s.section || "").toLowerCase().includes(q)
  );

  const grouped = filtered.reduce((acc, s) => {
    const k = s.section || "No section";
    (acc[k] = acc[k] || []).push(s);
    return acc;
  }, {});
  const sectionKeys = Object.keys(grouped).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  );

  // selected section: agar abhi ka selection list me nahi hai to pehla le lo
  const currentSection = sectionKeys.includes(activeSection) ? activeSection : sectionKeys[0] || "";
  const currentList = grouped[currentSection] || [];
  const currentPresent = currentList.filter((s) => s.status).length;

  const rows = [
    { key: "gps", icon: MapPin, title: "GPS Geo-fence", sub: "Students must be inside the geo-fence" },
    { key: "qr", icon: QrCode, title: "QR Code", sub: "Students scan a live QR shown by you" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-title disp">Admin overview</div>
          <div className="page-sub">
            Control check-in methods and watch attendance live
            {ctx?.teacher ? ` · ${ctx.teacher}` : ""}
          </div>
        </div>
      </div>

      {msg && (
        <div className="card" style={{ marginBottom: 16, padding: "12px 16px", fontSize: 13.5 }}>
          {msg}
        </div>
      )}

      {/* STATS */}
      <div style={{ ...autoGrid(200), marginBottom: 16 }}>
        <div className="card"><div className="stat-label">Total Students</div><div className="stat-value">{roster.length}</div></div>
        <div className="card"><div className="stat-label">Present Today</div><div className="stat-value">{present}/{roster.length}</div><div className="stat-delta up">↑ live</div></div>
        <div className="card"><div className="stat-label">Today's Attendance</div><div className="stat-value">{pct}%</div></div>
        <div className="card"><div className="stat-label">Active Geo-fences</div><div className="stat-value">{fences.length}</div></div>
      </div>

      {/* CONTROLS */}
      <div style={{ ...autoGrid(340), marginBottom: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          {/* Check-in methods */}
          <div className="card">
            <div className="card-title">Check-in methods</div>
            <div className="card-sub">Turn on what students can use right now</div>

            {rows.map(({ key, icon: Icon, title, sub }) => (
              <div
                key={key}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
                  borderTop: "1px solid var(--line)",
                }}
              >
                <Icon size={18} color="var(--blue)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{sub}</div>
                </div>
                <Toggle on={methods[key]} onChange={(v) => toggleMethod(key, v)} />
              </div>
            ))}

            {methods.gps && fences.length === 0 && (
              <div style={{ fontSize: 12.5, color: "var(--coral)", marginTop: 4 }}>
                GPS is on but no geo-fence exists. Add one.
              </div>
            )}
          </div>

          {/* Live QR */}
          <div className="card">
            <div className="card-title">Live QR</div>
            <div className="card-sub">Students scan this to mark attendance</div>

            <div style={autoGrid(140)}>
              <div className="field">
                <label>Subject</label>
                <input value={qrSubject} readOnly placeholder="Auto from timetable" />
              </div>
              <div className="field">
                <label>Section</label>
                <select
                  value={qrSection}
                  onChange={onSectionChange}
                  disabled={!methods.qr || !ctx?.sections?.length}
                  style={selectStyle}
                >
                  {!ctx?.sections?.length && <option value="">No sections</option>}
                  {ctx?.sections?.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {ctx?.current ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "4px 0 10px" }}>
                Abhi chal rahi: {ctx.current.subject} · {ctx.current.section} · {ctx.current.time}
              </div>
            ) : ctx?.next ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "4px 0 10px" }}>
                Agli class: {ctx.next.subject} · {ctx.next.section} · {ctx.next.time}
              </div>
            ) : ctx ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "4px 0 10px" }}>
              </div>
            ) : null}

            <button
              type="button"
              className="pill-btn"
              onClick={generateQr}
              disabled={!methods.qr || !qrSubject.trim() || !qrSection.trim()}
            >
              Generate QR
            </button>
            {!methods.qr && (
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 8 }}>
                Turn on QR Code first.
              </div>
            )}
          </div>
        </div>

        {/* Geo-fence */}
        <form className="card" onSubmit={addFence}>
          <div className="card-title">Geo-fence</div>
          <div className="card-sub">Add a campus zone for GPS check-in</div>

          <div style={autoGrid(140)}>
            <div className="field">
              <label>Name</label>
              <select
                name="name"
                value={f.name}
                onChange={onChange}
                required
                style={selectStyle}
              >
                <option value="" disabled>Select campus</option>
                {CAMPUS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field"><label>Radius (m)</label><input name="radiusMeters" type="number" value={f.radiusMeters} onChange={onChange} /></div>
            <div className="field"><label>Latitude</label><input name="latitude" value={f.latitude} onChange={onChange} required /></div>
            <div className="field"><label>Longitude</label><input name="longitude" value={f.longitude} onChange={onChange} required /></div>
            <div className="field"><label>Active from</label><input name="activeFrom" type="time" value={f.activeFrom} onChange={onChange} /></div>
            <div className="field"><label>Active to</label><input name="activeTo" type="time" value={f.activeTo} onChange={onChange} /></div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="pill-btn outline" onClick={useMyLocation}>Use my location</button>
            <button type="submit" className="pill-btn">Save</button>
          </div>
        </form>
      </div>

      {/* QR ACTIVE (QR nayi window me khulta hai) */}
      {qr && (
        <div
          className="card"
          style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="card-title">QR active</div>
            <div className="card-sub" style={{ marginBottom: 0 }}>
              {qr.subject} · Section {qr.section} · nayi window me khula hai
            </div>
          </div>
          <button type="button" className="pill-btn outline" onClick={reopenQr}>Open again</button>
          <button type="button" className="pill-btn outline" onClick={() => setQr(null)}>Clear</button>
        </div>
      )}

      {/* LIVE ROSTER HEADER + SEARCH */}
      <div
        className="card"
        style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="card-title">Live roster</div>
          <div className="card-sub" style={{ marginBottom: 0 }}>
            {mySections.length ? `Sections: ${mySections.join(", ")} · ` : ""}
            Refreshes every 15 seconds.
          </div>
        </div>
        <div style={{ position: "relative", flex: "0 1 320px", minWidth: 220 }}>
          <Search
            size={16}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, roll no, section"
            style={{ ...selectStyle, paddingLeft: 38 }}
          />
        </div>
      </div>

      {/* SECTION TABS */}
      {sectionKeys.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--ink-soft)" }}>
          {roster.length === 0 ? "No students yet." : "Koi student match nahi hua."}
        </div>
      ) : (
        <>
          <div style={tabBar}>
            {sectionKeys.map((sec) => (
              <button
                key={sec}
                type="button"
                style={tabBtn(sec === currentSection)}
                onClick={() => setActiveSection(sec)}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Sirf selected section ke students */}
          <div className="card">
            <div
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                gap: 12, flexWrap: "wrap",
              }}
            >
              <div className="card-title">Section {currentSection}</div>
              <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                {currentPresent}/{currentList.length} present
              </div>
            </div>

            <div style={sectionBody}>
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Method</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentList.map((s) => (
                    <tr key={s.identifier}>
                      <td>
                        <div className="row-name">
                          <div className="mini-avatar">{initials(s)}</div>
                          <div>
                            <div>{s.name || s.identifier}</div>
                            {s.name && (
                              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                                {s.identifier}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{s.method ? <MethodPill method={M[s.method] || s.method} /> : "—"}</td>
                      <td style={{ color: "var(--ink-soft)" }}>
                        {s.checked_in_at
                          ? new Date(s.checked_in_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                          : "—"}
                      </td>
                      <td>
                        {s.status ? (
                          <StatusBadge status={s.status} />
                        ) : (
                          <span className="badge" style={{ background: "#EEF1F5", color: "#5B6270" }}>
                            Not checked in
                          </span>
                        )}
                      </td>
                      <td>
                        {s.status ? (
                          <button
                            type="button"
                            className="pill-btn outline"
                            disabled={busyId === s.identifier}
                            onClick={() => manualMark(s, "absent")}
                          >
                            {busyId === s.identifier ? "..." : "Mark absent"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pill-btn"
                            disabled={busyId === s.identifier}
                            onClick={() => manualMark(s, "present")}
                          >
                            {busyId === s.identifier ? "..." : "Mark present"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}