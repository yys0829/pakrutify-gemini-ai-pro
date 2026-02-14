import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// 强力退出：3秒内如果不成功，也强制清理本地并跳走
export const signOut = async () => {
  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ]);
  } catch (e) {
    console.warn('退出请求超时或失败，强制清理');
  } finally {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/'; 
  }
};
