
import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

// 直接寫死 Key，確保 Vercel 部署後絕對能讀到
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

  const handleGenerate = async () => {
    if (!description || !violator) { alert('请填写必要信息'); return; }
    setLoading(true);
    try {
      const response = await client.chat.completions.create({
        model: "Qwen/Qwen2.5-7B-Instruct", 
        messages: [
          { role: "system", content: "你是一个矿山安全监察官员，请撰写一份正式的《违章行为处理建议书》。" },
          { role: "user", content: `违章类型：${type}\n人员：${violator}\n单位：${unit}\n描述：${description}` }
        ],
        temperature: 0.7,
      });
      setGeneratedContent(response.choices[0].message.content);
      setShowResultModal(true);
    } catch (error: any) {
      alert(`AI生成失败: ${error.message}`);
    } finally { setLoading(false); }
  };

  const handleFinalSubmit = () => {
    alert(`提交成功！`);
    onBack();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center p-4 border-b">
        <button onClick={onBack} className="material-symbols-outlined">arrow_back_ios</button>
        <h1 className="flex-1 text-center font-bold">违章举报</h1>
      </header>
      <main className="flex-1 p-4 space-y-4 overflow-y-auto">
        <input type="text" value={violator} onChange={(e)=>setViolator(e.target.value)} placeholder="违章人员姓名" className="w-full border h-12 rounded-xl px-4" />
        <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border rounded-xl p-4 min-h-[150px]" placeholder="详细描述违章行为..."></textarea>
      </main>
      <footer className="p-4 border-t">
        <button onClick={handleGenerate} disabled={loading} className="w-full h-14 bg-red-600 text-white rounded-2xl font-bold">
          {loading ? 'AI 生成中...' : 'AI 辅助生成处罚建议'}
        </button>
      </footer>
      {showResultModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="bg-red-50 p-4 rounded-xl whitespace-pre-wrap mb-4">{generatedContent}</div>
            <button onClick={handleFinalSubmit} className="w-full h-14 bg-red-600 text-white rounded-xl font-bold">确认提交举报</button>
            <button onClick={()=>setShowResultModal(false)} className="w-full py-4 text-gray-400">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationReport;
