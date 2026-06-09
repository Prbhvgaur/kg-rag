import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

type AuthMode = "sign-in" | "sign-up";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signInWithGoogle, signOut, signUp, loading, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const redirectTo = useMemo(
    () => (location.state as { from?: string } | null)?.from || "/app/upload",
    [location.state]
  );

  useEffect(() => {
    if (!loading && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [loading, navigate, redirectTo, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);

    try {
      if (mode === "sign-in") {
        await signIn(email, password);
        toast.success("Signed in successfully.");
        navigate(redirectTo, { replace: true });
      } else {
        const result = await signUp(email, password);
        toast.success(
          result.needsEmailVerification
            ? "Account created. Check your email to confirm your sign-up."
            : "Account created and signed in."
        );
        if (!result.needsEmailVerification) {
          navigate(redirectTo, { replace: true });
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleAuth() {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="overflow-hidden border-sand-300 bg-sand-900 text-sand-50">
        <CardContent className="space-y-6 p-8">
          <div className="text-xs uppercase tracking-[0.35em] text-sand-400">Protected workspace</div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">
              Sign in to secure ingestion, graph access, and grounded queries.
            </h1>
            <p className="max-w-xl text-base leading-7 text-sand-300">
              Authentication gates every API route now, so only signed-in users can upload files,
              query the corpus, or inspect the knowledge graph.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-sand-700 bg-sand-800/80 p-4 text-sm text-sand-300">
              Protected ingestion endpoints
            </div>
            <div className="rounded-2xl border border-sand-700 bg-sand-800/80 p-4 text-sm text-sand-300">
              Supabase email/password auth
            </div>
            <div className="rounded-2xl border border-sand-700 bg-sand-800/80 p-4 text-sm text-sand-300">
              Bearer token verification on the backend
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 rounded-2xl border border-sand-200 bg-sand-100 p-1">
            <button
              type="button"
              onClick={() => setMode("sign-in")}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                mode === "sign-in" ? "bg-white text-sand-900 shadow-sm" : "text-sand-600"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("sign-up")}
              className={`rounded-xl px-4 py-2 text-sm transition ${
                mode === "sign-up" ? "bg-white text-sand-900 shadow-sm" : "text-sand-600"
              }`}
            >
              Sign Up
            </button>
          </div>
          <CardTitle>{mode === "sign-in" ? "Welcome back" : "Create your workspace account"}</CardTitle>
          <CardDescription>
            {isConfigured
              ? "Use your Supabase-backed account to enter the KG-RAG workspace."
              : "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before using authentication."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Button
              type="button"
              disabled={busy || !isConfigured}
              onClick={handleGoogleAuth}
              variant="secondary"
              className="w-full justify-center gap-3 py-3 text-base"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-sand-900">
                G
              </span>
              Continue with Google
            </Button>
            <p className="text-center text-xs text-sand-500">
              Google OAuth must be enabled in the Supabase dashboard Auth providers settings.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-sand-400">
            <div className="h-px flex-1 bg-sand-200" />
            <span>Email</span>
            <div className="h-px flex-1 bg-sand-200" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-700" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                disabled={busy || !isConfigured}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-sand-700" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                disabled={busy || !isConfigured}
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={busy || !isConfigured}
              className="w-full justify-center py-3 text-base"
            >
              {busy
                ? "Working..."
                : mode === "sign-in"
                  ? "Enter Workspace"
                  : "Create Account"}
            </Button>
          </form>

          {user ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Signed in as <strong>{user.email}</strong>.
              <div className="mt-3">
                <Button variant="secondary" onClick={() => signOut().then(() => toast.success("Signed out."))}>
                  Sign Out
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
