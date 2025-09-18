import React, { useState } from 'react';
import * as dbService from '../services/dbService';
import { SparklesIcon } from './icons/SparklesIcon';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Email and password are required.');
      setIsLoading(false);
      return;
    }

    try {
        if (isRegistering) {
            await dbService.registerUser(email, password);
            setRegistrationSuccess(true);
        } else {
            const user = await dbService.login(email, password);
            if (!user) {
                setError('Invalid email or password.');
            }
        }
    } catch (err) {
        // FIX: Improved error handling to extract message from Supabase/Postgrest errors.
        const errorMessage = (err && typeof err === 'object' && 'message' in err) 
            ? String(err.message) 
            : 'An unknown error occurred.';
            
        if (!isRegistering && errorMessage.includes('Invalid login credentials')) {
            setError('Invalid email or password. If you just registered, please check your email for a verification link.');
        } else {
            setError(errorMessage);
        }
        console.error("Auth error:", err);
    } finally {
        setIsLoading(false);
    }
  };
  
  if (registrationSuccess) {
    return (
       <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
              <SparklesIcon className="h-12 w-12 text-brand-primary" />
              <h1 className="text-3xl font-bold tracking-tight text-base-content mt-2">
                Poster Generator AI
              </h1>
          </div>
          <div className="bg-base-200 p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Registration Successful!</h2>
            <p className="text-base-content">
              We've sent a verification link to <span className="font-bold text-brand-secondary">{email}</span>.
            </p>
            <p className="text-base-content mt-2">
              Please check your inbox to complete the process.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
            <SparklesIcon className="h-12 w-12 text-brand-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-base-content mt-2">
              Poster Generator AI
            </h1>
            <p className="text-gray-400">Sign in to continue</p>
        </div>

        <div className="bg-base-200 p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-center text-brand-secondary">
              {isRegistering ? 'Create an Account' : 'Welcome Back!'}
            </h2>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 bg-base-100 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-base-100 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 font-bold text-white bg-brand-primary rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary disabled:bg-base-300 transition-colors"
              >
                {isLoading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-sm text-brand-secondary hover:text-brand-primary"
            >
              {isRegistering
                ? 'Already have an account? Login'
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};