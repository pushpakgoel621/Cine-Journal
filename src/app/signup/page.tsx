"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signup,
    null
  );

  return (
    <div className="auth-container">
      <div className="auth-bg-animation" />
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">🎬 CineJournal</h1>
          <p className="auth-subtitle">Start your cinematic journey</p>
        </div>

        <form action={action} className="auth-form">
          {state?.error && (
            <div className="auth-error" role="alert">
              {state.error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              placeholder="Your name"
              required
              autoComplete="name"
            />
            {state?.fieldErrors?.displayName && (
              <span className="field-error">
                {state.fieldErrors.displayName[0]}
              </span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
            {state?.fieldErrors?.email && (
              <span className="field-error">{state.fieldErrors.email[0]}</span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
            {state?.fieldErrors?.password && (
              <div className="field-error-list">
                {state.fieldErrors.password.map((err) => (
                  <span className="field-error" key={err}>
                    {err}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={pending}
          >
            {pending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form action="/api/auth/signin/google" method="GET">
          <button type="submit" className="auth-oauth-btn" disabled={pending}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
