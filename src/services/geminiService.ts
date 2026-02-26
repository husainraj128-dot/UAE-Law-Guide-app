import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askLegalAssistant(query: string, history: ChatMessage[]) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are an expert legal assistant specializing in United Arab Emirates (UAE) laws and regulations. 
  Your goal is to provide accurate, up-to-date information based on the UAE Federal Laws and local decrees (Dubai, Abu Dhabi, etc.).
  
  Categories you cover:
  - Labor Law (MOHRE regulations, contracts, termination, gratuity)
  - Business Law (Company formation, licensing, VAT, commercial contracts)
  - Traffic Law (Fines, licensing, road safety rules)
  - Residency & Visa (Golden Visa, work permits, family sponsorship)
  - Real Estate (RERA, tenancy contracts, property ownership)
  
  Always include a disclaimer that you are an AI and users should consult with a licensed legal professional for official legal advice.
  Keep responses structured with bullet points where applicable. 
  If a specific law number is known (e.g., Federal Decree-Law No. 33 of 2021 for Labor), mention it.`;

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }))
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
}

export async function getLawSummary(category: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `Provide a comprehensive and highly detailed guide for the "${category}" category of UAE law. 
  
  The response MUST follow this structure:
  1. # ${category} - Comprehensive Guide
  2. ## Overview & Primary Legislation
     - Mention the main Federal Decree-Laws or local regulations (e.g., Federal Decree-Law No. 8 of 2017 for VAT, Federal Decree-Law No. 47 of 2022 for Corporate Tax).
  3. ## Key Subsections & Filing Guidelines
     - Break down the category into specific sub-topics.
     - For each sub-topic, provide a deep dive into the rules and official guidelines.
     - **CRITICAL**: For Taxation categories, include step-by-step guidelines on how to file, deadlines, and thresholds.
  4. ## Required Documents for Registration & Renewal
     - For EVERY heading/sub-topic where registration or renewal is applicable, list the EXACT documents required (e.g., Trade License, Passport copies, Emirates ID, Financial Statements, etc.).
  5. ## Recent Updates (2023-2024)
     - Highlight significant changes (e.g., Corporate Tax implementation, new VAT clarifications).
  6. ## Compliance & Penalties
     - List common violations and associated fines (AED).
  
  Format as clean Markdown. Use bold text for emphasis and bullet points for readability. Ensure professional tone.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
}
