import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './Header';
import { ImageUploader } from './ImageUploader';
import { GenerationControls } from './GenerationControls';
import { ResultDisplay } from './ResultDisplay';
import { HistoryPanel } from './HistoryPanel';
import { generatePoster, ApiGenerationResult } from '../services/geminiService';
import * as dbService from '../services/dbService';
import * as storageService from '../services/storageService';
import { fileToGenerativePart, base64ToFile, urlToFile } from '../utils/fileUtils';
import { GenerationStatus, GenerationResult, HistoryEntry, User } from '../types';

interface GeneratorPageProps {
  user: User;
  onLogout: () => void;
}

export const GeneratorPage: React.FC<GeneratorPageProps> = ({ user, onLogout }) => {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);


  useEffect(() => {
    const loadHistory = async () => {
      if (user) {
        try {
          const loadedHistory = await dbService.getAllGenerations(user.id);
          setHistory(loadedHistory);
        } catch (err) {
            console.error("Failed to load history:", err);
            const message = (err && typeof err === 'object' && 'message' in err) 
                ? String(err.message) 
                : 'Could not load generation history.';
            setError(message);
        }
      }
    };
    loadHistory();
  }, [user]);

  const clearSelection = () => {
    setOriginalImage(null);
    setPrompt('');
    setGenerationResult(null);
    setGeneratedImageUrl(null);
    setStatus(GenerationStatus.IDLE);
    setError(null);
    setSelectedHistoryId(null);
  };

  const handleImageUpload = useCallback((file: File) => {
    clearSelection();
    setOriginalImage(file);
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
    setGeneratedImageUrl(null);

    try {
      const imagePart = await fileToGenerativePart(originalImage);
      const resultWithB64 = await generatePoster(imagePart, prompt);
      
      if (resultWithB64 && resultWithB64.imageB64) {
        const { imageB64, ...result } = resultWithB64;

        setGenerationResult(result);
        setGeneratedImageUrl(`data:image/png;base64,${imageB64}`);
        setStatus(GenerationStatus.SUCCESS);
        
        // Convert generated image to File to upload to storage
        const generatedFile = base64ToFile(imageB64, 'generated-poster.png', 'image/png');

        const [originalImagePath, generatedImagePath] = await Promise.all([
            storageService.uploadImage(user.id, originalImage),
            storageService.uploadImage(user.id, generatedFile)
        ]);
        
        const newEntryData = {
          userId: user.id,
          prompt,
          originalImagePath,
          generatedImagePath,
          generationResult: result,
        };

        const newEntry = await dbService.addGeneration(newEntryData);
        setHistory(prevHistory => [newEntry, ...prevHistory]);
        setSelectedHistoryId(newEntry.id);

      } else {
        throw new Error('The AI did not return an image. Try refining your prompt.');
      }
    } catch (err) {
      console.error("Generation process failed:", err);
      const message = (err && typeof err === 'object' && 'message' in err) 
        ? String(err.message) 
        : 'An unknown error occurred.';
      setError(message);
      setStatus(GenerationStatus.ERROR);
    }
  }, [originalImage, prompt, user.id]);

  const handleSelectHistory = useCallback(async (entry: HistoryEntry) => {
    try {
        clearSelection();
        setStatus(GenerationStatus.LOADING);
        
        const originalImageUrl = storageService.getPublicUrl(entry.originalImagePath);
        const generatedImageUrl = storageService.getPublicUrl(entry.generatedImagePath);

        const originalFile = await urlToFile(originalImageUrl, `original-${entry.id}.png`, 'image/png');
        
        setOriginalImage(originalFile);
        setPrompt(entry.prompt);
        setGenerationResult(entry.generationResult);
        setGeneratedImageUrl(generatedImageUrl);
        setStatus(GenerationStatus.SUCCESS);
        setSelectedHistoryId(entry.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error("Failed to select history item:", err);
        const message = (err && typeof err === 'object' && 'message' in err) ? String(err.message) : 'Could not load selected history item.';
        setError(message);
        setStatus(GenerationStatus.ERROR);
    }
  }, []);

  const handleDeleteHistory = useCallback(async (entry: HistoryEntry) => {
    await dbService.deleteGeneration(entry);
    setHistory(prevHistory => prevHistory.filter(item => item.id !== entry.id));
    if (selectedHistoryId === entry.id) {
       clearSelection();
    }
  }, [selectedHistoryId]);

  const historyForPanel = history.map(entry => ({
    ...entry,
    thumbnailUrl: storageService.getPublicUrl(entry.generatedImagePath)
  }));


  return (
    <div className="min-h-screen bg-base-100 font-sans text-base-content">
      <Header email={user.email} onLogout={onLogout} />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
             <div className="bg-base-200 p-6 rounded-lg shadow-lg">
                <button 
                  onClick={clearSelection}
                  className="w-full mb-4 px-4 py-2 text-sm font-semibold bg-base-300 hover:bg-brand-primary text-white rounded-md transition-colors"
                >
                  Start New Poster
                </button>
              <h2 className="text-xl font-bold mb-4 text-brand-secondary flex items-center">
                <span className="bg-brand-primary text-white rounded-full h-8 w-8 flex items-center justify-center mr-3">1</span>
                Upload Image
              </h2>
              <ImageUploader onImageUpload={handleImageUpload} image={originalImage} />
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

          <div className="lg:col-span-8 xl:col-span-9 space-y-8">
            <div className="bg-base-200 p-6 rounded-lg shadow-lg">
               <h2 className="text-xl font-bold mb-4 text-brand-secondary flex items-center">
                  <span className="bg-brand-primary text-white rounded-full h-8 w-8 flex items-center justify-center mr-3">3</span>
                  View Result
                </h2>
              <ResultDisplay 
                status={status}
                originalImage={originalImage}
                generatedImageUrl={generatedImageUrl}
                generationResult={generationResult}
                error={error}
              />
            </div>
             <div className="bg-base-200 p-6 rounded-lg shadow-lg">
               <h2 className="text-xl font-bold mb-4 text-brand-secondary">
                  Generation History
                </h2>
                <HistoryPanel 
                  history={historyForPanel}
                  onSelect={handleSelectHistory}
                  onDelete={handleDeleteHistory}
                  selectedId={selectedHistoryId}
                />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};