import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const METHOD_LABEL = { gps: "GPS Geo-fence", qr: "QR Code", face: "Face Recognition" };
const METHOD_COLOR = { gps: "#0061FE", qr: "#16A87D", face: "#8B5CF6" };

const axisTick = { fontSize: 12, fill: "#5B6270" };

function Empty({ text }) {
  return (
    <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" }}>
      {text}
    </div>
  );
}

export default function Analytics() {
  const [trend, setTrend] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [methodSplit, setMethodSplit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";
  const subtitle = isAdmin ? "Trends across the section" : "Your personal attendance analytics";

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setError("You are not logged in.");
          return;
        }

        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const path = isAdmin ? "/api/attendance/analytics" : "/api/attendance/my-analytics";

        const response = await fetch(`${API_BASE}${path}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load analytics.");

        setTrend((data.trend || []).map((t) => ({ day: t.label || t.day, pct: Number(t.pct) })));
        setSubjects((data.subjects || []).map((s) => ({ cls: s.cls, pct: Number(s.pct) })));
        setMethodSplit(data.methodSplit || []);
      } catch (err) {
        console.error("Analytics error:", err);
        setError(err.message || "Unable to load analytics.");
        setTrend([]);
        setSubjects([]);
        setMethodSplit([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAdmin]);

  const methodData = methodSplit.map((item) => ({
    name: METHOD_LABEL[item.name] || item.name,
    value: Number(item.value),
    color: METHOD_COLOR[item.name] || "#9AA3B2",
  }));

  const header = (
    <div className="page-head">
      <div>
        <div className="page-title disp">Analytics</div>
        <div className="page-sub">{subtitle}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        {header}
        <div className="card">
          <div style={{ padding: 40, textAlign: "center", color: "var(--ink-soft)" }}>
            Loading attendance analytics...
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {header}
        <div className="card">
          <div style={{ padding: 40, textAlign: "center", color: "var(--coral)" }}>{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      {header}

      <div className="grid g3" style={{ marginBottom: 16 }}>
        {/* WEEKLY TREND */}
        <div className="card">
          <div className="card-title">Weekly attendance trend</div>
          <div className="card-sub">Attendance percentage</div>

          {trend.length === 0 ? (
            <Empty text="No attendance data available." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid stroke="#EEF1F5" vertical={false} />
                <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="pct" stroke="#0061FE" strokeWidth={3} dot={{ r: 4, fill: "#0061FE" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* CHECK-IN METHOD */}
        <div className="card">
          <div className="card-title">Check-in method</div>
          <div className="card-sub">Share of total check-ins</div>

          {methodData.length === 0 ? (
            <Empty text="No check-in data available." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={methodData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3} label={({ value }) => value}>
                  {methodData.map((m, i) => (
                    <Cell key={i} fill={m.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SUBJECT-WISE */}
      <div className="card">
        <div className="card-title">Attendance by subject</div>
        <div className="card-sub">Current attendance percentage</div>

        {subjects.length === 0 ? (
          <Empty text="No subject attendance data available." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjects}>
              <CartesianGrid stroke="#EEF1F5" vertical={false} />
              <XAxis dataKey="cls" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="pct" fill="#0061FE" radius={[6, 6, 0, 0]} barSize={46} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}