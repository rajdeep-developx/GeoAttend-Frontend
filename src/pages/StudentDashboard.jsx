import React, { useEffect, useState } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  QrCode,
  Navigation,
} from "lucide-react";

import { StatusBadge, MethodPill } from "../components/Bits.jsx";
import AttendanceStat from "../components/AttendanceStat.jsx";
import timetable from "../data/timetable.json";
import rollToSection from "../data/rollToSection.json";

import { Html5Qrcode } from "html5-qrcode";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function StudentDashboard() {
  // =========================================
  // BASIC STATE
  // =========================================

  const [checkedIn, setCheckedIn] = useState(false);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [checkInMethod, setCheckInMethod] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);

  // =========================================
  // CHECK-IN STATE
  // =========================================

  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState("");
  const [checkInError, setCheckInError] = useState("");

  // Admin-controlled methods (null = still loading)
  const [methods, setMethods] = useState(null);

  // =========================================
  // QR STATE
  // =========================================

  const [qrScanning, setQrScanning] = useState(false);
  const [qrScanner, setQrScanner] = useState(null);

  // =========================================
  // ATTENDANCE HISTORY
  // =========================================

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // =========================================
  // LOAD LOGGED-IN USER
  // =========================================

  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setName(parsed.name || "");
        setRollNumber(String(parsed.identifier || ""));
      } catch (error) {
        console.error("Invalid user data:", error);
      }
    }
  }, []);

  // =========================================
  // LOAD ENABLED CHECK-IN METHODS (ADMIN SETTINGS)
  // =========================================

  const loadMethods = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/settings/checkin`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.methods) {
        setMethods(data.methods);
      }
    } catch (error) {
      console.error("Settings error:", error);
    }
  };

  useEffect(() => {
    loadMethods();
    const timer = setInterval(loadMethods, 30000);
    return () => clearInterval(timer);
  }, []);

  // =========================================
  // FETCH ATTENDANCE HISTORY
  // =========================================

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setHistoryLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/attendance/history`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load attendance history.");
      }

      setAttendanceHistory(data.history || []);
    } catch (error) {
      console.error("Attendance history error:", error);
      setAttendanceHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceHistory();
  }, []);

  // =========================================
  // ATTENDANCE STREAK
  // =========================================

  const getAttendanceStreak = () => {
    if (attendanceHistory.length === 0) return 0;

    const presentDates = new Set(
      attendanceHistory
        .filter((item) => item.status === "present")
        .map((item) => new Date(item.checked_in_at).toISOString().slice(0, 10))
    );

    let streak = 0;
    const currentDate = new Date();

    while (true) {
      const dateKey = currentDate.toISOString().slice(0, 10);
      if (!presentDates.has(dateKey)) break;

      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  const attendanceStreak = getAttendanceStreak();

  // =========================================
  // STUDENT SECTION
  // =========================================

  const section = rollToSection[rollNumber];

  // Student ke section ke subject -> teacher (DL, EPP...)
const sectionTeachers = (() => {
  const map = {};

  Object.values(timetable[section] || {}).forEach((day) =>
    day.forEach((c) => {
      if (c.teacher && !map[c.subject]) map[c.subject] = c.teacher;
    })
  );

  return Object.entries(map);
})();

  // =========================================
  // WEEK CALCULATIONS
  // =========================================

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const startOfWeek = getStartOfWeek(new Date());
  startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7);

  const weekDates = DAYS.map((_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return date;
  });

  // =========================================
  // SELECTED DAY
  // =========================================

  const selectedDayName = DAYS[selectedDate.getDay()];
  const selectedClasses = section ? timetable[section]?.[selectedDayName] || [] : [];

  const isSameDate = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const today = new Date();

  const weekLabel = `${startOfWeek.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  })} – ${weekDates[6].toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  const handleDaySelect = (date) => {
    setSelectedDate(date);
    setCheckInMessage("");
    setCheckInError("");
  };

  const previousWeek = () => {
    setWeekOffset((prev) => prev - 1);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    setWeekOffset((prev) => prev + 1);
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setWeekOffset(0);
  };

  // =========================================
  // SHARED CHECK-IN REQUEST
  // =========================================

  const sendCheckIn = async (body) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("You are not logged in. Please login again.");
    }

    const response = await fetch(`${API_BASE}/api/attendance/checkin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    let data;

    try {
      data = await response.json();
    } catch {
      throw new Error("Invalid response received from server.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Attendance check-in failed.");
    }

    return data;
  };

  // =========================================
  // STOP QR SCANNER
  // =========================================

  const stopQrScanner = async () => {
    try {
      if (qrScanner) {
        const state = qrScanner.getState();

        if (state === 2 || state === 3) {
          await qrScanner.stop();
        }

        try {
          qrScanner.clear();
        } catch {}
      }
    } catch (error) {
      console.error("Error stopping QR scanner:", error);
    }

    setQrScanner(null);
    setQrScanning(false);
  };

  // Admin turned QR off while the scanner is open
  useEffect(() => {
    if (methods && !methods.qr && qrScanning) {
      stopQrScanner();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods]);

  // =========================================
  // GPS CHECK-IN
  // =========================================

  const handleGeoFenceCheckIn = () => {
    setCheckInMethod("gps");
    setCheckInMessage("");
    setCheckInError("");

    if (!navigator.geolocation) {
      setCheckInError("Geolocation is not supported by your browser.");
      return;
    }

    setCheckInLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const data = await sendCheckIn({ method: "gps", latitude, longitude });

          setCheckedIn(true);
          setCheckInMessage(
            `✓ Attendance marked for ${data.class?.subject || "current class"}`
          );
          setCheckInError("");

          await fetchAttendanceHistory();
        } catch (error) {
          console.error("GPS check-in error:", error);
          setCheckedIn(false);
          setCheckInError(error.message || "Unable to mark attendance.");
          loadMethods(); // admin may have turned this method off
        } finally {
          setCheckInLoading(false);
        }
      },

      (error) => {
        console.error("Location error:", error);
        setCheckInLoading(false);

        if (error.code === 1) {
          setCheckInError("Location permission denied. Please allow location access.");
        } else if (error.code === 2) {
          setCheckInError("Unable to determine your location.");
        } else if (error.code === 3) {
          setCheckInError("Location request timed out. Please try again.");
        } else {
          setCheckInError("Unable to access your location.");
        }
      },

      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // =========================================
  // QR BUTTON
  // =========================================

  const handleQrCheckIn = () => {
    setCheckInMethod("qr");
    setCheckInMessage("");
    setCheckInError("");

    if (qrScanning) return;

    setQrScanning(true);
  };

  // =========================================
  // START QR SCANNER AFTER #qr-reader IS RENDERED
  // =========================================

  useEffect(() => {
    if (!qrScanning) return;

    let scanner = null;
    let cancelled = false;
    let handled = false; // ek hi scan process ho

    // stop() jab scanner chal nahi raha toh throw karta hai, isliye state check + try/catch
    const safeStop = async (s) => {
      try {
        const state = s.getState();
        if (state === 2 || state === 3) await s.stop();
      } catch {}

      try {
        s.clear();
      } catch {}
    };

    const startScanner = async () => {
      try {
        // Wait until React renders #qr-reader
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (cancelled) return;

        if (!document.getElementById("qr-reader")) {
          throw new Error("QR scanner container was not found.");
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported in this browser.");
        }

        scanner = new Html5Qrcode("qr-reader");
        setQrScanner(scanner);

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },

          async (decodedText) => {
            if (cancelled || handled) return;
            handled = true;

            await safeStop(scanner);
            setQrScanner(null);
            setQrScanning(false);

            // Send QR to backend
            try {
              setCheckInLoading(true);

              const data = await sendCheckIn({ method: "qr", qrCode: decodedText });

              setCheckedIn(true);
              setCheckInMessage(
                `✓ Attendance marked for ${data.class?.subject || "current class"}`
              );
              setCheckInError("");

              await fetchAttendanceHistory();
            } catch (error) {
              console.error("QR check-in error:", error);
              setCheckedIn(false);
              setCheckInError(error.message || "Unable to mark QR attendance.");
              loadMethods();
            } finally {
              setCheckInLoading(false);
            }
          },

          () => {
            // QR not detected yet.
          }
        );
      } catch (error) {
        console.error("QR scanner start error:", error);

        if (!cancelled) {
          setQrScanning(false);
          setQrScanner(null);

          let message = "Unable to start camera.";

          if (error?.name === "NotAllowedError") {
            message = "Camera permission was denied. Please allow camera access and try again.";
          } else if (error?.name === "NotFoundError") {
            message = "No camera was found on this device.";
          } else if (error?.name === "NotReadableError") {
            message = "Camera is already being used by another application.";
          } else if (error?.name === "SecurityError") {
            message = "Camera access is blocked by browser security. Use localhost or HTTPS.";
          } else if (error?.message) {
            message = error.message;
          }

          setCheckInError(message);
        }

        if (scanner) await safeStop(scanner);
      }
    };

    startScanner();

    // CLEANUP (ab kabhi throw nahi karega)
    return () => {
      cancelled = true;
      if (scanner) safeStop(scanner);
    };
  }, [qrScanning]);

  // =========================================
  // RENDER
  // =========================================

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-head">
        <div>
          <div className="page-title disp">Welcome back{name ? `, ${name}` : ""}</div>
          <div className="page-sub">
            {selectedDayName}
            {section ? ` — Section ${section}` : ""}
          </div>
        </div>
      </div>

      {/* WEEKLY TIMETABLE */}
      <div className="card timetable-card">
        <div className="timetable-header">
          <div>
            <div className="card-title">
              <CalendarDays size={18} style={{ verticalAlign: "-3px", marginRight: 7 }} />
              Weekly timetable
            </div>
          </div>

          <div className="week-controls">
            <button type="button" className="week-nav-btn" onClick={previousWeek} aria-label="Previous week">
              <ChevronLeft size={17} />
            </button>

            <button type="button" className="today-btn" onClick={goToToday}>
              Today
            </button>

            <button type="button" className="week-nav-btn" onClick={nextWeek} aria-label="Next week">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="timetable-week-label">{weekLabel}</div>

        {/* DAY SELECTOR */}
        <div className="day-selector">
          {weekDates.map((date, index) => {
            const active = isSameDate(date, selectedDate);
            const isToday = isSameDate(date, today);
            const dayName = DAYS[date.getDay()];
            const classCount = section ? timetable[section]?.[dayName]?.length || 0 : 0;

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={`day-btn ${active ? "active" : ""}`}
                onClick={() => handleDaySelect(date)}
              >
                <span className="day-btn-name">{SHORT_DAYS[index]}</span>
                <span className="day-btn-date">{date.getDate()}</span>

                {classCount > 0 && <span className="day-class-count">{classCount}</span>}
                {isToday && <span className="day-today-dot" />}
              </button>
            );
          })}
        </div>

        {/* SELECTED DAY */}
        <div className="selected-day-heading">
          <div>
            <strong>{selectedDayName}</strong>
            <span>
              {" "}·{" "}
              {selectedDate.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {selectedClasses.length > 0 && (
            <span className="class-count-label">
              {selectedClasses.length} {selectedClasses.length === 1 ? "class" : "classes"}
            </span>
          )}
        </div>

        {/* TIMETABLE */}
        {selectedClasses.length > 0 ? (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Subject</th>
                  <th>Room</th>
                </tr>
              </thead>

              <tbody>
                {selectedClasses.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <span className="method-pill">
                        <Clock size={13} />
                        {c.time}
                      </span>
                    </td>
                    <td><strong>{c.subject}</strong></td>
                    <td>{c.room || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-classes">
            <CalendarDays size={22} />
            <div>
              <strong>No classes scheduled</strong>
              <p>
                {section
                  ? `You have no classes on ${selectedDayName}.`
                  : "No section found for this roll number."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* STATS + CHECK-IN */}
      <div className="grid g3">
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* ATTENDANCE (real %: attended / classes held) */}
          <AttendanceStat refreshKey={attendanceHistory.length} />

          {/* STREAK */}
          <div className="card">
            <div className="stat-label">Streak</div>
            <div className="stat-value">{attendanceStreak} days</div>
            <div className="stat-delta" style={{ color: "var(--ink-soft)" }}>
              Current attendance streak
            </div>
          </div>

          {/* THIS WEEK */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="card-title">This week</div>
            <div className="card-sub">Class-wise check-ins</div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Time</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                        Loading attendance...
                      </td>
                    </tr>
                  ) : attendanceHistory.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "var(--ink-soft)" }}>
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    attendanceHistory.slice(0, 4).map((h) => (
                      <tr key={h.id}>
                        <td>{h.subject}</td>
                        <td>
                          {new Date(h.checked_in_at).toLocaleTimeString("en-IN", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                        <td><MethodPill method={h.method} /></td>
                        <td><StatusBadge status={h.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CHECK-IN CARD */}
        <div className="card checkin-method-card">
          <div className="card-title">Attendance Check-in</div>
          <div className="card-sub">Choose a verification method.</div>

          {/* Methods still loading */}
          {methods === null && (
            <div style={{ marginTop: 16, fontSize: 13, color: "var(--ink-soft)" }}>
              Loading check-in methods...
            </div>
          )}

          {/* Everything turned off by admin */}
          {methods && !methods.gps && !methods.qr && (
            <div className="kz-notice">
              Check-in is currently turned off by the admin.
            </div>
          )}

          {/* METHOD BUTTONS (only enabled ones) */}
          {methods && (methods.gps || methods.qr) && (
            <div className="checkin-methods">
              {methods.gps && (
                <button
                  type="button"
                  className={`checkin-method-btn ${checkInMethod === "gps" ? "selected" : ""}`}
                  onClick={handleGeoFenceCheckIn}
                  disabled={checkInLoading || qrScanning}
                  aria-label="Geo-fence check-in"
                  title="Geo-fence check-in"
                >
                  <div className="checkin-method-icon gps-icon">
                    <Navigation size={25} />
                  </div>
                </button>
              )}

              {methods.qr && (
                <button
                  type="button"
                  className={`checkin-method-btn ${checkInMethod === "qr" ? "selected" : ""}`}
                  onClick={handleQrCheckIn}
                  disabled={checkInLoading}
                  aria-label="Scan QR"
                  title="Scan QR"
                >
                  <div className="checkin-method-icon qr-icon">
                    <QrCode size={25} />
                  </div>
                </button>
              )}
            </div>
          )}

          {/* QR SCANNER */}
          {qrScanning && (
            <div style={{ marginTop: "20px" }}>
              <div className="kz-qr-title">Scan the classroom QR code</div>

              <div id="qr-reader" className="kz-qr-reader" />

              <button type="button" className="kz-cancel-btn" onClick={stopQrScanner}>
                Cancel Scanner
              </button>
            </div>
          )}

          {/* LOADING */}
          {checkInLoading && <div className="checkin-success">Processing attendance...</div>}

          {/* SUCCESS */}
          {checkInMessage && !checkInLoading && (
            <div className="checkin-success">{checkInMessage}</div>
          )}

                   {/* ERROR */}
          {checkInError && !checkInLoading && (
            <div className="kz-error">{checkInError}</div>
          )}

          {/* TEACHERS */}
          {sectionTeachers.length > 0 && (
            <div className="teacher-list">
              <div className="teacher-list-title">Your teachers</div>

              {sectionTeachers.map(([subject, teacher]) => (
                <div className="teacher-row" key={subject}>
                  <span className="teacher-subject">{subject}</span>
                  <span className="teacher-name">{teacher}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}