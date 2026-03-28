import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Variant_low_high_critical_medium,
  Variant_near_miss_injury_hazard,
} from "../backend";
import { useActiveIncidents, useResolveIncident } from "../hooks/useQueries";

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  [Variant_low_high_critical_medium.low]: {
    label: "LOW",
    color: "text-emerald-400 bg-emerald-900/40 border-emerald-700/40",
  },
  [Variant_low_high_critical_medium.medium]: {
    label: "MEDIUM",
    color: "text-yellow-400 bg-yellow-900/40 border-yellow-700/40",
  },
  [Variant_low_high_critical_medium.high]: {
    label: "HIGH",
    color: "text-orange-400 bg-orange-900/40 border-orange-700/40",
  },
  [Variant_low_high_critical_medium.critical]: {
    label: "CRITICAL",
    color: "text-red-400 bg-red-900/40 border-red-700/40",
  },
};

const TYPE_LABELS: Record<string, string> = {
  [Variant_near_miss_injury_hazard.injury]: "Injury",
  [Variant_near_miss_injury_hazard.hazard]: "Hazard",
  [Variant_near_miss_injury_hazard.near_miss]: "Near Miss",
};

function formatTimestamp(ts: bigint) {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString();
}

export default function IncidentsPage({ onReport }: { onReport: () => void }) {
  const { data: incidents, isLoading } = useActiveIncidents();
  const resolveIncident = useResolveIncident();

  const handleResolve = async (id: string) => {
    await resolveIncident.mutateAsync(id);
    toast.success("Incident marked as resolved.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Incident Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Active and unresolved safety incidents
          </p>
        </div>
        <Button
          data-ocid="incidents.report.primary_button"
          variant="destructive"
          onClick={onReport}
          className="font-bold uppercase tracking-wider"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="incidents.loading_state">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !incidents || incidents.length === 0 ? (
        <Card
          data-ocid="incidents.empty_state"
          className="shadow-card border-border"
        >
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-foreground font-semibold">No Active Incidents</p>
            <p className="text-muted-foreground text-sm mt-1">
              All fields are clear. Tap the red button if something happens.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4" data-ocid="incidents.list">
          {incidents.map((inc, i) => {
            const sevCfg =
              SEVERITY_CONFIG[inc.severity] ??
              SEVERITY_CONFIG[Variant_low_high_critical_medium.medium];
            return (
              <Card
                key={inc.id}
                data-ocid={`incidents.item.${i + 1}`}
                className="shadow-card border-border"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                      <CardTitle className="text-base">
                        {TYPE_LABELS[inc.incidentType] ?? inc.incidentType}
                      </CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold uppercase shrink-0 ${sevCfg.color}`}
                    >
                      {sevCfg.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-foreground">{inc.description}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span>📍 {inc.location}</span>
                    <span>🕒 {formatTimestamp(inc.timestamp)}</span>
                  </div>
                  {inc.photoBlobId && (
                    <img
                      src={inc.photoBlobId.getDirectURL()}
                      alt="Evidence"
                      className="rounded-lg max-h-40 object-cover"
                    />
                  )}
                  <Button
                    data-ocid={`incidents.resolve.button.${i + 1}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(inc.id)}
                    disabled={resolveIncident.isPending}
                  >
                    {resolveIncident.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1.5 text-emerald-400" />
                    )}
                    Mark Resolved
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
