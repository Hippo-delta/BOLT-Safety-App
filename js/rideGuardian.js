/**
 * RideSafe AI - Ride Guardian Module
 * Handles live GPS tracking, speed estimation, overspeed alerts,
 * trip distance/time accumulation, and break reminders.
 */

class RideGuardianController {
    constructor() {
        this.isRiding = false;
        this.watchId = null;
        this.timerInterval = null;
        
        // Settings (persisted in LocalStorage)
        this.speedThreshold = parseInt(localStorage.getItem('ridesafe_speed_threshold') || '60', 10);
        this.breakReminderMinutes = parseInt(localStorage.getItem('ridesafe_break_interval') || '45', 10);
        
        // Live Ride State
        this.currentSpeed = null; // km/h or null if unavailable
        this.isOverspeed = false;
        this.lastValidPosition = null;
        this.tripDistanceKm = 0;
        this.tripSeconds = 0;
        this.locationAccuracy = null;
        this.gpsStatus = 'standby'; // 'standby' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'simulated'
        this.gpsErrorMessage = '';
        this.breakAlertTriggered = false;

        // Simulation Mode (for demonstration / testing indoors)
        this.isSimulating = false;
        this.simInterval = null;
        this.simStep = 0;

        // Callbacks for UI updates
        this.onStateChange = null;
    }

    setThreshold(newThreshold) {
        this.speedThreshold = Math.max(20, Math.min(140, parseInt(newThreshold, 10) || 60));
        localStorage.setItem('ridesafe_speed_threshold', this.speedThreshold.toString());
        if (this.onStateChange) this.onStateChange(this.getState());
    }

    setBreakInterval(minutes) {
        this.breakReminderMinutes = Math.max(10, Math.min(180, parseInt(minutes, 10) || 45));
        localStorage.setItem('ridesafe_break_interval', this.breakReminderMinutes.toString());
        if (this.onStateChange) this.onStateChange(this.getState());
    }

    getState() {
        return {
            isRiding: this.isRiding,
            isSimulating: this.isSimulating,
            currentSpeed: this.currentSpeed,
            speedThreshold: this.speedThreshold,
            isOverspeed: this.isOverspeed,
            tripDistanceKm: this.tripDistanceKm,
            tripSeconds: this.tripSeconds,
            locationAccuracy: this.locationAccuracy,
            gpsStatus: this.gpsStatus,
            gpsErrorMessage: this.gpsErrorMessage,
            breakReminderMinutes: this.breakReminderMinutes,
            breakAlertTriggered: this.breakAlertTriggered,
            coords: this.lastValidPosition ? {
                latitude: this.lastValidPosition.coords.latitude,
                longitude: this.lastValidPosition.coords.longitude
            } : null
        };
    }

    startRide() {
        if (this.isRiding) return;
        this.isRiding = true;
        this.tripSeconds = 0;
        this.tripDistanceKm = 0;
        this.currentSpeed = null;
        this.isOverspeed = false;
        this.lastValidPosition = null;
        this.breakAlertTriggered = false;
        this.gpsErrorMessage = '';

        // Start Trip Clock
        this.timerInterval = setInterval(() => {
            this.tripSeconds++;
            
            // Check break reminder
            const breakSecs = this.breakReminderMinutes * 60;
            if (this.tripSeconds >= breakSecs && !this.breakAlertTriggered) {
                this.breakAlertTriggered = true;
                if (window.safetyAudio) window.safetyAudio.playBeep(520, 0.4, 'triangle');
            }

            if (this.onStateChange) this.onStateChange(this.getState());
        }, 1000);

        if (this.isSimulating) {
            this._startSimulation();
        } else {
            this._startLiveGeolocation();
        }

        if (this.onStateChange) this.onStateChange(this.getState());
    }

    stopRide() {
        if (!this.isRiding) return;
        this.isRiding = false;

        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        // Clear GPS watch
        if (this.watchId !== null && 'geolocation' in navigator) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        // Clear simulation
        if (this.simInterval) {
            clearInterval(this.simInterval);
            this.simInterval = null;
        }

        this.currentSpeed = null;
        this.isOverspeed = false;
        this.gpsStatus = 'standby';

        if (this.onStateChange) this.onStateChange(this.getState());
    }

    dismissBreakAlert() {
        this.breakAlertTriggered = false;
        // Reset reminder relative to now
        this.tripSeconds = 0;
        if (this.onStateChange) this.onStateChange(this.getState());
    }

    toggleSimulation(enable) {
        const wasRiding = this.isRiding;
        if (wasRiding) {
            this.stopRide();
        }
        this.isSimulating = !!enable;
        if (wasRiding) {
            this.startRide();
        } else {
            this.gpsStatus = this.isSimulating ? 'simulated' : 'standby';
            if (this.onStateChange) this.onStateChange(this.getState());
        }
    }

    _startLiveGeolocation() {
        if (!('geolocation' in navigator)) {
            this.gpsStatus = 'unavailable';
            this.gpsErrorMessage = 'Geolocation is not supported by your browser.';
            if (this.onStateChange) this.onStateChange(this.getState());
            return;
        }

        this.gpsStatus = 'requesting';
        if (this.onStateChange) this.onStateChange(this.getState());

        const geoOptions = {
            enableHighAccuracy: true,
            maximumAge: 2000,
            timeout: 10000
        };

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => this._handleGpsSuccess(pos),
            (err) => this._handleGpsError(err),
            geoOptions
        );
    }

    _handleGpsSuccess(pos) {
        this.gpsStatus = 'active';
        this.gpsErrorMessage = '';
        this.locationAccuracy = Math.round(pos.coords.accuracy);

        let speedKmh = null;

        // 1. Direct speed provided by device hardware
        if (pos.coords.speed !== null && !isNaN(pos.coords.speed) && pos.coords.speed >= 0) {
            speedKmh = Math.round(pos.coords.speed * 3.6);
        } else if (this.lastValidPosition) {
            // 2. Fallback: Estimate speed from delta distance and delta time
            const prev = this.lastValidPosition;
            const deltaSec = (pos.timestamp - prev.timestamp) / 1000;

            if (deltaSec >= 1 && deltaSec <= 30) {
                const distMeters = this._haversineDistance(
                    prev.coords.latitude,
                    prev.coords.longitude,
                    pos.coords.latitude,
                    pos.coords.longitude
                );

                // Filter GPS jitter: if movement is smaller than location accuracy, treat as stationary
                const minReliableDistance = Math.max(3, (pos.coords.accuracy + prev.coords.accuracy) / 4);
                if (distMeters > minReliableDistance) {
                    const calculatedKmh = (distMeters / deltaSec) * 3.6;
                    // Cap realistic motorcycle speed to avoid GPS teleport glitches
                    if (calculatedKmh < 220) {
                        speedKmh = Math.round(calculatedKmh);
                        this.tripDistanceKm += distMeters / 1000;
                    }
                } else {
                    speedKmh = 0; // Stationary
                }
            }
        } else {
            // First fix received
            speedKmh = 0;
        }

        // Update distance if speed came from hardware and we have a previous fix
        if (pos.coords.speed !== null && this.lastValidPosition) {
            const distMeters = this._haversineDistance(
                this.lastValidPosition.coords.latitude,
                this.lastValidPosition.coords.longitude,
                pos.coords.latitude,
                pos.coords.longitude
            );
            if (distMeters > 3) {
                this.tripDistanceKm += distMeters / 1000;
            }
        }

        this.lastValidPosition = pos;
        this.currentSpeed = speedKmh;

        // Evaluate overspeed condition
        if (this.currentSpeed !== null && this.currentSpeed > this.speedThreshold) {
            this.isOverspeed = true;
            if (window.safetyAudio) {
                window.safetyAudio.playOverspeedAlert();
            }
        } else {
            this.isOverspeed = false;
        }

        if (this.onStateChange) this.onStateChange(this.getState());
    }

    _handleGpsError(err) {
        switch (err.code) {
            case err.PERMISSION_DENIED:
                this.gpsStatus = 'denied';
                this.gpsErrorMessage = 'Location permission was denied. Please allow location access in your browser settings to track live speed.';
                break;
            case err.POSITION_UNAVAILABLE:
                this.gpsStatus = 'unavailable';
                this.gpsErrorMessage = 'GPS signal unavailable. Check your device location service or move outdoors for a satellite lock.';
                break;
            case err.TIMEOUT:
                this.gpsStatus = 'unavailable';
                this.gpsErrorMessage = 'GPS request timed out waiting for location fix.';
                break;
            default:
                this.gpsStatus = 'unavailable';
                this.gpsErrorMessage = err.message || 'Unknown GPS error.';
        }
        this.currentSpeed = null;
        this.isOverspeed = false;
        if (this.onStateChange) this.onStateChange(this.getState());
    }

    _startSimulation() {
        this.gpsStatus = 'simulated';
        this.locationAccuracy = 4; // Simulated 4m accuracy
        this.simStep = 0;

        // Demo profile: Accelerates from 20 to 55, then surges past 68 (overspeed test), then slows down to 42
        const speedProfile = [
            25, 34, 45, 52, 58, 63, 67, 72, 74, 69, 61, 55, 48, 42, 38, 44, 50, 56, 62, 65, 59, 45, 30
        ];

        // Simulated start coordinates (Pune / typical Indian city test location)
        let simLat = 18.5204;
        let simLng = 73.8567;

        this.simInterval = setInterval(() => {
            if (!this.isRiding) return;

            const targetSpeed = speedProfile[this.simStep % speedProfile.length];
            this.simStep++;
            this.currentSpeed = targetSpeed;

            // Advance distance: speed in km/h * (1 hr / 3600 s)
            this.tripDistanceKm += (targetSpeed / 3600);

            // Nudge simulated coordinates
            simLat += 0.00012;
            simLng += 0.00010;

            this.lastValidPosition = {
                coords: {
                    latitude: simLat,
                    longitude: simLng,
                    accuracy: 4,
                    speed: targetSpeed / 3.6
                },
                timestamp: Date.now()
            };

            // Check overspeed
            if (this.currentSpeed > this.speedThreshold) {
                this.isOverspeed = true;
                if (window.safetyAudio) {
                    window.safetyAudio.playOverspeedAlert();
                }
            } else {
                this.isOverspeed = false;
            }

            if (this.onStateChange) this.onStateChange(this.getState());
        }, 1200);
    }

    _haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const phi1 = (lat1 * Math.PI) / 180;
        const phi2 = (lat2 * Math.PI) / 180;
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}

// Global Ride Guardian instance
window.rideGuardian = new RideGuardianController();
