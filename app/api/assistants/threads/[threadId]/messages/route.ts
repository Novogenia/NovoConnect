import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";

export async function POST(request, { params: { threadId } }) {
  const { content } = await request.json();

  // 1. Add user message to the thread
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content,
  });

  // 2. Start a run
  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  // 3. Wait for the run to complete
  let completedRun;
  while (true) {
    const status = await openai.beta.threads.runs.retrieve(threadId, run.id);
    if (status.status === "completed") {
      completedRun = status;
      break;
    }
    if (status.status === "failed" || status.status === "cancelled") {
      return Response.json({ reply: "The assistant failed to respond." });
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  // 4. Retrieve the assistant message
  const messages = await openai.beta.threads.messages.list(threadId);
    console.log("Assistant messages:", JSON.stringify(messages.data, null, 2));
  const last = messages.data.find((msg) => msg.role === "assistant");

  const textContent = last?.content.find(
    (c) => c.type === "text"
  ) as { type: "text"; text: { value: string } };

  return Response.json({ reply: textContent?.text?.value || "No reply." });
}
