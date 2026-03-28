import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, Circle, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { MOCK_FIELDS } from "../hooks/useQueries";
import { useSubmitChecklist } from "../hooks/useQueries";

const CHECKLIST_ITEMS = [
  {
    key: "gopherHolesChecked",
    label: "Gopher Holes Checked",
    desc: "Inspect the entire field surface for ground disturbances",
  },
  {
    key: "fenceCappingIntact",
    label: "Fence Capping Intact",
    desc: "Verify all fence caps are in place and secure",
  },
  {
    key: "aedLocated",
    label: "AED Located & Accessible",
    desc: "Confirm AED device is visible, charged, and accessible",
  },
  {
    key: "basesSecured",
    label: "Bases Secured",
    desc: "All bases properly anchored; no sharp edges",
  },
  {
    key: "dugoutClear",
    label: "Dugout Clear",
    desc: "Dugout free of tripping hazards and equipment is stored",
  },
  {
    key: "firstAidKitPresent",
    label: "First Aid Kit Present",
    desc: "First aid kit is on site and fully stocked",
  },
  {
    key: "pitchingMoundSafe",
    label: "Pitching Mound Safe",
    desc: "Mound surface is even; no holes or soft spots",
  },
  {
    key: "weatherAssessed",
    label: "Weather Assessed",
    desc: "Current weather conditions reviewed; WBGT checked",
  },
] as const;

export default function ChecklistPage() {
  const { identity } = useInternetIdentity();
  const submitChecklist = useSubmitChecklist();
  const [selectedField, setSelectedField] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const completedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const allDone = completedCount === totalCount;
  const progress = Math.round((completedCount / totalCount) * 100);

  const toggle = (key: string) => {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    if (!selectedField || !allDone) return;
    const principal =
      identity?.getPrincipal() ??
      ({
        isAnonymous: () => true,
        toString: () => "2vxsx-fae",
        toText: () => "2vxsx-fae",
        compareTo: () => 0,
      } as any);
    await submitChecklist.mutateAsync({
      fieldId: selectedField,
      gameId: `game-${Date.now()}`,
      coachId: principal,
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      completed: true,
      gopherHolesChecked: !!checked.gopherHolesChecked,
      fenceCappingIntact: !!checked.fenceCappingIntact,
      aedLocated: !!checked.aedLocated,
      basesSecured: !!checked.basesSecured,
      dugoutClear: !!checked.dugoutClear,
      firstAidKitPresent: !!checked.firstAidKitPresent,
      pitchingMoundSafe: !!checked.pitchingMoundSafe,
      weatherAssessed: !!checked.weatherAssessed,
    });
    toast.success("Safety checklist submitted! Game clock unlocked.");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto pt-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-900/50 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Checklist Complete!
        </h2>
        <p className="text-muted-foreground">
          Pre-game safety checklist submitted. The game clock is now unlocked.
        </p>
        <Button
          data-ocid="checklist.restart.button"
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setChecked({});
            setSelectedField("");
          }}
        >
          Start New Checklist
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pre-Game Safety Checklist
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          All 8 items must be verified before the game clock can start
        </p>
      </div>

      {/* Field selector */}
      <Card className="shadow-card border-border">
        <CardContent className="pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="fieldSelect">Select Field</Label>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger
                data-ocid="checklist.field.select"
                id="fieldSelect"
                className="w-full"
              >
                <SelectValue placeholder="Choose a field…" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_FIELDS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">
              Progress
            </CardTitle>
            <span className="text-sm font-bold text-foreground">
              {completedCount} of {totalCount} items
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Checklist items */}
      <Card className="shadow-card border-border">
        <CardContent className="pt-4 space-y-1">
          {CHECKLIST_ITEMS.map((item, i) => {
            const isChecked = !!checked[item.key];
            return (
              <button
                type="button"
                key={item.key}
                data-ocid={`checklist.item.${i + 1}`}
                onClick={() => toggle(item.key)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                  isChecked
                    ? "bg-emerald-900/20 border border-emerald-700/30"
                    : "hover:bg-secondary/50 border border-transparent"
                }`}
              >
                {isChecked ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                )}
                <div>
                  <p
                    className={`text-sm font-semibold ${isChecked ? "text-emerald-400" : "text-foreground"}`}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        data-ocid="checklist.submit.button"
        size="lg"
        className="w-full font-bold uppercase tracking-wider"
        disabled={!allDone || !selectedField || submitChecklist.isPending}
        onClick={handleSubmit}
      >
        {allDone && selectedField ? (
          <>
            <Unlock className="w-4 h-4 mr-2" />
            Submit & Unlock Game Clock
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 mr-2" />
            {completedCount}/{totalCount} Items Complete
          </>
        )}
      </Button>
    </div>
  );
}
