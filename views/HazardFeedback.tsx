
import React, { useState, useRef } from 'react';
import { savePendingItem } from '../services/reportService';

interface HazardFeedbackProps {
  onBack: () => void;
}

const HazardFeedback: React.FC<HazardFeedbackProps> = ({ onBack }) => {
  const [hazardId, setHazardId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPhotoSource, setShowPhotoSource] = useState(false);

  const albumInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const mockHazards = [
    { id: '2026-001', title: '灭火器过期' },
    { id: '2026-002', title: '车间B电线裸露' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages].slice(0, 4));
      setShowPhotoSource(false);
    }
  };

  const handleSubmit = () => {
    if (!hazardId || !feedback) {
      alert('请选择隐患单并填写反馈说明');
      return;
    }
    setSubmitting(true);
    
    setTimeout(() => {
      savePendingItem('feedbacks', {
        id: `FB-${hazardId}`,
        hazardId: hazardId,
        content: feedback,
        images: images,
        unit: '整改责任部门'
      });
      alert(`反馈单 FB-${hazardId} 已提交，请等待管理员审核。`);
      setSubmitting(false);
      onBack();
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-background-light">
      <header className="flex items-center bg-white px-4 py-3 border-b border-gray-100 shrink-0">
        <button onClick={onBack} className="flex size-10 items-center justify-start text-primary">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="text-[#111418] text-lg font-bold flex-1 text-center pr-10">隐患整改反馈</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
            <h3 className="text-sm font-bold text-gray-800">关联 2026 系列隐患单</h3>
          </div>
          <select 
            value={hazardId}
            onChange={(e) => setHazardId(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-primary focus:border-primary transition-all appearance-none"
          >
            <option value="">请选择需要反馈的隐患单编号</option>
            {mockHazards.map(h => (
              <option key={h.id} value={h.id}>{h.id} - {h.title}</option>
            ))}
          </select>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            <h3 className="text-sm font-bold text-gray-800">整改结果说明</h3>
          </div>
          <textarea 
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 min-h-[140px] p-4 text-sm" 
            placeholder="详细说明整改情况..."
          ></textarea>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800">整改后现场照片</h3>
            <span className="text-[10px] text-gray-400 font-bold">{images.length}/4</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 shadow-sm group">
                <img src={img} className="w-full h-full object-cover" alt="feedback" />
                <button 
                  onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/60 rounded-full size-5 flex items-center justify-center text-white"
                >✕</button>
              </div>
            ))}
            {images.length < 4 && (
              <div onClick={() => setShowPhotoSource(true)} className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 cursor-pointer">
                <span className="material-symbols-outlined text-gray-400">add_a_photo</span>
              </div>
            )}
          </div>
          
          <input type="file" ref={albumInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
          <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto p-4 bg-white/90 border-t border-gray-100 z-50">
        <button 
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          {submitting ? <span className="animate-spin material-symbols-outlined">sync</span> : '提交整改反馈待确认'}
        </button>
      </footer>

      {/* Photo Source Selector */}
      {showPhotoSource && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowPhotoSource(false)}></div>
          <div className="bg-white w-full max-w-[480px] rounded-t-3xl p-6 pb-10 space-y-4 animate-in slide-in-from-bottom duration-300 relative z-[120]">
             <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2"></div>
             <h3 className="text-center text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">提供整改证据</h3>
             
             <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-16 bg-gray-50 rounded-2xl flex items-center px-6 gap-4 active:bg-gray-100 transition-colors border border-gray-100"
             >
                <div className="size-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-800">即时拍照</p>
                  <p className="text-[10px] text-gray-400">拍摄整改后的现场照片</p>
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
                  <p className="text-[10px] text-gray-400">选择已拍摄的整改证据</p>
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

export default HazardFeedback;
