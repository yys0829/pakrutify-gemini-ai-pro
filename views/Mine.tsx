
import React, { useEffect, useState } from 'react';
import { supabase, signOut } from '../services/supabaseClient';

const Mine = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 强制 2 秒超时：如果 2 秒没拿到用户信息，直接显示管理员，不准卡死
    const timer = setTimeout(() => setLoading(false), 2000);
    
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
      clearTimeout(timer);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400">正在进入...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 p-10 text-white rounded-b-3xl shadow-lg">
        <h2 className="text-xl font-bold">{user?.email || '安全管理员'}</h2>
        <p className="text-xs opacity-80 mt-1">系统连接已建立</p>
      </div>

      <div className="p-6">
        <button 
          onClick={() => { if(window.confirm("确定退出？")) signOut(); }}
          className="w-full bg-white py-4 rounded-xl text-red-500 font-bold shadow-sm border border-red-50"
        >
          退出当前账号
        </button>
      </div>
    </div>
  );
};

export default Mine;
