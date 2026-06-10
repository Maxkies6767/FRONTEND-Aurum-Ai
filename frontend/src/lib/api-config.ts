const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, "");
export const API_V1_BASE = `${API_BASE_URL}/api/v1`;
