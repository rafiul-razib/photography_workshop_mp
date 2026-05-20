"use client";

import { useEffect, useState, useRef, forwardRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas-pro";
import QRCode from "qrcode";
import { FileDown, Printer } from "lucide-react";
import { useParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const printStyles = `
  @media print {
    @page {
      size: 4in 6in;
      margin: 0;
    }

    html,
    body {
      width: 4in;
      height: 6in;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      overflow: hidden !important;
    }

    body * {
      visibility: hidden !important;
    }

    .pass-print-page,
    .pass-print-page * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .pass-actions {
      display: none !important;
    }

    .pass-print-area,
    .pass-print-area * {
      visibility: visible !important;
    }

    .pass-print-page {
      min-height: 0 !important;
      width: 4in !important;
      height: 6in !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
      background: #fff !important;
    }

    .pass-print-area {
      position: fixed !important;
      inset: 0 !important;
      width: 4in !important;
      height: 6in !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }

    .id-card-print {
      width: 4in !important;
      height: 6in !important;
      margin: 0 !important;
      transform: none !important;
      box-shadow: none !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  }
`;

/* ─────────────────────────────────────────
   COLOUR PALETTE
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
   SVG ICONS  (path-based, PDF-safe)
───────────────────────────────────────── */
const IconPerson = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill={C.orange}>
    <circle cx="8" cy="5" r="3.2" />
    <path
      d="M1.5 15c0-3.5 2.9-5.8 6.5-5.8s6.5 2.3 6.5 5.8"
      strokeWidth="0"
      fillRule="evenodd"
    />
  </svg>
);
const IconBriefcase = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill={C.orange}>
    <rect x="1" y="6" width="14" height="9" rx="1.5" />
    <path
      d="M5 6V4.5A1.5 1.5 0 016.5 3h3A1.5 1.5 0 0111 4.5V6"
      fill="none"
      stroke={C.orange}
      strokeWidth="1.4"
    />
    <rect x="6.5" y="10" width="3" height="1.5" rx="0.5" fill={C.navy} />
  </svg>
);
const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill={C.orange}>
    <path d="M3 1.5h3.2l1.3 3-2 1.3a8 8 0 003.7 3.7l1.3-2 3 1.3V13A1.5 1.5 0 0113 14.5 12.5 12.5 0 011.5 3 1.5 1.5 0 013 1.5z" />
  </svg>
);
const IconID = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill={C.orange}>
    <rect x="1" y="3.5" width="14" height="9" rx="1.5" />
    <circle cx="5" cy="8" r="2" fill={C.navy} />
    <circle cx="5" cy="8" r="1.2" fill={C.orange} />
    <rect x="8.5" y="6.5" width="5" height="1.2" rx="0.6" fill={C.navy} />
    <rect x="8.5" y="9" width="4" height="1.2" rx="0.6" fill={C.navy} />
  </svg>
);

/* ─────────────────────────────────────────
   APERTURE SVG
───────────────────────────────────────── */
function ApertureSVG() {
  const blades = [];
  const NUM = 6,
    CX = 22,
    CY = 22,
    R_IN = 6,
    R_OUT = 18;
  for (let i = 0; i < NUM; i++) {
    const a1 = ((i * 360) / NUM - 90) * (Math.PI / 180);
    const a2 = ((i * 360) / NUM - 90 + 52) * (Math.PI / 180);
    const p = (a, r) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    const [x1, y1] = p(a1, R_IN),
      [x2, y2] = p(a1, R_OUT);
    const [x3, y3] = p(a2, R_OUT),
      [x4, y4] = p(a2, R_IN);
    const d = `M${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} A${R_OUT},${R_OUT} 0 0,1 ${x3.toFixed(2)},${y3.toFixed(2)} L${x4.toFixed(2)},${y4.toFixed(2)} A${R_IN},${R_IN} 0 0,0 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
    blades.push(
      <path key={i} d={d} fill={C.orange} opacity={0.88 - i * 0.03} />,
    );
  }
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle
        cx="22"
        cy="22"
        r="21"
        fill={C.navy3}
        stroke={C.orange}
        strokeWidth="0.6"
        opacity="0.5"
      />
      {blades}
      <circle cx="22" cy="22" r="7" fill={C.navy3} />
      <circle cx="22" cy="22" r="4" fill={C.orange} opacity="0.25" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   LENS RINGS (top-right)
───────────────────────────────────────── */
function LensRings() {
  const rings = [
    { r: 34, c: "rgba(20,60,120,0.9)", s: "rgba(40,100,200,0.5)", sw: 1 },
    { r: 28, c: "rgba(16,48,100,0.95)", s: "rgba(30,80,180,0.4)", sw: 1 },
    { r: 21, c: "rgba(12,36,80,1)", s: "rgba(20,60,140,0.45)", sw: 1 },
    { r: 14, c: "rgba(8,24,56,1)", s: "rgba(14,44,100,0.5)", sw: 1 },
    { r: 7, c: "rgba(4,12,28,1)", s: "rgba(10,34,80,0.6)", sw: 1 },
    { r: 3, c: "rgba(2,6,14,1)", s: "none", sw: 0 },
  ];
  return (
    <svg width="70" height="70" viewBox="0 0 70 70" style={{ flexShrink: 0 }}>
      {rings.map(({ r, c, s, sw }, i) => (
        <circle
          key={i}
          cx="35"
          cy="35"
          r={r}
          fill={c}
          stroke={s}
          strokeWidth={sw}
        />
      ))}
      {/* specular highlight */}
      <ellipse
        cx="27"
        cy="23"
        rx="6"
        ry="4"
        fill="rgba(80,130,220,0.15)"
        transform="rotate(-30 27 23)"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   CAMERAMAN SILHOUETTE
───────────────────────────────────────── */
function CameramanSVG() {
  const fill = "rgba(20,55,120,0.55)";
  return (
    <svg width="90" height="130" viewBox="0 0 90 130" fill={fill}>
      {/* head */}
      <ellipse cx="33" cy="13" rx="9" ry="10" />
      {/* body */}
      <path d="M19 23 Q13 28 16 46 L50 46 Q53 28 47 23 Z" />
      {/* left arm */}
      <path d="M19 28 Q8 34 10 46 Q15 48 18 44 Q16 36 23 32 Z" />
      {/* right arm (reaching up to camera) */}
      <path d="M47 25 L52 20 L54 22 L50 30 Z" />
      {/* legs */}
      <rect x="20" y="46" width="12" height="24" rx="3" />
      <rect x="34" y="46" width="12" height="24" rx="3" />
      {/* feet */}
      <rect x="17" y="68" width="17" height="5" rx="2" />
      <rect x="33" y="68" width="17" height="5" rx="2" />
      {/* shoulder camera body */}
      <rect x="49" y="18" width="28" height="15" rx="2.5" />
      {/* camera top */}
      <rect x="55" y="13" width="12" height="5" rx="1.5" />
      {/* lens barrel */}
      <circle cx="52" cy="25" r="5" fill="rgba(12,35,80,0.7)" />
      <circle cx="52" cy="25" r="3" fill="rgba(8,24,60,0.8)" />
      {/* lens front */}
      <rect x="76" y="21" width="10" height="11" rx="1.5" />
      {/* eyepiece */}
      <rect
        x="49"
        y="18"
        width="4"
        height="4"
        rx="1"
        fill="rgba(8,24,60,0.9)"
      />
      {/* tripod */}
      <line x1="63" y1="33" x2="44" y2="96" stroke={fill} strokeWidth="3.5" />
      <line x1="63" y1="33" x2="63" y2="96" stroke={fill} strokeWidth="3.5" />
      <line x1="63" y1="33" x2="82" y2="96" stroke={fill} strokeWidth="3.5" />
      {/* tripod spread bar */}
      <line
        x1="44"
        y1="80"
        x2="82"
        y2="80"
        stroke={fill}
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* feet */}
      <line x1="44" y1="96" x2="40" y2="102" stroke={fill} strokeWidth="2.5" />
      <line x1="63" y1="96" x2="63" y2="102" stroke={fill} strokeWidth="2.5" />
      <line x1="82" y1="96" x2="86" y2="102" stroke={fill} strokeWidth="2.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   FILM STRIP (left edge)
───────────────────────────────────────── */
function FilmStrip({ height }) {
  const STRIP_W = 28;
  const HOLE_H = 10;
  const HOLE_W = 15;
  const HOLE_R = 2;
  const GAP = 8;
  const HOLES = Math.floor((height - 60) / (HOLE_H + GAP));
  return (
    <svg
      width={STRIP_W}
      height={height}
      viewBox={`0 0 ${STRIP_W} ${height}`}
      style={{ position: "absolute", left: 0, top: 0, zIndex: 3 }}
    >
      {/* strip background */}
      <rect x="0" y="0" width={STRIP_W} height={height} fill={C.film} />
      {/* inner track line */}
      <rect
        x="6"
        y="0"
        width={STRIP_W - 12}
        height={height}
        fill="rgba(15,28,50,0.6)"
      />
      {/* perforations */}
      {Array.from({ length: HOLES }).map((_, i) => {
        const y = 30 + i * (HOLE_H + GAP);
        return (
          <rect
            key={i}
            x={(STRIP_W - HOLE_W) / 2}
            y={y}
            width={HOLE_W}
            height={HOLE_H}
            rx={HOLE_R}
            fill="rgba(30,50,80,0.5)"
            stroke="rgba(50,80,120,0.4)"
            strokeWidth="0.5"
          />
        );
      })}
      {/* right edge highlight line */}
      <line
        x1={STRIP_W - 1}
        y1="0"
        x2={STRIP_W - 1}
        y2={height}
        stroke="rgba(240,122,16,0.2)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────
   CORNER BRACKETS helper
───────────────────────────────────────── */
function Brackets({
  size = 18,
  thickness = 2.5,
  color = C.orange,
  gap = 0,
  style = {},
}) {
  const s = `${size}px`;
  const b = `${thickness}px solid ${color}`;
  const pos = -gap - size / 2 + "px"; // offset outward by gap
  const corners = [
    { top: pos, left: pos, borderTop: b, borderLeft: b },
    { top: pos, right: pos, borderTop: b, borderRight: b },
    { bottom: pos, left: pos, borderBottom: b, borderLeft: b },
    { bottom: pos, right: pos, borderBottom: b, borderRight: b },
  ];
  return (
    <>
      {corners.map((s2, i) => (
        <div
          key={i}
          style={{ position: "absolute", width: s, height: s, ...s2 }}
        />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────
   ID CARD COMPONENT
───────────────────────────────────────── */
const IDCard = forwardRef(function IDCard({ user, qrImage }, ref) {
  const CARD_W = 384; // 4 in @ 96 dpi
  const CARD_H = 576; // 6 in @ 96 dpi
  const FILM_W = 28;

  const infoRows = [
    { Icon: IconPerson, value: user.fullName },
    { Icon: IconBriefcase, value: user.interest },
    { Icon: IconPhone, value: user.phone },
    {
      Icon: IconID,
      value: user.participantId || user.userId || "—",
    },
  ];

  return (
    <div
      ref={ref}
      className="id-card-print"
      style={{
        position: "relative",
        width: CARD_W,
        height: CARD_H,
        backgroundColor: C.navy,
        borderRadius: 18,
        overflow: "hidden",
        fontFamily: "'Outfit', 'DM Sans', sans-serif",
        flexShrink: 0,
      }}
    >
      {/* ── BOKEH GLOWS ── */}
      {/* top-left orange glow */}
      <div
        style={{
          position: "absolute",
          top: -50,
          left: -30,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(240,100,0,0.55) 0%, rgba(200,80,0,0.2) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* top-right blue glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(20,70,180,0.5) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* mid-right blue bokeh */}
      <div
        style={{
          position: "absolute",
          top: 180,
          right: 10,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(30,90,200,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* mid-right smaller bokeh */}
      <div
        style={{
          position: "absolute",
          top: 280,
          right: 50,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(40,110,220,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* bottom-left orange bokeh */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 30,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,90,10,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── FILM STRIP ── */}
      <FilmStrip height={CARD_H} />

      {/* ── CONTENT AREA (right of film strip) ── */}
      <div
        style={{
          position: "absolute",
          left: FILM_W,
          top: 0,
          right: 0,
          height: CARD_H,
          display: "flex",
          flexDirection: "column",
          padding: "10px 14px 12px 14px",
          zIndex: 5,
          boxSizing: "border-box",
        }}
      >
        {/* LANYARD HOLE */}
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}
        >
          <div
            style={{
              width: 46,
              height: 22,
              borderRadius: 12,
              border: `2.5px solid rgba(80,110,150,0.7)`,
              background: "rgba(6,14,28,0.9)",
              boxShadow: "inset 0 0 6px rgba(0,0,0,0.8)",
            }}
          />
        </div>

        {/* ── LOGO ROW ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          {/* aperture in bracket frame */}
          <div
            style={{
              position: "relative",
              padding: 3,
              border: `1.5px solid rgba(240,122,16,0.5)`,
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            <ApertureSVG />
          </div>

          {/* brand text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "0.03em",
                lineHeight: 1,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: C.white }}>FOCUS</span>
              <span style={{ color: C.orange }}>CRAFT</span>
            </div>
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: "0.2em",
                color: C.gray,
                marginTop: 2,
                whiteSpace: "nowrap",
              }}
            >
              — VISUAL STORYTELLERS —
            </div>
          </div>

          {/* camera lens rings */}
          <LensRings />
        </div>

        {/* ── WORKSHOP TITLE ── */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <p
            style={{
              margin: 0,
              fontSize: 8.5,
              letterSpacing: "0.2em",
              color: "rgba(200,220,240,0.85)",
              fontWeight: 400,
              marginBottom: 4,
            }}
          >
            PHOTOGRAPHY &amp; CINEMATOGRAPHY
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                flex: 1,
                height: 1.5,
                background: `linear-gradient(to right, transparent, ${C.orange})`,
              }}
            />
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "0.16em",
                color: C.orange,
                textShadow: `0 0 20px rgba(240,122,16,0.5)`,
              }}
            >
              WORKSHOP
            </span>
            <div
              style={{
                flex: 1,
                height: 1.5,
                background: `linear-gradient(to left, transparent, ${C.orange})`,
              }}
            />
          </div>
        </div>

        {/* ── PHOTO + CAMERAMAN ── */}
        <div
          style={{
            position: "relative",
            marginTop: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 14,
            height: 140,
          }}
        >
          {/* cameraman silhouette — right side */}
          <div
            style={{ position: "absolute", right: -6, bottom: -8, zIndex: 1 }}
          >
            <CameramanSVG />
          </div>

          {/* circular photo with double-ring + viewfinder brackets */}
          <div style={{ position: "relative", zIndex: 2 }}>
            {/* viewfinder corner brackets — spread around the circle */}
            <Brackets size={20} thickness={2.5} color={C.orange} gap={10} />

            {/* outer orange ring */}
            <div
              style={{
                width: 128,
                height: 128,
                borderRadius: "50%",
                border: `5px solid ${C.orange}`,
                padding: 3,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* inner dark ring */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: `2px solid rgba(240,122,16,0.35)`,
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
                      fontSize: 36,
                      fontWeight: 800,
                      color: C.orange,
                    }}
                  >
                    {user.fullName?.charAt(0) || "?"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── INFO ROWS + QR ── */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flex: 1,
            alignItems: "flex-start",
          }}
        >
          {/* LEFT: 4 info rows */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flex: 1,
              minWidth: 0,
            }}
          >
            {infoRows.map(({ Icon, value }, i) => (
              <div
                key={i}
                className="info-box"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                {/* icon box */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: `1.8px solid ${C.orange}`,
                    background: "rgba(240,122,16,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon />
                </div>
                {/* text + underline */}
                <div
                  style={{
                    flex: 1,
                    borderBottom: `1.2px solid rgba(255,255,255,0.12)`,
                    paddingBottom: 4,
                    minWidth: 0,
                  }}
                >
                  <span
                    className="info-value"
                    style={{
                      fontSize: 11,
                      color: "rgba(230,240,255,0.92)",
                      fontWeight: 500,
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {value || "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: QR code with corner brackets */}
          <div
            style={{
              flexShrink: 0,
              position: "relative",
              padding: 6,
              alignSelf: "center",
            }}
          >
            {/* brackets */}
            {[
              {
                top: 0,
                left: 0,
                borderTop: `2px solid ${C.orange}`,
                borderLeft: `2px solid ${C.orange}`,
              },
              {
                top: 0,
                right: 0,
                borderTop: `2px solid ${C.orange}`,
                borderRight: `2px solid ${C.orange}`,
              },
              {
                bottom: 0,
                left: 0,
                borderBottom: `2px solid ${C.orange}`,
                borderLeft: `2px solid ${C.orange}`,
              },
              {
                bottom: 0,
                right: 0,
                borderBottom: `2px solid ${C.orange}`,
                borderRight: `2px solid ${C.orange}`,
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{ position: "absolute", width: 11, height: 11, ...s }}
              />
            ))}
            {qrImage ? (
              <img
                src={qrImage}
                alt="QR"
                crossOrigin="anonymous"
                style={{
                  width: 78,
                  height: 78,
                  display: "block",
                  borderRadius: 2,
                }}
              />
            ) : (
              <div
                style={{
                  width: 78,
                  height: 78,
                  background: "rgba(30,50,80,0.6)",
                  borderRadius: 2,
                }}
              />
            )}
          </div>
        </div>

        {/* payment status strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            borderTop: `1px solid rgba(240,122,16,0.15)`,
            paddingTop: 6,
            position: "relative",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontSize: 8,
              letterSpacing: "0.14em",
              fontWeight: 700,
              textTransform: "uppercase",
              color: user.paymentStatus ? "#4ADE80" : "#F87171",
            }}
          >
            {user.paymentStatus ? "✓ Verified & Paid" : "✗ Payment Pending"}
          </span>
          <span
            style={{
              position: "relative",
              fontSize: 10,
              color: C.white,
              fontWeight: 700,
              letterSpacing: "0.04em",
              zIndex: 11,
            }}
          >
            BDT {user.totalAmount}
          </span>
        </div>
      </div>

      {/* ── ORANGE DIAGONAL CORNER (bottom-right) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 80,
          height: 52,
          background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeD} 100%)`,
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
          zIndex: 1,
        }}
      />

      {/* ── BLUE ACCENT (bottom-left) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: FILM_W,
          width: 60,
          height: 30,
          background:
            "linear-gradient(135deg, rgba(30,80,200,0.4) 0%, transparent 100%)",
          clipPath: "polygon(0 100%, 100% 100%, 0 0)",
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
  const [qrImage, setQrImage] = useState("");
  const cardRef = useRef(null);
  const { tran_id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/verifyUser/${tran_id}`);
        setUser(res.data);
        if (res.data?.paymentStatus) {
          const verifyId = res.data.participantId || res.data.userId || tran_id;
          const qr = await QRCode.toDataURL(
            `${window.location.origin}/verifyUser/${verifyId}`,
          );
          setQrImage(qr);
        } else {
          setQrImage("");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    };
    if (tran_id) fetchData();
  }, [tran_id]);

  const handleDownloadImage = async () => {
    const element = cardRef.current;
    if (!element || !user) return;

    try {
      await document.fonts?.ready;

      const canvas = await html2canvas(element, {
        backgroundColor: C.navy,
        width: 384,
        height: 576,
        scale: 1200 / 384,
        useCORS: true,
        allowTaint: false,
        logging: false,
        windowWidth: 384,
        windowHeight: 576,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDocument) => {
          const clonedCard = clonedDocument.querySelector(".id-card-print");

          if (clonedCard) {
            clonedCard.style.width = "384px";
            clonedCard.style.height = "576px";
            clonedCard.style.transform = "none";
            clonedCard.style.margin = "0";
          }
        },
      });

      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = 1200;
      finalCanvas.height = 1800;

      const context = finalCanvas.getContext("2d");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(canvas, 0, 0, 1200, 1800);

      const link = document.createElement("a");
      link.download = `${user.fullName || "workshop"}-workshop-pass.png`;
      link.href = finalCanvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Image download error:", err);
    }
  };

  const handlePrintPass = () => {
    const currentTitle = document.title;

    document.title = `${user.fullName || "workshop"}-workshop-pass`;
    window.print();
    document.title = currentTitle;
  };

  if (!user)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.navy3,
          fontFamily: "'DM Sans', sans-serif",
          color: "#5A6A7A",
          fontSize: "0.7rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        Developing your pass…
      </div>
    );

  const isPaid = Boolean(user.paymentStatus);

  return (
    <div
      className="pass-print-page"
      style={{
        minHeight: "100vh",
        background: C.navy3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        gap: "1.5rem",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {isPaid ? (
        <>
          <div
            className="pass-actions"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={handleDownloadImage}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.75rem",
                background: C.orange,
                border: "none",
                borderRadius: 2,
                fontFamily: "'DM Sans', sans-serif",
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
              <FileDown size={14} />
              Download Image
            </button>

            <button
              onClick={handlePrintPass}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.65rem 1.75rem",
                background: "transparent",
                border: `1px solid ${C.orange}`,
                borderRadius: 2,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.68rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: C.orange,
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Printer size={14} />
              Print Pass
            </button>
          </div>

          <div className="pass-print-area">
            <IDCard ref={cardRef} user={user} qrImage={qrImage} />
          </div>
        </>
      ) : (
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
            padding: "2rem",
            background: C.navy,
            border: "1px solid rgba(240,122,16,0.25)",
            borderRadius: 2,
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.35rem",
              fontWeight: 900,
              color: C.white,
              marginBottom: "0.75rem",
            }}
          >
            ID Card Not Available Yet
          </p>
          <p
            style={{
              fontSize: "0.85rem",
              lineHeight: 1.55,
              color: C.gray,
              margin: 0,
            }}
          >
            Your payment is pending verification. Your ID card will be available
            here after your registration payment is confirmed.
          </p>
        </div>
      )}
    </div>
  );
}
