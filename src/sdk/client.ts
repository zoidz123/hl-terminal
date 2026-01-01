import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

let infoClient: InfoClient | null = null;

export function getInfoClient(): InfoClient {
  if (!infoClient) {
    const transport = new HttpTransport();
    infoClient = new InfoClient({ transport });
  }
  return infoClient;
}

// MVP Methods - the 10 core info methods for the LLM tool

export async function allMids() {
  const client = getInfoClient();
  return await client.allMids();
}

export async function l2Book(coin: string, nSigFigs?: number) {
  const client = getInfoClient();
  return await client.l2Book({ coin, nSigFigs });
}

export async function clearinghouseState(user: string) {
  const client = getInfoClient();
  return await client.clearinghouseState({ user });
}

export async function openOrders(user: string) {
  const client = getInfoClient();
  return await client.openOrders({ user });
}

export async function predictedFundings() {
  const client = getInfoClient();
  return await client.predictedFundings();
}

export async function meta() {
  const client = getInfoClient();
  return await client.meta();
}

export async function spotMeta() {
  const client = getInfoClient();
  return await client.spotMeta();
}

export async function fundingHistory(coin: string, startTime: number, endTime?: number) {
  const client = getInfoClient();
  return await client.fundingHistory({ coin, startTime, endTime });
}

export async function userFills(user: string, aggregateByTime?: boolean) {
  const client = getInfoClient();
  return await client.userFills({ user, aggregateByTime });
}

export async function recentTrades(coin: string) {
  const client = getInfoClient();
  return await client.recentTrades({ coin });
}

type CandleInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";

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

export async function userFees(user: string) {
  const client = getInfoClient();
  return await client.userFees({ user });
}

export async function spotClearinghouseState(user: string) {
  const client = getInfoClient();
  return await client.spotClearinghouseState({ user });
}

export async function userFunding(user: string, startTime: number, endTime?: number) {
  const client = getInfoClient();
  return await client.userFunding({ user, startTime, endTime });
}

export async function historicalOrders(user: string) {
  const client = getInfoClient();
  return await client.historicalOrders({ user });
}

export async function delegatorSummary(user: string) {
  const client = getInfoClient();
  return await client.delegatorSummary({ user });
}

export async function delegatorRewards(user: string) {
  const client = getInfoClient();
  return await client.delegatorRewards({ user });
}

export async function validatorSummaries() {
  const client = getInfoClient();
  return await client.validatorSummaries();
}

export async function vaultDetails(vaultAddress: string, user?: string) {
  const client = getInfoClient();
  return await client.vaultDetails({ vaultAddress, user });
}

export async function vaultSummaries() {
  const client = getInfoClient();
  return await client.vaultSummaries();
}
