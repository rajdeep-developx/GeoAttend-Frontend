import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Save, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [year, setYear] = useState("1st Year");
  const [term, setTerm] = useState("Term 1");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setName(parsed.name || "");
      setYear(parsed.year || "1st Year");
      setTerm(parsed.term || "Term 1");
    }
  }, []);

  const handleBack = () => {
    // Agar history hai to pichle page par, warna dashboard par
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/app/student");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = { ...user, name, year, term };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    // Note: also send this to a PATCH /api/auth/me endpoint once the backend supports it,
    // so the change persists across devices instead of just this browser.
  };

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 480 }}>
        <button
          type="button"
          onClick={handleBack}
          style={backBtnStyle}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="card-title">No profile found</div>
        <div className="card-sub">Log in again to load your profile.</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <button type="button" onClick={handleBack} style={backBtnStyle}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="page-title disp">Profile</div>
          <div className="page-sub">Update your details</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 460 }}>
        <div className="pulse-wrap" style={{ height: 100 }}>
          <div className="pin" style={{ width: 72, height: 72 }}>
            <GraduationCap size={30} />
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          <div className="field">
            <label>Roll Number</label>
            <input value={user.identifier || ""} disabled style={{ background: "var(--mist)", color: "var(--ink-soft)" }} />
          </div>

          <div className="field">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </div>

          <div className="field">
            <label>Term</label>
            <select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
              <option>Term 4</option>
              <option>Term 5</option>
              <option>Term 6</option>
              <option>Term 7</option>
              <option>Term 8</option>
            </select>
          </div>

          <button type="submit" className="login-submit">
            <Save size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />
            {saved ? "Saved!" : "Save changes"}
          </button>
        </form>
      </div>
    </>
  );
}

const backBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 12,
  padding: "6px 12px",
  background: "transparent",
  border: "2px solid var(--ink, #111)",
  borderRadius: 999,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};