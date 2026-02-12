
import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';

// 🛑 核心修复：同样直接把 Key 填在这里
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
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState('定位中...');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation(`纬度: ${pos.coords.latitude.toFixed(4)}, 经度: ${pos.coords.longitude.toFixed(4)}`);
      }, () => setLocation('定位获取失败'));
    }
  }, []);

  const handleGenerate = async () => {
    if (!description || !unit) { alert('请填写责任单位和描述'); return; }
    setLoading(true);
    try {
      const response = await client.chat.completions.create({
        model: "Qwen/Qwen2.5-7B-Instruct", 
        messages: [
          { role: "system", content: "你是一个专业的矿山安全专家，请根據描述撰寫整改通知書。" },
          { role: "user", content: `隐患级别：${level}\n责任单位：${unit}\n描述：${description}\n地点：${location}` }
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
    alert(`隐患上报成功！`);
    onBack();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center p-4 border-b bg-white">
        <button onClick={onBack} className="material-symbols-outlined text-gray-600">arrow_back_ios</button>
        <h1 className="flex-1 text-center font-bold text-lg">隐患上报</h1>
      </header>
      
      <main className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
            <div>
                <label className="block text-sm font-bold mb-2">责任单位</label>
                <select value={unit} onChange={(e)=>setUnit(e.target.value)} className="w-full border h-12 rounded-lg px-4 bg-gray-50">
                <option value="">请选择</option>
                <option value="采矿厂">采矿厂</option>
                <option value="选矿厂">选矿厂</option>
                <option value="安全环保部">安全环保部</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold mb-2">隐患描述</label>
                <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full border rounded-lg p-4 min-h-[120px] bg-gray-50" placeholder="详细描述隐患内容..."></textarea>
            </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-white">
        <button onClick={handleGenerate} disabled={loading} className="w-full h-14 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center">
          {loading ? 'AI 分析生成中...' : '生成整改通知书'}
        </button>
      </footer>

      {showResultModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom">
            <h2 className="text-xl font-bold mb-4">整改通知书</h2>
            <div className="bg-blue-50 p-4 rounded-xl whitespace-pre-wrap mb-4 text-sm leading-relaxed">{generatedContent}</div>
            <button onClick={handleFinalSubmit} className="w-full h-12 bg-blue-600 text-white rounded-lg font-bold mb-2">正式上报</button>
            <button onClick={()=>setShowResultModal(false)} className="w-full h-12 text-gray-500 font-bold">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardReport;
