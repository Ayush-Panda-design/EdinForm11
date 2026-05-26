export interface DailyAnalytics {
  date: string;
  views: number;
  submissions: number;
  conversionRate: number;
  uniqueVisitors: number;
  avgCompletionSeconds: number | null;
}

export interface FormAnalyticsSummary {
  formId: string;
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  avgCompletionSeconds: number | null;
  dailyData: DailyAnalytics[];
}
