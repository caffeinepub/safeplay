import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Camera, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  ExternalBlob,
  Variant_low_high_critical_medium,
  Variant_near_miss_injury_hazard,
} from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateIncident } from "../hooks/useQueries";

interface IncidentModalProps {
  open: boolean;
  onClose: () => void;
}

export default function IncidentModal({ open, onClose }: IncidentModalProps) {
  const { identity } = useInternetIdentity();
  const createIncident = useCreateIncident();
  const fileRef = useRef<HTMLInputElement>(null);

  const [incidentType, setIncidentType] = useState<string>("");
  const [severity, setSeverity] = useState<string>("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isValid =
    incidentType && severity && description.trim() && location.trim();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    let photoBlobId: ExternalBlob | undefined;
    if (photoFile) {
      const bytes = new Uint8Array(await photoFile.arrayBuffer());
      photoBlobId = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
        setUploadProgress(pct),
      );
    }

    const principal =
      identity?.getPrincipal() ??
      ({
        isAnonymous: () => true,
        toString: () => "2vxsx-fae",
        toText: () => "2vxsx-fae",
        compareTo: () => 0,
      } as any);

    await createIncident.mutateAsync({
      id: `inc-${Date.now()}`,
      resolved: false,
      description,
      reporterId: principal,
      timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      severity: severity as Variant_low_high_critical_medium,
      photoBlobId,
      location,
      incidentType: incidentType as Variant_near_miss_injury_hazard,
    });

    toast.success("Incident reported and safety coordinator notified.");
    setIncidentType("");
    setSeverity("");
    setDescription("");
    setLocation("");
    setPhotoFile(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" data-ocid="incident.modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Report Incident
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="incidentType">Incident Type</Label>
              <Select value={incidentType} onValueChange={setIncidentType}>
                <SelectTrigger
                  data-ocid="incident.type.select"
                  id="incidentType"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Variant_near_miss_injury_hazard.injury}>
                    Injury
                  </SelectItem>
                  <SelectItem value={Variant_near_miss_injury_hazard.hazard}>
                    Hazard
                  </SelectItem>
                  <SelectItem value={Variant_near_miss_injury_hazard.near_miss}>
                    Near Miss
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger
                  data-ocid="incident.severity.select"
                  id="severity"
                >
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Variant_low_high_critical_medium.low}>
                    Low
                  </SelectItem>
                  <SelectItem value={Variant_low_high_critical_medium.medium}>
                    Medium
                  </SelectItem>
                  <SelectItem value={Variant_low_high_critical_medium.high}>
                    High
                  </SelectItem>
                  <SelectItem value={Variant_low_high_critical_medium.critical}>
                    Critical
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location">Location</Label>
            <Input
              data-ocid="incident.location.input"
              id="location"
              placeholder="e.g. Field 2 – JV, third base line"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              data-ocid="incident.description.textarea"
              id="description"
              placeholder="Describe what happened, any injuries, and immediate actions taken..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Photo upload */}
          <div className="space-y-1.5">
            <Label>Photo Evidence</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              data-ocid="incident.upload.button"
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-md border border-dashed border-border text-muted-foreground hover:border-ring hover:text-foreground transition-colors text-sm"
            >
              {photoFile ? (
                <>
                  <Camera className="w-4 h-4" />
                  {photoFile.name}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Tap to upload photo
                </>
              )}
            </button>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              data-ocid="incident.cancel.button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              data-ocid="incident.submit.button"
              variant="destructive"
              className="flex-1"
              disabled={!isValid || createIncident.isPending}
              onClick={handleSubmit}
            >
              {createIncident.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
