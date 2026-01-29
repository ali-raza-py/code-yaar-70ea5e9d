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
      ai_tools: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          name: string
          sort_order: number | null
          updated_at: string
          url: string | null
          use_case: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string
          url?: string | null
          use_case?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          url?: string | null
          use_case?: string | null
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
      algorithm_bookmarks: {
        Row: {
          algorithm_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          algorithm_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          algorithm_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "algorithm_bookmarks_algorithm_id_fkey"
            columns: ["algorithm_id"]
            isOneToOne: false
            referencedRelation: "algorithms"
            referencedColumns: ["id"]
          },
        ]
      }
      algorithm_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      algorithms: {
        Row: {
          category_id: string | null
          code_cpp: string | null
          code_javascript: string | null
          code_python: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          is_published: boolean | null
          name: string
          practice_links: Json | null
          slug: string
          space_complexity: string | null
          time_complexity: string | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          code_cpp?: string | null
          code_javascript?: string | null
          code_python?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          practice_links?: Json | null
          slug: string
          space_complexity?: string | null
          time_complexity?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          code_cpp?: string | null
          code_javascript?: string | null
          code_python?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          practice_links?: Json | null
          slug?: string
          space_complexity?: string | null
          time_complexity?: string | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "algorithms_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "algorithm_categories"
            referencedColumns: ["id"]
          },
        ]
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
      badges: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          requirement_type: string | null
          requirement_value: number | null
          slug: string
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          requirement_type?: string | null
          requirement_value?: number | null
          slug: string
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          requirement_type?: string | null
          requirement_value?: number | null
          slug?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          estimated_minutes: number | null
          id: string
          is_published: boolean | null
          lesson_order: number
          lesson_type: string | null
          slug: string
          title: string
          updated_at: string
          video_url: string | null
          xp_reward: number | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean | null
          lesson_order: number
          lesson_type?: string | null
          slug: string
          title: string
          updated_at?: string
          video_url?: string | null
          xp_reward?: number | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          estimated_minutes?: number | null
          id?: string
          is_published?: boolean | null
          lesson_order?: number
          lesson_type?: string | null
          slug?: string
          title?: string
          updated_at?: string
          video_url?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_hours: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          slug: string
          thumbnail_url: string | null
          title: string
          total_lessons: number | null
          updated_at: string
          xp_reward: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          slug: string
          thumbnail_url?: string | null
          title: string
          total_lessons?: number | null
          updated_at?: string
          xp_reward?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_hours?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          total_lessons?: number | null
          updated_at?: string
          xp_reward?: number | null
        }
        Relationships: []
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
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string | null
          id: string
          is_active: boolean | null
          problem_link: string | null
          solution: string | null
          title: string
          xp_reward: number | null
        }
        Insert: {
          challenge_date: string
          challenge_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          problem_link?: string | null
          solution?: string | null
          title: string
          xp_reward?: number | null
        }
        Update: {
          challenge_date?: string
          challenge_type?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          problem_link?: string | null
          solution?: string | null
          title?: string
          xp_reward?: number | null
        }
        Relationships: []
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
      doubt_responses: {
        Row: {
          content: string
          created_at: string
          doubt_id: string
          id: string
          is_accepted: boolean | null
          is_admin_response: boolean | null
          is_hidden: boolean | null
          updated_at: string
          user_id: string
          vote_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          doubt_id: string
          id?: string
          is_accepted?: boolean | null
          is_admin_response?: boolean | null
          is_hidden?: boolean | null
          updated_at?: string
          user_id: string
          vote_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          doubt_id?: string
          id?: string
          is_accepted?: boolean | null
          is_admin_response?: boolean | null
          is_hidden?: boolean | null
          updated_at?: string
          user_id?: string
          vote_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "doubt_responses_doubt_id_fkey"
            columns: ["doubt_id"]
            isOneToOne: false
            referencedRelation: "doubts"
            referencedColumns: ["id"]
          },
        ]
      }
      doubt_votes: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: string
          user_id: string
          vote_value: number
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: string
          user_id: string
          vote_value: number
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
          vote_value?: number
        }
        Relationships: []
      }
      doubts: {
        Row: {
          answer_count: number | null
          content: string
          created_at: string
          id: string
          is_hidden: boolean | null
          is_pinned: boolean | null
          is_resolved: boolean | null
          tags: string[] | null
          title: string
          topic: string | null
          updated_at: string
          user_id: string
          view_count: number | null
          vote_count: number | null
        }
        Insert: {
          answer_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          tags?: string[] | null
          title: string
          topic?: string | null
          updated_at?: string
          user_id: string
          view_count?: number | null
          vote_count?: number | null
        }
        Update: {
          answer_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean | null
          is_pinned?: boolean | null
          is_resolved?: boolean | null
          tags?: string[] | null
          title?: string
          topic?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number | null
          vote_count?: number | null
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
      leaderboard_entries: {
        Row: {
          created_at: string
          id: string
          period_end: string
          period_start: string
          period_type: string
          rank_position: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          period_type: string
          rank_position?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          period_type?: string
          rank_position?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          lesson_id: string
          quiz_score: number | null
          time_spent_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          lesson_id: string
          quiz_score?: number | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          lesson_id?: string
          quiz_score?: number | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
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
      roadmap_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          is_unlocked: boolean | null
          notes: string | null
          roadmap_id: string
          step_index: number
          step_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_unlocked?: boolean | null
          notes?: string | null
          roadmap_id: string
          step_index: number
          step_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          is_unlocked?: boolean | null
          notes?: string | null
          roadmap_id?: string
          step_index?: number
          step_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_progress_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "saved_roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_roadmaps: {
        Row: {
          completed_at: string | null
          completed_steps: number | null
          created_at: string
          daily_time_minutes: number | null
          difficulty: string | null
          goal: string
          id: string
          is_active: boolean | null
          roadmap_data: Json
          started_at: string | null
          title: string
          total_steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          daily_time_minutes?: number | null
          difficulty?: string | null
          goal: string
          id?: string
          is_active?: boolean | null
          roadmap_data: Json
          started_at?: string | null
          title: string
          total_steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number | null
          created_at?: string
          daily_time_minutes?: number | null
          difficulty?: string | null
          goal?: string
          id?: string
          is_active?: boolean | null
          roadmap_data?: Json
          started_at?: string | null
          title?: string
          total_steps?: number | null
          updated_at?: string
          user_id?: string
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
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_activity_date: string | null
          level: number | null
          longest_streak: number | null
          total_algorithms_studied: number | null
          total_courses_completed: number | null
          total_doubts_answered: number | null
          total_lessons_completed: number | null
          updated_at: string
          user_id: string
          xp_points: number | null
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_algorithms_studied?: number | null
          total_courses_completed?: number | null
          total_doubts_answered?: number | null
          total_lessons_completed?: number | null
          updated_at?: string
          user_id: string
          xp_points?: number | null
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          level?: number | null
          longest_streak?: number | null
          total_algorithms_studied?: number | null
          total_courses_completed?: number | null
          total_doubts_answered?: number | null
          total_lessons_completed?: number | null
          updated_at?: string
          user_id?: string
          xp_points?: number | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          content_format: string | null
          created_at: string
          daily_time_minutes: number | null
          experience_level: string | null
          id: string
          learning_goal: string | null
          learning_preference: string | null
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          content_format?: string | null
          created_at?: string
          daily_time_minutes?: number | null
          experience_level?: string | null
          id?: string
          learning_goal?: string | null
          learning_preference?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          content_format?: string | null
          created_at?: string
          daily_time_minutes?: number | null
          experience_level?: string | null
          id?: string
          learning_goal?: string | null
          learning_preference?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          section_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          section_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          section_id?: string
          updated_at?: string
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
