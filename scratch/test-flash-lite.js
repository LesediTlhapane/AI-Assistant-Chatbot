import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const flashModels = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash'
];

async function testFlashModels() {
  for (const m of flashModels) {
    try {
      console.log(`[Testing]: ${m}...`);
      const res = await ai.models.generateContent({
        model: m,
        contents: ['Give a 1-sentence tip for eStudy South Africa learners.']
      });
      console.log(`✅ SUCCESS WITH [${m}]:`, res.text);
    } catch (err) {
      console.log(`❌ FAILED WITH [${m}]:`, err.message || err);
    }
  }
}

testFlashModels();
