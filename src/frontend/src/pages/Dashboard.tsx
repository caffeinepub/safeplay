import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { FieldStatus, Variant_red_orange_green_yellow } from "../backend";
import {
  MOCK_COACHES,
  MOCK_CONTACTS,
  MOCK_FIELDS,
  useActivityFeed,
  usePitchCounts,
  useWeatherData,
} from "../hooks/useQueries";

const FIELD_STATUS_CONFIG: Record<
  FieldStatus,
  { label: string; color: string; dotColor: string }
> = {
  [FieldStatus.clear]: {
    label: "OPEN",
    color: "text-emerald-400",
    dotColor: "bg-emerald-400",
  },
  [FieldStatus.pre_check_pending]: {
    label: "PRE-CHECK",
    color: "text-yellow-400",
    dotColor: "bg-yellow-400",
  },
  [FieldStatus.incident_reported]: {
    label: "INCIDENT",
    color: "text-red-400",
    dotColor: "bg-red-400",
  },
  [FieldStatus.game_active]: {
    label: "GAME ACTIVE",
    color: "text-sky-400",
    dotColor: "bg-sky-400",
  },
};

const HEAT_COLORS: Record<string, string> = {
  [Variant_red_orange_green_yellow.green]: "text-emerald-400",
  [Variant_red_orange_green_yellow.yellow]: "text-yellow-400",
  [Variant_red_orange_green_yellow.orange]: "text-orange-400",
  [Variant_red_orange_green_yellow.red]: "text-red-400",
};

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

interface DashboardProps {
  onReportIncident: () => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({
  onReportIncident,
  onNavigate,
}: DashboardProps) {
  const { data: weather } = useWeatherData();
  const { data: activity, isLoading: activityLoading } = useActivityFeed();
  const { data: pitchCounts } = usePitchCounts();

  const maxPitch = pitchCounts
    ? Math.max(...pitchCounts.map((p) => Number(p.pitchCount)), 1)
    : 1;

  return (
    <div className="space-y-6">
      {/* Top row: report button + weather */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Live Liability Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Real-time safety status for all active fields
          </p>
        </div>
        <Button
          data-ocid="dashboard.report.primary_button"
          variant="destructive"
          size="lg"
          onClick={onReportIncident}
          className="font-bold uppercase tracking-wider shadow-lg"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* === LEFT COLUMN === */}
        <div className="space-y-5">
          {/* Live Field Status */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Field Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_FIELDS.map((field, i) => {
                const cfg = FIELD_STATUS_CONFIG[field.status];
                return (
                  <div
                    key={field.id}
                    data-ocid={`fields.item.${i + 1}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {field.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`}
                      />
                      <span
                        className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                data-ocid="dashboard.fields.link"
                onClick={() => onNavigate("fields")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                View all fields →
              </button>
            </CardContent>
          </Card>

          {/* Pitch Tracking Summary */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Pitch Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(pitchCounts ?? []).slice(0, 4).map((pc) => {
                const count = Number(pc.pitchCount);
                const pct = Math.round((count / maxPitch) * 100);
                const isHigh = count > 75;
                return (
                  <div key={pc.playerName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground font-medium truncate max-w-[140px]">
                        {pc.playerName}
                      </span>
                      <span
                        className={`font-bold ${isHigh ? "text-red-400" : "text-muted-foreground"}`}
                      >
                        {count} pitches
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: isHigh
                            ? "oklch(0.55 0.22 25)"
                            : "oklch(0.55 0.18 260)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <button
                type="button"
                data-ocid="dashboard.pitchcount.link"
                onClick={() => onNavigate("pitchcount")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                Log pitch counts →
              </button>
            </CardContent>
          </Card>
        </div>

        {/* === MIDDLE COLUMN === */}
        <div className="space-y-5">
          {/* Pre-Game Checklists */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Pre-Game Checklists
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MOCK_FIELDS.map((field, i) => {
                const done = field.status === FieldStatus.game_active;
                const pending = field.status === FieldStatus.pre_check_pending;
                return (
                  <div
                    key={field.id}
                    data-ocid={`checklist.item.${i + 1}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border"
                  >
                    <p className="text-sm text-foreground font-medium">
                      {field.name}
                    </p>
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                        done
                          ? "bg-emerald-900/50 text-emerald-400"
                          : pending
                            ? "bg-yellow-900/50 text-yellow-400"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {done ? "Complete" : pending ? "Required" : "Not started"}
                    </span>
                  </div>
                );
              })}
              <Button
                data-ocid="dashboard.checklist.button"
                variant="outline"
                size="sm"
                className="w-full mt-1"
                onClick={() => onNavigate("checklist")}
              >
                Start Checklist
              </Button>
            </CardContent>
          </Card>

          {/* Coach Credentials */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Coach Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MOCK_COACHES.map((coach, i) => (
                <div
                  key={coach.id}
                  data-ocid={`credentials.item.${i + 1}`}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {coach.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {coach.team}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {coach.badgeGreen ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span
                      className={`text-xs font-bold uppercase ${
                        coach.badgeGreen ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {coach.badgeGreen ? "Valid" : "Expired"}
                    </span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                data-ocid="dashboard.credentials.link"
                onClick={() => onNavigate("credentials")}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                Manage credentials →
              </button>
            </CardContent>
          </Card>

          {/* WBGT Summary */}
          {weather && (
            <Card className="shadow-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  Environmental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p
                      className={`text-3xl font-display font-bold ${HEAT_COLORS[weather.heatCode]}`}
                    >
                      {weather.wbgt}°
                    </p>
                    <p className="text-xs text-muted-foreground">WBGT Index</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`uppercase font-bold ${
                        weather.heatCode === Variant_red_orange_green_yellow.red
                          ? "bg-red-900/60 text-red-400 border-red-700"
                          : weather.heatCode ===
                              Variant_red_orange_green_yellow.orange
                            ? "bg-orange-900/60 text-orange-400 border-orange-700"
                            : weather.heatCode ===
                                Variant_red_orange_green_yellow.yellow
                              ? "bg-yellow-900/60 text-yellow-400 border-yellow-700"
                              : "bg-emerald-900/60 text-emerald-400 border-emerald-700"
                      }`}
                      variant="outline"
                    >
                      Code {weather.heatCode.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {weather.humidity}% humidity
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-ocid="dashboard.environment.link"
                  onClick={() => onNavigate("environment")}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Full environmental monitor →
                </button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-5">
          {/* Recent Activity */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {activityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3" data-ocid="activity.list">
                    {(activity ?? []).map((entry, i) => (
                      <div
                        key={entry.id}
                        data-ocid={`activity.item.${i + 1}`}
                        className="flex gap-3 pb-3 border-b border-border/50 last:border-0"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            {entry.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatRelativeTime(entry.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Safety Contacts */}
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                Safety Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {MOCK_CONTACTS.map((c, i) => (
                <div
                  key={c.name}
                  data-ocid={`contacts.item.${i + 1}`}
                  className="p-2.5 rounded-lg bg-secondary/40 border border-border"
                >
                  <p className="text-sm font-medium text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{c.role}</p>
                  <a
                    href={`tel:${c.phone}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {c.phone}
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
