
import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

// 初始化客戶端 - 硬編碼 Key 排除環境變量干擾
const client = new OpenAI({
  apiKey: "sk-pkclwfqlercrgslajypqyazqemcgtwareqcgihnjdzyvrhju", 
  baseURL: "https://api.siliconflow.cn/v1",
  dangerouslyAllowBrowser: true 
});

interface ViolationReportProps {
  onBack: () => void;
}

const ViolationReport: React.FC<ViolationReportProps> = ({ onBack }) => {
  const [type, setType] = useState('一般违章');
  const [description, setDescription] = useState('');
  const [violator, setViolator] = useState('');
  const [unit, setUnit] = useState('');
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

  const handleGenerate = async () => {
    if (!description || !violator) {
      alert('请填写必要信息');
      return;
    }
    setLoading(true);

    try {
      const response = await client.chat.completions.create({
        model: "Qwen/Qwen2.5-7B-Instruct", 
        messages: [
          { 
            role: "system", 
            content: "你是一个矿山安全监察官员。请根据用户提供的违章行为描述，撰写一份正式的《违章行为处理建议书》。内容需包含：违章性质认定（依据矿山安全规程）、潜在安全威胁、建议处理意见（如警告、罚款、停工培训等）。语言要威严、公正。" 
          },
          { 
            role: "user", 
            content: `违章类型：${type}\n违章人员：${violator}\n所属单位：${unit}\n行为描述：${description}\n地点：${location}` 
          }
        ],
        temperature: 0.7,
      });

      const result = response.choices[0].message.content;
      setGeneratedContent(result);
      setShowResultModal(true);
    } catch (error: any) {
      console.error("AI生成失败:", error);
      alert(`AI生成失败: ${error.message || '请检查網絡或Key'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    const newId = (window as any).getNextSerialNumber?.() || Date.now().toString(); 
    const reportData = {
      id: newId,
      type,
      description,
      violator,
      unit,
      location,
      images,
      isCompleted: false,
      reportContent: generatedContent,
    };
    (window as any).savePendingItem?.('violations', reportData);
    alert(`违章举报已提交，编号为：${newId}。`);
    setShowResultModal(false);
    onBack();
  };

  return (
    <div className="flex flex-col h-screen bg-white relative">
      <header className="flex items-center bg-white px-4 py-3 border-b border-danger/10 shrink-0">
        <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-start text-danger">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="text-[#111418] text-lg font-bold flex-1 text-center pr-10">违章举报</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-40 no-scrollbar">
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-danger animate-pulse"></span>
            <p className="text-sm font-semibold text-danger/80 uppercase tracking-wider">记录违章行为 (2026系列)</p>
          </div>
        </div>

        <section className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#111418] text-base font-bold">违章现场抓拍</h3>
            <span className="text-xs text-gray-500 font-medium">{images.length} / 4 张</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                <img src={img} className="w-full h-full object-cover" alt={`preview-${idx}`} />
                <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 rounded-full size-5 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button onClick={() => setShowPhotoSource(true)} className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-danger/20 bg-danger/5">
                <span className="material-symbols-outlined text-danger text-2xl">camera_enhance</span>
                <span className="text-[10px] text-danger font-bold mt-1">拍摄违章</span>
              </button>
            )}
          </div>
        </section>

        <div className="space-y-6 px-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-[#111418] text-sm font-bold">违章性质</label>
            <div className="flex gap-3">
              {['一般违章', '严重违章'].map(lvl => (
                <button key={lvl} onClick={() => setType(lvl)} className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${type === lvl ? 'bg-danger text-white' : 'bg-white text-gray-400'}`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={violator} onChange={(e) => setViolator(e.target.value)} placeholder="违章人员" className="h-12 border rounded-xl px-4 text-sm" />
            <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="所属单位" className="h-12 border rounded-xl px-4 text-sm" />
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-xl min-h-[160px] p-4 text-sm" placeholder="详述违章事实..."></textarea>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 border-t z-50">
        <button onClick={handleGenerate} disabled={loading} className="w-full h-14 bg-danger text-white rounded-2xl font-bold flex items-center justify-center gap-3">
          {loading ? <span className="animate-spin">sync</span> : <span>AI 辅助生成处罚建议</span>}
        </button>
      </footer>

      {showResultModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end justify-center">
          <div className="bg-white w-full max-w-[480px] rounded-t-[2.5rem] p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">违章處理建議</h2>
            <div className="bg-red-50 p-4 rounded-xl whitespace-pre-wrap mb-4">{generatedContent}</div>
            <button onClick={handleFinalSubmit} className="w-full h-14 bg-danger text-white rounded-xl font-bold">确认提交</button>
            <button onClick={() => setShowResultModal(false)} className="w-full py-4 text-gray-400">關閉</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationReport;
