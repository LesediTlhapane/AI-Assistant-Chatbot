import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testSingleModel() {
  try {
    console.log('Calling generateContent with gemini-3.6-flash...');
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: ['Hello! Give me a 1-sentence greeting for eStudy learners.']
    });
    console.log('RESULT:', response.text);
  } catch (err) {
    console.error('ERROR:', err.message || err);
  }
}

testSingleModel();
