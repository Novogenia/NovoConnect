import { openai } from "../../../openai";


export const runtime = "nodejs";

// Create a thread and run the assistant
export async function POST() {
  const assistantId = process.env.OPENAI_ASSISTANT_ID;

  // 1. Create thread
  const thread = await openai.beta.threads.create();

  // 2. Start a run for that thread using your assistant
  await openai.beta.threads.runs.create({
    thread_id: thread.id,
    assistant_id: assistantId,
  });

  // 3. Return thread ID to the frontend
  return Response.json({ threadId: thread.id });
}
