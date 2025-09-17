
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

const loadingMessages = [
  "Warming up the AI's creative circuits...",
  "Mixing digital paints and pixels...",
  "Consulting the muses of design...",
  "Generating a masterpiece...",
  "Polishing the final details...",
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(prevMessage => {
                const currentIndex = loadingMessages.indexOf(prevMessage);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
                <SparklesIcon className="w-16 h-16 text-brand-primary animate-pulse-fast" />
            </div>
            <p className="text-lg font-semibold text-brand-secondary transition-all duration-500">{message}</p>
            <p className="text-sm text-gray-400">This may take a moment.</p>
        </div>
    );
};
