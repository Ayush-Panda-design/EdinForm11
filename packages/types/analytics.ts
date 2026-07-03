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

export interface FieldOptionCount {
  value: string;
  label: string;
  count: number;
  percentage: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
}

export interface FieldAnalyticsSummary {
  fieldId: string;
  label: string;
  type: string;
  totalAnswers: number;
  skipRate: number;
  optionCounts?: FieldOptionCount[];
  numericStats?: { avg: number; min: number; max: number };
  ratingDistribution?: RatingDistribution[];
  avgRating?: number;
}
