import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, Play } from "lucide-react";
import { FieldStatus } from "../backend";
import { MOCK_FIELDS } from "../hooks/useQueries";

const STATUS_CONFIG: Record<
  FieldStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  [FieldStatus.clear]: {
    label: "Open – Clear",
    color: "text-emerald-400",
    bg: "bg-emerald-900/30 border-emerald-700/40",
    icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  },
  [FieldStatus.pre_check_pending]: {
    label: "Pre-Check Required",
    color: "text-yellow-400",
    bg: "bg-yellow-900/30 border-yellow-700/40",
    icon: <Clock className="w-5 h-5 text-yellow-400" />,
  },
  [FieldStatus.incident_reported]: {
    label: "Incident Reported",
    color: "text-red-400",
    bg: "bg-red-900/30 border-red-700/40",
    icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
  },
  [FieldStatus.game_active]: {
    label: "Game Active",
    color: "text-sky-400",
    bg: "bg-sky-900/30 border-sky-700/40",
    icon: <Play className="w-5 h-5 text-sky-400" />,
  },
};

const FIELD_DETAILS = [
  {
    id: "field-1",
    team1: "Gators",
    team2: "Hornets",
    inning: 4,
    coach: "Marcus Johnson",
  },
  {
    id: "field-2",
    team1: "Eagles",
    team2: "Tigers",
    inning: 0,
    coach: "Diana Reyes",
  },
  {
    id: "field-3",
    team1: "Cubs",
    team2: "",
    inning: 0,
    coach: "Kevin Broussard",
  },
];

export default function FieldStatusPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Field Status
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Live status of all active fields
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {MOCK_FIELDS.map((field, i) => {
          const cfg = STATUS_CONFIG[field.status];
          const detail = FIELD_DETAILS[i];
          return (
            <Card
              key={field.id}
              data-ocid={`fields.item.${i + 1}`}
              className={`shadow-card border ${cfg.bg}`}
            >
              <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">
                  {field.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {cfg.icon}
                  <span className={`text-sm font-bold uppercase ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {field.status === FieldStatus.game_active && (
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Matchup:{" "}
                      <span className="text-foreground font-medium">
                        {detail.team1} vs {detail.team2}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Inning:{" "}
                      <span className="text-foreground font-medium">
                        {detail.inning}
                      </span>
                    </p>
                  </div>
                )}
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Head Coach:{" "}
                    <span className="text-foreground font-medium">
                      {detail.coach}
                    </span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`uppercase text-xs font-bold ${cfg.color}`}
                >
                  {cfg.label}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
