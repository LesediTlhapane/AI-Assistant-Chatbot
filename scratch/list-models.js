import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listAllModels() {
  try {
    const list = await ai.models.list();
    console.log('Available Models:');
    for await (const m of list) {
      console.log(' -', m.name);
    }
  } catch (err) {
    console.error('List models error:', err.message || err);
  }
}

listAllModels();
