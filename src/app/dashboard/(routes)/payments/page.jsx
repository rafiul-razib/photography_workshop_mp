"use client";

import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MdOutlinePayments } from "react-icons/md";
import { RiPrinterLine, RiRefreshLine } from "react-icons/ri";
import { AlertCircle, Camera, Clapperboard, Wallet } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const C = {
  navy: "#0B1628",
  navy2: "#0E1D35",
  navy3: "#071020",
  orange: "#F07A10",
  white: "#FFFFFF",
  gray: "#7A8A9A",
  mist: "#4A6080",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  .pay-root { font-family:'DM Sans',sans-serif; }

  .pay-header {
    position:relative; overflow:hidden;
    border:1px solid rgba(240,122,16,0.18);
    border-radius:2px;
    background:${C.navy};
    padding:1.75rem 2rem;
    margin-bottom:1.5rem;
  }
  .pay-header::before, .pay-header::after {
    content:''; position:absolute;
    width:22px; height:22px;
    border-color:${C.orange}; border-style:solid; opacity:0.45;
  }
  .pay-header::before { top:14px; left:14px; border-width:1px 0 0 1px; }
  .pay-header::after  { bottom:14px; right:14px; border-width:0 1px 1px 0; }

  .pay-header-glow {
    position:absolute; top:-40px; right:-40px;
    width:180px; height:180px; border-radius:50%;
    background:radial-gradient(circle,rgba(240,100,0,0.2) 0%,transparent 70%);
    pointer-events:none;
  }

  .pay-eyebrow {
    display:inline-flex; align-items:center; gap:0.4rem;
    font-size:0.6rem; letter-spacing:0.22em; text-transform:uppercase;
    color:${C.orange}; border:1px solid rgba(240,122,16,0.3);
    border-radius:2px; padding:0.3rem 0.75rem;
    background:rgba(240,122,16,0.07); margin-bottom:0.75rem;
  }
  .pay-eyebrow-dot {
    width:5px; height:5px; border-radius:50%; background:${C.orange};
    animation:payblink 1.5s ease-in-out infinite;
  }
  @keyframes payblink{0%,100%{opacity:1}50%{opacity:0.15}}

  .pay-title {
    font-family:'Playfair Display',serif;
    font-size:clamp(1.6rem,3vw,2.2rem); font-weight:900;
    letter-spacing:-0.02em; color:${C.white}; margin-bottom:0.4rem;
  }
  .pay-title em { font-style:italic; color:${C.orange}; }
  .pay-print-title { display:none; }
  .pay-subtitle {
    font-size:0.75rem; color:${C.gray}; line-height:1.6; max-width:560px;
  }

  .pay-refresh-btn {
    display:inline-flex; align-items:center; gap:0.45rem;
    padding:0.6rem 1.2rem;
    background:rgba(240,122,16,0.08);
    border:1px solid rgba(240,122,16,0.3); border-radius:2px;
    font-family:'DM Sans',sans-serif; font-size:0.7rem;
    letter-spacing:0.14em; text-transform:uppercase;
    color:${C.orange}; font-weight:500; cursor:pointer;
    transition:background 0.18s, border-color 0.18s;
    white-space:nowrap;
  }
  .pay-refresh-btn:hover { background:rgba(240,122,16,0.15); border-color:rgba(240,122,16,0.5); }
  .pay-refresh-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .pay-header-actions {
    display:flex; flex-wrap:wrap; align-items:center; gap:0.5rem;
  }
  .pay-spin { animation:payspin 0.9s linear infinite; }
  @keyframes payspin { to{transform:rotate(360deg)} }

  .pay-print-summary { display:none; }

  .pay-stats { display:grid; gap:0.75rem; margin-bottom:1.5rem; }
  @media(min-width:480px){ .pay-stats { grid-template-columns:1fr 1fr; } }
  @media(min-width:900px){ .pay-stats { grid-template-columns:repeat(4,1fr); } }

  .pay-stat {
    position:relative;
    background:${C.navy}; border:1px solid rgba(240,122,16,0.15);
    border-radius:2px; padding:1.2rem 1.25rem; overflow:hidden;
  }
  .pay-stat::before, .pay-stat::after {
    content:''; position:absolute;
    width:14px; height:14px;
    border-color:${C.orange}; border-style:solid; opacity:0.3;
  }
  .pay-stat::before { top:8px; left:8px; border-width:1px 0 0 1px; }
  .pay-stat::after  { bottom:8px; right:8px; border-width:0 1px 1px 0; }

  .pay-stat-label {
    font-size:0.58rem; letter-spacing:0.2em; text-transform:uppercase;
    color:${C.gray}; margin-bottom:0.75rem;
    display:flex; align-items:center; justify-content:space-between;
  }
  .pay-stat-icon {
    width:28px; height:28px; border-radius:4px;
    border:1px solid rgba(240,122,16,0.25);
    background:rgba(240,122,16,0.08);
    display:flex; align-items:center; justify-content:center;
  }
  .pay-stat-value {
    font-family:'Playfair Display',serif;
    font-size:clamp(1.35rem,2.5vw,2rem); font-weight:900;
    color:${C.white}; line-height:1.1; letter-spacing:-0.02em;
  }
  .pay-stat-helper {
    font-size:0.65rem; color:${C.mist};
    letter-spacing:0.06em; margin-top:0.35rem; line-height:1.45;
  }

  .pay-stat.total .pay-stat-value { color:#4ADE80; }
  .pay-stat.total .pay-stat-icon {
    border-color:rgba(74,222,128,0.3);
    background:rgba(74,222,128,0.08);
  }
  .pay-stat.photo .pay-stat-icon {
    border-color:rgba(96,165,250,0.35);
    background:rgba(96,165,250,0.08);
  }
  .pay-stat.cinema .pay-stat-icon {
    border-color:rgba(251,191,36,0.35);
    background:rgba(251,191,36,0.08);
  }

  .pay-table-card {
    background:${C.navy};
    border:1px solid rgba(240,122,16,0.15);
    border-radius:2px; overflow:hidden;
  }
  .pay-table-head {
    display:flex; flex-direction:column; gap:0.6rem;
    padding:1.1rem 1.25rem 1rem;
    border-bottom:1px solid rgba(240,122,16,0.1);
  }
  @media(min-width:560px){
    .pay-table-head { flex-direction:row; align-items:center; justify-content:space-between; }
  }
  .pay-table-title {
    font-family:'Playfair Display',serif;
    font-size:1.05rem; font-weight:700; color:${C.white};
  }
  .pay-table-title em { font-style:italic; color:${C.orange}; }
  .pay-table-sub {
    font-size:0.65rem; color:${C.gray}; margin-top:1px;
    letter-spacing:0.04em;
  }
  .pay-count-badge {
    display:inline-flex; align-items:center; gap:0.35rem;
    font-size:0.6rem; letter-spacing:0.18em; text-transform:uppercase;
    color:${C.orange}; border:1px solid rgba(240,122,16,0.3);
    border-radius:2px; padding:0.28rem 0.7rem;
    background:rgba(240,122,16,0.07); white-space:nowrap; flex-shrink:0;
  }

  .pay-table-wrap { overflow-x:auto; }
  table.pay-table { width:100%; border-collapse:collapse; }
  .pay-table thead tr {
    background:rgba(7,16,32,0.8);
    border-bottom:1px solid rgba(240,122,16,0.12);
  }
  .pay-table th {
    padding:0.75rem 1rem;
    font-size:0.58rem; letter-spacing:0.18em; text-transform:uppercase;
    color:${C.gray}; font-weight:500; white-space:nowrap; text-align:left;
  }
  .pay-table th:first-child { padding-left:1.25rem; }
  .pay-table th:last-child { padding-right:1.25rem; text-align:right; }
  .pay-table tbody tr {
    border-bottom:1px solid rgba(255,255,255,0.04);
    transition:background 0.15s;
  }
  .pay-table tbody tr:last-child { border-bottom:none; }
  .pay-table tbody tr:hover { background:rgba(240,122,16,0.04); }
  .pay-table td {
    padding:0.75rem 1rem; font-size:0.8rem;
    color:rgba(200,215,230,0.85); white-space:nowrap; vertical-align:middle;
  }
  .pay-table td:first-child { padding-left:1.25rem; }
  .pay-table td:last-child { padding-right:1.25rem; text-align:right; }

  .pay-mono {
    font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size:0.75rem; letter-spacing:0.02em;
  }
  .pay-amount {
    font-weight:600; color:${C.white};
  }
  .pay-state-box {
    padding:3.5rem 1rem; text-align:center;
    display:flex; flex-direction:column; align-items:center; gap:0.85rem;
    color:${C.gray}; font-size:0.75rem;
  }
  .pay-state-label {
    font-size:0.68rem; letter-spacing:0.16em; text-transform:uppercase;
  }

  @media print {
    @page {
      size: A4 portrait;
      margin: 10mm;
    }

    body {
      background: #fff !important;
      color: #000 !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .pay-root {
      max-width: none !important;
      margin: 0 !important;
      color: #000 !important;
      background: #fff !important;
      font-family: Arial, sans-serif !important;
    }

    .pay-header,
    .pay-table-card {
      border: 0 !important;
      background: #fff !important;
      color: #000 !important;
      box-shadow: none !important;
    }

    .pay-header {
      padding: 0 0 12px !important;
      margin-bottom: 12px !important;
      border-bottom: 2px solid #000 !important;
    }

    .pay-header::before,
    .pay-header::after,
    .pay-header-glow,
    .pay-eyebrow,
    .pay-refresh-btn,
    .pay-print-btn,
    .pay-table-head,
    .pay-count-badge,
    .pay-state-box {
      display: none !important;
    }

    .pay-title { display: none !important; }

    .pay-print-title {
      display: block !important;
      color: #000 !important;
      font-family: Arial, sans-serif !important;
      font-size: 22px !important;
      font-weight: 700 !important;
      margin: 0 0 4px !important;
    }

    .pay-subtitle {
      display: block !important;
      color: #000 !important;
      font-size: 11px !important;
      max-width: none !important;
    }

    .pay-stats {
      display: block !important;
      margin: 0 0 12px !important;
      padding-bottom: 10px !important;
      border-bottom: 1px solid #000 !important;
      background: #fff !important;
    }

    .pay-stats > .pay-stat { display: none !important; }

    .pay-print-summary {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 4px !important;
      font-size: 11px !important;
      color: #000 !important;
      line-height: 1.45 !important;
    }

    .pay-print-summary strong {
      font-weight: 700 !important;
      color: #000 !important;
    }

    .pay-table-wrap {
      overflow: visible !important;
      width: 100% !important;
    }

    table.pay-table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
      font-size: 9px !important;
    }

    .pay-table thead tr {
      background: #fff !important;
      border-bottom: 1px solid #000 !important;
    }

    .pay-table tbody tr {
      border-bottom: 1px solid #999 !important;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .pay-table th,
    .pay-table td {
      padding: 4px 6px !important;
      border: 1px solid #999 !important;
      color: #000 !important;
      white-space: normal !important;
      vertical-align: top !important;
      word-break: break-word !important;
      text-align: left !important;
    }

    .pay-table th:last-child,
    .pay-table td:last-child {
      text-align: right !important;
    }

    .pay-table th:nth-child(1),
    .pay-table td:nth-child(1) { width: 5% !important; }
    .pay-table th:nth-child(2),
    .pay-table td:nth-child(2) { width: 22% !important; }
    .pay-table th:nth-child(3),
    .pay-table td:nth-child(3) { width: 38% !important; }
    .pay-table th:nth-child(4),
    .pay-table td:nth-child(4) { width: 20% !important; }

    .pay-mono,
    .pay-amount {
      color: #000 !important;
      font-family: Arial, sans-serif !important;
      font-size: 9px !important;
      font-weight: 400 !important;
    }
  }
`;

function StatCard({ label, value, helper, icon: Icon, iconColor, variant, delay }) {
  return (
    <motion.div
      className={`pay-stat ${variant || ""}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32 }}
    >
      <div className="pay-stat-label">
        {label}
        <span className="pay-stat-icon">
          <Icon size={13} color={iconColor || C.orange} />
        </span>
      </div>
      <div className="pay-stat-value">{value}</div>
      <div className="pay-stat-helper">{helper}</div>
    </motion.div>
  );
}

const getParticipantInterest = (user) =>
  user?.interest ||
  user?.areaOfInterest ||
  user?.interestedIn ||
  user?.workshopInterest ||
  "";

const normalizeCategory = (interest) => {
  const value = String(interest || "").trim().toLowerCase();
  if (value.includes("photo")) return "Photography";
  if (value.includes("cinema") || value.includes("film")) return "Cinematography";
  return "";
};

const getTransactionId = (user) =>
  user?.bkashTransactionId || user?.transactionId || "—";

const getParticipantId = (user) =>
  user?.participantId || user?.userId || "—";

const getPaidAmount = (user) => Number(user?.totalAmount) || 0;

const formatBdt = (amount) =>
  `BDT ${Number(amount).toLocaleString("en-BD", { maximumFractionDigits: 0 })}`;

export default function DashboardPaymentsPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/allRegisteredMembers`);
      setAllUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load payment records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const paidUsers = useMemo(
    () => allUsers.filter((user) => user.paymentStatus),
    [allUsers],
  );

  const summary = useMemo(() => {
    const photography = { count: 0, amount: 0 };
    const cinematography = { count: 0, amount: 0 };

    paidUsers.forEach((user) => {
      const amount = getPaidAmount(user);
      const category = normalizeCategory(getParticipantInterest(user));

      if (category === "Photography") {
        photography.count += 1;
        photography.amount += amount;
      } else if (category === "Cinematography") {
        cinematography.count += 1;
        cinematography.amount += amount;
      }
    });

    const totalReceived = paidUsers.reduce(
      (sum, user) => sum + getPaidAmount(user),
      0,
    );

    return {
      totalReceived,
      photography,
      cinematography,
    };
  }, [paidUsers]);

  const sortedPaidUsers = useMemo(
    () =>
      [...paidUsers].sort((a, b) =>
        String(getParticipantId(a)).localeCompare(String(getParticipantId(b))),
      ),
    [paidUsers],
  );

  const handlePrint = () => {
    const currentTitle = document.title;
    document.title = "Workshop 2026 — Payments";
    window.print();
    document.title = currentTitle;
  };

  const printedAt = new Date().toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="pay-root" style={{ maxWidth: 1200, margin: "0 auto" }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="pay-header">
        <div className="pay-header-glow" />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1rem",
            zIndex: 1,
          }}
        >
          <div>
            <div className="pay-eyebrow">
              <span className="pay-eyebrow-dot" />
              <MdOutlinePayments size={9} />
              Payment Overview
            </div>
            <h1 className="pay-title">
              Workshop <em>Payments</em>
            </h1>
            <h1 className="pay-print-title">Workshop 2026 — Payment Report</h1>
            <p className="pay-subtitle">
              Verified participant payments with totals by Photography and
              Cinematography categories.
            </p>
          </div>
          <div className="pay-header-actions">
            <button
              type="button"
              className="pay-refresh-btn"
              onClick={fetchData}
              disabled={isLoading}
            >
              <RiRefreshLine size={13} className={isLoading ? "pay-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              className="pay-refresh-btn pay-print-btn"
              onClick={handlePrint}
              disabled={isLoading || sortedPaidUsers.length === 0}
            >
              <RiPrinterLine size={13} />
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="pay-stats">
        <div className="pay-print-summary">
          <span>
            <strong>Total Received:</strong> {formatBdt(summary.totalReceived)}
          </span>
          <span>
            <strong>Paid Records:</strong> {paidUsers.length}
          </span>
          <span>
            <strong>Photography:</strong> {summary.photography.count} participant
            {summary.photography.count === 1 ? "" : "s"} ·{" "}
            {formatBdt(summary.photography.amount)}
          </span>
          <span>
            <strong>Cinematography:</strong> {summary.cinematography.count}{" "}
            participant{summary.cinematography.count === 1 ? "" : "s"} ·{" "}
            {formatBdt(summary.cinematography.amount)}
          </span>
          <span>
            <strong>Printed:</strong> {printedAt}
          </span>
        </div>
        <StatCard
          label="Total Received"
          value={formatBdt(summary.totalReceived)}
          helper={`${paidUsers.length} verified payment${paidUsers.length === 1 ? "" : "s"}`}
          icon={Wallet}
          iconColor="#4ADE80"
          variant="total"
          delay={0}
        />
        <StatCard
          label="Photography"
          value={summary.photography.count}
          helper={`${formatBdt(summary.photography.amount)} received`}
          icon={Camera}
          iconColor="#60A5FA"
          variant="photo"
          delay={0.06}
        />
        <StatCard
          label="Cinematography"
          value={summary.cinematography.count}
          helper={`${formatBdt(summary.cinematography.amount)} received`}
          icon={Clapperboard}
          iconColor="#FBBF24"
          variant="cinema"
          delay={0.12}
        />
        <StatCard
          label="Paid Records"
          value={paidUsers.length}
          helper="Shown in payment list below"
          icon={MdOutlinePayments}
          iconColor={C.orange}
          delay={0.18}
        />
      </div>

      <div className="pay-table-card">
        <div className="pay-table-head">
          <div>
            <h2 className="pay-table-title">
              Verified <em>Payments</em>
            </h2>
            <p className="pay-table-sub">
              Participant ID, transaction ID, and paid amount
            </p>
          </div>
          <span className="pay-count-badge">
            {isLoading ? "Syncing…" : `${sortedPaidUsers.length} Paid`}
          </span>
        </div>

        {error && (
          <div className="pay-state-box">
            <AlertCircle size={28} color="#F87171" />
            <span className="pay-state-label">{error}</span>
          </div>
        )}

        {!error && isLoading && (
          <div className="pay-state-box">
            <RiRefreshLine size={24} className="pay-spin" />
            <span className="pay-state-label">Loading payments…</span>
          </div>
        )}

        {!error && !isLoading && sortedPaidUsers.length === 0 && (
          <div className="pay-state-box">
            <span className="pay-state-label">No verified payments yet</span>
          </div>
        )}

        {!error && !isLoading && sortedPaidUsers.length > 0 && (
          <div className="pay-table-wrap">
            <table className="pay-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participant ID</th>
                  <th>Transaction ID</th>
                  <th>Paid Amount</th>
                </tr>
              </thead>
              <tbody>
                {sortedPaidUsers.map((user, idx) => (
                    <motion.tr
                      key={user._id || getParticipantId(user) || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                    >
                      <td>{idx + 1}</td>
                      <td>
                        <span className="pay-mono">{getParticipantId(user)}</span>
                      </td>
                      <td>
                        <span className="pay-mono">{getTransactionId(user)}</span>
                      </td>
                      <td>
                        <span className="pay-amount">
                          {formatBdt(getPaidAmount(user))}
                        </span>
                      </td>
                    </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
