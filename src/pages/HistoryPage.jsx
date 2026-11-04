import React, { useEffect, useState } from "react";
import { StatusBadge, MethodPill } from "../components/Bits.jsx";

export default function HistoryPage() {
  const [filter, setFilter] = useState("All");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // FETCH REAL ATTENDANCE HISTORY
  // =========================================

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("You are not logged in.");
          setRows([]);
          return;
        }

        const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

        const response = await fetch(
          `${API_BASE}/api/attendance/history`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load attendance history."
          );
        }

        setRows(data.history || []);
      } catch (err) {
        console.error(
          "Attendance history error:",
          err
        );

        setError(
          err.message ||
            "Unable to load attendance history."
        );

        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // =========================================
  // FILTER REAL DATA
  // =========================================

  const filteredRows =
    filter === "All"
      ? rows
      : rows.filter(
          (row) =>
            String(row.status).toLowerCase() ===
            filter.toLowerCase()
        );

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "Asia/Kolkata",
    });
  };

  // =========================================
  // FORMAT TIME
  // =========================================

  const formatTime = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <>
      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <div className="page-head">
        <div>
          <div className="page-title disp">
            Attendance History
          </div>

          <div className="page-sub">
            Every check-in, filterable by status
          </div>
        </div>
      </div>

      {/* =========================================
          FILTERS
      ========================================== */}

      <div className="filter-bar">
  {["All", "Present", "Absent"].map((f) => (
    <div
      key={f}
      className="select"
      style={f === filter ? { borderColor: "var(--blue)", color: "var(--blue)" } : {}}
      onClick={() => setFilter(f)}
    >
      {f}
    </div>
  ))}
</div>

      {/* =========================================
          ATTENDANCE TABLE
      ========================================== */}

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Method</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {/* LOADING */}

              {loading && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "var(--ink-soft)",
                    }}
                  >
                    Loading attendance history...
                  </td>
                </tr>
              )}

              {/* ERROR */}

              {!loading && error && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "var(--coral)",
                    }}
                  >
                    {error}
                  </td>
                </tr>
              )}

              {/* NO DATA */}

              {!loading &&
                !error &&
                filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                        color: "var(--ink-soft)",
                      }}
                    >
                      No attendance records found.
                    </td>
                  </tr>
                )}

              {/* REAL DATA */}

              {!loading &&
                !error &&
                filteredRows.map((h) => (
                  <tr key={h.id}>

                    <td>
                      {formatDate(
                        h.checked_in_at
                      )}
                    </td>

                    <td>
                      <strong>
                        {h.subject || "—"}
                      </strong>
                    </td>

                    <td>
                      <MethodPill
                        method={
                          h.method
                            ? h.method.toUpperCase()
                            : "—"
                        }
                      />
                    </td>

                    <td
                      style={{
                        color:
                          "var(--ink-soft)",
                      }}
                    >
                      {formatTime(
                        h.checked_in_at
                      )}
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          h.status
                            ? h.status
                                .charAt(0)
                                .toUpperCase() +
                              h.status.slice(1)
                            : "—"
                        }
                      />
                    </td>

                  </tr>
                ))}

            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}