import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HistoryEntry } from '../types';
import { deleteImages } from './storageService';

const supabaseUrl = window.process.env.SUPABASE_URL;
const supabaseAnonKey = window.process.env.SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;
let configError: string | null = null;

if (!supabaseUrl || supabaseUrl.startsWith('__SUPABASE_URL')) {
  configError = "Configuration Error: Supabase URL is not provided. Please ensure the SUPABASE_URL environment variable is set.";
} else if (!supabaseAnonKey || supabaseAnonKey.startsWith('__SUPABASE_ANON_KEY')) {
  configError = "Configuration Error: Supabase Anon Key is not provided. Please ensure the SUPABASE_ANON_KEY environment variable is set.";
} else {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Supabase initialization error:", e);
    configError = e instanceof Error ? e.message : 'Failed to initialize Supabase client.';
  }
}

export const supabase = supabaseClient;
export const supabaseConfigError = configError;

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error(supabaseConfigError || "Supabase client not initialized.");
  }
};

// --- User Functions ---

export const registerUser = async (email: string, password: string) => {
    ensureSupabase();
    const { data, error } = await supabase!.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
};

export const login = async (email: string, password: string) => {
    ensureSupabase();
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
};

// --- Generation History Functions ---

type GenerationForInsert = Omit<HistoryEntry, 'id' | 'createdAt'>;

export const addGeneration = async (generation: GenerationForInsert): Promise<HistoryEntry> => {
    ensureSupabase();
    // Map from app's camelCase to DB's snake_case for insertion
    const generationForDb = {
        user_id: generation.userId,
        prompt: generation.prompt,
        original_image_path: generation.originalImagePath,
        generated_image_path: generation.generatedImagePath,
        generation_result: generation.generationResult
    };

    const { data, error } = await supabase!
        .from('generations')
        .insert([generationForDb])
        .select()
        .single();
    if (error) {
        console.error('Error adding generation:', error.message, error);
        throw error;
    }
     // Map from DB's snake_case to app's camelCase for return value
    return {
        id: data.id,
        userId: data.user_id,
        createdAt: data.created_at,
        prompt: data.prompt,
        originalImagePath: data.original_image_path,
        generatedImagePath: data.generated_image_path,
        generationResult: data.generation_result,
    };
};

export const getAllGenerations = async (userId: string): Promise<HistoryEntry[]> => {
    ensureSupabase();
    const { data, error } = await supabase!
        .from('generations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error getting all generations:', error.message, error);
        throw error;
    }
    // Map from DB's snake_case to app's camelCase
    return data.map(item => ({
        id: item.id,
        userId: item.user_id,
        createdAt: item.created_at,
        prompt: item.prompt,
        originalImagePath: item.original_image_path,
        generatedImagePath: item.generated_image_path,
        generationResult: item.generation_result,
    }));
};

export const deleteGeneration = async (entry: HistoryEntry): Promise<boolean> => {
    ensureSupabase();
    
    // First, delete associated images from storage
    const pathsToDelete = [entry.originalImagePath, entry.generatedImagePath].filter(p => !!p);
    await deleteImages(pathsToDelete);

    // Then, delete the record from the database
    const { error } = await supabase!
        .from('generations')
        .delete()
        .eq('id', entry.id);

    if (error) {
        console.error('Error deleting generation record:', error);
        return false;
    }
    return true;
};