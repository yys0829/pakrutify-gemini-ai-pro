
import React, { useState } from 'react';
import { supabase } from '../services/reportService'; 

interface LoginProps {
  onLogin: (data: { name: string; unitLabel: string; role: any; roleName: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(''); // 存放6位验证码
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email'); // 步骤控制
  const [error, setError] = useState<string | null>(null);

  // 第一步：发送验证码邮件
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: false } // 只允许名单内的人登录
      });
      if (authError) throw authError;
      setStep('code'); // 进入验证码输入环节
    } catch (err: any) {
      setError(err.message === 'User not found' ? '该邮箱不在名单内' : '发送失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 第二步：验证验证码（完整严密版）
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // 1. 开始显示“校验中”
    setError(null);
    
    try {
      console.log("正在尝试验证邮箱:", email, "验证码:", token);

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email' // 注意：建议这里先统一改为 'email'，它的兼容性最强
      });

      if (verifyError) {
        // 如果 Supabase 返回了明确的错误（如验证码错、已过期）
        throw verifyError;
      }

      // 如果走到这里，说明验证成功了
      console.log("验证成功！", data);
      
      // 注意：如果登录成功后页面没跳，可能是 App.tsx 还没反应过来
      // 这里不需要写 setLoading(false)，因为页面即将跳转/刷新

    } catch (err: any) {
      // 2. 关键点：无论发生什么错误，都要把“校验中”停下来
      console.error("验证过程发生错误:", err);
      
      // 将具体的错误信息显示给用户
      if (err.message === 'User not found') {
        setError('该账号未激活或不在名单内');
      } else if (err.status === 401 || err.status === 403) {
        setError('验证码错误或已失效，请重新获取');
      } else {
        setError(err.message || '网络连接超时，请检查手机网络');
      }

      setLoading(false); // 3. 必须重置状态，让按钮恢复点击
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 max-w-[480px] mx-auto overflow-y-auto no-scrollbar">
      <div className="mb-8 text-center shrink-0">
        <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="material-symbols-outlined text-primary text-5xl">verified_user</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#111418]">安全管理平台</h1>
        <p className="text-sm text-gray-500 mt-2">{step === 'email' ? '邮箱验证登录' : '已向您的邮箱发送验证码'}</p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">企业邮箱</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
              placeholder="example@pakrut.com"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg">
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
              className="w-full h-14 px-4 text-center text-2xl tracking-[1em] font-bold rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg">
            {loading ? '校验中...' : '立即登录'}
          </button>
          <button type="button" onClick={() => setStep('email')} className="w-full text-sm text-gray-400 font-bold">返回修改邮箱</button>
        </form>
      )}

      {error && <p className="text-center text-red-500 text-xs mt-4 font-bold">{error}</p>}
    </div>
  );
};

export default Login;
