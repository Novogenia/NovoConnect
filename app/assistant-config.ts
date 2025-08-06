export const assistantId = process.env.OPENAI_ASSISTANT_ID;

if (!assistantId) {
  throw new Error("OPENAI_ASSISTANT_ID is not set in environment variables.");
}
