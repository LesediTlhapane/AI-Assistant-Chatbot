import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const modelsToTest = [
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemma-4-26b-a4b-it'
];

async function testAll() {
  console.log('Testing models...');
  for (const m of modelsToTest) {
    try {
      console.log(`[TESTING]: ${m}`);
      const res = await ai.models.generateContent({
        model: m,
        contents: ['Hello! Reply with 3 words.']
      });
      console.log(`>>> SUCCESS WITH [${m}]:`, res.text);
    } catch (err) {
      console.log(`>>> FAILED WITH [${m}]:`, err.message || err);
    }
  }
}

testAll();
