import React, { useState } from 'react';
import { CodingProblem } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';

interface CodingChallengeScreenProps {
  problem: CodingProblem;
  onSubmit: (solution: string) => void;
}

const CodingChallengeScreen: React.FC<CodingChallengeScreenProps> = ({ problem, onSubmit }) => {
  const [solution, setSolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    onSubmit(solution);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Coding Challenge</h1>
        <p className="text-slate-400">{problem.title}</p>
      </header>
      
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-cyan-400 mb-2">Problem Description</h2>
          <p className="text-slate-300 whitespace-pre-wrap">{problem.description}</p>
          <h3 className="text-md font-semibold text-slate-300 mt-4 mb-2">Example:</h3>
          <pre className="bg-slate-900/70 p-3 rounded-md text-slate-400 text-sm">{problem.example}</pre>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Solution</h2>
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Write your code here..."
            className="w-full h-64 p-4 bg-slate-900/80 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200 font-mono text-sm"
            aria-label="Code editor for your solution"
            spellCheck="false"
            disabled={isSubmitting}
          />
        </div>
      </Card>

      <div className="text-center">
        <Button onClick={handleSubmit} size="lg" disabled={!solution.trim() || isSubmitting}>
          {isSubmitting ? 'Analyzing...' : 'Submit Solution'}
        </Button>
      </div>
    </div>
  );
};

export default CodingChallengeScreen;
