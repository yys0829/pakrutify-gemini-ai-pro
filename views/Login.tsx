
import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (data: { name: string; unitLabel: string; role: UserRole; roleName: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [role, setRole] = useState<UserRole>('WORKER');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const units = [
    { value: 'office', label: '机关部室' },
    { value: 'mining', label: '采矿厂' },
    { value: 'processing', label: '选矿厂' },
    { value: 'smelting', label: '冶炼厂' },
    { value: 'tech', label: '生产技术部' },
    { value: 'safety', label: '安全环保部' },
    { value: 'quality', label: '质检计量部' },
    { value: 'logistics', label: '后勤保障部' },
    { value: 'equipment', label: '物资设备部' },
    { value: 'other', label: '其他' }
  ];

  const roles: { value: UserRole, label: string }[] = [
    { value: 'ADMIN', label: '系统管理员' },
    { value: 'SAFETY_OFFICER', label: '安全管理人员' },
    { value: 'WORKER', label: '基层员工' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name || !unit || !password) {
      setError('请完整填写登录信息');
      return;
    }
    
    // 权限与密码逻辑
    if (role === 'ADMIN') {
      if (password !== 'Pakrut999') {
        setError('管理员密码错误');
        return;
      }
    } else {
      if (password !== '123456') {
        setError('初始密码错误，请输入 123456');
        return;
      }
    }

    setLoading(true);
    
    const selectedUnitLabel = units.find(u => u.value === unit)?.label || unit;
    const selectedRoleName = roles.find(r => r.value === role)?.label || '普通用户';

    setTimeout(() => {
      setLoading(false);
      onLogin({ name, unitLabel: selectedUnitLabel, role, roleName: selectedRoleName });
    }, 800);
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 max-w-[480px] mx-auto overflow-y-auto no-scrollbar">
      <div className="mb-8 text-center shrink-0">
        <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="material-symbols-outlined text-primary text-5xl">security</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#111418] tracking-tight">中色国矿帕鲁特公司安全管理平台</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium italic">Pakrut SafetyGuard Platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 shrink-0 pb-10">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">真实姓名</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">badge</span>
            <input 
              type="text" 
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
              placeholder="请输入您的姓名"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">所属单位</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">corporate_fare</span>
            <select 
              value={unit}
              onChange={(e) => { setUnit(e.target.value); setError(null); }}
              className="w-full h-12 pl-12 pr-10 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm appearance-none"
            >
              <option value="" disabled>请选择所属单位</option>
              {units.map(u => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">模拟身份角色</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                  role === r.value ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">
            登录密码 {role === 'ADMIN' ? '(管理员专有)' : '(初始: 123456)'}
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
            <input 
              type="password" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              className={`w-full h-12 pl-12 pr-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none text-sm ${error && password.length > 0 ? 'border-danger focus:ring-danger/10' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}
              placeholder="请输入登录密码"
            />
          </div>
          {error && <p className="text-[11px] text-danger font-bold mt-1.5 ml-1 animate-pulse">{error}</p>}
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            '立即进入平台'
          )}
        </button>
      </form>

      <div className="mt-auto py-8 text-center shrink-0">
        <p className="text-xs text-gray-400 leading-relaxed">
          管理员：<span className="text-primary font-medium">Pakrut999</span><br/>
          普通用户初始密码：<span className="text-primary font-medium">123456</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
