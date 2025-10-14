export interface Question {
  id: number;
  text: string;
  category: string;
  clickCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Suggestion {
  id: number;
  text: string;
  category: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  questionId: number | null;
}

export interface MetricsSummary {
  totalClicks: number;
  clicksByCategory: Record<string, number>;
  activeQuestions: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
  rejectedSuggestions: number;
  topQuestions: Array<Pick<Question, 'id' | 'text' | 'category' | 'clickCount'>>;
}
