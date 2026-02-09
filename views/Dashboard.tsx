
import React from 'react';
import { ViewState, UserInfo, PermissionKey } from '../types';
import { MOCK_NOTIFICATIONS } from '../constants';

interface DashboardProps {
  userInfo: UserInfo;
  hasPermission: (permission: PermissionKey) => boolean;
  onNavigate: (view: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userInfo, hasPermission, onNavigate }) => {
  return (
    <>
      <header className="sticky top-0 z-50 bg-primary text-white p-4 pb-6 rounded-b-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="size-10 rounded-full border-2 border-white/30 bg-center bg-no-repeat bg-cover" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHMns_SlZOwEdrfxB9r86qupk0btT47h7Wzp3AV7YrzWiRKEXWoLQ2yFMWHE56yq6XBfJX46KCeybcMe7hAFSa7EeF1CC7CBM0eowpHCvYbO4b70jb9SdbrqmXidUkWcpoe8GHVFn5pEnQOdatCDeTlrV2w7Ki_PpjUElCA-RmVPIJD5wZLHvEEa9OMWEpLNmF6l_YXiZ1acwzHCykZg27Xlg-JVJJNThmDa6P9WdsRkUCbUO3Vf1Lcdx4Cq2bcBaAaPnsiVBRAKPm")' }}
            ></div>
            <div>
              <p className="text-[10px] opacity-80 uppercase tracking-widest">{userInfo.unit}</p>
              <h2 className="text-lg font-bold leading-tight">{userInfo.name} ({userInfo.roleName})</h2>
            </div>
          </div>
          <button className="size-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-white">notifications</span>
          </button>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
            <p className="text-[10px] font-medium opacity-80 mb-1">已处理任务</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold">12</span>
              <span className="text-[8px] bg-success text-white px-1.5 py-0.5 rounded-full font-bold">优秀</span>
            </div>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
            <p className="text-[10px] font-medium opacity-80 mb-1">今日积分</p>
            <div className="flex items-end justify-between">
              <span className="text-xl font-bold">450</span>
              <span className="text-[8px] bg-warning text-white px-1.5 py-0.5 rounded-full font-bold">排名 05</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 -mt-3 pb-24 no-scrollbar">
        <div className="bg-white rounded-xl shadow-sm border border-[#dce0e5] p-4 mb-6 relative z-10">
          <h3 className="text-[#111418] text-sm font-bold mb-4">核心任务</h3>
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {hasPermission('hazard') && (
              <button onClick={() => onNavigate('hazard')} className="flex flex-col items-center gap-2 group">
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-xl">report_problem</span>
                </div>
                <span className="text-[10px] font-bold text-[#111418]">隐患上报</span>
              </button>
            )}

            {hasPermission('hazard_feedback') && (
              <button onClick={() => onNavigate('hazard_feedback')} className="flex flex-col items-center gap-2 group">
                <div className="size-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-xl">chat_bubble</span>
                </div>
                <span className="text-[10px] font-bold text-[#111418]">隐患反馈</span>
              </button>
            )}
            
            {hasPermission('violation') && (
              <button onClick={() => onNavigate('violation')} className="flex flex-col items-center gap-2 group">
                <div className="size-11 rounded-2xl bg-danger/10 flex items-center justify-center text-danger group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-xl">gavel</span>
                </div>
                <span className="text-[10px] font-bold text-[#111418]">违章上报</span>
              </button>
            )}

            {hasPermission('report_list') && (
              <button onClick={() => onNavigate('report_list')} className="flex flex-col items-center gap-2 group">
                <div className="size-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-xl">format_list_bulleted</span>
                </div>
                <span className="text-[10px] font-bold text-[#111418]">隐患清单</span>
              </button>
            )}

            {hasPermission('quiz') && (
              <button onClick={() => onNavigate('quiz')} className="flex flex-col items-center gap-2 group">
                <div className="size-11 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-xl">quiz</span>
                </div>
                <span className="text-[10px] font-bold text-[#111418]">答题积分</span>
              </button>
            )}

            {hasPermission('analytics') && (
              <button onClick={() => onNavigate('analytics')} className="flex flex-col items-center gap-2 group">
                <div className="size-11 rounded-2xl bg-warning/10 flex items-center justify-center text-warning group-active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-xl">analytics</span>
                </div>
                <span className="text-[10px] font-bold text-[#111418]">数据看板</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {hasPermission('regulations') && (
            <button onClick={() => onNavigate('regulations')} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#dce0e5] active:bg-gray-50 text-left">
              <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
              <span className="text-xs font-semibold">规章制度</span>
            </button>
          )}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#dce0e5] active:bg-gray-50">
            <span className="material-symbols-outlined text-primary text-xl">checklist</span>
            <span className="text-xs font-semibold">岗位巡检</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[#111418] text-base font-bold">通知公告</h3>
            <button className="text-primary text-xs font-medium">更多</button>
          </div>
          <div className="space-y-3">
            {MOCK_NOTIFICATIONS.map(note => (
              <div key={note.id} className="flex gap-4 bg-white p-3 rounded-xl border border-[#dce0e5]">
                <div className={`size-8 shrink-0 rounded-full flex items-center justify-center ${
                  note.type === 'info' ? 'bg-primary/10 text-primary' :
                  note.type === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {note.type === 'info' ? 'campaign' : note.type === 'warning' ? 'priority_high' : 'check_circle'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#111418] line-clamp-1">{note.title}</span>
                    <span className="text-[9px] text-gray-500 whitespace-nowrap">{note.time}</span>
                  </div>
                  <p className="text-[10px] text-gray-600 line-clamp-2 leading-relaxed">{note.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
