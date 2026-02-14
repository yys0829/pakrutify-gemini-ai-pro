
import React, { useEffect, useState } from 'react';
// ⚠️ 现在这个路径是 100% 正确的，因为我们刚在 services 里建了它
import { supabase } from '../services/supabaseClient'; 

const Regulations = () => {
  const [regulations, setRegulations] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 1. 读取数据
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('safety_regulations')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setRegulations(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. 上传数据
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;

    try {
      // 上传文件
      const { error: uploadError } = await supabase.storage
        .from('regulations')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      // 获取链接
      const { data: { publicUrl } } = supabase.storage.from('regulations').getPublicUrl(fileName);

      // 存入数据库
      const { error: dbError } = await supabase
        .from('safety_regulations')
        .insert([{ title: file.name, file_url: publicUrl, category: category }]);
      if (dbError) throw dbError;

      fetchData(); // 刷新
    } catch (error: any) {
      alert("上传失败: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 3. 删除数据
  const handleDelete = async (id: string) => {
    if (!window.confirm("确定删除吗？")) return;
    const { error } = await supabase.from('safety_regulations').delete().eq('id', id);
    if (!error) setRegulations(prev => prev.filter(r => r.id !== id));
  };

  const categories = ["国家安全环保法律法规", "集团公司安全环保制度", "二级单位安全环保制度", "三级单位安全环保制度"];

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-24">
      <h2 className="text-center font-bold text-lg mb-6 text-blue-900">安全环保制度库</h2>
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-bold text-sm text-gray-800">{cat}</span>
              <label className="text-blue-500 text-xs bg-blue-50 px-3 py-1 rounded-full cursor-pointer">
                上传
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, cat)} />
              </label>
            </div>
            {regulations.filter(r => r.category === cat).map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 text-sm border-b last:border-0">
                <span className="truncate mr-2 text-gray-600">{item.title}</span>
                <div className="flex space-x-3 shrink-0">
                  <a href={item.file_url} target="_blank" className="text-blue-500">查看</a>
                  <button onClick={() => handleDelete(item.id)} className="text-red-400">删除</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {uploading && <div className="fixed inset-0 bg-white/80 flex items-center justify-center font-bold text-blue-600">处理中...</div>}
    </div>
  );
};

export default Regulations;
