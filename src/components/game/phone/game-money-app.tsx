import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Clock3, Coins, Send, ShieldCheck, WalletCards } from "lucide-react";
import { Avatar } from "@/components/game/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getGameMoneyBalance, getGameMoneyLedger, transferGameMoney } from "@/lib/game-money";
import { useMe, useProfiles } from "@/hooks/use-player";
import { cn } from "@/lib/utils";

type Screen = "wallet" | "send" | "activity" | "add";
const formatGM = (value: number) => `GM ${value.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
const formatDate = (value: string) => new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
const labelForType = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function GameMoneyApp() {
  const me = useMe();
  const queryClient = useQueryClient();
  const [screen, setScreen] = useState<Screen>("wallet");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [transferReference, setTransferReference] = useState<string | null>(null);
  const amountValue = Number(amount);
  const balanceQuery = useQuery({
    queryKey: ["game-money-balance", me.user_id],
    queryFn: getGameMoneyBalance,
    refetchInterval: 20_000,
  });
  const ledgerQuery = useQuery({
    queryKey: ["game-money-ledger", me.user_id],
    queryFn: () => getGameMoneyLedger(40),
  });
  const profilesQuery = useProfiles();
  const friendsQuery = useQuery({
    queryKey: ["accepted-friends", me.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("requester_id, recipient_id")
        .eq("status", "accepted")
        .or(`requester_id.eq.${me.user_id},recipient_id.eq.${me.user_id}`);
      if (error) throw error;
      return data.map((row) => row.requester_id === me.user_id ? row.recipient_id : row.requester_id);
    },
  });
  const productsQuery = useQuery({
    queryKey: ["game-money-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_currency_products")
        .select("id, name, game_money, price_ngn")
        .eq("active", true)
        .order("price_ngn", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: screen === "add",
  });
  const friends = (profilesQuery.data ?? []).filter((profile) => friendsQuery.data?.includes(profile.user_id));
  const selectedFriend = friends.find((friend) => friend.user_id === recipient);
  const transferMutation = useMutation({
    mutationFn: () => {
      const reference = transferReference ?? crypto.randomUUID();
      setTransferReference(reference);
      return transferGameMoney(recipient, amountValue, reference);
    },
    onSuccess: async (result) => {
      setTransferReference(null);
      setAmount("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["game-money-balance", me.user_id] }),
        queryClient.invalidateQueries({ queryKey: ["game-money-ledger", me.user_id] }),
      ]);
      toast.success(result.duplicate ? "Transfer already completed" : "Game Money sent");
      setScreen("wallet");
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Transfer could not be completed."),
  });
  const canSend = Boolean(recipient) && amountValue > 0 && amountValue <= (balanceQuery.data ?? 0) && !transferMutation.isPending;

  return (
    <div className="pb-5">
      <section className="m-3 overflow-hidden rounded-xl bg-surface-gradient p-4 text-surface-foreground shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gold"><Coins className="size-3.5" /> GAME MONEY</p>
            <p className="mt-2 font-display text-3xl font-bold tabular-nums">
              {balanceQuery.isPending ? "—" : formatGM(balanceQuery.data ?? 0)}
            </p>
            <p className="mt-1 text-xs text-surface-foreground/70">One balance for your AbujaLife activities</p>
          </div>
          <WalletCards className="size-8 text-gold" />
        </div>
        {balanceQuery.isError && <p role="alert" className="mt-3 text-xs text-destructive-foreground">Your balance could not be loaded. Try again shortly.</p>}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button size="sm" variant="secondary" onClick={() => setScreen("send")}><Send className="size-3.5" />Send</Button>
          <Button size="sm" variant="secondary" onClick={() => setScreen("activity")}>Activity</Button>
          <Button size="sm" variant="secondary" onClick={() => setScreen("add")}>Add money</Button>
        </div>
      </section>

      <nav aria-label="Game Money sections" className="mx-3 grid grid-cols-4 border-b">
        {([
          ["wallet", "Wallet"], ["send", "Send"], ["activity", "History"], ["add", "Add money"],
        ] as const).map(([id, title]) => (
          <button key={id} className={cn("border-b-2 px-1 py-2.5 text-xs font-semibold transition-colors", screen === id ? "border-gold text-foreground" : "border-transparent text-muted-foreground")} onClick={() => setScreen(id)}>
            {title}
          </button>
        ))}
      </nav>

      {screen === "wallet" && (
        <section className="px-4 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent activity</h3>
            <button className="text-xs font-semibold text-primary" onClick={() => setScreen("activity")}>See all</button>
          </div>
          <LedgerList entries={(ledgerQuery.data ?? []).slice(0, 5)} loading={ledgerQuery.isPending} error={ledgerQuery.isError} />
        </section>
      )}

      {screen === "activity" && (
        <section className="px-4 pt-4">
          <h3 className="mb-3 text-sm font-semibold">Game Money history</h3>
          <LedgerList entries={ledgerQuery.data ?? []} loading={ledgerQuery.isPending} error={ledgerQuery.isError} />
        </section>
      )}

      {screen === "send" && (
        <section className="space-y-4 px-4 pt-4">
          <div>
            <h3 className="text-sm font-semibold">Send Game Money</h3>
            <p className="mt-1 text-xs text-muted-foreground">Transfers are instant, player-to-player Game Money only.</p>
          </div>
          {friendsQuery.isPending ? <p className="text-sm text-muted-foreground">Loading your friends…</p> : friends.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm font-semibold">No friends to send to yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add a friend in People before sending Game Money.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="gm-recipient" className="text-xs font-semibold">Recipient</label>
              <select id="gm-recipient" value={recipient} onChange={(event) => { setRecipient(event.target.value); setTransferReference(null); }} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">Choose a friend</option>
                {friends.map((friend) => <option key={friend.user_id} value={friend.user_id}>{friend.name}</option>)}
              </select>
              {selectedFriend && <div className="flex items-center gap-2 rounded-lg bg-muted p-2"><Avatar name={selectedFriend.name} skin={selectedFriend.skin} size={32} /><span className="text-sm font-semibold">{selectedFriend.name}</span></div>}
              <label htmlFor="gm-amount" className="block text-xs font-semibold">Amount</label>
              <Input id="gm-amount" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="Enter Game Money" value={amount} onChange={(event) => { setAmount(event.target.value); setTransferReference(null); }} />
              <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Available</span><span className="font-semibold text-foreground">{formatGM(balanceQuery.data ?? 0)}</span></div>
              <Button className="w-full" disabled={!canSend} onClick={() => transferMutation.mutate()}>
                <Send className="size-4" />{transferMutation.isPending ? "Sending…" : `Send ${amountValue > 0 ? formatGM(amountValue) : "Game Money"}`}
              </Button>
            </div>
          )}
        </section>
      )}

      {screen === "add" && (
        <section className="space-y-3 px-4 pt-4">
          <div>
            <h3 className="text-sm font-semibold">Add Game Money</h3>
            <p className="mt-1 text-xs text-muted-foreground">Real Money is paid in NGN; it is never a player wallet and cannot be transferred.</p>
          </div>
          {productsQuery.isPending && <p className="text-sm text-muted-foreground">Loading available bundles…</p>}
          {productsQuery.isError && <p role="alert" className="text-sm text-destructive">Bundles are temporarily unavailable.</p>}
          {(productsQuery.data ?? []).map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-3 border-b py-3">
              <div><p className="text-sm font-semibold">{product.name}</p><p className="text-xs text-muted-foreground">{formatGM(product.game_money)}</p></div>
              <div className="text-right"><p className="text-sm font-bold">₦{Number(product.price_ngn).toLocaleString("en-NG")}</p><span className="text-[10px] text-muted-foreground">Real Money · NGN</span></div>
            </div>
          ))}
          {productsQuery.data?.length === 0 && !productsQuery.isPending && <p className="text-sm text-muted-foreground">No bundles are available right now.</p>}
          <div className="rounded-lg border border-gold/30 bg-gold/10 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-gold" />Payments are not available yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Korapay and PocketFi checkout have not been connected. No payment will be taken here.</p>
          </div>
        </section>
      )}
    </div>
  );
}

function LedgerList({ entries, loading, error }: { entries: Awaited<ReturnType<typeof getGameMoneyLedger>>; loading: boolean; error: boolean }) {
  if (loading) return <p className="py-5 text-center text-sm text-muted-foreground">Loading activity…</p>;
  if (error) return <p role="alert" className="py-5 text-center text-sm text-destructive">Activity could not be loaded.</p>;
  if (entries.length === 0) return <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">Your Game Money activity will appear here.</p>;
  return (
    <ul>
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center gap-3 border-b py-3 last:border-0">
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", entry.amount >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
            {entry.amount >= 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{entry.description || labelForType(entry.type)}</p>
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 className="size-3" />{formatDate(entry.created_at)}</p>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-bold tabular-nums", entry.amount >= 0 ? "text-success" : "text-destructive")}>{entry.amount > 0 ? "+" : "−"}{formatGM(Math.abs(entry.amount))}</p>
            <p className="text-[10px] text-muted-foreground">Balance {formatGM(entry.balance_after)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}