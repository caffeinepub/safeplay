import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface CredentialStatus {
    badgeStatus: Variant_red_green;
    lastUpdated: Time;
    diamondLeaderComplete: boolean;
    backgroundCheckExpiry: Time;
}
export interface WeatherData {
    temperature: number;
    wbgt: number;
    heatCode: Variant_red_orange_green_yellow;
    lightningAlert: boolean;
    humidity: number;
    timestamp: Time;
}
export interface PitchCount {
    teamName: string;
    pitchCount: bigint;
    gameId: string;
    timestamp: Time;
    playerName: string;
}
export interface GameState {
    startTime?: Time;
    team1: string;
    team2: string;
    endTime?: Time;
    winner?: string;
    isActive: boolean;
    currentInning: bigint;
    finalScore?: bigint;
    fieldId: string;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface IncidentReport {
    id: string;
    resolved: boolean;
    description: string;
    reporterId: Principal;
    timestamp: Time;
    severity: Variant_low_high_critical_medium;
    photoBlobId?: ExternalBlob;
    location: string;
    incidentType: Variant_near_miss_injury_hazard;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface ActivityFeedEntry {
    agent: Principal;
    description: string;
    timestamp: Time;
}
export interface SafetyChecklist {
    gopherHolesChecked: boolean;
    weatherAssessed: boolean;
    dugoutClear: boolean;
    completed: boolean;
    gameId: string;
    fenceCappingIntact: boolean;
    aedLocated: boolean;
    basesSecured: boolean;
    coachId: Principal;
    timestamp: Time;
    firstAidKitPresent: boolean;
    pitchingMoundSafe: boolean;
    fieldId: string;
}
export interface SafetyContact {
    name: string;
    role: string;
    team: string;
    phone: string;
}
export enum FieldStatus {
    clear = "clear",
    pre_check_pending = "pre_check_pending",
    incident_reported = "incident_reported",
    game_active = "game_active"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_low_high_critical_medium {
    low = "low",
    high = "high",
    critical = "critical",
    medium = "medium"
}
export enum Variant_near_miss_injury_hazard {
    near_miss = "near_miss",
    injury = "injury",
    hazard = "hazard"
}
export enum Variant_red_green {
    red = "red",
    green = "green"
}
export enum Variant_red_orange_green_yellow {
    red = "red",
    orange = "orange",
    green = "green",
    yellow = "yellow"
}
export interface backendInterface {
    addSafetyContact(team: string, contact: SafetyContact): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkAndUpdateLightningAlert(currentWeather: WeatherData): Promise<void>;
    createField(id: string, status: FieldStatus): Promise<void>;
    createIncidentReport(report: IncidentReport): Promise<void>;
    endGame(gameId: string, finalScore: bigint, winner: string): Promise<void>;
    fetchWeatherData(): Promise<WeatherData>;
    getActivityFeed(): Promise<Array<[Time, Principal, string]>>;
    getAllActiveGames(): Promise<Array<GameState>>;
    getAllActiveIncidents(): Promise<Array<IncidentReport>>;
    getAllCompletedChecklistsForField(fieldId: string): Promise<Array<SafetyChecklist>>;
    getAllFields(): Promise<Array<FieldStatus>>;
    getAllPitchCountsForPlayer(playerName: string): Promise<Array<PitchCount>>;
    getCallerUserRole(): Promise<UserRole>;
    getChecklist(fieldId: string): Promise<SafetyChecklist | null>;
    getCredentialStatus(teamId: Principal): Promise<CredentialStatus | null>;
    getField(id: string): Promise<FieldStatus | null>;
    getGameState(gameId: string): Promise<GameState | null>;
    getIncidentReport(incidentId: string): Promise<IncidentReport | null>;
    getPitchCount(gameId: string): Promise<PitchCount | null>;
    getSafetyContacts(team: string): Promise<Array<SafetyContact>>;
    getSortedActivityFeed(): Promise<Array<ActivityFeedEntry>>;
    getWeatherData(): Promise<WeatherData>;
    isCallerAdmin(): Promise<boolean>;
    logPitchCount(pitchCount: PitchCount): Promise<void>;
    resolveIncident(incidentId: string): Promise<void>;
    startGame(fieldId: string, team1: string, team2: string): Promise<string>;
    submitSafetyChecklist(checklist: SafetyChecklist): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateCredentialStatus(teamId: Principal, status: CredentialStatus): Promise<void>;
}
