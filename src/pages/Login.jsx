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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student"); // "student" | "admin"
  const [step, setStep] = useState("details"); // "details" | "otp"

  const [form, setForm] = useState({
    rollNumber: "",
    email: "",
    otp: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Saved session
  const [checkingSession, setCheckingSession] = useState(true);
  const [savedUser, setSavedUser] = useState(null);

  // Check existing JWT session
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      setCheckingSession(false);
      return;
    }

    fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setSavedUser(data.user))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      })
      .finally(() => setCheckingSession(false));
  }, []);

  // Continue with saved account
  const continueAsSavedUser = () => {
    navigate(`/app/${savedUser.role}`);
  };

  // Use another account
  const useAnotherAccount = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSavedUser(null);
    setStep("details");
    setForm({ rollNumber: "", email: "", otp: "" });
    setError("");
    setInfo("");
  };

  // Switch Student / Admin tab
  const switchRole = (r) => {
    setRole(r);
    setStep("details");
    setForm({ rollNumber: "", email: "", otp: "" });
    setError("");
    setInfo("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    setError("");
    setInfo("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.rollNumber,
          email: form.email,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not send OTP");
      }

      setInfo(data.message);
      setStep("otp");
    } catch (err) {
      setError(err.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.rollNumber,
          otp: form.otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // Safety check: selected tab must match the account's real role
      if (data.user.role !== role) {
        throw new Error(
          role === "admin"
            ? "This account is not an admin."
            : "This is an admin account. Use the Admin tab."
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
  };

  const isAdmin = role === "admin";

  return (
    <div className="login-page">
      {/* ================= NAVBAR ================= */}
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

      {/* ================= LOGIN AREA ================= */}
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
              Checking for a saved session…
            </div>
          ) : savedUser ? (
            /* ================= SAVED USER ================= */
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
                Not you? <span onClick={useAnotherAccount}>Use another account</span>
              </div>
            </div>
          ) : (
            /* ================= LOGIN FORM ================= */
            <form
              className="login-card"
              onSubmit={step === "details" ? handleSendOtp : handleVerifyOtp}
            >
              <span className="kz-tag">
                {step === "details" ? "Secure sign-in" : "Check your email"}
              </span>
              <h2 className="disp">
                {isAdmin ? "Admin Login" : "Activate GeoAttend Account"}
              </h2>

              <p className="lead">
                {step === "details"
                  ? isAdmin
                    ? "Enter your staff ID and college email to receive a one-time code."
                    : "Enter your roll number and college email to receive a one-time code."
                  : `Enter the code sent to ${form.email}.`}
              </p>

              {/* ================= ROLE TABS ================= */}
              {step === "details" && (
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

              {/* ================= STEP 1 ================= */}
              {step === "details" && (
                <>
                  <div className="field">
                    <label>{isAdmin ? "Staff ID" : "Roll Number"}</label>
                    <input
                      name="rollNumber"
                      value={form.rollNumber}
                      onChange={handleChange}
                      placeholder={isAdmin ? "ADM-0231" : "Enter Your College Roll No"}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>College Email</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={
                        isAdmin ? "staff@gmail.com" : "yourrollno@kiit.ac.in"
                      }
                      required
                    />
                  </div>
                </>
              )}

              {/* ================= STEP 2 ================= */}
              {step === "otp" && (
                <div className="field">
                  <label>OTP Verification</label>
                  <input
                    name="otp"
                    value={form.otp}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    placeholder="6-digit code"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    required
                    autoFocus
                  />
                </div>
              )}

              {/* ================= ERROR ================= */}
              {error && <div className="login-error">{error}</div>}

              {/* ================= INFO ================= */}
              {info && !error && <div className="login-info">{info}</div>}

              {/* ================= SUBMIT ================= */}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading
                  ? "Please wait…"
                  : step === "details"
                  ? "Send OTP"
                  : "Verify & Continue"}

                {!loading && (
                  <ArrowRight
                    size={15}
                    style={{ marginLeft: 6, verticalAlign: "-2px" }}
                  />
                )}
              </button>

              {/* ================= BACK ================= */}
              {step === "otp" && (
                <div className="login-alt">
                  Wrong details?{" "}
                  <span
                    onClick={() => {
                      setStep("details");
                      setError("");
                      setInfo("");
                      setForm({ ...form, otp: "" });
                    }}
                  >
                    Go back
                  </span>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
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
          <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
            <Github size={17} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
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