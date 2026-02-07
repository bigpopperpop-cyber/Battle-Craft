
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateBriefing(faction: string, missionNumber: number) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a high commander in a fantasy world. Provide a brief, immersive mission objective for the ${faction} campaign, Mission #${missionNumber}. 
      The setting is classic Warcraft-style RTS. Keep it under 100 words. Describe the enemy and the terrain briefly.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Briefing Error:", error);
    return `Commander, the ${faction} army awaits your orders. We must secure this region and build our base. The enemy is near.`;
  }
}

export async function getUnitLore(unitName: string, faction: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short 1-sentence heroic lore description for a ${unitName} of the ${faction} faction.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch {
    return "A brave soldier ready to fight for their kin.";
  }
}
