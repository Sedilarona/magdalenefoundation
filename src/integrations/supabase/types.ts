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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          announcement_type: string
          created_at: string
          description: string
          event_date: string | null
          event_end_date: string | null
          id: string
          is_active: boolean
          location: string | null
          title: string
          updated_at: string
        }
        Insert: {
          announcement_type?: string
          created_at?: string
          description: string
          event_date?: string | null
          event_end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          announcement_type?: string
          created_at?: string
          description?: string
          event_date?: string | null
          event_end_date?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          bio: string | null
          birth_day: number | null
          birth_month: number | null
          birth_year: string | null
          created_at: string
          death_year: string | null
          full_name: string
          gender: string | null
          generation_level: number | null
          id: string
          is_deceased: boolean | null
          location: string | null
          nickname: string | null
          occupation: string | null
          parent_id: string | null
          sibling_order: number | null
          spouse_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: string | null
          created_at?: string
          death_year?: string | null
          full_name: string
          gender?: string | null
          generation_level?: number | null
          id?: string
          is_deceased?: boolean | null
          location?: string | null
          nickname?: string | null
          occupation?: string | null
          parent_id?: string | null
          sibling_order?: number | null
          spouse_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          birth_day?: number | null
          birth_month?: number | null
          birth_year?: string | null
          created_at?: string
          death_year?: string | null
          full_name?: string
          gender?: string | null
          generation_level?: number | null
          id?: string
          is_deceased?: boolean | null
          location?: string | null
          nickname?: string | null
          occupation?: string | null
          parent_id?: string | null
          sibling_order?: number | null
          spouse_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_spouse_id_fkey"
            columns: ["spouse_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      game_challenges: {
        Row: {
          created_at: string
          game_key: string
          host_id: string
          host_name: string
          id: string
          max_players: number
          player_ids: string[]
          players: Json
          state: Json
          status: string
          turn_index: number
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          game_key: string
          host_id: string
          host_name: string
          id?: string
          max_players?: number
          player_ids?: string[]
          players?: Json
          state?: Json
          status?: string
          turn_index?: number
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          game_key?: string
          host_id?: string
          host_name?: string
          id?: string
          max_players?: number
          player_ids?: string[]
          players?: Json
          state?: Json
          status?: string
          turn_index?: number
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      hymns: {
        Row: {
          author: string | null
          created_at: string
          hymn_book: string
          hymn_number: number
          id: string
          language: string
          lyrics: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          hymn_book?: string
          hymn_number: number
          id?: string
          language?: string
          lyrics: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          hymn_book?: string
          hymn_number?: number
          id?: string
          language?: string
          lyrics?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_uploads: {
        Row: {
          caption: string | null
          category: string
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          category: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          caption?: string | null
          category?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          contribution_points: number | null
          created_at: string
          family_branch: string | null
          full_name: string
          generation: string | null
          id: string
          location: string | null
          occupation: string | null
          phone_number: string | null
          services: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          contribution_points?: number | null
          created_at?: string
          family_branch?: string | null
          full_name: string
          generation?: string | null
          id?: string
          location?: string | null
          occupation?: string | null
          phone_number?: string | null
          services?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          contribution_points?: number | null
          created_at?: string
          family_branch?: string | null
          full_name?: string
          generation?: string | null
          id?: string
          location?: string | null
          occupation?: string | null
          phone_number?: string | null
          services?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scripture_content: {
        Row: {
          book_id: string
          chapter_number: number | null
          content: string
          created_at: string
          id: string
          section_title: string | null
          verse_number: number | null
        }
        Insert: {
          book_id: string
          chapter_number?: number | null
          content: string
          created_at?: string
          id?: string
          section_title?: string | null
          verse_number?: number | null
        }
        Update: {
          book_id?: string
          chapter_number?: number | null
          content?: string
          created_at?: string
          id?: string
          section_title?: string | null
          verse_number?: number | null
        }
        Relationships: []
      }
      tales: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_published: boolean | null
          related_member_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          related_member_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean | null
          related_member_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tales_related_member_id_fkey"
            columns: ["related_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      family_directory: {
        Row: {
          avatar_url: string | null
          contribution_points: number | null
          created_at: string | null
          family_branch: string | null
          full_name: string | null
          generation: string | null
          id: string | null
          location: string | null
          occupation: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          contribution_points?: number | null
          created_at?: string | null
          family_branch?: string | null
          full_name?: string | null
          generation?: string | null
          id?: string | null
          location?: string | null
          occupation?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          contribution_points?: number | null
          created_at?: string | null
          family_branch?: string | null
          full_name?: string | null
          generation?: string | null
          id?: string | null
          location?: string | null
          occupation?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_my_phone_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
