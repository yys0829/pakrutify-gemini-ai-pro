
import React, { useState, useEffect } from 'react';
import { getAllPending } from '../services/reportService';
import * as XLSX from 'https://esm.sh/xlsx';

interface ReportListProps {
  onBack: () => void;
}

const ReportList: React.FC<ReportListProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'hazards' | 'violations'>('hazards');
  const [reports, setReports] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const allData = getAllPending();
    setReports(allData);
  }, []);

  const filteredReports = reports.filter(item => {
    const isTypeMatch = activeTab === 'hazards' ? item.typeLabel === '隐患' : item.typeLabel === '违章';
    const isSearchMatch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || item.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return isTypeMatch && isSearchMatch;
  });

  const handleExportExcel = () => {
    if (filteredReports.length === 0) {
      alert('当前列表无数据可导出');
      return;
    }

    // 构建导出数据结构
    const exportData = filteredReports.map((item, index) => ({
      '序号': index + 1,
      '隐患编号': item.id,
      '责任单位': item.unit || '现场作业点',
      '隐患描述': item.description || item.content || '无',
      '整改完成时限': item.deadline || '未设置',
      '完成（是/否）': item.isCompleted ? '是' : '否',
      '责任人': item.responsiblePerson || '待定',
      '下单时间': new Date(item.timestamp).toLocaleString('zh-CN'),
    }));

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'hazards' ? "安全隐患清单" : "违章行为清单");

    // 导出文件
    const fileName = `中色国矿_${activeTab === 'hazards' ? '隐患' : '违章'}_清单_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    alert('清单已成功生成并导出为 Excel 文件');
  };

  return (
    <div className="flex flex-col h-screen bg-background-light overflow-hidden">
      <header className="bg-white border-b border-gray-100 shrink-0 sticky top-0 z-50">
        <div className="flex items-center p-4">
          <button onClick={onBack} className="text-primary flex size-10 items-center justify-center shrink-0">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">隐患/违章清单</h1>
          <button 
            onClick={handleExportExcel}
            className="text-primary flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg active:bg-primary/10 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="text-[10px] font-bold">导出Excel</span>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-4 pb-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-100 bg-gray-50 text-xs focus:ring-primary focus:border-primary transition-all outline-none"
              placeholder="搜索编号或描述内容..."
            />
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex px-4 gap-4">
          <button 
            onClick={() => setActiveTab('hazards')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'hazards' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            安全隐患 ({reports.filter(i => i.typeLabel === '隐患').length})
          </button>
          <button 
            onClick={() => setActiveTab('violations')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'violations' ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
          >
            违章行为 ({reports.filter(i => i.typeLabel === '违章').length})
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 no-scrollbar pb-32">
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <span className="material-symbols-outlined text-4xl text-gray-200 mb-2">inbox</span>
              <p className="text-xs text-gray-400">暂无相关记录</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={`${report.id}-${report.timestamp}`} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex active:bg-gray-50 transition-colors">
                {/* 状态指示色条 */}
                <div className={`w-1.5 shrink-0 ${report.status === 'PENDING' ? 'bg-warning' : 'bg-success'}`}></div>
                
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-gray-800 tracking-tight">{report.id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${report.status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {report.status === 'PENDING' ? '待审核' : '已确认'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {report.description || report.content || '无描述内容'}
                  </p>
                  
                  <div className="flex flex-col gap-1.5 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">person</span>
                        <span className="text-[10px]">责任人: {report.responsiblePerson || '待定'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">event</span>
                        <span className="text-[10px]">时限: {report.deadline || '未设'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        <span className="text-[10px]">{new Date(report.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-primary">
                        <span className="text-[10px] font-bold">查看详情</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward_ios</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportList;
