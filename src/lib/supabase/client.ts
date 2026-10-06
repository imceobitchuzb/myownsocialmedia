import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Determine if we are connected to a live production Supabase instance
export const isRealSupabaseConfigured = () => {
  return (
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    !supabaseUrl.includes('mock-supabase') &&
    !supabaseUrl.includes('dummy_mock_key') &&
    !supabaseAnonKey.includes('dummy_mock_key')
  );
};

export const supabase = isRealSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
