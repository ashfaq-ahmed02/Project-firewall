let trafficChart;
let attackChart;

// ----------------------------
// Load Recent Logs
// ----------------------------
async function loadLogs() {

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
                <span class="badge ${log.action==="BLOCKED" ? "blocked" : "allowed"}">
                    ${log.action}
                </span>
            </td>
        </tr>
        `;

    });

}

// ----------------------------
// Load Statistics
// ----------------------------
async function loadStats(){

    const response = await fetch("/api/stats");
    const stats = await response.json();

    // Update summary cards

    document.getElementById("totalLogs").innerText = stats.total;
    document.getElementById("allowedLogs").innerText = stats.allowed;
    document.getElementById("blockedLogs").innerText = stats.blocked;
    document.getElementById("uniqueIPs").innerText = stats.unique_ips;

    // Doughnut Chart

    if(trafficChart){

        trafficChart.data.datasets[0].data=[
            stats.allowed,
            stats.blocked
        ];

        trafficChart.update();

    }

    // Pie Chart

    if(attackChart){

        attackChart.data.datasets[0].data=[
            stats.blocked,
            stats.allowed
        ];

        attackChart.update();

    }

}

// ----------------------------
// Doughnut Chart
// ----------------------------

function createTrafficChart(){

    const ctx=document.getElementById("trafficChart");

    if(!ctx) return;

    trafficChart=new Chart(ctx,{

        type:"doughnut",

        data:{

            labels:["Allowed","Blocked"],

            datasets:[{

                data:[0,0],

                backgroundColor:[
                    "#22c55e",
                    "#ef4444"
                ],

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    labels:{
                        color:"#fff"
                    }
                }

            }

        }

    });

}

// ----------------------------
// Pie Chart
// ----------------------------

function createAttackChart(){

    const ctx=document.getElementById("attackChart");

    if(!ctx) return;

    attackChart=new Chart(ctx,{

        type:"pie",

        data:{

            labels:["Blocked","Allowed"],

            datasets:[{

                data:[0,0],

                backgroundColor:[
                    "#ef4444",
                    "#22c55e"
                ],

                borderWidth:0

            }]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,

            plugins:{

                legend:{
                    labels:{
                        color:"#fff"
                    }
                }

            }

        }

    });

}

createTrafficChart();
createAttackChart();

loadLogs();
loadStats();

setInterval(()=>{

    loadLogs();
    loadStats();

},5000);