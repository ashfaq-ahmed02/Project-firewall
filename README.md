# 🛡️ RuShield XDR — Firewall Monitoring & Threat Analysis

<p align="center">
  <strong>A Python-based firewall monitoring dashboard for network traffic visibility, rule evaluation, event logging, and threat analysis.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-Web%20API-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/Database-SQLite%20%7C%20MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="Database">
  <img src="https://img.shields.io/badge/Networking-Scapy-2E8B57?style=for-the-badge" alt="Scapy">
</p>

---

## 📌 Overview

**RuShield XDR** is an educational cybersecurity project combining a Flask web application, firewall-rule evaluation, network-event logging, and a dashboard for monitoring traffic decisions.

The application evaluates source IP addresses and destination ports against configured rules, records ALLOWED or BLOCKED decisions, and presents security activity through a browser-based dashboard. A Scapy-based packet sniffer is included for observing TCP/IP packets in an authorized lab environment.

This project demonstrates network security fundamentals, packet inspection, Python backend development, database integration, REST APIs, and security-dashboard design.

> **Important:** This is a learning and monitoring project, not a replacement for an operating-system firewall or a production-grade XDR/SIEM platform. The current rule-checking code records decisions; it does not itself drop packets at the operating-system or network-interface level.

## ✨ Features

- 🔥 **Firewall rule evaluation:** Checks configured IP and port rules and applies fallback decisions.
- 📡 **Packet observation:** Uses Scapy to inspect observed IP/TCP packets.
- 📝 **Event logging:** Records source IP, destination port, decision, and timestamp.
- 🗄️ **Database options:** SQLite by default, with optional MySQL support.
- 🌐 **Flask dashboard:** Serves the web interface and API endpoints.
- 📊 **Traffic statistics:** Displays summaries derived from recorded events.
- 🔍 **Security event investigation:** Review logged traffic decisions.
- 🚨 **Threat-analysis interface:** Provides rule-based/demo analysis and visual indicators.
- ⚙️ **Rule management:** Supports rule-related functionality implemented in the application.
- 📈 **Visualizations:** Explore the dashboard's currently implemented charts, filters, and export options.

## 🧰 Technology Stack

| Area | Technologies |
|---|---|
| Backend | Python, Flask |
| Database | SQLite, optional MySQL |
| Packet observation | Scapy |
| Frontend | HTML5, CSS3, JavaScript |
| Dashboard visuals | Chart.js and frontend assets where configured |
| Tools | Git, GitHub, VS Code |

## 🏗️ Architecture

```text
       Authorized lab / observed traffic
                     |
                     v
              Scapy Sniffer
                     |
                     v
             IP/TCP Packet Details
                     |
                     v
               Rule Evaluation
                     |
              +------+------+
              |             |
              v             v
           ALLOWED        BLOCKED
              |             |
              +------+------+
                     |
                     v
                Event Logger
                     |
                     v
                SQLite/MySQL
                     |
                     v
               Flask Backend
                     |
                     v
              Web Dashboard
```

### Workflow

1. The sniffer observes IP/TCP packets and extracts the source IP and destination port.
2. The rule-checking function checks for an explicitly blocked IP and configured port rules.
3. If no matching rule is found, the current fallback allows ports **80** and **443** and marks other ports as **BLOCKED**.
4. The event logger stores the decision and timestamp.
5. Flask provides the dashboard and data endpoints used to inspect recorded activity.

> A logged BLOCKED verdict does not mean the packet was physically dropped.

## 📂 Project Structure

```text
Project-firewall/
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── dashboard.js
├── templates/
│   └── index.html
├── dashboard.py
├── database.py
├── logger.py
├── port_filter.py
├── sniffer.py
├── test.py
├── requirements.txt
└── README.md
```

## 🚀 Installation

### Prerequisites

- Python 3.10 or newer
- Git
- A modern web browser
- Optional: Scapy and the required capture permissions
- Optional: MySQL server and its Python connector

### 1. Clone the repository

```bash
git clone https://github.com/ashfaq-ahmed02/Project-firewall.git
cd Project-firewall
```

### 2. Create a virtual environment

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows Command Prompt**

```bat
.venv\Scripts\activate.bat
```

**Linux / macOS**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The current requirements file lists Flask and Werkzeug. Install Scapy separately if you want to run the packet sniffer:

```bash
pip install scapy
```

For optional MySQL support:

```bash
pip install mysql-connector-python
```

### 4. Start the dashboard

```bash
python dashboard.py
```

Open **http://127.0.0.1:5000** in your browser.

### 5. Run the packet sniffer (optional)

Open a second terminal, activate the virtual environment, and run:

```bash
python sniffer.py
```

Packet capture may require elevated privileges and the correct network interface. Use only on devices and networks you own or are explicitly authorized to monitor. Stop with **Ctrl+C**.

## 🗄️ Database Configuration

### SQLite (default)

SQLite is the default database option and normally requires no database server. The application initializes its database through the database helper code.

### MySQL (optional)

Configure these environment variables before starting the application:

| Variable | Purpose | Example |
|---|---|---|
| `USE_MYSQL` | Enable the MySQL connection attempt | `true` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_USER` | Database username | `firewall_user` |
| `DB_PASSWORD` | Database password | Set privately |
| `DB_NAME` | Database name | `firewall_db` |

**Windows PowerShell**

```powershell
$env:USE_MYSQL = "true"
$env:DB_HOST = "localhost"
$env:DB_USER = "firewall_user"
$env:DB_PASSWORD = "your-local-password"
$env:DB_NAME = "firewall_db"
python dashboard.py
```

**Linux / macOS**

```bash
export USE_MYSQL=true
export DB_HOST=localhost
export DB_USER=firewall_user
export DB_PASSWORD='your-local-password'
export DB_NAME=firewall_db
python dashboard.py
```

Create the database and grant the configured user the required permissions first. Never commit real credentials to GitHub. If MySQL is unavailable, the current connection helper attempts to fall back to SQLite.

## 🌐 API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Serves the dashboard |
| GET | `/api/logs` | Retrieves firewall log data |
| GET | `/api/stats` | Retrieves dashboard statistics |

Review `dashboard.py` for the exact routes, parameters, and response formats in the current version. Additional rule-management, simulation, geolocation/demo, or CSV-export functionality should be documented against the actual route definitions.

## 🖥️ Dashboard Guide

The dashboard is designed to help you inspect:

- **Traffic summary:** Total, allowed, and blocked event counts.
- **Event log:** Source IP, destination port, verdict, and timestamp.
- **Threat indicators:** Rule-based or demonstration assessments.
- **Charts:** Visual summaries of recorded traffic.
- **Rule controls:** Inspect and manage supported IP/port rules.
- **Alerts and map visuals:** Treat simulated or estimated data as illustrative unless backed by a verified data source.

## 🔐 Security Notes and Limitations

- **Monitoring is not enforcement:** The current rule checker records verdicts but does not install kernel firewall rules or guarantee packet drops.
- **Rule-based, not verified AI:** Describe threat assessments as heuristic or rule-based unless a real trained model is implemented and evaluated.
- **Demo geolocation:** Hard-coded or estimated IP locations are illustrative, not authoritative.
- **Sniffer permissions:** Packet capture may require elevated privileges; minimize privileges whenever possible.
- **Protect the dashboard:** Add authentication, authorization, input validation, CSRF protection for state-changing browser actions, and secure deployment settings before exposing it beyond a trusted lab.
- **Protect secrets:** Use environment variables and never publish passwords or API keys.
- **Privacy:** Capture and retain only the data needed for authorized testing.

## 🛣️ Roadmap

- [ ] Separate observed, simulated, and live traffic.
- [ ] Add automated tests for IP and port rule evaluation.
- [ ] Add authentication and role-based access for rule management.
- [ ] Make allowed ports and default policies configurable.
- [ ] Add structured logging and log-retention controls.
- [ ] Improve error handling and database configuration.
- [ ] Add verified threat-intelligence integrations.
- [ ] Add report generation and alert delivery.
- [ ] Integrate actual OS firewall enforcement in a controlled, platform-specific module.
- [ ] Add containerized deployment documentation.

## 🧪 Testing

Run the test script included in the repository:

```bash
python test.py
```

If you add pytest-based tests, install pytest and run `pytest`. Document confirmed test results when an automated test suite is available.

## 🎓 Skills Demonstrated

- Python programming
- Flask application and REST API development
- Network packet observation with Scapy
- IP and port rule evaluation
- SQLite/MySQL integration
- Security event logging and dashboard visualization
- HTML, CSS, and JavaScript
- Git and GitHub project documentation

## 👨‍💻 Author

**Ashfaq Ahmed M**  
Computer Science Engineering Student | Network Security | Python | Cybersecurity

- **GitHub:** [@ashfaq-ahmed02](https://github.com/ashfaq-ahmed02)
- **Project:** [Project-firewall](https://github.com/ashfaq-ahmed02/Project-firewall)
- **LinkedIn:** [Ashfaq Ahmed M](https://www.linkedin.com/in/ashfaq-ahmed-m-b3a49a2a5/)

## 🤝 Contributing

Suggestions, bug reports, and improvements are welcome. Open an issue to discuss a significant change, then submit a pull request with a clear description.

## 📜 License

The original README declares an MIT License. Ensure a `LICENSE` file containing the full MIT License is present in the repository before relying on that declaration.

---

<p align="center">
  Built by <strong>Ashfaq Ahmed M</strong> as a cybersecurity and network-monitoring learning project.
</p>
