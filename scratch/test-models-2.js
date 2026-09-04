import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const modelsToTest = [
  'gemini-3.6-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash-latest'
];

async function testModels() {
  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: ['Hello! Respond in 5 words.']
      });
      console.log(`SUCCESS [${model}]:`, response.text);
      return model;
    } catch (err) {
      console.error(`FAILED [${model}]:`, err.message || err);
    }
  }
}

testModels();
