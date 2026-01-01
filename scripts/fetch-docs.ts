#!/usr/bin/env npx tsx
/**
 * Fetches ALL Hyperliquid documentation from GitBook and generates system-prompt.ts
 * Run with: npm run fetch-docs
 */

import * as fs from "node:fs";
import * as path from "node:path";

const GITBOOK_BASE = "https://hyperliquid.gitbook.io";

// All known documentation pages - comprehensive list with correct paths
const DOC_PAGES = [
  // Main
  "/hyperliquid-docs",

  // About
  "/hyperliquid-docs/about-hyperliquid",
  "/hyperliquid-docs/about-hyperliquid/hyperliquid-101-for-non-crypto-audiences",
  "/hyperliquid-docs/about-hyperliquid/core-contributors",

  // Onboarding
  "/hyperliquid-docs/onboarding",
  "/hyperliquid-docs/onboarding/how-to-start-trading",
  "/hyperliquid-docs/onboarding/how-to-use-the-hyperevm",
  "/hyperliquid-docs/onboarding/how-to-stake-hype",
  "/hyperliquid-docs/onboarding/connect-mobile-via-qr-code",
  "/hyperliquid-docs/onboarding/export-your-email-wallet",
  "/hyperliquid-docs/onboarding/testnet-faucet",

  // HyperCore
  "/hyperliquid-docs/hypercore",
  "/hyperliquid-docs/hypercore/overview",
  "/hyperliquid-docs/hypercore/bridge",
  "/hyperliquid-docs/hypercore/api-servers",
  "/hyperliquid-docs/hypercore/clearinghouse",
  "/hyperliquid-docs/hypercore/oracle",
  "/hyperliquid-docs/hypercore/order-book",
  "/hyperliquid-docs/hypercore/staking",
  "/hyperliquid-docs/hypercore/vaults",
  "/hyperliquid-docs/hypercore/vaults/protocol-vaults",
  "/hyperliquid-docs/hypercore/vaults/for-vault-leaders",
  "/hyperliquid-docs/hypercore/vaults/for-vault-depositors",
  "/hyperliquid-docs/hypercore/multi-sig",
  "/hyperliquid-docs/hypercore/permissionless-spot-quote-assets",
  "/hyperliquid-docs/hypercore/aligned-quote-assets",

  // HyperEVM
  "/hyperliquid-docs/hyperevm",
  "/hyperliquid-docs/hyperevm/tools-for-hyperevm-builders",

  // HIPs
  "/hyperliquid-docs/hyperliquid-improvement-proposals-hips",
  "/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-1-native-token-standard",
  "/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-2-hyperliquidity",
  "/hyperliquid-docs/hyperliquid-improvement-proposals-hips/hip-3-builder-deployed-perpetuals",
  "/hyperliquid-docs/hyperliquid-improvement-proposals-hips/frontend-checks",

  // Trading
  "/hyperliquid-docs/trading",
  "/hyperliquid-docs/trading/fees",
  "/hyperliquid-docs/trading/builder-codes",
  "/hyperliquid-docs/trading/perpetual-assets",
  "/hyperliquid-docs/trading/contract-specifications",
  "/hyperliquid-docs/trading/margining",
  "/hyperliquid-docs/trading/portfolio-margin",
  "/hyperliquid-docs/trading/margin-tiers",
  "/hyperliquid-docs/trading/robust-price-indices",
  "/hyperliquid-docs/trading/liquidations",
  "/hyperliquid-docs/trading/auto-deleveraging",
  "/hyperliquid-docs/trading/funding",
  "/hyperliquid-docs/trading/order-book",
  "/hyperliquid-docs/trading/order-types",
  "/hyperliquid-docs/trading/take-profit-and-stop-loss-orders-tp-sl",
  "/hyperliquid-docs/trading/entry-price-and-pnl",
  "/hyperliquid-docs/trading/self-trade-prevention",
  "/hyperliquid-docs/trading/hyperps",
  "/hyperliquid-docs/trading/delisting",
  "/hyperliquid-docs/trading/market-making",
  "/hyperliquid-docs/trading/portfolio-graphs",
  "/hyperliquid-docs/trading/miscellaneous-ui",

  // Validators
  "/hyperliquid-docs/validators",
  "/hyperliquid-docs/validators/running-a-validator",
  "/hyperliquid-docs/validators/delegation-program",

  // Referrals
  "/hyperliquid-docs/referrals",
  "/hyperliquid-docs/referrals/proposal-staking-referral-program",

  // Other
  "/hyperliquid-docs/points",
  "/hyperliquid-docs/historical-data",
  "/hyperliquid-docs/risks",
  "/hyperliquid-docs/bug-bounty-program",
  "/hyperliquid-docs/audits",
  "/hyperliquid-docs/brand-kit",

  // For Developers - API
  "/hyperliquid-docs/for-developers/api",
  "/hyperliquid-docs/for-developers/api/notation",
  "/hyperliquid-docs/for-developers/api/asset-ids",
  "/hyperliquid-docs/for-developers/api/tick-and-lot-size",
  "/hyperliquid-docs/for-developers/api/nonces-and-api-wallets",
  "/hyperliquid-docs/for-developers/api/info-endpoint",
  "/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals",
  "/hyperliquid-docs/for-developers/api/info-endpoint/spot",
  "/hyperliquid-docs/for-developers/api/exchange-endpoint",
  "/hyperliquid-docs/for-developers/api/websocket",
  "/hyperliquid-docs/for-developers/api/websocket/subscriptions",
  "/hyperliquid-docs/for-developers/api/websocket/post-requests",
  "/hyperliquid-docs/for-developers/api/websocket/timeouts-and-heartbeats",
  "/hyperliquid-docs/for-developers/api/error-responses",
  "/hyperliquid-docs/for-developers/api/signing",
  "/hyperliquid-docs/for-developers/api/rate-limits-and-user-limits",
  "/hyperliquid-docs/for-developers/api/activation-gas-fee",
  "/hyperliquid-docs/for-developers/api/optimizing-latency",
  "/hyperliquid-docs/for-developers/api/bridge2",
  "/hyperliquid-docs/for-developers/api/deploying-hip-1-and-hip-2-assets",
  "/hyperliquid-docs/for-developers/api/hip-3-deployer-actions",

  // For Developers - HyperEVM
  "/hyperliquid-docs/for-developers/hyperevm",
  "/hyperliquid-docs/for-developers/hyperevm/dual-block-architecture",
  "/hyperliquid-docs/for-developers/hyperevm/raw-hyperevm-block-data",
  "/hyperliquid-docs/for-developers/hyperevm/interacting-with-hypercore",
  "/hyperliquid-docs/for-developers/hyperevm/hypercore-less-than-greater-than-hyperevm-transfers",
  "/hyperliquid-docs/for-developers/hyperevm/interaction-timings",
  "/hyperliquid-docs/for-developers/hyperevm/wrapped-hype",
  "/hyperliquid-docs/for-developers/hyperevm/json-rpc",

  // For Developers - Nodes
  "/hyperliquid-docs/for-developers/nodes",
  "/hyperliquid-docs/for-developers/nodes/l1-data-schemas",
  "/hyperliquid-docs/for-developers/nodes/foundation-non-validating-node",
];

async function fetchPage(pagePath: string): Promise<{ path: string; content: string } | null> {
  const url = `${GITBOOK_BASE}${pagePath}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) {
      console.warn(`  ⚠ Failed: ${pagePath} (${response.status})`);
      return null;
    }

    const html = await response.text();
    const content = extractContent(html);

    if (content.length < 50) {
      console.warn(`  ⚠ Empty: ${pagePath}`);
      return null;
    }

    console.log(`  ✓ ${pagePath} (${content.length} chars)`);
    return { path: pagePath, content };
  } catch (error) {
    console.warn(`  ⚠ Error: ${pagePath} - ${error}`);
    return null;
  }
}

function extractContent(html: string): string {
  // Remove script, style, nav, header, footer tags
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");

  // Convert headers to markdown-style
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "\n#### $1\n");

  // Convert code blocks
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n```\n$1\n```\n");
  text = text.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");

  // Convert lists
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n");

  // Convert links - keep text, drop URL
  text = text.replace(/<a[^>]*>(.*?)<\/a>/gi, "$1");

  // Convert paragraphs and divs to newlines
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "...")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");

  // Clean up whitespace
  text = text
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  return text;
}

function generateSystemPrompt(docs: { path: string; content: string }[]): string {
  const docsContent = docs
    .map(({ path, content }) => {
      const title = path.replace("/hyperliquid-docs", "") || "Overview";
      return `\n${"=".repeat(60)}\nPAGE: ${title}\n${"=".repeat(60)}\n\n${content}`;
    })
    .join("\n\n");

  return `export const SYSTEM_PROMPT = \`You are an expert assistant helping users learn about Hyperliquid. You have access to the COMPLETE Hyperliquid documentation below.

IMPORTANT INSTRUCTIONS:
1. Answer questions using the documentation content below
2. When users ask about live data (prices, positions, funding rates), use the query_hyperliquid tool
3. Be concise - this is a terminal interface
4. Format numbers properly (use $, %, commas)
5. For code examples, use the exact patterns shown in the docs
6. If something isn't in the docs, say so

KEY HYPERLIQUID FACTS:
- Perpetual futures DEX on its own L1 blockchain (HyperCore)
- ~200ms block times, no gas for trading
- Funding is HOURLY (not 8h like other exchanges)
- Cross-margin by default, up to 50x leverage
- Native token: HYPE
- HyperEVM for smart contract deployment
- HIPs (Hyperliquid Improvement Proposals) define token standards

================================================================================
COMPLETE HYPERLIQUID DOCUMENTATION
================================================================================
${docsContent}

================================================================================
END OF DOCUMENTATION
================================================================================

Remember: Use query_hyperliquid tool for live data. Answer conceptual questions from the docs above.
\`;
`;
}

async function main() {
  console.log("🔄 Fetching complete Hyperliquid documentation...\n");
  console.log(`Found ${DOC_PAGES.length} pages to fetch\n`);

  const docs: { path: string; content: string }[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const pagePath of DOC_PAGES) {
    const result = await fetchPage(pagePath);
    if (result) {
      docs.push(result);
      successCount++;
    } else {
      failCount++;
    }

    // Rate limiting - be nice to GitBook
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`\n✅ Fetched ${successCount} pages (${failCount} failed)\n`);

  // Calculate total size
  const totalChars = docs.reduce((sum, d) => sum + d.content.length, 0);
  const estimatedTokens = Math.round(totalChars / 4);

  console.log(`📊 Total content: ${totalChars.toLocaleString()} characters`);
  console.log(`📊 Estimated tokens: ~${estimatedTokens.toLocaleString()}`);

  // Generate system prompt
  const systemPrompt = generateSystemPrompt(docs);

  // Write to file
  const outputPath = path.join(
    import.meta.dirname || process.cwd(),
    "../src/llm/system-prompt.ts"
  );

  fs.writeFileSync(outputPath, systemPrompt);

  console.log(`\n📝 Generated: ${outputPath}`);
  console.log(`📝 File size: ${(systemPrompt.length / 1024).toFixed(1)}KB`);
  console.log(`📝 Estimated prompt tokens: ~${Math.round(systemPrompt.length / 4).toLocaleString()}`);

  if (estimatedTokens > 150000) {
    console.warn(`\n⚠️  Warning: Prompt is large (${estimatedTokens} tokens). May approach Haiku's 200k limit.`);
  }
}

main().catch(console.error);
