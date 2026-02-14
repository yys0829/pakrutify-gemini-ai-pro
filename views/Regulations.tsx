
import React, { useEffect, useState } from 'react';
// ⚠️ 修正后的路径：根据你的项目结构，从 views 回退一级到 src，再进入 services
import { supabase } from '../services/supabaseClient'; 

const Regulations = () => {
  const [regulations, setRegulations] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. 初始化读取：只认数据库，彻底干掉“刷新又出现”的原始文件
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('safety_regulations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRegulations(data || []);
    } catch (err: any) {
      console.error("加载失败:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. 上传逻辑：文件进仓库 + 记录进账本
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // 自动重命名，避开中文/空格报错
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

    try {
      // A. 上传文件
      const { error: storageError } = await supabase.storage
        .from('regulations')
        .upload(fileName, file);
      if (storageError) throw storageError;

      // B. 获取链接
      const { data: { publicUrl } } = supabase.storage.from('regulations').getPublicUrl(fileName);

      // C. 写入数据库
      const { error: dbError } = await supabase
        .from('safety_regulations')
        .insert([{ title: file.name, file_url: publicUrl, category: category }]);
      if (dbError) throw dbError;

      await fetchData(); // 刷新列表
    } catch (err: any) {
      alert("上传失败: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. 删除逻辑：从数据库彻底抹除，永不反弹
  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要永久删除吗？")) return;
    try {
      const { error } = await supabase.from('safety_regulations').delete().eq('id', id);
      if (error) throw error;
      setRegulations(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert("删除失败");
    }
  };

  const categories = [
    "国家安全环保法律法规",
    "集团公司安全环保制度",
    "二级单位安全环保制度",
    "三级单位安全环保制度"
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-24">
      <h2 className="text-center font-bold text-lg mb-6 text-blue-900">安全环保制度库</h2>
      
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-bold text-gray-800 text-sm">{cat}</span>
              <label className="text-blue-500 text-xs font-medium bg-blue-50 px-3 py-1 rounded-full cursor-pointer">
                上传制度
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, cat)} />
              </label>
            </div>

            {/* 列表显示 */}
            <div className="space-y-2">
              {regulations.filter(r => r.category === cat).map(item => (
                <div key={item.id} className="flex justify-between items-center py-2 text-sm border-b border-gray-50 last:border-0">
                  <span className="text-gray-600 truncate flex-1 mr-4">{item.title}</span>
                  <div className="flex space-x-4 flex-shrink-0">
                    <a href={item.file_url} target="_blank" rel="noreferrer" className="text-blue-400">查看</a>
                    <button onClick={() => handleDelete(item.id)} className="text-red-300">删除</button>
                  </div>
                </div>
              ))}
              {regulations.filter(r => r.category === cat).length === 0 && !loading && (
                <p className="text-center text-gray-300 text-xs py-2">暂无文件</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {uploading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50 font-bold text-blue-600">
          同步数据库中...
        </div>
      )}
    </div>
  );
};

// ⚠️ 这里的名称必须和文件名一致，确保 Vercel 构建通过
export default Regulations;
