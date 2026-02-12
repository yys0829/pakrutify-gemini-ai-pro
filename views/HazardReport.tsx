
import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai'; // 切换到 OpenAI 库
import { getNextSerialNumber, savePendingItem } from '../services/reportService';

// 初始化硅基流动客户端
// --- 修改後的初始化代碼 ---
const client = new OpenAI({
  apiKey: "sk-pkclwfqlercrgslajypqyazqemcgtwareqcgihnjdzyvrhju", 
  baseURL: "https://api.siliconflow.cn/v1",
  dangerouslyAllowBrowser: true 
});

interface HazardReportProps {
  onBack: () => void;
}

const HazardReport: React.FC<HazardReportProps> = ({ onBack }) => {
  const [level, setLevel] = useState('一般');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('定位中...');
  const [images, setImages] = useState<string[]>([]);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPhotoSource, setShowPhotoSource] = useState(false);
  
  const albumInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`纬度: ${pos.coords.latitude.toFixed(4)}, 经度: ${pos.coords.longitude.toFixed(4)}`);
      }, () => {
        setLocation('定位获取失败');
      });
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 4));
      setShowPhotoSource(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- 核心修改：使用硅基流动生成报告 ---
  const handleGenerate = async () => {
    if (!description || !unit) {
      alert('请填写必要信息（责任单位和隐患描述）');
      return;
    }
    setLoading(true);

    try {
      // --- 修改后的核心调用逻辑 ---
const response = await client.chat.completions.create({
  model: "Qwen/Qwen2.5-7B-Instruct", // 确保这里是你想要的通义千问模型
  messages: [
    { 
      role: "system", 
      content: "你是一个专业的矿山安全专家..." 
    },
    { 
      role: "user", 
      content: `隐患级别：${level}\n责任单位：${unit}\n隐患描述：${description}\n地点：${location}` 
    }
  ],
  temperature: 0.7,
});
      const result = response.choices[0].message.content;
      setGeneratedContent(result);
      setShowResultModal(true);
    } catch (error: any) {
      console.error("AI生成失败:", error);
      alert(`AI生成失败: ${error.message || '请检查API Key配置'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    const newId = getNextSerialNumber();
    const reportData = {
      id: newId,
      level,
      description,
      unit,
      location,
      images,
      deadline,
      responsiblePerson,
      isCompleted: false,
      reportContent: generatedContent,
    };
    savePendingItem('hazards', reportData);
    alert(`隐患已提交，编号为：${newId}。请等待管理员确认。`);
    setShowResultModal(false);
    onBack();
  };

  const handleSaveDraft = () => {
    const draft = { level, description, unit, location, images, deadline, responsiblePerson, timestamp: Date.now() };
    localStorage.setItem('hazard_draft', JSON.stringify(draft));
    alert('草稿已保存到本地设备');
  };

  const handlePreview = () => {
    if (!description) {
      alert('请至少填写隐患描述以便预览');
      return;
    }
    const previewText = `【预览】安全隐患排查报告\n\n责任单位：${unit || '未选择'}\n责任人：${responsiblePerson || '待定'}\n整改时限：${deadline || '未设置'}\n隐患级别：${level}\n地理位置：${location}\n隐患描述：${description}\n附件图片：${images.length}张`;
    setGeneratedContent(previewText);
    setShowResultModal(true);
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <header className="flex items-center bg-white px-4 py-3 border-b border-primary/10 shrink-0">
        <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-start text-primary">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="text-[#111418] text-lg font-bold flex-1 text-center pr-10">隐患上报</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 no-scrollbar">
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <p className="text-sm font-semibold text-primary/80 uppercase tracking-wider">新建安全隐患单 (2026系列)</p>
          </div>
        </div>

        <section className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#111418] text-base font-bold">现场照片证据</h3>
            <span className="text-xs text-gray-500 font-medium">{images.length} / 4 张</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                <img src={img} className="w-full h-full object-cover" alt={`preview-${idx}`} />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full size-5 flex items-center justify-center text-white"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button 
                onClick={() => setShowPhotoSource(true)}
                className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors"
              >
                <span className="material-symbols-outlined text-primary text-2xl">add_a_photo</span>
                <span className="text-[10px] text-primary font-bold mt-1">上传照片</span>
              </button>
            )}
          </div>
          
          <input type="file" ref={albumInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
          <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
        </section>

        <div className="space-y-6 px-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#111418] text-sm font-bold">责任单位 <span className="text-red-500">*</span></label>
            <div className="relative">
              <select 
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-[#dce0e5] bg-white h-12 px-4 focus:ring-primary focus:border-primary transition-all appearance-none text-sm"
              >
                <option value="" disabled>请选择负责整改的部门</option>
                <option value="机关部室">机关部室</option>
                <option value="采矿厂">采矿厂</option>
                <option value="选矿厂">选矿厂</option>
                <option value="冶炼厂">冶炼厂</option>
                <option value="生产技术部">生产技术部</option>
                <option value="安全环保部">安全环保部</option>
                <option value="质检计量部">质检计量部</option>
                <option value="后勤保障部">后勤保障部</option>
                <option value="物资设备部">物资设备部</option>
                <option value="其他">其他</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[#111418] text-sm font-bold">责任人</label>
              <input 
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                placeholder="填写责任人姓名"
                className="w-full h-12 rounded-xl border border-[#dce0e5] px-4 text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#111418] text-sm font-bold">整改时限</label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-12 rounded-xl border border-[#dce0e5] px-4 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#111418] text-sm font-bold">风险等级</label>
            <div className="flex gap-3">
              {['一般', '重大'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setLevel(lvl)}
                  className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${
                    level === lvl 
                    ? (lvl === '一般' ? 'border-primary bg-primary text-white shadow-md' : 'border-danger bg-danger text-white shadow-md') 
                    : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  {lvl}隐患
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#111418] text-sm font-bold">隐患具体描述 <span className="text-red-500">*</span></label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-[#dce0e5] min-h-[160px] p-4 text-sm placeholder:text-gray-300 focus:ring-primary focus:border-primary transition-all resize-none leading-relaxed" 
              placeholder="请输入详细描述..."
            ></textarea>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-white/90 backdrop-blur-lg border-t border-gray-100 flex flex-col gap-3 z-50">
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin">sync</span>
          ) : (
            <>
              <span className="material-symbols-outlined">auto_fix</span>
              <span>智能生成整改通知书</span>
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-6 py-1">
          <button onClick={handleSaveDraft} className="text-sm text-gray-500 font-bold flex items-center gap-1.5 active:text-primary">
            <span className="material-symbols-outlined text-lg">drive_file_rename_outline</span>
            存为草稿
          </button>
          <div className="w-px h-4 bg-gray-200"></div>
          <button onClick={handlePreview} className="text-sm text-gray-500 font-bold flex items-center gap-1.5 active:text-primary">
            <span className="material-symbols-outlined text-lg">visibility</span>
            预览效果
          </button>
        </div>
      </footer>

      {/* Photo Source Selector */}
      {showPhotoSource && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowPhotoSource(false)}></div>
          <div className="bg-white w-full max-w-[480px] rounded-t-3xl p-6 pb-10 space-y-4 animate-in slide-in-from-bottom duration-300 relative z-[120]">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2"></div>
             <h3 className="text-center text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">选择图片来源</h3>
             
             <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-16 bg-gray-50 rounded-2xl flex items-center px-6 gap-4 active:bg-gray-100 transition-colors border border-gray-100"
             >
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">即时拍照</p>
                  <p className="text-[10px] text-gray-400">使用系统相机拍摄现场情况</p>
                </div>
             </button>

             <button 
              onClick={() => albumInputRef.current?.click()}
              className="w-full h-16 bg-gray-50 rounded-2xl flex items-center px-6 gap-4 active:bg-gray-100 transition-colors border border-gray-100"
             >
                <div className="size-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">image</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">从相册选择</p>
                  <p className="text-[10px] text-gray-400">选择手机相册中的已有照片</p>
                </div>
             </button>

             <button 
              onClick={() => setShowPhotoSource(false)}
              className="w-full h-14 text-sm font-bold text-gray-400 uppercase tracking-widest pt-2"
             >
                取消操作
             </button>
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[480px] rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-500">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 mb-2"></div>
            <header className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-xl font-bold text-gray-800">整改通知书 (草案)</h2>
              <button onClick={() => setShowResultModal(false)} className="size-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 font-serif leading-relaxed text-gray-700 whitespace-pre-wrap shadow-inner min-h-[300px]">
                {generatedContent}
              </div>
            </div>
            <footer className="p-6 bg-white border-t border-gray-100 grid grid-cols-2 gap-4">
              <button 
                onClick={() => { navigator.clipboard.writeText(generatedContent || ''); alert('已复制'); }}
                className="h-12 border border-gray-200 rounded-xl font-bold text-gray-600 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">content_copy</span>
                复制内容
              </button>
              <button 
                onClick={handleFinalSubmit}
                className="h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl">send</span>
                正式上报
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardReport;
