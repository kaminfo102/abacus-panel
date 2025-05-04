export interface ExamResult {
    examId: string;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    percentage: number;
    submittedAt: string;
  }
  
  export interface ExamError {
    code: string;
    message: string;
  }
  
  export type Operator = '+' | '-' | '*' | '/';
  
  export interface ExamSettings {
    digitCount: number;
    rowCount: number;
    timeLimit: number; // in seconds
    operators: Operator[];
    itemsPerRow: number;
  }
  
  export interface Exam {
    id: string;
    title: string;
    term: string;
    settings: ExamSettings;
    createdAt: string;
    updatedAt: string;
  }
  

  export interface NumberItem {
    value: number;
    operator: Operator;
  }
  
  export type ExamRow = {
    items: { value: string; operator: string }[];
  };
  
  export interface User {
    id: string;
    username: string;
    name: string;
    email: string;
    term: string;
    avatar: string;
    role: 'admin' | 'user';
  }