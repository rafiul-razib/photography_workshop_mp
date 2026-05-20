import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminLoginForm from "./AdminLoginForm";

const getSafeCallbackUrl = (callbackUrl) => {
  if (typeof callbackUrl !== "string" || !callbackUrl.startsWith("/")) {
    return "/dashboard/allUsers";
  }

  if (callbackUrl.startsWith("//")) {
    return "/dashboard/allUsers";
  }

  return callbackUrl;
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .admin-root {
    --navy3:   #071020;
    --navy:    #0B1628;
    --navy2:   #0E1D35;
    --ash:     #1A2A40;
    --orange:  #F07A10;
    --white:   #FFFFFF;
    --gray:    #7A8A9A;
    --mist:    #4A6080;
    --film:    #060E1A;

    min-height: 100vh;
    background: var(--navy3);
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
    display: grid;
    place-items: center;
    padding: 3rem 1rem;
  }

  .admin-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }

  .admin-bokeh-tl {
    position: fixed;
    top: -80px;
    left: -80px;
    width: 320px;
    height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(240,100,0,0.22) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .admin-bokeh-br {
    position: fixed;
    right: -80px;
    bottom: -80px;
    width: 340px;
    height: 340px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(20,70,180,0.25) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .admin-ring-bg {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 620px;
    height: 620px;
    border-radius: 50%;
    border: 1px solid var(--orange);
    opacity: 0.04;
    pointer-events: none;
    z-index: 0;
  }

  .admin-ring-bg::before {
    content: '';
    position: absolute;
    inset: 44px;
    border-radius: 50%;
    border: 1px solid rgba(240,122,16,0.5);
  }

  .admin-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 980px;
    display: grid;
    overflow: hidden;
    background: var(--navy);
    border: 1px solid rgba(240,122,16,0.2);
    border-radius: 2px;
  }

  @media (min-width: 900px) {
    .admin-shell {
      grid-template-columns: 1fr 420px;
    }
  }

  .admin-shell::before {
    content: '';
    position: absolute;
    top: 14px;
    left: 14px;
    width: 22px;
    height: 22px;
    border-top: 1px solid rgba(240,122,16,0.6);
    border-left: 1px solid rgba(240,122,16,0.6);
    z-index: 2;
  }

  .admin-shell::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 5px;
    background: repeating-linear-gradient(
      to bottom,
      var(--film) 0px,
      var(--film) 5px,
      rgba(240,122,16,0.18) 5px,
      rgba(240,122,16,0.18) 7px,
      var(--film) 7px,
      var(--film) 13px
    );
    z-index: 2;
  }

  .admin-corner-br {
    position: absolute;
    right: 18px;
    bottom: 14px;
    width: 22px;
    height: 22px;
    border-right: 1px solid rgba(240,122,16,0.6);
    border-bottom: 1px solid rgba(240,122,16,0.6);
    z-index: 3;
  }

  .admin-card-bokeh {
    position: absolute;
    top: -40px;
    right: -40px;
    width: 210px;
    height: 210px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(240,100,0,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .admin-copy {
    position: relative;
    z-index: 1;
    padding: 3rem;
    display: none;
  }

  @media (min-width: 900px) {
    .admin-copy {
      display: block;
    }
  }

  .admin-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(240,122,16,0.55);
    color: var(--orange);
    font-size: 0.65rem;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    padding: 0.4rem 1.1rem;
    border-radius: 2px;
    background: rgba(240,122,16,0.07);
    margin-bottom: 2rem;
  }

  .admin-dot {
    width: 5px;
    height: 5px;
    background: var(--orange);
    border-radius: 50%;
    animation: adminBlink 1.4s ease-in-out infinite;
  }

  @keyframes adminBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
  }

  .admin-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.4rem, 5vw, 4.2rem);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--white);
  }

  .admin-title em {
    color: var(--orange);
    font-style: italic;
  }

  .admin-rule {
    width: 56px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--orange), transparent);
    margin: 1.5rem 0;
  }

  .admin-subtitle {
    max-width: 440px;
    color: var(--gray);
    font-size: 0.85rem;
    line-height: 1.7;
  }

  .admin-note-grid {
    display: grid;
    gap: 0.8rem;
    margin-top: 2rem;
  }

  .admin-note {
    border: 1px solid rgba(240,122,16,0.16);
    background: var(--navy2);
    color: rgba(255,255,255,0.82);
    border-radius: 2px;
    padding: 1rem;
    font-size: 0.78rem;
    line-height: 1.6;
  }

  .admin-form-wrap {
    position: relative;
    z-index: 1;
    display: grid;
    place-items: center;
    padding: 2rem;
    background: rgba(6,14,26,0.35);
    border-left: 1px solid rgba(240,122,16,0.12);
  }

  .admin-form {
    width: 100%;
    max-width: 380px;
  }

  .admin-form-icon {
    margin: 0 auto 1rem;
    display: grid;
    height: 58px;
    width: 58px;
    place-items: center;
    border: 1px solid rgba(240,122,16,0.3);
    border-radius: 50%;
    background: rgba(240,122,16,0.08);
    position: relative;
    overflow: hidden;
  }

  .admin-form-icon-img {
    width: 34px;
    height: 34px;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }

  .admin-form-head {
    text-align: center;
    margin-bottom: 2rem;
  }

  .admin-eyebrow {
    font-size: 0.62rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--orange);
  }

  .admin-form-title {
    margin-top: 0.5rem;
    font-family: 'Playfair Display', serif;
    font-size: 2.1rem;
    font-weight: 900;
    color: var(--white);
    letter-spacing: -0.02em;
  }

  .admin-form-copy {
    margin-top: 0.5rem;
    color: var(--gray);
    font-size: 0.78rem;
    line-height: 1.6;
  }

  .admin-label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--gray) !important;
    font-size: 0.62rem !important;
    letter-spacing: 0.18em !important;
    text-transform: uppercase !important;
  }

  .admin-input {
    height: 44px !important;
    background: var(--ash) !important;
    border: 1px solid rgba(240,122,16,0.18) !important;
    border-radius: 2px !important;
    color: var(--white) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.92rem !important;
  }

  .admin-input::placeholder {
    color: var(--mist) !important;
  }

  .admin-input:focus {
    border-color: var(--orange) !important;
    box-shadow: 0 0 0 3px rgba(240,122,16,0.1) !important;
  }

  .admin-error {
    margin-top: 1.25rem;
    border: 1px solid rgba(248,113,113,0.3);
    background: rgba(248,113,113,0.08);
    color: #FCA5A5;
    border-radius: 2px;
    padding: 0.85rem 1rem;
    font-size: 0.78rem;
  }

  .admin-submit {
    margin-top: 1.5rem !important;
    height: 46px !important;
    width: 100% !important;
    background: var(--orange) !important;
    border: none !important;
    border-radius: 2px !important;
    color: var(--navy3) !important;
    font-size: 0.72rem !important;
    letter-spacing: 0.22em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
    transition: opacity 0.2s, transform 0.1s !important;
  }

  .admin-submit:hover:not(:disabled) {
    opacity: 0.88;
  }

  .admin-submit:active:not(:disabled) {
    transform: scale(0.99);
  }

  .admin-submit:disabled {
    opacity: 0.45 !important;
    cursor: not-allowed !important;
  }

  .admin-return-link {
    margin-top: 0.9rem;
    display: inline-flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    border: 1px solid rgba(240,122,16,0.24);
    background: rgba(240,122,16,0.06);
    color: var(--orange);
    border-radius: 2px;
    padding: 0.82rem 1rem;
    font-size: 0.66rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    text-decoration: none;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }

  .admin-return-link:hover {
    border-color: rgba(240,122,16,0.45);
    background: rgba(240,122,16,0.12);
    color: var(--white);
  }
`;

export default async function AdminPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const callbackUrl = getSafeCallbackUrl(params?.callbackUrl);

  if (session) {
    redirect(callbackUrl);
  }

  return (
    <div className="admin-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="admin-bokeh-tl" />
      <div className="admin-bokeh-br" />
      <div className="admin-ring-bg" />

      <div className="admin-shell">
        <div className="admin-card-bokeh" />
        <span className="admin-corner-br" />

        <section className="admin-copy">
          <div className="admin-tag">
            <span className="admin-dot" />
            Secure Admin
          </div>

          <h1 className="admin-title">
            Manage Workshop
            <br />
            <em>Registrations</em>
          </h1>

          <div className="admin-rule" />

          <p className="admin-subtitle">
            Sign in with your admin credentials to review participants, payment
            status, and registration data from the protected dashboard.
          </p>

          <div className="admin-note-grid">
            <div className="admin-note">
              Verify paid participant from the admin dashboard.
            </div>
            <div className="admin-note">
              Prin ID Card from the admin dashboard.
            </div>
          </div>
        </section>

        <div className="admin-form-wrap">
          <AdminLoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
