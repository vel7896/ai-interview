
import React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { InfoIcon } from './ui/icons';

interface AboutScreenProps {
  onBack: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in">
      <Card>
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-slate-700 rounded-full mr-4">
              <InfoIcon className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">About AI Interview Coach</h1>
          </div>
          <div className="space-y-4 text-slate-300 leading-relaxed">
            <p>
              AI Interview Coach is an interactive web application designed to help you practice for your next job interview. Our goal is to provide a realistic and supportive environment where you can hone your communication and problem-solving skills.
            </p>
            <p>
              Using cutting-edge AI, the application asks relevant interview questions, listens to your responses using speech-to-text, and then provides detailed, constructive feedback on your performance. You'll receive scores on clarity, relevance, and structure, along with personalized tips for improvement.
            </p>
            <h2 className="text-xl font-semibold text-white pt-4">How it works:</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Personalized Questions:</strong> The AI generates a unique set of behavioral and technical questions for each session.</li>
              <li><strong>Voice Interaction:</strong> Questions are read aloud, and you can answer using your microphone for a true-to-life experience.</li>
              <li><strong>Real-time Analysis:</strong> After you answer, our Gemini-powered engine analyzes your response.</li>
              <li><strong>Comprehensive Report:</strong> At the end of the session, you'll get a detailed report summarizing your strengths, areas for improvement, and actionable tips.</li>
            </ul>
            <p className="pt-4">
              Practice makes perfect. Use this tool to build your confidence and walk into your next interview fully prepared!
            </p>
          </div>
          <div className="mt-8 text-center">
            <Button onClick={onBack} variant="secondary">Back to my session</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AboutScreen;
