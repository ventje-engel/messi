import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface HeaderProps {
  email?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ email, onLogout }) => {
  return (
    <header className="bg-base-200/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 border-b border-base-300">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-base-content">
              Poster Generator AI
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             {email && (
              <span className="hidden sm:block text-sm text-gray-300">
                Welcome, <span className="font-bold text-brand-secondary">{email}</span>
              </span>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-base-300/50 rounded-md hover:bg-brand-primary hover:text-white transition-colors"
                aria-label="Logout"
              >
                <LogoutIcon className="h-5 w-5 sm:mr-2" />
                <span className="hidden sm:block">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
