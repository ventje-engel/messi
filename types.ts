import type { User as SupabaseUser } from '@supabase/supabase-js';

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GenerationResult {
  // imageB64 is no longer stored here; it's in Supabase Storage.
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  finishReason?: string;
  model: string;
}

// Use the User type from Supabase Auth
export type User = SupabaseUser;

export interface HistoryEntry {
  id: string; 
  userId: string;
  createdAt: string; 
  prompt: string;
  originalImagePath: string; 
  generatedImagePath: string;
  generationResult: GenerationResult;
}