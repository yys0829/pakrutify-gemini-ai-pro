
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient'; // 确认路径是否正确

const SafetyLibrary = () => {
  // 1. 状态管理：只认数据库里的真数据，彻底告别“刷新后原始文件又出现”
  const [regulations, setRegulations] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 2. 初始化：从数据库 safety_regulations 表读取数据
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('safety_regulations')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) {
      setRegulations(data || []); // ⚠️ 这样就清空了代码里写死的旧文件
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. 上传功能：同时完成“进仓库”和“入账本”
  const handleUpload = async (e, category) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    // 使用时间戳重命名，彻底解决中文名无法上传的问题
    const fileName = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
    
    // A. 上传到存储桶 (Storage)
    const { error: storageError } = await supabase.storage
      .from('regulations')
      .upload(fileName, file);

    if (storageError) {
      alert("上传仓库失败: " + storageError.message);
      setUploading(false);
      return;
    }

    // B. 获取链接并存入数据库表 (Table)
    const { data: { publicUrl } } = supabase.storage.from('regulations').getPublicUrl(fileName);
    const { error: dbError } = await supabase.from('safety_regulations').insert([
      { title: file.name, file_url: publicUrl, category: category }
    ]);

    if (dbError) {
      alert("记录保存失败: " + dbError.message);
    } else {
      fetchData(); // 成功后刷新列表
    }
    setUploading(false);
  };

  // 4. 删除功能：从数据库彻底抹除，刷新也不会再出来
  const handleDelete = async (id) => {
    if (!window.confirm("确定要永久删除此制度文件吗？")) return;
    const { error } = await supabase.from('safety_regulations').delete().eq('id', id);
    if (!error) {
      setRegulations(prev => prev.filter(item => item.id !== id));
    } else {
      alert("删除失败");
    }
  };

  const sections = [
    { title: "国家安全环保法律法规", icon: "⚖️" },
    { title: "集团公司安全环保制度", icon: "🌐" },
    { title: "二级单位安全环保制度", icon: "🏢" },
    { title: "三级单位安全环保制度", icon: "🏭" }
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen pb-20">
      <h2 className="text-center font-bold text-xl text-blue-900 mb-6">安全环保制度库</h2>
      
      <div className="space-y-4">
        {sections.map(section => (
          <div key={section.title} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{section.icon}</span>
                <span className="font-bold text-gray-800">{section.title}</span>
              </div>
              <label className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors">
                上传新文件
                <input type="file" className="hidden" onChange={(e) => handleUpload(e, section.title)} />
              </label>
            </div>

            {/* 渲染该分类下的真数据 */}
            <div className="space-y-2">
              {regulations.filter(r => r.category === section.title).map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-700 truncate mr-4">{item.title}</span>
                  <div className="flex space-x-4 flex-shrink-0">
                    <a href={item.file_url} target="_blank" className="text-blue-500 font-medium">查看</a>
                    <button onClick={() => handleDelete(item.id)} className="text-red-400">删除</button>
                  </div>
                </div>
              ))}
              {regulations.filter(r => r.category === section.title).length === 0 && (
                <p className="text-center text-gray-400 text-xs py-2">暂无制度文件</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {uploading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl font-bold text-blue-600">处理中，请稍候...</div>
        </div>
      )}
    </div>
  );
};

export default SafetyLibrary;
