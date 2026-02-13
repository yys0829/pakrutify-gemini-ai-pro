
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/reportService'; // 确保路径指向你的 supabase 实例

const Mine: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // 页面加载时获取当前登录的邮箱
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    getUser();
  }, []);

  // 退出登录函数
  const handleLogout = async () => {
    try {
      // 1. 调用 Supabase 彻底注销
      const { error } = await supabase.auth.signOut(); 
      if (error) throw error;
      
      // 2. 退出成功后，强制刷新页面回到登录状态
      // 这一步会触发 App.tsx 的状态监听，自动跳转到登录页
      window.location.reload(); 
    } catch (err: any) {
      alert('退出失败：' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F7F8FA]">
      {/* 顶部个人信息区域 */}
      <div className="bg-white px-6 py-10 shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="size-16 bg-[#0052D9]/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#0052D9] text-4xl">account_circle</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111418]">个人中心</h2>
            {/* 小细节：显示当前登录的邮箱 */}
            <p className="text-sm text-gray-500 mt-1">
              账号: <span className="font-medium text-gray-800">{userEmail || '加载中...'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 功能菜单区域 */}
      <div className="flex-1 px-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">description</span>
            <span className="text-[#111418] font-medium">我的上报记录</span>
          </div>
          <span className="material-symbols-outlined text-gray-300">chevron_right</span>
        </div>

        <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-gray-400">help</span>
            <span className="text-[#111418] font-medium">使用帮助</span>
          </div>
          <span className="material-symbols-outlined text-gray-300">chevron_right</span>
        </div>
      </div>

      {/* 底部退出按钮 */}
      <div className="p-6 pb-12">
        <button 
          onClick={handleLogout}
          className="w-full h-14 bg-white text-[#FF4D4F] font-bold rounded-2xl border border-red-50 shadow-md active:bg-red-50 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          退出当前账号
        </button>
        <p className="text-center text-[10px] text-gray-300 mt-4 uppercase tracking-widest">
          中色国矿安全管理系统 v1.0
        </p>
      </div>
    </div>
  );
};

export default Mine;
