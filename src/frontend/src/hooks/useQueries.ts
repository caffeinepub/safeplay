import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FieldStatus,
  type IncidentReport,
  type PitchCount,
  type SafetyChecklist,
  Variant_red_orange_green_yellow,
  type WeatherData,
} from "../backend";
import { useActor } from "./useActor";

// ---------- Mock data ----------

export interface MockField {
  id: string;
  name: string;
  status: FieldStatus;
}

export const MOCK_FIELDS: MockField[] = [
  { id: "field-1", name: "Field 1 – Varsity", status: FieldStatus.game_active },
  {
    id: "field-2",
    name: "Field 2 – JV",
    status: FieldStatus.pre_check_pending,
  },
  { id: "field-3", name: "Field 3 – T-Ball", status: FieldStatus.clear },
];

export interface MockCoach {
  id: string;
  name: string;
  team: string;
  badgeGreen: boolean;
  bgCheckExpiry: string;
  diamondLeader: boolean;
}

export const MOCK_COACHES: MockCoach[] = [
  {
    id: "c1",
    name: "Marcus Johnson",
    team: "Varsity",
    badgeGreen: true,
    bgCheckExpiry: "2026-08-15",
    diamondLeader: true,
  },
  {
    id: "c2",
    name: "Diana Reyes",
    team: "JV",
    badgeGreen: true,
    bgCheckExpiry: "2026-05-22",
    diamondLeader: true,
  },
  {
    id: "c3",
    name: "Kevin Broussard",
    team: "T-Ball",
    badgeGreen: false,
    bgCheckExpiry: "2025-11-30",
    diamondLeader: false,
  },
  {
    id: "c4",
    name: "Tiffany Mouton",
    team: "Varsity",
    badgeGreen: false,
    bgCheckExpiry: "2025-09-01",
    diamondLeader: true,
  },
];

export const MOCK_ACTIVITY = [
  {
    id: "a1",
    timestamp: Date.now() - 5 * 60000,
    description: "Pre-game checklist submitted for Field 1 – Varsity",
    agent: "Marcus Johnson",
  },
  {
    id: "a2",
    timestamp: Date.now() - 18 * 60000,
    description: "Game started: Gators vs. Hornets on Field 1",
    agent: "System",
  },
  {
    id: "a3",
    timestamp: Date.now() - 32 * 60000,
    description: "Incident reported: minor abrasion at Field 2",
    agent: "Diana Reyes",
  },
  {
    id: "a4",
    timestamp: Date.now() - 61 * 60000,
    description: "WBGT updated to Code Orange (89°F)",
    agent: "System",
  },
  {
    id: "a5",
    timestamp: Date.now() - 95 * 60000,
    description: "Pitch count logged: Jake Thibodaux – 32 pitches",
    agent: "Marcus Johnson",
  },
];

export const MOCK_WEATHER: WeatherData = {
  temperature: 94,
  wbgt: 89,
  heatCode: Variant_red_orange_green_yellow.orange,
  lightningAlert: false,
  humidity: 72,
  timestamp: BigInt(Date.now()) * BigInt(1_000_000),
};

export const MOCK_PITCH_COUNTS: PitchCount[] = [
  {
    playerName: "Jake Thibodaux",
    teamName: "Varsity",
    gameId: "game-001",
    pitchCount: BigInt(62),
    timestamp: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
  },
  {
    playerName: "Tyler Fontenot",
    teamName: "Varsity",
    gameId: "game-001",
    pitchCount: BigInt(38),
    timestamp: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
  },
  {
    playerName: "Caleb Doucet",
    teamName: "JV",
    gameId: "game-002",
    pitchCount: BigInt(51),
    timestamp: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
  },
  {
    playerName: "Mason Hebert",
    teamName: "JV",
    gameId: "game-002",
    pitchCount: BigInt(29),
    timestamp: BigInt(Date.now() - 7200000) * BigInt(1_000_000),
  },
  {
    playerName: "Eli Broussard",
    teamName: "Varsity",
    gameId: "game-001",
    pitchCount: BigInt(44),
    timestamp: BigInt(Date.now() - 3600000) * BigInt(1_000_000),
  },
];

export const MOCK_INCIDENTS: IncidentReport[] = [
  {
    id: "inc-001",
    resolved: false,
    description:
      "Player slid into second base and sustained minor abrasion on right forearm. Ice applied, parents notified.",
    reporterId: {
      isAnonymous: () => false,
      toString: () => "anon",
      toText: () => "anon",
      compareTo: () => 0,
    } as any,
    timestamp: BigInt(Date.now() - 1800000) * BigInt(1_000_000),
    severity: "medium" as any,
    location: "Field 2 – JV",
    incidentType: "injury" as any,
  },
];

export const MOCK_CONTACTS = [
  {
    name: "Dr. Pamela Arceneaux",
    role: "League Safety Officer",
    team: "All Teams",
    phone: "(337) 555-0182",
  },
  {
    name: "Coach Ray Thibodaux",
    role: "Head Coach",
    team: "Varsity",
    phone: "(337) 555-0247",
  },
  {
    name: "Julie Fontenot",
    role: "AED Certified",
    team: "JV",
    phone: "(337) 555-0391",
  },
];

// ---------- Queries ----------

export function useWeatherData() {
  const { actor, isFetching } = useActor();
  return useQuery<WeatherData>({
    queryKey: ["weatherData"],
    queryFn: async () => {
      if (!actor) return MOCK_WEATHER;
      try {
        const data = await actor.getWeatherData();
        return data;
      } catch {
        return MOCK_WEATHER;
      }
    },
    enabled: !isFetching,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useActivityFeed() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activityFeed"],
    queryFn: async () => {
      if (!actor) return MOCK_ACTIVITY;
      try {
        const entries = await actor.getSortedActivityFeed();
        if (entries.length === 0) return MOCK_ACTIVITY;
        return entries.map((e, i) => ({
          id: String(i),
          timestamp: Number(e.timestamp / BigInt(1_000_000)),
          description: e.description,
          agent: e.agent.toString(),
        }));
      } catch {
        return MOCK_ACTIVITY;
      }
    },
    enabled: !isFetching,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useActiveIncidents() {
  const { actor, isFetching } = useActor();
  return useQuery<IncidentReport[]>({
    queryKey: ["activeIncidents"],
    queryFn: async () => {
      if (!actor) return MOCK_INCIDENTS;
      try {
        const incidents = await actor.getAllActiveIncidents();
        return incidents.length > 0 ? incidents : MOCK_INCIDENTS;
      } catch {
        return MOCK_INCIDENTS;
      }
    },
    enabled: !isFetching,
    staleTime: 30 * 1000,
  });
}

export function useActiveGames() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeGames"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllActiveGames();
      } catch {
        return [];
      }
    },
    enabled: !isFetching,
    staleTime: 30 * 1000,
  });
}

export function usePitchCounts() {
  return useQuery<PitchCount[]>({
    queryKey: ["pitchCounts"],
    queryFn: async () => MOCK_PITCH_COUNTS,
    staleTime: 60 * 1000,
  });
}

export function useCreateIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (report: IncidentReport) => {
      if (actor) {
        await actor.createIncidentReport(report);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeIncidents"] });
      queryClient.invalidateQueries({ queryKey: ["activityFeed"] });
    },
  });
}

export function useResolveIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (actor) await actor.resolveIncident(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeIncidents"] });
    },
  });
}

export function useSubmitChecklist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (checklist: SafetyChecklist) => {
      if (actor) await actor.submitSafetyChecklist(checklist);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activityFeed"] });
    },
  });
}

export function useLogPitchCount() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pc: PitchCount) => {
      if (actor) await actor.logPitchCount(pc);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pitchCounts"] });
    },
  });
}

export function useFetchWeather() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) return MOCK_WEATHER;
      try {
        return await actor.fetchWeatherData();
      } catch {
        return MOCK_WEATHER;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["weatherData"], data);
    },
  });
}
