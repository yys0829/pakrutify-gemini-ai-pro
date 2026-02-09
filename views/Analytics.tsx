
import React, { useState } from 'react';

interface AnalyticsProps {
  onBack: () => void;
}

interface UnitStats {
  id: string;
  name: string;
  total: number;
  major: number;
  general: number;
  trend: 'stable';
  history: number[];
}

const Analytics: React.FC<AnalyticsProps> = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState<'monthly' | 'quarterly'>('monthly');

  // 所有数据初始化为 0
  const stats: UnitStats[] = [
    { id: 'mining', name: '采矿厂', total: 0, major: 0, general: 0, trend: 'stable', history: [0, 0, 0, 0, 0, 0] },
    { id: 'processing', name: '选矿厂', total: 0, major: 0, general: 0, trend: 'stable', history: [0, 0, 0, 0, 0, 0] },
    { id: 'smelting', name: '冶炼厂', total: 0, major: 0, general: 0, trend: 'stable', history: [0, 0, 0, 0, 0, 0] },
    { id: 'tech', name: '生产技术部', total: 0, major: 0, general: 0, trend: 'stable', history: [0, 0, 0, 0, 0, 0] },
    { id: 'quality', name: '质检计量部', total: 0, major: 0, general: 0, trend: 'stable', history: [0, 0, 0, 0, 0, 0] },
    { id: 'logistics', name: '后勤保障部', total: 0, major: 0, general: 0, trend: 'stable', history: [0, 0, 0, 0, 0, 0] },
  ];

  const updateTime = "2026-01-01 00:00";

  return (
    <div className="flex flex-col h-screen bg-background-light overflow-y-auto no-scrollbar pb-24">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-primary flex items-center">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h1 className="text-lg font-bold">安全数据看板</h1>
          <div className="text-[10px] text-gray-400 font-bold">更新于: {updateTime}</div>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button 
            onClick={() => setTimeRange('monthly')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            月度数据
          </button>
          <button 
            onClick={() => setTimeRange('quarterly')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === 'quarterly' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            季度数据
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary rounded-2xl p-4 text-white shadow-lg shadow-primary/20">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">本{timeRange === 'monthly' ? '月' : '季'}累计隐患</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">0</span>
              <span className="text-[10px] font-medium mb-1 opacity-80">起</span>
            </div>
          </div>
          <div className="bg-danger rounded-2xl p-4 text-white shadow-lg shadow-danger/20">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">重大安全风险</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">0</span>
              <span className="text-[10px] font-medium mb-1 opacity-80">处</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-800">各单位实时数据</h3>
            <span className="text-[10px] text-gray-400 font-medium italic">2026-01-01 00:00</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {stats.map(unit => (
              <div key={unit.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{unit.name}</h4>
                      <p className="text-[10px] text-gray-400">暂无历史数据波动</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-300">0</span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-2">
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-200 w-0"></div>
                  </div>
                </div>
                
                <div className="flex justify-between text-[9px] text-gray-400 pt-2 border-t border-gray-50">
                  <span>隐患自查率: 0%</span>
                  <span>整改完成率: 0%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 rounded-2xl p-8 text-center border border-dashed border-gray-200">
           <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">query_stats</span>
           <p className="text-xs text-gray-400">2026年度统计周期尚未产生有效数据</p>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
