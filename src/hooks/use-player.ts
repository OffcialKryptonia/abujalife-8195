import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { performAction } from "@/lib/game.functions";
import type { GameAction } from "@/game/rules";

export const playerQueryKey = ["player"] as const;

export function usePlayer() {
  return useQuery({
    queryKey: playerQueryKey,
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data, error } = await supabase.from("players").select("*").eq("user_id", u.user.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

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

export function useGameAction() {
  const qc = useQueryClient();
  const fn = useServerFn(performAction);
  return useMutation({
    mutationFn: (action: GameAction) => fn({ data: action }),
    onSuccess: (res) => {
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
      qc.invalidateQueries({ queryKey: playerQueryKey });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => toast.error("Network issue. Try again."),
  });
}
