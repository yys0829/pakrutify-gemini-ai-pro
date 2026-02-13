
import React, { useState } from 'react';
import { supabase } from '../services/reportService'; // 确保路径正确

interface LoginProps {
  // 登录成功后的回调，现在数据从数据库获取
  onLogin: (data: { name: string; role: string; email: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false); // 邮件是否发送成功
  const [error, setError] = useState<string | null>(null);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError('请输入您的企业邮箱');
      return;
    }

    setLoading(true);

    try {
      // 1. 调用 Supabase 发送魔术链接
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // 登录后跳回当前页面
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;

      // 2. 显示发送成功界面
      setSent(true);
    } catch (err: any) {
      setError(err.message || '邮件发送失败，请检查邮箱地址');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white px-8 pt-8 max-w-[480px] mx-auto overflow-y-auto no-scrollbar">
      {/* 头部 Logo 区域 */}
      <div className="mb-8 text-center shrink-0">
        <div className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span className="material-symbols-outlined text-primary text-5xl">mark_email_read</span>
        </div>
        <h1 className="text-xl font-extrabold text-[#111418] tracking-tight">中色国矿帕鲁特公司安全管理平台</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium italic">Pakrut SafetyGuard Platform</p>
      </div>

      {!sent ? (
        /* 第一阶段：输入邮箱 */
        <form onSubmit={handleMagicLinkLogin} className="space-y-6 shrink-0 pb-10">
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>无密码登录说明：</strong><br/>
              请输入您在系统备案的邮箱，点击下方按钮。我们将发送一封“魔术链接”邮件到您的邮箱，点击链接即可直接进入平台。
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">企业/个人邮箱</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
              <input 
                type="email" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className={`w-full h-14 pl-12 pr-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none text-sm ${error ? 'border-danger focus:ring-danger/10' : 'border-gray-200 focus:ring-primary/20 focus:border-primary'}`}
                placeholder="example@pakrut.com"
                required
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
              <>
                <span>获取登录链接</span>
                <span className="material-symbols-outlined text-xl">send</span>
              </>
            )}
          </button>
        </form>
      ) : (
        /* 第二阶段：提示去查收 */
        <div className="text-center py-10 space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">outgoing_mail</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">邮件已发出</h2>
            <p className="text-sm text-gray-500">
              我们已向 <span className="font-bold text-gray-800">{email}</span> 发送了登录链接。<br/>
              请检查收件箱（或垃圾箱），点击链接即可进入。
            </p>
          </div>
          <button 
            onClick={() => setSent(false)}
            className="text-primary text-sm font-bold hover:underline"
          >
            返回修改邮箱地址
          </button>
        </div>
      )}

      {/* 底部版权信息 */}
      <div className="mt-auto py-8 text-center shrink-0">
        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest">
          Secured by Supabase Auth<br/>
          © 2026 Pakrut Gold Mine Safety Dept.
        </p>
      </div>
    </div>
  );
};

export default Login;
