import React from 'react';
import { HistoryEntry } from '../types';
import { TrashIcon } from './icons/TrashIcon';

// The history object passed in will be augmented with a thumbnailUrl
export type DisplayHistoryEntry = HistoryEntry & { thumbnailUrl: string };

interface HistoryPanelProps {
  history: DisplayHistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (entry: HistoryEntry) => void;
  selectedId: string | null;
}

const HistoryItem: React.FC<{ entry: DisplayHistoryEntry; onSelect: () => void; onDelete: () => void; isSelected: boolean }> = ({ entry, onSelect, onDelete, isSelected }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent onSelect from firing when delete is clicked
    onDelete();
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center p-3 space-x-4 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-brand-primary/20 ring-2 ring-brand-secondary' : 'bg-base-100 hover:bg-base-300/50'}`}
    >
      <img src={entry.thumbnailUrl} alt="Generated thumbnail" className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-base-300" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-base-content truncate" title={entry.prompt}>
          {entry.prompt}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(entry.createdAt).toLocaleString()}
        </p>
      </div>
      <button
        onClick={handleDelete}
        className="p-2 rounded-full text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        aria-label="Delete history item"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onDelete, selectedId }) => {
  if (history.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>Your generation history is empty.</p>
        <p className="text-sm">Completed generations will be saved here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {history.map((entry) => (
        <HistoryItem
          key={entry.id}
          entry={entry}
          onSelect={() => onSelect(entry)}
          onDelete={() => onDelete(entry)}
          isSelected={selectedId === entry.id}
        />
      ))}
    </div>
  );
};