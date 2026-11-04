import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AttendanceStat({ refreshKey }) {
  const [s, setS] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/summary/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setS)
      .catch((e) => console.error("Summary error:", e));
  }, [refreshKey]);

  const pct = s?.percentage;

  return (
    <div className="card">
      <div className="stat-label">Attendance</div>

      <div
        className="stat-value"
        style={{ color: s?.belowThreshold ? "var(--coral)" : undefined }}
      >
        {pct === null || pct === undefined ? "—" : `${pct}%`}
      </div>

      <div className="stat-delta" style={{ color: "var(--ink-soft)" }}>
        {s && s.total > 0
          ? `${s.attended} of ${s.total} classes attended`
          : "No classes held yet"}
      </div>

      {s?.belowThreshold && (
        <div style={{ fontSize: 12.5, color: "var(--coral)", marginTop: 6, fontWeight: 600 }}>
          Below {s.threshold}% — attend more classes
        </div>
      )}

      {s?.subjects?.length > 0 && (
        <div
          style={{
            display: "flex", flexWrap: "wrap", gap: "4px 12px",
            marginTop: 10, fontSize: 12, color: "var(--ink-soft)",
          }}
        >
          {s.subjects.map((x) => (
            <span key={x.subject}>
              <b>{x.subject}</b> {x.attended}/{x.total}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}