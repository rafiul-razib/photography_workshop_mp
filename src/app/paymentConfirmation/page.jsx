"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight, CheckCircle2, Smartphone, XCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ─────────────────────────────────────────
   STYLES — navy + orange (matches suite)
───────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --navy3:  #071020;
    --navy:   #0B1628;
    --navy2:  #0E1D35;
    --orange: #F07A10;
    --orngd:  #C8600A;
    --white:  #FFFFFF;
    --gray:   #7A8A9A;
    --ash:    #1A2A40;
    --mist:   #4A6080;
    --film:   #060E1A;
  }

  .pc-root {
    min-height:100vh; background:var(--navy3);
    font-family:'DM Sans',sans-serif; color:var(--white);
    display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:3rem 1rem; position:relative; overflow:hidden;
  }
  .pc-root::before {
    content:''; position:fixed; inset:0;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity:.03; pointer-events:none; z-index:0;
  }

  /* bokeh */
  .pc-bokeh-tl {
    position:fixed; top:-80px; left:-80px; width:300px; height:300px;
    border-radius:50%;
    background:radial-gradient(circle,rgba(240,100,0,0.22) 0%,transparent 70%);
    pointer-events:none; z-index:0;
  }
  .pc-bokeh-br {
    position:fixed; bottom:-80px; right:-80px; width:340px; height:340px;
    border-radius:50%;
    background:radial-gradient(circle,rgba(20,70,180,0.25) 0%,transparent 70%);
    pointer-events:none; z-index:0;
  }

  /* ambient aperture ring */
  .pc-ring-bg {
    position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
    width:580px; height:580px; border-radius:50%;
    border:1px solid var(--orange); opacity:0.04;
    pointer-events:none; z-index:0;
  }
  .pc-ring-bg::before {
    content:''; position:absolute; inset:40px; border-radius:50%;
    border:1px solid rgba(240,122,16,0.5);
  }

  /* ── CARD ── */
  .pc-card {
    position:relative; z-index:1;
    width:100%; max-width:520px;
    background:var(--navy);
    border:1px solid rgba(240,122,16,0.18);
    border-radius:2px; padding:2.5rem;
  }
  .pc-card::before, .pc-card::after {
    content:''; position:absolute;
    width:20px; height:20px;
    border-color:var(--orange); border-style:solid; opacity:0.5;
  }
  .pc-card::before { top:14px; left:14px; border-width:1px 0 0 1px; }
  .pc-card::after  { bottom:14px; right:14px; border-width:0 1px 1px 0; }

  /* ── HEADER ── */
  .pc-eyebrow {
    font-size:0.6rem; letter-spacing:0.24em; text-transform:uppercase;
    color:var(--orange); display:flex; align-items:center; gap:0.5rem;
    margin-bottom:0.5rem;
  }
  .pc-eyebrow-dot {
    width:4px; height:4px; border-radius:50%; background:var(--orange);
    animation:pcdot 1.6s ease-in-out infinite;
  }
  @keyframes pcdot { 0%,100%{opacity:1} 50%{opacity:0.15} }

  .pc-title {
    font-family:'Playfair Display',serif;
    font-size:2rem; font-weight:900; line-height:1.1;
    letter-spacing:-0.02em; color:var(--white); margin-bottom:0.4rem;
  }
  .pc-title em { font-style:italic; color:var(--orange); }

  .pc-rule {
    height:1px;
    background:linear-gradient(90deg,var(--orange) 0%,transparent 100%);
    opacity:0.3; margin:1.5rem 0;
  }

  /* ── SECTION LABEL ── */
  .pc-section {
    display:flex; align-items:center; gap:0.6rem; margin-bottom:0.9rem;
  }
  .pc-section-num {
    font-size:0.58rem; letter-spacing:0.16em; color:var(--orange);
  }
  .pc-section-title {
    font-family:'Playfair Display',serif;
    font-size:0.85rem; font-weight:700; color:var(--white);
  }
  .pc-section::after {
    content:''; flex:1; height:1px;
    background:linear-gradient(to right,rgba(240,122,16,0.25),transparent);
  }

  /* ── PROOF-SHEET PHOTO ── */
  .pc-photo-wrap {
    display:flex; flex-direction:column; align-items:center;
    margin-bottom:1.75rem;
  }
  .pc-photo-outer { position:relative; }
  .pc-strip {
    position:absolute; top:0; bottom:0; width:14px;
    background:var(--film);
    display:flex; flex-direction:column;
    justify-content:space-evenly; align-items:center;
  }
  .pc-strip.left  { left:-14px; }
  .pc-strip.right { right:-14px; }
  .pc-strip-hole {
    width:7px; height:7px; border-radius:1px;
    background:var(--navy2); border:1px solid rgba(50,80,120,0.5);
  }
  .pc-photo-frame {
    width:116px; height:116px;
    border:1px solid rgba(240,122,16,0.35);
    border-radius:2px; overflow:hidden; background:var(--navy2);
    position:relative;
  }
  .pc-photo-frame::after {
    content:''; position:absolute; inset:0;
    border:2px solid rgba(240,122,16,0.15);
    border-radius:2px; pointer-events:none;
  }
  .pc-photo-frame img { width:100%; height:100%; object-fit:cover; display:block; }
  .pc-photo-label {
    font-size:0.58rem; letter-spacing:0.16em;
    text-transform:uppercase; color:var(--mist); margin-top:0.6rem;
  }

  /* ── INFO ROWS ── */
  .pc-info-list { display:flex; flex-direction:column; }
  .pc-info-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:0.65rem 0;
    border-bottom:1px solid rgba(255,255,255,0.06); gap:1rem;
  }
  .pc-info-row:last-child { border-bottom:none; }
  .pc-info-label {
    font-size:0.6rem; letter-spacing:0.16em; text-transform:uppercase;
    color:var(--gray); white-space:nowrap; flex-shrink:0;
  }
  .pc-info-value { font-size:0.88rem; color:rgba(210,225,240,0.9); text-align:right; }
  .pc-info-value.interest-badge {
    font-size:0.62rem; letter-spacing:0.14em; text-transform:uppercase;
    color:var(--orange); border:1px solid rgba(240,122,16,0.35);
    padding:0.2rem 0.65rem; border-radius:2px;
    background:rgba(240,122,16,0.08);
  }

  /* ── PAYABLE ── */
  .pc-payable-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:1rem; margin-top:1.25rem;
    background:var(--navy2);
    border:1px solid rgba(240,122,16,0.2); border-radius:2px;
    position:relative; overflow:hidden;
  }
  .pc-payable-row::after {
    content:''; position:absolute; bottom:-20px; right:-20px;
    width:70px; height:70px; border-radius:50%;
    border:1px solid var(--orange); opacity:0.07; pointer-events:none;
  }
  .pc-payable-label {
    font-size:0.6rem; letter-spacing:0.18em;
    text-transform:uppercase; color:var(--orange);
  }
  .pc-payable-amount {
    font-family:'Playfair Display',serif;
    font-size:1.75rem; font-weight:900; color:var(--orange);
    letter-spacing:-0.02em;
    display:flex; align-items:baseline; gap:0.3rem;
  }
  .pc-payable-currency {
    font-family:'DM Sans',sans-serif; font-size:0.68rem;
    font-weight:400; letter-spacing:0.1em; color:var(--gray);
  }

  /* ── BKASH STRIP ── */
  .pc-bkash-strip {
    display:flex; align-items:center; justify-content:space-between;
    gap:1rem; margin-top:0.75rem; padding:0.85rem 1rem;
    border:1px solid rgba(226,20,108,0.4);
    background:linear-gradient(135deg,rgba(226,20,108,0.12),rgba(226,20,108,0.04));
    border-radius:2px;
  }
  .pc-bkash-left {
    display:flex; align-items:center; gap:0.55rem;
    font-size:0.6rem; letter-spacing:0.16em;
    text-transform:uppercase; color:var(--gray);
  }
  .pc-bkash-mark { font-size:1.05rem; font-weight:800; letter-spacing:-0.02em; color:#E2146C; }

  /* ── AGREEMENT ── */
  .pc-agreement {
    display:flex; gap:0.75rem; align-items:flex-start;
    margin-top:1.5rem; padding:1rem;
    border:1px solid rgba(240,122,16,0.14); border-radius:2px;
    background:rgba(240,122,16,0.03); cursor:pointer;
  }
  .pc-agreement input[type="checkbox"] {
    appearance:none; width:16px; height:16px;
    border:1px solid var(--orange); border-radius:1px;
    background:transparent; cursor:pointer;
    flex-shrink:0; margin-top:2px; position:relative;
    transition:background 0.15s;
  }
  .pc-agreement input[type="checkbox"]:checked { background:var(--orange); }
  .pc-agreement input[type="checkbox"]:checked::after {
    content:''; position:absolute; top:2px; left:5px;
    width:4px; height:7px;
    border:1.5px solid var(--navy3); border-top:none; border-left:none;
    transform:rotate(40deg);
  }
  .pc-agreement-text {
    font-size:0.72rem; line-height:1.55; color:var(--gray); letter-spacing:0.01em;
  }
  .pc-agreement-text strong { color:rgba(210,225,240,0.9); font-weight:500; }

  /* ── SUBMIT ── */
  .pc-submit {
    width:100%; display:flex; align-items:center; justify-content:center; gap:0.6rem;
    margin-top:1.25rem; padding:0.9rem;
    background:var(--orange); border:none; border-radius:2px;
    font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:600;
    letter-spacing:0.2em; text-transform:uppercase; color:var(--navy3);
    cursor:pointer; transition:opacity 0.2s,transform 0.1s;
  }
  .pc-submit:hover:not(:disabled) { opacity:0.88; }
  .pc-submit:active:not(:disabled) { transform:scale(0.99); }
  .pc-submit:disabled { opacity:0.3; cursor:not-allowed; background:var(--mist); color:var(--navy2); }

  /* ── LOADING / SPINNER ── */
  .pc-loading {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:1.25rem;
    min-height:60vh; z-index:1; position:relative;
  }
  .pc-spinner {
    width:52px; height:52px; border-radius:50%;
    border:1.5px solid var(--orange); border-top-color:transparent;
    animation:pcspin 2s linear infinite; position:relative;
  }
  .pc-spinner::before {
    content:''; position:absolute; inset:7px; border-radius:50%;
    border:1px solid rgba(240,122,16,0.4); border-top-color:transparent;
    animation:pcspin 1.3s linear infinite reverse;
  }
  @keyframes pcspin { to{transform:rotate(360deg)} }
  .pc-loading-text {
    font-size:0.62rem; letter-spacing:0.22em; text-transform:uppercase; color:var(--gray);
  }

  /* ── FADE-IN ── */
  .pc-fade { opacity:0; animation:pcFadeUp 0.45s ease forwards; }
  @keyframes pcFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

  /* ── MODAL ── */
  .pc-modal-overlay {
    position:fixed; inset:0; z-index:50;
    display:flex; align-items:center; justify-content:center;
    padding:1rem;
    background:rgba(7,16,32,0.82);
    backdrop-filter:blur(4px);
  }
  .pc-modal {
    width:100%; max-width:480px;
    background:var(--navy);
    border:1px solid rgba(240,122,16,0.25);
    border-radius:2px;
    padding:2rem;
    text-align:center;
    position:relative;
    animation:pcFadeUp 0.3s ease forwards;
  }
  .pc-modal.error { border-color:rgba(239,68,68,0.45); }
  .pc-modal-title {
    font-family:'Playfair Display',serif;
    font-size:1.45rem; font-weight:900; line-height:1.2;
    margin:0.75rem 0 0.5rem; color:var(--white);
  }
  .pc-modal-text {
    font-size:0.85rem; line-height:1.55; color:var(--gray);
    margin:0;
  }
  .pc-modal-note {
    margin-top:1rem; padding:0.9rem 1rem;
    border-radius:2px; text-align:left;
    font-size:0.82rem; line-height:1.5;
  }
  .pc-modal-note.success {
    border:1px solid rgba(240,122,16,0.35);
    background:rgba(240,122,16,0.08);
    color:#EADBCB;
  }
  .pc-modal-note.error {
    border:1px solid rgba(239,68,68,0.45);
    background:rgba(239,68,68,0.1);
    color:#FECACA;
    white-space:pre-wrap; word-break:break-word;
  }
  .pc-modal-btn {
    margin-top:1.25rem; width:100%;
    padding:0.85rem;
    background:var(--orange); border:none; border-radius:2px;
    font-family:'DM Sans',sans-serif; font-size:0.72rem; font-weight:600;
    letter-spacing:0.18em; text-transform:uppercase; color:var(--navy3);
    cursor:pointer;
  }
  .pc-modal-btn:hover { opacity:0.88; }
`;

const DELAYS = [
  "0.05s",
  "0.1s",
  "0.15s",
  "0.2s",
  "0.25s",
  "0.3s",
  "0.35s",
  "0.4s",
];

function getServerErrorMessage(err) {
  const responseData = err?.response?.data;
  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }
  if (Array.isArray(responseData?.message) && responseData.message.length) {
    return responseData.message.join(", ");
  }
  if (typeof responseData?.error === "string" && responseData.error.trim()) {
    return responseData.error;
  }
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }
  if (responseData && typeof responseData === "object") {
    return JSON.stringify(responseData);
  }
  return "Failed to confirm registration. Please try again.";
}

function RegistrationModal({ modal, onClose }) {
  if (!modal) return null;

  const isSuccess = modal.type === "success";

  return (
    <div className="pc-modal-overlay" role="dialog" aria-modal="true">
      <div className={`pc-modal${isSuccess ? "" : " error"}`}>
        {isSuccess ? (
          <CheckCircle2
            size={52}
            color="#22C55E"
            style={{ margin: "0 auto" }}
          />
        ) : (
          <XCircle size={52} color="#EF4444" style={{ margin: "0 auto" }} />
        )}
        <h2 className="pc-modal-title">
          {isSuccess
            ? `Congratulations, ${modal.participantName}!`
            : "Registration Failed"}
        </h2>
        <p className="pc-modal-text">
          {isSuccess
            ? "Your registration has been confirmed successfully."
            : "We could not complete your registration. Please review the details below."}
        </p>
        <p className={`pc-modal-note ${isSuccess ? "success" : "error"}`}>
          {isSuccess
            ? "Your ID card will be sent to your registered email within 24 hours after verification."
            : modal.message}
        </p>
        <button type="button" className="pc-modal-btn" onClick={onClose}>
          {isSuccess ? "Back to Home" : "Close"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isBadge, delay }) {
  return (
    <div className="pc-info-row pc-fade" style={{ animationDelay: delay }}>
      <span className="pc-info-label">{label}</span>
      <span className={`pc-info-value${isBadge ? " interest-badge" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}

export default function PaymentConfirmation() {
  const [data, setData] = useState(null);
  const [storageChecked, setStorageChecked] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("formData");
    if (!stored) {
      setStorageChecked(true);
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch (err) {
      console.error("Invalid checkout data:", err);
      localStorage.removeItem("formData");
    } finally {
      setStorageChecked(true);
    }
  }, []);

  /* LOADING */
  if (!storageChecked)
    return (
      <div className="pc-root">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="pc-bokeh-tl" />
        <div className="pc-bokeh-br" />
        <div className="pc-ring-bg" />
        <div className="pc-loading">
          <div className="pc-spinner" />
          <span className="pc-loading-text">Developing your proof sheet…</span>
        </div>
      </div>
    );

  /* NO DATA */
  if (!data)
    return (
      <div className="pc-root">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="pc-bokeh-tl" />
        <div className="pc-bokeh-br" />
        <div className="pc-ring-bg" />
        <div className="pc-card">
          <div className="pc-eyebrow">
            <span className="pc-eyebrow-dot" />
            Checkout data missing
          </div>
          <h1 className="pc-title">
            Start from <em>Registration</em>
          </h1>
          <div className="pc-rule" />
          <p
            style={{
              fontSize: "0.72rem",
              lineHeight: 1.55,
              color: "var(--gray)",
            }}
          >
            We couldn't find your registration details. Please complete the form
            before confirming payment.
          </p>
          <button
            className="pc-submit"
            style={{ marginTop: "1.5rem" }}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go to Registration <ArrowRight size={13} />
          </button>
        </div>
      </div>
    );

  const BASE_FEE = 1250;
  const guestCount = Number(data.guests) || 0;
  const totalAmount = BASE_FEE + guestCount * 1000;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const registrationPayload = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        photo: data.photo,
        bkashTransactionId: data.bkashTransactionId,
        interest: data.interest,
        totalAmount: 1250,
        paymentMethod: "bkash",
        paymentStatus: false,
      };

      await axios.post(`${API_BASE_URL}/register`, registrationPayload);
      localStorage.removeItem("formData");
      setModal({
        type: "success",
        participantName: data.fullName || "Participant",
      });
    } catch (err) {
      console.error("Error saving applicant:", err);
      console.log("Registration failed response:", err?.response?.data);
      setModal({
        type: "error",
        message: getServerErrorMessage(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (modal?.type === "success") {
      window.location.href = "/";
      return;
    }
    setModal(null);
  };

  return (
    <div className="pc-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="pc-bokeh-tl" />
      <div className="pc-bokeh-br" />
      <div className="pc-ring-bg" />

      <RegistrationModal modal={modal} onClose={handleModalClose} />

      <div className="pc-card">
        {/* HEADER */}
        <div className="pc-eyebrow pc-fade" style={{ animationDelay: "0s" }}>
          <span className="pc-eyebrow-dot" /> Step 2 of 2
        </div>
        <h1 className="pc-title pc-fade" style={{ animationDelay: "0.05s" }}>
          Review &amp; <em>Confirm</em>
        </h1>
        <div className="pc-rule pc-fade" style={{ animationDelay: "0.1s" }} />

        {/* 01 PHOTO */}
        {data.photo && (
          <>
            <div
              className="pc-section pc-fade"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="pc-section-num">01</span>
              <span className="pc-section-title">Participant Photo</span>
            </div>
            <div
              className="pc-photo-wrap pc-fade"
              style={{ animationDelay: "0.12s" }}
            >
              <div className="pc-photo-outer">
                <div className="pc-strip left">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="pc-strip-hole" />
                  ))}
                </div>
                <div className="pc-photo-frame">
                  <img src={data.photo} alt="Participant" />
                </div>
                <div className="pc-strip right">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="pc-strip-hole" />
                  ))}
                </div>
              </div>
              <span className="pc-photo-label">Frame 01 · Workshop 2026</span>
            </div>
          </>
        )}

        {/* 02 DETAILS */}
        <div className="pc-section pc-fade" style={{ animationDelay: "0.16s" }}>
          <span className="pc-section-num">02</span>
          <span className="pc-section-title">Participant Details</span>
        </div>
        <div className="pc-info-list">
          <InfoRow label="Full Name" value={data.fullName} delay={DELAYS[0]} />
          <InfoRow label="Email" value={data.email} delay={DELAYS[1]} />
          <InfoRow label="Mobile" value={data.phone} delay={DELAYS[2]} />
          <InfoRow
            label="Interest"
            value={data.interest}
            isBadge
            delay={DELAYS[3]}
          />
          <InfoRow
            label="bKash TrxID"
            value={data.bkashTransactionId}
            delay={DELAYS[4]}
          />
          {guestCount > 0 && (
            <InfoRow label="Guests" value={guestCount} delay={DELAYS[5]} />
          )}
        </div>

        {/* 03 PAYMENT */}
        <div
          className="pc-section pc-fade"
          style={{ animationDelay: "0.32s", marginTop: "1.25rem" }}
        >
          <span className="pc-section-num">03</span>
          <span className="pc-section-title">Payment</span>
        </div>

        <div
          className="pc-payable-row pc-fade"
          style={{ animationDelay: "0.35s" }}
        >
          <span className="pc-payable-label">Total Payable</span>
          <span className="pc-payable-amount">
            <span className="pc-payable-currency">BDT</span>
            {totalAmount.toLocaleString()}
          </span>
        </div>

        <div
          className="pc-bkash-strip pc-fade"
          style={{ animationDelay: "0.38s" }}
        >
          <span className="pc-bkash-left">
            <Smartphone size={13} />
            Payment via
          </span>
          <span className="pc-bkash-mark">bKash</span>
        </div>

        <label
          className="pc-agreement pc-fade"
          style={{ animationDelay: "0.42s" }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <span className="pc-agreement-text">
            I confirm that all information provided is{" "}
            <strong>accurate and truthful</strong>. I accept responsibility for
            any discrepancy and agree to comply with decisions made by the
            workshop organising committee.
          </span>
        </label>

        <button
          className="pc-submit pc-fade"
          style={{ animationDelay: "0.46s" }}
          onClick={handleConfirm}
          disabled={!isChecked || submitting}
        >
          {submitting ? "Confirming Registration..." : "Confirm Registration"}
          {!submitting && <ArrowRight size={13} />}
        </button>
      </div>

      <p
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: "1.75rem",
          fontSize: "0.58rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(74,96,128,0.55)",
        }}
      >
        Photography Workshop · 2026
      </p>
    </div>
  );
}
