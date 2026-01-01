#!/usr/bin/env npx tsx
/**
 * Converts the downloaded markdown docs to system-prompt.ts
 * Run with: npm run build-prompt
 */

import * as fs from "node:fs";
import * as path from "node:path";

const DOCS_PATH = path.join(import.meta.dirname || process.cwd(), "../docs/hyperliquid-docs.md");
const OUTPUT_PATH = path.join(import.meta.dirname || process.cwd(), "../src/llm/system-prompt.ts");

function main() {
  console.log("📖 Reading docs from:", DOCS_PATH);

  if (!fs.existsSync(DOCS_PATH)) {
    console.error("❌ Docs file not found. Run the gitbook downloader first:");
    console.error("   cd scripts/gitbook-downloader && poetry run python cli.py download https://hyperliquid.gitbook.io/hyperliquid-docs -o ../../docs/hyperliquid-docs.md");
    process.exit(1);
  }

  const docs = fs.readFileSync(DOCS_PATH, "utf-8");

  // Escape backticks and ${} for template literal
  const escapedDocs = docs
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");

  const systemPrompt = `export const SYSTEM_PROMPT = \`You are an expert assistant helping users learn about Hyperliquid. You have access to the COMPLETE Hyperliquid documentation below.

CRITICAL RESPONSE GUIDELINES:
- BE EXTREMELY CONCISE. This is a terminal interface.
- Give the KEY TAKEAWAY first in 1-2 sentences
- Use bullet points for details, max 3-5 points
- Skip obvious context - users know what Hyperliquid is
- NO long explanations or verbose introductions
- NO "Based on the documentation..." or similar phrases
- If using numbers, format them cleanly ($, %, commas)
- For code, show minimal working examples only

RESPONSE FORMAT:
[1-2 sentence answer]

Key points:
- Point 1
- Point 2
- Point 3

WHEN TO USE TOOLS:
- Live prices, funding rates, positions -> use query_hyperliquid tool
- Conceptual questions -> answer from docs below

KEY HYPERLIQUID FACTS:
- Perpetual futures DEX on its own L1 (HyperCore)
- ~200ms blocks, no gas for trading
- Funding is HOURLY (not 8h)
- Cross-margin default, up to 50x leverage
- Native token: HYPE
- HyperEVM for smart contracts
- HIPs define token standards
- Builder codes = referral fees

================================================================================
COMPLETE HYPERLIQUID DOCUMENTATION
================================================================================

${escapedDocs}

================================================================================
END OF DOCUMENTATION
================================================================================

Remember: Use query_hyperliquid tool for live data. Answer conceptual questions from the docs above.
\`;
`;

  fs.writeFileSync(OUTPUT_PATH, systemPrompt);

  const stats = {
    docsSize: (docs.length / 1024).toFixed(1),
    outputSize: (systemPrompt.length / 1024).toFixed(1),
    estimatedTokens: Math.round(systemPrompt.length / 4).toLocaleString(),
  };

  console.log(`\n✅ Generated: ${OUTPUT_PATH}`);
  console.log(`📊 Docs size: ${stats.docsSize}KB`);
  console.log(`📊 Output size: ${stats.outputSize}KB`);
  console.log(`📊 Estimated tokens: ~${stats.estimatedTokens}`);

  if (systemPrompt.length / 4 > 150000) {
    console.warn(`\n⚠️  Warning: Prompt is large. May approach Haiku's 200k context limit.`);
  }
}

main();
