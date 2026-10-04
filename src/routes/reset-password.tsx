import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — AbujaLife" },
      { name: "description", content: "Choose a new password for your AbujaLife account." },
      { property: "og:title", content: "Set new password — AbujaLife" },
      { property: "og:description", content: "Choose a new password for your AbujaLife account." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/play" });
  }
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-5 shadow-card">
        <h1 className="text-2xl font-semibold">New password</h1>
        <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <Button className="w-full" disabled={busy}>Update password</Button>
      </form>
    </main>
  );
}
