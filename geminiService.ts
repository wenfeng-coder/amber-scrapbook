
import { GoogleGenAI, Type } from "@google/genai";

// Use gemini-3-flash-preview for vision analysis tasks as it is efficient for extraction.
export async function analyzeImageDesign(base64Image: string): Promise<string[]> {
  // Always use direct process.env.API_KEY for initialization as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              // Correctly handle base64 data strings that might include data URI prefixes.
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: "Extract 5-10 professional design terminology keywords inspired by this image. Examples: 'Bauhaus', 'Neomorphism', 'Minimalism', 'Swiss Style', 'Brutalism', 'Color Block', 'Serif Typography', 'Glassmorphism'. Output ONLY a JSON array of strings.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    // .text is a property on the response object, not a method.
    const text = response.text;
    const result = JSON.parse(text || "[]");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback tags for a resilient UI.
    return ["Inspiration", "Moodboard", "Design"];
  }
}
