
import React, { useState, useRef } from 'react';
import { getNextSerialNumber, savePendingItem } from '../services/reportService';

interface ViolationReportProps {
  onBack: () => void;
}

const ViolationReport: React.FC<ViolationReportProps> = ({ onBack }) => {
  const [description, setDescription] = useState('');
  const [person, setPerson] = useState('');
  const [category, setCategory] = useState('违章作业');
  const [severity, setSeverity] = useState('一般违章');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoSource, setShowPhotoSource] = useState(false);
  
  const albumInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 3));
      setShowPhotoSource(false);
    }
  };

  const handleFormSubmit = () => {
    if (!description || !person) {
      alert('请完整填写违章描述和责任人');
      return;
    }
    setSubmitting(true);
    const newId = getNextSerialNumber();
    
    setTimeout(() => {
      savePendingItem('violations', {
        id: newId,
        description,
        person,
        category,
        severity,
        images,
        unit: '现场作业点'
      });
      alert(`违章上报成功！编号为：${newId}，已提交至管理员确认。`);
      setSubmitting(false);
      onBack();
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="sticky top-0 z-50 flex items-center bg-white border-b border-gray-100 px-4 py-3">
        <button onClick={onBack} className="flex-none w-10 text-primary">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold">三违行为上报</h1>
        <div className="flex-none w-10 text-right text-primary">
          <span className="material-symbols-outlined">info</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-32 no-scrollbar">
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">photo_camera</span>
            <h3 className="text-base font-bold">违章现场证据</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="aspect-square rounded-lg overflow-hidden relative">
                <img src={img} className="w-full h-full object-cover" alt="violation" />
                <button 
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full size-5 flex items-center justify-center text-[10px]"
                >✕</button>
              </div>
            ))}
            {images.length < 3 && (
              <div 
                onClick={() => setShowPhotoSource(true)}
                className="aspect-square rounded-lg bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 cursor-pointer active:bg-gray-100"
              >
                <span className="material-symbols-outlined text-3xl text-gray-400">add_a_photo</span>
                <span className="text-[10px] text-gray-500 mt-1">上传照片</span>
              </div>
            )}
          </div>
          
          <input type="file" ref={albumInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
          <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-xl">description</span>
            <h3 className="text-base font-bold">违章情况描述</h3>
          </div>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 min-h-32 p-4 text-sm focus:ring-primary focus:border-primary transition-all resize-none" 
            placeholder="描述违章行为、地点及后果..."
          ></textarea>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">违章责任人</label>
            <input 
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-gray-200 text-sm" 
              placeholder="姓名 / 工号" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">违章类别</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border border-gray-200 text-sm"
              >
                <option>违章作业</option>
                <option>违章指挥</option>
                <option>违反劳动纪律</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">严重程度</label>
              <select 
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-12 px-3 rounded-xl border border-gray-200 text-sm"
              >
                <option>一般违章</option>
                <option>严重违章</option>
              </select>
            </div>
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white/95 border-t border-gray-100 p-4 pb-8 z-50">
        <button 
          onClick={handleFormSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {submitting ? <span className="animate-spin material-symbols-outlined">sync</span> : <span className="material-symbols-outlined">assignment_late</span>}
          <span>正式上报待审核</span>
        </button>
      </footer>

      {/* Photo Source Selector */}
      {showPhotoSource && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowPhotoSource(false)}></div>
          <div className="bg-white w-full max-w-[480px] rounded-t-3xl p-6 pb-10 space-y-4 animate-in slide-in-from-bottom duration-300 relative z-[120]">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2"></div>
             <h3 className="text-center text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">违章证据拍摄</h3>
             
             <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-16 bg-gray-50 rounded-2xl flex items-center px-6 gap-4 active:bg-gray-100 transition-colors border border-gray-100"
             >
                <div className="size-10 bg-danger/10 rounded-full flex items-center justify-center text-danger">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">即时拍照</p>
                  <p className="text-[10px] text-gray-400">直接启动相机记录违章行为</p>
                </div>
             </button>

             <button 
              onClick={() => albumInputRef.current?.click()}
              className="w-full h-16 bg-gray-50 rounded-2xl flex items-center px-6 gap-4 active:bg-gray-100 transition-colors border border-gray-100"
             >
                <div className="size-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <span className="material-symbols-outlined">image</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">从相册选择</p>
                  <p className="text-[10px] text-gray-400">选择此前存储的违章照片</p>
                </div>
             </button>

             <button 
              onClick={() => setShowPhotoSource(false)}
              className="w-full h-14 text-sm font-bold text-gray-400 uppercase tracking-widest pt-2"
             >
               取消
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViolationReport;
