export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      currency_settings: {
        Row: {
          id: string
          ngn_per_usd: number
          updated_at: string
        }
        Insert: {
          id: string
          ngn_per_usd?: number
          updated_at?: string
        }
        Update: {
          id?: string
          ngn_per_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      election_candidates: {
        Row: {
          campaign_fund: number
          created_at: string
          election_id: string | null
          id: string
          manifesto: string
          party: string
          status: string
          user_id: string | null
          votes: number
        }
        Insert: {
          campaign_fund?: number
          created_at?: string
          election_id?: string | null
          id?: string
          manifesto?: string
          party: string
          status?: string
          user_id?: string | null
          votes?: number
        }
        Update: {
          campaign_fund?: number
          created_at?: string
          election_id?: string | null
          id?: string
          manifesto?: string
          party?: string
          status?: string
          user_id?: string | null
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "election_candidates_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      election_votes: {
        Row: {
          candidate_id: string | null
          created_at: string
          election_id: string | null
          id: string
          voter_id: string | null
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string
          election_id?: string | null
          id?: string
          voter_id?: string | null
        }
        Update: {
          candidate_id?: string | null
          created_at?: string
          election_id?: string | null
          id?: string
          voter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "election_votes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "election_candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "elections"
            referencedColumns: ["id"]
          },
        ]
      }
      elections: {
        Row: {
          city: string
          created_at: string
          created_by: string | null
          id: string
          metadata: Json
          office_id: string
          registration_closes_at: string | null
          registration_opens_at: string | null
          status: string
          title: string
          voting_closes_at: string | null
          voting_opens_at: string | null
        }
        Insert: {
          city?: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          office_id: string
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          status?: string
          title: string
          voting_closes_at?: string | null
          voting_opens_at?: string | null
        }
        Update: {
          city?: string
          created_at?: string
          created_by?: string | null
          id?: string
          metadata?: Json
          office_id?: string
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          status?: string
          title?: string
          voting_closes_at?: string | null
          voting_opens_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_currency_products: {
        Row: {
          active: boolean
          created_at: string
          game_money: number
          id: string
          name: string
          price_ngn: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          game_money: number
          id: string
          name: string
          price_ngn: number
        }
        Update: {
          active?: boolean
          created_at?: string
          game_money?: number
          id?: string
          name?: string
          price_ngn?: number
        }
        Relationships: []
      }
      game_institutions: {
        Row: {
          city: string
          created_at: string
          district: string | null
          id: string
          metadata: Json
          name: string
          ownership: string
          short_name: string
          type: string
        }
        Insert: {
          city?: string
          created_at?: string
          district?: string | null
          id: string
          metadata?: Json
          name: string
          ownership: string
          short_name: string
          type: string
        }
        Update: {
          city?: string
          created_at?: string
          district?: string | null
          id?: string
          metadata?: Json
          name?: string
          ownership?: string
          short_name?: string
          type?: string
        }
        Relationships: []
      }
      game_money_ledger: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          metadata: Json
          reference: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          reference?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          reference?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      game_money_transfers: {
        Row: {
          amount: number
          created_at: string
          id: string
          recipient_id: string
          reference: string
          sender_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          recipient_id: string
          reference: string
          sender_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          recipient_id?: string
          reference?: string
          sender_id?: string
          status?: string
        }
        Relationships: []
      }
      game_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_chat_members: {
        Row: {
          chat_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          chat_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chat_messages: {
        Row: {
          body: string
          chat_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          chat_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          chat_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          amount_ngn: number
          created_at: string
          game_money: number
          id: string
          paid_at: string | null
          product_id: string | null
          provider: string
          provider_payload: Json
          provider_reference: string | null
          reference: string
          status: string
          user_id: string | null
        }
        Insert: {
          amount_ngn: number
          created_at?: string
          game_money: number
          id?: string
          paid_at?: string | null
          product_id?: string | null
          provider: string
          provider_payload?: Json
          provider_reference?: string | null
          reference: string
          status?: string
          user_id?: string | null
        }
        Update: {
          amount_ngn?: number
          created_at?: string
          game_money?: number
          id?: string
          paid_at?: string | null
          product_id?: string | null
          provider?: string
          provider_payload?: Json
          provider_reference?: string | null
          reference?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "game_currency_products"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          accessory: string
          background: string
          bank: number
          career_xp: number
          cash: number
          created_at: string
          district: string
          energy: number
          face: string
          furniture: Json
          game_minutes: number
          gender: string
          hair: string
          happiness: number
          has_nin: boolean
          home_id: string
          hunger: number
          hygiene: number
          invest_amount: number
          invest_start: number
          job_id: string | null
          last_challenge_day: number
          name: string
          outfit: string
          reputation: number
          shifts: number
          shoes: string
          skin: string
          social: number
          updated_at: string
          usd_bank: number
          usd_cash: number
          user_id: string
          vehicles: Json
          visits: number
          xp: number
        }
        Insert: {
          accessory?: string
          background: string
          bank?: number
          career_xp?: number
          cash?: number
          created_at?: string
          district?: string
          energy?: number
          face?: string
          furniture?: Json
          game_minutes?: number
          gender?: string
          hair?: string
          happiness?: number
          has_nin?: boolean
          home_id?: string
          hunger?: number
          hygiene?: number
          invest_amount?: number
          invest_start?: number
          job_id?: string | null
          last_challenge_day?: number
          name: string
          outfit?: string
          reputation?: number
          shifts?: number
          shoes?: string
          skin?: string
          social?: number
          updated_at?: string
          usd_bank?: number
          usd_cash?: number
          user_id: string
          vehicles?: Json
          visits?: number
          xp?: number
        }
        Update: {
          accessory?: string
          background?: string
          bank?: number
          career_xp?: number
          cash?: number
          created_at?: string
          district?: string
          energy?: number
          face?: string
          furniture?: Json
          game_minutes?: number
          gender?: string
          hair?: string
          happiness?: number
          has_nin?: boolean
          home_id?: string
          hunger?: number
          hygiene?: number
          invest_amount?: number
          invest_start?: number
          job_id?: string | null
          last_challenge_day?: number
          name?: string
          outfit?: string
          reputation?: number
          shifts?: number
          shoes?: string
          skin?: string
          social?: number
          updated_at?: string
          usd_bank?: number
          usd_cash?: number
          user_id?: string
          vehicles?: Json
          visits?: number
          xp?: number
        }
        Relationships: []
      }
      political_profiles: {
        Row: {
          manifesto: string
          office_id: string | null
          party: string | null
          political_reputation: number
          updated_at: string
          user_id: string
        }
        Insert: {
          manifesto?: string
          office_id?: string | null
          party?: string | null
          political_reputation?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          manifesto?: string
          office_id?: string | null
          party?: string | null
          political_reputation?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string
          created_at: string
          id: string
          shared_post_id: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          shared_post_id?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          shared_post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_shared_post_id_fkey"
            columns: ["shared_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reason: string
          reporter_id: string
          status: string
          target_user: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reason: string
          reporter_id: string
          status?: string
          target_user?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reason?: string
          reporter_id?: string
          status?: string
          target_user?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          kind: string
          label: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          kind: string
          label: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _apply_game_money: {
        Args: {
          _amount: number
          _description: string
          _metadata: Json
          _reference: string
          _type: string
          _user: string
        }
        Returns: Json
      }
      are_friends: { Args: { _a: string; _b: string }; Returns: boolean }
      credit_game_money: {
        Args: {
          _amount: number
          _description?: string
          _metadata?: Json
          _reference?: string
          _type: string
          _user: string
        }
        Returns: Json
      }
      debit_game_money: {
        Args: {
          _amount: number
          _description?: string
          _metadata?: Json
          _reference?: string
          _type: string
          _user: string
        }
        Returns: Json
      }
      get_or_create_game_wallet: {
        Args: { _user?: string }
        Returns: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "game_wallets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_public_profiles: {
        Args: never
        Returns: {
          district: string
          gender: string
          home_id: string
          name: string
          outfit: string
          reputation: number
          skin: string
          updated_at: string
          user_id: string
          visits: number
          xp: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: {
        Args: { _blocked: string; _blocker: string }
        Returns: boolean
      }
      is_group_chat_creator: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_chat_member: {
        Args: { _chat_id: string; _user_id: string }
        Returns: boolean
      }
      transfer_game_money: {
        Args: {
          _amount: number
          _recipient: string
          _reference?: string
          _sender?: string
        }
        Returns: Json
      }
      visit_home: { Args: { _target: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
