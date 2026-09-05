import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase at:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Supabase client:', err);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in .env. Running in hybrid mode with local persistent storage.');
}

export const getSupabase = (): SupabaseClient | null => supabaseInstance;
export const isSupabaseConfigured = (): boolean => !!supabaseInstance;
