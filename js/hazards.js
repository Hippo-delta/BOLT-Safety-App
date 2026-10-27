/**
 * RideSafe AI - Road Hazard Radar Module
 * Handles hazard reporting, LocalStorage persistence, filtering,
 * Leaflet / OpenStreetMap visual plotting with graceful offline fallback.
 * 100% free and open-source — Requires zero API keys or approvals.
 */

class HazardRadarController {
    constructor() {
        this.storageKey = 'ridesafe_hazard_reports_v1';
        this.hazards = [];
        this.map = null;
        this.markersGroup = null;
        this.markersById = {};
        this.mapInitialized = false;
        this.mapLoadError = false;
        this.tileLoadError = false;

        // Active filters
        this.filterCategory = 'ALL';
        this.filterSeverity = 'ALL';
        this.filterStatus = 'ACTIVE'; // 'ALL' | 'ACTIVE' | 'RESOLVED'

        this.onStateChange = null;
        this._loadHazards();
    }

    _getInitialSampleHazards() {
        return [
            {
                id: 'sample-hz-1',
                category: 'POTHOLE',
                categoryLabel: 'Pothole or Damaged Road',
                title: 'Deep crater on outer curve',
                description: 'Large, sharp-edged pothole hidden after the blind corner. Severe risk of loss of control for two-wheelers.',
                severity: 'HIGH',
                locationName: 'MG Road Flyover Exit, Pune',
                lat: 18.5195,
                lng: 73.8553,
                reportedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
                status: 'ACTIVE',
                isSample: true,
                hasGps: true
            },
            {
                id: 'sample-hz-2',
                category: 'OIL_SPILL',
                categoryLabel: 'Oil Spill or Slippery Surface',
                title: 'Diesel slick across left lane',
                description: 'Heavy vehicle fuel spillage covering left lane. Very slick under braking.',
                severity: 'HIGH',
                locationName: 'Near Deccan Gymkhana Bus Stop',
                lat: 18.5178,
                lng: 73.8420,
                reportedAt: new Date(Date.now() - 3600 * 1000 * 7).toISOString(),
                status: 'ACTIVE',
                isSample: true,
                hasGps: true
            },
            {
                id: 'sample-hz-3',
                category: 'GRAVEL',
                categoryLabel: 'Loose Gravel or Debris',
                title: 'Construction gravel scattered',
                description: 'Uncovered gravel truck spilled stones over 40 meters. Skidding hazard when turning.',
                severity: 'MEDIUM',
                locationName: 'FC Road Junction',
                lat: 18.5260,
                lng: 73.8415,
                reportedAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
                status: 'ACTIVE',
                isSample: true,
                hasGps: true
            },
            {
                id: 'sample-hz-4',
                category: 'WATERLOGGING',
                categoryLabel: 'Waterlogging or Flooding',
                title: 'Waterlogged subway underpass',
                description: 'Underpass flooded up to 1.5 feet deep. Potholes underneath water not visible.',
                severity: 'HIGH',
                locationName: 'Shivajinagar Railway Subway',
                lat: 18.5314,
                lng: 73.8446,
                reportedAt: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
                status: 'ACTIVE',
                isSample: true,
                hasGps: true
            },
            {
                id: 'sample-hz-5',
                category: 'ACCIDENT',
                categoryLabel: 'Accident or Obstruction',
                title: 'Stalled truck blocking right lane',
                description: 'Breakdown truck without hazard lights on ring road curve.',
                severity: 'MEDIUM',
                locationName: 'University Circle bypass',
                lat: 18.5412,
                lng: 73.8290,
                reportedAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
                status: 'RESOLVED',
                isSample: true,
                hasGps: true
            }
        ];
    }

    _loadHazards() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.hazards = JSON.parse(stored);
            } else {
                this.hazards = this._getInitialSampleHazards();
                this._saveHazards();
            }
        } catch (e) {
            console.warn('[Hazards] LocalStorage read failed, using default sample hazards:', e);
            this.hazards = this._getInitialSampleHazards();
        }
    }

    _saveHazards() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.hazards));
        } catch (e) {
            console.error('[Hazards] Failed to persist hazards to LocalStorage:', e);
        }
    }

    getHazards(filtered = true) {
        if (!filtered) return [...this.hazards];

        return this.hazards.filter(h => {
            if (this.filterCategory !== 'ALL' && h.category !== this.filterCategory) {
                return false;
            }
            if (this.filterSeverity !== 'ALL' && h.severity !== this.filterSeverity) {
                return false;
            }
            if (this.filterStatus === 'ACTIVE' && h.status !== 'ACTIVE') {
                return false;
            }
            if (this.filterStatus === 'RESOLVED' && h.status !== 'RESOLVED') {
                return false;
            }
            return true;
        });
    }

    setFilter(category, severity, status) {
        if (category !== undefined) this.filterCategory = category;
        if (severity !== undefined) this.filterSeverity = severity;
        if (status !== undefined) this.filterStatus = status;

        this.renderMapMarkers();
        if (this.onStateChange) this.onStateChange(this.getHazards());
    }

    addHazard(data) {
        let lat = data.lat !== undefined && data.lat !== null ? parseFloat(data.lat) : null;
        let lng = data.lng !== undefined && data.lng !== null ? parseFloat(data.lng) : null;
        let hasGps = !!(lat && lng);

        // Fallback: If no GPS attached, attempt using live ride coords or approximate city center
        if (!hasGps) {
            if (window.rideGuardian && window.rideGuardian.lastValidPosition) {
                lat = window.rideGuardian.lastValidPosition.coords.latitude;
                lng = window.rideGuardian.lastValidPosition.coords.longitude;
                hasGps = true;
            } else {
                // Approximate coordinate offset around demonstration center (Pune)
                lat = 18.5204 + (Math.random() - 0.5) * 0.02;
                lng = 73.8567 + (Math.random() - 0.5) * 0.02;
                hasGps = false; // Flagged as approximate
            }
        }

        const newHazard = {
            id: 'hz-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            category: data.category || 'OTHER',
            categoryLabel: this._getCategoryLabel(data.category),
            title: (data.title || 'Road Hazard').trim(),
            description: (data.description || '').trim(),
            severity: data.severity || 'MEDIUM',
            locationName: (data.locationName || 'Unspecified Location').trim(),
            lat: lat,
            lng: lng,
            hasGps: hasGps,
            reportedAt: new Date().toISOString(),
            status: 'ACTIVE',
            isSample: false
        };

        this.hazards.unshift(newHazard);
        this._saveHazards();
        this.renderMapMarkers();

        if (this.onStateChange) this.onStateChange(this.getHazards());
        return newHazard;
    }

    markResolved(id) {
        const item = this.hazards.find(h => h.id === id);
        if (item) {
            item.status = 'RESOLVED';
            item.resolvedAt = new Date().toISOString();
            this._saveHazards();
            this.renderMapMarkers();
            if (this.onStateChange) this.onStateChange(this.getHazards());
            return true;
        }
        return false;
    }

    deleteHazard(id) {
        this.hazards = this.hazards.filter(h => h.id !== id);
        this._saveHazards();
        this.renderMapMarkers();
        if (this.onStateChange) this.onStateChange(this.getHazards());
    }

    _getCategoryLabel(cat) {
        const map = {
            'POTHOLE': 'Pothole or Damaged Road',
            'WATERLOGGING': 'Waterlogging or Flooding',
            'GRAVEL': 'Loose Gravel or Debris',
            'OIL_SPILL': 'Oil Spill or Slippery Surface',
            'ACCIDENT': 'Accident or Obstruction',
            'OTHER': 'Other Road Hazard'
        };
        return map[cat] || 'Road Hazard';
    }

    initMap(containerId = 'hazard-map') {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Check if Leaflet is loaded
        if (typeof L === 'undefined') {
            this.mapLoadError = true;
            container.innerHTML = `
                <div class="map-fallback-banner">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                        <line x1="8" y1="2" x2="8" y2="18"></line>
                        <line x1="16" y1="6" x2="16" y2="22"></line>
                    </svg>
                    <h4>Interactive Map Offline / Restricted</h4>
                    <p>Leaflet library could not be loaded. All reported road hazards remain fully accessible in the cards below.</p>
                </div>
            `;
            return;
        }

        try {
            if (this.map) {
                this.map.remove();
                this.map = null;
            }

            // Default center around user position or first hazard
            let initialCenter = [18.5204, 73.8567];
            if (window.rideGuardian && window.rideGuardian.lastValidPosition) {
                initialCenter = [
                    window.rideGuardian.lastValidPosition.coords.latitude,
                    window.rideGuardian.lastValidPosition.coords.longitude
                ];
            } else if (this.hazards.length > 0 && this.hazards[0].lat && this.hazards[0].lng) {
                initialCenter = [this.hazards[0].lat, this.hazards[0].lng];
            }

            this.map = L.map(containerId, {
                center: initialCenter,
                zoom: 13,
                attributionControl: false
            });

            // Standard OpenStreetMap Tile Layer (100% Free, Public, Zero API Key Required)
            const osmTiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            });

            osmTiles.on('tileerror', () => {
                if (!this.tileLoadError) {
                    this.tileLoadError = true;
                    console.warn('[Hazards Map] OpenStreetMap tiles offline or unreachable. Markers remain plotted on coordinate plane.');
                    const badge = document.getElementById('map-offline-badge');
                    if (badge) badge.style.display = 'inline-flex';
                }
            });

            osmTiles.addTo(this.map);

            this.markersGroup = L.layerGroup().addTo(this.map);
            this.mapInitialized = true;
            this.mapLoadError = false;

            this.renderMapMarkers();

            // Refresh map dimensions to account for CSS display / flex transitions
            setTimeout(() => {
                if (this.map) this.map.invalidateSize();
            }, 100);
            setTimeout(() => {
                if (this.map) this.map.invalidateSize();
            }, 350);

        } catch (e) {
            console.error('[Hazards] Failed to initialize Leaflet map:', e);
            this.mapLoadError = true;
        }
    }

    renderMapMarkers() {
        if (!this.map || !this.markersGroup) return;

        this.markersGroup.clearLayers();
        this.markersById = {};
        const filteredHazards = this.getHazards(true);

        const bounds = [];

        filteredHazards.forEach(hz => {
            if (hz.lat && hz.lng && !isNaN(hz.lat) && !isNaN(hz.lng)) {
                const color = hz.severity === 'HIGH' ? '#EF4444' : (hz.severity === 'MEDIUM' ? '#F59E0B' : '#10B981');
                const isResolved = hz.status === 'RESOLVED';

                // Custom SVG Circle Marker (fixed corrupted unicode checkmark)
                const customIcon = L.divIcon({
                    className: 'custom-hazard-marker',
                    html: `
                        <div style="
                            background-color: ${isResolved ? '#64748B' : color};
                            width: 24px;
                            height: 24px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 0 10px ${isResolved ? 'transparent' : color};
                            border: 2px solid #0F172A;
                            color: white;
                            font-size: 11px;
                            font-weight: bold;
                        ">
                            ${isResolved ? '✓' : '!'}
                        </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                const marker = L.marker([hz.lat, hz.lng], { icon: customIcon });

                const popupHtml = `
                    <div style="font-family: inherit; color: #0F172A; max-width: 230px; font-size: 12px;">
                        <strong style="color: ${isResolved ? '#64748B' : color}; font-size: 13px; display: block; margin-bottom: 3px;">
                            ${hz.title}
                        </strong>
                        <div style="margin: 4px 0; color: #475569; line-height: 1.4;">
                            <strong>Category:</strong> ${hz.categoryLabel}<br>
                            <strong>Severity:</strong> <span style="font-weight:bold; color:${color};">${hz.severity}</span><br>
                            <strong>Location:</strong> ${hz.locationName}
                        </div>
                        <p style="margin: 4px 0; line-height: 1.3;">${hz.description}</p>
                        ${hz.isSample ? '<div style="font-size: 10px; color: #94A3B8; font-style: italic; margin-top: 4px;">[Demo Sample Report]</div>' : ''}
                    </div>
                `;

                marker.bindPopup(popupHtml);
                this.markersGroup.addLayer(marker);
                this.markersById[hz.id] = marker;
                bounds.push([hz.lat, hz.lng]);
            }
        });

        // Fit map bounds safely
        if (bounds.length === 1 && this.map) {
            try {
                this.map.setView(bounds[0], 14);
            } catch (e) {}
        } else if (bounds.length > 1 && this.map) {
            try {
                this.map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
            } catch (e) {}
        }
    }

    focusHazard(id) {
        const hz = this.hazards.find(h => h.id === id);
        if (hz && hz.lat && hz.lng && this.map) {
            try {
                this.map.setView([hz.lat, hz.lng], 15, { animate: true });
                const marker = this.markersById[id];
                if (marker) {
                    setTimeout(() => marker.openPopup(), 250);
                }
            } catch (e) {}
        }
    }
}

// Global hazard radar instance
window.hazardRadar = new HazardRadarController();
