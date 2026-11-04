import React from "react";
import { CheckCircle2, Clock, XCircle, MapPin, QrCode, ScanFace } from "lucide-react";

export function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();

  if (s === "in" || s === "present") {
    return <span className="badge b-green"><CheckCircle2 size={12} />Present</span>;
  }
  if (s === "late") {
    return <span className="badge b-amber"><Clock size={12} />Late</span>;
  }
  return <span className="badge b-coral"><XCircle size={12} />Absent</span>;
}

export function MethodPill({ method }) {
  const m = String(method || "").toLowerCase();
  const label = m === "gps" ? "GPS" : m === "qr" ? "QR" : m === "face" ? "Face" : method;

  const icon =
    m === "gps" ? <MapPin size={13} /> :
    m === "qr" ? <QrCode size={13} /> :
    m === "face" ? <ScanFace size={13} /> : null;

  return <span className="method-pill">{icon}{label}</span>;
}