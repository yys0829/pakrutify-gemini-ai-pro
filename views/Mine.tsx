
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ⚠️ 关键引用：使用我们刚才修好的“水管”和“开关”
import { supabase, signOut } from '../services/supabaseClient';

const Mine = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. 系统性加载用户信息，确保登录没过期
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        // 如果用户信息失效，直接清理并跳回登录，防止卡死
        console.warn("登录已过期");
        // 如果你需要自动跳转，可以取消下面这行的注释
        // navigate('/login'); 
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [navigate]);

  // 2. 增强型退出函数
  const handleSignOut = async () => {
    if (!window.confirm("确定要退出当前账号吗？")) return;
    
    try {
      // 执行刚才在 services/supabaseClient 里定义的强力退出
      await signOut();
    } catch (error) {
      // 如果万一失败，强制清理本地缓存并跳转
      localStorage.clear();
      window.location.href = '/';
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">正在同步账户信息...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 个人中心头部 */}
      <div className="bg-blue-600 pt-12 pb-20 px-6 rounded-b-[40px] shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full border-2 border-white/50 flex items-center justify-center text-white text-2xl font-bold">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {user?.email || '未登录用户'}
            </h2>
            <p className="text-blue-100 text-xs mt-1">账号状态：在线</p>
          </div>
        </div>
      </div>

      {/* 功能菜单区 */}
      <div className="px-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b border-gray-50 active:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-lg">👤</span>
              <span className="text-sm font-medium">基本信息</span>
            </div>
            <span className="text-gray-300 text-xs">查看 &gt;</span>
          </div>
          
          <div className="p-4 flex justify-between items-center border-b border-gray-50 active:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🔒</span>
              <span className="text-sm font-medium">修改密码</span>
            </div>
            <span className="text-gray-300 text-xs">前往 &gt;</span>
          </div>

          <div className="p-4 flex justify-between items-center active:bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🛠️</span>
              <span className="text-sm font-medium">系统设置</span>
            </div>
            <span className="text-gray-300 text-xs">v1.0.2</span>
          </div>
        </div>

        {/* 退出账号按钮 - 修复重点 */}
        <button 
          onClick={handleSignOut}
          className="w-full mt-8 bg-white py-4 rounded-2xl shadow-sm text-red-500 font-bold active:scale-95 transition-transform flex items-center justify-center space-x-2 border border-red-50"
        >
          <span>🚪</span>
          <span>退出当前账号</span>
        </button>

        <p className="text-center text-gray-300 text-[10px] mt-6 leading-loose">
          安全环保监督管理系统<br/>
          云端数据库连接已建立
        </p>
      </div>
    </div>
  );
};

export default Mine;
