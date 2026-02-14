import { createClient } from '@supabase/supabase-js';

// 这里自动读取你的 .env 里的密码，不用手动改
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
