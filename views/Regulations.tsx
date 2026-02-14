
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const Regulations = () => {
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 1. 封装获取数据函数，增加强制刷新逻辑
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // 直接拉取最新的数据库记录
      const { data, error } = await supabase
        .from('safety_regulations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRegulations(data || []);
      console.log("数据拉取成功:", data.length, "条记录");
    } catch (err: any) {
      console.error("加载失败:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. 核心修复：多重触发机制
  useEffect(() => {
    // 触发 1：初次进入页面加载
    fetchData();

    // 触发 2：监听应用切回前台（解决切换页面回来后数据消失的问题）
    const handleRefresh = () => {
      console.log("检测到页面切回，自动刷新数据...");
      fetchData();
    };

    // 监听手机切回、标签页切换
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleRefresh();
    });
    
    return () => {
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [fetchData]);

  // 3. 上传逻辑：确保写入后立即重拉
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

    try {
      // A. 上传文件到 Storage
      const { error: storageError } = await supabase.storage
        .from('regulations')
        .upload(fileName, file);
      if (storageError) throw storageError;

      // B. 获取文件公开链接
      const { data: { publicUrl } } = supabase.storage.from('regulations').getPublicUrl(fileName);

      // C. 写入数据库
      const { error: dbError } = await supabase
        .from('safety_regulations')
        .insert([{ 
          title: file.name, 
          file_url: publicUrl, 
          category: category 
        }]);
      
      if (dbError) throw dbError;

      // D. 极其关键：上传完立刻手动触发一次数据重拉
      await fetchData(); 
      alert("制度上传成功！");
    } catch (err: any) {
      alert("同步失败，请检查网络");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const categories = ["国家安全环保法律法规", "集团公司安全环保制度", "二级单位安全环保制度", "三级单位安全环保制度"];

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-lg text-blue-900">安全环保制度库</h2>
        <button 
          onClick={fetchData} 
          className="text-xs text-blue-500 bg-white px-2 py-1 rounded border"
        >
          {loading ? '同步中...' : '手动刷新'}
        </button>
      </div>

      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-bold text-gray-800 text-sm">{cat}</span>
              <label className="text-blue-500 text-xs font-medium bg-blue-50 px-3 py-1 rounded-full cursor-pointer">
                上传
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, cat)} />
              </label>
            </div>
            <div className="space-y-2">
              {regulations.filter(r => r.category === cat).map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-50 last:border-0">
                  <span className="text-gray-600 truncate flex-1 mr-4">{item.title}</span>
                  <a href={item.file_url} target="_blank" rel="noreferrer" className="text-blue-400 shrink-0">查看</a>
                </div>
              ))}
              {regulations.filter(r => r.category === cat).length === 0 && !loading && (
                <p className="text-center text-gray-300 text-[10px] py-1">暂无记录</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-blue-600 font-bold">云端同步中...</p>
        </div>
      )}
    </div>
  );
};

export default Regulations;
