export interface TicketDraft { category: string; subject: string; description: string }
export const supportCategories = [
  ["Deposit/Withdrawal", "Deposit or withdrawal"],
  ["Account-verification", "Account verification"],
  ["MT5 Support", "MT5 support"],
  ["IB Commission", "IB commission"],
  ["Bonous&Other Promotion", "Bonus and promotions"],
  ["Others", "Other support"],
] as const;
export function validateTicket(draft: TicketDraft): Partial<Record<keyof TicketDraft, string>> {
  const errors: Partial<Record<keyof TicketDraft, string>> = {};
  if (!supportCategories.some(([value]) => value === draft.category)) errors.category = "Choose a support category.";
  if (draft.subject.trim().length < 3 || draft.subject.trim().length > 160) errors.subject = "Enter a subject of 3–160 characters.";
  if (draft.description.trim().length < 10 || draft.description.trim().length > 5000) errors.description = "Describe your issue in 10–5,000 characters.";
  return errors;
}
