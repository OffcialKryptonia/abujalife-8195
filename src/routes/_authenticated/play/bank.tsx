import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGameAction, usePlayer, useTransactions } from "@/hooks/use-player";
import { PageTitle, Panel } from "@/components/game/ui";
import { formatNaira } from "@/game/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/play/bank")({
  head: () => ({ meta: [{ title: "Bank — AbujaLife" }, { name: "description", content: "Manage your naira and transactions." }, { property: "og:title", content: "Bank — AbujaLife" }, { property: "og:description", content: "Manage your naira." }] }),
  component: BankScreen,
});

function BankScreen() {
  const p = usePlayer().data!;
  const tx = useTransactions();
  const act = useGameAction();
  const [amt, setAmt] = useState("");
  const n = Math.floor(Number(amt));

  return (
    <div className="space-y-4">
      <PageTitle eyebrow="Finance" title="Abuja Trust Bank" />
      <Panel className="border-0 bg-surface-gradient text-surface-foreground">
        <p className="text-sm text-surface-foreground/60">Savings balance</p>
        <p className="font-display text-3xl font-semibold">{formatNaira(p.bank)}</p>
        <p className="mt-1 text-sm text-surface-foreground/60">Cash on hand: {formatNaira(p.cash)}</p>
      </Panel>
      <Panel>
        <Input inputMode="numeric" placeholder="Amount in ₦" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button disabled={act.isPending || !n} onClick={() => act.mutate({ type: "deposit", amount: n }, { onSuccess: () => setAmt("") })}>Deposit</Button>
          <Button variant="secondary" disabled={act.isPending || !n} onClick={() => act.mutate({ type: "withdraw", amount: n }, { onSuccess: () => setAmt("") })}>Withdraw</Button>
        </div>
      </Panel>
      <Panel>
        <h2 className="mb-2 font-semibold">Recent activity</h2>
        {tx.isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <ul className="divide-y text-sm">
            {tx.data?.map((t) => (
              <li key={t.id} className="flex justify-between py-2">
                <span>{t.label}</span>
                <span className={cn("font-medium", t.kind === "bank" ? "text-muted-foreground" : t.amount >= 0 ? "text-success" : "text-destructive")}>
                  {t.amount >= 0 ? "+" : "−"}{formatNaira(Math.abs(t.amount))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
