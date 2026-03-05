import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export async function ensureApiKey() {
  if (typeof window !== "undefined" && window.aistudio) {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }
  }
}

const API_KEY = "AIzaSyB5mjBgHyfyvLotgjx2kz7YjgUF8cu0WYQ";

export const getAI = () => new GoogleGenAI({ apiKey: API_KEY });

export async function analyzeImage(base64Image: string) {
  try {
    await ensureApiKey();

    const ai = getAI();

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const model = "gemini-2.5-flash";

    const prompt = `
Bạn là chuyên gia thẩm mỹ về môi. Hãy phân tích hình ảnh môi này của khách hàng.

1. Xác định vùng môi
2. Phân tích các vấn đề: thâm, nhạt màu, khô, không đều màu
3. Đưa ra đánh giá ngắn gọn (3-4 câu)
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
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: prompt },
        ],
      },
    });

    const text = response.text || "{}";

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(clean);
  } catch (error) {
    console.error("AI analyze error:", error);

    return {
      analysis: "Không thể phân tích hình ảnh. Vui lòng thử lại.",
      issues: [],
      recommendation: "",
    };
  }
}

export async function simulateLipTattoo(
  base64Image: string,
  color: string,
  description: string
) {
  try {
    await ensureApiKey();

    const ai = getAI();

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const model = "gemini-2.5-flash";

    const prompt = `Apply a ${description} (${color}) lipstick or tattoo effect to the lips in this image. Keep the face natural. High quality, realistic texture.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("AI tattoo error:", error);
    throw new Error("No image generated");
  }
}

export async function generateLipImage(
  prompt: string,
  size: "1K" | "2K" | "4K" = "1K"
) {
  try {
    await ensureApiKey();

    const ai = getAI();

    const model = "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("AI image error:", error);
    throw new Error("No image generated");
  }
}