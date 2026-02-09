
import React, { useState } from 'react';
import { ViewState, UserInfo, PermissionKey } from '../types';

interface MineProps {
  userInfo: UserInfo;
  hasPermission: (permission: PermissionKey) => boolean;
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
}

const Mine: React.FC<MineProps> = ({ userInfo, hasPermission, onBack, onLogout, onNavigate }) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('您确定要退出当前账号并重新登录吗？')) {
      onLogout();
    }
  };

  if (showSettings) {
    return (
      <div className="flex-1 flex flex-col bg-background-light overflow-hidden">
        <header className="flex items-center bg-white px-4 py-3 border-b border-gray-100 sticky top-0 z-50 shrink-0">
          <button onClick={() => setShowSettings(false)} className="flex size-10 items-center justify-start text-primary">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h1 className="text-[#111418] text-lg font-bold flex-1 text-center pr-10">系统设置</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
           <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                 <span className="text-sm font-medium">应用推送通知</span>
                 <div className="w-10 h-6 bg-primary rounded-full relative">
                    <div className="size-4 bg-white rounded-full absolute top-1 right-1"></div>
                 </div>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">版本信息</span>
                 <span className="text-xs text-gray-400 font-bold tracking-widest">v2.5.26 (Build 2026)</span>
              </div>
           </div>

           <button 
            type="button"
            onClick={handleLogoutClick}
            className="w-full py-4 bg-white text-danger font-bold rounded-2xl border border-danger/10 shadow-sm active:bg-red-50 flex items-center justify-center gap-2 mt-4 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            退出登录
          </button>
          
          <div className="h-20 shrink-0"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background-light overflow-y-auto no-scrollbar pb-24">
      <div className="bg-white px-6 pt-10 pb-8 rounded-b-[2.5rem] shadow-sm border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-5 mb-8">
          <div 
            className="size-20 rounded-full border-4 border-primary/10 bg-center bg-no-repeat bg-cover" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHMns_SlZOwEdrfxB9r86qupk0btT47h7Wzp3AV7YrzWiRKEXWoLQ2yFMWHE56yq6XBfJX46KCeybcMe7hAFSa7EeF1CC7CBM0eowpHCvYbO4b70jb9SdbrqmXidUkWcpoe8GHVFn5pEnQOdatCDeTlrV2w7Ki_PpjUElCA-RmVPIJD5wZLHvEEa9OMWEpLNmF6l_YXiZ1acwzHCykZg27Xlg-JVJJNThmDa6P9WdsRkUCbUO3Vf1Lcdx4Cq2bcBaAaPnsiVBRAKPm")' }}
          ></div>
          <div>
            <h2 className="text-2xl font-bold text-[#111418]">{userInfo.name}</h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-primary`}>
                {userInfo.roleName}
              </span>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">已实名</span>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="ml-auto size-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-gray-100">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-primary">24</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider">累计上报</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-warning">03</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider">待核实</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold text-success">128</span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider">安全积分</span>
          </div>
        </div>
      </div>

      <main className="px-4 mt-6 space-y-6 pb-10">
        {(hasPermission('backoffice') || hasPermission('permissions')) && (
          <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">shield_person</span>
               系统管理权限
            </h3>
            <div className="grid grid-cols-2 gap-3">
               {hasPermission('backoffice') && (
                 <button 
                    onClick={() => onNavigate('backoffice')}
                    className="flex flex-col items-center gap-2 p-4 bg-primary/5 rounded-2xl active:bg-primary/10 transition-colors"
                 >
                    <span className="material-symbols-outlined text-primary text-3xl">manage_accounts</span>
                    <span className="text-xs font-bold">审核中心</span>
                 </button>
               )}
               {hasPermission('permissions') && (
                 <button 
                    onClick={() => onNavigate('permissions')}
                    className="flex flex-col items-center gap-2 p-4 bg-warning/5 rounded-2xl active:bg-warning/10 transition-colors"
                 >
                    <span className="material-symbols-outlined text-warning text-3xl">security</span>
                    <span className="text-xs font-bold">权限策略</span>
                 </button>
               )}
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">账号资料</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-gray-500">所属单位</span>
              <span className="text-sm text-gray-800 font-bold">{userInfo.unit}</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 text-gray-700">
              <span className="material-symbols-outlined text-primary">history</span>
              <span className="text-sm font-semibold">历史记录</span>
            </div>
            <span className="material-symbols-outlined text-gray-300">chevron_right</span>
          </button>
        </section>
      </main>
    </div>
  );
};

export default Mine;
