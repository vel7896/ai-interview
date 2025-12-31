import React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { RobotIcon } from './ui/icons';

interface CodingChoiceScreenProps {
  onAccept: () => void;
  onSkip: () => void;
}

const CodingChoiceScreen: React.FC<CodingChoiceScreenProps> = ({ onAccept, onSkip }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-fade-in">
       <Card>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
              <div className="p-4 bg-slate-700 rounded-full">
                  <RobotIcon className="w-10 h-10 text-cyan-400" />
              </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready for a Coding Challenge?</h1>
          <p className="text-slate-400 mb-8">
            Test your problem-solving skills with a short coding exercise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onAccept} size="lg">
              Let's do it!
            </Button>
            <Button onClick={onSkip} variant="secondary" size="lg">
              No, show my report
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CodingChoiceScreen;
