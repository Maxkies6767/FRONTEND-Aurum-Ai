// Shared display types and format helpers for the Gold AI Trading Bot dashboard.
// Runtime data is read from the FastAPI bridge; no secrets or trading settings are stored here.

export type SignalType = "BUY" | "SELL" | "HOLD";
export type TradeSide = "BUY" | "SELL" | "UNKNOWN";

export interface AccountStats {
  balance: number;
  equity: number;
  dailyPL: number;
  floatingPL: number;
  drawdownPct: number;
  openPositions: number;
  symbol: string;
  currentPrice: number;
  priceChangePct: number;
}

export interface AiSignal {
  type: SignalType;
  confidence: number;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  updatedAt: string;
}

export interface Position {
  id: string;
  ticket: number;
  symbol: string;
  side: TradeSide;
  lots: number;
  openPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  pl: number;
  comment: string;
}

export interface Trade {
  id: string;
  timestamp: string;
  action: string;
  lot: number | null;
  profit: number | null;
  profitSource: string;
  predictionProb: number | null;
  status: string;
}

export type LogLevel = "info" | "success" | "warning" | "error";

export interface ActivityEntry {
  id: string;
  time: string;
  level: LogLevel;
  message: string;
}

export const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatPrice = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatSigned = (value: number) =>
  `${value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;

export const formatPercent = (value: number) => `${value.toFixed(2)}%`;
