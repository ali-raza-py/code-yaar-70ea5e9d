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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      ai_chat_history: {
        Row: {
          created_at: string | null
          id: string
          language: string | null
          messages: Json
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          language?: string | null
          messages?: Json
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          language?: string | null
          messages?: Json
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_limits: {
        Row: {
          created_at: string
          daily_requests: number
          id: string
          last_reset_date: string
          max_daily_requests: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_requests?: number
          id?: string
          last_reset_date?: string
          max_daily_requests?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_requests?: number
          id?: string
          last_reset_date?: string
          max_daily_requests?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          answer_text: string
          created_at: string
          id: string
          is_accepted: boolean | null
          is_hidden: boolean | null
          question_id: string
          user_id: string
          vote_count: number | null
        }
        Insert: {
          answer_text: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_hidden?: boolean | null
          question_id: string
          user_id: string
          vote_count?: number | null
        }
        Update: {
          answer_text?: string
          created_at?: string
          id?: string
          is_accepted?: boolean | null
          is_hidden?: boolean | null
          question_id?: string
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_answers: {
        Row: {
          answer_text: string
          created_at: string
          id: string
          is_highlighted: boolean | null
          question_id: string
          user_id: string
        }
        Insert: {
          answer_text: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          question_id: string
          user_id: string
        }
        Update: {
          answer_text?: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "daily_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_questions: {
        Row: {
          created_at: string
          created_by: string
          deadline: string
          id: string
          is_active: boolean | null
          question_text: string
        }
        Insert: {
          created_at?: string
          created_by: string
          deadline: string
          id?: string
          is_active?: boolean | null
          question_text: string
        }
        Update: {
          created_at?: string
          created_by?: string
          deadline?: string
          id?: string
          is_active?: boolean | null
          question_text?: string
        }
        Relationships: []
      }
      help_faq: {
        Row: {
          answer: string
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempt_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          attempt_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      mfa_settings: {
        Row: {
          backup_codes_generated: boolean | null
          created_at: string
          enrolled_at: string | null
          id: string
          is_enabled: boolean | null
          last_verified_at: string | null
          method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes_generated?: boolean | null
          created_at?: string
          enrolled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_verified_at?: string | null
          method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes_generated?: boolean | null
          created_at?: string
          enrolled_at?: string | null
          id?: string
          is_enabled?: boolean | null
          last_verified_at?: string | null
          method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_metadata: {
        Row: {
          created_at: string
          id: string
          password_length: number
          strength: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_length: number
          strength?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_length?: number
          strength?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_disabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_disabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_disabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          accepted_answer_id: string | null
          created_at: string
          id: string
          is_hidden: boolean | null
          is_solved: boolean | null
          question_text: string
          tags: string[] | null
          user_id: string
          vote_count: number | null
        }
        Insert: {
          accepted_answer_id?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean | null
          is_solved?: boolean | null
          question_text: string
          tags?: string[] | null
          user_id: string
          vote_count?: number | null
        }
        Update: {
          accepted_answer_id?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean | null
          is_solved?: boolean | null
          question_text?: string
          tags?: string[] | null
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_accepted_answer_id_fkey"
            columns: ["accepted_answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          file_path: string | null
          id: string
          is_published: boolean | null
          language: string | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean | null
          language?: string | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          category: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          session_id: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          category: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          category?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      trusted_devices: {
        Row: {
          browser: string | null
          created_at: string
          device_fingerprint: string
          device_name: string | null
          device_type: string | null
          id: string
          is_trusted: boolean | null
          last_used_at: string | null
          os: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_trusted?: boolean | null
          last_used_at?: string | null
          os?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          is_trusted?: boolean | null
          last_used_at?: string | null
          os?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_reputation: {
        Row: {
          accepted_answers: number | null
          answers_given: number | null
          created_at: string | null
          id: string
          questions_asked: number | null
          reputation: number | null
          updated_at: string | null
          upvotes_received: number | null
          user_id: string
        }
        Insert: {
          accepted_answers?: number | null
          answers_given?: number | null
          created_at?: string | null
          id?: string
          questions_asked?: number | null
          reputation?: number | null
          updated_at?: string | null
          upvotes_received?: number | null
          user_id: string
        }
        Update: {
          accepted_answers?: number | null
          answers_given?: number | null
          created_at?: string | null
          id?: string
          questions_asked?: number | null
          reputation?: number | null
          updated_at?: string | null
          upvotes_received?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: string | null
          is_current: boolean | null
          is_suspicious: boolean | null
          last_active_at: string
          location: string | null
          session_token: string
          suspicious_reason: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          is_suspicious?: boolean | null
          last_active_at?: string
          location?: string | null
          session_token: string
          suspicious_reason?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          is_suspicious?: boolean | null
          last_active_at?: string
          location?: string | null
          session_token?: string
          suspicious_reason?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string | null
          id: number
          name: string | null
          password_hashed: string | null
        }
        Insert: {
          email?: string | null
          id?: number
          name?: string | null
          password_hashed?: string | null
        }
        Update: {
          email?: string | null
          id?: number
          name?: string | null
          password_hashed?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string
          vote_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
          vote_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
          vote_value?: number
        }
        Relationships: []
      }
    }
    Views: {
      daily_answers_public: {
        Row: {
          answer_text: string | null
          author_name: string | null
          created_at: string | null
          id: string | null
          is_highlighted: boolean | null
          question_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "daily_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions_safe: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string | null
          ip_address_masked: string | null
          is_current: boolean | null
          is_suspicious: boolean | null
          last_active_at: string | null
          location: string | null
          suspicious_reason: string | null
          user_agent_truncated: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string | null
          ip_address_masked?: never
          is_current?: boolean | null
          is_suspicious?: boolean | null
          last_active_at?: string | null
          location?: string | null
          suspicious_reason?: string | null
          user_agent_truncated?: never
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string | null
          ip_address_masked?: never
          is_current?: boolean | null
          is_suspicious?: boolean | null
          last_active_at?: string | null
          location?: string | null
          suspicious_reason?: string | null
          user_agent_truncated?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_ai_rate_limit: { Args: { user_uuid: string }; Returns: Json }
      check_login_blocked: { Args: { user_email: string }; Returns: boolean }
      check_suspicious_login: {
        Args: { p_ip_address: string; p_user_agent: string; p_user_id: string }
        Returns: Json
      }
      create_user_session: {
        Args: {
          p_device_info?: Json
          p_ip_address?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      get_security_status: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          action_type: string
          new_record?: Json
          old_record?: Json
          record_id?: string
          table_name: string
        }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          p_action: string
          p_category: string
          p_details?: Json
          p_ip_address?: string
          p_severity?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      record_login_attempt: {
        Args: {
          client_ip?: string
          user_email: string
          was_successful: boolean
        }
        Returns: undefined
      }
      terminate_session: { Args: { p_session_id: string }; Returns: boolean }
      verify_admin_access: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
