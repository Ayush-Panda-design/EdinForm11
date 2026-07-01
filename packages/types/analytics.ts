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

export interface FieldOptionDistribution {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

export interface FieldSummaryStatistics {
  fieldId: string;
  label: string;
  type: string;
  totalResponses: number;
  answeredCount: number;
  skipRate: number;
  optionDistribution?: FieldOptionDistribution[];
  numericStats?: {
    min: number;
    max: number;
    avg: number;
    median: number;
    distribution: Array<{ value: string; count: number }>;
  };
  textStats?: {
    avgLength: number;
    minLength: number;
    maxLength: number;
  };
}
