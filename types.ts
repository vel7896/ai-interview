// FIX: Removed circular self-import of `AppState` which was causing a compilation error.
export enum AppState {
  INIT,
  LOGIN,
  GENERATING_QUESTIONS,
  GENERATING_TECHNICAL_QUESTIONS,
  INTERVIEW,
  TECHNICAL_CHOICE,
  CODING_CHOICE,
  GENERATING_CODING_CHALLENGE,
  CODING_CHALLENGE,
  ANALYZING,
  REPORT,
  PROFILE,
  ABOUT,
  ADMIN_PANEL,
}

export interface User {
  name: string;
  email: string;
}

export interface StoredUser extends User {
  password?: string;
}

export interface InterviewQuestion {
  id: number;
  category: string;
  question: string;
}

export interface FeedbackScores {
  clarity: number;
  relevance: number;
  structure: number;
}

export interface IndividualFeedback {
  scores: FeedbackScores;
  strengths: string;
  improvements: string;
}

export interface InterviewData {
  question: InterviewQuestion;
  answer: string;
  feedback: IndividualFeedback | null;
}

export interface CodingProblem {
  title: string;
  description: string;
  example: string;
}

export interface CodingFeedback {
  summary: string;
  correctness: number;
  efficiency: number;
  style: number;
  suggestions: string;
}

export interface CodingChallengeData {
  problem: CodingProblem;
  solution: string;
  feedback: CodingFeedback | null;
}

export interface FinalReport {
  overallSummary: string;
  keyStrengths: string;
  areasForImprovement: string;
  actionableTips: string[];
  codingChallengeFeedback?: CodingFeedback;
}

export interface InterviewRecord {
  date: string;
  interviewData: InterviewData[];
  finalReport: FinalReport;
  codingChallenge?: {
    problem: CodingProblem;
    solution: string;
  };
}