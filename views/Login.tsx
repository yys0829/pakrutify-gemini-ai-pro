
// 第一步：发送验证码邮件
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
      setStep('code'); 
    } catch (err: any) {
      console.error("发送失败:", err);
      setError(err.message || '发送频率过快，请稍后再试');
    } finally {
      // 关键：无论成功失败，都必须关掉加载状态
      setLoading(false); 
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
        type: 'email' // 确保这里和后台配置匹配
      });
      if (verifyError) throw verifyError;
      
      // 验证成功后，通常页面会由 App.tsx 监听状态并跳转
    } catch (err: any) {
      console.error("验证失败:", err);
      setError(err.message === '403' ? '请求被拒绝，请稍后再试' : '验证码错误或已过期');
    } finally {
      // 关键：即使报错，也要让按钮变回“立即登录”，否则就卡死了
      setLoading(false); 
    }
  };

  // 返回修改邮箱的按钮逻辑也要确保状态重置
  const handleGoBack = () => {
    setStep('email');
    setLoading(false); // 强制重置加载状态
    setError(null);
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
          <button type="button" onClick={handleGoBack} className="w-full text-sm text-gray-400 font-bold">返回修改邮箱</button>
        </form>
      )}

      {error && <p className="text-center text-red-500 text-xs mt-4 font-bold">{error}</p>}
    </div>
  );
};

export default Login;
