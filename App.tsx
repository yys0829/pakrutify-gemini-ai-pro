
import React, { useState, useEffect } from 'react';
import { supabase } from './services/reportService'; // 确保路径指向你的 supabase 配置文件
import Dashboard from './views/Dashboard';
import HazardReport from './views/HazardReport';
import ViolationReport from './views/ViolationReport';
import HazardFeedback from './views/HazardFeedback';
import ReportList from './views/ReportList';
import Quiz from './views/Quiz';
import Regulations from './views/Regulations';
import Mine from './views/Mine';
import Analytics from './views/Analytics';
import BackOffice from './views/BackOffice';
import PermissionSettings from './views/PermissionSettings';
import Login from './views/Login';
import { ViewState, UserInfo, UserRole, PermissionKey } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    unit: '',
    role: 'WORKER', // 默认为普通工人
    roleName: ''
  });

  // 1. 定义三类人的核心权限映射 (对应你的 4/50/40 方案)
  const rolePermissions: Record<string, PermissionKey[]> = {
    super_admin: ['hazard', 'violation', 'hazard_feedback', 'report_list', 'quiz', 'analytics', 'regulations', 'backoffice', 'permissions'],
    manager: ['hazard', 'violation', 'hazard_feedback', 'report_list', 'quiz', 'analytics', 'regulations'],
    worker: ['hazard', 'quiz', 'regulations', 'analytics']
  };

  // 2. 核心：监听 Supabase 身份状态变化
  useEffect(() => {
    // 监听登录/登出/邮件链接跳转事件
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // 当有会话时，去 profiles 表获取详细角色
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', session.user.email)
          .single();

        if (profile) {
          setUserInfo({
            name: profile.real_name || session.user.email?.split('@')[0] || '用户',
            unit: profile.dept || '中色国矿',
            role: (profile.role as UserRole) || 'WORKER',
            roleName: profile.role === 'super_admin' ? '超级管理员' : (profile.role === 'manager' ? '安全管理人员' : '基层员工')
          });
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 权限检查工具
  const hasPermission = (permission: PermissionKey): boolean => {
    // 将数据库角色映射回我们的权限表
    const permissions = rolePermissions[userInfo.role.toLowerCase()] || rolePermissions['worker'];
    return permissions.includes(permission);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard userInfo={userInfo} hasPermission={hasPermission} onNavigate={(view) => setCurrentView(view)} />;
      case 'hazard':
        return <HazardReport onBack={() => setCurrentView('dashboard')} />;
      case 'violation':
        return <ViolationReport onBack={() => setCurrentView('dashboard')} />;
      case 'hazard_feedback':
        return <HazardFeedback onBack={() => setCurrentView('dashboard')} />;
      case 'report_list':
        return <ReportList onBack={() => setCurrentView('dashboard')} />;
      case 'quiz':
        return <Quiz onBack={() => setCurrentView('dashboard')} />;
      case 'regulations':
        return <Regulations onBack={() => setCurrentView('dashboard')} />;
      case 'mine':
        return <Mine userInfo={userInfo} hasPermission={hasPermission} onBack={() => setCurrentView('dashboard')} onNavigate={(view) => setCurrentView(view)} onLogout={handleLogout} />;
      case 'analytics':
        return <Analytics onBack={() => setCurrentView('dashboard')} />;
      case 'backoffice':
        if (!hasPermission('backoffice')) return <div className="p-10 text-center text-gray-400 font-bold">无权访问后台管理</div>;
        return <BackOffice onBack={() => setCurrentView('mine')} />;
      case 'permissions':
        if (!hasPermission('permissions')) return <div className="p-10 text-center text-gray-400 font-bold">无权设置权限</div>;
        return <PermissionSettings onBack={() => setCurrentView('mine')} />;
      default:
        return <div className="p-10 text-center text-gray-400">视图未定义</div>;
    }
  };

  const showNav = isLoggedIn && ['dashboard', 'regulations', 'mine', 'analytics', 'quiz'].includes(currentView);

  return (
    <div className="max-w-[480px] mx-auto h-screen bg-background-light relative shadow-xl overflow-hidden flex flex-col">
      <div className="bg-[#0f4a8a] text-white py-3 px-4 font-bold text-xl text-center border-b border-white/5 shrink-0 z-[60] select-none shadow-md">
        中色国矿帕鲁特公司安全管理平台
      </div>

      {!isLoggedIn ? (
        <Login onLogin={() => {}} /> /* Login组件现在内部处理Supabase登录，不需要传handleLogin了 */
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderView()}
          </div>
          
          {showNav && (
            <nav className="shrink-0 bg-white border-t border-gray-200 px-6 py-2 pb-6 flex justify-between items-center z-50">
              <button onClick={() => setCurrentView('dashboard')} className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-primary' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'dashboard' ? "'FILL' 1" : "" }}>home</span>
                <span className="text-[10px] font-bold">首页</span>
              </button>
              
              <button onClick={() => hasPermission('regulations') ? setCurrentView('regulations') : alert('无此权限')} className={`flex flex-col items-center gap-1 ${currentView === 'regulations' ? 'text-primary' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'regulations' ? "'FILL' 1" : "" }}>menu_book</span>
                <span className="text-[10px] font-medium">制度库</span>
              </button>
              
              <div className="relative">
                 <button onClick={() => hasPermission('hazard') ? setCurrentView('hazard') : alert('无此权限')} className="size-12 rounded-full bg-primary text-white flex items-center justify-center -mt-8 border-4 border-background-light shadow-lg transform active:scale-90 transition-transform">
                  <span className="material-symbols-outlined">add</span>
                </button>
                <span className="text-[10px] font-medium text-gray-400 block text-center mt-1">快捷上报</span>
              </div>
              
              <button onClick={() => hasPermission('analytics') ? setCurrentView('analytics') : alert('无此权限')} className={`flex flex-col items-center gap-1 ${currentView === 'analytics' ? 'text-primary' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'analytics' ? "'FILL' 1" : "" }}>bar_chart</span>
                <span className="text-[10px] font-medium">看板</span>
              </button>
              
              <button onClick={() => setCurrentView('mine')} className={`flex flex-col items-center gap-1 ${currentView === 'mine' ? 'text-primary' : 'text-gray-400'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'mine' ? "'FILL' 1" : "" }}>person</span>
                <span className="text-[10px] font-medium">我的</span>
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
