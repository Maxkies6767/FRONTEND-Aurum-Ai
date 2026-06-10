import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Cpu,
  Crown,
  EyeOff,
  Gauge,
  LineChart as LineChartIcon,
  Loader2,
  Lock,
  MinusCircle,
  Pause,
  Play,
  PowerOff,
  RefreshCw,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCapabilities } from "@/hooks/use-capabilities";
import { API_V1_BASE } from "@/lib/api-config";
import {
  formatCurrency,
  formatPrice,
  formatSigned,
  type SignalType,
  type Trade,
  type TradeSide,
} from "@/lib/dashboard-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurum AI — Premium XAUUSD Trading Terminal" },
      {
        name: "description",
        content: "Institutional-grade autonomous gold trading terminal powered by AI.",
      },
    ],
  }),
  component: Dashboard,
});

const DEFAULT_SYMBOL = "XAUUSDm";
const DEFAULT_REFRESH_INTERVAL = 5;

interface BotStateData {
  status: {
    backend_online: boolean;
    mt5_online: boolean;
    engine_online: boolean;
    engine_instance_id: string | null;
    runtime_mode: string;
    auto_trading_enabled: boolean;
    live_trading_enabled: boolean;
    account_mode?: "demo" | "live" | "unknown";
    demo_account?: boolean;
    automation_control_allowed?: boolean;
    trade_history_delete_allowed?: boolean;
    destructive_actions_allowed?: boolean;
    symbol: string;
    timeframe: string;
  };
  account: {
    balance: number;
    equity: number;
    free_margin?: number | null;
    margin_free?: number | null;
    daily_pnl: number;
    floating_pnl: number;
    drawdown_percent: number;
    open_positions_count: number;
  };
  market: {
    symbol: string;
    bid: number;
    ask: number;
    spread: number;
    timestamp: string;
  };
  signal: {
    signal: string;
    action?: string;
    confidence: number;
    entry_price: number;
    stop_loss: number;
    take_profit: number;
    suggested_lot?: number | null;
    reason: string;
    trend_score?: number | null;
    entry_score?: number | null;
    exit_score?: number | null;
    risk_status?: string | null;
    risk_score?: number | null;
    trend_model_score?: { bullish?: number; bearish?: number; ranging?: number } | null;
    entry_model_score?: {
      buy?: number;
      sell?: number;
      no_trade?: number;
      strong_buy?: number;
      weak_buy?: number;
      weak_sell?: number;
      strong_sell?: number;
    } | null;
    exit_model_score?: { hold?: number; close?: number; partial_close?: number } | null;
    model_version?: string | null;
    timestamp: string;
  };
  positions: Array<{
    ticket: number;
    symbol: string;
    type: string;
    volume: number;
    price_open: number;
    price_current: number;
    sl: number;
    tp: number;
    profit: number;
    comment: string;
  }>;
  news?: {
    active: boolean;
    events: Array<{
      title: string;
      time: string;
      time_diff_seconds: number;
      impact: string;
      country: string;
    }>;
    upcoming: Array<{
      title: string;
      time: string;
      time_diff_seconds: number;
      impact: string;
      country: string;
    }>;
  } | null;
  ticker_feeds?: Record<string, { price: string; change: string; up: boolean; source: string }>;
}

interface RawTradeRecord {
  id?: string | number;
  timestamp?: string;
  action?: string;
  lot?: number | string | null;
  entry_price?: number | string | null;
  exit_price?: number | string | null;
  profit?: number | string | null;
  profit_source?: string;
  profitSource?: string;
  prediction_prob?: number | string | null;
  predictionProb?: number | string | null;
  status?: string;
  side?: string;
  lots?: number | string | null;
  closedAt?: string;
  closed_at?: string;
  pl?: number | string | null;
}

interface TradesData {
  trades: RawTradeRecord[];
}

interface SettingsData {
  settings: {
    confidence_threshold: number;
    risk_per_trade_usd: number;
    sl_pips: number;
    tp_ratio: number;
  };
}

interface CandidateMetadata {
  run_id: string;
  created_at?: string;
  model_version?: string;
  symbol?: string;
  promoted?: boolean;
  eligible?: boolean;
  metrics?: {
    holdout?: {
      accuracy?: number;
      trade_signals?: number;
      trade_precision?: number;
      ensemble_scores?: {
        avg_trend_score?: number;
        avg_entry_score?: number;
        avg_exit_score?: number;
        risk_safe_rate?: number;
      };
      rejection_diagnostics?: {
        total_candles_evaluated?: number;
        buy_candidates?: number;
        sell_candidates?: number;
        rejected_by_trend_threshold?: number;
        rejected_by_entry_threshold?: number;
        rejected_by_risk_filter?: number;
        rejected_by_spread?: number;
        rejected_by_news?: number;
        rejected_by_no_threshold?: number;
        rejected_by_sl_tp?: number;
        final_signals?: number;
      };
      backtest?: {
        win_rate?: number;
        total_return?: number;
        max_drawdown?: number;
        profit_factor?: number;
        expectancy?: number;
        average_rr?: number;
      };
    };
  };
  ensemble?: Record<string, string>;
  promotion_checks?: Record<string, boolean>;
}

interface ModelStatusResponse {
  champion_model_path: string;
  champion_model_hash: string | null;
  champion_loaded: boolean;
  champion_kind?: string;
  model_source: string;
  training_allowed: boolean;
  promotion_allowed: boolean;
  training_in_progress: boolean;
  current_job_id: string | null;
  latest_candidate: CandidateMetadata | null;
  candidates: CandidateMetadata[];
  champion_metadata?: CandidateMetadata | null;
  ensemble?: Record<string, string> | null;
}

interface QuickControlsValues {
  timeframe: string;
  tradingMode: string;
  aiConfidence: number;
  riskPct: number;
  riskUsd: number;
  slPips: number;
  tpPips: number;
  tpRatio: number;
  riskFiltersEnabled: boolean;
}

const DEFAULT_QUICK_CONTROLS: QuickControlsValues = {
  timeframe: "M5 (5 Minutes)",
  tradingMode: "Standard (1 lot)",
  aiConfidence: 30,
  riskPct: 1.5,
  riskUsd: 50,
  slPips: 15,
  tpPips: 30,
  tpRatio: 2,
  riskFiltersEnabled: true,
};

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

function normalizeSignalType(value: string | undefined): SignalType {
  const normalized = value?.toUpperCase();
  if (normalized === "BUY" || normalized === "SELL") return normalized;
  return "HOLD";
}

function normalizePositionSide(value: string | undefined): TradeSide {
  if (!value) return "UNKNOWN";
  const normalized = value.toUpperCase();
  if (normalized.includes("BUY")) return "BUY";
  if (normalized.includes("SELL")) return "SELL";
  return "UNKNOWN";
}

function normalizeConfidence(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return clamp(value <= 1 ? value * 100 : value, 0, 100);
}

function normalizeTrade(record: RawTradeRecord, index: number): Trade {
  const rawPrediction = numberOrNull(record.prediction_prob ?? record.predictionProb);
  const predictionProb =
    rawPrediction == null ? null : rawPrediction > 1 ? rawPrediction / 100 : rawPrediction;
  const lot = numberOrNull(record.lot ?? record.lots);
  const profit = numberOrNull(record.profit ?? record.pl);

  return {
    id: String(record.id ?? `trade-${index}`),
    timestamp: record.timestamp ?? record.closed_at ?? record.closedAt ?? "",
    action: record.action ?? record.side ?? "",
    lot,
    profit,
    profitSource: record.profit_source ?? record.profitSource ?? "",
    predictionProb,
    status: record.status ?? (profit == null ? "" : `P/L ${formatSigned(profit)}`),
  };
}

function formatNullableCurrency(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) ? "Unavailable" : formatCurrency(value);
}

function formatNullablePrice(value: number | null | undefined) {
  return value == null || !Number.isFinite(value) || value <= 0
    ? "Unavailable"
    : formatPrice(value);
}

function compactHash(value: string | null | undefined) {
  if (!value) return "Unavailable";
  return value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}

function formatTimeframeLabel(value: string | null | undefined) {
  if (!value) return DEFAULT_QUICK_CONTROLS.timeframe;
  if (value.includes("(")) return value;
  const map: Record<string, string> = {
    M1: "M1 (1 Minute)",
    M5: "M5 (5 Minutes)",
    M15: "M15 (15 Minutes)",
    H1: "H1 (1 Hour)",
  };
  return map[value.toUpperCase()] ?? value;
}

function newIdempotencyKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function Spotlight({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}

function Tilt({
  children,
  className = "",
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
      }}
      onMouseLeave={() => {
        const el = ref.current;
        if (el) el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
      }}
      style={{
        transition: "transform 350ms cubic-bezier(.2,.8,.2,1)",
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </div>
  );
}

function CountUp({
  value,
  decimals = 2,
  prefix = "",
  suffix = "",
  duration = 1100,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [n, setN] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = n;
    startRef.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(fromRef.current + (value - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <>
      {prefix}
      {n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}

function ClientTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
    setTime(fmt());
    const i = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <span suppressHydrationWarning className="font-mono-num text-[11px] text-muted-foreground">
      {time ? `Updated ${time}` : "Updated --"}
    </span>
  );
}

function StatusPill({
  tone,
  label,
  active = true,
  icon: _Icon,
}: {
  tone: "success" | "danger" | "gold" | "info" | "muted";
  label: string;
  active?: boolean;
  icon?: LucideIcon;
}) {
  const map = {
    success:
      "text-[oklch(0.78_0.18_155)] bg-[oklch(0.74_0.18_155/0.08)] border-[oklch(0.74_0.18_155/0.25)]",
    danger:
      "text-[oklch(0.72_0.20_22)] bg-[oklch(0.66_0.22_22/0.08)] border-[oklch(0.66_0.22_22/0.25)]",
    gold: "text-[oklch(0.96_0.012_95)] bg-[oklch(0.88_0.018_95/0.08)] border-[oklch(0.88_0.018_95/0.25)]",
    info: "text-sky-300 bg-sky-400/5 border-sky-400/20",
    muted: "text-muted-foreground bg-background/45 border-border",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${map}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {active && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
        )}
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {label}
    </span>
  );
}

function Ticker({
  symbol,
  bid,
  ask,
  spread,
  mt5Online,
  feeds,
}: {
  symbol: string;
  bid: number | null | undefined;
  ask: number | null | undefined;
  spread: number | null | undefined;
  mt5Online: boolean;
  feeds?: Record<string, { price: string; change: string; up: boolean; source: string }> | null;
}) {
  const tickerSymbol = symbol.toUpperCase().startsWith("XAU") ? "XAU/USD" : symbol;
  const items = [
    {
      sym: tickerSymbol,
      px: formatNullablePrice(bid),
      chg: mt5Online ? "live" : "offline",
      up: mt5Online,
    },
    {
      sym: `${symbol} Ask`,
      px: formatNullablePrice(ask),
      chg: `Spread ${(spread ?? 0).toFixed(2)}`,
      up: true,
    },
    ...["DXY", "US10Y", "BTC/USD", "SPX", "WTI", "EUR/USD", "VIX"].map((key) => {
      const feed = feeds?.[key];
      return {
        sym: key,
        px: feed?.price ?? "Unavailable",
        chg: feed?.change ?? "no endpoint",
        up: feed ? feed.up : false,
      };
    }),
  ];

  const row = (
    <div className="flex shrink-0 items-center gap-10 px-6">
      {items.map((item, i) => (
        <div
          key={`${item.sym}-${i}`}
          className="flex items-center gap-2 whitespace-nowrap font-mono-num text-[11px]"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {item.sym}
          </span>
          <span className="text-foreground">{item.px}</span>
          <span className={item.up ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}>
            {item.chg}
          </span>
          <span className="text-border">·</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-b border-border/60 bg-background/60 py-2 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "success" | "danger" | "gold";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-[oklch(0.78_0.18_155)]",
    danger: "text-[oklch(0.72_0.20_22)]",
    gold: "text-gradient-gold",
  }[tone];
  const iconClass = {
    default: "bg-muted text-muted-foreground",
    success: "bg-[oklch(0.74_0.18_155/0.12)] text-[oklch(0.78_0.18_155)]",
    danger: "bg-[oklch(0.66_0.22_22/0.12)] text-[oklch(0.72_0.20_22)]",
    gold: "bg-gradient-gold-soft text-[oklch(0.96_0.012_95)]",
  }[tone];

  return (
    <Tilt max={5}>
      <Spotlight className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition hover:border-[oklch(0.58_0.055_295/0.55)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.055_300/0.45)] to-transparent opacity-0 transition group-hover:opacity-100" />
        <div className="relative z-[2] flex items-center justify-between">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </span>
        </div>
        <div
          className={`relative z-[2] mt-4 font-serif text-3xl font-medium tracking-tight ${toneClass}`}
        >
          {value}
        </div>
        {hint && (
          <div className="relative z-[2] mt-1 font-mono-num text-xs text-muted-foreground">
            {hint}
          </div>
        )}
      </Spotlight>
    </Tilt>
  );
}

function SectionCard({
  title,
  icon: Icon,
  right,
  children,
  className = "",
  numeral,
}: {
  title: string;
  icon?: LucideIcon;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  numeral?: string;
}) {
  return (
    <Spotlight
      className={`corner-ornaments foil-grain sheen-sweep border-trace relative overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant ${className}`}
    >
      <section className="relative">
        <header className="relative z-[2] flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            {numeral && <span className="numeral-tag">{numeral}</span>}
            {Icon && (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-gold-soft text-[oklch(0.96_0.012_95)] ring-1 ring-[oklch(0.92_0.05_310/0.25)]">
                <Icon className="h-3.5 w-3.5" />
              </div>
            )}
            <h2 className="font-serif text-[15px] font-medium tracking-tight text-foil">{title}</h2>
            <span className="hidden h-3 w-px bg-border md:inline-block" />
            <span className="hidden font-mono-num text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:inline">
              Maison · MMXXVI
            </span>
          </div>
          {right}
        </header>
        <div className="relative z-[2] p-5">{children}</div>
      </section>
    </Spotlight>
  );
}

function Toggle({
  on,
  onChange,
  disabled = false,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${
        on
          ? "border-[oklch(0.88_0.018_95/0.4)] bg-gradient-gold shadow-gold"
          : "border-border bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-md transition ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 rounded-lg border border-border bg-background/60 px-3 font-mono-num text-sm text-foreground outline-none transition disabled:cursor-not-allowed disabled:opacity-55 focus:border-[oklch(0.88_0.018_95/0.5)] focus:ring-2 focus:ring-[oklch(0.88_0.018_95/0.15)] ${props.className ?? ""}`}
    />
  );
}

function Select({
  value,
  onChange,
  options,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <UISelect value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-9 rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground shadow-none transition hover:border-[oklch(0.84_0.08_305/0.45)] focus:border-[oklch(0.84_0.08_305/0.55)] focus:ring-2 focus:ring-[oklch(0.84_0.08_305/0.15)] data-[state=open]:border-[oklch(0.84_0.08_305/0.55)]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] backdrop-blur-xl text-foreground shadow-[0_24px_60px_-20px_oklch(0_0_0/0.7),0_0_0_1px_oklch(0.84_0.08_305/0.12)]">
        {options.map((o) => (
          <SelectItem
            key={o}
            value={o}
            className="cursor-pointer rounded-md text-sm text-foreground/85 transition focus:bg-[oklch(0.84_0.08_305/0.14)] focus:text-foreground data-[state=checked]:bg-[oklch(0.84_0.08_305/0.18)] data-[state=checked]:text-foreground"
          >
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </UISelect>
  );
}

function PriceChart({ data }: { data: number[] }) {
  if (data.length < 1) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No price data
      </div>
    );
  }

  const chartData = data.length === 1 ? [data[0], data[0]] : data;
  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const w = 800;
  const h = 220;
  const pad = 8;
  const pts = chartData.map((v, i) => {
    const x = (i / (chartData.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y] as const;
  });
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${d} L${w - pad},${h} L${pad},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.88 0.018 95)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.88 0.018 95)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.72 0.015 90)" />
          <stop offset="50%" stopColor="oklch(0.96 0.012 95)" />
          <stop offset="100%" stopColor="oklch(0.72 0.015 90)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={0}
          x2={w}
          y1={h * g}
          y2={h * g}
          stroke="oklch(1 0 0 / 0.04)"
          strokeDasharray="2 4"
        />
      ))}
      <path d={area} fill="url(#goldFill)" />
      <path
        d={d}
        fill="none"
        stroke="url(#goldStroke)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.length > 0 && (
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r={4}
          fill="oklch(0.96 0.012 95)"
        >
          <animate attributeName="r" values="4;7;4" dur="1.8s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

function DataState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-background/30 px-4 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

interface PerformanceData {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  net_profit: number;
  gross_profit: number;
  gross_loss: number;
  profit_factor: number | null;
  average_win: number;
  average_loss: number;
  max_drawdown: number;
  maximum_consecutive_losses: number;
  daily_pnl: number;
  open_positions_count: number;
  blocked_orders_count: number;
  order_errors_count: number;
  equity_curve: Array<{ timestamp: string; equity: number }>;
  daily_results: Array<{ date: string; pnl: number }>;
  recent_trades: RawTradeRecord[];

  summary?: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    breakeven_trades: number;
    win_rate: number;
    loss_rate: number;
    net_profit: number;
    gross_profit: number;
    gross_loss: number;
    average_profit: number;
    average_win: number;
    average_loss: number;
    best_trade: number;
    worst_trade: number;
  };
  risk_metrics?: {
    average_rr: number;
    realized_rr: number;
    profit_factor: number;
    expectancy: number;
    payoff_ratio: number;
    max_drawdown: number;
    current_drawdown: number;
    recovery_factor: number;
  };
  streaks?: {
    consecutive_wins: number;
    consecutive_losses: number;
    max_consecutive_wins: number;
    max_consecutive_losses: number;
  };
  time_breakdowns?: {
    today_pnl: number;
    weekly_pnl: number;
    monthly_pnl: number;
  };
  balance_curve?: Array<{ timestamp: string; balance: number }>;
  side_breakdown?: Array<{ side: string; trades: number; pnl: number; win_rate: number }>;
  symbol_breakdown?: Array<{ symbol: string; trades: number; pnl: number; win_rate: number }>;
}

function PerformanceChart({
  equityData,
  balanceData,
}: {
  equityData: Array<{ timestamp: string; equity: number }>;
  balanceData: Array<{ timestamp: string; balance: number }>;
}) {
  if (equityData.length < 1) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No performance curve data available. Run some trades first.
      </div>
    );
  }

  const values = equityData.map((d) => d.equity);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 10);
  const w = 800;
  const h = 260;
  const pad = 12;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
    return [x, y] as const;
  });

  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${d} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full">
      <defs>
        <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.88 0.018 95)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.88 0.018 95)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="perfStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.72 0.015 90)" />
          <stop offset="50%" stopColor="oklch(0.96 0.012 95)" />
          <stop offset="100%" stopColor="oklch(0.72 0.015 90)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={0}
          x2={w}
          y1={h * g}
          y2={h * g}
          stroke="oklch(1 0 0 / 0.04)"
          strokeDasharray="2 4"
        />
      ))}
      {min < 0 && (
        <line
          x1={0}
          x2={w}
          y1={h - pad - ((0 - min) / (max - min)) * (h - pad * 2)}
          y2={h - pad - ((0 - min) / (max - min)) * (h - pad * 2)}
          stroke="oklch(0.72 0.20 22 / 0.25)"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      )}
      <path d={area} fill="url(#perfFill)" />
      <path
        d={d}
        fill="none"
        stroke="url(#perfStroke)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {pts.length > 0 && (
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r={5}
          fill="oklch(0.96 0.012 95)"
        >
          <animate attributeName="r" values="5;8;5" dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

function Dashboard() {
  const prevPositionsRef = useRef<number[]>([]);
  const initializedRef = useRef(false);
  const [data, setData] = useState<BotStateData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [logsData, setLogsData] = useState<{
    logs: string[];
    source: string | null;
    path: string | null;
  } | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [optionalErrors, setOptionalErrors] = useState<string[]>([]);

  // Navigation tab
  const [tab, setTab] = useState<"dashboard" | "performance" | "logs">(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const t = searchParams.get("tab");
      if (t === "performance" || t === "logs") return t;
    }
    return "dashboard";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.get("tab") !== tab) {
        url.searchParams.set("tab", tab);
        window.history.replaceState(null, "", url.toString());
      }
    }
  }, [tab]);

  // Configs and controls
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(DEFAULT_REFRESH_INTERVAL);
  const [quickControls, setQuickControls] = useState<QuickControlsValues>(DEFAULT_QUICK_CONTROLS);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [tradeViewCleared, setTradeViewCleared] = useState(false);

  // Dialog confirmation states
  const [closeAllPending, setCloseAllPending] = useState(false);
  const [closeAllDialogOpen, setCloseAllDialogOpen] = useState(false);
  const [trainingCandles, setTrainingCandles] = useState(20000);
  const [trainTrendThreshold, setTrainTrendThreshold] = useState(0.55);
  const [trainEntryThreshold, setTrainEntryThreshold] = useState(0.55);
  const [trainRiskThreshold, setTrainRiskThreshold] = useState(0.55);
  const [trainMinConfidence, setTrainMinConfidence] = useState(20.0);
  const [trainMaxSpread, setTrainMaxSpread] = useState(5.0);
  const [trainDebugMode, setTrainDebugMode] = useState(false);
  const [trainingPending, setTrainingPending] = useState(false);
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingState, setTrainingState] = useState<string | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<CandidateMetadata | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [rejectingCandidate, setRejectingCandidate] = useState(false);

  // Hook capabilities
  const { capData, capError, capabilities, refreshCapabilities } = useCapabilities(
    autoRefresh,
    refreshIntervalSeconds,
  );

  // Fetch bot states
  const fetchData = useCallback(async () => {
    const secondaryErrors: string[] = [];
    try {
      const statusRes = await fetch(`${API_V1_BASE}/status`);
      if (!statusRes.ok) throw new Error(`/status returned ${statusRes.status}`);
      const statusJson = (await statusRes.json()) as BotStateData;
      setData(statusJson);
      setApiError(null);

      const currentTickets = (statusJson.positions ?? []).map((position) => position.ticket);
      if (!initializedRef.current) {
        initializedRef.current = true;
      } else if (currentTickets.some((ticket) => !prevPositionsRef.current.includes(ticket))) {
        toast.success("New open position reported by backend.");
      }
      prevPositionsRef.current = currentTickets;

      const currentPrice = statusJson.market?.bid || statusJson.market?.ask || 0;
      if (currentPrice > 0) {
        setPriceHistory((previous) => [...previous, currentPrice].slice(-80));
      }

      const [tradesResult, settingsResult, modelResult, performanceResult, logsResult] =
        await Promise.allSettled([
          fetch(`${API_V1_BASE}/trades?limit=15`),
          fetch(`${API_V1_BASE}/settings`),
          fetch(`${API_V1_BASE}/model/status`),
          fetch(`${API_V1_BASE}/performance`),
          fetch(`${API_V1_BASE}/logs?lines=150`),
        ]);

      if (tradesResult.status === "fulfilled" && tradesResult.value.ok) {
        const tradesJson = (await tradesResult.value.json()) as TradesData;
        setTrades(tradesJson.trades.map(normalizeTrade));
      } else {
        secondaryErrors.push("Recent trades unavailable");
      }

      if (settingsResult.status === "fulfilled" && settingsResult.value.ok) {
        const settingsJson = (await settingsResult.value.json()) as SettingsData;
        if (!settingsDirty) {
          setQuickControls((previous) => ({
            ...previous,
            timeframe: formatTimeframeLabel(statusJson.status?.timeframe || previous.timeframe),
            aiConfidence: settingsJson.settings.confidence_threshold,
            riskUsd: settingsJson.settings.risk_per_trade_usd,
            slPips: settingsJson.settings.sl_pips,
            tpRatio: settingsJson.settings.tp_ratio,
          }));
        }
      } else {
        secondaryErrors.push("Settings unavailable");
      }

      if (modelResult.status === "fulfilled" && modelResult.value.ok) {
        const modelJson = (await modelResult.value.json()) as ModelStatusResponse;
        setModelStatus(modelJson);
        if (modelJson.training_in_progress && modelJson.current_job_id) {
          setTrainingJobId(modelJson.current_job_id);
        }
      } else {
        secondaryErrors.push("AI model status unavailable");
      }

      if (performanceResult.status === "fulfilled" && performanceResult.value.ok) {
        const perfJson = (await performanceResult.value.json()) as PerformanceData;
        setPerformance(perfJson);
      } else {
        secondaryErrors.push("Performance metrics unavailable");
      }

      if (logsResult.status === "fulfilled" && logsResult.value.ok) {
        const logsJson = await logsResult.value.json();
        setLogsData(logsJson);
      } else {
        secondaryErrors.push("System logs unavailable");
      }

      setOptionalErrors(secondaryErrors);
      return statusJson;
    } catch (error) {
      setApiError(getErrorMessage(error));
      return null;
    }
  }, [settingsDirty]);

  // Main polling loop
  useEffect(() => {
    void fetchData();
    if (!autoRefresh) return undefined;
    const interval = window.setInterval(() => void fetchData(), refreshIntervalSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, fetchData, refreshIntervalSeconds]);

  // Training job polling
  useEffect(() => {
    if (!trainingJobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(`${API_V1_BASE}/model/jobs/${trainingJobId}`);
        if (!res.ok || !active) return;
        const payload = await res.json();
        setTrainingProgress(payload.progress_percent ?? 0);
        setTrainingState(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setTrainingJobId(null);
          setTrainingError(
            payload.state === "failed" ? payload.error || "Model training failed." : null,
          );
          if (payload.state === "completed") {
            toast.success("Candidate Model Training Complete!", {
              description: `Job ${trainingJobId} finished successfully. Review the candidate in AI Model Management before promoting.`,
              duration: 7000,
            });
          } else {
            toast.error("Model Training Failed", {
              description: payload.error || "Check Service Logs for details.",
              duration: 9000,
            });
          }
          void fetchData();
          void refreshCapabilities();
        }
      } catch (error) {
        console.error("Training job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 1500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [fetchData, refreshCapabilities, trainingJobId]);

  const stats = data?.account;
  const status = data?.status;
  const market = data?.market;
  const signal = data?.signal;
  const rawPositions = data?.positions ?? [];
  const symbol = market?.symbol || status?.symbol || DEFAULT_SYMBOL;
  const accountMode = status?.account_mode ?? "unknown";
  const backendOnline = !apiError && Boolean(status?.backend_online);
  const canPause = capabilities.pause.allowed && !actionPending;
  const canResume = capabilities.resume.allowed && !actionPending;
  const visibleTrades = tradeViewCleared ? [] : trades;
  const freeMargin = stats?.free_margin ?? stats?.margin_free ?? null;

  const uiSignal = {
    type: normalizeSignalType(signal?.action ?? signal?.signal),
    action: signal?.action ?? signal?.signal ?? "HOLD",
    confidence: normalizeConfidence(signal?.confidence),
    entry: signal?.entry_price ?? 0,
    stopLoss: signal?.stop_loss ?? 0,
    takeProfit: signal?.take_profit ?? 0,
    suggestedLot: signal?.suggested_lot ?? null,
    reason: signal?.reason ?? "Waiting for backend signal",
    trendScore: normalizeConfidence(signal?.trend_score ?? undefined),
    entryScore: normalizeConfidence(signal?.entry_score ?? undefined),
    exitScore: normalizeConfidence(signal?.exit_score ?? undefined),
    riskStatus: signal?.risk_status ?? "UNKNOWN",
    trendModel: signal?.trend_model_score ?? null,
    entryModel: signal?.entry_model_score ?? null,
    exitModel: signal?.exit_model_score ?? null,
    modelVersion: signal?.model_version ?? "legacy-xgboost",
    updatedAt: signal?.timestamp ? new Date(signal.timestamp).toLocaleTimeString() : "Unavailable",
  };

  const uiPositions = rawPositions.map((position) => ({
    id: String(position.ticket),
    ticket: position.ticket,
    symbol: position.symbol,
    side: normalizePositionSide(position.type),
    lots: position.volume,
    openPrice: position.price_open,
    currentPrice: position.price_current,
    stopLoss: position.sl,
    takeProfit: position.tp,
    pl: position.profit,
    comment: position.comment,
  }));

  const displayPriceHistory =
    priceHistory.length > 0 ? priceHistory : market?.bid ? [market.bid] : [];
  const latestCandidate = modelStatus?.latest_candidate ?? modelStatus?.candidates?.[0] ?? null;
  const championBacktest = modelStatus?.champion_metadata?.metrics?.holdout?.backtest;
  const orderExecutionAllowed = capData?.order_execution_allowed ?? false;
  const chartFirst = displayPriceHistory[0] ?? 0;
  const chartLast = displayPriceHistory[displayPriceHistory.length - 1] ?? 0;
  const priceDelta =
    chartFirst > 0 && chartLast > 0 ? ((chartLast - chartFirst) / chartFirst) * 100 : 0;

  const signalStyle = useMemo(
    () =>
      ({
        BUY: {
          Icon: TrendingUp,
          color: "text-[oklch(0.78_0.18_155)]",
          grad: "from-[oklch(0.74_0.18_155/0.18)]",
        },
        SELL: {
          Icon: TrendingDown,
          color: "text-[oklch(0.72_0.20_22)]",
          grad: "from-[oklch(0.66_0.22_22/0.18)]",
        },
        HOLD: {
          Icon: MinusCircle,
          color: "text-muted-foreground",
          grad: "from-muted/30",
        },
      })[uiSignal.type],
    [uiSignal.type],
  );

  const handleRefreshIntervalChange = (seconds: number) => {
    if (!Number.isFinite(seconds)) return;
    setRefreshIntervalSeconds(clamp(seconds, 2, 30));
  };

  const waitForAutomationState = async (expected: boolean) => {
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      await sleep(350);
      const [statusJson] = await Promise.all([fetchData(), refreshCapabilities()]);
      if (statusJson?.status?.auto_trading_enabled === expected) return true;
    }
    await Promise.all([fetchData(), refreshCapabilities()]);
    return false;
  };

  const sendAction = async (type: "pause" | "resume") => {
    const capability = type === "pause" ? capabilities.pause : capabilities.resume;
    if (!capability.allowed) {
      toast.error(capability.reason ?? `${type} is blocked by backend policy.`);
      return;
    }
    setActionPending(true);
    try {
      const response = await fetch(`${API_V1_BASE}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || `Action ${type} failed`);
      toast.success(type === "pause" ? "Pause command queued." : "Resume command queued.");
      await waitForAutomationState(type === "resume");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionPending(false);
    }
  };

  const saveSettings = async () => {
    if (!capabilities.save_settings.allowed) {
      toast.error(
        capabilities.save_settings.reason ?? "Save settings is blocked by backend policy.",
      );
      return;
    }
    setSavingSettings(true);
    try {
      const response = await fetch(`${API_V1_BASE}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confidence_threshold: quickControls.aiConfidence,
          risk_per_trade_usd: quickControls.riskUsd,
          sl_pips: quickControls.slPips,
          tp_ratio: quickControls.tpRatio,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to save settings");
      toast.success("Backend settings saved.");
      setSettingsDirty(false);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClosePosition = async (ticket: number) => {
    if (!capabilities.close_position.allowed) {
      toast.error(capabilities.close_position.reason || "Close position is disabled.");
      return;
    }
    if (!window.confirm(`Queue close-position command for ticket ${ticket}?`)) return;
    try {
      const response = await fetch(`${API_V1_BASE}/actions/close-position`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, idempotency_key: newIdempotencyKey() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Close position failed");
      toast.success(`Close position command queued for ticket ${ticket}.`);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleResetHistory = async () => {
    if (!capabilities.delete_stored_history.allowed) {
      toast.error(capabilities.delete_stored_history.reason || "Reset history is disabled.");
      return;
    }
    if (
      !window.confirm(
        "WARNING: This will permanently delete all trade logs and history from the database. Are you sure?",
      )
    )
      return;
    try {
      const response = await fetch(`${API_V1_BASE}/trades`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to clear trades database");
      toast.success("Trade history permanently deleted.");
      setTradeViewCleared(false);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleResetCanarySession = async () => {
    if (!capabilities.reset_canary_session.allowed) {
      toast.error(capabilities.reset_canary_session.reason || "Reset canary session is disabled.");
      return;
    }
    try {
      const response = await fetch(`${API_V1_BASE}/actions/reset-canary-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotency_key: newIdempotencyKey() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Reset canary session failed");
      toast.success(payload.message || "Canary session reset successfully.");
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEmergencyCloseAll = async () => {
    if (!capabilities.close_all.allowed) {
      toast.error(
        capabilities.close_all.reason || "Emergency close-all is blocked by backend policy.",
      );
      return;
    }
    setCloseAllPending(true);
    try {
      const response = await fetch(`${API_V1_BASE}/actions/emergency-close-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idempotency_key: newIdempotencyKey() }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Emergency close-all failed");
      toast.success(payload.message || "Emergency close-all command accepted.");
      setCloseAllDialogOpen(false);
      await sleep(1500);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCloseAllPending(false);
    }
  };

  const startTraining = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Model training is blocked by backend policy.",
      );
      return;
    }
    setTrainingPending(true);
    setTrainingError(null);
    setTrainingProgress(0);
    setTrainingState("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/model/train-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candles: trainingCandles,
          idempotency_key: newIdempotencyKey(),
          trend_threshold: trainTrendThreshold,
          entry_threshold: trainEntryThreshold,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          max_spread: trainMaxSpread,
          debug_mode: trainDebugMode,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Failed to start model training");
      setTrainingJobId(payload.job_id);
      setTrainingState(payload.state);
      setTrainingProgress(payload.progress_percent || 0);
      toast.success("Training Job Queued", {
        description: `Job ${payload.job_id} — training on ${trainingCandles.toLocaleString()} candles. Progress will appear automatically.`,
        duration: 5000,
      });
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      setTrainingError(getErrorMessage(error));
      setTrainingState("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setTrainingPending(false);
    }
  };

  const promoteCandidate = async () => {
    if (!promoteTarget) return;
    if (!capabilities.model_promotion.allowed) {
      toast.error(
        capabilities.model_promotion.reason || "Model promotion is blocked by backend policy.",
      );
      return;
    }
    setPromoting(true);
    try {
      const response = await fetch(`${API_V1_BASE}/model/promote-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: promoteTarget.run_id,
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      const detail = payload.detail;
      if (!response.ok) {
        throw new Error(
          typeof detail === "string" ? detail : detail?.message || "Failed to promote candidate",
        );
      }
      toast.success(`Candidate ${promoteTarget.run_id} promoted.`);
      setPromoteTarget(null);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPromoting(false);
    }
  };

  const rejectCandidate = async (candidate: CandidateMetadata) => {
    setRejectingCandidate(true);
    try {
      const response = await fetch(`${API_V1_BASE}/model/candidates/${candidate.run_id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to reject candidate");
      toast.success(`Candidate ${candidate.run_id} rejected.`);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRejectingCandidate(false);
    }
  };

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="velvet-vignette" aria-hidden />
      <div className="bokeh-field" aria-hidden>
        <span
          className="bk"
          style={{ width: 180, height: 180, left: "8%", top: "12%", animationDelay: "0s" }}
        />
        <span
          className="bk"
          style={{ width: 120, height: 120, left: "72%", top: "8%", animationDelay: "-3s" }}
        />
        <span
          className="bk"
          style={{ width: 220, height: 220, left: "55%", top: "55%", animationDelay: "-6s" }}
        />
        <span
          className="bk"
          style={{ width: 90, height: 90, left: "20%", top: "70%", animationDelay: "-9s" }}
        />
        <span
          className="bk"
          style={{ width: 140, height: 140, left: "88%", top: "42%", animationDelay: "-4s" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-blueprint" />
      <span aria-hidden className="monogram-watermark right-[-4%] top-[18%] hidden lg:block">
        Au
      </span>

      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <Ticker
          symbol={symbol}
          bid={market?.bid}
          ask={market?.ask}
          spread={market?.spread}
          mt5Online={Boolean(status?.mt5_online)}
          feeds={data?.ticker_feeds}
        />
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-[oklch(0.88_0.018_95/0.5)] [animation:pulse-glow_3s_ease-in-out_infinite]" />
              <Crown className="relative h-5 w-5 text-background" strokeWidth={2.5} />
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-[oklch(0.78_0.18_155)]">
                <span className="absolute inset-0 animate-ping rounded-full bg-[oklch(0.78_0.18_155)] opacity-60" />
              </span>
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <span className="font-serif text-lg">Aurum</span>
                <span className="text-shine font-serif text-lg">AI</span>
                <span className="rounded-md border border-[oklch(0.88_0.018_95/0.3)] bg-[oklch(0.88_0.018_95/0.08)] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[oklch(0.96_0.012_95)]">
                  Pro
                </span>
                <span className="hidden items-center gap-1 rounded-md border border-border bg-background/50 px-1.5 py-0.5 font-mono-num text-[9px] text-muted-foreground md:inline-flex">
                  <span className="h-1 w-1 rounded-full bg-[oklch(0.78_0.18_155)]" /> API
                </span>
              </h1>
              <p className="font-mono-num text-[11px] text-muted-foreground">
                {symbol} · {status?.timeframe ?? "M5"} · runtime{" "}
                {status?.runtime_mode ?? "external"} · {accountMode} · instance{" "}
                <span className="text-foreground/80">
                  {status?.engine_instance_id ?? "offline"}
                </span>
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-1.5 rounded-xl border border-border bg-surface/60 p-1 md:flex">
            {(["dashboard", "performance", "logs"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`relative rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                  tab === k
                    ? "bg-gradient-gold-soft text-[oklch(0.96_0.012_95)] font-semibold shadow-gold-soft"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {k}
              </button>
            ))}
            <Link
              to="/train"
              className="relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-[oklch(0.96_0.012_95)]"
            >
              Retrainer
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <StatusPill
              tone={backendOnline ? "success" : "danger"}
              label={backendOnline ? "Backend Online" : "Backend Offline"}
              icon={Cpu}
            />
            <StatusPill
              tone={status?.engine_online ? "success" : "danger"}
              label={status?.engine_online ? "Engine Online" : "Engine Offline"}
              icon={Bot}
            />
            <StatusPill
              tone={status?.mt5_online ? "success" : "danger"}
              label={status?.mt5_online ? "MT5 Online" : "MT5 Offline"}
              icon={Activity}
            />
            <StatusPill
              tone={accountMode === "demo" ? "gold" : "muted"}
              label={
                accountMode === "demo"
                  ? "Demo Account"
                  : accountMode === "live"
                    ? "Live Account"
                    : "Account Unknown"
              }
              icon={ShieldCheck}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] space-y-5 px-6 py-6">
        {/* Automation bar */}
        <div className="sheen-sweep border-trace flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-surface px-5 py-4 shadow-elegant">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-2">
              <Activity className="h-4 w-4 text-[oklch(0.96_0.012_95)]" />
              <span className="text-sm font-medium">Automation</span>
              <Toggle
                on={Boolean(status?.auto_trading_enabled)}
                disabled={actionPending || (!canPause && !canResume)}
                onChange={(next) => void sendAction(next ? "resume" : "pause")}
              />
              <span
                className={`font-mono-num text-xs ${status?.auto_trading_enabled ? "text-[oklch(0.78_0.18_155)]" : "text-muted-foreground"}`}
              >
                {status?.auto_trading_enabled ? "ON" : "OFF"}
              </span>
            </div>
            <button
              onClick={() => void sendAction("pause")}
              disabled={!canPause}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
              Pause
            </button>
            <button
              onClick={() => void sendAction("resume")}
              disabled={!canResume}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Resume
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden text-xs text-muted-foreground md:block">
              Automation control gate is open. Resume still requires confirmation.
            </p>
            <button
              disabled={!capabilities.close_all.allowed || closeAllPending}
              onClick={() => setCloseAllDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[oklch(0.66_0.22_22/0.4)] bg-[oklch(0.66_0.22_22/0.12)] px-4 py-2 text-sm font-semibold text-[oklch(0.78_0.20_22)] shadow-[0_8px_24px_-8px_oklch(0.66_0.22_22/0.5)] transition hover:bg-[oklch(0.66_0.22_22/0.2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PowerOff className="h-4 w-4" /> Close All Positions
            </button>
          </div>
        </div>

        {/* Status pills row */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            tone="info"
            label={capData?.control_mode === "demo" ? "Demo Control Enabled" : "Control Limited"}
          />
          <StatusPill
            tone={orderExecutionAllowed ? "success" : "danger"}
            label={orderExecutionAllowed ? "Order Execution Active" : "Order Execution Blocked"}
          />
          <StatusPill
            tone="danger"
            label={status?.live_trading_enabled ? "Live Trading Enabled" : "Live Trading Blocked"}
          />
        </div>

        {/* News blackout warning */}
        {data?.news ? (
          data.news.active ? (
            <div className="flex items-start gap-3 rounded-2xl border border-[oklch(0.72_0.20_22/0.3)] bg-[oklch(0.72_0.20_22/0.06)] px-5 py-4 animate-pulse">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.72_0.20_22/0.15)]">
                <AlertTriangle className="h-4 w-4 text-[oklch(0.72_0.20_22)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[oklch(0.72_0.20_22)]">
                  Active USD High-Impact News Blackout!
                </p>
                <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                  <p>Trading loop is currently locked. Blocked event(s):</p>
                  <ul className="list-disc list-inside font-medium text-foreground">
                    {data.news.events.map((e, idx) => (
                      <li key={idx}>{e.title}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : data.news.upcoming && data.news.upcoming.length > 0 ? (
            <div className="flex items-start gap-3 rounded-2xl border border-[oklch(0.78_0.16_70/0.3)] bg-[oklch(0.78_0.16_70/0.06)] px-5 py-4">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.16_70/0.15)]">
                <AlertTriangle className="h-4 w-4 text-[oklch(0.82_0.16_70)]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[oklch(0.88_0.12_75)]">
                  Upcoming High-Impact News (Next 24h)
                </p>
                <div className="mt-1 space-y-1.5 text-xs text-muted-foreground">
                  {data.news.upcoming.map((e, idx) => {
                    const minutesLeft = Math.round(e.time_diff_seconds / 60);
                    const hoursLeft = (minutesLeft / 60).toFixed(1);
                    const timeStr = minutesLeft < 60 ? `${minutesLeft} min` : `${hoursLeft} hours`;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between border-b border-border/40 pb-1 last:border-0 last:pb-0"
                      >
                        <span>{e.title}</span>
                        <span className="font-mono-num font-semibold text-foreground">
                          in {timeStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-[oklch(0.78_0.18_155/0.3)] bg-[oklch(0.78_0.18_155/0.06)] px-5 py-4">
              <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.18_155/0.15)]">
                <ShieldCheck className="h-4 w-4 text-[oklch(0.78_0.18_155)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[oklch(0.78_0.18_155)]">
                  News Protection System Active
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  No high-impact USD economic events detected near the current time. Safety filters
                  are armed.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-[oklch(0.78_0.16_70/0.3)] bg-[oklch(0.78_0.16_70/0.06)] px-5 py-4">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.16_70/0.15)]">
              <AlertTriangle className="h-4 w-4 text-[oklch(0.82_0.16_70)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[oklch(0.88_0.12_75)]">
                News blackout status unavailable
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Economic calendar feeds could not be retrieved from the server cache.
              </p>
            </div>
          </div>
        )}

        {(apiError || capError || optionalErrors.length > 0) && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" />
              Dashboard data notice
            </div>
            {apiError && <p className="mt-2">API connection error: {apiError}</p>}
            {capError && <p className="mt-2">Capabilities error: {capError}</p>}
            {optionalErrors.map((err) => (
              <p key={err} className="mt-1 text-amber-200/85">
                {err}
              </p>
            ))}
          </div>
        )}

        {!data && !apiError && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-border/70 bg-surface/50 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-gold" />
            Waiting for backend
          </div>
        )}

        {tab === "dashboard" ? (
          <>
            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <MetricCard
                icon={Wallet}
                label="Balance"
                value={formatNullableCurrency(stats?.balance)}
                tone="gold"
                hint={
                  freeMargin == null
                    ? "Free margin unavailable"
                    : `Free ${formatCurrency(freeMargin)}`
                }
              />
              <MetricCard
                icon={Gauge}
                label="Equity"
                value={formatNullableCurrency(stats?.equity)}
              />
              <MetricCard
                icon={TrendingUp}
                label="Daily P/L"
                value={formatSigned(stats?.daily_pnl ?? 0)}
                tone={(stats?.daily_pnl ?? 0) >= 0 ? "success" : "danger"}
              />
              <MetricCard
                icon={LineChartIcon}
                label="Floating P/L"
                value={formatSigned(stats?.floating_pnl ?? 0)}
                tone={(stats?.floating_pnl ?? 0) >= 0 ? "success" : "danger"}
              />
              <MetricCard
                icon={TrendingDown}
                label="Drawdown"
                value={`${(stats?.drawdown_percent ?? 0).toFixed(2)}%`}
                tone="danger"
              />
              <MetricCard
                icon={Sparkles}
                label={`${symbol.toUpperCase()} Bid`}
                value={formatNullablePrice(market?.bid)}
                tone="gold"
                hint={`Ask ${formatNullablePrice(market?.ask)} · Spread ${(market?.spread ?? 0).toFixed(2)}`}
              />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Live chart */}
              <SectionCard
                numeral="I"
                title={`${symbol} Live Price Trace`}
                icon={LineChartIcon}
                className="lg:col-span-2"
                right={
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono-num text-xl font-semibold ${priceDelta >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`}
                    >
                      {formatNullablePrice(market?.bid)}
                    </span>
                    <span className="font-mono-num text-xs text-muted-foreground">
                      {priceDelta >= 0 ? "+" : ""}
                      {priceDelta.toFixed(3)}% polling window
                    </span>
                  </div>
                }
              >
                <div className="relative h-[260px] overflow-hidden rounded-xl border border-border/60 bg-background/40">
                  <div className="absolute right-3 top-3 z-10 rounded-md border border-border bg-background/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
                    Polling Trace
                  </div>
                  <PriceChart data={displayPriceHistory} />
                  <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-border bg-background/70 px-3 py-1.5 font-mono-num text-[11px] backdrop-blur">
                    <span className="text-muted-foreground">
                      Bid{" "}
                      <span className="text-foreground">{formatNullablePrice(market?.bid)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Ask{" "}
                      <span className="text-foreground">{formatNullablePrice(market?.ask)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Spread{" "}
                      <span className="text-foreground">{(market?.spread ?? 0).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              </SectionCard>

              {/* AI Signal */}
              <SectionCard
                numeral="II"
                title="AI Signal"
                icon={Cpu}
                right={
                  <span className="font-mono-num text-[11px] text-muted-foreground">
                    Updated {uiSignal.updatedAt}
                  </span>
                }
              >
                <div
                  className={`conic-ring relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${signalStyle.grad} to-transparent p-5`}
                >
                  <div className="relative z-[2] flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-background/40 ${signalStyle.color}`}
                      >
                        <signalStyle.Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div
                          className={`font-serif text-4xl font-medium tracking-tight ${signalStyle.color}`}
                        >
                          {uiSignal.action.toUpperCase() === "CLOSE" ? "CLOSE" : uiSignal.type}
                        </div>
                        <div className="text-xs text-muted-foreground">Recommended action</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-shine font-serif text-3xl font-medium">
                        <CountUp value={uiSignal.confidence} decimals={0} suffix="%" />
                      </div>
                      <div className="text-xs text-muted-foreground">confidence</div>
                    </div>
                  </div>
                  <div className="relative z-[2] mt-4 h-1.5 overflow-hidden rounded-full bg-background/50">
                    <div
                      className="h-full bg-gradient-gold shadow-gold transition-all duration-700"
                      style={{ width: `${uiSignal.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-border/70 bg-background/35 p-3">
                  <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <span>Decision Reason</span>
                    <span className="font-mono-num">{uiSignal.riskStatus}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-foreground/80">{uiSignal.reason}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[
                    { label: "Trend", value: uiSignal.trendScore },
                    { label: "Entry", value: uiSignal.entryScore },
                    { label: "Exit", value: uiSignal.exitScore },
                    { label: "Lot", value: uiSignal.suggestedLot, lot: true },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-border bg-background/40 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {item.label}
                      </div>
                      <div className="mt-1.5 font-mono-num text-base font-semibold">
                        {item.lot
                          ? item.value == null
                            ? "--"
                            : Number(item.value).toFixed(2)
                          : `${Number(item.value ?? 0).toFixed(0)}%`}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    {
                      label: "Entry",
                      value: formatNullablePrice(uiSignal.entry),
                      icon: CircleDot,
                      tone: "text-foreground",
                    },
                    {
                      label: "Stop Loss",
                      value: formatNullablePrice(uiSignal.stopLoss),
                      icon: TrendingDown,
                      tone: "text-[oklch(0.72_0.20_22)]",
                    },
                    {
                      label: "Take Profit",
                      value: formatNullablePrice(uiSignal.takeProfit),
                      icon: TrendingUp,
                      tone: "text-[oklch(0.78_0.18_155)]",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl border border-border bg-background/40 p-3"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <s.icon className="h-3 w-3" /> {s.label}
                      </div>
                      <div className={`mt-1.5 font-mono-num text-base font-semibold ${s.tone}`}>
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            {/* Second row: Positions + Quick Controls */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <SectionCard
                numeral="III"
                title="Open Positions"
                icon={Activity}
                className="lg:col-span-2"
                right={
                  <span className="rounded-full border border-border bg-background/50 px-2 py-0.5 font-mono-num text-xs text-muted-foreground">
                    {uiPositions.length}
                  </span>
                }
              >
                <div className="overflow-hidden rounded-xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {[
                          "Symbol",
                          "Side",
                          "Lots",
                          "Open",
                          "Current",
                          "SL",
                          "TP",
                          "P/L",
                          "Action",
                        ].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uiPositions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-12 text-center text-sm text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/40">
                                <Activity className="h-4 w-4 opacity-50" />
                              </div>
                              No open positions reported by the API.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        uiPositions.map((pos) => (
                          <tr key={pos.ticket} className="border-b border-border/40">
                            <td className="px-4 py-3 font-semibold">{pos.symbol}</td>
                            <td>
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${pos.side === "BUY" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}
                              >
                                {pos.side}
                              </span>
                            </td>
                            <td className="font-mono-num">{pos.lots.toFixed(2)}</td>
                            <td className="font-mono-num">{formatNullablePrice(pos.openPrice)}</td>
                            <td className="font-mono-num">
                              {formatNullablePrice(pos.currentPrice)}
                            </td>
                            <td className="font-mono-num text-red-300">
                              {formatNullablePrice(pos.stopLoss)}
                            </td>
                            <td className="font-mono-num text-emerald-300">
                              {formatNullablePrice(pos.takeProfit)}
                            </td>
                            <td
                              className={`font-mono-num font-semibold ${pos.pl >= 0 ? "text-emerald-300" : "text-red-300"}`}
                            >
                              {formatSigned(pos.pl)}
                            </td>
                            <td className="px-4 py-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg"
                                disabled={!capabilities.close_position.allowed}
                                onClick={() => void handleClosePosition(pos.ticket)}
                              >
                                Close
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard numeral="IV" title="Quick Controls" icon={Settings2}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Timeframe">
                    <Select
                      value={quickControls.timeframe}
                      onChange={(v) => setQuickControls((p) => ({ ...p, timeframe: v }))}
                      options={[
                        "M1 (1 Minute)",
                        "M5 (5 Minutes)",
                        "M15 (15 Minutes)",
                        "H1 (1 Hour)",
                      ]}
                      disabled
                    />
                  </Field>
                  <Field label="Trading Mode">
                    <Select
                      value={quickControls.tradingMode}
                      onChange={(v) => setQuickControls((p) => ({ ...p, tradingMode: v }))}
                      options={[
                        "Conservative (0.5 lot)",
                        "Standard (1 lot)",
                        "Aggressive (2 lots)",
                      ]}
                      disabled
                    />
                  </Field>
                  <Field label="AI Confidence (%)">
                    <Input
                      type="number"
                      min="20"
                      max="90"
                      value={quickControls.aiConfidence}
                      onChange={(e) => {
                        setQuickControls((p) => ({ ...p, aiConfidence: Number(e.target.value) }));
                        setSettingsDirty(true);
                      }}
                    />
                  </Field>
                  <Field label="Risk %">
                    <Input
                      type="number"
                      value={quickControls.riskPct}
                      disabled
                      title="Visible for template parity; backend save currently uses Risk per Trade (USD)."
                    />
                  </Field>
                  <Field label="Risk per Trade (USD)">
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={quickControls.riskUsd}
                      onChange={(e) => {
                        setQuickControls((p) => ({ ...p, riskUsd: Number(e.target.value) }));
                        setSettingsDirty(true);
                      }}
                    />
                  </Field>
                  <Field label="SL pips">
                    <Input
                      type="number"
                      min="1"
                      max="200"
                      value={quickControls.slPips}
                      onChange={(e) => {
                        setQuickControls((p) => ({ ...p, slPips: Number(e.target.value) }));
                        setSettingsDirty(true);
                      }}
                    />
                  </Field>
                  <Field label="TP pips">
                    <Input
                      type="number"
                      value={quickControls.tpPips}
                      disabled
                      title="Visible for template parity; backend save currently uses TP Ratio."
                    />
                  </Field>
                  <Field label="TP Ratio">
                    <Input
                      type="number"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={quickControls.tpRatio}
                      onChange={(e) => {
                        setQuickControls((p) => ({ ...p, tpRatio: Number(e.target.value) }));
                        setSettingsDirty(true);
                      }}
                    />
                  </Field>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold-soft text-[oklch(0.96_0.012_95)]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Risk Filters</div>
                        <div className="text-[11px] text-muted-foreground">
                          Daily risk, trend, trailing, and news guards
                        </div>
                      </div>
                    </div>
                    <Toggle on={quickControls.riskFiltersEnabled} onChange={() => {}} disabled />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-background/40 p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold-soft text-[oklch(0.96_0.012_95)]">
                        <RefreshCw className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Auto Refresh</div>
                        <div className="text-[11px] text-muted-foreground">
                          Frontend polling only; no trading action.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Toggle on={autoRefresh} onChange={setAutoRefresh} />
                      <Input
                        type="number"
                        min="2"
                        max="30"
                        value={refreshIntervalSeconds}
                        onChange={(e) => handleRefreshIntervalChange(Number(e.target.value))}
                        disabled={!autoRefresh}
                        className="w-14 text-center px-1"
                      />
                    </div>
                  </div>

                  <button
                    disabled={
                      !capabilities.save_settings.allowed || !settingsDirty || savingSettings
                    }
                    onClick={() => void saveSettings()}
                    className="group relative w-full overflow-hidden rounded-xl bg-gradient-gold p-px shadow-gold transition hover:shadow-[0_12px_40px_-8px_oklch(0.88_0.018_95/0.6)] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <div className="flex items-center justify-center gap-2 rounded-[11px] bg-background/20 px-4 py-2.5 text-sm font-semibold text-background backdrop-blur transition group-hover:bg-background/0">
                      {savingSettings ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save backend settings
                    </div>
                  </button>

                  {capData?.demo_canary_mode && (
                    <div className="col-span-2 mt-2 space-y-3 rounded-xl border border-[oklch(0.88_0.018_95/0.2)] bg-surface/40 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CircleDot className="h-4 w-4 text-gold animate-pulse" />
                          <span className="text-sm font-semibold text-[oklch(0.96_0.012_95)]">
                            Demo Canary Monitor
                          </span>
                        </div>
                        <span className="rounded-md border border-[oklch(0.88_0.018_95/0.3)] bg-[oklch(0.88_0.018_95/0.1)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-gold">
                          Active
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono-num">
                          <span className="text-muted-foreground">Session Orders:</span>
                          <span className="text-foreground font-semibold">
                            {capData.demo_canary_orders_used} / {capData.demo_canary_max_new_orders}{" "}
                            Max
                          </span>
                        </div>
                        <Progress
                          value={
                            (capData.demo_canary_orders_used / capData.demo_canary_max_new_orders) *
                            100
                          }
                          className="h-1.5 bg-black/40"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-num text-muted-foreground pt-1 border-t border-border/20">
                        <div>
                          Open limit:{" "}
                          <span className="text-foreground font-medium">
                            {capData.demo_canary_max_open_positions}
                          </span>
                        </div>
                        <div>
                          Auto-pause:{" "}
                          <span className="text-foreground font-medium">
                            {capData.demo_canary_auto_pause_after_first_order ? "ON" : "OFF"}
                          </span>
                        </div>
                        <div>
                          SL required:{" "}
                          <span className="text-foreground font-medium">
                            {capData.demo_canary_require_sl ? "YES" : "NO"}
                          </span>
                        </div>
                        <div>
                          TP required:{" "}
                          <span className="text-foreground font-medium">
                            {capData.demo_canary_require_tp ? "YES" : "NO"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleResetCanarySession}
                        disabled={!capabilities.reset_canary_session.allowed}
                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/50 py-2 text-xs font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                        title={capabilities.reset_canary_session.reason || undefined}
                      >
                        {capabilities.reset_canary_session.allowed ? (
                          <RefreshCw className="h-3 w-3 text-gold" />
                        ) : (
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        )}
                        Reset Canary Session
                      </button>
                    </div>
                  )}

                  <button
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60 transition disabled:cursor-not-allowed"
                    disabled
                  >
                    <Settings2 className="h-4 w-4" />
                    Advanced risk settings
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </SectionCard>
            </div>

            {/* Third row: Recent Trades + AI Model */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <SectionCard
                numeral="V"
                title="Recent Trades"
                icon={Activity}
                className="lg:col-span-2"
                right={
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTradeViewCleared(true);
                        toast.success(
                          "Recent Trades view cleared. Stored history was not modified.",
                        );
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                    >
                      <EyeOff className="size-3.5" /> Clear View
                    </button>
                    {capabilities.delete_stored_history.allowed ? (
                      <button
                        onClick={handleResetHistory}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[oklch(0.72_0.20_22/0.4)] bg-[oklch(0.72_0.20_22/0.12)] px-3 py-1.5 text-xs font-medium text-[oklch(0.72_0.20_22)] shadow-[0_4px_12px_-4px_oklch(0.72_0.20_22/0.4)] transition hover:bg-[oklch(0.72_0.20_22/0.2)]"
                      >
                        <PowerOff className="size-3.5" /> Reset History
                      </button>
                    ) : (
                      <button
                        disabled
                        title={
                          capabilities.delete_stored_history.reason ||
                          "Reset history is blocked by policy."
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/30 px-3 py-1.5 text-xs text-muted-foreground opacity-55 cursor-not-allowed"
                      >
                        <Lock className="size-3.5" /> Reset History
                      </button>
                    )}
                  </div>
                }
              >
                <div className="overflow-hidden rounded-xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {["Timestamp", "Action", "Lot", "Profit", "Prediction", "Status"].map(
                          (h) => (
                            <th key={h} className="px-4 py-3 text-left font-medium">
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTrades.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-12 text-center text-sm text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/40">
                                <Bot className="h-4 w-4 opacity-50" />
                              </div>
                              {tradeViewCleared
                                ? "View cleared. Stored trade history was not modified."
                                : "No recent trades reported by the API."}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        visibleTrades.map((t) => (
                          <tr key={t.id} className="border-b border-border/40">
                            <td className="px-4 py-3 font-mono-num text-muted-foreground">
                              {t.timestamp || "Unavailable"}
                            </td>
                            <td>
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${t.action?.toUpperCase().includes("BUY") ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`}
                              >
                                {t.action || "N/A"}
                              </span>
                            </td>
                            <td className="font-mono-num">
                              {t.lot == null ? "--" : t.lot.toFixed(2)}
                            </td>
                            <td
                              className={`font-mono-num font-semibold ${(t.profit ?? 0) >= 0 ? "text-emerald-300" : "text-red-300"}`}
                            >
                              {t.profit == null ? "--" : formatSigned(t.profit)}
                            </td>
                            <td className="font-mono-num">
                              {t.predictionProb == null
                                ? "--"
                                : `${(t.predictionProb * 100).toFixed(2)}%`}
                            </td>
                            <td className="text-muted-foreground">{t.status || "logged"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard numeral="VI" title="AI Model Retraining" icon={Sparkles}>
                <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/50 rounded-xl bg-background/25">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold shadow-gold mb-3 text-background">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Dedicated Retraining Workspace
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                    Model training, candidate evaluation, and decision pipeline diagnostics have
                    been promoted to a separate dedicated office.
                  </p>
                  <Link
                    to="/train"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-gradient-gold text-background font-semibold text-xs shadow-gold transition hover:opacity-90"
                  >
                    Open Retrainer Office <ChevronRight className="h-4.5 w-4.5" />
                  </Link>
                </div>
              </SectionCard>
            </div>
          </>
        ) : tab === "performance" ? (
          <div className="space-y-6 animate-in fade-in-50 duration-350">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <MetricCard
                icon={Wallet}
                label="Total Return"
                value={performance ? formatSigned(performance.summary?.net_profit ?? 0) : "$0.00"}
                tone={
                  performance && (performance.summary?.net_profit ?? 0) >= 0 ? "success" : "danger"
                }
                hint={
                  performance
                    ? `Best: ${formatSigned(performance.summary?.best_trade ?? 0)}`
                    : "Best: $0.00"
                }
              />
              <MetricCard
                icon={ShieldCheck}
                label="Win Rate"
                value={performance ? `${(performance.summary?.win_rate ?? 0).toFixed(1)}%` : "0.0%"}
                tone="gold"
                hint={
                  performance
                    ? `W:${performance.summary?.winning_trades ?? 0} L:${performance.summary?.losing_trades ?? 0} B:${performance.summary?.breakeven_trades ?? 0}`
                    : "W:0 L:0 B:0"
                }
              />
              <MetricCard
                icon={Gauge}
                label="Profit Factor"
                value={
                  performance?.risk_metrics?.profit_factor != null
                    ? performance.risk_metrics.profit_factor.toFixed(2)
                    : "0.00"
                }
                hint={
                  performance
                    ? `Payoff: ${performance.risk_metrics?.payoff_ratio?.toFixed(2) ?? "0.00"}`
                    : "Payoff: 0.00"
                }
              />
              <MetricCard
                icon={Activity}
                label="Total Trades"
                value={performance ? String(performance.summary?.total_trades ?? 0) : "0"}
                hint={
                  performance
                    ? `Avg: ${formatSigned(performance.summary?.average_profit ?? 0)}`
                    : "Avg: $0.00"
                }
              />
              <MetricCard
                icon={TrendingUp}
                label="Expectancy"
                value={
                  performance ? formatSigned(performance.risk_metrics?.expectancy ?? 0) : "$0.00"
                }
                tone={
                  performance && (performance.risk_metrics?.expectancy ?? 0) >= 0
                    ? "success"
                    : "danger"
                }
                hint="Per trade estimate"
              />
              <MetricCard
                icon={TrendingDown}
                label="Max Drawdown"
                value={
                  performance
                    ? `${(performance.risk_metrics?.max_drawdown ?? 0).toFixed(2)}%`
                    : "0.00%"
                }
                tone="danger"
                hint={
                  performance
                    ? `Recovery: ${performance.risk_metrics?.recovery_factor?.toFixed(2) ?? "0.00"}`
                    : "Recovery: 0.00"
                }
              />
            </div>

            {/* Chart & Period grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Equity chart */}
              <SectionCard
                numeral="I"
                title="Equity Curve Evolution"
                icon={LineChartIcon}
                className="lg:col-span-2"
                right={
                  <div className="text-right">
                    <span className="font-mono-num text-[11px] text-muted-foreground">
                      Cumulative P&L Progress
                    </span>
                  </div>
                }
              >
                <div className="relative h-[280px] overflow-hidden rounded-xl border border-border/60 bg-background/40 p-2">
                  <div className="absolute right-3 top-3 z-10 rounded-md border border-border bg-background/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
                    Equity Curve
                  </div>
                  <PerformanceChart
                    equityData={performance?.equity_curve ?? []}
                    balanceData={performance?.balance_curve ?? []}
                  />
                </div>
              </SectionCard>

              {/* Period PNL & Streaks */}
              <SectionCard numeral="II" title="Period Metrics" icon={Settings2}>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
                      P&L Breakdown
                    </h3>
                    <div className="space-y-2.5">
                      {[
                        { label: "Today P&L", value: performance?.time_breakdowns?.today_pnl ?? 0 },
                        {
                          label: "Weekly P&L",
                          value: performance?.time_breakdowns?.weekly_pnl ?? 0,
                        },
                        {
                          label: "Monthly P&L",
                          value: performance?.time_breakdowns?.monthly_pnl ?? 0,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0"
                        >
                          <span className="text-muted-foreground">{item.label}</span>
                          <span
                            className={`font-mono-num font-semibold ${item.value >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`}
                          >
                            {formatSigned(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/40 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3">
                      Streaks & Series
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Current Win Streak
                        </div>
                        <div className="mt-1 font-mono-num font-semibold text-[oklch(0.78_0.18_155)]">
                          {performance?.streaks?.consecutive_wins ?? 0} trades
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Max Win Streak
                        </div>
                        <div className="mt-1 font-mono-num font-semibold text-[oklch(0.78_0.18_155)]">
                          {performance?.streaks?.max_consecutive_wins ?? 0} trades
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Current Loss Streak
                        </div>
                        <div className="mt-1 font-mono-num font-semibold text-[oklch(0.72_0.20_22)]">
                          {performance?.streaks?.consecutive_losses ?? 0} trades
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          Max Loss Streak
                        </div>
                        <div className="mt-1 font-mono-num font-semibold text-[oklch(0.72_0.20_22)]">
                          {performance?.streaks?.max_consecutive_losses ?? 0} trades
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Breakdowns Row */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Side Breakdown */}
              <SectionCard numeral="III" title="Directional Breakdown" icon={Sparkles}>
                <div className="overflow-hidden rounded-xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <th className="px-4 py-3 text-left font-medium">Side</th>
                        <th className="px-4 py-3 text-left font-medium">Trades</th>
                        <th className="px-4 py-3 text-left font-medium">Win Rate</th>
                        <th className="px-4 py-3 text-right font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!performance?.side_breakdown || performance.side_breakdown.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-muted-foreground text-xs"
                          >
                            No directional data.
                          </td>
                        </tr>
                      ) : (
                        performance.side_breakdown.map((row) => (
                          <tr key={row.side} className="border-b border-border/40 last:border-0">
                            <td className="px-4 py-3 font-semibold">{row.side}</td>
                            <td className="px-4 py-3 font-mono-num">{row.trades}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono-num">{row.win_rate.toFixed(1)}%</span>
                                <div className="h-1.5 w-16 bg-background/50 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-gold"
                                    style={{ width: `${row.win_rate}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-mono-num font-semibold ${row.pnl >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`}
                            >
                              {formatSigned(row.pnl)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* Symbol Breakdown */}
              <SectionCard numeral="IV" title="Symbol Breakdown" icon={Cpu}>
                <div className="overflow-hidden rounded-xl border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        <th className="px-4 py-3 text-left font-medium">Symbol</th>
                        <th className="px-4 py-3 text-left font-medium">Trades</th>
                        <th className="px-4 py-3 text-left font-medium">Win Rate</th>
                        <th className="px-4 py-3 text-right font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!performance?.symbol_breakdown ||
                      performance.symbol_breakdown.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-muted-foreground text-xs"
                          >
                            No symbol breakdown data.
                          </td>
                        </tr>
                      ) : (
                        performance.symbol_breakdown.map((row) => (
                          <tr key={row.symbol} className="border-b border-border/40 last:border-0">
                            <td className="px-4 py-3 font-semibold">{row.symbol}</td>
                            <td className="px-4 py-3 font-mono-num">{row.trades}</td>
                            <td className="px-4 py-3 font-mono-num">{row.win_rate.toFixed(1)}%</td>
                            <td
                              className={`px-4 py-3 text-right font-mono-num font-semibold ${row.pnl >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`}
                            >
                              {formatSigned(row.pnl)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in-50 duration-350">
            <SectionCard
              numeral="I"
              title="Live Trading Engine Log Console"
              icon={Bot}
              right={
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-[11px] text-muted-foreground">
                    Source: <span className="text-foreground">{logsData?.source || "unknown"}</span>
                  </span>
                  <span className="font-mono-num text-[11px] text-muted-foreground">
                    Path: <span className="text-foreground">{logsData?.path || "unavailable"}</span>
                  </span>
                  <button
                    onClick={() => void fetchData()}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition hover:text-[oklch(0.96_0.012_95)]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              }
            >
              <div className="rounded-xl border border-border/80 bg-black/60 p-4 shadow-inner">
                <div className="font-mono text-xs overflow-auto h-[550px] space-y-1.5 scrollbar-thin select-text">
                  {!logsData?.logs || logsData.logs.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground py-20">
                      No engine logs reported. Wait for bot activity or check MT5 status.
                    </div>
                  ) : (
                    logsData.logs.map((line, idx) => {
                      let color = "text-muted-foreground";
                      if (
                        line.includes("ERROR") ||
                        line.includes("FAILED") ||
                        line.includes("Exception")
                      ) {
                        color = "text-[oklch(0.72_0.20_22)] font-semibold";
                      } else if (line.includes("WARNING") || line.includes("WARN")) {
                        color = "text-amber-300 font-semibold";
                      } else if (
                        line.includes("SUCCESS") ||
                        line.includes("CONNECTED") ||
                        line.includes("Loaded")
                      ) {
                        color = "text-[oklch(0.78_0.18_155)]";
                      } else if (
                        line.includes("BUY") ||
                        line.includes("SELL") ||
                        line.includes("Signal")
                      ) {
                        color = "text-sky-300 font-medium";
                      } else if (line.includes("AUDIT") || line.includes("action")) {
                        color = "text-pink-300";
                      }
                      return (
                        <div
                          key={idx}
                          className={`${color} whitespace-pre-wrap leading-relaxed border-l-2 border-transparent pl-2 hover:border-border hover:bg-white/5`}
                        >
                          {line}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        <footer className="flex items-center justify-between pb-6 pt-2 text-[11px] text-muted-foreground font-mono">
          <span>© Aurum AI · Institutional Trading Terminal</span>
          <span className="font-mono-num">premium UI integrated with /api/v1</span>
        </footer>
      </main>

      {/* Emergency Confirmation dialog */}
      <AlertDialog open={closeAllDialogOpen} onOpenChange={setCloseAllDialogOpen}>
        <AlertDialogContent className="glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm emergency close-all</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This queues a backend emergency command to pause automation and close all open
              positions. It will only run if the backend capability gate still allows it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={closeAllPending}
              className="bg-background/40 hover:bg-background/80"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={closeAllPending || !capabilities.close_all.allowed}
              onClick={() => void handleEmergencyCloseAll()}
              className="bg-[oklch(0.72_0.20_22)] hover:bg-[oklch(0.72_0.20_22/0.8)] text-white"
            >
              {closeAllPending ? "Queuing..." : "Confirm Close All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Promote Candidate dialog */}
      <AlertDialog
        open={Boolean(promoteTarget)}
        onOpenChange={(open) => !open && setPromoteTarget(null)}
      >
        <AlertDialogContent className="glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Promote candidate model?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This replaces the active champion model with the selected candidate model (
              {promoteTarget?.run_id}). This action is final and will only run if the capability
              gate allows it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={promoting}
              className="bg-background/40 hover:bg-background/80"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={promoting || !capabilities.model_promotion.allowed}
              onClick={() => void promoteCandidate()}
              className="bg-gradient-gold hover:opacity-90 text-background font-semibold"
            >
              {promoting ? "Promoting..." : "Promote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
