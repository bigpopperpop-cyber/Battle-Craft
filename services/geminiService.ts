import { GoogleGenAI } from "@google/genai";

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let delay = initialDelay;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const errorMessage = error?.message || "";
      if (errorMessage.includes("Requested entity was not found.")) {
        if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
          (window as any).aistudio.openSelectKey();
        }
      }

      const isRateLimit = errorMessage.includes("429");
      if (!isRateLimit && i >= maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Max retries reached");
}

const SYSTEM_INSTRUCTION = `You are the Great Chronicler of the First War (Warcraft 1). 
STRICT LORE RULES:
1. Setting: Kingdom of Azeroth. Swampy, forested, grim.
2. Factions: Human Kingdom of Azeroth vs the Orcish Horde.
3. Figures: King Llane, Anduin Lothar, Warchief Blackhand, Gul'dan, Medivh.
4. Lexicon: 'Town Hall', 'Peasant', 'Grunt', 'The Black Morass', 'Lumber'.
5. NO mentions of Night Elves, Undead (as a faction), or Lich King.
6. Tone: Archaic, heroic, and desperate.`;

export async function generateBriefing(faction: string, missionNumber: number) {
  return retryWithBackoff(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      // Switched to lite version for maximum free-tier compatibility
      model: 'gemini-flash-lite-latest',
      contents: `Commander, provide a briefing for ${faction} Mission #${missionNumber}. The enemy is gathering in the forests. We need gold and lumber. Keep it under 65 words.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.8,
      }
    });
    return response.text || "To arms, Commander! The enemy is upon us.";
  }).catch(() => "Prepare your forces. The First War continues.");
}

export async function getUnitLore(unitName: string, faction: string) {
  return retryWithBackoff(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Short 1-sentence lore for a ${unitName} of the ${faction}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    return response.text || "A brave soldier of the First War.";
  }).catch(() => "A battle-hardened warrior.");
}