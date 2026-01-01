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
        methodName: method,
        resolvedParams: sdkParams,
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
    // ============ Market Data ============

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

    case 'metaAndAssetCtxs':
      return await sdk.metaAndAssetCtxs();

    case 'spotMetaAndAssetCtxs':
      return await sdk.spotMetaAndAssetCtxs();

    case 'predictedFundings':
      return await sdk.predictedFundings();

    case 'fundingHistory':
      return await sdk.fundingHistory(
        params.coin as string,
        params.startTime as number,
        params.endTime as number | undefined
      );

    case 'allPerpMetas':
      return await sdk.allPerpMetas();

    case 'tokenDetails':
      return await sdk.tokenDetails(params.tokenId as string);

    case 'perpsAtOpenInterestCap':
      return await sdk.perpsAtOpenInterestCap();

    case 'maxMarketOrderNtls':
      return await sdk.maxMarketOrderNtls();

    // ============ User Data ============

    case 'clearinghouseState':
      return await sdk.clearinghouseState(params.user as string);

    case 'spotClearinghouseState':
      return await sdk.spotClearinghouseState(params.user as string);

    case 'openOrders':
      return await sdk.openOrders(params.user as string);

    case 'frontendOpenOrders':
      return await sdk.frontendOpenOrders(params.user as string);

    case 'userFills':
      return await sdk.userFills(
        params.user as string,
        params.aggregateByTime as boolean | undefined
      );

    case 'userFillsByTime':
      return await sdk.userFillsByTime(
        params.user as string,
        params.startTime as number,
        params.endTime as number | undefined
      );

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

    case 'orderStatus':
      return await sdk.orderStatus(
        params.user as string,
        params.oid as number | string
      );

    case 'subAccounts':
      return await sdk.subAccounts(params.user as string);

    case 'portfolio':
      return await sdk.portfolio(params.user as string);

    case 'referral':
      return await sdk.referral(params.user as string);

    case 'userRole':
      return await sdk.userRole(params.user as string);

    case 'userTwapSliceFills':
      return await sdk.userTwapSliceFills(params.user as string);

    case 'userTwapSliceFillsByTime':
      return await sdk.userTwapSliceFillsByTime(
        params.user as string,
        params.startTime as number,
        params.endTime as number | undefined
      );

    case 'twapHistory':
      return await sdk.twapHistory(params.user as string);

    case 'userNonFundingLedgerUpdates':
      return await sdk.userNonFundingLedgerUpdates(
        params.user as string,
        params.startTime as number,
        params.endTime as number | undefined
      );

    case 'userRateLimit':
      return await sdk.userRateLimit(params.user as string);

    case 'extraAgents':
      return await sdk.extraAgents(params.user as string);

    case 'isVip':
      return await sdk.isVip(params.user as string);

    case 'userDexAbstraction':
      return await sdk.userDexAbstraction(params.user as string);

    case 'maxBuilderFee':
      return await sdk.maxBuilderFee(
        params.user as string,
        params.builder as string
      );

    case 'activeAssetData':
      return await sdk.activeAssetData(
        params.user as string,
        params.coin as string
      );

    // ============ Staking ============

    case 'validatorSummaries':
      return await sdk.validatorSummaries();

    case 'delegatorSummary':
      return await sdk.delegatorSummary(params.user as string);

    case 'delegatorRewards':
      return await sdk.delegatorRewards(params.user as string);

    case 'delegations':
      return await sdk.delegations(params.user as string);

    case 'delegatorHistory':
      return await sdk.delegatorHistory(params.user as string);

    // ============ Vaults ============

    case 'vaultSummaries':
      return await sdk.vaultSummaries();

    case 'vaultDetails':
      return await sdk.vaultDetails(
        params.vaultAddress as string,
        params.user as string | undefined
      );

    case 'userVaultEquities':
      return await sdk.userVaultEquities(params.user as string);

    case 'leadingVaults':
      return await sdk.leadingVaults();

    // ============ System ============

    case 'exchangeStatus':
      return await sdk.exchangeStatus();

    case 'alignedQuoteTokenInfo':
      return await sdk.alignedQuoteTokenInfo(params.token as number);

    case 'gossipRootIps':
      return await sdk.gossipRootIps();

    case 'legalCheck':
      return await sdk.legalCheck(params.user as string);

    case 'preTransferCheck':
      return await sdk.preTransferCheck(
        params.user as string,
        params.destination as string,
        params.token as string,
        params.amount as string
      );

    case 'perpDeployAuctionStatus':
      return await sdk.perpDeployAuctionStatus();

    case 'spotDeployState':
      return await sdk.spotDeployState(params.user as string);

    case 'spotPairDeployAuctionStatus':
      return await sdk.spotPairDeployAuctionStatus();

    case 'perpDexLimits':
      return await sdk.perpDexLimits(params.dex as string);

    case 'perpDexs':
      return await sdk.perpDexs();

    case 'liquidatable':
      return await sdk.liquidatable();

    case 'marginTable':
      return await sdk.marginTable();

    case 'subAccounts2':
      return await sdk.subAccounts2(params.user as string);

    case 'userToMultiSigSigners':
      return await sdk.userToMultiSigSigners(params.user as string);

    case 'webData2':
      return await sdk.webData2(params.user as string);

    case 'blockDetails':
      return await sdk.blockDetails(params.height as number);

    case 'txDetails':
      return await sdk.txDetails(params.hash as string);

    case 'userDetails':
      return await sdk.userDetails(params.address as string);

    case 'validatorL1Votes':
      return await sdk.validatorL1Votes();

    default:
      throw new Error(`Method ${method} not implemented`);
  }
}
