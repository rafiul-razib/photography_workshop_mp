"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

export default function AdminLoginForm({ callbackUrl }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    const normalizedEmail = email.trim();

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.ok || result?.error) {
        setError("Invalid admin email or password.");
        return;
      }

      router.push(result.url || callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Admin login request failed:", err);
      setError("Could not sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="admin-form-head">
        <span className="admin-form-icon">
          <img src="/favicon.ico" alt="" className="admin-form-icon-img" />
        </span>
        <p className="admin-eyebrow">Admin Access</p>
        <h1 className="admin-form-title">Welcome Back</h1>
        <p className="admin-form-copy">
          Sign in to manage registrations and dashboard data.
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="admin-label">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            required
            className="admin-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="admin-label">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            autoComplete="current-password"
            required
            className="admin-input"
          />
        </div>
      </div>

      {error && (
        <p className="admin-error">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="admin-submit"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </Button>

      <Link href="/" className="admin-return-link">
        <ArrowLeft size={14} />
        Return to Registration
      </Link>
    </form>
  );
}
