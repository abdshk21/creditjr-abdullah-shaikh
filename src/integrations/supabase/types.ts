export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      credit_score: {
        Row: {
          breakdown: Json | null
          created_at: string
          id: string
          last_calculated: string | null
          score: number | null
          user_id: string | null
        }
        Insert: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          last_calculated?: string | null
          score?: number | null
          user_id?: string | null
        }
        Update: {
          breakdown?: Json | null
          created_at?: string
          id?: string
          last_calculated?: string | null
          score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      emergency_fund: {
        Row: {
          created_at: string
          current_balance: number | null
          id: string
          target_amount: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_balance?: number | null
          id?: string
          target_amount?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_balance?: number | null
          id?: string
          target_amount?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      emergency_fund_log: {
        Row: {
          amount: number | null
          created_at: string
          fund_id: string | null
          id: string
          reason: string | null
          type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          fund_id?: string | null
          id?: string
          reason?: string | null
          type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          fund_id?: string | null
          id?: string
          reason?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_fund_log_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "emergency_fund"
            referencedColumns: ["id"]
          },
        ]
      }
      envelope_logs: {
        Row: {
          amount: number | null
          created_at: string
          description: string | null
          envelope_id: string | null
          id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          description?: string | null
          envelope_id?: string | null
          id?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          description?: string | null
          envelope_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "envelope_logs_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
        ]
      }
      envelopes: {
        Row: {
          category: string | null
          created_at: string
          id: string
          spent_so_far: number | null
          target_amount: number | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          spent_so_far?: number | null
          target_amount?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          spent_so_far?: number | null
          target_amount?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          category_limits: Json | null
          created_at: string
          id: string
          income_expectation: number | null
          last_updated: string | null
          log_consistency: number | null
          max_spend_limit: number | null
          monthly_saving_goal: number | null
          user_id: string | null
        }
        Insert: {
          category_limits?: Json | null
          created_at?: string
          id?: string
          income_expectation?: number | null
          last_updated?: string | null
          log_consistency?: number | null
          max_spend_limit?: number | null
          monthly_saving_goal?: number | null
          user_id?: string | null
        }
        Update: {
          category_limits?: Json | null
          created_at?: string
          id?: string
          income_expectation?: number | null
          last_updated?: string | null
          log_consistency?: number | null
          max_spend_limit?: number | null
          monthly_saving_goal?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          affects_score: boolean | null
          amount: number | null
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          affects_score?: boolean | null
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          affects_score?: boolean | null
          amount?: number | null
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
