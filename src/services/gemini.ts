import { GoogleGenAI } from '@google/genai';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// đảm bảo không crash nếu aistudio không tồn tại
export async function ensureApiKey() {
  if (typeof window !== "undefined" && window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
}

// API KEY
const API_KEY = "AIzaSyB5mjBgHyfyvLotgjx2kz7YjgUF8cu0WYQ";

export const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeImage(base64Image: string) {
  await ensureApiKey();

  const ai = getAI();
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const model = 'gemini-3.1-flash-image-preview';

  const prompt = `
Bạn là chuyên gia thẩm mỹ về môi. Hãy phân tích hình ảnh môi này của khách hàng.

1. Xác định vùng môi
2. Phân tích các vấn đề: thâm, nhạt màu, khô, không đều màu
3. Đưa ra đánh giá ngắn gọn, chuyên nghiệp (3-4 câu)
4. Đề xuất giải pháp xăm môi phù hợp

Trả về JSON:

{
 "analysis": "Đánh giá chi tiết",
 "issues": ["Thâm viền","Khô"],
 "recommendation": "Đề xuất"
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

export async function simulateLipTattoo(
  base64Image: string,
  color: string,
  description: string
) {

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

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image generated');
}

export async function generateLipImage(
  prompt: string,
  size: '1K' | '2K' | '4K' = '1K'
) {

  await ensureApiKey();

  const ai = getAI();

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