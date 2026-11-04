import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import ContactPage from "./pages/ContactPage.jsx";

import AppLayout from "./components/AppLayout.jsx";

import StudentDashboard from "./pages/StudentDashboard.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import Analytics from "./pages/Analytics.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <Routes>

      {/* =========================
          PUBLIC PAGES
      ========================= */}

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/contact"
        element={<ContactPage />}
      />


      {/* =========================
          STUDENT APP
      ========================= */}

      <Route
        path="/app/student"
        element={<AppLayout />}
      >
        <Route
          index
          element={<StudentDashboard />}
        />

        <Route
          path="history"
          element={<HistoryPage />}
        />

        <Route
          path="analytics"
          element={<Analytics />}
        />

        <Route
          path="settings"
          element={<SettingsPage />}
        />

        <Route
          path="profile"
          element={<ProfilePage />}
        />
      </Route>


      {/* =========================
          ADMIN APP
      ========================= */}

      <Route
        path="/app/admin"
        element={<AppLayout />}
      >
        <Route
          index
          element={<AdminDashboard />}
        />
      </Route>


      {/* =========================
          UNKNOWN ROUTE
      ========================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}