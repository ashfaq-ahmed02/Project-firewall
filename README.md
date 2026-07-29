# Project-firewall
# 🛡️ RuShield XDR

A real-time firewall monitoring and threat detection dashboard built using **Python, Flask, Scapy, MySQL, HTML, CSS, and JavaScript**.

RuShield XDR captures live network packets, applies firewall rules, stores logs in a MySQL database, and visualizes network activity through a modern web dashboard.

---

## 📸 Dashboard Preview

> *(Add screenshots here after uploading them to GitHub)*

---

# ✨ Features

- 📡 Real-time packet sniffing using Scapy
- 🔥 Firewall rule engine (Allowed / Blocked ports)
- 🗄️ MySQL database integration
- 📊 Live dashboard with firewall statistics
- 📈 Network traffic visualization using Chart.js
- 🚨 Live threat notifications
- 🤖 AI-style threat level analysis
- 📜 Real-time firewall logs
- 🌐 Unique IP tracking
- ⚡ Auto-refresh dashboard every 5 seconds

---

# 🏗️ Project Architecture

```
                Network Traffic
                       │
                       ▼
             Scapy Packet Sniffer
                       │
                       ▼
              Firewall Rule Engine
                       │
                       ▼
                MySQL Database
                       │
                       ▼
                Flask REST API
                       │
                       ▼
           RuShield XDR Dashboard
```

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Chart.js
- Font Awesome

## Backend

- Python
- Flask

## Database

- MySQL

## Networking

- Scapy

---

# 📂 Project Structure

```
Project-firewall/
│
├── static/
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── dashboard.js
│
├── templates/
│   └── index.html
│
├── dashboard.py
├── database.py
├── logger.py
├── port_filter.py
├── sniffer.py
├── test.py
│
├── requirements.txt
└── README.md
```

---

# ⚙️ How It Works

## Step 1

Scapy continuously captures incoming TCP packets.

↓

## Step 2

The firewall checks whether the destination port is allowed.

Allowed Ports:

- 80 (HTTP)
- 443 (HTTPS)

Any other port is marked as **BLOCKED**.

↓

## Step 3

Packet information is stored in MySQL.

Stored fields include:

- IP Address
- Port
- Action
- Timestamp

↓

## Step 4

Flask reads the logs and provides REST APIs.

Available APIs:

```
/
```

Dashboard

```
/api/logs
```

Returns recent firewall logs.

```
/api/stats
```

Returns dashboard statistics.

↓

## Step 5

The frontend fetches live data every 5 seconds and updates:

- Threat Score
- Charts
- Live Logs
- AI Status
- Statistics
- Notifications

---

# 📊 Dashboard Features

## Threat Score

Displays the current network security score based on blocked traffic.

---

## Live Activity

Shows the latest firewall events.

---

## Firewall Logs

Displays:

- Time
- IP Address
- Port
- Action

---

## AI Threat Analysis

Simple rule-based threat analysis.

Threat Levels:

- 🟢 LOW
- 🟡 MEDIUM
- 🔴 HIGH

---

## Charts

- Allowed vs Blocked Traffic
- Attack Distribution

---

## Network Status

Displays:

- Firewall Status
- Database Status
- Threat Engine Status
- Scanner Status

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/RuShield-XDR.git
```

```
cd RuShield-XDR
```

---

## Create Virtual Environment

```
python -m venv .venv
```

Activate

Windows

```
.venv\Scripts\activate
```

Linux

```
source .venv/bin/activate
```

---

## Install Dependencies

```
pip install -r requirements.txt
```

---

## Configure MySQL

Create database:

```
firewall_db
```

Update credentials inside

```
database.py
```

---

## Run Dashboard

```
python dashboard.py
```

Open:

```
http://127.0.0.1:5000
```

---

## Run Packet Sniffer

```
python sniffer.py
```

---

# 📷 Screenshots

## Dashboard

(Add screenshot)

---

## Live Logs

(Add screenshot)

---

## Charts

(Add screenshot)

---

# 🔮 Future Improvements

- 🌍 Interactive Threat Map
- 📊 Analytics Dashboard
- 📄 PDF Report Generation
- 📧 Email Alerts
- 🔐 User Authentication
- 🤖 Machine Learning Threat Detection
- 🚨 Port Scan Detection
- 🛡️ Brute Force Detection
- 📈 Historical Analytics

---

# 👨‍💻 Author

**Ashfaq Ahmed M**

Computer Science Engineering Student

Cybersecurity | Python | Network Security | UI/UX

GitHub:
https://github.com/yourusername

LinkedIn:
https://linkedin.com/in/yourprofile

---

# 📄 License

This project is licensed under the MIT License.
