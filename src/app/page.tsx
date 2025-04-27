"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { useState, useRef } from "react";

interface ChunkSequence {
  type: string;
  count: number;
}

interface MessagePart {
  type:
    | "response.in_progress"
    | "response.reasoning_summary_text.delta"
    | "response.output_text.delta";
  content: string;
  sequences?: ChunkSequence[];
}

export default function Home() {
  const [model, setModel] = useState<"openai" | "anthropic">("openai");
  const [messages, setMessages] = useState<MessagePart[]>([]);
  const messagesRef = useRef<MessagePart[]>([]);
  const [prompt, setPrompt] = useState("");

  const handleClick = async () => {
    messagesRef.current = [];
    setMessages([]);

    const response = await fetch(`/api/${model}`, {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = ""; // Buffer for incomplete lines/events

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        // Process any remaining buffer content after stream ends (optional, usually not needed for SSE)
        // console.log("Stream finished. Remaining buffer:", buffer);
        break;
      }

      // Add chunk to buffer and decode
      buffer += decoder.decode(value, { stream: true });

      // Process complete events in the buffer
      let boundary = buffer.indexOf("\n\n");
      let changed = false; // Track changes within this chunk processing cycle

      while (boundary !== -1) {
        const completeEvent = buffer.substring(0, boundary); // Get the complete event line(s)
        buffer = buffer.substring(boundary + 2); // Remove the event and delimiter from buffer

        if (completeEvent.startsWith("data: ")) {
          try {
            const data = JSON.parse(completeEvent.slice(6));
            if (!data.sequences || data.sequences.length === 0) continue;

            const currentSequence = data.sequences[data.sequences.length - 1];
            const currentType = currentSequence.type as MessagePart["type"];
            const currentContentDelta = currentSequence.content || "";

            // --- Refined Logic Applied Directly to messagesRef.current ---
            const currentAccumulated = messagesRef.current;
            const lastMessage =
              currentAccumulated[currentAccumulated.length - 1];

            // If the last message exists and has the same type
            if (lastMessage && lastMessage.type === currentType) {
              // Always append content if the type matches, handles deltas and potentially non-delta content updates if API sends them.
              // Filter out adding empty deltas if needed, though usually harmless.
              if (currentContentDelta) {
                lastMessage.content = currentContentDelta;
                changed = true;
              }
            } else {
              // Type is different, or it's the first message
              // Add a new message part, using the delta as the initial content.
              currentAccumulated.push({
                type: currentType,
                content: currentContentDelta,
              });
              changed = true;
            }
            // --- End of logic on ref ---
          } catch (e) {
            console.error("Failed to parse JSON line:", completeEvent, e);
          }
        }
        // Look for the next event boundary in the updated buffer
        boundary = buffer.indexOf("\n\n");
      } // End while boundary !== -1

      // Update React state ONCE after processing all complete events found in the chunk
      if (changed) {
        setMessages([...messagesRef.current]);
      }
    } // End while true (stream reading loop)
  };

  return (
    <div>
      <Header />

      <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Reasoning Demo</h1>

        <div className="flex flex-row gap-4">
          <input
            type="text"
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-8"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-8"
            onClick={handleClick}
          >
            Ask AI
          </button>
        </div>

        <div className="flex flex-row gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-8"
            onClick={() => setModel("openai")}
          >
            OpenAI
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors mb-8"
            onClick={() => setModel("anthropic")}
          >
            Anthropic
          </button>
        </div>

        <div className="w-full space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 border border-border"
            >
              <span className="text-xs text-muted-foreground font-mono">
                {message.type}
              </span>
              <div className="text-foreground text-xs">{message.content}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
