
import React, { useEffect, useState } from 'react';
// ⚠️ 关键修复：确保这里的路径指向你项目中的 services 文件夹
import { supabase } from '../services/supabaseClient'; 

const Regulations = () => {
  const [regulations, setRegulations] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 获取数据库真实数据
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('safety_regulations')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setRegulations(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 彻底删除功能
  const handleDelete = async (id) => {
    if (!window.confirm("确定要永久删除吗？")) return;
    const { error } = await supabase.from('safety_regulations').delete().eq('id', id);
    if (!error) setRegulations(prev => prev.filter(r => r.id !== id));
  };

  // 上传逻辑
  const handleUpload = async (e, category) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
    
    const { error: storageError } = await supabase.storage.from('regulations').upload(fileName, file);
    if (storageError) {
      alert("上传失败");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('regulations').getPublicUrl(fileName);
    await supabase.from('safety_regulations').insert([
      { title: file.name, file_url: publicUrl, category: category }
    ]);
    
    fetchData();
    setUploading(false);
  };

  const categories = ["国家安全环保法律法规", "集团公司安全环保制度", "二级单位安全环保制度", "三级单位安全环保制度"];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-center font-bold text-lg mb-4 text-blue-900">安全环保制度库</h2>
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat} className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center border-b pb-2 mb-2">
              <span className="font-bold text-sm">{cat}</span>
              <label className="text-blue-500 text-xs cursor-pointer bg-blue-50 px-2 py-1 rounded">
                上传 <input type="file" className="hidden" onChange={(e) => handleUpload(e, cat)} />
              </label>
            </div>
            {regulations.filter(r => r.category === cat).map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 text-sm border-b last:border-0">
                <span className="text-gray-600 truncate mr-2">{item.title}</span>
                <div className="flex space-x-3 flex-shrink-0">
                  <a href={item.file_url} target="_blank" className="text-blue-400">查看</a>
                  <button onClick={() => handleDelete(item.id)} className="text-red-300">删除</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {uploading && <div className="fixed inset-0 bg-white/80 flex items-center justify-center">上传中...</div>}
    </div>
  );
};

export default Regulations;
