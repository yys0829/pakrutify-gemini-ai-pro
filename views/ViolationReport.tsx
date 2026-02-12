
import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { savePendingItem } from '../services/reportService'; // 導入保存服務

// 1. 保持 API Key 寫死
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
      }, () => setLocation('定位获取失败'));
    }
  }, []);

  // 圖片處理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 4));
      setShowPhotoSource(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!description || !violator) { alert('请填写违章人员和描述'); return; }
    setLoading(true);
    try {
      const response = await client.chat.completions.create({
        model: "Qwen/Qwen2.5-7B-Instruct", 
        messages: [
          { role: "system", content: "你是一个矿山安全监察官员，请撰写一份正式的《违章行为处理建议书》。包含：违章事实、定性依据、处罚建议、安全教育内容。" },
          { role: "user", content: `违章类型：${type}\n人员：${violator}\n单位：${unit}\n描述：${description}\n地点：${location}` }
        ],
        temperature: 0.7,
      });
      setGeneratedContent(response.choices[0].message.content);
      setShowResultModal(true);
    } catch (error: any) {
      alert(`AI生成失败: ${error.message}`);
    } finally { setLoading(false); }
  };

  // 提交審核
  const handleFinalSubmit = () => {
    const newId = Date.now().toString(); // 簡單生成ID
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
    
    // 保存到審核列表
    savePendingItem('violations', reportData);
    
    alert(`违章举报已提交，编号：${newId}。`);
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

      <main className="flex-1 overflow-y-auto pb-40 no-scrollbar p-4 space-y-5">
        
        {/* 照片區域 */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#111418] text-sm font-bold">违章现场抓拍</h3>
            <span className="text-xs text-gray-500">{images.length} / 4 张</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={img} className="w-full h-full object-cover" alt="preview" />
                <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-black/50 text-white rounded-bl-lg p-1">
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button onClick={() => setShowPhotoSource(true)} className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-danger/20 bg-danger/5 text-danger">
                <span className="material-symbols-outlined text-2xl">camera_enhance</span>
              </button>
            )}
          </div>
          <input type="file" ref={albumInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
          <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
        </section>

        {/* 違章類型 */}
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">违章性质</label>
            <div className="flex gap-3">
              {['一般违章', '严重违章'].map(lvl => (
                <button key={lvl} onClick={() => setType(lvl)} className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-bold transition-all ${type === lvl ? 'bg-danger text-white border-danger' : 'bg-white text-gray-400'}`}>
                  {lvl}
                </button>
              ))}
            </div>
        </div>

        {/* 人員與單位 */}
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">违章人员</label>
              <input type="text" value={violator} onChange={(e) => setViolator(e.target.value)} className="h-12 border rounded-xl px-4 text-sm" placeholder="姓名/工号" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold">所属单位</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="h-12 border rounded-xl px-4 text-sm bg-white">
                <option value="">选择单位</option>
                <option value="采矿厂">采矿厂</option>
                <option value="选矿厂">选矿厂</option>
                <option value="动力厂">动力厂</option>
                <option value="安全环保部">安全环保部</option>
                <option value="机电仪修厂">机电仪修厂</option>
                <option value="外委施工队">外委施工队</option>
            </select>
            </div>
        </div>

        {/* 描述 */}
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">违章行为描述</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-xl p-4 min-h-[120px] text-sm" placeholder="请详细描述具体的违章事实..."></textarea>
        </div>

      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 border-t backdrop-blur-sm">
        <button onClick={handleGenerate} disabled={loading} className="w-full h-14 bg-danger text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-danger/30">
          {loading ? 'AI 生成中...' : 'AI 辅助生成处罚建议'}
        </button>
      </footer>

      {showResultModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-[480px] rounded-t-3xl p-6 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom">
            <h2 className="text-xl font-bold mb-4 shrink-0">处罚建议预览</h2>
            <div className="bg-red-50 p-4 rounded-xl overflow-y-auto min-h-[200px] border border-red-100 text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-4">
              {generatedContent}
            </div>
            <div className="flex gap-3 shrink-0">
                <button onClick={() => setShowResultModal(false)} className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl">修改</button>
                <button onClick={handleFinalSubmit} className="flex-[2] py-3 bg-danger text-white font-bold rounded-xl shadow-lg">提交举报</button>
            </div>
          </div>
        </div>
      )}

      {showPhotoSource && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-end" onClick={() => setShowPhotoSource(false)}>
            <div className="bg-white w-full rounded-t-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
                <button onClick={() => cameraInputRef.current?.click()} className="w-full h-14 bg-gray-50 rounded-xl flex items-center justify-center gap-2 font-bold text-danger">现场拍摄</button>
                <button onClick={() => albumInputRef.current?.click()} className="w-full h-14 bg-gray-50 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-700">相册选取</button>
                <button onClick={() => setShowPhotoSource(false)} className="w-full py-3 text-gray-400 font-bold">取消</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default ViolationReport;
