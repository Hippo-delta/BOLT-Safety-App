/**
 * RideSafe AI - Core Application Coordinator (app.js)
 * Coordinates UI navigation, views, event listeners, toasts, modals,
 * and state synchronization across all modules.
 */

(function () {
    'use strict';

    // State helper
    let currentAttachedGps = null;

    // DOM Elements cache
    const DOM = {};

    function cacheDom() {
        // Navigation
        DOM.navPills = document.querySelectorAll('.nav-pill');
        DOM.bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        DOM.viewSections = document.querySelectorAll('.view-section');
        DOM.audioToggleBtn = document.getElementById('audio-toggle-btn');
        DOM.brandLogoBtn = document.getElementById('brand-logo-btn');

        // Banners
        DOM.overspeedBanner = document.getElementById('overspeed-banner');
        DOM.overspeedLimitTxt = document.getElementById('overspeed-limit-txt');
        DOM.breakBanner = document.getElementById('break-banner');
        DOM.breakTimeTxt = document.getElementById('break-time-txt');
        DOM.dismissBreakBtn = document.getElementById('dismiss-break-btn');

        // Dashboard widgets
        DOM.dashGpsBadge = document.getElementById('dash-gps-badge');
        DOM.dashSpeedVal = document.getElementById('dash-speed-val');
        DOM.dashTimeVal = document.getElementById('dash-time-val');
        DOM.dashDistVal = document.getElementById('dash-dist-val');
        DOM.dashLimitVal = document.getElementById('dash-limit-val');
        DOM.dashToggleRideBtn = document.getElementById('dash-toggle-ride-btn');
        DOM.dashBikeBadge = document.getElementById('dash-bike-badge');
        DOM.dashBikePct = document.getElementById('dash-bike-pct');
        DOM.dashBikeBar = document.getElementById('dash-bike-bar');
        DOM.dashSosContactBadge = document.getElementById('dash-sos-contact-badge');
        DOM.dashContactSummary = document.getElementById('dash-contact-summary');
        DOM.dashHazardCountBadge = document.getElementById('dash-hazard-count-badge');
        DOM.dashHazardPreview = document.getElementById('dash-hazard-preview');
        DOM.dashArrivalBadge = document.getElementById('dash-arrival-badge');
        DOM.dashArrivalTimerVal = document.getElementById('dash-arrival-timer-val');
        DOM.activityFeedList = document.getElementById('activity-feed-list');

        // Ride Guardian View
        DOM.simModeToggle = document.getElementById('sim-mode-toggle');
        DOM.speedometerContainer = document.getElementById('speedometer-container');
        DOM.guardianGpsBadge = document.getElementById('guardian-gps-badge');
        DOM.speedDial = document.getElementById('speed-dial');
        DOM.guardianSpeedNum = document.getElementById('guardian-speed-num');
        DOM.guardianStatusCaption = document.getElementById('guardian-status-caption');
        DOM.guardianRideBtn = document.getElementById('guardian-ride-btn');
        DOM.guardianGpsMsg = document.getElementById('guardian-gps-msg');
        DOM.guardianTimeVal = document.getElementById('guardian-time-val');
        DOM.guardianDistVal = document.getElementById('guardian-dist-val');
        DOM.guardianAccVal = document.getElementById('guardian-acc-val');
        DOM.guardianBreakDisplay = document.getElementById('guardian-break-display');
        DOM.speedSlider = document.getElementById('speed-slider');
        DOM.speedSliderVal = document.getElementById('speed-slider-val');
        DOM.breakSelect = document.getElementById('break-select');

        // SOS & Safe Arrival View
        DOM.sosTriggerBtn = document.getElementById('sos-trigger-btn');
        DOM.sosShareWa = document.getElementById('sos-share-wa');
        DOM.sosShareSms = document.getElementById('sos-share-sms');
        DOM.sosShareCopy = document.getElementById('sos-share-copy');
        DOM.editContactBtn = document.getElementById('edit-contact-btn');
        DOM.contactNameTxt = document.getElementById('contact-name-txt');
        DOM.contactPhoneTxt = document.getElementById('contact-phone-txt');
        DOM.contactRelationBadge = document.getElementById('contact-relation-badge');

        DOM.activeArrivalTimerSection = document.getElementById('active-arrival-timer-section');
        DOM.setupArrivalTimerSection = document.getElementById('setup-arrival-timer-section');
        DOM.arrivalDestLabel = document.getElementById('arrival-dest-label');
        DOM.arrivalCountdownClock = document.getElementById('arrival-countdown-clock');
        DOM.confirmArrivalBtn = document.getElementById('confirm-arrival-btn');
        DOM.cancelArrivalBtn = document.getElementById('cancel-arrival-btn');
        DOM.overdueWarningBox = document.getElementById('overdue-warning-box');
        DOM.sendOverdueSosBtn = document.getElementById('send-overdue-sos-btn');
        DOM.arrivalDestInput = document.getElementById('arrival-dest-input');
        DOM.arrivalDurationSelect = document.getElementById('arrival-duration-select');
        DOM.startArrivalBtn = document.getElementById('start-arrival-btn');

        // Hazards View
        DOM.filterCat = document.getElementById('filter-cat');
        DOM.filterSev = document.getElementById('filter-sev');
        DOM.filterStatus = document.getElementById('filter-status');
        DOM.openReportHazardModalBtn = document.getElementById('open-report-hazard-modal-btn');
        DOM.hazardsCountTxt = document.getElementById('hazards-count-txt');
        DOM.hazardsCardsContainer = document.getElementById('hazards-cards-container');

        // Bike View
        DOM.bikeScoreCircle = document.getElementById('bike-score-circle');
        DOM.bikeSummaryBadge = document.getElementById('bike-summary-badge');
        DOM.chkMarkAllBtn = document.getElementById('chk-mark-all-btn');
        DOM.chkResetBtn = document.getElementById('chk-reset-btn');
        DOM.checklistContainer = document.getElementById('checklist-container');
        DOM.editBikeProfileBtn = document.getElementById('edit-bike-profile-btn');
        DOM.bikeNameTxt = document.getElementById('bike-name-txt');
        DOM.bikeRegTxt = document.getElementById('bike-reg-txt');
        DOM.bikeOdoTxt = document.getElementById('bike-odo-txt');
        DOM.bikeServiceTxt = document.getElementById('bike-service-txt');
        DOM.bikeNotesTxt = document.getElementById('bike-notes-txt');
        DOM.maintenanceTableBody = document.getElementById('maintenance-table-body');

        // Modals
        DOM.modalSosConfirm = document.getElementById('modal-sos-confirm');
        DOM.sosPreviewText = document.getElementById('sos-preview-text');
        DOM.confirmSosDispatchBtn = document.getElementById('confirm-sos-dispatch-btn');
        DOM.cancelSosModalBtn = document.getElementById('cancel-sos-modal-btn');

        DOM.modalEditContact = document.getElementById('modal-edit-contact');
        DOM.formEmergencyContact = document.getElementById('form-emergency-contact');
        DOM.inputContactName = document.getElementById('input-contact-name');
        DOM.inputContactPhone = document.getElementById('input-contact-phone');
        DOM.inputContactRelation = document.getElementById('input-contact-relation');

        DOM.modalReportHazard = document.getElementById('modal-report-hazard');
        DOM.formReportHazard = document.getElementById('form-report-hazard');
        DOM.hzCategory = document.getElementById('hz-category');
        DOM.hzTitle = document.getElementById('hz-title');
        DOM.hzSeverity = document.getElementById('hz-severity');
        DOM.hzLocation = document.getElementById('hz-location');
        DOM.hzDesc = document.getElementById('hz-desc');
        DOM.hzGpsStatusTxt = document.getElementById('hz-gps-status-txt');
        DOM.hzAttachGpsBtn = document.getElementById('hz-attach-gps-btn');

        DOM.modalEditBike = document.getElementById('modal-edit-bike');
        DOM.formBikeProfile = document.getElementById('form-bike-profile');
        DOM.inputBikeName = document.getElementById('input-bike-name');
        DOM.inputBikeReg = document.getElementById('input-bike-reg');
        DOM.inputBikeOdo = document.getElementById('input-bike-odo');
        DOM.inputBikeService = document.getElementById('input-bike-service');
        DOM.inputBikeNotes = document.getElementById('input-bike-notes');

        // Toast Container
        DOM.toastContainer = document.getElementById('toast-container');
    }

    // =========================================================================
    // Utilities: Toast & Activity Log
    // =========================================================================
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E676" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else if (type === 'danger') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        } else {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }

        toast.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
        DOM.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3400);
    }

    function addActivity(text, type = 'normal') {
        if (!DOM.activityFeedList) return;
        const li = document.createElement('li');
        li.className = `feed-item ${type === 'warn' ? 'feed-warn' : (type === 'alert' ? 'feed-alert' : '')}`;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        li.innerHTML = `<span>${escapeHtml(text)}</span><span class="feed-time">${timeStr}</span>`;
        DOM.activityFeedList.insertBefore(li, DOM.activityFeedList.firstChild);

        while (DOM.activityFeedList.children.length > 8) {
            DOM.activityFeedList.removeChild(DOM.activityFeedList.lastChild);
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        if (hrs > 0) {
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // =========================================================================
    // Navigation Coordinator
    // =========================================================================
    function switchView(targetViewId) {
        DOM.viewSections.forEach(section => {
            section.classList.toggle('active-view', section.id === `view-${targetViewId}`);
        });

        DOM.navPills.forEach(pill => {
            pill.classList.toggle('active', pill.dataset.nav === targetViewId);
        });

        DOM.bottomNavItems.forEach(item => {
            item.classList.toggle('active', item.dataset.nav === targetViewId);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Reliable Map View Transition Handling
        if (targetViewId === 'hazards') {
            setTimeout(() => {
                if (window.hazardRadar) {
                    if (!window.hazardRadar.mapInitialized && !window.hazardRadar.mapLoadError) {
                        window.hazardRadar.initMap();
                    } else if (window.hazardRadar.map) {
                        window.hazardRadar.map.invalidateSize();
                        window.hazardRadar.renderMapMarkers();
                    }
                }
            }, 80);

            setTimeout(() => {
                if (window.hazardRadar && window.hazardRadar.map) {
                    window.hazardRadar.map.invalidateSize();
                }
            }, 300);
        }

        if (window.safetyAudio) {
            window.safetyAudio.playBeep(480, 0.05);
        }
    }

    // =========================================================================
    // Modals Management
    // =========================================================================
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    function bindModalEvents() {
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-close-modal');
                closeModal(modalId);
            });
        });

        document.querySelectorAll('.modal-backdrop').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });
    }

    // =========================================================================
    // Ride Guardian State & UI Sync
    // =========================================================================
    function updateGuardianUi(state) {
        // Speed Display
        const speedText = state.currentSpeed !== null ? state.currentSpeed : '--';
        DOM.dashSpeedVal.innerHTML = `${speedText}<span class="stat-unit">km/h</span>`;
        DOM.guardianSpeedNum.textContent = state.currentSpeed !== null ? state.currentSpeed : '0';

        // Time & Distance
        const timeFormatted = formatTime(state.tripSeconds);
        DOM.dashTimeVal.textContent = timeFormatted;
        DOM.guardianTimeVal.textContent = timeFormatted;

        const distFormatted = `${state.tripDistanceKm.toFixed(2)} km`;
        DOM.dashDistVal.innerHTML = `${state.tripDistanceKm.toFixed(2)}<span class="stat-unit">km</span>`;
        DOM.guardianDistVal.textContent = distFormatted;

        // Threshold & Break Displays
        DOM.dashLimitVal.innerHTML = `${state.speedThreshold}<span class="stat-unit">km/h</span>`;
        DOM.speedSliderVal.textContent = `${state.speedThreshold} km/h`;
        DOM.speedSlider.value = state.speedThreshold;
        DOM.overspeedLimitTxt.textContent = state.speedThreshold;
        DOM.guardianBreakDisplay.textContent = `${state.breakReminderMinutes} mins`;
        DOM.breakTimeTxt.textContent = state.breakReminderMinutes;

        // GPS Accuracy Badge & Info
        if (state.locationAccuracy !== null) {
            DOM.guardianAccVal.textContent = `±${state.locationAccuracy} m`;
        } else {
            DOM.guardianAccVal.textContent = state.isSimulating ? '±4 m (Demo)' : '--';
        }

        // GPS Status Badge classes
        let badgeClass = 'status-standby';
        let badgeText = 'GPS Standby';

        if (state.gpsStatus === 'active') {
            badgeClass = 'status-active';
            badgeText = `GPS Locked (±${state.locationAccuracy || 0}m)`;
            DOM.guardianGpsMsg.textContent = 'Live GPS telemetry active. Speed updates continuously.';
            DOM.guardianStatusCaption.textContent = state.currentSpeed > 0 ? 'CRUISING' : 'IDLE';
        } else if (state.gpsStatus === 'simulated') {
            badgeClass = 'status-simulated';
            badgeText = 'Simulator Mode';
            DOM.guardianGpsMsg.textContent = 'Simulated GPS feed active (demonstration profile).';
            DOM.guardianStatusCaption.textContent = state.currentSpeed > 0 ? 'SIM CRUISE' : 'SIM IDLE';
        } else if (state.gpsStatus === 'requesting') {
            badgeClass = 'status-warning';
            badgeText = 'Acquiring GPS...';
            DOM.guardianGpsMsg.textContent = 'Acquiring satellite fix. Please wait...';
            DOM.guardianStatusCaption.textContent = 'SEARCHING';
        } else if (state.gpsStatus === 'denied') {
            badgeClass = 'status-danger';
            badgeText = 'GPS Denied';
            DOM.guardianGpsMsg.textContent = state.gpsErrorMessage;
            DOM.guardianStatusCaption.textContent = 'DENIED';
        } else if (state.gpsStatus === 'unavailable') {
            badgeClass = 'status-warning';
            badgeText = 'GPS Unavailable';
            DOM.guardianGpsMsg.textContent = state.gpsErrorMessage;
            DOM.guardianStatusCaption.textContent = 'OFFLINE';
        } else {
            DOM.guardianGpsMsg.textContent = 'Press "Start Ride" to request location permission and activate live monitoring.';
            DOM.guardianStatusCaption.textContent = 'STOPPED';
        }

        DOM.dashGpsBadge.className = `status-pill ${badgeClass}`;
        DOM.dashGpsBadge.textContent = badgeText;
        DOM.guardianGpsBadge.className = `status-pill ${badgeClass}`;
        DOM.guardianGpsBadge.textContent = badgeText;

        // Ride Button State (Start vs Stop)
        if (state.isRiding) {
            DOM.dashToggleRideBtn.className = 'btn btn-danger';
            DOM.dashToggleRideBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="6" width="12" height="12"></rect></svg>
                <span>End Ride</span>
            `;
            DOM.guardianRideBtn.className = 'btn btn-danger';
            DOM.guardianRideBtn.textContent = 'End Ride Tracking';
        } else {
            DOM.dashToggleRideBtn.className = 'btn btn-primary';
            DOM.dashToggleRideBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                <span>Start Ride</span>
            `;
            DOM.guardianRideBtn.className = 'btn btn-primary';
            DOM.guardianRideBtn.textContent = 'Start Ride Tracking';
        }

        // Overspeed Visuals
        if (state.isOverspeed) {
            DOM.overspeedBanner.classList.add('visible');
            DOM.speedometerContainer.classList.add('overspeed-active');
            DOM.speedDial.classList.remove('gauge-green');
            DOM.speedDial.classList.add('gauge-red');
            DOM.guardianStatusCaption.textContent = 'OVERSPEED!';
            DOM.guardianStatusCaption.style.color = '#EF4444';
        } else {
            DOM.overspeedBanner.classList.remove('visible');
            DOM.speedometerContainer.classList.remove('overspeed-active');
            DOM.speedDial.classList.remove('gauge-red');
            if (state.isRiding) {
                DOM.speedDial.classList.add('gauge-green');
            } else {
                DOM.speedDial.classList.remove('gauge-green');
            }
            DOM.guardianStatusCaption.style.color = '';
        }

        // Break Reminder Visuals
        if (state.breakAlertTriggered) {
            DOM.breakBanner.classList.add('visible');
        } else {
            DOM.breakBanner.classList.remove('visible');
        }
    }

    // =========================================================================
    // SOS & Safe Arrival State & UI Sync
    // =========================================================================
    function updateEmergencyUi(state) {
        if (state.hasContact) {
            DOM.dashSosContactBadge.className = 'status-pill status-active';
            DOM.dashSosContactBadge.textContent = 'Ready';
            DOM.dashContactSummary.textContent = `${state.contactName} (${state.contactPhone})`;

            DOM.contactNameTxt.textContent = state.contactName;
            DOM.contactPhoneTxt.textContent = `${state.contactPhone} • ${state.contactRelation}`;
            DOM.contactRelationBadge.className = 'status-pill status-active';
            DOM.contactRelationBadge.textContent = state.contactRelation;
        } else {
            DOM.dashSosContactBadge.className = 'status-pill status-standby';
            DOM.dashSosContactBadge.textContent = 'No Contact';
            DOM.dashContactSummary.textContent = 'No emergency contact saved yet. Add one in SOS tab.';

            DOM.contactNameTxt.textContent = 'No Contact Assigned';
            DOM.contactPhoneTxt.textContent = 'Please enter a trusted family member or emergency number.';
            DOM.contactRelationBadge.className = 'status-pill status-standby';
            DOM.contactRelationBadge.textContent = 'Unset';
        }

        if (state.safeArrivalActive) {
            DOM.dashArrivalBadge.className = 'status-pill status-active';
            DOM.dashArrivalBadge.textContent = 'Monitoring';
            DOM.dashArrivalTimerVal.textContent = formatTime(state.safeArrivalRemainingSeconds);

            DOM.activeArrivalTimerSection.style.display = 'block';
            DOM.setupArrivalTimerSection.style.display = 'none';
            DOM.arrivalDestLabel.textContent = state.safeArrivalDestination;
            DOM.arrivalCountdownClock.textContent = formatTime(state.safeArrivalRemainingSeconds);

            if (state.isOverdue) {
                DOM.dashArrivalBadge.className = 'status-pill status-danger';
                DOM.dashArrivalBadge.textContent = 'Overdue';
                DOM.arrivalCountdownClock.classList.add('overdue-text');
                DOM.overdueWarningBox.style.display = 'block';
            } else {
                DOM.arrivalCountdownClock.classList.remove('overdue-text');
                DOM.overdueWarningBox.style.display = 'none';
            }
        } else {
            DOM.dashArrivalBadge.className = 'status-pill status-standby';
            DOM.dashArrivalBadge.textContent = 'Inactive';
            DOM.dashArrivalTimerVal.textContent = '--:--';

            DOM.activeArrivalTimerSection.style.display = 'none';
            DOM.setupArrivalTimerSection.style.display = 'block';
            DOM.overdueWarningBox.style.display = 'none';
        }
    }

    // =========================================================================
    // Hazard Radar State & UI Sync
    // =========================================================================
    function updateHazardsUi(hazards) {
        const activeCount = hazards.filter(h => h.status === 'ACTIVE').length;
        DOM.dashHazardCountBadge.textContent = `${activeCount} Active`;
        DOM.hazardsCountTxt.textContent = `Showing ${hazards.length} report${hazards.length === 1 ? '' : 's'}`;

        if (activeCount > 0) {
            const nearest = hazards.find(h => h.status === 'ACTIVE');
            DOM.dashHazardPreview.textContent = nearest 
                ? `Nearest: "${nearest.title}" (${nearest.severity} Risk)`
                : 'Review hazard map before ride.';
        } else {
            DOM.dashHazardPreview.textContent = 'No active hazards reported for current filters.';
        }

        // Render Cards List
        DOM.hazardsCardsContainer.innerHTML = '';
        if (hazards.length === 0) {
            DOM.hazardsCardsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; background: var(--bg-card); padding: 2rem; border-radius: var(--radius-md); text-align: center; color: var(--text-secondary); border: 1px dashed var(--border-subtle);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 0.5rem; color: var(--text-muted);"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <h4>No Road Hazards Found</h4>
                    <p style="font-size: 0.85rem; margin-top: 0.25rem;">No hazards match the active filter criteria. Tap "Report Hazard" to submit one.</p>
                </div>
            `;
            return;
        }

        hazards.forEach(hz => {
            const card = document.createElement('div');
            card.className = `hazard-card sev-${hz.severity} status-${hz.status}`;

            const formattedDate = new Date(hz.reportedAt).toLocaleDateString([], {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            card.innerHTML = `
                <div>
                    <div class="hazard-card-header">
                        <span class="hazard-type-badge sev-badge-${hz.severity}">${hz.categoryLabel}</span>
                        <span style="font-size: 0.72rem; font-weight: 700; color: ${hz.status === 'RESOLVED' ? '#64748B' : (hz.severity === 'HIGH' ? '#F87171' : '#FBBF24')}">
                            ${hz.status === 'RESOLVED' ? '✓ RESOLVED' : `${hz.severity} PRIORITY`}
                        </span>
                    </div>
                    <h4 class="hazard-card-title">${escapeHtml(hz.title)}</h4>
                    <div class="hazard-card-loc">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span>${escapeHtml(hz.locationName)}</span>
                        ${hz.hasGps === false ? '<span style="font-size:0.7rem; color:var(--text-muted); margin-left: auto;">(Text Report)</span>' : ''}
                    </div>
                    <p class="hazard-card-desc">${escapeHtml(hz.description || 'No additional remarks provided.')}</p>
                </div>

                <div class="hazard-card-footer">
                    <div>
                        <span>${formattedDate}</span>
                        ${hz.isSample ? '<span style="font-style: italic; color:#94A3B8; margin-left: 4px;">[Sample Demo]</span>' : ''}
                    </div>
                    <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-secondary btn-focus-hz" data-hz-id="${hz.id}" style="padding: 0.3rem 0.6rem; font-size: 0.72rem; min-height: 28px;">
                            📍 Focus Map
                        </button>
                        ${hz.status === 'ACTIVE' ? `
                            <button class="btn btn-secondary btn-resolve-hz" data-hz-id="${hz.id}" style="padding: 0.3rem 0.6rem; font-size: 0.72rem; min-height: 28px;">
                                Mark Resolved
                            </button>
                        ` : '<span style="font-size: 0.75rem; color:#64748B; align-self: center;">Resolved</span>'}
                    </div>
                </div>
            `;

            DOM.hazardsCardsContainer.appendChild(card);
        });

        // Bind Mark Resolved buttons
        document.querySelectorAll('.btn-resolve-hz').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-hz-id');
                if (window.hazardRadar && window.hazardRadar.markResolved(id)) {
                    showToast('Hazard marked as resolved. (Visible when status filter is set to All or Resolved)', 'success');
                    addActivity('Road hazard verified and marked resolved.');
                }
            });
        });

        // Bind Focus Map buttons
        document.querySelectorAll('.btn-focus-hz').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.getAttribute('data-hz-id');
                if (window.hazardRadar) {
                    window.hazardRadar.focusHazard(id);
                    const mapEl = document.getElementById('hazard-map');
                    if (mapEl) {
                        mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            });
        });
    }

    // =========================================================================
    // Bike Readiness State & UI Sync
    // =========================================================================
    function updateBikeUi(summary) {
        DOM.bikeScoreCircle.textContent = `${summary.percentage}%`;
        DOM.dashBikePct.textContent = `${summary.percentage}%`;
        DOM.dashBikeBar.style.width = `${summary.percentage}%`;

        if (summary.overallStatus === 'NEEDS_ATTENTION') {
            DOM.dashBikeBar.className = 'progress-bar bar-amber';
            DOM.bikeScoreCircle.style.borderColor = 'var(--amber-accent)';
            DOM.bikeScoreCircle.style.color = 'var(--amber-accent)';
        } else if (summary.overallStatus === 'READY_FOR_REVIEW') {
            DOM.dashBikeBar.className = 'progress-bar';
            DOM.bikeScoreCircle.style.borderColor = 'var(--green-accent)';
            DOM.bikeScoreCircle.style.color = 'var(--green-accent)';
        } else {
            DOM.dashBikeBar.className = 'progress-bar bar-red';
            DOM.bikeScoreCircle.style.borderColor = 'var(--text-muted)';
            DOM.bikeScoreCircle.style.color = 'var(--text-secondary)';
        }

        DOM.dashBikeBadge.className = `status-pill ${summary.statusBadgeClass}`;
        DOM.dashBikeBadge.textContent = summary.statusText;
        DOM.bikeSummaryBadge.className = `status-pill ${summary.statusBadgeClass}`;
        DOM.bikeSummaryBadge.textContent = summary.statusText;

        // Render Checklist Cards
        DOM.checklistContainer.innerHTML = '';
        summary.checklist.forEach(item => {
            const card = document.createElement('div');
            card.className = 'checklist-card';

            card.innerHTML = `
                <div>
                    <div class="chk-title-row">
                        <span class="chk-name">${escapeHtml(item.label)}</span>
                        <span class="status-pill ${
                            item.status === 'PASSED' ? 'badge-ready' : 
                            (item.status === 'ATTENTION' ? 'badge-attention' : 'badge-incomplete')
                        }" style="font-size: 0.65rem; padding: 0.15rem 0.45rem;">
                            ${item.status === 'PASSED' ? 'Passed' : (item.status === 'ATTENTION' ? 'Attention' : 'Unchecked')}
                        </span>
                    </div>
                    <p class="chk-desc">${escapeHtml(item.desc)}</p>
                </div>
                <div class="chk-action-group">
                    <button class="chk-btn ${item.status === 'PASSED' ? 'active-passed' : ''}" data-chk-id="${item.id}" data-status="PASSED">
                        ✓ Pass
                    </button>
                    <button class="chk-btn ${item.status === 'ATTENTION' ? 'active-attention' : ''}" data-chk-id="${item.id}" data-status="ATTENTION">
                        ⚠️ Attention
                    </button>
                    <button class="chk-btn ${item.status === 'UNCHECKED' ? 'active-unchecked' : ''}" data-chk-id="${item.id}" data-status="UNCHECKED">
                        — Skip
                    </button>
                </div>
            `;
            DOM.checklistContainer.appendChild(card);
        });

        DOM.checklistContainer.querySelectorAll('.chk-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-chk-id');
                const status = btn.getAttribute('data-status');
                window.bikeReadiness.setItemStatus(id, status);
                if (window.safetyAudio) window.safetyAudio.playBeep(640, 0.05);
            });
        });

        // Profile Details
        DOM.bikeNameTxt.textContent = summary.profile.bikeName || 'Not specified';
        DOM.bikeRegTxt.textContent = summary.profile.regNumber || 'Not specified';
        DOM.bikeOdoTxt.textContent = summary.profile.odometerKm ? `${summary.profile.odometerKm} km` : '-- km';
        DOM.bikeServiceTxt.textContent = summary.profile.lastServiceDate || 'Not specified';
        if (DOM.bikeNotesTxt) {
            DOM.bikeNotesTxt.textContent = summary.profile.notes || 'No maintenance notes recorded.';
        }

        // Maintenance Table
        DOM.maintenanceTableBody.innerHTML = '';
        summary.maintenance.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(m.task)}</strong></td>
                <td>${escapeHtml(m.interval)}</td>
                <td>
                    <span class="status-pill ${m.status === 'GOOD' ? 'status-active' : 'status-warning'}" style="font-size: 0.7rem;">
                        ${escapeHtml(m.lastDone)}
                    </span>
                </td>
            `;
            DOM.maintenanceTableBody.appendChild(tr);
        });
    }

    // =========================================================================
    // Event Listeners Binding
    // =========================================================================
    function bindEvents() {
        document.querySelectorAll('[data-nav]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const target = el.getAttribute('data-nav');
                if (target) switchView(target);
            });
        });

        DOM.audioToggleBtn.addEventListener('click', () => {
            const currentState = window.safetyAudio.soundEnabled;
            window.safetyAudio.setSoundEnabled(!currentState);
            DOM.audioToggleBtn.classList.toggle('active-audio', !currentState);
            showToast(!currentState ? 'Safety sound alerts enabled.' : 'Safety sound alerts muted.', 'info');
        });

        const handleRideToggle = () => {
            if (!window.rideGuardian.isRiding) {
                window.rideGuardian.startRide();
                showToast('Ride Guardian active. Monitoring live telemetry.', 'success');
                addActivity('Ride started. Live speed tracking initiated.');
            } else {
                window.rideGuardian.stopRide();
                showToast('Ride ended. Trip telemetry paused.', 'info');
                addActivity('Ride concluded. Final trip stats preserved.');
            }
        };

        DOM.dashToggleRideBtn.addEventListener('click', handleRideToggle);
        DOM.guardianRideBtn.addEventListener('click', handleRideToggle);

        DOM.simModeToggle.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            window.rideGuardian.toggleSimulation(isChecked);
            if (isChecked) {
                showToast('Demo ride simulator enabled. Indoor test speeds active.', 'info');
                addActivity('Indoor demo simulator enabled with dynamic speed changes.');
            } else {
                showToast('Switched to live GPS mode.', 'info');
            }
        });

        DOM.speedSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            DOM.speedSliderVal.textContent = `${val} km/h`;
            window.rideGuardian.setThreshold(val);
        });

        DOM.breakSelect.addEventListener('change', (e) => {
            window.rideGuardian.setBreakInterval(e.target.value);
            showToast(`Break reminder updated to every ${e.target.value} minutes.`, 'info');
        });

        DOM.dismissBreakBtn.addEventListener('click', () => {
            window.rideGuardian.dismissBreakAlert();
            showToast('Break advisory acknowledged.', 'info');
        });

        DOM.sosTriggerBtn.addEventListener('click', async () => {
            openModal('modal-sos-confirm');
            DOM.sosPreviewText.innerHTML = 'Acquiring high-accuracy GPS coordinates...';
            const payload = await window.emergencyController.generateEmergencyMessage();
            DOM.sosPreviewText.textContent = payload.message;
        });

        DOM.confirmSosDispatchBtn.addEventListener('click', async () => {
            closeModal('modal-sos-confirm');
            const res = await window.emergencyController.shareEmergency('native');
            if (res.method === 'clipboard') {
                showToast('Emergency SOS message & GPS link copied to clipboard!', 'warning');
            } else {
                showToast('Emergency SOS dispatch initiated.', 'danger');
            }
            addActivity('🚨 Emergency SOS alert triggered by rider.', 'alert');
        });

        DOM.cancelSosModalBtn.addEventListener('click', () => {
            closeModal('modal-sos-confirm');
        });

        DOM.sosShareWa.addEventListener('click', async () => {
            await window.emergencyController.shareEmergency('whatsapp');
            showToast('Opening WhatsApp with emergency coordinates...', 'info');
            addActivity('Emergency WhatsApp dispatch triggered.');
        });

        DOM.sosShareSms.addEventListener('click', async () => {
            await window.emergencyController.shareEmergency('sms');
            showToast('Opening SMS messenger with emergency coordinates...', 'info');
            addActivity('Emergency SMS dispatch triggered.');
        });

        DOM.sosShareCopy.addEventListener('click', async () => {
            const res = await window.emergencyController.copyMessageToClipboard();
            if (res.success) {
                showToast('Emergency distress message copied to clipboard!', 'success');
            }
        });

        DOM.editContactBtn.addEventListener('click', () => {
            const state = window.emergencyController.getState();
            DOM.inputContactName.value = state.contactName;
            DOM.inputContactPhone.value = state.contactPhone;
            DOM.inputContactRelation.value = state.contactRelation || 'Parent / Family';
            openModal('modal-edit-contact');
        });

        DOM.formEmergencyContact.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = DOM.inputContactName.value;
            const phone = DOM.inputContactPhone.value;
            const rel = DOM.inputContactRelation.value;

            window.emergencyController.saveContact(name, phone, rel);
            closeModal('modal-edit-contact');
            showToast('Emergency contact saved successfully.', 'success');
            addActivity(`Emergency contact updated: ${name}`);
        });

        DOM.startArrivalBtn.addEventListener('click', () => {
            const dest = DOM.arrivalDestInput.value || 'Intended Destination';
            const mins = DOM.arrivalDurationSelect.value || 30;
            window.emergencyController.startSafeArrival(dest, mins);
            showToast(`Safe arrival monitor set for ${mins} minutes to ${dest}.`, 'success');
            addActivity(`Safe Arrival monitor active: ${dest} (${mins} mins)`);
        });

        DOM.confirmArrivalBtn.addEventListener('click', () => {
            const res = window.emergencyController.confirmSafeArrival();
            showToast(`Safely arrived at ${res.destination}! Timer cleared.`, 'success');
            addActivity(`Rider safely arrived at ${res.destination}.`);
        });

        DOM.cancelArrivalBtn.addEventListener('click', () => {
            window.emergencyController.cancelSafeArrival();
            showToast('Safe arrival timer cancelled.', 'info');
        });

        DOM.sendOverdueSosBtn.addEventListener('click', async () => {
            await window.emergencyController.shareEmergency('native');
            showToast('Overdue notice dispatched to emergency contact.', 'danger');
        });

        const applyFilters = () => {
            window.hazardRadar.setFilter(
                DOM.filterCat.value,
                DOM.filterSev.value,
                DOM.filterStatus.value
            );
        };

        DOM.filterCat.addEventListener('change', applyFilters);
        DOM.filterSev.addEventListener('change', applyFilters);
        DOM.filterStatus.addEventListener('change', applyFilters);

        DOM.openReportHazardModalBtn.addEventListener('click', () => {
            DOM.formReportHazard.reset();
            currentAttachedGps = null;
            DOM.hzGpsStatusTxt.textContent = 'Coordinates: Not attached';
            DOM.hzGpsStatusTxt.style.color = 'var(--text-secondary)';
            openModal('modal-report-hazard');
        });

        DOM.hzAttachGpsBtn.addEventListener('click', () => {
            DOM.hzGpsStatusTxt.textContent = 'Acquiring GPS fix...';
            DOM.hzGpsStatusTxt.style.color = 'var(--amber-accent)';

            if (window.rideGuardian && window.rideGuardian.lastValidPosition) {
                const c = window.rideGuardian.lastValidPosition.coords;
                currentAttachedGps = { lat: c.latitude, lng: c.longitude };
                DOM.hzGpsStatusTxt.textContent = `Attached: ${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`;
                DOM.hzGpsStatusTxt.style.color = 'var(--green-accent)';
            } else if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        currentAttachedGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        DOM.hzGpsStatusTxt.textContent = `Attached: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                        DOM.hzGpsStatusTxt.style.color = 'var(--green-accent)';
                    },
                    (err) => {
                        DOM.hzGpsStatusTxt.textContent = 'GPS fix failed; submit with text landmark.';
                        DOM.hzGpsStatusTxt.style.color = 'var(--red-accent)';
                    },
                    { enableHighAccuracy: true, timeout: 6000 }
                );
            } else {
                DOM.hzGpsStatusTxt.textContent = 'Geolocation unsupported; using landmark text.';
            }
        });

        DOM.formReportHazard.addEventListener('submit', (e) => {
            e.preventDefault();
            const newReport = window.hazardRadar.addHazard({
                category: DOM.hzCategory.value,
                title: DOM.hzTitle.value,
                severity: DOM.hzSeverity.value,
                locationName: DOM.hzLocation.value,
                description: DOM.hzDesc.value,
                lat: currentAttachedGps ? currentAttachedGps.lat : null,
                lng: currentAttachedGps ? currentAttachedGps.lng : null
            });

            closeModal('modal-report-hazard');
            showToast('Road hazard reported and plotted on radar!', 'success');
            addActivity(`New hazard reported: "${newReport.title}" (${newReport.severity})`, 'warn');
        });

        DOM.chkMarkAllBtn.addEventListener('click', () => {
            window.bikeReadiness.markAllPassed();
            showToast('All pre-ride inspection items marked as passed.', 'success');
            addActivity('Pre-ride check completed: All items passed.');
        });

        DOM.chkResetBtn.addEventListener('click', () => {
            window.bikeReadiness.resetChecklist();
            showToast('Pre-ride checklist reset for next ride.', 'info');
        });

        DOM.editBikeProfileBtn.addEventListener('click', () => {
            const summary = window.bikeReadiness.getSummary();
            DOM.inputBikeName.value = summary.profile.bikeName || '';
            DOM.inputBikeReg.value = summary.profile.regNumber || '';
            DOM.inputBikeOdo.value = summary.profile.odometerKm || '';
            DOM.inputBikeService.value = summary.profile.lastServiceDate || '';
            DOM.inputBikeNotes.value = summary.profile.notes || '';
            openModal('modal-edit-bike');
        });

        DOM.formBikeProfile.addEventListener('submit', (e) => {
            e.preventDefault();
            window.bikeReadiness.saveProfile({
                bikeName: DOM.inputBikeName.value,
                regNumber: DOM.inputBikeReg.value,
                odometerKm: DOM.inputBikeOdo.value,
                lastServiceDate: DOM.inputBikeService.value,
                notes: DOM.inputBikeNotes.value
            });
            closeModal('modal-edit-bike');
            showToast('Motorcycle profile & notes updated.', 'success');
        });
    }

    // =========================================================================
    // Initialization
    // =========================================================================
    function init() {
        cacheDom();
        bindModalEvents();
        bindEvents();

        window.rideGuardian.onStateChange = updateGuardianUi;
        window.emergencyController.onStateChange = updateEmergencyUi;
        window.hazardRadar.onStateChange = updateHazardsUi;
        window.bikeReadiness.onStateChange = updateBikeUi;

        updateGuardianUi(window.rideGuardian.getState());
        updateEmergencyUi(window.emergencyController.getState());
        updateHazardsUi(window.hazardRadar.getHazards());
        updateBikeUi(window.bikeReadiness.getSummary());

        console.log('[RideSafe AI] Companion initialized successfully.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
