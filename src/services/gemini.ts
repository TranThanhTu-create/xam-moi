import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyB5mjBgHyfyvLotgjx2kz7YjgUF8cu0WYQ"
});

/* ================= ANALYZE IMAGE ================= */

export async function analyzeImage(base64Image: string) {

  try {

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
Bạn là chuyên gia thẩm mỹ môi.

Phân tích tình trạng môi trong ảnh.

Trả JSON:

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

    return JSON.parse(clean);

  } catch (error) {

    console.error("Analyze error:", error);

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

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
Apply a realistic lip tattoo color ${color} with style ${description}.
Focus only on lips.
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

    console.error("Tattoo error:", error);

    throw new Error("No image generated");

  }

}


/* ================= GENERATE IMAGE ================= */

export async function generateLipImage(prompt: string) {

  try {

    const response = await ai.models.generateContent({

      model: "gemini-3-pro-image-preview",

      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
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

    console.error("Generate error:", error);

    throw new Error("No image generated");

  }

}