import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="landing">
      <div className="auth-bg-animation" />
      <div className="landing-content">
        <h1 className="landing-title">
          <span className="landing-icon">🎬</span>
          CineJournal
        </h1>
        <p className="landing-tagline">
          Your personal movie diary. Track what you watch, how you feel, and
          relive every cinematic moment.
        </p>
        <div className="landing-actions">
          <Link href="/login" className="btn btn-primary">
            Sign In
          </Link>
          <Link href="/signup" className="btn btn-secondary">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
