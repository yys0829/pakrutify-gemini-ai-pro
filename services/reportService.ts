
export const getNextSerialNumber = (): string => {
  const lastIndex = localStorage.getItem('global_report_index') || '0';
  const nextIndex = parseInt(lastIndex) + 1;
  localStorage.setItem('global_report_index', nextIndex.toString());
  
  const padded = nextIndex.toString().padStart(3, '0');
  return `2026-${padded}`;
};

export const savePendingItem = (type: 'hazards' | 'violations' | 'feedbacks', data: any) => {
  const key = `pending_${type}`;
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({ 
    ...data, 
    status: 'PENDING', 
    timestamp: Date.now(),
    typeLabel: type === 'hazards' ? '隐患' : type === 'violations' ? '违章' : '反馈'
  });
  localStorage.setItem(key, JSON.stringify(existing));
};

export const getAllPending = () => {
  const h = JSON.parse(localStorage.getItem('pending_hazards') || '[]');
  const v = JSON.parse(localStorage.getItem('pending_violations') || '[]');
  const f = JSON.parse(localStorage.getItem('pending_feedbacks') || '[]');
  return [...h, ...v, ...f].sort((a, b) => b.timestamp - a.timestamp);
};

export const confirmItem = (id: string) => {
  ['pending_hazards', 'pending_violations', 'pending_feedbacks'].forEach(key => {
    let items = JSON.parse(localStorage.getItem(key) || '[]');
    items = items.map((item: any) => item.id === id ? { ...item, status: 'CONFIRMED' } : item);
    localStorage.setItem(key, JSON.stringify(items));
  });
};
