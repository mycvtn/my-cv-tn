export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          credits_balance: number;
          subscription_tier: "free" | "pro" | "unlimited";
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          credits_balance?: number;
          subscription_tier?: "free" | "pro" | "unlimited";
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          credits_balance?: number;
          subscription_tier?: "free" | "pro" | "unlimited";
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          template_id: string;
          content: Json;
          ats_score: number | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          template_id?: string;
          content: Json;
          ats_score?: number | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          template_id?: string;
          content?: Json;
          ats_score?: number | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      cover_letters: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          title: string;
          job_title: string;
          company_name: string;
          content: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_id?: string | null;
          title: string;
          job_title: string;
          company_name: string;
          content: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          title?: string;
          job_title?: string;
          company_name?: string;
          content?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          user_id: string;
          gateway: "flouci" | "konnect" | "d17_voucher" | "manual";
          amount_millimes: number; // in Millimes (1 TND = 1000 Millimes)
          currency: string;
          status: "pending" | "completed" | "failed" | "refunded";
          payment_ref: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          gateway: "flouci" | "konnect" | "d17_voucher" | "manual";
          amount_millimes: number;
          currency?: string;
          status?: "pending" | "completed" | "failed" | "refunded";
          payment_ref?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          gateway?: "flouci" | "konnect" | "d17_voucher" | "manual";
          amount_millimes?: number;
          currency?: string;
          status?: "pending" | "completed" | "failed" | "refunded";
          payment_ref?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      d17_vouchers: {
        Row: {
          code: string;
          credits_granted: number;
          is_redeemed: boolean;
          redeemed_by: string | null;
          redeemed_at: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          credits_granted?: number;
          is_redeemed?: boolean;
          redeemed_by?: string | null;
          redeemed_at?: string | null;
          created_at?: string;
        };
        Update: {
          code?: string;
          credits_granted?: number;
          is_redeemed?: boolean;
          redeemed_by?: string | null;
          redeemed_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
