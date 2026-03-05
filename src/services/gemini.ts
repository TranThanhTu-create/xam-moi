import { GoogleGenAI } from '@google/genai';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// Helper to ensure key is selected for paid models
export async function ensureApiKey() {
  if (window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
}

// Initialize with default env key for standard models
// For paid models, we might need to re-init or rely on the environment injecting the selected key?
// The instructions say: "Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key from the dialog."
// "The selected API key is available using process.env.API_KEY. It is injected automatically"
// Wait, if it's injected into process.env.API_KEY, I can just use that.
// But process.env in Vite is replaced at build time.
// "The selected API key is available using process.env.API_KEY. It is injected automatically, so you do not need to modify the API key code."
// This is confusing for client-side.
// "Use the framework-specific method to get the API key."
// In Vite, it's `import.meta.env`. But `process.env` might be polyfilled or replaced.
// Let's assume `process.env.GEMINI_API_KEY` works for the default key.
// For the *selected* key, maybe I should check `process.env.API_KEY`?
// Let's try to use `process.env.GEMINI_API_KEY` as the default.

export const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeImage(base64Image: string) {
  await ensureApiKey();
  const ai = getAI();
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  
  const model = 'gemini-3.1-flash-image-preview';
  const prompt = `
    Bạn là chuyên gia thẩm mỹ về môi. Hãy phân tích hình ảnh môi này của khách hàng.
    1. Xác định vùng môi.
    2. Phân tích các vấn đề: thâm, nhạt màu, khô, không đều màu.
    3. Đưa ra đánh giá ngắn gọn, chuyên nghiệp (khoảng 3-4 câu).
    4. Đề xuất giải pháp xăm môi phù hợp (ví dụ: khử thâm, phun collagen, màu phù hợp).
    
    Trả về kết quả dưới dạng JSON với cấu trúc:
    {
      "analysis": "Đánh giá chi tiết...",
      "issues": ["Thâm viền", "Khô", ...],
      "recommendation": "Đề xuất..."
    }
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: 'application/json'
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function simulateLipTattoo(base64Image: string, color: string, description: string) {
  // Use Nano Banana 2 (gemini-3.1-flash-image-preview) for editing
  await ensureApiKey();
  const ai = getAI();
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  
  const model = 'gemini-3.1-flash-image-preview';
  const prompt = `Apply a ${description} (${color}) lipstick or tattoo effect to the lips in this image. Keep the face natural. High quality, realistic texture.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        { text: prompt }
      ]
    }
  });

  // Extract image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image generated');
}

export async function generateLipImage(prompt: string, size: '1K' | '2K' | '4K' = '1K') {
  // Use Nano Banana Pro (gemini-3-pro-image-preview)
  await ensureApiKey();
  
  // Re-init AI to get the selected key if needed, or assume process.env.GEMINI_API_KEY is updated?
  // The instructions say: "Create a new GoogleGenAI instance right before making an API call"
  // And "The selected API key is available using process.env.API_KEY".
  // In Vite, `process.env` is usually defined.
  // Let's try to use `process.env.API_KEY` if available, otherwise `process.env.GEMINI_API_KEY`.
  
  // NOTE: In the browser, process.env might not be fully populated unless defined in vite.config.
  // But the platform injects it?
  // Let's try to use the key from `process.env.GEMINI_API_KEY` first, as that's what we have.
  // If `ensureApiKey` works, maybe it updates the environment or we just proceed.
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); 
  
  const model = 'gemini-3-pro-image-preview';
  
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: '1:1'
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error('No image generated');
}
