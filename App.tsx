import React, { useState, useEffect } from 'react';
import { AppState, InterviewData, FinalReport, User, InterviewQuestion, InterviewRecord, CodingChallengeData } from './types';
import AuthScreen from './components/AuthScreen';
import InterviewScreen from './components/InterviewScreen';
import ReportScreen from './components/ReportScreen';
import TechnicalChoiceScreen from './components/TechnicalChoiceScreen';
import ProfileScreen from './components/ProfileScreen';
import AboutScreen from './components/AboutScreen';
import Navbar from './components/Navbar';
import { analyzeAnswer, generateFinalReport, generateInterviewQuestions, generateTechnicalQuestions, generateCodingProblem, analyzeCodingSolution } from './services/geminiService';
import Spinner from './components/ui/Spinner';
import { saveSession, loadSession, clearSession, saveUser, loadUser, clearUser } from './services/storageService';
import { getUserFriendlyErrorMessage } from './services/errorService';
import InterviewSkeleton from './components/InterviewSkeleton';
import ReportSkeleton from './components/ReportSkeleton';
import CodingChoiceScreen from './components/CodingChoiceScreen';
import CodingChallengeScreen from './components/CodingChallengeScreen';
import AdminPanel from './components/AdminPanel';
import { saveInterviewRecord } from './backend/api';

export default function App(): React.ReactElement {
  const [appState, setAppState] = useState<AppState>(AppState.INIT);
  const [previousAppState, setPreviousAppState] = useState<AppState | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [finalReport, setFinalReport] = useState<FinalReport | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [codingChallenge, setCodingChallenge] = useState<CodingChallengeData | null>(null);

  useEffect(() => {
    const initializeApp = () => {
      const loggedInUser = loadUser();
      if (loggedInUser) {
        setUser(loggedInUser);
        if (loggedInUser.email === 'admin@admin.com') {
            setAppState(AppState.ADMIN_PANEL);
            return;
        }
        const savedSession = loadSession();
        if (savedSession) {
          setInterviewData(savedSession.interviewData);
          setCurrentQuestionIndex(savedSession.currentQuestionIndex);
          setAppState(savedSession.appState);
          setCodingChallenge(savedSession.codingChallenge);
        } else {
          startNewInterview(loggedInUser);
        }
      } else {
        setAppState(AppState.LOGIN);
      }
    };
    initializeApp();
  }, []);

  // Save session to localStorage whenever state changes
  useEffect(() => {
    const shouldSave = user && user.email !== 'admin@admin.com' && (
      appState === AppState.INTERVIEW ||
      appState === AppState.TECHNICAL_CHOICE ||
      appState === AppState.CODING_CHOICE ||
      appState === AppState.CODING_CHALLENGE
    );

    if (shouldSave) {
      saveSession({
        appState,
        user,
        interviewData,
        currentQuestionIndex,
        codingChallenge,
      });
    }
  }, [appState, user, interviewData, currentQuestionIndex, codingChallenge]);

  useEffect(() => {
    if (appState !== AppState.ANALYZING || !user) return;

    const performAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const feedbacks = [];
        for (const data of interviewData) {
          if (data.answer) {
            const feedback = await analyzeAnswer(data.question.question, data.answer);
            feedbacks.push(feedback);
          } else {
            feedbacks.push(null);
          }
        }

        const updatedDataWithFeedback = interviewData.map((data, index) => ({
          ...data,
          feedback: feedbacks[index],
        }));
        setInterviewData(updatedDataWithFeedback);

        let codingFeedback = null;
        if (codingChallenge && codingChallenge.solution) {
          codingFeedback = await analyzeCodingSolution(codingChallenge.problem.description, codingChallenge.solution);
          setCodingChallenge(prev => prev ? { ...prev, feedback: codingFeedback } : null);
        }

        const report = await generateFinalReport(updatedDataWithFeedback, codingChallenge && codingChallenge.solution ? { ...codingChallenge, feedback: codingFeedback } : undefined);
        
        const record: InterviewRecord = {
          date: new Date().toISOString(),
          interviewData: updatedDataWithFeedback,
          finalReport: report,
          ...(codingChallenge && codingChallenge.solution && {
            codingChallenge: {
              problem: codingChallenge.problem,
              solution: codingChallenge.solution,
            },
          })
        };
        saveInterviewRecord(user, record);
        
        setFinalReport(report);
        setAppState(AppState.REPORT);
        clearSession();

      } catch (err) {
        console.error("Analysis failed:", err);
        setError(getUserFriendlyErrorMessage(err));
        setAppState(AppState.REPORT);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [appState, interviewData, user, codingChallenge]);

  const startNewInterview = async (currentUser: User) => {
    setAppState(AppState.GENERATING_QUESTIONS);
    setError(null);

    try {
      const questions: InterviewQuestion[] = await generateInterviewQuestions();
      const initialData = questions.map(q => ({
        question: q,
        answer: '',
        feedback: null,
      }));
      
      setInterviewData(initialData);
      setCurrentQuestionIndex(0);
      setFinalReport(null);
      setCodingChallenge(null);
      setAppState(AppState.INTERVIEW);
    } catch (err) {
      console.error("Failed to generate questions:", err);
      setError(getUserFriendlyErrorMessage(err));
      setAppState(AppState.LOGIN); 
    }
  };

  const handleLogin = async (loggedInUser: User) => {
    if (loggedInUser.email === 'admin@admin.com') {
        setUser(loggedInUser);
        saveUser(loggedInUser);
        setAppState(AppState.ADMIN_PANEL);
        return;
    }
    setUser(loggedInUser);
    saveUser(loggedInUser);
    await startNewInterview(loggedInUser);
  };

  const handleAnswerSubmit = (answer: string) => {
    const updatedInterviewData = [...interviewData];
    updatedInterviewData[currentQuestionIndex].answer = answer;
    setInterviewData(updatedInterviewData);
    
    const isLastGeneralQuestion = interviewData.length === 5 && currentQuestionIndex === 4;
    const isLastQuestion = currentQuestionIndex === interviewData.length - 1;

    if (isLastGeneralQuestion && interviewData.length < 6) {
      setAppState(AppState.TECHNICAL_CHOICE);
    } else if (isLastQuestion) {
      setAppState(AppState.CODING_CHOICE);
    }
    else if (currentQuestionIndex < interviewData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setAppState(AppState.GENERATING_TECHNICAL_QUESTIONS);
    setError(null);

    try {
      const technicalQuestions = await generateTechnicalQuestions(topic);
      const newTechnicalData = technicalQuestions.map(q => ({
        question: q,
        answer: '',
        feedback: null,
      }));
      
      setInterviewData(prevData => [...prevData, ...newTechnicalData]);
      setCurrentQuestionIndex(prev => prev + 1);
      setAppState(AppState.INTERVIEW);

    } catch (err) {
      console.error("Failed to generate technical questions:", err);
      setError(getUserFriendlyErrorMessage(err));
      setAppState(AppState.CODING_CHOICE);
    }
  };

  const handleSkipTechnical = () => {
    setAppState(AppState.CODING_CHOICE);
  };

  const handleStartCodingChallenge = async () => {
    setAppState(AppState.GENERATING_CODING_CHALLENGE);
    setError(null);
    try {
      const problem = await generateCodingProblem(selectedTopic || 'general software engineering');
      setCodingChallenge({ problem, solution: '', feedback: null });
      setAppState(AppState.CODING_CHALLENGE);
    } catch (err) {
      console.error("Failed to generate coding challenge:", err);
      setError(getUserFriendlyErrorMessage(err));
      setAppState(AppState.ANALYZING);
    }
  };

  const handleSkipCodingChallenge = () => {
    setAppState(AppState.ANALYZING);
  };

  const handleSubmitCodingChallenge = (solution: string) => {
    if (codingChallenge) {
      setCodingChallenge(prev => (prev ? { ...prev, solution } : null));
    }
    setTimeout(() => {
        setAppState(AppState.ANALYZING);
    }, 300);
  };

  const handleRestart = () => {
    if (user) {
      startNewInterview(user);
    }
  };

  const handleStartOver = () => {
    clearSession();
    clearUser();
    setAppState(AppState.LOGIN);
    setUser(null);
    setInterviewData([]);
    setCurrentQuestionIndex(0);
    setFinalReport(null);
    setError(null);
    setPreviousAppState(null);
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  const handleGoToProfile = () => {
    if (appState !== AppState.PROFILE) {
      setPreviousAppState(appState);
      setAppState(AppState.PROFILE);
    }
  };

  const handleBackFromProfile = () => {
    setAppState(previousAppState ?? AppState.INTERVIEW);
    setPreviousAppState(null);
  };
  
  const handleGoToAbout = () => {
    if (appState !== AppState.ABOUT) {
      setPreviousAppState(appState);
      setAppState(AppState.ABOUT);
    }
  };

  const handleBackFromAbout = () => {
    setAppState(previousAppState ?? AppState.INTERVIEW);
    setPreviousAppState(null);
  };

  const handleGoHome = () => {
    if (user?.email === 'admin@admin.com') {
      setAppState(AppState.ADMIN_PANEL);
      return;
    }
    if (appState === AppState.PROFILE || appState === AppState.ABOUT) {
      setAppState(previousAppState ?? AppState.INTERVIEW);
      setPreviousAppState(null);
    }
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.INIT:
        return (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <Spinner className="h-12 w-12" />
          </div>
        );
      case AppState.LOGIN:
        return <AuthScreen onLogin={handleLogin} error={error} />;
      case AppState.GENERATING_QUESTIONS:
        return (
           <InterviewSkeleton 
            title="Generating your interview..."
            subtitle="Preparing a unique set of questions just for you."
          />
        );
      case AppState.GENERATING_TECHNICAL_QUESTIONS:
        return (
          <InterviewSkeleton 
            title={`Generating ${selectedTopic} questions...`}
            subtitle="Tailoring technical questions to your selected topic."
          />
        );
      case AppState.INTERVIEW:
         if (!interviewData[currentQuestionIndex] || !user) {
          return (
             <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <Spinner className="h-12 w-12" />
             </div>
          );
        }
        return (
          <InterviewScreen
            user={user}
            currentQuestion={interviewData[currentQuestionIndex].question}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={interviewData.length}
            onAnswerSubmit={handleAnswerSubmit}
          />
        );
      case AppState.TECHNICAL_CHOICE:
        return <TechnicalChoiceScreen onTopicSelect={handleTopicSelect} onSkip={handleSkipTechnical} />;
      case AppState.CODING_CHOICE:
        return <CodingChoiceScreen onAccept={handleStartCodingChallenge} onSkip={handleSkipCodingChallenge} />;
      case AppState.GENERATING_CODING_CHALLENGE:
        return (
          <InterviewSkeleton 
            title="Generating your coding challenge..."
            subtitle="Crafting a unique problem to test your skills."
          />
        );
      case AppState.CODING_CHALLENGE:
        if (!codingChallenge) {
          return (
             <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
                <Spinner className="h-12 w-12" />
             </div>
          );
        }
        return (
          <CodingChallengeScreen
            problem={codingChallenge.problem}
            onSubmit={handleSubmitCodingChallenge}
          />
        );
      case AppState.ANALYZING:
        return <ReportSkeleton />;
      case AppState.REPORT:
        if (!user) return null;
        return (
          <ReportScreen
            report={finalReport}
            user={user}
            onRestart={handleRestart}
            interviewData={interviewData}
            error={error}
          />
        );
      case AppState.PROFILE:
        if (!user) return null;
        return (
          <ProfileScreen 
            currentUser={user}
            onUpdateProfile={handleProfileUpdate}
            onBack={handleBackFromProfile}
          />
        );
      case AppState.ABOUT:
        return <AboutScreen onBack={handleBackFromAbout} />;
      case AppState.ADMIN_PANEL:
        return <AdminPanel />;
      default:
        return <AuthScreen onLogin={handleLogin} error={error} />;
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 font-sans p-4 md:p-8 flex flex-col items-center">
      {user && appState !== AppState.LOGIN && (
        <Navbar 
          onHome={handleGoHome}
          onAbout={handleGoToAbout}
          onProfile={handleGoToProfile}
          onLogout={handleStartOver}
        />
      )}
      <div className="w-full max-w-4xl mx-auto relative">
        {renderContent()}
      </div>
    </main>
  );
}