/**
 * RideSafe AI - SOS & Safe Arrival Module
 * Manages emergency contact setup, safety SOS trigger with confirmation,
 * location link generation, multi-channel sharing, and Safe Arrival countdown.
 */

class EmergencyController {
    constructor() {
        // Saved emergency contact
        this.contactName = localStorage.getItem('ridesafe_sos_name') || '';
        this.contactPhone = localStorage.getItem('ridesafe_sos_phone') || '';
        this.contactRelation = localStorage.getItem('ridesafe_sos_relation') || 'Family / Friend';

        // Safe Arrival state
        this.safeArrivalActive = false;
        this.safeArrivalDestination = localStorage.getItem('ridesafe_last_dest') || '';
        this.safeArrivalDurationMinutes = parseInt(localStorage.getItem('ridesafe_last_timer') || '30', 10);
        this.safeArrivalRemainingSeconds = 0;
        this.safeArrivalInterval = null;
        this.isOverdue = false;

        // Last SOS incident draft
        this.lastSosMessage = '';
        this.lastSosLink = '';

        // Callback for UI updates
        this.onStateChange = null;
    }

    saveContact(name, phone, relation) {
        this.contactName = (name || '').trim();
        this.contactPhone = (phone || '').replace(/[^0-9+]/g, '').trim();
        this.contactRelation = (relation || 'Family / Friend').trim();

        localStorage.setItem('ridesafe_sos_name', this.contactName);
        localStorage.setItem('ridesafe_sos_phone', this.contactPhone);
        localStorage.setItem('ridesafe_sos_relation', this.contactRelation);

        if (this.onStateChange) this.onStateChange(this.getState());
        return { success: true };
    }

    getState() {
        return {
            contactName: this.contactName,
            contactPhone: this.contactPhone,
            contactRelation: this.contactRelation,
            hasContact: !!(this.contactName && this.contactPhone),
            safeArrivalActive: this.safeArrivalActive,
            safeArrivalDestination: this.safeArrivalDestination,
            safeArrivalDurationMinutes: this.safeArrivalDurationMinutes,
            safeArrivalRemainingSeconds: this.safeArrivalRemainingSeconds,
            isOverdue: this.isOverdue,
            lastSosMessage: this.lastSosMessage,
            lastSosLink: this.lastSosLink
        };
    }

    /**
     * Prepares emergency message with best available GPS coordinates
     */
    async generateEmergencyMessage() {
        let lat = null;
        let lng = null;
        let accuracy = null;

        // Try getting live coords from Ride Guardian or Geolocation
        if (window.rideGuardian && window.rideGuardian.lastValidPosition) {
            lat = window.rideGuardian.lastValidPosition.coords.latitude;
            lng = window.rideGuardian.lastValidPosition.coords.longitude;
            accuracy = Math.round(window.rideGuardian.lastValidPosition.coords.accuracy);
        } else if ('geolocation' in navigator) {
            try {
                const pos = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 10000
                    });
                });
                lat = pos.coords.latitude;
                lng = pos.coords.longitude;
                accuracy = Math.round(pos.coords.accuracy);
            } catch (err) {
                console.warn('[SOS] Could not fetch fresh GPS fix:', err.message);
            }
        }

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = new Date().toLocaleDateString();

        let locationSection = '';
        let mapUrl = '';

        if (lat !== null && lng !== null) {
            mapUrl = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
            locationSection = `\n📍 LIVE GPS LOCATION:\n${mapUrl}\n(Estimated accuracy: ±${accuracy || 10}m)`;
        } else {
            locationSection = `\n📍 LOCATION: GPS signal was unavailable at the time of SOS dispatch. Please call rider immediately!`;
        }

        const message = `🚨 EMERGENCY ALERT — RideSafe AI 🚨\n` +
            `Rider: ${this.contactName ? 'Message for ' + this.contactName : 'Urgent Emergency'}\n` +
            `I am riding a motorcycle and require immediate assistance or safety check-in.\n` +
            `Time: ${dateStr} ${timeStr}` +
            `${locationSection}\n\n` +
            `Sent via RideSafe AI Rider Safety Companion.`;

        this.lastSosMessage = message;
        this.lastSosLink = mapUrl;

        if (window.safetyAudio) {
            window.safetyAudio.playSosAlert();
        }

        return {
            message,
            mapUrl,
            phone: this.contactPhone,
            name: this.contactName
        };
    }

    /**
     * Trigger sharing via Web Share API, SMS, or WhatsApp
     */
    async shareEmergency(channel = 'native') {
        const payload = await this.generateEmergencyMessage();
        const text = payload.message;
        const phone = payload.phone;

        if (channel === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: '🚨 RideSafe AI Emergency Alert',
                    text: text
                });
                return { success: true, method: 'share_api' };
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.warn('[SOS Share] Fallback from native share:', e);
                }
            }
        }

        if (channel === 'whatsapp') {
            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const waUrl = cleanPhone 
                ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
                : `https://wa.me/?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            return { success: true, method: 'whatsapp' };
        }

        if (channel === 'sms') {
            const cleanPhone = phone ? phone : '';
            // iOS and Android sms URI support
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            const separator = isIOS ? '&' : '?';
            const smsUrl = `sms:${cleanPhone}${separator}body=${encodeURIComponent(text)}`;
            window.location.href = smsUrl;
            return { success: true, method: 'sms' };
        }

        // Default clipboard copy fallback
        return this.copyMessageToClipboard(text);
    }

    async copyMessageToClipboard(text) {
        const content = text || this.lastSosMessage;
        if (!content) return { success: false, error: 'No message to copy' };

        try {
            await navigator.clipboard.writeText(content);
            return { success: true, method: 'clipboard' };
        } catch (e) {
            // Textarea fallback
            const ta = document.createElement('textarea');
            ta.value = content;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            return { success: true, method: 'clipboard_fallback' };
        }
    }

    /**
     * Start Safe Arrival timer
     */
    startSafeArrival(destination, minutes) {
        this.safeArrivalDestination = (destination || 'Destination').trim();
        this.safeArrivalDurationMinutes = Math.max(5, Math.min(240, parseInt(minutes, 10) || 30));
        this.safeArrivalRemainingSeconds = this.safeArrivalDurationMinutes * 60;
        this.safeArrivalActive = true;
        this.isOverdue = false;

        localStorage.setItem('ridesafe_last_dest', this.safeArrivalDestination);
        localStorage.setItem('ridesafe_last_timer', this.safeArrivalDurationMinutes.toString());

        if (this.safeArrivalInterval) clearInterval(this.safeArrivalInterval);

        this.safeArrivalInterval = setInterval(() => {
            if (this.safeArrivalRemainingSeconds > 0) {
                this.safeArrivalRemainingSeconds--;
            } else {
                // Timer elapsed!
                if (!this.isOverdue) {
                    this.isOverdue = true;
                    if (window.safetyAudio) window.safetyAudio.playSosAlert();
                }
            }

            if (this.onStateChange) this.onStateChange(this.getState());
        }, 1000);

        if (this.onStateChange) this.onStateChange(this.getState());
    }

    /**
     * Confirms safe arrival and clears timer
     */
    confirmSafeArrival() {
        if (this.safeArrivalInterval) {
            clearInterval(this.safeArrivalInterval);
            this.safeArrivalInterval = null;
        }
        this.safeArrivalActive = false;
        this.isOverdue = false;
        this.safeArrivalRemainingSeconds = 0;

        if (window.safetyAudio) {
            window.safetyAudio.playSuccessChime();
        }

        if (this.onStateChange) this.onStateChange(this.getState());
        return { success: true, destination: this.safeArrivalDestination };
    }

    cancelSafeArrival() {
        if (this.safeArrivalInterval) {
            clearInterval(this.safeArrivalInterval);
            this.safeArrivalInterval = null;
        }
        this.safeArrivalActive = false;
        this.isOverdue = false;
        this.safeArrivalRemainingSeconds = 0;

        if (this.onStateChange) this.onStateChange(this.getState());
    }
}

// Global Emergency Controller instance
window.emergencyController = new EmergencyController();
