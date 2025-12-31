import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Alert from './ui/Alert';
import { RobotIcon } from './ui/icons';
import { User } from '../types';
import { register, login } from '../services/authService';
import Spinner from './ui/Spinner';

interface AuthScreenProps {
  onLogin: (user: User) => void;
  error?: string | null;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, error }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    try {
      let user: User;
      if (isLoginView) {
        if (!email.trim() || !password.trim()) {
            setLocalError("Email and password cannot be empty.");
            return;
        }
        user = await login(email.trim(), password.trim());
        onLogin(user);
      } else {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setLocalError("Name, email, and password cannot be empty.");
            return;
        }
        user = await register(name.trim(), email.trim(), password.trim());
        onLogin(user);
      }
    } catch (err) {
      if (err instanceof Error) {
        setLocalError(err.message);
      } else {
        setLocalError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setName('');
    setEmail('');
    setPassword('');
    setLocalError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <Card>
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-slate-700 rounded-full">
              <RobotIcon className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isLoginView ? 'Welcome Back!' : 'Create Your Account'}
          </h1>
          <p className="text-slate-400 mb-8">
            {isLoginView 
              ? 'Login to continue your interview practice.'
              : 'Sign up to start your journey with AI Interview Coach.'
            }
          </p>
          
          {localError && (
             <div className="mb-4 text-left">
                <Alert message={localError} title="Authentication Failed" />
              </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {!isLoginView && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
                aria-label="Your Name"
                required
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
              aria-label="Your Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-200"
              aria-label="Your Password"
              required
            />
            <Button type="submit" className="mt-2" disabled={isLoading}>
              {isLoading ? (
                  <div className="flex items-center">
                      <Spinner className="h-5 w-5 mr-2" />
                      <span>{isLoginView ? 'Logging in...' : 'Registering...'}</span>
                  </div>
              ) : (isLoginView ? 'Login' : 'Register')}
            </Button>
          </form>
          <p className="text-slate-400 mt-6 text-sm">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleView} className="font-semibold text-cyan-400 hover:text-cyan-300 focus:outline-none" disabled={isLoading}>
              {isLoginView ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AuthScreen;