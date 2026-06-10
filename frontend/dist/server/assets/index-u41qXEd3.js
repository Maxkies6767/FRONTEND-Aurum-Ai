import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ChevronDown, Check, ChevronUp, MinusCircle, TrendingDown, TrendingUp, Crown, Cpu, Bot, Activity, ShieldCheck, Loader2, Pause, Play, PowerOff, AlertTriangle, Wallet, Gauge, LineChart, Sparkles, CircleDot, Settings2, RefreshCw, Save, Lock, ChevronRight, EyeOff, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { c as cn, u as useCapabilities, A as API_V1_BASE, f as formatCurrency, a as formatSigned, B as Button, P as Progress, b as AlertDialog, d as AlertDialogContent, e as AlertDialogHeader, g as AlertDialogTitle, h as AlertDialogDescription, i as AlertDialogFooter, j as AlertDialogCancel, k as AlertDialogAction, l as formatPrice } from "./router-BERX1bTV.js";
import * as SelectPrimitive from "@radix-ui/react-select";
import "@tanstack/react-query";
import "@radix-ui/react-alert-dialog";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-progress";
const Select$1 = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const DEFAULT_SYMBOL = "XAUUSDm";
const DEFAULT_REFRESH_INTERVAL = 5;
const DEFAULT_QUICK_CONTROLS = {
  timeframe: "M5 (5 Minutes)",
  tradingMode: "Standard (1 lot)",
  aiConfidence: 30,
  riskPct: 1.5,
  riskUsd: 50,
  slPips: 15,
  tpPips: 30,
  tpRatio: 2,
  riskFiltersEnabled: true
};
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const sleep = (ms) => new Promise((r) => window.setTimeout(r, ms));
function numberOrNull(value) {
  if (value === null || value === void 0 || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function getErrorMessage(error) {
  return error instanceof Error ? error.message : "Request failed";
}
function normalizeSignalType(value) {
  const normalized = value?.toUpperCase();
  if (normalized === "BUY" || normalized === "SELL") return normalized;
  return "HOLD";
}
function normalizePositionSide(value) {
  if (!value) return "UNKNOWN";
  const normalized = value.toUpperCase();
  if (normalized.includes("BUY")) return "BUY";
  if (normalized.includes("SELL")) return "SELL";
  return "UNKNOWN";
}
function normalizeConfidence(value) {
  if (value === void 0 || !Number.isFinite(value)) return 0;
  return clamp(value <= 1 ? value * 100 : value, 0, 100);
}
function normalizeTrade(record, index) {
  const rawPrediction = numberOrNull(record.prediction_prob ?? record.predictionProb);
  const predictionProb = rawPrediction == null ? null : rawPrediction > 1 ? rawPrediction / 100 : rawPrediction;
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
    status: record.status ?? (profit == null ? "" : `P/L ${formatSigned(profit)}`)
  };
}
function formatNullableCurrency(value) {
  return value == null || !Number.isFinite(value) ? "Unavailable" : formatCurrency(value);
}
function formatNullablePrice(value) {
  return value == null || !Number.isFinite(value) || value <= 0 ? "Unavailable" : formatPrice(value);
}
function formatTimeframeLabel(value) {
  if (!value) return DEFAULT_QUICK_CONTROLS.timeframe;
  if (value.includes("(")) return value;
  const map = {
    M1: "M1 (1 Minute)",
    M5: "M5 (5 Minutes)",
    M15: "M15 (15 Minutes)",
    H1: "H1 (1 Hour)"
  };
  return map[value.toUpperCase()] ?? value;
}
function newIdempotencyKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}
function Spotlight({
  children,
  className = ""
}) {
  const ref = useRef(null);
  return /* @__PURE__ */ jsx("div", { ref, onMouseMove: (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, className: `spotlight ${className}`, children });
}
function Tilt({
  children,
  className = "",
  max = 6
}) {
  const ref = useRef(null);
  return /* @__PURE__ */ jsx("div", { ref, onMouseMove: (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
  }, onMouseLeave: () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateY(0) rotateX(0)";
  }, style: {
    transition: "transform 350ms cubic-bezier(.2,.8,.2,1)",
    transformStyle: "preserve-3d"
  }, className, children });
}
function CountUp({
  value,
  decimals = 2,
  prefix = "",
  suffix = "",
  duration = 1100
}) {
  const [n, setN] = useState(0);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  useEffect(() => {
    fromRef.current = n;
    startRef.current = null;
    let raf = 0;
    const step = (t) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(fromRef.current + (value - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    prefix,
    n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }),
    suffix
  ] });
}
function StatusPill({
  tone,
  label,
  active = true,
  icon: _Icon
}) {
  const map = {
    success: "text-[oklch(0.78_0.18_155)] bg-[oklch(0.74_0.18_155/0.08)] border-[oklch(0.74_0.18_155/0.25)]",
    danger: "text-[oklch(0.72_0.20_22)] bg-[oklch(0.66_0.22_22/0.08)] border-[oklch(0.66_0.22_22/0.25)]",
    gold: "text-[oklch(0.96_0.012_95)] bg-[oklch(0.88_0.018_95/0.08)] border-[oklch(0.88_0.018_95/0.25)]",
    info: "text-sky-300 bg-sky-400/5 border-sky-400/20",
    muted: "text-muted-foreground bg-background/45 border-border"
  }[tone];
  return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${map}`, children: [
    /* @__PURE__ */ jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
      active && /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" }),
      /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-current" })
    ] }),
    label
  ] });
}
function Ticker({
  symbol,
  bid,
  ask,
  spread,
  mt5Online,
  feeds
}) {
  const tickerSymbol = symbol.toUpperCase().startsWith("XAU") ? "XAU/USD" : symbol;
  const items = [{
    sym: tickerSymbol,
    px: formatNullablePrice(bid),
    chg: mt5Online ? "live" : "offline",
    up: mt5Online
  }, {
    sym: `${symbol} Ask`,
    px: formatNullablePrice(ask),
    chg: `Spread ${(spread ?? 0).toFixed(2)}`,
    up: true
  }, ...["DXY", "US10Y", "BTC/USD", "SPX", "WTI", "EUR/USD", "VIX"].map((key) => {
    const feed = feeds?.[key];
    return {
      sym: key,
      px: feed?.price ?? "Unavailable",
      chg: feed?.change ?? "no endpoint",
      up: feed ? feed.up : false
    };
  })];
  const row = /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-10 px-6", children: items.map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 whitespace-nowrap font-mono-num text-[11px]", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: item.sym }),
    /* @__PURE__ */ jsx("span", { className: "text-foreground", children: item.px }),
    /* @__PURE__ */ jsx("span", { className: item.up ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]", children: item.chg }),
    /* @__PURE__ */ jsx("span", { className: "text-border", children: "·" })
  ] }, `${item.sym}-${i}`)) });
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden border-b border-border/60 bg-background/60 py-2 backdrop-blur-xl", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" }),
    /* @__PURE__ */ jsxs("div", { className: "ticker-track", children: [
      row,
      row
    ] })
  ] });
}
function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default"
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-[oklch(0.78_0.18_155)]",
    danger: "text-[oklch(0.72_0.20_22)]",
    gold: "text-gradient-gold"
  }[tone];
  const iconClass = {
    default: "bg-muted text-muted-foreground",
    success: "bg-[oklch(0.74_0.18_155/0.12)] text-[oklch(0.78_0.18_155)]",
    danger: "bg-[oklch(0.66_0.22_22/0.12)] text-[oklch(0.72_0.20_22)]",
    gold: "bg-gradient-gold-soft text-[oklch(0.96_0.012_95)]"
  }[tone];
  return /* @__PURE__ */ jsx(Tilt, { max: 5, children: /* @__PURE__ */ jsxs(Spotlight, { className: "group relative overflow-hidden rounded-2xl border border-border bg-gradient-surface p-5 shadow-elegant transition hover:border-[oklch(0.58_0.055_295/0.55)]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.055_300/0.45)] to-transparent opacity-0 transition group-hover:opacity-100" }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-[2] flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: `flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground", children: label })
    ] }),
    /* @__PURE__ */ jsx("div", { className: `relative z-[2] mt-4 font-serif text-3xl font-medium tracking-tight ${toneClass}`, children: value }),
    hint && /* @__PURE__ */ jsx("div", { className: "relative z-[2] mt-1 font-mono-num text-xs text-muted-foreground", children: hint })
  ] }) });
}
function SectionCard({
  title,
  icon: Icon,
  right,
  children,
  className = "",
  numeral
}) {
  return /* @__PURE__ */ jsx(Spotlight, { className: `corner-ornaments foil-grain sheen-sweep border-trace relative overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant ${className}`, children: /* @__PURE__ */ jsxs("section", { className: "relative", children: [
    /* @__PURE__ */ jsxs("header", { className: "relative z-[2] flex items-center justify-between border-b border-border/60 px-5 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
        numeral && /* @__PURE__ */ jsx("span", { className: "numeral-tag", children: numeral }),
        Icon && /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-gold-soft text-[oklch(0.96_0.012_95)] ring-1 ring-[oklch(0.92_0.05_310/0.25)]", children: /* @__PURE__ */ jsx(Icon, { className: "h-3.5 w-3.5" }) }),
        /* @__PURE__ */ jsx("h2", { className: "font-serif text-[15px] font-medium tracking-tight text-foil", children: title }),
        /* @__PURE__ */ jsx("span", { className: "hidden h-3 w-px bg-border md:inline-block" }),
        /* @__PURE__ */ jsx("span", { className: "hidden font-mono-num text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:inline", children: "Maison · MMXXVI" })
      ] }),
      right
    ] }),
    /* @__PURE__ */ jsx("div", { className: "relative z-[2] p-5", children })
  ] }) });
}
function Toggle({
  on,
  onChange,
  disabled = false
}) {
  return /* @__PURE__ */ jsx("button", { type: "button", disabled, onClick: () => onChange(!on), className: `relative inline-flex h-6 w-11 items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-[oklch(0.88_0.018_95/0.4)] bg-gradient-gold shadow-gold" : "border-border bg-muted"}`, children: /* @__PURE__ */ jsx("span", { className: `inline-block h-4 w-4 transform rounded-full bg-background shadow-md transition ${on ? "translate-x-6" : "translate-x-1"}` }) });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxs("label", { className: "flex flex-col gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: label }),
    children
  ] });
}
function Input(props) {
  return /* @__PURE__ */ jsx("input", { ...props, className: `h-9 rounded-lg border border-border bg-background/60 px-3 font-mono-num text-sm text-foreground outline-none transition disabled:cursor-not-allowed disabled:opacity-55 focus:border-[oklch(0.88_0.018_95/0.5)] focus:ring-2 focus:ring-[oklch(0.88_0.018_95/0.15)] ${props.className ?? ""}` });
}
function Select({
  value,
  onChange,
  options,
  disabled = false
}) {
  return /* @__PURE__ */ jsxs(Select$1, { value, onValueChange: onChange, disabled, children: [
    /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground shadow-none transition hover:border-[oklch(0.84_0.08_305/0.45)] focus:border-[oklch(0.84_0.08_305/0.55)] focus:ring-2 focus:ring-[oklch(0.84_0.08_305/0.15)] data-[state=open]:border-[oklch(0.84_0.08_305/0.55)]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
    /* @__PURE__ */ jsx(SelectContent, { className: "glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] backdrop-blur-xl text-foreground shadow-[0_24px_60px_-20px_oklch(0_0_0/0.7),0_0_0_1px_oklch(0.84_0.08_305/0.12)]", children: options.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o, className: "cursor-pointer rounded-md text-sm text-foreground/85 transition focus:bg-[oklch(0.84_0.08_305/0.14)] focus:text-foreground data-[state=checked]:bg-[oklch(0.84_0.08_305/0.18)] data-[state=checked]:text-foreground", children: o }, o)) })
  ] });
}
function PriceChart({
  data
}) {
  if (data.length < 1) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-sm text-muted-foreground", children: "No price data" });
  }
  const chartData = data.length === 1 ? [data[0], data[0]] : data;
  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const w = 800;
  const h = 220;
  const pad = 8;
  const pts = chartData.map((v, i) => {
    const x = i / (chartData.length - 1) * (w - pad * 2) + pad;
    const y = h - pad - (v - min) / (max - min || 1) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`).join(" ");
  const area = `${d} L${w - pad},${h} L${pad},${h} Z`;
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${w} ${h}`, className: "h-full w-full", children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: "goldFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.88 0.018 95)", stopOpacity: "0.35" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.88 0.018 95)", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "goldStroke", x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.72 0.015 90)" }),
        /* @__PURE__ */ jsx("stop", { offset: "50%", stopColor: "oklch(0.96 0.012 95)" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.72 0.015 90)" })
      ] })
    ] }),
    [0.25, 0.5, 0.75].map((g) => /* @__PURE__ */ jsx("line", { x1: 0, x2: w, y1: h * g, y2: h * g, stroke: "oklch(1 0 0 / 0.04)", strokeDasharray: "2 4" }, g)),
    /* @__PURE__ */ jsx("path", { d: area, fill: "url(#goldFill)" }),
    /* @__PURE__ */ jsx("path", { d, fill: "none", stroke: "url(#goldStroke)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }),
    pts.length > 0 && /* @__PURE__ */ jsx("circle", { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 4, fill: "oklch(0.96 0.012 95)", children: /* @__PURE__ */ jsx("animate", { attributeName: "r", values: "4;7;4", dur: "1.8s", repeatCount: "indefinite" }) })
  ] });
}
function PerformanceChart({
  equityData,
  balanceData
}) {
  if (equityData.length < 1) {
    return /* @__PURE__ */ jsx("div", { className: "flex h-48 items-center justify-center text-sm text-muted-foreground", children: "No performance curve data available. Run some trades first." });
  }
  const values = equityData.map((d2) => d2.equity);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 10);
  const w = 800;
  const h = 260;
  const pad = 12;
  const pts = values.map((v, i) => {
    const x = i / (values.length - 1 || 1) * (w - pad * 2) + pad;
    const y = h - pad - (v - min) / (max - min || 1) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`).join(" ");
  const area = `${d} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  return /* @__PURE__ */ jsxs("svg", { viewBox: `0 0 ${w} ${h}`, className: "h-full w-full", children: [
    /* @__PURE__ */ jsxs("defs", { children: [
      /* @__PURE__ */ jsxs("linearGradient", { id: "perfFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.88 0.018 95)", stopOpacity: "0.25" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.88 0.018 95)", stopOpacity: "0" })
      ] }),
      /* @__PURE__ */ jsxs("linearGradient", { id: "perfStroke", x1: "0", y1: "0", x2: "1", y2: "0", children: [
        /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: "oklch(0.72 0.015 90)" }),
        /* @__PURE__ */ jsx("stop", { offset: "50%", stopColor: "oklch(0.96 0.012 95)" }),
        /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "oklch(0.72 0.015 90)" })
      ] })
    ] }),
    [0.25, 0.5, 0.75].map((g) => /* @__PURE__ */ jsx("line", { x1: 0, x2: w, y1: h * g, y2: h * g, stroke: "oklch(1 0 0 / 0.04)", strokeDasharray: "2 4" }, g)),
    min < 0 && /* @__PURE__ */ jsx("line", { x1: 0, x2: w, y1: h - pad - (0 - min) / (max - min) * (h - pad * 2), y2: h - pad - (0 - min) / (max - min) * (h - pad * 2), stroke: "oklch(0.72 0.20 22 / 0.25)", strokeWidth: 1, strokeDasharray: "4 4" }),
    /* @__PURE__ */ jsx("path", { d: area, fill: "url(#perfFill)" }),
    /* @__PURE__ */ jsx("path", { d, fill: "none", stroke: "url(#perfStroke)", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" }),
    pts.length > 0 && /* @__PURE__ */ jsx("circle", { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 5, fill: "oklch(0.96 0.012 95)", children: /* @__PURE__ */ jsx("animate", { attributeName: "r", values: "5;8;5", dur: "2s", repeatCount: "indefinite" }) })
  ] });
}
function Dashboard() {
  const prevPositionsRef = useRef([]);
  const initializedRef = useRef(false);
  const [data, setData] = useState(null);
  const [trades, setTrades] = useState([]);
  const [modelStatus, setModelStatus] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [logsData, setLogsData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [optionalErrors, setOptionalErrors] = useState([]);
  const [tab, setTab] = useState(() => {
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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState(DEFAULT_REFRESH_INTERVAL);
  const [quickControls, setQuickControls] = useState(DEFAULT_QUICK_CONTROLS);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [tradeViewCleared, setTradeViewCleared] = useState(false);
  const [closeAllPending, setCloseAllPending] = useState(false);
  const [closeAllDialogOpen, setCloseAllDialogOpen] = useState(false);
  const [trainingCandles, setTrainingCandles] = useState(2e4);
  const [trainTrendThreshold, setTrainTrendThreshold] = useState(0.55);
  const [trainEntryThreshold, setTrainEntryThreshold] = useState(0.55);
  const [trainRiskThreshold, setTrainRiskThreshold] = useState(0.55);
  const [trainMinConfidence, setTrainMinConfidence] = useState(20);
  const [trainMaxSpread, setTrainMaxSpread] = useState(5);
  const [trainDebugMode, setTrainDebugMode] = useState(false);
  const [trainingPending, setTrainingPending] = useState(false);
  const [trainingJobId, setTrainingJobId] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingState, setTrainingState] = useState(null);
  const [trainingError, setTrainingError] = useState(null);
  const [promoteTarget, setPromoteTarget] = useState(null);
  const [promoting, setPromoting] = useState(false);
  const [rejectingCandidate, setRejectingCandidate] = useState(false);
  const {
    capData,
    capError,
    capabilities,
    refreshCapabilities
  } = useCapabilities(autoRefresh, refreshIntervalSeconds);
  const fetchData = useCallback(async () => {
    const secondaryErrors = [];
    try {
      const statusRes = await fetch(`${API_V1_BASE}/status`);
      if (!statusRes.ok) throw new Error(`/status returned ${statusRes.status}`);
      const statusJson = await statusRes.json();
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
      const [tradesResult, settingsResult, modelResult, performanceResult, logsResult] = await Promise.allSettled([fetch(`${API_V1_BASE}/trades?limit=15`), fetch(`${API_V1_BASE}/settings`), fetch(`${API_V1_BASE}/model/status`), fetch(`${API_V1_BASE}/performance`), fetch(`${API_V1_BASE}/logs?lines=150`)]);
      if (tradesResult.status === "fulfilled" && tradesResult.value.ok) {
        const tradesJson = await tradesResult.value.json();
        setTrades(tradesJson.trades.map(normalizeTrade));
      } else {
        secondaryErrors.push("Recent trades unavailable");
      }
      if (settingsResult.status === "fulfilled" && settingsResult.value.ok) {
        const settingsJson = await settingsResult.value.json();
        if (!settingsDirty) {
          setQuickControls((previous) => ({
            ...previous,
            timeframe: formatTimeframeLabel(statusJson.status?.timeframe || previous.timeframe),
            aiConfidence: settingsJson.settings.confidence_threshold,
            riskUsd: settingsJson.settings.risk_per_trade_usd,
            slPips: settingsJson.settings.sl_pips,
            tpRatio: settingsJson.settings.tp_ratio
          }));
        }
      } else {
        secondaryErrors.push("Settings unavailable");
      }
      if (modelResult.status === "fulfilled" && modelResult.value.ok) {
        const modelJson = await modelResult.value.json();
        setModelStatus(modelJson);
        if (modelJson.training_in_progress && modelJson.current_job_id) {
          setTrainingJobId(modelJson.current_job_id);
        }
      } else {
        secondaryErrors.push("AI model status unavailable");
      }
      if (performanceResult.status === "fulfilled" && performanceResult.value.ok) {
        const perfJson = await performanceResult.value.json();
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
  useEffect(() => {
    void fetchData();
    if (!autoRefresh) return void 0;
    const interval = window.setInterval(() => void fetchData(), refreshIntervalSeconds * 1e3);
    return () => window.clearInterval(interval);
  }, [autoRefresh, fetchData, refreshIntervalSeconds]);
  useEffect(() => {
    if (!trainingJobId) return void 0;
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
          setTrainingError(payload.state === "failed" ? payload.error || "Model training failed." : null);
          if (payload.state === "completed") {
            toast.success("Candidate Model Training Complete!", {
              description: `Job ${trainingJobId} finished successfully. Review the candidate in AI Model Management before promoting.`,
              duration: 7e3
            });
          } else {
            toast.error("Model Training Failed", {
              description: payload.error || "Check Service Logs for details.",
              duration: 9e3
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
    trendScore: normalizeConfidence(signal?.trend_score ?? void 0),
    entryScore: normalizeConfidence(signal?.entry_score ?? void 0),
    exitScore: normalizeConfidence(signal?.exit_score ?? void 0),
    riskStatus: signal?.risk_status ?? "UNKNOWN",
    trendModel: signal?.trend_model_score ?? null,
    entryModel: signal?.entry_model_score ?? null,
    exitModel: signal?.exit_model_score ?? null,
    modelVersion: signal?.model_version ?? "legacy-xgboost",
    updatedAt: signal?.timestamp ? new Date(signal.timestamp).toLocaleTimeString() : "Unavailable"
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
    comment: position.comment
  }));
  const displayPriceHistory = priceHistory.length > 0 ? priceHistory : market?.bid ? [market.bid] : [];
  modelStatus?.latest_candidate ?? modelStatus?.candidates?.[0] ?? null;
  modelStatus?.champion_metadata?.metrics?.holdout?.backtest;
  const orderExecutionAllowed = capData?.order_execution_allowed ?? false;
  const chartFirst = displayPriceHistory[0] ?? 0;
  const chartLast = displayPriceHistory[displayPriceHistory.length - 1] ?? 0;
  const priceDelta = chartFirst > 0 && chartLast > 0 ? (chartLast - chartFirst) / chartFirst * 100 : 0;
  const signalStyle = useMemo(() => ({
    BUY: {
      Icon: TrendingUp,
      color: "text-[oklch(0.78_0.18_155)]",
      grad: "from-[oklch(0.74_0.18_155/0.18)]"
    },
    SELL: {
      Icon: TrendingDown,
      color: "text-[oklch(0.72_0.20_22)]",
      grad: "from-[oklch(0.66_0.22_22/0.18)]"
    },
    HOLD: {
      Icon: MinusCircle,
      color: "text-muted-foreground",
      grad: "from-muted/30"
    }
  })[uiSignal.type], [uiSignal.type]);
  const handleRefreshIntervalChange = (seconds) => {
    if (!Number.isFinite(seconds)) return;
    setRefreshIntervalSeconds(clamp(seconds, 2, 30));
  };
  const waitForAutomationState = async (expected) => {
    const deadline = Date.now() + 4e3;
    while (Date.now() < deadline) {
      await sleep(350);
      const [statusJson] = await Promise.all([fetchData(), refreshCapabilities()]);
      if (statusJson?.status?.auto_trading_enabled === expected) return true;
    }
    await Promise.all([fetchData(), refreshCapabilities()]);
    return false;
  };
  const sendAction = async (type) => {
    const capability = type === "pause" ? capabilities.pause : capabilities.resume;
    if (!capability.allowed) {
      toast.error(capability.reason ?? `${type} is blocked by backend policy.`);
      return;
    }
    setActionPending(true);
    try {
      const response = await fetch(`${API_V1_BASE}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type
        })
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
      toast.error(capabilities.save_settings.reason ?? "Save settings is blocked by backend policy.");
      return;
    }
    setSavingSettings(true);
    try {
      const response = await fetch(`${API_V1_BASE}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          confidence_threshold: quickControls.aiConfidence,
          risk_per_trade_usd: quickControls.riskUsd,
          sl_pips: quickControls.slPips,
          tp_ratio: quickControls.tpRatio
        })
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
  const handleClosePosition = async (ticket) => {
    if (!capabilities.close_position.allowed) {
      toast.error(capabilities.close_position.reason || "Close position is disabled.");
      return;
    }
    if (!window.confirm(`Queue close-position command for ticket ${ticket}?`)) return;
    try {
      const response = await fetch(`${API_V1_BASE}/actions/close-position`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ticket,
          idempotency_key: newIdempotencyKey()
        })
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
    if (!window.confirm("WARNING: This will permanently delete all trade logs and history from the database. Are you sure?")) return;
    try {
      const response = await fetch(`${API_V1_BASE}/trades`, {
        method: "DELETE"
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idempotency_key: newIdempotencyKey()
        })
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
      toast.error(capabilities.close_all.reason || "Emergency close-all is blocked by backend policy.");
      return;
    }
    setCloseAllPending(true);
    try {
      const response = await fetch(`${API_V1_BASE}/actions/emergency-close-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idempotency_key: newIdempotencyKey()
        })
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
  const promoteCandidate = async () => {
    if (!promoteTarget) return;
    if (!capabilities.model_promotion.allowed) {
      toast.error(capabilities.model_promotion.reason || "Model promotion is blocked by backend policy.");
      return;
    }
    setPromoting(true);
    try {
      const response = await fetch(`${API_V1_BASE}/model/promote-candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          candidate_id: promoteTarget.run_id,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      const detail = payload.detail;
      if (!response.ok) {
        throw new Error(typeof detail === "string" ? detail : detail?.message || "Failed to promote candidate");
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
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen text-foreground", children: [
    /* @__PURE__ */ jsx("div", { className: "velvet-vignette", "aria-hidden": true }),
    /* @__PURE__ */ jsxs("div", { className: "bokeh-field", "aria-hidden": true, children: [
      /* @__PURE__ */ jsx("span", { className: "bk", style: {
        width: 180,
        height: 180,
        left: "8%",
        top: "12%",
        animationDelay: "0s"
      } }),
      /* @__PURE__ */ jsx("span", { className: "bk", style: {
        width: 120,
        height: 120,
        left: "72%",
        top: "8%",
        animationDelay: "-3s"
      } }),
      /* @__PURE__ */ jsx("span", { className: "bk", style: {
        width: 220,
        height: 220,
        left: "55%",
        top: "55%",
        animationDelay: "-6s"
      } }),
      /* @__PURE__ */ jsx("span", { className: "bk", style: {
        width: 90,
        height: 90,
        left: "20%",
        top: "70%",
        animationDelay: "-9s"
      } }),
      /* @__PURE__ */ jsx("span", { className: "bk", style: {
        width: 140,
        height: 140,
        left: "88%",
        top: "42%",
        animationDelay: "-4s"
      } })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-blueprint" }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "monogram-watermark right-[-4%] top-[18%] hidden lg:block", children: "Au" }),
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsx(Ticker, { symbol, bid: market?.bid, ask: market?.ask, spread: market?.spread, mt5Online: Boolean(status?.mt5_online), feeds: data?.ticker_feeds }),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-6 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold shadow-gold", children: [
            /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute inset-0 rounded-xl ring-1 ring-[oklch(0.88_0.018_95/0.5)] [animation:pulse-glow_3s_ease-in-out_infinite]" }),
            /* @__PURE__ */ jsx(Crown, { className: "relative h-5 w-5 text-background", strokeWidth: 2.5 }),
            /* @__PURE__ */ jsx("span", { className: "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-[oklch(0.78_0.18_155)]", children: /* @__PURE__ */ jsx("span", { className: "absolute inset-0 animate-ping rounded-full bg-[oklch(0.78_0.18_155)] opacity-60" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-2 text-base font-semibold tracking-tight", children: [
              /* @__PURE__ */ jsx("span", { className: "font-serif text-lg", children: "Aurum" }),
              /* @__PURE__ */ jsx("span", { className: "text-shine font-serif text-lg", children: "AI" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-md border border-[oklch(0.88_0.018_95/0.3)] bg-[oklch(0.88_0.018_95/0.08)] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[oklch(0.96_0.012_95)]", children: "Pro" }),
              /* @__PURE__ */ jsxs("span", { className: "hidden items-center gap-1 rounded-md border border-border bg-background/50 px-1.5 py-0.5 font-mono-num text-[9px] text-muted-foreground md:inline-flex", children: [
                /* @__PURE__ */ jsx("span", { className: "h-1 w-1 rounded-full bg-[oklch(0.78_0.18_155)]" }),
                " API"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "font-mono-num text-[11px] text-muted-foreground", children: [
              symbol,
              " · ",
              status?.timeframe ?? "M5",
              " · runtime",
              " ",
              status?.runtime_mode ?? "external",
              " · ",
              accountMode,
              " · instance",
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-foreground/80", children: status?.engine_instance_id ?? "offline" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-1.5 rounded-xl border border-border bg-surface/60 p-1 md:flex", children: [
          ["dashboard", "performance", "logs"].map((k) => /* @__PURE__ */ jsx("button", { onClick: () => setTab(k), className: `relative rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${tab === k ? "bg-gradient-gold-soft text-[oklch(0.96_0.012_95)] font-semibold shadow-gold-soft" : "text-muted-foreground hover:text-foreground"}`, children: k }, k)),
          /* @__PURE__ */ jsx(Link, { to: "/train", className: "relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-[oklch(0.96_0.012_95)]", children: "Retrainer" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(StatusPill, { tone: backendOnline ? "success" : "danger", label: backendOnline ? "Backend Online" : "Backend Offline", icon: Cpu }),
          /* @__PURE__ */ jsx(StatusPill, { tone: status?.engine_online ? "success" : "danger", label: status?.engine_online ? "Engine Online" : "Engine Offline", icon: Bot }),
          /* @__PURE__ */ jsx(StatusPill, { tone: status?.mt5_online ? "success" : "danger", label: status?.mt5_online ? "MT5 Online" : "MT5 Offline", icon: Activity }),
          /* @__PURE__ */ jsx(StatusPill, { tone: accountMode === "demo" ? "gold" : "muted", label: accountMode === "demo" ? "Demo Account" : accountMode === "live" ? "Live Account" : "Account Unknown", icon: ShieldCheck })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-[1480px] space-y-5 px-6 py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "sheen-sweep border-trace flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-surface px-5 py-4 shadow-elegant", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-background/50 px-4 py-2", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-[oklch(0.96_0.012_95)]" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Automation" }),
            /* @__PURE__ */ jsx(Toggle, { on: Boolean(status?.auto_trading_enabled), disabled: actionPending || !canPause && !canResume, onChange: (next) => void sendAction(next ? "resume" : "pause") }),
            /* @__PURE__ */ jsx("span", { className: `font-mono-num text-xs ${status?.auto_trading_enabled ? "text-[oklch(0.78_0.18_155)]" : "text-muted-foreground"}`, children: status?.auto_trading_enabled ? "ON" : "OFF" })
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => void sendAction("pause"), disabled: !canPause, className: "inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", children: [
            actionPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4" }),
            "Pause"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => void sendAction("resume"), disabled: !canResume, className: "inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", children: [
            actionPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
            "Resume"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("p", { className: "hidden text-xs text-muted-foreground md:block", children: "Automation control gate is open. Resume still requires confirmation." }),
          /* @__PURE__ */ jsxs("button", { disabled: !capabilities.close_all.allowed || closeAllPending, onClick: () => setCloseAllDialogOpen(true), className: "inline-flex items-center gap-2 rounded-xl border border-[oklch(0.66_0.22_22/0.4)] bg-[oklch(0.66_0.22_22/0.12)] px-4 py-2 text-sm font-semibold text-[oklch(0.78_0.20_22)] shadow-[0_8px_24px_-8px_oklch(0.66_0.22_22/0.5)] transition hover:bg-[oklch(0.66_0.22_22/0.2)] disabled:cursor-not-allowed disabled:opacity-50", children: [
            /* @__PURE__ */ jsx(PowerOff, { className: "h-4 w-4" }),
            " Close All Positions"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(StatusPill, { tone: "info", label: capData?.control_mode === "demo" ? "Demo Control Enabled" : "Control Limited" }),
        /* @__PURE__ */ jsx(StatusPill, { tone: orderExecutionAllowed ? "success" : "danger", label: orderExecutionAllowed ? "Order Execution Active" : "Order Execution Blocked" }),
        /* @__PURE__ */ jsx(StatusPill, { tone: "danger", label: status?.live_trading_enabled ? "Live Trading Enabled" : "Live Trading Blocked" })
      ] }),
      data?.news ? data.news.active ? /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-[oklch(0.72_0.20_22/0.3)] bg-[oklch(0.72_0.20_22/0.06)] px-5 py-4 animate-pulse", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.72_0.20_22/0.15)]", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-[oklch(0.72_0.20_22)]" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[oklch(0.72_0.20_22)]", children: "Active USD High-Impact News Blackout!" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 space-y-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { children: "Trading loop is currently locked. Blocked event(s):" }),
            /* @__PURE__ */ jsx("ul", { className: "list-disc list-inside font-medium text-foreground", children: data.news.events.map((e, idx) => /* @__PURE__ */ jsx("li", { children: e.title }, idx)) })
          ] })
        ] })
      ] }) : data.news.upcoming && data.news.upcoming.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-[oklch(0.78_0.16_70/0.3)] bg-[oklch(0.78_0.16_70/0.06)] px-5 py-4", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.16_70/0.15)]", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-[oklch(0.82_0.16_70)]" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[oklch(0.88_0.12_75)]", children: "Upcoming High-Impact News (Next 24h)" }),
          /* @__PURE__ */ jsx("div", { className: "mt-1 space-y-1.5 text-xs text-muted-foreground", children: data.news.upcoming.map((e, idx) => {
            const minutesLeft = Math.round(e.time_diff_seconds / 60);
            const hoursLeft = (minutesLeft / 60).toFixed(1);
            const timeStr = minutesLeft < 60 ? `${minutesLeft} min` : `${hoursLeft} hours`;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-1 last:border-0 last:pb-0", children: [
              /* @__PURE__ */ jsx("span", { children: e.title }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono-num font-semibold text-foreground", children: [
                "in ",
                timeStr
              ] })
            ] }, idx);
          }) })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-[oklch(0.78_0.18_155/0.3)] bg-[oklch(0.78_0.18_155/0.06)] px-5 py-4", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.18_155/0.15)]", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-[oklch(0.78_0.18_155)]" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-[oklch(0.78_0.18_155)]", children: "News Protection System Active" }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "No high-impact USD economic events detected near the current time. Safety filters are armed." })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-[oklch(0.78_0.16_70/0.3)] bg-[oklch(0.78_0.16_70/0.06)] px-5 py-4", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(0.78_0.16_70/0.15)]", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-[oklch(0.82_0.16_70)]" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-[oklch(0.88_0.12_75)]", children: "News blackout status unavailable" }),
          /* @__PURE__ */ jsx("p", { className: "mt-0.5 text-xs text-muted-foreground", children: "Economic calendar feeds could not be retrieved from the server cache." })
        ] })
      ] }),
      (apiError || capError || optionalErrors.length > 0) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "size-4" }),
          "Dashboard data notice"
        ] }),
        apiError && /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
          "API connection error: ",
          apiError
        ] }),
        capError && /* @__PURE__ */ jsxs("p", { className: "mt-2", children: [
          "Capabilities error: ",
          capError
        ] }),
        optionalErrors.map((err) => /* @__PURE__ */ jsx("p", { className: "mt-1 text-amber-200/85", children: err }, err))
      ] }),
      !data && !apiError && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-3 rounded-xl border border-border/70 bg-surface/50 p-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin text-gold" }),
        "Waiting for backend"
      ] }),
      tab === "dashboard" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6", children: [
          /* @__PURE__ */ jsx(MetricCard, { icon: Wallet, label: "Balance", value: formatNullableCurrency(stats?.balance), tone: "gold", hint: freeMargin == null ? "Free margin unavailable" : `Free ${formatCurrency(freeMargin)}` }),
          /* @__PURE__ */ jsx(MetricCard, { icon: Gauge, label: "Equity", value: formatNullableCurrency(stats?.equity) }),
          /* @__PURE__ */ jsx(MetricCard, { icon: TrendingUp, label: "Daily P/L", value: formatSigned(stats?.daily_pnl ?? 0), tone: (stats?.daily_pnl ?? 0) >= 0 ? "success" : "danger" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: LineChart, label: "Floating P/L", value: formatSigned(stats?.floating_pnl ?? 0), tone: (stats?.floating_pnl ?? 0) >= 0 ? "success" : "danger" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: TrendingDown, label: "Drawdown", value: `${(stats?.drawdown_percent ?? 0).toFixed(2)}%`, tone: "danger" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: Sparkles, label: `${symbol.toUpperCase()} Bid`, value: formatNullablePrice(market?.bid), tone: "gold", hint: `Ask ${formatNullablePrice(market?.ask)} · Spread ${(market?.spread ?? 0).toFixed(2)}` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(SectionCard, { numeral: "I", title: `${symbol} Live Price Trace`, icon: LineChart, className: "lg:col-span-2", right: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("span", { className: `font-mono-num text-xl font-semibold ${priceDelta >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`, children: formatNullablePrice(market?.bid) }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-xs text-muted-foreground", children: [
              priceDelta >= 0 ? "+" : "",
              priceDelta.toFixed(3),
              "% polling window"
            ] })
          ] }), children: /* @__PURE__ */ jsxs("div", { className: "relative h-[260px] overflow-hidden rounded-xl border border-border/60 bg-background/40", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-3 z-10 rounded-md border border-border bg-background/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur", children: "Polling Trace" }),
            /* @__PURE__ */ jsx(PriceChart, { data: displayPriceHistory }),
            /* @__PURE__ */ jsxs("div", { className: "absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border border-border bg-background/70 px-3 py-1.5 font-mono-num text-[11px] backdrop-blur", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                "Bid",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: formatNullablePrice(market?.bid) })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                "Ask",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: formatNullablePrice(market?.ask) })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                "Spread",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: (market?.spread ?? 0).toFixed(2) })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(SectionCard, { numeral: "II", title: "AI Signal", icon: Cpu, right: /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-[11px] text-muted-foreground", children: [
            "Updated ",
            uiSignal.updatedAt
          ] }), children: [
            /* @__PURE__ */ jsxs("div", { className: `conic-ring relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${signalStyle.grad} to-transparent p-5`, children: [
              /* @__PURE__ */ jsxs("div", { className: "relative z-[2] flex items-start justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 items-center justify-center rounded-xl bg-background/40 ${signalStyle.color}`, children: /* @__PURE__ */ jsx(signalStyle.Icon, { className: "h-6 w-6" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: `font-serif text-4xl font-medium tracking-tight ${signalStyle.color}`, children: uiSignal.action.toUpperCase() === "CLOSE" ? "CLOSE" : uiSignal.type }),
                    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Recommended action" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-shine font-serif text-3xl font-medium", children: /* @__PURE__ */ jsx(CountUp, { value: uiSignal.confidence, decimals: 0, suffix: "%" }) }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "confidence" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "relative z-[2] mt-4 h-1.5 overflow-hidden rounded-full bg-background/50", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gradient-gold shadow-gold transition-all duration-700", style: {
                width: `${uiSignal.confidence}%`
              } }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-xl border border-border/70 bg-background/35 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: [
                /* @__PURE__ */ jsx("span", { children: "Decision Reason" }),
                /* @__PURE__ */ jsx("span", { className: "font-mono-num", children: uiSignal.riskStatus })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 line-clamp-2 text-xs text-foreground/80", children: uiSignal.reason })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 grid grid-cols-2 gap-2 md:grid-cols-4", children: [{
              label: "Trend",
              value: uiSignal.trendScore
            }, {
              label: "Entry",
              value: uiSignal.entryScore
            }, {
              label: "Exit",
              value: uiSignal.exitScore
            }, {
              label: "Lot",
              value: uiSignal.suggestedLot,
              lot: true
            }].map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-3", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: item.label }),
              /* @__PURE__ */ jsx("div", { className: "mt-1.5 font-mono-num text-base font-semibold", children: item.lot ? item.value == null ? "--" : Number(item.value).toFixed(2) : `${Number(item.value ?? 0).toFixed(0)}%` })
            ] }, item.label)) }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-3 gap-2", children: [{
              label: "Entry",
              value: formatNullablePrice(uiSignal.entry),
              icon: CircleDot,
              tone: "text-foreground"
            }, {
              label: "Stop Loss",
              value: formatNullablePrice(uiSignal.stopLoss),
              icon: TrendingDown,
              tone: "text-[oklch(0.72_0.20_22)]"
            }, {
              label: "Take Profit",
              value: formatNullablePrice(uiSignal.takeProfit),
              icon: TrendingUp,
              tone: "text-[oklch(0.78_0.18_155)]"
            }].map((s) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: [
                /* @__PURE__ */ jsx(s.icon, { className: "h-3 w-3" }),
                " ",
                s.label
              ] }),
              /* @__PURE__ */ jsx("div", { className: `mt-1.5 font-mono-num text-base font-semibold ${s.tone}`, children: s.value })
            ] }, s.label)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(SectionCard, { numeral: "III", title: "Open Positions", icon: Activity, className: "lg:col-span-2", right: /* @__PURE__ */ jsx("span", { className: "rounded-full border border-border bg-background/50 px-2 py-0.5 font-mono-num text-xs text-muted-foreground", children: uiPositions.length }), children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-border/60", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: ["Symbol", "Side", "Lots", "Open", "Current", "SL", "TP", "P/L", "Action"].map((h) => /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: h }, h)) }) }),
            /* @__PURE__ */ jsx("tbody", { children: uiPositions.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 9, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/40", children: /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 opacity-50" }) }),
              "No open positions reported by the API."
            ] }) }) }) : uiPositions.map((pos) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-semibold", children: pos.symbol }),
              /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-1 text-xs ${pos.side === "BUY" ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`, children: pos.side }) }),
              /* @__PURE__ */ jsx("td", { className: "font-mono-num", children: pos.lots.toFixed(2) }),
              /* @__PURE__ */ jsx("td", { className: "font-mono-num", children: formatNullablePrice(pos.openPrice) }),
              /* @__PURE__ */ jsx("td", { className: "font-mono-num", children: formatNullablePrice(pos.currentPrice) }),
              /* @__PURE__ */ jsx("td", { className: "font-mono-num text-red-300", children: formatNullablePrice(pos.stopLoss) }),
              /* @__PURE__ */ jsx("td", { className: "font-mono-num text-emerald-300", children: formatNullablePrice(pos.takeProfit) }),
              /* @__PURE__ */ jsx("td", { className: `font-mono-num font-semibold ${pos.pl >= 0 ? "text-emerald-300" : "text-red-300"}`, children: formatSigned(pos.pl) }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", className: "h-8 rounded-lg", disabled: !capabilities.close_position.allowed, onClick: () => void handleClosePosition(pos.ticket), children: "Close" }) })
            ] }, pos.ticket)) })
          ] }) }) }),
          /* @__PURE__ */ jsxs(SectionCard, { numeral: "IV", title: "Quick Controls", icon: Settings2, children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsx(Field, { label: "Timeframe", children: /* @__PURE__ */ jsx(Select, { value: quickControls.timeframe, onChange: (v) => setQuickControls((p) => ({
                ...p,
                timeframe: v
              })), options: ["M1 (1 Minute)", "M5 (5 Minutes)", "M15 (15 Minutes)", "H1 (1 Hour)"], disabled: true }) }),
              /* @__PURE__ */ jsx(Field, { label: "Trading Mode", children: /* @__PURE__ */ jsx(Select, { value: quickControls.tradingMode, onChange: (v) => setQuickControls((p) => ({
                ...p,
                tradingMode: v
              })), options: ["Conservative (0.5 lot)", "Standard (1 lot)", "Aggressive (2 lots)"], disabled: true }) }),
              /* @__PURE__ */ jsx(Field, { label: "AI Confidence (%)", children: /* @__PURE__ */ jsx(Input, { type: "number", min: "20", max: "90", value: quickControls.aiConfidence, onChange: (e) => {
                setQuickControls((p) => ({
                  ...p,
                  aiConfidence: Number(e.target.value)
                }));
                setSettingsDirty(true);
              } }) }),
              /* @__PURE__ */ jsx(Field, { label: "Risk %", children: /* @__PURE__ */ jsx(Input, { type: "number", value: quickControls.riskPct, disabled: true, title: "Visible for template parity; backend save currently uses Risk per Trade (USD)." }) }),
              /* @__PURE__ */ jsx(Field, { label: "Risk per Trade (USD)", children: /* @__PURE__ */ jsx(Input, { type: "number", min: "1", max: "500", value: quickControls.riskUsd, onChange: (e) => {
                setQuickControls((p) => ({
                  ...p,
                  riskUsd: Number(e.target.value)
                }));
                setSettingsDirty(true);
              } }) }),
              /* @__PURE__ */ jsx(Field, { label: "SL pips", children: /* @__PURE__ */ jsx(Input, { type: "number", min: "1", max: "200", value: quickControls.slPips, onChange: (e) => {
                setQuickControls((p) => ({
                  ...p,
                  slPips: Number(e.target.value)
                }));
                setSettingsDirty(true);
              } }) }),
              /* @__PURE__ */ jsx(Field, { label: "TP pips", children: /* @__PURE__ */ jsx(Input, { type: "number", value: quickControls.tpPips, disabled: true, title: "Visible for template parity; backend save currently uses TP Ratio." }) }),
              /* @__PURE__ */ jsx(Field, { label: "TP Ratio", children: /* @__PURE__ */ jsx(Input, { type: "number", min: "0.1", max: "10", step: "0.1", value: quickControls.tpRatio, onChange: (e) => {
                setQuickControls((p) => ({
                  ...p,
                  tpRatio: Number(e.target.value)
                }));
                setSettingsDirty(true);
              } }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border bg-background/40 p-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold-soft text-[oklch(0.96_0.012_95)]", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: "Risk Filters" }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Daily risk, trend, trailing, and news guards" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Toggle, { on: quickControls.riskFiltersEnabled, onChange: () => {
                }, disabled: true })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border bg-background/40 p-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold-soft text-[oklch(0.96_0.012_95)]", children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: "Auto Refresh" }),
                    /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Frontend polling only; no trading action." })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx(Toggle, { on: autoRefresh, onChange: setAutoRefresh }),
                  /* @__PURE__ */ jsx(Input, { type: "number", min: "2", max: "30", value: refreshIntervalSeconds, onChange: (e) => handleRefreshIntervalChange(Number(e.target.value)), disabled: !autoRefresh, className: "w-14 text-center px-1" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("button", { disabled: !capabilities.save_settings.allowed || !settingsDirty || savingSettings, onClick: () => void saveSettings(), className: "group relative w-full overflow-hidden rounded-xl bg-gradient-gold p-px shadow-gold transition hover:shadow-[0_12px_40px_-8px_oklch(0.88_0.018_95/0.6)] disabled:cursor-not-allowed disabled:opacity-55", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 rounded-[11px] bg-background/20 px-4 py-2.5 text-sm font-semibold text-background backdrop-blur transition group-hover:bg-background/0", children: [
                savingSettings ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
                "Save backend settings"
              ] }) }),
              capData?.demo_canary_mode && /* @__PURE__ */ jsxs("div", { className: "col-span-2 mt-2 space-y-3 rounded-xl border border-[oklch(0.88_0.018_95/0.2)] bg-surface/40 p-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(CircleDot, { className: "h-4 w-4 text-gold animate-pulse" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-[oklch(0.96_0.012_95)]", children: "Demo Canary Monitor" })
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "rounded-md border border-[oklch(0.88_0.018_95/0.3)] bg-[oklch(0.88_0.018_95/0.1)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-gold", children: "Active" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-mono-num", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Session Orders:" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-foreground font-semibold", children: [
                      capData.demo_canary_orders_used,
                      " / ",
                      capData.demo_canary_max_new_orders,
                      " ",
                      "Max"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: capData.demo_canary_orders_used / capData.demo_canary_max_new_orders * 100, className: "h-1.5 bg-black/40" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-[10px] font-mono-num text-muted-foreground pt-1 border-t border-border/20", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    "Open limit:",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: capData.demo_canary_max_open_positions })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    "Auto-pause:",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: capData.demo_canary_auto_pause_after_first_order ? "ON" : "OFF" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    "SL required:",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: capData.demo_canary_require_sl ? "YES" : "NO" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    "TP required:",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium", children: capData.demo_canary_require_tp ? "YES" : "NO" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("button", { onClick: handleResetCanarySession, disabled: !capabilities.reset_canary_session.allowed, className: "mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background/50 py-2 text-xs font-semibold transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50", title: capabilities.reset_canary_session.reason || void 0, children: [
                  capabilities.reset_canary_session.allowed ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-3 w-3 text-gold" }) : /* @__PURE__ */ jsx(Lock, { className: "h-3 w-3 text-muted-foreground" }),
                  "Reset Canary Session"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("button", { className: "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60 transition disabled:cursor-not-allowed", disabled: true, children: [
                /* @__PURE__ */ jsx(Settings2, { className: "h-4 w-4" }),
                "Advanced risk settings",
                /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(SectionCard, { numeral: "V", title: "Recent Trades", icon: Activity, className: "lg:col-span-2", right: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => {
              setTradeViewCleared(true);
              toast.success("Recent Trades view cleared. Stored history was not modified.");
            }, className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground", children: [
              /* @__PURE__ */ jsx(EyeOff, { className: "size-3.5" }),
              " Clear View"
            ] }),
            capabilities.delete_stored_history.allowed ? /* @__PURE__ */ jsxs("button", { onClick: handleResetHistory, className: "inline-flex items-center gap-1.5 rounded-lg border border-[oklch(0.72_0.20_22/0.4)] bg-[oklch(0.72_0.20_22/0.12)] px-3 py-1.5 text-xs font-medium text-[oklch(0.72_0.20_22)] shadow-[0_4px_12px_-4px_oklch(0.72_0.20_22/0.4)] transition hover:bg-[oklch(0.72_0.20_22/0.2)]", children: [
              /* @__PURE__ */ jsx(PowerOff, { className: "size-3.5" }),
              " Reset History"
            ] }) : /* @__PURE__ */ jsxs("button", { disabled: true, title: capabilities.delete_stored_history.reason || "Reset history is blocked by policy.", className: "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface/30 px-3 py-1.5 text-xs text-muted-foreground opacity-55 cursor-not-allowed", children: [
              /* @__PURE__ */ jsx(Lock, { className: "size-3.5" }),
              " Reset History"
            ] })
          ] }), children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-border/60", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: ["Timestamp", "Action", "Lot", "Profit", "Prediction", "Status"].map((h) => /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: h }, h)) }) }),
            /* @__PURE__ */ jsx("tbody", { children: visibleTrades.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 6, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/40", children: /* @__PURE__ */ jsx(Bot, { className: "h-4 w-4 opacity-50" }) }),
              tradeViewCleared ? "View cleared. Stored trade history was not modified." : "No recent trades reported by the API."
            ] }) }) }) : visibleTrades.map((t) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono-num text-muted-foreground", children: t.timestamp || "Unavailable" }),
              /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("span", { className: `rounded-full px-2 py-1 text-xs ${t.action?.toUpperCase().includes("BUY") ? "bg-emerald-400/10 text-emerald-300" : "bg-red-400/10 text-red-300"}`, children: t.action || "N/A" }) }),
              /* @__PURE__ */ jsx("td", { className: "font-mono-num", children: t.lot == null ? "--" : t.lot.toFixed(2) }),
              /* @__PURE__ */ jsx("td", { className: `font-mono-num font-semibold ${(t.profit ?? 0) >= 0 ? "text-emerald-300" : "text-red-300"}`, children: t.profit == null ? "--" : formatSigned(t.profit) }),
              /* @__PURE__ */ jsx("td", { className: "font-mono-num", children: t.predictionProb == null ? "--" : `${(t.predictionProb * 100).toFixed(2)}%` }),
              /* @__PURE__ */ jsx("td", { className: "text-muted-foreground", children: t.status || "logged" })
            ] }, t.id)) })
          ] }) }) }),
          /* @__PURE__ */ jsx(SectionCard, { numeral: "VI", title: "AI Model Retraining", icon: Sparkles, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/50 rounded-xl bg-background/25", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold shadow-gold mb-3 text-background", children: /* @__PURE__ */ jsx(BrainCircuit, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold tracking-tight", children: "Dedicated Retraining Workspace" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-sm", children: "Model training, candidate evaluation, and decision pipeline diagnostics have been promoted to a separate dedicated office." }),
            /* @__PURE__ */ jsxs(Link, { to: "/train", className: "inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-gradient-gold text-background font-semibold text-xs shadow-gold transition hover:opacity-90", children: [
              "Open Retrainer Office ",
              /* @__PURE__ */ jsx(ChevronRight, { className: "h-4.5 w-4.5" })
            ] })
          ] }) })
        ] })
      ] }) : tab === "performance" ? /* @__PURE__ */ jsxs("div", { className: "space-y-6 animate-in fade-in-50 duration-350", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6", children: [
          /* @__PURE__ */ jsx(MetricCard, { icon: Wallet, label: "Total Return", value: performance ? formatSigned(performance.summary?.net_profit ?? 0) : "$0.00", tone: performance && (performance.summary?.net_profit ?? 0) >= 0 ? "success" : "danger", hint: performance ? `Best: ${formatSigned(performance.summary?.best_trade ?? 0)}` : "Best: $0.00" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: ShieldCheck, label: "Win Rate", value: performance ? `${(performance.summary?.win_rate ?? 0).toFixed(1)}%` : "0.0%", tone: "gold", hint: performance ? `W:${performance.summary?.winning_trades ?? 0} L:${performance.summary?.losing_trades ?? 0} B:${performance.summary?.breakeven_trades ?? 0}` : "W:0 L:0 B:0" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: Gauge, label: "Profit Factor", value: performance?.risk_metrics?.profit_factor != null ? performance.risk_metrics.profit_factor.toFixed(2) : "0.00", hint: performance ? `Payoff: ${performance.risk_metrics?.payoff_ratio?.toFixed(2) ?? "0.00"}` : "Payoff: 0.00" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: Activity, label: "Total Trades", value: performance ? String(performance.summary?.total_trades ?? 0) : "0", hint: performance ? `Avg: ${formatSigned(performance.summary?.average_profit ?? 0)}` : "Avg: $0.00" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: TrendingUp, label: "Expectancy", value: performance ? formatSigned(performance.risk_metrics?.expectancy ?? 0) : "$0.00", tone: performance && (performance.risk_metrics?.expectancy ?? 0) >= 0 ? "success" : "danger", hint: "Per trade estimate" }),
          /* @__PURE__ */ jsx(MetricCard, { icon: TrendingDown, label: "Max Drawdown", value: performance ? `${(performance.risk_metrics?.max_drawdown ?? 0).toFixed(2)}%` : "0.00%", tone: "danger", hint: performance ? `Recovery: ${performance.risk_metrics?.recovery_factor?.toFixed(2) ?? "0.00"}` : "Recovery: 0.00" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-3", children: [
          /* @__PURE__ */ jsx(SectionCard, { numeral: "I", title: "Equity Curve Evolution", icon: LineChart, className: "lg:col-span-2", right: /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsx("span", { className: "font-mono-num text-[11px] text-muted-foreground", children: "Cumulative P&L Progress" }) }), children: /* @__PURE__ */ jsxs("div", { className: "relative h-[280px] overflow-hidden rounded-xl border border-border/60 bg-background/40 p-2", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-3 z-10 rounded-md border border-border bg-background/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground backdrop-blur", children: "Equity Curve" }),
            /* @__PURE__ */ jsx(PerformanceChart, { equityData: performance?.equity_curve ?? [], balanceData: performance?.balance_curve ?? [] })
          ] }) }),
          /* @__PURE__ */ jsx(SectionCard, { numeral: "II", title: "Period Metrics", icon: Settings2, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3", children: "P&L Breakdown" }),
              /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: [{
                label: "Today P&L",
                value: performance?.time_breakdowns?.today_pnl ?? 0
              }, {
                label: "Weekly P&L",
                value: performance?.time_breakdowns?.weekly_pnl ?? 0
              }, {
                label: "Monthly P&L",
                value: performance?.time_breakdowns?.monthly_pnl ?? 0
              }].map((item) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: item.label }),
                /* @__PURE__ */ jsx("span", { className: `font-mono-num font-semibold ${item.value >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`, children: formatSigned(item.value) })
              ] }, item.label)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-3", children: "Streaks & Series" }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.12em] text-muted-foreground", children: "Current Win Streak" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1 font-mono-num font-semibold text-[oklch(0.78_0.18_155)]", children: [
                    performance?.streaks?.consecutive_wins ?? 0,
                    " trades"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.12em] text-muted-foreground", children: "Max Win Streak" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1 font-mono-num font-semibold text-[oklch(0.78_0.18_155)]", children: [
                    performance?.streaks?.max_consecutive_wins ?? 0,
                    " trades"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.12em] text-muted-foreground", children: "Current Loss Streak" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1 font-mono-num font-semibold text-[oklch(0.72_0.20_22)]", children: [
                    performance?.streaks?.consecutive_losses ?? 0,
                    " trades"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.12em] text-muted-foreground", children: "Max Loss Streak" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1 font-mono-num font-semibold text-[oklch(0.72_0.20_22)]", children: [
                    performance?.streaks?.max_consecutive_losses ?? 0,
                    " trades"
                  ] })
                ] })
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-5 lg:grid-cols-2", children: [
          /* @__PURE__ */ jsx(SectionCard, { numeral: "III", title: "Directional Breakdown", icon: Sparkles, children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-border/60", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Side" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Trades" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Win Rate" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right font-medium", children: "P&L" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: !performance?.side_breakdown || performance.side_breakdown.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-6 text-center text-muted-foreground text-xs", children: "No directional data." }) }) : performance.side_breakdown.map((row) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40 last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-semibold", children: row.side }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono-num", children: row.trades }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num", children: [
                  row.win_rate.toFixed(1),
                  "%"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-16 bg-background/50 rounded-full overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-gradient-gold", style: {
                  width: `${row.win_rate}%`
                } }) })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: `px-4 py-3 text-right font-mono-num font-semibold ${row.pnl >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`, children: formatSigned(row.pnl) })
            ] }, row.side)) })
          ] }) }) }),
          /* @__PURE__ */ jsx(SectionCard, { numeral: "IV", title: "Symbol Breakdown", icon: Cpu, children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-border/60", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "bg-background/40 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Symbol" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Trades" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-left font-medium", children: "Win Rate" }),
              /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right font-medium", children: "P&L" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: !performance?.symbol_breakdown || performance.symbol_breakdown.length === 0 ? /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 4, className: "px-4 py-6 text-center text-muted-foreground text-xs", children: "No symbol breakdown data." }) }) : performance.symbol_breakdown.map((row) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/40 last:border-0", children: [
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-semibold", children: row.symbol }),
              /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-mono-num", children: row.trades }),
              /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 font-mono-num", children: [
                row.win_rate.toFixed(1),
                "%"
              ] }),
              /* @__PURE__ */ jsx("td", { className: `px-4 py-3 text-right font-mono-num font-semibold ${row.pnl >= 0 ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]"}`, children: formatSigned(row.pnl) })
            ] }, row.symbol)) })
          ] }) }) })
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-6 animate-in fade-in-50 duration-350", children: /* @__PURE__ */ jsx(SectionCard, { numeral: "I", title: "Live Trading Engine Log Console", icon: Bot, right: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-[11px] text-muted-foreground", children: [
          "Source: ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: logsData?.source || "unknown" })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-[11px] text-muted-foreground", children: [
          "Path: ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: logsData?.path || "unavailable" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => void fetchData(), className: "flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground transition hover:text-[oklch(0.96_0.012_95)]", children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }) })
      ] }), children: /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border/80 bg-black/60 p-4 shadow-inner", children: /* @__PURE__ */ jsx("div", { className: "font-mono text-xs overflow-auto h-[550px] space-y-1.5 scrollbar-thin select-text", children: !logsData?.logs || logsData.logs.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex h-full items-center justify-center text-muted-foreground py-20", children: "No engine logs reported. Wait for bot activity or check MT5 status." }) : logsData.logs.map((line, idx) => {
        let color = "text-muted-foreground";
        if (line.includes("ERROR") || line.includes("FAILED") || line.includes("Exception")) {
          color = "text-[oklch(0.72_0.20_22)] font-semibold";
        } else if (line.includes("WARNING") || line.includes("WARN")) {
          color = "text-amber-300 font-semibold";
        } else if (line.includes("SUCCESS") || line.includes("CONNECTED") || line.includes("Loaded")) {
          color = "text-[oklch(0.78_0.18_155)]";
        } else if (line.includes("BUY") || line.includes("SELL") || line.includes("Signal")) {
          color = "text-sky-300 font-medium";
        } else if (line.includes("AUDIT") || line.includes("action")) {
          color = "text-pink-300";
        }
        return /* @__PURE__ */ jsx("div", { className: `${color} whitespace-pre-wrap leading-relaxed border-l-2 border-transparent pl-2 hover:border-border hover:bg-white/5`, children: line }, idx);
      }) }) }) }) }),
      /* @__PURE__ */ jsxs("footer", { className: "flex items-center justify-between pb-6 pt-2 text-[11px] text-muted-foreground font-mono", children: [
        /* @__PURE__ */ jsx("span", { children: "© Aurum AI · Institutional Trading Terminal" }),
        /* @__PURE__ */ jsx("span", { className: "font-mono-num", children: "premium UI integrated with /api/v1" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AlertDialog, { open: closeAllDialogOpen, onOpenChange: setCloseAllDialogOpen, children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: "glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] text-foreground", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Confirm emergency close-all" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { className: "text-muted-foreground", children: "This queues a backend emergency command to pause automation and close all open positions. It will only run if the backend capability gate still allows it." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: closeAllPending, className: "bg-background/40 hover:bg-background/80", children: "Cancel" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { disabled: closeAllPending || !capabilities.close_all.allowed, onClick: () => void handleEmergencyCloseAll(), className: "bg-[oklch(0.72_0.20_22)] hover:bg-[oklch(0.72_0.20_22/0.8)] text-white", children: closeAllPending ? "Queuing..." : "Confirm Close All" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: Boolean(promoteTarget), onOpenChange: (open) => !open && setPromoteTarget(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: "glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] text-foreground", children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Promote candidate model?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { className: "text-muted-foreground", children: [
          "This replaces the active champion model with the selected candidate model (",
          promoteTarget?.run_id,
          "). This action is final and will only run if the capability gate allows it."
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: promoting, className: "bg-background/40 hover:bg-background/80", children: "Cancel" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { disabled: promoting || !capabilities.model_promotion.allowed, onClick: () => void promoteCandidate(), className: "bg-gradient-gold hover:opacity-90 text-background font-semibold", children: promoting ? "Promoting..." : "Promote" })
      ] })
    ] }) })
  ] });
}
export {
  Dashboard as component
};
