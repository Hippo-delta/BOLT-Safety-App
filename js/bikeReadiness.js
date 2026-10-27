/**
 * RideSafe AI - Bike Readiness & Pre-Ride Checklist Module
 * Computes readiness scores, manages pre-ride inspections,
 * bike profiles, and scheduled maintenance logs in LocalStorage.
 */

class BikeReadinessController {
    constructor() {
        this.storageKeyChecklist = 'ridesafe_bike_checklist_v1';
        this.storageKeyProfile = 'ridesafe_bike_profile_v1';
        this.storageKeyMaintenance = 'ridesafe_bike_maintenance_v1';

        this.checklist = this._loadChecklist();
        this.profile = this._loadProfile();
        this.maintenance = this._loadMaintenance();

        this.onStateChange = null;
    }

    _getDefaultChecklist() {
        return [
            {
                id: 'chk-tyres',
                label: 'Tyres & Cold Pressure',
                desc: 'Check tread depth, cuts, embedded nails, and manufacturer cold tyre PSI.',
                status: 'PASSED' // 'PASSED' | 'ATTENTION' | 'UNCHECKED'
            },
            {
                id: 'chk-brakes',
                label: 'Front & Rear Brakes',
                desc: 'Firm lever resistance without sponginess; check brake fluid reservoir levels.',
                status: 'PASSED'
            },
            {
                id: 'chk-lights',
                label: 'Headlights & Turn Signals',
                desc: 'High/low beam, hazard flashers, brake lights, and indicator operation.',
                status: 'PASSED'
            },
            {
                id: 'chk-mirrors',
                label: 'Rearview Mirrors',
                desc: 'Firmly secured, clean glass, adjusted for seated riding posture.',
                status: 'PASSED'
            },
            {
                id: 'chk-helmet',
                label: 'Helmet & Retention Strap',
                desc: 'Certified helmet (DOT/ECE/ISI) with clear scratch-free visor and fastened strap.',
                status: 'PASSED'
            },
            {
                id: 'chk-fuel',
                label: 'Fuel Level / Battery SOC',
                desc: 'Sufficient fuel or battery charge for the intended journey with safety reserve.',
                status: 'PASSED'
            },
            {
                id: 'chk-leaks',
                label: 'Fluid Leaks & Visible Damage',
                desc: 'Inspect under engine for oil, coolant, or fork seal weeping and loose bolts.',
                status: 'UNCHECKED'
            },
            {
                id: 'chk-chain',
                label: 'Chain Slack & Lubrication',
                desc: '25-30mm vertical chain play; ensure rollers are clean and properly lubricated.',
                status: 'UNCHECKED'
            }
        ];
    }

    _loadChecklist() {
        try {
            const raw = localStorage.getItem(this.storageKeyChecklist);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.warn('[Bike] Error loading checklist from LocalStorage:', e);
        }
        return this._getDefaultChecklist();
    }

    _saveChecklist() {
        try {
            localStorage.setItem(this.storageKeyChecklist, JSON.stringify(this.checklist));
        } catch (e) {}
    }

    _loadProfile() {
        try {
            const raw = localStorage.getItem(this.storageKeyProfile);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return {
            bikeName: 'KTM Duke 250 / Yamaha MT-15',
            regNumber: 'MH-12-RS-2026',
            odometerKm: '12,450',
            lastServiceDate: '2026-08-15',
            notes: 'Next scheduled oil change due at 15,000 km.'
        };
    }

    _saveProfile() {
        try {
            localStorage.setItem(this.storageKeyProfile, JSON.stringify(this.profile));
        } catch (e) {}
    }

    _loadMaintenance() {
        try {
            const raw = localStorage.getItem(this.storageKeyMaintenance);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return [
            {
                id: 'm-1',
                task: 'Engine Oil & Filter Replacement',
                interval: 'Every 5,000 km or 6 months',
                lastDone: '10,000 km (Done)',
                status: 'GOOD'
            },
            {
                id: 'm-2',
                task: 'Drive Chain Cleaning & Lube',
                interval: 'Every 500 km',
                lastDone: '400 km ago',
                status: 'DUE_SOON'
            },
            {
                id: 'm-3',
                task: 'Brake Fluid & Pad Wear Check',
                interval: 'Every 10,000 km or 1 year',
                lastDone: '10,000 km (Done)',
                status: 'GOOD'
            },
            {
                id: 'm-4',
                task: 'Tyre Tread Depth Inspection',
                interval: 'Monthly check (min 2mm)',
                lastDone: 'Last week',
                status: 'GOOD'
            }
        ];
    }

    _saveMaintenance() {
        try {
            localStorage.setItem(this.storageKeyMaintenance, JSON.stringify(this.maintenance));
        } catch (e) {}
    }

    setItemStatus(itemId, status) {
        const item = this.checklist.find(i => i.id === itemId);
        if (item) {
            item.status = status; // 'PASSED', 'ATTENTION', 'UNCHECKED'
            this._saveChecklist();
            if (this.onStateChange) this.onStateChange(this.getSummary());
        }
    }

    resetChecklist() {
        this.checklist.forEach(item => {
            item.status = 'UNCHECKED';
        });
        this._saveChecklist();
        if (this.onStateChange) this.onStateChange(this.getSummary());
    }

    markAllPassed() {
        this.checklist.forEach(item => {
            item.status = 'PASSED';
        });
        this._saveChecklist();
        if (this.onStateChange) this.onStateChange(this.getSummary());
    }

    saveProfile(data) {
        this.profile = {
            bikeName: (data.bikeName || '').trim(),
            regNumber: (data.regNumber || '').trim(),
            odometerKm: (data.odometerKm || '').trim(),
            lastServiceDate: (data.lastServiceDate || '').trim(),
            notes: (data.notes || '').trim()
        };
        this._saveProfile();
        if (this.onStateChange) this.onStateChange(this.getSummary());
    }

    getSummary() {
        const total = this.checklist.length;
        const passedCount = this.checklist.filter(i => i.status === 'PASSED').length;
        const attentionCount = this.checklist.filter(i => i.status === 'ATTENTION').length;
        const uncheckedCount = this.checklist.filter(i => i.status === 'UNCHECKED').length;

        const percentage = Math.round((passedCount / total) * 100);

        let overallStatus = 'INCOMPLETE';
        let statusBadgeClass = 'badge-incomplete';
        let statusText = 'Incomplete Checklist';

        if (attentionCount > 0) {
            overallStatus = 'NEEDS_ATTENTION';
            statusBadgeClass = 'badge-attention';
            statusText = 'Needs Attention';
        } else if (uncheckedCount === 0 && passedCount === total) {
            overallStatus = 'READY_FOR_REVIEW';
            statusBadgeClass = 'badge-ready';
            statusText = 'Ready for Review';
        } else {
            overallStatus = 'INCOMPLETE';
            statusBadgeClass = 'badge-incomplete';
            statusText = 'Incomplete';
        }

        return {
            total,
            passedCount,
            attentionCount,
            uncheckedCount,
            percentage,
            overallStatus,
            statusBadgeClass,
            statusText,
            checklist: this.checklist,
            profile: this.profile,
            maintenance: this.maintenance
        };
    }
}

// Global bike readiness instance
window.bikeReadiness = new BikeReadinessController();
