import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import type { SpiritRing } from '../types';

let aiInstances: GoogleGenAI[] = [];
let currentAiIndex = 0;

export const initializeAi = (apiKeys: string[]) => {
  if (!apiKeys || apiKeys.length === 0) {
    console.error("Không có khóa API nào được cung cấp.");
    aiInstances = [];
    return;
  }
  aiInstances = apiKeys.filter(key => key.trim() !== '').map(apiKey => new GoogleGenAI({ apiKey }));
  currentAiIndex = 0;
  console.log(`Đã khởi tạo ${aiInstances.length} instance AI.`);
};

const getAiInstance = (): GoogleGenAI => {
    if (aiInstances.length === 0) {
        throw new Error("AI service chưa được khởi tạo. Vui lòng cung cấp khóa API.");
    }
    const instance = aiInstances[currentAiIndex];
    currentAiIndex = (currentAiIndex + 1) % aiInstances.length; // Xoay vòng
    return instance;
}

const getRingColorAndTailwind = (year: number): { color: string, tailwindColor: string } => {
  if (year < 100) return { color: 'Trắng', tailwindColor: 'bg-white text-black' };
  if (year < 1000) return { color: 'Vàng', tailwindColor: 'bg-yellow-400 text-black' };
  if (year < 10000) return { color: 'Tím', tailwindColor: 'bg-purple-500 text-white' };
  if (year < 100000) return { color: 'Đen', tailwindColor: 'bg-gray-900 border border-gray-400 text-white' };
  return { color: 'Đỏ', tailwindColor: 'bg-red-600 text-white' };
};

const parseJsonResponse = <T,>(text: string): T | null => {
  try {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Lỗi phân tích JSON:", error, "Dữ liệu gốc:", text);
    return null;
  }
};


export const generateCultivationEvent = async (playerName: string, currentPower: number): Promise<{ description: string; powerGained: number } | null> => {
  const ai = getAiInstance();
  
  const prompt = `Người chơi '${playerName}' (Hồn Lực: ${currentPower}) đang minh tưởng tu luyện.
  Tạo một mô tả ngắn về buổi tu luyện. Quyết định lượng Hồn Lực nhận được (một số nguyên từ 1 đến 3).
  Trả lời bằng JSON theo schema: { "description": "string", "powerGained": number }`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0.9
        }
    });
    const result = parseJsonResponse<{ description: string; powerGained: number }>(response.text);
    return result;
  } catch (error) {
    console.error("Lỗi API Gemini khi tu luyện:", error);
    throw error;
  }
};

export const generateHuntEvent = async (playerName: string, currentPower: number, ringSlot: number): Promise<{ success: boolean; description: string; ring: SpiritRing | null } | null> => {
  const ai = getAiInstance();

  const minYear = Math.pow(10, ringSlot + 1);
  const maxYear = minYear * 5;

  const prompt = `Người chơi '${playerName}' (Hồn Lực: ${currentPower}) đi săn Hồn Thú để lấy Hồn Hoàn thứ ${ringSlot}.
  Tạo một kịch bản săn bắn một Hồn Thú có niên hạn từ ${minYear} đến ${maxYear} năm.
  Mô tả trận chiến và kết quả (thành công hoặc thất bại).
  Nếu thành công, cung cấp chi tiết Hồn Hoàn mới.
  Trả lời bằng JSON theo schema: { "success": boolean, "description": "string", "ring": { "year": number, "ability": "string" } | null }`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0.8
        }
    });

    const result = parseJsonResponse<{ success: boolean; description: string; ring: { year: number; ability: string; } | null }>(response.text);
    
    if (!result) return null;

    if (result.success && result.ring) {
      const { color, tailwindColor } = getRingColorAndTailwind(result.ring.year);
      const fullRing: SpiritRing = {
        ...result.ring,
        color,
        tailwindColor,
      };
      return {
        ...result,
        ring: fullRing,
      };
    }

    return { ...result, ring: null };

  } catch (error) {
    console.error("Lỗi API Gemini khi đi săn:", error);
    throw error;
  }
};

export const generateRandomBackground = async (playerName: string, spiritSoul: string): Promise<{ background: string } | null> => {
  const ai = getAiInstance();
  
  const prompt = `Dựa vào tên nhân vật '${playerName}' và Võ Hồn '${spiritSoul}', hãy tạo một xuất thân (background story) ngẫu nhiên, sáng tạo và ngắn gọn (khoảng 20-30 từ) cho họ trong thế giới Đấu La Đại Lục.
  Xuất thân này không cần mang lại lợi thế, chỉ cần để nhập vai.
  Ví dụ: 'Lớn lên trong một làng chài nhỏ ven biển, từ nhỏ đã quen với sóng gió' hoặc 'Là hậu duệ của một gia tộc Hồn Sư đã suy tàn, mang trong mình sứ mệnh phục hưng gia tộc'.
  Trả lời bằng JSON theo schema: { "background": "string" }`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 1.0 // Tăng nhiệt độ để có kết quả sáng tạo hơn
        }
    });
    const result = parseJsonResponse<{ background: string }>(response.text);
    return result;
  } catch (error) {
    console.error("Lỗi API Gemini khi tạo xuất thân ngẫu nhiên:", error);
    throw error;
  }
};

export const generateRandomSpiritSoul = async (playerName: string): Promise<{ name: string; description: string } | null> => {
  const ai = getAiInstance();

  const prompt = `Dựa vào tên nhân vật '${playerName}', hãy tạo ra một Võ Hồn hoàn toàn mới và độc đáo trong thế giới Đấu La Đại Lục.
  Võ Hồn này không được trùng lặp với các Võ Hồn đã biết trong truyện (ví dụ: không dùng Lam Ngân Thảo, Hạo Thiên Chùy, U Minh Linh Miêu, Tà Mâu Bạch Hổ...).
  Hãy sáng tạo một cái tên thật kêu và một mô tả ngắn (khoảng 15-25 từ) về năng lực cốt lõi của nó.
  Ví dụ: { "name": "Thôn Phệ Ma Liêm", "description": "Một vũ khí có khả năng hấp thụ năng lượng của đối thủ để tăng cường sức mạnh cho bản thân." }
  Trả lời bằng JSON theo schema: { "name": "string", "description": "string" }`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 1.2
        }
    });
    const result = parseJsonResponse<{ name: string; description: string }>(response.text);
    return result;
  } catch (error) {
    console.error("Lỗi API Gemini khi tạo Võ Hồn ngẫu nhiên:", error);
    throw error;
  }
};