import { AlertTriangle, CloudLightning, Thermometer, X } from "lucide-react";
import { useState } from "react";
import type { WeatherData } from "../backend";
import { Variant_red_orange_green_yellow } from "../backend";

interface AlertBannerProps {
  weather: WeatherData | undefined;
}

const HEAT_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; show: boolean }
> = {
  [Variant_red_orange_green_yellow.green]: {
    label: "WBGT Green – Normal operations",
    color: "text-emerald-400",
    bg: "bg-emerald-950/60",
    show: false,
  },
  [Variant_red_orange_green_yellow.yellow]: {
    label: "WBGT Yellow – Mandatory water breaks every 30 min",
    color: "text-yellow-400",
    bg: "bg-yellow-950/60",
    show: true,
  },
  [Variant_red_orange_green_yellow.orange]: {
    label: "WBGT Orange – Mandatory water breaks every 15 min",
    color: "text-orange-400",
    bg: "bg-orange-950/60",
    show: true,
  },
  [Variant_red_orange_green_yellow.red]: {
    label: "WBGT Code RED – Suspend play immediately",
    color: "text-red-400",
    bg: "bg-red-950/70",
    show: true,
  },
};

export default function AlertBanner({ weather }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !weather) return null;

  const heatCfg =
    HEAT_CONFIG[weather.heatCode] ??
    HEAT_CONFIG[Variant_red_orange_green_yellow.green];
  const showHeat = heatCfg.show;
  const showLightning = weather.lightningAlert;

  if (!showHeat && !showLightning) return null;

  return (
    <div
      data-ocid="alert.banner"
      className="w-full px-6 py-2 flex items-center gap-4 text-sm font-medium"
      style={{
        background: "oklch(0.08 0.02 25 / 0.95)",
        borderBottom: "1px solid oklch(0.35 0.18 25 / 0.4)",
      }}
    >
      <div className="flex items-center gap-6 flex-1 flex-wrap">
        {showHeat && (
          <div className={`flex items-center gap-2 ${heatCfg.color}`}>
            <Thermometer className="w-4 h-4 shrink-0" />
            <span>
              <strong>{weather.wbgt}°F</strong> — {heatCfg.label}
            </span>
          </div>
        )}
        {showLightning && (
          <div className="flex items-center gap-2 text-yellow-300">
            <CloudLightning className="w-4 h-4 shrink-0 animate-pulse" />
            <span>
              <strong>LIGHTNING ALERT</strong> — Clear all fields immediately.
              Strike detected within 8 miles.
            </span>
          </div>
        )}
      </div>
      <button
        type="button"
        data-ocid="alert.close.button"
        onClick={() => setDismissed(true)}
        className="ml-auto text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label="Dismiss alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
