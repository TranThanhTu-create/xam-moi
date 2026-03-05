import { GoogleGenAI } from "@google/genai";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

/* ================= API KEY ================= */

const API_KEY = "AIzaSyB5mjBgHyfyvLotgjx2kz7YjgUF8cu0WYQ";

export const getAI = () => new GoogleGenAI({
  apiKey: API_KEY
});

/* ================= ENSURE KEY ================= */

export async function ensureApiKey() {

  if (typeof window !== "undefined" && window.aistudio) {

    const hasKey = await window.aistudio.hasSelectedApiKey();

    if (!hasKey) {
      await window.aistudio.openSelectKey();
    }

  }

}

/* ================= ANALYZE IMAGE ================= */

export async function analyzeImage(base64Image: string) {

  try {

    await ensureApiKey();

    const ai = getAI();

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
Bạn là chuyên gia thẩm mỹ môi.

1. Phân tích tình trạng môi
2. Liệt kê các vấn đề môi
3. Đưa ra đánh giá ngắn gọn
4. Đề xuất giải pháp xăm môi

Trả về JSON:

{
 "analysis":"",
 "issues":[],
 "recommendation":""
}
`;

    const response = await ai.models.generateContent({

      model: "gemini-3.1-flash-image-preview",

      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ]

    });

    const text = response.text || "{}";

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {

      return JSON.parse(clean);

    } catch {

      return {
        analysis: clean,
        issues: [],
        recommendation: ""
      };

    }

  } catch (error) {

    console.error("AI analyze error:", error);

    return {
      analysis: "Không thể phân tích hình ảnh. Vui lòng thử lại.",
      issues: [],
      recommendation: ""
    };

  }

}

/* ================= SIMULATE LIP TATTOO ================= */

export async function simulateLipTattoo(
  base64Image: string,
  color: string,
  description: string
) {

  try {

    await ensureApiKey();

    const ai = getAI();

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
Apply a realistic lip tattoo color ${color} with style ${description}.
Focus on lips and keep the face natural.
Photorealistic result.
`;

    const response = await ai.models.generateContent({

      model: "gemini-3.1-flash-image-preview",

      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]
        }
      ]

    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {

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

/* ================= GENERATE IMAGE ================= */

export async function generateLipImage(
  prompt: string,
  size: "1K" | "2K" | "4K" = "1K"
) {

  try {

    await ensureApiKey();

    const ai = getAI();

    const response = await ai.models.generateContent({

      model: "gemini-3-pro-image-preview",

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],

      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1"
        }
      }

    });

    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {

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