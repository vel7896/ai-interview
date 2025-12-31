
import React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { RobotIcon } from './ui/icons';

interface TechnicalChoiceScreenProps {
  onTopicSelect: (topic: string) => void;
  onSkip: () => void;
}

const TOPICS = [
  "Web Development",
  "Python",
  "Java",
  "Node.js",
  "Full Stack",
  "Data Science",
  "PHP"
];

const TechnicalChoiceScreen: React.FC<TechnicalChoiceScreenProps> = ({ onTopicSelect, onSkip }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
       <Card>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
              <div className="p-4 bg-slate-700 rounded-full">
                  <RobotIcon className="w-10 h-10 text-cyan-400" />
              </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Continue to Technical Round?</h1>
          <p className="text-slate-400 mb-8">
            Select a topic for your technical questions, or skip to the final report.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {TOPICS.map(topic => (
              <Button
                key={topic}
                onClick={() => onTopicSelect(topic)}
                variant="secondary"
                className="w-full text-center"
              >
                {topic}
              </Button>
            ))}
          </div>
          <div className="flex justify-center">
            <Button onClick={onSkip} variant="secondary" size="lg">
              No, show my report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TechnicalChoiceScreen;
