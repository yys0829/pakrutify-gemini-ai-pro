
import React, { useState } from 'react';
import { supabase } from '../services/reportService'; 

interface LoginProps {
  onLogin: (data: { name: string; unitLabel: string; role: any; roleName: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('请输入您的邮箱地址');
      return;
    }

    setLoading(true);
    try {
      // --- 关键修改区开始 ---
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          // 这里是精髓：window.location.origin 会自动抓取你当前的网址
          // 确保用户点开邮件链接后，能准确跳回你现在的 Vercel 网站首页
          emailRedirectTo: window.location.origin, 
        },
      });
      // --- 关键修改区结束 ---

      if (authError) throw authError;
      setSent(true);
    } catch (err: any) {
      setError('发送失败：' + (err.message || '请检查邮箱格式'));
    } finally {
      setLoading(false);
    }
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

      {!sent ? (
        <form onSubmit={handleMagicLinkLogin} className="space-y-6 shrink-0 pb-10">
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <p className="text-xs text-blue-700 leading-relaxed text-center">
              请输入备案邮箱，我们将发送登录链接至您的邮箱。
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
                className={`w-full h-14 pl-12 pr-4 rounded-xl border bg-gray-50 focus:bg-white transition-all outline-none text-sm ${error ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="example@pakrut.com"
                required
              />
            </div>
            {error && <p className="text-[11px] text-red-500 font-bold mt-1.5 ml-1 animate-pulse">{error}</p>}
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              '获取登录链接'
            )}
          </button>
        </form>
      ) : (
        <div className="text-center py-10 space-y-6">
          <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800">邮件已发送</h2>
            <p className="text-sm text-gray-500 px-4">
              链接已发送至 <b>{email}</b>，请查看收件箱并点击链接。
            </p>
          </div>
          <button 
            onClick={() => setSent(false)}
            className="text-primary text-sm font-bold hover:underline"
          >
            返回修改邮箱
          </button>
        </div>
      )}

      <div className="mt-auto py-8 text-center shrink-0">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          管理人员请使用备案邮箱登录<br/>
          © 2026 Pakrut Gold Mine Safety Dept.
        </p>
      </div>
    </div>
  );
};

export default Login;
