import React from 'react';
import { GenerationStatus, GenerationResult } from '../types';
import { Loader } from './Loader';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultDisplayProps {
  status: GenerationStatus;
  originalImage: File | null;
  generatedImageUrl: string | null;
  generationResult: GenerationResult | null;
  error: string | null;
}

const IdleState: React.FC = () => (
  <div className="text-center text-gray-400">
    <p className="text-lg font-medium">Your generated poster will appear here.</p>
    <p className="text-sm">Upload an image and provide a prompt to get started.</p>
  </div>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="text-center text-red-400 border border-red-400/50 bg-red-400/10 p-4 rounded-lg">
    <h3 className="font-bold text-lg mb-2">Generation Failed</h3>
    <p className="text-sm">{error}</p>
  </div>
);

const StatsDisplay: React.FC<{ result: GenerationResult }> = ({ result }) => (
  <div className="bg-base-100 p-4 rounded-lg mt-4 border border-base-300">
    <h4 className="font-bold text-md mb-3 text-brand-secondary">Generation Stats</h4>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
      <div className="flex flex-col">
        <span className="text-gray-400">Model</span>
        <span className="font-mono text-base-content break-all">{result.model}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-400">Finish Reason</span>
        <span className="font-mono text-base-content">{result.finishReason || 'N/A'}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-400">Prompt Tokens</span>
        <span className="font-mono text-base-content">{result.usageMetadata?.promptTokenCount ?? 'N/A'}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-400">Output Tokens</span>
        <span className="font-mono text-base-content">{result.usageMetadata?.candidatesTokenCount ?? 'N/A'}</span>
      </div>
      <div className="flex flex-col col-span-2 sm:col-span-1">
        <span className="text-gray-400">Total Tokens</span>
        <span className="font-mono text-base-content">{result.usageMetadata?.totalTokenCount ?? 'N/A'}</span>
      </div>
    </div>
  </div>
);

const SuccessState: React.FC<{ originalImage: File; generatedImageUrl: string; generationResult: GenerationResult }> = ({ originalImage, generatedImageUrl, generationResult }) => {
    return (
        <div className="animate-fade-in w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-lg mb-2 text-center text-gray-400">Original</h3>
                    <img src={URL.createObjectURL(originalImage)} alt="Original" className="w-full h-auto object-contain rounded-lg shadow-md max-h-[60vh]"/>
                </div>
                <div className="relative">
                    <h3 className="font-bold text-lg mb-2 text-center">Generated Poster</h3>
                    <img src={generatedImageUrl} alt="Generated Poster" className="w-full h-auto object-contain rounded-lg shadow-md max-h-[60vh]"/>
                    <a
                      href={generatedImageUrl}
                      download="generated-poster.png"
                      className="absolute top-14 right-2 mt-2 mr-2 flex items-center px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg shadow-lg hover:bg-brand-secondary transition-colors duration-200"
                    >
                      <DownloadIcon className="w-5 h-5 mr-2" />
                      Download
                    </a>
                </div>
            </div>
            <StatsDisplay result={generationResult} />
        </div>
    );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ status, originalImage, generatedImageUrl, generationResult, error }) => {
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center bg-base-100 rounded-lg p-4">
      {status === GenerationStatus.IDLE && <IdleState />}
      {status === GenerationStatus.LOADING && <Loader />}
      {status === GenerationStatus.ERROR && error && <ErrorState error={error} />}
      {status === GenerationStatus.SUCCESS && generatedImageUrl && generationResult && originalImage && (
        <SuccessState originalImage={originalImage} generatedImageUrl={generatedImageUrl} generationResult={generationResult} />
      )}
    </div>
  );
};