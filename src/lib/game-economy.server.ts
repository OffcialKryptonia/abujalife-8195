/**
 * Server-only Game Money economy boundary.
 *
 * Phase 2A establishes this as the authoritative application boundary for
 * Game Money mutations. Existing gameplay still uses legacy players.cash/bank
 * until the later migration phases explicitly move each action across.
 *
 * Never import this module into browser code. Credits/debits are performed
 * through the service-role RPCs, which enforce the wallet/ledger invariants.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { creditGameMoney, debitGameMoney } from "@/lib/game-money";

export async function getAuthoritativeGameMoney(userId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("get_or_create_game_wallet", { _user: userId });
  if (error) throw error;
  return Number((data as { balance?: number | string } | null)?.balance ?? 0);
}

export async function creditAuthoritativeGameMoney(
  userId: string,
  amount: number,
  type: string,
  reference?: string,
  description?: string,
  metadata: Record<string, unknown> = {},
) {
  return creditGameMoney(supabaseAdmin, userId, amount, type, reference, description, metadata);
}

export async function debitAuthoritativeGameMoney(
  userId: string,
  amount: number,
  type: string,
  reference?: string,
  description?: string,
  metadata: Record<string, unknown> = {},
) {
  return debitGameMoney(supabaseAdmin, userId, amount, type, reference, description, metadata);
}

/**
 * Explicit migration guard for later phases.
 * Keeps accidental legacy-balance writes out of new Game Money code.
 */
export const GAME_MONEY_MIGRATION = {
  canonicalTables: ["game_wallets", "game_money_ledger", "game_money_transfers"] as const,
  legacyFields: ["cash", "bank", "usd_cash", "usd_bank"] as const,
  legacyFieldsAreAuthoritative: false,
} as const;
