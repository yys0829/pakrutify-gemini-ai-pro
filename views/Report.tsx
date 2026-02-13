import React, { useState } from 'react';
import { supabase } from '../services/reportService';

const Report: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 选择照片或拍照
  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
  // ... 前面代码不变
  
  console.log("准备上传文件:", file.name); //

  const { data, error: uploadError } = await supabase.storage
    .from('hazards')
    .upload(filePath, file);

  if (uploadError) {
    console.error("上传报错详情:", uploadError); // 如果这里报错，就能看到原因
    throw uploadError;
  }

  console.log("上传成功，返回数据:", data); //
  alert('照片上传成功！');
};
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 预览照片
      setPreviewUrl(URL.createObjectURL(file));

      // 1. 上传图片到 Storage 桶
      const { error: uploadError } = await supabase.storage
        .from('hazards')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      alert('照片上传成功！');
    } catch (error: any) {
      alert('操作失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-black text-gray-800">隐患快速上报</h2>
      
      {/* 拍照预览区域 */}
      <div className="w-full aspect-video bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
        {previewUrl ? (
          <img src={previewUrl} className="w-full h-full object-cover" alt="预览" />
        ) : (
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-gray-400">add_a_photo</span>
            <p className="text-gray-400 text-sm mt-2">点击下方按钮拍摄现场照片</p>
          </div>
        )}
      </div>

      {/* 隐藏的输入框，专门用来调起摄像头 */}
      <div className="relative">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" // 这一行是关键，强制调用后置摄像头
          onChange={handleCapture}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <button className={`w-full h-16 rounded-2xl font-bold text-white shadow-lg transition-all ${uploading ? 'bg-gray-400' : 'bg-[#0052D9] active:scale-95'}`}>
          {uploading ? '正在处理照片...' : '立即拍照/上传照片'}
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <p className="text-xs text-blue-600 font-bold leading-relaxed">
          💡 提示：请确保照片清晰展示安全隐患的具体位置和现状。
        </p>
      </div>
    </div>
  );
};

export default Report;
