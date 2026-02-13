
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/reportService'; 

const Mine: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser(); 
      if (user) setUserEmail(user.email || null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      // 1. 在退出前，先把当前邮箱存入待验证记忆
      // 这样退出后刷新页面，Login.tsx 就会直接显示 6 格界面
      if (userEmail) {
        localStorage.setItem('pending_email', userEmail);
      }
      
      // 2. 退出登录
      await supabase.auth.signOut(); 
      
      // 3. 刷新页面回到登录页
      window.location.reload(); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F8FA]">
      <div className="bg-white px-6 py-10 shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="size-16 bg-[#0052D9]/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0052D9] text-4xl">account_circle</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-[#111418]">个人中心</h2>
            <p className="text-xs text-gray-400 mt-1 font-bold">
              账号: <span className="text-gray-700 font-medium">{userEmail || '加载中...'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4">
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">history</span>
            <span className="text-[#111418] font-bold text-sm">我的上报记录</span>
          </div>
          <span className="material-symbols-outlined text-gray-300">chevron_right</span>
        </div>
      </div>

      <div className="p-6 pb-20">
        <button 
          onClick={handleLogout}
          className="w-full h-14 bg-white text-[#FF4D4F] font-black rounded-2xl border border-red-50 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          退出并重新验证
        </button>
      </div>
    </div>
  );
};

export default Mine;
