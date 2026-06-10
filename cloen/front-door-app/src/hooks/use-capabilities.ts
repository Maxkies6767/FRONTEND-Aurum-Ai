/**
 * useCapabilities — polls /api/v1/capabilities and returns a stable
 * capabilities object the UI uses to enable/disable controls.
 *
 * This is the ONLY place that should drive button enable/disable logic.
 * Do NOT hardcode permission checks elsewhere in the UI.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { API_V1_BASE } from "../lib/api-config";

export interface Capability {
  allowed: boolean;
  reason: string | null;
}

export interface Capabilities {
  clear_view: Capability;
  pause: Capability;
  resume: Capability;
  save_settings: Capability;
  close_position: Capability;
  close_all: Capability;
  delete_stored_history: Capability;
  model_training: Capability;
  model_promotion: Capability;
  reset_canary_session: Capability;
}

export interface CapabilitiesData {
  control_mode: string;
  account_mode: string;
  backend_online: boolean;
  engine_online: boolean;
  engine_heartbeat_healthy: boolean;
  engine_instance_id: string | null;
  mt5_online: boolean;
  live_trading_enabled: boolean;
  automation_enabled: boolean;
  demo_order_execution_allowed: boolean;
  order_execution_allowed: boolean;
  order_execution_block_reason: string | null;
  demo_canary_mode: boolean;
  demo_canary_max_new_orders: number;
  demo_canary_orders_used: number;
  demo_canary_orders_remaining: number;
  demo_canary_max_open_positions: number;
  demo_canary_auto_pause_after_first_order: boolean;
  demo_canary_require_sl: boolean;
  demo_canary_require_tp: boolean;
  demo_canary_use_broker_min_lot: boolean;
  capabilities: Capabilities;
}

/** Safe default: everything blocked until the backend confirms it is allowed. */
const CAPABILITIES_BLOCKED: Capabilities = {
  clear_view: { allowed: true, reason: null },
  pause: { allowed: false, reason: "Loading capabilities…" },
  resume: { allowed: false, reason: "Loading capabilities…" },
  save_settings: { allowed: false, reason: "Loading capabilities…" },
  close_position: { allowed: false, reason: "Loading capabilities…" },
  close_all: { allowed: false, reason: "Loading capabilities…" },
  delete_stored_history: { allowed: false, reason: "Loading capabilities…" },
  model_training: { allowed: false, reason: "Loading capabilities…" },
  model_promotion: { allowed: false, reason: "Loading capabilities…" },
  reset_canary_session: { allowed: false, reason: "Loading capabilities…" },
};

export function useCapabilities(autoRefresh: boolean, refreshIntervalSeconds: number) {
  const [capData, setCapData] = useState<CapabilitiesData | null>(null);
  const [capError, setCapError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const fetchCapabilities = useCallback(async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    try {
      const res = await fetch(`${API_V1_BASE}/capabilities`);
      if (!res.ok) throw new Error(`/capabilities returned ${res.status}`);
      const data = (await res.json()) as CapabilitiesData;
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
    if (!autoRefresh) return undefined;
    const id = window.setInterval(() => {
      void fetchCapabilities();
    }, refreshIntervalSeconds * 1000);
    return () => window.clearInterval(id);
  }, [autoRefresh, fetchCapabilities, refreshIntervalSeconds]);

  const capabilities: Capabilities = capData?.capabilities ?? CAPABILITIES_BLOCKED;

  return { capData, capError, capabilities, refreshCapabilities: fetchCapabilities };
}
