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
  MessageCircle,
  X,
  Send,
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

  // Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRollNumber, setChatRollNumber] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessageType, setChatMessageType] = useState("info");

  const isAdmin = role === "admin";

  // Check saved session
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token || !userStr) {
        if (!cancelled) {
          setCheckingSession(false);
        }
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
        if (!cancelled) {
          setCheckingSession(false);
        }
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
    setForm({
      rollNumber: "",
      password: "",
    });
    setError("");
  };

  const switchRole = (newRole) => {
    setRole(newRole);

    setForm({
      rollNumber: "",
      password: "",
    });

    setError("");
    setSetupError("");
    setSetupSuccess("");
    setShowPasswordSetup(false);
    setSetupForm(initialSetupForm);

    // Reset chatbot messages when switching role
    setChatRollNumber("");
    setChatMessage("");
    setChatMessageType("info");
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

  // Contact Developer - Student and Teacher
  const handleEmailDeveloper = (identifierOverride = "") => {
    const developerEmail = "23051290@kiit.ac.in";

    const identifierValue =
      identifierOverride.trim() ||
      chatRollNumber.trim() ||
      form.rollNumber.trim() ||
      setupForm.rollNumber.trim();

    const identifierLabel =
      role === "admin" ? "Teacher ID" : "Roll Number";

    const subject =
      role === "admin"
        ? "GeoAttend - Teacher One-Time Setup Code Request"
        : "GeoAttend - Student One-Time Setup Code Request";

    const requestType =
      role === "admin"
        ? "I request a one-time setup code to create my GeoAttend Teacher account password."
        : "I request a one-time setup code to create my GeoAttend Student account password.";

    const body = `Hello Developer,

I need assistance with my GeoAttend account.

${identifierLabel}: ${identifierValue}

Request: ${requestType}

Please provide my one-time setup code.

Thank you.`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      developerEmail
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailUrl, "_blank", "noopener,noreferrer");
  };

  // Student and Teacher chatbot handling
  async function handleSetupStatusCheck(event) {
    event.preventDefault();

    const identifier = chatRollNumber.trim();

    if (!identifier) {
      setChatMessage(
        isAdmin
          ? "Please enter your Teacher ID."
          : "Please enter your roll number."
      );
      setChatMessageType("error");
      return;
    }

    // Teacher: Show email request option
    if (isAdmin) {
      setChatMessage(
        "To request your one-time Teacher setup code, click the Email Developer button below."
      );
      setChatMessageType("pending");
      return;
    }

    // Existing Student setup-status API flow
    setChatLoading(true);
    setChatMessage("");
    setChatMessageType("info");

    try {
      const response = await fetch(
        `${API_BASE}/api/auth/setup-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setChatMessage(
          data.message || "Unable to verify this roll number."
        );
        setChatMessageType("error");
        return;
      }

      setChatMessage(
        data.message || "Unable to check setup status."
      );

      setChatMessageType(
        data.status === "completed"
          ? "success"
          : data.status === "pending"
          ? "pending"
          : "info"
      );
    } catch {
      setChatMessage(
        "Unable to connect to the server. Please try again."
      );
      setChatMessageType("error");
    } finally {
      setChatLoading(false);
    }
  }

  // Student and Teacher login
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
            ? "This account is not a Teacher account. Check your Teacher ID."
            : "This is a Teacher account. Please select the Teacher tab."
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

  // Student and Teacher password setup
  async function handlePasswordSetup(event) {
    event.preventDefault();

    setSetupError("");
    setSetupSuccess("");

    if (!setupForm.rollNumber.trim()) {
      setSetupError(
        isAdmin
          ? "Please enter your Teacher ID."
          : "Please enter your roll number."
      );
      return;
    }

    if (!setupForm.setupCode.trim()) {
      setSetupError("Please enter your one-time setup code.");
      return;
    }

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
      const response = await fetch(
        `${API_BASE}/api/auth/setup-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: setupForm.rollNumber.trim(),
            setupCode: setupForm.setupCode.trim(),
            password: setupForm.password,
          }),
        }
      );

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
                {savedUser.role === "admin" ? "Teacher" : "Student"} ·{" "}
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
                  style={{
                    marginLeft: 6,
                    verticalAlign: "-2px",
                  }}
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
                  ? "Teacher Login"
                  : "Student Login"}
              </h2>

              <p className="lead">
                {showPasswordSetup
                  ? isAdmin
                    ? "Enter your Teacher ID and private one-time setup code."
                    : "Enter your college roll number and private one-time setup code."
                  : isAdmin
                  ? "Enter your Teacher ID and password to continue."
                  : "Enter your college roll number and password to continue."}
              </p>

              {!showPasswordSetup && (
                <div className="role-pick">
                  <button
                    type="button"
                    className={role === "student" ? "active" : ""}
                    onClick={() => switchRole("student")}
                  >
                    <GraduationCap size={15} />
                    Student
                  </button>

                  <button
                    type="button"
                    className={role === "admin" ? "active" : ""}
                    onClick={() => switchRole("admin")}
                  >
                    <ShieldCheck size={15} />
                    Teacher
                  </button>
                </div>
              )}

              {showPasswordSetup ? (
                <form onSubmit={handlePasswordSetup}>
                  <div className="field">
                    <label>
                      {isAdmin ? "Teacher ID" : "Roll Number"}
                    </label>

                    <input
                      name="rollNumber"
                      value={setupForm.rollNumber}
                      onChange={handleSetupChange}
                      placeholder={
                        isAdmin
                          ? "Enter your Teacher ID"
                          : "Enter your college roll number"
                      }
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
                    Need help?{" "}
                    <span onClick={handleEmailDeveloper}>
                      Contact Developer
                    </span>
                  </div>

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
                    <label>
                      {isAdmin ? "Teacher ID" : "Roll Number"}
                    </label>

                    <input
                      name="rollNumber"
                      value={form.rollNumber}
                      onChange={handleChange}
                      placeholder={
                        isAdmin
                          ? "Enter your Teacher ID"
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

                  {isAdmin ? (
                    <div className="login-alt">
                      Forgot Password?{" "}
                      <span onClick={handleEmailDeveloper}>
                        Contact Developer
                      </span>
                    </div>
                  ) : (
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

                  {isAdmin && (
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

      {/* Floating Student and Teacher Chatbot */}
      <div className="geo-chat-widget">
        {chatOpen && (
          <div className="geo-chat-panel">
            <div className="geo-chat-header">
              <div className="geo-chat-heading">
                <div className="geo-chat-avatar">
                  {isAdmin ? (
                    <ShieldCheck size={20} />
                  ) : (
                    <GraduationCap size={20} />
                  )}
                </div>

                <div>
                  <div className="geo-chat-title">
                    GeoAttend Assistant
                  </div>

                  <div className="geo-chat-subtitle">
                    {isAdmin
                      ? "Teacher password setup assistance"
                      : "Password setup status"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="geo-chat-close"
                onClick={() => setChatOpen(false)}
                aria-label="Close chatbot"
              >
                <X size={19} />
              </button>
            </div>

            <div className="geo-chat-body">
              <div className="geo-chat-bubble bot">
                {isAdmin
                  ? "Hi Teacher! Please enter your Teacher ID to request your one-time password setup code."
                  : "Hi! Please enter your college roll number to check your password setup status."}
              </div>

              {chatMessage && (
                <div
                  className={`geo-chat-bubble response ${chatMessageType}`}
                  role="status"
                >
                  {chatMessage}
                </div>
              )}

              {chatMessageType === "pending" && (
                <button
                  type="button"
                  className="geo-chat-email-button"
                  onClick={() =>
                    handleEmailDeveloper(chatRollNumber)
                  }
                  disabled={!chatRollNumber.trim()}
                >
                  <Mail size={16} />
                  Email Developer
                </button>
              )}

              <div className="geo-chat-note">
                {isAdmin
                  ? "Your setup code will be shared privately by the developer. This assistant never displays setup codes."
                  : "This assistant only checks setup status. It never provides setup codes."}
              </div>
            </div>

            <form
              className="geo-chat-form"
              onSubmit={handleSetupStatusCheck}
            >
              <input
                type="text"
                value={chatRollNumber}
                onChange={(event) => {
                  setChatRollNumber(event.target.value);
                  setChatMessage("");
                  setChatMessageType("info");
                }}
                placeholder={
                  isAdmin
                    ? "Enter your Teacher ID"
                    : "Enter your roll number"
                }
                aria-label={
                  isAdmin ? "Teacher ID" : "College roll number"
                }
                autoComplete="off"
                disabled={chatLoading}
                required
              />

              <button
                type="submit"
                disabled={chatLoading || !chatRollNumber.trim()}
                aria-label={
                  isAdmin
                    ? "Request setup code"
                    : "Check setup status"
                }
              >
                {chatLoading ? (
                  <span className="geo-chat-spinner" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          className="geo-chat-toggle"
          onClick={() => setChatOpen((previous) => !previous)}
          aria-label={chatOpen ? "Close assistant" : "Open assistant"}
        >
          {chatOpen ? <X size={25} /> : <MessageCircle size={25} />}
        </button>
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

          <a
            href="mailto:hello@geoattend.app"
            aria-label="Email"
          >
            <Mail size={17} />
          </a>
        </div>
      </footer>

      {/* Chatbot Styling */}
      <style>{`
        .geo-chat-widget {
          position: fixed;
          right: 28px;
          bottom: 25px;
          z-index: 9999;
          font-family: inherit;
        }

        .geo-chat-toggle {
          width: 60px;
          height: 60px;
          border: none;
          border-radius: 50%;
          background: #2563eb;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 22px rgba(37, 99, 235, 0.35);
          transition: transform 0.2s, background 0.2s;
        }

        .geo-chat-toggle:hover {
          background: #1d4ed8;
          transform: translateY(-3px);
        }

        .geo-chat-panel {
          position: absolute;
          right: 0;
          bottom: 76px;
          width: 355px;
          max-width: calc(100vw - 32px);
          background: #ffffff;
          border-radius: 17px;
          overflow: hidden;
          box-shadow: 0 12px 45px rgba(15, 23, 42, 0.2);
          border: 1px solid #e5e7eb;
          animation: geoChatAppear 0.2s ease;
        }

        @keyframes geoChatAppear {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .geo-chat-header {
          background: #2563eb;
          color: #ffffff;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .geo-chat-heading {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .geo-chat-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .geo-chat-title {
          font-size: 14px;
          font-weight: 700;
        }

        .geo-chat-subtitle {
          font-size: 11px;
          opacity: 0.85;
          margin-top: 3px;
        }

        .geo-chat-close {
          border: none;
          background: transparent;
          color: white;
          cursor: pointer;
          display: flex;
          padding: 5px;
          border-radius: 6px;
        }

        .geo-chat-close:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .geo-chat-body {
          min-height: 190px;
          max-height: 300px;
          overflow-y: auto;
          padding: 17px;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .geo-chat-bubble {
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.55;
          max-width: 95%;
          overflow-wrap: anywhere;
        }

        .geo-chat-bubble.bot {
          background: #ffffff;
          color: #334155;
          border: 1px solid #e2e8f0;
          align-self: flex-start;
          border-bottom-left-radius: 3px;
        }

        .geo-chat-bubble.response {
          align-self: flex-start;
          border-bottom-left-radius: 3px;
        }

        .geo-chat-bubble.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .geo-chat-bubble.pending {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }

        .geo-chat-bubble.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .geo-chat-bubble.info {
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #bfdbfe;
        }

        .geo-chat-email-button {
          width: 100%;
          min-height: 42px;
          padding: 10px 14px;
          border: none;
          border-radius: 9px;
          background: #2563eb;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .geo-chat-email-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        .geo-chat-email-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .geo-chat-note {
          font-size: 10.5px;
          line-height: 1.5;
          color: #94a3b8;
          text-align: center;
          padding: 0 8px;
        }

        .geo-chat-form {
          padding: 13px;
          display: flex;
          gap: 9px;
          border-top: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .geo-chat-form input {
          flex: 1;
          min-width: 0;
          height: 42px;
          border: 1px solid #dbe1ea;
          border-radius: 9px;
          padding: 0 12px;
          font-size: 12px;
          outline: none;
          color: #1e293b;
        }

        .geo-chat-form input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
        }

        .geo-chat-form button {
          width: 43px;
          height: 42px;
          border: none;
          border-radius: 9px;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .geo-chat-form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .geo-chat-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: geoChatSpin 0.7s linear infinite;
        }

        @keyframes geoChatSpin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 480px) {
          .geo-chat-widget {
            right: 16px;
            bottom: 18px;
          }

          .geo-chat-panel {
            width: calc(100vw - 32px);
            right: 0;
            bottom: 72px;
          }

          .geo-chat-toggle {
            width: 55px;
            height: 55px;
          }
        }
      `}</style>
    </div>
  );
}