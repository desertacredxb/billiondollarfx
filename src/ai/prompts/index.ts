import { IDENTITY_PROMPT } from "./identity";
import { PERSONALITY_PROMPT } from "./personality";
import { SAFETY_PROMPT } from "./safety";
import { BUSINESS_RULES_PROMPT } from "./business-rules";
import { FORMATTING_PROMPT } from "./formatting";
import { ESCALATION_PROMPT } from "./escalation";

export const SYSTEM_PROMPT = `
${IDENTITY_PROMPT}

${PERSONALITY_PROMPT}

${BUSINESS_RULES_PROMPT}

${SAFETY_PROMPT}

${FORMATTING_PROMPT}

${ESCALATION_PROMPT}
`;