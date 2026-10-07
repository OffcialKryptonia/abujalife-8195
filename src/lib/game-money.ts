/**
 * Game Money service.
 *
 * Game Money (public.game_wallets + public.game_money_ledger) is the single canonical
 * in-game currency. players.cash / players.bank / usd_* are TRANSITIONAL legacy fields
 * kept only so existing saves keep working until Phase 2 migrates gameplay onto Game Money.
 *
 * Real Money (Korapay/PocketFi fiat) only ever buys Game Money via trusted server paths.
 * Player-to-player transfers move Game Money only.
 *
 * Credits/debits are service-role only (granting money from the client would be a cheat);
 * use them from server functions via the admin client, never from browser code.
 */
import { supabase } from "@/integrations/supabase/client";

export type LedgerEntry = {
  id: string; amount: number; balance_before: number; balance_after: number;
  type: string; reference: string | null; description: string | null; created_at: string;
};

export async function getGameMoneyBalance(): Promise<number> {
  const { data, error } = await supabase.rpc("get_or_create_game_wallet", {});
  if (error) throw error;
  return Number((data as { balance: number | string } | null)?.balance ?? 0);
}

export async function getGameMoneyLedger(limit = 50): Promise<LedgerEntry[]> {
  const { data, error } = await supabase
    .from("game_money_ledger")
    .select("id, amount, balance_before, balance_after, type, reference, description, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, amount: Number(r.amount), balance_before: Number(r.balance_before), balance_after: Number(r.balance_after) }));
}

/** Sends Game Money from the signed-in player. Pass a stable reference to make retries safe. */
export async function transferGameMoney(recipientId: string, amount: number, reference?: string) {
  if (!(amount > 0)) throw new Error("Amount must be positive");
  const { data, error } = await supabase.rpc("transfer_game_money", {
    _recipient: recipientId, _amount: amount, _reference: reference ?? crypto.randomUUID(),
  });
  if (error) throw error;
  return data as { ok: boolean; duplicate: boolean; transfer_id: string; balance?: number };
}

type AdminClient = typeof supabase;
/** Server-only: call with the service-role client after verifying the caller. */
export async function creditGameMoney(admin: AdminClient, userId: string, amount: number, type: string, reference?: string, description?: string, metadata: Record<string, unknown> = {}) {
  const { data, error } = await admin.rpc("credit_game_money", { _user: userId, _amount: amount, _type: type, _reference: reference, _description: description, _metadata: metadata as never });
  if (error) throw error;
  return data;
}
export async function debitGameMoney(admin: AdminClient, userId: string, amount: number, type: string, reference?: string, description?: string, metadata: Record<string, unknown> = {}) {
  const { data, error } = await admin.rpc("debit_game_money", { _user: userId, _amount: amount, _type: type, _reference: reference, _description: description, _metadata: metadata as never });
  if (error) throw error;
  return data;
}
