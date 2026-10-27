# 🏍️ RideSafe AI — A Motorcycle Rider Safety Companion

**RideSafe AI** is a mobile-first, responsive web application engineered for two-wheeler safety. Built with pure HTML5, CSS3, and Vanilla JavaScript, it offers motorcycle riders real-time speed monitoring with configurable alerts, an emergency distress SOS dispatch system, community-sourced road hazard radar, and pre-ride bike readiness inspections.

Designed specifically for engineering project presentations and rapid demonstration, it runs locally with **zero external dependencies** and works reliably offline.

---

## 📋 Feature Overview

### 1. 🛡️ Ride Guardian (Speed & Telemetry Monitoring)
- **Live Speedometer:** Displays GPS-derived speed in km/h using the browser `Geolocation.watchPosition` API.
- **Dynamic Speed Estimation:** Fallback algorithm computes speed from successive coordinates using the Haversine formula, filtering out noise and stationary jitter.
- **Configurable Overspeed Alerts:** Interactive slider (30–120 km/h, default 60 km/h). Triggers a pulsing red HUD warning and a two-tone audible alarm generated via the Web Audio API.
- **Trip Statistics:** Real-time counters for elapsed ride duration (`hh:mm:ss`) and accumulated distance (km).
- **Rider Fatigue Reminder:** Configurable alert (15, 30, 45, 60, 90 mins) prompting riders to take hydrating breaks.
- **Demo GPS Simulation Mode:** An indoor test toggle that simulates realistic motorcycle acceleration, cruising, overspeeding, and braking so evaluators can test alerts on a stationary laptop.
- **Location Accuracy Indicator:** Displays real-time GPS accuracy badge (± meters) with honest error handling for denied permissions, unavailable fixes, and timeouts.

### 2. 🚨 SOS & Safe Arrival Check-in
- **1-Tap Emergency SOS:** Prominent distress trigger with a confirmation modal to avoid accidental activation.
- **Live Location Extraction:** Automatically fetches the rider's current latitude and longitude and generates a direct Google Maps pin link (`https://maps.google.com/?q=LAT,LNG`).
- **Multi-Channel Dispatch:**
  - Native Web Share API (WhatsApp, SMS, Contacts)
  - Direct WhatsApp link (`wa.me/?text=...`)
  - Direct SMS link (`sms:...?body=...`)
  - Copy Message to Clipboard fallback
- **Emergency Contact Persistence:** Saves trusted contact name, phone number, and relation in browser `LocalStorage`.
- **Safe Arrival Monitor:** Configurable destination and countdown timer (1m demo, 15m, 30m, 45m, 60m).
- **Overdue Journey Alert:** Triggers an alarm and pre-fills an overdue alert notice if safe arrival is not confirmed before the timer reaches 00:00.

### 3. ⚠️ Road Hazard Radar
- **Categorized Reporting:**
  - Pothole or damaged road
  - Waterlogging or flooding
  - Loose gravel or debris
  - Oil spill or slippery surface
  - Accident or obstruction
  - Other road hazards
- **Interactive Leaflet / OpenStreetMap:** Plots custom color-coded hazard pins (Red: High, Amber: Medium, Green: Low).
- **Graceful Fallback:** If offline or if the CDN is restricted, the UI automatically switches to an informative fallback while keeping all hazard cards accessible.
- **Filtering & Search:** Filter by hazard category, severity rating, and resolution status (Active vs Resolved).
- **Resolve Action:** Riders can mark hazards as resolved once cleared.
- **Sample Community Reports:** Pre-loaded with 5 realistic Indian urban road hazards, clearly labeled as `[Sample Demo Data]`.

### 4. 🔧 Bike Readiness (Pre-Ride Checklist)
- **Pre-Ride Inspection Items:**
  1. Tyres & Cold Pressure
  2. Front & Rear Brakes
  3. Headlights & Turn Indicators
  4. Rearview Mirrors
  5. Helmet & Retention Strap
  6. Fuel Level / Battery SOC
  7. Fluid Leaks & Visible Damage
  8. Chain Slack & Lubrication
- **Tri-State Status Toggles:** *Passed* (Green), *Needs Attention* (Amber), and *Not Checked* (Gray).
- **Readiness Scoring:** Automatically calculates completion percentage and displays badges (`Ready for Review`, `Needs Attention`, `Incomplete`).
- **Bike Profile & Maintenance Log:** Tracks vehicle make/model, registration number, odometer reading, last service date, and scheduled maintenance intervals (engine oil, chain lube, brake pads).
- **Honesty Disclaimer:** Prominently clarifies that the checklist reflects self-reported condition, not a certified mechanical safety inspection.

---

## 📂 File Structure

```text
Safety App/
├── index.html            # Main semantic HTML5 single-page application
├── server.js             # Zero-dependency local Node.js HTTP server
├── README.md             # Complete documentation and presentation guide
├── css/
│   └── style.css         # Dark motorcycle cockpit styling, high contrast, responsive
└── js/
    ├── app.js            # Core coordinator, navigation, modals, and DOM bindings
    ├── audio.js          # Web Audio API synthesizer for alarms and chimes (no mp3s needed)
    ├── bikeReadiness.js  # Pre-ride checklist scoring and maintenance tracking
    ├── emergency.js      # SOS message drafting, sharing channels, and arrival timers
    ├── hazards.js        # Hazard radar reports, filters, LocalStorage, and Leaflet map
    └── rideGuardian.js   # Geolocation tracking, Haversine speed calculation, simulation
```

---

## 🚀 How to Run on Windows (PowerShell)

### Step 1: Open PowerShell in the project directory
Make sure you are in `D:\Vishwakarma awards\Safety App` or the current workspace:
```powershell
cd "D:\Vishwakarma awards\Safety App"
```

### Step 2: Start the Local Server
Run with Node.js (Node v18+ supported; pre-tested on Node v24):
```powershell
node server.js
```

### Step 3: Open in Your Browser
Once started, the console will output:
```text
====================================================
   🏍️  RideSafe AI — Rider Safety Companion Server
====================================================
Local Access (Laptop):       http://localhost:3000
Mobile Access (Local Wi-Fi): http://192.168.x.x:3000
====================================================
```
Open **`http://localhost:3000`** in Chrome, Edge, Brave, or Firefox.

*(Alternatively, you can double-click `index.html` to open directly as a `file:///` URI, but running via `node server.js` is strongly recommended for geolocation and audio permissions).*

---

## 📱 How to Test on a Physical Phone

Testing on a real smartphone gives the full mobile motorcycle dashboard experience:

1. **Connect to the same Wi-Fi:** Ensure your laptop and phone are on the same Wi-Fi network (or laptop mobile hotspot).
2. **Find the IP address:** `server.js` displays your machine's local IP address automatically when started (e.g. `http://192.168.1.15:3000`).
3. **Open on Phone Browser:** Type that URL into Chrome or Safari on your phone.
4. **Geolocation on Mobile:**
   - Modern mobile browsers require either `localhost` or `HTTPS` for high-accuracy GPS.
   - For indoor testing without HTTPS, enable the **"Demo Ride Simulator"** switch on the Ride Guardian tab to test all dynamic speed calculations, alerts, and distance counters.
   - For real outdoor GPS on your phone, you can forward port 3000 via Chrome Remote Debugging (`chrome://inspect`) or test directly over localhost.

---

## 🧪 Step-by-Step Feature Test Guide

### 1. Test Ride Guardian & Overspeed Warning
1. Navigate to **Ride Guardian** tab.
2. Toggle the **"Demo Ride Simulator"** switch ON.
3. Click **"Start Ride Tracking"**.
4. Observe the digital speedometer accelerating through 25, 34, 45, 52 km/h.
5. As it exceeds 60 km/h (the default threshold), notice:
   - The speedometer dial turns pulsing red.
   - The top **Overspeed Warning Banner** flashes.
   - The Web Audio synthesizer emits an audible two-tone alert chime.
6. Adjust the **"Overspeed Warning Limit"** slider to 80 km/h: observe the alert immediately turn off until speed reaches the new threshold.
7. Click **"End Ride Tracking"** to stop.

### 2. Test Emergency SOS & Safe Arrival
1. Go to the **SOS & Arrival** tab.
2. Under "Saved Emergency Contact", click **"Edit Contact"** and enter a name (e.g. `Ananya Sharma`) and phone number (`+91 9876543210`). Click Save.
3. Tap the red **"SOS"** button:
   - A safety confirmation modal appears to prevent accidental triggers.
   - Review the prepared message containing your live GPS pin (`https://maps.google.com/?q=...`).
   - Click **"Send Emergency Distress Alert"** or test the **"WhatsApp SOS"** / **"Copy Message"** fallback.
4. Under "Safe Arrival Check-In Monitor":
   - Select duration: **"1 minute (Quick Demo Test)"**.
   - Click **"Start Safe Arrival Monitor"**.
   - Observe the live countdown clock (`00:59`, `00:58`...).
   - Allow it to reach `00:00` to observe the red **"JOURNEY OVERDUE!"** alert and one-tap emergency notice dispatch.
   - Click **"Confirm Safe Arrival"** to clear the alert and play the safe arrival celebration chime.

### 3. Test Road Hazard Radar
1. Open the **Hazard Radar** tab.
2. Observe the Leaflet OpenStreetMap displaying sample markers in Pune (craters, diesel slick, construction gravel, waterlogging).
3. Click any marker on the map to view category, severity, and description.
4. Filter by severity: Select **"High Severity"** to filter the list and map markers.
5. Click **"Report Hazard"**:
   - Choose category: `Oil Spill or Slippery Surface`.
   - Title: `Spilled engine oil on exit ramp`.
   - Severity: `High`.
   - Location: `Katraj Tunnel South Exit`.
   - Click **"Fetch GPS"** to attach current coordinates.
   - Click **"Submit Hazard Report"**.
6. The new report immediately appears on the radar list, updates the active count badge, and persists in `LocalStorage`.
7. Click **"Mark Resolved"** on any card to update its status to resolved.

### 4. Test Bike Readiness Checklist
1. Switch to the **Bike Readiness** tab.
2. Review the 8 pre-ride items (Tyres, Brakes, Lights, Mirrors, Helmet, Fuel, Leaks, Chain).
3. Tap **"Pass"**, **"Attention"**, or **"Skip"** on different items:
   - Notice the circular percentage gauge updates in real time.
   - If any item is marked "Attention", overall status changes to `Needs Attention` (Amber).
   - If any item is skipped, status displays `Incomplete`.
4. Click **"Pass All"** to set all items to passed (100% - `Ready for Review`).
5. Click **"Edit Details"** under Motorcycle Profile to record your bike model, registration number, and odometer reading.

---

## ⚖️ Implemented vs Simulated Features

| Feature | Implemented Real Logic | Practical Simulation / Limitation |
| :--- | :--- | :--- |
| **Speed Tracking** | Real browser `Geolocation.watchPosition`, hardware `coords.speed`, and Haversine delta-time calculation | Hardware GPS speed requires outdoor motion. Indoor demo mode provided for reliable evaluation. |
| **Emergency SOS** | Real coordinates extraction, Google Maps URL generation, Web Share API, `sms:` link, and WhatsApp deep links | No fake server-side SMS gateway or police API claimed. Relies on the user's phone messaging apps. |
| **Safe Arrival** | Live client-side countdown timer, LocalStorage persistence, overdue escalation prompt | Timers run in the active browser tab; mobile OS may throttle JavaScript when the screen locks. |
| **Road Hazards** | Full client-side CRUD, category/severity filtering, Leaflet interactive map, LocalStorage | Local storage is scoped to the browser. A shared backend database would be required for city-wide sync. |
| **Bike Checklist** | Dynamic percentage calculation, status classification, profile management | Evaluates manual self-reported checks; does not connect to OBD-II ECU telemetry. |
| **Audio Alerts** | Standard Web Audio API oscillator synthesis (works 100% offline without audio assets) | Subject to browser autoplay policies; requires user interaction (click/tap) before first sound. |

---

## 🔮 Future Enhancements
1. **Bluetooth BLE Integration:** Connect to smart helmet sensors for automatic chin-strap latch detection.
2. **Accelerometer Crash Detection:** Utilize device `DeviceMotionEvent` for impact detection with cancelable countdown.
3. **Backend Cloud Synchronization:** Connect to a lightweight Firebase or PostgreSQL backend to sync hazard reports between all active riders in the city.
4. **Offline Map Tile Caching:** ServiceWorker caching for OpenStreetMap tiles in low-connectivity rural roads.

---

*RideSafe AI — Built for the Vishwakarma Awards Innovation Prototype.*
