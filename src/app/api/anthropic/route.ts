import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic();

export const THINKING = "thinking";
export const CONTENT = "content";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const prompt = body.prompt;

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
      stream: true,
      thinking: {
        type: "enabled",
        budget_tokens: 1600,
      },
    });

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const sequences: { type: string; content: string }[] = [];
        let currentType: string | null = null;
        let currentContent = "";

        const updateSequence = (type: string) => {
          if (currentType && currentType !== type) {
            sequences.push({
              type: currentType,
              content: currentContent,
            });
            currentContent = "";
          }
          currentType = type;
        };

        for await (const chunk of response) {
          updateSequence(chunk.type);
          console.log("[chunk]", chunk);
          currentContent += chunk?.delta?.thinking || chunk?.delta?.text || "";

          controller.enqueue(
            `data: ${JSON.stringify({
              type: chunk.type,
              sequences: [
                ...sequences,
                {
                  type: currentType,
                  content: currentContent,
                },
              ],
            })}\n\n`
          );
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
