document.addEventListener("DOMContentLoaded", function () {
// ==========================
// Attack Distribution Chart
// ==========================

const attackCanvas = document.getElementById("attackChart");

if (attackCanvas) {

    new Chart(attackCanvas, {

        type: "doughnut",

        data: {

            labels: [
                "Allowed",
                "Blocked",
                "Scanning"
            ],

            datasets: [{

                data: [416, 2346, 120],

                backgroundColor: [
                    "#22c55e",
                    "#ef4444",
                    "#f59e0b"
                ],

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        color: "#ffffff",
                        padding: 20,
                        font: {
                            size: 14
                        }

                    }

                }

            }

        }

    });

}
    const canvas = document.getElementById("trafficChart");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
            ],
            datasets: [{
                label: "Network Traffic",
                data: [12, 19, 10, 25, 18, 30, 22],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59,130,246,0.2)",
                fill: true,
                tension: 0.4,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: {
                        color: "#ffffff"
                    }
                }
            },

            scales: {

                x: {
                    ticks: {
                        color: "#cbd5e1"
                    },
                    grid: {
                        color: "#334155"
                    }
                },

                y: {
                    ticks: {
                        color: "#cbd5e1"
                    },
                    grid: {
                        color: "#334155"
                    }
                }

            }

        }

    });

});
// ==========================
// Live Firewall Logs
// ==========================

async function loadLogs() {

    try {

        const response = await fetch("/api/logs");

        const logs = await response.json();

        const tbody = document.getElementById("logs-body");

        if (!tbody) return;

        tbody.innerHTML = "";

        logs.slice(0,5).forEach(log => {

            tbody.innerHTML += `

            <tr>

                <td>${log.time}</td>

                <td>${log.ip}</td>

                <td>${log.port}</td>

                <td>

                    <span class="badge ${log.action.toLowerCase()}">

                        ${log.action}

                    </span>

                </td>

            </tr>

            `;

        });

    }

    catch(error){

        console.log(error);

    }

}

loadLogs();

setInterval(loadLogs,5000);

// ==========================
// Live Dashboard Stats
// ==========================

async function loadStats() {

    try {

        const response = await fetch("/api/stats");

        const stats = await response.json();

        document.getElementById("totalLogs").innerText = stats.total;

        document.getElementById("allowedLogs").innerText = stats.allowed;

        document.getElementById("blockedLogs").innerText = stats.blocked;

        document.getElementById("uniqueIPs").innerText = stats.unique_ips;

    }

    catch(error){

        console.log(error);

    }

}

loadStats();

setInterval(loadStats,5000);