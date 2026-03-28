import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { MOCK_COACHES } from "../hooks/useQueries";

export default function CredentialsPage() {
  const expired = MOCK_COACHES.filter((c) => !c.badgeGreen);
  const valid = MOCK_COACHES.filter((c) => c.badgeGreen);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Coach Credentials
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gatekeeper Mode – Verify all coaches before play
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-emerald-400">
              {valid.length}
            </p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-red-400">
              {expired.length}
            </p>
            <p className="text-xs text-muted-foreground">Expired</p>
          </div>
        </div>
      </div>

      {expired.length > 0 && (
        <Card className="border-red-700/40 bg-red-900/10 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-400 uppercase tracking-widest flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Action Required – {expired.length} Coach
              {expired.length > 1 ? "es" : ""} Unqualified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The following coaches have expired credentials. They must not be
              in the dugout until resolved.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card border-border">
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coach</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Background Check</TableHead>
                <TableHead>Diamond Leader</TableHead>
                <TableHead>Badge</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-ocid="credentials.table">
              {MOCK_COACHES.map((coach, i) => (
                <TableRow
                  key={coach.id}
                  data-ocid={`credentials.item.${i + 1}`}
                >
                  <TableCell className="font-medium text-foreground">
                    {coach.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coach.team}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        new Date(coach.bgCheckExpiry) > new Date()
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {coach.bgCheckExpiry}
                    </span>
                  </TableCell>
                  <TableCell>
                    {coach.diamondLeader ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`uppercase text-xs font-bold flex items-center gap-1 w-fit ${
                        coach.badgeGreen
                          ? "text-emerald-400 border-emerald-700/50 bg-emerald-900/20"
                          : "text-red-400 border-red-700/50 bg-red-900/20"
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {coach.badgeGreen ? "Verified" : "Expired"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
