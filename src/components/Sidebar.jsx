
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Radar,
  LayoutGrid,
  History,
  BarChart3,
  Settings,
  X,
} from "lucide-react";

export default function Sidebar({ mobileOpen = false, closeMobileMenu = () => {} }) {
  const { pathname } = useLocation();

  let savedRole = "";

  try {
    savedRole = JSON.parse(localStorage.getItem("user") || "{}").role || "";
  } catch {}

  // Admin ko student sidebar nahi dikhana
  if (savedRole === "admin" || pathname.startsWith("/app/admin")) {
    return null;
  }

  const items = [
    { to: "/app/student", end: true, label: "Dashboard", icon: LayoutGrid },
    { to: "/app/student/history", label: "Attendance History", icon: History },
    { to: "/app/student/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/app/student/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={`rail ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="rail-brand">
        <div className="mark">
          <Radar size={16} color="#fff" />
        </div>

        <div>
          <div className="name disp">GeoAttend</div>
          <div className="sub">Cloud Attendance</div>
        </div>

        <button
          type="button"
          className="mobile-sidebar-close"
          aria-label="Close menu"
          onClick={closeMobileMenu}
        >
          <X size={20} />
        </button>
      </div>

      {items.map(({ to, end, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={closeMobileMenu}
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Icon size={16} />
          <span>{label}</span>
        </NavLink>
      ))}

      <div className="rail-foot">
        Geo-fence radius: <b style={{ color: "#fff" }}>50m</b>
        <br />
        Campus block active: <b style={{ color: "#fff" }}>8:00–17:00</b>
      </div>
    </aside>
  );
}
