"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import "animate.css";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Camera, Upload } from "lucide-react";

/* ─── inline styles injected once ─── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --navy3:   #071020;
    --navy:    #0B1628;
    --navy2:   #0E1D35;
    --ash:     #1A2A40;
    --orange:  #F07A10;
    --orange-d:#C8600A;
    --white:   #FFFFFF;
    --gray:    #7A8A9A;
    --mist:    #4A6080;
    --film:    #060E1A;
  }

  .pw-root {
    min-height: 100vh;
    background: var(--navy3);
    font-family: 'DM Sans', sans-serif;
    color: var(--white);
    position: relative;
    overflow-x: hidden;
  }

  /* grain */
  .pw-root::before {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.03; pointer-events: none; z-index: 0;
  }

  /* bokeh glows */
  .pw-bokeh-tl {
    position: fixed; top: -80px; left: -80px;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(240,100,0,0.22) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }
  .pw-bokeh-br {
    position: fixed; bottom: -80px; right: -80px;
    width: 340px; height: 340px; border-radius: 50%;
    background: radial-gradient(circle, rgba(20,70,180,0.25) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
  }

  /* ambient aperture ring */
  .pw-ring-bg {
    position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 620px; height: 620px; border-radius: 50%;
    border: 1px solid var(--orange); opacity: 0.04;
    pointer-events: none; z-index: 0;
  }
  .pw-ring-bg::before {
    content: ''; position: absolute; inset: 44px; border-radius: 50%;
    border: 1px solid rgba(240,122,16,0.5);
  }

  /* hero */
  .pw-hero {
    position: relative; z-index: 1;
    padding: 3rem 1rem 3.5rem;
    text-align: center;
  }
  .pw-tag {
    display: inline-flex; align-items: center; gap: 0.5rem;
    border: 1px solid rgba(240,122,16,0.55);
    color: var(--orange);
    font-size: 0.65rem; letter-spacing: 0.26em; text-transform: uppercase;
    padding: 0.4rem 1.1rem; border-radius: 2px;
    background: rgba(240,122,16,0.07);
    margin-bottom: 2rem;
  }
  .pw-dot {
    width: 5px; height: 5px; background: var(--orange);
    border-radius: 50%; animation: regblink 1.4s ease-in-out infinite;
  }
  @keyframes regblink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  .pw-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.6rem, 7vw, 5.2rem);
    font-weight: 900; line-height: 1.04; letter-spacing: -0.02em;
    color: var(--white); margin-bottom: 0.6rem;
  }
  .pw-title em { font-style: italic; color: var(--orange); }

  .pw-subtitle {
    font-size: 0.72rem; letter-spacing: 0.22em;
    text-transform: uppercase; color: var(--mist); margin-top: 1rem;
  }

  .pw-rule {
    width: 56px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--orange), transparent);
    margin: 1.5rem auto;
  }

  /* ── CARD ── */
  .pw-card {
    position: relative; z-index: 1;
    background: var(--navy) !important;
    border: 1px solid rgba(240,122,16,0.2) !important;
    border-radius: 2px !important;
    padding: 2.5rem !important;
    overflow: hidden;
  }
  @media(min-width:768px){ .pw-card { padding: 3rem !important; } }

  /* film-strip right edge */
  .pw-card::after {
    content: '';
    position: absolute; top: 0; right: 0; bottom: 0; width: 5px;
    background: repeating-linear-gradient(
      to bottom,
      var(--film) 0px, var(--film) 5px,
      rgba(240,122,16,0.18) 5px, rgba(240,122,16,0.18) 7px,
      var(--film) 7px, var(--film) 13px
    );
  }
  /* corner bracket */
  .pw-card::before {
    content: '';
    position: absolute; top: 14px; left: 14px;
    width: 22px; height: 22px;
    border-top: 1px solid rgba(240,122,16,0.6);
    border-left: 1px solid rgba(240,122,16,0.6);
  }
  .pw-corner-br {
    position: absolute; bottom: 14px; right: 18px;
    width: 22px; height: 22px;
    border-bottom: 1px solid rgba(240,122,16,0.6);
    border-right: 1px solid rgba(240,122,16,0.6);
    z-index: 2;
  }

  /* bokeh inside card */
  .pw-card-bokeh {
    position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(240,100,0,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  /* section label */
  .pw-section-label {
    display: flex; align-items: center; gap: 0.75rem;
    margin-bottom: 1.75rem;
  }
  .pw-section-num {
    font-size: 0.62rem; letter-spacing: 0.2em;
    color: var(--orange); font-weight: 600;
  }
  .pw-section-label span {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem; font-weight: 700;
    color: var(--white);
  }
  .pw-section-label::after {
    content: ''; flex: 1; height: 1px;
    background: rgba(240,122,16,0.15);
  }

  /* divider */
  .pw-divider {
    height: 1px; margin: 2rem 0;
    background: linear-gradient(90deg, var(--orange), transparent);
    opacity: 0.18;
  }

  /* form label */
  .pw-label {
    font-size: 0.62rem !important; letter-spacing: 0.18em !important;
    text-transform: uppercase !important;
    color: var(--gray) !important;
    margin-bottom: 0.5rem !important; display: block !important;
  }

  /* inputs */
  .pw-input {
    background: var(--ash) !important;
    border: 1px solid rgba(240,122,16,0.18) !important;
    border-radius: 2px !important;
    color: var(--white) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.92rem !important;
    padding: 0.65rem 0.9rem !important;
    transition: border-color 0.2s !important;
    width: 100% !important;
  }
  .pw-input::placeholder { color: var(--mist) !important; }
  .pw-input:focus {
    outline: none !important;
    border-color: var(--orange) !important;
    box-shadow: 0 0 0 3px rgba(240,122,16,0.1) !important;
  }

  /* interest toggle */
  .pw-interest-group {
    display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;
  }
  .pw-interest-btn {
    position: relative;
    padding: 1.25rem 0.5rem;
    border: 1px solid rgba(240,122,16,0.18);
    border-radius: 2px;
    background: var(--ash);
    color: var(--mist);
    cursor: pointer; text-align: center;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase;
    transition: all 0.2s;
    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  }
  .pw-interest-btn:hover { border-color: var(--orange); color: var(--white); }
  .pw-interest-btn.selected {
    border-color: var(--orange);
    background: rgba(240,122,16,0.1);
    color: var(--orange);
  }
  .pw-interest-btn.selected::after {
    content: '';
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px;
    background: var(--orange); border-radius: 50%;
  }
  .pw-interest-icon { font-size: 1.5rem; }

  /* photo upload */
  .pw-upload-zone {
    border: 1px dashed rgba(240,122,16,0.3);
    border-radius: 2px;
    background: var(--ash);
    width: 100%; height: 200px;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 0.75rem;
    cursor: pointer; transition: border-color 0.2s;
    position: relative; overflow: hidden;
  }
  .pw-upload-zone:hover { border-color: var(--orange); }
  .pw-upload-zone .pw-upload-text {
    font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase;
    color: var(--gray);
  }
  .pw-upload-zone .pw-upload-hint {
    font-size: 0.62rem; color: var(--mist);
  }
  .pw-upload-preview {
    position: absolute; inset: 0;
    object-fit: cover; width: 100%; height: 100%;
  }
  .pw-upload-overlay {
    position: absolute; inset: 0;
    background: rgba(7,16,32,0.55);
    display: flex; align-items: center; justify-content: center;
  }

  /* aperture ring */
  .pw-aperture {
    width: 56px; height: 56px; border-radius: 50%;
    border: 1.5px solid var(--orange);
    display: flex; align-items: center; justify-content: center;
    opacity: 0.7; position: relative;
  }
  .pw-aperture::before {
    content: ''; position: absolute;
    width: 36px; height: 36px; border-radius: 50%;
    border: 1px solid rgba(240,122,16,0.5);
  }

  /* fee card */
  .pw-fee-card {
    position: relative; overflow: hidden;
    border: 1px solid rgba(240,122,16,0.2);
    border-radius: 2px;
    background: var(--navy2);
    padding: 1.75rem 2rem;
    max-width: 360px; margin: 0 auto;
  }
  .pw-fee-card::before, .pw-fee-card::after {
    content: ''; position: absolute;
    width: 14px; height: 14px;
    border-color: var(--orange); border-style: solid; opacity: 0.45;
  }
  .pw-fee-card::before { top: 8px; left: 8px; border-width: 1px 0 0 1px; }
  .pw-fee-card::after  { bottom: 8px; right: 8px; border-width: 0 1px 1px 0; }
  .pw-fee-ring {
    position: absolute; top: -28px; right: -28px;
    width: 88px; height: 88px; border-radius: 50%;
    border: 1px solid var(--orange); opacity: 0.07;
    pointer-events: none;
  }
  .pw-fee-ring::before {
    content: ''; position: absolute; inset: 10px;
    border-radius: 50%; border: 1px solid rgba(240,122,16,0.5);
  }

  /* payment method badge */
  .pw-bkash-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    margin-top: 1rem;
    padding: 0.5rem 0.9rem;
    border: 1px solid rgba(226,20,108,0.4);
    background: rgba(226,20,108,0.1);
    border-radius: 2px;
    font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase;
    color: #F472B6;
  }

  /* submit */
  .pw-submit {
    width: 100%;
    background: var(--orange) !important;
    border: none !important; border-radius: 2px !important;
    color: var(--navy3) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.72rem !important; letter-spacing: 0.22em !important;
    text-transform: uppercase !important; font-weight: 600 !important;
    padding: 1rem !important; cursor: pointer;
    transition: opacity 0.2s, transform 0.1s !important;
    display: flex !important; align-items: center !important;
    justify-content: center !important; gap: 0.6rem !important;
  }
  .pw-submit:hover:not(:disabled) { opacity: 0.88; }
  .pw-submit:active:not(:disabled) { transform: scale(0.99); }
  .pw-submit:disabled { opacity: 0.35 !important; cursor: not-allowed !important; background: var(--mist) !important; }

  .space-y-6 > * + * { margin-top: 1.5rem; }
  .pw-grid-2 { display: grid; gap: 1.25rem; }
  @media(min-width:640px){ .pw-grid-2 { grid-template-columns: 1fr 1fr; } }
  .pw-error { color: #F87171; font-size: 0.7rem; margin-top: 0.35rem; }
`;

export default function Registration() {
  const form = useForm();

  const router = useRouter();
  const [preview, setPreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [interest, setInterest] = useState("");

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoError("Image is required!");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Only JPEG or PNG images are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > 500 * 1024) {
      setPhotoError("Image must be less than 500 KB.");
      e.target.value = "";
      return;
    }
    setPhotoError("");
    setLoading(true);
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "lt4vyrjl");
    formData.append("cloud_name", "datldhldb");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/datldhldb/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      setLoading(false);
      if (data.secure_url) {
        setUploadedImageUrl(data.secure_url);
        form.setValue("photo", data.secure_url);
      } else {
        setPhotoError("Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setPhotoError("Upload failed! Please try again.");
      setLoading(false);
    }
  };

  const onSubmit = (data) => {
    data.photo = uploadedImageUrl;
    data.interest = interest;
    console.log("Checkout form data:", data);
    localStorage.setItem("formData", JSON.stringify(data));
    router.push("/paymentConfirmation");
  };

  return (
    <div className="pw-root">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      {/* decorative layers */}
      <div className="pw-bokeh-tl" />
      <div className="pw-bokeh-br" />
      <div className="pw-ring-bg" />

      {/* ── HERO ── */}
      <section className="pw-hero animate__animated animate__fadeIn">
        <div className="pw-tag">
          <span className="pw-dot" />
          Registration Open
        </div>

        <h1 className="pw-title">
          Frame Your
          <br />
          <em>Vision</em>
        </h1>

        <div className="pw-rule" />

        <p className="pw-subtitle">
          Photography &amp; Cinematography Workshop · 2026
        </p>
      </section>

      {/* ── FORM ── */}
      <section
        style={{
          paddingBottom: "5rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <Card className="pw-card animate__animated animate__fadeInUp animate__delay-1s">
            {/* card decorations */}
            <div className="pw-card-bokeh" />
            <span className="pw-corner-br" />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* ── 01 PERSONAL INFO ── */}
                <div className="pw-section-label">
                  <span className="pw-section-num">01</span>
                  <span>Participant Details</span>
                </div>

                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{ required: "Full name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="pw-label">Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          className="pw-input"
                          {...field}
                          placeholder="Your full name"
                        />
                      </FormControl>
                      <FormMessage className="pw-error" />
                    </FormItem>
                  )}
                />

                <div className="pw-grid-2">
                  {/* Mobile */}
                  <FormField
                    control={form.control}
                    name="phone"
                    rules={{ required: "Mobile number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="pw-label">Mobile *</FormLabel>
                        <FormControl>
                          <Input
                            className="pw-input"
                            {...field}
                            placeholder="01XXXXXXXXX"
                          />
                        </FormControl>
                        <FormMessage className="pw-error" />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="pw-label">Email *</FormLabel>
                        <FormControl>
                          <Input
                            className="pw-input"
                            type="email"
                            {...field}
                            placeholder="you@example.com"
                          />
                        </FormControl>
                        <FormMessage className="pw-error" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── 02 INTEREST ── */}
                <div>
                  <div className="pw-divider" />
                  <div className="pw-section-label">
                    <span className="pw-section-num">02</span>
                    <span>Area of Interest</span>
                  </div>

                  <p className="pw-label" style={{ marginBottom: "0.75rem" }}>
                    I want to focus on *
                  </p>

                  <div className="pw-interest-group">
                    <button
                      type="button"
                      className={`pw-interest-btn ${interest === "Photography" ? "selected" : ""}`}
                      onClick={() => {
                        setInterest("Photography");
                        form.setValue("interest", "Photography");
                      }}
                    >
                      <span className="pw-interest-icon">📷</span>
                      Photography
                    </button>
                    <button
                      type="button"
                      className={`pw-interest-btn ${interest === "Cinematography" ? "selected" : ""}`}
                      onClick={() => {
                        setInterest("Cinematography");
                        form.setValue("interest", "Cinematography");
                      }}
                    >
                      <span className="pw-interest-icon">🎬</span>
                      Cinematography
                    </button>
                  </div>
                  {form.formState.isSubmitted && !interest && (
                    <p className="pw-error" style={{ marginTop: "0.4rem" }}>
                      Please select your area of interest
                    </p>
                  )}
                </div>

                {/* ── 03 PHOTO ── */}
                <div>
                  <div className="pw-divider" />
                  <div className="pw-section-label">
                    <span className="pw-section-num">03</span>
                    <span>Profile Photo</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="photo"
                    rules={{ required: "Photo is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="pw-label">
                          Upload Photo * &nbsp;(JPEG / PNG · max 500 KB)
                        </FormLabel>
                        <FormControl>
                          <div>
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/jpeg,image/png"
                              style={{ display: "none" }}
                              onChange={(e) => {
                                handleImageChange(e);
                                field.onChange(e.target.files?.[0]);
                              }}
                            />
                            <label
                              htmlFor="photo-upload"
                              className="pw-upload-zone"
                            >
                              {loading ? (
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "0.6rem",
                                  }}
                                >
                                  <div
                                    className="pw-aperture"
                                    style={{
                                      animation: "spin 2s linear infinite",
                                    }}
                                  />
                                  <span className="pw-upload-text">
                                    Developing…
                                  </span>
                                </div>
                              ) : uploadedImageUrl ? (
                                <>
                                  <img
                                    src={uploadedImageUrl}
                                    className="pw-upload-preview"
                                    alt="Preview"
                                  />
                                  <div className="pw-upload-overlay">
                                    <span
                                      style={{
                                        fontSize: "0.72rem",
                                        letterSpacing: "0.14em",
                                        textTransform: "uppercase",
                                        color: "var(--paper)",
                                      }}
                                    >
                                      Click to change
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="pw-aperture">
                                    <Camera size={18} color="var(--amber)" />
                                  </div>
                                  <span className="pw-upload-text">
                                    Click to upload
                                  </span>
                                  <span className="pw-upload-hint">
                                    JPEG or PNG · under 500 KB
                                  </span>
                                </>
                              )}
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage className="pw-error" />
                      </FormItem>
                    )}
                  />
                  {photoError && (
                    <p className="pw-error" style={{ marginTop: "0.4rem" }}>
                      {photoError}
                    </p>
                  )}
                </div>

                {/* ── 04 PAYMENT ── */}
                <div>
                  <div className="pw-divider" />
                  <div className="pw-section-label">
                    <span className="pw-section-num">04</span>
                    <span>Payment</span>
                  </div>

                  <div className="pw-fee-card">
                    <div className="pw-fee-ring" />

                    <p
                      style={{
                        fontSize: "0.6rem",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--orange)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Workshop Registration Fee
                    </p>

                    <div
                      style={{
                        height: 1,
                        background:
                          "linear-gradient(90deg, var(--orange) 0%, transparent 100%)",
                        marginBottom: "1.25rem",
                        opacity: 0.3,
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.72rem",
                          letterSpacing: "0.1em",
                          color: "var(--mist)",
                        }}
                      >
                        BDT
                      </span>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "3.5rem",
                          fontWeight: 900,
                          color: "var(--orange)",
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        1250
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "0.62rem",
                        letterSpacing: "0.12em",
                        color: "var(--mist)",
                        textTransform: "uppercase",
                        marginTop: "0.5rem",
                      }}
                    >
                      Per participant · One-time
                    </p>

                    <div className="pw-bkash-badge">
                      <span style={{ fontSize: "1rem" }}>📱</span>
                      Pay via bKash
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="bkashTransactionId"
                    rules={{ required: "bKash transaction ID is required" }}
                    render={({ field }) => (
                      <FormItem style={{ marginTop: "1rem" }}>
                        <FormLabel className="pw-label">
                          bKash Transaction ID *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="pw-input"
                            {...field}
                            placeholder="Enter bKash TrxID"
                          />
                        </FormControl>
                        <FormMessage className="pw-error" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* ── SUBMIT ── */}
                <Button
                  type="submit"
                  className="pw-submit"
                  disabled={loading || !uploadedImageUrl || !interest}
                >
                  Proceed to Checkout
                  <ArrowRight size={14} />
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </section>

      {/* bottom wordmark */}
      <div
        style={{
          textAlign: "center",
          paddingBottom: "2.5rem",
          position: "relative",
          zIndex: 1,
          fontSize: "0.6rem",
          letterSpacing: "0.24em",
          color: "var(--mist)",
          textTransform: "uppercase",
        }}
      >
        Photography &amp; Cinematography Workshop · 2026
      </div>
    </div>
  );
}
