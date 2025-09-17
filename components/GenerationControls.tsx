
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface GenerationControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

const promptSuggestions = [
  "Turn this into a vintage movie poster.",
  "Make a futuristic ad for this product.",
  "Redesign this for a minimalist coffee shop.",
  "Give this a vibrant, pop-art style.",
];

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  isLoading,
  isDisabled,
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., 'Make a vibrant, pop-art style poster with bold text saying `SALE`'"
        className="w-full h-32 p-3 bg-base-100 border border-base-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-sm placeholder-gray-500 resize-none"
        disabled={isDisabled}
      />
      <div className="text-xs text-gray-400">
        <p className="font-semibold mb-1">Suggestions:</p>
        <div className="flex flex-wrap gap-1">
          {promptSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPrompt(suggestion)}
              disabled={isDisabled}
              className="px-2 py-1 bg-base-300 rounded-md hover:bg-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={onGenerate}
        disabled={isLoading || isDisabled || !prompt}
        className="w-full flex items-center justify-center px-4 py-3 font-bold text-white bg-brand-primary rounded-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-200 focus:ring-brand-primary disabled:bg-base-300 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5 mr-2" />
            Generate Poster
          </>
        )}
      </button>
    </div>
  );
};
