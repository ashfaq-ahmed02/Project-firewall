let trafficChart;
let attackChart;

// ----------------------
// Load Firewall Logs
// ----------------------
async function loadLogs() {
    const response = await fetch("/api/logs");
    const liveFeed = document.getElementById("live-feed");
    const logs = await response.json();

    const tbody = document.getElementById("logs-body");

    if (!tbody) return;

    tbody.innerHTML = "";
    if (liveFeed) {
    liveFeed.innerHTML = "";
}

    logs.slice(0, 5).forEach(log => {
        tbody.innerHTML += `
        <tr>
            <td>${log.time}</td>
            <td>${log.ip}</td>
            <td>${log.port}</td>
            <td>
                <span class="badge ${log.action === "BLOCKED" ? "blocked" : "allowed"}">
                    ${log.action}
                </span>
            </td>
        </tr>
        `;
        if (liveFeed) {
    const dotClass = log.action === "BLOCKED"
        ? "red-dot"
        : "green-dot";

    liveFeed.innerHTML += `
        <div class="feed-item">
            <span class="${dotClass}"></span>
            <p>${log.ip} ${log.action} on Port ${log.port}</p>
        </div>
    `;
}
    });
}

// ----------------------
// Load Statistics
// ----------------------
async function loadStats() {

    const response = await fetch("/api/stats");
    const stats = await response.json();

    // Update dashboard numbers
    document.getElementById("totalLogs").textContent = stats.total;
    document.getElementById("allowedLogs").textContent = stats.allowed;
    document.getElementById("blockedLogs").textContent = stats.blocked;
    document.getElementById("uniqueIPs").textContent = stats.unique_ips;
    // Update Threat Score
let threatScore = 0;

if (stats.total > 0) {
    threatScore = ((stats.allowed / stats.total) * 100).toFixed(1);
}

document.getElementById("threatScore").textContent = threatScore + "%";

const status = document.getElementById("threatStatus");

if (threatScore >= 80) {
    status.textContent = "Secure";
    status.style.color = "#22c55e"; // Green
}
else if (threatScore >= 50) {
    status.textContent = "Warning";
    status.style.color = "#f59e0b"; // Orange
}
else {
    status.textContent = "Critical";
    status.style.color = "#ef4444"; // Red
}

    // Doughnut Chart
    trafficChart.data.datasets[0].data = [
        stats.allowed,
        stats.blocked
    ];
    trafficChart.update();

    // Pie Chart
    attackChart.data.datasets[0].data = [
        stats.blocked,
        stats.allowed
    ];
    attackChart.update();
}

// ----------------------
// Create Charts
// ----------------------
function createCharts() {

    // Doughnut Chart
    trafficChart = new Chart(
        document.getElementById("trafficChart"),
        {
            type: "doughnut",
            data: {
                labels: ["Allowed", "Blocked"],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        "#22c55e",
                        "#ef4444"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );

    // Pie Chart
    attackChart = new Chart(
        document.getElementById("attackChart"),
        {
            type: "pie",
            data: {
                labels: ["Blocked", "Allowed"],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        "#ef4444",
                        "#22c55e"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        }
    );
}

createCharts();
loadLogs();
loadStats();

setInterval(() => {
    loadLogs();
    loadStats();
}, 5000);