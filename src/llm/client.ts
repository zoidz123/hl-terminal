import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import { tools, executeTool } from "./tools.js";
import type { Config } from "../config/index.js";

export interface StreamCallbacks {
  onText: (text: string) => void;
  onToolUse: (toolName: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  onRetry?: (secondsLeft: number) => void;
}

const MAX_RETRIES = 3;
const RATE_LIMIT_WAIT_SECONDS = 60;

type MessageParam = Anthropic.MessageParam;

const conversationHistory: MessageParam[] = [];

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitWithCountdown(
  seconds: number,
  onUpdate?: (secondsLeft: number) => void
): Promise<void> {
  for (let i = seconds; i > 0; i--) {
    onUpdate?.(i);
    await sleep(1000);
  }
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("rate_limit") || error.message.includes("429");
  }
  return false;
}

export async function streamChat(
  userMessage: string,
  config: Config,
  callbacks: StreamCallbacks
): Promise<void> {
  const client = new Anthropic({
    apiKey: config.anthropicApiKey,
  });

  // Add user message to history
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const systemPrompt = [
    {
      type: "text" as const,
      text: SYSTEM_PROMPT,
      cache_control: { type: "ephemeral" as const },
    },
  ];

  // Retry loop for rate limits
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      let fullResponse = "";
      let currentToolUse: {
        id: string;
        name: string;
        input: string;
      } | null = null;

      const stream = await client.messages.stream({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: systemPrompt,
        tools: tools,
        messages: conversationHistory,
      });

      for await (const event of stream) {
      if (event.type === "content_block_start") {
        if (event.content_block.type === "tool_use") {
          currentToolUse = {
            id: event.content_block.id,
            name: event.content_block.name,
            input: "",
          };
          callbacks.onToolUse(event.content_block.name);
        }
      } else if (event.type === "content_block_delta") {
        if (event.delta.type === "text_delta") {
          fullResponse += event.delta.text;
          callbacks.onText(event.delta.text);
        } else if (event.delta.type === "input_json_delta" && currentToolUse) {
          currentToolUse.input += event.delta.partial_json;
        }
      } else if (event.type === "content_block_stop") {
        if (currentToolUse) {
          // Execute the tool
          try {
            const input = JSON.parse(currentToolUse.input || "{}");
            const result = await executeTool(currentToolUse.name, input, config);

            // Add assistant message with tool use
            conversationHistory.push({
              role: "assistant",
              content: [
                {
                  type: "tool_use",
                  id: currentToolUse.id,
                  name: currentToolUse.name,
                  input: input,
                },
              ],
            });

            // Add tool result as user message
            conversationHistory.push({
              role: "user",
              content: [
                {
                  type: "tool_result",
                  tool_use_id: currentToolUse.id,
                  content: JSON.stringify(result, null, 2),
                },
              ],
            });

            // Continue the conversation
            currentToolUse = null;

            // Make another call to get the response after tool use
            const continueStream = await client.messages.stream({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 4096,
              system: systemPrompt,
              tools: tools,
              messages: conversationHistory,
            });

            for await (const continueEvent of continueStream) {
              if (continueEvent.type === "content_block_delta") {
                if (continueEvent.delta.type === "text_delta") {
                  fullResponse += continueEvent.delta.text;
                  callbacks.onText(continueEvent.delta.text);
                }
              }
            }
          } catch (toolError) {
            callbacks.onError(
              toolError instanceof Error
                ? toolError
                : new Error("Tool execution failed")
            );
            return;
          }
        }
      }
    }

      // Add assistant response to history
      if (fullResponse) {
        conversationHistory.push({
          role: "assistant",
          content: fullResponse,
        });
      }

      callbacks.onComplete();
      return; // Success, exit retry loop
    } catch (error) {
      // Check if rate limit error and we have retries left
      if (isRateLimitError(error) && attempt < MAX_RETRIES - 1) {
        // Wait with countdown before retrying
        await waitWithCountdown(RATE_LIMIT_WAIT_SECONDS, callbacks.onRetry);
        continue; // Retry
      }

      // Not a rate limit error or no retries left
      callbacks.onError(
        error instanceof Error ? error : new Error("Unknown error")
      );
      return;
    }
  }
}

export function clearHistory(): void {
  conversationHistory.length = 0;
}
