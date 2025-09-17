
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
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
          <p className="hidden md:block text-sm text-gray-400">
            Create stunning posters with the power of AI
          </p>
        </div>
      </div>
    </header>
  );
};
