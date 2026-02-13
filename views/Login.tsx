
import React, { useState } from 'react';
import { supabase } from '../services/reportService'; 

interface LoginProps {
  onLogin: (data: { name: string; unitLabel: string; role: any; roleName: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  // 核心逻辑：初始化时检查本地是否存有“待验证邮箱”
  const [email, setEmail] = useState(() => localStorage.getItem('pending_email') || '');
  const [token, setToken] = useState(''); 
  const [loading, setLoading] = useState(false);
  // 如果本地有邮箱记忆，直接进入 code 步骤
  const [step, setStep] = useState<'email' | 'code'>(() => 
    localStorage.getItem('pending_email') ? 'code' : 'email'
  ); 
  const [error, setError] = useState<string | null>(null);

  // 第一步：发送验证码
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: false } 
      });
      if (authError) throw authError;
      
      // 发送成功，存入记忆
      localStorage.setItem('pending_email', email);
      setStep('code'); 
    } catch (err: any) {
      setError('发送失败，请确认邮箱是否在名单内');
    } finally {
      setLoading(false); 
    }
  };

  // 第二步：验证 6 位码
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      if (verifyError) throw verifyError;
      
      // 登录成功，清除记忆，下次登录需重新领码
      localStorage.removeItem('pending_email');
    } catch (err: any) {
      setError('验证码错误或已过期');
    } finally {
      setLoading(false); 
    }
  };

  // 手动返回：清除记忆并回到邮箱输入页
  const handleGoBack = () => {
    localStorage.removeItem('pending_email');
    setStep('email');
    setToken('');
    setError(null);
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-12 max-w-[480px] mx-auto">
      <div className="mb-10 text-center shrink-0">
        <div className="size-20 bg-[#0052D9]/10 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="material-symbols-outlined text-[#0052D9] text-5xl">shield_person</span>
        </div>
        <h1 className="text-2xl font-black text-[#111418] tracking-tight">安全管理平台</h1>
        <p className="text-gray-400 text-sm mt-2 font-medium">中色国矿帕鲁特公司</p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="animate-in fade-in duration-500">
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
            <label className="text-[11px] font-bold text-[#0052D9] uppercase tracking-widest block mb-2">企业邮箱</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-lg outline-none"
              placeholder="请输入您的邮箱"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full h-16 bg-[#0052D9] text-white text-lg font-bold rounded-2xl shadow-xl active:scale-95 transition-all">
            {loading ? '正在发送...' : '获取验证码'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="animate-in slide-in-from-right-4 duration-500 text-center">
          <p className="text-sm text-gray-500 mb-6 font-medium">验证码已发送至 <span className="text-[#111418] font-bold">{email}</span></p>
          
          {/* 6格专业输入样式 */}
          <div className="relative w-full mb-10">
             <div className="flex justify-between gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-black transition-all ${token.length === i ? 'border-[#0052D9] bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    {token[i] || ""}
                  </div>
                ))}
             </div>
             <input 
                type="text" 
                pattern="\d*"
                inputMode="numeric"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="absolute inset-0 opacity-0 cursor-default"
                autoFocus
             />
          </div>

          <button type="submit" disabled={loading || token.length < 6} className={`w-full h-16 bg-[#0052D9] text-white text-lg font-bold rounded-2xl shadow-xl active:scale-95 transition-all ${token.length < 6 ? 'opacity-50' : ''}`}>
            {loading ? '校验中...' : '立即登录'}
          </button>
          
          <button type="button" onClick={handleGoBack} className="mt-8 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors">
            返回修改邮箱
          </button>
        </form>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 text-center animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};

export default Login;
