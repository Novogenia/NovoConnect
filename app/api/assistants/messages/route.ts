import { assistantId } from "@/app/assistant-config";
import { openai } from "@/app/openai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { content } = await request.json();

  const thread = await openai.beta.threads.create();

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content,
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistantId,
  });

  while (true) {
    const status = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    if (status.status === "completed") break;
    if (status.status === "failed" || status.status === "cancelled") {
      return Response.json({ reply: "The assistant failed to respond." });
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const last = messages.data.find((msg) => msg.role === "assistant");

  const textContent = last?.content.find(
    (c) => c.type === "text"
  ) as { type: "text"; text: { value: string } };

  return Response.json({ reply: textContent?.text?.value || "No reply." });
}

