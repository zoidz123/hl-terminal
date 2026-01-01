/**
 * Method metadata for all SDK methods.
 * Maps 1:1 with @nktkas/hyperliquid InfoClient methods.
 */

export interface ParamMeta {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
  isUserAddress?: boolean; // If true, use configured wallet when not provided
}

export type MethodCategory = 'info' | 'exchange' | 'websocket';

export interface MethodMeta {
  name: string;
  description: string;
  params: ParamMeta[];
  returnType: string;
  typeDefinition: string;
  docsUrl: string;
  category: MethodCategory;
  subcategory?: string; // For grouping within a category
}

const DOCS_BASE = 'https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint';

export const methods: Record<string, MethodMeta> = {
  // ============ Market Data ============

  allMids: {
    name: 'allMids',
    description: 'Get mid prices for all perpetual assets',
    params: [],
    returnType: 'Record<string, string>',
    typeDefinition: `type AllMidsResponse = Record<string, string>;
// Example: { "BTC": "98245.5", "ETH": "3421.5", ... }`,
    docsUrl: `${DOCS_BASE}#retrieve-mids-for-all-actively-traded-coins`,
    category: 'info',
    subcategory: 'Market Data',
  },

  l2Book: {
    name: 'l2Book',
    description: 'Get L2 order book for a coin',
    params: [
      { name: 'coin', type: 'string', required: true, description: 'Asset symbol (e.g., "ETH")' },
      { name: 'nSigFigs', type: 'number', required: false, description: 'Significant figures for price aggregation (2-5)' },
    ],
    returnType: 'L2BookResponse',
    typeDefinition: `interface L2BookResponse {
  coin: string;
  levels: [
    { px: string; sz: string; n: number }[],  // bids
    { px: string; sz: string; n: number }[]   // asks
  ];
  time: number;
}
// px = price, sz = size, n = number of orders at level`,
    docsUrl: `${DOCS_BASE}#l2-book`,
    category: 'info',
    subcategory: 'Market Data',
  },

  recentTrades: {
    name: 'recentTrades',
    description: 'Get recent trades for a coin',
    params: [
      { name: 'coin', type: 'string', required: true, description: 'Asset symbol (e.g., "BTC")' },
    ],
    returnType: 'RecentTrade[]',
    typeDefinition: `interface RecentTrade {
  coin: string;
  side: "A" | "B";  // A = sell, B = buy
  px: string;       // price
  sz: string;       // size
  time: number;     // timestamp ms
  hash: string;     // transaction hash
  tid: number;      // trade id
}`,
    docsUrl: `${DOCS_BASE}#recent-trades`,
    category: 'info',
    subcategory: 'Market Data',
  },

  candleSnapshot: {
    name: 'candleSnapshot',
    description: 'Get OHLCV candle data',
    params: [
      { name: 'coin', type: 'string', required: true, description: 'Asset symbol' },
      { name: 'interval', type: 'string', required: true, description: 'Candle interval (1m, 5m, 15m, 1h, 4h, 1d)' },
      { name: 'startTime', type: 'number', required: true, description: 'Start timestamp in ms' },
      { name: 'endTime', type: 'number', required: false, description: 'End timestamp in ms' },
    ],
    returnType: 'Candle[]',
    typeDefinition: `interface Candle {
  t: number;  // open timestamp
  T: number;  // close timestamp
  s: string;  // symbol
  i: string;  // interval
  o: string;  // open price
  c: string;  // close price
  h: string;  // high price
  l: string;  // low price
  v: string;  // volume
  n: number;  // number of trades
}`,
    docsUrl: `${DOCS_BASE}#candle-snapshot`,
    category: 'info',
    subcategory: 'Market Data',
  },

  meta: {
    name: 'meta',
    description: 'Get metadata for all perpetual assets',
    params: [],
    returnType: 'Meta',
    typeDefinition: `interface Meta {
  universe: {
    name: string;
    szDecimals: number;
    maxLeverage: number;
    onlyIsolated?: boolean;
  }[];
}`,
    docsUrl: `${DOCS_BASE}#retrieve-perpetuals-asset-contexts`,
    category: 'info',
    subcategory: 'Market Data',
  },

  spotMeta: {
    name: 'spotMeta',
    description: 'Get metadata for all spot assets',
    params: [],
    returnType: 'SpotMeta',
    typeDefinition: `interface SpotMeta {
  universe: {
    tokens: {
      name: string;
      szDecimals: number;
      weiDecimals: number;
      index: number;
      tokenId: string;
      isCanonical: boolean;
    }[];
  }[];
  tokens: SpotToken[];
}`,
    docsUrl: `${DOCS_BASE}#retrieve-spot-asset-contexts`,
    category: 'info',
    subcategory: 'Market Data',
  },

  metaAndAssetCtxs: {
    name: 'metaAndAssetCtxs',
    description: 'Get metadata and current market context (funding, prices) for all perps',
    params: [],
    returnType: '[Meta, AssetCtx[]]',
    typeDefinition: `interface AssetCtx {
  funding: string;      // current funding rate
  openInterest: string;
  prevDayPx: string;
  dayNtlVlm: string;    // 24h notional volume
  premium: string;
  oraclePx: string;
  markPx: string;
  midPx: string;
  impactPxs: [string, string];  // [bid impact, ask impact]
}`,
    docsUrl: `${DOCS_BASE}#retrieve-perpetuals-asset-contexts`,
    category: 'info',
    subcategory: 'Market Data',
  },

  predictedFundings: {
    name: 'predictedFundings',
    description: 'Get predicted next funding rates for all assets',
    params: [],
    returnType: 'PredictedFunding[]',
    typeDefinition: `type PredictedFunding = [
  string,  // asset name
  {
    fundingRate: string;
    nextFunding: number;  // timestamp
  }
];`,
    docsUrl: `${DOCS_BASE}#predicted-fundings`,
    category: 'info',
    subcategory: 'Market Data',
  },

  fundingHistory: {
    name: 'fundingHistory',
    description: 'Get historical funding rates for a coin',
    params: [
      { name: 'coin', type: 'string', required: true, description: 'Asset symbol' },
      { name: 'startTime', type: 'number', required: true, description: 'Start timestamp in ms' },
      { name: 'endTime', type: 'number', required: false, description: 'End timestamp in ms' },
    ],
    returnType: 'FundingHistory[]',
    typeDefinition: `interface FundingHistory {
  coin: string;
  fundingRate: string;
  premium: string;
  time: number;
}`,
    docsUrl: `${DOCS_BASE}#funding-history`,
    category: 'info',
    subcategory: 'Market Data',
  },

  // ============ User Data ============

  clearinghouseState: {
    name: 'clearinghouseState',
    description: 'Get perpetual positions and margin state for a user',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'ClearinghouseState',
    typeDefinition: `interface ClearinghouseState {
  marginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
    withdrawable: string;
  };
  crossMarginSummary: { ... };
  assetPositions: {
    position: {
      coin: string;
      szi: string;          // signed size
      leverage: { type: string; value: number };
      entryPx: string;
      positionValue: string;
      unrealizedPnl: string;
      returnOnEquity: string;
      liquidationPx: string | null;
    };
    type: "oneWay";
  }[];
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-state`,
    category: 'info',
    subcategory: 'User Data',
  },

  spotClearinghouseState: {
    name: 'spotClearinghouseState',
    description: 'Get spot token balances for a user',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'SpotClearinghouseState',
    typeDefinition: `interface SpotClearinghouseState {
  balances: {
    coin: string;
    hold: string;
    total: string;
    entryNtl: string;
  }[];
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-spot-state`,
    category: 'info',
    subcategory: 'User Data',
  },

  openOrders: {
    name: 'openOrders',
    description: 'Get open orders for a user',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'OpenOrder[]',
    typeDefinition: `interface OpenOrder {
  coin: string;
  limitPx: string;
  oid: number;
  side: "A" | "B";  // A = sell, B = buy
  sz: string;
  timestamp: number;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-open-orders`,
    category: 'info',
    subcategory: 'User Data',
  },

  frontendOpenOrders: {
    name: 'frontendOpenOrders',
    description: 'Get open orders with additional frontend details',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'FrontendOpenOrder[]',
    typeDefinition: `interface FrontendOpenOrder {
  coin: string;
  limitPx: string;
  oid: number;
  side: "A" | "B";
  sz: string;
  timestamp: number;
  origSz: string;
  cloid: string | null;
  reduceOnly: boolean;
  orderType: string;
  triggerPx: string | null;
  triggerCondition: string | null;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-open-orders`,
    category: 'info',
    subcategory: 'User Data',
  },

  userFills: {
    name: 'userFills',
    description: 'Get recent trade fills for a user',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
      { name: 'aggregateByTime', type: 'boolean', required: false, description: 'Aggregate fills by time' },
    ],
    returnType: 'UserFill[]',
    typeDefinition: `interface UserFill {
  coin: string;
  px: string;
  sz: string;
  side: "A" | "B";
  time: number;
  startPosition: string;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  tid: number;
  feeToken: string;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-fills`,
    category: 'info',
    subcategory: 'User Data',
  },

  userFillsByTime: {
    name: 'userFillsByTime',
    description: 'Get trade fills for a user within a time range',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
      { name: 'startTime', type: 'number', required: true, description: 'Start timestamp in ms' },
      { name: 'endTime', type: 'number', required: false, description: 'End timestamp in ms' },
    ],
    returnType: 'UserFill[]',
    typeDefinition: `// Same as userFills response type
interface UserFill {
  coin: string;
  px: string;
  sz: string;
  side: "A" | "B";
  time: number;
  closedPnl: string;
  hash: string;
  fee: string;
  // ... additional fields
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-fills-by-time`,
    category: 'info',
    subcategory: 'User Data',
  },

  userFunding: {
    name: 'userFunding',
    description: 'Get funding payments for a user',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
      { name: 'startTime', type: 'number', required: true, description: 'Start timestamp in ms' },
      { name: 'endTime', type: 'number', required: false, description: 'End timestamp in ms' },
    ],
    returnType: 'UserFunding[]',
    typeDefinition: `interface UserFunding {
  time: number;
  coin: string;
  usdc: string;      // funding payment amount
  szi: string;       // position size at time
  fundingRate: string;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-funding-history`,
    category: 'info',
    subcategory: 'User Data',
  },

  userFees: {
    name: 'userFees',
    description: 'Get fee tier and rate information for a user',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'UserFees',
    typeDefinition: `interface UserFees {
  activeReferralDiscount: string;
  dailyUserVlm: {
    date: string;
    exchange: string;
    userAdd: string;
    userCross: string;
  }[];
  feeSchedule: {
    add: string;   // maker fee rate
    cross: string; // taker fee rate
    referralDiscount: string;
    tiers: { ntlVlm: string; add: string; cross: string }[];
  };
  userCrossRate: string;
  userAddRate: string;
}`,
    docsUrl: `${DOCS_BASE}#query-user-fee`,
    category: 'info',
    subcategory: 'User Data',
  },

  historicalOrders: {
    name: 'historicalOrders',
    description: 'Get order history for a user',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'HistoricalOrder[]',
    typeDefinition: `interface HistoricalOrder {
  order: {
    coin: string;
    side: "A" | "B";
    limitPx: string;
    sz: string;
    oid: number;
    timestamp: number;
    origSz: string;
  };
  status: string;
  statusTimestamp: number;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-historical-orders`,
    category: 'info',
    subcategory: 'User Data',
  },

  // ============ Staking ============

  validatorSummaries: {
    name: 'validatorSummaries',
    description: 'Get summaries of all validators',
    params: [],
    returnType: 'ValidatorSummary[]',
    typeDefinition: `interface ValidatorSummary {
  validator: string;     // validator address
  name: string;
  stake: string;         // total stake
  nStakers: number;
  commission: string;    // commission rate
  isJailed: boolean;
  recentBlocks: number;
}`,
    docsUrl: `${DOCS_BASE}#validator-summaries`,
    category: 'info',
    subcategory: 'Staking',
  },

  delegatorSummary: {
    name: 'delegatorSummary',
    description: 'Get staking summary for a delegator',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'DelegatorSummary',
    typeDefinition: `interface DelegatorSummary {
  delegated: {
    validator: string;
    amount: string;
    lockedUntil: number | null;
  }[];
  totalDelegated: string;
  nPositions: number;
}`,
    docsUrl: `${DOCS_BASE}#delegator-summary`,
    category: 'info',
    subcategory: 'Staking',
  },

  delegatorRewards: {
    name: 'delegatorRewards',
    description: 'Get pending staking rewards for a delegator',
    params: [
      { name: 'user', type: 'string', required: false, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'DelegatorRewards',
    typeDefinition: `interface DelegatorRewards {
  rewards: {
    validator: string;
    amount: string;
  }[];
  totalRewards: string;
}`,
    docsUrl: `${DOCS_BASE}#delegator-rewards`,
    category: 'info',
    subcategory: 'Staking',
  },

  // ============ Vaults ============

  vaultSummaries: {
    name: 'vaultSummaries',
    description: 'Get summaries of all vaults',
    params: [],
    returnType: 'VaultSummary[]',
    typeDefinition: `interface VaultSummary {
  vaultAddress: string;
  name: string;
  leader: string;
  tvl: string;
  apr: string;
  followerState: { ... } | null;
}`,
    docsUrl: `${DOCS_BASE}#vault-summaries`,
    category: 'info',
    subcategory: 'Vaults',
  },

  vaultDetails: {
    name: 'vaultDetails',
    description: 'Get detailed information about a vault',
    params: [
      { name: 'vaultAddress', type: 'string', required: true, description: 'Vault address' },
      { name: 'user', type: 'string', required: false, description: 'User address for follower state', isUserAddress: true },
    ],
    returnType: 'VaultDetails',
    typeDefinition: `interface VaultDetails {
  name: string;
  vaultAddress: string;
  leader: string;
  description: string;
  portfolio: Position[];
  apr: string;
  followerState: {
    vaultEquity: string;
    pnl: string;
    allTimePnl: string;
  } | null;
}`,
    docsUrl: `${DOCS_BASE}#vault-details`,
    category: 'info',
    subcategory: 'Vaults',
  },
};

// Export method names for validation
export const methodNames = Object.keys(methods);

// Category definitions
export const categories: { id: MethodCategory; name: string; description: string }[] = [
  { id: 'info', name: 'Info', description: 'Read-only queries for market data, user state, and more' },
  { id: 'exchange', name: 'Exchange', description: 'Trading actions (requires wallet signing) - Coming Soon' },
  { id: 'websocket', name: 'Websocket', description: 'Real-time data subscriptions - Coming Soon' },
];

// Helper to get methods by category
export function getMethodsByCategory(category: MethodCategory): MethodMeta[] {
  return Object.values(methods).filter((m) => m.category === category);
}

// Helper to get methods by subcategory within a category
export function getMethodsBySubcategory(category: MethodCategory): Record<string, MethodMeta[]> {
  const categoryMethods = getMethodsByCategory(category);
  const grouped: Record<string, MethodMeta[]> = {};

  for (const method of categoryMethods) {
    const sub = method.subcategory || 'Other';
    if (!grouped[sub]) grouped[sub] = [];
    grouped[sub].push(method);
  }

  return grouped;
}

// Get all subcategories for a category
export function getSubcategories(category: MethodCategory): string[] {
  const methods = getMethodsByCategory(category);
  const subs = new Set(methods.map(m => m.subcategory || 'Other'));
  return Array.from(subs);
}
