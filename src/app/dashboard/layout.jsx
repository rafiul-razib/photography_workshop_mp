"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { FaRegCalendarCheck, FaUsers } from "react-icons/fa";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";
import { RiSecurePaymentLine } from "react-icons/ri";

/* ── shared palette ── */
const C = {
  navy: "#0B1628",
  navy2: "#0E1D35",
  navy3: "#071020",
  orange: "#F07A10",
  orangeD: "#C8600A",
  white: "#FFFFFF",
  paper: "#F5EDD6",
  gray: "#7A8A9A",
  mist: "#4A5A6A",
  film: "#060E1A",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .db-root {
    min-height: 100vh;
    background: ${C.navy3};
    font-family: 'DM Sans', sans-serif;
    color: ${C.white};
    position: relative;
  }
  /* grain */
  .db-root::before {
    content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.03;
  }

  /* ── layout shell ── */
  .db-shell { display: flex; min-height: 100vh; position: relative; z-index: 1; }

  /* ── SIDEBAR ── */
  .db-aside {
    display: none;
    flex-direction: column;
    width: 256px;
    flex-shrink: 0;
  }
  @media (min-width: 1024px) { .db-aside { display: flex; } }

  .db-sidebar {
    position: sticky; top: 0; height: 100vh;
    width: 256px;
    background: ${C.navy};
    border-right: 1px solid rgba(240,122,16,0.13);
    display: flex; flex-direction: column;
    overflow: hidden;
  }

  /* film-strip texture on the right edge */
  .db-sidebar::after {
    content: '';
    position: absolute; top: 0; right: 0; bottom: 0; width: 5px;
    background: repeating-linear-gradient(
      to bottom,
      ${C.film}           0px,  ${C.film}           5px,
      rgba(240,122,16,0.18) 5px,  rgba(240,122,16,0.18) 7px,
      ${C.film}           7px,  ${C.film}           13px
    );
  }

  /* bokeh inside sidebar (decorative) */
  .db-sidebar-bokeh-a {
    position: absolute; top: -50px; left: -30px;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(240,100,0,0.2) 0%, transparent 70%);
    pointer-events: none;
  }
  .db-sidebar-bokeh-b {
    position: absolute; bottom: 60px; right: -40px;
    width: 150px; height: 150px; border-radius: 50%;
    background: radial-gradient(circle, rgba(20,60,160,0.22) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── logo ── */
  .db-logo {
    display: flex; align-items: center; gap: 11px;
    padding: 20px 18px 16px;
    border-bottom: 1px solid rgba(240,122,16,0.1);
    text-decoration: none;
    position: relative;
  }
  /* short amber underline accent */
  .db-logo::after {
    content: '';
    position: absolute; bottom: -1px; left: 18px;
    width: 36px; height: 1px; background: ${C.orange}; opacity: 0.55;
  }
  .db-logo-icon {
    width: 40px; height: 40px; flex-shrink: 0;
    border: 1px solid rgba(240,122,16,0.38);
    border-radius: 3px;
    background: rgba(240,122,16,0.07);
    display: flex; align-items: center; justify-content: center;
    padding: 3px;
  }
  .db-logo-name {
    font-size: 15px; font-weight: 800; letter-spacing: 0.03em;
    color: ${C.white}; line-height: 1.1;
  }
  .db-logo-name b { color: ${C.orange}; font-weight: 800; }
  .db-logo-sub {
    font-size: 7px; letter-spacing: 0.22em; text-transform: uppercase;
    color: ${C.mist}; margin-top: 3px;
  }

  /* ── nav ── */
  .db-nav {
    flex: 1; padding: 14px 10px; display: flex; flex-direction: column; gap: 3px;
    overflow-y: auto;
  }
  .db-nav-section {
    font-size: 7px; letter-spacing: 0.22em; text-transform: uppercase;
    color: ${C.mist}; padding: 8px 10px 6px; margin-top: 4px;
  }
  .db-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 2px;
    text-decoration: none; font-size: 13px; font-weight: 400;
    color: rgba(170,190,215,0.65);
    border: 1px solid transparent;
    transition: color 0.16s, background 0.16s, border-color 0.16s;
    position: relative;
  }
  .db-nav-item:hover {
    color: ${C.paper};
    background: rgba(240,122,16,0.06);
    border-color: rgba(240,122,16,0.15);
  }
  .db-nav-item.active {
    color: ${C.orange};
    background: rgba(240,122,16,0.1);
    border-color: rgba(240,122,16,0.28);
    font-weight: 600;
  }
  /* left amber bar */
  .db-nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 5px; bottom: 5px;
    width: 2.5px; background: ${C.orange};
    border-radius: 0 2px 2px 0;
  }
  .db-nav-ico {
    width: 28px; height: 28px; flex-shrink: 0; border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    transition: background 0.16s, border-color 0.16s, color 0.16s;
  }
  .db-nav-item.active .db-nav-ico {
    background: rgba(240,122,16,0.15);
    border-color: rgba(240,122,16,0.38);
    color: ${C.orange};
  }

  /* ── sidebar footer ── */
  .db-sidebar-foot {
    margin: 10px 10px 14px;
    padding: 13px 14px;
    border: 1px solid rgba(240,122,16,0.14);
    border-radius: 2px;
    background: rgba(240,122,16,0.04);
    position: relative;
  }
  .db-sidebar-foot::before, .db-sidebar-foot::after {
    content: ''; position: absolute;
    width: 9px; height: 9px;
    border-color: ${C.orange}; border-style: solid; opacity: 0.38;
  }
  .db-sidebar-foot::before { top: 5px; left: 5px; border-width: 1px 0 0 1px; }
  .db-sidebar-foot::after  { bottom: 5px; right: 5px; border-width: 0 1px 1px 0; }
  .db-foot-label {
    font-size: 7px; letter-spacing: 0.2em; text-transform: uppercase;
    color: ${C.orange}; margin-bottom: 6px;
    display: flex; align-items: center; gap: 5px;
  }
  .db-foot-dot {
    width: 4px; height: 4px; border-radius: 50%; background: ${C.orange};
    animation: dbpulse 1.6s ease-in-out infinite;
  }
  @keyframes dbpulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .db-foot-text {
    font-size: 11px; color: ${C.mist}; line-height: 1.55;
  }
  .db-signout {
    width: 100%;
    margin-top: 12px;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: rgba(245,237,214,0.72);
    padding: 8px 10px;
    border-radius: 2px;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .db-signout:hover {
    background: rgba(240,122,16,0.08);
    border-color: rgba(240,122,16,0.22);
    color: ${C.paper};
  }

  /* ── MOBILE HEADER ── */
  .db-mobile-header {
    display: block;
    position: sticky; top: 0; z-index: 20;
    background: rgba(7,16,32,0.88);
    border-bottom: 1px solid rgba(240,122,16,0.12);
    padding: 11px 16px;
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  @media (min-width: 1024px) { .db-mobile-header { display: none; } }

  .db-mob-top {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .db-mob-brand {
    display: flex; align-items: center; gap: 7px;
    text-decoration: none; font-size: 14px; font-weight: 700; color: ${C.white};
  }
  .db-mob-sub {
    font-size: 7px; letter-spacing: 0.2em; text-transform: uppercase; color: ${C.mist};
  }
  .db-mob-signout {
    display: inline-flex; align-items: center; gap: 5px;
    border: 1px solid rgba(240,122,16,0.16);
    background: rgba(240,122,16,0.04);
    color: rgba(170,190,215,0.72);
    padding: 6px 9px;
    border-radius: 2px;
    font-size: 10px;
    cursor: pointer;
  }
  .db-mob-nav {
    display: flex; gap: 5px; overflow-x: auto; padding-bottom: 2px;
  }
  .db-mob-nav::-webkit-scrollbar { display: none; }
  .db-mob-pill {
    display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
    padding: 6px 11px; border-radius: 2px; font-size: 11px; font-weight: 400;
    text-decoration: none; white-space: nowrap;
    color: rgba(170,190,215,0.6);
    border: 1px solid rgba(240,122,16,0.14);
    background: rgba(240,122,16,0.04);
    transition: color 0.15s, background 0.15s, border-color 0.15s;
  }
  .db-mob-pill.active {
    background: rgba(240,122,16,0.12);
    border-color: rgba(240,122,16,0.38);
    color: ${C.orange}; font-weight: 600;
  }

  /* ── content ── */
  .db-content {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
  }
  .db-main {
    flex: 1;
    padding: 28px 20px;
  }
  @media (min-width: 640px)  { .db-main { padding: 32px 28px; } }
  @media (min-width: 1024px) { .db-main { padding: 36px 36px; } }

  @media print {
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    .db-root {
      background: #fff !important;
      color: #000 !important;
    }
    .db-root::before,
    .db-aside,
    .db-mobile-header {
      display: none !important;
    }
    .db-shell,
    .db-content,
    .db-main {
      display: block !important;
      min-height: auto !important;
      background: #fff !important;
      color: #000 !important;
      padding: 0 !important;
    }
  }
`;

/* ── Aperture SVG logo ── */
function ApertureSVG({ size = 34 }) {
  const blades = [];
  const CX = size / 2,
    CY = size / 2;
  const RI = size * 0.13,
    RO = size * 0.42;
  for (let i = 0; i < 6; i++) {
    const a1 = (i * 60 - 90) * (Math.PI / 180);
    const a2 = (i * 60 - 90 + 52) * (Math.PI / 180);
    const pt = (a, r) => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
    const [x1, y1] = pt(a1, RI),
      [x2, y2] = pt(a1, RO);
    const [x3, y3] = pt(a2, RO),
      [x4, y4] = pt(a2, RI);
    blades.push(
      <path
        key={i}
        fill={C.orange}
        opacity={0.9 - i * 0.04}
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
        strokeWidth="0.5"
        opacity="0.4"
      />
      {blades}
      <circle cx={CX} cy={CY} r={size * 0.16} fill={C.navy3} />
      <circle cx={CX} cy={CY} r={size * 0.08} fill={C.orange} opacity="0.3" />
    </svg>
  );
}

const navItems = [
  { label: "Participants", href: "/dashboard/allUsers", Icon: FaUsers },
  { label: "Registration", href: "/", Icon: FaRegCalendarCheck },
  { label: "Payments", href: "/dashboard/payments", Icon: RiSecurePaymentLine },
  { label: "Admin", href: "/admin", Icon: HiOutlineCog6Tooth },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminSession = async () => {
      const session = await getSession();

      if (!isMounted) return;

      if (session?.user?.role === "admin") {
        setIsAuthorized(true);
        setIsCheckingAuth(false);
        return;
      }

      const callbackUrl = encodeURIComponent(pathname || "/dashboard/allUsers");
      router.replace(`/admin?callbackUrl=${callbackUrl}`);
    };

    verifyAdminSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (isCheckingAuth || !isAuthorized) {
    return (
      <div className="db-root">
        <style dangerouslySetInnerHTML={{ __html: css }} />
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.gray,
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "0.72rem",
          }}
        >
          Checking admin access...
        </div>
      </div>
    );
  }

  return (
    <div className="db-root">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── page-level bokeh ── */}
      <div
        style={{
          position: "fixed",
          top: -80,
          right: -80,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(20,70,180,0.2) 0%,transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: -60,
          left: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(240,100,0,0.1) 0%,transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="db-shell">
        {/* ── DESKTOP SIDEBAR ── */}
        <aside className="db-aside">
          <div className="db-sidebar">
            <div className="db-sidebar-bokeh-a" />
            <div className="db-sidebar-bokeh-b" />

            {/* Logo */}
            <Link href="/" className="db-logo">
              <div className="db-logo-icon">
                <ApertureSVG size={34} />
              </div>
              <div>
                <div className="db-logo-name">
                  FOCUS<b>CRAFT</b>
                </div>
                <div className="db-logo-sub">Workshop Dashboard</div>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="db-nav">
              <div className="db-nav-section">Menu</div>
              {navItems.map(({ label, href, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`db-nav-item${active ? " active" : ""}`}
                  >
                    <span className="db-nav-ico">
                      <Icon />
                    </span>
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer info card */}
            <div className="db-sidebar-foot">
              <div className="db-foot-label">
                <span className="db-foot-dot" />
                Photography Workshop
              </div>
              <p className="db-foot-text">
                Manage registrations, participants, and payments from one
                focused workspace.
              </p>
              <button
                type="button"
                className="db-signout"
                onClick={() => signOut({ callbackUrl: "/admin" })}
              >
                <HiOutlineArrowRightOnRectangle />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* ── RIGHT SIDE ── */}
        <div className="db-content">
          {/* ── MOBILE HEADER ── */}
          <header className="db-mobile-header">
            <div className="db-mob-top">
              <Link href="/" className="db-mob-brand">
                <ApertureSVG size={22} />
                <span>
                  FOCUS<b style={{ color: C.orange }}>CRAFT</b>
                </span>
              </Link>
              <button
                type="button"
                className="db-mob-signout"
                onClick={() => signOut({ callbackUrl: "/admin" })}
              >
                <HiOutlineArrowRightOnRectangle />
                Sign Out
              </button>
            </div>
            <nav className="db-mob-nav">
              {navItems.map(({ label, href, Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`db-mob-pill${active ? " active" : ""}`}
                  >
                    <Icon style={{ fontSize: 11 }} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </header>

          {/* ── PAGE CONTENT ── */}
          <main className="db-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
