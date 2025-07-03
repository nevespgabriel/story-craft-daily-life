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
      daily_goals: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          goal_text: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          goal_text: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          goal_text?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      favorite_stories: {
        Row: {
          created_at: string | null
          id: string
          narrative_tag: string | null
          title: string
          type: Database["public"]["Enums"]["story_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          narrative_tag?: string | null
          title: string
          type: Database["public"]["Enums"]["story_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          narrative_tag?: string | null
          title?: string
          type?: Database["public"]["Enums"]["story_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      story_progress: {
        Row: {
          created_at: string | null
          date: string
          id: string
          impact_type: Database["public"]["Enums"]["impact_type"]
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          impact_type: Database["public"]["Enums"]["impact_type"]
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          impact_type?: Database["public"]["Enums"]["impact_type"]
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_statistics: {
        Row: {
          completion_percentage: number | null
          days_with_goals: number | null
          extra_reward_days: number | null
          name: string | null
          negative_days: number | null
          positive_days: number | null
          severe_penalty_days: number | null
          story_entries: number | null
          total_goals_completed: number | null
          total_goals_set: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_story_summary: {
        Args: { user_id_param: string }
        Returns: {
          date: string
          summary: string
          impact_type: Database["public"]["Enums"]["impact_type"]
          goals_set: number
          goals_completed: number
        }[]
      }
    }
    Enums: {
      impact_type: "positive" | "negative" | "extra_reward" | "severe_penalty"
      story_type: "movie" | "series" | "book" | "game"
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
    Enums: {
      impact_type: ["positive", "negative", "extra_reward", "severe_penalty"],
      story_type: ["movie", "series", "book", "game"],
    },
  },
} as const
