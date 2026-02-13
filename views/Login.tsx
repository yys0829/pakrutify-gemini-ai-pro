
import React, { useState } from 'react';
import { supabase } from '../services/reportService'; 

interface LoginProps {
  onLogin: (data: { name: string; unitLabel: string; role: any; roleName: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email'); 
  const [error, setError] = useState<string | null>(null);

  // 第一步：发送验证码邮件
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: false } // 只允许已经在 profiles 表里的人登录
      });
      if (authError) throw authError;
      setStep('code'); 
    } catch (err: any) {
      console.error("发送失败:", err);
      // 捕获常见的频率限制或用户不存在错误
      setError(err.message || '发送过于频繁或账号未在名单中');
    } finally {
      setLoading(false); // 无论如何都停止转圈
    }
  };

  // 第二步：验证验证码
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email' // 使用兼容性最广的验证类型
      });

      if (verifyError) throw verifyError;

      // 验证成功后，App.tsx 的监听会自动检测到 session 并处理跳转
      console.log("登录验证成功:", data);

    } catch (err: any) {
      console.error("验证过程出错:", err);
      // 根据你之前的 403 报错进行友好提示
      if (err.status === 403 || err.message?.includes('403')) {
        setError('系统安全策略拦截（403），请10分钟后再试');
      } else {
        setError('验证码错误或已失效，请重新输入');
      }
    } finally {
      setLoading(false); // 报错后恢复按钮点击状态，防止卡死
    }
  };

  // 返回修改按钮逻辑
  const handleGoBack = () => {
    setStep('email');
    setLoading(false);
    setError(null);
    setToken('');
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 max-w-[480px] mx-auto overflow-y-auto no-scrollbar">
      <div className="mb-8 text-center shrink-0">
        <div className="size-20 bg-[#0052D9]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="material-symbols-outlined text-[#0052D9] text-5xl">verified_user</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#111418]">安全管理平台</h1>
        <p className="text-sm text-gray-500 mt-2">
          {step === 'email' ? '输入企业邮箱获取验证码' : '已向您的邮箱发送6位验证码'}
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">企业邮箱</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none transition-all"
              placeholder="请输入您的邮箱"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full h-14 bg-[#0052D9] text-white font-bold rounded-xl shadow-lg transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
          >
            {loading ? '发送中...' : '获取验证码'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">6位验证码</label>
            <input 
              type="text" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full h-14 px-4 text-center text-2xl tracking-[0.5em] font-bold rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full h-14 bg-[#0052D9] text-white font-bold rounded-xl shadow-lg transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
          >
            {loading ? '校验中...' : '立即登录'}
          </button>
          <button 
            type="button" 
            onClick={handleGoBack} 
            className="w-full py-2 text-sm text-gray-400 font-medium"
          >
            返回修改邮箱
          </button>
        </form>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100 text-center">
          <p className="text-red-500 text-xs font-bold leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Login;
