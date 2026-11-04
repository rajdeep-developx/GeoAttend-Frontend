
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  GraduationCap,
  ShieldCheck,
  User,
  LogOut,
  Menu,
} from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {}

  const isAdmin =
    user.role === "admin" || pathname.startsWith("/app/admin");

  const RoleIcon = isAdmin ? ShieldCheck : GraduationCap;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProfile = () => {
    setOpen(false);
    navigate("/app/student/profile");
  };

  const logOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="topbar">
      {/* Mobile sidebar button */}
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      <div className="topbar-role">
        <RoleIcon size={16} />
        {isAdmin ? "Admin" : "Student"}
      </div>

      <div className="top-right">
        <Bell size={18} color="#5B6270" />

        <div className="account-menu" ref={menuRef}>
          <div
            className="avatar"
            style={{ cursor: "pointer" }}
            onClick={() => setOpen((o) => !o)}
          >
            <RoleIcon size={17} />
          </div>

          {open && (
            <div className="account-dropdown">
              {!isAdmin && (
                <button
                  className="account-dropdown-item"
                  onClick={goToProfile}
                >
                  <User size={15} /> Profile
                </button>
              )}

              <button
                className="account-dropdown-item danger"
                onClick={logOut}
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
