
import React from 'react';
import { FinalReport, InterviewData, User } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Alert from './ui/Alert';
import { AwardIcon, SparklesIcon, TrendingUpIcon, ClipboardListIcon, CodeIcon } from './ui/icons';

interface ReportScreenProps {
  report: FinalReport | null;
  user: User;
  onRestart: () => void;
  interviewData: InterviewData[];
  error: string | null;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ report, user, onRestart, interviewData, error }) => {
  if (error) {
    return (
      <div className="space-y-6">
        <Alert message={error} title="Report Generation Failed" />
        <div className="text-center">
            <Button onClick={onRestart}>
                Practice Again
            </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <Card>
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-slate-300">An unexpected error occurred.</h1>
            <p className="text-slate-400">We were unable to generate your report.</p>
             <Button onClick={onRestart} className="mt-6">
                Practice Again
            </Button>
        </div>
      </Card>
    );
  }

  const sections = [
    { title: 'Overall Summary', content: report.overallSummary, icon: <AwardIcon className="w-6 h-6 text-cyan-400" /> },
    { title: 'Key Strengths', content: report.keyStrengths, icon: <SparklesIcon className="w-6 h-6 text-green-400" /> },
    { title: 'Areas for Improvement', content: report.areasForImprovement, icon: <TrendingUpIcon className="w-6 h-6 text-amber-400" /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Interview Report for {user.name}</h1>
        <p className="text-slate-400 mt-2">Here's a summary of your performance.</p>
      </header>

      {sections.map(({ title, content, icon }) => (
        <Card key={title}>
            <div className="p-6">
                <div className="flex items-center mb-3">
                    <div className="p-2 bg-slate-700 rounded-full mr-4">{icon}</div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-white">{title}</h2>
                </div>
                <p className="text-slate-300 leading-relaxed">{content}</p>
            </div>
        </Card>
      ))}

      {report.codingChallengeFeedback && (
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-slate-700 rounded-full mr-4">
                    <CodeIcon className="w-6 h-6 text-lime-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">Coding Challenge Feedback</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-800 p-3 rounded-lg text-center">
                <p className="text-sm text-slate-400 capitalize">Correctness</p>
                <p className="text-xl font-bold text-white">{report.codingChallengeFeedback.correctness}/10</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg text-center">
                <p className="text-sm text-slate-400 capitalize">Efficiency</p>
                <p className="text-xl font-bold text-white">{report.codingChallengeFeedback.efficiency}/10</p>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg text-center">
                <p className="text-sm text-slate-400 capitalize">Style</p>
                <p className="text-xl font-bold text-white">{report.codingChallengeFeedback.style}/10</p>
              </div>
            </div>
            <div>
                <h5 className="font-semibold text-slate-300">Summary:</h5>
                <p className="text-slate-300 text-sm mb-3">{report.codingChallengeFeedback.summary}</p>
                <h5 className="font-semibold text-slate-300">Suggestions:</h5>
                <p className="text-slate-300 text-sm whitespace-pre-wrap">{report.codingChallengeFeedback.suggestions}</p>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="p-6">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-slate-700 rounded-full mr-4">
                    <ClipboardListIcon className="w-6 h-6 text-violet-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">Actionable Tips</h2>
            </div>
            <ul className="space-y-3 list-disc list-inside text-slate-300">
                {report.actionableTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                ))}
            </ul>
        </div>
      </Card>
      
      <Card>
        <div className="p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-6">Your Answers & Feedback</h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {interviewData.map((data, index) => (
                    <div key={data.question.id} className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg">
                        <h3 className="font-bold text-lg text-cyan-300">Question {index + 1}: <span className="text-slate-200">{data.question.question}</span></h3>
                        
                        <div className="mt-4 pl-4 border-l-2 border-slate-600">
                            <h4 className="font-semibold text-slate-300">Your Answer:</h4>
                            <p className="text-slate-400 italic">"{data.answer || 'No answer provided.'}"</p>
                        </div>
                        
                        {data.feedback && (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <h4 className="font-semibold text-slate-300 mb-3">AI Feedback:</h4>
                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                    {Object.entries(data.feedback.scores).map(([key, value]) => (
                                        <div key={key} className="bg-slate-800 p-3 rounded-lg text-center">
                                            <p className="text-sm text-slate-400 capitalize">{key}</p>
                                            <p className="text-xl font-bold text-white">{value}/10</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h5 className="font-semibold text-green-400/90">Strengths:</h5>
                                    <p className="text-slate-300 text-sm mb-2">{data.feedback.strengths}</p>
                                    <h5 className="font-semibold text-amber-400/90">Improvements:</h5>
                                    <p className="text-slate-300 text-sm">{data.feedback.improvements}</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </Card>

      <div className="text-center pt-4">
        <Button onClick={onRestart} size="lg">
          Practice Again
        </Button>
      </div>
    </div>
  );
};

export default ReportScreen;
