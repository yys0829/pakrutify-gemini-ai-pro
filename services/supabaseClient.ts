import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 强力登出：不管后台成不成功，直接杀掉本地所有缓存并跳回首页
export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/'; 
  }
};
