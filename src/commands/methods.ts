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
    tokens: number[];
    name: string;
    index: number;
    isCanonical: boolean;
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

  spotMetaAndAssetCtxs: {
    name: 'spotMetaAndAssetCtxs',
    description: 'Get metadata and current market context for all spot assets',
    params: [],
    returnType: '[SpotMeta, SpotAssetCtx[]]',
    typeDefinition: `interface SpotAssetCtx {
  coin: string;
  prevDayPx: string;
  dayNtlVlm: string;
  markPx: string;
  midPx: string | null;
  circulatingSupply: string;
  totalSupply: string;
  dayBaseVlm: string;
}`,
    docsUrl: `${DOCS_BASE}/spot#retrieve-spot-asset-contexts`,
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

  allPerpMetas: {
    name: 'allPerpMetas',
    description: 'Get all perpetual asset metadata',
    params: [],
    returnType: 'AllPerpMetas',
    typeDefinition: `interface AllPerpMetas {
  universe: PerpMeta[];
}`,
    docsUrl: `${DOCS_BASE}#retrieve-perpetuals-asset-contexts`,
    category: 'info',
    subcategory: 'Market Data',
  },

  tokenDetails: {
    name: 'tokenDetails',
    description: 'Get details for a specific token',
    params: [
      { name: 'tokenId', type: 'string', required: true, description: 'Token ID (hex string)' },
    ],
    returnType: 'TokenDetails',
    typeDefinition: `interface TokenDetails {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
  evmContract: { address: string; evm_extra_wei_decimals: number } | null;
  fullName: string | null;
}`,
    docsUrl: `${DOCS_BASE}#token-details`,
    category: 'info',
    subcategory: 'Market Data',
  },

  perpsAtOpenInterestCap: {
    name: 'perpsAtOpenInterestCap',
    description: 'Get list of perps at open interest cap',
    params: [],
    returnType: 'string[]',
    typeDefinition: `// Array of asset symbols at OI cap
type PerpsAtOpenInterestCap = string[];`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Market Data',
  },

  maxMarketOrderNtls: {
    name: 'maxMarketOrderNtls',
    description: 'Get maximum market order notional sizes',
    params: [],
    returnType: '[string, string][]',
    typeDefinition: `// Array of [coin, maxNotional] tuples
type MaxMarketOrderNtls = [string, string][];`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Market Data',
  },

  // ============ User Data ============

  clearinghouseState: {
    name: 'clearinghouseState',
    description: 'Get perpetual positions and margin state for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
  crossMarginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
    totalMarginUsed: string;
  };
  assetPositions: {
    position: {
      coin: string;
      szi: string;          // signed size
      leverage: { type: "cross" | "isolated"; value: number };
      entryPx: string;
      positionValue: string;
      unrealizedPnl: string;
      returnOnEquity: string;
      liquidationPx: string | null;
      marginUsed: string;
      maxTradeSzs: [string, string];
      cumFunding: { allTime: string; sinceOpen: string; sinceChange: string };
    };
    type: "oneWay";
  }[];
  withdrawable: string;
  time: number;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-state`,
    category: 'info',
    subcategory: 'User Data',
  },

  spotClearinghouseState: {
    name: 'spotClearinghouseState',
    description: 'Get spot token balances for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
      { name: 'startTime', type: 'number', required: true, description: 'Start timestamp in ms' },
      { name: 'endTime', type: 'number', required: false, description: 'End timestamp in ms' },
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
  builderFee: string | null;
  liquidation: boolean | null;
  liquidationMarkPx: string | null;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-fills-by-time`,
    category: 'info',
    subcategory: 'User Data',
  },

  userFunding: {
    name: 'userFunding',
    description: 'Get funding payments for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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

  orderStatus: {
    name: 'orderStatus',
    description: 'Get status of a specific order by OID or CLOID',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
      { name: 'oid', type: 'number', required: true, description: 'Order ID or Client Order ID' },
    ],
    returnType: 'OrderStatus',
    typeDefinition: `type OrderStatus = {
  status: "order";
  order: {
    order: {
      coin: string;
      side: "A" | "B";
      limitPx: string;
      sz: string;
      oid: number;
      timestamp: number;
      origSz: string;
      cloid: string | null;
      reduceOnly: boolean;
      orderType: "Limit" | "Stop Market" | "Stop Limit" | "Take Profit Market" | "Take Profit Limit";
      triggerPx: string | null;
      triggerCondition: string | null;
      tif: "Gtc" | "Ioc" | "Alo" | null;
      children: unknown[];
    };
    status: "open" | "filled" | "canceled" | "triggered" | "rejected" | "marginCanceled";
    statusTimestamp: number;
  };
} | { status: "unknownOid" };`,
    docsUrl: `${DOCS_BASE}#query-order-status-by-oid-or-cloid`,
    category: 'info',
    subcategory: 'User Data',
  },

  subAccounts: {
    name: 'subAccounts',
    description: 'Get sub-accounts for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'SubAccount[] | null',
    typeDefinition: `interface SubAccount {
  name: string;
  subAccountUser: string;  // sub-account address
  master: string;          // master account address
  clearinghouseState: ClearinghouseState;
  spotState: SpotClearinghouseState;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-subaccounts`,
    category: 'info',
    subcategory: 'User Data',
  },

  portfolio: {
    name: 'portfolio',
    description: 'Get portfolio performance metrics for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'PortfolioResponse',
    typeDefinition: `type PortfolioResponse = [
  ["day", PortfolioMetrics],
  ["week", PortfolioMetrics],
  ["month", PortfolioMetrics],
  ["allTime", PortfolioMetrics],
  ["perpDay", PortfolioMetrics],
  ["perpWeek", PortfolioMetrics],
  ["perpMonth", PortfolioMetrics],
  ["perpAllTime", PortfolioMetrics]
];

interface PortfolioMetrics {
  accountValueHistory: [number, string][];  // [timestamp, value]
  pnlHistory: [number, string][];
  vlm: string;
}`,
    docsUrl: `${DOCS_BASE}#query-a-users-portfolio`,
    category: 'info',
    subcategory: 'User Data',
  },

  referral: {
    name: 'referral',
    description: 'Get referral information for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'ReferralResponse',
    typeDefinition: `interface ReferralResponse {
  referredBy: { referrer: string; code: string } | null;
  cumVlm: string;
  unclaimedRewards: string;
  claimedRewards: string;
  builderRewards: string;
  referrerState: {
    stage: "ready" | "needToCreateCode" | "needToTrade";
    data?: {
      code: string;
      nReferrals: number;
      referralStates: {
        user: string;
        cumVlm: string;
        unclaimedRewards: string;
        claimedRewards: string;
      }[];
      required?: string;
    };
  };
  rewardHistory: { earned: string; vlm: string; time: number }[];
  tokenToState: [string, { cumVlm: string; unclaimedRewards: string }][];
}`,
    docsUrl: `${DOCS_BASE}#query-a-users-referral-information`,
    category: 'info',
    subcategory: 'User Data',
  },

  userRole: {
    name: 'userRole',
    description: 'Get the role of a user (user, vault, agent, subAccount)',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'UserRole',
    typeDefinition: `type UserRole =
  | { role: "user" | "vault" | "missing" }
  | { role: "agent"; data: { user: string } }
  | { role: "subAccount"; data: { master: string } };`,
    docsUrl: `${DOCS_BASE}#query-a-users-role`,
    category: 'info',
    subcategory: 'User Data',
  },

  userTwapSliceFills: {
    name: 'userTwapSliceFills',
    description: 'Get TWAP slice fills for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'TwapSliceFill[]',
    typeDefinition: `interface TwapSliceFill {
  fill: {
    coin: string;
    px: string;
    sz: string;
    side: "A" | "B";
    time: number;
    closedPnl: string;
    hash: string;
    fee: string;
    twapId: number | null;
  };
  twapId: number;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-twap-slice-fills`,
    category: 'info',
    subcategory: 'User Data',
  },

  userTwapSliceFillsByTime: {
    name: 'userTwapSliceFillsByTime',
    description: 'Get TWAP slice fills for a user within a time range',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
      { name: 'startTime', type: 'number', required: true, description: 'Start timestamp in ms' },
      { name: 'endTime', type: 'number', required: false, description: 'End timestamp in ms' },
    ],
    returnType: 'TwapSliceFill[]',
    typeDefinition: `// Same as userTwapSliceFills`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-twap-slice-fills`,
    category: 'info',
    subcategory: 'User Data',
  },

  twapHistory: {
    name: 'twapHistory',
    description: 'Get TWAP order history for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'TwapHistory[]',
    typeDefinition: `interface TwapHistory {
  state: {
    coin: string;
    sz: string;
    side: "A" | "B";
    reduceOnly: boolean;
    minutes: number;
    randomize: boolean;
    twapId: number;
    user: string;
    timestamp: number;
    filledSz: string;
    avgPx: string | null;
  };
  status: "running" | "finished" | "terminated" | "error";
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'User Data',
  },

  userNonFundingLedgerUpdates: {
    name: 'userNonFundingLedgerUpdates',
    description: 'Get non-funding ledger updates (deposits, withdrawals, transfers)',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
      { name: 'startTime', type: 'number', required: true, description: 'Start timestamp in ms' },
      { name: 'endTime', type: 'number', required: false, description: 'End timestamp in ms' },
    ],
    returnType: 'LedgerUpdate[]',
    typeDefinition: `interface LedgerUpdate {
  time: number;
  hash: string;
  delta: {
    type: string;  // deposit, withdraw, transfer, etc.
    usdc: string;
  };
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-non-funding-ledger-updates`,
    category: 'info',
    subcategory: 'User Data',
  },

  userRateLimit: {
    name: 'userRateLimit',
    description: 'Get rate limit status for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'UserRateLimit',
    typeDefinition: `interface UserRateLimit {
  cumVlm: string;
  nRequestsUsed: number;
  nRequestsCap: number;
}`,
    docsUrl: `${DOCS_BASE}#query-user-rate-limit`,
    category: 'info',
    subcategory: 'User Data',
  },

  extraAgents: {
    name: 'extraAgents',
    description: 'Get extra agents authorized by a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'ExtraAgent[]',
    typeDefinition: `interface ExtraAgent {
  address: string;
  name: string;
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'User Data',
  },

  isVip: {
    name: 'isVip',
    description: 'Check if a user is VIP',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'boolean | null',
    typeDefinition: `// Returns true/false or null if unknown`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'User Data',
  },

  userDexAbstraction: {
    name: 'userDexAbstraction',
    description: 'Get HIP-3 DEX abstraction state for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'boolean | null',
    typeDefinition: `// Returns true if enabled, false if disabled, null if not set`,
    docsUrl: `${DOCS_BASE}#query-a-users-hip-3-dex-abstraction-state`,
    category: 'info',
    subcategory: 'User Data',
  },

  maxBuilderFee: {
    name: 'maxBuilderFee',
    description: 'Get maximum builder fee for a user-builder pair',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
      { name: 'builder', type: 'string', required: true, description: 'Builder address' },
    ],
    returnType: 'number',
    typeDefinition: `// Maximum builder fee in basis points`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'User Data',
  },

  activeAssetData: {
    name: 'activeAssetData',
    description: 'Get active asset data for a user and coin',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
      { name: 'coin', type: 'string', required: true, description: 'Asset symbol' },
    ],
    returnType: 'ActiveAssetData',
    typeDefinition: `interface ActiveAssetData {
  // Asset-specific data for a user
}`,
    docsUrl: `${DOCS_BASE}`,
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
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

  delegations: {
    name: 'delegations',
    description: 'Get staking delegations for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'Delegation[]',
    typeDefinition: `interface Delegation {
  validator: string;
  amount: string;
  lockedUntilTimestamp: number;
}`,
    docsUrl: `${DOCS_BASE}#query-a-users-staking-delegations`,
    category: 'info',
    subcategory: 'Staking',
  },

  delegatorHistory: {
    name: 'delegatorHistory',
    description: 'Get staking history for a delegator',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'DelegatorHistoryEntry[]',
    typeDefinition: `interface DelegatorHistoryEntry {
  time: number;
  hash: string;
  delta: {
    delegate?: { validator: string; amount: string; isUndelegate: boolean };
    cDeposit?: { amount: string };
    withdrawal?: { amount: string; phase: "initiated" | "finalized" };
  };
}`,
    docsUrl: `${DOCS_BASE}#query-a-users-staking-history`,
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
  followerState: {
    vaultEquity: string;
    pnl: string;
    allTimePnl: string;
    lockupUntil: number | null;
  } | null;
  maxDistributable: string;
  relationship: { type: "normal" } | { type: "parent" } | { type: "child"; parent: string };
  allowDeposits: boolean;
  isClosed: boolean;
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

  userVaultEquities: {
    name: 'userVaultEquities',
    description: 'Get vault deposits for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'UserVaultEquity[]',
    typeDefinition: `interface UserVaultEquity {
  vaultAddress: string;
  equity: string;
  lockedUntilTimestamp: number;
}`,
    docsUrl: `${DOCS_BASE}#retrieve-a-users-vault-deposits`,
    category: 'info',
    subcategory: 'Vaults',
  },

  leadingVaults: {
    name: 'leadingVaults',
    description: 'Get top performing vaults',
    params: [],
    returnType: 'LeadingVault[]',
    typeDefinition: `interface LeadingVault {
  vaultAddress: string;
  name: string;
  leader: string;
  tvl: string;
  apr: string;
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Vaults',
  },

  // ============ System ============

  exchangeStatus: {
    name: 'exchangeStatus',
    description: 'Get exchange operational status',
    params: [],
    returnType: 'ExchangeStatus',
    typeDefinition: `interface ExchangeStatus {
  status: string;
  // Additional status fields
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  alignedQuoteTokenInfo: {
    name: 'alignedQuoteTokenInfo',
    description: 'Get aligned quote token status and rate information',
    params: [
      { name: 'token', type: 'number', required: true, description: 'Token index' },
    ],
    returnType: 'AlignedQuoteTokenInfo',
    typeDefinition: `interface AlignedQuoteTokenInfo {
  isAligned: boolean;
  firstAlignedTime: number;
  evmMintedSupply: string;
  dailyWeiOwed: [string, string][];  // [date, amount]
  predictedRate: string;
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  gossipRootIps: {
    name: 'gossipRootIps',
    description: 'Get gossip root IPs',
    params: [],
    returnType: 'string[]',
    typeDefinition: `// Array of gossip root IP addresses`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  legalCheck: {
    name: 'legalCheck',
    description: 'Legal check for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'LegalCheckResponse',
    typeDefinition: `// Legal check result`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  preTransferCheck: {
    name: 'preTransferCheck',
    description: 'Pre-transfer validation check',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
      { name: 'destination', type: 'string', required: true, description: 'Destination address' },
      { name: 'token', type: 'string', required: true, description: 'Token to transfer' },
      { name: 'amount', type: 'string', required: true, description: 'Amount to transfer' },
    ],
    returnType: 'PreTransferCheckResponse',
    typeDefinition: `// Pre-transfer validation result`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  perpDeployAuctionStatus: {
    name: 'perpDeployAuctionStatus',
    description: 'Get perpetual deploy auction status',
    params: [],
    returnType: 'PerpDeployAuctionStatus',
    typeDefinition: `// Current perp deployment auction status`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  spotDeployState: {
    name: 'spotDeployState',
    description: 'Get spot deployment state for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'SpotDeployState',
    typeDefinition: `// Spot deployment state`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  spotPairDeployAuctionStatus: {
    name: 'spotPairDeployAuctionStatus',
    description: 'Get spot pair deploy auction status',
    params: [],
    returnType: 'SpotPairDeployAuctionStatus',
    typeDefinition: `// Current spot pair deployment auction status`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'System',
  },

  // ============ HIP-3 DEX ============

  perpDexLimits: {
    name: 'perpDexLimits',
    description: 'Get builder deployed perpetual market limits',
    params: [
      { name: 'dex', type: 'string', required: true, description: 'DEX name (empty string for main dex)' },
    ],
    returnType: 'PerpDexLimits | null',
    typeDefinition: `interface PerpDexLimits {
  totalOiCap: string;
  oiSzCapPerPerp: string;
  maxTransferNtl: string;
  coinToOiCap: [string, string][];
}`,
    docsUrl: `${DOCS_BASE}/perpetuals#retrieve-builder-deployed-perp-market-limits`,
    category: 'info',
    subcategory: 'HIP-3 DEX',
  },

  perpDexs: {
    name: 'perpDexs',
    description: 'Get all HIP-3 perpetual DEXs',
    params: [],
    returnType: 'PerpDex[]',
    typeDefinition: `// Array of HIP-3 perpetual DEXs`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'HIP-3 DEX',
  },

  // ============ Market Data (additional) ============

  liquidatable: {
    name: 'liquidatable',
    description: 'Get list of liquidatable positions',
    params: [],
    returnType: 'unknown[]',
    typeDefinition: `// Array of liquidatable positions`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Market Data',
  },

  marginTable: {
    name: 'marginTable',
    description: 'Get margin table information',
    params: [],
    returnType: 'MarginTable',
    typeDefinition: `// Margin requirements table`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Market Data',
  },

  // ============ User Data (additional) ============

  subAccounts2: {
    name: 'subAccounts2',
    description: 'Get sub-accounts for a user (v2)',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'SubAccount2[] | null',
    typeDefinition: `// Sub-accounts with extended information`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'User Data',
  },

  userToMultiSigSigners: {
    name: 'userToMultiSigSigners',
    description: 'Get multi-sig signers for a user',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'string[]',
    typeDefinition: `// Array of multi-sig signer addresses`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'User Data',
  },

  webData2: {
    name: 'webData2',
    description: 'Get comprehensive user and market data (all-in-one)',
    params: [
      { name: 'user', type: 'string', required: true, description: 'Wallet address', isUserAddress: true },
    ],
    returnType: 'WebData2Response',
    typeDefinition: `interface WebData2Response {
  clearinghouseState: ClearinghouseState;
  spotClearinghouseState: SpotClearinghouseState;
  leadingVaults: { address: string; name: string }[];
  totalVaultEquity: string;
  openOrders: FrontendOpenOrder[];
  twapStates: TwapState[];
  meta: Meta;
  assetCtxs: AssetCtx[];
  spotMeta: SpotMeta;
  spotAssetCtxs: SpotAssetCtx[];
  serverTime: number;
  isVault: boolean;
  user: string;
  agentAddress: string | null;
  cumLedger: CumulativeLedger;
  pendingWithdrawals: PendingWithdrawal[];
  delegatorSummary: DelegatorSummary;
  builderFeeApprovals: BuilderFeeApproval[];
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'User Data',
  },

  // ============ Explorer ============

  blockDetails: {
    name: 'blockDetails',
    description: 'Get block details by height',
    params: [
      { name: 'height', type: 'number', required: true, description: 'Block height' },
    ],
    returnType: 'BlockDetailsResponse',
    typeDefinition: `interface BlockDetailsResponse {
  type: "blockDetails";
  blockDetails: {
    blockTime: number;
    hash: string;
    height: number;
    numTxs: number;
    proposer: string;
    txs: Transaction[];
  };
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Explorer',
  },

  txDetails: {
    name: 'txDetails',
    description: 'Get transaction details by hash',
    params: [
      { name: 'hash', type: 'string', required: true, description: 'Transaction hash' },
    ],
    returnType: 'TxDetailsResponse',
    typeDefinition: `interface TxDetailsResponse {
  type: "txDetails";
  tx: {
    action: { type: string; [key: string]: unknown };
    block: number;
    error: string | null;
    hash: string;
    time: number;
    user: string;
  };
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Explorer',
  },

  userDetails: {
    name: 'userDetails',
    description: 'Get user details by address',
    params: [
      { name: 'address', type: 'string', required: true, description: 'User address' },
    ],
    returnType: 'UserDetailsResponse',
    typeDefinition: `interface UserDetailsResponse {
  type: "userDetails";
  userDetails: {
    address: string;
    activity: {
      firstAction: number | null;
      lastAction: number | null;
      totalTxs: number;
    };
    deposits: { amount: string; time: number }[];
    withdrawals: { amount: string; time: number }[];
    internalTransfers: { amount: string; time: number; destination: string; isDeposit: boolean }[];
  };
}`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Explorer',
  },

  // ============ Staking (additional) ============

  validatorL1Votes: {
    name: 'validatorL1Votes',
    description: 'Get validator L1 votes',
    params: [],
    returnType: 'ValidatorL1Votes',
    typeDefinition: `// Validator L1 voting information`,
    docsUrl: `${DOCS_BASE}`,
    category: 'info',
    subcategory: 'Staking',
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
