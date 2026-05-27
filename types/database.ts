export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          account_type: 'firm' | 'solo' | null
          firm_id: string | null
          onboarding_completed: boolean
        }
        Insert: {
          id: string
          email: string
          name: string
          created_at?: string
          account_type?: 'firm' | 'solo' | null
          firm_id?: string | null
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          account_type?: 'firm' | 'solo' | null
          firm_id?: string | null
          onboarding_completed?: boolean
        }
      }
      firms: {
        Row: {
          id: string
          name: string
          tax_number: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          tax_number?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          tax_number?: string | null
          address?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          notes: string | null
          is_archived: boolean
          portal_token: string
          created_at: string
          updated_at: string
          business_type: 'normiran_sp' | 'sp' | 'doo' | 'other' | null
          vat_registered: boolean
          contact_person: string | null
          contact_email: string | null
          contact_phone: string | null
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          notes?: string | null
          is_archived?: boolean
          portal_token: string
          created_at?: string
          updated_at?: string
          business_type?: 'normiran_sp' | 'sp' | 'doo' | 'other' | null
          vat_registered?: boolean
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          notes?: string | null
          is_archived?: boolean
          portal_token?: string
          created_at?: string
          updated_at?: string
          business_type?: 'normiran_sp' | 'sp' | 'doo' | 'other' | null
          vat_registered?: boolean
          contact_person?: string | null
          contact_email?: string | null
          contact_phone?: string | null
        }
      }
      client_contacts: {
        Row: {
          id: string
          client_id: string
          name: string
          email: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          email: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          email?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      platforms: {
        Row: {
          id: string
          key: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          platform_id: string
          title: string
          why_text: string
          instructions_md: string
          is_blocking: boolean
          help_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          platform_id: string
          title: string
          why_text: string
          instructions_md: string
          is_blocking?: boolean
          help_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          platform_id?: string
          title?: string
          why_text?: string
          instructions_md?: string
          is_blocking?: boolean
          help_url?: string | null
          created_at?: string
        }
      }
      packs: {
        Row: {
          id: string
          owner_user_id: string | null
          name: string
          description: string | null
          created_at: string
          is_system: boolean
          country_code: string
          tags: string[]
          business_types: string[]
        }
        Insert: {
          id?: string
          owner_user_id?: string | null
          name: string
          description?: string | null
          created_at?: string
          is_system?: boolean
          country_code?: string
          tags?: string[]
          business_types?: string[]
        }
        Update: {
          id?: string
          owner_user_id?: string | null
          name?: string
          description?: string | null
          created_at?: string
          is_system?: boolean
          country_code?: string
          tags?: string[]
          business_types?: string[]
        }
      }
      pack_tasks: {
        Row: {
          pack_id: string
          task_id: string
          sort_order: number
          created_at: string
        }
        Insert: {
          pack_id: string
          task_id: string
          sort_order: number
          created_at?: string
        }
        Update: {
          pack_id?: string
          task_id?: string
          sort_order?: number
          created_at?: string
        }
      }
      client_checklists: {
        Row: {
          id: string
          client_id: string
          type: 'onboarding' | 'recurring_check'
          run_label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          type: 'onboarding' | 'recurring_check'
          run_label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          type?: 'onboarding' | 'recurring_check'
          run_label?: string | null
          created_at?: string
        }
      }
      client_task_instances: {
        Row: {
          id: string
          checklist_id: string
          task_id: string
          status: 'pending' | 'done' | 'needs_help'
          completed_at: string | null
          completed_by_email: string | null
          proof_file_url: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          task_id: string
          status?: 'pending' | 'done' | 'needs_help'
          completed_at?: string | null
          completed_by_email?: string | null
          proof_file_url?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          checklist_id?: string
          task_id?: string
          status?: 'pending' | 'done' | 'needs_help'
          completed_at?: string | null
          completed_by_email?: string | null
          proof_file_url?: string | null
          updated_at?: string
          created_at?: string
        }
      }
      reminder_settings: {
        Row: {
          id: string
          client_id: string
          is_paused: boolean
          cadence_json: Json
          escalate_to_secondary: boolean
          last_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          is_paused?: boolean
          cadence_json: Json
          escalate_to_secondary?: boolean
          last_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          is_paused?: boolean
          cadence_json?: Json
          escalate_to_secondary?: boolean
          last_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminder_events: {
        Row: {
          id: string
          client_id: string
          sent_to: string
          type: 'invite' | 'auto' | 'manual'
          payload_snapshot: Json
          sent_at: string
        }
        Insert: {
          id?: string
          client_id: string
          sent_to: string
          type: 'invite' | 'auto' | 'manual'
          payload_snapshot: Json
          sent_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          sent_to?: string
          type?: 'invite' | 'auto' | 'manual'
          payload_snapshot?: Json
          sent_at?: string
        }
      }
      audit_events: {
        Row: {
          id: string
          client_id: string
          actor_type: string
          actor_identifier: string
          event_type: string
          metadata_json: Json
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          actor_type: string
          actor_identifier: string
          event_type: string
          metadata_json: Json
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          actor_type?: string
          actor_identifier?: string
          event_type?: string
          metadata_json?: Json
          created_at?: string
        }
      }
      recurring_check_schedules: {
        Row: {
          id: string
          client_id: string
          frequency: 'monthly' | 'quarterly'
          next_run_date: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          frequency: 'monthly' | 'quarterly'
          next_run_date: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          frequency?: 'monthly' | 'quarterly'
          next_run_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
  }
}
