
import React, { useEffect, useState } from 'react';
// ⚠️ 删掉了 react-router-dom 的引用，防止报错
import { supabase, signOut } from '../services/supabaseClient';

const Mine = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    if (!window.confirm("确定要退出当前账号吗？")) return;
    try {
      // signOut 函数内部已经写了跳转，不需要 useNavigate
      await signOut();
    } catch (error) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">正在同步账户信息...</div>;

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
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">账号：{user?.email || '未获取'}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400 text-xs">
            <span>当前版本</span>
            <span>v1.0.2</span>
          </div>
        </div>

        <button 
          onClick={handleSignOut}
          className="w-full mt-8 bg-white py-4 rounded-2xl shadow-sm text-red-500 font-bold border border-red-50 active:bg-gray-50"
        >
          退出当前账号
        </button>
      </div>
    </div>
  );
};

export default Mine;
