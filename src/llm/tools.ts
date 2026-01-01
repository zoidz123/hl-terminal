import type Anthropic from "@anthropic-ai/sdk";
import { methodNames, methods } from "../commands/methods.js";
import { executeMethod, type ExecutionResult } from "../commands/executor.js";
import { getActiveWallet, type Config } from "../config/index.js";
import { formatTruncatedJson } from "../formatting/index.js";

// Build tool definition from method metadata
export const tools: Anthropic.Tool[] = [
  {
    name: "execute_method",
    description: `Execute a Hyperliquid API method. Use this when the user asks to fetch data or when demonstrating how a method works. Always use this tool when users ask about current prices, positions, orders, funding rates, or any live data.`,
    input_schema: {
      type: "object" as const,
      properties: {
        method: {
          type: "string",
          enum: methodNames,
          description: "The InfoClient method to call. Maps 1:1 with SDK methods.",
        },
        params: {
          type: "object",
          description: "Method parameters. For user address params, the active wallet will be used if not provided.",
          properties: {
            coin: {
              type: "string",
              description: "Asset symbol, e.g., 'BTC', 'ETH'",
            },
            user: {
              type: "string",
              description: "Wallet address (0x...). Uses active wallet if not provided.",
            },
            startTime: {
              type: "number",
              description: "Start timestamp in milliseconds",
            },
            endTime: {
              type: "number",
              description: "End timestamp in milliseconds (optional)",
            },
            interval: {
              type: "string",
              description: "Candle interval: 1m, 5m, 15m, 1h, 4h, 1d",
            },
            nSigFigs: {
              type: "number",
              description: "Significant figures for order book aggregation (2-5)",
            },
            aggregateByTime: {
              type: "boolean",
              description: "Whether to aggregate fills by time",
            },
            vaultAddress: {
              type: "string",
              description: "Vault address for vault queries",
            },
            oid: {
              type: "number",
              description: "Order ID for orderStatus queries",
            },
            builder: {
              type: "string",
              description: "Builder address for maxBuilderFee queries",
            },
            tokenId: {
              type: "string",
              description: "Token ID (hex string) for tokenDetails queries",
            },
            token: {
              type: "number",
              description: "Token index for alignedQuoteTokenInfo queries",
            },
            destination: {
              type: "string",
              description: "Destination address for preTransferCheck",
            },
            amount: {
              type: "string",
              description: "Amount for preTransferCheck",
            },
            dex: {
              type: "string",
              description: "DEX name for perpDexLimits (empty string for main dex)",
            },
            height: {
              type: "number",
              description: "Block height for blockDetails",
            },
            hash: {
              type: "string",
              description: "Transaction hash for txDetails",
            },
            address: {
              type: "string",
              description: "User address for userDetails",
            },
          },
        },
      },
      required: ["method"],
    },
  },
];

export interface ToolInput {
  method: string;
  params?: Record<string, string | number | boolean>;
}

/**
 * Execute a tool call from the LLM
 */
export async function executeTool(
  toolName: string,
  input: ToolInput,
  config: Config
): Promise<string> {
  if (toolName !== "execute_method") {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  const { method, params = {} } = input;

  // Validate method exists
  if (!methodNames.includes(method)) {
    throw new Error(`Unknown method: ${method}. Available methods: ${methodNames.join(", ")}`);
  }

  // Build parsed command for executor
  const parsedCommand = {
    method,
    params,
    raw: `/${method} ${Object.entries(params).map(([k, v]) => `${k}=${v}`).join(" ")}`.trim(),
  };

  // Execute and format response
  const result = await executeMethod(parsedCommand, config);

  if (result.type === "error") {
    return `Error: ${result.content}`;
  }

  if (result.type === "method" && result.methodResponse) {
    // Return truncated JSON for LLM context efficiency
    const jsonStr = formatTruncatedJson(result.methodResponse.data, { maxArrayItems: 5 });
    const meta = methods[method];

    return `## ${method} Response

\`\`\`json
${jsonStr}
\`\`\`

SDK Usage:
\`\`\`typescript
${result.methodResponse.sdkSnippet}
\`\`\`

Return Type: ${meta.returnType}

Docs: ${meta.docsUrl}`;
  }

  return result.content || "";
}
