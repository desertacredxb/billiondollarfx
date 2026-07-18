import { openai } from "@/lib/openai";
import { AI_CONFIG } from "@/ai/config";
import { SYSTEM_PROMPT } from "../ai/prompts";

interface GenerateResponseInput {
  message: string;
}

export async function generateResponse({
  message,
}: GenerateResponseInput) {
  const response = await openai.responses.create({
    model: AI_CONFIG.model,
    instructions: SYSTEM_PROMPT,
    input: message,
  });

  return response.output_text;
}