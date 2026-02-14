import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 增加一个统一的退出函数，给全应用调用
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('退出失败:', error.message);
  // 退出后强行刷新页面，清空所有残留状态，回到登录页
  window.location.href = '/login'; 
};
