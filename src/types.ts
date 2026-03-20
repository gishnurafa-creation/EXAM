export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingChunks?: any[];
  imageData?: string;
}

export interface ExamTrend {
  subject: string;
  weightage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface YearlyTrend {
  year: string;
  [subject: string]: string | number;
}

export interface SyllabusItem {
  unit: string;
  topics: string[];
}

export interface PracticeQuestion {
  id: string;
  subject: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  otherOptionsExplanation: string;
  mindmap?: string;
  source?: string;
  videoLink?: string;
}

export interface StudyProgress {
  totalAttempted: number;
  totalCorrect: number;
  unitPerformance: { [unit: string]: { attempted: number, correct: number } };
  recentScores: { date: string, score: number, total: number }[];
}
