import { supabase } from './dbService';

const BUCKET_NAME = 'ImagePoster';

/**
 * Uploads a file to a user-specific folder in the Supabase Storage bucket.
 * @param userId - The ID of the user uploading the file.
 * @param file - The file to upload.
 * @returns The path of the uploaded file within the bucket.
 */
export const uploadImage = async (userId: string, file: File): Promise<string> => {
  if (!userId) {
    throw new Error('User must be authenticated to upload images.');
  }

  const fileExtension = file.name.split('.').pop() || 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase!.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return data.path;
};

/**
 * Deletes a list of images from the Supabase Storage bucket.
 * @param paths - An array of file paths to delete.
 */
export const deleteImages = async (paths: string[]): Promise<void> => {
    if (paths.length === 0) return;

    const { error } = await supabase!.storage
        .from(BUCKET_NAME)
        .remove(paths);
    
    if (error) {
        console.error('Error deleting images:', error);
        // We don't throw here to allow the DB record deletion to proceed
    }
};


/**
 * Gets the public URL for a given file path in the storage bucket.
 * @param path - The path of the file.
 * @returns The public URL string.
 */
export const getPublicUrl = (path: string): string => {
  if (!path) return '';
  const { data } = supabase!.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
};
