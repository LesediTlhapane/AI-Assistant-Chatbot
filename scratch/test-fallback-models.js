import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const candidateModels = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro'
];

async function testCandidates() {
  for (const model of candidateModels) {
    try {
      console.log(`Trying model: ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: ['Hello! Give me a 1-sentence greeting for eStudy South Africa learners.']
      });
      console.log(`SUCCESS WITH [${model}]:`, response.text);
      return;
    } catch (err) {
      console.error(`ERROR WITH [${model}]:`, err.message || err);
    }
  }
}

testCandidates();
