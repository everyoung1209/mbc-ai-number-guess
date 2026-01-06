
import { GoogleGenAI, Type } from "@google/genai";
import { AiFeedback, GuessRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAiFeedback = async (
  target: number,
  lastGuess: number,
  history: GuessRecord[]
): Promise<AiFeedback> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `사용자가 숫자 맞추기 게임(1-100)을 하고 있습니다.
      목표 숫자: ${target}
      사용자의 마지막 추측: ${lastGuess}
      이전 기록: ${history.map(h => h.value).join(', ')}
      
      현재 추측에 대해 위트 있고 짧은 한 줄 평(commentary)과 다음 차례를 위한 짧은 조언(advice)을 한국어로 작성해주세요.
      목표 숫자에 매우 가까우면(차이 5 이내) 격려해주고, 멀면 약간 장난스럽지만 도움이 되는 말을 해주세요.
      정답을 맞췄다면 아주 감탄하는 반응을 보여주세요.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commentary: { type: Type.STRING, description: "현재 추측에 대한 짧고 재치 있는 논평" },
            advice: { type: Type.STRING, description: "다음 단계를 위한 작은 힌트나 조언" },
            mood: { 
              type: Type.STRING, 
              enum: ['happy', 'sarcastic', 'encouraging', 'impressed'],
              description: "AI의 어조"
            }
          },
          required: ["commentary", "advice", "mood"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AiFeedback;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      commentary: "음... 이 숫자를 고르시다니 정말 대단하시네요!",
      advice: "계속 시도해보세요, 곧 찾으실 수 있을 거예요!",
      mood: 'encouraging'
    };
  }
};
