/**
 * RideSafe AI - Audio & Haptic Alerts Module
 * Synthesizes audio feedback using the standard Web Audio API.
 * Requires zero external audio files. 100% offline compatible.
 */

class SafetyAudioController {
    constructor() {
        this.audioCtx = null;
        this.soundEnabled = true;
        this.vibrationEnabled = true;
        this.lastSpeedBeep = 0;
    }

    _initAudioContext() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = !!enabled;
    }

    setVibrationEnabled(enabled) {
        this.vibrationEnabled = !!enabled;
    }

    /**
     * Subtle UI interaction click/beep
     */
    playBeep(freq = 600, duration = 0.08, type = 'sine') {
        if (!this.soundEnabled) return;
        try {
            this._initAudioContext();
            if (!this.audioCtx) return;

            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('[Audio] Could not play beep:', e);
        }
    }

    /**
     * Overspeed warning alert (alternating two-tone pulsed beep)
     * Throttled so it doesn't blast continuously every millisecond.
     */
    playOverspeedAlert() {
        const now = Date.now();
        if (now - this.lastSpeedBeep < 2200) return; // rate limit to every 2.2 seconds
        this.lastSpeedBeep = now;

        if (this.vibrationEnabled && 'vibrate' in navigator) {
            try {
                navigator.vibrate([200, 100, 200]);
            } catch (e) {
                // Ignore vibration restrictions
            }
        }

        if (!this.soundEnabled) return;

        try {
            this._initAudioContext();
            if (!this.audioCtx) return;

            const t = this.audioCtx.currentTime;
            
            // First beep: 880Hz (A5)
            const osc1 = this.audioCtx.createOscillator();
            const gain1 = this.audioCtx.createGain();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(880, t);
            gain1.gain.setValueAtTime(0.12, t);
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            osc1.connect(gain1);
            gain1.connect(this.audioCtx.destination);
            osc1.start(t);
            osc1.stop(t + 0.18);

            // Second beep: 1046Hz (C6)
            const osc2 = this.audioCtx.createOscillator();
            const gain2 = this.audioCtx.createGain();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(1046, t + 0.22);
            gain2.gain.setValueAtTime(0.15, t + 0.22);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
            osc2.connect(gain2);
            gain2.connect(this.audioCtx.destination);
            osc2.start(t + 0.22);
            osc2.stop(t + 0.45);

        } catch (e) {
            console.warn('[Audio] Overspeed sound error:', e);
        }
    }

    /**
     * SOS Urgent Alert Sound (Distinct descending siren)
     */
    playSosAlert() {
        if (this.vibrationEnabled && 'vibrate' in navigator) {
            try {
                navigator.vibrate([400, 150, 400, 150, 800]);
            } catch (e) {}
        }

        if (!this.soundEnabled) return;

        try {
            this._initAudioContext();
            if (!this.audioCtx) return;

            const t = this.audioCtx.currentTime;
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(950, t);
            osc.frequency.linearRampToValueAtTime(400, t + 0.6);

            gain.gain.setValueAtTime(0.2, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start(t);
            osc.stop(t + 0.6);
        } catch (e) {
            console.warn('[Audio] SOS sound error:', e);
        }
    }

    /**
     * Safe Arrival Reminder / Chime (Pleasant confirmation chime)
     */
    playSuccessChime() {
        if (!this.soundEnabled) return;
        try {
            this._initAudioContext();
            if (!this.audioCtx) return;

            const t = this.audioCtx.currentTime;
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + i * 0.1);
                gain.gain.setValueAtTime(0.12, t + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.25);
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(t + i * 0.1);
                osc.stop(t + i * 0.1 + 0.25);
            });
        } catch (e) {}
    }
}

// Global safety audio instance
window.safetyAudio = new SafetyAudioController();
