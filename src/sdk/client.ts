/**
 * SDK wrapper for @nktkas/hyperliquid InfoClient.
 * Provides a simplified interface for all Info API methods.
 */

import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

let infoClient: InfoClient | null = null;

export function getInfoClient(): InfoClient {
  if (!infoClient) {
    const transport = new HttpTransport();
    infoClient = new InfoClient({ transport });
  }
  return infoClient;
}

type CandleInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";

// ============ Market Data ============

export async function allMids() {
  const client = getInfoClient();
  return await client.allMids();
}

export async function l2Book(coin: string, nSigFigs?: number) {
  const client = getInfoClient();
  return await client.l2Book({ coin, nSigFigs });
}

export async function recentTrades(coin: string) {
  const client = getInfoClient();
  return await client.recentTrades({ coin });
}

export async function candleSnapshot(
  coin: string,
  interval: string,
  startTime: number,
  endTime?: number
) {
  const client = getInfoClient();
  return await client.candleSnapshot({
    coin,
    interval: interval as CandleInterval,
    startTime,
    endTime
  });
}

export async function meta() {
  const client = getInfoClient();
  return await client.meta();
}

export async function spotMeta() {
  const client = getInfoClient();
  return await client.spotMeta();
}

export async function metaAndAssetCtxs() {
  const client = getInfoClient();
  return await client.metaAndAssetCtxs();
}

export async function spotMetaAndAssetCtxs() {
  const client = getInfoClient();
  return await client.spotMetaAndAssetCtxs();
}

export async function predictedFundings() {
  const client = getInfoClient();
  return await client.predictedFundings();
}

export async function fundingHistory(coin: string, startTime: number, endTime?: number) {
  const client = getInfoClient();
  return await client.fundingHistory({ coin, startTime, endTime });
}

export async function allPerpMetas() {
  const client = getInfoClient();
  return await client.meta();
}

export async function tokenDetails(tokenId: string) {
  const client = getInfoClient();
  return await client.tokenDetails({ tokenId: tokenId as `0x${string}` });
}

export async function perpsAtOpenInterestCap() {
  const client = getInfoClient();
  return await client.perpsAtOpenInterestCap();
}

export async function maxMarketOrderNtls() {
  const client = getInfoClient();
  return await client.maxMarketOrderNtls();
}

// ============ User Data ============

export async function clearinghouseState(user: string) {
  const client = getInfoClient();
  return await client.clearinghouseState({ user: user as `0x${string}` });
}

export async function spotClearinghouseState(user: string) {
  const client = getInfoClient();
  return await client.spotClearinghouseState({ user: user as `0x${string}` });
}

export async function openOrders(user: string) {
  const client = getInfoClient();
  return await client.openOrders({ user: user as `0x${string}` });
}

export async function frontendOpenOrders(user: string) {
  const client = getInfoClient();
  return await client.frontendOpenOrders({ user: user as `0x${string}` });
}

export async function userFills(user: string, aggregateByTime?: boolean) {
  const client = getInfoClient();
  return await client.userFills({ user: user as `0x${string}`, aggregateByTime });
}

export async function userFillsByTime(user: string, startTime: number, endTime?: number) {
  const client = getInfoClient();
  return await client.userFillsByTime({ user: user as `0x${string}`, startTime, endTime });
}

export async function userFunding(user: string, startTime: number, endTime?: number) {
  const client = getInfoClient();
  return await client.userFunding({ user: user as `0x${string}`, startTime, endTime });
}

export async function userFees(user: string) {
  const client = getInfoClient();
  return await client.userFees({ user: user as `0x${string}` });
}

export async function historicalOrders(user: string) {
  const client = getInfoClient();
  return await client.historicalOrders({ user: user as `0x${string}` });
}

export async function orderStatus(user: string, oid: number | string) {
  const client = getInfoClient();
  const parsedOid = typeof oid === 'string' && oid.startsWith('0x')
    ? oid as `0x${string}`
    : Number(oid);
  return await client.orderStatus({ user: user as `0x${string}`, oid: parsedOid });
}

export async function subAccounts(user: string) {
  const client = getInfoClient();
  return await client.subAccounts({ user: user as `0x${string}` });
}

export async function portfolio(user: string) {
  const client = getInfoClient();
  return await client.portfolio({ user: user as `0x${string}` });
}

export async function referral(user: string) {
  const client = getInfoClient();
  return await client.referral({ user: user as `0x${string}` });
}

export async function userRole(user: string) {
  const client = getInfoClient();
  return await client.userRole({ user: user as `0x${string}` });
}

export async function userTwapSliceFills(user: string) {
  const client = getInfoClient();
  return await client.userTwapSliceFills({ user: user as `0x${string}` });
}

export async function userTwapSliceFillsByTime(user: string, startTime: number, endTime?: number) {
  const client = getInfoClient();
  return await client.userTwapSliceFillsByTime({ user: user as `0x${string}`, startTime, endTime });
}

export async function twapHistory(user: string) {
  const client = getInfoClient();
  return await client.twapHistory({ user: user as `0x${string}` });
}

export async function userNonFundingLedgerUpdates(user: string, startTime: number, endTime?: number) {
  const client = getInfoClient();
  return await client.userNonFundingLedgerUpdates({ user: user as `0x${string}`, startTime, endTime });
}

export async function userRateLimit(user: string) {
  const client = getInfoClient();
  return await client.userRateLimit({ user: user as `0x${string}` });
}

export async function extraAgents(user: string) {
  const client = getInfoClient();
  return await client.extraAgents({ user: user as `0x${string}` });
}

export async function isVip(user: string) {
  const client = getInfoClient();
  return await client.isVip({ user: user as `0x${string}` });
}

export async function userDexAbstraction(user: string) {
  const client = getInfoClient();
  return await client.userDexAbstraction({ user: user as `0x${string}` });
}

export async function maxBuilderFee(user: string, builder: string) {
  const client = getInfoClient();
  return await client.maxBuilderFee({ user: user as `0x${string}`, builder: builder as `0x${string}` });
}

export async function activeAssetData(user: string, coin: string) {
  const client = getInfoClient();
  return await client.activeAssetData({ user: user as `0x${string}`, coin });
}

// ============ Staking ============

export async function validatorSummaries() {
  const client = getInfoClient();
  return await client.validatorSummaries();
}

export async function delegatorSummary(user: string) {
  const client = getInfoClient();
  return await client.delegatorSummary({ user: user as `0x${string}` });
}

export async function delegatorRewards(user: string) {
  const client = getInfoClient();
  return await client.delegatorRewards({ user: user as `0x${string}` });
}

export async function delegations(user: string) {
  const client = getInfoClient();
  return await client.delegations({ user: user as `0x${string}` });
}

export async function delegatorHistory(user: string) {
  const client = getInfoClient();
  return await client.delegatorHistory({ user: user as `0x${string}` });
}

// ============ Vaults ============

export async function vaultSummaries() {
  const client = getInfoClient();
  return await client.vaultSummaries();
}

export async function vaultDetails(vaultAddress: string, user?: string) {
  const client = getInfoClient();
  return await client.vaultDetails({
    vaultAddress: vaultAddress as `0x${string}`,
    user: user as `0x${string}` | undefined
  });
}

export async function userVaultEquities(user: string) {
  const client = getInfoClient();
  return await client.userVaultEquities({ user: user as `0x${string}` });
}

export async function leadingVaults() {
  const client = getInfoClient();
  return await client.leadingVaults();
}

// ============ System ============

export async function exchangeStatus() {
  const client = getInfoClient();
  return await client.exchangeStatus();
}

export async function alignedQuoteTokenInfo(token: number) {
  const client = getInfoClient();
  return await client.alignedQuoteTokenInfo({ token });
}

export async function gossipRootIps() {
  const client = getInfoClient();
  return await client.gossipRootIps();
}

export async function legalCheck(user: string) {
  const client = getInfoClient();
  return await client.legalCheck({ user: user as `0x${string}` });
}

export async function preTransferCheck(user: string, destination: string, token: string, amount: string) {
  const client = getInfoClient();
  return await client.preTransferCheck({
    user: user as `0x${string}`,
    destination: destination as `0x${string}`,
    token,
    amount
  });
}

export async function perpDeployAuctionStatus() {
  const client = getInfoClient();
  return await client.perpDeployAuctionStatus();
}

export async function spotDeployState(user: string) {
  const client = getInfoClient();
  return await client.spotDeployState({ user: user as `0x${string}` });
}

export async function spotPairDeployAuctionStatus() {
  const client = getInfoClient();
  return await client.spotPairDeployAuctionStatus();
}

export async function perpDexLimits(dex: string) {
  const client = getInfoClient();
  return await client.perpDexLimits({ dex });
}

export async function perpDexs() {
  const client = getInfoClient();
  return await client.perpDexs();
}

export async function liquidatable() {
  const client = getInfoClient();
  return await client.liquidatable();
}

export async function marginTable() {
  const client = getInfoClient();
  return await client.marginTable();
}

export async function subAccounts2(user: string) {
  const client = getInfoClient();
  return await client.subAccounts2({ user: user as `0x${string}` });
}

export async function userToMultiSigSigners(user: string) {
  const client = getInfoClient();
  return await client.userToMultiSigSigners({ user: user as `0x${string}` });
}

export async function webData2(user: string) {
  const client = getInfoClient();
  return await client.webData2({ user: user as `0x${string}` });
}

export async function blockDetails(height: number) {
  const client = getInfoClient();
  return await client.blockDetails({ height });
}

export async function txDetails(hash: string) {
  const client = getInfoClient();
  return await client.txDetails({ hash: hash as `0x${string}` });
}

export async function userDetails(address: string) {
  const client = getInfoClient();
  return await client.userDetails({ address: address as `0x${string}` });
}

export async function validatorL1Votes() {
  const client = getInfoClient();
  return await client.validatorL1Votes();
}
