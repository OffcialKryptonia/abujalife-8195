import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { performAction } from "@/lib/game.functions";
import type { FurnitureRow, GameAction } from "@/game/rules";
import type { Database } from "@/integrations/supabase/types";
import { click } from "@/lib/sound";

export const playerQueryKey = ["player"] as const;
type Row = Database["public"]["Tables"]["players"]["Row"];
export type Player = Omit<Row, "furniture" | "vehicles"> & { furniture: FurnitureRow[]; vehicles: string[] };

export function usePlayer() {
  return useQuery({
    queryKey: playerQueryKey,
    queryFn: async (): Promise<Player | null> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase.from("players").select("*").eq("user_id", u.user.id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return { ...data, furniture: (data.furniture as unknown as FurnitureRow[]) ?? [], vehicles: (data.vehicles as unknown as string[]) ?? [] };
    },
  });
}

/** Always-loaded player inside the /play layout. */
export const useMe = () => usePlayer().data!;

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data;
    },
  });
}

export type PublicProfile = Database["public"]["Functions"]["get_public_profiles"]["Returns"][number];

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_profiles");
      if (error) throw error;
      return data as PublicProfile[];
    },
  });
}

export const isOnline = (p: { updated_at: string }) => Date.now() - new Date(p.updated_at).getTime() < 20 * 60_000;

export function useGameAction() {
  const qc = useQueryClient();
  const fn = useServerFn(performAction);
  return useMutation({
    mutationFn: (action: GameAction) => fn({ data: action }),
    onSuccess: (res) => {
      if (res.ok) { toast.success(res.message); click("ok"); }
      else { toast.error(res.message); click("err"); }
      qc.invalidateQueries({ queryKey: playerQueryKey });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => toast.error("Network issue. Try again."),
  });
}
