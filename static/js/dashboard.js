/**
 * RuShield XDR - Next-Gen Security Operations Center (SOC)
 * Client-Side Application Controller
 */

// ==========================================
// Global Application State
// ==========================================
const AppState = {
    lastLogId: 0,
    audioEnabled: true,
    refreshInterval: 5000,
    timerId: null,
    activeTab: 'tab-overview',
    logFilter: {
        action: 'ALL',
        search: '',
        limit: 25
    },
    charts: {
        traffic: null,
        ports: null,
        trend: null,
        attackDist: null
    },
    maps: {
        overview: null,
        overviewLayer: null,
        full: null,
        fullLayer: null
    }
};

// Common Port Name Mapping
const PORT_SERVICES = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    3306: "MySQL",
    3389: "RDP",
    5432: "PostgreSQL",
    8080: "HTTP-Proxy",
    9784: "Custom-App"
};

function getServiceName(port) {
    return PORT_SERVICES[parseInt(port)] || `Port ${port}`;
}

// ==========================================
// Web Audio Cyber Alert Synthesizer
// ==========================================
let audioCtx = null;

function playAlertSound(type = 'danger') {
    if (!AppState.audioEnabled) return;
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;
        if (type === 'danger') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        }
    } catch (e) {
        console.warn("Audio Context init deferred:", e);
    }
}

// ==========================================
// Toast Notifications Hub
// ==========================================
function showToast(title, message, type = 'threat') {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item ${type}`;

    let icon = "fa-triangle-exclamation";
    if (type === "success") icon = "fa-circle-check";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
        <div class="toast-body">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// ==========================================
// Radial SVG Threat Gauge Controller
// ==========================================
function updateRadialThreatGauge(percent, level) {
    const circle = document.getElementById("gaugeProgressCircle");
    const scoreText = document.getElementById("threatScore");
    const statusText = document.getElementById("threatStatusText");
    const badge = document.getElementById("threatLevelBadge");

    if (!circle || !scoreText) return;

    // Circumference = 2 * PI * 70 ≈ 440
    const circumference = 440;
    const clampedPercent = Math.min(100, Math.max(0, percent));
    const offset = circumference - (clampedPercent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    scoreText.textContent = `${clampedPercent}%`;

    let color = "#10b981";
    let badgeBg = "rgba(16, 185, 129, 0.15)";
    let label = "LOW RISK";

    if (clampedPercent >= 60) {
        color = "#ef4444";
        badgeBg = "rgba(239, 68, 68, 0.15)";
        label = "CRITICAL";
    } else if (clampedPercent >= 30) {
        color = "#f59e0b";
        badgeBg = "rgba(245, 158, 11, 0.15)";
        label = "ELEVATED";
    }

    circle.style.stroke = color;
    circle.style.filter = `drop-shadow(0 0 8px ${color})`;
    
    if (statusText) statusText.textContent = label;
    if (badge) {
        badge.textContent = level || label;
        badge.style.color = color;
        badge.style.borderColor = color;
        badge.style.background = badgeBg;
    }
}

// ==========================================
// Interactive Leaflet Threat Map
// ==========================================
function initThreatMaps() {
    // High-tech dark canvas tiles (100% free, no API key required)
    const tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
    const tileAttrib = '&copy; Esri &mdash; World Dark Gray Canvas';

    // Overview Tab Map
    const overviewEl = document.getElementById('attackMap');
    if (overviewEl && !AppState.maps.overview) {
        AppState.maps.overview = L.map('attackMap', {
            zoomControl: true,
            attributionControl: false
        }).setView([20, 0], 2);

        L.tileLayer(tileUrl, { maxZoom: 16, attribution: tileAttrib }).addTo(AppState.maps.overview);
        AppState.maps.overviewLayer = L.layerGroup().addTo(AppState.maps.overview);
    }

    // Full Radar Tab Map
    const fullEl = document.getElementById('fullAttackMap');
    if (fullEl && !AppState.maps.full) {
        AppState.maps.full = L.map('fullAttackMap', {
            zoomControl: true,
            attributionControl: false
        }).setView([20, 0], 2);

        L.tileLayer(tileUrl, { maxZoom: 16, attribution: tileAttrib }).addTo(AppState.maps.full);
        AppState.maps.fullLayer = L.layerGroup().addTo(AppState.maps.full);
    }
}

async function renderThreatMapMarkers() {
    try {
        const res = await fetch('/api/threat-map');
        const points = await res.json();

        if (AppState.maps.overviewLayer) AppState.maps.overviewLayer.clearLayers();
        if (AppState.maps.fullLayer) AppState.maps.fullLayer.clearLayers();

        points.forEach(pt => {
            const isBlocked = pt.action === 'BLOCKED';
            const colorClass = isBlocked ? 'red' : 'green';

            const customIcon = L.divIcon({
                className: 'custom-radar-icon',
                html: `<div class="radar-marker-pulse ${colorClass}"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            });

            const popupHtml = `
                <div style="font-family: 'Inter', sans-serif; font-size: 12px; min-width: 160px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <strong style="color: #38bdf8; font-family: monospace;">${pt.ip}</strong>
                        <span style="font-size: 10px; font-weight: 700; color: ${isBlocked ? '#f87171' : '#4ade80'};">
                            ${pt.action}
                        </span>
                    </div>
                    <div style="color: #94a3b8; font-size: 11px; margin-bottom: 3px;">
                        <i class="fa-solid fa-location-dot"></i> ${pt.city}, ${pt.country}
                    </div>
                    <div style="color: #cbd5e1; font-size: 11px;">
                        Target: Port ${pt.port} (${getServiceName(pt.port)})
                    </div>
                    <div style="color: #64748b; font-size: 10px; margin-top: 4px;">
                        Recorded Events: <strong>${pt.hits}</strong>
                    </div>
                </div>
            `;

            if (AppState.maps.overviewLayer) {
                L.marker([pt.lat, pt.lng], { icon: customIcon })
                    .bindPopup(popupHtml)
                    .addTo(AppState.maps.overviewLayer);
            }

            if (AppState.maps.fullLayer) {
                L.marker([pt.lat, pt.lng], { icon: customIcon })
                    .bindPopup(popupHtml)
                    .addTo(AppState.maps.fullLayer);
            }
        });
    } catch (err) {
        console.error("Failed to load map markers:", err);
    }
}

// ==========================================
// Chart.js Setup & Updates
// ==========================================
function initCharts() {
    // 1. Doughnut: Traffic Composition
    const trafficCtx = document.getElementById("trafficChart");
    if (trafficCtx) {
        AppState.charts.traffic = new Chart(trafficCtx, {
            type: "doughnut",
            data: {
                labels: ["Allowed Clean", "Blocked Threat"],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: ["#10b981", "#ef4444"],
                    borderWidth: 2,
                    borderColor: "#0b1222",
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: { color: "#94a3b8", font: { size: 11 } }
                    }
                },
                cutout: "70%"
            }
        });
    }

    // 2. Bar Chart: Top 5 Targeted Ports
    const portsCtx = document.getElementById("portsBarChart");
    if (portsCtx) {
        AppState.charts.ports = new Chart(portsCtx, {
            type: "bar",
            data: {
                labels: [],
                datasets: [{
                    label: "Blocked Probes",
                    data: [],
                    backgroundColor: "rgba(56, 189, 248, 0.4)",
                    borderColor: "#00f0ff",
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#64748b", font: { size: 10 } }
                    },
                    y: {
                        grid: { display: false },
                        ticks: { color: "#cbd5e1", font: { size: 11, family: 'monospace' } }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    // 3. Line Chart: Analytics Time-Series Trend
    const trendCtx = document.getElementById("analyticsTrendChart");
    if (trendCtx) {
        AppState.charts.trend = new Chart(trendCtx, {
            type: "line",
            data: {
                labels: ["T-14", "T-13", "T-12", "T-11", "T-10", "T-9", "T-8", "T-7", "T-6", "T-5", "T-4", "T-3", "T-2", "T-1", "NOW"],
                datasets: [
                    {
                        label: "Allowed Packets",
                        data: [5, 8, 12, 10, 15, 14, 18, 22, 19, 24, 28, 25, 30, 32, 35],
                        borderColor: "#10b981",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        fill: true,
                        tension: 0.35,
                        pointRadius: 3
                    },
                    {
                        label: "Blocked Threats",
                        data: [2, 4, 3, 7, 5, 12, 8, 14, 10, 18, 15, 22, 16, 20, 18],
                        borderColor: "#ef4444",
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        fill: true,
                        tension: 0.35,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#64748b" }
                    },
                    y: {
                        grid: { color: "rgba(255, 255, 255, 0.05)" },
                        ticks: { color: "#64748b" }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: "#cbd5e1" }
                    }
                }
            }
        });
    }

    // 4. Polar Area / Bar: Port Exposure Risk
    const distCtx = document.getElementById("attackDistChart");
    if (distCtx) {
        AppState.charts.attackDist = new Chart(distCtx, {
            type: "doughnut",
            data: {
                labels: ["SSH (22)", "RDP (3389)", "Telnet (23)", "HTTP (80)", "Other"],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: [
                        "#ef4444",
                        "#f59e0b",
                        "#8b5cf6",
                        "#38bdf8",
                        "#64748b"
                    ],
                    borderWidth: 2,
                    borderColor: "#0b1222"
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "right",
                        labels: { color: "#94a3b8", font: { size: 11 } }
                    }
                }
            }
        });
    }
}

// ==========================================
// Data Fetching & UI Synchronization
// ==========================================
async function loadDashboardStats() {
    try {
        const res = await fetch("/api/stats");
        const stats = await res.json();

        // 1. Metric numbers
        document.getElementById("totalLogs").textContent = stats.total;
        document.getElementById("allowedLogs").textContent = stats.allowed;
        document.getElementById("blockedLogs").textContent = stats.blocked;
        document.getElementById("uniqueIPs").textContent = stats.unique_ips;
        
        const navCount = document.getElementById("nav-log-count");
        if (navCount) navCount.textContent = stats.total;

        // 2. Ratios & Threat Gauge
        const blockedPct = stats.threat_score;
        const allowedPct = stats.total > 0 ? (100 - blockedPct).toFixed(1) : 0;
        
        document.getElementById("blockedRatioText").textContent = `${blockedPct}%`;
        document.getElementById("allowedRatioText").textContent = `${allowedPct}%`;
        
        updateRadialThreatGauge(blockedPct, stats.threat_level);

        // 3. AI Insights
        document.getElementById("aiMainStatus").textContent = stats.ai_status;
        document.getElementById("aiRecommendation").textContent = stats.recommendation;
        document.getElementById("aiStatusPill").textContent = stats.ai_level;

        // Anomaly assessment
        const anomalyScoreEl = document.getElementById("anomalyScoreText");
        if (anomalyScoreEl) {
            anomalyScoreEl.textContent = blockedPct > 50 ? "Elevated Alert" : "Nominal";
            anomalyScoreEl.className = blockedPct > 50 ? "text-danger" : "text-success";
        }

        // 4. Update Doughnut Chart
        if (AppState.charts.traffic) {
            AppState.charts.traffic.data.datasets[0].data = [stats.allowed, stats.blocked];
            AppState.charts.traffic.update();
        }

        // 5. Update Ports Bar Chart
        if (AppState.charts.ports && stats.top_ports) {
            const labels = stats.top_ports.map(p => `Port ${p.port} (${getServiceName(p.port)})`);
            const counts = stats.top_ports.map(p => p.count);
            AppState.charts.ports.data.labels = labels;
            AppState.charts.ports.data.datasets[0].data = counts;
            AppState.charts.ports.update();

            // Dominant port text
            if (stats.top_ports.length > 0) {
                const dom = stats.top_ports[0];
                document.getElementById("dominantPortText").textContent = `Port ${dom.port} (${getServiceName(dom.port)}) - ${dom.count} hits`;
            }
        }

        // 6. Update Top Attackers Table (Analytics Tab)
        const topAttackersBody = document.getElementById("topAttackersTableBody");
        if (topAttackersBody && stats.top_attackers) {
            topAttackersBody.innerHTML = stats.top_attackers.map(att => `
                <tr>
                    <td class="ip-cell">
                        <i class="fa-solid fa-skull text-danger"></i>
                        <span>${att.ip}</span>
                        <button class="btn-icon-copy" onclick="copyToClipboard('${att.ip}')" title="Copy IP">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </td>
                    <td><i class="fa-solid fa-flag"></i> ${att.country}</td>
                    <td><strong class="text-danger">${att.count}</strong> blocked</td>
                    <td>
                        <button class="btn btn-sm btn-danger-outline" onclick="quickAddIpRule('${att.ip}')">
                            <i class="fa-solid fa-ban"></i> Blacklist
                        </button>
                    </td>
                </tr>
            `).join('');
        }

    } catch (err) {
        console.error("Stats load error:", err);
    }
}

async function loadLogs() {
    try {
        const queryParams = new URLSearchParams({
            search: AppState.logFilter.search,
            action: AppState.logFilter.action,
            limit: AppState.logFilter.limit
        });

        const res = await fetch(`/api/logs?${queryParams.toString()}`);
        const logs = await res.json();

        // 1. Detect New Logs for Toast & Sound
        if (logs.length > 0) {
            const newest = logs[0];
            if (AppState.lastLogId > 0 && newest.id > AppState.lastLogId) {
                if (newest.action === "BLOCKED") {
                    playAlertSound('danger');
                    showToast(
                        "🚨 Intrusion Blocked",
                        `Inbound probe from ${newest.ip} dropped on Port ${newest.port} (${getServiceName(newest.port)})`,
                        "threat"
                    );
                } else {
                    playAlertSound('success');
                }
            }
            AppState.lastLogId = Math.max(AppState.lastLogId, newest.id);
        }

        // 2. Render Overview Quick Activity Table (5 rows)
        const overviewTbody = document.getElementById("overviewLogsTableBody");
        if (overviewTbody) {
            overviewTbody.innerHTML = logs.slice(0, 6).map(log => `
                <tr>
                    <td style="color: #94a3b8; font-size: 11px;">${log.time}</td>
                    <td class="ip-cell">
                        <span>${log.ip}</span>
                        <button class="btn-icon-copy" onclick="copyToClipboard('${log.ip}')" title="Copy IP">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </td>
                    <td><span style="font-family: monospace; font-weight: 600;">${log.port}</span></td>
                    <td style="color: #94a3b8;">${getServiceName(log.port)}</td>
                    <td>
                        <span class="badge-status ${log.action === 'BLOCKED' ? 'badge-blocked' : 'badge-allowed'}">
                            ${log.action}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="quickAddPortRule('${log.port}', '${log.action === 'BLOCKED' ? 'ALLOWED' : 'BLOCKED'}')">
                            ${log.action === 'BLOCKED' ? 'Permit Port' : 'Block Port'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // 3. Render Live Packet Stream Feed
        const feedContainer = document.getElementById("liveFeedContainer");
        if (feedContainer) {
            feedContainer.innerHTML = logs.slice(0, 7).map(log => `
                <div class="feed-row">
                    <div class="feed-info">
                        <span class="feed-dot ${log.action === 'BLOCKED' ? 'blocked' : 'allowed'}"></span>
                        <span class="feed-ip">${log.ip}</span>
                        <span class="feed-port">&rarr; :${log.port}</span>
                    </div>
                    <span class="feed-action ${log.action}">${log.action}</span>
                </div>
            `).join('');
        }

        // 4. Render Full Packet Inspector Table (Tab 3)
        const fullLogsTbody = document.getElementById("fullLogsTableBody");
        if (fullLogsTbody) {
            fullLogsTbody.innerHTML = logs.map(log => `
                <tr>
                    <td style="font-family: monospace; color: #64748b;">#${log.id}</td>
                    <td style="font-size: 11px; color: #94a3b8;">${log.time}</td>
                    <td class="ip-cell">
                        <strong style="color: #e2e8f0;">${log.ip}</strong>
                        <button class="btn-icon-copy" onclick="copyToClipboard('${log.ip}')" title="Copy IP">
                            <i class="fa-regular fa-copy"></i>
                        </button>
                    </td>
                    <td><strong style="font-family: monospace;">${log.port}</strong></td>
                    <td style="color: #38bdf8;">${getServiceName(log.port)}</td>
                    <td>
                        <span class="badge-status ${log.action === 'BLOCKED' ? 'badge-blocked' : 'badge-allowed'}">
                            ${log.action}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="quickAddIpRule('${log.ip}')" title="Block IP">
                            <i class="fa-solid fa-shield"></i> Rule
                        </button>
                    </td>
                </tr>
            `).join('');
        }

    } catch (err) {
        console.error("Logs load error:", err);
    }
}

// ==========================================
// Firewall Rules Management
// ==========================================
async function loadRules() {
    try {
        const res = await fetch("/api/rules");
        const rules = await res.json();

        const countEl = document.getElementById("activeRulesCount");
        if (countEl) countEl.textContent = rules.length;

        const rulesTbody = document.getElementById("rulesTableBody");
        if (!rulesTbody) return;

        rulesTbody.innerHTML = rules.map(rule => `
            <tr>
                <td style="font-family: monospace; color: #64748b;">RULE-${rule.id}</td>
                <td>
                    <span class="tag-xdr">${rule.rule_type}</span>
                </td>
                <td>
                    <strong style="font-family: monospace; color: #fff;">${rule.target}</strong>
                    ${rule.rule_type === 'PORT' ? `<span style="color:#94a3b8; font-size:11px;"> (${getServiceName(rule.target)})</span>` : ''}
                </td>
                <td>
                    <span class="badge-status ${rule.action === 'BLOCKED' ? 'badge-blocked' : 'badge-allowed'}">
                        ${rule.action}
                    </span>
                </td>
                <td style="color: #cbd5e1;">${rule.description || 'Configured policy'}</td>
                <td style="font-size: 11px; color: #64748b;">${rule.created_at || 'Active'}</td>
                <td>
                    <button class="btn btn-sm btn-danger-outline" onclick="deleteFirewallRule(${rule.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Rules load error:", err);
    }
}

async function deleteFirewallRule(ruleId) {
    if (!confirm(`Confirm deletion of Firewall Policy #${ruleId}?`)) return;
    try {
        const res = await fetch(`/api/rules/${ruleId}`, { method: 'DELETE' });
        const data = await res.json();
        showToast("Policy Removed", data.message, "info");
        loadRules();
        loadDashboardStats();
    } catch (err) {
        showToast("Error", "Failed to remove policy", "threat");
    }
}

async function quickAddIpRule(ip) {
    try {
        const res = await fetch("/api/rules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rule_type: "IP",
                target: ip,
                action: "BLOCKED",
                description: `Quick blacklist against intruder ${ip}`
            })
        });
        const data = await res.json();
        showToast("Rule Enforced", `Host ${ip} has been added to blocklist.`, "success");
        loadRules();
    } catch (err) {
        showToast("Error", "Could not apply quick rule", "threat");
    }
}

async function quickAddPortRule(port, action) {
    try {
        const res = await fetch("/api/rules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rule_type: "PORT",
                target: String(port),
                action: action,
                description: `${action} policy for Port ${port} (${getServiceName(port)})`
            })
        });
        const data = await res.json();
        showToast("Port Rule Deployed", `Port ${port} policy set to ${action}.`, "success");
        loadRules();
        loadLogs();
        loadDashboardStats();
    } catch (err) {
        showToast("Error", "Could not apply port rule", "threat");
    }
}

// ==========================================
// Traffic & Attack Simulator Controller
// ==========================================
async function runSimulation(simType, customData = {}) {
    logToSimulatorConsole(`[Executing] Launching traffic scenario: ${simType.toUpperCase()}...`, "info");
    try {
        const payload = { type: simType, ...customData };
        const res = await fetch("/api/simulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success && data.events) {
            data.events.forEach(evt => {
                const lineClass = evt.action === "BLOCKED" ? "blocked" : "allowed";
                logToSimulatorConsole(`[Verdict: ${evt.action}] ${evt.ip} &rarr; Port ${evt.port} (${getServiceName(evt.port)})`, lineClass);
            });
            showToast("Simulation Complete", data.message, "info");
            // Immediate sync
            loadLogs();
            loadDashboardStats();
            renderThreatMapMarkers();
        }
    } catch (err) {
        logToSimulatorConsole(`[Error] Simulation execution failed: ${err.message}`, "blocked");
    }
}

function logToSimulatorConsole(text, cssClass = "info") {
    const consoleEl = document.getElementById("simConsole");
    if (!consoleEl) return;
    const time = new Date().toTimeString().split(' ')[0];
    const line = document.createElement("div");
    line.className = `console-line ${cssClass}`;
    line.innerHTML = `<span style="color: #64748b;">[${time}]</span> ${text}`;
    consoleEl.appendChild(line);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// ==========================================
// Utility Helpers
// ==========================================
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Clipboard", `Copied: ${text}`, "info");
    }).catch(() => {
        prompt("Copy text:", text);
    });
}

function updateLiveClock() {
    const clockEl = document.getElementById("liveClock");
    if (!clockEl) return;
    const now = new Date();
    const utcStr = now.toISOString().substring(11, 19) + " UTC";
    clockEl.textContent = utcStr;
}

// ==========================================
// Event Listeners & Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Live Clock
    updateLiveClock();
    setInterval(updateLiveClock, 1000);

    // 2. Initialize Charts & Maps
    initCharts();
    initThreatMaps();

    // 3. Initial Data Fetch
    loadDashboardStats();
    loadLogs();
    loadRules();
    renderThreatMapMarkers();

    // 4. Tab Switching Controller
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");
            if (!targetTab) return;

            // Update active sidebar nav
            document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
            item.classList.add("active");

            // Update tab panes
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
            const targetPane = document.getElementById(targetTab);
            if (targetPane) targetPane.classList.add("active");

            // Breadcrumbs & View Title
            const titles = {
                'tab-overview': ['Security Operations Center', 'Perimeter Telemetry'],
                'tab-analytics': ['Traffic & Threat Analytics', 'Deep Forensics'],
                'tab-logs': ['Firewall Packet Inspector', 'Raw Decision Logs'],
                'tab-rules': ['Firewall Rule Engine', 'Policy Configuration'],
                'tab-radar': ['Global Threat Radar', 'Origin Geolocation'],
                'tab-simulator': ['Attack & Traffic Simulator', 'Live Penetration Testbench']
            };
            if (titles[targetTab]) {
                document.getElementById("viewTitle").textContent = titles[targetTab][0];
                document.getElementById("viewBreadcrumb").textContent = titles[targetTab][1];
            }

            AppState.activeTab = targetTab;

            // Leaflet resize trigger
            setTimeout(() => {
                if (AppState.maps.overview) AppState.maps.overview.invalidateSize();
                if (AppState.maps.full) AppState.maps.full.invalidateSize();
            }, 150);
        });
    });

    // View All Logs button in Overview table
    document.querySelectorAll(".view-all-logs-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const navLogs = document.querySelector(".nav-item[data-tab='tab-logs']");
            if (navLogs) navLogs.click();
        });
    });

    // 5. Audio Alert Toggle
    const audioBtn = document.getElementById("toggleAudioBtn");
    if (audioBtn) {
        audioBtn.addEventListener("click", () => {
            AppState.audioEnabled = !AppState.audioEnabled;
            const statusText = document.getElementById("audioStatusText");
            if (statusText) statusText.textContent = AppState.audioEnabled ? "ON" : "OFF";
            audioBtn.querySelector("i").className = AppState.audioEnabled ? "fa-solid fa-volume-high" : "fa-solid fa-volume-xmark";
            showToast("Audio Alerts", AppState.audioEnabled ? "Sound alerts enabled" : "Sound alerts muted", "info");
        });
    }

    // 6. Auto-Refresh Interval Controller
    const refreshSelect = document.getElementById("refreshIntervalSelect");
    if (refreshSelect) {
        const startTimer = (ms) => {
            if (AppState.timerId) clearInterval(AppState.timerId);
            if (ms > 0) {
                AppState.timerId = setInterval(() => {
                    loadDashboardStats();
                    loadLogs();
                    if (AppState.activeTab === 'tab-radar') renderThreatMapMarkers();
                }, ms);
            }
        };

        refreshSelect.addEventListener("change", (e) => {
            const val = parseInt(e.target.value);
            AppState.refreshInterval = val;
            startTimer(val);
            showToast("Refresh Policy", val > 0 ? `Auto-refresh set to ${val / 1000}s` : "Auto-refresh paused", "info");
        });

        startTimer(AppState.refreshInterval);
    }

    // 7. Center Map Button
    const centerMapBtn = document.getElementById("centerMapBtn");
    if (centerMapBtn && AppState.maps.overview) {
        centerMapBtn.addEventListener("click", () => {
            AppState.maps.overview.setView([20, 0], 2);
        });
    }

    // 8. Log Filter Pills & Search
    document.querySelectorAll(".filter-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            AppState.logFilter.action = pill.getAttribute("data-action");
            loadLogs();
        });
    });

    const logSearchInput = document.getElementById("logSearchInput");
    if (logSearchInput) {
        let debounceTimer;
        logSearchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                AppState.logFilter.search = e.target.value.trim();
                loadLogs();
            }, 300);
        });
    }

    const logLimitSelect = document.getElementById("logLimitSelect");
    if (logLimitSelect) {
        logLimitSelect.addEventListener("change", (e) => {
            AppState.logFilter.limit = parseInt(e.target.value);
            loadLogs();
        });
    }

    // 9. Export CSV & Clear Logs
    const exportBtn = document.getElementById("exportLogsBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", () => {
            window.location.href = "/api/export-logs";
            showToast("Export Initiated", "Downloading ruShield firewall logs CSV...", "success");
        });
    }

    const clearBtn = document.getElementById("clearLogsBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", async () => {
            if (!confirm("Reset and clear all firewall decision logs?")) return;
            try {
                await fetch("/api/clear-logs", { method: "POST" });
                showToast("Logs Reset", "Firewall log history cleared.", "info");
                loadLogs();
                loadDashboardStats();
                renderThreatMapMarkers();
            } catch (err) {
                showToast("Error", "Failed to clear logs", "threat");
            }
        });
    }

    // 10. Rules Modal Handling
    const addRuleModal = document.getElementById("addRuleModal");
    const openAddRuleBtn = document.getElementById("openAddRuleModalBtn");
    const closeAddRuleBtn = document.getElementById("closeAddRuleModalBtn");
    const cancelAddRuleBtn = document.getElementById("cancelAddRuleModalBtn");
    const addRuleForm = document.getElementById("addRuleForm");

    if (openAddRuleBtn && addRuleModal) {
        openAddRuleBtn.addEventListener("click", () => addRuleModal.classList.add("show"));
    }
    if (closeAddRuleBtn && addRuleModal) {
        closeAddRuleBtn.addEventListener("click", () => addRuleModal.classList.remove("show"));
    }
    if (cancelAddRuleBtn && addRuleModal) {
        cancelAddRuleBtn.addEventListener("click", () => addRuleModal.classList.remove("show"));
    }

    if (addRuleForm) {
        addRuleForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const rule_type = document.getElementById("ruleTypeSelect").value;
            const target = document.getElementById("ruleTargetInput").value.trim();
            const action = document.getElementById("ruleActionSelect").value;
            const description = document.getElementById("ruleDescInput").value.trim();

            try {
                const res = await fetch("/api/rules", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rule_type, target, action, description })
                });
                const data = await res.json();
                if (data.success) {
                    showToast("Rule Created", `Policy applied for ${target}.`, "success");
                    addRuleModal.classList.remove("show");
                    addRuleForm.reset();
                    loadRules();
                    loadDashboardStats();
                } else {
                    showToast("Error", data.error || "Failed to create rule", "threat");
                }
            } catch (err) {
                showToast("Error", "Could not save rule", "threat");
            }
        });
    }

    // 11. Simulator Preset Buttons
    document.querySelectorAll(".run-sim-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const simType = btn.getAttribute("data-type");
            runSimulation(simType);
        });
    });

    const customSimBtn = document.getElementById("sendCustomSimBtn");
    if (customSimBtn) {
        customSimBtn.addEventListener("click", () => {
            const ip = document.getElementById("customSimIP").value.trim() || "192.168.1.99";
            const port = parseInt(document.getElementById("customSimPort").value) || 80;
            runSimulation("custom", { ip, port });
        });
    }

    const quickSimBtn = document.getElementById("quickSimulateBtn");
    if (quickSimBtn) {
        quickSimBtn.addEventListener("click", () => {
            runSimulation("port_scan");
        });
    }

    const clearConsoleBtn = document.getElementById("clearConsoleBtn");
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener("click", () => {
            const c = document.getElementById("simConsole");
            if (c) c.innerHTML = '<div class="console-line text-muted">[System] Console cleared. Ready.</div>';
        });
    }
});
