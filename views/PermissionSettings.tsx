
import React, { useState, useEffect } from 'react';
import { UserRole, PermissionKey } from '../types';

interface PermissionSettingsProps {
  onBack: () => void;
}

const PermissionSettings: React.FC<PermissionSettingsProps> = ({ onBack }) => {
  const [activeRole, setActiveRole] = useState<UserRole>('ADMIN');

  const roles: { id: UserRole, name: string }[] = [
    { id: 'ADMIN', name: '系统管理员' },
    { id: 'SAFETY_OFFICER', name: '安全管理人员' },
    { id: 'WORKER', name: '基层员工' },
  ];

  const allPermissions: { id: PermissionKey; name: string; group: string }[] = [
    { id: 'hazard', name: '隐患上报', group: '基础业务' },
    { id: 'violation', name: '违章上报', group: '基础业务' },
    { id: 'hazard_feedback', name: '隐患反馈', group: '基础业务' },
    { id: 'analytics', name: '数据看板', group: '管理功能' },
    { id: 'regulations', name: '制度库管理', group: '管理功能' },
    { id: 'report_list', name: '查看/导出清单', group: '管理功能' },
    { id: 'quiz', name: '每日答题', group: '基础业务' },
    { id: 'backoffice', name: '审核中心访问', group: '系统权限' },
    { id: 'permissions', name: '权限策略配置', group: '系统权限' },
  ];

  const [rolePermMap, setRolePermMap] = useState<Record<UserRole, PermissionKey[]>>({
    ADMIN: ['hazard', 'violation', 'hazard_feedback', 'report_list', 'quiz', 'analytics', 'regulations', 'backoffice', 'permissions'],
    SAFETY_OFFICER: ['hazard', 'violation', 'hazard_feedback', 'report_list', 'quiz', 'analytics', 'regulations'],
    WORKER: ['hazard', 'quiz', 'regulations', 'analytics']
  });

  useEffect(() => {
    const saved = localStorage.getItem('role_permissions');
    if (saved) {
      try {
        setRolePermMap(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const togglePermission = (permId: PermissionKey) => {
    setRolePermMap(prev => {
      const currentPerms = prev[activeRole];
      const newPerms = currentPerms.includes(permId)
        ? currentPerms.filter(id => id !== permId)
        : [...currentPerms, permId];
      
      return {
        ...prev,
        [activeRole]: newPerms
      };
    });
  };

  const handleSave = () => {
    localStorage.setItem('role_permissions', JSON.stringify(rolePermMap));
    alert('权限策略已成功保存，刷新页面后对所有用户生效。');
  };

  return (
    <div className="flex flex-col h-screen bg-background-light overflow-hidden">
      <header className="flex items-center bg-white px-4 py-3 border-b border-gray-100">
        <button onClick={onBack} className="flex size-10 items-center justify-start text-primary">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="text-[#111418] text-lg font-bold flex-1 text-center pr-10">权限设置</h1>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-28 bg-white border-r border-gray-100 flex flex-col shrink-0">
          {roles.map(role => (
            <button 
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              className={`p-4 text-xs font-bold border-l-4 transition-all text-left ${
                activeRole === role.id ? 'bg-primary/5 border-primary text-primary' : 'border-transparent text-gray-400'
              }`}
            >
              {role.name}
            </button>
          ))}
        </aside>

        <section className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <div className="mb-4">
             <h3 className="text-sm font-bold text-gray-800">当前角色权限配置</h3>
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
               编辑中: {roles.find(r => r.id === activeRole)?.name}
             </p>
          </div>

          <div className="space-y-6">
            {Array.from(new Set(allPermissions.map(p => p.group))).map(groupName => (
              <div key={groupName} className="space-y-3">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{groupName}</h4>
                 <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50 shadow-sm">
                   {allPermissions.filter(p => p.group === groupName).map(p => (
                     <div key={p.id} className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
                        <span className="text-xs font-medium text-gray-700">{p.name}</span>
                        <button 
                           onClick={() => togglePermission(p.id)}
                           className={`w-10 h-6 rounded-full transition-all relative ${rolePermMap[activeRole].includes(p.id) ? 'bg-primary' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${rolePermMap[activeRole].includes(p.id) ? 'left-5 shadow-md' : 'left-1'}`}></div>
                        </button>
                     </div>
                   ))}
                 </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pb-10">
             <button 
              onClick={handleSave}
              className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
             >
                <span className="material-symbols-outlined">save</span>
                <span>保存该角色权限配置</span>
             </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PermissionSettings;
