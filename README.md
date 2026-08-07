# 🛡️ RuShield XDR - Real-Time Firewall Monitoring & Threat Detection

![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-Web%20Framework-black?style=for-the-badge&logo=flask)
![MySQL](https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge&logo=mysql)
![Scapy](https://img.shields.io/badge/Scapy-Network%20Sniffing-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

---

## 📌 Overview

RuShield XDR is a **real-time firewall monitoring and threat detection system** built using **Python, Flask, Scapy, MySQL, HTML, CSS, and JavaScript**.

The application captures live network packets, analyzes them using custom firewall rules, stores the logs in a MySQL database, and visualizes security events through a modern web dashboard.

The project demonstrates the fundamentals of **Network Security**, **Firewall Development**, **Packet Analysis**, and **Real-Time Security Monitoring**.

---

# ✨ Features

- 📡 Live Packet Sniffing using Scapy
- 🔥 Firewall Rule Engine
- 🗄️ MySQL Log Storage
- 🌐 Flask REST API
- 📊 Real-Time Dashboard
- 📈 Live Traffic Charts
- 🚨 Live Security Notifications
- 🤖 AI-Based Threat Level
- 📜 Recent Firewall Logs
- 🌍 Unique IP Tracking
- ⚡ Auto Refresh Dashboard
- 🛡️ Threat Score Calculation

---

# 🏗️ System Architecture

```
                Internet Traffic
                       │
                       ▼
               Scapy Packet Sniffer
                       │
                       ▼
              Firewall Rule Engine
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
     Allowed Packet             Blocked Packet
         │                           │
         └─────────────┬─────────────┘
                       ▼
                 MySQL Database
                       │
                       ▼
                 Flask Backend API
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
Project-firewall
│
├── static
│   ├── css
│   │     └── style.css
│   │
│   └── js
│         └── dashboard.js
│
├── templates
│      └── index.html
│
├── dashboard.py
├── database.py
├── logger.py
├── port_filter.py
├── sniffer.py
├── test.py
│
├── README.md
└── requirements.txt
```

---

# ⚙️ Workflow

## Step 1

Scapy captures network packets in real time.

↓

## Step 2

Firewall rules check destination ports.

Allowed

- Port 80
- Port 443

Blocked

- Any other port

↓

## Step 3

Packet information is saved into MySQL.

Stored Information

- Source IP
- Destination Port
- Action
- Timestamp

↓

## Step 4

Flask reads the database and exposes APIs.

Available APIs

```
/
```

Dashboard

```
/api/logs
```

Recent firewall logs

```
/api/stats
```

Dashboard statistics

↓

## Step 5

The frontend automatically refreshes every **5 seconds** and updates

- Threat Score
- Live Logs
- AI Status
- Charts
- Statistics
- Notifications

---

# 📊 Dashboard Modules

## Threat Score

Displays the current security score calculated from blocked traffic.

---

## Live Activity Feed

Shows real-time firewall events.

---

## Recent Firewall Logs

Displays

- Time
- IP Address
- Port
- Action

---

## AI Threat Engine

Rule-based AI analysis.

Threat Levels

🟢 LOW

🟡 MEDIUM

🔴 HIGH

---

## Charts

- Allowed vs Blocked Traffic
- Attack Distribution

---

## Network Status

- Firewall
- Database
- Threat Engine
- Scanner

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/RuShield-XDR.git
```

```
cd RuShield-XDR
```

---

## Create Virtual Environment

```
python -m venv .venv
```

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

Create a database named

```
firewall_db
```

Update your credentials in

```
database.py
```

---

## Run Dashboard

```
python dashboard.py
```

Visit

```
http://127.0.0.1:5000
```

---

## Run Packet Sniffer

```
python sniffer.py
```

---

# 📸 Screenshots

## Dashboard

> Add your dashboard screenshot here

---

## Live Logs

> Add screenshot

---

## Charts

> Add screenshot

---

# 🔮 Roadmap

- ✅ Live Packet Sniffing
- ✅ Firewall Rules
- ✅ MySQL Integration
- ✅ Dashboard UI
- ✅ AI Threat Analysis
- ✅ Live Notifications
- 🔄 Interactive Threat Map
- 🔄 Analytics Dashboard
- 🔄 PDF Report Generator
- 🔄 Email Alerts
- 🔄 Login System
- 🔄 Machine Learning Threat Detection

---

# 💻 Skills Demonstrated

- Python Programming
- Flask Development
- REST APIs
- MySQL Database
- Network Security
- Packet Analysis
- Firewall Development
- Cybersecurity Dashboard
- Real-Time Monitoring
- Frontend Development

---

# 👨‍💻 Author

## Ashfaq Ahmed M

Computer Science Engineering Student

Cybersecurity Enthusiast | Python Developer | Network Security Learner | UI/UX Designer

**LinkedIn:** *(Add your profile)*

**GitHub:** *(Add your GitHub profile)*

---

# ⭐ If you like this project

Give this repository a ⭐ on GitHub.

It motivates me to build more cybersecurity projects.

---

# 📜 License

This project is licensed under the MIT License.
