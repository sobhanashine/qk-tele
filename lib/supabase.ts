import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// For client-side if needed
export const supabase = createClient(supabaseUrl, supabaseKey);

// For server-side operations requiring admin privileges
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
