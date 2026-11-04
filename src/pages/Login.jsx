
import React, { useState, useEffect } from "react";
import "../styles/login-style.css";
import { useNavigate } from "react-router-dom";
import {
  Radar,
  ArrowRight,
  Github,
  Linkedin,
  Mail,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const initialSetupForm = {
  rollNumber: "",
  setupCode: "",
  password: "",
  confirmPassword: "",
};

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    rollNumber: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [checkingSession, setCheckingSession] = useState(true);
  const [savedUser, setSavedUser] = useState(null);

  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [setupForm, setSetupForm] = useState(initialSetupForm);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [setupSuccess, setSetupSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        if (!cancelled) setCheckingSession(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();

        if (!cancelled) {
          setSavedUser(data.user);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const continueAsSavedUser = () => {
    if (savedUser) {
      navigate(`/app/${savedUser.role}`);
    }
  };

  const useAnotherAccount = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSavedUser(null);
    setForm({ rollNumber: "", password: "" });
    setError("");
  };

  const switchRole = (newRole) => {
    setRole(newRole);
    setForm({ rollNumber: "", password: "" });
    setError("");
    setSetupError("");
    setSetupSuccess("");
    setShowPasswordSetup(false);
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSetupChange = (event) => {
    setSetupForm({
      ...setupForm,
      [event.target.name]: event.target.value,
    });
  };

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: form.rollNumber.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.user || data.user.role !== role) {
        throw new Error(
          role === "admin"
            ? "This account is not an admin. Select the correct role."
            : "This is an admin account. Select the Admin tab."
        );
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(`/app/${data.user.role}`);
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSetup(event) {
    event.preventDefault();

    setSetupError("");
    setSetupSuccess("");

    if (setupForm.password !== setupForm.confirmPassword) {
      setSetupError("Passwords do not match.");
      return;
    }

    if (setupForm.password.length < 12) {
      setSetupError("Password must be at least 12 characters long.");
      return;
    }

    setSetupLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/setup-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: setupForm.rollNumber.trim(),
          setupCode: setupForm.setupCode.trim(),
          password: setupForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to set password.");
      }

      setSetupSuccess(
        "Password set successfully. You can now log in."
      );

      setForm({
        rollNumber: setupForm.rollNumber.trim(),
        password: "",
      });

      setRole("student");
      setSetupForm(initialSetupForm);
      setShowPasswordSetup(false);
    } catch (err) {
      setSetupError(
        err.message || "Unable to connect to the server."
      );
    } finally {
      setSetupLoading(false);
    }
  }

  const isAdmin = role === "admin";

  return (
    <div className="login-page">
      <nav className="login-nav">
        <div className="login-brand">
          <div className="mark">
            <Radar size={18} color="#fff" />
          </div>
          <div className="name disp">GeoAttend</div>
        </div>

        <div className="login-nav-links">
          <span
            className="ghost"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/contact")}
          >
            Contact support
          </span>

          <a href="/#about" className="ghost">
            About
          </a>
        </div>
      </nav>

      <div className="login-hero login-hero-solo">
        <div className="login-form-side">
          {checkingSession ? (
            <div
              className="login-card"
              style={{
                textAlign: "center",
                color: "var(--ink-soft)",
                fontSize: 13.5,
              }}
            >
              Checking for a saved session...
            </div>
          ) : savedUser ? (
            <div className="login-card saved-card">
              <div className="saved-avatar">
                {savedUser.role === "admin" ? (
                  <ShieldCheck size={28} />
                ) : (
                  <GraduationCap size={28} />
                )}
              </div>

              <h2 className="disp saved-name">
                {savedUser.name || savedUser.identifier}
              </h2>

              <p className="lead saved-sub">
                {savedUser.role === "admin" ? "Admin" : "Student"} ·{" "}
                {savedUser.identifier}
              </p>

              <button
                type="button"
                className="login-submit"
                onClick={continueAsSavedUser}
              >
                Continue
                <ArrowRight
                  size={15}
                  style={{ marginLeft: 6, verticalAlign: "-2px" }}
                />
              </button>

              <div className="login-alt">
                Not you?{" "}
                <span onClick={useAnotherAccount}>
                  Use another account
                </span>
              </div>
            </div>
          ) : (
            <div className="login-card">
              <span className="kz-tag">
                {showPasswordSetup
                  ? "First-time setup"
                  : "Secure sign-in"}
              </span>

              <h2 className="disp">
                {showPasswordSetup
                  ? "Set Your Password"
                  : isAdmin
                    ? "Admin Login"
                    : "Student Login"}
              </h2>

              <p className="lead">
                {showPasswordSetup
                  ? "Enter your roll number and private one-time setup code."
                  : isAdmin
                    ? "Enter your staff ID and password to continue."
                    : "Enter your college roll number and password to continue."}
              </p>

              {!showPasswordSetup && (
                <div className="role-pick">
                  <button
                    type="button"
                    className={role === "student" ? "active" : ""}
                    onClick={() => switchRole("student")}
                  >
                    <GraduationCap size={15} /> Student
                  </button>

                  <button
                    type="button"
                    className={role === "admin" ? "active" : ""}
                    onClick={() => switchRole("admin")}
                  >
                    <ShieldCheck size={15} /> Admin
                  </button>
                </div>
              )}

              {showPasswordSetup ? (
                <form onSubmit={handlePasswordSetup}>
                  <div className="field">
                    <label>Roll Number</label>
                    <input
                      name="rollNumber"
                      value={setupForm.rollNumber}
                      onChange={handleSetupChange}
                      placeholder="Enter your college roll number"
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>One-Time Setup Code</label>
                    <input
                      name="setupCode"
                      type="password"
                      value={setupForm.setupCode}
                      onChange={handleSetupChange}
                      placeholder="Enter your private setup code"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>New Password</label>
                    <input
                      name="password"
                      type="password"
                      value={setupForm.password}
                      onChange={handleSetupChange}
                      placeholder="At least 12 characters"
                      autoComplete="new-password"
                      minLength={12}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Confirm New Password</label>
                    <input
                      name="confirmPassword"
                      type="password"
                      value={setupForm.confirmPassword}
                      onChange={handleSetupChange}
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      minLength={12}
                      required
                    />
                  </div>

                  {setupError && (
                    <div className="login-error" role="alert">
                      {setupError}
                    </div>
                  )}

                  {setupSuccess && (
                    <div
                      role="status"
                      style={{
                        color: "green",
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      {setupSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="login-submit"
                    disabled={setupLoading}
                  >
                    {setupLoading
                      ? "Setting password..."
                      : "Set Password"}

                    {!setupLoading && (
                      <ArrowRight
                        size={15}
                        style={{
                          marginLeft: 6,
                          verticalAlign: "-2px",
                        }}
                      />
                    )}
                  </button>

                  <div className="login-alt">
                    Already set your password?{" "}
                    <span
                      onClick={() => {
                        setShowPasswordSetup(false);
                        setSetupError("");
                        setSetupSuccess("");
                      }}
                    >
                      Back to Login
                    </span>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin}>
                  <div className="field">
                    <label>{isAdmin ? "Staff ID" : "Roll Number"}</label>
                    <input
                      name="rollNumber"
                      value={form.rollNumber}
                      onChange={handleChange}
                      placeholder={
                        isAdmin
                          ? "Enter your staff ID"
                          : "Enter your college roll number"
                      }
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Password</label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  {error && (
                    <div className="login-error" role="alert">
                      {error}
                    </div>
                  )}

                  {setupSuccess && (
                    <div
                      role="status"
                      style={{
                        color: "green",
                        fontSize: 13,
                        marginBottom: 12,
                      }}
                    >
                      {setupSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="login-submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Login"}

                    {!loading && (
                      <ArrowRight
                        size={15}
                        style={{
                          marginLeft: 6,
                          verticalAlign: "-2px",
                        }}
                      />
                    )}
                  </button>

                  {role === "student" && (
                    <div className="login-alt">
                      First time here?{" "}
                      <span
                        onClick={() => {
                          setSetupForm({
                            ...initialSetupForm,
                            rollNumber: form.rollNumber.trim(),
                          });
                          setSetupError("");
                          setSetupSuccess("");
                          setError("");
                          setShowPasswordSetup(true);
                        }}
                      >
                        Set up password
                      </span>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>

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
            <Github size={17} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={17} />
          </a>
          <a href="mailto:hello@geoattend.app" aria-label="Email">
            <Mail size={17} />
          </a>
        </div>
      </footer>
    </div>
  );
}
