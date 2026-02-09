
import React, { useState, useRef } from 'react';
import { REGULATION_CATEGORIES } from '../constants';
import { MainCategory, SubCategory, Regulation } from '../types';

interface RegulationsProps {
  onBack: () => void;
}

const Regulations: React.FC<RegulationsProps> = ({ onBack }) => {
  const [openMain, setOpenMain] = useState<string | null>('cnmc');
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [categories, setCategories] = useState<MainCategory[]>(REGULATION_CATEGORIES);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadTarget, setActiveUploadTarget] = useState<{ mainId: string, subId: string } | null>(null);

  const handleUploadClick = (mainId: string, subId: string) => {
    setActiveUploadTarget({ mainId, subId });
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadTarget) return;

    // Check file format
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      alert('仅支持上传 PDF 或 Word (.doc, .docx) 格式的文件');
      return;
    }

    const newDoc: Regulation = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + 'MB',
      updatedAt: new Date().toISOString().split('T')[0],
      downloaded: false
    };

    setCategories(prev => prev.map(main => {
      if (main.id === activeUploadTarget.mainId) {
        return {
          ...main,
          subCategories: main.subCategories.map(sub => {
            if (sub.id === activeUploadTarget.subId) {
              return { ...sub, documents: [...sub.documents, newDoc] };
            }
            return sub;
          })
        };
      }
      return main;
    }));

    setActiveUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    alert('文件上传成功！');
  };

  const handleDeleteDoc = (mainId: string, subId: string, docId: string) => {
    if (!window.confirm('确定要删除该制度文件吗？')) return;

    setCategories(prev => prev.map(main => {
      if (main.id === mainId) {
        return {
          ...main,
          subCategories: main.subCategories.map(sub => {
            if (sub.id === subId) {
              return { ...sub, documents: sub.documents.filter(d => d.id !== docId) };
            }
            return sub;
          })
        };
      }
      return main;
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-background-light overflow-hidden">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center p-4 justify-between">
          <button onClick={onBack} className="text-primary flex size-10 items-center justify-center">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">安全环保制度库</h1>
          <div className="size-10"></div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32">
        {categories.map((main) => (
          <div key={main.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button 
              onClick={() => setOpenMain(openMain === main.id ? null : main.id)}
              className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`size-10 rounded-xl flex items-center justify-center ${main.colorClass}`}>
                  <span className="material-symbols-outlined">{main.icon}</span>
                </div>
                <span className="text-sm font-bold text-gray-800 text-left">{main.name}</span>
              </div>
              <span className={`material-symbols-outlined text-gray-300 transition-transform ${openMain === main.id ? 'rotate-180' : ''}`}>expand_more</span>
            </button>

            {openMain === main.id && (
              <div className="px-4 pb-4 space-y-2">
                {main.subCategories.map((sub) => (
                  <div key={sub.id} className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="w-full flex items-center justify-between p-3">
                      <button 
                        onClick={() => setOpenSub(openSub === sub.id ? null : sub.id)}
                        className="flex-1 text-left text-xs font-bold text-gray-600 flex items-center gap-2"
                      >
                        <span>{sub.name}</span>
                        <span className="text-[10px] text-gray-400">({sub.documents.length} 份)</span>
                      </button>
                      <button 
                        onClick={() => handleUploadClick(main.id, sub.id)}
                        className="size-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center active:scale-95 transition-all"
                        title="上传文件"
                      >
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                      </button>
                    </div>
                    
                    {openSub === sub.id && (
                      <div className="bg-white border-t border-gray-100 px-2 py-1">
                        {sub.documents.length > 0 ? (
                          sub.documents.map((doc) => {
                            const isWord = doc.name.toLowerCase().endsWith('.doc') || doc.name.toLowerCase().endsWith('.docx');
                            return (
                              <div key={doc.id} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <span className={`material-symbols-outlined text-sm ${isWord ? 'text-blue-500' : 'text-danger'}`}>
                                    {isWord ? 'description' : 'picture_as_pdf'}
                                  </span>
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-medium text-gray-800 truncate">{doc.name}</span>
                                    <span className="text-[9px] text-gray-400">{doc.size} · {doc.updatedAt}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleDeleteDoc(main.id, sub.id, doc.id)}
                                    className="size-7 text-gray-300 hover:text-danger transition-colors flex items-center justify-center"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                  <span className={`material-symbols-outlined text-sm ${doc.downloaded ? 'text-primary' : 'text-gray-300'}`}>
                                    {doc.downloaded ? 'download_done' : 'cloud_download'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-[10px] text-gray-400">暂无相关文件，点击右上角上传。</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        className="hidden" 
        accept=".pdf,.doc,.docx"
      />
    </div>
  );
};

export default Regulations;
