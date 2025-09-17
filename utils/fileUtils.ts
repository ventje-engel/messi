
/**
 * Converts a File object to a part for a multimodal request.
 * This involves reading the file as a base64 string.
 */
// FIX: Use an inline type for the return value, as InlineDataPart is not an exported member from @google/genai.
export function fileToGenerativePart(file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as base64 string.'));
      }
      // The result includes the data URL prefix (e.g., "data:image/png;base64,"), 
      // which we need to remove.
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
