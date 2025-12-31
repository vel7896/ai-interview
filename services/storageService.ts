import { AppState, User, InterviewData, CodingChallengeData } from '../types';

const SESSION_STORAGE_KEY = 'ai-interview-coach-session';
const USER_STORAGE_KEY = 'ai-interview-coach-user';

export interface SavedSession {
  appState: AppState;
  user: User;
  interviewData: InterviewData[];
  currentQuestionIndex: number;
  codingChallenge: CodingChallengeData | null;
}

// Manages the current interview session state in the browser.
export const saveSession = (session: SavedSession): void => {
  try {
    const sessionData = JSON.stringify(session);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionData);
  } catch (error) {
    console.error("Failed to save session to localStorage", error);
  }
};

export const loadSession = (): SavedSession | null => {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (sessionData === null) {
      return null;
    }
    const parsedData = JSON.parse(sessionData);
    if ('appState' in parsedData && 'user' in parsedData && 'interviewData' in parsedData) {
        return parsedData as SavedSession;
    }
    console.warn("Invalid session data found in localStorage.");
    clearSession();
    return null;

  } catch (error) {
    console.error("Failed to load session from localStorage", error);
    return null;
  }
};

// FIX: Corrected a syntax error in the try...catch block. The 'catch' statement was missing parentheses and curly braces.
export const clearSession = (): void => {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear session from localStorage", error);
  }
};

// Manages the currently logged-in user's data in the browser.
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user to localStorage", error);
  }
};

export const loadUser = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (userData === null) {
      return null;
    }
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error("Failed to load user from localStorage", error);
    return null;
  }
};

export const clearUser = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear user from localStorage", error);
  }
};