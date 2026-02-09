
export type UserRole = 'ADMIN' | 'SAFETY_OFFICER' | 'WORKER';

export type ViewState = 'dashboard' | 'hazard' | 'violation' | 'regulations' | 'mine' | 'analytics' | 'backoffice' | 'permissions' | 'hazard_feedback' | 'report_list' | 'quiz';

export type ReportStatus = 'PENDING' | 'CONFIRMED';

export type PermissionKey = 
  | 'hazard' 
  | 'violation' 
  | 'hazard_feedback' 
  | 'report_list' 
  | 'quiz' 
  | 'analytics' 
  | 'regulations'
  | 'backoffice'
  | 'permissions';

export interface UserInfo {
  name: string;
  unit: string;
  role: UserRole;
  roleName: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

export interface Regulation {
  id: string;
  name: string;
  size: string;
  updatedAt: string;
  downloaded: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  documents: Regulation[];
}

export interface MainCategory {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  subCategories: SubCategory[];
}

export interface BaseReport {
  id: string;
  status: ReportStatus;
  timestamp: number;
  reporter: string;
  typeLabel?: string;
  deadline?: string;
  responsiblePerson?: string;
  isCompleted?: boolean;
}

export interface HazardReportData extends BaseReport {
  level: string;
  description: string;
  unit: string;
  location: string;
  images: string[];
}

export interface FeedbackData extends BaseReport {
  hazardId: string;
  content: string;
  images: string[];
}
