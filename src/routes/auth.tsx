import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — AbujaLife" },
      { name: "description", content: "Create your AbujaLife account or sign in to continue your story." },
      { property: "og:title", content: "Sign in — AbujaLife" },
      { property: "og:description", content: "Create your account and start life in Abuja." },
    ],
  }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/play" } });
        if (error) throw error;
        if (data.session) navigate({ to: "/play" });
        else toast.success("Check your email to confirm your account.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/play" });
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        toast.success("Password reset link sent.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) { toast.error("Google sign-in failed"); return; }
    if (result.redirected) return;
    navigate({ to: "/play" });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5 text-surface-foreground">
      <div className="w-full max-w-sm animate-rise">
        <Link to="/" className="font-display text-xl font-semibold">Abuja<span className="text-gold">Life</span></Link>
        <h1 className="mt-6 text-3xl font-semibold">
          {mode === "signup" ? "Start your life" : mode === "signin" ? "Welcome back" : "Reset password"}
        </h1>
        <div className="mt-6 rounded-2xl bg-card p-5 text-card-foreground shadow-card">
          {mode !== "forgot" && (
            <>
              <Button variant="outline" className="w-full" onClick={google} type="button">Continue with Google</Button>
              <div className="my-4 text-center text-xs text-muted-foreground">or with email</div>
            </>
          )}
          <form onSubmit={submit} className="space-y-3">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            {mode !== "forgot" && (
              <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            )}
            <Button className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : "Send reset link"}
            </Button>
          </form>
          <div className="mt-4 flex justify-between text-sm">
            {mode === "signup" ? (
              <button className="text-primary" onClick={() => setMode("signin")}>I have an account</button>
            ) : (
              <button className="text-primary" onClick={() => setMode("signup")}>Create account</button>
            )}
            {mode === "signin" && <button className="text-muted-foreground" onClick={() => setMode("forgot")}>Forgot password?</button>}
          </div>
        </div>
      </div>
    </main>
  );
}
