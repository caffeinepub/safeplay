import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLogPitchCount, usePitchCounts } from "../hooks/useQueries";

const PITCH_LIMIT = 85;
const PITCH_WARNING = 75;

export default function PitchCountPage() {
  const { data: pitchCounts } = usePitchCounts();
  const logPitchCount = useLogPitchCount();

  const [playerName, setPlayerName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [gameId, setGameId] = useState("");
  const [pitchCount, setPitchCount] = useState("");

  const isValid =
    playerName.trim() &&
    teamName.trim() &&
    gameId.trim() &&
    Number(pitchCount) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    await logPitchCount.mutateAsync({
      playerName: playerName.trim(),
      teamName: teamName.trim(),
      gameId: gameId.trim(),
      pitchCount: BigInt(Number(pitchCount)),
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
    });
    toast.success(`Logged ${pitchCount} pitches for ${playerName}`);
    setPlayerName("");
    setPitchCount("");
  };

  const maxPitch = pitchCounts
    ? Math.max(...pitchCounts.map((p) => Number(p.pitchCount)), 1)
    : 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Pitch Count Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Limit:{" "}
          <span className="text-red-400 font-bold">{PITCH_LIMIT} pitches</span>{" "}
          per player per game. Warning at {PITCH_WARNING}.
        </p>
      </div>

      {/* Log form */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground">
            Log Pitch Count
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="playerName">Player Name</Label>
            <Input
              data-ocid="pitchcount.player.input"
              id="playerName"
              placeholder="e.g. Jake Thibodaux"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="teamName">Team</Label>
            <Input
              data-ocid="pitchcount.team.input"
              id="teamName"
              placeholder="e.g. Varsity"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gameId">Game ID</Label>
            <Input
              data-ocid="pitchcount.gameid.input"
              id="gameId"
              placeholder="e.g. game-001"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pitchCount">Pitch Count</Label>
            <Input
              data-ocid="pitchcount.count.input"
              id="pitchCount"
              type="number"
              min="1"
              max="150"
              placeholder="e.g. 45"
              value={pitchCount}
              onChange={(e) => setPitchCount(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Button
              data-ocid="pitchcount.submit.button"
              className="w-full font-bold uppercase tracking-wider"
              disabled={!isValid || logPitchCount.isPending}
              onClick={handleSubmit}
            >
              {logPitchCount.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging…
                </>
              ) : (
                "Log Pitch Count"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bar chart */}
      <Card className="shadow-card border-border">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Current Game Pitch Counts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" data-ocid="pitchcount.list">
            {(pitchCounts ?? []).map((pc, i) => {
              const count = Number(pc.pitchCount);
              const pct = Math.round(
                (count / Math.max(maxPitch, PITCH_LIMIT)) * 100,
              );
              const isLimit = count >= PITCH_LIMIT;
              const isWarning = count >= PITCH_WARNING && !isLimit;
              return (
                <div
                  key={pc.playerName}
                  data-ocid={`pitchcount.item.${i + 1}`}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-semibold text-foreground">
                        {pc.playerName}
                      </span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {pc.teamName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold tabular-nums ${
                          isLimit
                            ? "text-red-400"
                            : isWarning
                              ? "text-orange-400"
                              : "text-foreground"
                        }`}
                      >
                        {count}
                      </span>
                      {isLimit && (
                        <span className="text-xs font-bold text-red-400 uppercase">
                          LIMIT
                        </span>
                      )}
                      {isWarning && (
                        <span className="text-xs font-bold text-orange-400 uppercase">
                          Warning
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: isLimit
                          ? "oklch(0.55 0.22 25)"
                          : isWarning
                            ? "oklch(0.67 0.18 50)"
                            : "oklch(0.55 0.18 260)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "oklch(0.55 0.18 260)" }}
              />
              Normal
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "oklch(0.67 0.18 50)" }}
              />
              Warning ({PITCH_WARNING}+)
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: "oklch(0.55 0.22 25)" }}
              />
              At Limit ({PITCH_LIMIT}+)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
