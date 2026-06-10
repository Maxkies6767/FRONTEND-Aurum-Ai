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
  Trash2,
  ArrowLeft,
  Settings,
  Flame,
  type LucideIcon,
} from "lucide-react";
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
import { useCapabilities } from "@/hooks/use-capabilities";
import { API_V1_BASE } from "@/lib/api-config";
import { formatCurrency, formatPrice, formatSigned, type Trade } from "@/lib/dashboard-data";

export const Route = createFileRoute("/train")({
  head: () => ({
    meta: [
      { title: "Aurum AI — Office Retrainer Terminal" },
      {
        name: "description",
        content: "Dedicated institutional AI model training and evaluation office.",
      },
    ],
  }),
  component: TrainPage,
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
    symbol: string;
    timeframe: string;
  };
  account: {
    balance: number;
    equity: number;
    daily_pnl: number;
  };
  market: {
    symbol: string;
    bid: number;
    ask: number;
    spread: number;
  };
  ticker_feeds?: Record<
    string,
    { price: string; change: string; up: boolean; source: string }
  > | null;
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
        avg_spread?: number;
        max_spread?: number;
        avg_confidence?: number;
        min_confidence?: number;
        rejection_trace?: Array<{
          idx: number;
          trend_score?: number;
          entry_score?: number;
          confidence?: number;
          spread?: number;
          rejection_reason?: string;
        }>;
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
  pipeline_audit?: PipelineAudit;
  metric_sanity_audit?: Array<{ path: string; message: string }>;
  ensemble?: Record<string, string>;
  promotion_checks?: Record<string, boolean>;
  feature_importance?: Array<{
    feature: string;
    importance: number;
    model?: string;
  }>;
}

interface PipelineAudit {
  requested_anchor_count?: number;
  requested_m5_candles?: number;
  raw_candles?: number;
  received_m5_candles?: number;
  required_m1_candles?: number;
  received_m1_candles?: number;
  received_m15_candles?: number;
  received_h1_candles?: number;
  rows_after_feature_engineering?: number;
  rows_after_labeling?: number;
  warmup_rows_dropped?: number;
  clean_rows?: number;
  clean_row_retention_pct?: number;
  training_rows?: number;
  validation_rows?: number;
  purged_lookahead_gap_rows?: number;
  holdout_rows?: number;
  final_evaluated_rows?: number;
  max_lookahead_rows?: number;
  explanation?: string;
}

interface ThresholdSweepRow {
  rank: number;
  trend_threshold: number;
  entry_threshold: number;
  confidence_threshold: number;
  risk_threshold: number;
  max_spread_pips: number;
  signals: number;
  buy_signals: number;
  sell_signals: number;
  win_rate: number | null;
  profit_factor: number | null;
  expectancy: number | null;
  average_rr: number | null;
  total_return: number;
  max_drawdown: number;
  trade_precision?: number | null;
  buy_sell_balance: number;
  shortlisted: boolean;
  total_trades?: number;
  gross_profit?: number | null;
  gross_loss?: number | null;
  wins?: number;
  losses?: number;
  breakeven_trades?: number;
  profit_factor_display?: string;
  profit_factor_is_infinite?: boolean;
  cost_totals?: Record<string, number>;
  quality_gates: Record<string, boolean>;
}

interface WalkForwardSweepSet {
  rank: number;
  trend_threshold: number;
  entry_threshold: number;
  confidence_threshold: number;
  aggregate: {
    signals: number;
    win_rate: number | null;
    profit_factor: number | null;
    expectancy: number | null;
    average_rr: number | null;
    total_return: number;
    max_drawdown: number;
  };
  periods: Array<{
    period: number;
    rows: number;
    signals: number;
    buy_signals: number;
    sell_signals: number;
    win_rate: number | null;
    profit_factor: number | null;
    expectancy: number | null;
    average_rr: number | null;
    total_return: number;
    max_drawdown: number;
  }>;
}

interface ThresholdSweepResponse {
  candidate_id: string;
  generated_at: string;
  combo_count: number;
  pipeline_audit?: PipelineAudit;
  leakage_audit?: {
    status?: string;
    checks?: Record<string, boolean>;
    notes?: string[];
  };
  leaderboard: ThresholdSweepRow[];
  shortlist: ThresholdSweepRow[];
  parity_audit?: {
    status?: string;
    differences?: Array<{
      metric?: string;
      left?: unknown;
      right?: unknown;
    }>;
    metric_paths?: string[];
  };
  segmented_holdout_stability_check?: WalkForwardSweepSet[];
  walk_forward_scaffold: WalkForwardSweepSet[];
}

interface PhaseALabelConfig {
  barrier_mode: string;
  rr_multiplier: number;
  sl_atr_multiplier?: number | null;
  lookahead: number;
  min_net_edge_cost_multiplier: number;
  feature_set: string;
  session_filter?: string;
}

interface PhaseAExperimentRow {
  rank?: number;
  experiment_id: string;
  phase: string;
  label_mode: string;
  feature_set: string;
  label_config: PhaseALabelConfig;
  signals: number;
  wins: number;
  losses: number;
  winrate: number | null;
  profit_factor: number | null;
  expectancy: number | null;
  average_rr: number | null;
  gross_profit: number;
  gross_loss: number;
  total_costs: number;
  net_pnl: number;
  gross_pnl_r?: number;
  net_pnl_r?: number;
  expectancy_r?: number | null;
  average_cost_per_trade_r?: number | null;
  average_winning_trade_r?: number | null;
  average_losing_trade_r?: number | null;
  average_trade_move_pips?: number | null;
  average_round_trip_cost_pips?: number | null;
  max_drawdown: number;
  fold_stability: boolean;
  worst_fold_pf: number | null;
  worst_fold_dd: number;
  eligibility_status: string;
  eligible_for_phase_b: boolean;
  rejection_reason: string;
}

interface PhaseAExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  quick_mode?: boolean;
  matrix_used?: PhaseALabelConfig[];
  leaderboard: PhaseAExperimentRow[];
  top_10?: PhaseAExperimentRow[];
  best_label_config?: PhaseALabelConfig | null;
  best_walk_forward_metrics?: Record<string, unknown> | null;
  qualifies_for_phase_b?: boolean;
  failures?: Array<{ experiment_id?: string; error?: string }>;
}

interface BrokerEconomics {
  status?: string;
  symbol?: string;
  digits?: number;
  point?: number;
  tick_size?: number;
  tick_value?: number;
  contract_size?: number;
  volume_min?: number;
  volume_step?: number;
  configured_lot?: number;
  account_currency?: string;
  spread_points?: number;
  spread_pips?: number;
  commission_per_side_per_lot?: number;
  round_trip_commission_per_lot?: number;
  slippage_pips?: number;
  estimated_round_trip_cost_by_lot?: Record<
    string,
    {
      lot: number;
      spread_usd: number;
      slippage_usd: number;
      commission_usd: number;
      total_usd: number;
      total_pips: number;
    }
  >;
  error?: string;
}

interface ShadowBacktestProfile {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  profit_factor: number | null;
  expectancy: number | null;
  gross_profit: number;
  gross_loss: number;
  net_pnl: number;
  max_drawdown: number;
  average_rr: number | null;
  cost_totals?: { total?: number };
  r_metrics?: {
    expectancy_r?: number | null;
    net_pnl_r?: number | null;
    average_cost_per_trade_r?: number | null;
  };
}

interface PhaseA1ExperimentRow extends PhaseAExperimentRow {
  status?: string;
  session_filter?: string;
  shadow_cost_backtest?: {
    diagnostic_conclusion?: string;
    profiles?: Record<string, ShadowBacktestProfile>;
  };
  failure_attribution?: Record<
    string,
    Array<{
      bucket: string;
      signals: number;
      winrate: number | null;
      profit_factor: number | null;
      expectancy: number | null;
      costs: number;
      net_pnl: number;
    }>
  >;
  model_quality_diagnostics?: Record<string, unknown>;
  phase_b_readiness_checks?: Record<string, boolean>;
}

interface PhaseA1ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  quick_mode?: boolean;
  broker_economics?: BrokerEconomics;
  cost_audit?: { status?: string; broker_economics?: BrokerEconomics };
  matrix_used?: PhaseALabelConfig[];
  leaderboard: PhaseA1ExperimentRow[];
  top_10?: PhaseA1ExperimentRow[];
  best_label_config?: PhaseALabelConfig | null;
  best_shadow_conclusion?: string | null;
  best_walk_forward_metrics?: Record<string, unknown> | null;
  phase_b_candidates?: PhaseA1ExperimentRow[];
  phase_b_readiness_decision?: { status?: string; selected_count?: number; reason?: string };
  qualifies_for_phase_b?: boolean;
}

interface PhaseBExperimentRow {
  rank?: number;
  experiment_id: string;
  phase?: string;
  status?: string;
  feature_set: string;
  feature_set_label?: string;
  feature_count?: number;
  session_filter?: string;
  quality_gate?: {
    min_move_cost_ratio?: number;
    max_spread_pips?: number;
    allowed_sessions?: string[];
  } | null;
  quality_config?: {
    name?: string;
    min_move_cost_ratio?: number;
    max_spread_pips?: number;
    session_filter?: string;
    cooldown_bars?: number;
  };
  signals?: number;
  total_trades?: number;
  wins?: number;
  losses?: number;
  winrate?: number | null;
  profit_factor?: number | null;
  expectancy?: number | null;
  expectancy_r?: number | null;
  gross_profit?: number;
  gross_loss?: number;
  total_costs?: number;
  net_pnl?: number;
  max_drawdown?: number;
  worst_fold_pf?: number | null;
  worst_fold_dd?: number;
  fold_stability?: boolean;
  buy_signals?: number;
  sell_signals?: number;
  shadow_cost_backtest?: {
    diagnostic_conclusion?: string;
    profiles?: Record<string, ShadowBacktestProfile>;
  };
  full_execution_replay?: {
    diagnostic_conclusion?: string;
    profiles?: Record<string, ShadowBacktestProfile>;
  };
  fixed_trade_shadow_cost?: {
    mode?: string;
    profiles?: Record<string, ShadowBacktestProfile>;
    ledger?: Array<Record<string, unknown>>;
    monotonicity?: {
      status?: string;
      invariant?: string;
      trade_violations?: Array<Record<string, unknown>>;
      aggregate_violations?: Array<Record<string, unknown>>;
    };
  } | null;
  fixed_shadow_monotonicity?: {
    status?: string;
    invariant?: string;
    trade_violations?: Array<Record<string, unknown>>;
    aggregate_violations?: Array<Record<string, unknown>>;
  } | null;
  orthogonal_label?: string;
  delta_vs_full_b5?: Record<string, number>;
  eligible_for_phase_c?: boolean;
  eligibility_status?: string;
  rejection_reason?: string;
  phase_c_readiness_checks?: Record<string, boolean>;
  rolling_wf_expansion?: Record<string, unknown>;
  freeze_candidate?: boolean;
  freeze_reason?: string;
  freeze_checks?: Record<string, boolean>;
  date_ranges?: Record<string, unknown>;
  track?: string;
  regime_filter?: string;
  research_split_side_entry_models?: boolean;
  directional_bias_audit?: {
    classification?: string;
    buy_signals?: number;
    sell_signals?: number;
    buy_ratio?: number;
    sell_ratio?: number;
    buy_pf?: number | null;
    sell_pf?: number | null;
    buy_expectancy?: number | null;
    sell_expectancy?: number | null;
    buy_fold_stability?: number | null;
    sell_fold_stability?: number | null;
    side_concentration_warning?: boolean;
  };
  fold_attribution_dashboard?: Array<Record<string, unknown>>;
  drift_diagnostics?: Record<string, unknown>;
  regime_attribution?: Array<Record<string, unknown>>;
  track_summary?: Record<string, unknown>;
}

interface PhaseBContributionRow {
  feature_set: string;
  added_group: string;
  classification: "BASELINE" | "HELPS" | "NEUTRAL" | "HURTS" | "UNSTABLE" | string;
  delta_signals: number;
  delta_realistic_pf: number;
  delta_expectancy: number;
  delta_max_dd: number;
  delta_costs: number;
  delta_net_pnl: number;
  delta_worst_fold_pf: number;
}

interface PhaseBExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  quick_mode?: boolean;
  locked_baseline?: PhaseALabelConfig;
  broker_economics?: BrokerEconomics;
  cost_audit?: { status?: string; broker_economics?: BrokerEconomics };
  feature_ablation?: {
    leaderboard: PhaseBExperimentRow[];
    top_10?: PhaseBExperimentRow[];
    contribution_summary?: PhaseBContributionRow[];
    best_feature_set?: string;
    best_feature_set_label?: string;
  };
  trade_quality?: {
    matrix_used?: Array<Record<string, unknown>>;
    leaderboard: PhaseBExperimentRow[];
    top_10?: PhaseBExperimentRow[];
    best_config?: PhaseBExperimentRow | null;
  };
  phase_c_candidates?: PhaseBExperimentRow[];
  phase_c_readiness_decision?: { status?: string; selected_count?: number; reason?: string };
  qualifies_for_phase_c?: boolean;
}

interface PhaseB3ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  quick_mode?: boolean;
  locked_baseline?: PhaseALabelConfig;
  broker_economics?: BrokerEconomics;
  cost_audit?: { status?: string; broker_economics?: BrokerEconomics };
  shadow_cost_integrity?: Record<string, string>;
  orthogonal_ablation?: {
    leaderboard: PhaseBExperimentRow[];
    top_10?: PhaseBExperimentRow[];
    best_feature_set?: string;
    best_feature_set_label?: string;
  };
  neighborhood_robustness?: {
    matrix_used?: Array<Record<string, unknown>>;
    leaderboard: PhaseBExperimentRow[];
    top_10?: PhaseBExperimentRow[];
    summary?: {
      completed_runs?: number;
      profitable_neighbor_percentage?: number;
      median_pf?: number | null;
      median_expectancy?: number | null;
      pf_standard_deviation?: number;
      expectancy_standard_deviation?: number;
      worst_neighbor_pf?: number | null;
      best_fold_contribution_pct?: number | null;
      classification?: string;
    };
  };
  rolling_wf_expansion_summary?: Record<string, unknown>;
  phase_c_readiness_decision?: {
    status?: string;
    selected_count?: number;
    reason?: string;
    checks?: Record<string, boolean>;
  };
  m1_history_warning?: string | null;
  qualifies_for_phase_c?: boolean;
}

interface PhaseB4FrozenConfig {
  experiment_id?: string;
  frozen_config_hash?: string;
  frozen_config_manifest?: Record<string, unknown>;
  discovery?: Record<string, unknown>;
  confirmation?: {
    date_range?: { start?: string | null; end?: string | null };
    signals?: number;
    total_trades?: number;
    wins?: number;
    losses?: number;
    winrate?: number | null;
    profit_factor?: number | null;
    expectancy?: number | null;
    expectancy_r?: number | null;
    net_pnl?: number | null;
    total_costs?: number | null;
    max_drawdown?: number | null;
    buy_signals?: number;
    sell_signals?: number;
    fixed_shadow_monotonicity?: { status?: string };
    full_execution_replay?: {
      profiles?: Record<string, ShadowBacktestProfile>;
    };
  };
  robustness_classification?: string;
  phase_c_ready?: boolean;
  phase_c_reason?: string;
  phase_c_checks?: Record<string, boolean>;
}

interface PhaseB4ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  quick_mode?: boolean;
  locked_baseline?: PhaseALabelConfig;
  counts?: Record<string, number>;
  dataset_expansion_audit?: {
    requested_counts?: Record<string, number>;
    fetch_audit?: Record<string, { requested?: number; received?: number }>;
    received_complete?: boolean;
    required_m1_for_requested_m5?: number;
    dataset_rows?: number;
    time_range?: { start?: string | null; end?: string | null };
  };
  curated_matrix_manifest?: {
    declared_before_evaluation?: boolean;
    matrix_hash?: string;
    matrix_used?: Array<Record<string, unknown>>;
  };
  discovery_matrix?: {
    leaderboard: PhaseBExperimentRow[];
    top_10?: PhaseBExperimentRow[];
    robustness_summary?: {
      completed_runs?: number;
      profitable_neighbor_percentage?: number;
      median_pf?: number | null;
      median_expectancy?: number | null;
      pf_standard_deviation?: number;
      expectancy_standard_deviation?: number;
      worst_neighbor_pf?: number | null;
      best_fold_contribution_pct?: number | null;
      classification?: string;
    };
  };
  frozen_configs?: PhaseB4FrozenConfig[];
  freeze_rejected_top_3?: PhaseBExperimentRow[];
  confirmation_replay?: {
    leaderboard?: PhaseB4FrozenConfig[];
    top_3?: PhaseB4FrozenConfig[];
  };
  total_oos_signals?: number;
  phase_c_readiness_decision?: {
    status?: string;
    selected_count?: number;
    reason?: string;
    checks?: Record<string, boolean>;
  };
  qualifies_for_phase_c?: boolean;
}

interface PhaseB5ConfirmationRow {
  experiment_id?: string;
  frozen_config_hash?: string;
  discovery?: Record<string, unknown>;
  confirmation?: {
    signals?: number;
    profit_factor?: number | null;
    expectancy?: number | null;
    net_pnl?: number | null;
    max_drawdown?: number | null;
    buy_signals?: number;
    sell_signals?: number;
  };
  directional_bias_classification?: string;
  phase_c_ready?: boolean;
  phase_c_reason?: string;
  phase_c_checks?: Record<string, boolean>;
}

interface PhaseB5ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  quick_mode?: boolean;
  counts?: Record<string, number>;
  historical_depth_warning?: string;
  dataset_expansion_audit?: {
    requested_counts?: Record<string, number>;
    fetch_audit?: Record<string, { requested?: number; received?: number }>;
    received_complete?: boolean;
    required_m1_for_requested_m5?: number;
    dataset_rows?: number;
    time_range?: { start?: string | null; end?: string | null };
  };
  curated_matrix_manifest?: {
    declared_before_evaluation?: boolean;
    matrix_hash?: string;
    matrix_used?: Array<Record<string, unknown>>;
  };
  directional_bias_overview?: PhaseBExperimentRow["directional_bias_audit"];
  side_specific_tracks?: {
    leaderboard?: Array<Record<string, unknown>>;
    by_track?: Record<string, Array<Record<string, unknown>>>;
  };
  fold_attribution_dashboard?: Array<Record<string, unknown>>;
  drift_diagnostics?: Record<string, unknown>;
  regime_attribution?: Array<Record<string, unknown>>;
  label_horizon_repair?: {
    leaderboard?: PhaseBExperimentRow[];
    top_10?: PhaseBExperimentRow[];
  };
  discovery_matrix?: {
    leaderboard: PhaseBExperimentRow[];
    top_10?: PhaseBExperimentRow[];
    robustness_summary?: Record<string, unknown>;
  };
  frozen_configs?: PhaseB5ConfirmationRow[];
  freeze_rejected_top_3?: PhaseBExperimentRow[];
  confirmation_replay?: {
    leaderboard?: PhaseB5ConfirmationRow[];
    top_3?: PhaseB5ConfirmationRow[];
  };
  phase_c_readiness_decision?: {
    status?: string;
    selected_count?: number;
    reason?: string;
    checks?: Record<string, boolean>;
  };
  qualifies_for_phase_c?: boolean;
}

interface PhaseB51ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  quick_mode?: boolean;
  counts?: Record<string, number>;
  audited_config?: Record<string, unknown>;
  best_config_audit?: Record<string, unknown>;
  count_funnel?: Record<string, number>;
  count_reconciliation?: {
    status?: string;
    mismatches?: Array<Record<string, unknown>>;
    invariants?: Record<string, boolean>;
  };
  fold_count_table?: Array<Record<string, unknown>>;
  regime_count_table?: Array<Record<string, unknown>>;
  metric_source?: Record<string, unknown>;
  track_semantics?: Record<string, unknown>;
  freeze_gate?: {
    status?: string;
    eligible_for_locked_confirmation?: boolean;
    checks?: Record<string, boolean>;
    failure_reasons?: string[];
    metric_basis?: string;
  };
  fold_concentration?: Record<string, unknown>;
  drift_warning?: {
    status?: string;
    message?: string;
    severe_rows?: Array<Record<string, unknown>>;
    strong_rows?: Array<Record<string, unknown>>;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
}

interface PhaseB52ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  snapshot_manifest?: {
    snapshot_id?: string;
    generated_at?: string;
    source_symbol?: string;
    broker_symbol?: string;
    timeframes?: Record<
      string,
      { rows?: number; first_time?: string | null; last_time?: string | null; sha256?: string }
    >;
    combined_dataset_hash?: string;
    combined_dataset_rows?: number;
    random_seed?: number;
    broker_digits?: number;
    point_size?: number;
  };
  deterministic_replay?: {
    status?: string;
    mismatches?: Array<Record<string, unknown>>;
    replay_1?: Record<string, unknown>;
    replay_2?: Record<string, unknown>;
  };
  previous_count_difference?: {
    status?: string;
    classification?: string;
    details?: string;
    old_b5?: Record<string, unknown>;
    corrected_b51_latest?: Record<string, unknown>;
    current_b52_replay?: Record<string, unknown>;
  };
  execution_density_funnel?: Record<string, number>;
  execution_density_metrics?: Record<string, number | null>;
  fold_density_table?: Array<Record<string, unknown>>;
  density_matrix?: {
    leaderboard?: Array<Record<string, unknown>>;
    top_10?: Array<Record<string, unknown>>;
  };
  legacy_research_warning?: {
    label?: string;
    message?: string;
  };
  next_step_recommendation?: string;
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
}

interface PhaseB6ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  history_status?: {
    status?: string;
    required_minimums?: Record<string, number>;
    requested?: Record<string, number>;
    received?: Record<string, number>;
    timeframes?: Record<
      string,
      {
        requested?: number;
        received?: number;
        missing?: number;
        status?: string;
        timeframe_minutes?: number;
      }
    >;
    missing_timeframes?: string[];
    rule?: string;
  };
  requested_history_counts?: Record<string, number>;
  received_history_counts?: Record<string, number>;
  snapshot_manifest?: PhaseB52ExperimentResponse["snapshot_manifest"];
  chronological_split_timeline?: {
    split?: string;
    rules?: string[];
    regions?: Record<
      string,
      { rows?: number; date_range?: Record<string, unknown>; row_fraction?: number }
    >;
  };
  curated_matrix_manifest?: {
    declared_before_evaluation?: boolean;
    matrix_hash?: string;
    matrix_used?: Array<Record<string, unknown>>;
    rules?: string[];
  };
  execution_density_leaderboard?: Array<Record<string, unknown>>;
  label_horizon_leaderboard?: Array<Record<string, unknown>>;
  frozen_configs?: Array<Record<string, unknown>>;
  frozen_manifest?: Record<string, unknown>;
  locked_confirmation_replay?: {
    leaderboard?: Array<Record<string, unknown>>;
    results?: Array<Record<string, unknown>>;
    passed?: Array<Record<string, unknown>>;
  };
  next_step_recommendation?: string;
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
    checks?: Record<string, boolean>;
    failure_reasons?: string[];
  };
}

interface PhaseB7ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_b6_batch_id?: string;
  source_snapshot_id?: string;
  snapshot_integrity?: {
    status?: string;
    snapshot_id?: string;
    combined_dataset_hash?: string;
    locked_confirmation_state?: string;
    timeframes?: Record<
      string,
      {
        requested?: number;
        rows?: number;
        first_time?: string;
        last_time?: string;
        sha256?: string;
        row_count_matches_requested?: boolean;
        hash_matches_manifest?: boolean;
        chronological?: boolean;
        duplicate_timestamps?: number;
      }
    >;
    checks?: Record<string, boolean>;
    validation_result?: string;
    source_note?: string;
  };
  cost_decomposition?: {
    basis?: string;
    invariant?: string;
    leaderboard?: Array<Record<string, unknown>>;
  };
  directional_decomposition?: {
    tracks?: Array<Record<string, unknown>>;
  };
  regime_attribution?: Array<Record<string, unknown>>;
  orthogonal_ablation?: {
    matrix_declared?: Array<Record<string, unknown>>;
    leaderboard?: Array<Record<string, unknown>>;
    locked_confirmation_used?: boolean;
  };
  meta_label_repair?: {
    matrix_declared?: Array<Record<string, unknown>>;
    leaderboard?: Array<Record<string, unknown>>;
    broad_parameter_optimization?: boolean;
  };
  discovery_freeze_gate?: {
    leaderboard?: Array<Record<string, unknown>>;
    frozen_configs?: Array<Record<string, unknown>>;
    frozen_config_count?: number;
    status?: string;
  };
  locked_confirmation?: {
    state?: string;
    reason?: string;
    leaderboard?: Array<Record<string, unknown>>;
    results?: Array<Record<string, unknown>>;
  };
  locked_confirmation_replay?: {
    state?: string;
    reason?: string;
    leaderboard?: Array<Record<string, unknown>>;
    results?: Array<Record<string, unknown>>;
  };
  failure_classification?: {
    primary?: string;
    contributors?: string[];
    best_realistic_pf?: number;
    best_expectancy?: number;
  };
  next_step_recommendation?: string;
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
}

interface PhaseB8ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_b6_batch_id?: string;
  source_b7_batch_id?: string;
  source_snapshot_id?: string;
  source_limitations?: string[];
  snapshot_integrity?: PhaseB7ExperimentResponse["snapshot_integrity"];
  setup_family_definitions?: Array<Record<string, unknown>>;
  gross_edge_leaderboard?: Array<Record<string, unknown>>;
  cost_decomposition?: {
    basis?: string;
    invariant?: string;
    leaderboard?: Array<Record<string, unknown>>;
  };
  fold_attribution?: Array<Record<string, unknown>>;
  drift_diagnostics?: Array<Record<string, unknown>>;
  ml_value_add?: {
    status?: string;
    model_policy?: string;
    leaderboard?: Array<Record<string, unknown>>;
  };
  discovery_freeze_gate?: {
    status?: string;
    frozen_config_count?: number;
    frozen_configs?: Array<Record<string, unknown>>;
  };
  locked_confirmation?: {
    state?: string;
    reason?: string;
    leaderboard?: Array<Record<string, unknown>>;
    results?: Array<Record<string, unknown>>;
  };
  failure_classification?: {
    primary?: string;
    counts?: Record<string, number>;
    eligible_for_ml_value_add?: number;
  };
  next_step_recommendation?: string;
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
}

interface PhaseB81ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_phase?: string;
  source_b6_batch_id?: string;
  source_b8_batch_id?: string;
  source_snapshot_id?: string;
  mt5_refetch_performed?: boolean;
  history_rebuild_performed?: boolean;
  setup_family_definitions?: Array<Record<string, unknown>>;
  snapshot_integrity?: PhaseB7ExperimentResponse["snapshot_integrity"];
  replay_source_preflight?: {
    status?: string;
    reason?: string;
    mt5_refetch_performed?: boolean;
    history_rebuild_performed?: boolean;
    partial_phase_b6_research_run?: boolean;
    existing_paths?: string[];
    checked_paths?: string[];
  };
  snapshot_evaluator_integrity?: {
    status?: string;
    count_reconciliation?: {
      status?: string;
      checks?: Record<string, boolean>;
      expected_families?: string[];
      declared_families?: string[];
      leaderboard_families?: string[];
    };
  };
  trade_accounting_integrity?: {
    status?: string;
    checks?: Array<Record<string, unknown>>;
    assumptions?: Record<string, unknown>;
  };
  directionality_shadow_replay?: {
    status?: string;
    shadow_modes?: string[];
    deterministic_seed?: number;
    mechanics_checks?: Array<Record<string, unknown>>;
    reason?: string;
  };
  realized_payoff_audit?: {
    status?: string;
    metric_basis?: string;
    leaderboard?: Array<Record<string, unknown>>;
  };
  fold_regime_decomposition?: {
    status?: string;
    fold_rows?: Array<Record<string, unknown>>;
    drift_rows?: Array<Record<string, unknown>>;
  };
  event_level_ledger_export?: {
    status?: string;
    format?: string[];
    sample_trades_per_family?: number;
    family_ledgers?: Array<Record<string, unknown>>;
    reason?: string;
  };
  conclusion?: string;
  conclusion_detail?: {
    conclusion?: string;
    reason?: string;
    allowed_values?: string[];
  };
  locked_confirmation?: {
    state?: string;
    reason?: string;
    leaderboard?: Array<Record<string, unknown>>;
    results?: Array<Record<string, unknown>>;
  };
  next_step_recommendation?: string;
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
}

interface PhaseB82ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_b6_batch_id?: string;
  source_b8_batch_id?: string;
  source_snapshot_id?: string;
  lineage_id?: string;
  reconstruction_status?: string;
  classification?: string;
  raw_hash_compatibility_status?: string;
  raw_reconstruction_status?: string;
  combined_feature_hash_status?: string;
  ledger_generation_status?: string;
  ledger_reconciliation_status?: string;
  deterministic_replay_meaningful?: boolean;
  exact_reconstruction?: boolean;
  rebase_required?: boolean;
  new_research_baseline?: boolean;
  mismatch_reasons?: string[];
  missing_replay_requirements?: Array<Record<string, unknown>>;
  unresolved_source_configs?: Array<Record<string, unknown>>;
  blocked_setup_families?: string[];
  readiness_blockers?: string[];
  per_family_funnel?: Array<Record<string, unknown>>;
  raw_hash_compatibility?: {
    raw_hash_compatibility_status?: string;
    raw_reconstruction_status?: string;
    timeframes?: Record<string, Record<string, unknown>>;
  };
  combined_feature_hash_audit?: Record<string, unknown>;
  timestamp_normalization?: string;
  closed_bars_only?: boolean;
  expected_b6_hashes?: Record<string, unknown>;
  actual_b82_hashes?: Record<string, unknown>;
  original_first_last_timestamps?: Record<string, Record<string, unknown>>;
  actual_first_last_timestamps?: Record<string, Record<string, unknown>>;
  sidecar_directory?: string | null;
  sidecar_manifest_path?: string | null;
  candidate_ledger_path?: string | null;
  trade_ledger_path?: string | null;
  deterministic_replay?: {
    status?: string;
    mismatch_count?: number | null;
  };
  ledger_reconciliation?: {
    status?: string;
    candidate_rows?: number;
    accepted_candidates?: number;
    trade_rows?: number;
    closed_executed_trades?: number;
    checks?: Record<string, boolean>;
  };
  disk_space_preflight?: {
    status?: string;
    free_bytes?: number;
    estimated_sidecar_bytes?: number;
    required_bytes?: number;
  };
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
    replayable_raw_rows_exist?: boolean;
    candidate_ledger_exists?: boolean;
    trade_ledger_exists?: boolean;
    deterministic_replay_mismatch_count?: number | null;
    deterministic_replay_meaningful?: boolean;
    reconciliation_status?: string;
    sidecar_lineage_valid?: boolean;
    blockers?: string[];
  };
  research_rerun_required_for_new_baseline?: string[];
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  locked_confirmation?: {
    state?: string;
    reason?: string;
  };
}

interface PhaseB83ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  legacy_replay_availability_status?: string;
  replay_branch_selected?: string;
  raw_reconstruction_status?: string;
  combined_feature_reconstruction_status?: string;
  feature_schema_status?: string;
  model_artifact_status?: string;
  prediction_payload_status?: string;
  trigger_config_status?: string;
  ledger_generation_status?: string;
  ledger_reconciliation_status?: string;
  deterministic_replay_meaningful?: boolean;
  per_family_funnel_reconciliation_status?: string;
  legacy_lineage_validity?: string;
  new_lineage_id?: string | null;
  new_baseline_status?: string;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  blockers?: Array<string | Record<string, unknown>>;
  missing_replay_requirements?: Array<Record<string, unknown>>;
  unresolved_source_configs?: Array<Record<string, unknown>>;
  artifact_paths?: Record<string, unknown>;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  per_family_funnel?: Array<Record<string, unknown>>;
  deterministic_replay?: {
    status?: string;
    mismatch_count?: number | null;
    feature_hash_pass_1?: string;
    feature_hash_pass_2?: string;
    candidate_hash_pass_1?: string;
    candidate_hash_pass_2?: string;
    trade_hash_pass_1?: string;
    trade_hash_pass_2?: string;
  };
}

interface PhaseB831ExperimentResponse {
  status?: string;
  message?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  audit_lineage_scope?: string;
  exact_b83_payload_available?: boolean;
  historical_root_cause_proven?: boolean;
  recreated_symptom_matches_b83?: boolean;
  source_config_provenance?: Array<Record<string, unknown>> | Record<string, unknown>;
  source_threshold_provenance?: Record<string, unknown>;
  model_payload_hashes?: Record<string, string | null>;
  prediction_payload_hashes?: Record<string, string | null>;
  feature_schema_hash?: string | null;
  code_path_hash_or_version?: string | null;
  random_seed?: number;
  deterministic_rebuild_replay_count?: number;
  deterministic_rebuild_mismatch_count?: number | null;
  threshold_audit_status?: string;
  prediction_distribution_status?: string;
  score_scale_status?: string;
  threshold_schema_status?: string;
  trigger_evaluation_status?: string;
  candidate_ledger_status?: string;
  trade_ledger_status?: string;
  deterministic_replay_meaningful?: boolean;
  per_family_funnel_reconciliation_status?: string;
  root_cause_classification?: string;
  blockers?: Array<string | Record<string, unknown>>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  per_family_funnel?: Array<Record<string, unknown>>;
  artifact_paths?: Record<string, unknown>;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  missing_exact_b83_payload_requirements?: string[];
  candidate_audit_rows?: number;
  trade_ledger_rows?: number;
  total_threshold_pass_count?: number;
  total_accepted_count?: number;
}

interface PhaseB832ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  lineage_scope?: string;
  source_b831_batch_id?: string | null;
  diagnostic_label?: string;
  deterministic_audit_replay_count?: number;
  deterministic_audit_mismatch_count?: number | null;
  output_mapping_status?: string;
  probability_transform_status?: string;
  feature_schema_status?: string;
  label_balance_classification?: string;
  score_compression_classification?: string;
  calibration_status?: string;
  root_cause_classification?: string;
  blockers?: Array<string | Record<string, unknown>>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  per_family_score_quantiles?: Array<Record<string, unknown>>;
  per_family_calibration_bins?: Array<Record<string, unknown>>;
  threshold_sensitivity?: Array<Record<string, unknown>>;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB833ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  audit_lineage_scope?: string;
  exact_b831_inference_matrix_available?: boolean;
  historical_root_cause_proven?: boolean;
  rebuilt_lineage_diagnostic_only?: boolean;
  actual_historical_inference_matrix_status?: string;
  rebuilt_inference_matrix_status?: string;
  sidecar_publish_status?: string;
  causal_feature_proof_status?: string;
  schema_artifact_status?: string;
  actual_inference_matrix_status?: string;
  canonical_alignment_status?: string;
  prediction_effect_status?: string;
  repair_status?: string;
  schema_parity_status?: string;
  mismatch_classification?: string;
  configured_threshold?: number;
  deterministic_rebuild_replay_count?: number;
  deterministic_rebuild_mismatch_count?: number | null;
  per_family_schema_audit?: Array<Record<string, unknown>>;
  before_after_score_quantiles?: Array<Record<string, unknown>>;
  threshold_sensitivity?: Array<Record<string, unknown>>;
  blockers?: Array<string | Record<string, unknown>>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB834ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  audit_lineage_scope?: string;
  source_b833_batch_id?: string | null;
  score_only_sensitivity_status?: string;
  full_funnel_replay_status?: string;
  execution_replay_prerequisites_status?: string;
  accepted_semantics_status?: string;
  candidate_ledger_status?: string;
  trade_ledger_status?: string;
  deterministic_replay_meaningful?: boolean;
  deterministic_replay_count?: number;
  deterministic_replay_mismatch_count?: number | null;
  funnel_reconciliation_status?: string;
  post_threshold_blocker_classification?: string;
  root_cause_classification?: string;
  historical_root_cause_proven?: boolean;
  configured_threshold?: number;
  diagnostic_thresholds?: number[];
  blockers?: Array<string | Record<string, unknown>>;
  missing_replay_requirements?: Array<string | Record<string, unknown>>;
  per_family_threshold_funnel?: Array<Record<string, unknown>>;
  per_gate_rejection_summary?: Array<Record<string, unknown>>;
  per_family_gate_summary?: Array<Record<string, unknown>>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB8341ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  attestation_trust_scope?: string;
  historical_immutability_proven?: boolean;
  source_b834_batch_id?: string | null;
  source_b834_report_sha256?: string | null;
  source_b834_manifest_sha256?: string | null;
  attestation_manifest_sha256?: string | null;
  attested_at_utc?: string | null;
  ledger_hash_attestation_status?: string;
  prior_artifact_mutation_proof_status?: string;
  candidate_required_field_status?: string;
  trade_required_field_status?: string;
  candidate_event_id_integrity_status?: string;
  trade_event_id_integrity_status?: string;
  candidate_trade_join_integrity_status?: string;
  candidate_ledger_attestation?: Record<string, unknown>;
  trade_ledger_attestation?: Record<string, unknown>;
  join_integrity_summary?: Record<string, unknown>;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  configured_live_threshold?: number;
  blockers?: Array<string | Record<string, unknown>>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB8342ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_b834_batch_id?: string | null;
  source_b8341_batch_id?: string | null;
  source_b8341_hash_capture_status?: string;
  source_b8341_sidecar_status?: string;
  attestation_trust_scope?: string;
  historical_immutability_proven?: boolean;
  historical_root_cause_proven?: boolean;
  source_b834_report_sha256?: string | null;
  source_b834_manifest_sha256?: string | null;
  pre_mapping_tamper_check_status?: string;
  schema_mapping_status?: string;
  direction_inventory_status?: string;
  direction_canonicalization_status?: string;
  direction_mapping_status?: string;
  direction_join_parity_status?: string;
  direction_missing_count?: number;
  direction_ambiguous_count?: number;
  direction_mismatch_count?: number;
  direction_orphan_trade_count?: number;
  direction_duplicate_join_count?: number;
  candidate_event_id_provenance_status?: string;
  trade_event_id_provenance_status?: string;
  candidate_trade_join_provenance_status?: string;
  timestamp_semantics_status?: string;
  candidate_timestamp_semantic?: string;
  trade_open_timestamp_semantic?: string;
  trade_close_timestamp_semantic?: string;
  chronology_integrity_status?: string;
  chronology_violation_count?: number;
  same_semantic_timestamp_mismatch_count?: number;
  normalized_sidecar_publish_status?: string;
  normalized_ledger_attestation_status?: string;
  normalized_sidecar_manifest_sha256?: string | null;
  prior_artifact_mutation_proof_status?: string;
  root_cause_classification?: string;
  blockers?: Array<string | Record<string, unknown>>;
  schema_inventory?: Record<string, unknown>;
  direction_inventory?: Record<string, unknown>;
  direction_mapping_table?: Array<Record<string, unknown>>;
  direction_join_parity?: Record<string, unknown>;
  candidate_field_mapping?: Array<Record<string, unknown>>;
  trade_field_mapping?: Array<Record<string, unknown>>;
  event_id_provenance?: Record<string, unknown>;
  join_provenance?: Record<string, unknown>;
  timestamp_semantics?: Record<string, unknown>;
  normalized_ledger_attestation?: Record<string, unknown>;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  configured_live_threshold?: number;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB83421ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_b834_batch_id?: string | null;
  source_b8342_batch_id?: string | null;
  source_b8342_status?: string;
  source_b8342_root_cause?: string;
  source_b8342_direction_mismatch_count?: number;
  source_b8342_direction_join_parity_status?: string;
  source_config_id?: string | null;
  source_config_sha256?: string | null;
  transform_rule_version?: string | null;
  transform_rule_sha256?: string | null;
  ledger_generation_code_version_or_hash?: string | null;
  artifact_created_at_utc?: string | null;
  execution_direction_transform_provenance?: string;
  execution_direction_provenance_status?: string;
  historical_transform_provenance_status?: string;
  historical_transform_provenance_classification?: string;
  historical_binding_available?: boolean;
  historical_root_cause_proven?: boolean;
  current_code_diagnostic_status?: string;
  current_code_rule_path?: string | null;
  current_code_rule_hash?: string | null;
  current_code_config_binding_status?: string;
  current_code_transform_result?: Record<string, unknown>;
  direction_inventory_status?: string;
  direction_join_parity_status?: string;
  joined_trade_count?: number;
  direction_match_count?: number;
  direction_mismatch_count?: number;
  candidate_buy_trade_sell_count?: number;
  candidate_sell_trade_buy_count?: number;
  candidate_flat_with_trade_count?: number;
  identity_match_count?: number;
  invert_match_count?: number;
  explicit_execution_direction_match_count?: number;
  unresolved_count?: number;
  direction_mismatch_count_after_proven_transform?: number;
  direction_inventory?: Record<string, unknown>;
  direction_attribution_rows?: Array<Record<string, unknown>>;
  source_config_provenance?: Record<string, unknown>;
  transform_rule_provenance?: Record<string, unknown>;
  normalized_sidecar_publish_status?: string;
  normalized_sidecar_manifest_sha256?: string | null;
  normalized_ledger_attestation?: Record<string, unknown>;
  prior_artifact_mutation_proof_status?: string;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  b836_source_proof_status?: string;
  root_cause_classification?: string;
  blockers?: Array<string | Record<string, unknown>>;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  configured_live_threshold?: number;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB8343ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  lineage_scope?: string;
  historical_lineage_repair?: boolean;
  historical_root_cause_proven?: boolean;
  configured_live_threshold?: number;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  source_raw_sidecar_batch_id?: string | null;
  source_raw_sidecar_manifest_sha256?: string | null;
  raw_sidecar_attestation_status?: string;
  feature_pipeline_attestation_status?: string;
  feature_leakage_check_status?: string;
  source_config_attestation_status?: string;
  rule_provenance_status?: string;
  model_payload_attestation_status?: string;
  prediction_payload_attestation_status?: string;
  candidate_event_id_provenance_status?: string;
  trade_event_id_provenance_status?: string;
  direction_join_parity_status?: string;
  timestamp_semantics_status?: string;
  chronology_integrity_status?: string;
  deterministic_replay_status?: string;
  deterministic_replay_mismatch_count?: number | null;
  normalized_ledger_attestation_status?: string;
  prior_artifact_mutation_proof_status?: string;
  prior_artifact_mutation_count?: number;
  normalized_sidecar_publish_status?: string;
  joined_trade_count?: number;
  direction_match_count?: number;
  direction_mismatch_count?: number;
  candidate_event_id_null_count?: number;
  candidate_event_id_duplicate_count?: number;
  trade_event_id_null_count?: number;
  trade_event_id_duplicate_count?: number;
  orphan_trade_count?: number;
  duplicate_join_count?: number;
  chronology_violation_count?: number;
  candidate_ledger_sha256?: string | null;
  trade_ledger_sha256?: string | null;
  sidecar_manifest_sha256?: string | null;
  per_family_funnel?: Array<Record<string, unknown>>;
  raw_sidecar_attestation?: Array<Record<string, unknown>>;
  model_payload_hashes?: Record<string, string | null>;
  prediction_payload_hashes?: Record<string, string | null>;
  blockers?: Array<string | Record<string, unknown>>;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB83431ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  lineage_scope?: string;
  parent_lineage_scope?: string;
  parent_b8343_batch_id?: string;
  source_b8343_batch_id?: string | null;
  source_b83431_batch_id?: string | null;
  source_b836_batch_id?: string | null;
  source_lineage_kind?: string | null;
  historical_lineage_repair?: boolean;
  historical_root_cause_proven?: boolean;
  configured_live_threshold?: number;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  raw_sidecar_attestation_status?: string;
  source_config_attestation_status?: string;
  rule_provenance_status?: string;
  trigger_rule_binding_status?: string;
  trigger_rule_attestation_status?: string;
  feature_pipeline_attestation_status?: string;
  feature_leakage_check_status?: string;
  trigger_input_schema_status?: string;
  trigger_input_integrity_status?: string;
  persisted_vs_recomputed_trigger_parity_status?: string;
  deterministic_trigger_replay_status?: string;
  sequential_funnel_wiring_status?: string;
  normalized_ledger_attestation_status?: string;
  prior_artifact_mutation_proof_status?: string;
  normalized_sidecar_publish_status?: string;
  source_raw_sidecar_batch_id?: string | null;
  source_raw_sidecar_manifest_path?: string | null;
  source_raw_sidecar_manifest_sha256?: string | null;
  source_manifest_binding?: Record<string, unknown>;
  raw_timestamp_normalization?: string;
  raw_closed_bars_only?: boolean;
  feature_schema_sha256?: string | null;
  feature_frame_sha256?: string | null;
  trigger_input_frame_sha256?: string | null;
  trigger_rule_provenance?: Array<Record<string, unknown>>;
  trigger_rule_attestation?: Record<string, unknown>;
  trigger_input_attestation?: Record<string, unknown>;
  deterministic_trigger_replay_proof?: Record<string, unknown>;
  per_family_funnel?: Array<Record<string, unknown>>;
  per_family_funnel_hash?: string | null;
  ledger_attestation?: Record<string, unknown>;
  sequential_funnel?: Array<Record<string, unknown>>;
  first_failing_gate_waterfall?: Array<Record<string, unknown>>;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  blockers?: Array<string | Record<string, unknown>>;
  artifact_paths?: Record<string, unknown>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
}

interface PhaseB83432ExperimentResponse extends PhaseB83431ExperimentResponse {
  source_parent_lineage_scope?: string;
  source_parent_b8343_batch_id?: string;
  diagnostic_parent_b83431_batch_id?: string | null;
  trigger_input_materialization_source?: string;
  trigger_input_materialization_status?: string;
  trigger_input_materialization_blockers?: Array<string>;
  source_parent_b8343_manifest_path?: string | null;
  source_parent_b8343_manifest_hash_scheme?: string | null;
  source_parent_b8343_manifest_semantic_hash?: string | null;
  source_parent_b8343_manifest_file_sha256?: string | null;
  parent_candidate_ledger_row_count?: number;
  trigger_input_candidate_fk_duplicate_count?: number;
  trigger_input_candidate_fk_orphan_count?: number;
  trigger_input_source_config_mismatch_count?: number;
  trigger_input_setup_family_mismatch_count?: number;
  trigger_input_row_hash_mismatch_count?: number;
  prediction_payload_resolution?: Array<Record<string, unknown>>;
  nonvacuous_trigger_replay_status?: string;
  raw_prediction_dtype?: string | null;
  raw_prediction_row_count?: number;
  raw_prediction_null_count?: number;
  raw_prediction_nan_count?: number;
  raw_prediction_inf_count?: number;
  raw_prediction_boolean_count?: number;
  raw_prediction_float_count?: number;
  raw_prediction_non_integral_count?: number;
  raw_prediction_unknown_value_count?: number;
  raw_prediction_ambiguous_value_count?: number;
  trigger_source_inventory?: Array<Record<string, unknown>> | Record<string, unknown>;
  persisted_vs_recomputed_trigger_mismatch_count?: number;
  replay_1_vs_replay_2_trigger_mismatch_count?: number;
}

interface PhaseB835ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_b834_batch_id?: string | null;
  lineage_scope?: string;
  split_policy_version?: string;
  temporal_split_status?: string;
  global_purge_gap?: number;
  source_configs_inspected?: Array<Record<string, unknown>>;
  split_proof?: Record<string, unknown>;
  identical_family_boundary_policy_status?: string;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  locked_confirmation_metadata_proof?: Record<string, unknown>;
  configured_live_threshold?: number;
  threshold_candidates?: number[];
  threshold_selection_status?: string;
  threshold_selection_rule?: Record<string, unknown>;
  raw_policy_metrics_status?: string;
  diagnostic_calibration_status?: string;
  validation_replay_status?: string;
  frozen_policy_count?: number;
  root_cause_classification?: string;
  blockers?: Array<string | Record<string, unknown>>;
  raw_policy_metrics?: Array<Record<string, unknown>>;
  diagnostic_calibration_metrics?: Array<Record<string, unknown>>;
  frozen_policies?: Array<Record<string, unknown>>;
  validation_results?: Array<Record<string, unknown>>;
  directional_gate_summary?: Array<Record<string, unknown>>;
  regime_stability_summary?: Array<Record<string, unknown>>;
  realistic_metrics_proof?: Record<string, unknown>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB836ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  source_b835_batch_id?: string | null;
  source_b834_batch_id?: string | null;
  audit_lineage_scope?: string;
  historical_root_cause_proven?: boolean;
  configured_live_threshold?: number;
  split_policy_version?: string;
  global_purge_gap_rows?: number;
  source_config_lookaheads?: Array<Record<string, unknown>>;
  shared_boundary_consistency_status?: string;
  timestamp_normalization_status?: string;
  purge_exclusion_status?: string;
  region_assignment_status?: string;
  candidate_ledger_join_status?: string;
  trade_ledger_join_status?: string;
  event_id_integrity_status?: string;
  ledger_hash_verification_status?: string;
  b834_ledger_hash_verification?: Record<string, unknown>;
  frontend_grouping_render_status?: string;
  frontend_grouping_proof?: Record<string, unknown>;
  candidate_distribution_status?: string;
  gate_failure_decomposition_status?: string;
  root_cause_classification?: string;
  secondary_causes?: Array<string | Record<string, unknown>>;
  per_family_region_distribution?: Array<Record<string, unknown>>;
  per_family_gate_failure_waterfall?: Array<Record<string, unknown>>;
  per_family_time_bucket_histograms?: Array<Record<string, unknown>>;
  outside_expected_range_count?: number;
  join_integrity_summary?: Record<string, unknown>;
  split_proof?: Record<string, unknown>;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  mutation_proof_status?: string;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  sidecar_publish_status?: string;
  blockers?: Array<string | Record<string, unknown>>;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  artifact_paths?: Record<string, unknown>;
}

interface PhaseB8361ExperimentResponse {
  status?: string;
  batch_id?: string;
  generated_at?: string;
  phase?: string;
  audit_only?: boolean;
  source_b8343_batch_id?: string | null;
  source_b83431_batch_id?: string | null;
  source_b836_batch_id?: string | null;
  source_lineage_kind?: string | null;
  trigger_rule_provenance_status?: string;
  trigger_input_integrity_status?: string;
  persisted_vs_recomputed_trigger_parity_status?: string;
  deterministic_trigger_replay_status?: string;
  sequential_funnel_wiring_status?: string;
  root_cause_classification?: string;
  secondary_causes?: Array<string | Record<string, unknown>>;
  trigger_rule_provenance?: Array<Record<string, unknown>>;
  trigger_input_audit?: Array<Record<string, unknown>>;
  persisted_vs_recomputed_trigger_audit?: Array<Record<string, unknown>>;
  sequential_funnel?: Array<Record<string, unknown>>;
  first_failing_gate_waterfall?: Array<Record<string, unknown>>;
  source_artifact_attestation?: Record<string, unknown>;
  persisted_trigger_pass_count?: number;
  recomputed_trigger_pass_count?: number;
  recomputed_trigger_pass_count_replay_2?: number;
  persisted_vs_recomputed_trigger_mismatch_count?: number;
  replay_1_vs_replay_2_trigger_mismatch_count?: number;
  persisted_trigger_output_sha256?: string | null;
  recomputed_trigger_output_sha256?: string | null;
  recomputed_trigger_output_replay_2_sha256?: string | null;
  mutation_proof_status?: string;
  mutation_proof?: {
    status?: string;
    mutations?: Array<Record<string, unknown>>;
  };
  blockers?: Array<string | Record<string, unknown>>;
  sidecar_publish_status?: string;
  locked_confirmation_status?: string;
  locked_confirmation_row_consumption_count?: number;
  configured_live_threshold?: number;
  b81_rerun_readiness?: {
    status?: string;
    reason?: string;
  };
  phase_c_readiness_decision?: {
    status?: string;
    reason?: string;
  };
  artifact_paths?: Record<string, unknown>;
}

const PHASE_B83_EMPTY_RESULT: PhaseB83ExperimentResponse = {
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
  per_family_funnel: [],
};

const PHASE_B831_EMPTY_RESULT: PhaseB831ExperimentResponse = {
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
  missing_exact_b83_payload_requirements: [],
};

const PHASE_B832_EMPTY_RESULT: PhaseB832ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B833_EMPTY_RESULT: PhaseB833ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B834_EMPTY_RESULT: PhaseB834ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B8341_EMPTY_RESULT: PhaseB8341ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B8342_EMPTY_RESULT: PhaseB8342ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B83421_EMPTY_RESULT: PhaseB83421ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B8343_EMPTY_RESULT: PhaseB8343ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B83431_EMPTY_RESULT: PhaseB83431ExperimentResponse = {
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
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
};

const PHASE_B83432_EMPTY_RESULT: PhaseB83432ExperimentResponse = {
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
  phase_c_readiness_decision: { status: "not_ready", reason: "not run yet" },
};

const PHASE_B835_EMPTY_RESULT: PhaseB835ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B836_EMPTY_RESULT: PhaseB836ExperimentResponse = {
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
  artifact_paths: {},
};

const PHASE_B8361_EMPTY_RESULT: PhaseB8361ExperimentResponse = {
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
  artifact_paths: {},
};

interface ResearchJobResponse {
  job_id: string;
  phase: string;
  state: string;
  progress_percent: number;
  started_at?: string | null;
  finished_at?: string | null;
  updated_at?: string | null;
  heartbeat_at?: string | null;
  current_stage?: string | null;
  stage_message?: string | null;
  fetched_rows?: number;
  fetched_unique_rows?: number;
  requested_rows?: number;
  current_chunk?: number;
  total_chunks_estimate?: number;
  last_chunk_start_timestamp?: string | null;
  last_chunk_end_timestamp?: string | null;
  retry_count?: number;
  cancel_requested?: boolean;
  cancel_reason?: string | null;
  cancelled_at?: string | null;
  result?:
    | PhaseAExperimentResponse
    | PhaseA1ExperimentResponse
    | PhaseBExperimentResponse
    | PhaseB3ExperimentResponse
    | PhaseB4ExperimentResponse
    | PhaseB5ExperimentResponse
    | PhaseB51ExperimentResponse
    | PhaseB52ExperimentResponse
    | PhaseB6ExperimentResponse
    | PhaseB7ExperimentResponse
    | PhaseB8ExperimentResponse
    | PhaseB81ExperimentResponse
    | PhaseB82ExperimentResponse
    | PhaseB83ExperimentResponse
    | PhaseB831ExperimentResponse
    | PhaseB832ExperimentResponse
    | PhaseB833ExperimentResponse
    | PhaseB834ExperimentResponse
    | PhaseB8341ExperimentResponse
    | PhaseB8342ExperimentResponse
    | PhaseB83421ExperimentResponse
    | PhaseB8343ExperimentResponse
    | PhaseB83431ExperimentResponse
    | PhaseB83432ExperimentResponse
    | PhaseB835ExperimentResponse
    | PhaseB836ExperimentResponse
    | PhaseB8361ExperimentResponse
    | null;
  error?: string | null;
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
  ensemble?: Record<string, string>;
}

// Visual layout components matching main dashboard
function Spotlight({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(0.12)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(212, 175, 55, 0.15), transparent 80%)`,
        }}
      />
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      const dx = x - xc;
      const dy = y - yc;
      el.style.transform = `perspective(1000px) rotateX(${-(dy / yc) * max}deg) rotateY(${(dx / xc) * max}deg)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [max]);

  return (
    <div
      ref={ref}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
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
      px: bid != null ? formatPrice(bid) : "Unavailable",
      chg: mt5Online ? "live" : "offline",
      up: mt5Online,
    },
    {
      sym: `${symbol} Ask`,
      px: ask != null ? formatPrice(ask) : "Unavailable",
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
            {numeral && (
              <span className="font-serif text-[10px] uppercase tracking-[0.18em] text-muted-foreground/65">
                {numeral} //
              </span>
            )}
            {Icon && <Icon className="h-4.5 w-4.5 text-muted-foreground" />}
            <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
          </div>
          {right && <div className="relative z-10 flex items-center gap-2">{right}</div>}
        </header>
        <div className="relative z-[2] p-5">{children}</div>
      </section>
    </Spotlight>
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

function DataState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-muted-foreground border border-dashed border-border/40 rounded-xl bg-background/20">
      <Bot className="h-8 w-8 opacity-40 mb-2 animate-bounce" />
      <span>{message}</span>
    </div>
  );
}

function compactHash(value: string | null | undefined) {
  if (!value) return "Unavailable";
  return value.length > 14 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}

function newIdempotencyKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function formatNullableNumber(value: number | null | undefined, digits = 2): string {
  return value == null || Number.isNaN(value) ? "N/A" : value.toFixed(digits);
}

function formatNullablePercent(value: number | null | undefined, digits = 2): string {
  return value == null || Number.isNaN(value) ? "N/A" : `${(value * 100).toFixed(digits)}%`;
}

function formatNullableSigned(value: number | null | undefined): string {
  return value == null || Number.isNaN(value) ? "N/A" : formatSigned(value);
}

export function TrainPage() {
  const [data, setData] = useState<BotStateData | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatusResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [autoRefresh] = useState(true);
  const [refreshIntervalSeconds] = useState(DEFAULT_REFRESH_INTERVAL);

  // Form parameters matching institutional retrainer requirements
  const [trainingCandles, setTrainingCandles] = useState<number>(20000);
  const [trainTrendThreshold, setTrainTrendThreshold] = useState<number>(0.55);
  const [trainEntryThreshold, setTrainEntryThreshold] = useState<number>(0.55);
  const [trainRiskThreshold, setTrainRiskThreshold] = useState<number>(0.55);
  const [trainMinConfidence, setTrainMinConfidence] = useState<number>(20.0);
  const [trainMaxSpread, setTrainMaxSpread] = useState<number>(5.0);
  const [trainDebugMode, setTrainDebugMode] = useState<boolean>(true);

  // Job states
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [trainingState, setTrainingState] = useState<string | null>(null);
  const [trainingPending, setTrainingPending] = useState<boolean>(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [sweepPending, setSweepPending] = useState<boolean>(false);
  const [sweepError, setSweepError] = useState<string | null>(null);
  const [sweepResult, setSweepResult] = useState<ThresholdSweepResponse | null>(null);
  const [sweepSortKey, setSweepSortKey] = useState<string>("profit_factor");
  const [sweepShortlistOnly, setSweepShortlistOnly] = useState<boolean>(false);
  const [phaseAResult, setPhaseAResult] = useState<PhaseAExperimentResponse | null>(null);
  const [phaseAJobId, setPhaseAJobId] = useState<string | null>(null);
  const [phaseAState, setPhaseAState] = useState<string | null>(null);
  const [phaseAProgress, setPhaseAProgress] = useState<number>(0);
  const [phaseAPending, setPhaseAPending] = useState<boolean>(false);
  const [phaseAError, setPhaseAError] = useState<string | null>(null);
  const [phaseAAnchorCount, setPhaseAAnchorCount] = useState<number>(6000);
  const [phaseAMaxRuns, setPhaseAMaxRuns] = useState<number>(18);
  const [brokerEconomics, setBrokerEconomics] = useState<BrokerEconomics | null>(null);
  const [phaseA1Result, setPhaseA1Result] = useState<PhaseA1ExperimentResponse | null>(null);
  const [phaseA1JobId, setPhaseA1JobId] = useState<string | null>(null);
  const [phaseA1State, setPhaseA1State] = useState<string | null>(null);
  const [phaseA1Progress, setPhaseA1Progress] = useState<number>(0);
  const [phaseA1Pending, setPhaseA1Pending] = useState<boolean>(false);
  const [phaseA1Error, setPhaseA1Error] = useState<string | null>(null);
  const [phaseA1AnchorCount, setPhaseA1AnchorCount] = useState<number>(6000);
  const [phaseA1MaxRuns, setPhaseA1MaxRuns] = useState<number>(18);
  const [phaseBResult, setPhaseBResult] = useState<PhaseBExperimentResponse | null>(null);
  const [phaseBJobId, setPhaseBJobId] = useState<string | null>(null);
  const [phaseBState, setPhaseBState] = useState<string | null>(null);
  const [phaseBProgress, setPhaseBProgress] = useState<number>(0);
  const [phaseBPending, setPhaseBPending] = useState<boolean>(false);
  const [phaseBError, setPhaseBError] = useState<string | null>(null);
  const [phaseBAnchorCount, setPhaseBAnchorCount] = useState<number>(6000);
  const [phaseBQualityRuns, setPhaseBQualityRuns] = useState<number>(20);
  const [phaseB3Result, setPhaseB3Result] = useState<PhaseB3ExperimentResponse | null>(null);
  const [phaseB3JobId, setPhaseB3JobId] = useState<string | null>(null);
  const [phaseB3State, setPhaseB3State] = useState<string | null>(null);
  const [phaseB3Progress, setPhaseB3Progress] = useState<number>(0);
  const [phaseB3Pending, setPhaseB3Pending] = useState<boolean>(false);
  const [phaseB3Error, setPhaseB3Error] = useState<string | null>(null);
  const [phaseB3AnchorCount, setPhaseB3AnchorCount] = useState<number>(6000);
  const [phaseB3RobustnessRuns, setPhaseB3RobustnessRuns] = useState<number>(24);
  const [phaseB4Result, setPhaseB4Result] = useState<PhaseB4ExperimentResponse | null>(null);
  const [phaseB4JobId, setPhaseB4JobId] = useState<string | null>(null);
  const [phaseB4State, setPhaseB4State] = useState<string | null>(null);
  const [phaseB4Progress, setPhaseB4Progress] = useState<number>(0);
  const [phaseB4Pending, setPhaseB4Pending] = useState<boolean>(false);
  const [phaseB4Error, setPhaseB4Error] = useState<string | null>(null);
  const [phaseB4AnchorCount, setPhaseB4AnchorCount] = useState<number>(20000);
  const [phaseB4MatrixRuns, setPhaseB4MatrixRuns] = useState<number>(24);
  const [phaseB5Result, setPhaseB5Result] = useState<PhaseB5ExperimentResponse | null>(null);
  const [phaseB5JobId, setPhaseB5JobId] = useState<string | null>(null);
  const [phaseB5State, setPhaseB5State] = useState<string | null>(null);
  const [phaseB5Progress, setPhaseB5Progress] = useState<number>(0);
  const [phaseB5Pending, setPhaseB5Pending] = useState<boolean>(false);
  const [phaseB5Error, setPhaseB5Error] = useState<string | null>(null);
  const [phaseB5AnchorCount, setPhaseB5AnchorCount] = useState<number>(20000);
  const [phaseB5MatrixRuns, setPhaseB5MatrixRuns] = useState<number>(18);
  const [phaseB51Result, setPhaseB51Result] = useState<PhaseB51ExperimentResponse | null>(null);
  const [phaseB51JobId, setPhaseB51JobId] = useState<string | null>(null);
  const [phaseB51State, setPhaseB51State] = useState<string | null>(null);
  const [phaseB51Progress, setPhaseB51Progress] = useState<number>(0);
  const [phaseB51Pending, setPhaseB51Pending] = useState<boolean>(false);
  const [phaseB51Error, setPhaseB51Error] = useState<string | null>(null);
  const [phaseB51AnchorCount, setPhaseB51AnchorCount] = useState<number>(20000);
  const [phaseB52Result, setPhaseB52Result] = useState<PhaseB52ExperimentResponse | null>(null);
  const [phaseB52JobId, setPhaseB52JobId] = useState<string | null>(null);
  const [phaseB52State, setPhaseB52State] = useState<string | null>(null);
  const [phaseB52Progress, setPhaseB52Progress] = useState<number>(0);
  const [phaseB52Pending, setPhaseB52Pending] = useState<boolean>(false);
  const [phaseB52Error, setPhaseB52Error] = useState<string | null>(null);
  const [phaseB52AnchorCount, setPhaseB52AnchorCount] = useState<number>(20000);
  const [phaseB6Result, setPhaseB6Result] = useState<PhaseB6ExperimentResponse | null>(null);
  const [phaseB6JobId, setPhaseB6JobId] = useState<string | null>(null);
  const [phaseB6State, setPhaseB6State] = useState<string | null>(null);
  const [phaseB6Progress, setPhaseB6Progress] = useState<number>(0);
  const [phaseB6Pending, setPhaseB6Pending] = useState<boolean>(false);
  const [phaseB6Error, setPhaseB6Error] = useState<string | null>(null);
  const [phaseB6AnchorCount, setPhaseB6AnchorCount] = useState<number>(60000);
  const [phaseB6MatrixRuns, setPhaseB6MatrixRuns] = useState<number>(30);
  const [phaseB7Result, setPhaseB7Result] = useState<PhaseB7ExperimentResponse | null>(null);
  const [phaseB7JobId, setPhaseB7JobId] = useState<string | null>(null);
  const [phaseB7State, setPhaseB7State] = useState<string | null>(null);
  const [phaseB7Progress, setPhaseB7Progress] = useState<number>(0);
  const [phaseB7Pending, setPhaseB7Pending] = useState<boolean>(false);
  const [phaseB7Error, setPhaseB7Error] = useState<string | null>(null);
  const [phaseB7Stage, setPhaseB7Stage] = useState<string | null>(null);
  const [phaseB7Heartbeat, setPhaseB7Heartbeat] = useState<string | null>(null);
  const [phaseB8Result, setPhaseB8Result] = useState<PhaseB8ExperimentResponse | null>(null);
  const [phaseB8JobId, setPhaseB8JobId] = useState<string | null>(null);
  const [phaseB8State, setPhaseB8State] = useState<string | null>(null);
  const [phaseB8Progress, setPhaseB8Progress] = useState<number>(0);
  const [phaseB8Pending, setPhaseB8Pending] = useState<boolean>(false);
  const [phaseB8Error, setPhaseB8Error] = useState<string | null>(null);
  const [phaseB8Stage, setPhaseB8Stage] = useState<string | null>(null);
  const [phaseB8Heartbeat, setPhaseB8Heartbeat] = useState<string | null>(null);
  const [phaseB81Result, setPhaseB81Result] = useState<PhaseB81ExperimentResponse | null>(null);
  const [phaseB81JobId, setPhaseB81JobId] = useState<string | null>(null);
  const [phaseB81State, setPhaseB81State] = useState<string | null>(null);
  const [phaseB81Progress, setPhaseB81Progress] = useState<number>(0);
  const [phaseB81Pending, setPhaseB81Pending] = useState<boolean>(false);
  const [phaseB81Error, setPhaseB81Error] = useState<string | null>(null);
  const [phaseB81Stage, setPhaseB81Stage] = useState<string | null>(null);
  const [phaseB81Heartbeat, setPhaseB81Heartbeat] = useState<string | null>(null);
  const [phaseB82Result, setPhaseB82Result] = useState<PhaseB82ExperimentResponse | null>(null);
  const [phaseB82JobId, setPhaseB82JobId] = useState<string | null>(null);
  const [phaseB82State, setPhaseB82State] = useState<string | null>(null);
  const [phaseB82Progress, setPhaseB82Progress] = useState<number>(0);
  const [phaseB82Pending, setPhaseB82Pending] = useState<boolean>(false);
  const [phaseB82Error, setPhaseB82Error] = useState<string | null>(null);
  const [phaseB82Stage, setPhaseB82Stage] = useState<string | null>(null);
  const [phaseB82Heartbeat, setPhaseB82Heartbeat] = useState<string | null>(null);
  const [phaseB83Result, setPhaseB83Result] = useState<PhaseB83ExperimentResponse | null>(
    PHASE_B83_EMPTY_RESULT,
  );
  const [phaseB83JobId, setPhaseB83JobId] = useState<string | null>(null);
  const [phaseB83State, setPhaseB83State] = useState<string | null>(null);
  const [phaseB83Progress, setPhaseB83Progress] = useState<number>(0);
  const [phaseB83Pending, setPhaseB83Pending] = useState<boolean>(false);
  const [phaseB83Error, setPhaseB83Error] = useState<string | null>(null);
  const [phaseB83Stage, setPhaseB83Stage] = useState<string | null>(null);
  const [phaseB83Heartbeat, setPhaseB83Heartbeat] = useState<string | null>(null);
  const [phaseB831Result, setPhaseB831Result] = useState<PhaseB831ExperimentResponse | null>(
    PHASE_B831_EMPTY_RESULT,
  );
  const [phaseB831JobId, setPhaseB831JobId] = useState<string | null>(null);
  const [phaseB831State, setPhaseB831State] = useState<string | null>(null);
  const [phaseB831Progress, setPhaseB831Progress] = useState<number>(0);
  const [phaseB831Pending, setPhaseB831Pending] = useState<boolean>(false);
  const [phaseB831Error, setPhaseB831Error] = useState<string | null>(null);
  const [phaseB831Stage, setPhaseB831Stage] = useState<string | null>(null);
  const [phaseB831Heartbeat, setPhaseB831Heartbeat] = useState<string | null>(null);
  const [phaseB832Result, setPhaseB832Result] = useState<PhaseB832ExperimentResponse | null>(
    PHASE_B832_EMPTY_RESULT,
  );
  const [phaseB832JobId, setPhaseB832JobId] = useState<string | null>(null);
  const [phaseB832State, setPhaseB832State] = useState<string | null>(null);
  const [phaseB832Progress, setPhaseB832Progress] = useState<number>(0);
  const [phaseB832Pending, setPhaseB832Pending] = useState<boolean>(false);
  const [phaseB832Error, setPhaseB832Error] = useState<string | null>(null);
  const [phaseB832Stage, setPhaseB832Stage] = useState<string | null>(null);
  const [phaseB832Heartbeat, setPhaseB832Heartbeat] = useState<string | null>(null);
  const [phaseB833Result, setPhaseB833Result] = useState<PhaseB833ExperimentResponse | null>(
    PHASE_B833_EMPTY_RESULT,
  );
  const [phaseB833JobId, setPhaseB833JobId] = useState<string | null>(null);
  const [phaseB833State, setPhaseB833State] = useState<string | null>(null);
  const [phaseB833Progress, setPhaseB833Progress] = useState<number>(0);
  const [phaseB833Pending, setPhaseB833Pending] = useState<boolean>(false);
  const [phaseB833Error, setPhaseB833Error] = useState<string | null>(null);
  const [phaseB833Stage, setPhaseB833Stage] = useState<string | null>(null);
  const [phaseB833Heartbeat, setPhaseB833Heartbeat] = useState<string | null>(null);
  const [phaseB834Result, setPhaseB834Result] = useState<PhaseB834ExperimentResponse | null>(
    PHASE_B834_EMPTY_RESULT,
  );
  const [phaseB834JobId, setPhaseB834JobId] = useState<string | null>(null);
  const [phaseB834State, setPhaseB834State] = useState<string | null>(null);
  const [phaseB834Progress, setPhaseB834Progress] = useState<number>(0);
  const [phaseB834Pending, setPhaseB834Pending] = useState<boolean>(false);
  const [phaseB834Error, setPhaseB834Error] = useState<string | null>(null);
  const [phaseB834Stage, setPhaseB834Stage] = useState<string | null>(null);
  const [phaseB834Heartbeat, setPhaseB834Heartbeat] = useState<string | null>(null);
  const [phaseB8341Result, setPhaseB8341Result] = useState<PhaseB8341ExperimentResponse | null>(
    PHASE_B8341_EMPTY_RESULT,
  );
  const [phaseB8341JobId, setPhaseB8341JobId] = useState<string | null>(null);
  const [phaseB8341State, setPhaseB8341State] = useState<string | null>(null);
  const [phaseB8341Progress, setPhaseB8341Progress] = useState<number>(0);
  const [phaseB8341Pending, setPhaseB8341Pending] = useState<boolean>(false);
  const [phaseB8341Error, setPhaseB8341Error] = useState<string | null>(null);
  const [phaseB8341Stage, setPhaseB8341Stage] = useState<string | null>(null);
  const [phaseB8341Heartbeat, setPhaseB8341Heartbeat] = useState<string | null>(null);
  const [phaseB8342Result, setPhaseB8342Result] = useState<PhaseB8342ExperimentResponse | null>(
    PHASE_B8342_EMPTY_RESULT,
  );
  const [phaseB8342JobId, setPhaseB8342JobId] = useState<string | null>(null);
  const [phaseB8342State, setPhaseB8342State] = useState<string | null>(null);
  const [phaseB8342Progress, setPhaseB8342Progress] = useState<number>(0);
  const [phaseB8342Pending, setPhaseB8342Pending] = useState<boolean>(false);
  const [phaseB8342Error, setPhaseB8342Error] = useState<string | null>(null);
  const [phaseB8342Stage, setPhaseB8342Stage] = useState<string | null>(null);
  const [phaseB8342Heartbeat, setPhaseB8342Heartbeat] = useState<string | null>(null);
  const [phaseB83421Result, setPhaseB83421Result] = useState<PhaseB83421ExperimentResponse | null>(
    PHASE_B83421_EMPTY_RESULT,
  );
  const [phaseB83421JobId, setPhaseB83421JobId] = useState<string | null>(null);
  const [phaseB83421State, setPhaseB83421State] = useState<string | null>(null);
  const [phaseB83421Progress, setPhaseB83421Progress] = useState<number>(0);
  const [phaseB83421Pending, setPhaseB83421Pending] = useState<boolean>(false);
  const [phaseB83421Error, setPhaseB83421Error] = useState<string | null>(null);
  const [phaseB83421Stage, setPhaseB83421Stage] = useState<string | null>(null);
  const [phaseB83421Heartbeat, setPhaseB83421Heartbeat] = useState<string | null>(null);
  const [phaseB8343Result, setPhaseB8343Result] = useState<PhaseB8343ExperimentResponse | null>(
    PHASE_B8343_EMPTY_RESULT,
  );
  const [phaseB8343JobId, setPhaseB8343JobId] = useState<string | null>(null);
  const [phaseB8343State, setPhaseB8343State] = useState<string | null>(null);
  const [phaseB8343Progress, setPhaseB8343Progress] = useState<number>(0);
  const [phaseB8343Pending, setPhaseB8343Pending] = useState<boolean>(false);
  const [phaseB8343Error, setPhaseB8343Error] = useState<string | null>(null);
  const [phaseB8343Stage, setPhaseB8343Stage] = useState<string | null>(null);
  const [phaseB8343Heartbeat, setPhaseB8343Heartbeat] = useState<string | null>(null);
  const [phaseB83431Result, setPhaseB83431Result] = useState<PhaseB83431ExperimentResponse | null>(
    PHASE_B83431_EMPTY_RESULT,
  );
  const [phaseB83431JobId, setPhaseB83431JobId] = useState<string | null>(null);
  const [phaseB83431State, setPhaseB83431State] = useState<string | null>(null);
  const [phaseB83431Progress, setPhaseB83431Progress] = useState<number>(0);
  const [phaseB83431Pending, setPhaseB83431Pending] = useState<boolean>(false);
  const [phaseB83431Error, setPhaseB83431Error] = useState<string | null>(null);
  const [phaseB83431Stage, setPhaseB83431Stage] = useState<string | null>(null);
  const [phaseB83431Heartbeat, setPhaseB83431Heartbeat] = useState<string | null>(null);
  const [phaseB83432Result, setPhaseB83432Result] = useState<PhaseB83432ExperimentResponse | null>(
    PHASE_B83432_EMPTY_RESULT,
  );
  const [phaseB83432JobId, setPhaseB83432JobId] = useState<string | null>(null);
  const [phaseB83432State, setPhaseB83432State] = useState<string | null>(null);
  const [phaseB83432Progress, setPhaseB83432Progress] = useState<number>(0);
  const [phaseB83432Pending, setPhaseB83432Pending] = useState<boolean>(false);
  const [phaseB83432Error, setPhaseB83432Error] = useState<string | null>(null);
  const [phaseB83432Stage, setPhaseB83432Stage] = useState<string | null>(null);
  const [phaseB83432Heartbeat, setPhaseB83432Heartbeat] = useState<string | null>(null);
  const [phaseB835Result, setPhaseB835Result] = useState<PhaseB835ExperimentResponse | null>(
    PHASE_B835_EMPTY_RESULT,
  );
  const [phaseB835JobId, setPhaseB835JobId] = useState<string | null>(null);
  const [phaseB835State, setPhaseB835State] = useState<string | null>(null);
  const [phaseB835Progress, setPhaseB835Progress] = useState<number>(0);
  const [phaseB835Pending, setPhaseB835Pending] = useState<boolean>(false);
  const [phaseB835Error, setPhaseB835Error] = useState<string | null>(null);
  const [phaseB835Stage, setPhaseB835Stage] = useState<string | null>(null);
  const [phaseB835Heartbeat, setPhaseB835Heartbeat] = useState<string | null>(null);
  const [phaseB836Result, setPhaseB836Result] = useState<PhaseB836ExperimentResponse | null>(
    PHASE_B836_EMPTY_RESULT,
  );
  const [phaseB836JobId, setPhaseB836JobId] = useState<string | null>(null);
  const [phaseB836State, setPhaseB836State] = useState<string | null>(null);
  const [phaseB836Progress, setPhaseB836Progress] = useState<number>(0);
  const [phaseB836Pending, setPhaseB836Pending] = useState<boolean>(false);
  const [phaseB836Error, setPhaseB836Error] = useState<string | null>(null);
  const [phaseB836Stage, setPhaseB836Stage] = useState<string | null>(null);
  const [phaseB836Heartbeat, setPhaseB836Heartbeat] = useState<string | null>(null);
  const [phaseB8361Result, setPhaseB8361Result] = useState<PhaseB8361ExperimentResponse | null>(
    PHASE_B8361_EMPTY_RESULT,
  );
  const [phaseB8361JobId, setPhaseB8361JobId] = useState<string | null>(null);
  const [phaseB8361State, setPhaseB8361State] = useState<string | null>(null);
  const [phaseB8361Progress, setPhaseB8361Progress] = useState<number>(0);
  const [phaseB8361Pending, setPhaseB8361Pending] = useState<boolean>(false);
  const [phaseB8361Error, setPhaseB8361Error] = useState<string | null>(null);
  const [phaseB8361Stage, setPhaseB8361Stage] = useState<string | null>(null);
  const [phaseB8361Heartbeat, setPhaseB8361Heartbeat] = useState<string | null>(null);

  // Active target for promotion confirmation dialog
  const [promoteTarget, setPromoteTarget] = useState<CandidateMetadata | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [rejectingCandidate, setRejectingCandidate] = useState(false);

  // Retrieve API capabilities
  const { capabilities, refreshCapabilities } = useCapabilities(
    autoRefresh,
    refreshIntervalSeconds,
  );

  // Fetch status and models
  const fetchData = useCallback(async () => {
    try {
      const statusRes = await fetch(`${API_V1_BASE}/status`);
      if (!statusRes.ok) throw new Error(`/status endpoint failed`);
      const statusJson = (await statusRes.json()) as BotStateData;
      setData(statusJson);
      setApiError(null);

      const modelRes = await fetch(`${API_V1_BASE}/model/status`);
      if (modelRes.ok) {
        const modelJson = ((await modelRes.value?.json?.()) ||
          (await modelRes.json())) as ModelStatusResponse;
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
      const payload = (await response.json()) as PhaseAExperimentResponse;
      setPhaseAResult(payload);
    } catch (error) {
      console.error("Phase A latest refresh failed", error);
    }
  }, []);

  const refreshBrokerEconomics = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/broker-economics`);
      if (!response.ok) return;
      setBrokerEconomics((await response.json()) as BrokerEconomics);
    } catch (error) {
      console.error("Broker economics refresh failed", error);
    }
  }, []);

  const refreshPhaseA1 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-a1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseA1ExperimentResponse;
      setPhaseA1Result(payload);
    } catch (error) {
      console.error("Phase A.1 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseBExperimentResponse;
      setPhaseBResult(payload);
    } catch (error) {
      console.error("Phase B latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB3 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b3/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB3ExperimentResponse;
      setPhaseB3Result(payload);
    } catch (error) {
      console.error("Phase B.3 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB4 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b4/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB4ExperimentResponse;
      setPhaseB4Result(payload);
    } catch (error) {
      console.error("Phase B.4 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB5 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB5ExperimentResponse;
      setPhaseB5Result(payload);
    } catch (error) {
      console.error("Phase B.5 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB51 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5-1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB51ExperimentResponse;
      setPhaseB51Result(payload);
    } catch (error) {
      console.error("Phase B.5.1 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB52 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b5-2/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB52ExperimentResponse;
      setPhaseB52Result(payload);
    } catch (error) {
      console.error("Phase B.5.2 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB6 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b6/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB6ExperimentResponse;
      setPhaseB6Result(payload);
    } catch (error) {
      console.error("Phase B.6 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB7 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b7/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB7ExperimentResponse;
      setPhaseB7Result(payload);
    } catch (error) {
      console.error("Phase B.7 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB8 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB8ExperimentResponse;
      setPhaseB8Result(payload);
    } catch (error) {
      console.error("Phase B.8 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB81 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB81ExperimentResponse;
      setPhaseB81Result(payload);
    } catch (error) {
      console.error("Phase B.8.1 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB82 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-2/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB82ExperimentResponse;
      setPhaseB82Result(payload);
    } catch (error) {
      console.error("Phase B.8.2 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB83 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB83ExperimentResponse;
      setPhaseB83Result(payload);
    } catch (error) {
      console.error("Phase B.8.3 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB831 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB831ExperimentResponse;
      setPhaseB831Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.1 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB832 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-2/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB832ExperimentResponse;
      setPhaseB832Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.2 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB833 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-3/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB833ExperimentResponse;
      setPhaseB833Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.3 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB834 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB834ExperimentResponse;
      setPhaseB834Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB8341 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB8341ExperimentResponse;
      setPhaseB8341Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.1 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB8342 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-2/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB8342ExperimentResponse;
      setPhaseB8342Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.2 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB83421 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-2-1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB83421ExperimentResponse;
      setPhaseB83421Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.2.1 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB8343 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB8343ExperimentResponse;
      setPhaseB8343Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.3 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB83431 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3-1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB83431ExperimentResponse;
      setPhaseB83431Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.3.1 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB83432 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-4-3-2/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB83432ExperimentResponse;
      setPhaseB83432Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.4.3.2 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB835 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-5/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB835ExperimentResponse;
      setPhaseB835Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.5 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB836 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-6/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB836ExperimentResponse;
      setPhaseB836Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.6 latest refresh failed", error);
    }
  }, []);

  const refreshPhaseB8361 = useCallback(async () => {
    try {
      const response = await fetch(`${API_V1_BASE}/research/phase-b8-3-6-1/latest`);
      if (!response.ok) return;
      const payload = (await response.json()) as PhaseB8361ExperimentResponse;
      setPhaseB8361Result(payload);
    } catch (error) {
      console.error("Phase B.8.3.6.1 latest refresh failed", error);
    }
  }, []);

  // Poll main state
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
    const interval = window.setInterval(() => void fetchData(), refreshIntervalSeconds * 1000);
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
    refreshPhaseB8361,
  ]);

  // Poll active training job
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
              description: `Job ${trainingJobId} finished successfully. Review diagnostics below before promoting.`,
              duration: 7000,
            });
          } else {
            toast.error("Model Training Failed", {
              description: payload.error || "Check backend console logs for details.",
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

  useEffect(() => {
    if (!phaseAJobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseAJobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseAProgress(payload.progress_percent ?? 0);
        setPhaseAState(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseAJobId(null);
          setPhaseAError(payload.state === "failed" ? payload.error || "Phase A failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseAResult(payload.result);
            toast.success("Phase A Label Experiment Batch Complete", {
              description: `Job ${phaseAJobId} finished. Review the research leaderboard below.`,
              duration: 7000,
            });
            void refreshPhaseA();
          } else {
            toast.error("Phase A Experiment Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
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
    if (!phaseA1JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseA1JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseA1Progress(payload.progress_percent ?? 0);
        setPhaseA1State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseA1JobId(null);
          setPhaseA1Error(payload.state === "failed" ? payload.error || "Phase A.1 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseA1Result(payload.result as PhaseA1ExperimentResponse);
            toast.success("Phase A.1 Edge Forensics Complete", {
              description: `Job ${phaseA1JobId} finished. Review broker costs and shadow backtests below.`,
              duration: 7000,
            });
            void refreshBrokerEconomics();
            void refreshPhaseA1();
          } else {
            toast.error("Phase A.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
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
    if (!phaseBJobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseBJobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseBProgress(payload.progress_percent ?? 0);
        setPhaseBState(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseBJobId(null);
          setPhaseBError(payload.state === "failed" ? payload.error || "Phase B failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseBResult(payload.result as PhaseBExperimentResponse);
            toast.success("Phase B Research Complete", {
              description: `Job ${phaseBJobId} finished. Review feature ablation and quality gates below.`,
              duration: 7000,
            });
            void refreshPhaseB();
          } else {
            toast.error("Phase B Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
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
    if (!phaseB3JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB3JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB3Progress(payload.progress_percent ?? 0);
        setPhaseB3State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB3JobId(null);
          setPhaseB3Error(payload.state === "failed" ? payload.error || "Phase B.3 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB3Result(payload.result as PhaseB3ExperimentResponse);
            toast.success("Phase B.3 Audit Complete", {
              description: `Job ${phaseB3JobId} finished. Review shadow-cost integrity and robustness below.`,
              duration: 7000,
            });
            void refreshPhaseB3();
          } else {
            toast.error("Phase B.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
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
    if (!phaseB4JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB4JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB4Progress(payload.progress_percent ?? 0);
        setPhaseB4State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB4JobId(null);
          setPhaseB4Error(payload.state === "failed" ? payload.error || "Phase B.4 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB4Result(payload.result as PhaseB4ExperimentResponse);
            toast.success("Phase B.4 Evidence Run Complete", {
              description: `Job ${phaseB4JobId} finished. Review discovery, frozen configs, and confirmation gates below.`,
              duration: 7000,
            });
            void refreshPhaseB4();
          } else {
            toast.error("Phase B.4 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
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
    if (!phaseB5JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB5JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB5Progress(payload.progress_percent ?? 0);
        setPhaseB5State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB5JobId(null);
          setPhaseB5Error(payload.state === "failed" ? payload.error || "Phase B.5 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB5Result(payload.result as PhaseB5ExperimentResponse);
            toast.success("Phase B.5 Repair Run Complete", {
              description: `Job ${phaseB5JobId} finished. Review directional bias, drift, and freeze gates below.`,
              duration: 7000,
            });
            void refreshPhaseB5();
          } else {
            toast.error("Phase B.5 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
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
    if (!phaseB51JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB51JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB51Progress(payload.progress_percent ?? 0);
        setPhaseB51State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB51JobId(null);
          setPhaseB51Error(
            payload.state === "failed" ? payload.error || "Phase B.5.1 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB51Result(payload.result as PhaseB51ExperimentResponse);
            toast.success("Phase B.5.1 Audit Complete", {
              description: `Job ${phaseB51JobId} finished. Review count reconciliation and directional track semantics below.`,
              duration: 7000,
            });
            void refreshPhaseB51();
          } else {
            toast.error("Phase B.5.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
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
    if (!phaseB52JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB52JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB52Progress(payload.progress_percent ?? 0);
        setPhaseB52State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB52JobId(null);
          setPhaseB52Error(
            payload.state === "failed" ? payload.error || "Phase B.5.2 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB52Result(payload.result as PhaseB52ExperimentResponse);
            toast.success("Phase B.5.2 Audit Complete", {
              description:
                "Snapshot reproducibility, deterministic replay, and execution-density matrix are ready.",
              duration: 7000,
            });
            void refreshPhaseB52();
          } else {
            toast.error("Phase B.5.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
          }
        }
      } catch (error) {
        console.error("Phase B.5.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB52JobId, refreshPhaseB52]);

  useEffect(() => {
    if (!phaseB6JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB6JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB6Progress(payload.progress_percent ?? 0);
        setPhaseB6State(payload.state ?? null);
        if (payload.state === "completed" || payload.state === "failed") {
          setPhaseB6JobId(null);
          setPhaseB6Error(payload.state === "failed" ? payload.error || "Phase B.6 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB6Result(payload.result as PhaseB6ExperimentResponse);
            const result = payload.result as PhaseB6ExperimentResponse | null;
            if (result?.status === "INSUFFICIENT_HISTORY_FOR_PHASE_B6") {
              toast.error("Phase B.6 Aborted", {
                description: "Expanded MT5 history is incomplete. No partial matrix was executed.",
                duration: 9000,
              });
            } else {
              toast.success("Phase B.6 Complete", {
                description: "Expanded-history label, horizon, and regime repair output is ready.",
                duration: 7000,
              });
            }
            void refreshPhaseB6();
          } else {
            toast.error("Phase B.6 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
          }
        }
      } catch (error) {
        console.error("Phase B.6 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB6JobId, refreshPhaseB6]);

  useEffect(() => {
    if (!phaseB7JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB7JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB7Progress(payload.progress_percent ?? 0);
        setPhaseB7State(payload.state ?? null);
        setPhaseB7Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB7Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB7JobId(null);
          setPhaseB7Error(payload.state === "failed" ? payload.error || "Phase B.7 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB7Result(payload.result as PhaseB7ExperimentResponse);
            toast.success("Phase B.7 Complete", {
              description: "Edge decomposition and strategy repair report is ready for review.",
              duration: 7000,
            });
            void refreshPhaseB7();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.7 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB7();
          } else {
            toast.error("Phase B.7 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
          }
        }
      } catch (error) {
        console.error("Phase B.7 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB7JobId, refreshPhaseB7]);

  useEffect(() => {
    if (!phaseB8JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB8Progress(payload.progress_percent ?? 0);
        setPhaseB8State(payload.state ?? null);
        setPhaseB8Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB8JobId(null);
          setPhaseB8Error(payload.state === "failed" ? payload.error || "Phase B.8 failed." : null);
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8Result(payload.result as PhaseB8ExperimentResponse);
            toast.success("Phase B.8 Complete", {
              description: "Strategy hypothesis reset and gross-edge research report is ready.",
              duration: 7000,
            });
            void refreshPhaseB8();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB8();
          } else {
            toast.error("Phase B.8 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
          }
        }
      } catch (error) {
        console.error("Phase B.8 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8JobId, refreshPhaseB8]);

  useEffect(() => {
    if (!phaseB81JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB81JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB81Progress(payload.progress_percent ?? 0);
        setPhaseB81State(payload.state ?? null);
        setPhaseB81Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB81Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB81JobId(null);
          setPhaseB81Error(
            payload.state === "failed" ? payload.error || "Phase B.8.1 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB81Result(payload.result as PhaseB81ExperimentResponse);
            toast.success("Phase B.8.1 Complete", {
              description: "Mechanics and execution semantics audit report is ready.",
              duration: 7000,
            });
            void refreshPhaseB81();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB81();
          } else {
            toast.error("Phase B.8.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
          }
        }
      } catch (error) {
        console.error("Phase B.8.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB81JobId, refreshPhaseB81]);

  useEffect(() => {
    if (!phaseB82JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB82JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB82Progress(payload.progress_percent ?? 0);
        setPhaseB82State(payload.state ?? null);
        setPhaseB82Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB82Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB82JobId(null);
          setPhaseB82Error(
            payload.state === "failed" ? payload.error || "Phase B.8.2 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB82Result(payload.result as PhaseB82ExperimentResponse);
            toast.success("Phase B.8.2 Complete", {
              description: "Replayable snapshot and event-ledger sidecar report is ready.",
              duration: 7000,
            });
            void refreshPhaseB82();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB82();
          } else {
            toast.error("Phase B.8.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB82();
          }
        }
      } catch (error) {
        console.error("Phase B.8.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB82JobId, refreshPhaseB82]);

  useEffect(() => {
    if (!phaseB83JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB83Progress(payload.progress_percent ?? 0);
        setPhaseB83State(payload.state ?? null);
        setPhaseB83Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB83JobId(null);
          setPhaseB83Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB83Result(payload.result as PhaseB83ExperimentResponse);
            toast.success("Phase B.8.3 Complete", {
              description: "Replay source restoration and reproducible baseline report is ready.",
              duration: 7000,
            });
            void refreshPhaseB83();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB83();
          } else {
            toast.error("Phase B.8.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB83();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83JobId, refreshPhaseB83]);

  useEffect(() => {
    if (!phaseB831JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB831JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB831Progress(payload.progress_percent ?? 0);
        setPhaseB831State(payload.state ?? null);
        setPhaseB831Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB831Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB831JobId(null);
          setPhaseB831Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.1 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB831Result(payload.result as PhaseB831ExperimentResponse);
            toast.success("Phase B.8.3.1 Complete", {
              description: "Threshold gate and prediction payload integrity audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB831();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB831();
          } else {
            toast.error("Phase B.8.3.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB831();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB831JobId, refreshPhaseB831]);

  useEffect(() => {
    if (!phaseB832JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB832JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB832Progress(payload.progress_percent ?? 0);
        setPhaseB832State(payload.state ?? null);
        setPhaseB832Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB832Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB832JobId(null);
          setPhaseB832Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.2 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB832Result(payload.result as PhaseB832ExperimentResponse);
            toast.success("Phase B.8.3.2 Complete", {
              description: "Score calibration and threshold sensitivity audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB832();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB832();
          } else {
            toast.error("Phase B.8.3.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB832();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB832JobId, refreshPhaseB832]);

  useEffect(() => {
    if (!phaseB833JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB833JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB833Progress(payload.progress_percent ?? 0);
        setPhaseB833State(payload.state ?? null);
        setPhaseB833Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB833Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB833JobId(null);
          setPhaseB833Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.3 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB833Result(payload.result as PhaseB833ExperimentResponse);
            toast.success("Phase B.8.3.3 Complete", {
              description: "Feature schema parity and deterministic inference audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB833();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.3 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB833();
          } else {
            toast.error("Phase B.8.3.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB833();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.3 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB833JobId, refreshPhaseB833]);

  useEffect(() => {
    if (!phaseB834JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB834JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB834Progress(payload.progress_percent ?? 0);
        setPhaseB834State(payload.state ?? null);
        setPhaseB834Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB834Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB834JobId(null);
          setPhaseB834Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB834Result(payload.result as PhaseB834ExperimentResponse);
            toast.success("Phase B.8.3.4 Complete", {
              description: "Post-threshold execution funnel semantics audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB834();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB834();
          } else {
            toast.error("Phase B.8.3.4 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB834();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB834JobId, refreshPhaseB834]);

  useEffect(() => {
    if (!phaseB8341JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8341JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB8341Progress(payload.progress_percent ?? 0);
        setPhaseB8341State(payload.state ?? null);
        setPhaseB8341Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8341Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB8341JobId(null);
          setPhaseB8341Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.1 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8341Result(payload.result as PhaseB8341ExperimentResponse);
            toast.success("Phase B.8.3.4.1 Complete", {
              description: "Ledger hash attestation and source-lineage proof is ready.",
              duration: 7000,
            });
            void refreshPhaseB8341();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB8341();
          } else {
            toast.error("Phase B.8.3.4.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB8341();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8341JobId, refreshPhaseB8341]);

  useEffect(() => {
    if (!phaseB8342JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8342JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB8342Progress(payload.progress_percent ?? 0);
        setPhaseB8342State(payload.state ?? null);
        setPhaseB8342Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8342Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB8342JobId(null);
          setPhaseB8342Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.2 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8342Result(payload.result as PhaseB8342ExperimentResponse);
            toast.success("Phase B.8.3.4.2 Complete", {
              description: "Ledger schema mapping and event-ID provenance repair is ready.",
              duration: 7000,
            });
            void refreshPhaseB8342();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB8342();
          } else {
            toast.error("Phase B.8.3.4.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB8342();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8342JobId, refreshPhaseB8342]);

  useEffect(() => {
    if (!phaseB83421JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83421JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB83421Progress(payload.progress_percent ?? 0);
        setPhaseB83421State(payload.state ?? null);
        setPhaseB83421Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83421Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB83421JobId(null);
          setPhaseB83421Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.2.1 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result)
              setPhaseB83421Result(payload.result as PhaseB83421ExperimentResponse);
            toast.success("Phase B.8.3.4.2.1 Complete", {
              description:
                "Direction attribution and historical transform provenance audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB83421();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.2.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB83421();
          } else {
            toast.error("Phase B.8.3.4.2.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB83421();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.2.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83421JobId, refreshPhaseB83421]);

  useEffect(() => {
    if (!phaseB8343JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8343JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB8343Progress(payload.progress_percent ?? 0);
        setPhaseB8343State(payload.state ?? null);
        setPhaseB8343Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8343Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB8343JobId(null);
          setPhaseB8343Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.3 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8343Result(payload.result as PhaseB8343ExperimentResponse);
            toast.success("Phase B.8.3.4.3 Complete", {
              description: "Provenance-complete reproducible ledger baseline report is ready.",
              duration: 7000,
            });
            void refreshPhaseB8343();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.3 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB8343();
          } else {
            toast.error("Phase B.8.3.4.3 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB8343();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.3 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8343JobId, refreshPhaseB8343]);

  useEffect(() => {
    if (!phaseB83431JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83431JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB83431Progress(payload.progress_percent ?? 0);
        setPhaseB83431State(payload.state ?? null);
        setPhaseB83431Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83431Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB83431JobId(null);
          setPhaseB83431Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.3.1 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result)
              setPhaseB83431Result(payload.result as PhaseB83431ExperimentResponse);
            toast.success("Phase B.8.3.4.3.1 Complete", {
              description: "Manifest-bound trigger provenance baseline is ready.",
              duration: 7000,
            });
            void refreshPhaseB83431();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.3.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB83431();
          } else {
            toast.error("Phase B.8.3.4.3.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB83431();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.3.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83431JobId, refreshPhaseB83431]);

  useEffect(() => {
    if (!phaseB83432JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB83432JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB83432Progress(payload.progress_percent ?? 0);
        setPhaseB83432State(payload.state ?? null);
        setPhaseB83432Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB83432Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB83432JobId(null);
          setPhaseB83432Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.4.3.2 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result)
              setPhaseB83432Result(payload.result as PhaseB83432ExperimentResponse);
            toast.success("Phase B.8.3.4.3.2 Complete", {
              description: "Versioned trigger-rule replayable baseline report is ready.",
              duration: 7000,
            });
            void refreshPhaseB83432();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.4.3.2 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB83432();
          } else {
            toast.error("Phase B.8.3.4.3.2 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB83432();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.4.3.2 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB83432JobId, refreshPhaseB83432]);

  useEffect(() => {
    if (!phaseB835JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB835JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB835Progress(payload.progress_percent ?? 0);
        setPhaseB835State(payload.state ?? null);
        setPhaseB835Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB835Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB835JobId(null);
          setPhaseB835Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.5 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB835Result(payload.result as PhaseB835ExperimentResponse);
            toast.success("Phase B.8.3.5 Complete", {
              description: "Temporal calibration and locked OOS threshold policy audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB835();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.5 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB835();
          } else {
            toast.error("Phase B.8.3.5 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB835();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.5 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB835JobId, refreshPhaseB835]);

  useEffect(() => {
    if (!phaseB836JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB836JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB836Progress(payload.progress_percent ?? 0);
        setPhaseB836State(payload.state ?? null);
        setPhaseB836Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB836Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB836JobId(null);
          setPhaseB836Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.6 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB836Result(payload.result as PhaseB836ExperimentResponse);
            toast.success("Phase B.8.3.6 Complete", {
              description: "Temporal distribution and gate-failure decomposition audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB836();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.6 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB836();
          } else {
            toast.error("Phase B.8.3.6 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB836();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.6 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB836JobId, refreshPhaseB836]);

  useEffect(() => {
    if (!phaseB8361JobId) return undefined;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`${API_V1_BASE}/research/jobs/${phaseB8361JobId}`);
        if (!response.ok || !active) return;
        const payload = (await response.json()) as ResearchJobResponse;
        setPhaseB8361Progress(payload.progress_percent ?? 0);
        setPhaseB8361State(payload.state ?? null);
        setPhaseB8361Stage(payload.stage_message ?? payload.current_stage ?? null);
        setPhaseB8361Heartbeat(payload.heartbeat_at ?? null);
        if (
          payload.state === "completed" ||
          payload.state === "failed" ||
          payload.state === "cancelled"
        ) {
          setPhaseB8361JobId(null);
          setPhaseB8361Error(
            payload.state === "failed" ? payload.error || "Phase B.8.3.6.1 failed." : null,
          );
          if (payload.state === "completed") {
            if (payload.result) setPhaseB8361Result(payload.result as PhaseB8361ExperimentResponse);
            toast.success("Phase B.8.3.6.1 Complete", {
              description: "Trigger-gate provenance audit is ready.",
              duration: 7000,
            });
            void refreshPhaseB8361();
          } else if (payload.state === "cancelled") {
            toast.error("Phase B.8.3.6.1 Cancelled", {
              description: payload.cancel_reason || "Research job was cancelled.",
              duration: 7000,
            });
            void refreshPhaseB8361();
          } else {
            toast.error("Phase B.8.3.6.1 Failed", {
              description: payload.error || "Check backend audit logs for details.",
              duration: 9000,
            });
            void refreshPhaseB8361();
          }
        }
      } catch (error) {
        console.error("Phase B.8.3.6.1 job polling failed", error);
      }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [phaseB8361JobId, refreshPhaseB8361]);

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
      toast.success("Retraining Job Submitted Successfully", {
        description: `Job ID: ${payload.job_id} — Training model office on ${trainingCandles.toLocaleString()} historical candles.`,
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
          idempotency_key: newIdempotencyKey(),
        }),
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

  const rejectCandidate = async (candidate: CandidateMetadata) => {
    setRejectingCandidate(true);
    try {
      const response = await fetch(`${API_V1_BASE}/model/candidates/${candidate.run_id}`, {
        method: "DELETE",
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
            max_spread_pips: 5.0,
            force_rebuild_cache: false,
          }),
        },
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.detail || "Threshold sweep failed");
      setSweepResult(payload as ThresholdSweepResponse);
      toast.success("Threshold sweep complete", {
        description: `${payload.combo_count ?? 0} combinations evaluated from cached holdout predictions.`,
        duration: 6000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase A experiments");
      setPhaseAJobId(payload.job_id ?? null);
      setPhaseAState(payload.state ?? "queued");
      setPhaseAProgress(payload.progress_percent ?? 0);
      toast.success("Phase A Label Experiment Submitted", {
        description: `${phaseAMaxRuns} curated label configs queued. No candidate will be promoted.`,
        duration: 6000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase A.1");
      setPhaseA1JobId(payload.job_id ?? null);
      setPhaseA1State(payload.state ?? "queued");
      setPhaseA1Progress(payload.progress_percent ?? 0);
      toast.success("Phase A.1 Edge Forensics Submitted", {
        description: `${phaseA1MaxRuns} curated cost/session configs queued. No model promotion will run.`,
        duration: 6000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B");
      setPhaseBJobId(payload.job_id ?? null);
      setPhaseBState(payload.state ?? "queued");
      setPhaseBProgress(payload.progress_percent ?? 0);
      toast.success("Phase B Research Submitted", {
        description: `B0-B5 ablation plus ${phaseBQualityRuns} curated quality-gate configs queued. No promotion will run.`,
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.3");
      setPhaseB3JobId(payload.job_id ?? null);
      setPhaseB3State(payload.state ?? "queued");
      setPhaseB3Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.3 Audit Submitted", {
        description: `Orthogonal ablation plus ${phaseB3RobustnessRuns} robustness neighbors queued. No promotion will run.`,
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.4");
      setPhaseB4JobId(payload.job_id ?? null);
      setPhaseB4State(payload.state ?? "queued");
      setPhaseB4Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.4 Evidence Run Submitted", {
        description: `${phaseB4MatrixRuns} curated discovery configs queued with a locked confirmation split. No promotion will run.`,
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.5");
      setPhaseB5JobId(payload.job_id ?? null);
      setPhaseB5State(payload.state ?? "queued");
      setPhaseB5Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.5 Repair Run Submitted", {
        description: `${phaseB5MatrixRuns} curated label/horizon/track configs queued. No promotion will run.`,
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.5.1");
      setPhaseB51JobId(payload.job_id ?? null);
      setPhaseB51State(payload.state ?? "queued");
      setPhaseB51Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.5.1 Audit Submitted", {
        description:
          "Rerunning exact B5_11 buy-only config for count integrity. No promotion or Phase C will run.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.5.2");
      setPhaseB52JobId(payload.job_id ?? null);
      setPhaseB52State(payload.state ?? "queued");
      setPhaseB52Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.5.2 Audit Submitted", {
        description:
          "Freezing a 20,000 M5 snapshot, replaying B5_11 twice, and running the curated density matrix. No promotion will run.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.6");
      setPhaseB6JobId(payload.job_id ?? null);
      setPhaseB6State(payload.state ?? "queued");
      setPhaseB6Progress(payload.progress_percent ?? 0);
      toast.success("Phase B.6 Submitted", {
        description:
          "Expanded history will be verified first. The matrix is skipped if required bars are incomplete.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.7");
      setPhaseB7JobId(payload.job_id ?? null);
      setPhaseB7State(payload.state ?? "queued");
      setPhaseB7Progress(payload.progress_percent ?? 0);
      setPhaseB7Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB7Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.7 Submitted", {
        description:
          "Reusing the immutable B.6 snapshot to build edge decomposition and strategy-repair evidence.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8");
      setPhaseB8JobId(payload.job_id ?? null);
      setPhaseB8State(payload.state ?? "queued");
      setPhaseB8Progress(payload.progress_percent ?? 0);
      setPhaseB8Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8 Submitted", {
        description:
          "Reusing the immutable B.6 snapshot for strategy hypothesis reset and gross-edge research.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.1");
      setPhaseB81JobId(payload.job_id ?? null);
      setPhaseB81State(payload.state ?? "queued");
      setPhaseB81Progress(payload.progress_percent ?? 0);
      setPhaseB81Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB81Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.1 Submitted", {
        description:
          "Auditing strategy mechanics against the immutable B.6/B.8 research artifacts.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.2");
      setPhaseB82JobId(payload.job_id ?? null);
      setPhaseB82State(payload.state ?? "queued");
      setPhaseB82Progress(payload.progress_percent ?? 0);
      setPhaseB82Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB82Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.2 Submitted", {
        description:
          "Attempting exact UTC B.6 history reconstruction and replayable sidecar persistence.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3");
      setPhaseB83JobId(payload.job_id ?? null);
      setPhaseB83State(payload.state ?? "queued");
      setPhaseB83Progress(payload.progress_percent ?? 0);
      setPhaseB83Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3 Submitted", {
        description:
          "Restoring replay source availability or creating a separate reproducible research baseline.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.1");
      setPhaseB831JobId(payload.job_id ?? null);
      setPhaseB831State(payload.state ?? "queued");
      setPhaseB831Progress(payload.progress_percent ?? 0);
      setPhaseB831Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB831Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.1 Submitted", {
        description: "Running audit-only threshold gate and prediction payload integrity checks.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.2");
      setPhaseB832JobId(payload.job_id ?? null);
      setPhaseB832State(payload.state ?? "queued");
      setPhaseB832Progress(payload.progress_percent ?? 0);
      setPhaseB832Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB832Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.2 Submitted", {
        description: "Running audit-only score calibration and threshold sensitivity diagnostics.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.3");
      setPhaseB833JobId(payload.job_id ?? null);
      setPhaseB833State(payload.state ?? "queued");
      setPhaseB833Progress(payload.progress_percent ?? 0);
      setPhaseB833Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB833Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.3 Submitted", {
        description: "Running audit-only feature schema parity and deterministic inference checks.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4");
      setPhaseB834JobId(payload.job_id ?? null);
      setPhaseB834State(payload.state ?? "queued");
      setPhaseB834Progress(payload.progress_percent ?? 0);
      setPhaseB834Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB834Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4 Submitted", {
        description: "Running audit-only post-threshold execution funnel semantics checks.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.1");
      setPhaseB8341JobId(payload.job_id ?? null);
      setPhaseB8341State(payload.state ?? "queued");
      setPhaseB8341Progress(payload.progress_percent ?? 0);
      setPhaseB8341Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8341Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.1 Submitted", {
        description: "Running audit-only ledger hash attestation and lineage proof.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.2");
      setPhaseB8342JobId(payload.job_id ?? null);
      setPhaseB8342State(payload.state ?? "queued");
      setPhaseB8342Progress(payload.progress_percent ?? 0);
      setPhaseB8342Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8342Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.2 Submitted", {
        description: "Running audit-only ledger schema mapping and event-ID provenance repair.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.2.1");
      setPhaseB83421JobId(payload.job_id ?? null);
      setPhaseB83421State(payload.state ?? "queued");
      setPhaseB83421Progress(payload.progress_percent ?? 0);
      setPhaseB83421Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83421Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.2.1 Submitted", {
        description: "Running audit-only direction attribution and transform provenance checks.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.3");
      setPhaseB8343JobId(payload.job_id ?? null);
      setPhaseB8343State(payload.state ?? "queued");
      setPhaseB8343Progress(payload.progress_percent ?? 0);
      setPhaseB8343Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8343Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.3 Submitted", {
        description: "Running research-only provenance-complete reproducible baseline rebuild.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.3.1");
      setPhaseB83431JobId(payload.job_id ?? null);
      setPhaseB83431State(payload.state ?? "queued");
      setPhaseB83431Progress(payload.progress_percent ?? 0);
      setPhaseB83431Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83431Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.3.1 Submitted", {
        description: "Running manifest-bound trigger provenance baseline rebuild.",
        duration: 7000,
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.4.3.2");
      setPhaseB83432JobId(payload.job_id ?? null);
      setPhaseB83432State(payload.state ?? "queued");
      setPhaseB83432Progress(payload.progress_percent ?? 0);
      setPhaseB83432Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB83432Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.4.3.2 Submitted", {
        description: "Running versioned trigger-rule replayable baseline repair.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.5");
      setPhaseB835JobId(payload.job_id ?? null);
      setPhaseB835State(payload.state ?? "queued");
      setPhaseB835Progress(payload.progress_percent ?? 0);
      setPhaseB835Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB835Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.5 Submitted", {
        description: "Running audit-only temporal calibration and locked OOS policy checks.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.6");
      setPhaseB836JobId(payload.job_id ?? null);
      setPhaseB836State(payload.state ?? "queued");
      setPhaseB836Progress(payload.progress_percent ?? 0);
      setPhaseB836Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB836Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.6 Submitted", {
        description:
          "Running audit-only temporal distribution and gate-failure decomposition checks.",
        duration: 7000,
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
        capabilities.model_training.reason || "Research training is blocked by backend policy.",
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
          idempotency_key: newIdempotencyKey(),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as Partial<ResearchJobResponse> & {
        detail?: string;
      };
      if (!response.ok) throw new Error(payload.detail || "Failed to start Phase B.8.3.6.1");
      setPhaseB8361JobId(payload.job_id ?? null);
      setPhaseB8361State(payload.state ?? "queued");
      setPhaseB8361Progress(payload.progress_percent ?? 0);
      setPhaseB8361Stage(payload.stage_message ?? payload.current_stage ?? "queued");
      setPhaseB8361Heartbeat(payload.heartbeat_at ?? null);
      toast.success("Phase B.8.3.6.1 Submitted", {
        description: "Running audit-only trigger-gate provenance and sequential funnel wiring.",
        duration: 7000,
      });
    } catch (error) {
      setPhaseB8361Error(getErrorMessage(error));
      setPhaseB8361State("failed");
      toast.error(getErrorMessage(error));
    } finally {
      setPhaseB8361Pending(false);
    }
  };

  // Process feature importance for visual graph representation
  const parsedFeatureImportance = useMemo(() => {
    if (!latestCandidate?.feature_importance || !Array.isArray(latestCandidate.feature_importance))
      return [];
    return latestCandidate.feature_importance
      .map((item) => {
        const name = item.feature || "";
        const val = item.importance || 0;
        const model = item.model ? `[${item.model}] ` : "";
        return {
          label: `${model}${name}`,
          value: val,
        };
      })
      .slice(0, 10); // Display top 10 features
  }, [latestCandidate]);

  const sortedSweepRows = useMemo(() => {
    const rows = [...(sweepResult?.leaderboard ?? [])];
    const visible = sweepShortlistOnly ? rows.filter((row) => row.shortlisted) : rows;
    const valueFor = (row: ThresholdSweepRow) => {
      const value = row[sweepSortKey as keyof ThresholdSweepRow];
      return typeof value === "number" ? value : value == null ? -999999 : 0;
    };
    return visible.sort((a, b) => valueFor(b) - valueFor(a));
  }, [sweepResult, sweepShortlistOnly, sweepSortKey]);
  const segmentedHoldoutSets =
    sweepResult?.segmented_holdout_stability_check ?? sweepResult?.walk_forward_scaffold ?? [];
  const phaseATopRows = phaseAResult?.top_10 ?? phaseAResult?.leaderboard?.slice(0, 10) ?? [];
  const phaseA1TopRows = phaseA1Result?.top_10 ?? phaseA1Result?.leaderboard?.slice(0, 10) ?? [];
  const phaseA1Best = phaseA1TopRows[0];
  const phaseBFeatureRows =
    phaseBResult?.feature_ablation?.top_10 ??
    phaseBResult?.feature_ablation?.leaderboard?.slice(0, 10) ??
    [];
  const phaseBQualityRows =
    phaseBResult?.trade_quality?.top_10 ??
    phaseBResult?.trade_quality?.leaderboard?.slice(0, 10) ??
    [];
  const phaseBBestFeature = phaseBResult?.feature_ablation?.best_feature_set_label;
  const phaseBBestQuality = phaseBQualityRows[0];
  const phaseB3OrthogonalRows =
    phaseB3Result?.orthogonal_ablation?.top_10 ??
    phaseB3Result?.orthogonal_ablation?.leaderboard?.slice(0, 10) ??
    [];
  const phaseB3RobustnessRows =
    phaseB3Result?.neighborhood_robustness?.top_10 ??
    phaseB3Result?.neighborhood_robustness?.leaderboard?.slice(0, 10) ??
    [];
  const phaseB3BestRobustness = phaseB3RobustnessRows[0];
  const phaseB3BestFixed = phaseB3BestRobustness?.fixed_trade_shadow_cost;
  const phaseB3BestFullReplay = phaseB3BestRobustness?.full_execution_replay;
  const phaseB4DiscoveryRows =
    phaseB4Result?.discovery_matrix?.top_10 ??
    phaseB4Result?.discovery_matrix?.leaderboard?.slice(0, 10) ??
    [];
  const phaseB4FrozenRows =
    phaseB4Result?.confirmation_replay?.top_3 ?? phaseB4Result?.frozen_configs ?? [];
  const phaseB4RejectedRows = phaseB4Result?.freeze_rejected_top_3 ?? [];
  const phaseB5DiscoveryRows =
    phaseB5Result?.discovery_matrix?.top_10 ??
    phaseB5Result?.discovery_matrix?.leaderboard?.slice(0, 10) ??
    [];
  const phaseB5FrozenRows =
    phaseB5Result?.confirmation_replay?.top_3 ?? phaseB5Result?.frozen_configs ?? [];
  const phaseB5RejectedRows = phaseB5Result?.freeze_rejected_top_3 ?? [];
  const phaseB5Best = phaseB5DiscoveryRows[0];
  const phaseB5FoldRows = phaseB5Result?.fold_attribution_dashboard?.slice(0, 6) ?? [];
  const phaseB5DriftRows =
    ((phaseB5Result?.drift_diagnostics?.folds as Array<Record<string, unknown>> | undefined)?.[0]
      ?.rows as Array<Record<string, unknown>> | undefined) ?? [];
  const phaseB5RegimeRows = phaseB5Result?.regime_attribution?.slice(0, 12) ?? [];
  const phaseB5TrackRows = phaseB5Result?.side_specific_tracks?.leaderboard?.slice(0, 12) ?? [];
  const phaseB51Funnel = phaseB51Result?.count_funnel ?? {};
  const phaseB51FoldRows = phaseB51Result?.fold_count_table?.slice(0, 8) ?? [];
  const phaseB51RegimeRows = phaseB51Result?.regime_count_table?.slice(0, 18) ?? [];
  const phaseB51FreezeChecks = phaseB51Result?.freeze_gate?.checks ?? {};
  const phaseB51DriftRows = [
    ...(phaseB51Result?.drift_warning?.severe_rows ?? []),
    ...(phaseB51Result?.drift_warning?.strong_rows ?? []),
  ].slice(0, 10);
  const phaseB52SnapshotFrames = phaseB52Result?.snapshot_manifest?.timeframes ?? {};
  const phaseB52Funnel = phaseB52Result?.execution_density_funnel ?? {};
  const phaseB52Density = phaseB52Result?.execution_density_metrics ?? {};
  const phaseB52FullSnapshotRows = Number(
    phaseB52Result?.snapshot_manifest?.combined_dataset_rows ?? NaN,
  );
  const phaseB52FullSnapshotClosedDensity =
    Number.isFinite(phaseB52FullSnapshotRows) && phaseB52FullSnapshotRows > 0
      ? (Number(phaseB52Funnel.closed_trades ?? 0) / phaseB52FullSnapshotRows) * 1000
      : Number.NaN;
  const phaseB52FoldRows = phaseB52Result?.fold_density_table?.slice(0, 8) ?? [];
  const phaseB52MatrixRows =
    phaseB52Result?.density_matrix?.top_10 ??
    phaseB52Result?.density_matrix?.leaderboard?.slice(0, 10) ??
    [];
  const phaseB6HistoryFrames = phaseB6Result?.history_status?.timeframes ?? {};
  const phaseB6SnapshotFrames = phaseB6Result?.snapshot_manifest?.timeframes ?? {};
  const phaseB6SplitRegions = phaseB6Result?.chronological_split_timeline?.regions ?? {};
  const phaseB6MatrixRows = phaseB6Result?.curated_matrix_manifest?.matrix_used?.slice(0, 36) ?? [];
  const phaseB6LeaderboardRows =
    phaseB6Result?.label_horizon_leaderboard?.slice(0, 10) ??
    phaseB6Result?.execution_density_leaderboard?.slice(0, 10) ??
    [];
  const phaseB6FrozenRows = phaseB6Result?.frozen_configs?.slice(0, 10) ?? [];
  const phaseB6ConfirmationRows =
    phaseB6Result?.locked_confirmation_replay?.leaderboard?.slice(0, 10) ??
    phaseB6Result?.locked_confirmation_replay?.results?.slice(0, 10) ??
    [];
  const phaseB7SnapshotFrames = phaseB7Result?.snapshot_integrity?.timeframes ?? {};
  const phaseB7SnapshotChecks = phaseB7Result?.snapshot_integrity?.checks ?? {};
  const phaseB7CostRows = phaseB7Result?.cost_decomposition?.leaderboard?.slice(0, 10) ?? [];
  const phaseB7DirectionRows = phaseB7Result?.directional_decomposition?.tracks ?? [];
  const phaseB7RegimeRows = phaseB7Result?.regime_attribution?.slice(0, 18) ?? [];
  const phaseB7AblationRows = phaseB7Result?.orthogonal_ablation?.leaderboard?.slice(0, 13) ?? [];
  const phaseB7MetaRows = phaseB7Result?.meta_label_repair?.leaderboard?.slice(0, 8) ?? [];
  const phaseB7FreezeRows = phaseB7Result?.discovery_freeze_gate?.leaderboard?.slice(0, 10) ?? [];
  const phaseB7LockedConfirmation =
    phaseB7Result?.locked_confirmation ?? phaseB7Result?.locked_confirmation_replay;
  const phaseB8SnapshotFrames = phaseB8Result?.snapshot_integrity?.timeframes ?? {};
  const phaseB8SnapshotChecks = phaseB8Result?.snapshot_integrity?.checks ?? {};
  const phaseB8SetupRows = phaseB8Result?.setup_family_definitions?.slice(0, 12) ?? [];
  const phaseB8GrossRows = phaseB8Result?.gross_edge_leaderboard?.slice(0, 12) ?? [];
  const phaseB8CostRows = phaseB8Result?.cost_decomposition?.leaderboard?.slice(0, 12) ?? [];
  const phaseB8FoldRows = phaseB8Result?.fold_attribution?.slice(0, 18) ?? [];
  const phaseB8DriftRows = phaseB8Result?.drift_diagnostics?.slice(0, 24) ?? [];
  const phaseB8MlRows = phaseB8Result?.ml_value_add?.leaderboard?.slice(0, 12) ?? [];
  const phaseB81MechanicsChecks = phaseB81Result?.trade_accounting_integrity?.checks ?? [];
  const phaseB81CountChecks =
    phaseB81Result?.snapshot_evaluator_integrity?.count_reconciliation?.checks ?? {};
  const phaseB81PayoffRows = phaseB81Result?.realized_payoff_audit?.leaderboard?.slice(0, 8) ?? [];
  const phaseB81LedgerRows =
    phaseB81Result?.event_level_ledger_export?.family_ledgers?.slice(0, 8) ?? [];
  const phaseB82TimeframeRows = Object.entries(phaseB82Result?.actual_first_last_timestamps ?? {});
  const phaseB82RawHashRows = phaseB82Result?.raw_hash_compatibility?.timeframes ?? {};
  const phaseB82MismatchRows = phaseB82Result?.mismatch_reasons?.slice(0, 8) ?? [];
  const phaseB82RerunRows = phaseB82Result?.research_rerun_required_for_new_baseline ?? [];
  const phaseB82ReadinessBlockers =
    phaseB82Result?.readiness_blockers ?? phaseB82Result?.b81_rerun_readiness?.blockers ?? [];
  const phaseB82ReplayRequirements = phaseB82Result?.missing_replay_requirements?.slice(0, 8) ?? [];
  const phaseB82UnresolvedConfigs = phaseB82Result?.unresolved_source_configs?.slice(0, 8) ?? [];
  const phaseB82BlockedFamilies = phaseB82Result?.blocked_setup_families ?? [];
  const phaseB82FunnelRows = phaseB82Result?.per_family_funnel?.slice(0, 8) ?? [];
  const phaseB82HasHardenedBlock = [
    phaseB82Result?.ledger_generation_status,
    phaseB82Result?.ledger_reconciliation_status,
    phaseB82Result?.combined_feature_hash_status,
  ].some((status) =>
    [
      "PLACEHOLDER_LEDGER",
      "REPLAY_CONFIG_UNAVAILABLE",
      "REPLAY_SUMMARY_MISMATCH",
      "VACUOUS_ZERO_TRADE_REPLAY",
      "COMBINED_FEATURE_SCHEMA_MISMATCH",
      "COMBINED_REPLAY_NOT_RECONSTRUCTED",
    ].includes(String(status ?? "")),
  );
  const phaseB82LedgerSummary = `candidates ${String(
    phaseB82Result?.ledger_reconciliation?.candidate_rows ?? "--",
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
    ["Phase C", phaseB83Result?.phase_c_readiness_decision?.status],
  ];
  const phaseB83Blockers = phaseB83Result?.blockers?.slice(0, 10) ?? [];
  const phaseB83ReplayRequirements =
    phaseB83Result?.missing_replay_requirements?.slice(0, 10) ?? [];
  const phaseB83UnresolvedConfigs = phaseB83Result?.unresolved_source_configs?.slice(0, 10) ?? [];
  const phaseB83ArtifactRows = Object.entries(phaseB83Result?.artifact_paths ?? {}).slice(0, 14);
  const phaseB83FunnelRows = phaseB83Result?.per_family_funnel?.slice(0, 8) ?? [];
  const phaseB83NeedsAttention = [
    phaseB83Result?.legacy_replay_availability_status,
    phaseB83Result?.ledger_reconciliation_status,
    phaseB83Result?.new_baseline_status,
    phaseB83Result?.b81_rerun_readiness?.status,
  ].some((status) =>
    [
      "NON_REPLAYABLE_LEGACY_LINEAGE",
      "VACUOUS_ZERO_TRADE_REPLAY",
      "FAIL",
      "BLOCKED",
      "RESEARCH_RERUN_REQUIRED",
      "not_ready",
    ].includes(String(status ?? "")),
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
    ["Phase C", phaseB831Result?.phase_c_readiness_decision?.status],
  ];
  const phaseB831Blockers = phaseB831Result?.blockers?.slice(0, 12) ?? [];
  const phaseB831MissingPayloads =
    phaseB831Result?.missing_exact_b83_payload_requirements?.slice(0, 12) ?? [];
  const phaseB831ArtifactRows = Object.entries(phaseB831Result?.artifact_paths ?? {}).slice(0, 10);
  const phaseB831FunnelRows = phaseB831Result?.per_family_funnel?.slice(0, 8) ?? [];
  const phaseB831NeedsAttention = [
    phaseB831Result?.audit_lineage_scope,
    phaseB831Result?.threshold_audit_status,
    phaseB831Result?.root_cause_classification,
    phaseB831Result?.b81_rerun_readiness?.status,
    phaseB831Result?.phase_c_readiness_decision?.status,
  ].some((status) =>
    [
      "REBUILT_BASELINE_AUDIT_ONLY",
      "FAIL",
      "FAIL_ZERO_THRESHOLD_PASS",
      "THRESHOLD_GATE_ZERO_PASS",
      "VACUOUS_ZERO_TRADE_REPLAY",
      "not_ready",
    ].includes(String(status ?? "")),
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
    ["Phase C", phaseB832Result?.phase_c_readiness_decision?.status],
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
    phaseB832Result?.b81_rerun_readiness?.status,
  ].some((status) =>
    [
      "REBUILT_BASELINE_DIAGNOSTIC_ONLY",
      "LABEL_CLASS_IMBALANCE",
      "SCORE_COMPRESSION_UNCALIBRATED",
      "MODEL_HAS_WEAK_SEPARATION",
      "not_ready",
    ].includes(String(status ?? "")),
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
    ["Threshold", String(phaseB833Result?.configured_threshold ?? 0.55)],
  ];
  const phaseB833Blockers = phaseB833Result?.blockers?.slice(0, 12) ?? [];
  const phaseB833SchemaRows = phaseB833Result?.per_family_schema_audit?.slice(0, 8) ?? [];
  const phaseB833QuantileRows = phaseB833Result?.before_after_score_quantiles?.slice(0, 8) ?? [];
  const phaseB833ThresholdRows = phaseB833Result?.threshold_sensitivity?.slice(0, 24) ?? [];
  const phaseB833NeedsAttention = [
    phaseB833Result?.audit_lineage_scope,
    phaseB833Result?.mismatch_classification,
    phaseB833Result?.sidecar_publish_status,
    phaseB833Result?.b81_rerun_readiness?.status,
  ].some((status) =>
    [
      "REBUILT_BASELINE_DIAGNOSTIC_ONLY",
      "INSUFFICIENT_EVIDENCE_FOR_HISTORICAL_PROOF",
      "REPAIR_NOT_PROVEN",
      "MULTIPLE_SCHEMA_CAUSES",
      "STATUS_ONLY_REPAIR_NOT_PROVEN",
      "not_ready",
    ].includes(String(status ?? "")),
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
    ["Threshold", String(phaseB834Result?.configured_threshold ?? 0.55)],
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
      phaseB8341Result?.prior_artifact_mutation_proof_status ??
        phaseB8341Result?.mutation_proof?.status,
    ],
    ["Candidate Fields", phaseB8341Result?.candidate_required_field_status],
    ["Trade Fields", phaseB8341Result?.trade_required_field_status],
    ["Candidate Event IDs", phaseB8341Result?.candidate_event_id_integrity_status],
    ["Trade Event IDs", phaseB8341Result?.trade_event_id_integrity_status],
    ["Join Integrity", phaseB8341Result?.candidate_trade_join_integrity_status],
    ["Locked Confirmation", phaseB8341Result?.locked_confirmation_status],
    ["Locked Rows Read", String(phaseB8341Result?.locked_confirmation_row_consumption_count ?? 0)],
    ["Live Threshold", String(phaseB8341Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB8341Blockers = phaseB8341Result?.blockers?.slice(0, 12) ?? [];
  const phaseB8341LedgerRows = [
    ["Candidate", phaseB8341Result?.candidate_ledger_attestation],
    ["Trade", phaseB8341Result?.trade_ledger_attestation],
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
    ["Live Threshold", String(phaseB8342Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB8342Blockers = phaseB8342Result?.blockers?.slice(0, 12) ?? [];
  const phaseB8342CandidateMappings = phaseB8342Result?.candidate_field_mapping?.slice(0, 36) ?? [];
  const phaseB8342TradeMappings = phaseB8342Result?.trade_field_mapping?.slice(0, 36) ?? [];
  const phaseB8342DirectionMappings = phaseB8342Result?.direction_mapping_table?.slice(0, 36) ?? [];
  const phaseB8342DirectionInventory = (phaseB8342Result?.direction_inventory ?? {}) as Record<
    string,
    unknown
  >;
  const phaseB8342DirectionRows = [
    ["Candidate", phaseB8342DirectionInventory.candidate],
    ["Trade", phaseB8342DirectionInventory.trade],
  ];
  const phaseB8342DirectionParity = (phaseB8342Result?.direction_join_parity ?? {}) as Record<
    string,
    unknown
  >;
  const phaseB8342LedgerAttestation = (phaseB8342Result?.normalized_ledger_attestation ??
    {}) as Record<string, unknown>;
  const phaseB8342LedgerRows = [
    ["Candidate", phaseB8342LedgerAttestation.candidate_ledger],
    ["Trade", phaseB8342LedgerAttestation.trade_ledger],
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
      String(phaseB83421Result?.direction_mismatch_count_after_proven_transform ?? 0),
    ],
    ["B.8.3.6 Proof", phaseB83421Result?.b836_source_proof_status],
    ["Sidecar Publish", phaseB83421Result?.normalized_sidecar_publish_status],
    ["Root Cause", phaseB83421Result?.root_cause_classification],
    ["Live Threshold", String(phaseB83421Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB83421Blockers = phaseB83421Result?.blockers?.slice(0, 12) ?? [];
  const phaseB83421AttributionRows =
    phaseB83421Result?.direction_attribution_rows?.slice(0, 36) ?? [];
  const phaseB83421ProofRows = [
    ["Source Config", phaseB83421Result?.source_config_id],
    ["Source Config SHA", compactHash(phaseB83421Result?.source_config_sha256)],
    ["Rule Version", phaseB83421Result?.transform_rule_version],
    ["Rule SHA", compactHash(phaseB83421Result?.transform_rule_sha256)],
    ["Code Version", compactHash(phaseB83421Result?.ledger_generation_code_version_or_hash)],
    ["Artifact Created", phaseB83421Result?.artifact_created_at_utc],
    ["Current Rule SHA", compactHash(phaseB83421Result?.current_code_rule_hash)],
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
    ["Live Threshold", String(phaseB8343Result?.configured_live_threshold ?? 0.55)],
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
    ["Live Threshold", String(phaseB83431Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB83431SourceRows = [
    ["Source B.8.3.4.3", phaseB83431Result?.source_b8343_batch_id],
    ["Source B.8.3.4.3.1", phaseB83431Result?.source_b83431_batch_id],
    ["Source B.8.3.6", phaseB83431Result?.source_b836_batch_id],
    ["Source Kind", phaseB83431Result?.source_lineage_kind],
  ];
  const phaseB83431Blockers = phaseB83431Result?.blockers?.slice(0, 12) ?? [];
  const phaseB83431TriggerRows = phaseB83431Result?.trigger_rule_provenance?.slice(0, 8) ?? [];
  const phaseB83431InputRows = phaseB83431Result?.trigger_input_audit?.slice(0, 8) ?? [];
  const phaseB83431ParityRows =
    phaseB83431Result?.persisted_vs_recomputed_trigger_audit?.slice(0, 8) ?? [];
  const phaseB83431FunnelRows = phaseB83431Result?.sequential_funnel?.slice(0, 8) ?? [];
  const phaseB83431WaterfallRows =
    phaseB83431Result?.first_failing_gate_waterfall?.slice(0, 8) ?? [];
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
    ["Live Threshold", String(phaseB83432Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB83432HashRows = [
    ["Parent Manifest", compactHash(phaseB83432Result?.source_parent_b8343_manifest_file_sha256)],
    ["Parent Semantic", compactHash(phaseB83432Result?.source_parent_b8343_manifest_semantic_hash)],
    ["Trigger Input", compactHash(phaseB83432Result?.trigger_input_frame_sha256)],
    [
      "Candidate Ledger",
      compactHash(
        phaseB83432Result?.ledger_attestation?.candidate_ledger_sha256 as string | null | undefined,
      ),
    ],
    [
      "Trade Ledger",
      compactHash(
        phaseB83432Result?.ledger_attestation?.trade_ledger_sha256 as string | null | undefined,
      ),
    ],
    ["Sidecar Manifest", compactHash(phaseB83432Result?.sidecar_manifest_sha256)],
  ];
  const phaseB83432InventoryPayload = phaseB83432Result?.trigger_source_inventory;
  const phaseB83432InventoryRows = Array.isArray(phaseB83432InventoryPayload)
    ? phaseB83432InventoryPayload.slice(0, 12)
    : ((
        phaseB83432InventoryPayload?.mapping_rows as Array<Record<string, unknown>> | undefined
      )?.slice(0, 12) ?? []);
  const phaseB83432PredictionResolutionRows =
    phaseB83432Result?.prediction_payload_resolution?.slice(0, 8) ?? [];
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
    ["Live Threshold", String(phaseB835Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB835Blockers = phaseB835Result?.blockers?.slice(0, 12) ?? [];
  const phaseB835RawRows = phaseB835Result?.raw_policy_metrics?.slice(0, 36) ?? [];
  const phaseB835CalibrationRows =
    phaseB835Result?.diagnostic_calibration_metrics?.slice(0, 18) ?? [];
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
    ["Live Threshold", String(phaseB836Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB836Blockers = phaseB836Result?.blockers?.slice(0, 12) ?? [];
  const phaseB836DistributionRows =
    phaseB836Result?.per_family_region_distribution?.slice(0, 48) ?? [];
  const phaseB836WaterfallRows =
    phaseB836Result?.per_family_gate_failure_waterfall?.slice(0, 48) ?? [];
  const phaseB836HistogramRows =
    phaseB836Result?.per_family_time_bucket_histograms?.slice(0, 36) ?? [];
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
    ["Live Threshold", String(phaseB8361Result?.configured_live_threshold ?? 0.55)],
  ];
  const phaseB8361Blockers = phaseB8361Result?.blockers?.slice(0, 12) ?? [];
  const phaseB8361TriggerRows = phaseB8361Result?.trigger_rule_provenance?.slice(0, 12) ?? [];
  const phaseB8361InputRows = phaseB8361Result?.trigger_input_audit?.slice(0, 24) ?? [];
  const phaseB8361ParityRows =
    phaseB8361Result?.persisted_vs_recomputed_trigger_audit?.slice(0, 24) ?? [];
  const phaseB8361FunnelRows = phaseB8361Result?.sequential_funnel?.slice(0, 24) ?? [];
  const phaseB8361WaterfallRows =
    phaseB8361Result?.first_failing_gate_waterfall?.slice(0, 36) ?? [];
  const activeBrokerEconomics =
    phaseA1Result?.broker_economics ??
    phaseA1Result?.cost_audit?.broker_economics ??
    brokerEconomics;
  const bestShadowProfiles = phaseA1Best?.shadow_cost_backtest?.profiles;

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="velvet-vignette" aria-hidden />
      <div className="bokeh-field" aria-hidden>
        <span
          className="bk"
          style={{ width: 180, height: 180, left: "15%", top: "8%", animationDelay: "0s" }}
        />
        <span
          className="bk"
          style={{ width: 220, height: 220, left: "65%", top: "45%", animationDelay: "-4s" }}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] bg-blueprint" />
      <span aria-hidden className="Monogram-watermark right-[-4%] top-[18%] hidden lg:block">
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
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
              <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-[oklch(0.88_0.018_95/0.5)] [animation:pulse-glow_3s_ease-in-out_infinite]" />
              <Crown className="relative h-5 w-5 text-background" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="flex items-center gap-2 text-base font-semibold tracking-tight">
                <span className="font-serif text-lg">Aurum</span>
                <span className="text-shine font-serif text-lg">AI</span>
                <span className="rounded-md border border-[oklch(0.88_0.018_95/0.3)] bg-[oklch(0.88_0.018_95/0.08)] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[oklch(0.96_0.012_95)]">
                  Pro
                </span>
              </h1>
              <p className="font-mono-num text-[11px] text-muted-foreground">
                {symbol} · {status?.timeframe ?? "M5"} · {accountMode}
              </p>
            </div>
          </Link>

          {/* Unified Navigation Bar */}
          <nav className="hidden items-center gap-1.5 rounded-xl border border-border bg-surface/60 p-1 md:flex">
            <Link
              to="/"
              search={{ tab: "dashboard" }}
              className="relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              to="/"
              search={{ tab: "performance" }}
              className="relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-foreground"
            >
              Performance
            </Link>
            <Link
              to="/"
              search={{ tab: "logs" }}
              className="relative rounded-lg px-4 py-1.5 text-sm font-medium transition text-muted-foreground hover:text-foreground"
            >
              Logs
            </Link>
            <Link
              to="/train"
              className="relative rounded-lg px-4 py-1.5 text-sm font-semibold transition bg-gradient-gold-soft text-[oklch(0.96_0.012_95)] shadow-gold-soft"
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] space-y-6 px-6 py-6 animate-in fade-in-50 duration-350">
        {/* Title workspace bar */}
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/50 text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Office Retrainer Workspace</h2>
              <p className="text-xs text-muted-foreground">
                Manage ensemble models, perform feature engineering training runs, and audit
                decision filters.
              </p>
            </div>
          </div>
          <button
            onClick={() => void fetchData()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-background/50 text-xs font-medium text-muted-foreground transition hover:text-[oklch(0.96_0.012_95)]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Workspace
          </button>
        </div>

        {/* Top split row: Active Champion & Retraining Settings */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Active Champion Status card */}
          <div className="lg:col-span-5 space-y-6">
            <SectionCard numeral="01" title="Active Champion Model" icon={Crown}>
              <div className="rounded-xl border border-[oklch(0.88_0.018_95/0.25)] bg-gradient-gold-soft p-4">
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[oklch(0.96_0.012_95)]">
                  <Crown className="h-3.5 w-3.5" />
                  Active Model Instance
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Version / Source
                    </div>
                    <div className="mt-1 truncate font-mono-num font-semibold">
                      {modelStatus?.model_source ?? "Waiting for backend"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Hash (SHA-256)
                    </div>
                    <div className="mt-1 font-mono-num font-semibold text-muted-foreground">
                      {compactHash(modelStatus?.champion_model_hash)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  {[
                    {
                      label: "PF (Profit Factor)",
                      value: championBacktest?.profit_factor?.toFixed(2) ?? "--",
                    },
                    {
                      label: "Max Drawdown",
                      value:
                        championBacktest?.max_drawdown == null
                          ? "--"
                          : `${championBacktest.max_drawdown.toFixed(2)}%`,
                    },
                    {
                      label: "Expectancy",
                      value:
                        championBacktest?.expectancy == null
                          ? "--"
                          : formatSigned(championBacktest.expectancy),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-[oklch(0.88_0.018_95/0.16)] bg-background/30 p-2"
                    >
                      <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                        {item.label}
                      </div>
                      <div className="mt-1 font-mono-num font-semibold">{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-[oklch(0.88_0.018_95/0.2)] pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Zap className="h-3 w-3 text-[oklch(0.96_0.012_95)]" /> Loaded into Live Engine
                  </div>
                  <StatusPill
                    label={modelStatus?.champion_loaded ? "ACTIVE" : "MISSING"}
                    tone={modelStatus?.champion_loaded ? "success" : "danger"}
                    icon={BrainCircuit}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Feature Importance panel */}
            <SectionCard numeral="02" title="Feature Importance Analysis" icon={Flame}>
              <div className="space-y-3.5">
                <p className="text-xs text-muted-foreground">
                  Relative weighting of the top predictive parameters generated in the latest
                  retraining run.
                </p>
                {parsedFeatureImportance.length > 0 ? (
                  <div className="space-y-2.5">
                    {parsedFeatureImportance.map((feat) => {
                      const pct = Math.min(100, Math.max(0, feat.value * 100));
                      return (
                        <div key={feat.label} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono-num">
                            <span
                              className="text-foreground/80 truncate max-w-[280px]"
                              title={feat.label}
                            >
                              {feat.label}
                            </span>
                            <span className="text-muted-foreground font-semibold">
                              {(feat.value * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-background/50 overflow-hidden border border-border/20">
                            <div
                              className="h-full bg-gradient-gold rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <DataState message="No feature importance registry found. Train a new candidate." />
                )}
              </div>
            </SectionCard>
          </div>

          {/* Candidate Retraining settings card */}
          <div className="lg:col-span-7 space-y-6">
            <SectionCard numeral="03" title="Ensemble Retraining Parameters" icon={Settings}>
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Modify the base parameters for the institutional XGBoost ensemble feature engine.
                  Retraining evaluates setup candidates on holdout historical periods.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-border/40 bg-background/20 p-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Candles Size
                    </label>
                    <Input
                      type="number"
                      min="5000"
                      max="200000"
                      value={trainingCandles}
                      onChange={(e) => setTrainingCandles(Number(e.target.value))}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      Recommended: 20,000 M5 when broker M1 history is about 100,000 bars. Higher
                      requests need more MT5 M1 history downloaded first.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      AI Confidence Threshold (%)
                    </label>
                    <Input
                      type="number"
                      step="5"
                      min="10"
                      max="95"
                      value={trainMinConfidence}
                      onChange={(e) => setTrainMinConfidence(Number(e.target.value))}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      Minimum model confidence value to issue trades.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Trend Threshold
                    </label>
                    <Input
                      type="number"
                      step="0.05"
                      min="0.15"
                      max="0.95"
                      value={trainTrendThreshold}
                      onChange={(e) => setTrainTrendThreshold(Number(e.target.value))}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      Classifier threshold for trend confirmation.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Entry Threshold
                    </label>
                    <Input
                      type="number"
                      step="0.05"
                      min="0.15"
                      max="0.95"
                      value={trainEntryThreshold}
                      onChange={(e) => setTrainEntryThreshold(Number(e.target.value))}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      Classifier threshold for trade setup entry.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Risk Filter Threshold
                    </label>
                    <Input
                      type="number"
                      step="0.05"
                      min="0.10"
                      max="0.95"
                      value={trainRiskThreshold}
                      onChange={(e) => setTrainRiskThreshold(Number(e.target.value))}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      Combined classifier threshold to block high-risk environments.
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Max Allowed Spread (Pips)
                    </label>
                    <Input
                      type="number"
                      step="0.5"
                      min="1.0"
                      max="25.0"
                      value={trainMaxSpread}
                      onChange={(e) => setTrainMaxSpread(Number(e.target.value))}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      Units represent full pips (spread is normalized in gold).
                    </span>
                  </div>

                  <div className="md:col-span-2 flex items-center justify-between border-t border-border/20 pt-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={trainDebugMode}
                        onChange={(e) => setTrainDebugMode(e.target.checked)}
                        className="rounded border-border text-[oklch(0.72_0.14_30)] focus:ring-0 bg-background/50"
                      />
                      Enable Decision Pipeline Debug Logging (Generates Diagnostic Tables)
                    </label>
                    <span className="text-[9px] uppercase font-semibold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/25 font-mono">
                      {trainingJobId ? `${trainingState ?? "running"}` : "Ready"}
                    </span>
                  </div>
                </div>

                {/* Progress reporting bar */}
                {(trainingJobId || modelStatus?.training_in_progress) && (
                  <div className="space-y-1.5 border border-border/30 rounded-xl bg-background/30 p-3">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">
                        Training candidate... ({trainingState || "processing"})
                      </span>
                      <span className="font-mono-num font-semibold text-gold">
                        {trainingProgress}%
                      </span>
                    </div>
                    <Progress value={trainingProgress} className="h-2.5 bg-background/60" />
                  </div>
                )}

                <button
                  disabled={
                    !capabilities.model_training.allowed ||
                    trainingPending ||
                    Boolean(trainingJobId)
                  }
                  onClick={() => void startTraining()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-3 text-sm font-semibold text-background shadow-gold transition disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {trainingPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Zap className="size-4 animate-pulse" />
                  )}
                  Execute Candidate Retraining Run
                </button>

                {trainingError && (
                  <p className="break-words text-center text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/25 rounded-lg p-2.5">
                    Job Failed: {trainingError}
                  </p>
                )}
                {!capabilities.model_training.allowed && (
                  <p className="text-center text-xs text-muted-foreground">
                    {capabilities.model_training.reason}
                  </p>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* Mid section row: Rejection diagnostics & Rejection trace */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Signal Diagnostics Card */}
          <div className="lg:col-span-5">
            <SectionCard
              numeral="04"
              title="Latest Candidate Signal Diagnostics"
              icon={ShieldAlert}
            >
              <div className="space-y-4">
                {latestCandidate ? (
                  <>
                    <div className="flex items-center justify-between border-b border-border/35 pb-2.5">
                      <div>
                        <p
                          className="font-mono-num font-bold text-sm truncate max-w-[200px]"
                          title={latestCandidate.run_id}
                        >
                          {latestCandidate.run_id}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          {latestCandidate.model_version ?? "Ensemble Model"}
                        </p>
                      </div>
                      <StatusPill
                        label={latestCandidate.eligible ? "Eligible" : "Review"}
                        tone={latestCandidate.eligible ? "success" : "muted"}
                        icon={ShieldCheck}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                      <div className="p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between">
                        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                          Accuracy
                        </span>
                        <span className="font-mono-num text-sm text-foreground mt-0.5">
                          {((latestCandidate.metrics?.holdout?.accuracy ?? 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between">
                        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                          Holdout Signals
                        </span>
                        <span className="font-mono-num text-sm text-foreground mt-0.5">
                          {latestCandidate.metrics?.holdout?.trade_signals ?? 0}
                        </span>
                      </div>
                      <div className="p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between">
                        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                          Win Rate
                        </span>
                        <span className="font-mono-num text-sm text-foreground mt-0.5">
                          {formatNullablePercent(
                            latestCandidate.metrics?.holdout?.backtest?.win_rate,
                          )}
                        </span>
                      </div>
                      <div className="p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between">
                        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                          Profit Factor
                        </span>
                        <span className="font-mono-num text-sm text-foreground mt-0.5">
                          {formatNullableNumber(
                            latestCandidate.metrics?.holdout?.backtest?.profit_factor,
                          )}
                        </span>
                      </div>
                      <div className="p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between">
                        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                          Expectancy
                        </span>
                        <span className="font-mono-num text-sm text-foreground mt-0.5">
                          {formatNullableSigned(
                            latestCandidate.metrics?.holdout?.backtest?.expectancy,
                          )}
                        </span>
                      </div>
                      <div className="p-2 border border-border/20 rounded-lg bg-background/20 flex flex-col justify-between">
                        <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                          Avg Reward/Risk
                        </span>
                        <span className="font-mono-num text-sm text-foreground mt-0.5">
                          {formatNullableNumber(
                            latestCandidate.metrics?.holdout?.backtest?.average_rr,
                          )}
                        </span>
                      </div>
                    </div>

                    {latestCandidate.metrics?.holdout?.rejection_diagnostics && (
                      <div className="border-t border-border/40 pt-3 space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                          Combined Pipeline Rejections
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium border border-border/30 rounded-xl bg-background/10 p-3">
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Total Evaluated:</span>
                            <span className="font-mono-num text-foreground/80">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .total_candles_evaluated ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Candidates (B/S):</span>
                            <span className="font-mono-num text-foreground/80">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .buy_candidates ?? 0}{" "}
                              /{" "}
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .sell_candidates ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Trend Blocked:</span>
                            <span className="font-mono-num text-destructive/85">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .rejected_by_trend_threshold ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Entry Blocked:</span>
                            <span className="font-mono-num text-destructive/85">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .rejected_by_entry_threshold ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Risk Blocked:</span>
                            <span className="font-mono-num text-destructive/85">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .rejected_by_risk_filter ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Spread Blocked:</span>
                            <span className="font-mono-num text-destructive/85">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .rejected_by_spread ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">News Blocked:</span>
                            <span className="font-mono-num text-destructive/85">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .rejected_by_news ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Low Confidence:</span>
                            <span className="font-mono-num text-destructive/85">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .rejected_by_no_threshold ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-muted-foreground">Invalid SL/TP:</span>
                            <span className="font-mono-num text-destructive/85">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .rejected_by_sl_tp ?? 0}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-border/10 pb-1">
                            <span className="text-foreground font-semibold">Final Signals:</span>
                            <span className="font-mono-num text-emerald-500 font-semibold">
                              {latestCandidate.metrics.holdout.rejection_diagnostics
                                .final_signals ?? 0}
                            </span>
                          </div>
                        </div>

                        {/* Stats block */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground border-t border-border/20 pt-2 font-mono-num">
                          <div className="flex justify-between">
                            <span>Avg/Max Spread:</span>
                            <span className="font-semibold text-foreground/80">
                              {(
                                latestCandidate.metrics.holdout.rejection_diagnostics.avg_spread ??
                                0
                              ).toFixed(2)}{" "}
                              /{" "}
                              {(
                                latestCandidate.metrics.holdout.rejection_diagnostics.max_spread ??
                                0
                              ).toFixed(2)}{" "}
                              pips
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg/Min Conf:</span>
                            <span className="font-semibold text-foreground/80">
                              {(
                                latestCandidate.metrics.holdout.rejection_diagnostics
                                  .avg_confidence ?? 0
                              ).toFixed(3)}{" "}
                              /{" "}
                              {(
                                latestCandidate.metrics.holdout.rejection_diagnostics
                                  .min_confidence ?? 0
                              ).toFixed(3)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <DataState message="No candidate model active. Run retrainer above." />
                )}
              </div>
            </SectionCard>
          </div>

          {/* Trace Sample table Card */}
          <div className="lg:col-span-7">
            <SectionCard
              numeral="05"
              title="Decision Pipeline Rejection Trace"
              icon={AlertTriangle}
            >
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Audits rejected setups chronologically. Useful for identifying Unit errors (e.g.
                  raw points vs pips) and tuning prediction confidence values.
                </p>
                {latestCandidate?.metrics?.holdout?.rejection_diagnostics?.rejection_trace &&
                latestCandidate.metrics.holdout.rejection_diagnostics.rejection_trace.length > 0 ? (
                  <div className="max-h-[385px] overflow-y-auto rounded-xl border border-border/40 bg-background/15 backdrop-blur-sm shadow-inner scrollbar-thin">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/45 text-[10px] text-muted-foreground uppercase tracking-wider sticky top-0 z-10 font-semibold">
                          <th className="px-3 py-2 font-medium">Idx</th>
                          <th className="px-3 py-2 font-medium text-center">Trend</th>
                          <th className="px-3 py-2 font-medium text-center">Entry</th>
                          <th className="px-3 py-2 font-medium text-center">Confidence</th>
                          <th className="px-3 py-2 font-medium text-center">Spread</th>
                          <th className="px-3 py-2 font-medium">Rejection Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {latestCandidate.metrics.holdout.rejection_diagnostics.rejection_trace.map(
                          (t, idx) => (
                            <tr key={idx} className="hover:bg-background/25 transition">
                              <td className="px-3 py-2 text-muted-foreground font-semibold">
                                {t.idx}
                              </td>
                              <td className="px-3 py-2 text-center text-foreground/80">
                                {(t.trend_score ?? 0).toFixed(3)}
                              </td>
                              <td className="px-3 py-2 text-center text-foreground/80">
                                {(t.entry_score ?? 0).toFixed(3)}
                              </td>
                              <td className="px-3 py-2 text-center font-medium text-foreground">
                                {(t.confidence ?? 0).toFixed(3)}
                              </td>
                              <td className="px-3 py-2 text-center text-foreground/80">
                                {(t.spread ?? 0).toFixed(2)}
                              </td>
                              <td className="px-3 py-2">
                                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold border border-destructive/20 bg-destructive/10 text-[oklch(0.72_0.20_22)]">
                                  {t.rejection_reason}
                                </span>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <DataState message="No rejection trace found. Enable debug mode in retrainer parameters." />
                )}
              </div>
            </SectionCard>
          </div>
        </div>

        <SectionCard numeral="06" title="Data Pipeline Audit" icon={LineChartIcon}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Tracks how raw candles become the final evaluated holdout rows, so reduced sample
              counts are visible before tuning thresholds.
            </p>
            {pipelineAudit ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    [
                      "Requested M5",
                      pipelineAudit.requested_m5_candles ??
                        pipelineAudit.requested_anchor_count ??
                        pipelineAudit.raw_candles,
                    ],
                    ["Received M5", pipelineAudit.received_m5_candles ?? pipelineAudit.raw_candles],
                    ["Required M1", pipelineAudit.required_m1_candles],
                    ["Received M1", pipelineAudit.received_m1_candles],
                    ["Received M15", pipelineAudit.received_m15_candles],
                    ["Received H1", pipelineAudit.received_h1_candles],
                    ["After Features", pipelineAudit.rows_after_feature_engineering],
                    [
                      "Clean Retention",
                      pipelineAudit.clean_row_retention_pct == null
                        ? null
                        : `${pipelineAudit.clean_row_retention_pct.toFixed(2)}%`,
                    ],
                    ["Clean Rows", pipelineAudit.clean_rows],
                    ["Training Rows", pipelineAudit.training_rows],
                    [
                      "Purge Gap Rows",
                      pipelineAudit.purged_lookahead_gap_rows ?? pipelineAudit.validation_rows,
                    ],
                    ["Holdout Rows", pipelineAudit.holdout_rows],
                    ["Final Evaluated", pipelineAudit.final_evaluated_rows],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/30 bg-background/20 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 font-mono-num text-lg font-bold text-foreground">
                        {typeof value === "string" ? value : Number(value ?? 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                {sweepResult?.leakage_audit && (
                  <div className="rounded-xl border border-border/30 bg-background/20 p-3">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Leakage Audit
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-semibold ${sweepResult.leakage_audit.status === "pass" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
                      >
                        {sweepResult.leakage_audit.status ?? "unknown"}
                      </span>
                      {Object.entries(sweepResult.leakage_audit.checks ?? {}).map(
                        ([name, passed]) => (
                          <span
                            key={name}
                            className={`rounded-full border px-2 py-0.5 ${passed ? "border-emerald-400/25 text-emerald-300" : "border-destructive/25 text-destructive"}`}
                          >
                            {name}: {passed ? "pass" : "fail"}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {pipelineAudit.explanation && (
                  <div className="rounded-xl border border-[oklch(0.88_0.018_95/0.18)] bg-[oklch(0.88_0.018_95/0.06)] p-3 text-xs leading-relaxed text-muted-foreground">
                    {pipelineAudit.explanation}
                  </div>
                )}
                {latestCandidate?.metric_sanity_audit &&
                  latestCandidate.metric_sanity_audit.length > 0 && (
                    <div className="rounded-xl border border-border/30 bg-background/20 p-3">
                      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Metric Sanity Notes
                      </div>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        {latestCandidate.metric_sanity_audit.slice(0, 6).map((item, index) => (
                          <div key={`${item.path}-${index}`} className="flex gap-2">
                            <span className="font-mono-num text-foreground/70">{item.path}</span>
                            <span>{item.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <DataState message="No pipeline audit metadata is available yet. Run a candidate or threshold sweep." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="07"
          title="Diagnostic Threshold Sweep — Not Promotion Evidence"
          icon={Gauge}
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="max-w-3xl text-xs text-muted-foreground">
                Reuses cached holdout probabilities from the latest candidate and evaluates
                decision-threshold combinations without retraining the ensemble. Threshold sweep
                results are exploratory only. Final eligibility requires true rolling walk-forward
                validation.
              </p>
              <button
                disabled={sweepPending || !latestCandidate?.run_id}
                onClick={() => void runThresholdSweep()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold px-4 py-2.5 text-sm font-semibold text-background shadow-gold transition disabled:cursor-not-allowed disabled:opacity-55"
              >
                {sweepPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Gauge className="size-4" />
                )}
                Run Threshold Sweep
              </button>
            </div>

            {sweepError && (
              <p className="break-words rounded-lg border border-destructive/25 bg-destructive/10 p-2.5 text-center text-xs font-semibold text-destructive">
                Sweep Failed: {sweepError}
              </p>
            )}

            {sweepResult ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[
                    ["Candidate", sweepResult.candidate_id],
                    ["Combos", sweepResult.combo_count],
                    ["Shortlist", sweepResult.shortlist.length],
                    ["Generated", sweepResult.generated_at],
                    ["Evaluated Rows", sweepResult.pipeline_audit?.final_evaluated_rows],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/30 bg-background/20 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                        {String(value ?? "N/A")}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`rounded-xl border p-3 text-xs ${
                    sweepResult.parity_audit?.status === "pass"
                      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                      : "border-destructive/25 bg-destructive/10 text-destructive"
                  }`}
                >
                  <div className="font-semibold">
                    Evaluator parity:{" "}
                    {(sweepResult.parity_audit?.status || "unknown").toUpperCase()}
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    Sweep metrics are checked against the same honest execution simulator used by
                    holdout and walk-forward paths.
                  </div>
                  {sweepResult.parity_audit?.differences &&
                    sweepResult.parity_audit.differences.length > 0 && (
                      <div className="mt-2 space-y-1 font-mono-num text-[11px]">
                        {sweepResult.parity_audit.differences.slice(0, 4).map((diff, index) => (
                          <div key={`${diff.metric}-${index}`}>
                            {diff.metric}: {String(diff.left)} vs {String(diff.right)}
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="flex flex-col gap-3 rounded-xl border border-border/30 bg-background/15 p-3 md:flex-row md:items-center md:justify-between">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={sweepShortlistOnly}
                      onChange={(event) => setSweepShortlistOnly(event.target.checked)}
                      className="rounded border-border bg-background/50"
                    />
                    Show shortlist candidates only
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    Sort by
                    <select
                      value={sweepSortKey}
                      onChange={(event) => setSweepSortKey(event.target.value)}
                      className="rounded-lg border border-border bg-background/70 px-2 py-1 text-xs text-foreground"
                    >
                      <option value="profit_factor">Profit Factor</option>
                      <option value="expectancy">Expectancy</option>
                      <option value="signals">Signals</option>
                      <option value="win_rate">Winrate</option>
                      <option value="average_rr">Average RR</option>
                      <option value="total_return">Total Return</option>
                      <option value="max_drawdown">Max Drawdown</option>
                    </select>
                  </label>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <table className="w-full min-w-[1180px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        <th className="px-3 py-3">Rank</th>
                        <th className="px-3 py-3 text-center">Trend</th>
                        <th className="px-3 py-3 text-center">Entry</th>
                        <th className="px-3 py-3 text-center">Conf</th>
                        <th className="px-3 py-3 text-center">Signals</th>
                        <th className="px-3 py-3 text-center">Buy</th>
                        <th className="px-3 py-3 text-center">Sell</th>
                        <th className="px-3 py-3 text-center">Winrate</th>
                        <th className="px-3 py-3 text-center">PF</th>
                        <th className="px-3 py-3 text-center">Expect</th>
                        <th className="px-3 py-3 text-center">Avg RR</th>
                        <th className="px-3 py-3 text-center">Return</th>
                        <th className="px-3 py-3 text-center">Max DD</th>
                        <th className="px-3 py-3 text-center">Gate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {sortedSweepRows.slice(0, 25).map((row) => (
                        <tr
                          key={`${row.rank}-${row.trend_threshold}-${row.entry_threshold}-${row.confidence_threshold}`}
                          className="hover:bg-background/20"
                        >
                          <td className="px-3 py-2 font-bold text-foreground">{row.rank}</td>
                          <td className="px-3 py-2 text-center">
                            {row.trend_threshold.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.entry_threshold.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.confidence_threshold.toFixed(0)}%
                          </td>
                          <td className="px-3 py-2 text-center text-foreground">{row.signals}</td>
                          <td className="px-3 py-2 text-center">{row.buy_signals}</td>
                          <td className="px-3 py-2 text-center">{row.sell_signals}</td>
                          <td className="px-3 py-2 text-center">
                            {formatNullablePercent(row.win_rate)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.profit_factor)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(row.expectancy)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.average_rr)}
                          </td>
                          <td className="px-3 py-2 text-center">{row.total_return.toFixed(2)}%</td>
                          <td className="px-3 py-2 text-center">{row.max_drawdown.toFixed(2)}%</td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${row.shortlisted ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400" : "border-border bg-background/20 text-muted-foreground"}`}
                            >
                              {row.shortlisted ? "Shortlist" : "Review"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {segmentedHoldoutSets.length > 0 ? (
                  <div className="rounded-xl border border-border/40 bg-background/20 p-4">
                    <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Segmented Holdout Stability Check
                    </div>
                    <div className="space-y-3">
                      {segmentedHoldoutSets.slice(0, 3).map((set) => (
                        <div
                          key={`${set.rank}-${set.trend_threshold}-${set.entry_threshold}`}
                          className="rounded-lg border border-border/25 bg-background/20 p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
                            <span className="font-mono-num font-bold text-foreground">
                              Rank {set.rank}
                            </span>
                            <span className="text-muted-foreground">
                              Trend {set.trend_threshold.toFixed(2)} / Entry{" "}
                              {set.entry_threshold.toFixed(2)} / Conf{" "}
                              {set.confidence_threshold.toFixed(0)}%
                            </span>
                          </div>
                          <div className="grid gap-2 md:grid-cols-4">
                            {set.periods.map((period) => (
                              <div
                                key={period.period}
                                className="rounded border border-border/20 bg-background/25 p-2 text-[11px]"
                              >
                                <div className="font-semibold text-foreground">
                                  Period {period.period}
                                </div>
                                <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-muted-foreground">
                                  <span>Rows</span>
                                  <span className="text-right font-mono-num">{period.rows}</span>
                                  <span>Signals</span>
                                  <span className="text-right font-mono-num">{period.signals}</span>
                                  <span>PF</span>
                                  <span className="text-right font-mono-num">
                                    {formatNullableNumber(period.profit_factor)}
                                  </span>
                                  <span>Expect</span>
                                  <span className="text-right font-mono-num">
                                    {formatNullableSigned(period.expectancy)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <DataState message="No threshold set passed the initial quality gates yet, so segmented holdout stability is waiting for shortlist candidates." />
                )}
              </>
            ) : (
              <DataState message="Run a diagnostic threshold sweep to evaluate cached-prediction combinations." />
            )}
          </div>
        </SectionCard>

        <SectionCard numeral="08" title="Phase A Label Research Workspace" icon={BrainCircuit}>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="max-w-3xl text-xs text-muted-foreground">
                Runs a curated cost-aware label experiment batch only. It writes research results,
                keeps candidate/champion files untouched, and cannot promote a model.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  M5 candles
                  <Input
                    type="number"
                    value={phaseAAnchorCount}
                    min={1000}
                    max={50000}
                    step={1000}
                    onChange={(event) => setPhaseAAnchorCount(Number(event.target.value))}
                    className="w-28"
                  />
                </label>
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Runs
                  <Input
                    type="number"
                    value={phaseAMaxRuns}
                    min={1}
                    max={36}
                    onChange={(event) => setPhaseAMaxRuns(Number(event.target.value))}
                    className="w-20"
                  />
                </label>
                <Button
                  disabled={
                    phaseAPending ||
                    Boolean(phaseAJobId) ||
                    trainingPending ||
                    !capabilities.model_training.allowed
                  }
                  onClick={() => void startPhaseAExperiments()}
                  className="h-9 rounded-xl bg-gradient-gold px-4 text-sm font-semibold text-background shadow-gold"
                >
                  {phaseAPending || phaseAJobId ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 size-4" />
                  )}
                  Start Phase A
                </Button>
              </div>
            </div>

            {(phaseAJobId || phaseAState) && (
              <div className="rounded-xl border border-border/35 bg-background/20 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Research job {phaseAJobId ?? "latest"}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {(phaseAState || "idle").toUpperCase()} {phaseAProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={phaseAProgress} className="h-2 bg-background/40" />
              </div>
            )}

            {phaseAError && (
              <p className="break-words rounded-lg border border-destructive/25 bg-destructive/10 p-2.5 text-center text-xs font-semibold text-destructive">
                Phase A Failed: {phaseAError}
              </p>
            )}

            {phaseAResult && phaseAResult.leaderboard?.length ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    ["Batch", phaseAResult.batch_id],
                    ["Matrix", phaseAResult.matrix_used?.length],
                    ["Failures", phaseAResult.failures?.length ?? 0],
                    ["Phase B", phaseAResult.qualifies_for_phase_b ? "Qualified" : "Not qualified"],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/30 bg-background/20 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                        {String(value ?? "N/A")}
                      </div>
                    </div>
                  ))}
                </div>

                {phaseAResult.best_label_config && (
                  <div className="rounded-xl border border-[oklch(0.84_0.08_305/0.22)] bg-[oklch(0.84_0.08_305/0.08)] p-3 text-xs">
                    <div className="font-semibold text-foreground">Best label configuration</div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono-num text-muted-foreground">
                      <span>Mode {phaseAResult.best_label_config.barrier_mode}</span>
                      <span>RR {phaseAResult.best_label_config.rr_multiplier}</span>
                      <span>
                        SL ATR {phaseAResult.best_label_config.sl_atr_multiplier ?? "fixed"}
                      </span>
                      <span>Lookahead {phaseAResult.best_label_config.lookahead}</span>
                      <span>
                        Net edge x{phaseAResult.best_label_config.min_net_edge_cost_multiplier}
                      </span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <table className="w-full min-w-[1360px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        <th className="px-3 py-3">Rank</th>
                        <th className="px-3 py-3">Experiment</th>
                        <th className="px-3 py-3 text-center">Mode</th>
                        <th className="px-3 py-3 text-center">RR</th>
                        <th className="px-3 py-3 text-center">Look</th>
                        <th className="px-3 py-3 text-center">Signals</th>
                        <th className="px-3 py-3 text-center">W/L</th>
                        <th className="px-3 py-3 text-center">Winrate</th>
                        <th className="px-3 py-3 text-center">PF</th>
                        <th className="px-3 py-3 text-center">Expect</th>
                        <th className="px-3 py-3 text-center">Costs</th>
                        <th className="px-3 py-3 text-center">Net PnL</th>
                        <th className="px-3 py-3 text-center">Max DD</th>
                        <th className="px-3 py-3 text-center">Worst PF</th>
                        <th className="px-3 py-3 text-center">Gate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseATopRows.map((row) => (
                        <tr key={row.experiment_id} className="hover:bg-background/20">
                          <td className="px-3 py-2 font-bold text-foreground">
                            {row.rank ?? "--"}
                          </td>
                          <td className="px-3 py-2 text-foreground">{row.experiment_id}</td>
                          <td className="px-3 py-2 text-center uppercase">{row.label_mode}</td>
                          <td className="px-3 py-2 text-center">
                            {row.label_config.rr_multiplier.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-center">{row.label_config.lookahead}</td>
                          <td className="px-3 py-2 text-center text-foreground">{row.signals}</td>
                          <td className="px-3 py-2 text-center">
                            {row.wins}/{row.losses}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullablePercent(row.winrate)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.profit_factor)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(row.expectancy)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatCurrency(row.total_costs)}
                          </td>
                          <td
                            className={`px-3 py-2 text-center ${
                              row.net_pnl >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {formatCurrency(row.net_pnl)}
                          </td>
                          <td className="px-3 py-2 text-center">{row.max_drawdown.toFixed(2)}%</td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.worst_fold_pf)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${
                                row.eligible_for_phase_b
                                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                                  : "border-border bg-background/20 text-muted-foreground"
                              }`}
                            >
                              {row.eligible_for_phase_b ? "Phase B" : "Rejected"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <DataState message="No Phase A research batch yet. Start a curated label experiment run." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="09"
          title="Phase A.1 — Edge Forensics & Broker Cost Audit"
          icon={ShieldCheck}
        >
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="max-w-3xl text-xs text-muted-foreground">
                Validates broker cost assumptions, compares no-cost versus realistic-cost backtests,
                attributes failures by market regime, and only qualifies labels for Phase B feature
                ablation.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  M5 candles
                  <Input
                    type="number"
                    value={phaseA1AnchorCount}
                    min={1000}
                    max={50000}
                    step={1000}
                    onChange={(event) => setPhaseA1AnchorCount(Number(event.target.value))}
                    className="w-28"
                  />
                </label>
                <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  Runs
                  <Input
                    type="number"
                    value={phaseA1MaxRuns}
                    min={1}
                    max={30}
                    onChange={(event) => setPhaseA1MaxRuns(Number(event.target.value))}
                    className="w-20"
                  />
                </label>
                <Button
                  disabled={
                    phaseA1Pending ||
                    Boolean(phaseA1JobId) ||
                    trainingPending ||
                    !capabilities.model_training.allowed
                  }
                  onClick={() => void startPhaseA1Experiments()}
                  className="h-9 rounded-xl bg-gradient-gold px-4 text-sm font-semibold text-background shadow-gold"
                >
                  {phaseA1Pending || phaseA1JobId ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 size-4" />
                  )}
                  Start Phase A.1
                </Button>
              </div>
            </div>

            {(phaseA1JobId || phaseA1State) && (
              <div className="rounded-xl border border-border/35 bg-background/20 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Edge forensics job {phaseA1JobId ?? "latest"}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {(phaseA1State || "idle").toUpperCase()} {phaseA1Progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={phaseA1Progress} className="h-2 bg-background/40" />
              </div>
            )}

            {phaseA1Error && (
              <p className="break-words rounded-lg border border-destructive/25 bg-destructive/10 p-2.5 text-center text-xs font-semibold text-destructive">
                Phase A.1 Failed: {phaseA1Error}
              </p>
            )}

            {activeBrokerEconomics ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-border/35 bg-background/20 p-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    MT5 Broker Economics
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <span>Symbol</span>
                    <span className="text-right font-mono-num text-foreground">
                      {activeBrokerEconomics.symbol ?? "N/A"}
                    </span>
                    <span>Digits / Point</span>
                    <span className="text-right font-mono-num text-foreground">
                      {activeBrokerEconomics.digits ?? "N/A"} /{" "}
                      {formatNullableNumber(activeBrokerEconomics.point, 5)}
                    </span>
                    <span>Contract</span>
                    <span className="text-right font-mono-num text-foreground">
                      {formatNullableNumber(activeBrokerEconomics.contract_size)}
                    </span>
                    <span>Volume min / step</span>
                    <span className="text-right font-mono-num text-foreground">
                      {formatNullableNumber(activeBrokerEconomics.volume_min)} /{" "}
                      {formatNullableNumber(activeBrokerEconomics.volume_step)}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-border/35 bg-background/20 p-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Live Spread & Commission
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <span>Spread points</span>
                    <span className="text-right font-mono-num text-foreground">
                      {formatNullableNumber(activeBrokerEconomics.spread_points)}
                    </span>
                    <span>Spread pips</span>
                    <span className="text-right font-mono-num text-foreground">
                      {formatNullableNumber(activeBrokerEconomics.spread_pips)}
                    </span>
                    <span>Commission side</span>
                    <span className="text-right font-mono-num text-foreground">
                      {formatCurrency(activeBrokerEconomics.commission_per_side_per_lot ?? 0)}
                    </span>
                    <span>Slippage pips</span>
                    <span className="text-right font-mono-num text-foreground">
                      {formatNullableNumber(activeBrokerEconomics.slippage_pips)}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-border/35 bg-background/20 p-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Round-trip Cost
                  </div>
                  <div className="mt-2 space-y-1 text-xs">
                    {Object.entries(
                      activeBrokerEconomics.estimated_round_trip_cost_by_lot ?? {},
                    ).map(([lot, cost]) => (
                      <div key={lot} className="flex justify-between gap-3">
                        <span>{lot} lot</span>
                        <span className="font-mono-num text-foreground">
                          {formatCurrency(cost.total_usd)} / {cost.total_pips.toFixed(2)} pips
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <DataState message="Broker economics audit has not loaded yet." />
            )}

            {phaseA1Result && phaseA1Result.leaderboard?.length ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[
                    ["Batch", phaseA1Result.batch_id],
                    ["Cost audit", phaseA1Result.cost_audit?.status],
                    ["Matrix", phaseA1Result.matrix_used?.length],
                    ["Best shadow", phaseA1Result.best_shadow_conclusion],
                    ["Phase B", phaseA1Result.qualifies_for_phase_b ? "Ready" : "Not ready"],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/30 bg-background/20 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                        {String(value ?? "N/A")}
                      </div>
                    </div>
                  ))}
                </div>

                {bestShadowProfiles && (
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          <th className="px-3 py-3">Cost Profile</th>
                          <th className="px-3 py-3 text-center">Trades</th>
                          <th className="px-3 py-3 text-center">W/L</th>
                          <th className="px-3 py-3 text-center">Winrate</th>
                          <th className="px-3 py-3 text-center">PF</th>
                          <th className="px-3 py-3 text-center">Expect</th>
                          <th className="px-3 py-3 text-center">Costs</th>
                          <th className="px-3 py-3 text-center">Net PnL</th>
                          <th className="px-3 py-3 text-center">Expect R</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {Object.entries(bestShadowProfiles).map(([profile, metrics]) => (
                          <tr key={profile} className="hover:bg-background/20">
                            <td className="px-3 py-2 font-semibold text-foreground">{profile}</td>
                            <td className="px-3 py-2 text-center">{metrics.total_trades}</td>
                            <td className="px-3 py-2 text-center">
                              {metrics.wins}/{metrics.losses}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullablePercent(metrics.win_rate)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(metrics.profit_factor)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(metrics.expectancy)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(metrics.cost_totals?.total ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(metrics.net_pnl)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(metrics.r_metrics?.expectancy_r, 3)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-3">
                  {(["side", "session", "exit_result"] as const).map((group) => (
                    <div
                      key={group}
                      className="rounded-xl border border-border/35 bg-background/20 p-3"
                    >
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Failure attribution: {group}
                      </div>
                      <div className="space-y-1 text-xs">
                        {(phaseA1Best?.failure_attribution?.[group] ?? [])
                          .slice(0, 5)
                          .map((row) => (
                            <div key={row.bucket} className="grid grid-cols-4 gap-2">
                              <span className="truncate text-foreground">{row.bucket}</span>
                              <span className="text-right font-mono-num">{row.signals}</span>
                              <span className="text-right font-mono-num">
                                {formatNullableNumber(row.profit_factor)}
                              </span>
                              <span className="text-right font-mono-num">
                                {formatCurrency(row.net_pnl)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <table className="w-full min-w-[1500px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        <th className="px-3 py-3">Rank</th>
                        <th className="px-3 py-3">Experiment</th>
                        <th className="px-3 py-3 text-center">Session</th>
                        <th className="px-3 py-3 text-center">SL ATR</th>
                        <th className="px-3 py-3 text-center">RR</th>
                        <th className="px-3 py-3 text-center">Look</th>
                        <th className="px-3 py-3 text-center">Signals</th>
                        <th className="px-3 py-3 text-center">PF</th>
                        <th className="px-3 py-3 text-center">Expect</th>
                        <th className="px-3 py-3 text-center">Expect R</th>
                        <th className="px-3 py-3 text-center">Cost R</th>
                        <th className="px-3 py-3 text-center">Move pips</th>
                        <th className="px-3 py-3 text-center">DD</th>
                        <th className="px-3 py-3 text-center">Shadow</th>
                        <th className="px-3 py-3 text-center">Phase B</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseA1TopRows.map((row) => (
                        <tr key={row.experiment_id} className="hover:bg-background/20">
                          <td className="px-3 py-2 font-bold text-foreground">
                            {row.rank ?? "--"}
                          </td>
                          <td className="px-3 py-2 text-foreground">{row.experiment_id}</td>
                          <td className="px-3 py-2 text-center">
                            {row.label_config.session_filter ?? "all"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.label_config.sl_atr_multiplier)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.label_config.rr_multiplier.toFixed(1)}
                          </td>
                          <td className="px-3 py-2 text-center">{row.label_config.lookahead}</td>
                          <td className="px-3 py-2 text-center">{row.signals}</td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.profit_factor)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(row.expectancy)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.expectancy_r, 3)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.average_cost_per_trade_r, 3)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(row.average_trade_move_pips)}
                          </td>
                          <td className="px-3 py-2 text-center">{row.max_drawdown.toFixed(2)}%</td>
                          <td className="px-3 py-2 text-center">
                            {row.shadow_cost_backtest?.diagnostic_conclusion ?? row.status ?? "N/A"}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${
                                row.eligible_for_phase_b
                                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                                  : "border-border bg-background/20 text-muted-foreground"
                              }`}
                            >
                              {row.eligible_for_phase_b ? "Ready" : "No"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <DataState message="No Phase A.1 edge forensics batch yet. Start a curated broker-cost run." />
            )}
          </div>
        </SectionCard>

        <details className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-amber-100">
            Research History - Legacy Phase B through B.5
            <span className="ml-3 font-mono-num text-[10px] uppercase tracking-[0.14em] text-amber-200/80">
              LEGACY - PRE COUNT-INTEGRITY AUDIT / NOT VALID FOR PROMOTION OR PHASE-C GATING
            </span>
          </summary>
          <div className="mt-4 space-y-5">
            <div className="rounded-xl border border-amber-400/25 bg-background/35 p-3 text-xs text-amber-100">
              Historical Phase B through Phase B.5 artifacts are preserved for review only. Use
              Phase B.5.1 and B.5.2 for active count-safe research decisions.
            </div>

            <SectionCard
              numeral="10"
              title="Phase B — Feature Ablation & Trade Quality Research"
              icon={BrainCircuit}
            >
              <div className="space-y-5">
                <p className="text-xs text-muted-foreground">
                  Research-only controlled ablation. The Phase A.1 New York ATR baseline stays
                  locked while feature groups and curated trade-quality gates are tested with
                  realistic costs. No model promotion or live execution changes are allowed from
                  this workspace.
                </p>

                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      M5 candles
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={50000}
                      value={phaseBAnchorCount}
                      onChange={(event) => setPhaseBAnchorCount(Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Quality gate runs
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={phaseBQualityRuns}
                      onChange={(event) => setPhaseBQualityRuns(Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                    />
                  </div>
                  <Button
                    disabled={
                      phaseBPending ||
                      Boolean(phaseBJobId) ||
                      Boolean(phaseAJobId) ||
                      Boolean(phaseA1JobId) ||
                      !capabilities.model_training.allowed
                    }
                    onClick={() => void startPhaseBExperiments()}
                    className="self-end bg-gradient-gold text-background hover:opacity-90"
                  >
                    {phaseBPending || phaseBJobId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Zap className="mr-2 h-4 w-4" />
                    )}
                    Start Phase B
                  </Button>
                </div>

                {(phaseBJobId || phaseBState) && (
                  <div className="rounded-xl border border-border/35 bg-background/25 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Phase B job {phaseBJobId ?? "latest"}
                      </span>
                      <span className="font-mono-num text-foreground">
                        {(phaseBState || "idle").toUpperCase()} {phaseBProgress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={phaseBProgress} className="h-2 bg-background/40" />
                  </div>
                )}

                {phaseBError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    Phase B Failed: {phaseBError}
                  </div>
                )}

                {phaseBResult?.locked_baseline && (
                  <div className="grid gap-3 md:grid-cols-5">
                    {[
                      ["Session", phaseBResult.locked_baseline.session_filter ?? "new_york"],
                      ["SL ATR", phaseBResult.locked_baseline.sl_atr_multiplier],
                      ["RR", phaseBResult.locked_baseline.rr_multiplier],
                      ["Lookahead", phaseBResult.locked_baseline.lookahead],
                      ["Cost edge", phaseBResult.locked_baseline.min_net_edge_cost_multiplier],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-xl border border-border/30 bg-background/20 p-3"
                      >
                        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {label}
                        </div>
                        <div className="mt-1 font-mono-num text-sm font-bold text-foreground">
                          {String(value ?? "N/A")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {phaseBResult?.feature_ablation?.leaderboard?.length ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-4">
                      {[
                        ["Batch", phaseBResult.batch_id],
                        [
                          "Best feature set",
                          phaseBBestFeature ?? phaseBResult.feature_ablation.best_feature_set,
                        ],
                        ["Phase C", phaseBResult.qualifies_for_phase_c ? "Ready" : "Not ready"],
                        ["Reason", phaseBResult.phase_c_readiness_decision?.reason],
                      ].map(([label, value]) => (
                        <div
                          key={String(label)}
                          className="rounded-xl border border-border/30 bg-background/20 p-3"
                        >
                          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                            {String(value ?? "N/A")}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                      <table className="w-full min-w-[1500px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            <th className="px-3 py-3">Rank</th>
                            <th className="px-3 py-3">Feature Set</th>
                            <th className="px-3 py-3 text-center">Features</th>
                            <th className="px-3 py-3 text-center">Signals</th>
                            <th className="px-3 py-3 text-center">W/L</th>
                            <th className="px-3 py-3 text-center">Winrate</th>
                            <th className="px-3 py-3 text-center">Real PF</th>
                            <th className="px-3 py-3 text-center">No-cost PF</th>
                            <th className="px-3 py-3 text-center">Expect</th>
                            <th className="px-3 py-3 text-center">Expect R</th>
                            <th className="px-3 py-3 text-center">Costs</th>
                            <th className="px-3 py-3 text-center">Net PnL</th>
                            <th className="px-3 py-3 text-center">DD</th>
                            <th className="px-3 py-3 text-center">Worst PF</th>
                            <th className="px-3 py-3 text-center">B/S</th>
                            <th className="px-3 py-3 text-center">Phase C</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {phaseBFeatureRows.map((row) => (
                            <tr key={row.experiment_id} className="hover:bg-background/20">
                              <td className="px-3 py-2 font-bold text-foreground">
                                {row.rank ?? "--"}
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-sans font-semibold text-foreground">
                                  {row.feature_set} — {row.feature_set_label}
                                </div>
                                <div className="max-w-[260px] truncate text-[10px] text-muted-foreground">
                                  {row.rejection_reason ?? row.status}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">{row.feature_count ?? "--"}</td>
                              <td className="px-3 py-2 text-center">{row.signals ?? 0}</td>
                              <td className="px-3 py-2 text-center">
                                {row.wins ?? 0}/{row.losses ?? 0}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullablePercent(row.winrate)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.profit_factor)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(
                                  row.shadow_cost_backtest?.profiles?.no_cost?.profit_factor,
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableSigned(row.expectancy)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.expectancy_r, 3)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(row.total_costs ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(row.net_pnl ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.max_drawdown)}%
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.worst_fold_pf)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.buy_signals ?? 0}/{row.sell_signals ?? 0}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${
                                    row.eligible_for_phase_c
                                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                                      : "border-border bg-background/20 text-muted-foreground"
                                  }`}
                                >
                                  {row.eligible_for_phase_c ? "Ready" : "No"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Feature Contribution Summary
                        </div>
                        <div className="space-y-2">
                          {(phaseBResult.feature_ablation.contribution_summary ?? []).map((row) => (
                            <div
                              key={row.feature_set}
                              className="grid grid-cols-[80px_1fr_90px_90px] items-center gap-2 rounded-lg border border-border/20 bg-background/20 px-3 py-2 text-xs"
                            >
                              <span className="font-mono-num font-bold text-foreground">
                                {row.feature_set}
                              </span>
                              <span className="truncate text-muted-foreground">
                                {row.added_group}
                              </span>
                              <span
                                className={`text-center font-semibold ${
                                  row.classification === "HELPS"
                                    ? "text-emerald-400"
                                    : row.classification === "HURTS"
                                      ? "text-red-400"
                                      : row.classification === "UNSTABLE"
                                        ? "text-amber-300"
                                        : "text-muted-foreground"
                                }`}
                              >
                                {row.classification}
                              </span>
                              <span className="text-right font-mono-num">
                                {row.delta_realistic_pf >= 0 ? "+" : ""}
                                {row.delta_realistic_pf.toFixed(3)} PF
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Phase C Readiness
                        </div>
                        <div className="space-y-2 text-xs">
                          {phaseBBestQuality?.phase_c_readiness_checks ? (
                            Object.entries(phaseBBestQuality.phase_c_readiness_checks).map(
                              ([key, passed]) => (
                                <div key={key} className="flex items-center justify-between gap-3">
                                  <span className="truncate text-muted-foreground">{key}</span>
                                  <span className={passed ? "text-emerald-400" : "text-red-400"}>
                                    {passed ? "PASS" : "FAIL"}
                                  </span>
                                </div>
                              ),
                            )
                          ) : (
                            <DataState message="No quality-gate readiness checks yet." />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                      <table className="w-full min-w-[1500px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            <th className="px-3 py-3">Rank</th>
                            <th className="px-3 py-3">Quality Config</th>
                            <th className="px-3 py-3 text-center">Session</th>
                            <th className="px-3 py-3 text-center">Move/Cost</th>
                            <th className="px-3 py-3 text-center">Spread</th>
                            <th className="px-3 py-3 text-center">Cooldown</th>
                            <th className="px-3 py-3 text-center">Signals</th>
                            <th className="px-3 py-3 text-center">PF</th>
                            <th className="px-3 py-3 text-center">No-cost PF</th>
                            <th className="px-3 py-3 text-center">Expect</th>
                            <th className="px-3 py-3 text-center">Net PnL</th>
                            <th className="px-3 py-3 text-center">DD</th>
                            <th className="px-3 py-3 text-center">Worst PF</th>
                            <th className="px-3 py-3 text-center">B/S</th>
                            <th className="px-3 py-3 text-center">Phase C</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {phaseBQualityRows.map((row) => (
                            <tr key={row.experiment_id} className="hover:bg-background/20">
                              <td className="px-3 py-2 font-bold text-foreground">
                                {row.rank ?? "--"}
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-sans font-semibold text-foreground">
                                  {row.quality_config?.name ?? row.experiment_id}
                                </div>
                                <div className="max-w-[260px] truncate text-[10px] text-muted-foreground">
                                  {row.rejection_reason ?? row.status}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.quality_config?.session_filter ?? row.session_filter}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.quality_config?.min_move_cost_ratio)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.quality_config?.max_spread_pips)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.quality_config?.cooldown_bars ?? 0}
                              </td>
                              <td className="px-3 py-2 text-center">{row.signals ?? 0}</td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.profit_factor)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(
                                  row.shadow_cost_backtest?.profiles?.no_cost?.profit_factor,
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableSigned(row.expectancy)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(row.net_pnl ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.max_drawdown)}%
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.worst_fold_pf)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.buy_signals ?? 0}/{row.sell_signals ?? 0}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span
                                  className={`rounded border px-2 py-0.5 text-[10px] font-sans font-semibold ${
                                    row.eligible_for_phase_c
                                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                                      : "border-border bg-background/20 text-muted-foreground"
                                  }`}
                                >
                                  {row.eligible_for_phase_c ? "Ready" : "No"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <DataState message="No Phase B batch yet. Start controlled feature ablation after Phase A.1 is ready." />
                )}
              </div>
            </SectionCard>

            <SectionCard
              numeral="11"
              title="Phase B.3 — Robustness & Shadow-Cost Integrity Audit"
              icon={ShieldCheck}
            >
              <div className="space-y-5">
                <p className="text-xs text-muted-foreground">
                  Audits the cooldown_6 red flag by separating fixed-trade shadow cost from full
                  bid/ask replay, then runs orthogonal feature ablation and neighborhood robustness
                  before Phase C can be considered.
                </p>

                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      M5 candles
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={50000}
                      value={phaseB3AnchorCount}
                      onChange={(event) => setPhaseB3AnchorCount(Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Robustness runs
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={phaseB3RobustnessRuns}
                      onChange={(event) => setPhaseB3RobustnessRuns(Number(event.target.value))}
                      className="mt-2 w-full rounded-xl border border-border/40 bg-background/45 px-4 py-2 text-sm font-mono-num text-foreground outline-none focus:border-primary/60"
                    />
                  </div>
                  <Button
                    disabled={
                      phaseB3Pending ||
                      Boolean(phaseB3JobId) ||
                      Boolean(phaseAJobId) ||
                      Boolean(phaseA1JobId) ||
                      Boolean(phaseBJobId) ||
                      !capabilities.model_training.allowed
                    }
                    onClick={() => void startPhaseB3Experiments()}
                    className="self-end bg-gradient-gold text-background hover:opacity-90"
                  >
                    {phaseB3Pending || phaseB3JobId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-4 w-4" />
                    )}
                    Start Phase B.3
                  </Button>
                </div>

                {(phaseB3JobId || phaseB3State) && (
                  <div className="rounded-xl border border-border/35 bg-background/25 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Phase B.3 job {phaseB3JobId ?? "latest"}
                      </span>
                      <span className="font-mono-num text-foreground">
                        {(phaseB3State || "idle").toUpperCase()} {phaseB3Progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={phaseB3Progress} className="h-2 bg-background/40" />
                  </div>
                )}

                {phaseB3Error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    Phase B.3 Failed: {phaseB3Error}
                  </div>
                )}

                {phaseB3Result?.orthogonal_ablation?.leaderboard?.length ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-4">
                      {[
                        ["Batch", phaseB3Result.batch_id],
                        [
                          "Fixed shadow",
                          phaseB3BestFixed?.monotonicity?.status?.toUpperCase() ?? "N/A",
                        ],
                        [
                          "Robustness",
                          phaseB3Result.neighborhood_robustness?.summary?.classification ?? "N/A",
                        ],
                        ["Phase C", phaseB3Result.qualifies_for_phase_c ? "Ready" : "Not ready"],
                      ].map(([label, value]) => (
                        <div
                          key={String(label)}
                          className="rounded-xl border border-border/30 bg-background/20 p-3"
                        >
                          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                            {String(value ?? "N/A")}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="overflow-hidden rounded-xl border border-border/40 bg-background/25">
                        <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Fixed-Trade Shadow Cost
                        </div>
                        <table className="w-full text-xs">
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {Object.entries(phaseB3BestFixed?.profiles ?? {}).map(
                              ([profile, metrics]) => (
                                <tr key={profile}>
                                  <td className="px-3 py-2 font-sans font-semibold text-foreground">
                                    {profile}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    PF {formatNullableNumber(metrics.profit_factor)}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {formatCurrency(metrics.net_pnl)}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {formatNullableSigned(metrics.expectancy)}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-border/40 bg-background/25">
                        <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Full Execution Replay
                        </div>
                        <table className="w-full text-xs">
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {Object.entries(phaseB3BestFullReplay?.profiles ?? {}).map(
                              ([profile, metrics]) => (
                                <tr key={profile}>
                                  <td className="px-3 py-2 font-sans font-semibold text-foreground">
                                    {profile}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    Trades {metrics.total_trades}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    PF {formatNullableNumber(metrics.profit_factor)}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {formatCurrency(metrics.net_pnl)}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <details className="rounded-xl border border-border/40 bg-background/25 p-3">
                      <summary className="cursor-pointer text-xs font-semibold text-foreground">
                        Trade Ledger Audit
                      </summary>
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/30 text-[10px] uppercase text-muted-foreground">
                              <th className="px-3 py-2">Trade</th>
                              <th className="px-3 py-2">Profile</th>
                              <th className="px-3 py-2">Side</th>
                              <th className="px-3 py-2 text-right">Raw</th>
                              <th className="px-3 py-2 text-right">Cost</th>
                              <th className="px-3 py-2 text-right">Net</th>
                              <th className="px-3 py-2 text-right">R</th>
                              <th className="px-3 py-2 text-right">MFE</th>
                              <th className="px-3 py-2 text-right">MAE</th>
                              <th className="px-3 py-2">Exit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {(phaseB3BestFixed?.ledger ?? []).slice(0, 36).map((row, index) => (
                              <tr key={`${String(row.trade_id)}-${String(row.profile)}-${index}`}>
                                <td className="px-3 py-2">{String(row.trade_id ?? "--")}</td>
                                <td className="px-3 py-2">{String(row.profile ?? "--")}</td>
                                <td className="px-3 py-2">{String(row.side ?? "--")}</td>
                                <td className="px-3 py-2 text-right">
                                  {formatCurrency(Number(row.raw_pnl ?? 0))}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {formatCurrency(Number(row.total_cost ?? 0))}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {formatCurrency(Number(row.net_pnl ?? 0))}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {formatNullableNumber(Number(row.pnl_r ?? 0), 3)}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {formatNullableNumber(Number(row.MFE ?? 0))}
                                </td>
                                <td className="px-3 py-2 text-right">
                                  {formatNullableNumber(Number(row.MAE ?? 0))}
                                </td>
                                <td className="px-3 py-2">{String(row.exit_reason ?? "--")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>

                    <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                      <table className="w-full min-w-[1350px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            <th className="px-3 py-3">Rank</th>
                            <th className="px-3 py-3">Orthogonal Set</th>
                            <th className="px-3 py-3 text-center">Features</th>
                            <th className="px-3 py-3 text-center">Signals</th>
                            <th className="px-3 py-3 text-center">Replay PF</th>
                            <th className="px-3 py-3 text-center">Fixed PF</th>
                            <th className="px-3 py-3 text-center">Expect</th>
                            <th className="px-3 py-3 text-center">Net PnL</th>
                            <th className="px-3 py-3 text-center">Costs</th>
                            <th className="px-3 py-3 text-center">DD</th>
                            <th className="px-3 py-3 text-center">Worst PF</th>
                            <th className="px-3 py-3 text-center">B/S</th>
                            <th className="px-3 py-3 text-center">Mono</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {phaseB3OrthogonalRows.map((row) => (
                            <tr key={row.experiment_id} className="hover:bg-background/20">
                              <td className="px-3 py-2 font-bold text-foreground">
                                {row.rank ?? "--"}
                              </td>
                              <td className="px-3 py-2">
                                <div className="font-sans font-semibold text-foreground">
                                  {row.feature_set} —{" "}
                                  {row.orthogonal_label ?? row.feature_set_label}
                                </div>
                                <div className="max-w-[260px] truncate text-[10px] text-muted-foreground">
                                  {row.rejection_reason ?? row.status}
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">{row.feature_count ?? "--"}</td>
                              <td className="px-3 py-2 text-center">{row.signals ?? 0}</td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.profit_factor)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(
                                  row.fixed_trade_shadow_cost?.profiles?.realistic_cost
                                    ?.profit_factor,
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableSigned(row.expectancy)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(row.net_pnl ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(row.total_costs ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.max_drawdown)}%
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(row.worst_fold_pf)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.buy_signals ?? 0}/{row.sell_signals ?? 0}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.fixed_shadow_monotonicity?.status?.toUpperCase() ?? "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                        <table className="w-full min-w-[1250px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                              <th className="px-3 py-3">Rank</th>
                              <th className="px-3 py-3">Neighbor</th>
                              <th className="px-3 py-3 text-center">Session</th>
                              <th className="px-3 py-3 text-center">Ratio</th>
                              <th className="px-3 py-3 text-center">Spread</th>
                              <th className="px-3 py-3 text-center">Cooldown</th>
                              <th className="px-3 py-3 text-center">Signals</th>
                              <th className="px-3 py-3 text-center">PF</th>
                              <th className="px-3 py-3 text-center">Expect</th>
                              <th className="px-3 py-3 text-center">Net</th>
                              <th className="px-3 py-3 text-center">Fold %</th>
                              <th className="px-3 py-3 text-center">Phase C</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {phaseB3RobustnessRows.map((row) => (
                              <tr key={row.experiment_id} className="hover:bg-background/20">
                                <td className="px-3 py-2 font-bold text-foreground">
                                  {row.rank ?? "--"}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="font-sans font-semibold text-foreground">
                                    {row.quality_config?.name ?? row.experiment_id}
                                  </div>
                                  <div className="max-w-[260px] truncate text-[10px] text-muted-foreground">
                                    {row.rejection_reason ?? row.status}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {row.quality_config?.session_filter ?? row.session_filter}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(row.quality_config?.min_move_cost_ratio)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(row.quality_config?.max_spread_pips)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {row.quality_config?.cooldown_bars ?? 0}
                                </td>
                                <td className="px-3 py-2 text-center">{row.signals ?? 0}</td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(row.profit_factor)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableSigned(row.expectancy)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatCurrency(row.net_pnl ?? 0)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullablePercent(
                                    Number(
                                      (
                                        row.rolling_wf_expansion as
                                          | Record<string, unknown>
                                          | undefined
                                      )?.best_fold_contribution_pct ?? NaN,
                                    ),
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {row.eligible_for_phase_c ? "Ready" : "No"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Robustness Summary
                        </div>
                        <div className="space-y-2 text-xs">
                          {[
                            [
                              "Classification",
                              phaseB3Result.neighborhood_robustness?.summary?.classification,
                            ],
                            [
                              "Profitable neighbors",
                              formatNullablePercent(
                                phaseB3Result.neighborhood_robustness?.summary
                                  ?.profitable_neighbor_percentage,
                              ),
                            ],
                            [
                              "Median PF",
                              formatNullableNumber(
                                phaseB3Result.neighborhood_robustness?.summary?.median_pf,
                              ),
                            ],
                            [
                              "PF std",
                              formatNullableNumber(
                                phaseB3Result.neighborhood_robustness?.summary
                                  ?.pf_standard_deviation,
                              ),
                            ],
                            [
                              "Worst PF",
                              formatNullableNumber(
                                phaseB3Result.neighborhood_robustness?.summary?.worst_neighbor_pf,
                              ),
                            ],
                            [
                              "Best fold contribution",
                              formatNullablePercent(
                                phaseB3Result.neighborhood_robustness?.summary
                                  ?.best_fold_contribution_pct,
                              ),
                            ],
                          ].map(([label, value]) => (
                            <div key={String(label)} className="flex justify-between gap-3">
                              <span className="text-muted-foreground">{label}</span>
                              <span className="font-mono-num text-foreground">
                                {String(value ?? "N/A")}
                              </span>
                            </div>
                          ))}
                        </div>
                        {phaseB3Result.m1_history_warning && (
                          <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/10 p-2 text-xs text-amber-200">
                            {phaseB3Result.m1_history_warning}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                      <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Phase C Readiness
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {Object.entries(phaseB3Result.phase_c_readiness_decision?.checks ?? {}).map(
                          ([key, passed]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between gap-3 text-xs"
                            >
                              <span className="truncate text-muted-foreground">{key}</span>
                              <span className={passed ? "text-emerald-400" : "text-red-400"}>
                                {passed ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {phaseB3Result.phase_c_readiness_decision?.reason}
                      </div>
                    </div>
                  </>
                ) : (
                  <DataState message="No Phase B.3 audit batch yet. Run this before Phase C." />
                )}
              </div>
            </SectionCard>

            <SectionCard
              numeral="12"
              title="Phase B.4 — Evidence Expansion & Locked Confirmation"
              icon={Lock}
            >
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Expands evidence to 20,000 M5 candles, freezes discovery-selected configs, and
                  replays only qualifying configs on the untouched confirmation region before Phase
                  C.
                </p>

                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <label className="space-y-1 text-xs">
                    <span className="text-muted-foreground">M5 Candles</span>
                    <input
                      type="number"
                      min={20000}
                      max={50000}
                      step={1000}
                      value={phaseB4AnchorCount}
                      onChange={(event) =>
                        setPhaseB4AnchorCount(
                          Math.min(50000, Math.max(20000, Number(event.target.value) || 20000)),
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="text-muted-foreground">Matrix Runs</span>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      step={1}
                      value={phaseB4MatrixRuns}
                      onChange={(event) =>
                        setPhaseB4MatrixRuns(
                          Math.min(24, Math.max(1, Number(event.target.value) || 24)),
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                    />
                  </label>
                  <Button
                    disabled={phaseB4Pending || Boolean(phaseB4JobId)}
                    onClick={() => void startPhaseB4Experiments()}
                    className="self-end bg-gradient-gold text-background hover:opacity-90"
                  >
                    {phaseB4Pending || phaseB4JobId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    Start Phase B.4
                  </Button>
                </div>

                {(phaseB4JobId || phaseB4State) && (
                  <div className="rounded-xl border border-border/35 bg-background/25 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Phase B.4 job {phaseB4JobId ?? "latest"}
                      </span>
                      <span className="font-mono-num text-foreground">
                        {(phaseB4State || "idle").toUpperCase()} {phaseB4Progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={phaseB4Progress} className="h-2 bg-background/40" />
                  </div>
                )}

                {phaseB4Error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    Phase B.4 Failed: {phaseB4Error}
                  </div>
                )}

                {phaseB4Result?.discovery_matrix?.leaderboard?.length ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-5">
                      {[
                        ["Batch", phaseB4Result.batch_id],
                        [
                          "Data",
                          phaseB4Result.dataset_expansion_audit?.received_complete
                            ? "Complete"
                            : "Incomplete",
                        ],
                        [
                          "Matrix",
                          `${phaseB4Result.curated_matrix_manifest?.matrix_used?.length ?? 0} runs`,
                        ],
                        ["Total OOS", phaseB4Result.total_oos_signals ?? 0],
                        [
                          "Phase C",
                          phaseB4Result.phase_c_readiness_decision?.status === "ready"
                            ? "Ready"
                            : "Not ready",
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={String(label)}
                          className="rounded-xl border border-border/30 bg-background/20 p-3"
                        >
                          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                            {String(value ?? "N/A")}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                      <div className="overflow-hidden rounded-xl border border-border/40 bg-background/25">
                        <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Dataset Expansion Audit
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border/20 text-[10px] uppercase text-muted-foreground">
                              <th className="px-3 py-2 text-left">TF</th>
                              <th className="px-3 py-2 text-right">Requested</th>
                              <th className="px-3 py-2 text-right">Received</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {Object.entries(
                              phaseB4Result.dataset_expansion_audit?.fetch_audit ?? {},
                            )
                              .filter(([key]) => ["M1", "M5", "M15", "H1"].includes(key))
                              .map(([tf, audit]) => (
                                <tr key={tf}>
                                  <td className="px-3 py-2 font-sans font-semibold text-foreground">
                                    {tf}
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    {audit.requested ?? "--"}
                                  </td>
                                  <td className="px-3 py-2 text-right">{audit.received ?? "--"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Locked Manifest
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Matrix hash</span>
                            <span className="max-w-[190px] truncate font-mono-num text-foreground">
                              {phaseB4Result.curated_matrix_manifest?.matrix_hash ?? "--"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">M1 required</span>
                            <span className="font-mono-num text-foreground">
                              {phaseB4Result.dataset_expansion_audit
                                ?.required_m1_for_requested_m5 ?? "--"}
                            </span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-muted-foreground">Range</span>
                            <span className="max-w-[190px] truncate font-mono-num text-foreground">
                              {phaseB4Result.dataset_expansion_audit?.time_range?.start ?? "--"} →{" "}
                              {phaseB4Result.dataset_expansion_audit?.time_range?.end ?? "--"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                      <table className="w-full min-w-[1450px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            <th className="px-3 py-3">Rank</th>
                            <th className="px-3 py-3">Discovery Config</th>
                            <th className="px-3 py-3 text-center">Rows</th>
                            <th className="px-3 py-3 text-center">Signals</th>
                            <th className="px-3 py-3 text-center">PF</th>
                            <th className="px-3 py-3 text-center">Expect</th>
                            <th className="px-3 py-3 text-center">Net</th>
                            <th className="px-3 py-3 text-center">Worst PF</th>
                            <th className="px-3 py-3 text-center">Fold %</th>
                            <th className="px-3 py-3 text-center">B/S</th>
                            <th className="px-3 py-3 text-center">Freeze</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {phaseB4DiscoveryRows.map((row) => {
                            const rolling = row.rolling_wf_expansion as
                              | Record<string, unknown>
                              | undefined;
                            const rows = row.rows as Record<string, unknown> | undefined;
                            return (
                              <tr key={row.experiment_id} className="hover:bg-background/20">
                                <td className="px-3 py-2 font-bold text-foreground">
                                  {row.rank ?? "--"}
                                </td>
                                <td className="px-3 py-2">
                                  <div className="font-sans font-semibold text-foreground">
                                    {row.quality_config?.name ?? row.experiment_id}
                                  </div>
                                  <div className="max-w-[300px] truncate text-[10px] text-muted-foreground">
                                    {row.feature_set} · {row.feature_set_label} ·{" "}
                                    {row.rejection_reason ?? row.status}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {String(rows?.discovery ?? "--")}/
                                  {String(rows?.confirmation ?? "--")}
                                </td>
                                <td className="px-3 py-2 text-center">{row.signals ?? 0}</td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(row.profit_factor)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableSigned(row.expectancy)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatCurrency(row.net_pnl ?? 0)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(row.worst_fold_pf)}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullablePercent(
                                    Number(rolling?.best_fold_contribution_pct ?? NaN),
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {row.buy_signals ?? 0}/{row.sell_signals ?? 0}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {row.freeze_candidate ? "Frozen" : "Rejected"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                        <table className="w-full min-w-[1100px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                              <th className="px-3 py-3">Frozen Config</th>
                              <th className="px-3 py-3 text-center">Confirm Signals</th>
                              <th className="px-3 py-3 text-center">PF</th>
                              <th className="px-3 py-3 text-center">Expect</th>
                              <th className="px-3 py-3 text-center">Net</th>
                              <th className="px-3 py-3 text-center">DD</th>
                              <th className="px-3 py-3 text-center">B/S</th>
                              <th className="px-3 py-3 text-center">Class</th>
                              <th className="px-3 py-3 text-center">Phase C</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {phaseB4FrozenRows.length ? (
                              phaseB4FrozenRows.map((row) => (
                                <tr key={row.experiment_id} className="hover:bg-background/20">
                                  <td className="px-3 py-2">
                                    <div className="max-w-[220px] truncate font-sans font-semibold text-foreground">
                                      {row.experiment_id}
                                    </div>
                                    <div className="max-w-[220px] truncate text-[10px] text-muted-foreground">
                                      {row.frozen_config_hash ?? "--"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.confirmation?.signals ?? 0}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(row.confirmation?.profit_factor)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableSigned(row.confirmation?.expectancy)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatCurrency(row.confirmation?.net_pnl ?? 0)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(row.confirmation?.max_drawdown)}%
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.confirmation?.buy_signals ?? 0}/
                                    {row.confirmation?.sell_signals ?? 0}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.robustness_classification ?? "--"}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.phase_c_ready ? "Ready" : "No"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={9}
                                  className="px-4 py-6 text-center text-muted-foreground"
                                >
                                  No discovery config passed the freeze gate, so locked confirmation
                                  was not replayed.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Phase C Gate
                        </div>
                        <div className="space-y-2 text-xs">
                          {Object.entries(
                            phaseB4Result.phase_c_readiness_decision?.checks ?? {},
                          ).map(([key, passed]) => (
                            <div key={key} className="flex items-center justify-between gap-3">
                              <span className="truncate text-muted-foreground">{key}</span>
                              <span className={passed ? "text-emerald-400" : "text-red-400"}>
                                {passed ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-border/20 pt-2 text-muted-foreground">
                            {phaseB4Result.phase_c_readiness_decision?.reason}
                          </div>
                        </div>
                      </div>
                    </div>

                    {phaseB4RejectedRows.length > 0 && (
                      <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs text-muted-foreground">
                        Top discovery rows were rejected before confirmation:{" "}
                        {phaseB4RejectedRows
                          .map((row) => row.quality_config?.name ?? row.experiment_id)
                          .join(", ")}
                      </div>
                    )}
                  </>
                ) : (
                  <DataState message="No Phase B.4 evidence expansion batch yet. Run this only after B.3 confirms Phase C is not ready." />
                )}
              </div>
            </SectionCard>

            <SectionCard
              numeral="13"
              title="Phase B.5 - Regime Drift & Directional Bias Repair"
              icon={ShieldAlert}
            >
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Audits one-sided behavior, fold concentration, regime drift, and curated
                  label/horizon repairs before any Phase C research is allowed. This is
                  research-only and cannot promote a model.
                </p>

                <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100">
                  {phaseB5Result?.historical_depth_warning ??
                    "Current strict evidence depth is M5=20,000 and M1=100,000. To expand beyond 20,000 M5 candles, download additional M1 history in MT5 first."}
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                  <label className="space-y-1 text-xs">
                    <span className="text-muted-foreground">M5 Candles</span>
                    <input
                      type="number"
                      min={20000}
                      max={50000}
                      step={1000}
                      value={phaseB5AnchorCount}
                      onChange={(event) =>
                        setPhaseB5AnchorCount(
                          Math.min(50000, Math.max(20000, Number(event.target.value) || 20000)),
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                    />
                  </label>
                  <label className="space-y-1 text-xs">
                    <span className="text-muted-foreground">Curated Runs</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      step={1}
                      value={phaseB5MatrixRuns}
                      onChange={(event) =>
                        setPhaseB5MatrixRuns(
                          Math.min(30, Math.max(1, Number(event.target.value) || 18)),
                        )
                      }
                      className="w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                    />
                  </label>
                  <Button
                    disabled={phaseB5Pending || Boolean(phaseB5JobId)}
                    onClick={() => void startPhaseB5Experiments()}
                    className="self-end bg-gradient-gold text-background hover:opacity-90"
                  >
                    {phaseB5Pending || phaseB5JobId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldAlert className="mr-2 h-4 w-4" />
                    )}
                    Start Phase B.5
                  </Button>
                </div>

                {(phaseB5JobId || phaseB5State) && (
                  <div className="rounded-xl border border-border/35 bg-background/25 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Phase B.5 job {phaseB5JobId ?? "latest"}
                      </span>
                      <span className="font-mono-num text-foreground">
                        {(phaseB5State || "idle").toUpperCase()} {phaseB5Progress.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={phaseB5Progress} className="h-2 bg-background/40" />
                  </div>
                )}

                {phaseB5Error && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    Phase B.5 Failed: {phaseB5Error}
                  </div>
                )}

                {phaseB5Result?.discovery_matrix?.leaderboard?.length ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-5">
                      {[
                        ["Batch", phaseB5Result.batch_id],
                        [
                          "Matrix",
                          `${phaseB5Result.curated_matrix_manifest?.matrix_used?.length ?? 0} runs`,
                        ],
                        [
                          "Best Track",
                          `${phaseB5Best?.track ?? "--"} / ${
                            phaseB5Best?.directional_bias_audit?.classification ?? "--"
                          }`,
                        ],
                        ["Frozen", phaseB5FrozenRows.length],
                        [
                          "Phase C",
                          phaseB5Result.phase_c_readiness_decision?.status === "ready"
                            ? "Ready"
                            : "Not ready",
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={String(label)}
                          className="rounded-xl border border-border/30 bg-background/20 p-3"
                        >
                          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                            {String(value ?? "N/A")}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                        <table className="w-full min-w-[1500px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                              <th className="px-3 py-3">Rank</th>
                              <th className="px-3 py-3">Repair Config</th>
                              <th className="px-3 py-3 text-center">Track</th>
                              <th className="px-3 py-3 text-center">Bias</th>
                              <th className="px-3 py-3 text-center">Signals</th>
                              <th className="px-3 py-3 text-center">PF</th>
                              <th className="px-3 py-3 text-center">Expect</th>
                              <th className="px-3 py-3 text-center">Net</th>
                              <th className="px-3 py-3 text-center">Worst PF</th>
                              <th className="px-3 py-3 text-center">Fold %</th>
                              <th className="px-3 py-3 text-center">B/S</th>
                              <th className="px-3 py-3 text-center">Freeze</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {phaseB5DiscoveryRows.map((row) => {
                              const rolling = row.rolling_wf_expansion as
                                | Record<string, unknown>
                                | undefined;
                              return (
                                <tr key={row.experiment_id} className="hover:bg-background/20">
                                  <td className="px-3 py-2 font-bold text-foreground">
                                    {row.rank ?? "--"}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="max-w-[300px] truncate font-sans font-semibold text-foreground">
                                      {row.quality_config?.name ?? row.experiment_id}
                                    </div>
                                    <div className="max-w-[320px] truncate text-[10px] text-muted-foreground">
                                      {row.feature_set} - {row.feature_set_label} -{" "}
                                      {row.regime_filter ?? "all"} -{" "}
                                      {row.rejection_reason ?? row.status}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-center">{row.track ?? "--"}</td>
                                  <td className="px-3 py-2 text-center">
                                    {row.directional_bias_audit?.classification ?? "--"}
                                  </td>
                                  <td className="px-3 py-2 text-center">{row.signals ?? 0}</td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(row.profit_factor)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableSigned(row.expectancy)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatCurrency(row.net_pnl ?? 0)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(row.worst_fold_pf)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullablePercent(
                                      Number(rolling?.best_fold_contribution_pct ?? NaN),
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.buy_signals ?? 0}/{row.sell_signals ?? 0}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.freeze_candidate ? "Frozen" : "Rejected"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Directional Bias
                        </div>
                        <div className="space-y-2 text-xs">
                          {[
                            ["Classification", phaseB5Best?.directional_bias_audit?.classification],
                            ["Buy signals", phaseB5Best?.directional_bias_audit?.buy_signals],
                            ["Sell signals", phaseB5Best?.directional_bias_audit?.sell_signals],
                            [
                              "Buy PF",
                              formatNullableNumber(phaseB5Best?.directional_bias_audit?.buy_pf),
                            ],
                            [
                              "Sell PF",
                              formatNullableNumber(phaseB5Best?.directional_bias_audit?.sell_pf),
                            ],
                            [
                              "Buy fold",
                              formatNullablePercent(
                                phaseB5Best?.directional_bias_audit?.buy_fold_stability,
                              ),
                            ],
                            [
                              "Sell fold",
                              formatNullablePercent(
                                phaseB5Best?.directional_bias_audit?.sell_fold_stability,
                              ),
                            ],
                          ].map(([label, value]) => (
                            <div key={String(label)} className="flex justify-between gap-3">
                              <span className="text-muted-foreground">{label}</span>
                              <span className="font-mono-num text-foreground">
                                {String(value ?? "--")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                      <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Side-Specific Track Leaderboard
                      </div>
                      <table className="w-full min-w-[1000px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            <th className="px-3 py-3">Track</th>
                            <th className="px-3 py-3 text-center">Signals</th>
                            <th className="px-3 py-3 text-center">PF</th>
                            <th className="px-3 py-3 text-center">Expect</th>
                            <th className="px-3 py-3 text-center">Net</th>
                            <th className="px-3 py-3 text-center">DD</th>
                            <th className="px-3 py-3 text-center">Worst PF</th>
                            <th className="px-3 py-3 text-center">Prof Fold</th>
                            <th className="px-3 py-3 text-center">Best Fold</th>
                            <th className="px-3 py-3 text-center">Bias</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {phaseB5TrackRows.map((row, index) => (
                            <tr
                              key={`${String(row.track)}-${index}`}
                              className="hover:bg-background/20"
                            >
                              <td className="px-3 py-2 font-sans font-semibold text-foreground">
                                {String(row.track ?? "--")}
                              </td>
                              <td className="px-3 py-2 text-center">{String(row.signals ?? 0)}</td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(Number(row.profit_factor ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableSigned(Number(row.expectancy ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(Number(row.net_pnl ?? 0))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(Number(row.max_drawdown ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(Number(row.worst_fold_pf ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullablePercent(Number(row.profitable_fold_ratio ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullablePercent(
                                  Number(row.best_fold_contribution_pct ?? NaN),
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(row.directional_bias ?? "--")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                        <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Fold Attribution Dashboard
                        </div>
                        <table className="w-full min-w-[940px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                              <th className="px-3 py-3">Fold</th>
                              <th className="px-3 py-3 text-center">Signals</th>
                              <th className="px-3 py-3 text-center">B/S</th>
                              <th className="px-3 py-3 text-center">PF</th>
                              <th className="px-3 py-3 text-center">Expect</th>
                              <th className="px-3 py-3 text-center">Net</th>
                              <th className="px-3 py-3 text-center">ATR</th>
                              <th className="px-3 py-3 text-center">ADX</th>
                              <th className="px-3 py-3 text-center">TP/SL/TO</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {phaseB5FoldRows.map((fold) => {
                              const exitCounts = fold.exit_counts as
                                | { tp?: number; sl?: number; timeout?: number }
                                | undefined;
                              return (
                                <tr key={String(fold.fold)} className="hover:bg-background/20">
                                  <td className="px-3 py-2 font-bold text-foreground">
                                    {String(fold.fold ?? "--")}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {String(fold.signals ?? 0)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {String(fold.buy_signals ?? 0)}/{String(fold.sell_signals ?? 0)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(Number(fold.profit_factor ?? NaN))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableSigned(Number(fold.expectancy ?? NaN))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatCurrency(Number(fold.net_pnl ?? 0))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(Number(fold.average_atr ?? NaN))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(Number(fold.average_adx ?? NaN))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {exitCounts?.tp ?? 0}/{exitCounts?.sl ?? 0}/
                                    {exitCounts?.timeout ?? 0}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                        <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Drift Diagnostics
                        </div>
                        <table className="w-full min-w-[760px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                              <th className="px-3 py-3">Feature</th>
                              <th className="px-3 py-3 text-center">Level</th>
                              <th className="px-3 py-3 text-center">PSI</th>
                              <th className="px-3 py-3 text-center">KS</th>
                              <th className="px-3 py-3 text-center">Median Shift</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {phaseB5DriftRows.slice(0, 12).map((row) => (
                              <tr key={String(row.feature)} className="hover:bg-background/20">
                                <td className="px-3 py-2 font-sans font-semibold text-foreground">
                                  {String(row.feature ?? "--")}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {String(row.drift_level ?? row.status ?? "--")}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(Number(row.psi ?? NaN))}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(Number(row.ks ?? NaN))}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  {formatNullableNumber(Number(row.median_shift_std ?? NaN))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                      <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Regime Attribution
                      </div>
                      <table className="w-full min-w-[1040px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            <th className="px-3 py-3">Dimension</th>
                            <th className="px-3 py-3">Bucket</th>
                            <th className="px-3 py-3 text-center">Signals</th>
                            <th className="px-3 py-3 text-center">PF</th>
                            <th className="px-3 py-3 text-center">Expect</th>
                            <th className="px-3 py-3 text-center">Net</th>
                            <th className="px-3 py-3 text-center">DD</th>
                            <th className="px-3 py-3 text-center">Folds</th>
                            <th className="px-3 py-3 text-center">Prof Fold</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {phaseB5RegimeRows.map((row) => (
                            <tr
                              key={`${String(row.dimension)}-${String(row.bucket)}`}
                              className="hover:bg-background/20"
                            >
                              <td className="px-3 py-2 font-sans font-semibold text-foreground">
                                {String(row.dimension ?? "--")}
                              </td>
                              <td className="px-3 py-2">{String(row.bucket ?? "--")}</td>
                              <td className="px-3 py-2 text-center">{String(row.signals ?? 0)}</td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(Number(row.profit_factor ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableSigned(Number(row.expectancy ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatCurrency(Number(row.net_pnl ?? 0))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullableNumber(Number(row.max_drawdown ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(row.fold_count ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {formatNullablePercent(Number(row.profitable_fold_ratio ?? NaN))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                      <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                        <table className="w-full min-w-[950px] text-left text-xs">
                          <thead>
                            <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                              <th className="px-3 py-3">Frozen Config</th>
                              <th className="px-3 py-3 text-center">Signals</th>
                              <th className="px-3 py-3 text-center">PF</th>
                              <th className="px-3 py-3 text-center">Expect</th>
                              <th className="px-3 py-3 text-center">Net</th>
                              <th className="px-3 py-3 text-center">B/S</th>
                              <th className="px-3 py-3 text-center">Bias</th>
                              <th className="px-3 py-3 text-center">Phase C</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/10 font-mono-num">
                            {phaseB5FrozenRows.length ? (
                              phaseB5FrozenRows.map((row) => (
                                <tr key={row.experiment_id} className="hover:bg-background/20">
                                  <td className="px-3 py-2">
                                    <div className="max-w-[220px] truncate font-sans font-semibold text-foreground">
                                      {row.experiment_id}
                                    </div>
                                    <div className="max-w-[220px] truncate text-[10px] text-muted-foreground">
                                      {row.frozen_config_hash ?? "--"}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.confirmation?.signals ?? 0}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableNumber(row.confirmation?.profit_factor)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatNullableSigned(row.confirmation?.expectancy)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {formatCurrency(row.confirmation?.net_pnl ?? 0)}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.confirmation?.buy_signals ?? 0}/
                                    {row.confirmation?.sell_signals ?? 0}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.directional_bias_classification ?? "--"}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    {row.phase_c_ready ? "Ready" : "No"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={8}
                                  className="px-4 py-6 text-center text-muted-foreground"
                                >
                                  No B.5 config passed the discovery freeze gate, so locked
                                  confirmation was not replayed.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                        <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Phase C Gate
                        </div>
                        <div className="space-y-2 text-xs">
                          {Object.entries(
                            phaseB5Result.phase_c_readiness_decision?.checks ?? {},
                          ).map(([key, passed]) => (
                            <div key={key} className="flex items-center justify-between gap-3">
                              <span className="truncate text-muted-foreground">{key}</span>
                              <span className={passed ? "text-emerald-400" : "text-red-400"}>
                                {passed ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-border/20 pt-2 text-muted-foreground">
                            {phaseB5Result.phase_c_readiness_decision?.reason}
                          </div>
                        </div>
                      </div>
                    </div>

                    {phaseB5RejectedRows.length > 0 && (
                      <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs text-muted-foreground">
                        Top B.5 discovery rows rejected before confirmation:{" "}
                        {phaseB5RejectedRows
                          .map((row) => row.quality_config?.name ?? row.experiment_id)
                          .join(", ")}
                      </div>
                    )}
                  </>
                ) : (
                  <DataState message="No Phase B.5 repair batch yet. Run this after B.4 shows directional or fold-concentrated evidence." />
                )}
              </div>
            </SectionCard>
          </div>
        </details>

        <SectionCard
          numeral="14"
          title="Phase B.5.1 - Count Integrity & Directional Track Audit"
          icon={ShieldCheck}
        >
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Re-runs the exact B5_11 buy-only config and separates accepted signals from opened and
              closed trades. PF, expectancy, DD, costs, and freeze gates below use closed executed
              trades only.
            </p>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">M5 Candles</span>
                <input
                  type="number"
                  min={20000}
                  max={50000}
                  step={1000}
                  value={phaseB51AnchorCount}
                  onChange={(event) =>
                    setPhaseB51AnchorCount(
                      Math.min(50000, Math.max(20000, Number(event.target.value) || 20000)),
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                />
              </label>
              <Button
                disabled={phaseB51Pending || Boolean(phaseB51JobId)}
                onClick={() => void startPhaseB51Audit()}
                className="self-end bg-[oklch(0.72_0.055_300)] text-background hover:opacity-90"
              >
                {phaseB51Pending || phaseB51JobId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Start B.5.1 Audit
              </Button>
            </div>

            {(phaseB51JobId || phaseB51State) && (
              <div className="rounded-xl border border-border/35 bg-background/25 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Phase B.5.1 job {phaseB51JobId ?? "latest"}
                  </span>
                  <span className="font-mono-num text-foreground">
                    {(phaseB51State || "idle").toUpperCase()} {phaseB51Progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={phaseB51Progress} className="h-2 bg-background/40" />
              </div>
            )}

            {phaseB51Error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                Phase B.5.1 Failed: {phaseB51Error}
              </div>
            )}

            {phaseB51Result?.batch_id ? (
              <>
                <div className="grid gap-3 md:grid-cols-5">
                  {[
                    ["Batch", phaseB51Result.batch_id],
                    ["Reconciliation", phaseB51Result.count_reconciliation?.status ?? "--"],
                    ["Closed Trades", phaseB51Funnel.closed_trades ?? 0],
                    ["Track Class", String(phaseB51Result.track_semantics?.classification ?? "--")],
                    [
                      "Freeze Gate",
                      phaseB51Result.freeze_gate?.eligible_for_locked_confirmation
                        ? "Eligible"
                        : "Not eligible",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/30 bg-background/20 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                        {String(value ?? "N/A")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Best Config Audit
                    </div>
                    <div className="space-y-2 text-xs">
                      {[
                        ["Config", String(phaseB51Result.audited_config?.name ?? "--")],
                        [
                          "Displayed signals meaning",
                          String(
                            phaseB51Result.best_config_audit?.previous_signals_meaning ?? "--",
                          ),
                        ],
                        [
                          "PF source",
                          String(phaseB51Result.best_config_audit?.profit_factor_source ?? "--"),
                        ],
                        [
                          "Gross profit",
                          formatCurrency(
                            Number(phaseB51Result.best_config_audit?.gross_profit ?? 0),
                          ),
                        ],
                        [
                          "Gross loss",
                          formatCurrency(Number(phaseB51Result.best_config_audit?.gross_loss ?? 0)),
                        ],
                        [
                          "PF",
                          formatNullableNumber(
                            Number(phaseB51Result.best_config_audit?.profit_factor ?? NaN),
                            4,
                          ),
                        ],
                        [
                          "Expect",
                          formatNullableSigned(
                            Number(phaseB51Result.best_config_audit?.expectancy ?? NaN),
                          ),
                        ],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="grid grid-cols-[140px_1fr] gap-3">
                          <span className="text-muted-foreground">{String(label)}</span>
                          <span className="font-mono-num text-foreground">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Track Semantics
                    </div>
                    <div className="space-y-2 text-xs">
                      {[
                        ["Track", phaseB51Result.track_semantics?.track],
                        ["Classification", phaseB51Result.track_semantics?.classification],
                        ["Buy closed", phaseB51Result.track_semantics?.buy_closed_trades],
                        ["Sell closed", phaseB51Result.track_semantics?.sell_closed_trades],
                        [
                          "Best fold",
                          formatNullablePercent(
                            Number(
                              phaseB51Result.track_semantics?.best_fold_contribution_pct ?? NaN,
                            ),
                          ),
                        ],
                        [
                          "Opposite-side diversity",
                          phaseB51Result.track_semantics?.opposite_side_zero_allowed
                            ? "Not applicable"
                            : "Required",
                        ],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="flex justify-between gap-3">
                          <span className="text-muted-foreground">{String(label)}</span>
                          <span className="font-mono-num text-foreground">
                            {String(value ?? "--")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Count Funnel
                  </div>
                  <table className="w-full min-w-[1100px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Position",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      <tr className="hover:bg-background/20">
                        {[
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
                          phaseB51Funnel.skipped_due_to_existing_position,
                        ].map((value, index) => (
                          <td key={index} className="px-3 py-3 text-center">
                            {String(value ?? 0)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Fold Count Table
                    </div>
                    <table className="w-full min-w-[1040px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
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
                            "Position",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-center">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB51FoldRows.map((row) => (
                          <tr key={String(row.fold)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.fold ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.status ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(row.accepted_signals ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.opened_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.closed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.wins ?? 0)}/{String(row.losses ?? 0)}/
                              {String(row.breakeven_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.tp_exits ?? 0)}/{String(row.sl_exits ?? 0)}/
                              {String(row.timeout_exits ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(row.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.skipped_due_to_cooldown ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.skipped_due_to_existing_position ?? 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Freeze Gate
                    </div>
                    <div className="space-y-2 text-xs">
                      {Object.entries(phaseB51FreezeChecks).map(([key, passed]) => (
                        <div key={key} className="flex items-center justify-between gap-3">
                          <span className="truncate text-muted-foreground">{key}</span>
                          <span className={passed ? "text-emerald-400" : "text-red-400"}>
                            {passed ? "PASS" : "FAIL"}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-border/20 pt-2 text-muted-foreground">
                        Failed:{" "}
                        {(phaseB51Result.freeze_gate?.failure_reasons ?? []).length
                          ? phaseB51Result.freeze_gate?.failure_reasons?.join(", ")
                          : "none"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Regime Count Table
                  </div>
                  <table className="w-full min-w-[1050px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Dimension",
                          "Bucket",
                          "Closed",
                          "W/L/BE",
                          "TP/SL/TO",
                          "Buy/Sell",
                          "PF",
                          "Expect",
                          "Net",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB51RegimeRows.map((row, index) => (
                        <tr
                          key={`${String(row.dimension)}-${String(row.bucket)}-${index}`}
                          className="hover:bg-background/20"
                        >
                          <td className="px-3 py-2 font-sans font-semibold text-foreground">
                            {String(row.dimension ?? "--")}
                          </td>
                          <td className="px-3 py-2">{String(row.bucket ?? "--")}</td>
                          <td className="px-3 py-2 text-center">
                            {String(row.closed_trades ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.wins ?? 0)}/{String(row.losses ?? 0)}/
                            {String(row.breakeven_trades ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.tp_exits ?? 0)}/{String(row.sl_exits ?? 0)}/
                            {String(row.timeout_exits ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.buy_closed_trades ?? 0)}/
                            {String(row.sell_closed_trades ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(Number(row.expectancy ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatCurrency(Number(row.net_pnl ?? 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Metric Source Explanation
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div>{String(phaseB51Result.metric_source?.basis ?? "--")}</div>
                      <div className="font-mono-num text-foreground">
                        PF ={" "}
                        {formatCurrency(
                          Number(phaseB51Result.metric_source?.pf_numerator_gross_profit ?? 0),
                        )}{" "}
                        /{" "}
                        {formatCurrency(
                          Number(phaseB51Result.metric_source?.pf_denominator_gross_loss ?? 0),
                        )}
                      </div>
                      <div>
                        Count reconciliation: {phaseB51Result.count_reconciliation?.status ?? "--"}
                      </div>
                      {(phaseB51Result.count_reconciliation?.mismatches ?? []).length > 0 && (
                        <div className="rounded-lg border border-red-400/25 bg-red-400/10 p-2 text-red-200">
                          {phaseB51Result.count_reconciliation?.mismatches
                            ?.map((item) => String(item.invariant ?? "mismatch"))
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Drift-Aware Warning
                    </div>
                    <div className="space-y-2 text-xs">
                      <div
                        className={
                          phaseB51Result.drift_warning?.status === "SEVERE_DRIFT_WARNING"
                            ? "text-red-300"
                            : "text-muted-foreground"
                        }
                      >
                        {phaseB51Result.drift_warning?.message ?? "--"}
                      </div>
                      {phaseB51DriftRows.map((row, index) => (
                        <div
                          key={`${String(row.feature)}-${index}`}
                          className="flex justify-between gap-3"
                        >
                          <span className="truncate text-muted-foreground">
                            Fold {String(row.fold ?? "--")} / {String(row.feature ?? "--")}
                          </span>
                          <span className="font-mono-num text-foreground">
                            {String(row.drift_level ?? "--")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <DataState message="No Phase B.5.1 count audit yet. Run this before any Phase C or broader model search." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="15"
          title="Phase B.5.2 - Reproducibility & Execution-Density Audit"
          icon={Gauge}
        >
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Freezes one 20,000 M5 research snapshot, replays the B5_11 config twice on that
              snapshot, and ranks a declared density matrix by closed executed trades instead of
              accepted signals. This section is research-only and keeps Phase C blocked.
            </p>

            <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100">
              <div className="font-semibold">
                {phaseB52Result?.legacy_research_warning?.label ??
                  "LEGACY - PRE COUNT-INTEGRITY AUDIT"}
              </div>
              <div>
                {phaseB52Result?.legacy_research_warning?.message ??
                  "Phase B through Phase B.5 artifacts are historical only and are not valid for promotion or Phase-C gating."}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="space-y-1 text-xs">
                <span className="text-muted-foreground">M5 Candles</span>
                <input
                  type="number"
                  min={20000}
                  max={50000}
                  step={1000}
                  value={phaseB52AnchorCount}
                  onChange={(event) =>
                    setPhaseB52AnchorCount(
                      Math.min(50000, Math.max(20000, Number(event.target.value) || 20000)),
                    )
                  }
                  className="w-full rounded-lg border border-border bg-background/45 px-3 py-2 font-mono-num text-sm text-foreground outline-none focus:border-[oklch(0.72_0.055_300/0.55)]"
                />
              </label>
              <Button
                disabled={phaseB52Pending || Boolean(phaseB52JobId)}
                onClick={() => void startPhaseB52Audit()}
                className="self-end bg-[oklch(0.72_0.055_300)] text-background hover:opacity-90"
              >
                {phaseB52Pending || phaseB52JobId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Gauge className="mr-2 h-4 w-4" />
                )}
                Start B.5.2 Audit
              </Button>
            </div>

            {(phaseB52JobId || phaseB52State) && (
              <div className="rounded-xl border border-border/35 bg-background/25 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Phase B.5.2 job {phaseB52JobId ?? "latest"}
                  </span>
                  <span className="font-mono-num text-foreground">
                    {(phaseB52State || "idle").toUpperCase()} {phaseB52Progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={phaseB52Progress} className="h-2 bg-background/40" />
              </div>
            )}

            {phaseB52Error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                Phase B.5.2 Failed: {phaseB52Error}
              </div>
            )}

            {phaseB52Result?.batch_id ? (
              <>
                <div className="grid gap-3 md:grid-cols-5">
                  {[
                    ["Batch", phaseB52Result.batch_id],
                    ["Snapshot", phaseB52Result.snapshot_manifest?.snapshot_id],
                    ["Replay", phaseB52Result.deterministic_replay?.status ?? "--"],
                    ["Closed Executed Trades", phaseB52Funnel.closed_trades ?? 0],
                    [
                      "Phase C",
                      phaseB52Result.phase_c_readiness_decision?.status === "ready"
                        ? "Ready"
                        : "Not ready",
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/30 bg-background/20 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-1 truncate font-mono-num text-sm font-bold text-foreground">
                        {String(value ?? "N/A")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1fr_360px]">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Frozen Snapshot Manifest
                    </div>
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          <th className="px-3 py-3">Timeframe</th>
                          <th className="px-3 py-3 text-center">Rows</th>
                          <th className="px-3 py-3">First</th>
                          <th className="px-3 py-3">Last</th>
                          <th className="px-3 py-3">SHA-256</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {["M1", "M5", "M15", "H1"].map((tf) => {
                          const item = phaseB52SnapshotFrames[tf] ?? {};
                          return (
                            <tr key={tf} className="hover:bg-background/20">
                              <td className="px-3 py-2 font-bold text-foreground">{tf}</td>
                              <td className="px-3 py-2 text-center">{item.rows ?? 0}</td>
                              <td className="px-3 py-2">{item.first_time ?? "--"}</td>
                              <td className="px-3 py-2">{item.last_time ?? "--"}</td>
                              <td className="px-3 py-2">{compactHash(item.sha256)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Dataset Hash
                    </div>
                    <div className="space-y-2 text-xs">
                      {[
                        ["Symbol", phaseB52Result.snapshot_manifest?.broker_symbol],
                        ["Dataset rows", phaseB52Result.snapshot_manifest?.combined_dataset_rows],
                        [
                          "Combined hash",
                          compactHash(phaseB52Result.snapshot_manifest?.combined_dataset_hash),
                        ],
                        ["Random seed", phaseB52Result.snapshot_manifest?.random_seed],
                        [
                          "Digits / point",
                          `${phaseB52Result.snapshot_manifest?.broker_digits ?? "--"} / ${phaseB52Result.snapshot_manifest?.point_size ?? "--"}`,
                        ],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="flex justify-between gap-3">
                          <span className="text-muted-foreground">{String(label)}</span>
                          <span className="truncate font-mono-num text-foreground">
                            {String(value ?? "--")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Deterministic Replay Comparison
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Status</span>
                        <span
                          className={
                            phaseB52Result.deterministic_replay?.status === "PASS"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }
                        >
                          {phaseB52Result.deterministic_replay?.status ?? "--"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-muted-foreground">Mismatched fields</span>
                        <span className="font-mono-num text-foreground">
                          {phaseB52Result.deterministic_replay?.mismatches?.length ?? 0}
                        </span>
                      </div>
                      {(phaseB52Result.deterministic_replay?.mismatches ?? [])
                        .slice(0, 6)
                        .map((row, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-red-400/25 bg-red-400/10 p-2 text-red-200"
                          >
                            {String(row.field ?? "mismatch")}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Previous vs Corrected Difference
                    </div>
                    <div className="space-y-2 text-xs">
                      {[
                        [
                          "Classification",
                          phaseB52Result.previous_count_difference?.classification,
                        ],
                        ["Details", phaseB52Result.previous_count_difference?.details],
                        [
                          "Old accepted / closed",
                          `${phaseB52Result.previous_count_difference?.old_b5?.accepted_signals ?? "--"} / ${phaseB52Result.previous_count_difference?.old_b5?.closed_trades ?? "--"}`,
                        ],
                        [
                          "Corrected accepted / closed",
                          `${phaseB52Result.previous_count_difference?.corrected_b51_latest?.accepted_signals ?? "--"} / ${phaseB52Result.previous_count_difference?.corrected_b51_latest?.closed_trades ?? "--"}`,
                        ],
                        [
                          "Current accepted / closed",
                          `${phaseB52Result.previous_count_difference?.current_b52_replay?.accepted_signals ?? "--"} / ${phaseB52Result.previous_count_difference?.current_b52_replay?.closed_trades ?? "--"}`,
                        ],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="grid grid-cols-[150px_1fr] gap-3">
                          <span className="text-muted-foreground">{String(label)}</span>
                          <span className="font-mono-num text-foreground">
                            {String(value ?? "--")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Execution-Density Funnel
                  </div>
                  <table className="w-full min-w-[1180px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Fold Coverage",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      <tr className="hover:bg-background/20">
                        {[
                          phaseB52Funnel.raw_candidates,
                          phaseB52Funnel.accepted_signals,
                          phaseB52Funnel.opened_trades,
                          phaseB52Funnel.closed_trades,
                          formatNullableNumber(
                            Number(
                              phaseB52Density.closed_trades_per_1000_oos_m5_bars ??
                                phaseB52Density.closed_trades_per_1000_m5 ??
                                NaN,
                            ),
                            4,
                          ),
                          formatNullableNumber(
                            Number(
                              phaseB52Density.closed_trades_per_1000_full_snapshot_m5_bars ??
                                phaseB52FullSnapshotClosedDensity,
                            ),
                            4,
                          ),
                          formatNullablePercent(
                            Number(phaseB52Density.accepted_to_opened_conversion_rate ?? NaN),
                          ),
                          formatNullablePercent(
                            Number(phaseB52Density.opened_to_closed_conversion_rate ?? NaN),
                          ),
                          formatNullablePercent(Number(phaseB52Density.cooldown_skip_rate ?? NaN)),
                          formatNullablePercent(
                            Number(phaseB52Density.existing_position_skip_rate ?? NaN),
                          ),
                          phaseB52Density.empty_fold_count,
                          formatNullablePercent(Number(phaseB52Density.fold_coverage_ratio ?? NaN)),
                        ].map((value, index) => (
                          <td key={index} className="px-3 py-3 text-center">
                            {String(value ?? 0)}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Per-Fold Density
                  </div>
                  <table className="w-full min-w-[1120px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Existing",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB52FoldRows.map((row) => {
                        const density = (row.density as Record<string, number | null>) ?? {};
                        return (
                          <tr key={String(row.fold)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.fold ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(density.raw_candidates_per_1000_m5 ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(density.accepted_signals_per_1000_m5 ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(density.opened_trades_per_1000_m5 ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(
                                  density.closed_trades_per_1000_oos_m5_bars ??
                                    density.closed_trades_per_1000_m5 ??
                                    NaN,
                                ),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.accepted_signals ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.opened_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.closed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.tp_exits ?? 0)}/{String(row.sl_exits ?? 0)}/
                              {String(row.timeout_exits ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.skipped_due_to_cooldown ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.skipped_due_to_existing_position ?? 0)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Curated Density Matrix Leaderboard
                  </div>
                  <table className="w-full min-w-[1500px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Reject Reasons",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB52MatrixRows.map((row) => {
                        const funnel = (row.count_funnel as Record<string, number>) ?? {};
                        const density =
                          (row.density_metrics as Record<string, number | null>) ?? {};
                        const rejects = row.reject_reasons as string[] | undefined;
                        return (
                          <tr key={String(row.experiment_id)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.rank ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-left">
                              <div className="max-w-[300px] truncate font-sans font-semibold text-foreground">
                                {String(row.name ?? "--")}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {String(row.feature_set ?? "--")} /{" "}
                                {String(row.session_filter ?? "--")}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.track ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(row.cooldown_bars ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.spread_ceiling_pips ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(funnel.accepted_signals ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(funnel.opened_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(funnel.closed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(
                                  density.closed_trades_per_1000_oos_m5_bars ??
                                    density.closed_trades_per_1000_m5 ??
                                    NaN,
                                ),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(
                                  density.closed_trades_per_1000_full_snapshot_m5_bars ??
                                    (Number.isFinite(phaseB52FullSnapshotRows) &&
                                    phaseB52FullSnapshotRows > 0
                                      ? (Number(funnel.closed_trades ?? 0) /
                                          phaseB52FullSnapshotRows) *
                                        1000
                                      : Number.NaN),
                                ),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullablePercent(Number(density.fold_coverage_ratio ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(density.empty_fold_count ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.expectancy ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(row.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {rejects?.length ? rejects.join(", ") : "none"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Next-Step Recommendation
                  </div>
                  <div className="text-foreground">
                    {phaseB52Result.next_step_recommendation ?? "--"}
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    {phaseB52Result.phase_c_readiness_decision?.reason}
                  </div>
                </div>
              </>
            ) : (
              <DataState message="No Phase B.5.2 reproducibility and execution-density audit yet. Run this before new label or horizon research." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="16"
          title="Phase B.6 - Expanded-History Label, Horizon & Regime Repair"
          icon={Gauge}
          right={
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={60000}
                max={200000}
                step={5000}
                value={phaseB6AnchorCount}
                onChange={(event) => setPhaseB6AnchorCount(Number(event.target.value))}
                className="w-28 text-center text-xs"
              />
              <Input
                type="number"
                min={24}
                max={36}
                step={1}
                value={phaseB6MatrixRuns}
                onChange={(event) => setPhaseB6MatrixRuns(Number(event.target.value))}
                className="w-20 text-center text-xs"
              />
              <Button
                size="sm"
                onClick={startPhaseB6Repair}
                disabled={phaseB6Pending || Boolean(phaseB6JobId)}
              >
                {phaseB6Pending || phaseB6JobId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Start B.6
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Requires expanded MT5 history before any real matrix run. If M1/M5/M15/H1 bars are
              short, the backend aborts with no partial research and no fallback to B.5.2.
            </p>

            {phaseB6JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary">Phase B.6 job {phaseB6JobId}</span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB6State ?? "queued"} / {phaseB6Progress}%
                  </span>
                </div>
                <Progress value={phaseB6Progress} className="h-1.5" />
              </div>
            )}

            {phaseB6Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.6 Failed: {phaseB6Error}
              </div>
            )}

            {phaseB6Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-5">
                  {[
                    ["Status", phaseB6Result.status],
                    ["Batch", phaseB6Result.batch_id],
                    ["History Gate", phaseB6Result.history_status?.status],
                    ["Frozen Configs", phaseB6Result.frozen_configs?.length ?? 0],
                    ["Phase C", phaseB6Result.phase_c_readiness_decision?.status],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                {phaseB6Result.status === "INSUFFICIENT_HISTORY_FOR_PHASE_B6" && (
                  <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-xs text-yellow-100">
                    <div className="mb-1 font-semibold">INSUFFICIENT_HISTORY_FOR_PHASE_B6</div>
                    <div>
                      {phaseB6Result.message ??
                        "Expanded MT5 history is incomplete. No partial research was executed."}
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Requested / Received History Counts
                  </div>
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Timeframe", "Requested", "Received", "Missing", "Status"].map(
                          (label) => (
                            <th key={label} className="px-3 py-3 text-center">
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {Object.entries(phaseB6HistoryFrames).map(([timeframe, row]) => (
                        <tr key={timeframe} className="hover:bg-background/20">
                          <td className="px-3 py-2 text-center font-bold text-foreground">
                            {timeframe}
                          </td>
                          <td className="px-3 py-2 text-center">{row.requested ?? 0}</td>
                          <td className="px-3 py-2 text-center">{row.received ?? 0}</td>
                          <td className="px-3 py-2 text-center">{row.missing ?? 0}</td>
                          <td className="px-3 py-2 text-center">{row.status ?? "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {phaseB6Result.snapshot_manifest?.snapshot_id && (
                  <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                      <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Expanded Snapshot Manifest
                      </div>
                      <table className="w-full min-w-[820px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            {["Timeframe", "Rows", "First", "Last", "SHA-256"].map((label) => (
                              <th key={label} className="px-3 py-3">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {Object.entries(phaseB6SnapshotFrames).map(([timeframe, row]) => (
                            <tr key={timeframe} className="hover:bg-background/20">
                              <td className="px-3 py-2 font-bold text-foreground">{timeframe}</td>
                              <td className="px-3 py-2">{row.rows ?? 0}</td>
                              <td className="px-3 py-2">{row.first_time ?? "--"}</td>
                              <td className="px-3 py-2">{row.last_time ?? "--"}</td>
                              <td className="px-3 py-2">{compactHash(row.sha256)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Dataset Hashes
                      </div>
                      <div className="space-y-2 font-mono-num">
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Snapshot</span>
                          <span className="text-right">
                            {phaseB6Result.snapshot_manifest.snapshot_id}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Rows</span>
                          <span>
                            {phaseB6Result.snapshot_manifest.combined_dataset_rows ?? "--"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Combined hash</span>
                          <span>
                            {compactHash(phaseB6Result.snapshot_manifest.combined_dataset_hash)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-muted-foreground">Seed</span>
                          <span>{phaseB6Result.snapshot_manifest.random_seed ?? "--"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {Object.keys(phaseB6SplitRegions).length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Chronological Split Timeline
                    </div>
                    <table className="w-full min-w-[860px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Region", "Rows", "Fraction", "Start", "End"].map((label) => (
                            <th key={label} className="px-3 py-3 text-center">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {Object.entries(phaseB6SplitRegions).map(([name, region]) => {
                          const range = (region.date_range ?? {}) as Record<string, unknown>;
                          return (
                            <tr key={name} className="hover:bg-background/20">
                              <td className="px-3 py-2 text-center font-bold text-foreground">
                                {name}
                              </td>
                              <td className="px-3 py-2 text-center">{region.rows ?? 0}</td>
                              <td className="px-3 py-2 text-center">
                                {formatNullablePercent(Number(region.row_fraction ?? NaN))}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(range.start ?? "--")}
                              </td>
                              <td className="px-3 py-2 text-center">{String(range.end ?? "--")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Declared Curated Matrix
                  </div>
                  <table className="w-full min-w-[1280px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "#",
                          "Config",
                          "Feature",
                          "Track",
                          "Label",
                          "SL ATR",
                          "RR",
                          "Lookahead",
                          "Session",
                          "Regime",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB6MatrixRows.slice(0, 12).map((row, index) => {
                        const label =
                          (row.label_config as Record<string, unknown> | undefined) ?? {};
                        return (
                          <tr key={String(row.name ?? index)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center">{index + 1}</td>
                            <td className="px-3 py-2 text-left">
                              <div className="max-w-[320px] truncate font-sans font-semibold text-foreground">
                                {String(row.name ?? "--")}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.feature_set_id ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.track ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(label.label_mode ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(label.sl_atr_multiplier ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(label.rr_multiplier ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(label.lookahead ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.session_filter ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.regime_filter ?? "--")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Execution-Density / Label-Horizon Leaderboard
                  </div>
                  <table className="w-full min-w-[1500px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Freeze",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB6LeaderboardRows.map((row) => {
                        const funnel = (row.count_funnel as Record<string, number>) ?? {};
                        const density =
                          (row.density_metrics as Record<string, number | null>) ?? {};
                        const gate =
                          (row.phase_b6_freeze_gate as Record<string, unknown> | undefined) ?? {};
                        return (
                          <tr key={String(row.experiment_id)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.rank ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-left">
                              <div className="max-w-[320px] truncate font-sans font-semibold text-foreground">
                                {String(row.name ?? "--")}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {String(row.feature_set ?? "--")} /{" "}
                                {String(row.session_filter ?? "--")}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.track ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(row.label_mode ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(funnel.accepted_signals ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(funnel.opened_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(funnel.closed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(density.closed_trades_per_1000_oos_m5_bars ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(density.closed_trades_per_1000_full_snapshot_m5_bars ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullablePercent(Number(density.fold_coverage_ratio ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.expectancy ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(row.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">{String(gate.status ?? "--")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Frozen Configs
                    </div>
                    {phaseB6FrozenRows.length ? (
                      <div className="space-y-2">
                        {phaseB6FrozenRows.map((row) => (
                          <div
                            key={String(row.experiment_id)}
                            className="rounded-lg border border-border/30 p-2"
                          >
                            <div className="font-semibold text-foreground">
                              {String(row.name ?? row.experiment_id)}
                            </div>
                            <div className="font-mono-num text-muted-foreground">
                              PF {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)} /
                              closed{" "}
                              {String(
                                (row.count_funnel as Record<string, number> | undefined)
                                  ?.closed_trades ?? 0,
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <DataState message="No discovery config has passed the Phase B.6 freeze gate." />
                    )}
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Locked Confirmation Replay
                    </div>
                    {phaseB6ConfirmationRows.length ? (
                      <div className="space-y-2">
                        {phaseB6ConfirmationRows.map((row) => (
                          <div
                            key={String(row.frozen_config_hash)}
                            className="rounded-lg border border-border/30 p-2"
                          >
                            <div className="font-mono-num text-foreground">
                              {compactHash(String(row.frozen_config_hash ?? ""))}
                            </div>
                            <div className="font-mono-num text-muted-foreground">
                              closed {String(row.closed_executed_trades ?? 0)} / PF{" "}
                              {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)} / gate{" "}
                              {String(
                                (row.confirmation_gate as Record<string, unknown> | undefined)
                                  ?.status ?? "--",
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <DataState message="Locked confirmation is not opened until a discovery config passes freeze gates." />
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Next-Step Recommendation
                  </div>
                  <div className="text-foreground">
                    {phaseB6Result.next_step_recommendation ?? "--"}
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    {phaseB6Result.phase_c_readiness_decision?.reason}
                  </div>
                </div>
              </>
            ) : (
              <DataState message="No Phase B.6 result yet. Run only after expanded MT5 history is available." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="17"
          title="Phase B.7 - Edge Decomposition & Strategy Repair"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB7Repair}
              disabled={phaseB7Pending || Boolean(phaseB7JobId)}
            >
              {phaseB7Pending || phaseB7JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Start B.7
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Reuses the immutable Phase B.6 expanded-history snapshot. This report decomposes cost,
              direction, regimes, feature-set ablations, and deterministic setup-family repairs
              without opening locked confirmation unless a discovery config passes freeze gates.
            </p>

            {phaseB7JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">Phase B.7 job {phaseB7JobId}</span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB7State ?? "queued"} / {phaseB7Progress}%
                  </span>
                </div>
                <Progress value={phaseB7Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB7Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB7Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB7Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.7 Failed: {phaseB7Error}
              </div>
            )}

            {phaseB7Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-6">
                  {[
                    ["Status", phaseB7Result.status],
                    ["Batch", phaseB7Result.batch_id],
                    ["B.6 Batch", phaseB7Result.source_b6_batch_id],
                    ["Snapshot", phaseB7Result.snapshot_integrity?.status],
                    [
                      "Frozen",
                      phaseB7Result.discovery_freeze_gate?.frozen_config_count ??
                        phaseB7Result.discovery_freeze_gate?.frozen_configs?.length ??
                        0,
                    ],
                    ["Phase C", phaseB7Result.phase_c_readiness_decision?.status],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Snapshot Integrity
                    </div>
                    <table className="w-full min-w-[820px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["TF", "Requested", "Rows", "Chronological", "Hash", "Duplicates"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-center">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {Object.entries(phaseB7SnapshotFrames).map(([timeframe, row]) => (
                          <tr key={timeframe} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {timeframe}
                            </td>
                            <td className="px-3 py-2 text-center">{row.requested ?? 0}</td>
                            <td className="px-3 py-2 text-center">{row.rows ?? 0}</td>
                            <td className="px-3 py-2 text-center">
                              {row.chronological ? "PASS" : "FAIL"}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.hash_matches_manifest ? "PASS" : "FAIL"}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {row.duplicate_timestamps ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Integrity Checks
                    </div>
                    <div className="space-y-2 font-mono-num">
                      {Object.entries(phaseB7SnapshotChecks).map(([key, passed]) => (
                        <div key={key} className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">{key}</span>
                          <span className={passed ? "text-emerald-200" : "text-red-200"}>
                            {passed ? "PASS" : "FAIL"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-border/30 pt-3 font-mono-num text-muted-foreground">
                      locked confirmation{" "}
                      {phaseB7Result.snapshot_integrity?.locked_confirmation_state ?? "--"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Fixed Shadow Cost Decomposition
                  </div>
                  <table className="w-full min-w-[1280px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Config",
                          "Track",
                          "Closed",
                          "Gross",
                          "Spread",
                          "Spread+Slip",
                          "Realistic",
                          "Cost / Trade",
                          "Invariant",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB7CostRows.map((row, index) => {
                        const profiles =
                          (row.profiles as Record<string, Record<string, unknown>>) ?? {};
                        const gross = profiles.gross_no_cost ?? {};
                        const spread = profiles.spread_only ?? {};
                        const slip = profiles.spread_plus_slippage ?? {};
                        const realistic = profiles.realistic_total_cost ?? {};
                        const invariant =
                          (row.fixed_shadow_cost_monotonicity as Record<string, unknown>) ?? {};
                        return (
                          <tr
                            key={String(row.experiment_id ?? index)}
                            className="hover:bg-background/20"
                          >
                            <td className="px-3 py-2 text-left">
                              <div className="max-w-[320px] truncate font-sans font-semibold text-foreground">
                                {String(row.name ?? row.experiment_id ?? "--")}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.track ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(realistic.closed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(gross.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(spread.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(slip.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(realistic.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(realistic.cost_per_closed_trade ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(invariant.status ?? "--").toUpperCase()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Directional Decomposition
                  </div>
                  <table className="w-full min-w-[1180px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Accepted=Closed",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB7DirectionRows.map((row) => (
                        <tr key={String(row.track)} className="hover:bg-background/20">
                          <td className="px-3 py-2 text-center font-bold text-foreground">
                            {String(row.track ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.accepted_signals ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.opened_trades ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.closed_executed_trades ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">{String(row.wins ?? 0)}</td>
                          <td className="px-3 py-2 text-center">{String(row.losses ?? 0)}</td>
                          <td className="px-3 py-2 text-center">{String(row.tp_exits ?? 0)}</td>
                          <td className="px-3 py-2 text-center">{String(row.sl_exits ?? 0)}</td>
                          <td className="px-3 py-2 text-center">
                            {String(row.timeout_exits ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(Number(row.expectancy ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.accepted_signals_are_closed_trades ? "YES" : "NO"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Regime Attribution
                  </div>
                  <table className="w-full min-w-[960px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Dimension", "Bucket", "Closed", "Win Rate", "PF", "Expect", "Net"].map(
                          (label) => (
                            <th key={label} className="px-3 py-3 text-center">
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB7RegimeRows.map((row, index) => (
                        <tr
                          key={`${String(row.dimension)}-${String(row.bucket)}-${index}`}
                          className="hover:bg-background/20"
                        >
                          <td className="px-3 py-2 text-center font-bold text-foreground">
                            {String(row.dimension ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">{String(row.bucket ?? "--")}</td>
                          <td className="px-3 py-2 text-center">
                            {String(row.closed_trades ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullablePercent(Number(row.win_rate ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(Number(row.expectancy ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatCurrency(Number(row.net_pnl ?? 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Orthogonal Ablation Matrix
                    </div>
                    <table className="w-full min-w-[860px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Feature Set", "Source", "Closed", "PF", "Expect", "Monotonic"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-center">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB7AblationRows.map((row) => (
                          <tr key={String(row.feature_set_id)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.feature_set_id ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.source_b6_feature_family ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.closed_executed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.full_replay_pf ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.expectancy ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.cost_monotonicity ?? "--").toUpperCase()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Meta-Label Setup Families
                    </div>
                    <table className="w-full min-w-[900px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "SL ATR", "RR", "Lookahead", "Buy", "Sell", "Freeze"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-center">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB7MetaRows.map((row) => {
                          const gate = (row.freeze_gate as Record<string, unknown>) ?? {};
                          return (
                            <tr key={String(row.setup_family)} className="hover:bg-background/20">
                              <td className="px-3 py-2 text-center font-bold text-foreground">
                                {String(row.setup_family ?? "--")}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(row.sl_atr_multiplier ?? "--")}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(row.rr_target ?? "--")}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(row.maximum_lookahead ?? "--")}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(row.buy_closed_trades ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(row.sell_closed_trades ?? 0)}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {String(gate.status ?? "--")}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    B.7 Discovery Freeze Gate
                  </div>
                  <table className="w-full min-w-[1180px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Config",
                          "Track",
                          "Feature",
                          "Closed",
                          "PF",
                          "Expect",
                          "Gate",
                          "Failures",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB7FreezeRows.map((row) => {
                        const funnel = (row.count_funnel as Record<string, number>) ?? {};
                        const gate = (row.gate as Record<string, unknown>) ?? {};
                        return (
                          <tr key={String(row.experiment_id)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-left">
                              <div className="max-w-[320px] truncate font-sans font-semibold text-foreground">
                                {String(row.name ?? row.experiment_id ?? "--")}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.track ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(row.feature_set ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(funnel.closed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.expectancy ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">{String(gate.status ?? "--")}</td>
                            <td className="px-3 py-2 text-left">
                              <div className="max-w-[360px] truncate">
                                {((gate.failure_reasons as string[] | undefined) ?? []).join(
                                  ", ",
                                ) || "--"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Locked Confirmation State
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB7LockedConfirmation?.state ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB7LockedConfirmation?.reason ??
                        "Locked confirmation remains unopened until a discovery config passes freeze gate."}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Failure Classification
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB7Result.failure_classification?.primary ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {(phaseB7Result.failure_classification?.contributors ?? []).join(", ") ||
                        "--"}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Next-Step Recommendation
                  </div>
                  <div className="text-foreground">
                    {phaseB7Result.next_step_recommendation ?? "--"}
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    {phaseB7Result.phase_c_readiness_decision?.reason}
                  </div>
                </div>
              </>
            ) : (
              <DataState message="No Phase B.7 result yet. Review the Phase B.6 report before starting B.7." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="18"
          title="Phase B.8 - Strategy Hypothesis Reset & Gross-Edge Research"
          icon={BrainCircuit}
          right={
            <Button
              size="sm"
              onClick={startPhaseB8Research}
              disabled={phaseB8Pending || Boolean(phaseB8JobId)}
            >
              {phaseB8Pending || phaseB8JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Start B.8
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only strategy reset using the immutable B.6 expanded-history snapshot. The
              gross-edge gate runs before any ML value-add check and rejects setup families with no
              no-cost edge, insufficient density, fold concentration, or severe drift.
            </p>

            {phaseB8JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">Phase B.8 job {phaseB8JobId}</span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB8State ?? "queued"} / {phaseB8Progress}%
                  </span>
                </div>
                <Progress value={phaseB8Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB8Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB8Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB8Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8 Failed: {phaseB8Error}
              </div>
            )}

            {phaseB8Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-6">
                  {[
                    ["Status", phaseB8Result.status],
                    ["Batch", phaseB8Result.batch_id],
                    ["B.7 Batch", phaseB8Result.source_b7_batch_id],
                    ["Snapshot", phaseB8Result.snapshot_integrity?.status],
                    [
                      "Frozen",
                      phaseB8Result.discovery_freeze_gate?.frozen_config_count ??
                        phaseB8Result.discovery_freeze_gate?.frozen_configs?.length ??
                        0,
                    ],
                    ["Phase C", phaseB8Result.phase_c_readiness_decision?.status],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Immutable Snapshot Integrity
                    </div>
                    <table className="w-full min-w-[820px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["TF", "Requested", "Rows", "First", "Last", "Hash"].map((label) => (
                            <th key={label} className="px-3 py-3 text-center">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {Object.entries(phaseB8SnapshotFrames).map(([timeframe, row]) => (
                          <tr key={timeframe} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {timeframe}
                            </td>
                            <td className="px-3 py-2 text-center">{row.requested ?? 0}</td>
                            <td className="px-3 py-2 text-center">{row.rows ?? 0}</td>
                            <td className="px-3 py-2 text-center">{row.first_time ?? "--"}</td>
                            <td className="px-3 py-2 text-center">{row.last_time ?? "--"}</td>
                            <td className="px-3 py-2 text-center">{compactHash(row.sha256)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Integrity Checks
                    </div>
                    <div className="space-y-2 font-mono-num">
                      {Object.entries(phaseB8SnapshotChecks).map(([key, passed]) => (
                        <div key={key} className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">{key}</span>
                          <span className={passed ? "text-emerald-200" : "text-red-200"}>
                            {passed ? "PASS" : "FAIL"}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 border-t border-border/30 pt-3 font-mono-num text-muted-foreground">
                      locked confirmation{" "}
                      {phaseB8Result.locked_confirmation?.state ??
                        phaseB8Result.snapshot_integrity?.locked_confirmation_state ??
                        "--"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Gross-Edge Leaderboard
                  </div>
                  <table className="w-full min-w-[1420px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Gate",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB8GrossRows.map((row) => {
                        const classification =
                          (row.classification as Record<string, unknown> | undefined) ?? {};
                        const gate =
                          (classification.gross_edge_gate as Record<string, unknown> | undefined) ??
                          {};
                        return (
                          <tr key={String(row.setup_family)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-left">
                              <div className="max-w-[280px] truncate font-sans font-semibold text-foreground">
                                {String(row.setup_family ?? "--")}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {String(row.source_experiment_id ?? "--")}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.directional_track ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(row.closed_executed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.no_cost_profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.no_cost_expectancy ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.realistic_profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.realistic_expectancy ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(row.realistic_net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.max_drawdown ?? NaN), 2)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(row.closed_trades_per_1000_oos_m5_bars ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullablePercent(Number(row.fold_coverage_ratio ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(classification.primary ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">{String(gate.status ?? "--")}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Setup-Family Definitions
                  </div>
                  <table className="w-full min-w-[1500px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Cooldown",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB8SetupRows.map((row) => (
                        <tr key={String(row.setup_family)} className="hover:bg-background/20">
                          <td className="px-3 py-2 text-center font-bold text-foreground">
                            {String(row.setup_family ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-left">
                            <div className="max-w-[320px] truncate">
                              {String(row.entry_condition ?? "--")}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-left">
                            <div className="max-w-[320px] truncate">
                              {String(row.invalidation_condition ?? "--")}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.sl_atr_multiplier ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">{String(row.rr_target ?? "--")}</td>
                          <td className="px-3 py-2 text-center">
                            {String(row.lookahead_bars ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.directional_track ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.regime_filter ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.session_filter ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.spread_ceiling_pips ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.move_to_cost_gate ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.cooldown_bars ?? "--")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Fixed-Trade Cost Decomposition
                  </div>
                  <table className="w-full min-w-[1280px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Setup",
                          "No Cost",
                          "Spread",
                          "Spread+Slip",
                          "Realistic",
                          "Cost/Trade",
                          "Invariant",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB8CostRows.map((row) => {
                        const profiles =
                          (row.cost_profiles as Record<string, Record<string, unknown>>) ?? {};
                        const invariant =
                          (row.fixed_shadow_cost_monotonicity as
                            | Record<string, unknown>
                            | undefined) ?? {};
                        return (
                          <tr key={String(row.setup_family)} className="hover:bg-background/20">
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.setup_family ?? "--")}
                            </td>
                            {[
                              "no_cost",
                              "spread_only",
                              "spread_plus_slippage",
                              "realistic_cost",
                            ].map((key) => (
                              <td key={key} className="px-3 py-2 text-center">
                                {formatCurrency(Number(profiles[key]?.net_pnl ?? 0))}
                              </td>
                            ))}
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(profiles.realistic_cost?.cost_per_closed_trade ?? NaN),
                                4,
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {String(invariant.status ?? "--").toUpperCase()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Fold Attribution
                    </div>
                    <table className="w-full min-w-[920px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Fold", "Closed", "PF", "Expect", "Net", "DD", "Density"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-center">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8FoldRows.map((row, index) => (
                          <tr key={`${String(row.setup_family)}-${String(row.fold)}-${index}`}>
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.setup_family ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.fold ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(row.closed_executed_trades ?? 0)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.expectancy ?? NaN))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatCurrency(Number(row.net_pnl ?? 0))}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.max_drawdown ?? NaN), 2)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(
                                Number(row.closed_trades_per_1000_oos_m5_bars ?? NaN),
                                4,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Drift Diagnostics
                    </div>
                    <table className="w-full min-w-[920px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Dimension", "Bucket", "Status", "Closed", "PF", "Expect"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-center">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8DriftRows.map((row, index) => (
                          <tr key={`${String(row.dimension)}-${index}`}>
                            <td className="px-3 py-2 text-center font-bold text-foreground">
                              {String(row.dimension ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">{String(row.bucket ?? "--")}</td>
                            <td className="px-3 py-2 text-center">{String(row.status ?? "--")}</td>
                            <td className="px-3 py-2 text-center">
                              {String(row.closed_executed_trades ?? row.closed_trades ?? "--")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableNumber(Number(row.profit_factor ?? NaN), 4)}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {formatNullableSigned(Number(row.expectancy ?? NaN))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    ML Value-Add Check
                  </div>
                  <table className="w-full min-w-[1120px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Setup",
                          "Status",
                          "Assessment",
                          "Baseline PF",
                          "ML PF",
                          "Delta PF",
                          "Delta Expect",
                          "Density Reduction",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB8MlRows.map((row) => (
                        <tr key={String(row.setup_family)} className="hover:bg-background/20">
                          <td className="px-3 py-2 text-center font-bold text-foreground">
                            {String(row.setup_family ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">{String(row.status ?? "--")}</td>
                          <td className="px-3 py-2 text-center">
                            {String(row.ml_assessment ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(Number(row.baseline_profit_factor ?? NaN), 4)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(Number(row.ml_assisted_profit_factor ?? NaN), 4)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(Number(row.incremental_profit_factor ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(Number(row.incremental_expectancy ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullablePercent(Number(row.execution_density_reduction ?? NaN))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Failure Classification
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB8Result.failure_classification?.primary ?? "--"}
                    </div>
                    <div className="mt-2 space-y-1 font-mono-num text-muted-foreground">
                      {Object.entries(phaseB8Result.failure_classification?.counts ?? {}).map(
                        ([label, count]) => (
                          <div key={label} className="flex justify-between gap-3">
                            <span>{label}</span>
                            <span>{count}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Gate
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB8Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB8Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                    <div className="mt-2 border-t border-border/30 pt-2 text-muted-foreground">
                      {phaseB8Result.locked_confirmation?.reason}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Next-Step Recommendation
                  </div>
                  <div className="text-foreground">
                    {phaseB8Result.next_step_recommendation ?? "--"}
                  </div>
                </div>
              </>
            ) : (
              <DataState message="No Phase B.8 result yet. Start only after reviewing the B.7 report." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="19"
          title="Phase B.8.1 - Strategy Mechanics & Execution Semantics Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB81Audit}
              disabled={phaseB81Pending || Boolean(phaseB81JobId)}
            >
              {phaseB81Pending || phaseB81JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.1
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only audit of evaluator integrity, trade accounting, direction mapping,
              payoff accounting, and event-ledger availability. This stage reuses immutable B.6/B.8
              artifacts only and does not fetch MT5 history.
            </p>

            {phaseB81JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.1 job {phaseB81JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB81State ?? "queued"} / {phaseB81Progress}%
                  </span>
                </div>
                <Progress value={phaseB81Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB81Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB81Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB81Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.1 Failed: {phaseB81Error}
              </div>
            )}

            {phaseB81Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-6">
                  {[
                    ["Status", phaseB81Result.status],
                    ["Batch", phaseB81Result.batch_id],
                    ["B.8 Batch", phaseB81Result.source_b8_batch_id],
                    ["Snapshot", phaseB81Result.snapshot_integrity?.status],
                    ["Replay", phaseB81Result.replay_source_preflight?.status],
                    ["Conclusion", phaseB81Result.conclusion],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Replay Source Preflight
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB81Result.replay_source_preflight?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB81Result.replay_source_preflight?.reason ?? "--"}
                    </div>
                    <div className="mt-3 grid gap-2 border-t border-border/30 pt-3 font-mono-num text-[11px] text-muted-foreground sm:grid-cols-3">
                      <span>
                        MT5 refetch{" "}
                        {String(phaseB81Result.replay_source_preflight?.mt5_refetch_performed)}
                      </span>
                      <span>
                        history rebuild{" "}
                        {String(phaseB81Result.replay_source_preflight?.history_rebuild_performed)}
                      </span>
                      <span>
                        raw paths{" "}
                        {phaseB81Result.replay_source_preflight?.existing_paths?.length ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Count Reconciliation
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB81Result.snapshot_evaluator_integrity?.count_reconciliation?.status ??
                        "--"}
                    </div>
                    <div className="mt-2 space-y-1 font-mono-num text-muted-foreground">
                      {Object.entries(phaseB81CountChecks).map(([label, passed]) => (
                        <div key={label} className="flex justify-between gap-3">
                          <span>{label}</span>
                          <span className={passed ? "text-emerald-200" : "text-red-200"}>
                            {passed ? "PASS" : "FAIL"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Trade Accounting Integrity Checks
                  </div>
                  <table className="w-full min-w-[920px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Check", "Status", "Details"].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB81MechanicsChecks.map((row) => (
                        <tr key={String(row.name)} className="hover:bg-background/20">
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {String(row.name ?? "--")}
                          </td>
                          <td
                            className={`px-3 py-2 ${
                              row.status === "PASS" ? "text-emerald-200" : "text-red-200"
                            }`}
                          >
                            {String(row.status ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            <div className="max-w-[560px] truncate">
                              {JSON.stringify(row.details ?? {})}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Directionality Shadow Replay
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB81Result.directionality_shadow_replay?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      modes{" "}
                      {(phaseB81Result.directionality_shadow_replay?.shadow_modes ?? []).join(
                        ", ",
                      ) || "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB81Result.directionality_shadow_replay?.reason ?? "--"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Event-Level Ledger Export
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB81Result.event_level_ledger_export?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB81Result.event_level_ledger_export?.reason ?? "--"}
                    </div>
                    <div className="mt-3 max-h-36 space-y-1 overflow-auto border-t border-border/30 pt-3 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB81LedgerRows.map((row) => (
                        <div key={String(row.setup_family)} className="flex justify-between gap-3">
                          <span>{String(row.setup_family ?? "--")}</span>
                          <span>{String(row.status ?? "--")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Realized Payoff Audit
                  </div>
                  <table className="w-full min-w-[1080px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Setup",
                          "Closed",
                          "No-Cost PF",
                          "No-Cost Expect",
                          "Real PF",
                          "Real Expect",
                          "Class",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-center">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB81PayoffRows.map((row) => (
                        <tr key={String(row.setup_family)} className="hover:bg-background/20">
                          <td className="px-3 py-2 text-left font-semibold text-foreground">
                            {String(row.setup_family ?? "--")}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.closed_executed_trades ?? 0)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(Number(row.no_cost_profit_factor ?? NaN), 4)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(Number(row.no_cost_expectancy ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableNumber(Number(row.realistic_profit_factor ?? NaN), 4)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {formatNullableSigned(Number(row.realistic_expectancy ?? NaN))}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {String(row.classification ?? "--")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Conclusion
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB81Result.conclusion ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB81Result.conclusion_detail?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Gate
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB81Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB81Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                    <div className="mt-2 border-t border-border/30 pt-2 text-muted-foreground">
                      {phaseB81Result.next_step_recommendation ?? "--"}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <DataState message="No Phase B.8.1 audit yet. Run only after reviewing the B.8 report." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="20"
          title="Phase B.8.2 - Replayable Snapshot & Event-Ledger Persistence Repair"
          icon={Save}
          right={
            <Button
              size="sm"
              onClick={startPhaseB82Repair}
              disabled={phaseB82Pending || Boolean(phaseB82JobId)}
            >
              {phaseB82Pending || phaseB82JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Start B.8.2
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only repair that attempts exact UTC reconstruction of the immutable B.6
              ranges, writes staged sidecar Parquet files only after validation, and keeps Phase C
              blocked.
            </p>

            {phaseB82JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.2 job {phaseB82JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB82State ?? "queued"} / {phaseB82Progress}%
                  </span>
                </div>
                <Progress value={phaseB82Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB82Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB82Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB82Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.2 Failed: {phaseB82Error}
              </div>
            )}

            {phaseB82Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
                  {[
                    ["Status", phaseB82Result.status],
                    ["Batch", phaseB82Result.batch_id],
                    ["Legacy Hash", phaseB82Result.raw_hash_compatibility_status],
                    ["Raw", phaseB82Result.raw_reconstruction_status],
                    ["Combined", phaseB82Result.combined_feature_hash_status],
                    ["Ledger Gen", phaseB82Result.ledger_generation_status],
                    ["Ledger Recon", phaseB82Result.ledger_reconciliation_status],
                    ["B.8.1 Ready", phaseB82Result.b81_rerun_readiness?.status],
                  ].map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                {phaseB82HasHardenedBlock && (
                  <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                    <div className="font-semibold">
                      B.8.2 hardened replay gate is blocking readiness.
                    </div>
                    <div className="mt-1 text-amber-100/80">
                      Empty or placeholder ledgers are not accepted as B.8.1 proof. Review the
                      requirements and per-family funnel below before starting another phase.
                    </div>
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Lineage & Sidecar
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB82Result.lineage_id ?? "--"}
                    </div>
                    <div className="mt-2 space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      <div className="truncate">
                        manifest {phaseB82Result.sidecar_manifest_path ?? "--"}
                      </div>
                      <div className="truncate">
                        candidate {phaseB82Result.candidate_ledger_path ?? "--"}
                      </div>
                      <div className="truncate">
                        trade {phaseB82Result.trade_ledger_path ?? "--"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Readiness Semantics
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB82Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB82Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                    {phaseB82ReadinessBlockers.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-border/30 pt-2 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB82ReadinessBlockers.slice(0, 5).map((reason) => (
                          <div key={reason}>{reason}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Exact Range Reconstruction
                  </div>
                  <table className="w-full min-w-[1080px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "TF",
                          "Rows",
                          "First UTC",
                          "Last UTC",
                          "Duplicates",
                          "Compat",
                          "Legacy",
                          "UTC",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB82TimeframeRows.map(([timeframe, row]) => {
                        const hashRow = phaseB82RawHashRows[timeframe] ?? row;
                        return (
                          <tr key={timeframe} className="hover:bg-background/20">
                            <td className="px-3 py-2 font-semibold text-foreground">{timeframe}</td>
                            <td className="px-3 py-2">{String(row.rows ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.first_time ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.last_time ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.duplicate_timestamps ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(hashRow.compatibility_class ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {compactHash(String(hashRow.legacy_b6_hash ?? ""))}
                            </td>
                            <td className="px-3 py-2">
                              {compactHash(String(hashRow.utc_canonical_hash ?? row.sha256 ?? ""))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Deterministic Replay
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB82Result.deterministic_replay?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      mismatch {String(phaseB82Result.deterministic_replay?.mismatch_count ?? "--")}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      meaningful {String(phaseB82Result.deterministic_replay_meaningful ?? false)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Ledger Reconciliation
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB82Result.ledger_reconciliation_status ??
                        phaseB82Result.ledger_reconciliation?.status ??
                        "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">{phaseB82LedgerSummary}</div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Mutation Proof
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB82Result.mutation_proof?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      mutations {String(phaseB82Result.mutation_proof?.mutations?.length ?? 0)}
                    </div>
                  </div>
                </div>

                {phaseB82FunnelRows.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Per-Family Funnel Proof
                    </div>
                    <table className="w-full min-w-[1160px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
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
                            "Mismatch",
                          ].map((label, index) => (
                            <th key={`${label}-${index}`} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB82FunnelRows.map((row) => (
                          <tr
                            key={String(row.setup_family ?? "--")}
                            className="hover:bg-background/20"
                          >
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {String(row.setup_family ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.raw_candidates ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.accepted ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.execution_attempts ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.opened ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.closed ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.wins ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.losses ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.TP ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.SL ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.timeout ?? "--")}</td>
                            <td className="px-3 py-2">
                              {Array.isArray(row.mismatch_reasons)
                                ? row.mismatch_reasons.join("; ") || "--"
                                : "--"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(phaseB82MismatchRows.length > 0 ||
                  phaseB82RerunRows.length > 0 ||
                  phaseB82ReplayRequirements.length > 0 ||
                  phaseB82UnresolvedConfigs.length > 0 ||
                  phaseB82BlockedFamilies.length > 0) && (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Mismatch & Replay Requirements
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB82MismatchRows.map((reason) => (
                          <div key={reason}>{reason}</div>
                        ))}
                        {phaseB82ReplayRequirements.map((item, index) => (
                          <div key={`req-${index}`}>
                            {String(item.setup_family ?? "--")}:{" "}
                            {String(item.requirement ?? item.reason ?? "--")}
                          </div>
                        ))}
                        {phaseB82UnresolvedConfigs.map((item, index) => (
                          <div key={`unresolved-${index}`}>
                            {String(item.setup_family ?? "--")}: {String(item.reason ?? "--")}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Blocked Families / New Baseline Rerun
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB82BlockedFamilies.map((family) => (
                          <div key={`blocked-${family}`}>{family}</div>
                        ))}
                        {phaseB82RerunRows.map((stage) => (
                          <div key={stage}>{stage}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Phase C Gate
                  </div>
                  <div className="font-mono-num text-sm font-semibold text-foreground">
                    {phaseB82Result.phase_c_readiness_decision?.status ?? "--"}
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    {phaseB82Result.phase_c_readiness_decision?.reason ?? "--"}
                  </div>
                </div>
              </>
            ) : (
              <DataState message="No Phase B.8.2 sidecar report yet. Review B.8.1 before starting manually." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="21"
          title="Phase B.8.3 - Replay Source Restoration & Reproducible Baseline Repair"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB83Repair}
              disabled={phaseB83Pending || Boolean(phaseB83JobId)}
            >
              {phaseB83Pending || phaseB83JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only repair that first audits exact legacy replay availability. If legacy
              replay cannot be proven, it creates a clearly separated reproducible baseline from the
              verified immutable raw sidecar and keeps B.8.1 and Phase C blocked.
            </p>

            {phaseB83JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3 job {phaseB83JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB83State ?? "queued"} / {phaseB83Progress}%
                  </span>
                </div>
                <Progress value={phaseB83Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB83Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB83Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB83Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3 Failed: {phaseB83Error}
              </div>
            )}

            {phaseB83Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB83StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                {phaseB83NeedsAttention && (
                  <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                    <div className="font-semibold">B.8.3 readiness remains research-gated.</div>
                    <div className="mt-1 text-amber-100/80">
                      A rebuilt Branch B baseline is a new lineage and requires an explicit later
                      research rerun before B.8.1 or Phase C can be considered.
                    </div>
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      New Lineage
                    </div>
                    <div className="break-words font-mono-num text-sm font-semibold text-foreground">
                      {phaseB83Result.new_lineage_id ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      meaningful replay{" "}
                      {String(phaseB83Result.deterministic_replay_meaningful ?? false)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Rerun Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB83Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB83Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB83Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB83Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Deterministic Replay
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB83Result.deterministic_replay?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      mismatch {String(phaseB83Result.deterministic_replay?.mismatch_count ?? "--")}
                    </div>
                    <div className="mt-1 font-mono-num text-[11px] text-muted-foreground">
                      features{" "}
                      {compactHash(phaseB83Result.deterministic_replay?.feature_hash_pass_1)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Mutation Proof
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB83Result.mutation_proof?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      mutations {String(phaseB83Result.mutation_proof?.mutations?.length ?? 0)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Artifact Paths
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83ArtifactRows.length > 0 ? (
                        phaseB83ArtifactRows.map(([key, value]) => (
                          <div key={key} className="truncate">
                            {key}{" "}
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value ?? "--")}
                          </div>
                        ))
                      ) : (
                        <div>--</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Per-Family Funnel
                  </div>
                  <table className="w-full min-w-[1160px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Timeout",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB83FunnelRows.length > 0 ? (
                        phaseB83FunnelRows.map((row) => (
                          <tr
                            key={String(row.setup_family ?? "--")}
                            className="hover:bg-background/20"
                          >
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {String(row.setup_family ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.raw_candidates ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.threshold_qualified ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.track_qualified ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.regime_qualified ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.session_qualified ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.spread_qualified ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.accepted ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.execution_attempts ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.opened ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.closed ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.TP ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.SL ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.timeout ?? "--")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={14}>
                            No B.8.3 per-family funnel rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {(phaseB83Blockers.length > 0 ||
                  phaseB83ReplayRequirements.length > 0 ||
                  phaseB83UnresolvedConfigs.length > 0) && (
                  <div className="grid gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Blockers
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB83Blockers.map((item, index) => (
                          <div key={`b83-blocker-${index}`}>
                            {typeof item === "object" ? JSON.stringify(item) : String(item)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Missing Replay Requirements
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB83ReplayRequirements.map((item, index) => (
                          <div key={`b83-req-${index}`}>
                            {String(item.setup_family ?? "--")}:{" "}
                            {String(item.requirement ?? item.reason ?? "--")}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Unresolved Source Configs
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB83UnresolvedConfigs.map((item, index) => (
                          <div key={`b83-unresolved-${index}`}>
                            {String(item.setup_family ?? "--")}: {String(item.reason ?? "--")}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3 replay source restoration report yet. Review B.8.2 before starting manually." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="22"
          title="Phase B.8.3.1 - Threshold Gate & Prediction Payload Integrity Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB831Audit}
              disabled={phaseB831Pending || Boolean(phaseB831JobId)}
            >
              {phaseB831Pending || phaseB831JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.1
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only threshold gate and prediction payload integrity check. Rebuilt-lineage
              diagnostics keep B.8.1 and Phase C blocked and do not claim historical root-cause
              proof unless exact B.8.3 replay payloads are hash-verifiable.
            </p>

            {phaseB831JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.1 job {phaseB831JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB831State ?? "queued"} / {phaseB831Progress}%
                  </span>
                </div>
                <Progress value={phaseB831Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB831Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB831Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB831Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.1 Failed: {phaseB831Error}
              </div>
            )}

            {phaseB831Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB831StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                {phaseB831NeedsAttention && (
                  <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                    <div className="font-semibold">B.8.3.1 remains audit-only.</div>
                    <div className="mt-1 text-amber-100/80">
                      Rebuilt baseline diagnostics cannot unblock B.8.1 or Phase C and cannot prove
                      historical B.8.3 root cause without exact replay artifacts.
                    </div>
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Deterministic Rebuild
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {String(phaseB831Result.deterministic_rebuild_replay_count ?? 0)} passes /{" "}
                      mismatch{" "}
                      {String(phaseB831Result.deterministic_rebuild_mismatch_count ?? "--")}
                    </div>
                    <div className="mt-2 font-mono-num text-[11px] text-muted-foreground">
                      seed {String(phaseB831Result.random_seed ?? "--")}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Rerun Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB831Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB831Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB831Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB831Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Per-Family Score & Gate Funnel
                  </div>
                  <table className="w-full min-w-[1280px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Trades",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB831FunnelRows.length > 0 ? (
                        phaseB831FunnelRows.map((row) => (
                          <tr
                            key={String(row.setup_family ?? "--")}
                            className="hover:bg-background/20"
                          >
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {String(row.setup_family ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.score_scale_classification ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.score_min ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.score_median ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.score_max ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.configured_threshold_value ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.count_score_gte_threshold ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.trigger_pass_count ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.threshold_pass_count ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.track_pass_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.regime_pass_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.session_pass_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.spread_pass_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.accepted_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.attempts ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.opened ?? "--")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={16}>
                            No B.8.3.1 per-family audit rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {(phaseB831Blockers.length > 0 ||
                  phaseB831MissingPayloads.length > 0 ||
                  phaseB831ArtifactRows.length > 0) && (
                  <div className="grid gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Blockers
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB831Blockers.length > 0 ? (
                          phaseB831Blockers.map((item, index) => (
                            <div key={`b831-blocker-${index}`}>
                              {typeof item === "object" ? JSON.stringify(item) : String(item)}
                            </div>
                          ))
                        ) : (
                          <div>--</div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Missing Exact B.8.3 Payloads
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB831MissingPayloads.length > 0 ? (
                          phaseB831MissingPayloads.map((item, index) => (
                            <div key={`b831-missing-${index}`}>{item}</div>
                          ))
                        ) : (
                          <div>--</div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Artifact Paths
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB831ArtifactRows.length > 0 ? (
                          phaseB831ArtifactRows.map(([key, value]) => (
                            <div key={key} className="truncate">
                              {key}{" "}
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value ?? "--")}
                            </div>
                          ))
                        ) : (
                          <div>--</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.1 threshold gate audit report yet. Start manually after reviewing B.8.3." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="23"
          title="Phase B.8.3.2 - Score Calibration, Label Balance & Threshold Sensitivity Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB832Audit}
              disabled={phaseB832Pending || Boolean(phaseB832JobId)}
            >
              {phaseB832Pending || phaseB832JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.2
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only score calibration, label balance, and diagnostic threshold sensitivity
              check. Threshold sensitivity is not promotion evidence and never opens B.8.1 or Phase
              C readiness.
            </p>

            {phaseB832JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.2 job {phaseB832JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB832State ?? "queued"} / {phaseB832Progress}%
                  </span>
                </div>
                <Progress value={phaseB832Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB832Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB832Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB832Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.2 Failed: {phaseB832Error}
              </div>
            )}

            {phaseB832Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB832StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                {phaseB832NeedsAttention && (
                  <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                    <div className="font-semibold">B.8.3.2 is diagnostic-only.</div>
                    <div className="mt-1 text-amber-100/80">
                      Diagnostic thresholds are calibration evidence only; B.8.1 and Phase C stay
                      blocked.
                    </div>
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB832Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB832Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB832Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB832Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Diagnostic Label
                    </div>
                    <div className="break-words font-mono-num text-sm font-semibold text-foreground">
                      {phaseB832Result.diagnostic_label ?? "--"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Per-Family Score Quantiles
                  </div>
                  <table className="w-full min-w-[1280px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "ROC-AUC",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB832QuantileRows.length > 0 ? (
                        phaseB832QuantileRows.map((row) => (
                          <tr
                            key={String(row.setup_family ?? "--")}
                            className="hover:bg-background/20"
                          >
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {String(row.setup_family ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.raw_candidate_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.trigger_pass_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.finite_score_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.min ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.p10 ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.p50 ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.p90 ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.p99 ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.max ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.positive_label_rate ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.pr_auc ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.roc_auc ?? "--")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={13}>
                            No B.8.3.2 score quantiles yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Calibration Bins
                    </div>
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Bin", "Count", "Pred Mean", "Observed"].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB832CalibrationRows.length > 0 ? (
                          phaseB832CalibrationRows.map((row, index) => (
                            <tr key={`b832-cal-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.bin ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.count ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.predicted_probability_mean ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.observed_positive_rate ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                              No calibration bins yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Diagnostic Threshold Sensitivity
                    </div>
                    <table className="w-full min-w-[780px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Threshold",
                            "Score >= T",
                            "Accepted",
                            "Attempted",
                            "Opened",
                            "Closed",
                          ].map((label, index) => (
                            <th key={`${label}-${index}`} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB832ThresholdRows.length > 0 ? (
                          phaseB832ThresholdRows.map((row, index) => (
                            <tr key={`b832-threshold-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.score_gte_threshold ?? "--")}
                              </td>
                              <td className="px-3 py-2">{String(row.accepted ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.attempted ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.opened ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.closed ?? "--")}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                              No diagnostic threshold sensitivity rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {phaseB832Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB832Blockers.map((item, index) => (
                        <div key={`b832-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.2 score calibration audit report yet. Start manually after reviewing B.8.3.1." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="24"
          title="Phase B.8.3.3 - Feature Schema Parity & Deterministic Inference Repair"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB833Audit}
              disabled={phaseB833Pending || Boolean(phaseB833JobId)}
            >
              {phaseB833Pending || phaseB833JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.3
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-first schema parity and deterministic inference check. This phase separates
              historical inference proof from rebuilt-lineage diagnostics and keeps B.8.1 and Phase
              C readiness blocked.
            </p>

            {phaseB833JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.3 job {phaseB833JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB833State ?? "queued"} / {phaseB833Progress}%
                  </span>
                </div>
                <Progress value={phaseB833Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB833Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB833Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB833Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.3 Failed: {phaseB833Error}
              </div>
            )}

            {phaseB833Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB833StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                {phaseB833NeedsAttention && (
                  <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                    <div className="font-semibold">B.8.3.3 remains research-only.</div>
                    <div className="mt-1 text-amber-100/80">
                      Rebuilt-lineage diagnostics cannot prove historical B.8.3.1 inference root
                      cause unless the exact historical inference matrix is hash-verifiable.
                    </div>
                  </div>
                )}

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB833Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB833Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB833Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB833Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Mutation Proof
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB833Result.mutation_proof?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      Prior B.6/B.7/B.8/B.8.1/B.8.2/B.8.3/B.8.3.1/B.8.3.2 artifacts remain
                      protected.
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Per-Family Schema Parity
                  </div>
                  <table className="w-full min-w-[1320px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Setup",
                          "Artifact",
                          "Matrix",
                          "Alignment",
                          "Prediction",
                          "Missing Model Features",
                          "Predictions Changed",
                          "Threshold",
                          "Pass Before",
                          "Pass After",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB833SchemaRows.length > 0 ? (
                        phaseB833SchemaRows.map((row) => (
                          <tr
                            key={String(row.setup_family ?? "--")}
                            className="hover:bg-background/20"
                          >
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {String(row.setup_family ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.schema_artifact_status ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.actual_inference_matrix_status ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.canonical_alignment_status ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.prediction_effect_status ?? "--")}
                            </td>
                            <td className="max-w-[280px] truncate px-3 py-2">
                              {JSON.stringify(row.missing_model_features ?? [])}
                            </td>
                            <td className="px-3 py-2">{String(row.predictions_changed ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.configured_threshold ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.threshold_pass_count_before_alignment ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.threshold_pass_count_after_alignment ?? "--")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={10}>
                            No B.8.3.3 schema audit rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Before / After Score Quantiles
                    </div>
                    <table className="w-full min-w-[860px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Threshold",
                            "Changed",
                            "Pass Before",
                            "Pass After",
                            "P50 After",
                            "P99 After",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB833QuantileRows.length > 0 ? (
                          phaseB833QuantileRows.map((row) => {
                            const after = (row.after ?? {}) as Record<string, unknown>;
                            return (
                              <tr
                                key={String(row.setup_family ?? "--")}
                                className="hover:bg-background/20"
                              >
                                <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                                <td className="px-3 py-2">
                                  {String(row.configured_threshold ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(row.predictions_changed ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(row.threshold_pass_before ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(row.threshold_pass_after ?? "--")}
                                </td>
                                <td className="px-3 py-2">{String(after.p50 ?? "--")}</td>
                                <td className="px-3 py-2">{String(after.p99 ?? "--")}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                              No before/after quantiles yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Diagnostic Threshold Sensitivity
                    </div>
                    <table className="w-full min-w-[780px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Threshold",
                            "Score >= T",
                            "Accepted",
                            "Attempted",
                            "Opened",
                            "Closed",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB833ThresholdRows.length > 0 ? (
                          phaseB833ThresholdRows.map((row, index) => (
                            <tr key={`b833-threshold-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.score_gte_threshold ?? "--")}
                              </td>
                              <td className="px-3 py-2">{String(row.accepted ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.attempted ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.opened ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.closed ?? "--")}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                              No B.8.3.3 threshold sensitivity rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {phaseB833Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB833Blockers.map((item, index) => (
                        <div key={`b833-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.3 schema parity audit report yet. Start manually after reviewing B.8.3.2." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="25"
          title="Phase B.8.3.4 - Post-Threshold Execution Funnel & Gate-Semantics Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB834Audit}
              disabled={phaseB834Pending || Boolean(phaseB834JobId)}
            >
              {phaseB834Pending || phaseB834JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only post-threshold funnel check. Mode A reproduces score-only diagnostic
              sensitivity; Mode B runs only when execution replay artifacts are hash-verifiable.
              B.8.1 and Phase C readiness remain blocked.
            </p>

            {phaseB834JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.4 job {phaseB834JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB834State ?? "queued"} / {phaseB834Progress}%
                  </span>
                </div>
                <Progress value={phaseB834Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB834Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB834Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB834Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.4 Failed: {phaseB834Error}
              </div>
            )}

            {phaseB834Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB834StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">DIAGNOSTIC_ONLY_NOT_PROMOTION_EVIDENCE</div>
                  <div className="mt-1 text-amber-100/80">
                    Score-passing counts are not execution attempts, opened trades, or promotion
                    evidence. Threshold 0.55 remains unchanged.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB834Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB834Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB834Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB834Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Mutation Proof
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB834Result.mutation_proof?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      Prior B.6/B.7/B.8/B.8.1/B.8.2/B.8.3/B.8.3.1/B.8.3.2/B.8.3.3 artifacts remain
                      protected.
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Mode A Score-Only Threshold Funnel
                  </div>
                  <table className="w-full min-w-[1160px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Closed",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB834ThresholdRows.length > 0 ? (
                        phaseB834ThresholdRows.map((row, index) => (
                          <tr key={`b834-threshold-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.raw_candidate_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.trigger_pass_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.score_finite_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.score_gte_threshold ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.displayed_accepted_count ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.accepted_semantics ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.attempted ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.opened ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.closed ?? "--")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={11}>
                            No B.8.3.4 score-only funnel rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Mode B Per-Family Gate Summary
                    </div>
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
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
                            "Closed",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB834GateRows.length > 0 ? (
                          phaseB834GateRows.map((row, index) => (
                            <tr key={`b834-gate-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.candidate_rows ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.threshold_pass ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.track_pass ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.session_pass ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.spread_pass ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.move_cost_pass ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.accepted_final ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.execution_attempted ?? "--")}
                              </td>
                              <td className="px-3 py-2">{String(row.opened ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.closed ?? "--")}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={12}>
                              No full-funnel replay rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Per-Gate Rejection Summary
                    </div>
                    <table className="w-full min-w-[620px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Threshold", "First Failing Gate", "Count"].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB834RejectionRows.length > 0 ? (
                          phaseB834RejectionRows.map((row, index) => (
                            <tr key={`b834-reject-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.first_failing_gate ?? "--")}
                              </td>
                              <td className="px-3 py-2">{String(row.count ?? "--")}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={4}>
                              No per-gate rejection rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {(phaseB834MissingReplay.length > 0 || phaseB834Blockers.length > 0) && (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Missing Replay Requirements
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB834MissingReplay.length > 0 ? (
                          phaseB834MissingReplay.map((item, index) => (
                            <div key={`b834-missing-${index}`}>
                              {typeof item === "object" ? JSON.stringify(item) : String(item)}
                            </div>
                          ))
                        ) : (
                          <div>--</div>
                        )}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                      <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        Blockers
                      </div>
                      <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                        {phaseB834Blockers.length > 0 ? (
                          phaseB834Blockers.map((item, index) => (
                            <div key={`b834-blocker-${index}`}>
                              {typeof item === "object" ? JSON.stringify(item) : String(item)}
                            </div>
                          ))
                        ) : (
                          <div>--</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4 post-threshold funnel audit report yet. Start manually after reviewing B.8.3.3." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="26"
          title="Phase B.8.3.4.1 - Ledger Hash Attestation & Source-Lineage Integrity Proof"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB8341Audit}
              disabled={phaseB8341Pending || Boolean(phaseB8341JobId)}
            >
              {phaseB8341Pending || phaseB8341JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4.1
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only post-hoc cryptographic baseline for the current B.8.3.4 ledger files. It
              proves files remain unchanged after attestation, but does not prove historical
              immutability before the first attestation.
            </p>

            {phaseB8341JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.4.1 job {phaseB8341JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB8341State ?? "queued"} / {phaseB8341Progress}%
                  </span>
                </div>
                <Progress value={phaseB8341Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB8341Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB8341Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB8341Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.4.1 Failed: {phaseB8341Error}
              </div>
            )}

            {phaseB8341Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB8341StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">POST_HOC_CURRENT_FILE_BASELINE</div>
                  <div className="mt-1 text-amber-100/80">
                    Historical immutability remains{" "}
                    {String(phaseB8341Result.historical_immutability_proven ?? false)}. Locked
                    confirmation stays unopened with row consumption{" "}
                    {phaseB8341Result.locked_confirmation_row_consumption_count ?? 0}.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Source Hashes
                    </div>
                    <div className="space-y-2 font-mono-num text-[11px] text-muted-foreground">
                      <div className="break-all">
                        report: {phaseB8341Result.source_b834_report_sha256 ?? "--"}
                      </div>
                      <div className="break-all">
                        manifest: {phaseB8341Result.source_b834_manifest_sha256 ?? "--"}
                      </div>
                      <div className="break-all">
                        attestation: {phaseB8341Result.attestation_manifest_sha256 ?? "--"}
                      </div>
                      <div>attested: {phaseB8341Result.attested_at_utc ?? "--"}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB8341Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB8341Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB8341Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB8341Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Ledger Attestation
                  </div>
                  <table className="w-full min-w-[960px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
                          "Ledger",
                          "Rows",
                          "Columns",
                          "SHA-256",
                          "Schema",
                          "Event IDs",
                          "Setup Families",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB8341LedgerRows.map(([label, payload]) => {
                        const row = (payload ?? {}) as Record<string, unknown>;
                        return (
                          <tr key={String(label)} className="hover:bg-background/20">
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {String(label)}
                            </td>
                            <td className="px-3 py-2">{String(row.row_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.column_count ?? "--")}</td>
                            <td className="max-w-[260px] truncate px-3 py-2">
                              {String(row.sha256 ?? "--")}
                            </td>
                            <td className="max-w-[240px] truncate px-3 py-2">
                              {String(row.schema_hash ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.event_id_integrity_status ?? "--")}
                            </td>
                            <td className="max-w-[280px] truncate px-3 py-2">
                              {JSON.stringify(row.setup_family_counts ?? {})}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Join Integrity Summary
                  </div>
                  <div className="font-mono-num text-[11px] text-muted-foreground">
                    {JSON.stringify(phaseB8341Result.join_integrity_summary ?? {})}
                  </div>
                </div>

                {phaseB8341Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB8341Blockers.map((item, index) => (
                        <div key={`b8341-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4.1 ledger attestation report yet. Start manually after reviewing B.8.3.4." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="27"
          title="Phase B.8.3.4.2 - Ledger Schema Mapping & Event-ID Provenance Repair"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB8342Audit}
              disabled={phaseB8342Pending || Boolean(phaseB8342JobId)}
            >
              {phaseB8342Pending || phaseB8342JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4.2
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only ledger schema mapping repair. It uses the B.8.3.4.1 status-only hash
              capture only as a pre-mapping tamper check, keeps signal/open/close timestamps
              distinct, and publishes only a new normalized research sidecar when provenance is
              fully proven.
            </p>

            {phaseB8342JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.4.2 job {phaseB8342JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB8342State ?? "queued"} / {phaseB8342Progress}%
                  </span>
                </div>
                <Progress value={phaseB8342Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB8342Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB8342Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB8342Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.4.2 Failed: {phaseB8342Error}
              </div>
            )}

            {phaseB8342Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB8342StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">POST_HOC_CURRENT_FILE_BASELINE</div>
                  <div className="mt-1 text-amber-100/80">
                    Historical immutability and historical root cause remain{" "}
                    {String(phaseB8342Result.historical_root_cause_proven ?? false)}. Locked
                    confirmation stays unopened with row consumption{" "}
                    {phaseB8342Result.locked_confirmation_row_consumption_count ?? 0}.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Timestamp Semantics
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      <div>candidate: {phaseB8342Result.candidate_timestamp_semantic ?? "--"}</div>
                      <div>opened: {phaseB8342Result.trade_open_timestamp_semantic ?? "--"}</div>
                      <div>closed: {phaseB8342Result.trade_close_timestamp_semantic ?? "--"}</div>
                      <div>
                        chronology violations: {phaseB8342Result.chronology_violation_count ?? 0}
                      </div>
                      <div>
                        same-semantic mismatches:{" "}
                        {phaseB8342Result.same_semantic_timestamp_mismatch_count ?? 0}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB8342Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB8342Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB8342Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB8342Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Direction Inventory
                    </div>
                    <table className="w-full min-w-[860px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Ledger",
                            "Source",
                            "Raw Counts",
                            "Canonical Counts",
                            "Missing",
                            "Ambiguous",
                            "Status",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8342DirectionRows.map(([label, payload]) => {
                          const row = (payload ?? {}) as Record<string, unknown>;
                          return (
                            <tr key={String(label)} className="hover:bg-background/20">
                              <td className="px-3 py-2 font-semibold text-foreground">
                                {String(label)}
                              </td>
                              <td className="px-3 py-2">{String(row.source_field ?? "--")}</td>
                              <td className="max-w-[220px] truncate px-3 py-2">
                                {JSON.stringify(row.raw_value_counts ?? {})}
                              </td>
                              <td className="max-w-[220px] truncate px-3 py-2">
                                {JSON.stringify(row.canonical_value_counts ?? {})}
                              </td>
                              <td className="px-3 py-2">{String(row.missing_row_count ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.ambiguous_row_count ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.status ?? "--")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Direction Join Parity
                    </div>
                    <div className="grid gap-2 font-mono-num text-[11px] text-muted-foreground sm:grid-cols-2">
                      <div>
                        status:{" "}
                        {String(phaseB8342DirectionParity.direction_join_parity_status ?? "--")}
                      </div>
                      <div>
                        joined trades: {String(phaseB8342DirectionParity.joined_trade_count ?? 0)}
                      </div>
                      <div>
                        mismatches:{" "}
                        {String(phaseB8342DirectionParity.direction_mismatch_count ?? 0)}
                      </div>
                      <div>
                        missing: {String(phaseB8342DirectionParity.missing_direction_count ?? 0)}
                      </div>
                      <div>
                        orphans: {String(phaseB8342DirectionParity.orphan_trade_count ?? 0)}
                      </div>
                      <div>
                        duplicate joins:{" "}
                        {String(phaseB8342DirectionParity.duplicate_join_count ?? 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Direction Mapping Table
                  </div>
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Ledger", "Source", "Raw", "Rows", "Canonical", "Status", "Rule"].map(
                          (label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB8342DirectionMappings.length > 0 ? (
                        phaseB8342DirectionMappings.map((row, index) => (
                          <tr key={`b8342-direction-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">{String(row.ledger_kind ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.source_field ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.raw_value ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.raw_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.canonical_value ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.status ?? "--")}</td>
                            <td className="max-w-[360px] truncate px-3 py-2">
                              {String(row.derived_rule ?? "--")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                            No direction mapping rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Normalized Ledger Attestation
                  </div>
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Ledger", "Rows", "Columns", "SHA-256", "Schema"].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB8342LedgerRows.map(([label, payload]) => {
                        const row = (payload ?? {}) as Record<string, unknown>;
                        return (
                          <tr key={String(label)} className="hover:bg-background/20">
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {String(label)}
                            </td>
                            <td className="px-3 py-2">{String(row.row_count ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.column_count ?? "--")}</td>
                            <td className="max-w-[320px] truncate px-3 py-2">
                              {String(row.sha256 ?? "--")}
                            </td>
                            <td className="max-w-[260px] truncate px-3 py-2">
                              {String(row.schema_hash ?? "--")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 xl:grid-cols-2">
                  {[
                    ["Candidate Field Mapping", phaseB8342CandidateMappings],
                    ["Trade Field Mapping", phaseB8342TradeMappings],
                  ].map(([title, rows]) => (
                    <div
                      key={String(title)}
                      className="overflow-x-auto rounded-xl border border-border/40 bg-background/25"
                    >
                      <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(title)}
                      </div>
                      <table className="w-full min-w-[760px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                            {["Target", "Source", "Type", "Status", "Ambiguous"].map((label) => (
                              <th key={label} className="px-3 py-3 text-left">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10 font-mono-num">
                          {(rows as Array<Record<string, unknown>>).length > 0 ? (
                            (rows as Array<Record<string, unknown>>).map((row, index) => (
                              <tr
                                key={`${String(title)}-${index}`}
                                className="hover:bg-background/20"
                              >
                                <td className="px-3 py-2">{String(row.target_field ?? "--")}</td>
                                <td className="px-3 py-2">{String(row.source_field ?? "--")}</td>
                                <td className="px-3 py-2">{String(row.mapping_type ?? "--")}</td>
                                <td className="px-3 py-2">{String(row.status ?? "--")}</td>
                                <td className="px-3 py-2">
                                  {String(
                                    row.ambiguous_row_count ?? row.invalid_timestamp_count ?? 0,
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                                No mapping rows yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>

                {phaseB8342Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB8342Blockers.map((item, index) => (
                        <div key={`b8342-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4.2 schema mapping report yet. Start manually after reviewing B.8.3.4.1." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="28"
          title="Phase B.8.3.4.2.1 - Direction Attribution Historical Provenance Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB83421Audit}
              disabled={phaseB83421Pending || Boolean(phaseB83421JobId)}
            >
              {phaseB83421Pending || phaseB83421JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4.2.1
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only direction attribution layer. It separates persisted historical transform
              proof from current-code diagnostics, and it cannot unlock B.8.3.6 unless historical
              transform provenance is hash-verifiable.
            </p>

            {phaseB83421JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.4.2.1 job {phaseB83421JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB83421State ?? "queued"} / {phaseB83421Progress}%
                  </span>
                </div>
                <Progress value={phaseB83421Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB83421Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB83421Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB83421Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.4.2.1 Failed: {phaseB83421Error}
              </div>
            )}

            {phaseB83421Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB83421StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">Historical transform proof is fail-closed.</div>
                  <div className="mt-1 text-amber-100/80">
                    Current-code reproduction is diagnostic only unless persisted rule, config, and
                    generation-code hashes bind to the exact B.8.3.4 lineage. Historical root cause
                    remains {String(phaseB83421Result.historical_root_cause_proven ?? false)}.
                    Locked rows consumed{" "}
                    {phaseB83421Result.locked_confirmation_row_consumption_count ?? 0}.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Direction Counts
                    </div>
                    <div className="grid gap-2 font-mono-num text-[11px] text-muted-foreground sm:grid-cols-2">
                      <div>joined: {phaseB83421Result.joined_trade_count ?? 0}</div>
                      <div>matches: {phaseB83421Result.direction_match_count ?? 0}</div>
                      <div>mismatches: {phaseB83421Result.direction_mismatch_count ?? 0}</div>
                      <div>unresolved: {phaseB83421Result.unresolved_count ?? 0}</div>
                      <div>BUY→SELL: {phaseB83421Result.candidate_buy_trade_sell_count ?? 0}</div>
                      <div>SELL→BUY: {phaseB83421Result.candidate_sell_trade_buy_count ?? 0}</div>
                      <div>
                        FLAT+trade: {phaseB83421Result.candidate_flat_with_trade_count ?? 0}
                      </div>
                      <div>invert: {phaseB83421Result.invert_match_count ?? 0}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Historical Binding
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83421ProofRows.map(([label, value]) => (
                        <div key={String(label)}>
                          {String(label)}: {String(value ?? "--")}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Readiness
                    </div>
                    <div className="space-y-2 text-muted-foreground">
                      <div>
                        <span className="font-mono-num font-semibold text-foreground">
                          {phaseB83421Result.b81_rerun_readiness?.status ?? "--"}
                        </span>{" "}
                        B.8.1
                      </div>
                      <div>{phaseB83421Result.b81_rerun_readiness?.reason ?? "--"}</div>
                      <div>
                        <span className="font-mono-num font-semibold text-foreground">
                          {phaseB83421Result.phase_c_readiness_decision?.status ?? "--"}
                        </span>{" "}
                        Phase C
                      </div>
                      <div>{phaseB83421Result.phase_c_readiness_decision?.reason ?? "--"}</div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Direction Attribution
                  </div>
                  <table className="w-full min-w-[1120px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Row Source",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB83421AttributionRows.length > 0 ? (
                        phaseB83421AttributionRows.map((row, index) => (
                          <tr
                            key={`b83421-attribution-${index}`}
                            className="hover:bg-background/20"
                          >
                            <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.source_config_id ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.joined_trade_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.identity_match_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.invert_match_count ?? 0)}</td>
                            <td className="px-3 py-2">
                              {String(row.direction_mismatch_count ?? 0)}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.candidate_buy_trade_sell_count ?? 0)}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.candidate_sell_trade_buy_count ?? 0)}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.candidate_flat_with_trade_count ?? 0)}
                            </td>
                            <td className="px-3 py-2">{String(row.unresolved_count ?? 0)}</td>
                            <td className="px-3 py-2">
                              {String(row.row_level_source_available ?? false)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={11}>
                            No B.8.3.4.2.1 direction attribution rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {phaseB83421Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83421Blockers.map((item, index) => (
                        <div key={`b83421-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4.2.1 direction provenance report yet. Start manually after reviewing B.8.3.4.2." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="29"
          title="Phase B.8.3.4.3 - Provenance-Complete Reproducible Ledger Baseline Rebuild"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB8343Audit}
              disabled={phaseB8343Pending || Boolean(phaseB8343JobId)}
            >
              {phaseB8343Pending || phaseB8343JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4.3
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only new-lineage baseline rebuild. It uses the verified immutable B.8.2 raw
              sidecar and current versioned research configuration, persists source/config/rule,
              feature, model, prediction, candidate, and trade attestations, and never repairs old
              historical lineage proof.
            </p>

            {phaseB8343JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.4.3 job {phaseB8343JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB8343State ?? "queued"} / {phaseB8343Progress}%
                  </span>
                </div>
                <Progress value={phaseB8343Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB8343Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB8343Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB8343Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.4.3 Failed: {phaseB8343Error}
              </div>
            )}

            {phaseB8343Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {phaseB8343StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">B.8.3.4.3 creates a new baseline only.</div>
                  <div className="mt-1 text-amber-100/80">
                    Historical repair is{" "}
                    {String(phaseB8343Result.historical_lineage_repair ?? false)}. Historical
                    root-cause proof is{" "}
                    {String(phaseB8343Result.historical_root_cause_proven ?? false)}. Locked
                    confirmation is {phaseB8343Result.locked_confirmation_status ?? "--"} with{" "}
                    {phaseB8343Result.locked_confirmation_row_consumption_count ?? 0} locked rows
                    consumed.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Replay And Ledger Proof
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      <div>
                        replay mismatches:{" "}
                        {phaseB8343Result.deterministic_replay_mismatch_count ?? "--"}
                      </div>
                      <div>joined trades: {phaseB8343Result.joined_trade_count ?? 0}</div>
                      <div>direction matches: {phaseB8343Result.direction_match_count ?? 0}</div>
                      <div>
                        direction mismatches: {phaseB8343Result.direction_mismatch_count ?? 0}
                      </div>
                      <div>orphan trades: {phaseB8343Result.orphan_trade_count ?? 0}</div>
                      <div>
                        chronology violations: {phaseB8343Result.chronology_violation_count ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Hashes
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      <div>
                        raw: {compactHash(phaseB8343Result.source_raw_sidecar_manifest_sha256)}
                      </div>
                      <div>candidate: {compactHash(phaseB8343Result.candidate_ledger_sha256)}</div>
                      <div>trade: {compactHash(phaseB8343Result.trade_ledger_sha256)}</div>
                      <div>manifest: {compactHash(phaseB8343Result.sidecar_manifest_sha256)}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Readiness
                    </div>
                    <div className="space-y-2 text-muted-foreground">
                      <div>
                        <span className="font-mono-num font-semibold text-foreground">
                          {phaseB8343Result.b81_rerun_readiness?.status ?? "--"}
                        </span>{" "}
                        B.8.1
                      </div>
                      <div>{phaseB8343Result.b81_rerun_readiness?.reason ?? "--"}</div>
                      <div>
                        <span className="font-mono-num font-semibold text-foreground">
                          {phaseB8343Result.phase_c_readiness_decision?.status ?? "--"}
                        </span>{" "}
                        Phase C
                      </div>
                      <div>{phaseB8343Result.phase_c_readiness_decision?.reason ?? "--"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Raw Sidecar Attestation
                    </div>
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["TF", "Rows", "First", "Last", "Dup", "Null", "Order"].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8343RawRows.length > 0 ? (
                          phaseB8343RawRows.map((row, index) => (
                            <tr key={`b8343-raw-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.timeframe ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.row_count ?? 0)}</td>
                              <td className="px-3 py-2">
                                {String(row.first_timestamp_utc ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.last_timestamp_utc ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.duplicate_timestamp_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">{String(row.null_timestamp_count ?? 0)}</td>
                              <td className="px-3 py-2">
                                {String(row.chronological_order_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                              No B.8.3.4.3 raw-sidecar attestation rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Per-Family Funnel
                    </div>
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Raw",
                            "Threshold",
                            "Accepted",
                            "Opened",
                            "Closed",
                            "TP",
                            "SL",
                            "Timeout",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8343FunnelRows.length > 0 ? (
                          phaseB8343FunnelRows.map((row, index) => (
                            <tr key={`b8343-funnel-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.raw_candidate ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.threshold_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.accepted_final ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.opened ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.closed ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.tp ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.sl ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.timeout ?? 0)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={9}>
                              No B.8.3.4.3 funnel rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {phaseB8343Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB8343Blockers.map((item, index) => (
                        <div key={`b8343-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4.3 new-lineage baseline report yet. Start manually only after reviewing B.8.3.4.2.1." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="29.1"
          title="Phase B.8.3.4.3.1 - Manifest-Bound Trigger-Provenance Complete Baseline Rebuild"
          icon={ShieldCheck}
          className="hidden"
          right={
            <Button
              size="sm"
              onClick={startPhaseB83431Audit}
              disabled={phaseB83431Pending || Boolean(phaseB83431JobId)}
            >
              {phaseB83431Pending || phaseB83431JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4.3.1
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only trigger-provenance-complete baseline rebuild. It inherits the verified
              B.8.3.4.3 lineage, reuses manifest-bound trigger provenance plus trigger input rows,
              and keeps B.8.1 and Phase C readiness blocked.
            </p>

            {phaseB83431JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.4.3.1 job {phaseB83431JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB83431State ?? "queued"} / {phaseB83431Progress}%
                  </span>
                </div>
                <Progress value={phaseB83431Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB83431Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB83431Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB83431Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.4.3.1 Failed: {phaseB83431Error}
              </div>
            )}

            {phaseB83431Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {phaseB83431StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">
                    B.8.3.4.3.1 creates a new trigger baseline only.
                  </div>
                  <div className="mt-1 text-amber-100/80">
                    Historical repair is{" "}
                    {String(phaseB83431Result.historical_lineage_repair ?? false)}. Historical
                    root-cause proof is{" "}
                    {String(phaseB83431Result.historical_root_cause_proven ?? false)}. Locked
                    confirmation is {phaseB83431Result.locked_confirmation_status ?? "--"} with{" "}
                    {phaseB83431Result.locked_confirmation_row_consumption_count ?? 0} locked rows
                    consumed.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Source Provenance
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83431SourceRows.map(([label, value]) => (
                        <div key={String(label)} className="flex justify-between gap-3">
                          <span>{String(label)}</span>
                          <span className="truncate text-right text-foreground">
                            {String(value ?? "--")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Replay & Hashes
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      <div>
                        trigger provenance:{" "}
                        {compactHash(
                          phaseB83431Result.trigger_rule_attestation
                            ?.trigger_rule_provenance_sha256,
                        )}
                      </div>
                      <div>
                        trigger input:{" "}
                        {compactHash(
                          phaseB83431Result.trigger_input_attestation?.trigger_input_frame_sha256,
                        )}
                      </div>
                      <div>
                        feature frame: {compactHash(phaseB83431Result.feature_frame_sha256)}
                      </div>
                      <div>
                        candidate ledger:{" "}
                        {compactHash(phaseB83431Result.ledger_attestation?.candidate_ledger_sha256)}
                      </div>
                      <div>
                        trade ledger:{" "}
                        {compactHash(phaseB83431Result.ledger_attestation?.trade_ledger_sha256)}
                      </div>
                      <div>
                        sidecar manifest: {compactHash(phaseB83431Result.sidecar_manifest_sha256)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Trigger Rule Provenance
                    </div>
                    <table className="w-full min-w-[900px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Config", "Source", "Version", "SHA", "Binding"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-left">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431TriggerRows.length > 0 ? (
                          phaseB83431TriggerRows.map((row, index) => (
                            <tr key={`b83431-trigger-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.source_config_id ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_rule_source ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_rule_version ?? "--")}
                              </td>
                              <td className="px-3 py-2">{compactHash(row.trigger_rule_sha256)}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_rule_binding_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                              No trigger rule provenance rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Trigger Input Audit
                    </div>
                    <table className="w-full min-w-[960px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Config",
                            "Rows",
                            "Missing",
                            "Null",
                            "Inf",
                            "DType",
                            "Status",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431InputRows.length > 0 ? (
                          phaseB83431InputRows.map((row, index) => (
                            <tr key={`b83431-input-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.source_config_id ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_row_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_missing_column_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_null_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_inf_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_dtype_mismatch_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_integrity_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={8}>
                              No trigger input audit rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Persisted vs Recomputed Parity
                    </div>
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Persisted", "Replay1", "Replay2", "Mismatch", "Status"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-left">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431ParityRows.length > 0 ? (
                          phaseB83431ParityRows.map((row, index) => (
                            <tr key={`b83431-parity-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.persisted_trigger_pass_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.recomputed_trigger_pass_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.recomputed_trigger_pass_count_replay_2 ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.persisted_vs_recomputed_trigger_parity_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                              No parity rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Sequential Funnel & First Fail
                    </div>
                    <table className="w-full min-w-[1120px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
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
                            "Closed",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431FunnelRows.length > 0 ? (
                          phaseB83431FunnelRows.map((row, index) => (
                            <tr key={`b83431-funnel-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.raw_candidate ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.trigger_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.score_available ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.threshold_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.track_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.regime_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.session_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.spread_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.move_cost_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.accepted_final ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.opened ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.closed ?? 0)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={14}>
                              No sequential funnel rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    First Failing Gate Waterfall
                  </div>
                  <table className="w-full min-w-[960px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Setup", "Region", "Gate", "Reached", "Passed", "Rejected"].map(
                          (label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB83431WaterfallRows.length > 0 ? (
                        phaseB83431WaterfallRows.map((row, index) => (
                          <tr key={`b83431-waterfall-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.gate ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.reaching_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.passing_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.rejected_count ?? 0)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                            No waterfall rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {phaseB83431Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83431Blockers.map((item, index) => (
                        <div key={`b83431-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4.3.1 trigger provenance report yet. Start manually only after reviewing B.8.3.4.3." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="29.1"
          title="Phase B.8.3.4.3.1 - Manifest-Bound Trigger-Provenance Complete Baseline Rebuild"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB83431Audit}
              disabled={phaseB83431Pending || Boolean(phaseB83431JobId)}
            >
              {phaseB83431Pending || phaseB83431JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4.3.1
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only trigger-provenance-complete baseline rebuild. It inherits the verified
              B.8.3.4.3 lineage, reuses manifest-bound trigger provenance plus trigger input rows,
              and keeps B.8.1 and Phase C readiness blocked.
            </p>

            {phaseB83431JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.4.3.1 job {phaseB83431JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB83431State ?? "queued"} / {phaseB83431Progress}%
                  </span>
                </div>
                <Progress value={phaseB83431Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB83431Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB83431Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB83431Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.4.3.1 Failed: {phaseB83431Error}
              </div>
            )}

            {phaseB83431Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {phaseB83431StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">
                    B.8.3.4.3.1 creates a new trigger baseline only.
                  </div>
                  <div className="mt-1 text-amber-100/80">
                    Historical repair is{" "}
                    {String(phaseB83431Result.historical_lineage_repair ?? false)}. Historical
                    root-cause proof is{" "}
                    {String(phaseB83431Result.historical_root_cause_proven ?? false)}. Locked
                    confirmation is {phaseB83431Result.locked_confirmation_status ?? "--"} with{" "}
                    {phaseB83431Result.locked_confirmation_row_consumption_count ?? 0} locked rows
                    consumed.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Source Provenance
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83431SourceRows.map(([label, value]) => (
                        <div key={String(label)} className="flex justify-between gap-3">
                          <span>{String(label)}</span>
                          <span className="truncate text-right text-foreground">
                            {String(value ?? "--")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Replay & Hashes
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      <div>
                        trigger provenance:{" "}
                        {compactHash(
                          phaseB83431Result.trigger_rule_attestation
                            ?.trigger_rule_provenance_sha256,
                        )}
                      </div>
                      <div>
                        trigger input:{" "}
                        {compactHash(
                          phaseB83431Result.trigger_input_attestation?.trigger_input_frame_sha256,
                        )}
                      </div>
                      <div>
                        feature frame: {compactHash(phaseB83431Result.feature_frame_sha256)}
                      </div>
                      <div>
                        candidate ledger:{" "}
                        {compactHash(phaseB83431Result.ledger_attestation?.candidate_ledger_sha256)}
                      </div>
                      <div>
                        trade ledger:{" "}
                        {compactHash(phaseB83431Result.ledger_attestation?.trade_ledger_sha256)}
                      </div>
                      <div>
                        sidecar manifest: {compactHash(phaseB83431Result.sidecar_manifest_sha256)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Trigger Rule Provenance
                    </div>
                    <table className="w-full min-w-[900px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Config", "Source", "Version", "SHA", "Binding"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-left">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431TriggerRows.length > 0 ? (
                          phaseB83431TriggerRows.map((row, index) => (
                            <tr key={`b83431-trigger-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.source_config_id ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_rule_source ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_rule_version ?? "--")}
                              </td>
                              <td className="px-3 py-2">{compactHash(row.trigger_rule_sha256)}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_rule_binding_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                              No trigger rule provenance rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Trigger Input Audit
                    </div>
                    <table className="w-full min-w-[960px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Config",
                            "Rows",
                            "Missing",
                            "Null",
                            "Inf",
                            "DType",
                            "Status",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431InputRows.length > 0 ? (
                          phaseB83431InputRows.map((row, index) => (
                            <tr key={`b83431-input-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.source_config_id ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_row_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_missing_column_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_null_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_inf_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_dtype_mismatch_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_integrity_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={8}>
                              No trigger input audit rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Persisted vs Recomputed Parity
                    </div>
                    <table className="w-full min-w-[980px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Persisted", "Replay1", "Replay2", "Mismatch", "Status"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-left">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431ParityRows.length > 0 ? (
                          phaseB83431ParityRows.map((row, index) => (
                            <tr key={`b83431-parity-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.persisted_trigger_pass_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.recomputed_trigger_pass_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.recomputed_trigger_pass_count_replay_2 ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.persisted_vs_recomputed_trigger_parity_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                              No parity rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Sequential Funnel & First Fail
                    </div>
                    <table className="w-full min-w-[1120px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
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
                            "Closed",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB83431FunnelRows.length > 0 ? (
                          phaseB83431FunnelRows.map((row, index) => (
                            <tr key={`b83431-funnel-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.raw_candidate ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.trigger_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.score_available ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.threshold_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.track_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.regime_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.session_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.spread_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.move_cost_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.accepted_final ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.opened ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.closed ?? 0)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={14}>
                              No sequential funnel rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    First Failing Gate Waterfall
                  </div>
                  <table className="w-full min-w-[960px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Setup", "Region", "Gate", "Reached", "Passed", "Rejected"].map(
                          (label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB83431WaterfallRows.length > 0 ? (
                        phaseB83431WaterfallRows.map((row, index) => (
                          <tr key={`b83431-waterfall-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.gate ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.reaching_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.passing_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.rejected_count ?? 0)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                            No waterfall rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {phaseB83431Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83431Blockers.map((item, index) => (
                        <div key={`b83431-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4.3.1 trigger provenance report yet. Start manually only after reviewing B.8.3.4.3." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="30"
          title="Phase B.8.3.4.3.2 - Versioned Trigger-Rule Specification & Replayable Baseline Repair"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB83432Audit}
              disabled={phaseB83432Pending || Boolean(phaseB83432JobId)}
            >
              {phaseB83432Pending || phaseB83432JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.4.3.2
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Research-only new lineage from the immutable B.8.3.4.3 parent. This phase records a
              versioned raw-prediction trigger rule and keeps B.8.1 plus Phase C blocked.
            </p>

            {phaseB83432JobId && (
              <div className="rounded-xl border border-[oklch(0.88_0.018_95/0.25)] bg-[oklch(0.88_0.018_95/0.08)] p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[oklch(0.96_0.012_95)]">
                    Phase B.8.3.4.3.2 job {phaseB83432JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB83432State ?? "queued"} / {phaseB83432Progress}%
                  </span>
                </div>
                <Progress value={phaseB83432Progress} className="h-1.5" />
                <div className="mt-2 flex flex-col gap-1 text-[11px] text-muted-foreground md:flex-row md:justify-between">
                  <span>{phaseB83432Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB83432Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB83432Error && (
              <p className="break-words rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                Phase B.8.3.4.3.2 Failed: {phaseB83432Error}
              </p>
            )}

            {phaseB83432Result ? (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                  {phaseB83432StatusRows.map(([label, value]) => (
                    <div
                      key={`b83432-status-${label}`}
                      className="rounded-xl border border-border/35 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {label}
                      </div>
                      <div className="mt-1 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[oklch(0.88_0.018_95/0.24)] bg-[oklch(0.88_0.018_95/0.06)] p-3 text-xs leading-relaxed text-muted-foreground">
                  New-lineage only. Historical repair is{" "}
                  {String(phaseB83432Result.historical_lineage_repair ?? false)} and historical
                  root-cause proof is{" "}
                  {String(phaseB83432Result.historical_root_cause_proven ?? false)}. Locked
                  confirmation remains {phaseB83432Result.locked_confirmation_status ?? "--"} with{" "}
                  {phaseB83432Result.locked_confirmation_row_consumption_count ?? 0} locked rows
                  read.
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Hash-Bound References
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                      {phaseB83432HashRows.map(([label, value]) => (
                        <div
                          key={`b83432-hash-${label}`}
                          className="rounded-lg border border-border/25 bg-background/25 p-2"
                        >
                          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-1 break-words text-foreground">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Raw Prediction Integrity
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                      {[
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
                          phaseB83432Result.trigger_input_candidate_fk_duplicate_count,
                        ],
                        ["fk orphan", phaseB83432Result.trigger_input_candidate_fk_orphan_count],
                        [
                          "config mismatch",
                          phaseB83432Result.trigger_input_source_config_mismatch_count,
                        ],
                        [
                          "family mismatch",
                          phaseB83432Result.trigger_input_setup_family_mismatch_count,
                        ],
                        [
                          "row-hash mismatch",
                          phaseB83432Result.trigger_input_row_hash_mismatch_count,
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={`b83432-raw-${label}`}
                          className="rounded-lg border border-border/25 bg-background/25 p-2"
                        >
                          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {label}
                          </div>
                          <div className="mt-1 text-foreground">{String(value ?? "--")}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Prediction Payload Resolution
                  </div>
                  <table className="w-full min-w-[980px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Family", "State", "Path", "Rows", "Expected", "Actual", "Columns"].map(
                          (label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB83432PredictionResolutionRows.length > 0 ? (
                        phaseB83432PredictionResolutionRows.map((row, index) => (
                          <tr key={`b83432-payload-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.prediction_payload_state ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.prediction_payload_path_resolution_status ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.row_count ?? 0)}</td>
                            <td className="px-3 py-2">
                              {compactHash(row.expected_sha256 as string | null | undefined)}
                            </td>
                            <td className="px-3 py-2">
                              {compactHash(row.actual_sha256 as string | null | undefined)}
                            </td>
                            <td className="px-3 py-2">
                              {Array.isArray(row.ordered_columns)
                                ? String(row.ordered_columns.length)
                                : "--"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                            No prediction-payload resolution rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Explicit Raw-Prediction Mapping
                  </div>
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Raw", "Mapped", "Trigger", "Type", "Rule", "Rows", "Status"].map(
                          (label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB83432InventoryRows.length > 0 ? (
                        phaseB83432InventoryRows.map((row, index) => (
                          <tr key={`b83432-map-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">
                              {String(row.raw_prediction_value ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.mapped_raw_direction ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.trigger_pass ?? false)}</td>
                            <td className="px-3 py-2">{String(row.mapping_type ?? "--")}</td>
                            <td className="px-3 py-2">{compactHash(row.rule_sha256)}</td>
                            <td className="px-3 py-2">{String(row.row_count ?? 0)}</td>
                            <td className="px-3 py-2">{String(row.status ?? "--")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                            No trigger-source inventory rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {phaseB83432Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB83432Blockers.map((item, index) => (
                        <div key={`b83432-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.4.3.2 versioned trigger-rule baseline report yet." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="30"
          title="Phase B.8.3.5 - Temporal Calibration & Locked OOS Threshold Policy Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB835Audit}
              disabled={phaseB835Pending || Boolean(phaseB835JobId)}
            >
              {phaseB835Pending || phaseB835JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.5
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only temporal calibration and locked OOS threshold policy check. It uses the
              completed B.8.3.4 full-funnel lineage, keeps locked confirmation unopened, and leaves
              B.8.1 plus Phase C readiness blocked.
            </p>

            {phaseB835JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.5 job {phaseB835JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB835State ?? "queued"} / {phaseB835Progress}%
                  </span>
                </div>
                <Progress value={phaseB835Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB835Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB835Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB835Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.5 Failed: {phaseB835Error}
              </div>
            )}

            {phaseB835Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB835StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">B.8.3.5 remains research-only.</div>
                  <div className="mt-1 text-amber-100/80">
                    Raw threshold diagnostics cannot mutate the configured live threshold. Locked
                    confirmation remains unopened and row consumption stays at{" "}
                    {phaseB835Result.locked_confirmation_row_consumption_count ?? 0}.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB835Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB835Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB835Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB835Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Mutation Proof
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB835Result.mutation_proof?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      Prior B.6 through B.8.3.4 artifacts remain protected.
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Split Proof
                  </div>
                  <table className="w-full min-w-[760px] text-left text-xs">
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {[
                        ["Policy", phaseB835Result.split_policy_version],
                        ["Eligible Rows", phaseB835Result.split_proof?.eligible_row_count],
                        ["Calibration Rows", phaseB835Result.split_proof?.calibration_row_count],
                        ["Purge Rows", phaseB835Result.split_proof?.purge_row_count],
                        ["Validation Rows", phaseB835Result.split_proof?.validation_row_count],
                        [
                          "Calibration UTC",
                          `${phaseB835Result.split_proof?.calibration_start_utc ?? "--"} -> ${phaseB835Result.split_proof?.calibration_end_utc ?? "--"}`,
                        ],
                        [
                          "Validation UTC",
                          `${phaseB835Result.split_proof?.validation_start_utc ?? "--"} -> ${phaseB835Result.split_proof?.validation_end_utc ?? "--"}`,
                        ],
                      ].map(([label, value]) => (
                        <tr key={String(label)} className="hover:bg-background/20">
                          <td className="w-[220px] px-3 py-2 text-muted-foreground">
                            {String(label)}
                          </td>
                          <td className="px-3 py-2 text-foreground">{String(value ?? "--")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Raw-Score Policy Metrics
                  </div>
                  <table className="w-full min-w-[1300px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {[
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
                          "Pass",
                        ].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB835RawRows.length > 0 ? (
                        phaseB835RawRows.map((row, index) => (
                          <tr key={`b835-raw-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.candidate_rows ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.accepted_count ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.execution_attempt_count ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.opened_count ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.closed_executed_trade_count ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.realistic_pf ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.realistic_expectancy ?? "--")}
                            </td>
                            <td className="px-3 py-2">{String(row.realistic_drawdown ?? "--")}</td>
                            <td className="px-3 py-2">
                              {String(row.directional_gate_result ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.regime_stability_gate_result ?? "--")}
                            </td>
                            <td className="px-3 py-2">
                              {String(row.policy_passes_calibration_gates ?? "--")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={14}>
                            No B.8.3.5 raw policy metric rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Diagnostic Calibration
                    </div>
                    <table className="w-full min-w-[780px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Region",
                            "Platt",
                            "Isotonic",
                            "Scores",
                            "P50",
                            "Label Rate",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB835CalibrationRows.length > 0 ? (
                          phaseB835CalibrationRows.map((row, index) => (
                            <tr key={`b835-cal-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.platt_status ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.isotonic_status ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.score_count ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.score_p50 ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.positive_label_rate ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                              No diagnostic calibration rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Frozen Policies / Validation
                    </div>
                    <table className="w-full min-w-[780px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Threshold",
                            "Source",
                            "Validation",
                            "Closed",
                            "PF",
                            "Expect",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB835FrozenRows.length > 0 ? (
                          phaseB835FrozenRows.map((row, index) => {
                            const validation = phaseB835ValidationRows.find(
                              (item) => String(item.setup_family) === String(row.setup_family),
                            );
                            return (
                              <tr key={`b835-policy-${index}`} className="hover:bg-background/20">
                                <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                                <td className="px-3 py-2">
                                  {String(row.frozen_diagnostic_threshold ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(row.threshold_source ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(validation?.validation_status ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(validation?.closed_executed_trade_count ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(validation?.realistic_pf ?? "--")}
                                </td>
                                <td className="px-3 py-2">
                                  {String(validation?.realistic_expectancy ?? "--")}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={7}>
                              No frozen diagnostic policies. Validation cannot perform fallback
                              search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {phaseB835Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB835Blockers.map((item, index) => (
                        <div key={`b835-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.5 temporal calibration audit report yet. Start manually after reviewing B.8.3.4." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="31"
          title="Phase B.8.3.6 - Temporal Candidate Distribution & Gate-Failure Decomposition Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB836Audit}
              disabled={phaseB836Pending || Boolean(phaseB836JobId)}
            >
              {phaseB836Pending || phaseB836JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.6
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only temporal candidate distribution and first-failing-gate decomposition. It
              verifies B.8.3.4 ledger hashes before reading event ledgers, excludes outside-range
              rows from metrics, and keeps B.8.1 plus Phase C readiness blocked.
            </p>

            {phaseB836JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.6 job {phaseB836JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB836State ?? "queued"} / {phaseB836Progress}%
                  </span>
                </div>
                <Progress value={phaseB836Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB836Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB836Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB836Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.6 Failed: {phaseB836Error}
              </div>
            )}

            {phaseB836Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {phaseB836StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">B.8.3.6 remains research-only.</div>
                  <div className="mt-1 text-amber-100/80">
                    Rebuilt-only lineage never proves historical root cause. Locked confirmation
                    remains unopened with row consumption{" "}
                    {phaseB836Result.locked_confirmation_row_consumption_count ?? 0}.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      B.8.1 Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB836Result.b81_rerun_readiness?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB836Result.b81_rerun_readiness?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Phase C Readiness
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB836Result.phase_c_readiness_decision?.status ?? "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      {phaseB836Result.phase_c_readiness_decision?.reason ?? "--"}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Mutation Proof
                    </div>
                    <div className="font-mono-num text-sm font-semibold text-foreground">
                      {phaseB836Result.mutation_proof_status ??
                        phaseB836Result.mutation_proof?.status ??
                        "--"}
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      Prior B.6 through B.8.3.5 artifacts remain protected.
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Candidate Distribution
                    </div>
                    <table className="w-full min-w-[1100px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
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
                            "Excluded",
                          ].map((label, index) => (
                            <th key={`${label}-${index}`} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB836DistributionRows.length > 0 ? (
                          phaseB836DistributionRows.map((row, index) => (
                            <tr key={`b836-dist-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.candidate_rows ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_pass_count ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.score_finite_count ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.threshold_pass_count ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.accepted_final_count ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.execution_attempted_count ?? "--")}
                              </td>
                              <td className="px-3 py-2">{String(row.opened_count ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.closed_executed_trade_count ?? "--")}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.excluded_from_metrics ?? false)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={12}>
                              No B.8.3.6 distribution rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      First-Failing-Gate Waterfall
                    </div>
                    <table className="w-full min-w-[960px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Region",
                            "Threshold",
                            "Gate",
                            "Reaching",
                            "Passing",
                            "Rejected",
                            "Reject Share",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB836WaterfallRows.length > 0 ? (
                          phaseB836WaterfallRows.map((row, index) => (
                            <tr key={`b836-waterfall-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.threshold ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.gate ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.reaching_count ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.passing_count ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.rejected_count ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.rejected_share_of_previous ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={8}>
                              No B.8.3.6 gate waterfall rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                  <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Time Bucket Histograms
                  </div>
                  <table className="w-full min-w-[840px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                        {["Setup", "Region", "Bucket Type", "Bucket", "Rows"].map((label) => (
                          <th key={label} className="px-3 py-3 text-left">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10 font-mono-num">
                      {phaseB836HistogramRows.length > 0 ? (
                        phaseB836HistogramRows.map((row, index) => (
                          <tr key={`b836-hist-${index}`} className="hover:bg-background/20">
                            <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.bucket_type ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.bucket ?? "--")}</td>
                            <td className="px-3 py-2">{String(row.candidate_rows ?? "--")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                            No B.8.3.6 histogram rows yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {phaseB836Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB836Blockers.map((item, index) => (
                        <div key={`b836-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.6 temporal distribution audit report yet. Start manually after reviewing B.8.3.5." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          numeral="31"
          title="Phase B.8.3.6.1 - Trigger-Gate Provenance & Sequential Funnel Wiring Audit"
          icon={ShieldCheck}
          right={
            <Button
              size="sm"
              onClick={startPhaseB8361Audit}
              disabled={phaseB8361Pending || Boolean(phaseB8361JobId)}
            >
              {phaseB8361Pending || phaseB8361JobId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Start B.8.3.6.1
            </Button>
          }
        >
          <div className="space-y-5">
            <p className="text-xs text-muted-foreground">
              Audit-only trigger-gate provenance and sequential funnel wiring check. It compares
              persisted trigger outputs against a direct replay from manifest-bound trigger
              provenance and keeps B.8.1 and Phase C readiness blocked.
            </p>

            {phaseB8361JobId && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-primary">
                    Phase B.8.3.6.1 job {phaseB8361JobId}
                  </span>
                  <span className="font-mono-num text-muted-foreground">
                    {phaseB8361State ?? "queued"} / {phaseB8361Progress}%
                  </span>
                </div>
                <Progress value={phaseB8361Progress} className="h-1.5" />
                <div className="mt-2 grid gap-2 font-mono-num text-[11px] text-muted-foreground md:grid-cols-2">
                  <span>{phaseB8361Stage ?? "queued"}</span>
                  <span className="md:text-right">heartbeat {phaseB8361Heartbeat ?? "--"}</span>
                </div>
              </div>
            )}

            {phaseB8361Error && (
              <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                Phase B.8.3.6.1 Failed: {phaseB8361Error}
              </div>
            )}

            {phaseB8361Result ? (
              <>
                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {phaseB8361StatusRows.map(([label, value]) => (
                    <div
                      key={String(label)}
                      className="rounded-xl border border-border/40 bg-background/25 p-3"
                    >
                      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {String(label)}
                      </div>
                      <div className="mt-2 break-words font-mono-num text-sm font-semibold text-foreground">
                        {String(value ?? "--")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs text-amber-100">
                  <div className="font-semibold">B.8.3.6.1 is diagnostic only.</div>
                  <div className="mt-1 text-amber-100/80">
                    Trigger provenance must be manifest-bound. Current code alone is not enough to
                    unlock B.8.3.6 source proof. Locked confirmation remains unopened with{" "}
                    {phaseB8361Result.locked_confirmation_row_consumption_count ?? 0} rows read.
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Trigger Rule Provenance
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB8361TriggerRows.length > 0 ? (
                        phaseB8361TriggerRows.map((row, index) => (
                          <div key={`b8361-rule-${index}`}>
                            {String(row.setup_family ?? "--")}:{" "}
                            {String(row.trigger_rule_version ?? "--")} /{" "}
                            {compactHash(row.trigger_rule_sha256)}
                          </div>
                        ))
                      ) : (
                        <div>No trigger rule provenance rows yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Replay Parity
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB8361ParityRows.length > 0 ? (
                        phaseB8361ParityRows.map((row, index) => (
                          <div key={`b8361-parity-${index}`}>
                            {String(row.setup_family ?? "--")}: persisted{" "}
                            {String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0)} /
                            replay2 {String(row.replay_1_vs_replay_2_trigger_mismatch_count ?? 0)}
                          </div>
                        ))
                      ) : (
                        <div>No replay parity rows yet.</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Readiness
                    </div>
                    <div className="space-y-2 text-muted-foreground">
                      <div>
                        <span className="font-mono-num font-semibold text-foreground">
                          {phaseB8361Result.b81_rerun_readiness?.status ?? "--"}
                        </span>{" "}
                        B.8.1
                      </div>
                      <div>{phaseB8361Result.b81_rerun_readiness?.reason ?? "--"}</div>
                      <div>
                        <span className="font-mono-num font-semibold text-foreground">
                          {phaseB8361Result.phase_c_readiness_decision?.status ?? "--"}
                        </span>{" "}
                        Phase C
                      </div>
                      <div>{phaseB8361Result.phase_c_readiness_decision?.reason ?? "--"}</div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Trigger Input Audit
                    </div>
                    <table className="w-full min-w-[880px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
                            "Setup",
                            "Config",
                            "Rows",
                            "Missing",
                            "Null",
                            "Inf",
                            "DType",
                            "Unexpected",
                            "Status",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8361InputRows.length > 0 ? (
                          phaseB8361InputRows.map((row, index) => (
                            <tr key={`b8361-input-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.source_config_id ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_row_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_missing_column_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_null_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_inf_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_dtype_mismatch_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_default_fill_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.trigger_input_integrity_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={9}>
                              No trigger input audit rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Sequential Funnel And First Fail
                    </div>
                    <table className="w-full min-w-[960px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {[
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
                            "Close",
                          ].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8361FunnelRows.length > 0 ? (
                          phaseB8361FunnelRows.map((row, index) => (
                            <tr key={`b8361-funnel-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.raw_candidate ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.trigger_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.score_finite ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.threshold_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.track_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.regime_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.session_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.spread_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.move_cost_pass ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.opened ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.closed ?? 0)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={13}>
                              No sequential funnel rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Persisted vs Recomputed Trigger Audit
                    </div>
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Persisted", "Replay 1", "Replay 2", "Mismatch", "Parity"].map(
                            (label) => (
                              <th key={label} className="px-3 py-3 text-left">
                                {label}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8361ParityRows.length > 0 ? (
                          phaseB8361ParityRows.map((row, index) => (
                            <tr
                              key={`b8361-parity-table-${index}`}
                              className="hover:bg-background/20"
                            >
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">
                                {String(row.persisted_trigger_pass_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.recomputed_trigger_pass_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.recomputed_trigger_pass_count_replay_2 ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.persisted_vs_recomputed_trigger_mismatch_count ?? 0)}
                              </td>
                              <td className="px-3 py-2">
                                {String(row.persisted_vs_recomputed_trigger_parity_status ?? "--")}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                              No trigger parity rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                    <div className="border-b border-border/25 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      First Failing Gate Waterfall
                    </div>
                    <table className="w-full min-w-[880px] text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/30 bg-background/30 text-[10px] font-semibold uppercase text-muted-foreground">
                          {["Setup", "Region", "Gate", "Reach", "Pass", "Rejected"].map((label) => (
                            <th key={label} className="px-3 py-3 text-left">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/10 font-mono-num">
                        {phaseB8361WaterfallRows.length > 0 ? (
                          phaseB8361WaterfallRows.map((row, index) => (
                            <tr key={`b8361-waterfall-${index}`} className="hover:bg-background/20">
                              <td className="px-3 py-2">{String(row.setup_family ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.region ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.gate ?? "--")}</td>
                              <td className="px-3 py-2">{String(row.reaching_count ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.passing_count ?? 0)}</td>
                              <td className="px-3 py-2">{String(row.rejected_count ?? 0)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="px-3 py-3 text-muted-foreground" colSpan={6}>
                              No first-failing-gate rows yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {phaseB8361Blockers.length > 0 && (
                  <div className="rounded-xl border border-border/40 bg-background/25 p-3 text-xs">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Blockers
                    </div>
                    <div className="space-y-1 font-mono-num text-[11px] text-muted-foreground">
                      {phaseB8361Blockers.map((item, index) => (
                        <div key={`b8361-blocker-${index}`}>
                          {typeof item === "object" ? JSON.stringify(item) : String(item)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <DataState message="No Phase B.8.3.6.1 trigger provenance report yet. Start manually after reviewing B.8.3.6." />
            )}
          </div>
        </SectionCard>

        {/* Candidate registry history section */}
        <SectionCard numeral="32" title="Candidate Model Registry" icon={Sparkles}>
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Audit and manage historical training runs stored in the candidate registry. Compare
              holdout metrics before promoting to the active champion model.
            </p>

            {modelStatus?.candidates && modelStatus.candidates.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-border/40 bg-background/25">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-background/30 text-[10px] text-muted-foreground uppercase font-semibold">
                      <th className="px-4 py-3">Run ID / Created</th>
                      <th className="px-4 py-3 text-center">Holdout Accuracy</th>
                      <th className="px-4 py-3 text-center">Trade Signals</th>
                      <th className="px-4 py-3 text-center">Win Rate</th>
                      <th className="px-4 py-3 text-center">Profit Factor</th>
                      <th className="px-4 py-3 text-center">Expectancy</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10 font-mono-num font-medium">
                    {modelStatus.candidates.map((cand) => {
                      const isChampion =
                        cand.run_id === modelStatus.champion_metadata?.run_id || cand.promoted;
                      return (
                        <tr
                          key={cand.run_id}
                          className={`hover:bg-background/20 transition ${isChampion ? "bg-gradient-gold-soft/10" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-bold text-foreground truncate max-w-[180px]">
                              {cand.run_id}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-sans mt-0.5">
                              {cand.created_at || "Unavailable"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {cand.metrics?.holdout?.accuracy
                              ? `${(cand.metrics.holdout.accuracy * 100).toFixed(2)}%`
                              : "--"}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {cand.metrics?.holdout?.trade_signals ?? "--"}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {formatNullablePercent(cand.metrics?.holdout?.backtest?.win_rate)}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground">
                            {formatNullableNumber(cand.metrics?.holdout?.backtest?.profit_factor)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={
                                (cand.metrics?.holdout?.backtest?.expectancy ?? 0) >= 0
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }
                            >
                              {formatNullableSigned(cand.metrics?.holdout?.backtest?.expectancy)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {isChampion ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-sans font-bold border border-gold/25 bg-gold/10 text-gold flex items-center gap-1 justify-center max-w-[100px] mx-auto">
                                <Crown className="size-3" /> Champion
                              </span>
                            ) : cand.eligible ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-sans border border-emerald-400/20 bg-emerald-400/5 text-emerald-400 max-w-[100px] mx-auto block text-center">
                                Eligible
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-sans border border-border bg-background/20 text-muted-foreground max-w-[100px] mx-auto block text-center">
                                Review
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg text-xs bg-background/50 border-border hover:bg-background"
                                disabled={isChampion || !capabilities.model_promotion.allowed}
                                onClick={() => setPromoteTarget(cand)}
                              >
                                <Crown className="size-3.5 mr-1" /> Promote
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 rounded-lg text-xs text-destructive hover:bg-destructive/10 border-border hover:border-destructive/30"
                                disabled={isChampion || rejectingCandidate}
                                onClick={() => void rejectCandidate(cand)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <DataState message="No candidates stored in candidate model registry." />
            )}
          </div>
        </SectionCard>
      </main>

      {/* Footer copyright */}
      <footer className="mx-auto max-w-[1480px] border-t border-border/45 px-6 py-6 mt-12 flex justify-between text-xs text-muted-foreground">
        <span>© Aurum AI · Retraining & Audit Terminal</span>
        <span>Version 1.4.0 (Model Office)</span>
      </footer>

      {/* Promote Candidate confirmation dialog */}
      <AlertDialog
        open={Boolean(promoteTarget)}
        onOpenChange={(open) => !open && setPromoteTarget(null)}
      >
        <AlertDialogContent className="glass border border-[oklch(0.84_0.08_305/0.2)] bg-[oklch(0.13_0.012_290/0.92)] text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">
              Promote candidate to Champion?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-sm">
              This replaces the active champion model with candidate model ({promoteTarget?.run_id}
              ). This action is immediate and will apply to all live predictions going forward.
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
              {promoting ? "Promoting..." : "Promote to Champion"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
