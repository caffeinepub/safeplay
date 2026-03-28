import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the user system state from authorization component
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // TYPES --------------------------------------------------------------------
  type FieldStatus = {
    #pre_check_pending;
    #game_active;
    #incident_reported;
    #clear;
  };

  type SafetyChecklist = {
    gopherHolesChecked : Bool;
    fenceCappingIntact : Bool;
    aedLocated : Bool;
    basesSecured : Bool;
    pitchingMoundSafe : Bool;
    dugoutClear : Bool;
    firstAidKitPresent : Bool;
    weatherAssessed : Bool;
    completed : Bool;
    fieldId : Text;
    gameId : Text;
    coachId : Principal;
    timestamp : Time.Time;
  };

  type GameState = {
    fieldId : Text;
    team1 : Text;
    team2 : Text;
    startTime : ?Time.Time;
    endTime : ?Time.Time;
    currentInning : Nat;
    isActive : Bool;
    winner : ?Text;
    finalScore : ?Nat;
  };

  type PitchCount = {
    playerName : Text;
    teamName : Text;
    pitchCount : Nat;
    gameId : Text;
    timestamp : Time.Time;
  };

  type IncidentReport = {
    id : Text;
    incidentType : { #injury; #hazard; #near_miss };
    severity : { #low; #medium; #high; #critical };
    description : Text;
    location : Text;
    photoBlobId : ?Storage.ExternalBlob;
    timestamp : Time.Time;
    reporterId : Principal;
    resolved : Bool;
  };

  type CredentialStatus = {
    backgroundCheckExpiry : Time.Time;
    diamondLeaderComplete : Bool;
    lastUpdated : Time.Time;
    badgeStatus : { #green; #red };
  };

  type WeatherData = {
    wbgt : Float;
    temperature : Float;
    humidity : Float;
    heatCode : { #green; #yellow; #orange; #red };
    lightningAlert : Bool;
    timestamp : Time.Time;
  };

  type ActivityFeedEntry = {
    timestamp : Time.Time;
    agent : Principal;
    description : Text;
  };

  type SafetyContact = {
    name : Text;
    role : Text;
    phone : Text;
    team : Text;
  };

  module ActivityFeed {
    public func compare(a : ActivityFeedEntry, b : ActivityFeedEntry) : Order.Order {
      Int.compare(b.timestamp, a.timestamp); // Sort by descending timestamp
    };
  };

  // DATA STRUCTURES -----------------------------------------------------------
  let fields = Map.empty<Text, FieldStatus>();
  let checklists = Map.empty<Text, SafetyChecklist>();
  let fieldChecklists = Map.empty<Text, List.List<SafetyChecklist>>();
  let games = Map.empty<Text, GameState>();
  let pitchCounts = Map.empty<Text, PitchCount>();
  let playerPitchCounts = Map.empty<Text, List.List<PitchCount>>();
  let incidentReports = Map.empty<Text, IncidentReport>();
  let credentialStatuses = Map.empty<Principal, CredentialStatus>();
  let weatherCache = Map.empty<Text, WeatherData>();
  let activityFeed = List.empty<ActivityFeedEntry>();
  let safetyContacts = Map.empty<Text, List.List<SafetyContact>>();
  let lockedTeams = Set.empty<Text>();

  // FIELDS --------------------------------------------------------------------
  public shared ({ caller }) func createField(id : Text, status : FieldStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only safety coordinators can create fields");
    };
    if (fields.containsKey(id)) {
      Runtime.trap("Field already exists");
    };
    fields.add(id, status);
    addActivityFeed(caller, "Field created: " # id);
  };

  public query ({ caller }) func getField(id : Text) : async ?FieldStatus {
    fields.get(id);
  };

  public query ({ caller }) func getAllFields() : async [FieldStatus] {
    fields.values().toArray();
  };

  // SAFETY CHECKLISTS ---------------------------------------------------------
  public shared ({ caller }) func submitSafetyChecklist(checklist : SafetyChecklist) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only coaches can submit safety checklists");
    };
    checklists.add(checklist.fieldId, checklist);

    // Store in fieldChecklists
    let existingList = switch (fieldChecklists.get(checklist.fieldId)) {
      case (?list) { list };
      case (null) { List.empty<SafetyChecklist>() };
    };
    existingList.add(checklist);
    fieldChecklists.add(checklist.fieldId, existingList);

    fields.add(checklist.fieldId, #clear);
    addActivityFeed(caller, "Checklist submitted for field " # checklist.fieldId);
  };

  public query ({ caller }) func getChecklist(fieldId : Text) : async ?SafetyChecklist {
    checklists.get(fieldId);
  };

  // Get all completed checklists for a field
  public query ({ caller }) func getAllCompletedChecklistsForField(fieldId : Text) : async [SafetyChecklist] {
    switch (fieldChecklists.get(fieldId)) {
      case (?list) {
        list.values().toArray().filter(func(c) { c.completed });
      };
      case (null) { [] };
    };
  };

  // GAME MANAGEMENT -----------------------------------------------------------
  public shared ({ caller }) func startGame(fieldId : Text, team1 : Text, team2 : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only coaches can start games");
    };

    if (not checklists.containsKey(fieldId)) {
      return "Checklist not complete - cannot start game";
    };

    let gameId = fieldId # "_" # Time.now().toText();
    games.add(
      gameId,
      {
        fieldId;
        team1;
        team2;
        startTime = ?Time.now();
        endTime = null;
        currentInning = 1;
        isActive = true;
        winner = null;
        finalScore = null;
      },
    );
    fields.add(fieldId, #game_active);
    addActivityFeed(caller, "Game started! Field: " # fieldId # ", Teams: " # team1 # " vs " # team2);
    "Game started successfully";
  };

  public shared ({ caller }) func endGame(gameId : Text, finalScore : Nat, winner : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only coaches can end games");
    };

    let gameState = switch (games.get(gameId)) {
      case (?game) { game };
      case (null) { Runtime.trap("Game not found") };
    };
    let updatedGame = {
      gameState with
      endTime = ?Time.now();
      isActive = false;
      finalScore = ?finalScore;
      winner = ?winner;
    };
    games.add(gameId, updatedGame);
    fields.add(gameState.fieldId, #clear);
    addActivityFeed(caller, "Game ended: " # gameId);
  };

  public query ({ caller }) func getGameState(gameId : Text) : async ?GameState {
    games.get(gameId);
  };

  public query ({ caller }) func getAllActiveGames() : async [GameState] {
    games.values().toArray().filter(func(g) { g.isActive });
  };

  // PITCH COUNT TRACKING ------------------------------------------------------
  public shared ({ caller }) func logPitchCount(pitchCount : PitchCount) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only coaches can log pitch counts");
    };
    pitchCounts.add(pitchCount.gameId, pitchCount);

    // Store in playerPitchCounts
    let playerKey = pitchCount.playerName # "_" # pitchCount.gameId;
    let existingList = switch (playerPitchCounts.get(playerKey)) {
      case (?list) { list };
      case (null) { List.empty<PitchCount>() };
    };
    existingList.add(pitchCount);
    playerPitchCounts.add(playerKey, existingList);

    // Unlock team if necessary
    let updatedPitchCount = pitchCount; // This is just for demonstration

    // Check if pitch count satisfies requirement (simplified)
    // If pitch count is recorded for a completed game, remove the team from "lockedTeams"
    if (pitchCount.pitchCount > 0) {
      let teamKey = pitchCount.teamName;
      if (lockedTeams.contains(teamKey)) {
        lockedTeams.remove(teamKey);
      };
      // Add activity feed entry
      addActivityFeed(caller, "Pitch count recorded for player " # pitchCount.playerName);
    };
  };

  public query ({ caller }) func getPitchCount(gameId : Text) : async ?PitchCount {
    pitchCounts.get(gameId);
  };

  // Get all pitch counts for a player across all games
  public query ({ caller }) func getAllPitchCountsForPlayer(playerName : Text) : async [PitchCount] {
    let allPitchCounts = List.empty<PitchCount>();
    let entries = playerPitchCounts.entries();
    for ((key, pitchCountList) in entries) {
      if (key == playerName) {
        allPitchCounts.addAll(pitchCountList.values());
      };
    };
    allPitchCounts.toArray();
  };

  // INCIDENT REPORTS ----------------------------------------------------------
  public shared ({ caller }) func createIncidentReport(report : IncidentReport) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create incident reports");
    };
    incidentReports.add(report.id, report);
    fields.add(report.location, #incident_reported);
    addActivityFeed(caller, "Incident reported at " # report.location);
  };

  public shared ({ caller }) func resolveIncident(incidentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only safety coordinators can resolve incidents");
    };

    let report = switch (incidentReports.get(incidentId)) {
      case (?r) { r };
      case (null) { Runtime.trap("Incident not found") };
    };
    let updatedReport = { report with resolved = true };
    incidentReports.add(incidentId, updatedReport);
    addActivityFeed(caller, "Incident resolved: " # incidentId);
  };

  public query ({ caller }) func getIncidentReport(incidentId : Text) : async ?IncidentReport {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view incident reports");
    };
    incidentReports.get(incidentId);
  };

  public query ({ caller }) func getAllActiveIncidents() : async [IncidentReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view incidents");
    };
    incidentReports.values().toArray().filter(func(i) { not i.resolved });
  };

  // CREDENTIALS ---------------------------------------------------------------
  public shared ({ caller }) func updateCredentialStatus(teamId : Principal, status : CredentialStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only coaches can update credential status");
    };
    credentialStatuses.add(teamId, status);
    addActivityFeed(caller, "Credential status updated for team: " # teamId.toText());
  };

  public query ({ caller }) func getCredentialStatus(teamId : Principal) : async ?CredentialStatus {
    credentialStatuses.get(teamId);
  };

  // ENVIRONMENTAL DATA --------------------------------------------------------
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchWeatherData() : async WeatherData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can fetch weather data");
    };
    // Make HTTP outcall to Open-Meteo API
    let response = await OutCall.httpGetRequest("https://api.open-meteo.com/v1/forecast?latitude=34.123&longitude=-118.775&hourly=temperature_2m,humidity", [], transform);
    switch (parseWeatherApiResponse(response)) {
      case (?weatherData) {
        weatherCache.add("Westlake_LA", weatherData);
        addActivityFeed(caller, "Weather data fetched and cached");
        weatherData;
      };
      case (null) {
        Runtime.trap("Failed to parse weather API response");
      };
    };
  };

  public shared ({ caller }) func checkAndUpdateLightningAlert(currentWeather : WeatherData) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only safety coordinators can update lightning alerts");
    };

    // Add activity feed entry when lightning alert status changes
    if (currentWeather.lightningAlert) {
      addActivityFeed(caller, "Lightning alert issued for Westlake LA");
    } else {
      addActivityFeed(caller, "Lightning alert cleared for Westlake LA");
    };
  };

  public query ({ caller }) func getWeatherData() : async WeatherData {
    switch (weatherCache.get("Westlake_LA")) {
      case (?weather) { weather };
      case (null) { Runtime.trap("Weather data not found") };
    };
  };

  // ACTIVITY FEED -------------------------------------------------------------
  public query ({ caller }) func getActivityFeed() : async [(Time.Time, Principal, Text)] {
    activityFeed.values().toArray().map(func(entry) { (entry.timestamp, entry.agent, entry.description) });
  };

  func addActivityFeed(agent : Principal, description : Text) {
    activityFeed.add({
      timestamp = Time.now();
      agent;
      description;
    });
  };

  public query ({ caller }) func getSortedActivityFeed() : async [ActivityFeedEntry] {
    activityFeed.toArray().sort();
  };

  // SAFETY CONTACTS -----------------------------------------------------------
  public shared ({ caller }) func addSafetyContact(team : Text, contact : SafetyContact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only coaches can add safety contacts");
    };

    let existingContacts = switch (safetyContacts.get(team)) {
      case (?contacts) { contacts };
      case (null) { List.empty<SafetyContact>() };
    };
    existingContacts.add(contact);
    safetyContacts.add(team, existingContacts);
    addActivityFeed(caller, "Safety contact added for team " # team);
  };

  public query ({ caller }) func getSafetyContacts(team : Text) : async [SafetyContact] {
    switch (safetyContacts.get(team)) {
      case (?contacts) { contacts.toArray() };
      case (null) { [] };
    };
  };

  // DATA IMPORT FUNCTION ------------------------------------------------------
  func parseWeatherApiResponse(_response : Text) : ?WeatherData {
    // Dummy parsing logic - replace with actual JSON parsing in Rust
    ?{
      wbgt = 82.0;
      temperature = 76.5;
      humidity = 55.0;
      heatCode = #yellow;
      lightningAlert = false;
      timestamp = Time.now();
    };
  };
};
