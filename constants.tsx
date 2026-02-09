
import { Notification, MainCategory } from './types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: '关于加强车间A防火检查的通知',
    content: '各部门请注意，由于近期天气干燥，车间A需加强每日防火巡查频率...',
    time: '2小时前',
    type: 'info'
  },
  {
    id: '2',
    title: '年度安全生产规章制度更新',
    content: '2024版安全生产标准化手册已上线，请各班组长组织学习并签收确认。',
    time: '5小时前',
    type: 'warning'
  },
  {
    id: '3',
    title: '隐患整改审核通过',
    content: '编号2026-001的电气设备隐患已通过复核，状态已更新为已关闭。',
    time: '昨天',
    type: 'success'
  }
];

export const REGULATION_CATEGORIES: MainCategory[] = [
  {
    id: 'national',
    name: '国家安全环保法律法规',
    icon: 'gavel',
    colorClass: 'bg-red-50 text-red-600',
    subCategories: [
      {
        id: 'law-1',
        name: '法律',
        documents: [
          { id: 'n1', name: '中华人民共和国安全生产法 (2021修正)', size: '1.2MB', updatedAt: '2021-09-01', downloaded: true },
          { id: 'n2', name: '中华人民共和国环境保护法', size: '0.8MB', updatedAt: '2015-01-01', downloaded: false }
        ]
      },
      { id: 'law-2', name: '行政法规', documents: [] }
    ]
  },
  {
    id: 'group',
    name: '集团公司安全环保制度',
    icon: 'hub',
    colorClass: 'bg-blue-50 text-blue-600',
    subCategories: [
      { id: 'g1', name: '管理办法', documents: [] },
      { id: 'g2', name: '操作规范', documents: [] }
    ]
  },
  {
    id: 'cnmc',
    name: '二级单位安全环保制度',
    icon: 'corporate_fare',
    colorClass: 'bg-emerald-50 text-emerald-600',
    subCategories: [
      {
        id: 'c1',
        name: '综合管理',
        documents: [
          { id: 'c-d1', name: '中色国矿安全生产责任清单', size: '2.4MB', updatedAt: '2024-03-10', downloaded: true }
        ]
      },
      { id: 'c2', name: '技术标准', documents: [] }
    ]
  },
  {
    id: 'palut',
    name: '三级单位安全环保制度',
    icon: 'factory',
    colorClass: 'bg-orange-50 text-orange-600',
    subCategories: [
      { id: 'p1', name: '车间管理', documents: [] },
      { id: 'p2', name: '应急预案', documents: [] }
    ]
  }
];
