import React, { useState, useEffect, useCallback } from 'react';
import { InterviewQuestion, User } from '../types';
import useSpeechToText from '../hooks/useSpeechToText';
import useTextToSpeech from '../hooks/useTextToSpeech';
import Button from './ui/Button';
import Card from './ui/Card';
import { StopCircleIcon, PlayCircleIcon, MicrophoneIcon } from './ui/icons';

interface InterviewScreenProps {
  user: User;
  currentQuestion: InterviewQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmit: (answer: string) => void;
}

const InterviewScreen: React.FC<InterviewScreenProps> = ({
  user,
  currentQuestion,
  questionNumber,
  totalQuestions,
  onAnswerSubmit,
}) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { isListening, transcript, startListening, stopListening, resetTranscript, error: sttError } = useSpeechToText();
  const { speak, isSpeaking } = useTextToSpeech();

  // Effect to automatically speak the question
  useEffect(() => {
    setHasSubmitted(false);
    resetTranscript();

    const speakQuestion = () => {
      const greeting = questionNumber === 1 ? `Alright ${user.name}, let's begin. ` : '';
      speak(greeting + currentQuestion.question);
    };
    
    // Delay ensures smooth transition
    const timer = setTimeout(speakQuestion, 500);

    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [currentQuestion, speak, resetTranscript, user.name, questionNumber]);
  
  const handleStopRecording = useCallback(() => {
    stopListening();
  }, [stopListening]);

  // Effect to auto-submit when user stops talking
  useEffect(() => {
    if (!isListening && transcript.trim() && !hasSubmitted) {
      onAnswerSubmit(transcript);
      setHasSubmitted(true);
    }
  }, [isListening, transcript, hasSubmitted, onAnswerSubmit]);

  const readQuestionAloud = () => {
    speak(currentQuestion.question);
  };

  return (
    <div key={currentQuestion.id} className="space-y-6 animate-fade-in-up">
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Interview Session</h1>
        <p className="text-slate-400">Question {questionNumber} of {totalQuestions}</p>
      </header>
      
      <Card className={isSpeaking ? 'speaking-glow' : ''}>
        <div className="p-6">
          <p className="text-sm font-medium text-cyan-400 mb-2">{currentQuestion.category}</p>
          <div className="flex items-start space-x-4">
            <p className="text-xl text-slate-200 flex-grow">{currentQuestion.question}</p>
            <button onClick={readQuestionAloud} aria-label="Read question aloud" className="text-slate-400 hover:text-cyan-400 transition-colors">
              <PlayCircleIcon className="w-7 h-7" />
            </button>
          </div>
        </div>
      </Card>
      
      <Card className={isListening ? 'speaking-glow' : ''}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Answer</h2>
            {!isListening && !hasSubmitted && (
                <Button onClick={startListening} size="sm">
                  <MicrophoneIcon className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
            )}
             {isListening && !hasSubmitted && (
                <Button onClick={handleStopRecording} variant="danger" size="sm">
                  <StopCircleIcon className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
            )}
          </div>
          <div className="min-h-[100px] p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            {isListening && <p className="text-slate-400 italic animate-pulse">Listening...</p>}
            <p className="text-slate-300">{transcript}</p>
            {!transcript && !isListening && <p className="text-slate-500">Click "Start Recording" when you're ready to answer.</p>}
          </div>
          {sttError && <p className="text-red-400 mt-2 text-sm">{sttError}</p>}
        </div>
      </Card>
    </div>
  );
};

export default InterviewScreen;