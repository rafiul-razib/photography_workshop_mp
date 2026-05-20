"use client";

import { useEffect, useState, useRef, forwardRef } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import domtoimage from "dom-to-image-more";
import { CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";

/* ─────────────────────────────────────────
   PALETTE  (shared across the suite)
───────────────────────────────────────── */
const C = {
  navy: "#0B1628",
  navy2: "#0E1D35",
  navy3: "#071020",
  orange: "#F07A10",
  orangeD: "#C8600A",
  white: "#FFFFFF",
  gray: "#7A8A9A",
  film: "#060E1A",
};

/* ─────────────────────────────────────────
   FILM STRIP — single vertical strip
───────────────────────────────────────── */
function FilmStrip({ height, side }) {
  const W = 26,
    HOLE_H = 10,
    HOLE_W = 14,
    GAP = 8;
  const count = Math.floor((height - 60) / (HOLE_H + GAP));
  const hx = (W - HOLE_W) / 2;
  const edgeX = side === "left" ? W - 1 : 0;
  return (
    <svg
      width={W}
      height={height}
      viewBox={`0 0 ${W} ${height}`}
      style={{
        position: "absolute",
        top: 0,
        [side]: 0,
        zIndex: 3,
        display: "block",
      }}
    >
      <rect x="0" y="0" width={W} height={height} fill={C.film} />
      <rect
        x="5"
        y="0"
        width={W - 10}
        height={height}
        fill="rgba(14,26,48,0.55)"
      />
      {Array.from({ length: count }).map((_, i) => (
        <rect
          key={i}
          x={hx}
          y={30 + i * (HOLE_H + GAP)}
          width={HOLE_W}
          height={HOLE_H}
          rx="2"
          fill="rgba(28,48,78,0.55)"
          stroke="rgba(50,80,120,0.4)"
          strokeWidth="0.5"
        />
      ))}
      <line
        x1={edgeX}
        y1="0"
        x2={edgeX}
        y2={height}
        stroke="rgba(240,122,16,0.18)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   APERTURE SVG
───────────────────────────────────────── */
function ApertureSVG({ size = 40 }) {
  const blades = [];
  const CX = size / 2,
    CY = size / 2,
    RI = size * 0.14,
    RO = size * 0.43;
  for (let i = 0; i < 6; i++) {
    const a1 = (i * 60 - 90) * (Math.PI / 180);
    const a2 = (i * 60 - 90 + 52) * (Math.PI / 180);
    const p = (a, r) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    const [x1, y1] = p(a1, RI),
      [x2, y2] = p(a1, RO);
    const [x3, y3] = p(a2, RO),
      [x4, y4] = p(a2, RI);
    blades.push(
      <path
        key={i}
        opacity={0.88 - i * 0.03}
        fill={C.orange}
        d={`M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${RO},${RO} 0 0,1 ${x3.toFixed(1)},${y3.toFixed(1)} L${x4.toFixed(1)},${y4.toFixed(1)} A${RI},${RI} 0 0,0 ${x1.toFixed(1)},${y1.toFixed(1)} Z`}
      />,
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={CX}
        cy={CY}
        r={size / 2 - 0.5}
        fill={C.navy3}
        stroke={C.orange}
        strokeWidth="0.6"
        opacity="0.5"
      />
      {blades}
      <circle cx={CX} cy={CY} r={size * 0.17} fill={C.navy3} />
      <circle cx={CX} cy={CY} r={size * 0.09} fill={C.orange} opacity="0.3" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   CORNER BRACKETS
───────────────────────────────────────── */
function Brackets({ spread = 12, size = 18, t = 2.5, color = C.orange }) {
  const s = `${size}px`,
    b = `${t}px solid ${color}`,
    neg = `-${spread}px`;
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: neg,
          left: neg,
          width: s,
          height: s,
          borderTop: b,
          borderLeft: b,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: neg,
          right: neg,
          width: s,
          height: s,
          borderTop: b,
          borderRight: b,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: neg,
          left: neg,
          width: s,
          height: s,
          borderBottom: b,
          borderLeft: b,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: neg,
          right: neg,
          width: s,
          height: s,
          borderBottom: b,
          borderRight: b,
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────
   PDF-SAFE ICON SVGS
───────────────────────────────────────── */
const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill={C.orange}>
    <rect x="1" y="3" width="12" height="8" rx="1.5" />
    <path d="M1 4l6 4 6-4" stroke={C.navy3} strokeWidth="1.2" fill="none" />
  </svg>
);
const IconPhone = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill={C.orange}>
    <path d="M3 1.5h3.2l1.3 3-2 1.3a8 8 0 003.7 3.7l1.3-2 3 1.3V12A1.5 1.5 0 0113 13.5 12.5 12.5 0 011.5 3 1.5 1.5 0 013 1.5z" />
  </svg>
);
const IconCamera = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill={C.orange}>
    <rect x="1" y="4" width="12" height="8" rx="1.5" />
    <circle cx="7" cy="8" r="2.5" fill={C.navy3} />
    <circle cx="7" cy="8" r="1.4" fill={C.orange} opacity="0.5" />
    <path d="M4.5 4L5.5 2h3L9.5 4" fill={C.orange} />
  </svg>
);
const IconID = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill={C.orange}>
    <rect x="1" y="3" width="12" height="8" rx="1.5" />
    <circle cx="4.5" cy="7" r="1.8" fill={C.navy3} />
    <circle cx="4.5" cy="7" r="1" fill={C.orange} opacity="0.5" />
    <rect x="7.5" y="5.5" width="4.5" height="1" rx="0.5" fill={C.navy3} />
    <rect x="7.5" y="7.5" width="3.5" height="1" rx="0.5" fill={C.navy3} />
  </svg>
);

/* ─────────────────────────────────────────
   INFO ROW  (inside card)
───────────────────────────────────────── */
function InfoRow({ Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 0",
        borderBottom: "1px solid rgba(240,122,16,0.1)",
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          border: `1px solid ${C.orange}`,
          borderRadius: 4,
          background: "rgba(240,122,16,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C.gray,
            marginBottom: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: "rgba(240,235,220,0.92)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ID CARD  — 4 × 6 in (PDF target)
   Different from the profile IDCard:
   • DUAL film strips (left + right)
   • Centred photo layout
   • Gradient header bar with apertures
   • Diagonal VERIFIED stamp watermark
───────────────────────────────────────── */
const IDCard = forwardRef(function IDCard({ user }, ref) {
  const W = 384,
    H = 576,
    FILM = 26;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: W,
        height: H,
        flexShrink: 0,
        backgroundColor: C.navy,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "'Outfit','DM Sans',sans-serif",
      }}
    >
      {/* BOKEH */}
      {[
        { t: -40, l: 20, s: 160, c: "rgba(240,100,0,0.45)" },
        { t: 60, r: 0, s: 180, c: "rgba(20,70,180,0.45)" },
        { t: 260, r: 20, s: 120, c: "rgba(30,90,200,0.28)" },
        { b: 80, l: 40, s: 110, c: "rgba(200,90,10,0.2)" },
      ].map(({ t, b, l, r, s, c }, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...(t !== undefined && { top: t }),
            ...(b !== undefined && { bottom: b }),
            ...(l !== undefined && { left: l }),
            ...(r !== undefined && { right: r }),
            width: s,
            height: s,
            borderRadius: "50%",
            background: `radial-gradient(circle,${c} 0%,transparent 70%)`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* DUAL FILM STRIPS */}
      <FilmStrip height={H} side="left" />
      <FilmStrip height={H} side="right" />

      {/* HEADER BAR */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: FILM,
          right: FILM,
          height: 48,
          background: `linear-gradient(135deg,${C.orangeD} 0%,${C.orange} 55%,#FFB020 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px",
          zIndex: 2,
        }}
      >
        <ApertureSVG size={28} />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.24em",
              color: C.navy3,
            }}
          >
            FOCUSCRAFT
          </div>
          <div
            style={{
              fontSize: 6,
              letterSpacing: "0.18em",
              color: "rgba(7,16,32,0.7)",
            }}
          >
            WORKSHOP PASS
          </div>
        </div>
        <ApertureSVG size={28} />
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          position: "absolute",
          left: FILM,
          right: FILM,
          top: 48,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "14px 16px 12px",
          boxSizing: "border-box",
          zIndex: 2,
        }}
      >
        {/* Photo centred with double ring + brackets */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <Brackets spread={10} size={15} t={2} color={C.orange} />
          <div
            style={{
              width: 232,
              height: 232,
              borderRadius: "50%",
              border: `4px solid ${C.orange}`,
              padding: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: `1.5px solid rgba(240,122,16,0.35)`,
                overflow: "hidden",
                background: C.navy2,
              }}
            >
              {user.photo ? (
                <img
                  src={user.photo + "?nocache=" + Date.now()}
                  alt={user.fullName}
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.target.src = "/fallback.jpg";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 32,
                    fontWeight: 800,
                    color: C.orange,
                  }}
                >
                  {user.fullName?.charAt(0) || "?"}
                </div>
              )}
            </div>
          </div>
          {/* verified tick */}
          <div
            style={{
              position: "absolute",
              bottom: 4,
              right: 4,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#16A34A",
              border: `2px solid ${C.navy}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={13} color="#fff" />
          </div>
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 17,
            fontWeight: 900,
            color: C.white,
            marginBottom: 3,
            textAlign: "center",
            lineHeight: 1.1,
            maxWidth: W - FILM * 2 - 32,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
          }}
        >
          {user.fullName}
        </div>

        {/* Interest badge */}
        {user.interest && (
          <div
            style={{
              fontSize: 7,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.orange,
              border: `1px solid ${C.orange}`,
              borderRadius: 2,
              padding: "2px 8px",
              marginBottom: 10,
              background: "rgba(240,122,16,0.08)",
            }}
          >
            {user.interest}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: `linear-gradient(to right,transparent,${C.orange},transparent)`,
            opacity: 0.35,
            marginBottom: 8,
          }}
        />

        {/* Info rows */}
        <div style={{ width: "100%", marginBottom: 8 }}>
          <InfoRow Icon={IconMail} label="Email" value={user.email} />
          <InfoRow Icon={IconPhone} label="Mobile" value={user.phone} />
          <InfoRow Icon={IconCamera} label="Interest" value={user.interest} />
          <InfoRow
            Icon={IconID}
            label="Participant ID"
            value={user.participantId || user.userId}
          />
        </div>

        {/* Payment strip */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 9px",
            border: `1px solid rgba(240,122,16,0.2)`,
            borderRadius: 2,
            background: "rgba(14,29,53,0.7)",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 8,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: user.paymentStatus ? "#4ADE80" : "#F87171",
            }}
          >
            {user.paymentStatus ? "✓ Paid" : "✗ Pending"}
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 15,
              fontWeight: 900,
              color: C.orange,
            }}
          >
            BDT {user.totalAmount}
          </span>
        </div>
      </div>

      {/* DIAGONAL "VERIFIED" WATERMARK */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: FILM,
          right: FILM,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 5,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            transform: "rotate(-28deg)",
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: "0.3em",
            color: "rgba(74,222,128,0.4)",
            border: "2.5px solid rgba(74,222,128,0.4)",
            padding: "4px 12px",
            borderRadius: 4,
            whiteSpace: "nowrap",
            userSelect: "none",
            fontFamily: "'DM Sans',sans-serif",
            textTransform: "uppercase",
          }}
        >
          VERIFIED
        </div>
      </div>

      {/* BOTTOM GRADIENT BAR */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: FILM,
          right: FILM,
          height: 4,
          background: `linear-gradient(to right,${C.orangeD},${C.orange},#FFB020,${C.orange},${C.orangeD})`,
          zIndex: 4,
        }}
      />

      {/* CORNER TRIANGLE */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: FILM,
          width: 48,
          height: 32,
          background: `linear-gradient(135deg,${C.orange} 0%,${C.orangeD} 100%)`,
          clipPath: "polygon(100% 0,100% 100%,0 100%)",
          zIndex: 4,
        }}
      />
    </div>
  );
});

/* ─────────────────────────────────────────
   PAGE WRAPPER
───────────────────────────────────────── */
export default function ProfileCardPage() {
  const [user, setUser] = useState(null);
  const pdfRef = useRef(null);
  const { tran_id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/verifyUser/${tran_id}`,
        );
        setUser(res.data);
      } catch (err) {
        console.error("Error:", err);
      }
    };
    if (tran_id) fetchData();
  }, [tran_id]);

  const handleDownloadPDF = async () => {
    const el = pdfRef.current;
    if (!el || !user) return;
    try {
      const dataUrl = await domtoimage.toPng(el, {
        quality: 1,
        bgcolor: C.navy,
        width: 384,
        height: 576,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, 6],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 4, 6);
      pdf.save(`${user.fullName}-workshop-pass.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
    }
  };

  /* Loading */
  if (!user)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.navy3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <div style={{ position: "relative", width: 52, height: 52 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.5px solid ${C.orange}`,
              borderTopColor: "transparent",
              animation: "spin 2s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: `1px solid rgba(240,122,16,0.4)`,
              borderTopColor: "transparent",
              animation: "spin 1.3s linear infinite reverse",
            }}
          />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
        <span
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: C.gray,
          }}
        >
          Verifying Identity…
        </span>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.navy3,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        gap: "1.5rem",
        fontFamily: "'DM Sans',sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Page bokeh */}
      <div
        style={{
          position: "fixed",
          top: -60,
          left: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(240,100,0,0.22) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: -60,
          right: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(20,70,180,0.28) 0%,transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
        {user.paymentStatus ? (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "1px solid rgba(74,222,128,0.35)",
              borderRadius: 2,
              padding: "0.4rem 1.1rem",
              marginBottom: "0.6rem",
              background: "rgba(74,222,128,0.05)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#4ADE80",
                boxShadow: "0 0 6px #4ADE80",
                animation: "pulse 1.5s ease-in-out infinite",
                display: "inline-block",
              }}
            />
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.15}}`}</style>
            <CheckCircle2 size={12} color="#4ADE80" />
            <span
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#4ADE80",
                fontWeight: 500,
              }}
            >
              Identification Confirmed
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              border: "1px solid rgba(248,113,113,0.35)",
              borderRadius: 2,
              padding: "0.4rem 1.1rem",
              marginBottom: "0.6rem",
              background: "rgba(248,113,113,0.05)",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#F87171",
                fontWeight: 500,
              }}
            >
              Payment Pending
            </span>
          </div>
        )}
        <p
          style={{
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.gray,
            margin: 0,
          }}
        >
          Photography &amp; Cinematography Workshop · 2026
        </p>
      </div>

      {user.paymentStatus ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            filter: "drop-shadow(0 16px 48px rgba(240,122,16,0.22))",
          }}
        >
          <IDCard ref={pdfRef} user={user} />
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 420,
            textAlign: "center",
            padding: "1.75rem 2rem",
            background: C.navy,
            border: "1px solid rgba(240,122,16,0.25)",
            borderRadius: 2,
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "1.2rem",
              fontWeight: 900,
              color: C.white,
              marginBottom: "0.6rem",
            }}
          >
            ID Card Not Available
          </p>
          <p
            style={{
              fontSize: "0.82rem",
              lineHeight: 1.55,
              color: C.gray,
              margin: 0,
            }}
          >
            This participant&apos;s payment has not been verified yet. The ID
            card will appear here after payment confirmation.
          </p>
        </div>
      )}

      {/* Download button */}
      {/* <button
        onClick={handleDownloadPDF}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.7rem 1.75rem",
          background: C.orange,
          border: "none",
          borderRadius: 2,
          fontFamily: "'DM Sans',sans-serif",
          fontSize: "0.68rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.navy3,
          fontWeight: 600,
          cursor: "pointer",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <FileDown size={14} /> Download Pass
      </button> */}

      {/* <p
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: "0.58rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(122,138,154,0.5)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Present this pass at the venue entrance
      </p> */}
    </div>
  );
}
