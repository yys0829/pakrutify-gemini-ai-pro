
import React, { useState, useEffect } from 'react';
import { getAllPending, confirmItem } from '../services/reportService';

interface BackOfficeProps {
  onBack: () => void;
}

const BackOffice: React.FC<BackOfficeProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'pending' | 'stats'>('pending');
  const [pendingItems, setPendingItems] = useState<any[]>([]);

  useEffect(() => {
    setPendingItems(getAllPending());
  }, []);

  const handleApprove = (id: string) => {
    confirmItem(id);
    setPendingItems(prev => prev.map(item => item.id === id ? { ...item, status: 'CONFIRMED' } : item));
    alert('该单据已核实确认');
  };

  return (
    <div className="flex flex-col h-screen bg-background-light overflow-hidden">
      <header className="flex items-center bg-white px-4 py-3 border-b border-gray-100 shrink-0">
        <button onClick={onBack} className="flex size-10 items-center justify-start text-primary">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h1 className="text-[#111418] text-lg font-bold flex-1 text-center pr-10">管理审核后台</h1>
      </header>

      <div className="bg-white border-b border-gray-100 flex p-2 gap-1 shrink-0">
        <button onClick={() => setTab('pending')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'pending' ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}>
          待确认单据 ({pendingItems.filter(i => i.status === 'PENDING').length})
        </button>
        <button onClick={() => setTab('stats')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${tab === 'stats' ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}>
          数据概览
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-4 no-scrollbar pb-32">
        {tab === 'pending' && (
          <div className="space-y-4">
            {pendingItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                <span className="material-symbols-outlined text-4xl text-gray-200">check_circle</span>
                <p className="text-xs text-gray-400 mt-2">目前没有需要审核的单据</p>
              </div>
            ) : (
              pendingItems.map((item) => (
                <div key={`${item.id}-${item.timestamp}`} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.typeLabel === '隐患' ? 'bg-orange-100 text-orange-600' : 
                        item.typeLabel === '违章' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {item.typeLabel}
                      </span>
                      <span className="text-xs font-black text-gray-800">{item.id}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {item.status === 'PENDING' ? '待审核' : '已确认'}
                    </span>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-[11px] text-gray-600 space-y-1">
                    <p><span className="font-bold">上报单位：</span>{item.unit || '未指定'}</p>
                    <p className="line-clamp-2"><span className="font-bold">内容描述：</span>{item.description || item.content}</p>
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="pt-2 border-t border-gray-50 flex gap-2">
                      <button 
                        onClick={() => handleApprove(item.id)}
                        className="flex-1 h-10 bg-primary text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-primary/10"
                      >
                        通过并归档
                      </button>
                      <button className="flex-1 h-10 bg-white border border-gray-100 text-gray-400 text-xs font-bold rounded-xl active:bg-gray-50">
                        驳回
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
        {tab === 'stats' && <div className="p-10 text-center text-gray-400 text-xs italic">统计图表模块正在生成中...</div>}
      </main>
    </div>
  );
};

export default BackOffice;
