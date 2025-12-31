import React, { useState, useEffect } from 'react';
import { User, InterviewRecord } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import { SettingsIcon, HistoryIcon } from './ui/icons';
import { loadInterviewHistory } from '../backend/api';
import Spinner from './ui/Spinner';

interface ProfileScreenProps {
  currentUser: User;
  onUpdateProfile: (updatedUser: User) => void;
  onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onUpdateProfile, onBack }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<InterviewRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        const records = await loadInterviewHistory(currentUser);
        setHistory(records);
        setIsLoadingHistory(false);
    };
    fetchHistory();
  }, [currentUser]);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Name cannot be empty.';
    }
    if (!email.trim()) {
      newErrors.email = 'Email cannot be empty.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      try {
        onUpdateProfile({ name: name.trim(), email: email.trim() });
        setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      } catch (error) {
        setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
      } finally {
        setIsSaving(false);
      }
    }, 500);
  };
  
  useEffect(() => {
    if(feedback) {
        const timer = setTimeout(() => setFeedback(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [feedback]);

  return (
    <div className="animate-fade-in space-y-8">
      <Card>
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-slate-700 rounded-full mr-4">
              <SettingsIcon className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Profile Settings</h1>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                aria-label="Your Name"
              />
              {errors.name && <p className="text-red-400 mt-1 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                aria-label="Your Email"
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
              {errors.email && <p className="text-red-400 mt-1 text-sm">{errors.email}</p>}
            </div>

            {feedback && (
              <div className={`p-3 rounded-lg text-center text-sm ${
                feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
              }`}>
                {feedback.message}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" onClick={onBack} className="flex-1">
                Back
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-slate-700 rounded-full mr-4">
              <HistoryIcon className="w-7 h-7 text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Interview History</h1>
          </div>
          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : history.length > 0 ? (
            <ul className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {history.map((record, index) => (
                <li key={index} className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-200">Interview Session</p>
                    <p className="text-sm text-slate-400">
                      {new Date(record.date).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded-full">
                    {record.interviewData.length} Questions
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-center py-4">
              You haven't completed any interviews yet. Your past reports will appear here.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProfileScreen;
