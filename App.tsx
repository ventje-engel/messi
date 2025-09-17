
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { GenerationControls } from './components/GenerationControls';
import { ResultDisplay } from './components/ResultDisplay';
import { generatePoster } from './services/geminiService';
import { fileToGenerativePart } from './utils/fileUtils';
import { GenerationStatus, GenerationResult } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setOriginalImage(file);
    setGenerationResult(null);
    setStatus(GenerationStatus.IDLE);
  }, []);
  
  const handleGenerate = useCallback(async () => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and enter a prompt.');
      setStatus(GenerationStatus.ERROR);
      return;
    }

    setStatus(GenerationStatus.LOADING);
    setError(null);
    setGenerationResult(null);

    try {
      const imagePart = await fileToGenerativePart(originalImage);
      const result = await generatePoster(imagePart, prompt);
      
      if (result) {
        setGenerationResult(result);
        setStatus(GenerationStatus.SUCCESS);
      } else {
        throw new Error('The AI did not return an image. Try refining your prompt.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setStatus(GenerationStatus.ERROR);
    }
  }, [originalImage, prompt]);

  return (
    <div className="min-h-screen bg-base-100 font-sans text-base-content">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-brand-secondary flex items-center">
                <span className="bg-brand-primary text-white rounded-full h-8 w-8 flex items-center justify-center mr-3">1</span>
                Upload Image
              </h2>
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>

            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-brand-secondary flex items-center">
                <span className="bg-brand-primary text-white rounded-full h-8 w-8 flex items-center justify-center mr-3">2</span>
                Describe Your Poster
              </h2>
              <GenerationControls
                prompt={prompt}
                setPrompt={setPrompt}
                onGenerate={handleGenerate}
                isLoading={status === GenerationStatus.LOADING}
                isDisabled={!originalImage}
              />
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9 bg-base-200 p-6 rounded-lg shadow-lg">
             <h2 className="text-xl font-bold mb-4 text-brand-secondary flex items-center">
                <span className="bg-brand-primary text-white rounded-full h-8 w-8 flex items-center justify-center mr-3">3</span>
                View Result
              </h2>
            <ResultDisplay 
              status={status}
              originalImage={originalImage}
              generationResult={generationResult}
              error={error}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
