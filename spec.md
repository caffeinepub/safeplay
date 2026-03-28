# SafePlay — Youth Baseball Safety Management Platform

## Current State
New project. Empty Motoko backend and no frontend code.

## Requested Changes (Diff)

### Add
- **Role-based auth**: safety_coordinator, coach, parent roles
- **Pre-game safety checklist**: 8-item field inspection checklist; coaches must complete before game clock starts or equipment shed unlocks
- **Game clock management**: start/stop, tied to checklist completion
- **Incident reporting**: timestamped reports with photo upload, type (injury/hazard), location, description; notifies safety coordinator
- **WBGT environmental monitor**: pull weather data from open-meteo API for Westlake, LA (lat 30.25, lon -93.35); calculate WBGT approximation; classify as Green/Yellow/Orange/Red code; alert coaches
- **Lightning proximity alerts**: use weather API to surface thunderstorm alerts; show "Clear the Field" alarm when storm is close
- **Coach/volunteer credentials**: digital profiles with background check expiry date, Diamond Leader training completion flag; badge turns red when expired or incomplete
- **Gatekeeper mode**: coordinator view showing all fields and whether any team has uncredentialed adults in the dugout
- **Pitch count tracking**: log pitches per player per game; enforce rest day rules; team locks from scheduling next practice if pitch count not logged at game end
- **Live field status dashboard**: real-time feed showing each field's current state (pre-check pending, game active, incident reported, clear)
- **Recent activity feed**: timestamped log of all app events across all fields
- **Safety contacts**: emergency contact list per team

### Modify
N/A — new project

### Remove
N/A — new project

## Implementation Plan
1. Select components: authorization, blob-storage, http-outcalls
2. Generate Motoko backend with all entities: users/roles, checklists, games, incidents, pitch counts, credentials, fields, weather cache, activity feed
3. Build React frontend:
   - Login/auth flow with role routing
   - Dashboard with live field status grid, alert banner (WBGT/lightning), report incident CTA, recent activity
   - Pre-game checklist flow (step-by-step 60-second inspection)
   - Incident report modal (red button → photo + details form)
   - Credentials management (badge display, expiry tracking)
   - Pitch count logger per player
   - Coordinator gatekeeper view
   - Environmental data panel
