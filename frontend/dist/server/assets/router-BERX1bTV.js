import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { Toaster as Toaster$1, toast } from "sonner";
import { Crown, Cpu, Bot, Activity, ArrowLeft, RefreshCw, Zap, BrainCircuit, Flame, Settings, Loader2, ShieldAlert, ShieldCheck, AlertTriangle, LineChart, Gauge, Lock, Save, Sparkles, Trash2 } from "lucide-react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import * as ProgressPrimitive from "@radix-ui/react-progress";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function GlobalCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const burstLayerRef = useRef(null);
  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let hasMoved = false;
    let frameId;
    const onMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!hasMoved) {
        ringX = mouseX;
        ringY = mouseY;
        hasMoved = true;
      }
    };
    const update = () => {
      const dotTransform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      const ringTransform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      if (dotRef.current) dotRef.current.style.transform = dotTransform;
      if (ringRef.current) ringRef.current.style.transform = ringTransform;
      frameId = requestAnimationFrame(update);
    };
    const isInteractive = (target) => target instanceof HTMLElement && Boolean(
      target.closest("button, a, input, select, textarea, [role='button'], label, .interactive")
    );
    const onOver = (event) => {
      if (!isInteractive(event.target)) return;
      ringRef.current?.classList.add("cursor-ring-hover");
      dotRef.current?.classList.add("cursor-dot-hover");
    };
    const onOut = (event) => {
      if (!isInteractive(event.target)) return;
      ringRef.current?.classList.remove("cursor-ring-hover");
      dotRef.current?.classList.remove("cursor-dot-hover");
    };
    const onDown = (event) => {
      ringRef.current?.classList.add("cursor-ring-active");
      dotRef.current?.classList.add("cursor-dot-active");
      const burstLayer = burstLayerRef.current;
      if (!burstLayer) return;
      const burst = document.createElement("span");
      burst.className = "cursor-click-burst";
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      burstLayer.appendChild(burst);
      window.setTimeout(() => burst.remove(), 620);
    };
    const onUp = () => {
      ringRef.current?.classList.remove("cursor-ring-active");
      dotRef.current?.classList.remove("cursor-dot-active");
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("blur", onUp);
    frameId = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("blur", onUp);
      cancelAnimationFrame(frameId);
    };
  }, []);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { ref: burstLayerRef, className: "cursor-burst-layer" }),
    /* @__PURE__ */ jsx("div", { ref: ringRef, className: "cursor-ring" }),
    /* @__PURE__ */ jsx("div", { ref: dotRef, className: "cursor-dot" })
  ] });
}
const appCss = "/assets/styles-DEsmvzXK.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$2 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      {
        name: "description",
        content: "Opulent Canvas creates premium, visually stunning digital experiences with customizable themes."
      },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      {
        property: "og:description",
        content: "Opulent Canvas creates premium, visually stunning digital experiences with customizable themes."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Lovable App" },
      {
        name: "twitter:description",
        content: "Opulent Canvas creates premium, visually stunning digital experiences with customizable themes."
      },
      {
        property: "og:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f4ff771-3c6e-4968-8fe6-c6c258433fd6/id-preview-3be66d89--d2c67688-ee6a-45f9-8e08-87d0d0775a52.lovable.app-1780508672083.png"
      },
      {
        name: "twitter:image",
        content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7f4ff771-3c6e-4968-8fe6-c6c258433fd6/id-preview-3be66d89--d2c67688-ee6a-45f9-8e08-87d0d0775a52.lovable.app-1780508672083.png"
      }
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: ""
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&display=swap"
      },
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$2.useRouteContext();
  return /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsx(GlobalCursor, {}),
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(
      Toaster,
      {
        position: "top-right",
        richColors: true,
        closeButton: true,
        duration: 4500,
        theme: "dark",
        toastOptions: {
          classNames: {
            toast: "!bg-[oklch(0.14_0.018_285)] !border-[oklch(0.88_0.018_95/0.2)] !text-[oklch(0.96_0.012_95)] !shadow-[0_8px_32px_-8px_oklch(0_0_0/0.6)] font-[var(--font-display)]",
            title: "!font-semibold !text-[oklch(0.96_0.012_95)]",
            description: "!text-[oklch(0.65_0.01_285)]",
            success: "!border-[oklch(0.78_0.18_155/0.35)]",
            error: "!border-[oklch(0.72_0.20_22/0.4)]",
            warning: "!border-[oklch(0.82_0.16_70/0.4)]",
            actionButton: "!bg-gradient-to-r !from-[oklch(0.88_0.018_95)] !to-[oklch(0.78_0.12_75)] !text-[oklch(0.14_0.018_285)] !font-semibold",
            cancelButton: "!bg-[oklch(0.20_0.015_285)] !text-[oklch(0.65_0.01_285)]",
            closeButton: "!bg-[oklch(0.20_0.015_285)] !border-[oklch(0.88_0.018_95/0.15)] !text-[oklch(0.65_0.01_285)] hover:!text-[oklch(0.96_0.012_95)]"
          }
        }
      }
    )
  ] });
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
const Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
    ...props,
    children: /* @__PURE__ */ jsx(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = ProgressPrimitive.Root.displayName;
const configuredApiBaseUrl = "http://127.0.0.1:8000";
const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, "");
const API_V1_BASE = `${API_BASE_URL}/api/v1`;
const CAPABILITIES_BLOCKED = {
  clear_view: { allowed: true, reason: null },
  pause: { allowed: false, reason: "Loading capabilities…" },
  resume: { allowed: false, reason: "Loading capabilities…" },
  save_settings: { allowed: false, reason: "Loading capabilities…" },
  close_position: { allowed: false, reason: "Loading capabilities…" },
  close_all: { allowed: false, reason: "Loading capabilities…" },
  delete_stored_history: { allowed: false, reason: "Loading capabilities…" },
  model_training: { allowed: false, reason: "Loading capabilities…" },
  model_promotion: { allowed: false, reason: "Loading capabilities…" },
  reset_canary_session: { allowed: false, reason: "Loading capabilities…" }
};
function useCapabilities(autoRefresh, refreshIntervalSeconds) {
  const [capData, setCapData] = useState(null);
  const [capError, setCapError] = useState(null);
  const pendingRef = useRef(false);
  const fetchCapabilities = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      const res = await fetch(`${API_V1_BASE}/capabilities`);
      if (!res.ok) throw new Error(`/capabilities returned ${res.status}`);
      const data = await res.json();
      setCapData(data);
      setCapError(null);
    } catch (e) {
      setCapError(e instanceof Error ? e.message : "Capabilities fetch failed");
    } finally {
      pendingRef.current = false;
    }
  }, []);
  useEffect(() => {
    void fetchCapabilities();
    if (!autoRefresh) return void 0;
    const id = window.setInterval(() => {
      void fetchCapabilities();
    }, refreshIntervalSeconds * 1e3);
    return () => window.clearInterval(id);
  }, [autoRefresh, fetchCapabilities, refreshIntervalSeconds]);
  const capabilities = capData?.capabilities ?? CAPABILITIES_BLOCKED;
  return { capData, capError, capabilities, refreshCapabilities: fetchCapabilities };
}
const formatCurrency = (value) => value.toLocaleString("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const formatPrice = (value) => value.toLocaleString("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const formatSigned = (value) => `${value >= 0 ? "+" : "-"}${formatCurrency(Math.abs(value))}`;
const Route$1 = createFileRoute("/train")({
  head: () => ({
    meta: [
      { title: "Aurum AI — Office Retrainer Terminal" },
      {
        name: "description",
        content: "Dedicated institutional AI model training and evaluation office."
      }
    ]
  }),
  component: TrainPage
});
const DEFAULT_SYMBOL = "XAUUSDm";
const DEFAULT_REFRESH_INTERVAL = 5;
const PHASE_B83_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b83_replay_source_restoration_reproducible_baseline_repair",
  legacy_replay_availability_status: "not_run",
  replay_branch_selected: "not_run",
  raw_reconstruction_status: "not_run",
  combined_feature_reconstruction_status: "not_run",
  feature_schema_status: "not_run",
  model_artifact_status: "not_run",
  prediction_payload_status: "not_run",
  trigger_config_status: "not_run",
  ledger_generation_status: "not_run",
  ledger_reconciliation_status: "not_run",
  deterministic_replay_meaningful: false,
  per_family_funnel_reconciliation_status: "not_run",
  legacy_lineage_validity: "not_run",
  new_lineage_id: null,
  new_baseline_status: "not_run",
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  blockers: [],
  missing_replay_requirements: [],
  unresolved_source_configs: [],
  artifact_paths: {},
  mutation_proof: { status: "not_run", mutations: [] },
  per_family_funnel: []
};
const PHASE_B831_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b831_threshold_gate_prediction_payload_integrity_audit",
  audit_lineage_scope: "not_run",
  exact_b83_payload_available: false,
  historical_root_cause_proven: false,
  recreated_symptom_matches_b83: false,
  source_config_provenance: {},
  source_threshold_provenance: {},
  model_payload_hashes: {},
  prediction_payload_hashes: {},
  feature_schema_hash: null,
  code_path_hash_or_version: null,
  random_seed: 20260606,
  deterministic_rebuild_replay_count: 0,
  deterministic_rebuild_mismatch_count: null,
  threshold_audit_status: "not_run",
  prediction_distribution_status: "not_run",
  score_scale_status: "not_run",
  threshold_schema_status: "not_run",
  trigger_evaluation_status: "not_run",
  candidate_ledger_status: "not_run",
  trade_ledger_status: "not_run",
  deterministic_replay_meaningful: false,
  per_family_funnel_reconciliation_status: "not_run",
  root_cause_classification: "not_run",
  blockers: [],
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  per_family_funnel: [],
  artifact_paths: {},
  mutation_proof: { status: "not_run", mutations: [] },
  missing_exact_b83_payload_requirements: []
};
const PHASE_B832_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b832_score_calibration_label_balance_threshold_sensitivity_audit",
  lineage_scope: "not_run",
  source_b831_batch_id: null,
  diagnostic_label: "DIAGNOSTIC_ONLY_NOT_PROMOTION_EVIDENCE",
  deterministic_audit_replay_count: 0,
  deterministic_audit_mismatch_count: null,
  output_mapping_status: "not_run",
  probability_transform_status: "not_run",
  feature_schema_status: "not_run",
  label_balance_classification: "not_run",
  score_compression_classification: "not_run",
  calibration_status: "not_run",
  root_cause_classification: "not_run",
  blockers: [],
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  per_family_score_quantiles: [],
  per_family_calibration_bins: [],
  threshold_sensitivity: [],
  mutation_proof: { status: "not_run", mutations: [] },
  artifact_paths: {}
};
const PHASE_B833_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b833_feature_schema_parity_deterministic_inference_repair",
  audit_lineage_scope: "not_run",
  exact_b831_inference_matrix_available: false,
  historical_root_cause_proven: false,
  rebuilt_lineage_diagnostic_only: false,
  actual_historical_inference_matrix_status: "not_run",
  rebuilt_inference_matrix_status: "not_run",
  sidecar_publish_status: "not_run",
  causal_feature_proof_status: "not_run",
  schema_artifact_status: "not_run",
  actual_inference_matrix_status: "not_run",
  canonical_alignment_status: "not_run",
  prediction_effect_status: "not_run",
  repair_status: "not_run",
  schema_parity_status: "not_run",
  mismatch_classification: "not_run",
  configured_threshold: 0.55,
  deterministic_rebuild_replay_count: 0,
  deterministic_rebuild_mismatch_count: null,
  per_family_schema_audit: [],
  before_after_score_quantiles: [],
  threshold_sensitivity: [],
  blockers: [],
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  mutation_proof: { status: "not_run", mutations: [] },
  artifact_paths: {}
};
const PHASE_B834_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b834_post_threshold_execution_funnel_gate_semantics_audit",
  audit_lineage_scope: "not_run",
  source_b833_batch_id: null,
  score_only_sensitivity_status: "not_run",
  full_funnel_replay_status: "not_run",
  execution_replay_prerequisites_status: "not_run",
  accepted_semantics_status: "not_run",
  candidate_ledger_status: "not_run",
  trade_ledger_status: "not_run",
  deterministic_replay_meaningful: false,
  deterministic_replay_count: 0,
  deterministic_replay_mismatch_count: null,
  funnel_reconciliation_status: "not_run",
  post_threshold_blocker_classification: "not_run",
  root_cause_classification: "not_run",
  historical_root_cause_proven: false,
  configured_threshold: 0.55,
  diagnostic_thresholds: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6],
  blockers: [],
  missing_replay_requirements: [],
  per_family_threshold_funnel: [],
  per_gate_rejection_summary: [],
  per_family_gate_summary: [],
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  mutation_proof: { status: "not_run", mutations: [] },
  artifact_paths: {}
};
const PHASE_B8341_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b8341_ledger_hash_attestation_source_lineage_integrity_proof",
  attestation_trust_scope: "POST_HOC_CURRENT_FILE_BASELINE",
  historical_immutability_proven: false,
  source_b834_batch_id: null,
  source_b834_report_sha256: null,
  source_b834_manifest_sha256: null,
  attestation_manifest_sha256: null,
  attested_at_utc: null,
  ledger_hash_attestation_status: "LEDGER_HASH_ATTESTATION_MISSING",
  prior_artifact_mutation_proof_status: "not_run",
  candidate_required_field_status: "not_run",
  trade_required_field_status: "not_run",
  candidate_event_id_integrity_status: "not_run",
  trade_event_id_integrity_status: "not_run",
  candidate_trade_join_integrity_status: "not_run",
  candidate_ledger_attestation: {},
  trade_ledger_attestation: {},
  join_integrity_summary: {},
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  configured_live_threshold: 0.55,
  blockers: [],
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  mutation_proof: { status: "not_run", mutations: [] },
  artifact_paths: {}
};
const PHASE_B8342_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b8342_ledger_schema_mapping_event_id_provenance_repair",
  source_b834_batch_id: null,
  source_b8341_batch_id: null,
  source_b8341_hash_capture_status: "not_run",
  source_b8341_sidecar_status: "not_run",
  attestation_trust_scope: "POST_HOC_CURRENT_FILE_BASELINE",
  historical_immutability_proven: false,
  historical_root_cause_proven: false,
  source_b834_report_sha256: null,
  source_b834_manifest_sha256: null,
  pre_mapping_tamper_check_status: "not_run",
  schema_mapping_status: "not_run",
  direction_inventory_status: "not_run",
  direction_canonicalization_status: "not_run",
  direction_mapping_status: "not_run",
  direction_join_parity_status: "not_run",
  direction_missing_count: 0,
  direction_ambiguous_count: 0,
  direction_mismatch_count: 0,
  direction_orphan_trade_count: 0,
  direction_duplicate_join_count: 0,
  candidate_event_id_provenance_status: "not_run",
  trade_event_id_provenance_status: "not_run",
  candidate_trade_join_provenance_status: "not_run",
  timestamp_semantics_status: "not_run",
  candidate_timestamp_semantic: "candidate_signal_timestamp_utc",
  trade_open_timestamp_semantic: "trade_opened_at_utc",
  trade_close_timestamp_semantic: "trade_closed_at_utc",
  chronology_integrity_status: "not_run",
  chronology_violation_count: 0,
  same_semantic_timestamp_mismatch_count: 0,
  normalized_sidecar_publish_status: "not_run",
  normalized_ledger_attestation_status: "not_run",
  normalized_sidecar_manifest_sha256: null,
  prior_artifact_mutation_proof_status: "not_run",
  root_cause_classification: "not_run",
  blockers: [],
  schema_inventory: {},
  direction_inventory: {},
  direction_mapping_table: [],
  direction_join_parity: {},
  candidate_field_mapping: [],
  trade_field_mapping: [],
  event_id_provenance: {},
  join_provenance: {},
  timestamp_semantics: {},
  normalized_ledger_attestation: {},
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  configured_live_threshold: 0.55,
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  mutation_proof: { status: "not_run", mutations: [] },
  artifact_paths: {}
};
const PHASE_B83421_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b83421_direction_mismatch_attribution_execution_side_provenance_audit",
  source_b834_batch_id: null,
  source_b8342_batch_id: null,
  source_b8342_status: "not_run",
  source_b8342_root_cause: "not_run",
  source_b8342_direction_mismatch_count: 0,
  source_b8342_direction_join_parity_status: "not_run",
  source_config_id: null,
  source_config_sha256: null,
  transform_rule_version: null,
  transform_rule_sha256: null,
  ledger_generation_code_version_or_hash: null,
  artifact_created_at_utc: null,
  execution_direction_transform_provenance: "UNAVAILABLE",
  execution_direction_provenance_status: "not_run",
  historical_transform_provenance_status: "not_run",
  historical_transform_provenance_classification: "not_run",
  historical_binding_available: false,
  historical_root_cause_proven: false,
  current_code_diagnostic_status: "not_run",
  current_code_rule_path: null,
  current_code_rule_hash: null,
  current_code_config_binding_status: "not_run",
  current_code_transform_result: {},
  direction_inventory_status: "not_run",
  direction_join_parity_status: "not_run",
  joined_trade_count: 0,
  direction_match_count: 0,
  direction_mismatch_count: 0,
  candidate_buy_trade_sell_count: 0,
  candidate_sell_trade_buy_count: 0,
  candidate_flat_with_trade_count: 0,
  identity_match_count: 0,
  invert_match_count: 0,
  explicit_execution_direction_match_count: 0,
  unresolved_count: 0,
  direction_mismatch_count_after_proven_transform: 0,
  direction_inventory: {},
  direction_attribution_rows: [],
  source_config_provenance: {},
  transform_rule_provenance: {},
  normalized_sidecar_publish_status: "not_run",
  normalized_sidecar_manifest_sha256: null,
  normalized_ledger_attestation: {},
  prior_artifact_mutation_proof_status: "not_run",
  mutation_proof: { status: "not_run", mutations: [] },
  b836_source_proof_status: "not_ready",
  root_cause_classification: "not_run",
  blockers: [],
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  configured_live_threshold: 0.55,
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  artifact_paths: {}
};
const PHASE_B8343_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b8343_provenance_complete_reproducible_ledger_baseline_rebuild",
  lineage_scope: "NEW_REPRODUCIBLE_PROVENANCE_COMPLETE_BASELINE",
  historical_lineage_repair: false,
  historical_root_cause_proven: false,
  configured_live_threshold: 0.55,
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  source_raw_sidecar_batch_id: null,
  source_raw_sidecar_manifest_sha256: null,
  raw_sidecar_attestation_status: "not_run",
  feature_pipeline_attestation_status: "not_run",
  feature_leakage_check_status: "not_run",
  source_config_attestation_status: "not_run",
  rule_provenance_status: "not_run",
  model_payload_attestation_status: "not_run",
  prediction_payload_attestation_status: "not_run",
  candidate_event_id_provenance_status: "not_run",
  trade_event_id_provenance_status: "not_run",
  direction_join_parity_status: "not_run",
  timestamp_semantics_status: "not_run",
  chronology_integrity_status: "not_run",
  deterministic_replay_status: "not_run",
  deterministic_replay_mismatch_count: null,
  normalized_ledger_attestation_status: "not_run",
  prior_artifact_mutation_proof_status: "not_run",
  prior_artifact_mutation_count: 0,
  normalized_sidecar_publish_status: "not_run",
  joined_trade_count: 0,
  direction_match_count: 0,
  direction_mismatch_count: 0,
  candidate_event_id_null_count: 0,
  candidate_event_id_duplicate_count: 0,
  trade_event_id_null_count: 0,
  trade_event_id_duplicate_count: 0,
  orphan_trade_count: 0,
  duplicate_join_count: 0,
  chronology_violation_count: 0,
  candidate_ledger_sha256: null,
  trade_ledger_sha256: null,
  sidecar_manifest_sha256: null,
  per_family_funnel: [],
  raw_sidecar_attestation: [],
  model_payload_hashes: {},
  prediction_payload_hashes: {},
  blockers: [],
  mutation_proof: { status: "not_run", mutations: [] },
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  artifact_paths: {}
};
const PHASE_B83431_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b83431_manifest_bound_trigger_provenance_complete_baseline_rebuild",
  lineage_scope: "NEW_TRIGGER_PROVENANCE_COMPLETE_BASELINE",
  parent_lineage_scope: "NEW_REPRODUCIBLE_PROVENANCE_COMPLETE_BASELINE",
  parent_b8343_batch_id: "phase_b8_3_4_3_20260608_074825",
  source_b8343_batch_id: "phase_b8_3_4_3_20260608_074825",
  source_b83431_batch_id: null,
  source_b836_batch_id: null,
  source_lineage_kind: "NEW_REPRODUCIBLE_PROVENANCE_COMPLETE_BASELINE",
  historical_lineage_repair: false,
  historical_root_cause_proven: false,
  configured_live_threshold: 0.55,
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  raw_sidecar_attestation_status: "not_run",
  source_config_attestation_status: "not_run",
  rule_provenance_status: "not_run",
  trigger_rule_binding_status: "not_run",
  trigger_rule_attestation_status: "not_run",
  feature_pipeline_attestation_status: "not_run",
  feature_leakage_check_status: "not_run",
  trigger_input_schema_status: "not_run",
  trigger_input_integrity_status: "not_run",
  persisted_vs_recomputed_trigger_parity_status: "not_run",
  deterministic_trigger_replay_status: "not_run",
  sequential_funnel_wiring_status: "not_run",
  normalized_ledger_attestation_status: "not_run",
  prior_artifact_mutation_proof_status: "not_run",
  normalized_sidecar_publish_status: "not_run",
  source_raw_sidecar_batch_id: null,
  source_raw_sidecar_manifest_path: null,
  source_raw_sidecar_manifest_sha256: null,
  source_manifest_binding: {},
  raw_timestamp_normalization: "UTC",
  raw_closed_bars_only: true,
  feature_schema_sha256: null,
  feature_frame_sha256: null,
  trigger_input_frame_sha256: null,
  trigger_rule_provenance: [],
  trigger_rule_attestation: {},
  trigger_input_attestation: {},
  deterministic_trigger_replay_proof: {},
  per_family_funnel: [],
  per_family_funnel_hash: null,
  ledger_attestation: {},
  sequential_funnel: [],
  first_failing_gate_waterfall: [],
  mutation_proof: { status: "not_run", mutations: [] },
  blockers: [],
  artifact_paths: {},
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" }
};
const PHASE_B83432_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b83432_versioned_trigger_rule_specification_replayable_baseline_repair",
  lineage_scope: "NEW_VERSIONED_TRIGGER_RULE_BASELINE",
  source_parent_lineage_scope: "NEW_REPRODUCIBLE_PROVENANCE_COMPLETE_BASELINE",
  source_parent_b8343_batch_id: "phase_b8_3_4_3_20260608_074825",
  diagnostic_parent_b83431_batch_id: null,
  historical_lineage_repair: false,
  historical_root_cause_proven: false,
  configured_live_threshold: 0.55,
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  trigger_input_materialization_source: "not_run",
  trigger_input_materialization_status: "not_run",
  trigger_rule_binding_status: "not_run",
  trigger_rule_attestation_status: "not_run",
  trigger_input_schema_status: "not_run",
  trigger_input_integrity_status: "not_run",
  persisted_vs_recomputed_trigger_parity_status: "not_run",
  deterministic_trigger_replay_status: "not_run",
  sequential_funnel_wiring_status: "not_run",
  normalized_ledger_attestation_status: "not_run",
  prior_artifact_mutation_proof_status: "not_run",
  normalized_sidecar_publish_status: "not_run",
  trigger_input_frame_sha256: null,
  raw_prediction_dtype: null,
  raw_prediction_null_count: 0,
  raw_prediction_unknown_value_count: 0,
  raw_prediction_ambiguous_value_count: 0,
  trigger_source_inventory: [],
  trigger_rule_provenance: [],
  trigger_rule_attestation: {},
  trigger_input_attestation: {},
  deterministic_trigger_replay_proof: {},
  ledger_attestation: {},
  sequential_funnel: [],
  first_failing_gate_waterfall: [],
  mutation_proof: { status: "not_run", mutations: [] },
  blockers: [],
  artifact_paths: {},
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" }
};
const PHASE_B835_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b835_temporal_calibration_locked_oos_threshold_policy_audit",
  source_b834_batch_id: null,
  lineage_scope: "not_run",
  split_policy_version: "B835_INNER_VALIDATION_50_CALIBRATION_GLOBAL_MAX_LOOKAHEAD_PURGE_V1",
  temporal_split_status: "not_run",
  global_purge_gap: 0,
  source_configs_inspected: [],
  split_proof: {},
  identical_family_boundary_policy_status: "not_run",
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  locked_confirmation_metadata_proof: { status: "not_run", row_consumption_count: 0 },
  configured_live_threshold: 0.55,
  threshold_candidates: [0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
  threshold_selection_status: "not_run",
  raw_policy_metrics_status: "not_run",
  diagnostic_calibration_status: "not_run",
  validation_replay_status: "not_run",
  frozen_policy_count: 0,
  root_cause_classification: "not_run",
  blockers: [],
  raw_policy_metrics: [],
  diagnostic_calibration_metrics: [],
  frozen_policies: [],
  validation_results: [],
  directional_gate_summary: [],
  regime_stability_summary: [],
  realistic_metrics_proof: { status: "not_run", metric_source: "closed_executed_trades_only" },
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  mutation_proof: { status: "not_run", mutations: [] },
  artifact_paths: {}
};
const PHASE_B836_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b836_temporal_candidate_distribution_gate_failure_decomposition_audit",
  source_b835_batch_id: null,
  source_b834_batch_id: null,
  audit_lineage_scope: "not_run",
  historical_root_cause_proven: false,
  configured_live_threshold: 0.55,
  split_policy_version: "B835_INNER_VALIDATION_50_CALIBRATION_GLOBAL_MAX_LOOKAHEAD_PURGE_V1",
  global_purge_gap_rows: 0,
  source_config_lookaheads: [],
  shared_boundary_consistency_status: "not_run",
  timestamp_normalization_status: "not_run",
  purge_exclusion_status: "not_run",
  region_assignment_status: "not_run",
  candidate_ledger_join_status: "not_run",
  trade_ledger_join_status: "not_run",
  event_id_integrity_status: "not_run",
  ledger_hash_verification_status: "not_run",
  b834_ledger_hash_verification: {},
  frontend_grouping_render_status: "not_run",
  candidate_distribution_status: "not_run",
  gate_failure_decomposition_status: "not_run",
  root_cause_classification: "not_run",
  secondary_causes: [],
  per_family_region_distribution: [],
  per_family_gate_failure_waterfall: [],
  per_family_time_bucket_histograms: [],
  outside_expected_range_count: 0,
  join_integrity_summary: {},
  split_proof: {},
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  mutation_proof_status: "not_run",
  mutation_proof: { status: "not_run", mutations: [] },
  sidecar_publish_status: "not_run",
  blockers: [],
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  artifact_paths: {}
};
const PHASE_B8361_EMPTY_RESULT = {
  status: "empty",
  phase: "phase_b8361_trigger_gate_provenance_sequential_funnel_wiring_audit",
  audit_only: true,
  trigger_rule_provenance_status: "not_run",
  trigger_input_integrity_status: "not_run",
  persisted_vs_recomputed_trigger_parity_status: "not_run",
  deterministic_trigger_replay_status: "not_run",
  sequential_funnel_wiring_status: "not_run",
  root_cause_classification: "not_run",
  secondary_causes: [],
  trigger_rule_provenance: [],
  trigger_input_audit: [],
  persisted_vs_recomputed_trigger_audit: [],
  sequential_funnel: [],
  first_failing_gate_waterfall: [],
  source_artifact_attestation: {},
  persisted_trigger_pass_count: 0,
  recomputed_trigger_pass_count: 0,
  recomputed_trigger_pass_count_replay_2: 0,
  persisted_vs_recomputed_trigger_mismatch_count: 0,
  replay_1_vs_replay_2_trigger_mismatch_count: 0,
  mutation_proof_status: "not_run",
  mutation_proof: { status: "not_run", mutations: [] },
  blockers: [],
  sidecar_publish_status: "not_run",
  locked_confirmation_status: "unopened",
  locked_confirmation_row_consumption_count: 0,
  configured_live_threshold: 0.55,
  b81_rerun_readiness: { status: "not_ready", reason: "not run yet" },
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
  artifact_paths: {}
};
function Spotlight({
  children,
  className = ""
}) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: divRef,
      onMouseMove: handleMouseMove,
      onMouseEnter: () => setOpacity(0.12),
      onMouseLeave: () => setOpacity(0),
      className: `relative overflow-hidden ${className}`,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "pointer-events-none absolute -inset-px transition-opacity duration-300",
            style: {
              opacity,
              background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(212, 175, 55, 0.15), transparent 80%)`
            }
          }
        ),
        children
      ]
    }
  );
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
  return /* @__PURE__ */ jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${map}`,
      children: [
        /* @__PURE__ */ jsxs("span", { className: "relative flex h-1.5 w-1.5", children: [
          active && /* @__PURE__ */ jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex h-1.5 w-1.5 rounded-full bg-current" })
        ] }),
        label
      ]
    }
  );
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
  const items = [
    {
      sym: tickerSymbol,
      px: bid != null ? formatPrice(bid) : "Unavailable",
      chg: mt5Online ? "live" : "offline",
      up: mt5Online
    },
    {
      sym: `${symbol} Ask`,
      px: ask != null ? formatPrice(ask) : "Unavailable",
      chg: `Spread ${(spread ?? 0).toFixed(2)}`,
      up: true
    },
    ...["DXY", "US10Y", "BTC/USD", "SPX", "WTI", "EUR/USD", "VIX"].map((key) => {
      const feed = feeds?.[key];
      return {
        sym: key,
        px: feed?.price ?? "Unavailable",
        chg: feed?.change ?? "no endpoint",
        up: feed ? feed.up : false
      };
    })
  ];
  const row = /* @__PURE__ */ jsx("div", { className: "flex shrink-0 items-center gap-10 px-6", children: items.map((item, i) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: "flex items-center gap-2 whitespace-nowrap font-mono-num text-[11px]",
      children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground", children: item.sym }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: item.px }),
        /* @__PURE__ */ jsx("span", { className: item.up ? "text-[oklch(0.78_0.18_155)]" : "text-[oklch(0.72_0.20_22)]", children: item.chg }),
        /* @__PURE__ */ jsx("span", { className: "text-border", children: "·" })
      ]
    },
    `${item.sym}-${i}`
  )) });
  return /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden border-b border-border/60 bg-background/60 py-2 backdrop-blur-xl", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" }),
    /* @__PURE__ */ jsxs("div", { className: "ticker-track", children: [
      row,
      row
    ] })
  ] });
}
function SectionCard({
  title,
  icon: Icon,
  right,
  children,
  className = "",
  numeral
}) {
  return /* @__PURE__ */ jsx(
    Spotlight,
    {
      className: `corner-ornaments foil-grain sheen-sweep border-trace relative overflow-hidden rounded-2xl border border-border bg-gradient-surface shadow-elegant ${className}`,
      children: /* @__PURE__ */ jsxs("section", { className: "relative", children: [
        /* @__PURE__ */ jsxs("header", { className: "relative z-[2] flex items-center justify-between border-b border-border/60 px-5 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            numeral && /* @__PURE__ */ jsxs("span", { className: "font-serif text-[10px] uppercase tracking-[0.18em] text-muted-foreground/65", children: [
              numeral,
              " //"
            ] }),
            Icon && /* @__PURE__ */ jsx(Icon, { className: "h-4.5 w-4.5 text-muted-foreground" }),
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold tracking-tight text-foreground", children: title })
          ] }),
          right && /* @__PURE__ */ jsx("div", { className: "relative z-10 flex items-center gap-2", children: right })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "relative z-[2] p-5", children })
      ] })
    }
  );
}
function Input(props) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      className: `h-9 rounded-lg border border-border bg-background/60 px-3 font-mono-num text-sm text-foreground outline-none transition disabled:cursor-not-allowed disabled:opacity-55 focus:border-[oklch(0.88_0.018_95/0.5)] focus:ring-2 focus:ring-[oklch(0.88_0.018_95/0.15)] ${props.className ?? ""}`
    }
  );
}
function DataState({ message }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground border border-dashed border-border/40 rounded-xl bg-background/20", children: [
    /* @__PURE__ */ jsx(Bot, { className: "h-8 w-8 opacity-40 mb-2 animate-bounce" }),
    /* @__PURE__ */ jsx("span", { children: message })
  ] });
}
function compactHash(value) {
  if (!value) return "Unavailable";
  return value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}
function newIdempotencyKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}
function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
function formatNullableNumber(value, digits = 2) {
  return value == null || Number.isNaN(value) ? "N/A" : value.toFixed(digits);
}
function formatNullablePercent(value, digits = 2) {
  return value == null || Number.isNaN(value) ? "N/A" : `${(value * 100).toFixed(digits)}%`;
}
function formatNullableSigned(value) {
  return value == null || Number.isNaN(value) ? "N/A" : formatSigned(value);
}
function TrainPage() {
  const [data, setData] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [autoRefresh] = useState(true);
  const [refreshIntervalSeconds] = useState(DEFAULT_REFRESH_INTERVAL);
  const [trainingCandles, setTrainingCandles] = useState(2e4);
  const [trainTrendThreshold, setTrainTrendThreshold] = useState(0.55);
  const [trainEntryThreshold, setTrainEntryThreshold] = useState(0.55);
  const [trainRiskThreshold, setTrainRiskThreshold] = useState(0.55);
  const [trainMinConfidence, setTrainMinConfidence] = useState(20);
  const [trainMaxSpread, setTrainMaxSpread] = useState(5);
  const [trainDebugMode, setTrainDebugMode] = useState(true);
  const [trainingJobId, setTrainingJobId] = useState(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingState, setTrainingState] = useState(null);
  const [trainingPending, setTrainingPending] = useState(false);
  const [trainingError, setTrainingError] = useState(null);
  const [sweepPending, setSweepPending] = useState(false);
  const [sweepError, setSweepError] = useState(null);
  const [sweepResult, setSweepResult] = useState(null);
  const [sweepSortKey, setSweepSortKey] = useState("profit_factor");
  const [sweepShortlistOnly, setSweepShortlistOnly] = useState(false);
  const [phaseAResult, setPhaseAResult] = useState(null);
  const [phaseAJobId, setPhaseAJobId] = useState(null);
  const [phaseAState, setPhaseAState] = useState(null);
  const [phaseAProgress, setPhaseAProgress] = useState(0);
  const [phaseAPending, setPhaseAPending] = useState(false);
  const [phaseAError, setPhaseAError] = useState(null);
  const [phaseAAnchorCount, setPhaseAAnchorCount] = useState(6e3);
  const [phaseAMaxRuns, setPhaseAMaxRuns] = useState(18);
  const [brokerEconomics, setBrokerEconomics] = useState(null);
  const [phaseA1Result, setPhaseA1Result] = useState(null);
  const [phaseA1JobId, setPhaseA1JobId] = useState(null);
  const [phaseA1State, setPhaseA1State] = useState(null);
  const [phaseA1Progress, setPhaseA1Progress] = useState(0);
  const [phaseA1Pending, setPhaseA1Pending] = useState(false);
  const [phaseA1Error, setPhaseA1Error] = useState(null);
  const [phaseA1AnchorCount, setPhaseA1AnchorCount] = useState(6e3);
  const [phaseA1MaxRuns, setPhaseA1MaxRuns] = useState(18);
  const [phaseBResult, setPhaseBResult] = useState(null);
  const [phaseBJobId, setPhaseBJobId] = useState(null);
  const [phaseBState, setPhaseBState] = useState(null);
  const [phaseBProgress, setPhaseBProgress] = useState(0);
  const [phaseBPending, setPhaseBPending] = useState(false);
  const [phaseBError, setPhaseBError] = useState(null);
  const [phaseBAnchorCount, setPhaseBAnchorCount] = useState(6e3);
  const [phaseBQualityRuns, setPhaseBQualityRuns] = useState(20);
  const [phaseB3Result, setPhaseB3Result] = useState(null);
  const [phaseB3JobId, setPhaseB3JobId] = useState(null);
  const [phaseB3State, setPhaseB3State] = useState(null);
  const [phaseB3Progress, setPhaseB3Progress] = useState(0);
  const [phaseB3Pending, setPhaseB3Pending] = useState(false);
  const [phaseB3Error, setPhaseB3Error] = useState(null);
  const [phaseB3AnchorCount, setPhaseB3AnchorCount] = useState(6e3);
  const [phaseB3RobustnessRuns, setPhaseB3RobustnessRuns] = useState(24);
  const [phaseB4Result, setPhaseB4Result] = useState(null);
  const [phaseB4JobId, setPhaseB4JobId] = useState(null);
  const [phaseB4State, setPhaseB4State] = useState(null);
  const [phaseB4Progress, setPhaseB4Progress] = useState(0);
  const [phaseB4Pending, setPhaseB4Pending] = useState(false);
  const [phaseB4Error, setPhaseB4Error] = useState(null);
  const [phaseB4AnchorCount, setPhaseB4AnchorCount] = useState(2e4);
  const [phaseB4MatrixRuns, setPhaseB4MatrixRuns] = useState(24);
  const [phaseB5Result, setPhaseB5Result] = useState(null);
  const [phaseB5JobId, setPhaseB5JobId] = useState(null);
  const [phaseB5State, setPhaseB5State] = useState(null);
  const [phaseB5Progress, setPhaseB5Progress] = useState(0);
  const [phaseB5Pending, setPhaseB5Pending] = useState(false);
  const [phaseB5Error, setPhaseB5Error] = useState(null);
  const [phaseB5AnchorCount, setPhaseB5AnchorCount] = useState(2e4);
  const [phaseB5MatrixRuns, setPhaseB5MatrixRuns] = useState(18);
  const [phaseB51Result, setPhaseB51Result] = useState(null);
  const [phaseB51JobId, setPhaseB51JobId] = useState(null);
  const [phaseB51State, setPhaseB51State] = useState(null);
  const [phaseB51Progress, setPhaseB51Progress] = useState(0);
  const [phaseB51Pending, setPhaseB51Pending] = useState(false);
  const [phaseB51Error, setPhaseB51Error] = useState(null);
  const [phaseB51AnchorCount, setPhaseB51AnchorCount] = useState(2e4);
  const [phaseB52Result, setPhaseB52Result] = useState(null);
  const [phaseB52JobId, setPhaseB52JobId] = useState(null);
  const [phaseB52State, setPhaseB52State] = useState(null);
  const [phaseB52Progress, setPhaseB52Progress] = useState(0);
  const [phaseB52Pending, setPhaseB52Pending] = useState(false);
  const [phaseB52Error, setPhaseB52Error] = useState(null);
  const [phaseB52AnchorCount, setPhaseB52AnchorCount] = useState(2e4);
  const [phaseB6Result, setPhaseB6Result] = useState(null);
  const [phaseB6JobId, setPhaseB6JobId] = useState(null);
  const [phaseB6State, setPhaseB6State] = useState(null);
  const [phaseB6Progress, setPhaseB6Progress] = useState(0);
  const [phaseB6Pending, setPhaseB6Pending] = useState(false);
  const [phaseB6Error, setPhaseB6Error] = useState(null);
  const [phaseB6AnchorCount, setPhaseB6AnchorCount] = useState(6e4);
  const [phaseB6MatrixRuns, setPhaseB6MatrixRuns] = useState(30);
  const [phaseB7Result, setPhaseB7Result] = useState(null);
  const [phaseB7JobId, setPhaseB7JobId] = useState(null);
  const [phaseB7State, setPhaseB7State] = useState(null);
  const [phaseB7Progress, setPhaseB7Progress] = useState(0);
  const [phaseB7Pending, setPhaseB7Pending] = useState(false);
  const [phaseB7Error, setPhaseB7Error] = useState(null);
  const [phaseB7Stage, setPhaseB7Stage] = useState(null);
  const [phaseB7Heartbeat, setPhaseB7Heartbeat] = useState(null);
  const [phaseB8Result, setPhaseB8Result] = useState(null);
  const [phaseB8JobId, setPhaseB8JobId] = useState(null);
  const [phaseB8State, setPhaseB8State] = useState(null);
  const [phaseB8Progress, setPhaseB8Progress] = useState(0);
  const [phaseB8Pending, setPhaseB8Pending] = useState(false);
  const [phaseB8Error, setPhaseB8Error] = useState(null);
  const [phaseB8Stage, setPhaseB8Stage] = useState(null);
  const [phaseB8Heartbeat, setPhaseB8Heartbeat] = useState(null);
  const [phaseB81Result, setPhaseB81Result] = useState(null);
  const [phaseB81JobId, setPhaseB81JobId] = useState(null);
  const [phaseB81State, setPhaseB81State] = useState(null);
  const [phaseB81Progress, setPhaseB81Progress] = useState(0);
  const [phaseB81Pending, setPhaseB81Pending] = useState(false);
  const [phaseB81Error, setPhaseB81Error] = useState(null);
  const [phaseB81Stage, setPhaseB81Stage] = useState(null);
  const [phaseB81Heartbeat, setPhaseB81Heartbeat] = useState(null);
  const [phaseB82Result, setPhaseB82Result] = useState(null);
  const [phaseB82JobId, setPhaseB82JobId] = useState(null);
  const [phaseB82State, setPhaseB82State] = useState(null);
  const [phaseB82Progress, setPhaseB82Progress] = useState(0);
  const [phaseB82Pending, setPhaseB82Pending] = useState(false);
  const [phaseB82Error, setPhaseB82Error] = useState(null);
  const [phaseB82Stage, setPhaseB82Stage] = useState(null);
  const [phaseB82Heartbeat, setPhaseB82Heartbeat] = useState(null);
  const [phaseB83Result, setPhaseB83Result] = useState(
    PHASE_B83_EMPTY_RESULT
  );
  const [phaseB83JobId, setPhaseB83JobId] = useState(null);
  const [phaseB83State, setPhaseB83State] = useState(null);
  const [phaseB83Progress, setPhaseB83Progress] = useState(0);
  const [phaseB83Pending, setPhaseB83Pending] = useState(false);
  const [phaseB83Error, setPhaseB83Error] = useState(null);
  const [phaseB83Stage, setPhaseB83Stage] = useState(null);
  const [phaseB83Heartbeat, setPhaseB83Heartbeat] = useState(null);
  const [phaseB831Result, setPhaseB831Result] = useState(
    PHASE_B831_EMPTY_RESULT
  );
  const [phaseB831JobId, setPhaseB831JobId] = useState(null);
  const [phaseB831State, setPhaseB831State] = useState(null);
  const [phaseB831Progress, setPhaseB831Progress] = useState(0);
  const [phaseB831Pending, setPhaseB831Pending] = useState(false);
  const [phaseB831Error, setPhaseB831Error] = useState(null);
  const [phaseB831Stage, setPhaseB831Stage] = useState(null);
  const [phaseB831Heartbeat, setPhaseB831Heartbeat] = useState(null);
  const [phaseB832Result, setPhaseB832Result] = useState(
    PHASE_B832_EMPTY_RESULT
  );
  const [phaseB832JobId, setPhaseB832JobId] = useState(null);
  const [phaseB832State, setPhaseB832State] = useState(null);
  const [phaseB832Progress, setPhaseB832Progress] = useState(0);
  const [phaseB832Pending, setPhaseB832Pending] = useState(false);
  const [phaseB832Error, setPhaseB832Error] = useState(null);
  const [phaseB832Stage, setPhaseB832Stage] = useState(null);
  const [phaseB832Heartbeat, setPhaseB832Heartbeat] = useState(null);
  const [phaseB833Result, setPhaseB833Result] = useState(
    PHASE_B833_EMPTY_RESULT
  );
  const [phaseB833JobId, setPhaseB833JobId] = useState(null);
  const [phaseB833State, setPhaseB833State] = useState(null);
  const [phaseB833Progress, setPhaseB833Progress] = useState(0);
  const [phaseB833Pending, setPhaseB833Pending] = useState(false);
  const [phaseB833Error, setPhaseB833Error] = useState(null);
  const [phaseB833Stage, setPhaseB833Stage] = useState(null);
  const [phaseB833Heartbeat, setPhaseB833Heartbeat] = useState(null);
  const [phaseB834Result, setPhaseB834Result] = useState(
    PHASE_B834_EMPTY_RESULT
  );
  const [phaseB834JobId, setPhaseB834JobId] = useState(null);
  const [phaseB834State, setPhaseB834State] = useState(null);
  const [phaseB834Progress, setPhaseB834Progress] = useState(0);
  const [phaseB834Pending, setPhaseB834Pending] = useState(false);
  const [phaseB834Error, setPhaseB834Error] = useState(null);
  const [phaseB834Stage, setPhaseB834Stage] = useState(null);
  const [phaseB834Heartbeat, setPhaseB834Heartbeat] = useState(null);
  const [phaseB8341Result, setPhaseB8341Result] = useState(
    PHASE_B8341_EMPTY_RESULT
  );
  const [phaseB8341JobId, setPhaseB8341JobId] = useState(null);
  const [phaseB8341State, setPhaseB8341State] = useState(null);
  const [phaseB8341Progress, setPhaseB8341Progress] = useState(0);
  const [phaseB8341Pending, setPhaseB8341Pending] = useState(false);
  const [phaseB8341Error, setPhaseB8341Error] = useState(null);
  const [phaseB8341Stage, setPhaseB8341Stage] = useState(null);
  const [phaseB8341Heartbeat, setPhaseB8341Heartbeat] = useState(null);
  const [phaseB8342Result, setPhaseB8342Result] = useState(
    PHASE_B8342_EMPTY_RESULT
  );
  const [phaseB8342JobId, setPhaseB8342JobId] = useState(null);
  const [phaseB8342State, setPhaseB8342State] = useState(null);
  const [phaseB8342Progress, setPhaseB8342Progress] = useState(0);
  const [phaseB8342Pending, setPhaseB8342Pending] = useState(false);
  const [phaseB8342Error, setPhaseB8342Error] = useState(null);
  const [phaseB8342Stage, setPhaseB8342Stage] = useState(null);
  const [phaseB8342Heartbeat, setPhaseB8342Heartbeat] = useState(null);
  const [phaseB83421Result, setPhaseB83421Result] = useState(
    PHASE_B83421_EMPTY_RESULT
  );
  const [phaseB83421JobId, setPhaseB83421JobId] = useState(null);
  const [phaseB83421State, setPhaseB83421State] = useState(null);
  const [phaseB83421Progress, setPhaseB83421Progress] = useState(0);
  const [phaseB83421Pending, setPhaseB83421Pending] = useState(false);
  const [phaseB83421Error, setPhaseB83421Error] = useState(null);
  const [phaseB83421Stage, setPhaseB83421Stage] = useState(null);
  const [phaseB83421Heartbeat, setPhaseB83421Heartbeat] = useState(null);
  const [phaseB8343Result, setPhaseB8343Result] = useState(
    PHASE_B8343_EMPTY_RESULT
  );
  const [phaseB8343JobId, setPhaseB8343JobId] = useState(null);
  const [phaseB8343State, setPhaseB8343State] = useState(null);
  const [phaseB8343Progress, setPhaseB8343Progress] = useState(0);
  const [phaseB8343Pending, setPhaseB8343Pending] = useState(false);
  const [phaseB8343Error, setPhaseB8343Error] = useState(null);
  const [phaseB8343Stage, setPhaseB8343Stage] = useState(null);
  const [phaseB8343Heartbeat, setPhaseB8343Heartbeat] = useState(null);
  const [phaseB83431Result, setPhaseB83431Result] = useState(
    PHASE_B83431_EMPTY_RESULT
  );
  const [phaseB83431JobId, setPhaseB83431JobId] = useState(null);
  const [phaseB83431State, setPhaseB83431State] = useState(null);
  const [phaseB83431Progress, setPhaseB83431Progress] = useState(0);
  const [phaseB83431Pending, setPhaseB83431Pending] = useState(false);
  const [phaseB83431Error, setPhaseB83431Error] = useState(null);
  const [phaseB83431Stage, setPhaseB83431Stage] = useState(null);
  const [phaseB83431Heartbeat, setPhaseB83431Heartbeat] = useState(null);
  const [phaseB83432Result, setPhaseB83432Result] = useState(
    PHASE_B83432_EMPTY_RESULT
  );
  const [phaseB83432JobId, setPhaseB83432JobId] = useState(null);
  const [phaseB83432State, setPhaseB83432State] = useState(null);
  const [phaseB83432Progress, setPhaseB83432Progress] = useState(0);
  const [phaseB83432Pending, setPhaseB83432Pending] = useState(false);
  const [phaseB83432Error, setPhaseB83432Error] = useState(null);
  const [phaseB83432Stage, setPhaseB83432Stage] = useState(null);
  const [phaseB83432Heartbeat, setPhaseB83432Heartbeat] = useState(null);
  const [phaseB835Result, setPhaseB835Result] = useState(
    PHASE_B835_EMPTY_RESULT
  );
  const [phaseB835JobId, setPhaseB835JobId] = useState(null);
  const [phaseB835State, setPhaseB835State] = useState(null);
  const [phaseB835Progress, setPhaseB835Progress] = useState(0);
  const [phaseB835Pending, setPhaseB835Pending] = useState(false);
  const [phaseB835Error, setPhaseB835Error] = useState(null);
  const [phaseB835Stage, setPhaseB835Stage] = useState(null);
  const [phaseB835Heartbeat, setPhaseB835Heartbeat] = useState(null);
  const [phaseB836Result, setPhaseB836Result] = useState(
    PHASE_B836_EMPTY_RESULT
  );
  const [phaseB836JobId, setPhaseB836JobId] = useState(null);
  const [phaseB836State, setPhaseB836State] = useState(null);
  const [phaseB836Progress, setPhaseB836Progress] = useState(0);
  const [phaseB836Pending, setPhaseB836Pending] = useState(false);
  const [phaseB836Error, setPhaseB836Error] = useState(null);
  const [phaseB836Stage, setPhaseB836Stage] = useState(null);
  const [phaseB836Heartbeat, setPhaseB836Heartbeat] = useState(null);
  const [phaseB8361Result, setPhaseB8361Result] = useState(
    PHASE_B8361_EMPTY_RESULT
  );
  const [phaseB8361JobId, setPhaseB8361JobId] = useState(null);
  const [phaseB8361State, setPhaseB8361State] = useState(null);
  const [phaseB8361Progress, setPhaseB8361Progress] = useState(0);
  const [phaseB8361Pending, setPhaseB8361Pending] = useState(false);
  const [phaseB8361Error, setPhaseB8361Error] = useState(null);
  const [phaseB8361Stage, setPhaseB8361Stage] = useState(null);
  const [phaseB8361Heartbeat, setPhaseB8361Heartbeat] = useState(null);
  const [promoteTarget, setPromoteTarget] = useState(null);
  const [promoting, setPromoting] = useState(false);
  const [rejectingCandidate, setRejectingCandidate] = useState(false);
  const { capabilities, refreshCapabilities } = useCapabilities(
    autoRefresh,
    refreshIntervalSeconds
  );
  const fetchData = useCallback(async () => {
    try {
      const statusRes = await fetch(`${API_V1_BASE}/status`);
      if (!statusRes.ok) throw new Error(`/status endpoint failed`);
      const statusJson = await statusRes.json();
      setData(statusJson);
      setApiError(null);
      const modelRes = await fetch(`${API_V1_BASE}/model/status`);
      if (modelRes.ok) {
        const modelJson = await modelRes.value?.json?.() || await modelRes.json();
        setModelStatus(modelJson);
        if (modelJson.training_in_progress && modelJson.current_job_id) {
          setTrainingJobId(modelJson.current_job_id);
        }
      }
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  }, []);
  const refreshPhaseA = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-a/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseAResult(payload);
    } catch (error) {
      console.error("Phase A latest refresh failed", error);
    }
  }, []);
  const refreshBrokerEconomics = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/broker-economics`);
      if (!response.ok) return;
      setBrokerEconomics(await response.json());
    } catch (error) {
      console.error("Broker economics refresh failed", error);
    }
  }, []);
  const refreshPhaseA1 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-a1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseA1Result(payload);
    } catch (error) {
      console.error("Phase A.1 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseBResult(payload);
    } catch (error) {
      console.error("Phase B latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB3 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b3/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB3Result(payload);
    } catch (error) {
      console.error("Phase B.3 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB4 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b4/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB4Result(payload);
    } catch (error) {
      console.error("Phase B.4 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB5 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB5Result(payload);
    } catch (error) {
      console.error("Phase B.5 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB51 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5-1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB51Result(payload);
    } catch (error) {
      console.error("Phase B.5.1 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB52 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5-2/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB52Result(payload);
    } catch (error) {
      console.error("Phase B.5.2 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB6 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b6/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB6Result(payload);
    } catch (error) {
      console.error("Phase B.6 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB7 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b7/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB7Result(payload);
    } catch (error) {
      console.error("Phase B.7 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB8 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB8Result(payload);
    } catch (error) {
      console.error("Phase B.8 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB81 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB81Result(payload);
    } catch (error) {
      console.error("Phase B.8.1 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB82 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-2/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB82Result(payload);
    } catch (error) {
      console.error("Phase B.8.2 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB83 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB83Result(payload);
    } catch (error) {
      console.error("Phase B.8.3 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB831 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB831Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.1 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB832 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-2/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB832Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.2 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB833 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-3/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB833Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.3 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB834 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB834Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB8341 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB8341Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.1 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB8342 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-2/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB8342Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.2 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB83421 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-2-1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB83421Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.2.1 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB8343 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB8343Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.3 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB83431 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3-1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB83431Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.3.1 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB83432 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3-2/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB83432Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.3.2 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB835 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-5/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB835Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.5 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB836 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-6/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB836Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.6 latest refresh failed", error);
    }
  }, []);
  const refreshPhaseB8361 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-6-1/latest`);
      if (!response.ok) return;
      const payload = await response.json();
      setPhaseB8361Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.6.1 latest refresh failed", error);
    }
  }, []);
  useEffect(() => {
    void fetchData();
    void refreshPhaseA();
    void refreshBrokerEconomics();
    void refreshPhaseA1();
    void refreshPhaseB();
    void refreshPhaseB3();
    void refreshPhaseB4();
    void refreshPhaseB5();
    void refreshPhaseB51();
    void refreshPhaseB52();
    void refreshPhaseB6();
    void refreshPhaseB7();
    void refreshPhaseB8();
    void refreshPhaseB81();
    void refreshPhaseB82();
    void refreshPhaseB83();
    void refreshPhaseB831();
    void refreshPhaseB832();
    void refreshPhaseB833();
    void refreshPhaseB834();
    void refreshPhaseB8341();
    void refreshPhaseB8342();
    void refreshPhaseB83421();
    void refreshPhaseB8343();
    void refreshPhaseB83431();
    void refreshPhaseB83432();
    void refreshPhaseB835();
    void refreshPhaseB836();
    void refreshPhaseB8361();
    const interval = window.setInterval(() => void fetchData(), refreshIntervalSeconds * 1e3);
    return () => window.clearInterval(interval);
  }, [
    fetchData,
    refreshBrokerEconomics,
    refreshIntervalSeconds,
    refreshPhaseA,
    refreshPhaseA1,
    refreshPhaseB,
    refreshPhaseB3,
    refreshPhaseB4,
    refreshPhaseB5,
    refreshPhaseB51,
    refreshPhaseB52,
    refreshPhaseB6,
    refreshPhaseB7,
    refreshPhaseB8,
    refreshPhaseB81,
    refreshPhaseB82,
    refreshPhaseB83,
    refreshPhaseB831,
    refreshPhaseB832,
    refreshPhaseB833,
    refreshPhaseB834,
    refreshPhaseB8341,
    refreshPhaseB8342,
    refreshPhaseB83421,
    refreshPhaseB8343,
    refreshPhaseB83431,
    refreshPhaseB83432,
    refreshPhaseB835,
    refreshPhaseB836,
    refreshPhaseB8361
  ]);
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
          setTrainingError(
            payload.state === "failed" ? payload.error || "Model training failed." : null
          );
          if (payload.state === "completed") {
            toast.success("Candidate Model Training Complete!", {
              description: `Job ${trainingJobId} finished successfully. Review diagnostics below before promoting.`,
              duration: 7e3
            });
          } else {
            toast.error("Model Training Failed", {
              description: payload.error || "Check backend console logs for details.",
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
  useEffect(() => {
    if (!phaseAJobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseAJobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseAProgress(payload.progress_percent ?? 0);
        setPhaseAState(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseAJobId(null);
          setPhaseAError(payload.state === "failed" ? payload.error || "Phase A failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseAResult(payload.result);
            toast.success("Phase A Label Experiment Batch Complete", {
              description: `Job ${phaseAJobId} finished. Review the research leaderboard below.`,
              duration: 7e3
            });
            void refreshPhaseA();
          } else {
            toast.error("Phase A Experiment Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase A job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseAJobId, refreshPhaseA]);
  useEffect(() => {
    if (!phaseA1JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseA1JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseA1Progress(payload.progress_percent ?? 0);
        setPhaseA1State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseA1JobId(null);
          setPhaseA1Error(payload.state === "failed" ? payload.error || "Phase A.1 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseA1Result(payload.result);
            toast.success("Phase A.1 Edge Forensics Complete", {
              description: `Job ${phaseA1JobId} finished. Review broker costs and shadow backtests below.`,
              duration: 7e3
            });
            void refreshBrokerEconomics();
            void refreshPhaseA1();
          } else {
            toast.error("Phase A.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase A.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseA1JobId, refreshBrokerEconomics, refreshPhaseA1]);
  useEffect(() => {
    if (!phaseBJobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseBJobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseBProgress(payload.progress_percent ?? 0);
        setPhaseBState(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseBJobId(null);
          setPhaseBError(payload.state === "failed" ? payload.error || "Phase B failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseBResult(payload.result);
            toast.success("Phase B Research Complete", {
              description: `Job ${phaseBJobId} finished. Review feature ablation and quality gates below.`,
              duration: 7e3
            });
            void refreshPhaseB();
          } else {
            toast.error("Phase B Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseBJobId, refreshPhaseB]);
  useEffect(() => {
    if (!phaseB3JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB3JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB3Progress(payload.progress_percent ?? 0);
        setPhaseB3State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB3JobId(null);
          setPhaseB3Error(payload.state === "failed" ? payload.error || "Phase B.3 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB3Result(payload.result);
            toast.success("Phase B.3 Audit Complete", {
              description: `Job ${phaseB3JobId} finished. Review shadow-cost integrity and robustness below.`,
              duration: 7e3
            });
            void refreshPhaseB3();
          } else {
            toast.error("Phase B.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.3 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB3JobId, refreshPhaseB3]);
  useEffect(() => {
    if (!phaseB4JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB4JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB4Progress(payload.progress_percent ?? 0);
        setPhaseB4State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB4JobId(null);
          setPhaseB4Error(payload.state === "failed" ? payload.error || "Phase B.4 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB4Result(payload.result);
            toast.success("Phase B.4 Evidence Run Complete", {
              description: `Job ${phaseB4JobId} finished. Review discovery, frozen configs, and confirmation gates below.`,
              duration: 7e3
            });
            void refreshPhaseB4();
          } else {
            toast.error("Phase B.4 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.4 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB4JobId, refreshPhaseB4]);
  useEffect(() => {
    if (!phaseB5JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB5JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB5Progress(payload.progress_percent ?? 0);
        setPhaseB5State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB5JobId(null);
          setPhaseB5Error(payload.state === "failed" ? payload.error || "Phase B.5 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB5Result(payload.result);
            toast.success("Phase B.5 Repair Run Complete", {
              description: `Job ${phaseB5JobId} finished. Review directional bias, drift, and freeze gates below.`,
              duration: 7e3
            });
            void refreshPhaseB5();
          } else {
            toast.error("Phase B.5 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.5 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB5JobId, refreshPhaseB5]);
  useEffect(() => {
    if (!phaseB51JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB51JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB51Progress(payload.progress_percent ?? 0);
        setPhaseB51State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB51JobId(null);
          setPhaseB51Error(
            payload.state === "failed" ? payload.error || "Phase B.5.1 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB51Result(payload.result);
            toast.success("Phase B.5.1 Audit Complete", {
              description: `Job ${phaseB51JobId} finished. Review count reconciliation and directional track semantics below.`,
              duration: 7e3
            });
            void refreshPhaseB51();
          } else {
            toast.error("Phase B.5.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.5.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 2500);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB51JobId, refreshPhaseB51]);
  useEffect(() => {
    if (!phaseB52JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB52JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB52Progress(payload.progress_percent ?? 0);
        setPhaseB52State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB52JobId(null);
          setPhaseB52Error(
            payload.state === "failed" ? payload.error || "Phase B.5.2 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB52Result(payload.result);
            toast.success("Phase B.5.2 Audit Complete", {
              description: "Snapshot reproducibility, deterministic replay, and execution-density matrix are ready.",
              duration: 7e3
            });
            void refreshPhaseB52();
          } else {
            toast.error("Phase B.5.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.5.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB52JobId, refreshPhaseB52]);
  useEffect(() => {
    if (!phaseB6JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB6JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB6Progress(payload.progress_percent ?? 0);
        setPhaseB6State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB6JobId(null);
          setPhaseB6Error(payload.state === "failed" ? payload.error || "Phase B.6 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB6Result(payload.result);
            const result = payload.result;
            if (result?.status === "INSUFFICIENT_HISTORY_FOR_PHASE_B6") {
              toast.error("Phase B.6 Aborted", {
                description: "Expanded MT5 history is incomplete. No partial matrix was executed.",
                duration: 9e3
              });
            } else {
              toast.success("Phase B.6 Complete", {
                description: "Expanded-history label, horizon, and regime repair output is ready.",
                duration: 7e3
              });
            }
            void refreshPhaseB6();
          } else {
            toast.error("Phase B.6 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.6 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB6JobId, refreshPhaseB6]);
  useEffect(() => {
    if (!phaseB7JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB7JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB7Progress(payload.progress_percent ?? 0);
        setPhaseB7State(payload.state ?? null);
        setPhaseB7Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB7Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB7JobId(null);
          setPhaseB7Error(payload.state === "failed" ? payload.error || "Phase B.7 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB7Result(payload.result);
            toast.success("Phase B.7 Complete", {
              description: "Edge decomposition and strategy repair report is ready for review.",
              duration: 7e3
            });
            void refreshPhaseB7();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.7 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB7();
          } else {
            toast.error("Phase B.7 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.7 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB7JobId, refreshPhaseB7]);
  useEffect(() => {
    if (!phaseB8JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB8Progress(payload.progress_percent ?? 0);
        setPhaseB8State(payload.state ?? null);
        setPhaseB8Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB8JobId(null);
          setPhaseB8Error(payload.state === "failed" ? payload.error || "Phase B.8 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8Result(payload.result);
            toast.success("Phase B.8 Complete", {
              description: "Strategy hypothesis reset and gross-edge research report is ready.",
              duration: 7e3
            });
            void refreshPhaseB8();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB8();
          } else {
            toast.error("Phase B.8 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.8 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8JobId, refreshPhaseB8]);
  useEffect(() => {
    if (!phaseB81JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB81JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB81Progress(payload.progress_percent ?? 0);
        setPhaseB81State(payload.state ?? null);
        setPhaseB81Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB81Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB81JobId(null);
          setPhaseB81Error(
            payload.state === "failed" ? payload.error || "Phase B.8.1 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB81Result(payload.result);
            toast.success("Phase B.8.1 Complete", {
              description: "Mechanics and execution semantics audit report is ready.",
              duration: 7e3
            });
            void refreshPhaseB81();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB81();
          } else {
            toast.error("Phase B.8.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
          }
        }
      } catch (error) {
        console.error("Phase B.8.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB81JobId, refreshPhaseB81]);
  useEffect(() => {
    if (!phaseB82JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB82JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB82Progress(payload.progress_percent ?? 0);
        setPhaseB82State(payload.state ?? null);
        setPhaseB82Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB82Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB82JobId(null);
          setPhaseB82Error(
            payload.state === "failed" ? payload.error || "Phase B.8.2 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB82Result(payload.result);
            toast.success("Phase B.8.2 Complete", {
              description: "Replayable snapshot and event-ledger sidecar report is ready.",
              duration: 7e3
            });
            void refreshPhaseB82();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB82();
          } else {
            toast.error("Phase B.8.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB82();
          }
        }
      } catch (error) {
        console.error("Phase B.8.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB82JobId, refreshPhaseB82]);
  useEffect(() => {
    if (!phaseB83JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB83Progress(payload.progress_percent ?? 0);
        setPhaseB83State(payload.state ?? null);
        setPhaseB83Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB83JobId(null);
          setPhaseB83Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB83Result(payload.result);
            toast.success("Phase B.8.3 Complete", {
              description: "Replay source restoration and reproducible baseline report is ready.",
              duration: 7e3
            });
            void refreshPhaseB83();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB83();
          } else {
            toast.error("Phase B.8.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB83();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83JobId, refreshPhaseB83]);
  useEffect(() => {
    if (!phaseB831JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB831JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB831Progress(payload.progress_percent ?? 0);
        setPhaseB831State(payload.state ?? null);
        setPhaseB831Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB831Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB831JobId(null);
          setPhaseB831Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.1 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB831Result(payload.result);
            toast.success("Phase B.8.3.1 Complete", {
              description: "Threshold gate and prediction payload integrity audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB831();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB831();
          } else {
            toast.error("Phase B.8.3.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB831();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB831JobId, refreshPhaseB831]);
  useEffect(() => {
    if (!phaseB832JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB832JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB832Progress(payload.progress_percent ?? 0);
        setPhaseB832State(payload.state ?? null);
        setPhaseB832Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB832Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB832JobId(null);
          setPhaseB832Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.2 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB832Result(payload.result);
            toast.success("Phase B.8.3.2 Complete", {
              description: "Score calibration and threshold sensitivity audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB832();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB832();
          } else {
            toast.error("Phase B.8.3.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB832();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB832JobId, refreshPhaseB832]);
  useEffect(() => {
    if (!phaseB833JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB833JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB833Progress(payload.progress_percent ?? 0);
        setPhaseB833State(payload.state ?? null);
        setPhaseB833Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB833Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB833JobId(null);
          setPhaseB833Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.3 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB833Result(payload.result);
            toast.success("Phase B.8.3.3 Complete", {
              description: "Feature schema parity and deterministic inference audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB833();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.3 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB833();
          } else {
            toast.error("Phase B.8.3.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB833();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.3 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB833JobId, refreshPhaseB833]);
  useEffect(() => {
    if (!phaseB834JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB834JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB834Progress(payload.progress_percent ?? 0);
        setPhaseB834State(payload.state ?? null);
        setPhaseB834Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB834Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB834JobId(null);
          setPhaseB834Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB834Result(payload.result);
            toast.success("Phase B.8.3.4 Complete", {
              description: "Post-threshold execution funnel semantics audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB834();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB834();
          } else {
            toast.error("Phase B.8.3.4 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB834();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB834JobId, refreshPhaseB834]);
  useEffect(() => {
    if (!phaseB8341JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8341JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB8341Progress(payload.progress_percent ?? 0);
        setPhaseB8341State(payload.state ?? null);
        setPhaseB8341Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8341Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB8341JobId(null);
          setPhaseB8341Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.1 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8341Result(payload.result);
            toast.success("Phase B.8.3.4.1 Complete", {
              description: "Ledger hash attestation and source-lineage proof is ready.",
              duration: 7e3
            });
            void refreshPhaseB8341();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB8341();
          } else {
            toast.error("Phase B.8.3.4.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB8341();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8341JobId, refreshPhaseB8341]);
  useEffect(() => {
    if (!phaseB8342JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8342JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB8342Progress(payload.progress_percent ?? 0);
        setPhaseB8342State(payload.state ?? null);
        setPhaseB8342Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8342Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB8342JobId(null);
          setPhaseB8342Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.2 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8342Result(payload.result);
            toast.success("Phase B.8.3.4.2 Complete", {
              description: "Ledger schema mapping and event-ID provenance repair is ready.",
              duration: 7e3
            });
            void refreshPhaseB8342();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB8342();
          } else {
            toast.error("Phase B.8.3.4.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB8342();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8342JobId, refreshPhaseB8342]);
  useEffect(() => {
    if (!phaseB83421JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83421JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB83421Progress(payload.progress_percent ?? 0);
        setPhaseB83421State(payload.state ?? null);
        setPhaseB83421Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83421Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB83421JobId(null);
          setPhaseB83421Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.2.1 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result)
              setPhaseB83421Result(payload.result);
            toast.success("Phase B.8.3.4.2.1 Complete", {
              description: "Direction attribution and historical transform provenance audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB83421();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.2.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB83421();
          } else {
            toast.error("Phase B.8.3.4.2.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB83421();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.2.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83421JobId, refreshPhaseB83421]);
  useEffect(() => {
    if (!phaseB8343JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8343JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB8343Progress(payload.progress_percent ?? 0);
        setPhaseB8343State(payload.state ?? null);
        setPhaseB8343Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8343Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB8343JobId(null);
          setPhaseB8343Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.3 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8343Result(payload.result);
            toast.success("Phase B.8.3.4.3 Complete", {
              description: "Provenance-complete reproducible ledger baseline report is ready.",
              duration: 7e3
            });
            void refreshPhaseB8343();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.3 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB8343();
          } else {
            toast.error("Phase B.8.3.4.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB8343();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.3 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8343JobId, refreshPhaseB8343]);
  useEffect(() => {
    if (!phaseB83431JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83431JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB83431Progress(payload.progress_percent ?? 0);
        setPhaseB83431State(payload.state ?? null);
        setPhaseB83431Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83431Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB83431JobId(null);
          setPhaseB83431Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.3.1 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result)
              setPhaseB83431Result(payload.result);
            toast.success("Phase B.8.3.4.3.1 Complete", {
              description: "Manifest-bound trigger provenance baseline is ready.",
              duration: 7e3
            });
            void refreshPhaseB83431();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.3.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB83431();
          } else {
            toast.error("Phase B.8.3.4.3.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB83431();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.3.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83431JobId, refreshPhaseB83431]);
  useEffect(() => {
    if (!phaseB83432JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83432JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB83432Progress(payload.progress_percent ?? 0);
        setPhaseB83432State(payload.state ?? null);
        setPhaseB83432Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83432Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB83432JobId(null);
          setPhaseB83432Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.3.2 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result)
              setPhaseB83432Result(payload.result);
            toast.success("Phase B.8.3.4.3.2 Complete", {
              description: "Versioned trigger-rule replayable baseline report is ready.",
              duration: 7e3
            });
            void refreshPhaseB83432();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.3.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB83432();
          } else {
            toast.error("Phase B.8.3.4.3.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB83432();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.3.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83432JobId, refreshPhaseB83432]);
  useEffect(() => {
    if (!phaseB835JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB835JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB835Progress(payload.progress_percent ?? 0);
        setPhaseB835State(payload.state ?? null);
        setPhaseB835Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB835Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB835JobId(null);
          setPhaseB835Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.5 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB835Result(payload.result);
            toast.success("Phase B.8.3.5 Complete", {
              description: "Temporal calibration and locked OOS threshold policy audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB835();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.5 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB835();
          } else {
            toast.error("Phase B.8.3.5 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB835();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.5 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB835JobId, refreshPhaseB835]);
  useEffect(() => {
    if (!phaseB836JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB836JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB836Progress(payload.progress_percent ?? 0);
        setPhaseB836State(payload.state ?? null);
        setPhaseB836Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB836Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB836JobId(null);
          setPhaseB836Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.6 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB836Result(payload.result);
            toast.success("Phase B.8.3.6 Complete", {
              description: "Temporal distribution and gate-failure decomposition audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB836();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.6 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB836();
          } else {
            toast.error("Phase B.8.3.6 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB836();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.6 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB836JobId, refreshPhaseB836]);
  useEffect(() => {
    if (!phaseB8361JobId) return void 0;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8361JobId}`);
        if (!response.ok || !active) return;
        const payload = await response.json();
        setPhaseB8361Progress(payload.progress_percent ?? 0);
        setPhaseB8361State(payload.state ?? null);
        setPhaseB8361Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8361Heartbeat(payload.heartbeat_at ?? null);
        if (payload.state === "completed" || payload.state === "failed" || payload.state === "cancelled") {
          setPhaseB8361JobId(null);
          setPhaseB8361Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.6.1 failed." : null
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8361Result(payload.result);
            toast.success("Phase B.8.3.6.1 Complete", {
              description: "Trigger-gate provenance audit is ready.",
              duration: 7e3
            });
            void refreshPhaseB8361();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.6.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7e3
            });
            void refreshPhaseB8361();
          } else {
            toast.error("Phase B.8.3.6.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9e3
            });
            void refreshPhaseB8361();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.6.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3e3);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8361JobId, refreshPhaseB8361]);
  const startTraining = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Model training is blocked by backend policy."
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
          debug_mode: trainDebugMode
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Failed to start model training");
      setTrainingJobId(payload.job_id);
      setTrainingState(payload.state);
      setTrainingProgress(payload.progress_percent || 0);
      toast.success("Retraining Job Submitted Successfully", {
        description: `Job ID: ${payload.job_id} — Training model office on ${trainingCandles.toLocaleString()} historical candles.`,
        duration: 5e3
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
      toast.error(capabilities.model_promotion.reason || "Model promotion is blocked.");
      return;
    }
    setPromoting(true);
    try {
      const response = await fetch(`${API_V1_BASE}/model/promote-candidate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidate_id: promoteTarget.run_id,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail?.message || payload.detail || "Failed to promote candidate");
      }
      toast.success(`Candidate model ${promoteTarget.run_id} successfully promoted to Champion.`);
      setPromoteTarget(null);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPromoting(false);
    }
  };
  const rejectCandidate = async (candidate) => {
    setRejectingCandidate(true);
    try {
      const response = await fetch(`${API_V1_BASE}/model/candidates/${candidate.run_id}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to reject candidate");
      toast.success(`Candidate run ${candidate.run_id} rejected and deleted.`);
      await Promise.all([fetchData(), refreshCapabilities()]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setRejectingCandidate(false);
    }
  };
  const status = data?.status;
  const market = data?.market;
  const symbol = market?.symbol || status?.symbol || DEFAULT_SYMBOL;
  const accountMode = status?.account_mode ?? "unknown";
  const backendOnline = !apiError;
  const latestCandidate = modelStatus?.latest_candidate;
  const championMetadata = modelStatus?.champion_metadata;
  const championBacktest = championMetadata?.metrics?.holdout?.backtest;
  const pipelineAudit = sweepResult?.pipeline_audit ?? latestCandidate?.pipeline_audit ?? null;
  const runThresholdSweep = async () => {
    if (!latestCandidate?.run_id) {
      toast.error("No candidate is available for threshold sweep.");
      return;
    }
    setSweepPending(true);
    setSweepError(null);
    try {
      const response = await fetch(
        `${API_V1_BASE}/model/candidates/${latestCandidate.run_id}/threshold-sweep`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trend_thresholds: [0.35, 0.4, 0.45, 0.5, 0.55],
            entry_thresholds: [0.35, 0.4, 0.45, 0.5, 0.55],
            confidence_thresholds: [10, 15, 20, 25],
            risk_threshold: 0.55,
            max_spread_pips: 5,
            force_rebuild_cache: false
          })
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Threshold sweep failed");
      setSweepResult(payload);
      toast.success("Threshold sweep complete", {
        description: `${payload.combo_count ?? 0} combinations evaluated from cached holdout predictions.`,
        duration: 6e3
      });
    } catch (error) {
      setSweepError(getErrorMessage(error));
      toast.error(getErrorMessage(error));
    } finally {
      setSweepPending(false);
    }
  };
  const startPhaseAExperiments = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseAPending(true);
    setPhaseAError(null);
    setPhaseAProgress(0);
    setPhaseAState("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-a/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseAAnchorCount,
          max_runs: phaseAMaxRuns,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          max_spread: trainMaxSpread,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase A experiments");
      setPhaseAJobId(payload.job_id ?? null);
      setPhaseAState(payload.state ?? "queued");
      setPhaseAProgress(payload.progress_percent ?? 0);
      toast.success("Phase A Label Experiment Submitted", {
        description: `${phaseAMaxRuns} curated label configs queued. No candidate will be promoted.`,
        duration: 6e3
      });
    } catch (error) {
      setPhaseAError(getErrorMessage(error));
      setPhaseAState("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseAPending(false);
    }
  };
  const startPhaseA1Experiments = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseA1Pending(true);
    setPhaseA1Error(null);
    setPhaseA1Progress(0);
    setPhaseA1State("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-a1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseA1AnchorCount,
          max_runs: phaseA1MaxRuns,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          max_spread: trainMaxSpread,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase A.1");
      setPhaseA1JobId(payload.job_id ?? null);
      setPhaseA1State(payload.state ?? "queued");
      setPhaseA1Progress(payload.progress_percent ?? 0);
      toast.success("Phase A.1 Edge Forensics Submitted", {
        description: `${phaseA1MaxRuns} curated cost/session configs queued. No model promotion will run.`,
        duration: 6e3
      });
    } catch (error) {
      setPhaseA1Error(getErrorMessage(error));
      setPhaseA1State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseA1Pending(false);
    }
  };
  const startPhaseBExperiments = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseBPending(true);
    setPhaseBError(null);
    setPhaseBProgress(0);
    setPhaseBState("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseBAnchorCount,
          max_quality_runs: phaseBQualityRuns,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B");
      setPhaseBJobId(payload.job_id ?? null);
      setPhaseBState(payload.state ?? "queued");
      setPhaseBProgress(payload.progress_percent ?? 0);
      toast.success("Phase B Research Submitted", {
        description: `B0-B5 ablation plus ${phaseBQualityRuns} curated quality-gate configs queued. No promotion will run.`,
        duration: 7e3
      });
    } catch (error) {
      setPhaseBError(getErrorMessage(error));
      setPhaseBState("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseBPending(false);
    }
  };
  const startPhaseB3Experiments = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB3Pending(true);
    setPhaseB3Error(null);
    setPhaseB3Progress(0);
    setPhaseB3State("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b3/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseB3AnchorCount,
          max_robustness_runs: phaseB3RobustnessRuns,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.3");
      setPhaseB3JobId(payload.job_id ?? null);
      setPhaseB3State(payload.state ?? "queued");
      setPhaseB3Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.3 Audit Submitted", {
        description: `Orthogonal ablation plus ${phaseB3RobustnessRuns} robustness neighbors queued. No promotion will run.`,
        duration: 7e3
      });
    } catch (error) {
      setPhaseB3Error(getErrorMessage(error));
      setPhaseB3State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB3Pending(false);
    }
  };
  const startPhaseB4Experiments = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB4Pending(true);
    setPhaseB4Error(null);
    setPhaseB4Progress(0);
    setPhaseB4State("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b4/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseB4AnchorCount,
          max_matrix_runs: phaseB4MatrixRuns,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.4");
      setPhaseB4JobId(payload.job_id ?? null);
      setPhaseB4State(payload.state ?? "queued");
      setPhaseB4Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.4 Evidence Run Submitted", {
        description: `${phaseB4MatrixRuns} curated discovery configs queued with a locked confirmation split. No promotion will run.`,
        duration: 7e3
      });
    } catch (error) {
      setPhaseB4Error(getErrorMessage(error));
      setPhaseB4State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB4Pending(false);
    }
  };
  const startPhaseB5Experiments = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB5Pending(true);
    setPhaseB5Error(null);
    setPhaseB5Progress(0);
    setPhaseB5State("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseB5AnchorCount,
          max_matrix_runs: phaseB5MatrixRuns,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.5");
      setPhaseB5JobId(payload.job_id ?? null);
      setPhaseB5State(payload.state ?? "queued");
      setPhaseB5Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.5 Repair Run Submitted", {
        description: `${phaseB5MatrixRuns} curated label/horizon/track configs queued. No promotion will run.`,
        duration: 7e3
      });
    } catch (error) {
      setPhaseB5Error(getErrorMessage(error));
      setPhaseB5State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB5Pending(false);
    }
  };
  const startPhaseB51Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB51Pending(true);
    setPhaseB51Error(null);
    setPhaseB51Progress(0);
    setPhaseB51State("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5-1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseB51AnchorCount,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.5.1");
      setPhaseB51JobId(payload.job_id ?? null);
      setPhaseB51State(payload.state ?? "queued");
      setPhaseB51Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.5.1 Audit Submitted", {
        description: "Rerunning exact B5_11 buy-only config for count integrity. No promotion or Phase C will run.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB51Error(getErrorMessage(error));
      setPhaseB51State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB51Pending(false);
    }
  };
  const startPhaseB52Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB52Pending(true);
    setPhaseB52Error(null);
    setPhaseB52Progress(0);
    setPhaseB52State("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5-2/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseB52AnchorCount,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.5.2");
      setPhaseB52JobId(payload.job_id ?? null);
      setPhaseB52State(payload.state ?? "queued");
      setPhaseB52Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.5.2 Audit Submitted", {
        description: "Freezing a 20,000 M5 snapshot, replaying B5_11 twice, and running the curated density matrix. No promotion will run.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB52Error(getErrorMessage(error));
      setPhaseB52State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB52Pending(false);
    }
  };
  const startPhaseB6Repair = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB6Pending(true);
    setPhaseB6Error(null);
    setPhaseB6Progress(0);
    setPhaseB6State("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b6/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchor_count: phaseB6AnchorCount,
          max_matrix_runs: phaseB6MatrixRuns,
          risk_threshold: trainRiskThreshold,
          min_confidence: trainMinConfidence,
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.6");
      setPhaseB6JobId(payload.job_id ?? null);
      setPhaseB6State(payload.state ?? "queued");
      setPhaseB6Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.6 Submitted", {
        description: "Expanded history will be verified first. The matrix is skipped if required bars are incomplete.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB6Error(getErrorMessage(error));
      setPhaseB6State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB6Pending(false);
    }
  };
  const startPhaseB7Repair = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB7Pending(true);
    setPhaseB7Error(null);
    setPhaseB7Progress(0);
    setPhaseB7State("queued");
    setPhaseB7Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b7/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.7");
      setPhaseB7JobId(payload.job_id ?? null);
      setPhaseB7State(payload.state ?? "queued");
      setPhaseB7Progress(payload.progress_percent ?? 0);
      setPhaseB7Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB7Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.7 Submitted", {
        description: "Reusing the immutable B.6 snapshot to build edge decomposition and strategy-repair evidence.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB7Error(getErrorMessage(error));
      setPhaseB7State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB7Pending(false);
    }
  };
  const startPhaseB8Research = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB8Pending(true);
    setPhaseB8Error(null);
    setPhaseB8Progress(0);
    setPhaseB8State("queued");
    setPhaseB8Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8");
      setPhaseB8JobId(payload.job_id ?? null);
      setPhaseB8State(payload.state ?? "queued");
      setPhaseB8Progress(payload.progress_percent ?? 0);
      setPhaseB8Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8 Submitted", {
        description: "Reusing the immutable B.6 snapshot for strategy hypothesis reset and gross-edge research.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB8Error(getErrorMessage(error));
      setPhaseB8State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB8Pending(false);
    }
  };
  const startPhaseB81Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB81Pending(true);
    setPhaseB81Error(null);
    setPhaseB81Progress(0);
    setPhaseB81State("queued");
    setPhaseB81Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.1");
      setPhaseB81JobId(payload.job_id ?? null);
      setPhaseB81State(payload.state ?? "queued");
      setPhaseB81Progress(payload.progress_percent ?? 0);
      setPhaseB81Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB81Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.1 Submitted", {
        description: "Auditing strategy mechanics against the immutable B.6/B.8 research artifacts.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB81Error(getErrorMessage(error));
      setPhaseB81State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB81Pending(false);
    }
  };
  const startPhaseB82Repair = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB82Pending(true);
    setPhaseB82Error(null);
    setPhaseB82Progress(0);
    setPhaseB82State("queued");
    setPhaseB82Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-2/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.2");
      setPhaseB82JobId(payload.job_id ?? null);
      setPhaseB82State(payload.state ?? "queued");
      setPhaseB82Progress(payload.progress_percent ?? 0);
      setPhaseB82Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB82Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.2 Submitted", {
        description: "Attempting exact UTC B.6 history reconstruction and replayable sidecar persistence.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB82Error(getErrorMessage(error));
      setPhaseB82State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB82Pending(false);
    }
  };
  const startPhaseB83Repair = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB83Pending(true);
    setPhaseB83Error(null);
    setPhaseB83Progress(0);
    setPhaseB83State("queued");
    setPhaseB83Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3");
      setPhaseB83JobId(payload.job_id ?? null);
      setPhaseB83State(payload.state ?? "queued");
      setPhaseB83Progress(payload.progress_percent ?? 0);
      setPhaseB83Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3 Submitted", {
        description: "Restoring replay source availability or creating a separate reproducible research baseline.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB83Error(getErrorMessage(error));
      setPhaseB83State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB83Pending(false);
    }
  };
  const startPhaseB831Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB831Pending(true);
    setPhaseB831Error(null);
    setPhaseB831Progress(0);
    setPhaseB831State("queued");
    setPhaseB831Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.1");
      setPhaseB831JobId(payload.job_id ?? null);
      setPhaseB831State(payload.state ?? "queued");
      setPhaseB831Progress(payload.progress_percent ?? 0);
      setPhaseB831Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB831Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.1 Submitted", {
        description: "Running audit-only threshold gate and prediction payload integrity checks.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB831Error(getErrorMessage(error));
      setPhaseB831State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB831Pending(false);
    }
  };
  const startPhaseB832Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB832Pending(true);
    setPhaseB832Error(null);
    setPhaseB832Progress(0);
    setPhaseB832State("queued");
    setPhaseB832Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-2/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.2");
      setPhaseB832JobId(payload.job_id ?? null);
      setPhaseB832State(payload.state ?? "queued");
      setPhaseB832Progress(payload.progress_percent ?? 0);
      setPhaseB832Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB832Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.2 Submitted", {
        description: "Running audit-only score calibration and threshold sensitivity diagnostics.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB832Error(getErrorMessage(error));
      setPhaseB832State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB832Pending(false);
    }
  };
  const startPhaseB833Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB833Pending(true);
    setPhaseB833Error(null);
    setPhaseB833Progress(0);
    setPhaseB833State("queued");
    setPhaseB833Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-3/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.3");
      setPhaseB833JobId(payload.job_id ?? null);
      setPhaseB833State(payload.state ?? "queued");
      setPhaseB833Progress(payload.progress_percent ?? 0);
      setPhaseB833Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB833Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.3 Submitted", {
        description: "Running audit-only feature schema parity and deterministic inference checks.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB833Error(getErrorMessage(error));
      setPhaseB833State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB833Pending(false);
    }
  };
  const startPhaseB834Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB834Pending(true);
    setPhaseB834Error(null);
    setPhaseB834Progress(0);
    setPhaseB834State("queued");
    setPhaseB834Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4");
      setPhaseB834JobId(payload.job_id ?? null);
      setPhaseB834State(payload.state ?? "queued");
      setPhaseB834Progress(payload.progress_percent ?? 0);
      setPhaseB834Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB834Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4 Submitted", {
        description: "Running audit-only post-threshold execution funnel semantics checks.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB834Error(getErrorMessage(error));
      setPhaseB834State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB834Pending(false);
    }
  };
  const startPhaseB8341Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB8341Pending(true);
    setPhaseB8341Error(null);
    setPhaseB8341Progress(0);
    setPhaseB8341State("queued");
    setPhaseB8341Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.1");
      setPhaseB8341JobId(payload.job_id ?? null);
      setPhaseB8341State(payload.state ?? "queued");
      setPhaseB8341Progress(payload.progress_percent ?? 0);
      setPhaseB8341Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8341Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.1 Submitted", {
        description: "Running audit-only ledger hash attestation and lineage proof.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB8341Error(getErrorMessage(error));
      setPhaseB8341State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB8341Pending(false);
    }
  };
  const startPhaseB8342Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB8342Pending(true);
    setPhaseB8342Error(null);
    setPhaseB8342Progress(0);
    setPhaseB8342State("queued");
    setPhaseB8342Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-2/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.2");
      setPhaseB8342JobId(payload.job_id ?? null);
      setPhaseB8342State(payload.state ?? "queued");
      setPhaseB8342Progress(payload.progress_percent ?? 0);
      setPhaseB8342Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8342Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.2 Submitted", {
        description: "Running audit-only ledger schema mapping and event-ID provenance repair.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB8342Error(getErrorMessage(error));
      setPhaseB8342State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB8342Pending(false);
    }
  };
  const startPhaseB83421Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB83421Pending(true);
    setPhaseB83421Error(null);
    setPhaseB83421Progress(0);
    setPhaseB83421State("queued");
    setPhaseB83421Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-2-1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.2.1");
      setPhaseB83421JobId(payload.job_id ?? null);
      setPhaseB83421State(payload.state ?? "queued");
      setPhaseB83421Progress(payload.progress_percent ?? 0);
      setPhaseB83421Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83421Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.2.1 Submitted", {
        description: "Running audit-only direction attribution and transform provenance checks.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB83421Error(getErrorMessage(error));
      setPhaseB83421State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB83421Pending(false);
    }
  };
  const startPhaseB8343Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB8343Pending(true);
    setPhaseB8343Error(null);
    setPhaseB8343Progress(0);
    setPhaseB8343State("queued");
    setPhaseB8343Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.3");
      setPhaseB8343JobId(payload.job_id ?? null);
      setPhaseB8343State(payload.state ?? "queued");
      setPhaseB8343Progress(payload.progress_percent ?? 0);
      setPhaseB8343Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8343Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.3 Submitted", {
        description: "Running research-only provenance-complete reproducible baseline rebuild.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB8343Error(getErrorMessage(error));
      setPhaseB8343State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB8343Pending(false);
    }
  };
  const startPhaseB83431Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB83431Pending(true);
    setPhaseB83431Error(null);
    setPhaseB83431Progress(0);
    setPhaseB83431State("queued");
    setPhaseB83431Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3-1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.3.1");
      setPhaseB83431JobId(payload.job_id ?? null);
      setPhaseB83431State(payload.state ?? "queued");
      setPhaseB83431Progress(payload.progress_percent ?? 0);
      setPhaseB83431Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83431Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.3.1 Submitted", {
        description: "Running manifest-bound trigger provenance baseline rebuild.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB83431Error(getErrorMessage(error));
      setPhaseB83431State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB83431Pending(false);
    }
  };
  const startPhaseB83432Audit = async () => {
    setPhaseB83432Pending(true);
    setPhaseB83432Error(null);
    setPhaseB83432Progress(0);
    setPhaseB83432State("queued");
    setPhaseB83432Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3-2/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.3.2");
      setPhaseB83432JobId(payload.job_id ?? null);
      setPhaseB83432State(payload.state ?? "queued");
      setPhaseB83432Progress(payload.progress_percent ?? 0);
      setPhaseB83432Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83432Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.3.2 Submitted", {
        description: "Running versioned trigger-rule replayable baseline repair.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB83432Error(getErrorMessage(error));
      setPhaseB83432State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB83432Pending(false);
    }
  };
  const startPhaseB835Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB835Pending(true);
    setPhaseB835Error(null);
    setPhaseB835Progress(0);
    setPhaseB835State("queued");
    setPhaseB835Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-5/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.5");
      setPhaseB835JobId(payload.job_id ?? null);
      setPhaseB835State(payload.state ?? "queued");
      setPhaseB835Progress(payload.progress_percent ?? 0);
      setPhaseB835Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB835Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.5 Submitted", {
        description: "Running audit-only temporal calibration and locked OOS policy checks.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB835Error(getErrorMessage(error));
      setPhaseB835State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB835Pending(false);
    }
  };
  const startPhaseB836Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB836Pending(true);
    setPhaseB836Error(null);
    setPhaseB836Progress(0);
    setPhaseB836State("queued");
    setPhaseB836Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-6/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.6");
      setPhaseB836JobId(payload.job_id ?? null);
      setPhaseB836State(payload.state ?? "queued");
      setPhaseB836Progress(payload.progress_percent ?? 0);
      setPhaseB836Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB836Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.6 Submitted", {
        description: "Running audit-only temporal distribution and gate-failure decomposition checks.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB836Error(getErrorMessage(error));
      setPhaseB836State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB836Pending(false);
    }
  };
  const startPhaseB8361Audit = async () => {
    if (!capabilities.model_training.allowed) {
      toast.error(
        capabilities.model_training.reason || "Research training is blocked by backend policy."
      );
      return;
    }
    setPhaseB8361Pending(true);
    setPhaseB8361Error(null);
    setPhaseB8361Progress(0);
    setPhaseB8361State("queued");
    setPhaseB8361Stage("queued");
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-6-1/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quick: true,
          idempotency_key: newIdempotencyKey()
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.6.1");
      setPhaseB8361JobId(payload.job_id ?? null);
      setPhaseB8361State(payload.state ?? "queued");
      setPhaseB8361Progress(payload.progress_percent ?? 0);
      setPhaseB8361Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8361Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.6.1 Submitted", {
        description: "Running audit-only trigger-gate provenance and sequential funnel wiring.",
        duration: 7e3
      });
    } catch (error) {
      setPhaseB8361Error(getErrorMessage(error));
      setPhaseB8361State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB8361Pending(false);
    }
  };
  const parsedFeatureImportance = useMemo(() => {
    if (!latestCandidate?.feature_importance || !Array.isArray(latestCandidate.feature_importance))
      return [];
    return latestCandidate.feature_importance.map((item) => {
      const name = item.feature || "";
      const val = item.importance || 0;
      const model = item.model ? `[${item.model}] ` : "";
      return {
        label: `${model}${name}`,
        value: val
      };
    }).slice(0, 10);
  }, [latestCandidate]);
  const sortedSweepRows = useMemo(() => {
    const rows = [...sweepResult?.leaderboard ?? []];
    const visible = sweepShortlistOnly ? rows.filter((row) => row.shortlisted) : rows;
    const valueFor = (row) => {
      const value = row[sweepSortKey];
      return typeof value === "number" ? value : value == null ? -999999 : 0;
    };
    return visible.sort((a, b) => valueFor(b) - valueFor(a));
  }, [sweepResult, sweepShortlistOnly, sweepSortKey]);
  const segmentedHoldoutSets = sweepResult?.segmented_holdout_stability_check ?? sweepResult?.walk_forward_scaffold ?? [];
  const phaseATopRows = phaseAResult?.top_10 ?? phaseAResult?.leaderboard?.slice(0, 10) ?? [];
  const phaseA1TopRows = phaseA1Result?.top_10 ?? phaseA1Result?.leaderboard?.slice(0, 10) ?? [];
  const phaseA1Best = phaseA1TopRows[0];
  const phaseBFeatureRows = phaseBResult?.feature_ablation?.top_10 ?? phaseBResult?.feature_ablation?.leaderboard?.slice(0, 10) ?? [];
  const phaseBQualityRows = phaseBResult?.trade_quality?.top_10 ?? phaseBResult?.trade_quality?.leaderboard?.slice(0, 10) ?? [];
  const phaseBBestFeature = phaseBResult?.feature_ablation?.best_feature_set_label;
  const phaseBBestQuality = phaseBQualityRows[0];
  const phaseB3OrthogonalRows = phaseB3Result?.orthogonal_ablation?.top_10 ?? phaseB3Result?.orthogonal_ablation?.leaderboard?.slice(0, 10) ?? [];
  const phaseB3RobustnessRows = phaseB3Result?.neighborhood_robustness?.top_10 ?? phaseB3Result?.neighborhood_robustness?.leaderboard?.slice(0, 10) ?? [];
  const phaseB3BestRobustness = phaseB3RobustnessRows[0];
  const phaseB3BestFixed = phaseB3BestRobustness?.fixed_trade_shadow_cost;
  const phaseB3BestFullReplay = phaseB3BestRobustness?.full_execution_replay;
  const phaseB4DiscoveryRows = phaseB4Result?.discovery_matrix?.top_10 ?? phaseB4Result?.discovery_matrix?.leaderboard?.slice(0, 10) ?? [];
  const phaseB4FrozenRows = phaseB4Result?.confirmation_replay?.top_3 ?? phaseB4Result?.frozen_configs ?? [];
  const phaseB4RejectedRows = phaseB4Result?.freeze_rejected_top_3 ?? [];
  const phaseB5DiscoveryRows = phaseB5Result?.discovery_matrix?.top_10 ?? phaseB5Result?.discovery_matrix?.leaderboard?.slice(0, 10) ?? [];
  const phaseB5FrozenRows = phaseB5Result?.confirmation_replay?.top_3 ?? phaseB5Result?.frozen_configs ?? [];
  const phaseB5RejectedRows = phaseB5Result?.freeze_rejected_top_3 ?? [];
  const phaseB5Best = phaseB5DiscoveryRows[0];
  const phaseB5FoldRows = phaseB5Result?.fold_attribution_dashboard?.slice(0, 6) ?? [];
  const phaseB5DriftRows = phaseB5Result?.drift_diagnostics?.folds?.[0]?.rows ?? [];
  const phaseB5RegimeRows = phaseB5Result?.regime_attribution?.slice(0, 12) ?? [];
  const phaseB5TrackRows = phaseB5Result?.side_specific_tracks?.leaderboard?.slice(0, 12) ?? [];
  const phaseB51Funnel = phaseB51Result?.count_funnel ?? {};
  const phaseB51FoldRows = phaseB51Result?.fold_count_table?.slice(0, 8) ?? [];
  const phaseB51RegimeRows = phaseB51Result?.regime_count_table?.slice(0, 18) ?? [];
  const phaseB51FreezeChecks = phaseB51Result?.freeze_gate?.checks ?? {};
  const phaseB51DriftRows = [
    ...phaseB51Result?.drift_warning?.severe_rows ?? [],
    ...phaseB51Result?.drift_warning?.strong_rows ?? []
  ].slice(0, 10);
  const phaseB52SnapshotFrames = phaseB52Result?.snapshot_manifest?.timeframes ?? {};
  const phaseB52Funnel = phaseB52Result?.execution_density_funnel ?? {};
  const phaseB52Density = phaseB52Result?.execution_density_metrics ?? {};
  const phaseB52FullSnapshotRows = Number(
    phaseB52Result?.snapshot_manifest?.combined_dataset_rows ?? NaN
  );
  const phaseB52FullSnapshotClosedDensity = Number.isFinite(phaseB52FullSnapshotRows) && phaseB52FullSnapshotRows > 0 ? Number(phaseB52Funnel.closed_trades ?? 0) / phaseB52FullSnapshotRows * 1e3 : Number.NaN;
  const phaseB52FoldRows = phaseB52Result?.fold_density_table?.slice(0, 8) ?? [];
  const phaseB52MatrixRows = phaseB52Result?.density_matrix?.top_10 ?? phaseB52Result?.density_matrix?.leaderboard?.slice(0, 10) ?? [];
  const phaseB6HistoryFrames = phaseB6Result?.history_status?.timeframes ?? {};
  const phaseB6SnapshotFrames = phaseB6Result?.snapshot_manifest?.timeframes ?? {};
  const phaseB6SplitRegions = phaseB6Result?.chronological_split_timeline?.regions ?? {};
  const phaseB6MatrixRows = phaseB6Result?.curated_matrix_manifest?.matrix_used?.slice(0, 36) ?? [];
  const phaseB6LeaderboardRows = phaseB6Result?.label_horizon_leaderboard?.slice(0, 10) ?? phaseB6Result?.execution_density_leaderboard?.slice(0, 10) ?? [];
  const phaseB6FrozenRows = phaseB6Result?.frozen_configs?.slice(0, 10) ?? [];
  const phaseB6ConfirmationRows = phaseB6Result?.locked_confirmation_replay?.leaderboard?.slice(0, 10) ?? phaseB6Result?.locked_confirmation_replay?.results?.slice(0, 10) ?? [];
  const phaseB7SnapshotFrames = phaseB7Result?.snapshot_integrity?.timeframes ?? {};
  const phaseB7SnapshotChecks = phaseB7Result?.snapshot_integrity?.checks ?? {};
  const phaseB7CostRows = phaseB7Result?.cost_decomposition?.leaderboard?.slice(0, 10) ?? [];
  const phaseB7DirectionRows = phaseB7Result?.directional_decomposition?.tracks ?? [];
  const phaseB7RegimeRows = phaseB7Result?.regime_attribution?.slice(0, 18) ?? [];
  const phaseB7AblationRows = phaseB7Result?.orthogonal_ablation?.leaderboard?.slice(0, 13) ?? [];
  const phaseB7MetaRows = phaseB7Result?.meta_label_repair?.leaderboard?.slice(0, 8) ?? [];
  const phaseB7FreezeRows = phaseB7Result?.discovery_freeze_gate?.leaderboard?.slice(0, 10) ?? [];
  const phaseB7LockedConfirmation = phaseB7Result?.locked_confirmation ?? phaseB7Result?.locked_confirmation_replay;
  const phaseB8SnapshotFrames = phaseB8Result?.snapshot_integrity?.timeframes ?? {};
  const phaseB8SnapshotChecks = phaseB8Result?.snapshot_integrity?.checks ?? {};
  const phaseB8SetupRows = phaseB8Result?.setup_family_definitions?.slice(0, 12) ?? [];
  const phaseB8GrossRows = phaseB8Result?.gross_edge_leaderboard?.slice(0, 12) ?? [];
  const phaseB8CostRows = phaseB8Result?.cost_decomposition?.leaderboard?.slice(0, 12) ?? [];
  const phaseB8FoldRows = phaseB8Result?.fold_attribution?.slice(0, 18) ?? [];
  const phaseB8DriftRows = phaseB8Result?.drift_diagnostics?.slice(0, 24) ?? [];
  const phaseB8MlRows = phaseB8Result?.ml_value_add?.leaderboard?.slice(0, 12) ?? [];
  const phaseB81MechanicsChecks = phaseB81Result?.trade_accounting_integrity?.checks ?? [];
  const phaseB81CountChecks = phaseB81Result?.snapshot_evaluator_integrity?.count_reconciliation?.checks ?? {};
  const phaseB81PayoffRows = phaseB81Result?.realized_payoff_audit?.leaderboard?.slice(0, 8) ?? [];
  const phaseB81LedgerRows = phaseB81Result?.event_level_ledger_export?.family_ledgers?.slice(0, 8) ?? [];
  const phaseB82TimeframeRows = Object.entries(phaseB82Result?.actual_first_last_timestamps ?? {});
  const phaseB82RawHashRows = phaseB82Result?.raw_hash_compatibility?.timeframes ?? {};
  const phaseB82MismatchRows = phaseB82Result?.mismatch_reasons?.slice(0, 8) ?? [];
  const phaseB82RerunRows = phaseB82Result?.research_rerun_required_for_new_baseline ?? [];
  const phaseB82ReadinessBlockers = phaseB82Result?.readiness_blockers ?? phaseB82Result?.b81_rerun_readiness?.blockers ?? [];
  const phaseB82ReplayRequirements = phaseB82Result?.missing_replay_requirements?.slice(0, 8) ?? [];
  const phaseB82UnresolvedConfigs = phaseB82Result?.unresolved_source_configs?.slice(0, 8) ?? [];
  const phaseB82BlockedFamilies = phaseB82Result?.blocked_setup_families ?? [];
  const phaseB82FunnelRows = phaseB82Result?.per_family_funnel?.slice(0, 8) ?? [];
  const phaseB82HasHardenedBlock = [
    phaseB82Result?.ledger_generation_status,
    phaseB82Result?.ledger_reconciliation_status,
    phaseB82Result?.combined_feature_hash_status
  ].some(
    (status2) => [
      "PLACEHOLDER_LEDGER",
      "REPLAY_CONFIG_UNAVAILABLE",
      "REPLAY_SUMMARY_MISMATCH",
      "VACUOUS_ZERO_TRADE_REPLAY",
      "COMBINED_FEATURE_SCHEMA_MISMATCH",
      "COMBINED_REPLAY_NOT_RECONSTRUCTED"
    ].includes(String(status2 ?? ""))
  );
  const phaseB82LedgerSummary = `candidates ${String(
    phaseB82Result?.ledger_reconciliation?.candidate_rows ?? "--"
  )} / trades ${String(phaseB82Result?.ledger_reconciliation?.trade_rows ?? "--")}`;
  const phaseB83StatusRows = [
    ["Legacy Replay", phaseB83Result?.legacy_replay_availability_status],
    ["Branch", phaseB83Result?.replay_branch_selected],
    ["Raw", phaseB83Result?.raw_reconstruction_status],
    ["Combined", phaseB83Result?.combined_feature_reconstruction_status],
    ["Feature Schema", phaseB83Result?.feature_schema_status],
    ["Model Artifacts", phaseB83Result?.model_artifact_status],
    ["Predictions", phaseB83Result?.prediction_payload_status],
    ["Trigger Config", phaseB83Result?.trigger_config_status],
    ["Ledger Gen", phaseB83Result?.ledger_generation_status],
    ["Ledger Recon", phaseB83Result?.ledger_reconciliation_status],
    ["Funnel Recon", phaseB83Result?.per_family_funnel_reconciliation_status],
    ["Lineage", phaseB83Result?.legacy_lineage_validity],
    ["New Baseline", phaseB83Result?.new_baseline_status],
    ["B.8.1 Ready", phaseB83Result?.b81_rerun_readiness?.status],
    ["Phase C", phaseB83Result?.phase_c_readiness_decision?.status]
  ];
  const phaseB83Blockers = phaseB83Result?.blockers?.slice(0, 10) ?? [];
  const phaseB83ReplayRequirements = phaseB83Result?.missing_replay_requirements?.slice(0, 10) ?? [];
  const phaseB83UnresolvedConfigs = phaseB83Result?.unresolved_source_configs?.slice(0, 10) ?? [];
  const phaseB83ArtifactRows = Object.entries(phaseB83Result?.artifact_paths ?? {}).slice(0, 14);
  const phaseB83FunnelRows = phaseB83Result?.per_family_funnel?.slice(0, 8) ?? [];
  const phaseB83NeedsAttention = [
    phaseB83Result?.legacy_replay_availability_status,
    phaseB83Result?.ledger_reconciliation_status,
    phaseB83Result?.new_baseline_status,
    phaseB83Result?.b81_rerun_readiness?.status
  ].some(
    (status2) => [
      "NON_REPLAYABLE_LEGACY_LINEAGE",
      "VACUOUS_ZERO_TRADE_REPLAY",
      "FAIL",
      "BLOCKED",
      "RESEARCH_RERUN_REQUIRED",
      "not_ready"
    ].includes(String(status2 ?? ""))
  );
  const phaseB831StatusRows = [
    ["Lineage Scope", phaseB831Result?.audit_lineage_scope],
    ["Exact Payload", String(phaseB831Result?.exact_b83_payload_available ?? false)],
    ["Historical Proof", String(phaseB831Result?.historical_root_cause_proven ?? false)],
    ["Symptom Match", String(phaseB831Result?.recreated_symptom_matches_b83 ?? false)],
    ["Threshold Audit", phaseB831Result?.threshold_audit_status],
    ["Prediction Dist", phaseB831Result?.prediction_distribution_status],
    ["Score Scale", phaseB831Result?.score_scale_status],
    ["Threshold Schema", phaseB831Result?.threshold_schema_status],
    ["Trigger Eval", phaseB831Result?.trigger_evaluation_status],
    ["Candidates", phaseB831Result?.candidate_ledger_status],
    ["Trades", phaseB831Result?.trade_ledger_status],
    ["Funnel Recon", phaseB831Result?.per_family_funnel_reconciliation_status],
    ["Root Cause", phaseB831Result?.root_cause_classification],
    ["B.8.1 Ready", phaseB831Result?.b81_rerun_readiness?.status],
    ["Phase C", phaseB831Result?.phase_c_readiness_decision?.status]
  ];
  const phaseB831Blockers = phaseB831Result?.blockers?.slice(0, 12) ?? [];
  const phaseB831MissingPayloads = phaseB831Result?.missing_exact_b83_payload_requirements?.slice(0, 12) ?? [];
  const phaseB831ArtifactRows = Object.entries(phaseB831Result?.artifact_paths ?? {}).slice(0, 10);
  const phaseB831FunnelRows = phaseB831Result?.per_family_funnel?.slice(0, 8) ?? [];
  const phaseB831NeedsAttention = [
    phaseB831Result?.audit_lineage_scope,
    phaseB831Result?.threshold_audit_status,
    phaseB831Result?.root_cause_classification,
    phaseB831Result?.b81_rerun_readiness?.status,
    phaseB831Result?.phase_c_readiness_decision?.status
  ].some(
    (status2) => [
      "REBUILT_BASELINE_AUDIT_ONLY",
      "FAIL",
      "FAIL_ZERO_THRESHOLD_PASS",
      "THRESHOLD_GATE_ZERO_PASS",
      "VACUOUS_ZERO_TRADE_REPLAY",
      "not_ready"
    ].includes(String(status2 ?? ""))
  );
  const phaseB832StatusRows = [
    ["Lineage", phaseB832Result?.lineage_scope],
    ["Source B.8.3.1", phaseB832Result?.source_b831_batch_id],
    ["Replay Count", String(phaseB832Result?.deterministic_audit_replay_count ?? 0)],
    ["Mismatches", String(phaseB832Result?.deterministic_audit_mismatch_count ?? "--")],
    ["Output Mapping", phaseB832Result?.output_mapping_status],
    ["Probability Transform", phaseB832Result?.probability_transform_status],
    ["Feature Schema", phaseB832Result?.feature_schema_status],
    ["Label Balance", phaseB832Result?.label_balance_classification],
    ["Score Compression", phaseB832Result?.score_compression_classification],
    ["Calibration", phaseB832Result?.calibration_status],
    ["Root Cause", phaseB832Result?.root_cause_classification],
    ["B.8.1 Ready", phaseB832Result?.b81_rerun_readiness?.status],
    ["Phase C", phaseB832Result?.phase_c_readiness_decision?.status]
  ];
  const phaseB832Blockers = phaseB832Result?.blockers?.slice(0, 12) ?? [];
  const phaseB832QuantileRows = phaseB832Result?.per_family_score_quantiles?.slice(0, 8) ?? [];
  const phaseB832CalibrationRows = phaseB832Result?.per_family_calibration_bins?.slice(0, 18) ?? [];
  const phaseB832ThresholdRows = phaseB832Result?.threshold_sensitivity?.slice(0, 24) ?? [];
  const phaseB832NeedsAttention = [
    phaseB832Result?.lineage_scope,
    phaseB832Result?.label_balance_classification,
    phaseB832Result?.score_compression_classification,
    phaseB832Result?.root_cause_classification,
    phaseB832Result?.b81_rerun_readiness?.status
  ].some(
    (status2) => [
      "REBUILT_BASELINE_DIAGNOSTIC_ONLY",
      "LABEL_CLASS_IMBALANCE",
      "SCORE_COMPRESSION_UNCALIBRATED",
      "MODEL_HAS_WEAK_SEPARATION",
      "not_ready"
    ].includes(String(status2 ?? ""))
  );
  const phaseB833StatusRows = [
    ["Lineage", phaseB833Result?.audit_lineage_scope],
    ["Exact Matrix", String(phaseB833Result?.exact_b831_inference_matrix_available ?? false)],
    ["Historical Proof", String(phaseB833Result?.historical_root_cause_proven ?? false)],
    ["Rebuilt Diagnostic", String(phaseB833Result?.rebuilt_lineage_diagnostic_only ?? false)],
    ["Historical Matrix", phaseB833Result?.actual_historical_inference_matrix_status],
    ["Rebuilt Matrix", phaseB833Result?.rebuilt_inference_matrix_status],
    ["Sidecar Publish", phaseB833Result?.sidecar_publish_status],
    ["Causal Proof", phaseB833Result?.causal_feature_proof_status],
    ["Schema Artifact", phaseB833Result?.schema_artifact_status],
    ["Alignment", phaseB833Result?.canonical_alignment_status],
    ["Prediction Effect", phaseB833Result?.prediction_effect_status],
    ["Classification", phaseB833Result?.mismatch_classification],
    ["Threshold", String(phaseB833Result?.configured_threshold ?? 0.55)]
  ];
  const phaseB833Blockers = phaseB833Result?.blockers?.slice(0, 12) ?? [];
  const phaseB833SchemaRows = phaseB833Result?.per_family_schema_audit?.slice(0, 8) ?? [];
  const phaseB833QuantileRows = phaseB833Result?.before_after_score_quantiles?.slice(0, 8) ?? [];
  const phaseB833ThresholdRows = phaseB833Result?.threshold_sensitivity?.slice(0, 24) ?? [];
  const phaseB833NeedsAttention = [
    phaseB833Result?.audit_lineage_scope,
    phaseB833Result?.mismatch_classification,
    phaseB833Result?.sidecar_publish_status,
    phaseB833Result?.b81_rerun_readiness?.status
  ].some(
    (status2) => [
      "REBUILT_BASELINE_DIAGNOSTIC_ONLY",
      "INSUFFICIENT_EVIDENCE_FOR_HISTORICAL_PROOF",
      "REPAIR_NOT_PROVEN",
      "MULTIPLE_SCHEMA_CAUSES",
      "STATUS_ONLY_REPAIR_NOT_PROVEN",
      "not_ready"
    ].includes(String(status2 ?? ""))
  );
  const phaseB834StatusRows = [
    ["Lineage", phaseB834Result?.audit_lineage_scope],
    ["Score-Only", phaseB834Result?.score_only_sensitivity_status],
    ["Full Replay", phaseB834Result?.full_funnel_replay_status],
    ["Prerequisites", phaseB834Result?.execution_replay_prerequisites_status],
    ["Accepted Semantics", phaseB834Result?.accepted_semantics_status],
    ["Candidate Ledger", phaseB834Result?.candidate_ledger_status],
    ["Trade Ledger", phaseB834Result?.trade_ledger_status],
    ["Meaningful Replay", String(phaseB834Result?.deterministic_replay_meaningful ?? false)],
    ["Replay Count", String(phaseB834Result?.deterministic_replay_count ?? 0)],
    ["Mismatches", String(phaseB834Result?.deterministic_replay_mismatch_count ?? "--")],
    ["Funnel", phaseB834Result?.funnel_reconciliation_status],
    ["Root Cause", phaseB834Result?.root_cause_classification],
    ["Threshold", String(phaseB834Result?.configured_threshold ?? 0.55)]
  ];
  const phaseB834Blockers = phaseB834Result?.blockers?.slice(0, 12) ?? [];
  const phaseB834MissingReplay = phaseB834Result?.missing_replay_requirements?.slice(0, 12) ?? [];
  const phaseB834ThresholdRows = phaseB834Result?.per_family_threshold_funnel?.slice(0, 36) ?? [];
  const phaseB834GateRows = phaseB834Result?.per_family_gate_summary?.slice(0, 36) ?? [];
  const phaseB834RejectionRows = phaseB834Result?.per_gate_rejection_summary?.slice(0, 36) ?? [];
  const phaseB8341StatusRows = [
    ["Trust Scope", phaseB8341Result?.attestation_trust_scope],
    ["Historical Immutable", String(phaseB8341Result?.historical_immutability_proven ?? false)],
    ["Source B.8.3.4", phaseB8341Result?.source_b834_batch_id],
    ["Attestation", phaseB8341Result?.ledger_hash_attestation_status],
    [
      "Mutation Proof",
      phaseB8341Result?.prior_artifact_mutation_proof_status ?? phaseB8341Result?.mutation_proof?.status
    ],
    ["Candidate Fields", phaseB8341Result?.candidate_required_field_status],
    ["Trade Fields", phaseB8341Result?.trade_required_field_status],
    ["Candidate Event IDs", phaseB8341Result?.candidate_event_id_integrity_status],
    ["Trade Event IDs", phaseB8341Result?.trade_event_id_integrity_status],
    ["Join Integrity", phaseB8341Result?.candidate_trade_join_integrity_status],
    ["Locked Confirmation", phaseB8341Result?.locked_confirmation_status],
    ["Locked Rows Read", String(phaseB8341Result?.locked_confirmation_row_consumption_count ?? 0)],
    ["Live Threshold", String(phaseB8341Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB8341Blockers = phaseB8341Result?.blockers?.slice(0, 12) ?? [];
  const phaseB8341LedgerRows = [
    ["Candidate", phaseB8341Result?.candidate_ledger_attestation],
    ["Trade", phaseB8341Result?.trade_ledger_attestation]
  ];
  const phaseB8342StatusRows = [
    ["Trust Scope", phaseB8342Result?.attestation_trust_scope],
    ["Hash Capture", phaseB8342Result?.source_b8341_hash_capture_status],
    ["B.8.3.4.1 Sidecar", phaseB8342Result?.source_b8341_sidecar_status],
    ["Tamper Check", phaseB8342Result?.pre_mapping_tamper_check_status],
    ["Schema Mapping", phaseB8342Result?.schema_mapping_status],
    ["Direction Canonicalization", phaseB8342Result?.direction_canonicalization_status],
    ["Direction Mapping", phaseB8342Result?.direction_mapping_status],
    ["Direction Parity", phaseB8342Result?.direction_join_parity_status],
    ["Direction Mismatches", String(phaseB8342Result?.direction_mismatch_count ?? 0)],
    ["Candidate Event IDs", phaseB8342Result?.candidate_event_id_provenance_status],
    ["Trade Event IDs", phaseB8342Result?.trade_event_id_provenance_status],
    ["Join Provenance", phaseB8342Result?.candidate_trade_join_provenance_status],
    ["Timestamp Semantics", phaseB8342Result?.timestamp_semantics_status],
    ["Chronology", phaseB8342Result?.chronology_integrity_status],
    ["Sidecar Publish", phaseB8342Result?.normalized_sidecar_publish_status],
    ["Root Cause", phaseB8342Result?.root_cause_classification],
    ["Live Threshold", String(phaseB8342Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB8342Blockers = phaseB8342Result?.blockers?.slice(0, 12) ?? [];
  const phaseB8342CandidateMappings = phaseB8342Result?.candidate_field_mapping?.slice(0, 36) ?? [];
  const phaseB8342TradeMappings = phaseB8342Result?.trade_field_mapping?.slice(0, 36) ?? [];
  const phaseB8342DirectionMappings = phaseB8342Result?.direction_mapping_table?.slice(0, 36) ?? [];
  const phaseB8342DirectionInventory = phaseB8342Result?.direction_inventory ?? {};
  const phaseB8342DirectionRows = [
    ["Candidate", phaseB8342DirectionInventory.candidate],
    ["Trade", phaseB8342DirectionInventory.trade]
  ];
  const phaseB8342DirectionParity = phaseB8342Result?.direction_join_parity ?? {};
  const phaseB8342LedgerAttestation = phaseB8342Result?.normalized_ledger_attestation ?? {};
  const phaseB8342LedgerRows = [
    ["Candidate", phaseB8342LedgerAttestation.candidate_ledger],
    ["Trade", phaseB8342LedgerAttestation.trade_ledger]
  ];
  const phaseB83421StatusRows = [
    ["Source B.8.3.4", phaseB83421Result?.source_b834_batch_id],
    ["Source B.8.3.4.2", phaseB83421Result?.source_b8342_batch_id],
    ["B.8.3.4.2 Root", phaseB83421Result?.source_b8342_root_cause],
    ["Execution Provenance", phaseB83421Result?.execution_direction_transform_provenance],
    ["Historical Transform", phaseB83421Result?.historical_transform_provenance_status],
    ["Historical Binding", String(phaseB83421Result?.historical_binding_available ?? false)],
    ["Current Code Diagnostic", phaseB83421Result?.current_code_diagnostic_status],
    ["Config Binding", phaseB83421Result?.current_code_config_binding_status],
    ["Direction Parity", phaseB83421Result?.direction_join_parity_status],
    [
      "After Transform",
      String(phaseB83421Result?.direction_mismatch_count_after_proven_transform ?? 0)
    ],
    ["B.8.3.6 Proof", phaseB83421Result?.b836_source_proof_status],
    ["Sidecar Publish", phaseB83421Result?.normalized_sidecar_publish_status],
    ["Root Cause", phaseB83421Result?.root_cause_classification],
    ["Live Threshold", String(phaseB83421Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB83421Blockers = phaseB83421Result?.blockers?.slice(0, 12) ?? [];
  const phaseB83421AttributionRows = phaseB83421Result?.direction_attribution_rows?.slice(0, 36) ?? [];
  const phaseB83421ProofRows = [
    ["Source Config", phaseB83421Result?.source_config_id],
    ["Source Config SHA", compactHash(phaseB83421Result?.source_config_sha256)],
    ["Rule Version", phaseB83421Result?.transform_rule_version],
    ["Rule SHA", compactHash(phaseB83421Result?.transform_rule_sha256)],
    ["Code Version", compactHash(phaseB83421Result?.ledger_generation_code_version_or_hash)],
    ["Artifact Created", phaseB83421Result?.artifact_created_at_utc],
    ["Current Rule SHA", compactHash(phaseB83421Result?.current_code_rule_hash)]
  ];
  const phaseB8343StatusRows = [
    ["Lineage", phaseB8343Result?.lineage_scope],
    ["Historical Repair", String(phaseB8343Result?.historical_lineage_repair ?? false)],
    ["Historical Proof", String(phaseB8343Result?.historical_root_cause_proven ?? false)],
    ["Raw Sidecar", phaseB8343Result?.raw_sidecar_attestation_status],
    ["Feature Pipeline", phaseB8343Result?.feature_pipeline_attestation_status],
    ["Source Config", phaseB8343Result?.source_config_attestation_status],
    ["Rule Provenance", phaseB8343Result?.rule_provenance_status],
    ["Models", phaseB8343Result?.model_payload_attestation_status],
    ["Predictions", phaseB8343Result?.prediction_payload_attestation_status],
    ["Event IDs", phaseB8343Result?.candidate_event_id_provenance_status],
    ["Trade IDs", phaseB8343Result?.trade_event_id_provenance_status],
    ["Direction Parity", phaseB8343Result?.direction_join_parity_status],
    ["Chronology", phaseB8343Result?.chronology_integrity_status],
    ["Replay", phaseB8343Result?.deterministic_replay_status],
    ["Publish", phaseB8343Result?.normalized_sidecar_publish_status],
    ["Live Threshold", String(phaseB8343Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB8343Blockers = phaseB8343Result?.blockers?.slice(0, 12) ?? [];
  const phaseB8343FunnelRows = phaseB8343Result?.per_family_funnel?.slice(0, 12) ?? [];
  const phaseB8343RawRows = phaseB8343Result?.raw_sidecar_attestation?.slice(0, 4) ?? [];
  const phaseB83431StatusRows = [
    ["Lineage", phaseB83431Result?.lineage_scope],
    ["Parent", phaseB83431Result?.parent_lineage_scope],
    ["Parent Batch", phaseB83431Result?.parent_b8343_batch_id],
    ["Source B.8.3.4.3", phaseB83431Result?.source_b8343_batch_id],
    ["Source B.8.3.4.3.1", phaseB83431Result?.source_b83431_batch_id],
    ["Source B.8.3.6", phaseB83431Result?.source_b836_batch_id],
    ["Source Kind", phaseB83431Result?.source_lineage_kind],
    ["Raw Sidecar", phaseB83431Result?.raw_sidecar_attestation_status],
    ["Source Config", phaseB83431Result?.source_config_attestation_status],
    ["Rule Provenance", phaseB83431Result?.rule_provenance_status],
    ["Trigger Rule", phaseB83431Result?.trigger_rule_binding_status],
    ["Trigger Attest", phaseB83431Result?.trigger_rule_attestation_status],
    ["Feature Pipeline", phaseB83431Result?.feature_pipeline_attestation_status],
    ["Trigger Input", phaseB83431Result?.trigger_input_integrity_status],
    ["Replay Parity", phaseB83431Result?.persisted_vs_recomputed_trigger_parity_status],
    ["Deterministic Replay", phaseB83431Result?.deterministic_trigger_replay_status],
    ["Sequential Wiring", phaseB83431Result?.sequential_funnel_wiring_status],
    ["Ledger Attest", phaseB83431Result?.normalized_ledger_attestation_status],
    ["Publish", phaseB83431Result?.normalized_sidecar_publish_status],
    ["Locked Confirmation", phaseB83431Result?.locked_confirmation_status],
    ["Locked Rows Read", String(phaseB83431Result?.locked_confirmation_row_consumption_count ?? 0)],
    ["Live Threshold", String(phaseB83431Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB83431SourceRows = [
    ["Source B.8.3.4.3", phaseB83431Result?.source_b8343_batch_id],
    ["Source B.8.3.4.3.1", phaseB83431Result?.source_b83431_batch_id],
    ["Source B.8.3.6", phaseB83431Result?.source_b836_batch_id],
    ["Source Kind", phaseB83431Result?.source_lineage_kind]
  ];
  const phaseB83431Blockers = phaseB83431Result?.blockers?.slice(0, 12) ?? [];
  const phaseB83431TriggerRows = phaseB83431Result?.trigger_rule_provenance?.slice(0, 8) ?? [];
  const phaseB83431InputRows = phaseB83431Result?.trigger_input_audit?.slice(0, 8) ?? [];
  const phaseB83431ParityRows = phaseB83431Result?.persisted_vs_recomputed_trigger_audit?.slice(0, 8) ?? [];
  const phaseB83431FunnelRows = phaseB83431Result?.sequential_funnel?.slice(0, 8) ?? [];
  const phaseB83431WaterfallRows = phaseB83431Result?.first_failing_gate_waterfall?.slice(0, 8) ?? [];
  const phaseB83432StatusRows = [
    ["Lineage", phaseB83432Result?.lineage_scope],
    ["Source Parent", phaseB83432Result?.source_parent_lineage_scope],
    ["Parent Batch", phaseB83432Result?.source_parent_b8343_batch_id],
    ["Diagnostic Parent", phaseB83432Result?.diagnostic_parent_b83431_batch_id],
    ["Materialization", phaseB83432Result?.trigger_input_materialization_status],
    ["Materialization Source", phaseB83432Result?.trigger_input_materialization_source],
    ["Trigger Rule", phaseB83432Result?.trigger_rule_binding_status],
    ["Trigger Attest", phaseB83432Result?.trigger_rule_attestation_status],
    ["Input Schema", phaseB83432Result?.trigger_input_schema_status],
    ["Input Integrity", phaseB83432Result?.trigger_input_integrity_status],
    ["Nonvacuous Replay", phaseB83432Result?.nonvacuous_trigger_replay_status],
    ["Replay Parity", phaseB83432Result?.persisted_vs_recomputed_trigger_parity_status],
    ["Deterministic Replay", phaseB83432Result?.deterministic_trigger_replay_status],
    ["Sequential Wiring", phaseB83432Result?.sequential_funnel_wiring_status],
    ["Ledger Attest", phaseB83432Result?.normalized_ledger_attestation_status],
    ["Publish", phaseB83432Result?.normalized_sidecar_publish_status],
    ["Locked Confirmation", phaseB83432Result?.locked_confirmation_status],
    ["Locked Rows Read", String(phaseB83432Result?.locked_confirmation_row_consumption_count ?? 0)],
    ["Live Threshold", String(phaseB83432Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB83432HashRows = [
    ["Parent Manifest", compactHash(phaseB83432Result?.source_parent_b8343_manifest_file_sha256)],
    ["Parent Semantic", compactHash(phaseB83432Result?.source_parent_b8343_manifest_semantic_hash)],
    ["Trigger Input", compactHash(phaseB83432Result?.trigger_input_frame_sha256)],
    [
      "Candidate Ledger",
      compactHash(
        phaseB83432Result?.ledger_attestation?.candidate_ledger_sha256
      )
    ],
    [
      "Trade Ledger",
      compactHash(
        phaseB83432Result?.ledger_attestation?.trade_ledger_sha256
      )
    ],
    ["Sidecar Manifest", compactHash(phaseB83432Result?.sidecar_manifest_sha256)]
  ];
  const phaseB83432InventoryPayload = phaseB83432Result?.trigger_source_inventory;
  const phaseB83432InventoryRows = Array.isArray(phaseB83432InventoryPayload) ? phaseB83432InventoryPayload.slice(0, 12) : phaseB83432InventoryPayload?.mapping_rows?.slice(0, 12) ?? [];
  const phaseB83432PredictionResolutionRows = phaseB83432Result?.prediction_payload_resolution?.slice(0, 8) ?? [];
  const phaseB83432Blockers = phaseB83432Result?.blockers?.slice(0, 12) ?? [];
  const phaseB835StatusRows = [
    ["Lineage", phaseB835Result?.lineage_scope],
    ["Temporal Split", phaseB835Result?.temporal_split_status],
    ["Global Purge", String(phaseB835Result?.global_purge_gap ?? 0)],
    ["Boundary Policy", phaseB835Result?.identical_family_boundary_policy_status],
    ["Locked Confirmation", phaseB835Result?.locked_confirmation_status],
    ["Locked Rows Read", String(phaseB835Result?.locked_confirmation_row_consumption_count ?? 0)],
    ["Raw Metrics", phaseB835Result?.raw_policy_metrics_status],
    ["Calibration", phaseB835Result?.diagnostic_calibration_status],
    ["Threshold Selection", phaseB835Result?.threshold_selection_status],
    ["Frozen Policies", String(phaseB835Result?.frozen_policy_count ?? 0)],
    ["Validation", phaseB835Result?.validation_replay_status],
    ["Root Cause", phaseB835Result?.root_cause_classification],
    ["Live Threshold", String(phaseB835Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB835Blockers = phaseB835Result?.blockers?.slice(0, 12) ?? [];
  const phaseB835RawRows = phaseB835Result?.raw_policy_metrics?.slice(0, 36) ?? [];
  const phaseB835CalibrationRows = phaseB835Result?.diagnostic_calibration_metrics?.slice(0, 18) ?? [];
  const phaseB835FrozenRows = phaseB835Result?.frozen_policies?.slice(0, 12) ?? [];
  const phaseB835ValidationRows = phaseB835Result?.validation_results?.slice(0, 12) ?? [];
  const phaseB836StatusRows = [
    ["Lineage", phaseB836Result?.audit_lineage_scope],
    ["Historical Proof", String(phaseB836Result?.historical_root_cause_proven ?? false)],
    ["Ledger Hash", phaseB836Result?.ledger_hash_verification_status],
    ["Split Boundary", phaseB836Result?.shared_boundary_consistency_status],
    ["Timestamp", phaseB836Result?.timestamp_normalization_status],
    ["Purge", phaseB836Result?.purge_exclusion_status],
    ["Region Assign", phaseB836Result?.region_assignment_status],
    ["Candidate Join", phaseB836Result?.candidate_ledger_join_status],
    ["Trade Join", phaseB836Result?.trade_ledger_join_status],
    ["Event IDs", phaseB836Result?.event_id_integrity_status],
    ["Frontend Grouping", phaseB836Result?.frontend_grouping_render_status],
    ["Root Cause", phaseB836Result?.root_cause_classification],
    ["Outside Rows", String(phaseB836Result?.outside_expected_range_count ?? 0)],
    ["Live Threshold", String(phaseB836Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB836Blockers = phaseB836Result?.blockers?.slice(0, 12) ?? [];
  const phaseB836DistributionRows = phaseB836Result?.per_family_region_distribution?.slice(0, 48) ?? [];
  const phaseB836WaterfallRows = phaseB836Result?.per_family_gate_failure_waterfall?.slice(0, 48) ?? [];
  const phaseB836HistogramRows = phaseB836Result?.per_family_time_bucket_histograms?.slice(0, 36) ?? [];
  const phaseB8361StatusRows = [
    ["Audit Only", String(phaseB8361Result?.audit_only ?? true)],
    ["Source B.8.3.4.3", phaseB8361Result?.source_b8343_batch_id],
    ["Source B.8.3.4.3.1", phaseB8361Result?.source_b83431_batch_id],
    ["Source B.8.3.6", phaseB8361Result?.source_b836_batch_id],
    ["Source Kind", phaseB8361Result?.source_lineage_kind],
    ["Trigger Provenance", phaseB8361Result?.trigger_rule_provenance_status],
    ["Input Integrity", phaseB8361Result?.trigger_input_integrity_status],
    ["Persisted vs Recomputed", phaseB8361Result?.persisted_vs_recomputed_trigger_parity_status],
    ["Deterministic Replay", phaseB8361Result?.deterministic_trigger_replay_status],
    ["Sequential Wiring", phaseB8361Result?.sequential_funnel_wiring_status],
    ["Root Cause", phaseB8361Result?.root_cause_classification],
    ["Locked Confirmation", phaseB8361Result?.locked_confirmation_status],
    ["Locked Rows Read", String(phaseB8361Result?.locked_confirmation_row_consumption_count ?? 0)],
    ["Live Threshold", String(phaseB8361Result?.configured_live_threshold ?? 0.55)]
  ];
  const phaseB8361Blockers = phaseB8361Result?.blockers?.slice(0, 12) ?? [];
  const phaseB8361TriggerRows = phaseB8361Result?.trigger_rule_provenance?.slice(0, 12) ?? [];
  const phaseB8361InputRows = phaseB8361Result?.trigger_input_audit?.slice(0, 24) ?? [];
  const phaseB8361ParityRows = phaseB8361Result?.persisted_vs_recomputed_trigger_audit?.slice(0, 24) ?? [];
  const phaseB8361FunnelRows = phaseB8361Result?.sequential_funnel?.slice(0, 24) ?? [];
  const phaseB8361WaterfallRows = phaseB8361Result?.first_failing_gate_waterfall?.slice(0, 36) ?? [];
  const activeBrokerEconomics = phaseA1Result?.broker_economics ?? phaseA1Result?.cost_audit?.broker_economics ?? brokerEconomics;
  const bestShadowProfiles = phaseA1Best?.shadow_cost_backtest?.profiles;
  return /* @__PURE__ */ jsxs("div", { className: "relative min-h-screen text-foreground", children: [
    /* @__PURE__ */ jsx("div", { className: "velvet-vignette", "aria-hidden": true }),
    /* @__PURE__ */ jsxs("div", { className: "bokeh-field", "aria-hidden": true, children: [
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "bk",
          style: { width: 180, height: 180, left: "15%", top: "8%", animationDelay: "0s" }
        }
      ),
      /* @__PURE__ */ jsx(
        "span",
        {
          className: "bk",
          style: { width: 220, height: 220, left: "65%", top: "45%", animationDelay: "-4s" }
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-blueprint" }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, className: "Monogram-watermark right-[-4%] top-[18%] hidden lg:block", children: "Au" }),
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl", children: [
      /* @__PURE__ */ jsx(
        Ticker,
        {
          symbol,
          bid: market?.bid,
          ask: market?.ask,
          spread: market?.spread,
          mt5Online: Boolean(status?.mt5_online),
          feeds: data?.ticker_feeds
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-[1480px] items-center justify-between gap-6 px-6 py-4", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-3 hover:opacity-90 transition", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold shadow-gold", children: [
            /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute inset-0 rounded-xl ring-1 ring-[oklch(0.88_0.018_95/0.5)] [animation:pulse-glow_3s_ease-in-out_infinite]" }),
            /* @__PURE__ */ jsx(Crown, { className: "relative h-5 w-5 text-background", strokeWidth: 2.5 })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-2 text-base font-semibold tracking-tight", children: [
              /* @__PURE__ */ jsx("span", { className: "font-serif text-lg", children: "Aurum" }),
              /* @__PURE__ */ jsx("span", { className: "text-shine font-serif text-lg", children: "AI" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-md border border-[oklch(0.88_0.018_95/0.3)] bg-[oklch(0.88_0.018_95/0.08)] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[oklch(0.96_0.012_95)]", children: "Pro" })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "font-mono-num text-[11px] text-muted-foreground", children: [
              symbol,
              " · ",
              status?.timeframe ?? "M5",
              " · ",
              accountMode
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-1.5 rounded-xl border border-border bg-surface/60 p-1 md:flex", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              search: { tab: "dashboard" },
              className: "relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-foreground",
              children: "Dashboard"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              search: { tab: "performance" },
              className: "relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-foreground",
              children: "Performance"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              search: { tab: "logs" },
              className: "relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-foreground",
              children: "Logs"
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/train",
              className: "relative rounded-lg px-4 py-1.5 text-sm font-semibold transition bg-gradient-gold-soft text-[oklch(0.96_0.012_95)] shadow-gold-soft",
              children: "Retrainer"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            StatusPill,
            {
              tone: backendOnline ? "success" : "danger",
              label: backendOnline ? "Backend Online" : "Backend Offline",
              icon: Cpu
            }
          ),
          /* @__PURE__ */ jsx(
            StatusPill,
            {
              tone: status?.engine_online ? "success" : "danger",
              label: status?.engine_online ? "Engine Online" : "Engine Offline",
              icon: Bot
            }
          ),
          /* @__PURE__ */ jsx(
            StatusPill,
            {
              tone: status?.mt5_online ? "success" : "danger",
              label: status?.mt5_online ? "MT5 Online" : "MT5 Offline",
              icon: Activity
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-[1480px] space-y-6 px-6 py-6 animate-in fade-in-50 duration-350", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              to: "/",
              className: "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/50 text-muted-foreground transition hover:text-foreground",
              children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4.5 w-4.5" })
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold tracking-tight", children: "AI Office Retrainer Workspace" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Manage ensemble models, perform feature engineering training runs, and audit decision filters." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => void fetchData(),
            className: "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background/50 text-xs font-medium text-muted-foreground transition hover:text-[oklch(0.96_0.012_95)]",
            children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5" }),
              " Refresh Workspace"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-5 space-y-6", children: [
          /* @__PURE__ */ jsx(SectionCard, { numeral: "01", title: "Active Champion Model", icon: Crown, children: /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[oklch(0.88_0.018_95/0.25)] bg-gradient-gold-soft p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[oklch(0.96_0.012_95)]", children: [
              /* @__PURE__ */ jsx(Crown, { className: "h-3.5 w-3.5" }),
              "Active Model Instance"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3 text-xs", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Version / Source" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num font-semibold", children: modelStatus?.model_source ?? "Waiting for backend" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Hash (SHA-256)" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono-num font-semibold text-muted-foreground", children: compactHash(modelStatus?.champion_model_hash) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-3 grid grid-cols-3 gap-2 text-xs", children: [
              {
                label: "PF (Profit Factor)",
                value: championBacktest?.profit_factor?.toFixed(2) ?? "--"
              },
              {
                label: "Max Drawdown",
                value: championBacktest?.max_drawdown == null ? "--" : `${championBacktest.max_drawdown.toFixed(2)}%`
              },
              {
                label: "Expectancy",
                value: championBacktest?.expectancy == null ? "--" : formatSigned(championBacktest.expectancy)
              }
            ].map((item) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "rounded-lg border border-[oklch(0.88_0.018_95/0.16)] bg-background/30 p-2",
                children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-[0.14em] text-muted-foreground", children: item.label }),
                  /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono-num font-semibold", children: item.value })
                ]
              },
              item.label
            )) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-[oklch(0.88_0.018_95/0.2)] pt-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[11px] text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 text-[oklch(0.96_0.012_95)]" }),
                " Loaded into Live Engine"
              ] }),
              /* @__PURE__ */ jsx(
                StatusPill,
                {
                  label: modelStatus?.champion_loaded ? "ACTIVE" : "MISSING",
                  tone: modelStatus?.champion_loaded ? "success" : "danger",
                  icon: BrainCircuit
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(SectionCard, { numeral: "02", title: "Feature Importance Analysis", icon: Flame, children: /* @__PURE__ */ jsxs("div", { className: "space-y-3.5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Relative weighting of the top predictive parameters generated in the latest retraining run." }),
            parsedFeatureImportance.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: parsedFeatureImportance.map((feat) => {
              const pct = Math.min(100, Math.max(0, feat.value * 100));
              return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] font-mono-num", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "text-foreground/80 truncate max-w-[280px]",
                      title: feat.label,
                      children: feat.label
                    }
                  ),
                  /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground font-semibold", children: [
                    (feat.value * 100).toFixed(2),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full rounded-full bg-background/50 overflow-hidden border border-border/20", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-full bg-gradient-gold rounded-full",
                    style: { width: `${pct}%` }
                  }
                ) })
              ] }, feat.label);
            }) }) : /* @__PURE__ */ jsx(DataState, { message: "No feature importance registry found. Train a new candidate." })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-7 space-y-6", children: /* @__PURE__ */ jsx(SectionCard, { numeral: "03", title: "Ensemble Retraining Parameters", icon: Settings, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Modify the base parameters for the institutional XGBoost ensemble feature engine. Retraining evaluates setup candidates on holdout historical periods." }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-border/40 bg-background/20 p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: "Candles Size" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  min: "5000",
                  max: "200000",
                  value: trainingCandles,
                  onChange: (e) => setTrainingCandles(Number(e.target.value))
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "Recommended: 20,000 M5 when broker M1 history is about 100,000 bars. Higher requests need more MT5 M1 history downloaded first." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: "AI Confidence Threshold (%)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  step: "5",
                  min: "10",
                  max: "95",
                  value: trainMinConfidence,
                  onChange: (e) => setTrainMinConfidence(Number(e.target.value))
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "Minimum model confidence value to issue trades." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: "Trend Threshold" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  step: "0.05",
                  min: "0.15",
                  max: "0.95",
                  value: trainTrendThreshold,
                  onChange: (e) => setTrainTrendThreshold(Number(e.target.value))
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "Classifier threshold for trend confirmation." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: "Entry Threshold" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  step: "0.05",
                  min: "0.15",
                  max: "0.95",
                  value: trainEntryThreshold,
                  onChange: (e) => setTrainEntryThreshold(Number(e.target.value))
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "Classifier threshold for trade setup entry." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: "Risk Filter Threshold" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  step: "0.05",
                  min: "0.10",
                  max: "0.95",
                  value: trainRiskThreshold,
                  onChange: (e) => setTrainRiskThreshold(Number(e.target.value))
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "Combined classifier threshold to block high-risk environments." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
              /* @__PURE__ */ jsx("label", { className: "text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: "Max Allowed Spread (Pips)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  step: "0.5",
                  min: "1.0",
                  max: "25.0",
                  value: trainMaxSpread,
                  onChange: (e) => setTrainMaxSpread(Number(e.target.value))
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "Units represent full pips (spread is normalized in gold)." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "md:col-span-2 flex items-center justify-between border-t border-border/20 pt-3", children: [
              /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: trainDebugMode,
                    onChange: (e) => setTrainDebugMode(e.target.checked),
                    className: "rounded border-border text-[oklch(0.72_0.14_30)] focus:ring-0 bg-background/50"
                  }
                ),
                "Enable Decision Pipeline Debug Logging (Generates Diagnostic Tables)"
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/25 font-mono", children: trainingJobId ? `${trainingState ?? "running"}` : "Ready" })
            ] })
          ] }),
          (trainingJobId || modelStatus?.training_in_progress) && /* @__PURE__ */ jsxs("div", { className: "space-y-1.5 border border-border/30 rounded-xl bg-background/30 p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs font-medium", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                "Training candidate... (",
                trainingState || "processing",
                ")"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "font-mono-num font-semibold text-gold", children: [
                trainingProgress,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Progress, { value: trainingProgress, className: "h-2.5 bg-background/60" })
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              disabled: !capabilities.model_training.allowed || trainingPending || Boolean(trainingJobId),
              onClick: () => void startTraining(),
              className: "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-3 text-sm font-semibold text-background shadow-gold transition disabled:cursor-not-allowed disabled:opacity-55",
              children: [
                trainingPending ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "size-4 animate-pulse" }),
                "Execute Candidate Retraining Run"
              ]
            }
          ),
          trainingError && /* @__PURE__ */ jsxs("p", { className: "break-words text-center text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/25 rounded-lg p-2.5", children: [
            "Job Failed: ",
            trainingError
          ] }),
          !capabilities.model_training.allowed && /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-muted-foreground", children: capabilities.model_training.reason })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-12", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-5", children: /* @__PURE__ */ jsx(
          SectionCard,
          {
            numeral: "04",
            title: "Latest Candidate Signal Diagnostics",
            icon: ShieldAlert,
            children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: latestCandidate ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border/35 pb-2.5", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      className: "font-mono-num font-bold text-sm truncate max-w-[200px]",
                      title: latestCandidate.run_id,
                      children: latestCandidate.run_id
                    }
                  ),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground font-semibold uppercase tracking-wider", children: latestCandidate.model_version ?? "Ensemble Model" })
                ] }),
                /* @__PURE__ */ jsx(
                  StatusPill,
                  {
                    label: latestCandidate.eligible ? "Eligible" : "Review",
                    tone: latestCandidate.eligible ? "success" : "muted",
                    icon: ShieldCheck
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs font-medium", children: [
                /* @__PURE__ */ jsxs("div", { className: "p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px] uppercase tracking-wider", children: "Accuracy" }),
                  /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-sm text-foreground mt-0.5", children: [
                    ((latestCandidate.metrics?.holdout?.accuracy ?? 0) * 100).toFixed(2),
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px] uppercase tracking-wider", children: "Holdout Signals" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono-num text-sm text-foreground mt-0.5", children: latestCandidate.metrics?.holdout?.trade_signals ?? 0 })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px] uppercase tracking-wider", children: "Win Rate" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono-num text-sm text-foreground mt-0.5", children: formatNullablePercent(
                    latestCandidate.metrics?.holdout?.backtest?.win_rate
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px] uppercase tracking-wider", children: "Profit Factor" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono-num text-sm text-foreground mt-0.5", children: formatNullableNumber(
                    latestCandidate.metrics?.holdout?.backtest?.profit_factor
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px] uppercase tracking-wider", children: "Expectancy" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono-num text-sm text-foreground mt-0.5", children: formatNullableSigned(
                    latestCandidate.metrics?.holdout?.backtest?.expectancy
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[10px] uppercase tracking-wider", children: "Avg Reward/Risk" }),
                  /* @__PURE__ */ jsx("span", { className: "font-mono-num text-sm text-foreground mt-0.5", children: formatNullableNumber(
                    latestCandidate.metrics?.holdout?.backtest?.average_rr
                  ) })
                ] })
              ] }),
              latestCandidate.metrics?.holdout?.rejection_diagnostics && /* @__PURE__ */ jsxs("div", { className: "border-t border-border/40 pt-3 space-y-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold", children: "Combined Pipeline Rejections" }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium border border-border/30 rounded-xl bg-background/10 p-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Total Evaluated:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground/80", children: latestCandidate.metrics.holdout.rejection_diagnostics.total_candles_evaluated ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Candidates (B/S):" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground/80", children: [
                      latestCandidate.metrics.holdout.rejection_diagnostics.buy_candidates ?? 0,
                      " ",
                      "/",
                      " ",
                      latestCandidate.metrics.holdout.rejection_diagnostics.sell_candidates ?? 0
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Trend Blocked:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-destructive/85", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejected_by_trend_threshold ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Entry Blocked:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-destructive/85", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejected_by_entry_threshold ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Risk Blocked:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-destructive/85", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejected_by_risk_filter ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Spread Blocked:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-destructive/85", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejected_by_spread ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "News Blocked:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-destructive/85", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejected_by_news ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Low Confidence:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-destructive/85", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejected_by_no_threshold ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Invalid SL/TP:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-destructive/85", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejected_by_sl_tp ?? 0 })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between border-b border-border/10 pb-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold", children: "Final Signals:" }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-emerald-500 font-semibold", children: latestCandidate.metrics.holdout.rejection_diagnostics.final_signals ?? 0 })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground border-t border-border/20 pt-2 font-mono-num", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsx("span", { children: "Avg/Max Spread:" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground/80", children: [
                      (latestCandidate.metrics.holdout.rejection_diagnostics.avg_spread ?? 0).toFixed(2),
                      " ",
                      "/",
                      " ",
                      (latestCandidate.metrics.holdout.rejection_diagnostics.max_spread ?? 0).toFixed(2),
                      " ",
                      "pips"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsx("span", { children: "Avg/Min Conf:" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground/80", children: [
                      (latestCandidate.metrics.holdout.rejection_diagnostics.avg_confidence ?? 0).toFixed(3),
                      " ",
                      "/",
                      " ",
                      (latestCandidate.metrics.holdout.rejection_diagnostics.min_confidence ?? 0).toFixed(3)
                    ] })
                  ] })
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No candidate model active. Run retrainer above." }) })
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-7", children: /* @__PURE__ */ jsx(
          SectionCard,
          {
            numeral: "05",
            title: "Decision Pipeline Rejection Trace",
            icon: AlertTriangle,
            children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audits rejected setups chronologically. Useful for identifying Unit errors (e.g. raw points vs pips) and tuning prediction confidence values." }),
              latestCandidate?.metrics?.holdout?.rejection_diagnostics?.rejection_trace && latestCandidate.metrics.holdout.rejection_diagnostics.rejection_trace.length > 0 ? /* @__PURE__ */ jsx("div", { className: "max-h-[385px] overflow-y-auto rounded-xl border border-border/40 bg-background/15 backdrop-blur-sm shadow-inner scrollbar-thin", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-left border-collapse", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/45 text-[10px] text-muted-foreground uppercase tracking-wider sticky top-0 z-10 font-semibold", children: [
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2 font-medium", children: "Idx" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2 font-medium text-center", children: "Trend" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2 font-medium text-center", children: "Entry" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2 font-medium text-center", children: "Confidence" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2 font-medium text-center", children: "Spread" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-2 font-medium", children: "Rejection Reason" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: latestCandidate.metrics.holdout.rejection_diagnostics.rejection_trace.map(
                  (t, idx) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/25 transition", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-muted-foreground font-semibold", children: t.idx }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center text-foreground/80", children: (t.trend_score ?? 0).toFixed(3) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center text-foreground/80", children: (t.entry_score ?? 0).toFixed(3) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-medium text-foreground", children: (t.confidence ?? 0).toFixed(3) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center text-foreground/80", children: (t.spread ?? 0).toFixed(2) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-sans font-semibold border border-destructive/20 bg-destructive/10 text-[oklch(0.72_0.20_22)]", children: t.rejection_reason }) })
                  ] }, idx)
                ) })
              ] }) }) : /* @__PURE__ */ jsx(DataState, { message: "No rejection trace found. Enable debug mode in retrainer parameters." })
            ] })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(SectionCard, { numeral: "06", title: "Data Pipeline Audit", icon: LineChart, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Tracks how raw candles become the final evaluated holdout rows, so reduced sample counts are visible before tuning thresholds." }),
        pipelineAudit ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
            [
              "Requested M5",
              pipelineAudit.requested_m5_candles ?? pipelineAudit.requested_anchor_count ?? pipelineAudit.raw_candles
            ],
            ["Received M5", pipelineAudit.received_m5_candles ?? pipelineAudit.raw_candles],
            ["Required M1", pipelineAudit.required_m1_candles],
            ["Received M1", pipelineAudit.received_m1_candles],
            ["Received M15", pipelineAudit.received_m15_candles],
            ["Received H1", pipelineAudit.received_h1_candles],
            ["After Features", pipelineAudit.rows_after_feature_engineering],
            [
              "Clean Retention",
              pipelineAudit.clean_row_retention_pct == null ? null : `${pipelineAudit.clean_row_retention_pct.toFixed(2)}%`
            ],
            ["Clean Rows", pipelineAudit.clean_rows],
            ["Training Rows", pipelineAudit.training_rows],
            [
              "Purge Gap Rows",
              pipelineAudit.purged_lookahead_gap_rows ?? pipelineAudit.validation_rows
            ],
            ["Holdout Rows", pipelineAudit.holdout_rows],
            ["Final Evaluated", pipelineAudit.final_evaluated_rows]
          ].map(([label, value]) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "rounded-xl border border-border/30 bg-background/20 p-3",
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono-num text-lg font-bold text-foreground", children: typeof value === "string" ? value : Number(value ?? 0).toLocaleString() })
              ]
            },
            String(label)
          )) }),
          sweepResult?.leakage_audit && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/30 bg-background/20 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: "Leakage Audit" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 text-[11px]", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `rounded-full border px-2 py-0.5 font-semibold ${sweepResult.leakage_audit.status === "pass" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-destructive/30 bg-destructive/10 text-destructive"}`,
                  children: sweepResult.leakage_audit.status ?? "unknown"
                }
              ),
              Object.entries(sweepResult.leakage_audit.checks ?? {}).map(
                ([name, passed]) => /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: `rounded-full border px-2 py-0.5 ${passed ? "border-emerald-400/25 text-emerald-300" : "border-destructive/25 text-destructive"}`,
                    children: [
                      name,
                      ": ",
                      passed ? "pass" : "fail"
                    ]
                  },
                  name
                )
              )
            ] })
          ] }),
          pipelineAudit.explanation && /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-[oklch(0.88_0.018_95/0.18)] bg-[oklch(0.88_0.018_95/0.06)] p-3 text-xs leading-relaxed text-muted-foreground", children: pipelineAudit.explanation }),
          latestCandidate?.metric_sanity_audit && latestCandidate.metric_sanity_audit.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/30 bg-background/20 p-3", children: [
            /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: "Metric Sanity Notes" }),
            /* @__PURE__ */ jsx("div", { className: "space-y-1 text-[11px] text-muted-foreground", children: latestCandidate.metric_sanity_audit.slice(0, 6).map((item, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground/70", children: item.path }),
              /* @__PURE__ */ jsx("span", { children: item.message })
            ] }, `${item.path}-${index}`)) })
          ] })
        ] }) : /* @__PURE__ */ jsx(DataState, { message: "No pipeline audit metadata is available yet. Run a candidate or threshold sweep." })
      ] }) }),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "07",
          title: "Diagnostic Threshold Sweep — Not Promotion Evidence",
          icon: Gauge,
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "max-w-3xl text-xs text-muted-foreground", children: "Reuses cached holdout probabilities from the latest candidate and evaluates decision-threshold combinations without retraining the ensemble. Threshold sweep results are exploratory only. Final eligibility requires true rolling walk-forward validation." }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  disabled: sweepPending || !latestCandidate?.run_id,
                  onClick: () => void runThresholdSweep(),
                  className: "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-background shadow-gold transition disabled:cursor-not-allowed disabled:opacity-55",
                  children: [
                    sweepPending ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Gauge, { className: "size-4" }),
                    "Run Threshold Sweep"
                  ]
                }
              )
            ] }),
            sweepError && /* @__PURE__ */ jsxs("p", { className: "break-words rounded-lg border border-destructive/25 bg-destructive/10 p-2.5 text-center text-xs font-semibold text-destructive", children: [
              "Sweep Failed: ",
              sweepError
            ] }),
            sweepResult ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-5", children: [
                ["Candidate", sweepResult.candidate_id],
                ["Combos", sweepResult.combo_count],
                ["Shortlist", sweepResult.shortlist.length],
                ["Generated", sweepResult.generated_at],
                ["Evaluated Rows", sweepResult.pipeline_audit?.final_evaluated_rows]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/30 bg-background/20 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `rounded-xl border p-3 text-xs ${sweepResult.parity_audit?.status === "pass" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : "border-destructive/25 bg-destructive/10 text-destructive"}`,
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "font-semibold", children: [
                      "Evaluator parity:",
                      " ",
                      (sweepResult.parity_audit?.status || "unknown").toUpperCase()
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 text-muted-foreground", children: "Sweep metrics are checked against the same honest execution simulator used by holdout and walk-forward paths." }),
                    sweepResult.parity_audit?.differences && sweepResult.parity_audit.differences.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1 font-mono-num text-[11px]", children: sweepResult.parity_audit.differences.slice(0, 4).map((diff, index) => /* @__PURE__ */ jsxs("div", { children: [
                      diff.metric,
                      ": ",
                      String(diff.left),
                      " vs ",
                      String(diff.right)
                    ] }, `${diff.metric}-${index}`)) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-xl border border-border/30 bg-background/15 p-3 md:flex-row md:items-center md:justify-between", children: [
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: sweepShortlistOnly,
                      onChange: (event) => setSweepShortlistOnly(event.target.checked),
                      className: "rounded border-border bg-background/50"
                    }
                  ),
                  "Show shortlist candidates only"
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
                  "Sort by",
                  /* @__PURE__ */ jsxs(
                    "select",
                    {
                      value: sweepSortKey,
                      onChange: (event) => setSweepSortKey(event.target.value),
                      className: "rounded-lg border border-border bg-background/70 px-2 py-1 text-xs text-foreground",
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "profit_factor", children: "Profit Factor" }),
                        /* @__PURE__ */ jsx("option", { value: "expectancy", children: "Expectancy" }),
                        /* @__PURE__ */ jsx("option", { value: "signals", children: "Signals" }),
                        /* @__PURE__ */ jsx("option", { value: "win_rate", children: "Winrate" }),
                        /* @__PURE__ */ jsx("option", { value: "average_rr", children: "Average RR" }),
                        /* @__PURE__ */ jsx("option", { value: "total_return", children: "Total Return" }),
                        /* @__PURE__ */ jsx("option", { value: "max_drawdown", children: "Max Drawdown" })
                      ]
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1180px] text-left text-xs", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Trend" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Entry" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Conf" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Buy" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Sell" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Winrate" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Avg RR" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Return" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Max DD" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Gate" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: sortedSweepRows.slice(0, 25).map((row) => /* @__PURE__ */ jsxs(
                  "tr",
                  {
                    className: "hover:bg-background/20",
                    children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.trend_threshold.toFixed(2) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.entry_threshold.toFixed(2) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        row.confidence_threshold.toFixed(0),
                        "%"
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center text-foreground", children: row.signals }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.buy_signals }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.sell_signals }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(row.win_rate) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.average_rr) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        row.total_return.toFixed(2),
                        "%"
                      ] }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        row.max_drawdown.toFixed(2),
                        "%"
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: `rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${row.shortlisted ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-border bg-background/20 text-muted-foreground"}`,
                          children: row.shortlisted ? "Shortlist" : "Review"
                        }
                      ) })
                    ]
                  },
                  `${row.rank}-${row.trend_threshold}-${row.entry_threshold}-${row.confidence_threshold}`
                )) })
              ] }) }),
              segmentedHoldoutSets.length > 0 ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/20 p-4", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: "Segmented Holdout Stability Check" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-3", children: segmentedHoldoutSets.slice(0, 3).map((set) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "rounded-lg border border-border/25 bg-background/20 p-3",
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-3 text-xs", children: [
                        /* @__PURE__ */ jsxs("span", { className: "font-mono-num font-bold text-foreground", children: [
                          "Rank ",
                          set.rank
                        ] }),
                        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                          "Trend ",
                          set.trend_threshold.toFixed(2),
                          " / Entry",
                          " ",
                          set.entry_threshold.toFixed(2),
                          " / Conf",
                          " ",
                          set.confidence_threshold.toFixed(0),
                          "%"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "grid gap-2 md:grid-cols-4", children: set.periods.map((period) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: "rounded border border-border/20 bg-background/25 p-2 text-[11px]",
                          children: [
                            /* @__PURE__ */ jsxs("div", { className: "font-semibold text-foreground", children: [
                              "Period ",
                              period.period
                            ] }),
                            /* @__PURE__ */ jsxs("div", { className: "mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground", children: [
                              /* @__PURE__ */ jsx("span", { children: "Rows" }),
                              /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num", children: period.rows }),
                              /* @__PURE__ */ jsx("span", { children: "Signals" }),
                              /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num", children: period.signals }),
                              /* @__PURE__ */ jsx("span", { children: "PF" }),
                              /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num", children: formatNullableNumber(period.profit_factor) }),
                              /* @__PURE__ */ jsx("span", { children: "Expect" }),
                              /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num", children: formatNullableSigned(period.expectancy) })
                            ] })
                          ]
                        },
                        period.period
                      )) })
                    ]
                  },
                  `${set.rank}-${set.trend_threshold}-${set.entry_threshold}`
                )) })
              ] }) : /* @__PURE__ */ jsx(DataState, { message: "No threshold set passed the initial quality gates yet, so segmented holdout stability is waiting for shortlist candidates." })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "Run a diagnostic threshold sweep to evaluate cached-prediction combinations." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(SectionCard, { numeral: "08", title: "Phase A Label Research Workspace", icon: BrainCircuit, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
          /* @__PURE__ */ jsx("p", { className: "max-w-3xl text-xs text-muted-foreground", children: "Runs a curated cost-aware label experiment batch only. It writes research results, keeps candidate/champion files untouched, and cannot promote a model." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
              "M5 candles",
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  value: phaseAAnchorCount,
                  min: 1e3,
                  max: 5e4,
                  step: 1e3,
                  onChange: (event) => setPhaseAAnchorCount(Number(event.target.value)),
                  className: "w-28"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
              "Runs",
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  value: phaseAMaxRuns,
                  min: 1,
                  max: 36,
                  onChange: (event) => setPhaseAMaxRuns(Number(event.target.value)),
                  className: "w-20"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                disabled: phaseAPending || Boolean(phaseAJobId) || trainingPending || !capabilities.model_training.allowed,
                onClick: () => void startPhaseAExperiments(),
                className: "h-9 rounded-xl bg-gradient-gold px-4 text-sm font-semibold text-background shadow-gold",
                children: [
                  phaseAPending || phaseAJobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "mr-2 size-4" }),
                  "Start Phase A"
                ]
              }
            )
          ] })
        ] }),
        (phaseAJobId || phaseAState) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/20 p-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
              "Research job ",
              phaseAJobId ?? "latest"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
              (phaseAState || "idle").toUpperCase(),
              " ",
              phaseAProgress.toFixed(0),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Progress, { value: phaseAProgress, className: "h-2 bg-background/40" })
        ] }),
        phaseAError && /* @__PURE__ */ jsxs("p", { className: "break-words rounded-lg border border-destructive/25 bg-destructive/10 p-2.5 text-center text-xs font-semibold text-destructive", children: [
          "Phase A Failed: ",
          phaseAError
        ] }),
        phaseAResult && phaseAResult.leaderboard?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
            ["Batch", phaseAResult.batch_id],
            ["Matrix", phaseAResult.matrix_used?.length],
            ["Failures", phaseAResult.failures?.length ?? 0],
            ["Phase B", phaseAResult.qualifies_for_phase_b ? "Qualified" : "Not qualified"]
          ].map(([label, value]) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "rounded-xl border border-border/30 bg-background/20 p-3",
              children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
              ]
            },
            String(label)
          )) }),
          phaseAResult.best_label_config && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[oklch(0.84_0.08_305/0.22)] bg-[oklch(0.84_0.08_305/0.08)] p-3 text-xs", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground", children: "Best label configuration" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono-num text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("span", { children: [
                "Mode ",
                phaseAResult.best_label_config.barrier_mode
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "RR ",
                phaseAResult.best_label_config.rr_multiplier
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "SL ATR ",
                phaseAResult.best_label_config.sl_atr_multiplier ?? "fixed"
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Lookahead ",
                phaseAResult.best_label_config.lookahead
              ] }),
              /* @__PURE__ */ jsxs("span", { children: [
                "Net edge x",
                phaseAResult.best_label_config.min_net_edge_cost_multiplier
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1360px] text-left text-xs", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Experiment" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Mode" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "RR" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Look" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "W/L" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Winrate" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Costs" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net PnL" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Max DD" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Worst PF" }),
              /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Gate" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseATopRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-foreground", children: row.experiment_id }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center uppercase", children: row.label_mode }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.label_config.rr_multiplier.toFixed(1) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.label_config.lookahead }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center text-foreground", children: row.signals }),
              /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                row.wins,
                "/",
                row.losses
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(row.winrate) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.total_costs) }),
              /* @__PURE__ */ jsx(
                "td",
                {
                  className: `px-3 py-2 text-center ${row.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`,
                  children: formatCurrency(row.net_pnl)
                }
              ),
              /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                row.max_drawdown.toFixed(2),
                "%"
              ] }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.worst_fold_pf) }),
              /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx(
                "span",
                {
                  className: `rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${row.eligible_for_phase_b ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-border bg-background/20 text-muted-foreground"}`,
                  children: row.eligible_for_phase_b ? "Phase B" : "Rejected"
                }
              ) })
            ] }, row.experiment_id)) })
          ] }) })
        ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase A research batch yet. Start a curated label experiment run." })
      ] }) }),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "09",
          title: "Phase A.1 — Edge Forensics & Broker Cost Audit",
          icon: ShieldCheck,
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
              /* @__PURE__ */ jsx("p", { className: "max-w-3xl text-xs text-muted-foreground", children: "Validates broker cost assumptions, compares no-cost versus realistic-cost backtests, attributes failures by market regime, and only qualifies labels for Phase B feature ablation." }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
                  "M5 candles",
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "number",
                      value: phaseA1AnchorCount,
                      min: 1e3,
                      max: 5e4,
                      step: 1e3,
                      onChange: (event) => setPhaseA1AnchorCount(Number(event.target.value)),
                      className: "w-28"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-[11px] text-muted-foreground", children: [
                  "Runs",
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "number",
                      value: phaseA1MaxRuns,
                      min: 1,
                      max: 30,
                      onChange: (event) => setPhaseA1MaxRuns(Number(event.target.value)),
                      className: "w-20"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    disabled: phaseA1Pending || Boolean(phaseA1JobId) || trainingPending || !capabilities.model_training.allowed,
                    onClick: () => void startPhaseA1Experiments(),
                    className: "h-9 rounded-xl bg-gradient-gold px-4 text-sm font-semibold text-background shadow-gold",
                    children: [
                      phaseA1Pending || phaseA1JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 size-4" }),
                      "Start Phase A.1"
                    ]
                  }
                )
              ] })
            ] }),
            (phaseA1JobId || phaseA1State) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/20 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
                  "Edge forensics job ",
                  phaseA1JobId ?? "latest"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  (phaseA1State || "idle").toUpperCase(),
                  " ",
                  phaseA1Progress.toFixed(0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseA1Progress, className: "h-2 bg-background/40" })
            ] }),
            phaseA1Error && /* @__PURE__ */ jsxs("p", { className: "break-words rounded-lg border border-destructive/25 bg-destructive/10 p-2.5 text-center text-xs font-semibold text-destructive", children: [
              "Phase A.1 Failed: ",
              phaseA1Error
            ] }),
            activeBrokerEconomics ? /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/20 p-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "MT5 Broker Economics" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs", children: [
                  /* @__PURE__ */ jsx("span", { children: "Symbol" }),
                  /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num text-foreground", children: activeBrokerEconomics.symbol ?? "N/A" }),
                  /* @__PURE__ */ jsx("span", { children: "Digits / Point" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-right font-mono-num text-foreground", children: [
                    activeBrokerEconomics.digits ?? "N/A",
                    " /",
                    " ",
                    formatNullableNumber(activeBrokerEconomics.point, 5)
                  ] }),
                  /* @__PURE__ */ jsx("span", { children: "Contract" }),
                  /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num text-foreground", children: formatNullableNumber(activeBrokerEconomics.contract_size) }),
                  /* @__PURE__ */ jsx("span", { children: "Volume min / step" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-right font-mono-num text-foreground", children: [
                    formatNullableNumber(activeBrokerEconomics.volume_min),
                    " /",
                    " ",
                    formatNullableNumber(activeBrokerEconomics.volume_step)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/20 p-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Live Spread & Commission" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs", children: [
                  /* @__PURE__ */ jsx("span", { children: "Spread points" }),
                  /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num text-foreground", children: formatNullableNumber(activeBrokerEconomics.spread_points) }),
                  /* @__PURE__ */ jsx("span", { children: "Spread pips" }),
                  /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num text-foreground", children: formatNullableNumber(activeBrokerEconomics.spread_pips) }),
                  /* @__PURE__ */ jsx("span", { children: "Commission side" }),
                  /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num text-foreground", children: formatCurrency(activeBrokerEconomics.commission_per_side_per_lot ?? 0) }),
                  /* @__PURE__ */ jsx("span", { children: "Slippage pips" }),
                  /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num text-foreground", children: formatNullableNumber(activeBrokerEconomics.slippage_pips) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/20 p-3", children: [
                /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Round-trip Cost" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1 text-xs", children: Object.entries(
                  activeBrokerEconomics.estimated_round_trip_cost_by_lot ?? {}
                ).map(([lot, cost]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    lot,
                    " lot"
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground", children: [
                    formatCurrency(cost.total_usd),
                    " / ",
                    cost.total_pips.toFixed(2),
                    " pips"
                  ] })
                ] }, lot)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "Broker economics audit has not loaded yet." }),
            phaseA1Result && phaseA1Result.leaderboard?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-5", children: [
                ["Batch", phaseA1Result.batch_id],
                ["Cost audit", phaseA1Result.cost_audit?.status],
                ["Matrix", phaseA1Result.matrix_used?.length],
                ["Best shadow", phaseA1Result.best_shadow_conclusion],
                ["Phase B", phaseA1Result.qualifies_for_phase_b ? "Ready" : "Not ready"]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/30 bg-background/20 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                  ]
                },
                String(label)
              )) }),
              bestShadowProfiles && /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[980px] text-left text-xs", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Cost Profile" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Trades" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "W/L" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Winrate" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Costs" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net PnL" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect R" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(bestShadowProfiles).map(([profile, metrics]) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: profile }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: metrics.total_trades }),
                  /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                    metrics.wins,
                    "/",
                    metrics.losses
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(metrics.win_rate) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(metrics.profit_factor) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(metrics.expectancy) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(metrics.cost_totals?.total ?? 0) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(metrics.net_pnl) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(metrics.r_metrics?.expectancy_r, 3) })
                ] }, profile)) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 lg:grid-cols-3", children: ["side", "session", "exit_result"].map((group) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/35 bg-background/20 p-3",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: [
                      "Failure attribution: ",
                      group
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "space-y-1 text-xs", children: (phaseA1Best?.failure_attribution?.[group] ?? []).slice(0, 5).map((row) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "truncate text-foreground", children: row.bucket }),
                      /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num", children: row.signals }),
                      /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num", children: formatNullableNumber(row.profit_factor) }),
                      /* @__PURE__ */ jsx("span", { className: "text-right font-mono-num", children: formatCurrency(row.net_pnl) })
                    ] }, row.bucket)) })
                  ]
                },
                group
              )) }),
              /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1500px] text-left text-xs", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Experiment" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Session" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "SL ATR" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "RR" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Look" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect R" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Cost R" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Move pips" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "DD" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Shadow" }),
                  /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Phase B" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseA1TopRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-foreground", children: row.experiment_id }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.label_config.session_filter ?? "all" }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.label_config.sl_atr_multiplier) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.label_config.rr_multiplier.toFixed(1) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.label_config.lookahead }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.signals }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.expectancy_r, 3) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.average_cost_per_trade_r, 3) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.average_trade_move_pips) }),
                  /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                    row.max_drawdown.toFixed(2),
                    "%"
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.shadow_cost_backtest?.diagnostic_conclusion ?? row.status ?? "N/A" }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: `rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${row.eligible_for_phase_b ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-border bg-background/20 text-muted-foreground"}`,
                      children: row.eligible_for_phase_b ? "Ready" : "No"
                    }
                  ) })
                ] }, row.experiment_id)) })
              ] }) })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase A.1 edge forensics batch yet. Start a curated broker-cost run." })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("details", { className: "rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4", children: [
        /* @__PURE__ */ jsxs("summary", { className: "cursor-pointer list-none text-sm font-semibold text-amber-100", children: [
          "Research History - Legacy Phase B through B.5",
          /* @__PURE__ */ jsx("span", { className: "ml-3 font-mono-num text-[10px] uppercase tracking-[0.14em] text-amber-200/80", children: "LEGACY - PRE COUNT-INTEGRITY AUDIT / NOT VALID FOR PROMOTION OR PHASE-C GATING" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-5", children: [
          /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-amber-400/25 bg-background/35 p-3 text-xs text-amber-100", children: "Historical Phase B through Phase B.5 artifacts are preserved for review only. Use Phase B.5.1 and B.5.2 for active count-safe research decisions." }),
          /* @__PURE__ */ jsx(
            SectionCard,
            {
              numeral: "10",
              title: "Phase B — Feature Ablation & Trade Quality Research",
              icon: BrainCircuit,
              children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only controlled ablation. The Phase A.1 New York ATR baseline stays locked while feature groups and curated trade-quality gates are tested with realistic costs. No model promotion or live execution changes are allowed from this workspace." }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_1fr_auto]", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children: "M5 candles" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 1e3,
                        max: 5e4,
                        value: phaseBAnchorCount,
                        onChange: (event) => setPhaseBAnchorCount(Number(event.target.value)),
                        className: "mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children: "Quality gate runs" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 1,
                        max: 30,
                        value: phaseBQualityRuns,
                        onChange: (event) => setPhaseBQualityRuns(Number(event.target.value)),
                        className: "mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      disabled: phaseBPending || Boolean(phaseBJobId) || Boolean(phaseAJobId) || Boolean(phaseA1JobId) || !capabilities.model_training.allowed,
                      onClick: () => void startPhaseBExperiments(),
                      className: "self-end bg-gradient-gold text-background hover:opacity-90",
                      children: [
                        phaseBPending || phaseBJobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "mr-2 h-4 w-4" }),
                        "Start Phase B"
                      ]
                    }
                  )
                ] }),
                (phaseBJobId || phaseBState) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                      "Phase B job ",
                      phaseBJobId ?? "latest"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground", children: [
                      (phaseBState || "idle").toUpperCase(),
                      " ",
                      phaseBProgress.toFixed(0),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: phaseBProgress, className: "h-2 bg-background/40" })
                ] }),
                phaseBError && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive", children: [
                  "Phase B Failed: ",
                  phaseBError
                ] }),
                phaseBResult?.locked_baseline && /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-5", children: [
                  ["Session", phaseBResult.locked_baseline.session_filter ?? "new_york"],
                  ["SL ATR", phaseBResult.locked_baseline.sl_atr_multiplier],
                  ["RR", phaseBResult.locked_baseline.rr_multiplier],
                  ["Lookahead", phaseBResult.locked_baseline.lookahead],
                  ["Cost edge", phaseBResult.locked_baseline.min_net_edge_cost_multiplier]
                ].map(([label, value]) => /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "rounded-xl border border-border/30 bg-background/20 p-3",
                    children: [
                      /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                      /* @__PURE__ */ jsx("div", { className: "mt-1 font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                    ]
                  },
                  String(label)
                )) }),
                phaseBResult?.feature_ablation?.leaderboard?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-4", children: [
                    ["Batch", phaseBResult.batch_id],
                    [
                      "Best feature set",
                      phaseBBestFeature ?? phaseBResult.feature_ablation.best_feature_set
                    ],
                    ["Phase C", phaseBResult.qualifies_for_phase_c ? "Ready" : "Not ready"],
                    ["Reason", phaseBResult.phase_c_readiness_decision?.reason]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-xl border border-border/30 bg-background/20 p-3",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                      ]
                    },
                    String(label)
                  )) }),
                  /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1500px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Feature Set" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Features" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "W/L" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Winrate" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Real PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "No-cost PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect R" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Costs" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net PnL" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "DD" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Worst PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Phase C" })
                    ] }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseBFeatureRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                        /* @__PURE__ */ jsxs("div", { className: "font-sans font-semibold text-foreground", children: [
                          row.feature_set,
                          " — ",
                          row.feature_set_label
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "max-w-[260px] truncate text-[10px] text-muted-foreground", children: row.rejection_reason ?? row.status })
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.feature_count ?? "--" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.signals ?? 0 }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        row.wins ?? 0,
                        "/",
                        row.losses ?? 0
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(row.winrate) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        row.shadow_cost_backtest?.profiles?.no_cost?.profit_factor
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.expectancy_r, 3) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.total_costs ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.net_pnl ?? 0) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        formatNullableNumber(row.max_drawdown),
                        "%"
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.worst_fold_pf) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        row.buy_signals ?? 0,
                        "/",
                        row.sell_signals ?? 0
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: `rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${row.eligible_for_phase_c ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-border bg-background/20 text-muted-foreground"}`,
                          children: row.eligible_for_phase_c ? "Ready" : "No"
                        }
                      ) })
                    ] }, row.experiment_id)) })
                  ] }) }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Feature Contribution Summary" }),
                      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: (phaseBResult.feature_ablation.contribution_summary ?? []).map((row) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: "grid grid-cols-[80px_1fr_90px_90px] items-center gap-2 rounded-lg border border-border/20 bg-background/20 px-3 py-2 text-xs",
                          children: [
                            /* @__PURE__ */ jsx("span", { className: "font-mono-num font-bold text-foreground", children: row.feature_set }),
                            /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", children: row.added_group }),
                            /* @__PURE__ */ jsx(
                              "span",
                              {
                                className: `text-center font-semibold ${row.classification === "HELPS" ? "text-emerald-400" : row.classification === "HURTS" ? "text-red-400" : row.classification === "UNSTABLE" ? "text-amber-300" : "text-muted-foreground"}`,
                                children: row.classification
                              }
                            ),
                            /* @__PURE__ */ jsxs("span", { className: "text-right font-mono-num", children: [
                              row.delta_realistic_pf >= 0 ? "+" : "",
                              row.delta_realistic_pf.toFixed(3),
                              " PF"
                            ] })
                          ]
                        },
                        row.feature_set
                      )) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                      /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: phaseBBestQuality?.phase_c_readiness_checks ? Object.entries(phaseBBestQuality.phase_c_readiness_checks).map(
                        ([key, passed]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                          /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", children: key }),
                          /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-400" : "text-red-400", children: passed ? "PASS" : "FAIL" })
                        ] }, key)
                      ) : /* @__PURE__ */ jsx(DataState, { message: "No quality-gate readiness checks yet." }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1500px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Quality Config" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Session" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Move/Cost" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Spread" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Cooldown" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "No-cost PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net PnL" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "DD" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Worst PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Phase C" })
                    ] }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseBQualityRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                        /* @__PURE__ */ jsx("div", { className: "font-sans font-semibold text-foreground", children: row.quality_config?.name ?? row.experiment_id }),
                        /* @__PURE__ */ jsx("div", { className: "max-w-[260px] truncate text-[10px] text-muted-foreground", children: row.rejection_reason ?? row.status })
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.quality_config?.session_filter ?? row.session_filter }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.quality_config?.min_move_cost_ratio) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.quality_config?.max_spread_pips) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.quality_config?.cooldown_bars ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.signals ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        row.shadow_cost_backtest?.profiles?.no_cost?.profit_factor
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.net_pnl ?? 0) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        formatNullableNumber(row.max_drawdown),
                        "%"
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.worst_fold_pf) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        row.buy_signals ?? 0,
                        "/",
                        row.sell_signals ?? 0
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: `rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${row.eligible_for_phase_c ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-border bg-background/20 text-muted-foreground"}`,
                          children: row.eligible_for_phase_c ? "Ready" : "No"
                        }
                      ) })
                    ] }, row.experiment_id)) })
                  ] }) })
                ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B batch yet. Start controlled feature ablation after Phase A.1 is ready." })
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            SectionCard,
            {
              numeral: "11",
              title: "Phase B.3 — Robustness & Shadow-Cost Integrity Audit",
              icon: ShieldCheck,
              children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audits the cooldown_6 red flag by separating fixed-trade shadow cost from full bid/ask replay, then runs orthogonal feature ablation and neighborhood robustness before Phase C can be considered." }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_1fr_auto]", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children: "M5 candles" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 1e3,
                        max: 5e4,
                        value: phaseB3AnchorCount,
                        onChange: (event) => setPhaseB3AnchorCount(Number(event.target.value)),
                        className: "mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("label", { className: "text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children: "Robustness runs" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 1,
                        max: 30,
                        value: phaseB3RobustnessRuns,
                        onChange: (event) => setPhaseB3RobustnessRuns(Number(event.target.value)),
                        className: "mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      disabled: phaseB3Pending || Boolean(phaseB3JobId) || Boolean(phaseAJobId) || Boolean(phaseA1JobId) || Boolean(phaseBJobId) || !capabilities.model_training.allowed,
                      onClick: () => void startPhaseB3Experiments(),
                      className: "self-end bg-gradient-gold text-background hover:opacity-90",
                      children: [
                        phaseB3Pending || phaseB3JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                        "Start Phase B.3"
                      ]
                    }
                  )
                ] }),
                (phaseB3JobId || phaseB3State) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                      "Phase B.3 job ",
                      phaseB3JobId ?? "latest"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground", children: [
                      (phaseB3State || "idle").toUpperCase(),
                      " ",
                      phaseB3Progress.toFixed(0),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: phaseB3Progress, className: "h-2 bg-background/40" })
                ] }),
                phaseB3Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive", children: [
                  "Phase B.3 Failed: ",
                  phaseB3Error
                ] }),
                phaseB3Result?.orthogonal_ablation?.leaderboard?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-4", children: [
                    ["Batch", phaseB3Result.batch_id],
                    [
                      "Fixed shadow",
                      phaseB3BestFixed?.monotonicity?.status?.toUpperCase() ?? "N/A"
                    ],
                    [
                      "Robustness",
                      phaseB3Result.neighborhood_robustness?.summary?.classification ?? "N/A"
                    ],
                    ["Phase C", phaseB3Result.qualifies_for_phase_c ? "Ready" : "Not ready"]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-xl border border-border/30 bg-background/20 p-3",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                      ]
                    },
                    String(label)
                  )) }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-border/40 bg-background/25", children: [
                      /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Fixed-Trade Shadow Cost" }),
                      /* @__PURE__ */ jsx("table", { className: "w-full text-xs", children: /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(phaseB3BestFixed?.profiles ?? {}).map(
                        ([profile, metrics]) => /* @__PURE__ */ jsxs("tr", { children: [
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-sans font-semibold text-foreground", children: profile }),
                          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-right", children: [
                            "PF ",
                            formatNullableNumber(metrics.profit_factor)
                          ] }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(metrics.net_pnl) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatNullableSigned(metrics.expectancy) })
                        ] }, profile)
                      ) }) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-border/40 bg-background/25", children: [
                      /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Full Execution Replay" }),
                      /* @__PURE__ */ jsx("table", { className: "w-full text-xs", children: /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(phaseB3BestFullReplay?.profiles ?? {}).map(
                        ([profile, metrics]) => /* @__PURE__ */ jsxs("tr", { children: [
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-sans font-semibold text-foreground", children: profile }),
                          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-right", children: [
                            "Trades ",
                            metrics.total_trades
                          ] }),
                          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-right", children: [
                            "PF ",
                            formatNullableNumber(metrics.profit_factor)
                          ] }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(metrics.net_pnl) })
                        ] }, profile)
                      ) }) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("details", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                    /* @__PURE__ */ jsx("summary", { className: "cursor-pointer text-xs font-semibold text-foreground", children: "Trade Ledger Audit" }),
                    /* @__PURE__ */ jsx("div", { className: "mt-3 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1200px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 text-[10px] uppercase text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Trade" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Profile" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Side" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Raw" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Cost" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Net" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "R" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "MFE" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "MAE" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-2", children: "Exit" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: (phaseB3BestFixed?.ledger ?? []).slice(0, 36).map((row, index) => /* @__PURE__ */ jsxs("tr", { children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trade_id ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.profile ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.side ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(Number(row.raw_pnl ?? 0)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(Number(row.total_cost ?? 0)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatCurrency(Number(row.net_pnl ?? 0)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatNullableNumber(Number(row.pnl_r ?? 0), 3) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatNullableNumber(Number(row.MFE ?? 0)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: formatNullableNumber(Number(row.MAE ?? 0)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.exit_reason ?? "--") })
                      ] }, `${String(row.trade_id)}-${String(row.profile)}-${index}`)) })
                    ] }) })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1350px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Orthogonal Set" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Features" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Replay PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Fixed PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net PnL" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Costs" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "DD" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Worst PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Mono" })
                    ] }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB3OrthogonalRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                        /* @__PURE__ */ jsxs("div", { className: "font-sans font-semibold text-foreground", children: [
                          row.feature_set,
                          " —",
                          " ",
                          row.orthogonal_label ?? row.feature_set_label
                        ] }),
                        /* @__PURE__ */ jsx("div", { className: "max-w-[260px] truncate text-[10px] text-muted-foreground", children: row.rejection_reason ?? row.status })
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.feature_count ?? "--" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.signals ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        row.fixed_trade_shadow_cost?.profiles?.realistic_cost?.profit_factor
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.net_pnl ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.total_costs ?? 0) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        formatNullableNumber(row.max_drawdown),
                        "%"
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.worst_fold_pf) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        row.buy_signals ?? 0,
                        "/",
                        row.sell_signals ?? 0
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.fixed_shadow_monotonicity?.status?.toUpperCase() ?? "N/A" })
                    ] }, row.experiment_id)) })
                  ] }) }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
                    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1250px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Neighbor" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Session" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Ratio" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Spread" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Cooldown" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Fold %" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Phase C" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB3RobustnessRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-sans font-semibold text-foreground", children: row.quality_config?.name ?? row.experiment_id }),
                          /* @__PURE__ */ jsx("div", { className: "max-w-[260px] truncate text-[10px] text-muted-foreground", children: row.rejection_reason ?? row.status })
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.quality_config?.session_filter ?? row.session_filter }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.quality_config?.min_move_cost_ratio) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.quality_config?.max_spread_pips) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.quality_config?.cooldown_bars ?? 0 }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.signals ?? 0 }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.net_pnl ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(
                          Number(
                            row.rolling_wf_expansion?.best_fold_contribution_pct ?? NaN
                          )
                        ) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.eligible_for_phase_c ? "Ready" : "No" })
                      ] }, row.experiment_id)) })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Robustness Summary" }),
                      /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
                        [
                          "Classification",
                          phaseB3Result.neighborhood_robustness?.summary?.classification
                        ],
                        [
                          "Profitable neighbors",
                          formatNullablePercent(
                            phaseB3Result.neighborhood_robustness?.summary?.profitable_neighbor_percentage
                          )
                        ],
                        [
                          "Median PF",
                          formatNullableNumber(
                            phaseB3Result.neighborhood_robustness?.summary?.median_pf
                          )
                        ],
                        [
                          "PF std",
                          formatNullableNumber(
                            phaseB3Result.neighborhood_robustness?.summary?.pf_standard_deviation
                          )
                        ],
                        [
                          "Worst PF",
                          formatNullableNumber(
                            phaseB3Result.neighborhood_robustness?.summary?.worst_neighbor_pf
                          )
                        ],
                        [
                          "Best fold contribution",
                          formatNullablePercent(
                            phaseB3Result.neighborhood_robustness?.summary?.best_fold_contribution_pct
                          )
                        ]
                      ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: String(value ?? "N/A") })
                      ] }, String(label))) }),
                      phaseB3Result.m1_history_warning && /* @__PURE__ */ jsx("div", { className: "mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 p-2 text-xs text-amber-200", children: phaseB3Result.m1_history_warning })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                    /* @__PURE__ */ jsx("div", { className: "grid gap-2 md:grid-cols-2", children: Object.entries(phaseB3Result.phase_c_readiness_decision?.checks ?? {}).map(
                      ([key, passed]) => /* @__PURE__ */ jsxs(
                        "div",
                        {
                          className: "flex items-center justify-between gap-3 text-xs",
                          children: [
                            /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", children: key }),
                            /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-400" : "text-red-400", children: passed ? "PASS" : "FAIL" })
                          ]
                        },
                        key
                      )
                    ) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-3 text-xs text-muted-foreground", children: phaseB3Result.phase_c_readiness_decision?.reason })
                  ] })
                ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.3 audit batch yet. Run this before Phase C." })
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            SectionCard,
            {
              numeral: "12",
              title: "Phase B.4 — Evidence Expansion & Locked Confirmation",
              icon: Lock,
              children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Expands evidence to 20,000 M5 candles, freezes discovery-selected configs, and replays only qualifying configs on the untouched confirmation region before Phase C." }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_1fr_auto]", children: [
                  /* @__PURE__ */ jsxs("label", { className: "space-y-1 text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "M5 Candles" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 2e4,
                        max: 5e4,
                        step: 1e3,
                        value: phaseB4AnchorCount,
                        onChange: (event) => setPhaseB4AnchorCount(
                          Math.min(5e4, Math.max(2e4, Number(event.target.value) || 2e4))
                        ),
                        className: "w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "space-y-1 text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Matrix Runs" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 1,
                        max: 24,
                        step: 1,
                        value: phaseB4MatrixRuns,
                        onChange: (event) => setPhaseB4MatrixRuns(
                          Math.min(24, Math.max(1, Number(event.target.value) || 24))
                        ),
                        className: "w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      disabled: phaseB4Pending || Boolean(phaseB4JobId),
                      onClick: () => void startPhaseB4Experiments(),
                      className: "self-end bg-gradient-gold text-background hover:opacity-90",
                      children: [
                        phaseB4Pending || phaseB4JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Lock, { className: "mr-2 h-4 w-4" }),
                        "Start Phase B.4"
                      ]
                    }
                  )
                ] }),
                (phaseB4JobId || phaseB4State) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                      "Phase B.4 job ",
                      phaseB4JobId ?? "latest"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground", children: [
                      (phaseB4State || "idle").toUpperCase(),
                      " ",
                      phaseB4Progress.toFixed(0),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: phaseB4Progress, className: "h-2 bg-background/40" })
                ] }),
                phaseB4Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive", children: [
                  "Phase B.4 Failed: ",
                  phaseB4Error
                ] }),
                phaseB4Result?.discovery_matrix?.leaderboard?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-5", children: [
                    ["Batch", phaseB4Result.batch_id],
                    [
                      "Data",
                      phaseB4Result.dataset_expansion_audit?.received_complete ? "Complete" : "Incomplete"
                    ],
                    [
                      "Matrix",
                      `${phaseB4Result.curated_matrix_manifest?.matrix_used?.length ?? 0} runs`
                    ],
                    ["Total OOS", phaseB4Result.total_oos_signals ?? 0],
                    [
                      "Phase C",
                      phaseB4Result.phase_c_readiness_decision?.status === "ready" ? "Ready" : "Not ready"
                    ]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-xl border border-border/30 bg-background/20 p-3",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                      ]
                    },
                    String(label)
                  )) }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
                    /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-border/40 bg-background/25", children: [
                      /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Dataset Expansion Audit" }),
                      /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
                        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/20 text-[10px] uppercase text-muted-foreground", children: [
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-left", children: "TF" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Requested" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-2 text-right", children: "Received" })
                        ] }) }),
                        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(
                          phaseB4Result.dataset_expansion_audit?.fetch_audit ?? {}
                        ).filter(([key]) => ["M1", "M5", "M15", "H1"].includes(key)).map(([tf, audit]) => /* @__PURE__ */ jsxs("tr", { children: [
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-sans font-semibold text-foreground", children: tf }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: audit.requested ?? "--" }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-right", children: audit.received ?? "--" })
                        ] }, tf)) })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Locked Manifest" }),
                      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Matrix hash" }),
                          /* @__PURE__ */ jsx("span", { className: "max-w-[190px] truncate font-mono-num text-foreground", children: phaseB4Result.curated_matrix_manifest?.matrix_hash ?? "--" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "M1 required" }),
                          /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: phaseB4Result.dataset_expansion_audit?.required_m1_for_requested_m5 ?? "--" })
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Range" }),
                          /* @__PURE__ */ jsxs("span", { className: "max-w-[190px] truncate font-mono-num text-foreground", children: [
                            phaseB4Result.dataset_expansion_audit?.time_range?.start ?? "--",
                            " →",
                            " ",
                            phaseB4Result.dataset_expansion_audit?.time_range?.end ?? "--"
                          ] })
                        ] })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1450px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Discovery Config" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Rows" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Worst PF" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Fold %" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Freeze" })
                    ] }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB4DiscoveryRows.map((row) => {
                      const rolling = row.rolling_wf_expansion;
                      const rows = row.rows;
                      return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                          /* @__PURE__ */ jsx("div", { className: "font-sans font-semibold text-foreground", children: row.quality_config?.name ?? row.experiment_id }),
                          /* @__PURE__ */ jsxs("div", { className: "max-w-[300px] truncate text-[10px] text-muted-foreground", children: [
                            row.feature_set,
                            " · ",
                            row.feature_set_label,
                            " ·",
                            " ",
                            row.rejection_reason ?? row.status
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          String(rows?.discovery ?? "--"),
                          "/",
                          String(rows?.confirmation ?? "--")
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.signals ?? 0 }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.net_pnl ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.worst_fold_pf) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(
                          Number(rolling?.best_fold_contribution_pct ?? NaN)
                        ) }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          row.buy_signals ?? 0,
                          "/",
                          row.sell_signals ?? 0
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.freeze_candidate ? "Frozen" : "Rejected" })
                      ] }, row.experiment_id);
                    }) })
                  ] }) }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
                    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1100px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Frozen Config" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Confirm Signals" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "DD" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Class" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Phase C" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB4FrozenRows.length ? phaseB4FrozenRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                          /* @__PURE__ */ jsx("div", { className: "max-w-[220px] truncate font-sans font-semibold text-foreground", children: row.experiment_id }),
                          /* @__PURE__ */ jsx("div", { className: "max-w-[220px] truncate text-[10px] text-muted-foreground", children: row.frozen_config_hash ?? "--" })
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.confirmation?.signals ?? 0 }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.confirmation?.profit_factor) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.confirmation?.expectancy) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.confirmation?.net_pnl ?? 0) }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          formatNullableNumber(row.confirmation?.max_drawdown),
                          "%"
                        ] }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          row.confirmation?.buy_signals ?? 0,
                          "/",
                          row.confirmation?.sell_signals ?? 0
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.robustness_classification ?? "--" }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.phase_c_ready ? "Ready" : "No" })
                      ] }, row.experiment_id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                        "td",
                        {
                          colSpan: 9,
                          className: "px-4 py-6 text-center text-muted-foreground",
                          children: "No discovery config passed the freeze gate, so locked confirmation was not replayed."
                        }
                      ) }) })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Gate" }),
                      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
                        Object.entries(
                          phaseB4Result.phase_c_readiness_decision?.checks ?? {}
                        ).map(([key, passed]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                          /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", children: key }),
                          /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-400" : "text-red-400", children: passed ? "PASS" : "FAIL" })
                        ] }, key)),
                        /* @__PURE__ */ jsx("div", { className: "border-t border-border/20 pt-2 text-muted-foreground", children: phaseB4Result.phase_c_readiness_decision?.reason })
                      ] })
                    ] })
                  ] }),
                  phaseB4RejectedRows.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs text-muted-foreground", children: [
                    "Top discovery rows were rejected before confirmation:",
                    " ",
                    phaseB4RejectedRows.map((row) => row.quality_config?.name ?? row.experiment_id).join(", ")
                  ] })
                ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.4 evidence expansion batch yet. Run this only after B.3 confirms Phase C is not ready." })
              ] })
            }
          ),
          /* @__PURE__ */ jsx(
            SectionCard,
            {
              numeral: "13",
              title: "Phase B.5 - Regime Drift & Directional Bias Repair",
              icon: ShieldAlert,
              children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audits one-sided behavior, fold concentration, regime drift, and curated label/horizon repairs before any Phase C research is allowed. This is research-only and cannot promote a model." }),
                /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100", children: phaseB5Result?.historical_depth_warning ?? "Current strict evidence depth is M5=20,000 and M1=100,000. To expand beyond 20,000 M5 candles, download additional M1 history in MT5 first." }),
                /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_1fr_auto]", children: [
                  /* @__PURE__ */ jsxs("label", { className: "space-y-1 text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "M5 Candles" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 2e4,
                        max: 5e4,
                        step: 1e3,
                        value: phaseB5AnchorCount,
                        onChange: (event) => setPhaseB5AnchorCount(
                          Math.min(5e4, Math.max(2e4, Number(event.target.value) || 2e4))
                        ),
                        className: "w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "space-y-1 text-xs", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Curated Runs" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "number",
                        min: 1,
                        max: 30,
                        step: 1,
                        value: phaseB5MatrixRuns,
                        onChange: (event) => setPhaseB5MatrixRuns(
                          Math.min(30, Math.max(1, Number(event.target.value) || 18))
                        ),
                        className: "w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      disabled: phaseB5Pending || Boolean(phaseB5JobId),
                      onClick: () => void startPhaseB5Experiments(),
                      className: "self-end bg-gradient-gold text-background hover:opacity-90",
                      children: [
                        phaseB5Pending || phaseB5JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldAlert, { className: "mr-2 h-4 w-4" }),
                        "Start Phase B.5"
                      ]
                    }
                  )
                ] }),
                (phaseB5JobId || phaseB5State) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                      "Phase B.5 job ",
                      phaseB5JobId ?? "latest"
                    ] }),
                    /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground", children: [
                      (phaseB5State || "idle").toUpperCase(),
                      " ",
                      phaseB5Progress.toFixed(0),
                      "%"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx(Progress, { value: phaseB5Progress, className: "h-2 bg-background/40" })
                ] }),
                phaseB5Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive", children: [
                  "Phase B.5 Failed: ",
                  phaseB5Error
                ] }),
                phaseB5Result?.discovery_matrix?.leaderboard?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-5", children: [
                    ["Batch", phaseB5Result.batch_id],
                    [
                      "Matrix",
                      `${phaseB5Result.curated_matrix_manifest?.matrix_used?.length ?? 0} runs`
                    ],
                    [
                      "Best Track",
                      `${phaseB5Best?.track ?? "--"} / ${phaseB5Best?.directional_bias_audit?.classification ?? "--"}`
                    ],
                    ["Frozen", phaseB5FrozenRows.length],
                    [
                      "Phase C",
                      phaseB5Result.phase_c_readiness_decision?.status === "ready" ? "Ready" : "Not ready"
                    ]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-xl border border-border/30 bg-background/20 p-3",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                      ]
                    },
                    String(label)
                  )) }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
                    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1500px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Rank" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Repair Config" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Track" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Bias" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Worst PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Fold %" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Freeze" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB5DiscoveryRows.map((row) => {
                        const rolling = row.rolling_wf_expansion;
                        return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: row.rank ?? "--" }),
                          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                            /* @__PURE__ */ jsx("div", { className: "max-w-[300px] truncate font-sans font-semibold text-foreground", children: row.quality_config?.name ?? row.experiment_id }),
                            /* @__PURE__ */ jsxs("div", { className: "max-w-[320px] truncate text-[10px] text-muted-foreground", children: [
                              row.feature_set,
                              " - ",
                              row.feature_set_label,
                              " -",
                              " ",
                              row.regime_filter ?? "all",
                              " -",
                              " ",
                              row.rejection_reason ?? row.status
                            ] })
                          ] }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.track ?? "--" }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.directional_bias_audit?.classification ?? "--" }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.signals ?? 0 }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.profit_factor) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.expectancy) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.net_pnl ?? 0) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.worst_fold_pf) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(
                            Number(rolling?.best_fold_contribution_pct ?? NaN)
                          ) }),
                          /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                            row.buy_signals ?? 0,
                            "/",
                            row.sell_signals ?? 0
                          ] }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.freeze_candidate ? "Frozen" : "Rejected" })
                        ] }, row.experiment_id);
                      }) })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Directional Bias" }),
                      /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
                        ["Classification", phaseB5Best?.directional_bias_audit?.classification],
                        ["Buy signals", phaseB5Best?.directional_bias_audit?.buy_signals],
                        ["Sell signals", phaseB5Best?.directional_bias_audit?.sell_signals],
                        [
                          "Buy PF",
                          formatNullableNumber(phaseB5Best?.directional_bias_audit?.buy_pf)
                        ],
                        [
                          "Sell PF",
                          formatNullableNumber(phaseB5Best?.directional_bias_audit?.sell_pf)
                        ],
                        [
                          "Buy fold",
                          formatNullablePercent(
                            phaseB5Best?.directional_bias_audit?.buy_fold_stability
                          )
                        ],
                        [
                          "Sell fold",
                          formatNullablePercent(
                            phaseB5Best?.directional_bias_audit?.sell_fold_stability
                          )
                        ]
                      ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: String(value ?? "--") })
                      ] }, String(label))) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                    /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Side-Specific Track Leaderboard" }),
                    /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1000px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Track" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "DD" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Worst PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Prof Fold" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Best Fold" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Bias" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB5TrackRows.map((row, index) => /* @__PURE__ */ jsxs(
                        "tr",
                        {
                          className: "hover:bg-background/20",
                          children: [
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-sans font-semibold text-foreground", children: String(row.track ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.signals ?? 0) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.max_drawdown ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.worst_fold_pf ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(row.profitable_fold_ratio ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(
                              Number(row.best_fold_contribution_pct ?? NaN)
                            ) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.directional_bias ?? "--") })
                          ]
                        },
                        `${String(row.track)}-${index}`
                      )) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                    /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                      /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Fold Attribution Dashboard" }),
                      /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[940px] text-left text-xs", children: [
                        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Fold" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "ATR" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "ADX" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "TP/SL/TO" })
                        ] }) }),
                        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB5FoldRows.map((fold) => {
                          const exitCounts = fold.exit_counts;
                          return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: String(fold.fold ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(fold.signals ?? 0) }),
                            /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                              String(fold.buy_signals ?? 0),
                              "/",
                              String(fold.sell_signals ?? 0)
                            ] }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(fold.profit_factor ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(fold.expectancy ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(fold.net_pnl ?? 0)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(fold.average_atr ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(fold.average_adx ?? NaN)) }),
                            /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                              exitCounts?.tp ?? 0,
                              "/",
                              exitCounts?.sl ?? 0,
                              "/",
                              exitCounts?.timeout ?? 0
                            ] })
                          ] }, String(fold.fold));
                        }) })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                      /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Drift Diagnostics" }),
                      /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[760px] text-left text-xs", children: [
                        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Feature" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Level" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PSI" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "KS" }),
                          /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Median Shift" })
                        ] }) }),
                        /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB5DriftRows.slice(0, 12).map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-sans font-semibold text-foreground", children: String(row.feature ?? "--") }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.drift_level ?? row.status ?? "--") }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.psi ?? NaN)) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.ks ?? NaN)) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.median_shift_std ?? NaN)) })
                        ] }, String(row.feature))) })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                    /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Regime Attribution" }),
                    /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1040px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Dimension" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Bucket" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "DD" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Folds" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Prof Fold" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB5RegimeRows.map((row) => /* @__PURE__ */ jsxs(
                        "tr",
                        {
                          className: "hover:bg-background/20",
                          children: [
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-sans font-semibold text-foreground", children: String(row.dimension ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.bucket ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.signals ?? 0) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.max_drawdown ?? NaN)) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.fold_count ?? 0) }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(row.profitable_fold_ratio ?? NaN)) })
                          ]
                        },
                        `${String(row.dimension)}-${String(row.bucket)}`
                      )) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
                    /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[950px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Frozen Config" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Signals" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "PF" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Expect" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Net" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "B/S" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Bias" }),
                        /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Phase C" })
                      ] }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB5FrozenRows.length ? phaseB5FrozenRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2", children: [
                          /* @__PURE__ */ jsx("div", { className: "max-w-[220px] truncate font-sans font-semibold text-foreground", children: row.experiment_id }),
                          /* @__PURE__ */ jsx("div", { className: "max-w-[220px] truncate text-[10px] text-muted-foreground", children: row.frozen_config_hash ?? "--" })
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.confirmation?.signals ?? 0 }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(row.confirmation?.profit_factor) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(row.confirmation?.expectancy) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(row.confirmation?.net_pnl ?? 0) }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          row.confirmation?.buy_signals ?? 0,
                          "/",
                          row.confirmation?.sell_signals ?? 0
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.directional_bias_classification ?? "--" }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.phase_c_ready ? "Ready" : "No" })
                      ] }, row.experiment_id)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx(
                        "td",
                        {
                          colSpan: 8,
                          className: "px-4 py-6 text-center text-muted-foreground",
                          children: "No B.5 config passed the discovery freeze gate, so locked confirmation was not replayed."
                        }
                      ) }) })
                    ] }) }),
                    /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                      /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Gate" }),
                      /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
                        Object.entries(
                          phaseB5Result.phase_c_readiness_decision?.checks ?? {}
                        ).map(([key, passed]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                          /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", children: key }),
                          /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-400" : "text-red-400", children: passed ? "PASS" : "FAIL" })
                        ] }, key)),
                        /* @__PURE__ */ jsx("div", { className: "border-t border-border/20 pt-2 text-muted-foreground", children: phaseB5Result.phase_c_readiness_decision?.reason })
                      ] })
                    ] })
                  ] }),
                  phaseB5RejectedRows.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs text-muted-foreground", children: [
                    "Top B.5 discovery rows rejected before confirmation:",
                    " ",
                    phaseB5RejectedRows.map((row) => row.quality_config?.name ?? row.experiment_id).join(", ")
                  ] })
                ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.5 repair batch yet. Run this after B.4 shows directional or fold-concentrated evidence." })
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "14",
          title: "Phase B.5.1 - Count Integrity & Directional Track Audit",
          icon: ShieldCheck,
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Re-runs the exact B5_11 buy-only config and separates accepted signals from opened and closed trades. PF, expectancy, DD, costs, and freeze gates below use closed executed trades only." }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_auto]", children: [
              /* @__PURE__ */ jsxs("label", { className: "space-y-1 text-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "M5 Candles" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: 2e4,
                    max: 5e4,
                    step: 1e3,
                    value: phaseB51AnchorCount,
                    onChange: (event) => setPhaseB51AnchorCount(
                      Math.min(5e4, Math.max(2e4, Number(event.target.value) || 2e4))
                    ),
                    className: "w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  disabled: phaseB51Pending || Boolean(phaseB51JobId),
                  onClick: () => void startPhaseB51Audit(),
                  className: "self-end bg-[oklch(0.72_0.055_300)] text-background hover:opacity-90",
                  children: [
                    phaseB51Pending || phaseB51JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                    "Start B.5.1 Audit"
                  ]
                }
              )
            ] }),
            (phaseB51JobId || phaseB51State) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/25 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  "Phase B.5.1 job ",
                  phaseB51JobId ?? "latest"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground", children: [
                  (phaseB51State || "idle").toUpperCase(),
                  " ",
                  phaseB51Progress.toFixed(0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB51Progress, className: "h-2 bg-background/40" })
            ] }),
            phaseB51Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive", children: [
              "Phase B.5.1 Failed: ",
              phaseB51Error
            ] }),
            phaseB51Result?.batch_id ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-5", children: [
                ["Batch", phaseB51Result.batch_id],
                ["Reconciliation", phaseB51Result.count_reconciliation?.status ?? "--"],
                ["Closed Trades", phaseB51Funnel.closed_trades ?? 0],
                ["Track Class", String(phaseB51Result.track_semantics?.classification ?? "--")],
                [
                  "Freeze Gate",
                  phaseB51Result.freeze_gate?.eligible_for_locked_confirmation ? "Eligible" : "Not eligible"
                ]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/30 bg-background/20 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Best Config Audit" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
                    ["Config", String(phaseB51Result.audited_config?.name ?? "--")],
                    [
                      "Displayed signals meaning",
                      String(
                        phaseB51Result.best_config_audit?.previous_signals_meaning ?? "--"
                      )
                    ],
                    [
                      "PF source",
                      String(phaseB51Result.best_config_audit?.profit_factor_source ?? "--")
                    ],
                    [
                      "Gross profit",
                      formatCurrency(
                        Number(phaseB51Result.best_config_audit?.gross_profit ?? 0)
                      )
                    ],
                    [
                      "Gross loss",
                      formatCurrency(Number(phaseB51Result.best_config_audit?.gross_loss ?? 0))
                    ],
                    [
                      "PF",
                      formatNullableNumber(
                        Number(phaseB51Result.best_config_audit?.profit_factor ?? NaN),
                        4
                      )
                    ],
                    [
                      "Expect",
                      formatNullableSigned(
                        Number(phaseB51Result.best_config_audit?.expectancy ?? NaN)
                      )
                    ]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[140px_1fr] gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: String(value) })
                  ] }, String(label))) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Track Semantics" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
                    ["Track", phaseB51Result.track_semantics?.track],
                    ["Classification", phaseB51Result.track_semantics?.classification],
                    ["Buy closed", phaseB51Result.track_semantics?.buy_closed_trades],
                    ["Sell closed", phaseB51Result.track_semantics?.sell_closed_trades],
                    [
                      "Best fold",
                      formatNullablePercent(
                        Number(
                          phaseB51Result.track_semantics?.best_fold_contribution_pct ?? NaN
                        )
                      )
                    ],
                    [
                      "Opposite-side diversity",
                      phaseB51Result.track_semantics?.opposite_side_zero_allowed ? "Not applicable" : "Required"
                    ]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: String(value ?? "--") })
                  ] }, String(label))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Count Funnel" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1100px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Raw",
                    "Threshold",
                    "Track",
                    "Regime",
                    "Session",
                    "Spread",
                    "Accepted",
                    "Attempts",
                    "Opened",
                    "Closed",
                    "Wins",
                    "Losses",
                    "BE",
                    "TP/SL/TO",
                    "Cooldown",
                    "Position"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: /* @__PURE__ */ jsx("tr", { className: "hover:bg-background/20", children: [
                    phaseB51Funnel.raw_candidates,
                    phaseB51Funnel.threshold_passed_signals,
                    phaseB51Funnel.track_filter_passed_signals,
                    phaseB51Funnel.regime_filter_passed_signals,
                    phaseB51Funnel.session_filter_passed_signals,
                    phaseB51Funnel.spread_filter_passed_signals,
                    phaseB51Funnel.accepted_signals,
                    phaseB51Funnel.execution_attempts,
                    phaseB51Funnel.opened_trades,
                    phaseB51Funnel.closed_trades,
                    phaseB51Funnel.wins,
                    phaseB51Funnel.losses,
                    phaseB51Funnel.breakeven_trades,
                    `${phaseB51Funnel.tp_exits ?? 0}/${phaseB51Funnel.sl_exits ?? 0}/${phaseB51Funnel.timeout_exits ?? 0}`,
                    phaseB51Funnel.skipped_due_to_cooldown,
                    phaseB51Funnel.skipped_due_to_existing_position
                  ].map((value, index) => /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center", children: String(value ?? 0) }, index)) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Fold Count Table" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1040px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Fold",
                      "Status",
                      "Accepted",
                      "Opened",
                      "Closed",
                      "W/L/BE",
                      "TP/SL/TO",
                      "PF",
                      "Net",
                      "Cooldown",
                      "Position"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB51FoldRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.fold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.status ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.accepted_signals ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.opened_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_trades ?? 0) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        String(row.wins ?? 0),
                        "/",
                        String(row.losses ?? 0),
                        "/",
                        String(row.breakeven_trades ?? 0)
                      ] }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        String(row.tp_exits ?? 0),
                        "/",
                        String(row.sl_exits ?? 0),
                        "/",
                        String(row.timeout_exits ?? 0)
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.skipped_due_to_cooldown ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.skipped_due_to_existing_position ?? 0) })
                    ] }, String(row.fold))) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Freeze Gate" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
                    Object.entries(phaseB51FreezeChecks).map(([key, passed]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { className: "truncate text-muted-foreground", children: key }),
                      /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-400" : "text-red-400", children: passed ? "PASS" : "FAIL" })
                    ] }, key)),
                    /* @__PURE__ */ jsxs("div", { className: "border-t border-border/20 pt-2 text-muted-foreground", children: [
                      "Failed:",
                      " ",
                      (phaseB51Result.freeze_gate?.failure_reasons ?? []).length ? phaseB51Result.freeze_gate?.failure_reasons?.join(", ") : "none"
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Regime Count Table" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1050px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Dimension",
                    "Bucket",
                    "Closed",
                    "W/L/BE",
                    "TP/SL/TO",
                    "Buy/Sell",
                    "PF",
                    "Expect",
                    "Net"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB51RegimeRows.map((row, index) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-sans font-semibold text-foreground", children: String(row.dimension ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.bucket ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_trades ?? 0) }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          String(row.wins ?? 0),
                          "/",
                          String(row.losses ?? 0),
                          "/",
                          String(row.breakeven_trades ?? 0)
                        ] }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          String(row.tp_exits ?? 0),
                          "/",
                          String(row.sl_exits ?? 0),
                          "/",
                          String(row.timeout_exits ?? 0)
                        ] }),
                        /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                          String(row.buy_closed_trades ?? 0),
                          "/",
                          String(row.sell_closed_trades ?? 0)
                        ] }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) })
                      ]
                    },
                    `${String(row.dimension)}-${String(row.bucket)}-${index}`
                  )) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Metric Source Explanation" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsx("div", { children: String(phaseB51Result.metric_source?.basis ?? "--") }),
                    /* @__PURE__ */ jsxs("div", { className: "font-mono-num text-foreground", children: [
                      "PF =",
                      " ",
                      formatCurrency(
                        Number(phaseB51Result.metric_source?.pf_numerator_gross_profit ?? 0)
                      ),
                      " ",
                      "/",
                      " ",
                      formatCurrency(
                        Number(phaseB51Result.metric_source?.pf_denominator_gross_loss ?? 0)
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "Count reconciliation: ",
                      phaseB51Result.count_reconciliation?.status ?? "--"
                    ] }),
                    (phaseB51Result.count_reconciliation?.mismatches ?? []).length > 0 && /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-red-400/25 bg-red-400/10 p-2 text-red-200", children: phaseB51Result.count_reconciliation?.mismatches?.map((item) => String(item.invariant ?? "mismatch")).join(", ") })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Drift-Aware Warning" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: phaseB51Result.drift_warning?.status === "SEVERE_DRIFT_WARNING" ? "text-red-300" : "text-muted-foreground",
                        children: phaseB51Result.drift_warning?.message ?? "--"
                      }
                    ),
                    phaseB51DriftRows.map((row, index) => /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "flex justify-between gap-3",
                        children: [
                          /* @__PURE__ */ jsxs("span", { className: "truncate text-muted-foreground", children: [
                            "Fold ",
                            String(row.fold ?? "--"),
                            " / ",
                            String(row.feature ?? "--")
                          ] }),
                          /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: String(row.drift_level ?? "--") })
                        ]
                      },
                      `${String(row.feature)}-${index}`
                    ))
                  ] })
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.5.1 count audit yet. Run this before any Phase C or broader model search." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "15",
          title: "Phase B.5.2 - Reproducibility & Execution-Density Audit",
          icon: Gauge,
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Freezes one 20,000 M5 research snapshot, replays the B5_11 config twice on that snapshot, and ranks a declared density matrix by closed executed trades instead of accepted signals. This section is research-only and keeps Phase C blocked." }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100", children: [
              /* @__PURE__ */ jsx("div", { className: "font-semibold", children: phaseB52Result?.legacy_research_warning?.label ?? "LEGACY - PRE COUNT-INTEGRITY AUDIT" }),
              /* @__PURE__ */ jsx("div", { children: phaseB52Result?.legacy_research_warning?.message ?? "Phase B through Phase B.5 artifacts are historical only and are not valid for promotion or Phase-C gating." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-[1fr_auto]", children: [
              /* @__PURE__ */ jsxs("label", { className: "space-y-1 text-xs", children: [
                /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "M5 Candles" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "number",
                    min: 2e4,
                    max: 5e4,
                    step: 1e3,
                    value: phaseB52AnchorCount,
                    onChange: (event) => setPhaseB52AnchorCount(
                      Math.min(5e4, Math.max(2e4, Number(event.target.value) || 2e4))
                    ),
                    className: "w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  disabled: phaseB52Pending || Boolean(phaseB52JobId),
                  onClick: () => void startPhaseB52Audit(),
                  className: "self-end bg-[oklch(0.72_0.055_300)] text-background hover:opacity-90",
                  children: [
                    phaseB52Pending || phaseB52JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Gauge, { className: "mr-2 h-4 w-4" }),
                    "Start B.5.2 Audit"
                  ]
                }
              )
            ] }),
            (phaseB52JobId || phaseB52State) && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/35 bg-background/25 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
                  "Phase B.5.2 job ",
                  phaseB52JobId ?? "latest"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-foreground", children: [
                  (phaseB52State || "idle").toUpperCase(),
                  " ",
                  phaseB52Progress.toFixed(0),
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB52Progress, className: "h-2 bg-background/40" })
            ] }),
            phaseB52Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive", children: [
              "Phase B.5.2 Failed: ",
              phaseB52Error
            ] }),
            phaseB52Result?.batch_id ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-5", children: [
                ["Batch", phaseB52Result.batch_id],
                ["Snapshot", phaseB52Result.snapshot_manifest?.snapshot_id],
                ["Replay", phaseB52Result.deterministic_replay?.status ?? "--"],
                ["Closed Executed Trades", phaseB52Funnel.closed_trades ?? 0],
                [
                  "Phase C",
                  phaseB52Result.phase_c_readiness_decision?.status === "ready" ? "Ready" : "Not ready"
                ]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/30 bg-background/20 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 truncate font-mono-num text-sm font-bold text-foreground", children: String(value ?? "N/A") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1fr_360px]", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Frozen Snapshot Manifest" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[980px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Timeframe" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: "Rows" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "First" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "Last" }),
                      /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: "SHA-256" })
                    ] }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: ["M1", "M5", "M15", "H1"].map((tf) => {
                      const item = phaseB52SnapshotFrames[tf] ?? {};
                      return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: tf }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: item.rows ?? 0 }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: item.first_time ?? "--" }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: item.last_time ?? "--" }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(item.sha256) })
                      ] }, tf);
                    }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Dataset Hash" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
                    ["Symbol", phaseB52Result.snapshot_manifest?.broker_symbol],
                    ["Dataset rows", phaseB52Result.snapshot_manifest?.combined_dataset_rows],
                    [
                      "Combined hash",
                      compactHash(phaseB52Result.snapshot_manifest?.combined_dataset_hash)
                    ],
                    ["Random seed", phaseB52Result.snapshot_manifest?.random_seed],
                    [
                      "Digits / point",
                      `${phaseB52Result.snapshot_manifest?.broker_digits ?? "--"} / ${phaseB52Result.snapshot_manifest?.point_size ?? "--"}`
                    ]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("span", { className: "truncate font-mono-num text-foreground", children: String(value ?? "--") })
                  ] }, String(label))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Deterministic Replay Comparison" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Status" }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: phaseB52Result.deterministic_replay?.status === "PASS" ? "text-emerald-400" : "text-red-400",
                          children: phaseB52Result.deterministic_replay?.status ?? "--"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Mismatched fields" }),
                      /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: phaseB52Result.deterministic_replay?.mismatches?.length ?? 0 })
                    ] }),
                    (phaseB52Result.deterministic_replay?.mismatches ?? []).slice(0, 6).map((row, index) => /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "rounded-lg border border-red-400/25 bg-red-400/10 p-2 text-red-200",
                        children: String(row.field ?? "mismatch")
                      },
                      index
                    ))
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Previous vs Corrected Difference" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 text-xs", children: [
                    [
                      "Classification",
                      phaseB52Result.previous_count_difference?.classification
                    ],
                    ["Details", phaseB52Result.previous_count_difference?.details],
                    [
                      "Old accepted / closed",
                      `${phaseB52Result.previous_count_difference?.old_b5?.accepted_signals ?? "--"} / ${phaseB52Result.previous_count_difference?.old_b5?.closed_trades ?? "--"}`
                    ],
                    [
                      "Corrected accepted / closed",
                      `${phaseB52Result.previous_count_difference?.corrected_b51_latest?.accepted_signals ?? "--"} / ${phaseB52Result.previous_count_difference?.corrected_b51_latest?.closed_trades ?? "--"}`
                    ],
                    [
                      "Current accepted / closed",
                      `${phaseB52Result.previous_count_difference?.current_b52_replay?.accepted_signals ?? "--"} / ${phaseB52Result.previous_count_difference?.current_b52_replay?.closed_trades ?? "--"}`
                    ]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[150px_1fr] gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("span", { className: "font-mono-num text-foreground", children: String(value ?? "--") })
                  ] }, String(label))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Execution-Density Funnel" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1180px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Raw Candidates",
                    "Accepted Signals",
                    "Opened Trades",
                    "Closed Executed Trades",
                    "Closed / 1K OOS M5 Bars",
                    "Closed / 1K Full-Snapshot M5 Bars",
                    "Accepted -> Opened",
                    "Opened -> Closed",
                    "Cooldown Skip",
                    "Existing Position Skip",
                    "Empty Folds",
                    "Fold Coverage"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: /* @__PURE__ */ jsx("tr", { className: "hover:bg-background/20", children: [
                    phaseB52Funnel.raw_candidates,
                    phaseB52Funnel.accepted_signals,
                    phaseB52Funnel.opened_trades,
                    phaseB52Funnel.closed_trades,
                    formatNullableNumber(
                      Number(
                        phaseB52Density.closed_trades_per_1000_oos_m5_bars ?? phaseB52Density.closed_trades_per_1000_m5 ?? NaN
                      ),
                      4
                    ),
                    formatNullableNumber(
                      Number(
                        phaseB52Density.closed_trades_per_1000_full_snapshot_m5_bars ?? phaseB52FullSnapshotClosedDensity
                      ),
                      4
                    ),
                    formatNullablePercent(
                      Number(phaseB52Density.accepted_to_opened_conversion_rate ?? NaN)
                    ),
                    formatNullablePercent(
                      Number(phaseB52Density.opened_to_closed_conversion_rate ?? NaN)
                    ),
                    formatNullablePercent(Number(phaseB52Density.cooldown_skip_rate ?? NaN)),
                    formatNullablePercent(
                      Number(phaseB52Density.existing_position_skip_rate ?? NaN)
                    ),
                    phaseB52Density.empty_fold_count,
                    formatNullablePercent(Number(phaseB52Density.fold_coverage_ratio ?? NaN))
                  ].map((value, index) => /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-center", children: String(value ?? 0) }, index)) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Fold Density" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1120px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Fold",
                    "Raw / 1k",
                    "Accepted / 1k",
                    "Opened / 1k",
                    "Closed / 1K OOS",
                    "Accepted",
                    "Opened",
                    "Closed",
                    "TP/SL/TO",
                    "Cooldown",
                    "Existing"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB52FoldRows.map((row) => {
                    const density = row.density ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.fold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(density.raw_candidates_per_1000_m5 ?? NaN),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(density.accepted_signals_per_1000_m5 ?? NaN),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(density.opened_trades_per_1000_m5 ?? NaN),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(
                          density.closed_trades_per_1000_oos_m5_bars ?? density.closed_trades_per_1000_m5 ?? NaN
                        ),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.accepted_signals ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.opened_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_trades ?? 0) }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-center", children: [
                        String(row.tp_exits ?? 0),
                        "/",
                        String(row.sl_exits ?? 0),
                        "/",
                        String(row.timeout_exits ?? 0)
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.skipped_due_to_cooldown ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.skipped_due_to_existing_position ?? 0) })
                    ] }, String(row.fold));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Curated Density Matrix Leaderboard" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1500px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Rank",
                    "Config",
                    "Track",
                    "CD",
                    "Spread",
                    "Accepted",
                    "Opened",
                    "Closed",
                    "Closed / 1K OOS",
                    "Closed / 1K Full",
                    "Coverage",
                    "Empty Folds",
                    "PF",
                    "Expect",
                    "Net",
                    "Reject Reasons"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB52MatrixRows.map((row) => {
                    const funnel = row.count_funnel ?? {};
                    const density = row.density_metrics ?? {};
                    const rejects = row.reject_reasons;
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.rank ?? "--") }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-left", children: [
                        /* @__PURE__ */ jsx("div", { className: "max-w-[300px] truncate font-sans font-semibold text-foreground", children: String(row.name ?? "--") }),
                        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                          String(row.feature_set ?? "--"),
                          " /",
                          " ",
                          String(row.session_filter ?? "--")
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.track ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.cooldown_bars ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.spread_ceiling_pips ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(funnel.accepted_signals ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(funnel.opened_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(funnel.closed_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(
                          density.closed_trades_per_1000_oos_m5_bars ?? density.closed_trades_per_1000_m5 ?? NaN
                        ),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(
                          density.closed_trades_per_1000_full_snapshot_m5_bars ?? (Number.isFinite(phaseB52FullSnapshotRows) && phaseB52FullSnapshotRows > 0 ? Number(funnel.closed_trades ?? 0) / phaseB52FullSnapshotRows * 1e3 : Number.NaN)
                        ),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(density.fold_coverage_ratio ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(density.empty_fold_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: rejects?.length ? rejects.join(", ") : "none" })
                    ] }, String(row.experiment_id));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Next-Step Recommendation" }),
                /* @__PURE__ */ jsx("div", { className: "text-foreground", children: phaseB52Result.next_step_recommendation ?? "--" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB52Result.phase_c_readiness_decision?.reason })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.5.2 reproducibility and execution-density audit yet. Run this before new label or horizon research." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "16",
          title: "Phase B.6 - Expanded-History Label, Horizon & Regime Repair",
          icon: Gauge,
          right: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: 6e4,
                max: 2e5,
                step: 5e3,
                value: phaseB6AnchorCount,
                onChange: (event) => setPhaseB6AnchorCount(Number(event.target.value)),
                className: "w-28 text-center text-xs"
              }
            ),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: 24,
                max: 36,
                step: 1,
                value: phaseB6MatrixRuns,
                onChange: (event) => setPhaseB6MatrixRuns(Number(event.target.value)),
                className: "w-20 text-center text-xs"
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                onClick: startPhaseB6Repair,
                disabled: phaseB6Pending || Boolean(phaseB6JobId),
                children: [
                  phaseB6Pending || phaseB6JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "mr-2 h-4 w-4" }),
                  "Start B.6"
                ]
              }
            )
          ] }),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Requires expanded MT5 history before any real matrix run. If M1/M5/M15/H1 bars are short, the backend aborts with no partial research and no fallback to B.5.2." }),
            phaseB6JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.6 job ",
                  phaseB6JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB6State ?? "queued",
                  " / ",
                  phaseB6Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB6Progress, className: "h-1.5" })
            ] }),
            phaseB6Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.6 Failed: ",
              phaseB6Error
            ] }),
            phaseB6Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-5", children: [
                ["Status", phaseB6Result.status],
                ["Batch", phaseB6Result.batch_id],
                ["History Gate", phaseB6Result.history_status?.status],
                ["Frozen Configs", phaseB6Result.frozen_configs?.length ?? 0],
                ["Phase C", phaseB6Result.phase_c_readiness_decision?.status]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              phaseB6Result.status === "INSUFFICIENT_HISTORY_FOR_PHASE_B6" && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-xs text-yellow-100", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-1 font-semibold", children: "INSUFFICIENT_HISTORY_FOR_PHASE_B6" }),
                /* @__PURE__ */ jsx("div", { children: phaseB6Result.message ?? "Expanded MT5 history is incomplete. No partial research was executed." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Requested / Received History Counts" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[720px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Timeframe", "Requested", "Received", "Missing", "Status"].map(
                    (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)
                  ) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(phaseB6HistoryFrames).map(([timeframe, row]) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: timeframe }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.requested ?? 0 }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.received ?? 0 }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.missing ?? 0 }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.status ?? "--" })
                  ] }, timeframe)) })
                ] })
              ] }),
              phaseB6Result.snapshot_manifest?.snapshot_id && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1.15fr_0.85fr]", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Expanded Snapshot Manifest" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[820px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Timeframe", "Rows", "First", "Last", "SHA-256"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(phaseB6SnapshotFrames).map(([timeframe, row]) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-bold text-foreground", children: timeframe }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: row.rows ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: row.first_time ?? "--" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: row.last_time ?? "--" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(row.sha256) })
                    ] }, timeframe)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Dataset Hashes" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 font-mono-num", children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Snapshot" }),
                      /* @__PURE__ */ jsx("span", { className: "text-right", children: phaseB6Result.snapshot_manifest.snapshot_id })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Rows" }),
                      /* @__PURE__ */ jsx("span", { children: phaseB6Result.snapshot_manifest.combined_dataset_rows ?? "--" })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Combined hash" }),
                      /* @__PURE__ */ jsx("span", { children: compactHash(phaseB6Result.snapshot_manifest.combined_dataset_hash) })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Seed" }),
                      /* @__PURE__ */ jsx("span", { children: phaseB6Result.snapshot_manifest.random_seed ?? "--" })
                    ] })
                  ] })
                ] })
              ] }),
              Object.keys(phaseB6SplitRegions).length > 0 && /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Chronological Split Timeline" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[860px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Region", "Rows", "Fraction", "Start", "End"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(phaseB6SplitRegions).map(([name, region]) => {
                    const range = region.date_range ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: name }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: region.rows ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(region.row_fraction ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(range.start ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(range.end ?? "--") })
                    ] }, name);
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Declared Curated Matrix" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1280px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "#",
                    "Config",
                    "Feature",
                    "Track",
                    "Label",
                    "SL ATR",
                    "RR",
                    "Lookahead",
                    "Session",
                    "Regime"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB6MatrixRows.slice(0, 12).map((row, index) => {
                    const label = row.label_config ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: index + 1 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-left", children: /* @__PURE__ */ jsx("div", { className: "max-w-[320px] truncate font-sans font-semibold text-foreground", children: String(row.name ?? "--") }) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.feature_set_id ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.track ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(label.label_mode ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(label.sl_atr_multiplier ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(label.rr_multiplier ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(label.lookahead ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.session_filter ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.regime_filter ?? "--") })
                    ] }, String(row.name ?? index));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Execution-Density / Label-Horizon Leaderboard" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1500px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Rank",
                    "Config",
                    "Track",
                    "Label",
                    "Accepted",
                    "Opened",
                    "Closed Executed",
                    "Closed / 1K OOS M5 Bars",
                    "Closed / 1K Full-Snapshot M5 Bars",
                    "Coverage",
                    "PF",
                    "Expect",
                    "Net",
                    "Freeze"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB6LeaderboardRows.map((row) => {
                    const funnel = row.count_funnel ?? {};
                    const density = row.density_metrics ?? {};
                    const gate = row.phase_b6_freeze_gate ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.rank ?? "--") }),
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-left", children: [
                        /* @__PURE__ */ jsx("div", { className: "max-w-[320px] truncate font-sans font-semibold text-foreground", children: String(row.name ?? "--") }),
                        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                          String(row.feature_set ?? "--"),
                          " /",
                          " ",
                          String(row.session_filter ?? "--")
                        ] })
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.track ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.label_mode ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(funnel.accepted_signals ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(funnel.opened_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(funnel.closed_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(density.closed_trades_per_1000_oos_m5_bars ?? NaN),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(density.closed_trades_per_1000_full_snapshot_m5_bars ?? NaN),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(density.fold_coverage_ratio ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(gate.status ?? "--") })
                    ] }, String(row.experiment_id));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Frozen Configs" }),
                  phaseB6FrozenRows.length ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: phaseB6FrozenRows.map((row) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-lg border border-border/30 p-2",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground", children: String(row.name ?? row.experiment_id) }),
                        /* @__PURE__ */ jsxs("div", { className: "font-mono-num text-muted-foreground", children: [
                          "PF ",
                          formatNullableNumber(Number(row.profit_factor ?? NaN), 4),
                          " / closed",
                          " ",
                          String(
                            row.count_funnel?.closed_trades ?? 0
                          )
                        ] })
                      ]
                    },
                    String(row.experiment_id)
                  )) }) : /* @__PURE__ */ jsx(DataState, { message: "No discovery config has passed the Phase B.6 freeze gate." })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Locked Confirmation Replay" }),
                  phaseB6ConfirmationRows.length ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: phaseB6ConfirmationRows.map((row) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-lg border border-border/30 p-2",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "font-mono-num text-foreground", children: compactHash(String(row.frozen_config_hash ?? "")) }),
                        /* @__PURE__ */ jsxs("div", { className: "font-mono-num text-muted-foreground", children: [
                          "closed ",
                          String(row.closed_executed_trades ?? 0),
                          " / PF",
                          " ",
                          formatNullableNumber(Number(row.profit_factor ?? NaN), 4),
                          " / gate",
                          " ",
                          String(
                            row.confirmation_gate?.status ?? "--"
                          )
                        ] })
                      ]
                    },
                    String(row.frozen_config_hash)
                  )) }) : /* @__PURE__ */ jsx(DataState, { message: "Locked confirmation is not opened until a discovery config passes freeze gates." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Next-Step Recommendation" }),
                /* @__PURE__ */ jsx("div", { className: "text-foreground", children: phaseB6Result.next_step_recommendation ?? "--" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB6Result.phase_c_readiness_decision?.reason })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.6 result yet. Run only after expanded MT5 history is available." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "17",
          title: "Phase B.7 - Edge Decomposition & Strategy Repair",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB7Repair,
              disabled: phaseB7Pending || Boolean(phaseB7JobId),
              children: [
                phaseB7Pending || phaseB7JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "mr-2 h-4 w-4" }),
                "Start B.7"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Reuses the immutable Phase B.6 expanded-history snapshot. This report decomposes cost, direction, regimes, feature-set ablations, and deterministic setup-family repairs without opening locked confirmation unless a discovery config passes freeze gates." }),
            phaseB7JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.7 job ",
                  phaseB7JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB7State ?? "queued",
                  " / ",
                  phaseB7Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB7Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB7Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB7Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB7Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.7 Failed: ",
              phaseB7Error
            ] }),
            phaseB7Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-6", children: [
                ["Status", phaseB7Result.status],
                ["Batch", phaseB7Result.batch_id],
                ["B.6 Batch", phaseB7Result.source_b6_batch_id],
                ["Snapshot", phaseB7Result.snapshot_integrity?.status],
                [
                  "Frozen",
                  phaseB7Result.discovery_freeze_gate?.frozen_config_count ?? phaseB7Result.discovery_freeze_gate?.frozen_configs?.length ?? 0
                ],
                ["Phase C", phaseB7Result.phase_c_readiness_decision?.status]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1.1fr_0.9fr]", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Snapshot Integrity" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[820px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["TF", "Requested", "Rows", "Chronological", "Hash", "Duplicates"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(phaseB7SnapshotFrames).map(([timeframe, row]) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: timeframe }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.requested ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.rows ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.chronological ? "PASS" : "FAIL" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.hash_matches_manifest ? "PASS" : "FAIL" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.duplicate_timestamps ?? 0 })
                    ] }, timeframe)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Integrity Checks" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 font-mono-num", children: Object.entries(phaseB7SnapshotChecks).map(([key, passed]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: key }),
                    /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-200" : "text-red-200", children: passed ? "PASS" : "FAIL" })
                  ] }, key)) }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-3 border-t border-border/30 pt-3 font-mono-num text-muted-foreground", children: [
                    "locked confirmation",
                    " ",
                    phaseB7Result.snapshot_integrity?.locked_confirmation_state ?? "--"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Fixed Shadow Cost Decomposition" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1280px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Config",
                    "Track",
                    "Closed",
                    "Gross",
                    "Spread",
                    "Spread+Slip",
                    "Realistic",
                    "Cost / Trade",
                    "Invariant"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB7CostRows.map((row, index) => {
                    const profiles = row.profiles ?? {};
                    const gross = profiles.gross_no_cost ?? {};
                    const spread = profiles.spread_only ?? {};
                    const slip = profiles.spread_plus_slippage ?? {};
                    const realistic = profiles.realistic_total_cost ?? {};
                    const invariant = row.fixed_shadow_cost_monotonicity ?? {};
                    return /* @__PURE__ */ jsxs(
                      "tr",
                      {
                        className: "hover:bg-background/20",
                        children: [
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-left", children: /* @__PURE__ */ jsx("div", { className: "max-w-[320px] truncate font-sans font-semibold text-foreground", children: String(row.name ?? row.experiment_id ?? "--") }) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.track ?? "--") }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(realistic.closed_trades ?? 0) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(gross.net_pnl ?? 0)) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(spread.net_pnl ?? 0)) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(slip.net_pnl ?? 0)) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(realistic.net_pnl ?? 0)) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                            Number(realistic.cost_per_closed_trade ?? NaN),
                            4
                          ) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(invariant.status ?? "--").toUpperCase() })
                        ]
                      },
                      String(row.experiment_id ?? index)
                    );
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Directional Decomposition" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1180px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Track",
                    "Accepted",
                    "Opened",
                    "Closed",
                    "Wins",
                    "Losses",
                    "TP",
                    "SL",
                    "Timeout",
                    "PF",
                    "Expect",
                    "Accepted=Closed"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB7DirectionRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.track ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.accepted_signals ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.opened_trades ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_executed_trades ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.wins ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.losses ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.tp_exits ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.sl_exits ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.timeout_exits ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.accepted_signals_are_closed_trades ? "YES" : "NO" })
                  ] }, String(row.track))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Regime Attribution" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Dimension", "Bucket", "Closed", "Win Rate", "PF", "Expect", "Net"].map(
                    (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)
                  ) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB7RegimeRows.map((row, index) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.dimension ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.bucket ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_trades ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(row.win_rate ?? NaN)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) })
                      ]
                    },
                    `${String(row.dimension)}-${String(row.bucket)}-${index}`
                  )) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Orthogonal Ablation Matrix" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[860px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Feature Set", "Source", "Closed", "PF", "Expect", "Monotonic"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB7AblationRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.feature_set_id ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.source_b6_feature_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_executed_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.full_replay_pf ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.cost_monotonicity ?? "--").toUpperCase() })
                    ] }, String(row.feature_set_id))) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Meta-Label Setup Families" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[900px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "SL ATR", "RR", "Lookahead", "Buy", "Sell", "Freeze"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB7MetaRows.map((row) => {
                      const gate = row.freeze_gate ?? {};
                      return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.sl_atr_multiplier ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.rr_target ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.maximum_lookahead ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.buy_closed_trades ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.sell_closed_trades ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(gate.status ?? "--") })
                      ] }, String(row.setup_family));
                    }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.7 Discovery Freeze Gate" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1180px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Config",
                    "Track",
                    "Feature",
                    "Closed",
                    "PF",
                    "Expect",
                    "Gate",
                    "Failures"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB7FreezeRows.map((row) => {
                    const funnel = row.count_funnel ?? {};
                    const gate = row.gate ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-left", children: /* @__PURE__ */ jsx("div", { className: "max-w-[320px] truncate font-sans font-semibold text-foreground", children: String(row.name ?? row.experiment_id ?? "--") }) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.track ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.feature_set ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(funnel.closed_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(gate.status ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-left", children: /* @__PURE__ */ jsx("div", { className: "max-w-[360px] truncate", children: (gate.failure_reasons ?? []).join(
                        ", "
                      ) || "--" }) })
                    ] }, String(row.experiment_id));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Locked Confirmation State" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB7LockedConfirmation?.state ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB7LockedConfirmation?.reason ?? "Locked confirmation remains unopened until a discovery config passes freeze gate." })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Failure Classification" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB7Result.failure_classification?.primary ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: (phaseB7Result.failure_classification?.contributors ?? []).join(", ") || "--" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Next-Step Recommendation" }),
                /* @__PURE__ */ jsx("div", { className: "text-foreground", children: phaseB7Result.next_step_recommendation ?? "--" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB7Result.phase_c_readiness_decision?.reason })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.7 result yet. Review the Phase B.6 report before starting B.7." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "18",
          title: "Phase B.8 - Strategy Hypothesis Reset & Gross-Edge Research",
          icon: BrainCircuit,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB8Research,
              disabled: phaseB8Pending || Boolean(phaseB8JobId),
              children: [
                phaseB8Pending || phaseB8JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Zap, { className: "mr-2 h-4 w-4" }),
                "Start B.8"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only strategy reset using the immutable B.6 expanded-history snapshot. The gross-edge gate runs before any ML value-add check and rejects setup families with no no-cost edge, insufficient density, fold concentration, or severe drift." }),
            phaseB8JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8 job ",
                  phaseB8JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB8State ?? "queued",
                  " / ",
                  phaseB8Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB8Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB8Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB8Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB8Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8 Failed: ",
              phaseB8Error
            ] }),
            phaseB8Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-6", children: [
                ["Status", phaseB8Result.status],
                ["Batch", phaseB8Result.batch_id],
                ["B.7 Batch", phaseB8Result.source_b7_batch_id],
                ["Snapshot", phaseB8Result.snapshot_integrity?.status],
                [
                  "Frozen",
                  phaseB8Result.discovery_freeze_gate?.frozen_config_count ?? phaseB8Result.discovery_freeze_gate?.frozen_configs?.length ?? 0
                ],
                ["Phase C", phaseB8Result.phase_c_readiness_decision?.status]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-[1.1fr_0.9fr]", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Immutable Snapshot Integrity" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[820px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["TF", "Requested", "Rows", "First", "Last", "Hash"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: Object.entries(phaseB8SnapshotFrames).map(([timeframe, row]) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: timeframe }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.requested ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.rows ?? 0 }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.first_time ?? "--" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: row.last_time ?? "--" }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: compactHash(row.sha256) })
                    ] }, timeframe)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Integrity Checks" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 font-mono-num", children: Object.entries(phaseB8SnapshotChecks).map(([key, passed]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: key }),
                    /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-200" : "text-red-200", children: passed ? "PASS" : "FAIL" })
                  ] }, key)) }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-3 border-t border-border/30 pt-3 font-mono-num text-muted-foreground", children: [
                    "locked confirmation",
                    " ",
                    phaseB8Result.locked_confirmation?.state ?? phaseB8Result.snapshot_integrity?.locked_confirmation_state ?? "--"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Gross-Edge Leaderboard" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1420px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Track",
                    "Closed",
                    "No-Cost PF",
                    "No-Cost Expect",
                    "Real PF",
                    "Real Expect",
                    "Net",
                    "DD",
                    "Density",
                    "Fold Cov",
                    "Class",
                    "Gate"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8GrossRows.map((row) => {
                    const classification = row.classification ?? {};
                    const gate = classification.gross_edge_gate ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsxs("td", { className: "px-3 py-2 text-left", children: [
                        /* @__PURE__ */ jsx("div", { className: "max-w-[280px] truncate font-sans font-semibold text-foreground", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: String(row.source_experiment_id ?? "--") })
                      ] }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.directional_track ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_executed_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.no_cost_profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.no_cost_expectancy ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.realistic_profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.realistic_expectancy ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.realistic_net_pnl ?? 0)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.max_drawdown ?? NaN), 2) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(row.closed_trades_per_1000_oos_m5_bars ?? NaN),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(row.fold_coverage_ratio ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(classification.primary ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(gate.status ?? "--") })
                    ] }, String(row.setup_family));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Setup-Family Definitions" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1500px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Entry",
                    "Invalidation",
                    "SL ATR",
                    "RR",
                    "Lookahead",
                    "Track",
                    "Regime",
                    "Session",
                    "Spread",
                    "Move/Cost",
                    "Cooldown"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8SetupRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-left", children: /* @__PURE__ */ jsx("div", { className: "max-w-[320px] truncate", children: String(row.entry_condition ?? "--") }) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-left", children: /* @__PURE__ */ jsx("div", { className: "max-w-[320px] truncate", children: String(row.invalidation_condition ?? "--") }) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.sl_atr_multiplier ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.rr_target ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.lookahead_bars ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.directional_track ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.regime_filter ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.session_filter ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.spread_ceiling_pips ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.move_to_cost_gate ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.cooldown_bars ?? "--") })
                  ] }, String(row.setup_family))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Fixed-Trade Cost Decomposition" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1280px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "No Cost",
                    "Spread",
                    "Spread+Slip",
                    "Realistic",
                    "Cost/Trade",
                    "Invariant"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8CostRows.map((row) => {
                    const profiles = row.cost_profiles ?? {};
                    const invariant = row.fixed_shadow_cost_monotonicity ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.setup_family ?? "--") }),
                      [
                        "no_cost",
                        "spread_only",
                        "spread_plus_slippage",
                        "realistic_cost"
                      ].map((key) => /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(profiles[key]?.net_pnl ?? 0)) }, key)),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(profiles.realistic_cost?.cost_per_closed_trade ?? NaN),
                        4
                      ) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(invariant.status ?? "--").toUpperCase() })
                    ] }, String(row.setup_family));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Fold Attribution" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[920px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Fold", "Closed", "PF", "Expect", "Net", "DD", "Density"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8FoldRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.fold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_executed_trades ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatCurrency(Number(row.net_pnl ?? 0)) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.max_drawdown ?? NaN), 2) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(
                        Number(row.closed_trades_per_1000_oos_m5_bars ?? NaN),
                        4
                      ) })
                    ] }, `${String(row.setup_family)}-${String(row.fold)}-${index}`)) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Drift Diagnostics" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[920px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Dimension", "Bucket", "Status", "Closed", "PF", "Expect"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8DriftRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.dimension ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.bucket ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.status ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_executed_trades ?? row.closed_trades ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.profit_factor ?? NaN), 4) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.expectancy ?? NaN)) })
                    ] }, `${String(row.dimension)}-${index}`)) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "ML Value-Add Check" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1120px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Status",
                    "Assessment",
                    "Baseline PF",
                    "ML PF",
                    "Delta PF",
                    "Delta Expect",
                    "Density Reduction"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8MlRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center font-bold text-foreground", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.status ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.ml_assessment ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.baseline_profit_factor ?? NaN), 4) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.ml_assisted_profit_factor ?? NaN), 4) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.incremental_profit_factor ?? NaN)) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.incremental_expectancy ?? NaN)) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullablePercent(Number(row.execution_density_reduction ?? NaN)) })
                  ] }, String(row.setup_family))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Failure Classification" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB8Result.failure_classification?.primary ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1 font-mono-num text-muted-foreground", children: Object.entries(phaseB8Result.failure_classification?.counts ?? {}).map(
                    ([label, count]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                      /* @__PURE__ */ jsx("span", { children: label }),
                      /* @__PURE__ */ jsx("span", { children: count })
                    ] }, label)
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Gate" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB8Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB8Result.phase_c_readiness_decision?.reason ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 border-t border-border/30 pt-2 text-muted-foreground", children: phaseB8Result.locked_confirmation?.reason })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Next-Step Recommendation" }),
                /* @__PURE__ */ jsx("div", { className: "text-foreground", children: phaseB8Result.next_step_recommendation ?? "--" })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8 result yet. Start only after reviewing the B.7 report." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "19",
          title: "Phase B.8.1 - Strategy Mechanics & Execution Semantics Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB81Audit,
              disabled: phaseB81Pending || Boolean(phaseB81JobId),
              children: [
                phaseB81Pending || phaseB81JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.1"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only audit of evaluator integrity, trade accounting, direction mapping, payoff accounting, and event-ledger availability. This stage reuses immutable B.6/B.8 artifacts only and does not fetch MT5 history." }),
            phaseB81JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.1 job ",
                  phaseB81JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB81State ?? "queued",
                  " / ",
                  phaseB81Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB81Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB81Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB81Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB81Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.1 Failed: ",
              phaseB81Error
            ] }),
            phaseB81Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-6", children: [
                ["Status", phaseB81Result.status],
                ["Batch", phaseB81Result.batch_id],
                ["B.8 Batch", phaseB81Result.source_b8_batch_id],
                ["Snapshot", phaseB81Result.snapshot_integrity?.status],
                ["Replay", phaseB81Result.replay_source_preflight?.status],
                ["Conclusion", phaseB81Result.conclusion]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Replay Source Preflight" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB81Result.replay_source_preflight?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB81Result.replay_source_preflight?.reason ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2 border-t border-border/30 pt-3 font-mono-num text-[11px] text-muted-foreground sm:grid-cols-3", children: [
                    /* @__PURE__ */ jsxs("span", { children: [
                      "MT5 refetch",
                      " ",
                      String(phaseB81Result.replay_source_preflight?.mt5_refetch_performed)
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "history rebuild",
                      " ",
                      String(phaseB81Result.replay_source_preflight?.history_rebuild_performed)
                    ] }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      "raw paths",
                      " ",
                      phaseB81Result.replay_source_preflight?.existing_paths?.length ?? 0
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Count Reconciliation" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB81Result.snapshot_evaluator_integrity?.count_reconciliation?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1 font-mono-num text-muted-foreground", children: Object.entries(phaseB81CountChecks).map(([label, passed]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { children: label }),
                    /* @__PURE__ */ jsx("span", { className: passed ? "text-emerald-200" : "text-red-200", children: passed ? "PASS" : "FAIL" })
                  ] }, label)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Trade Accounting Integrity Checks" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[920px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Check", "Status", "Details"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB81MechanicsChecks.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(row.name ?? "--") }),
                    /* @__PURE__ */ jsx(
                      "td",
                      {
                        className: `px-3 py-2 ${row.status === "PASS" ? "text-emerald-200" : "text-red-200"}`,
                        children: String(row.status ?? "--")
                      }
                    ),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-muted-foreground", children: /* @__PURE__ */ jsx("div", { className: "max-w-[560px] truncate", children: JSON.stringify(row.details ?? {}) }) })
                  ] }, String(row.name))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Directionality Shadow Replay" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB81Result.directionality_shadow_replay?.status ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 text-muted-foreground", children: [
                    "modes",
                    " ",
                    (phaseB81Result.directionality_shadow_replay?.shadow_modes ?? []).join(
                      ", "
                    ) || "--"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB81Result.directionality_shadow_replay?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Event-Level Ledger Export" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB81Result.event_level_ledger_export?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB81Result.event_level_ledger_export?.reason ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-3 max-h-36 space-y-1 overflow-auto border-t border-border/30 pt-3 font-mono-num text-[11px] text-muted-foreground", children: phaseB81LedgerRows.map((row) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("span", { children: String(row.status ?? "--") })
                  ] }, String(row.setup_family))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Realized Payoff Audit" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1080px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Closed",
                    "No-Cost PF",
                    "No-Cost Expect",
                    "Real PF",
                    "Real Expect",
                    "Class"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-center", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB81PayoffRows.map((row) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-left font-semibold text-foreground", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.closed_executed_trades ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.no_cost_profit_factor ?? NaN), 4) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.no_cost_expectancy ?? NaN)) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableNumber(Number(row.realistic_profit_factor ?? NaN), 4) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: formatNullableSigned(Number(row.realistic_expectancy ?? NaN)) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-center", children: String(row.classification ?? "--") })
                  ] }, String(row.setup_family))) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Conclusion" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB81Result.conclusion ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB81Result.conclusion_detail?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Gate" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB81Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB81Result.phase_c_readiness_decision?.reason ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 border-t border-border/30 pt-2 text-muted-foreground", children: phaseB81Result.next_step_recommendation ?? "--" })
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.1 audit yet. Run only after reviewing the B.8 report." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "20",
          title: "Phase B.8.2 - Replayable Snapshot & Event-Ledger Persistence Repair",
          icon: Save,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB82Repair,
              disabled: phaseB82Pending || Boolean(phaseB82JobId),
              children: [
                phaseB82Pending || phaseB82JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "mr-2 h-4 w-4" }),
                "Start B.8.2"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only repair that attempts exact UTC reconstruction of the immutable B.6 ranges, writes staged sidecar Parquet files only after validation, and keeps Phase C blocked." }),
            phaseB82JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.2 job ",
                  phaseB82JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB82State ?? "queued",
                  " / ",
                  phaseB82Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB82Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB82Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB82Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB82Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.2 Failed: ",
              phaseB82Error
            ] }),
            phaseB82Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-4 xl:grid-cols-8", children: [
                ["Status", phaseB82Result.status],
                ["Batch", phaseB82Result.batch_id],
                ["Legacy Hash", phaseB82Result.raw_hash_compatibility_status],
                ["Raw", phaseB82Result.raw_reconstruction_status],
                ["Combined", phaseB82Result.combined_feature_hash_status],
                ["Ledger Gen", phaseB82Result.ledger_generation_status],
                ["Ledger Recon", phaseB82Result.ledger_reconciliation_status],
                ["B.8.1 Ready", phaseB82Result.b81_rerun_readiness?.status]
              ].map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              phaseB82HasHardenedBlock && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.2 hardened replay gate is blocking readiness." }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-amber-100/80", children: "Empty or placeholder ledgers are not accepted as B.8.1 proof. Review the requirements and per-family funnel below before starting another phase." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Lineage & Sidecar" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB82Result.lineage_id ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { className: "truncate", children: [
                      "manifest ",
                      phaseB82Result.sidecar_manifest_path ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "truncate", children: [
                      "candidate ",
                      phaseB82Result.candidate_ledger_path ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "truncate", children: [
                      "trade ",
                      phaseB82Result.trade_ledger_path ?? "--"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Readiness Semantics" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB82Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB82Result.b81_rerun_readiness?.reason ?? "--" }),
                  phaseB82ReadinessBlockers.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2 space-y-1 border-t border-border/30 pt-2 font-mono-num text-[11px] text-muted-foreground", children: phaseB82ReadinessBlockers.slice(0, 5).map((reason) => /* @__PURE__ */ jsx("div", { children: reason }, reason)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Exact Range Reconstruction" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1080px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "TF",
                    "Rows",
                    "First UTC",
                    "Last UTC",
                    "Duplicates",
                    "Compat",
                    "Legacy",
                    "UTC"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB82TimeframeRows.map(([timeframe, row]) => {
                    const hashRow = phaseB82RawHashRows[timeframe] ?? row;
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: timeframe }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.rows ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.first_time ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.last_time ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.duplicate_timestamps ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(hashRow.compatibility_class ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(String(hashRow.legacy_b6_hash ?? "")) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(String(hashRow.utc_canonical_hash ?? row.sha256 ?? "")) })
                    ] }, timeframe);
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Deterministic Replay" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB82Result.deterministic_replay?.status ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 text-muted-foreground", children: [
                    "mismatch ",
                    String(phaseB82Result.deterministic_replay?.mismatch_count ?? "--")
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1 text-muted-foreground", children: [
                    "meaningful ",
                    String(phaseB82Result.deterministic_replay_meaningful ?? false)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Ledger Reconciliation" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB82Result.ledger_reconciliation_status ?? phaseB82Result.ledger_reconciliation?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB82LedgerSummary })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mutation Proof" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB82Result.mutation_proof?.status ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 text-muted-foreground", children: [
                    "mutations ",
                    String(phaseB82Result.mutation_proof?.mutations?.length ?? 0)
                  ] })
                ] })
              ] }),
              phaseB82FunnelRows.length > 0 && /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Family Funnel Proof" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1160px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Raw",
                    "Accepted",
                    "Attempts",
                    "Opened",
                    "Closed",
                    "Wins",
                    "Losses",
                    "TP",
                    "SL",
                    "Timeout",
                    "Mismatch"
                  ].map((label, index) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, `${label}-${index}`)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB82FunnelRows.map((row) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidates ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.execution_attempts ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.wins ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.losses ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.TP ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.SL ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.timeout ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: Array.isArray(row.mismatch_reasons) ? row.mismatch_reasons.join("; ") || "--" : "--" })
                      ]
                    },
                    String(row.setup_family ?? "--")
                  )) })
                ] })
              ] }),
              (phaseB82MismatchRows.length > 0 || phaseB82RerunRows.length > 0 || phaseB82ReplayRequirements.length > 0 || phaseB82UnresolvedConfigs.length > 0 || phaseB82BlockedFamilies.length > 0) && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mismatch & Replay Requirements" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    phaseB82MismatchRows.map((reason) => /* @__PURE__ */ jsx("div", { children: reason }, reason)),
                    phaseB82ReplayRequirements.map((item, index) => /* @__PURE__ */ jsxs("div", { children: [
                      String(item.setup_family ?? "--"),
                      ":",
                      " ",
                      String(item.requirement ?? item.reason ?? "--")
                    ] }, `req-${index}`)),
                    phaseB82UnresolvedConfigs.map((item, index) => /* @__PURE__ */ jsxs("div", { children: [
                      String(item.setup_family ?? "--"),
                      ": ",
                      String(item.reason ?? "--")
                    ] }, `unresolved-${index}`))
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blocked Families / New Baseline Rerun" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    phaseB82BlockedFamilies.map((family) => /* @__PURE__ */ jsx("div", { children: family }, `blocked-${family}`)),
                    phaseB82RerunRows.map((stage) => /* @__PURE__ */ jsx("div", { children: stage }, stage))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Gate" }),
                /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB82Result.phase_c_readiness_decision?.status ?? "--" }),
                /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB82Result.phase_c_readiness_decision?.reason ?? "--" })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.2 sidecar report yet. Review B.8.1 before starting manually." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "21",
          title: "Phase B.8.3 - Replay Source Restoration & Reproducible Baseline Repair",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB83Repair,
              disabled: phaseB83Pending || Boolean(phaseB83JobId),
              children: [
                phaseB83Pending || phaseB83JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only repair that first audits exact legacy replay availability. If legacy replay cannot be proven, it creates a clearly separated reproducible baseline from the verified immutable raw sidecar and keeps B.8.1 and Phase C blocked." }),
            phaseB83JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3 job ",
                  phaseB83JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB83State ?? "queued",
                  " / ",
                  phaseB83Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB83Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB83Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB83Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB83Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3 Failed: ",
              phaseB83Error
            ] }),
            phaseB83Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB83StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              phaseB83NeedsAttention && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3 readiness remains research-gated." }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-amber-100/80", children: "A rebuilt Branch B baseline is a new lineage and requires an explicit later research rerun before B.8.1 or Phase C can be considered." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "New Lineage" }),
                  /* @__PURE__ */ jsx("div", { className: "break-words font-mono-num text-sm font-semibold text-foreground", children: phaseB83Result.new_lineage_id ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 text-muted-foreground", children: [
                    "meaningful replay",
                    " ",
                    String(phaseB83Result.deterministic_replay_meaningful ?? false)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Rerun Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB83Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB83Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB83Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB83Result.phase_c_readiness_decision?.reason ?? "--" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Deterministic Replay" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB83Result.deterministic_replay?.status ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 text-muted-foreground", children: [
                    "mismatch ",
                    String(phaseB83Result.deterministic_replay?.mismatch_count ?? "--")
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    "features",
                    " ",
                    compactHash(phaseB83Result.deterministic_replay?.feature_hash_pass_1)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mutation Proof" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB83Result.mutation_proof?.status ?? "--" }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 text-muted-foreground", children: [
                    "mutations ",
                    String(phaseB83Result.mutation_proof?.mutations?.length ?? 0)
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Artifact Paths" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83ArtifactRows.length > 0 ? phaseB83ArtifactRows.map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "truncate", children: [
                    key,
                    " ",
                    typeof value === "object" ? JSON.stringify(value) : String(value ?? "--")
                  ] }, key)) : /* @__PURE__ */ jsx("div", { children: "--" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Family Funnel" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1160px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Raw",
                    "Threshold",
                    "Track",
                    "Regime",
                    "Session",
                    "Spread",
                    "Accepted",
                    "Attempts",
                    "Opened",
                    "Closed",
                    "TP",
                    "SL",
                    "Timeout"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83FunnelRows.length > 0 ? phaseB83FunnelRows.map((row) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidates ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_qualified ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.track_qualified ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.regime_qualified ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.session_qualified ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.spread_qualified ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.execution_attempts ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.TP ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.SL ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.timeout ?? "--") })
                      ]
                    },
                    String(row.setup_family ?? "--")
                  )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 14, children: "No B.8.3 per-family funnel rows yet." }) }) })
                ] })
              ] }),
              (phaseB83Blockers.length > 0 || phaseB83ReplayRequirements.length > 0 || phaseB83UnresolvedConfigs.length > 0) && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b83-blocker-${index}`)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Missing Replay Requirements" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83ReplayRequirements.map((item, index) => /* @__PURE__ */ jsxs("div", { children: [
                    String(item.setup_family ?? "--"),
                    ":",
                    " ",
                    String(item.requirement ?? item.reason ?? "--")
                  ] }, `b83-req-${index}`)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Unresolved Source Configs" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83UnresolvedConfigs.map((item, index) => /* @__PURE__ */ jsxs("div", { children: [
                    String(item.setup_family ?? "--"),
                    ": ",
                    String(item.reason ?? "--")
                  ] }, `b83-unresolved-${index}`)) })
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3 replay source restoration report yet. Review B.8.2 before starting manually." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "22",
          title: "Phase B.8.3.1 - Threshold Gate & Prediction Payload Integrity Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB831Audit,
              disabled: phaseB831Pending || Boolean(phaseB831JobId),
              children: [
                phaseB831Pending || phaseB831JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.1"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only threshold gate and prediction payload integrity check. Rebuilt-lineage diagnostics keep B.8.1 and Phase C blocked and do not claim historical root-cause proof unless exact B.8.3 replay payloads are hash-verifiable." }),
            phaseB831JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.1 job ",
                  phaseB831JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB831State ?? "queued",
                  " / ",
                  phaseB831Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB831Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB831Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB831Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB831Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.1 Failed: ",
              phaseB831Error
            ] }),
            phaseB831Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB831StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              phaseB831NeedsAttention && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.1 remains audit-only." }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-amber-100/80", children: "Rebuilt baseline diagnostics cannot unblock B.8.1 or Phase C and cannot prove historical B.8.3 root cause without exact replay artifacts." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Deterministic Rebuild" }),
                  /* @__PURE__ */ jsxs("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: [
                    String(phaseB831Result.deterministic_rebuild_replay_count ?? 0),
                    " passes /",
                    " ",
                    "mismatch",
                    " ",
                    String(phaseB831Result.deterministic_rebuild_mismatch_count ?? "--")
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "mt-2 font-mono-num text-[11px] text-muted-foreground", children: [
                    "seed ",
                    String(phaseB831Result.random_seed ?? "--")
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Rerun Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB831Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB831Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB831Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB831Result.phase_c_readiness_decision?.reason ?? "--" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Family Score & Gate Funnel" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1280px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Scale",
                    "Min",
                    "P50",
                    "Max",
                    "Threshold",
                    "Score >= T",
                    "Trigger",
                    "Threshold Pass",
                    "Track",
                    "Regime",
                    "Session",
                    "Spread",
                    "Accepted",
                    "Attempts",
                    "Trades"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB831FunnelRows.length > 0 ? phaseB831FunnelRows.map((row) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_scale_classification ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_min ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_median ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_max ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.configured_threshold_value ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.count_score_gte_threshold ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.track_pass_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.regime_pass_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.session_pass_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.spread_pass_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.attempts ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? "--") })
                      ]
                    },
                    String(row.setup_family ?? "--")
                  )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 16, children: "No B.8.3.1 per-family audit rows yet." }) }) })
                ] })
              ] }),
              (phaseB831Blockers.length > 0 || phaseB831MissingPayloads.length > 0 || phaseB831ArtifactRows.length > 0) && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB831Blockers.length > 0 ? phaseB831Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b831-blocker-${index}`)) : /* @__PURE__ */ jsx("div", { children: "--" }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Missing Exact B.8.3 Payloads" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB831MissingPayloads.length > 0 ? phaseB831MissingPayloads.map((item, index) => /* @__PURE__ */ jsx("div", { children: item }, `b831-missing-${index}`)) : /* @__PURE__ */ jsx("div", { children: "--" }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Artifact Paths" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB831ArtifactRows.length > 0 ? phaseB831ArtifactRows.map(([key, value]) => /* @__PURE__ */ jsxs("div", { className: "truncate", children: [
                    key,
                    " ",
                    typeof value === "object" ? JSON.stringify(value) : String(value ?? "--")
                  ] }, key)) : /* @__PURE__ */ jsx("div", { children: "--" }) })
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.1 threshold gate audit report yet. Start manually after reviewing B.8.3." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "23",
          title: "Phase B.8.3.2 - Score Calibration, Label Balance & Threshold Sensitivity Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB832Audit,
              disabled: phaseB832Pending || Boolean(phaseB832JobId),
              children: [
                phaseB832Pending || phaseB832JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.2"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only score calibration, label balance, and diagnostic threshold sensitivity check. Threshold sensitivity is not promotion evidence and never opens B.8.1 or Phase C readiness." }),
            phaseB832JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.2 job ",
                  phaseB832JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB832State ?? "queued",
                  " / ",
                  phaseB832Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB832Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB832Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB832Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB832Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.2 Failed: ",
              phaseB832Error
            ] }),
            phaseB832Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB832StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              phaseB832NeedsAttention && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.2 is diagnostic-only." }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-amber-100/80", children: "Diagnostic thresholds are calibration evidence only; B.8.1 and Phase C stay blocked." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB832Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB832Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB832Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB832Result.phase_c_readiness_decision?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Diagnostic Label" }),
                  /* @__PURE__ */ jsx("div", { className: "break-words font-mono-num text-sm font-semibold text-foreground", children: phaseB832Result.diagnostic_label ?? "--" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Family Score Quantiles" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1280px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Raw",
                    "Trigger",
                    "Finite",
                    "Min",
                    "P10",
                    "P50",
                    "P90",
                    "P99",
                    "Max",
                    "Pos Rate",
                    "PR-AUC",
                    "ROC-AUC"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB832QuantileRows.length > 0 ? phaseB832QuantileRows.map((row) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidate_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.finite_score_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.min ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.p10 ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.p50 ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.p90 ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.p99 ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.max ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.positive_label_rate ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.pr_auc ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.roc_auc ?? "--") })
                      ]
                    },
                    String(row.setup_family ?? "--")
                  )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 13, children: "No B.8.3.2 score quantiles yet." }) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Calibration Bins" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[720px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Bin", "Count", "Pred Mean", "Observed"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB832CalibrationRows.length > 0 ? phaseB832CalibrationRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.bin ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.predicted_probability_mean ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.observed_positive_rate ?? "--") })
                    ] }, `b832-cal-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 5, children: "No calibration bins yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Diagnostic Threshold Sensitivity" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[780px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Threshold",
                      "Score >= T",
                      "Accepted",
                      "Attempted",
                      "Opened",
                      "Closed"
                    ].map((label, index) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, `${label}-${index}`)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB832ThresholdRows.length > 0 ? phaseB832ThresholdRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_gte_threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.attempted ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? "--") })
                    ] }, `b832-threshold-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No diagnostic threshold sensitivity rows yet." }) }) })
                  ] })
                ] })
              ] }),
              phaseB832Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB832Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b832-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.2 score calibration audit report yet. Start manually after reviewing B.8.3.1." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "24",
          title: "Phase B.8.3.3 - Feature Schema Parity & Deterministic Inference Repair",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB833Audit,
              disabled: phaseB833Pending || Boolean(phaseB833JobId),
              children: [
                phaseB833Pending || phaseB833JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.3"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-first schema parity and deterministic inference check. This phase separates historical inference proof from rebuilt-lineage diagnostics and keeps B.8.1 and Phase C readiness blocked." }),
            phaseB833JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.3 job ",
                  phaseB833JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB833State ?? "queued",
                  " / ",
                  phaseB833Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB833Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB833Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB833Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB833Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.3 Failed: ",
              phaseB833Error
            ] }),
            phaseB833Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB833StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              phaseB833NeedsAttention && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.3 remains research-only." }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-amber-100/80", children: "Rebuilt-lineage diagnostics cannot prove historical B.8.3.1 inference root cause unless the exact historical inference matrix is hash-verifiable." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB833Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB833Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB833Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB833Result.phase_c_readiness_decision?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mutation Proof" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB833Result.mutation_proof?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: "Prior B.6/B.7/B.8/B.8.1/B.8.2/B.8.3/B.8.3.1/B.8.3.2 artifacts remain protected." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Family Schema Parity" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1320px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Artifact",
                    "Matrix",
                    "Alignment",
                    "Prediction",
                    "Missing Model Features",
                    "Predictions Changed",
                    "Threshold",
                    "Pass Before",
                    "Pass After"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB833SchemaRows.length > 0 ? phaseB833SchemaRows.map((row) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.schema_artifact_status ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.actual_inference_matrix_status ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.canonical_alignment_status ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.prediction_effect_status ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "max-w-[280px] truncate px-3 py-2", children: JSON.stringify(row.missing_model_features ?? []) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.predictions_changed ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.configured_threshold ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass_count_before_alignment ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass_count_after_alignment ?? "--") })
                      ]
                    },
                    String(row.setup_family ?? "--")
                  )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 10, children: "No B.8.3.3 schema audit rows yet." }) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Before / After Score Quantiles" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[860px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Threshold",
                      "Changed",
                      "Pass Before",
                      "Pass After",
                      "P50 After",
                      "P99 After"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB833QuantileRows.length > 0 ? phaseB833QuantileRows.map((row) => {
                      const after = row.after ?? {};
                      return /* @__PURE__ */ jsxs(
                        "tr",
                        {
                          className: "hover:bg-background/20",
                          children: [
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.configured_threshold ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.predictions_changed ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass_before ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass_after ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(after.p50 ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(after.p99 ?? "--") })
                          ]
                        },
                        String(row.setup_family ?? "--")
                      );
                    }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No before/after quantiles yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Diagnostic Threshold Sensitivity" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[780px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Threshold",
                      "Score >= T",
                      "Accepted",
                      "Attempted",
                      "Opened",
                      "Closed"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB833ThresholdRows.length > 0 ? phaseB833ThresholdRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_gte_threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.attempted ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? "--") })
                    ] }, `b833-threshold-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No B.8.3.3 threshold sensitivity rows yet." }) }) })
                  ] })
                ] })
              ] }),
              phaseB833Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB833Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b833-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.3 schema parity audit report yet. Start manually after reviewing B.8.3.2." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "25",
          title: "Phase B.8.3.4 - Post-Threshold Execution Funnel & Gate-Semantics Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB834Audit,
              disabled: phaseB834Pending || Boolean(phaseB834JobId),
              children: [
                phaseB834Pending || phaseB834JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only post-threshold funnel check. Mode A reproduces score-only diagnostic sensitivity; Mode B runs only when execution replay artifacts are hash-verifiable. B.8.1 and Phase C readiness remain blocked." }),
            phaseB834JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.4 job ",
                  phaseB834JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB834State ?? "queued",
                  " / ",
                  phaseB834Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB834Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB834Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB834Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB834Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.4 Failed: ",
              phaseB834Error
            ] }),
            phaseB834Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB834StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "DIAGNOSTIC_ONLY_NOT_PROMOTION_EVIDENCE" }),
                /* @__PURE__ */ jsx("div", { className: "mt-1 text-amber-100/80", children: "Score-passing counts are not execution attempts, opened trades, or promotion evidence. Threshold 0.55 remains unchanged." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB834Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB834Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB834Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB834Result.phase_c_readiness_decision?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mutation Proof" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB834Result.mutation_proof?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: "Prior B.6/B.7/B.8/B.8.1/B.8.2/B.8.3/B.8.3.1/B.8.3.2/B.8.3.3 artifacts remain protected." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mode A Score-Only Threshold Funnel" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1160px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Threshold",
                    "Raw",
                    "Trigger",
                    "Finite",
                    "Score >= T",
                    "Displayed Accepted",
                    "Accepted Semantics",
                    "Attempted",
                    "Opened",
                    "Closed"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB834ThresholdRows.length > 0 ? phaseB834ThresholdRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidate_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_finite_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_gte_threshold ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.displayed_accepted_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_semantics ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.attempted ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? "--") })
                  ] }, `b834-threshold-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 11, children: "No B.8.3.4 score-only funnel rows yet." }) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mode B Per-Family Gate Summary" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[980px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Threshold",
                      "Rows",
                      "Threshold Pass",
                      "Track",
                      "Session",
                      "Spread",
                      "Move/Cost",
                      "Accepted",
                      "Attempted",
                      "Opened",
                      "Closed"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB834GateRows.length > 0 ? phaseB834GateRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.candidate_rows ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.track_pass ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.session_pass ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.spread_pass ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.move_cost_pass ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_final ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.execution_attempted ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? "--") })
                    ] }, `b834-gate-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 12, children: "No full-funnel replay rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Gate Rejection Summary" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[620px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Threshold", "First Failing Gate", "Count"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB834RejectionRows.length > 0 ? phaseB834RejectionRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.first_failing_gate ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.count ?? "--") })
                    ] }, `b834-reject-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 4, children: "No per-gate rejection rows yet." }) }) })
                  ] })
                ] })
              ] }),
              (phaseB834MissingReplay.length > 0 || phaseB834Blockers.length > 0) && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Missing Replay Requirements" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB834MissingReplay.length > 0 ? phaseB834MissingReplay.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b834-missing-${index}`)) : /* @__PURE__ */ jsx("div", { children: "--" }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB834Blockers.length > 0 ? phaseB834Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b834-blocker-${index}`)) : /* @__PURE__ */ jsx("div", { children: "--" }) })
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4 post-threshold funnel audit report yet. Start manually after reviewing B.8.3.3." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "26",
          title: "Phase B.8.3.4.1 - Ledger Hash Attestation & Source-Lineage Integrity Proof",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB8341Audit,
              disabled: phaseB8341Pending || Boolean(phaseB8341JobId),
              children: [
                phaseB8341Pending || phaseB8341JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4.1"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only post-hoc cryptographic baseline for the current B.8.3.4 ledger files. It proves files remain unchanged after attestation, but does not prove historical immutability before the first attestation." }),
            phaseB8341JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.4.1 job ",
                  phaseB8341JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB8341State ?? "queued",
                  " / ",
                  phaseB8341Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB8341Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB8341Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB8341Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB8341Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.4.1 Failed: ",
              phaseB8341Error
            ] }),
            phaseB8341Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB8341StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "POST_HOC_CURRENT_FILE_BASELINE" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Historical immutability remains",
                  " ",
                  String(phaseB8341Result.historical_immutability_proven ?? false),
                  ". Locked confirmation stays unopened with row consumption",
                  " ",
                  phaseB8341Result.locked_confirmation_row_consumption_count ?? 0,
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Source Hashes" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 font-mono-num text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { className: "break-all", children: [
                      "report: ",
                      phaseB8341Result.source_b834_report_sha256 ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "break-all", children: [
                      "manifest: ",
                      phaseB8341Result.source_b834_manifest_sha256 ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "break-all", children: [
                      "attestation: ",
                      phaseB8341Result.attestation_manifest_sha256 ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "attested: ",
                      phaseB8341Result.attested_at_utc ?? "--"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB8341Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB8341Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB8341Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB8341Result.phase_c_readiness_decision?.reason ?? "--" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Ledger Attestation" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Ledger",
                    "Rows",
                    "Columns",
                    "SHA-256",
                    "Schema",
                    "Event IDs",
                    "Setup Families"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8341LedgerRows.map(([label, payload]) => {
                    const row = payload ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(label) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.row_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.column_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "max-w-[260px] truncate px-3 py-2", children: String(row.sha256 ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "max-w-[240px] truncate px-3 py-2", children: String(row.schema_hash ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.event_id_integrity_status ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "max-w-[280px] truncate px-3 py-2", children: JSON.stringify(row.setup_family_counts ?? {}) })
                    ] }, String(label));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Join Integrity Summary" }),
                /* @__PURE__ */ jsx("div", { className: "font-mono-num text-[11px] text-muted-foreground", children: JSON.stringify(phaseB8341Result.join_integrity_summary ?? {}) })
              ] }),
              phaseB8341Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB8341Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b8341-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4.1 ledger attestation report yet. Start manually after reviewing B.8.3.4." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "27",
          title: "Phase B.8.3.4.2 - Ledger Schema Mapping & Event-ID Provenance Repair",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB8342Audit,
              disabled: phaseB8342Pending || Boolean(phaseB8342JobId),
              children: [
                phaseB8342Pending || phaseB8342JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4.2"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only ledger schema mapping repair. It uses the B.8.3.4.1 status-only hash capture only as a pre-mapping tamper check, keeps signal/open/close timestamps distinct, and publishes only a new normalized research sidecar when provenance is fully proven." }),
            phaseB8342JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.4.2 job ",
                  phaseB8342JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB8342State ?? "queued",
                  " / ",
                  phaseB8342Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB8342Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB8342Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB8342Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB8342Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.4.2 Failed: ",
              phaseB8342Error
            ] }),
            phaseB8342Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB8342StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "POST_HOC_CURRENT_FILE_BASELINE" }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Historical immutability and historical root cause remain",
                  " ",
                  String(phaseB8342Result.historical_root_cause_proven ?? false),
                  ". Locked confirmation stays unopened with row consumption",
                  " ",
                  phaseB8342Result.locked_confirmation_row_consumption_count ?? 0,
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Timestamp Semantics" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      "candidate: ",
                      phaseB8342Result.candidate_timestamp_semantic ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "opened: ",
                      phaseB8342Result.trade_open_timestamp_semantic ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "closed: ",
                      phaseB8342Result.trade_close_timestamp_semantic ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "chronology violations: ",
                      phaseB8342Result.chronology_violation_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "same-semantic mismatches:",
                      " ",
                      phaseB8342Result.same_semantic_timestamp_mismatch_count ?? 0
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB8342Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB8342Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB8342Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB8342Result.phase_c_readiness_decision?.reason ?? "--" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 xl:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Direction Inventory" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[860px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Ledger",
                      "Source",
                      "Raw Counts",
                      "Canonical Counts",
                      "Missing",
                      "Ambiguous",
                      "Status"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8342DirectionRows.map(([label, payload]) => {
                      const row = payload ?? {};
                      return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(label) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_field ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "max-w-[220px] truncate px-3 py-2", children: JSON.stringify(row.raw_value_counts ?? {}) }),
                        /* @__PURE__ */ jsx("td", { className: "max-w-[220px] truncate px-3 py-2", children: JSON.stringify(row.canonical_value_counts ?? {}) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.missing_row_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.ambiguous_row_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.status ?? "--") })
                      ] }, String(label));
                    }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Direction Join Parity" }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-2 font-mono-num text-[11px] text-muted-foreground sm:grid-cols-2", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      "status:",
                      " ",
                      String(phaseB8342DirectionParity.direction_join_parity_status ?? "--")
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "joined trades: ",
                      String(phaseB8342DirectionParity.joined_trade_count ?? 0)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "mismatches:",
                      " ",
                      String(phaseB8342DirectionParity.direction_mismatch_count ?? 0)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "missing: ",
                      String(phaseB8342DirectionParity.missing_direction_count ?? 0)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "orphans: ",
                      String(phaseB8342DirectionParity.orphan_trade_count ?? 0)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "duplicate joins:",
                      " ",
                      String(phaseB8342DirectionParity.duplicate_join_count ?? 0)
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Direction Mapping Table" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[900px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Ledger", "Source", "Raw", "Rows", "Canonical", "Status", "Rule"].map(
                    (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                  ) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8342DirectionMappings.length > 0 ? phaseB8342DirectionMappings.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.ledger_kind ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_field ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_value ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_count ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.canonical_value ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.status ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "max-w-[360px] truncate px-3 py-2", children: String(row.derived_rule ?? "--") })
                  ] }, `b8342-direction-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No direction mapping rows yet." }) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Normalized Ledger Attestation" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[900px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Ledger", "Rows", "Columns", "SHA-256", "Schema"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8342LedgerRows.map(([label, payload]) => {
                    const row = payload ?? {};
                    return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2 font-semibold text-foreground", children: String(label) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.row_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.column_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "max-w-[320px] truncate px-3 py-2", children: String(row.sha256 ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "max-w-[260px] truncate px-3 py-2", children: String(row.schema_hash ?? "--") })
                    ] }, String(label));
                  }) })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 xl:grid-cols-2", children: [
                ["Candidate Field Mapping", phaseB8342CandidateMappings],
                ["Trade Field Mapping", phaseB8342TradeMappings]
              ].map(([title, rows]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(title) }),
                    /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[760px] text-left text-xs", children: [
                      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Target", "Source", "Type", "Status", "Ambiguous"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                      /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: rows.length > 0 ? rows.map((row, index) => /* @__PURE__ */ jsxs(
                        "tr",
                        {
                          className: "hover:bg-background/20",
                          children: [
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.target_field ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_field ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.mapping_type ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.status ?? "--") }),
                            /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(
                              row.ambiguous_row_count ?? row.invalid_timestamp_count ?? 0
                            ) })
                          ]
                        },
                        `${String(title)}-${index}`
                      )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 5, children: "No mapping rows yet." }) }) })
                    ] })
                  ]
                },
                String(title)
              )) }),
              phaseB8342Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB8342Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b8342-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4.2 schema mapping report yet. Start manually after reviewing B.8.3.4.1." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "28",
          title: "Phase B.8.3.4.2.1 - Direction Attribution Historical Provenance Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB83421Audit,
              disabled: phaseB83421Pending || Boolean(phaseB83421JobId),
              children: [
                phaseB83421Pending || phaseB83421JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4.2.1"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only direction attribution layer. It separates persisted historical transform proof from current-code diagnostics, and it cannot unlock B.8.3.6 unless historical transform provenance is hash-verifiable." }),
            phaseB83421JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.4.2.1 job ",
                  phaseB83421JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB83421State ?? "queued",
                  " / ",
                  phaseB83421Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB83421Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB83421Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB83421Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB83421Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.4.2.1 Failed: ",
              phaseB83421Error
            ] }),
            phaseB83421Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB83421StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "Historical transform proof is fail-closed." }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Current-code reproduction is diagnostic only unless persisted rule, config, and generation-code hashes bind to the exact B.8.3.4 lineage. Historical root cause remains ",
                  String(phaseB83421Result.historical_root_cause_proven ?? false),
                  ". Locked rows consumed",
                  " ",
                  phaseB83421Result.locked_confirmation_row_consumption_count ?? 0,
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Direction Counts" }),
                  /* @__PURE__ */ jsxs("div", { className: "grid gap-2 font-mono-num text-[11px] text-muted-foreground sm:grid-cols-2", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      "joined: ",
                      phaseB83421Result.joined_trade_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "matches: ",
                      phaseB83421Result.direction_match_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "mismatches: ",
                      phaseB83421Result.direction_mismatch_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "unresolved: ",
                      phaseB83421Result.unresolved_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "BUY→SELL: ",
                      phaseB83421Result.candidate_buy_trade_sell_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "SELL→BUY: ",
                      phaseB83421Result.candidate_sell_trade_buy_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "FLAT+trade: ",
                      phaseB83421Result.candidate_flat_with_trade_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "invert: ",
                      phaseB83421Result.invert_match_count ?? 0
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Historical Binding" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83421ProofRows.map(([label, value]) => /* @__PURE__ */ jsxs("div", { children: [
                    String(label),
                    ": ",
                    String(value ?? "--")
                  ] }, String(label))) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Readiness" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono-num font-semibold text-foreground", children: phaseB83421Result.b81_rerun_readiness?.status ?? "--" }),
                      " ",
                      "B.8.1"
                    ] }),
                    /* @__PURE__ */ jsx("div", { children: phaseB83421Result.b81_rerun_readiness?.reason ?? "--" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono-num font-semibold text-foreground", children: phaseB83421Result.phase_c_readiness_decision?.status ?? "--" }),
                      " ",
                      "Phase C"
                    ] }),
                    /* @__PURE__ */ jsx("div", { children: phaseB83421Result.phase_c_readiness_decision?.reason ?? "--" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Direction Attribution" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1120px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Setup",
                    "Config",
                    "Joined",
                    "Identity",
                    "Invert",
                    "Mismatches",
                    "BUY→SELL",
                    "SELL→BUY",
                    "FLAT+Trade",
                    "Unresolved",
                    "Row Source"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83421AttributionRows.length > 0 ? phaseB83421AttributionRows.map((row, index) => /* @__PURE__ */ jsxs(
                    "tr",
                    {
                      className: "hover:bg-background/20",
                      children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_config_id ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.joined_trade_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.identity_match_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.invert_match_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.direction_mismatch_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.candidate_buy_trade_sell_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.candidate_sell_trade_buy_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.candidate_flat_with_trade_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.unresolved_count ?? 0) }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.row_level_source_available ?? false) })
                      ]
                    },
                    `b83421-attribution-${index}`
                  )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 11, children: "No B.8.3.4.2.1 direction attribution rows yet." }) }) })
                ] })
              ] }),
              phaseB83421Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83421Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b83421-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4.2.1 direction provenance report yet. Start manually after reviewing B.8.3.4.2." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "29",
          title: "Phase B.8.3.4.3 - Provenance-Complete Reproducible Ledger Baseline Rebuild",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB8343Audit,
              disabled: phaseB8343Pending || Boolean(phaseB8343JobId),
              children: [
                phaseB8343Pending || phaseB8343JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4.3"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only new-lineage baseline rebuild. It uses the verified immutable B.8.2 raw sidecar and current versioned research configuration, persists source/config/rule, feature, model, prediction, candidate, and trade attestations, and never repairs old historical lineage proof." }),
            phaseB8343JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.4.3 job ",
                  phaseB8343JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB8343State ?? "queued",
                  " / ",
                  phaseB8343Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB8343Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB8343Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB8343Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB8343Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.4.3 Failed: ",
              phaseB8343Error
            ] }),
            phaseB8343Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-4", children: phaseB8343StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.4.3 creates a new baseline only." }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Historical repair is",
                  " ",
                  String(phaseB8343Result.historical_lineage_repair ?? false),
                  ". Historical root-cause proof is",
                  " ",
                  String(phaseB8343Result.historical_root_cause_proven ?? false),
                  ". Locked confirmation is ",
                  phaseB8343Result.locked_confirmation_status ?? "--",
                  " with",
                  " ",
                  phaseB8343Result.locked_confirmation_row_consumption_count ?? 0,
                  " locked rows consumed."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Replay And Ledger Proof" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      "replay mismatches:",
                      " ",
                      phaseB8343Result.deterministic_replay_mismatch_count ?? "--"
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "joined trades: ",
                      phaseB8343Result.joined_trade_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "direction matches: ",
                      phaseB8343Result.direction_match_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "direction mismatches: ",
                      phaseB8343Result.direction_mismatch_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "orphan trades: ",
                      phaseB8343Result.orphan_trade_count ?? 0
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "chronology violations: ",
                      phaseB8343Result.chronology_violation_count ?? 0
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Hashes" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      "raw: ",
                      compactHash(phaseB8343Result.source_raw_sidecar_manifest_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "candidate: ",
                      compactHash(phaseB8343Result.candidate_ledger_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "trade: ",
                      compactHash(phaseB8343Result.trade_ledger_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "manifest: ",
                      compactHash(phaseB8343Result.sidecar_manifest_sha256)
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Readiness" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono-num font-semibold text-foreground", children: phaseB8343Result.b81_rerun_readiness?.status ?? "--" }),
                      " ",
                      "B.8.1"
                    ] }),
                    /* @__PURE__ */ jsx("div", { children: phaseB8343Result.b81_rerun_readiness?.reason ?? "--" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono-num font-semibold text-foreground", children: phaseB8343Result.phase_c_readiness_decision?.status ?? "--" }),
                      " ",
                      "Phase C"
                    ] }),
                    /* @__PURE__ */ jsx("div", { children: phaseB8343Result.phase_c_readiness_decision?.reason ?? "--" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Raw Sidecar Attestation" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[720px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["TF", "Rows", "First", "Last", "Dup", "Null", "Order"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8343RawRows.length > 0 ? phaseB8343RawRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.timeframe ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.row_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.first_timestamp_utc ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.last_timestamp_utc ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.duplicate_timestamp_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.null_timestamp_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.chronological_order_status ?? "--") })
                    ] }, `b8343-raw-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No B.8.3.4.3 raw-sidecar attestation rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Per-Family Funnel" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[720px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Raw",
                      "Threshold",
                      "Accepted",
                      "Opened",
                      "Closed",
                      "TP",
                      "SL",
                      "Timeout"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8343FunnelRows.length > 0 ? phaseB8343FunnelRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidate ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_final ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.tp ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.sl ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.timeout ?? 0) })
                    ] }, `b8343-funnel-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 9, children: "No B.8.3.4.3 funnel rows yet." }) }) })
                  ] })
                ] })
              ] }),
              phaseB8343Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB8343Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b8343-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4.3 new-lineage baseline report yet. Start manually only after reviewing B.8.3.4.2.1." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "29.1",
          title: "Phase B.8.3.4.3.1 - Manifest-Bound Trigger-Provenance Complete Baseline Rebuild",
          icon: ShieldCheck,
          className: "hidden",
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB83431Audit,
              disabled: phaseB83431Pending || Boolean(phaseB83431JobId),
              children: [
                phaseB83431Pending || phaseB83431JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4.3.1"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only trigger-provenance-complete baseline rebuild. It inherits the verified B.8.3.4.3 lineage, reuses manifest-bound trigger provenance plus trigger input rows, and keeps B.8.1 and Phase C readiness blocked." }),
            phaseB83431JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.4.3.1 job ",
                  phaseB83431JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB83431State ?? "queued",
                  " / ",
                  phaseB83431Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB83431Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB83431Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB83431Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB83431Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.4.3.1 Failed: ",
              phaseB83431Error
            ] }),
            phaseB83431Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-4", children: phaseB83431StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.4.3.1 creates a new trigger baseline only." }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Historical repair is",
                  " ",
                  String(phaseB83431Result.historical_lineage_repair ?? false),
                  ". Historical root-cause proof is",
                  " ",
                  String(phaseB83431Result.historical_root_cause_proven ?? false),
                  ". Locked confirmation is ",
                  phaseB83431Result.locked_confirmation_status ?? "--",
                  " with",
                  " ",
                  phaseB83431Result.locked_confirmation_row_consumption_count ?? 0,
                  " locked rows consumed."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Source Provenance" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83431SourceRows.map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { children: String(label) }),
                    /* @__PURE__ */ jsx("span", { className: "truncate text-right text-foreground", children: String(value ?? "--") })
                  ] }, String(label))) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Replay & Hashes" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      "trigger provenance:",
                      " ",
                      compactHash(
                        phaseB83431Result.trigger_rule_attestation?.trigger_rule_provenance_sha256
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "trigger input:",
                      " ",
                      compactHash(
                        phaseB83431Result.trigger_input_attestation?.trigger_input_frame_sha256
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "feature frame: ",
                      compactHash(phaseB83431Result.feature_frame_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "candidate ledger:",
                      " ",
                      compactHash(phaseB83431Result.ledger_attestation?.candidate_ledger_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "trade ledger:",
                      " ",
                      compactHash(phaseB83431Result.ledger_attestation?.trade_ledger_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "sidecar manifest: ",
                      compactHash(phaseB83431Result.sidecar_manifest_sha256)
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Trigger Rule Provenance" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[900px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Config", "Source", "Version", "SHA", "Binding"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431TriggerRows.length > 0 ? phaseB83431TriggerRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_config_id ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_rule_source ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_rule_version ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(row.trigger_rule_sha256) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_rule_binding_status ?? "--") })
                    ] }, `b83431-trigger-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No trigger rule provenance rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Trigger Input Audit" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Config",
                      "Rows",
                      "Missing",
                      "Null",
                      "Inf",
                      "DType",
                      "Status"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431InputRows.length > 0 ? phaseB83431InputRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_config_id ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_row_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_missing_column_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_null_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_inf_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_dtype_mismatch_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_integrity_status ?? "--") })
                    ] }, `b83431-input-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 8, children: "No trigger input audit rows yet." }) }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Persisted vs Recomputed Parity" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[980px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Persisted", "Replay1", "Replay2", "Mismatch", "Status"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431ParityRows.length > 0 ? phaseB83431ParityRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_trigger_pass_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.recomputed_trigger_pass_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.recomputed_trigger_pass_count_replay_2 ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_vs_recomputed_trigger_parity_status ?? "--") })
                    ] }, `b83431-parity-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No parity rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Sequential Funnel & First Fail" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1120px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Region",
                      "Raw",
                      "Trigger",
                      "Score",
                      "Threshold",
                      "Track",
                      "Regime",
                      "Session",
                      "Spread",
                      "Move",
                      "Accepted",
                      "Opened",
                      "Closed"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431FunnelRows.length > 0 ? phaseB83431FunnelRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidate ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_available ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.track_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.regime_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.session_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.spread_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.move_cost_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_final ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? 0) })
                    ] }, `b83431-funnel-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 14, children: "No sequential funnel rows yet." }) }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "First Failing Gate Waterfall" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Region", "Gate", "Reached", "Passed", "Rejected"].map(
                    (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                  ) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431WaterfallRows.length > 0 ? phaseB83431WaterfallRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.gate ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.reaching_count ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.passing_count ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.rejected_count ?? 0) })
                  ] }, `b83431-waterfall-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No waterfall rows yet." }) }) })
                ] })
              ] }),
              phaseB83431Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83431Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b83431-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4.3.1 trigger provenance report yet. Start manually only after reviewing B.8.3.4.3." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "29.1",
          title: "Phase B.8.3.4.3.1 - Manifest-Bound Trigger-Provenance Complete Baseline Rebuild",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB83431Audit,
              disabled: phaseB83431Pending || Boolean(phaseB83431JobId),
              children: [
                phaseB83431Pending || phaseB83431JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4.3.1"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only trigger-provenance-complete baseline rebuild. It inherits the verified B.8.3.4.3 lineage, reuses manifest-bound trigger provenance plus trigger input rows, and keeps B.8.1 and Phase C readiness blocked." }),
            phaseB83431JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.4.3.1 job ",
                  phaseB83431JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB83431State ?? "queued",
                  " / ",
                  phaseB83431Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB83431Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB83431Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB83431Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB83431Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.4.3.1 Failed: ",
              phaseB83431Error
            ] }),
            phaseB83431Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-4", children: phaseB83431StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.4.3.1 creates a new trigger baseline only." }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Historical repair is",
                  " ",
                  String(phaseB83431Result.historical_lineage_repair ?? false),
                  ". Historical root-cause proof is",
                  " ",
                  String(phaseB83431Result.historical_root_cause_proven ?? false),
                  ". Locked confirmation is ",
                  phaseB83431Result.locked_confirmation_status ?? "--",
                  " with",
                  " ",
                  phaseB83431Result.locked_confirmation_row_consumption_count ?? 0,
                  " locked rows consumed."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Source Provenance" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83431SourceRows.map(([label, value]) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between gap-3", children: [
                    /* @__PURE__ */ jsx("span", { children: String(label) }),
                    /* @__PURE__ */ jsx("span", { className: "truncate text-right text-foreground", children: String(value ?? "--") })
                  ] }, String(label))) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Replay & Hashes" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      "trigger provenance:",
                      " ",
                      compactHash(
                        phaseB83431Result.trigger_rule_attestation?.trigger_rule_provenance_sha256
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "trigger input:",
                      " ",
                      compactHash(
                        phaseB83431Result.trigger_input_attestation?.trigger_input_frame_sha256
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "feature frame: ",
                      compactHash(phaseB83431Result.feature_frame_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "candidate ledger:",
                      " ",
                      compactHash(phaseB83431Result.ledger_attestation?.candidate_ledger_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "trade ledger:",
                      " ",
                      compactHash(phaseB83431Result.ledger_attestation?.trade_ledger_sha256)
                    ] }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      "sidecar manifest: ",
                      compactHash(phaseB83431Result.sidecar_manifest_sha256)
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Trigger Rule Provenance" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[900px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Config", "Source", "Version", "SHA", "Binding"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431TriggerRows.length > 0 ? phaseB83431TriggerRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_config_id ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_rule_source ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_rule_version ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(row.trigger_rule_sha256) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_rule_binding_status ?? "--") })
                    ] }, `b83431-trigger-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No trigger rule provenance rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Trigger Input Audit" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Config",
                      "Rows",
                      "Missing",
                      "Null",
                      "Inf",
                      "DType",
                      "Status"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431InputRows.length > 0 ? phaseB83431InputRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_config_id ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_row_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_missing_column_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_null_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_inf_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_dtype_mismatch_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_integrity_status ?? "--") })
                    ] }, `b83431-input-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 8, children: "No trigger input audit rows yet." }) }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Persisted vs Recomputed Parity" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[980px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Persisted", "Replay1", "Replay2", "Mismatch", "Status"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431ParityRows.length > 0 ? phaseB83431ParityRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_trigger_pass_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.recomputed_trigger_pass_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.recomputed_trigger_pass_count_replay_2 ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_vs_recomputed_trigger_parity_status ?? "--") })
                    ] }, `b83431-parity-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No parity rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Sequential Funnel & First Fail" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1120px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Region",
                      "Raw",
                      "Trigger",
                      "Score",
                      "Threshold",
                      "Track",
                      "Regime",
                      "Session",
                      "Spread",
                      "Move",
                      "Accepted",
                      "Opened",
                      "Closed"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431FunnelRows.length > 0 ? phaseB83431FunnelRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidate ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_available ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.track_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.regime_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.session_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.spread_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.move_cost_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_final ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? 0) })
                    ] }, `b83431-funnel-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 14, children: "No sequential funnel rows yet." }) }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "First Failing Gate Waterfall" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Region", "Gate", "Reached", "Passed", "Rejected"].map(
                    (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                  ) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83431WaterfallRows.length > 0 ? phaseB83431WaterfallRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.gate ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.reaching_count ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.passing_count ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.rejected_count ?? 0) })
                  ] }, `b83431-waterfall-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No waterfall rows yet." }) }) })
                ] })
              ] }),
              phaseB83431Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83431Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b83431-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4.3.1 trigger provenance report yet. Start manually only after reviewing B.8.3.4.3." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "30",
          title: "Phase B.8.3.4.3.2 - Versioned Trigger-Rule Specification & Replayable Baseline Repair",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB83432Audit,
              disabled: phaseB83432Pending || Boolean(phaseB83432JobId),
              children: [
                phaseB83432Pending || phaseB83432JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.4.3.2"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Research-only new lineage from the immutable B.8.3.4.3 parent. This phase records a versioned raw-prediction trigger rule and keeps B.8.1 plus Phase C blocked." }),
            phaseB83432JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[oklch(0.88_0.018_95/0.25)] bg-[oklch(0.88_0.018_95/0.08)] p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-[oklch(0.96_0.012_95)]", children: [
                  "Phase B.8.3.4.3.2 job ",
                  phaseB83432JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB83432State ?? "queued",
                  " / ",
                  phaseB83432Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB83432Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex flex-col gap-1 text-[11px] text-muted-foreground md:flex-row md:justify-between", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB83432Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB83432Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB83432Error && /* @__PURE__ */ jsxs("p", { className: "break-words rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-xs font-semibold text-destructive", children: [
              "Phase B.8.3.4.3.2 Failed: ",
              phaseB83432Error
            ] }),
            phaseB83432Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6", children: phaseB83432StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/35 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: label }),
                    /* @__PURE__ */ jsx("div", { className: "mt-1 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                `b83432-status-${label}`
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-[oklch(0.88_0.018_95/0.24)] bg-[oklch(0.88_0.018_95/0.06)] p-3 text-xs leading-relaxed text-muted-foreground", children: [
                "New-lineage only. Historical repair is",
                " ",
                String(phaseB83432Result.historical_lineage_repair ?? false),
                " and historical root-cause proof is",
                " ",
                String(phaseB83432Result.historical_root_cause_proven ?? false),
                ". Locked confirmation remains ",
                phaseB83432Result.locked_confirmation_status ?? "--",
                " with",
                " ",
                phaseB83432Result.locked_confirmation_row_consumption_count ?? 0,
                " locked rows read."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Hash-Bound References" }),
                  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 text-xs font-mono-num", children: phaseB83432HashRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-lg border border-border/25 bg-background/25 p-2",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.12em] text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 break-words text-foreground", children: value })
                      ]
                    },
                    `b83432-hash-${label}`
                  )) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Raw Prediction Integrity" }),
                  /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 text-xs font-mono-num", children: [
                    ["dtype", phaseB83432Result.raw_prediction_dtype],
                    ["raw rows", phaseB83432Result.raw_prediction_row_count],
                    ["rows", phaseB83432Result.trigger_input_row_count],
                    ["parent rows", phaseB83432Result.parent_candidate_ledger_row_count],
                    ["null", phaseB83432Result.raw_prediction_null_count],
                    ["nan", phaseB83432Result.raw_prediction_nan_count],
                    ["inf", phaseB83432Result.raw_prediction_inf_count],
                    ["bool", phaseB83432Result.raw_prediction_boolean_count],
                    ["float", phaseB83432Result.raw_prediction_float_count],
                    ["non-integral", phaseB83432Result.raw_prediction_non_integral_count],
                    ["unknown", phaseB83432Result.raw_prediction_unknown_value_count],
                    ["ambiguous", phaseB83432Result.raw_prediction_ambiguous_value_count],
                    ["fk missing", phaseB83432Result.trigger_input_candidate_fk_missing_count],
                    [
                      "fk duplicate",
                      phaseB83432Result.trigger_input_candidate_fk_duplicate_count
                    ],
                    ["fk orphan", phaseB83432Result.trigger_input_candidate_fk_orphan_count],
                    [
                      "config mismatch",
                      phaseB83432Result.trigger_input_source_config_mismatch_count
                    ],
                    [
                      "family mismatch",
                      phaseB83432Result.trigger_input_setup_family_mismatch_count
                    ],
                    [
                      "row-hash mismatch",
                      phaseB83432Result.trigger_input_row_hash_mismatch_count
                    ]
                  ].map(([label, value]) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "rounded-lg border border-border/25 bg-background/25 p-2",
                      children: [
                        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.12em] text-muted-foreground", children: label }),
                        /* @__PURE__ */ jsx("div", { className: "mt-1 text-foreground", children: String(value ?? "--") })
                      ]
                    },
                    `b83432-raw-${label}`
                  )) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Prediction Payload Resolution" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[980px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Family", "State", "Path", "Rows", "Expected", "Actual", "Columns"].map(
                    (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                  ) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83432PredictionResolutionRows.length > 0 ? phaseB83432PredictionResolutionRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.prediction_payload_state ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.prediction_payload_path_resolution_status ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.row_count ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(row.expected_sha256) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(row.actual_sha256) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: Array.isArray(row.ordered_columns) ? String(row.ordered_columns.length) : "--" })
                  ] }, `b83432-payload-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No prediction-payload resolution rows yet." }) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Explicit Raw-Prediction Mapping" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[900px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Raw", "Mapped", "Trigger", "Type", "Rule", "Rows", "Status"].map(
                    (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                  ) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB83432InventoryRows.length > 0 ? phaseB83432InventoryRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_prediction_value ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.mapped_raw_direction ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass ?? false) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.mapping_type ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: compactHash(row.rule_sha256) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.row_count ?? 0) }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.status ?? "--") })
                  ] }, `b83432-map-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No trigger-source inventory rows yet." }) }) })
                ] })
              ] }),
              phaseB83432Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB83432Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b83432-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.4.3.2 versioned trigger-rule baseline report yet." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "30",
          title: "Phase B.8.3.5 - Temporal Calibration & Locked OOS Threshold Policy Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB835Audit,
              disabled: phaseB835Pending || Boolean(phaseB835JobId),
              children: [
                phaseB835Pending || phaseB835JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.5"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only temporal calibration and locked OOS threshold policy check. It uses the completed B.8.3.4 full-funnel lineage, keeps locked confirmation unopened, and leaves B.8.1 plus Phase C readiness blocked." }),
            phaseB835JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.5 job ",
                  phaseB835JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB835State ?? "queued",
                  " / ",
                  phaseB835Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB835Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB835Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB835Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB835Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.5 Failed: ",
              phaseB835Error
            ] }),
            phaseB835Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB835StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.5 remains research-only." }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Raw threshold diagnostics cannot mutate the configured live threshold. Locked confirmation remains unopened and row consumption stays at",
                  " ",
                  phaseB835Result.locked_confirmation_row_consumption_count ?? 0,
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB835Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB835Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB835Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB835Result.phase_c_readiness_decision?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mutation Proof" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB835Result.mutation_proof?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: "Prior B.6 through B.8.3.4 artifacts remain protected." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Split Proof" }),
                /* @__PURE__ */ jsx("table", { className: "w-full min-w-[760px] text-left text-xs", children: /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: [
                  ["Policy", phaseB835Result.split_policy_version],
                  ["Eligible Rows", phaseB835Result.split_proof?.eligible_row_count],
                  ["Calibration Rows", phaseB835Result.split_proof?.calibration_row_count],
                  ["Purge Rows", phaseB835Result.split_proof?.purge_row_count],
                  ["Validation Rows", phaseB835Result.split_proof?.validation_row_count],
                  [
                    "Calibration UTC",
                    `${phaseB835Result.split_proof?.calibration_start_utc ?? "--"} -> ${phaseB835Result.split_proof?.calibration_end_utc ?? "--"}`
                  ],
                  [
                    "Validation UTC",
                    `${phaseB835Result.split_proof?.validation_start_utc ?? "--"} -> ${phaseB835Result.split_proof?.validation_end_utc ?? "--"}`
                  ]
                ].map(([label, value]) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                  /* @__PURE__ */ jsx("td", { className: "w-[220px] px-3 py-2 text-muted-foreground", children: String(label) }),
                  /* @__PURE__ */ jsx("td", { className: "px-3 py-2 text-foreground", children: String(value ?? "--") })
                ] }, String(label))) }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Raw-Score Policy Metrics" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1300px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                    "Region",
                    "Setup",
                    "Threshold",
                    "Candidates",
                    "Accepted",
                    "Attempted",
                    "Opened",
                    "Closed",
                    "PF",
                    "Expect",
                    "DD",
                    "Directional",
                    "Regime",
                    "Pass"
                  ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB835RawRows.length > 0 ? phaseB835RawRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.candidate_rows ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.execution_attempt_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed_executed_trade_count ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.realistic_pf ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.realistic_expectancy ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.realistic_drawdown ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.directional_gate_result ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.regime_stability_gate_result ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.policy_passes_calibration_gates ?? "--") })
                  ] }, `b835-raw-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 14, children: "No B.8.3.5 raw policy metric rows yet." }) }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Diagnostic Calibration" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[780px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Region",
                      "Platt",
                      "Isotonic",
                      "Scores",
                      "P50",
                      "Label Rate"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB835CalibrationRows.length > 0 ? phaseB835CalibrationRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.platt_status ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.isotonic_status ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_p50 ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.positive_label_rate ?? "--") })
                    ] }, `b835-cal-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No diagnostic calibration rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Frozen Policies / Validation" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[780px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Threshold",
                      "Source",
                      "Validation",
                      "Closed",
                      "PF",
                      "Expect"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB835FrozenRows.length > 0 ? phaseB835FrozenRows.map((row, index) => {
                      const validation = phaseB835ValidationRows.find(
                        (item) => String(item.setup_family) === String(row.setup_family)
                      );
                      return /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.frozen_diagnostic_threshold ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_source ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(validation?.validation_status ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(validation?.closed_executed_trade_count ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(validation?.realistic_pf ?? "--") }),
                        /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(validation?.realistic_expectancy ?? "--") })
                      ] }, `b835-policy-${index}`);
                    }) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 7, children: "No frozen diagnostic policies. Validation cannot perform fallback search." }) }) })
                  ] })
                ] })
              ] }),
              phaseB835Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB835Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b835-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.5 temporal calibration audit report yet. Start manually after reviewing B.8.3.4." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "31",
          title: "Phase B.8.3.6 - Temporal Candidate Distribution & Gate-Failure Decomposition Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB836Audit,
              disabled: phaseB836Pending || Boolean(phaseB836JobId),
              children: [
                phaseB836Pending || phaseB836JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.6"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only temporal candidate distribution and first-failing-gate decomposition. It verifies B.8.3.4 ledger hashes before reading event ledgers, excludes outside-range rows from metrics, and keeps B.8.1 plus Phase C readiness blocked." }),
            phaseB836JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.6 job ",
                  phaseB836JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB836State ?? "queued",
                  " / ",
                  phaseB836Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB836Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB836Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB836Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB836Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.6 Failed: ",
              phaseB836Error
            ] }),
            phaseB836Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-5", children: phaseB836StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.6 remains research-only." }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Rebuilt-only lineage never proves historical root cause. Locked confirmation remains unopened with row consumption",
                  " ",
                  phaseB836Result.locked_confirmation_row_consumption_count ?? 0,
                  "."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "B.8.1 Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB836Result.b81_rerun_readiness?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB836Result.b81_rerun_readiness?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Phase C Readiness" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB836Result.phase_c_readiness_decision?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: phaseB836Result.phase_c_readiness_decision?.reason ?? "--" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Mutation Proof" }),
                  /* @__PURE__ */ jsx("div", { className: "font-mono-num text-sm font-semibold text-foreground", children: phaseB836Result.mutation_proof_status ?? phaseB836Result.mutation_proof?.status ?? "--" }),
                  /* @__PURE__ */ jsx("div", { className: "mt-2 text-muted-foreground", children: "Prior B.6 through B.8.3.5 artifacts remain protected." })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Candidate Distribution" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[1100px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Region",
                      "Threshold",
                      "Rows",
                      "Trigger",
                      "Score",
                      "Threshold",
                      "Accepted",
                      "Attempted",
                      "Opened",
                      "Closed",
                      "Excluded"
                    ].map((label, index) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, `${label}-${index}`)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB836DistributionRows.length > 0 ? phaseB836DistributionRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.candidate_rows ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_finite_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.accepted_final_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.execution_attempted_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed_executed_trade_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.excluded_from_metrics ?? false) })
                    ] }, `b836-dist-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 12, children: "No B.8.3.6 distribution rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "First-Failing-Gate Waterfall" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Region",
                      "Threshold",
                      "Gate",
                      "Reaching",
                      "Passing",
                      "Rejected",
                      "Reject Share"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB836WaterfallRows.length > 0 ? phaseB836WaterfallRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.gate ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.reaching_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.passing_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.rejected_count ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.rejected_share_of_previous ?? "--") })
                    ] }, `b836-waterfall-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 8, children: "No B.8.3.6 gate waterfall rows yet." }) }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Time Bucket Histograms" }),
                /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[840px] text-left text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Region", "Bucket Type", "Bucket", "Rows"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                  /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB836HistogramRows.length > 0 ? phaseB836HistogramRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.bucket_type ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.bucket ?? "--") }),
                    /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.candidate_rows ?? "--") })
                  ] }, `b836-hist-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 5, children: "No B.8.3.6 histogram rows yet." }) }) })
                ] })
              ] }),
              phaseB836Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB836Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b836-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.6 temporal distribution audit report yet. Start manually after reviewing B.8.3.5." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        SectionCard,
        {
          numeral: "31",
          title: "Phase B.8.3.6.1 - Trigger-Gate Provenance & Sequential Funnel Wiring Audit",
          icon: ShieldCheck,
          right: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: startPhaseB8361Audit,
              disabled: phaseB8361Pending || Boolean(phaseB8361JobId),
              children: [
                phaseB8361Pending || phaseB8361JobId ? /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, { className: "mr-2 h-4 w-4" }),
                "Start B.8.3.6.1"
              ]
            }
          ),
          children: /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit-only trigger-gate provenance and sequential funnel wiring check. It compares persisted trigger outputs against a direct replay from manifest-bound trigger provenance and keeps B.8.1 and Phase C readiness blocked." }),
            phaseB8361JobId && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/30 bg-primary/10 p-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between gap-3 text-xs", children: [
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-primary", children: [
                  "Phase B.8.3.6.1 job ",
                  phaseB8361JobId
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "font-mono-num text-muted-foreground", children: [
                  phaseB8361State ?? "queued",
                  " / ",
                  phaseB8361Progress,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsx(Progress, { value: phaseB8361Progress, className: "h-1.5" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2", children: [
                /* @__PURE__ */ jsx("span", { children: phaseB8361Stage ?? "queued" }),
                /* @__PURE__ */ jsxs("span", { className: "md:text-right", children: [
                  "heartbeat ",
                  phaseB8361Heartbeat ?? "--"
                ] })
              ] })
            ] }),
            phaseB8361Error && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200", children: [
              "Phase B.8.3.6.1 Failed: ",
              phaseB8361Error
            ] }),
            phaseB8361Result ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "grid gap-3 md:grid-cols-3 xl:grid-cols-4", children: phaseB8361StatusRows.map(([label, value]) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: "rounded-xl border border-border/40 bg-background/25 p-3",
                  children: [
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: String(label) }),
                    /* @__PURE__ */ jsx("div", { className: "mt-2 break-words font-mono-num text-sm font-semibold text-foreground", children: String(value ?? "--") })
                  ]
                },
                String(label)
              )) }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold", children: "B.8.3.6.1 is diagnostic only." }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 text-amber-100/80", children: [
                  "Trigger provenance must be manifest-bound. Current code alone is not enough to unlock B.8.3.6 source proof. Locked confirmation remains unopened with",
                  " ",
                  phaseB8361Result.locked_confirmation_row_consumption_count ?? 0,
                  " rows read."
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Trigger Rule Provenance" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB8361TriggerRows.length > 0 ? phaseB8361TriggerRows.map((row, index) => /* @__PURE__ */ jsxs("div", { children: [
                    String(row.setup_family ?? "--"),
                    ":",
                    " ",
                    String(row.trigger_rule_version ?? "--"),
                    " /",
                    " ",
                    compactHash(row.trigger_rule_sha256)
                  ] }, `b8361-rule-${index}`)) : /* @__PURE__ */ jsx("div", { children: "No trigger rule provenance rows yet." }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Replay Parity" }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB8361ParityRows.length > 0 ? phaseB8361ParityRows.map((row, index) => /* @__PURE__ */ jsxs("div", { children: [
                    String(row.setup_family ?? "--"),
                    ": persisted",
                    " ",
                    String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0),
                    " / replay2 ",
                    String(row.replay_1_vs_replay_2_trigger_mismatch_count ?? 0)
                  ] }, `b8361-parity-${index}`)) : /* @__PURE__ */ jsx("div", { children: "No replay parity rows yet." }) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Readiness" }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-muted-foreground", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono-num font-semibold text-foreground", children: phaseB8361Result.b81_rerun_readiness?.status ?? "--" }),
                      " ",
                      "B.8.1"
                    ] }),
                    /* @__PURE__ */ jsx("div", { children: phaseB8361Result.b81_rerun_readiness?.reason ?? "--" }),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("span", { className: "font-mono-num font-semibold text-foreground", children: phaseB8361Result.phase_c_readiness_decision?.status ?? "--" }),
                      " ",
                      "Phase C"
                    ] }),
                    /* @__PURE__ */ jsx("div", { children: phaseB8361Result.phase_c_readiness_decision?.reason ?? "--" })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Trigger Input Audit" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[880px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Config",
                      "Rows",
                      "Missing",
                      "Null",
                      "Inf",
                      "DType",
                      "Unexpected",
                      "Status"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8361InputRows.length > 0 ? phaseB8361InputRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.source_config_id ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_row_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_missing_column_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_null_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_inf_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_dtype_mismatch_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_default_fill_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_input_integrity_status ?? "--") })
                    ] }, `b8361-input-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 9, children: "No trigger input audit rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Sequential Funnel And First Fail" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[960px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: [
                      "Setup",
                      "Region",
                      "Raw",
                      "Trigger",
                      "Score",
                      "Threshold",
                      "Track",
                      "Regime",
                      "Session",
                      "Spread",
                      "Move",
                      "Open",
                      "Close"
                    ].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8361FunnelRows.length > 0 ? phaseB8361FunnelRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.raw_candidate ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.trigger_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.score_finite ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.threshold_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.track_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.regime_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.session_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.spread_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.move_cost_pass ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.opened ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.closed ?? 0) })
                    ] }, `b8361-funnel-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 13, children: "No sequential funnel rows yet." }) }) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid gap-3 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Persisted vs Recomputed Trigger Audit" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[760px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Persisted", "Replay 1", "Replay 2", "Mismatch", "Parity"].map(
                      (label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)
                    ) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8361ParityRows.length > 0 ? phaseB8361ParityRows.map((row, index) => /* @__PURE__ */ jsxs(
                      "tr",
                      {
                        className: "hover:bg-background/20",
                        children: [
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_trigger_pass_count ?? 0) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.recomputed_trigger_pass_count ?? 0) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.recomputed_trigger_pass_count_replay_2 ?? 0) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0) }),
                          /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.persisted_vs_recomputed_trigger_parity_status ?? "--") })
                        ]
                      },
                      `b8361-parity-table-${index}`
                    )) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No trigger parity rows yet." }) }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: [
                  /* @__PURE__ */ jsx("div", { className: "border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "First Failing Gate Waterfall" }),
                  /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[880px] text-left text-xs", children: [
                    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground", children: ["Setup", "Region", "Gate", "Reach", "Pass", "Rejected"].map((label) => /* @__PURE__ */ jsx("th", { className: "px-3 py-3 text-left", children: label }, label)) }) }),
                    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num", children: phaseB8361WaterfallRows.length > 0 ? phaseB8361WaterfallRows.map((row, index) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-background/20", children: [
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.setup_family ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.region ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.gate ?? "--") }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.reaching_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.passing_count ?? 0) }),
                      /* @__PURE__ */ jsx("td", { className: "px-3 py-2", children: String(row.rejected_count ?? 0) })
                    ] }, `b8361-waterfall-${index}`)) : /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { className: "px-3 py-3 text-muted-foreground", colSpan: 6, children: "No first-failing-gate rows yet." }) }) })
                  ] })
                ] })
              ] }),
              phaseB8361Blockers.length > 0 && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/40 bg-background/25 p-3 text-xs", children: [
                /* @__PURE__ */ jsx("div", { className: "mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground", children: "Blockers" }),
                /* @__PURE__ */ jsx("div", { className: "space-y-1 font-mono-num text-[11px] text-muted-foreground", children: phaseB8361Blockers.map((item, index) => /* @__PURE__ */ jsx("div", { children: typeof item === "object" ? JSON.stringify(item) : String(item) }, `b8361-blocker-${index}`)) })
              ] })
            ] }) : /* @__PURE__ */ jsx(DataState, { message: "No Phase B.8.3.6.1 trigger provenance report yet. Start manually after reviewing B.8.3.6." })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(SectionCard, { numeral: "32", title: "Candidate Model Registry", icon: Sparkles, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Audit and manage historical training runs stored in the candidate registry. Compare holdout metrics before promoting to the active champion model." }),
        modelStatus?.candidates && modelStatus.candidates.length > 0 ? /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border/40 bg-background/25", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs text-left border-collapse", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/30 bg-background/30 text-[10px] text-muted-foreground uppercase font-semibold", children: [
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Run ID / Created" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Holdout Accuracy" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Trade Signals" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Win Rate" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Profit Factor" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Expectancy" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-center", children: "Status" }),
            /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-border/10 font-mono-num font-medium", children: modelStatus.candidates.map((cand) => {
            const isChampion = cand.run_id === modelStatus.champion_metadata?.run_id || cand.promoted;
            return /* @__PURE__ */ jsxs(
              "tr",
              {
                className: `hover:bg-background/20 transition ${isChampion ? "bg-gradient-gold-soft/10" : ""}`,
                children: [
                  /* @__PURE__ */ jsxs("td", { className: "px-4 py-3", children: [
                    /* @__PURE__ */ jsx("div", { className: "font-bold text-foreground truncate max-w-[180px]", children: cand.run_id }),
                    /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-sans mt-0.5", children: cand.created_at || "Unavailable" })
                  ] }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center text-foreground", children: cand.metrics?.holdout?.accuracy ? `${(cand.metrics.holdout.accuracy * 100).toFixed(2)}%` : "--" }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center text-foreground", children: cand.metrics?.holdout?.trade_signals ?? "--" }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center text-foreground", children: formatNullablePercent(cand.metrics?.holdout?.backtest?.win_rate) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center text-foreground", children: formatNullableNumber(cand.metrics?.holdout?.backtest?.profit_factor) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: (cand.metrics?.holdout?.backtest?.expectancy ?? 0) >= 0 ? "text-emerald-400" : "text-red-400",
                      children: formatNullableSigned(cand.metrics?.holdout?.backtest?.expectancy)
                    }
                  ) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-center", children: isChampion ? /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 rounded text-[10px] font-sans font-bold border border-gold/25 bg-gold/10 text-gold flex items-center gap-1 justify-center max-w-[100px] mx-auto", children: [
                    /* @__PURE__ */ jsx(Crown, { className: "size-3" }),
                    " Champion"
                  ] }) : cand.eligible ? /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-sans border border-emerald-400/20 bg-emerald-400/5 text-emerald-400 max-w-[100px] mx-auto block text-center", children: "Eligible" }) : /* @__PURE__ */ jsx("span", { className: "px-2 py-0.5 rounded text-[10px] font-sans border border-border bg-background/20 text-muted-foreground max-w-[100px] mx-auto block text-center", children: "Review" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2", children: [
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        className: "h-8 rounded-lg text-xs bg-background/50 border-border hover:bg-background",
                        disabled: isChampion || !capabilities.model_promotion.allowed,
                        onClick: () => setPromoteTarget(cand),
                        children: [
                          /* @__PURE__ */ jsx(Crown, { className: "size-3.5 mr-1" }),
                          " Promote"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        className: "h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 border-border hover:border-destructive/30",
                        disabled: isChampion || rejectingCandidate,
                        onClick: () => void rejectCandidate(cand),
                        children: /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" })
                      }
                    )
                  ] }) })
                ]
              },
              cand.run_id
            );
          }) })
        ] }) }) : /* @__PURE__ */ jsx(DataState, { message: "No candidates stored in candidate model registry." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "mx-auto max-w-[1480px] border-t border-border/45 px-6 py-6 mt-12 flex justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© Aurum AI · Retraining & Audit Terminal" }),
      /* @__PURE__ */ jsx("span", { children: "Version 1.4.0 (Model Office)" })
    ] }),
    /* @__PURE__ */ jsx(
      AlertDialog,
      {
        open: Boolean(promoteTarget),
        onOpenChange: (open) => !open && setPromoteTarget(null),
        children: /* @__PURE__ */ jsxs(AlertDialogContent, { className: "glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] text-foreground", children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { className: "font-serif", children: "Promote candidate to Champion?" }),
            /* @__PURE__ */ jsxs(AlertDialogDescription, { className: "text-muted-foreground text-sm", children: [
              "This replaces the active champion model with candidate model (",
              promoteTarget?.run_id,
              "). This action is immediate and will apply to all live predictions going forward."
            ] })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(
              AlertDialogCancel,
              {
                disabled: promoting,
                className: "bg-background/40 hover:bg-background/80",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              AlertDialogAction,
              {
                disabled: promoting || !capabilities.model_promotion.allowed,
                onClick: () => void promoteCandidate(),
                className: "bg-gradient-gold hover:opacity-90 text-background font-semibold",
                children: promoting ? "Promoting..." : "Promote to Champion"
              }
            )
          ] })
        ] })
      }
    )
  ] });
}
const $$splitComponentImporter = () => import("./index-u41qXEd3.js");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Aurum AI — Premium XAUUSD Trading Terminal"
    }, {
      name: "description",
      content: "Institutional-grade autonomous gold trading terminal powered by AI."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TrainRoute = Route$1.update({
  id: "/train",
  path: "/train",
  getParentRoute: () => Route$2
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$2
});
const rootRouteChildren = {
  IndexRoute,
  TrainRoute
};
const routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  API_V1_BASE as A,
  Button as B,
  Progress as P,
  formatSigned as a,
  AlertDialog as b,
  cn as c,
  AlertDialogContent as d,
  AlertDialogHeader as e,
  formatCurrency as f,
  AlertDialogTitle as g,
  AlertDialogDescription as h,
  AlertDialogFooter as i,
  AlertDialogCancel as j,
  AlertDialogAction as k,
  formatPrice as l,
  router as r,
  useCapabilities as u
};
