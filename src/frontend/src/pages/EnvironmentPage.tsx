import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CloudLightning,
  Loader2,
  RefreshCw,
  Thermometer,
  Wind,
} from "lucide-react";
import { Variant_red_orange_green_yellow } from "../backend";
import { useFetchWeather, useWeatherData } from "../hooks/useQueries";

const WBGT_ZONES = [
  {
    min: 0,
    max: 82,
    code: Variant_red_orange_green_yellow.green,
    label: "Green",
    desc: "Normal operations. No restrictions.",
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
  },
  {
    min: 82,
    max: 87,
    code: Variant_red_orange_green_yellow.yellow,
    label: "Yellow",
    desc: "Mandatory water breaks every 30 minutes.",
    color: "bg-yellow-500",
    textColor: "text-yellow-400",
  },
  {
    min: 87,
    max: 92,
    code: Variant_red_orange_green_yellow.orange,
    label: "Orange",
    desc: "Mandatory water breaks every 15 minutes.",
    color: "bg-orange-500",
    textColor: "text-orange-400",
  },
  {
    min: 92,
    max: 999,
    code: Variant_red_orange_green_yellow.red,
    label: "Red",
    desc: "Suspend play immediately. Seek shade and water.",
    color: "bg-red-500",
    textColor: "text-red-400",
  },
];

export default function EnvironmentPage() {
  const { data: weather, isLoading } = useWeatherData();
  const fetchWeather = useFetchWeather();

  const activeZone = weather
    ? (WBGT_ZONES.find((z) => weather.wbgt >= z.min && weather.wbgt < z.max) ??
      WBGT_ZONES[0])
    : null;

  const formattedTime = weather
    ? new Date(
        Number(weather.timestamp / BigInt(1_000_000)),
      ).toLocaleTimeString()
    : "—";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Environmental Monitor
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Westlake, LA · Auto-refreshes every 5 minutes
          </p>
        </div>
        <Button
          data-ocid="environment.refresh.button"
          variant="outline"
          size="sm"
          onClick={() => fetchWeather.mutate()}
          disabled={fetchWeather.isPending || isLoading}
        >
          {fetchWeather.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Main WBGT gauge */}
      {weather && activeZone && (
        <Card
          className={`shadow-card border ${
            activeZone.code === Variant_red_orange_green_yellow.red
              ? "border-red-700/40 bg-red-900/10"
              : activeZone.code === Variant_red_orange_green_yellow.orange
                ? "border-orange-700/40 bg-orange-900/10"
                : activeZone.code === Variant_red_orange_green_yellow.yellow
                  ? "border-yellow-700/40 bg-yellow-900/10"
                  : "border-emerald-700/40 bg-emerald-900/10"
          }`}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  WBGT Index
                </p>
                <p
                  className={`text-6xl font-display font-bold mt-1 ${activeZone.textColor}`}
                >
                  {weather.wbgt}°F
                </p>
                <p
                  className={`text-lg font-bold uppercase tracking-wider mt-1 ${activeZone.textColor}`}
                >
                  Code {activeZone.label}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeZone.desc}
                </p>
              </div>
              <div className="text-right space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Air Temp</p>
                  <p className="text-2xl font-bold text-foreground">
                    {weather.temperature}°F
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="text-2xl font-bold text-foreground">
                    {weather.humidity}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formattedTime}
                </p>
              </div>
            </div>

            {/* WBGT scale bar */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                WBGT Scale
              </p>
              <div className="flex h-4 rounded-full overflow-hidden">
                {WBGT_ZONES.map((z) => (
                  <div
                    key={z.code}
                    className={`flex-1 ${z.color} ${
                      activeZone.code === z.code
                        ? "ring-2 ring-white/50"
                        : "opacity-40"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>↑ 82°F</span>
                <span>↑ 87°F</span>
                <span>↑ 92°F+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lightning alert */}
      <Card
        className={`shadow-card ${
          weather?.lightningAlert
            ? "border-yellow-600/50 bg-yellow-900/15"
            : "border-border"
        }`}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center gap-2 text-sm uppercase tracking-widest"
            style={{
              color: weather?.lightningAlert
                ? "oklch(0.85 0.18 88)"
                : undefined,
            }}
          >
            <CloudLightning
              className={`w-4 h-4 ${
                weather?.lightningAlert
                  ? "text-yellow-400 animate-pulse"
                  : "text-muted-foreground"
              }`}
            />
            Lightning Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weather?.lightningAlert ? (
            <div className="space-y-2">
              <p className="text-yellow-300 font-bold text-lg">
                ⚡ LIGHTNING DETECTED WITHIN 8 MILES
              </p>
              <p className="text-sm text-muted-foreground">
                Clear all fields immediately. Players and staff must seek
                shelter indoors. Do not resume play for 30 minutes after the
                last strike.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No lightning detected within 8 miles. Monitor conditions
              continuously.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Zone reference */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Thermometer className="w-3.5 h-3.5" />
            WBGT Zone Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WBGT_ZONES.map((z) => (
              <div
                key={z.code}
                className={`p-3 rounded-lg border ${
                  activeZone?.code === z.code
                    ? "border-current/50 bg-current/5"
                    : "border-border bg-secondary/30"
                }`}
                style={
                  activeZone?.code === z.code
                    ? { borderColor: "currentcolor" }
                    : {}
                }
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${z.color}`} />
                  <span
                    className={`text-sm font-bold uppercase ${z.textColor}`}
                  >
                    {z.label} ({z.min}–{z.max === 999 ? "∞" : z.max}°F)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{z.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
