
import React, { useState, useEffect } from 'react';
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
    role: 'WORKER',
    roleName: ''
  });
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, PermissionKey[]>>({
    ADMIN: ['hazard', 'violation', 'hazard_feedback', 'report_list', 'quiz', 'analytics', 'regulations', 'backoffice', 'permissions'],
    SAFETY_OFFICER: ['hazard', 'violation', 'hazard_feedback', 'report_list', 'quiz', 'analytics', 'regulations'],
    WORKER: ['hazard', 'quiz', 'regulations', 'analytics']
  });

  // Load permissions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('role_permissions');
    if (saved) {
      try {
        setRolePermissions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse permissions", e);
      }
    }
  }, []);

  const hasPermission = (permission: PermissionKey): boolean => {
    return rolePermissions[userInfo.role].includes(permission);
  };

  const handleLogin = (data: { name: string; unitLabel: string; role: UserRole; roleName: string }) => {
    setUserInfo({
      name: data.name,
      unit: data.unitLabel,
      role: data.role,
      roleName: data.roleName
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo({
      name: '',
      unit: '',
      role: 'WORKER',
      roleName: ''
    });
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          userInfo={userInfo}
          hasPermission={hasPermission}
          onNavigate={(view) => setCurrentView(view)} 
        />;
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
        return <Mine 
          userInfo={userInfo}
          hasPermission={hasPermission}
          onBack={() => setCurrentView('dashboard')} 
          onNavigate={(view) => setCurrentView(view)}
          onLogout={handleLogout}
        />;
      case 'analytics':
        return <Analytics onBack={() => setCurrentView('dashboard')} />;
      case 'backoffice':
        if (!hasPermission('backoffice')) return <div className="p-10 text-center text-gray-400">无权访问后台</div>;
        return <BackOffice onBack={() => setCurrentView('mine')} />;
      case 'permissions':
        if (!hasPermission('permissions')) return <div className="p-10 text-center text-gray-400">无权设置权限</div>;
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
        <Login onLogin={handleLogin} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderView()}
          </div>
          
          {showNav && (
            <nav className="shrink-0 bg-white border-t border-gray-200 px-6 py-2 pb-6 flex justify-between items-center z-50">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-primary' : 'text-gray-400'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'dashboard' ? "'FILL' 1" : "" }}>home</span>
                <span className="text-[10px] font-bold">首页</span>
              </button>
              
              <button 
                onClick={() => {
                  if (hasPermission('regulations')) setCurrentView('regulations');
                  else alert('当前角色无此权限');
                }}
                className={`flex flex-col items-center gap-1 ${currentView === 'regulations' ? 'text-primary' : 'text-gray-400'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'regulations' ? "'FILL' 1" : "" }}>menu_book</span>
                <span className="text-[10px] font-medium">制度库</span>
              </button>
              
              <div className="relative">
                 <button 
                  onClick={() => {
                    if (hasPermission('hazard')) setCurrentView('hazard');
                    else alert('当前角色无此权限');
                  }}
                  className="size-12 rounded-full bg-primary text-white flex items-center justify-center -mt-8 border-4 border-background-light shadow-lg transform active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
                <span className="text-[10px] font-medium text-gray-400 block text-center mt-1">快捷上报</span>
              </div>
              
              <button 
                onClick={() => {
                  if (hasPermission('analytics')) setCurrentView('analytics');
                  else alert('当前角色无此权限');
                }}
                className={`flex flex-col items-center gap-1 ${currentView === 'analytics' ? 'text-primary' : 'text-gray-400'}`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: currentView === 'analytics' ? "'FILL' 1" : "" }}>bar_chart</span>
                <span className="text-[10px] font-medium">看板</span>
              </button>
              
              <button 
                onClick={() => setCurrentView('mine')}
                className={`flex flex-col items-center gap-1 ${currentView === 'mine' ? 'text-primary' : 'text-gray-400'}`}
              >
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
