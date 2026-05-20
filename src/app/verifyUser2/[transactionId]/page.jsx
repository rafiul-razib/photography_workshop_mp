"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  CheckCircle2,
  Mail,
  Phone,
  Camera,
  CreditCard,
  Car,
  ShieldCheck,
} from "lucide-react";

/* ── shared palette (same as IDCard / Registration) ── */
const C = {
  navy: "#0B1628",
  navy2: "#0E1D35",
  navy3: "#071020",
  orange: "#F07A10",
  orangeD: "#C8600A",
  white: "#FFFFFF",
  paper: "#F5EDD6",
  gray: "#7A8A9A",
  ash: "#2C2824",
  mist: "#8C8078",
  film: "#060E1A",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .vu-root {
    min-height: 100vh;
    background: ${C.navy3};
    font-family: 'DM Sans', sans-serif;
    color: ${C.white};
    position: relative;
    overflow-x: hidden;
  }

  /* grain */
  .vu-root::before {
    content:'';
    position:fixed; inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity:.03; pointer-events:none; z-index:0;
  }

  /* ── horizontal film strip across the very top ── */
  .vu-filmstrip {
    position: relative; z-index:2;
    width:100%; height:22px;
    background:${C.film};
    display:flex; align-items:center;
    overflow:hidden;
  }
  .vu-filmstrip-holes {
    display:flex; gap:10px; padding:0 16px;
    animation: filmScroll 14s linear infinite;
  }
  @keyframes filmScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .vu-hole {
    width:14px; height:10px; border-radius:2px; flex-shrink:0;
    background:rgba(30,50,80,0.5);
    border:1px solid rgba(50,80,120,0.4);
  }

  /* ── page layout ── */
  .vu-page {
    position:relative; z-index:1;
    max-width:780px; margin:0 auto;
    padding:2.5rem 1.25rem 4rem;
  }

  /* ── verified badge ── */
  .vu-badge {
    display:inline-flex; align-items:center; gap:0.5rem;
    padding:0.45rem 1.25rem;
    border:1px solid ${C.orange};
    border-radius:2px;
    background:rgba(240,122,16,0.08);
    font-size:0.68rem; letter-spacing:0.2em;
    text-transform:uppercase; color:${C.orange};
    margin-bottom:2rem;
  }
  .vu-badge-dot {
    width:6px;height:6px;border-radius:50%;
    background:#4ADE80;
    box-shadow:0 0 6px #4ADE80;
    animation:vublink 1.4s ease-in-out infinite;
  }
  @keyframes vublink{0%,100%{opacity:1}50%{opacity:0.2}}

  /* ── hero section (photo + name side-by-side on md+) ── */
  .vu-hero {
    display:flex; flex-direction:column; align-items:center;
    gap:1.75rem; margin-bottom:2.25rem;
    text-align:center;
  }
  @media(min-width:620px){
    .vu-hero { flex-direction:row; text-align:left; align-items:flex-start; }
  }

  /* photo */
  .vu-photo-wrap {
    position:relative; flex-shrink:0;
  }
  .vu-photo-ring {
    width:140px; height:140px; border-radius:50%;
    border:4px solid ${C.orange};
    padding:3px;
    background:transparent;
    display:flex; align-items:center; justify-content:center;
    position:relative;
  }
  .vu-photo-ring::before {
    content:'';
    position:absolute; inset:-10px; border-radius:50%;
    border:1px solid rgba(240,122,16,0.22);
  }
  .vu-photo-inner {
    width:100%; height:100%; border-radius:50%;
    overflow:hidden; background:${C.navy2};
    border:2px solid rgba(240,122,16,0.3);
  }
  .vu-photo-inner img { width:100%; height:100%; object-fit:cover; display:block; }

  /* verified tick on photo */
  .vu-check-badge {
    position:absolute; bottom:4px; right:4px;
    width:32px; height:32px; border-radius:50%;
    background:#16A34A; border:2px solid ${C.navy3};
    display:flex; align-items:center; justify-content:center;
  }

  /* name + eyebrow */
  .vu-hero-text { flex:1; min-width:0; }
  .vu-eyebrow {
    font-size:0.62rem; letter-spacing:0.22em;
    text-transform:uppercase; color:${C.orange};
    margin-bottom:0.4rem;
  }
  .vu-name {
    font-family:'Playfair Display', serif;
    font-size:clamp(1.8rem, 5vw, 2.8rem);
    font-weight:900; line-height:1.1;
    letter-spacing:-0.02em; color:${C.white};
    word-break:break-word;
  }
  .vu-name em { font-style:italic; color:${C.orange}; }
  .vu-interest-badge {
    display:inline-flex; align-items:center; gap:0.4rem;
    margin-top:0.75rem; padding:0.3rem 0.8rem;
    border:1px solid ${C.orange}; border-radius:2px;
    background:rgba(240,122,16,0.08);
    font-size:0.65rem; letter-spacing:0.16em;
    text-transform:uppercase; color:${C.orange};
  }

  /* ── section divider ── */
  .vu-section-head {
    display:flex; align-items:center; gap:0.75rem;
    margin-bottom:1rem;
  }
  .vu-section-head span {
    font-family:'Playfair Display', serif;
    font-size:1rem; font-weight:700; color:${C.white};
    white-space:nowrap;
  }
  .vu-section-head::after {
    content:''; flex:1; height:1px;
    background:linear-gradient(to right, rgba(240,122,16,0.35), transparent);
  }
  .vu-section-num {
    font-size:0.6rem; letter-spacing:0.15em; color:${C.orange};
  }

  /* ── info grid ── */
  .vu-grid {
    display:grid; grid-template-columns:1fr;
    gap:0.6rem; margin-bottom:1.5rem;
  }
  @media(min-width:520px){ .vu-grid { grid-template-columns:1fr 1fr; } }

  .vu-info-row {
    display:flex; align-items:center; gap:0.85rem;
    padding:0.8rem 1rem;
    background:rgba(15,30,55,0.7);
    border:1px solid rgba(240,122,16,0.14);
    border-radius:2px;
    transition:border-color 0.2s;
  }
  .vu-info-row:hover { border-color:rgba(240,122,16,0.35); }
  .vu-icon-box {
    width:34px; height:34px; flex-shrink:0; border-radius:5px;
    border:1.5px solid ${C.orange};
    background:rgba(240,122,16,0.08);
    display:flex; align-items:center; justify-content:center;
  }
  .vu-info-label {
    font-size:0.6rem; letter-spacing:0.16em;
    text-transform:uppercase; color:${C.gray};
    margin-bottom:0.15rem;
  }
  .vu-info-value {
    font-size:0.88rem; font-weight:500; color:${C.white};
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  }

  /* ── payment card ── */
  .vu-payment {
    position:relative;
    background:rgba(15,30,55,0.8);
    border:1px solid rgba(240,122,16,0.25);
    border-radius:2px;
    padding:1.5rem;
    overflow:hidden;
  }
  .vu-payment::before, .vu-payment::after {
    content:''; position:absolute;
    width:20px; height:20px;
    border-color:${C.orange}; border-style:solid; opacity:0.5;
  }
  .vu-payment::before { top:12px; left:12px; border-width:1px 0 0 1px; }
  .vu-payment::after  { bottom:12px; right:12px; border-width:0 1px 1px 0; }

  .vu-payment-label {
    font-size:0.6rem; letter-spacing:0.2em;
    text-transform:uppercase; color:${C.orange};
    margin-bottom:0.9rem;
    display:flex; align-items:center; gap:0.5rem;
  }
  .vu-payment-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:0.65rem 0;
    border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .vu-payment-row:last-child { border-bottom:none; }
  .vu-payment-key {
    font-size:0.7rem; letter-spacing:0.1em;
    text-transform:uppercase; color:${C.gray};
  }
  .vu-payment-val {
    font-family:'Playfair Display', serif;
    font-size:1.7rem; font-weight:900;
    color:${C.orange}; letter-spacing:-0.01em;
    display:flex; align-items:baseline; gap:0.3rem;
  }
  .vu-payment-currency {
    font-family:'DM Sans', sans-serif;
    font-size:0.7rem; font-weight:400;
    letter-spacing:0.1em; color:${C.gray};
  }
  .vu-status-paid {
    display:inline-flex; align-items:center; gap:0.4rem;
    font-size:0.68rem; letter-spacing:0.14em;
    text-transform:uppercase; font-weight:600;
    color:#4ADE80; padding:0.25rem 0.7rem;
    border:1px solid rgba(74,222,128,0.3);
    border-radius:2px; background:rgba(74,222,128,0.06);
  }
  .vu-status-unpaid {
    display:inline-flex; align-items:center; gap:0.4rem;
    font-size:0.68rem; letter-spacing:0.14em;
    text-transform:uppercase; font-weight:600;
    color:#F87171; padding:0.25rem 0.7rem;
    border:1px solid rgba(248,113,113,0.3);
    border-radius:2px; background:rgba(248,113,113,0.06);
  }

  /* ── skeleton ── */
  .vu-skeleton {
    background:linear-gradient(90deg, rgba(20,40,80,0.8) 25%, rgba(30,60,110,0.6) 50%, rgba(20,40,80,0.8) 75%);
    background-size:400% 100%;
    animation:shimmer 1.6s ease-in-out infinite;
    border-radius:2px;
  }
  @keyframes shimmer { 0%{background-position:100% 50%} 100%{background-position:0% 50%} }

  /* ── error card ── */
  .vu-error {
    background:rgba(248,113,113,0.06);
    border:1px solid rgba(248,113,113,0.3);
    border-radius:2px; padding:2rem;
    text-align:center; color:#F87171;
    font-family:'DM Sans',sans-serif;
    font-size:0.8rem; letter-spacing:0.14em;
    text-transform:uppercase;
  }

  /* ── fade in ── */
  .vu-fade { opacity:0; animation:vuFade 0.5s ease forwards; }
  @keyframes vuFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
`;

/* ── film strip holes array (doubled for seamless scroll) ── */
const HOLES = Array.from({ length: 60 });

/* ── reusable info row ── */
function InfoRow({ icon: Icon, label, value, delay = "0s", full = false }) {
  return (
    <div
      className="vu-info-row vu-fade"
      style={{ animationDelay: delay, gridColumn: full ? "1 / -1" : undefined }}
    >
      <div className="vu-icon-box">
        <Icon size={15} color={C.orange} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="vu-info-label">{label}</p>
        <p className="vu-info-value">{value || "—"}</p>
      </div>
    </div>
  );
}

/* ── aperture decoration (small) ── */
function ApertureRing({ size = 80, opacity = 0.06 }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1px solid ${C.orange}`,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 10,
          borderRadius: "50%",
          border: `1px solid ${C.orange}`,
        }}
      />
    </div>
  );
}

export default function VerifyUser() {
  const { transactionId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/verifyUser/${transactionId}`,
        );
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [transactionId]);

  /* ── LOADING ── */
  if (loading)
    return (
      <div className="vu-root">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="vu-filmstrip">
          <div className="vu-filmstrip-holes">
            {[...HOLES, ...HOLES].map((_, i) => (
              <div key={i} className="vu-hole" />
            ))}
          </div>
        </div>
        <div
          className="vu-page"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div
            className="vu-skeleton"
            style={{ width: 140, height: 140, borderRadius: "50%" }}
          />
          <div className="vu-skeleton" style={{ width: 240, height: 28 }} />
          <div className="vu-skeleton" style={{ width: "100%", height: 64 }} />
          <div className="vu-skeleton" style={{ width: "100%", height: 64 }} />
          <div className="vu-skeleton" style={{ width: "100%", height: 110 }} />
        </div>
      </div>
    );

  /* ── NOT FOUND ── */
  if (!user)
    return (
      <div className="vu-root">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="vu-filmstrip">
          <div className="vu-filmstrip-holes">
            {[...HOLES, ...HOLES].map((_, i) => (
              <div key={i} className="vu-hole" />
            ))}
          </div>
        </div>
        <div className="vu-page">
          <div className="vu-error">
            Participant not found · Please check the verification link
          </div>
        </div>
      </div>
    );

  return (
    <div className="vu-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* ── HORIZONTAL FILM STRIP top ── */}
      <div className="vu-filmstrip">
        <div className="vu-filmstrip-holes">
          {[...HOLES, ...HOLES].map((_, i) => (
            <div key={i} className="vu-hole" />
          ))}
        </div>
      </div>

      {/* ── BOKEH GLOWS ── */}
      <div
        style={{
          position: "fixed",
          top: -80,
          left: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(240,100,0,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 100,
          right: -80,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(20,70,180,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 80,
          right: 60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(30,90,200,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="vu-page">
        {/* ── VERIFIED BADGE ── */}
        <div
          className="vu-fade"
          style={{ marginBottom: "1.5rem", animationDelay: "0s" }}
        >
          <span className="vu-badge">
            <span className="vu-badge-dot" />
            <ShieldCheck size={13} />
            Identity Verified
          </span>
        </div>

        {/* ── HERO: PHOTO + NAME ── */}
        <div className="vu-hero vu-fade" style={{ animationDelay: "0.08s" }}>
          {/* Photo */}
          {user.photo && (
            <div className="vu-photo-wrap">
              {/* outer aperture ring decoration */}
              <ApertureRing size={170} opacity={0.12} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div className="vu-photo-ring">
                  <div className="vu-photo-inner">
                    <img src={user.photo} alt={user.fullName} />
                  </div>
                </div>
                {/* verified tick */}
                <div className="vu-check-badge">
                  <CheckCircle2 size={16} color="#fff" />
                </div>
              </div>
            </div>
          )}

          {/* Name block */}
          <div className="vu-hero-text">
            <p className="vu-eyebrow">Photography Workshop 2025</p>
            <h1 className="vu-name">{user.fullName}</h1>
            {user.interest && (
              <div className="vu-interest-badge">
                <Camera size={11} />
                {user.interest}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTACT DETAILS ── */}
        <div
          className="vu-section-head vu-fade"
          style={{ animationDelay: "0.14s" }}
        >
          <span className="vu-section-num">01</span>
          <span>Contact</span>
        </div>
        <div className="vu-grid vu-fade" style={{ animationDelay: "0.18s" }}>
          <InfoRow
            icon={Mail}
            label="Email Address"
            value={user.email}
            delay="0.2s"
          />
          <InfoRow
            icon={Phone}
            label="Mobile Number"
            value={user.phone}
            delay="0.24s"
          />
        </div>

        {/* ── WORKSHOP DETAILS ── */}
        <div
          className="vu-section-head vu-fade"
          style={{ animationDelay: "0.28s" }}
        >
          <span className="vu-section-num">02</span>
          <span>Workshop Details</span>
        </div>
        <div className="vu-grid vu-fade" style={{ animationDelay: "0.3s" }}>
          <InfoRow
            icon={Camera}
            label="Area of Interest"
            value={user.interest}
            delay="0.32s"
          />
          <InfoRow
            icon={Car}
            label="Car Parking"
            value={user.parking}
            delay="0.36s"
          />
        </div>

        {/* ── PAYMENT ── */}
        <div
          className="vu-section-head vu-fade"
          style={{ animationDelay: "0.4s" }}
        >
          <span className="vu-section-num">03</span>
          <span>Payment</span>
        </div>

        <div className="vu-payment vu-fade" style={{ animationDelay: "0.44s" }}>
          {/* decorative aperture ring inside payment card */}
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              pointerEvents: "none",
            }}
          >
            <ApertureRing size={120} opacity={0.07} />
          </div>

          <p className="vu-payment-label">
            <CreditCard size={13} />
            Workshop Registration
          </p>

          <div className="vu-payment-row">
            <span className="vu-payment-key">Status</span>
            {user.paymentStatus ? (
              <span className="vu-status-paid">
                <CheckCircle2 size={11} /> Paid
              </span>
            ) : (
              <span className="vu-status-unpaid">✗ Pending</span>
            )}
          </div>

          <div className="vu-payment-row" style={{ borderBottom: "none" }}>
            <span className="vu-payment-key">Total Paid</span>
            <span className="vu-payment-val">
              <span className="vu-payment-currency">BDT</span>
              {user.totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* ── HORIZONTAL FILM STRIP bottom ── */}
      <div className="vu-filmstrip" style={{ position: "relative", zIndex: 2 }}>
        <div
          className="vu-filmstrip-holes"
          style={{ animationDirection: "reverse" }}
        >
          {[...HOLES, ...HOLES].map((_, i) => (
            <div key={i} className="vu-hole" />
          ))}
        </div>
      </div>
    </div>
  );
}
