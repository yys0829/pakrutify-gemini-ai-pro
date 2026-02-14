
import React, { useEffect, useState } from 'react';
import { supabase, signOut } from '../services/supabaseClient';

const Mine = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      // 保护逻辑：如果 3 秒还没从服务器拿到人名，直接显示默认名称，不准卡死在这里
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 3000);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUser(user);
      } catch (e) {
        console.error("获取用户信息失败");
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };
    getUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 pt-12 pb-20 px-6 rounded-b-[40px] shadow-lg text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/50">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.email || '安全管理员'}</h2>
            <p className="text-blue-100 text-xs mt-1">系统已连接</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-6">
          <div className="flex justify-between items-center border-b border-gray-50 pb-4">
            <span className="text-sm font-medium text-gray-700">账号详情</span>
            <span className="text-xs text-gray-400">{user?.email || '已离线模式'}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400 text-xs">
            <span>当前版本</span>
            <span>v1.0.3 (稳定版)</span>
          </div>
        </div>

        <button 
          onClick={() => {
            if(window.confirm("确定退出吗？")) signOut();
          }}
          className="w-full mt-8 bg-white py-4 rounded-2xl shadow-sm text-red-500 font-bold border border-red-50 active:bg-gray-50 transition-colors"
        >
          退出当前账号
        </button>
      </div>
    </div>
  );
};

export default Mine;
