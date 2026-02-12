
import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { getNextSerialNumber, savePendingItem } from '../services/reportService';

// 初始化客戶端 - 強制硬編碼 Key
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

  const handleGenerate = async () => {
    if (!description || !unit) {
      alert('请填写必要信息');
      return;
    }
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
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    const newId = getNextSerialNumber();
    savePendingItem('hazards', { id: newId, level, description, unit, location, images, deadline, responsiblePerson, reportContent: generatedContent });
    alert(`提交成功，编号：${newId}`);
    onBack();
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center p-4 border-b">
        <button onClick={onBack} className="material-symbols-outlined">arrow_back_ios</button>
        <h1 className="flex-1 text-center font-bold">隐患上报</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full border h-12 rounded-xl px-4">
            <option value="">选择责任单位</option>
            <option value="采矿厂">采矿厂</option>
            <option value="选矿厂">选矿厂</option>
            <option value="安全环保部">安全环保部</option>
        </select>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-xl p-4 min-h-[150px]" placeholder="描述隐患..."></textarea>
      </main>
      <footer className="p-4 border-t">
        <button onClick={handleGenerate} disabled={loading} className="w-full h-14 bg-primary text-white rounded-2xl font-bold">
            {loading ? '生成中...' : '智能生成整改通知书'}
        </button>
      </footer>

      {showResultModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end">
          <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="bg-gray-100 p-4 rounded-xl whitespace-pre-wrap">{generatedContent}</div>
            <button onClick={handleFinalSubmit} className="w-full h-14 bg-primary text-white rounded-xl mt-4 font-bold">正式上報</button>
            <button onClick={() => setShowResultModal(false)} className="w-full py-4 text-gray-400">關閉</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HazardReport;
