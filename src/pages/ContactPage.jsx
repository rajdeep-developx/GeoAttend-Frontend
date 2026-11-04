import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radar, Mail, ArrowLeft, Send, MessageSquare, Bug } from "lucide-react";
import "../styles/contact-style.css";

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", topic: "feedback", message: "" });
  const [sent, setSent] = useState(false);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend (e.g. POST /api/contact)
    setSent(true);
    setForm({ name: "", email: "", topic: "feedback", message: "" });
  };

  return (
    <div className="cp-shell">
      <div className="cp-main">
        <header className="cp-topbar">
          <div className="cp-brand" onClick={() => navigate("/")}>
            <div className="cp-brand-mark">
              <Radar size={22} color="#fff" />
            </div>
            <div>
              <div className="cp-brand-name disp">GEOATTEND</div>
              <div className="cp-brand-sub">Cloud Attendance</div>
            </div>
          </div>
          <div className="cp-pill" onClick={() => navigate("/")}>
            <ArrowLeft size={18} /> Back to Home
          </div>
        </header>

        <main className="cp-content">
          <h1 className="cp-title disp">Get in touch</h1>
          <p className="cp-subtitle">Questions, feedback, or a bug report? Hum sunenge.</p>

          <div className="cp-grid">
            {/* Left: contact info */}
            <section className="cp-card">
              <div className="cp-card-head">
                <MessageSquare size={22} /> Reach us directly
              </div>
              <div className="cp-info-stack">
                <a className="cp-info-row cp-info-link" href="mailto:23051290@kiit.ac.in">
                  <div className="cp-info-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="cp-info-label">Email</div>
                    <div className="cp-info-value">23051290@kiit.ac.in</div>
                  </div>
                </a>
                <div className="cp-info-row">
                  <div className="cp-info-icon">
                    <Bug size={18} />
                  </div>
                  <div>
                    <div className="cp-info-label">Bug reports</div>
                    <div className="cp-info-value">Use the form with topic “Bug”</div>
                  </div>
                </div>
                <span className="cp-chip" style={{ marginLeft: 0, alignSelf: "flex-start" }}>
                  Reply within 24h
                </span>
              </div>
            </section>

            {/* Right: form */}
            <section className="cp-card">
              <div className="cp-card-head">
                <Send size={22} /> Send a message
              </div>
              <form className="cp-form" onSubmit={handleSubmit}>
                <label htmlFor="cp-name">Name</label>
                <input id="cp-name" placeholder="Your name" value={form.name} onChange={update("name")} required />

                <label htmlFor="cp-email">Email</label>
                <input
                  id="cp-email"
                  type="email"
                  placeholder="your@example.com"
                  value={form.email}
                  onChange={update("email")}
                  required
                />

                <label htmlFor="cp-topic">Topic</label>
                <select id="cp-topic" value={form.topic} onChange={update("topic")}>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Bug</option>
                  <option value="question">Question</option>
                </select>

                <label htmlFor="cp-message">Message</label>
                <textarea
                  id="cp-message"
                  placeholder="What's on your mind?"
                  value={form.message}
                  onChange={update("message")}
                  required
                />

                <button type="submit" className="cp-submit">
                  <Send size={18} /> Send message
                </button>

                {sent && <div className="cp-success">Message Sent. Thanks!</div>}
              </form>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}