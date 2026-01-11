
import { GoogleGenAI } from "@google/genai";
import { AspectRatio, Quality } from "../types";

export class GeminiService {
  /**
   * Generates a wallpaper using the Gemini API.
   * Instantiates GoogleGenAI inside the method to ensure the most up-to-date API key is used.
   */
  static async generateWallpaper(
    prompt: string, 
    settings: { aspectRatio: AspectRatio; quality: Quality },
    referenceBase64?: string
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Choose model based on quality. Ultra uses Pro, others use Flash.
    let model = settings.quality === 'Ultra' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    // Prompt engineering for quality simulation
    let finalPrompt = prompt;
    if (settings.quality === 'High') {
      finalPrompt = `High quality, detailed, 4k resolution: ${prompt}`;
    } else if (settings.quality === 'Ultra') {
      finalPrompt = `Ultra-detailed, masterpiece, 8k resolution, professional photography, cinematic lighting, sharp focus: ${prompt}`;
    }

    const parts: any[] = [{ text: finalPrompt }];
    
    if (referenceBase64) {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: referenceBase64
        }
      });
    }

    try {
      return await this.executeGeneration(ai, model, parts, settings);
    } catch (err: any) {
      const errorMessage = err.message || "";
      const isPermissionError = errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("403");
      const isNotFoundError = errorMessage.includes("Requested entity was not found.");

      if (isPermissionError || isNotFoundError) {
        console.warn("API Key issue detected, prompting for re-selection:", errorMessage);
        await this.openKeySelector();
        
        // If it was a permission error on the Pro model, try falling back to Flash immediately for a better UX
        if (isPermissionError && model === 'gemini-3-pro-image-preview') {
          console.info("Falling back to gemini-2.5-flash-image due to permission error.");
          return await this.executeGeneration(ai, 'gemini-2.5-flash-image', parts, settings);
        }
      }
      throw err;
    }
  }

  /**
   * Internal helper to execute the generateContent call.
   */
  private static async executeGeneration(
    ai: GoogleGenAI, 
    model: string, 
    parts: any[], 
    settings: { aspectRatio: AspectRatio }
  ): Promise<string> {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          ...(model === 'gemini-3-pro-image-preview' ? { imageSize: '2K' } : {})
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    throw new Error("No image data returned from API");
  }

  /**
   * Checks if an API key has been selected in AI Studio.
   */
  static async hasKey(): Promise<boolean> {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      // @ts-ignore
      return await window.aistudio.hasSelectedApiKey();
    }
    return !!process.env.API_KEY;
  }

  /**
   * Opens the AI Studio API key selection dialog.
   */
  static async openKeySelector(): Promise<void> {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }
}
