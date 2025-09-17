
// FIX: Remove InlineDataPart from import as it is not an exported member.
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { GenerationResult } from "./types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image-preview';

export async function generatePoster(
  // FIX: Use an inline type for the image part, as InlineDataPart is not an exported member.
  imagePart: { inlineData: { data: string; mimeType: string; } },
  prompt: string
): Promise<GenerationResult | null> {
  try {
    const textPart = {
      text: `Create a poster based on the provided image and the following instructions. The output MUST be an image. Instructions: ${prompt}`,
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let imageB64: string | null = null;
    // The API can return multiple parts, we need to find the image part.
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        imageB64 = part.inlineData.data; // Return the base64 encoded image data
        break;
      }
    }
    
    if (imageB64) {
      return {
        imageB64: imageB64,
        usageMetadata: response.usageMetadata,
        finishReason: response.candidates[0].finishReason,
        model: model,
      };
    }

    // If no image is found, check for text which might contain an error or refusal.
    const textResponse = response.text;
    if (textResponse) {
        throw new Error(`AI returned text instead of an image: "${textResponse}"`);
    }

    return null;
  } catch (error) {
    console.error("Error generating poster:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate poster: ${error.message}`);
    }
    throw new Error("An unknown error occurred during poster generation.");
  }
}
