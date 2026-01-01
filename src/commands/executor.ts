/**
 * Executes SDK methods and returns structured responses.
 */

import * as sdk from '../sdk/client.js';
import { methods } from './methods.js';
import { generateSdkSnippet } from '../formatting/index.js';
import { type ParsedCommand } from './router.js';
import type { MethodResponseData } from '../components/MethodResponse.js';
import { getActiveWallet, type Config } from '../config/index.js';

export interface ExecutionResult {
  type: 'method' | 'text' | 'error';
  content?: string;
  methodResponse?: MethodResponseData;
  configUpdated?: boolean;
}

/**
 * Execute a parsed command and return structured result
 */
export async function executeMethod(
  command: ParsedCommand,
  config: Config
): Promise<ExecutionResult> {
  const { method, params } = command;

  // Get method metadata
  const meta = methods[method];
  if (!meta) {
    return { type: 'error', content: `Unknown method: ${method}` };
  }

  // Resolve user address from config if not provided
  const resolvedParams = { ...params };
  for (const paramMeta of meta.params) {
    if (paramMeta.isUserAddress && !resolvedParams[paramMeta.name]) {
      const activeWallet = getActiveWallet(config);
      if (activeWallet?.address) {
        resolvedParams[paramMeta.name] = activeWallet.address;
      } else if (config.walletAddress) {
        resolvedParams[paramMeta.name] = config.walletAddress;
      }
    }
  }

  // Check if user address is required but not available
  for (const paramMeta of meta.params) {
    if (paramMeta.isUserAddress && paramMeta.required !== false && !resolvedParams[paramMeta.name]) {
      return {
        type: 'error',
        content: `This command requires a wallet address. Either:\n` +
          `  - Provide it: /${method} user=0x...\n` +
          `  - Configure one: Set up a wallet during initial setup`,
      };
    }
  }

  try {
    // Filter out non-scalar params (like args array from wallet command - handled separately)
    const sdkParams = Object.fromEntries(
      Object.entries(resolvedParams).filter(
        ([_, v]) => typeof v !== 'object' || v === null
      )
    ) as Record<string, string | number | boolean>;

    const data = await callSdkMethod(method, sdkParams);

    // Generate SDK snippet
    const sdkSnippet = generateSdkSnippet(method, sdkParams);

    return {
      type: 'method',
      methodResponse: {
        data,
        sdkSnippet,
        typeDefinition: meta.typeDefinition,
        docsUrl: meta.docsUrl,
      },
    };
  } catch (error) {
    return {
      type: 'error',
      content: `Error calling ${method}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Call the appropriate SDK method with given params
 */
async function callSdkMethod(
  method: string,
  params: Record<string, string | number | boolean>
): Promise<unknown> {
  switch (method) {
    // Market Data
    case 'allMids':
      return await sdk.allMids();

    case 'l2Book':
      return await sdk.l2Book(
        params.coin as string,
        params.nSigFigs as number | undefined
      );

    case 'recentTrades':
      return await sdk.recentTrades(params.coin as string);

    case 'candleSnapshot':
      return await sdk.candleSnapshot(
        params.coin as string,
        params.interval as string,
        params.startTime as number,
        params.endTime as number | undefined
      );

    case 'meta':
      return await sdk.meta();

    case 'spotMeta':
      return await sdk.spotMeta();

    case 'metaAndAssetCtxs': {
      const client = sdk.getInfoClient();
      return await client.metaAndAssetCtxs();
    }

    case 'predictedFundings':
      return await sdk.predictedFundings();

    case 'fundingHistory':
      return await sdk.fundingHistory(
        params.coin as string,
        params.startTime as number,
        params.endTime as number | undefined
      );

    // User Data
    case 'clearinghouseState':
      return await sdk.clearinghouseState(params.user as string);

    case 'spotClearinghouseState':
      return await sdk.spotClearinghouseState(params.user as string);

    case 'openOrders':
      return await sdk.openOrders(params.user as string);

    case 'frontendOpenOrders': {
      const client = sdk.getInfoClient();
      return await client.frontendOpenOrders({ user: params.user as string });
    }

    case 'userFills':
      return await sdk.userFills(
        params.user as string,
        params.aggregateByTime as boolean | undefined
      );

    case 'userFillsByTime': {
      const client = sdk.getInfoClient();
      return await client.userFillsByTime({
        user: params.user as string,
        startTime: params.startTime as number,
        endTime: params.endTime as number | undefined,
      });
    }

    case 'userFunding':
      return await sdk.userFunding(
        params.user as string,
        params.startTime as number,
        params.endTime as number | undefined
      );

    case 'userFees':
      return await sdk.userFees(params.user as string);

    case 'historicalOrders':
      return await sdk.historicalOrders(params.user as string);

    // Staking
    case 'validatorSummaries':
      return await sdk.validatorSummaries();

    case 'delegatorSummary':
      return await sdk.delegatorSummary(params.user as string);

    case 'delegatorRewards':
      return await sdk.delegatorRewards(params.user as string);

    // Vaults
    case 'vaultSummaries':
      return await sdk.vaultSummaries();

    case 'vaultDetails':
      return await sdk.vaultDetails(
        params.vaultAddress as string,
        params.user as string | undefined
      );

    default:
      throw new Error(`Method ${method} not implemented`);
  }
}
