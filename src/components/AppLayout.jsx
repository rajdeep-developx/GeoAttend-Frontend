
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import "../styles/app-style.css";

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={menuOpen}
        closeMobileMenu={() => setMenuOpen(false)}
      />

      <div className="app-main">
        <Topbar onMenuClick={() => setMenuOpen(!menuOpen)} />

        <div className="canvas">
          <Outlet />
        </div>
      </div>

      {menuOpen && (
        <button
          className="mobile-menu-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
