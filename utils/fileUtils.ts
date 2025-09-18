/**
 * Converts a File object to a part for a multimodal request.
 * This involves reading the file as a base64 string.
 */
export function fileToGenerativePart(file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as base64 string.'));
      }
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

/**
 * Converts a File object to a base64 string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('Failed to read file as base64 string.'));
      }
      const base64Data = reader.result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}


/**
 * Converts a base64 string back to a File object.
 */
export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

/**
 * Fetches an image from a URL and converts it to a File object.
 */
export async function urlToFile(url: string, filename: string, mimeType: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${url}`);
  }
  const blob = await response.blob();
  return new File([blob], filename, { type: mimeType });
}