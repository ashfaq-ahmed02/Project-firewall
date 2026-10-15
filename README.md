# 🛡️ RuShield XDR — Firewall Monitoring & Threat Analysis

<p align="center">
  <strong>A Python-based firewall monitoring dashboard for network traffic visibility, rule evaluation, event logging, and threat analysis.</strong>
</p>

<p align="center">
  <a href="https://ashu-firewall.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_LIVE_DEMO-Open_Website-success?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://github.com/ashfaq-ahmed02/Project-firewall">
    <img src="https://img.shields.io/badge/GitHub-Source_Code-181717?style=for-the-badge&logo=github" alt="GitHub Repository">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/Flask-Web_API-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
  <img src="https://img.shields.io/badge/Database-SQLite%20%7C%20MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="Database">
  <img src="https://img.shields.io/badge/Networking-Scapy-2E8B57?style=for-the-badge" alt="Scapy">
</p>

---

## 🌐 Live Demo

**Try the deployed project here:**

### 👉 [Launch RuShield XDR Firewall Dashboard](https://ashu-firewall.vercel.app/)

Explore the deployed web interface and its currently available dashboard features.

**Source code:** [github.com/ashfaq-ahmed02/Project-firewall](https://github.com/ashfaq-ahmed02/Project-firewall)

> **Deployment note:** The live website demonstrates the deployed web application. Features that require local packet capture, operating-system privileges, or a separately configured database may not work on a serverless deployment such as Vercel. Actual behavior depends on the deployment configuration.

---

## 📌 About the Project

**RuShield XDR** is a Python-based cybersecurity learning project designed to demonstrate firewall-rule evaluation, network packet observation, security event logging, and dashboard visualization.

The application combines a Flask backend, database integration, and a browser-based interface to help users understand how network traffic can be examined and classified using IP and port rules.

The project also includes a Scapy-based packet sniffer for observing network packets in an authorized local environment.

### 🎯 Project Objectives

- Understand the fundamentals of network security.
- Learn how IP addresses and ports are used in traffic filtering.
- Observe network packets using Python and Scapy.
- Record and review security-related events.
- Build a web dashboard for monitoring traffic decisions.
- Practice backend development, database integration, and API design.

## ✨ Key Features

- 🔥 **Firewall Rule Evaluation** — Checks source IP addresses and destination ports against configured rules.
- 📡 **Network Packet Observation** — Uses Scapy to inspect observed IP/TCP packets.
- 📝 **Security Event Logging** — Records traffic decisions and related event information.
- 🗄️ **Database Integration** — Uses SQLite by default, with optional MySQL support.
- 🌐 **Web Dashboard** — Provides a browser-based interface using Flask and frontend technologies.
- 📊 **Traffic Statistics** — Displays summaries derived from recorded events.
- 🚨 **Threat Indicators** — Presents rule-based or demonstration security assessments.
- ⚙️ **Port Filtering Logic** — Evaluates traffic against configured port rules.
- 📈 **Dashboard Visualizations** — Presents security information in a more understandable format.
- ☁️ **Web Deployment** — Includes a deployed website that can be accessed through the live demo link.

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Programming Language | Python |
| Backend Framework | Flask |
| Database | SQLite, optional MySQL |
| Packet Observation | Scapy |
| Frontend | HTML5, CSS3, JavaScript |
| Web Server / Deployment | Vercel for the deployed web interface |
| Version Control | Git and GitHub |
| Development Tools | VS Code |

## 🏗️ System Architecture

```text
        Network Traffic / Test Data
                    |
                    v
             Packet Observation
                 (Scapy)
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
             SQLite / MySQL
                    |
                    v
              Flask Backend
                    |
                    v
              Web Dashboard
                    |
                    v
               User Browser
```

### 🔄 How It Works

1. The packet-sniffing component observes network packets in an authorized environment.
2. The application extracts relevant information, such as the source IP address and destination port.
3. The rule-checking component evaluates the available IP and port rules.
4. The application assigns an `ALLOWED` or `BLOCKED` verdict according to its configured logic.
5. The event logger records the decision.
6. The dashboard displays the available logs and statistics.

> **Important:** The current rule-checking logic records traffic verdicts. A `BLOCKED` verdict does not, by itself, mean that the operating system or network interface dropped the packet.

## 📂 Project Structure

```text
Project-firewall/
│
├── static/
│   ├── css/
│   │   └── style.css
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
├── requirements.txt
└── README.md
```

## 🚀 Run the Project Locally

### Prerequisites

- Python 3.10 or newer
- Git
- A modern web browser
- Optional: Scapy for packet observation
- Optional: MySQL server for MySQL database support

### Step 1: Clone the repository

```bash
git clone https://github.com/ashfaq-ahmed02/Project-firewall.git
cd Project-firewall
```

### Step 2: Create a virtual environment

**Windows PowerShell**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows Command Prompt**

```bat
.venv\Scripts\activate.bat
```

**Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Step 3: Install dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

The current `requirements.txt` contains Flask and Werkzeug. To use the packet sniffer, install Scapy separately:

```bash
pip install scapy
```

For optional MySQL support:

```bash
pip install mysql-connector-python
```

### Step 4: Start the Flask application

```bash
python dashboard.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000
```

### Step 5: Run the packet sniffer (optional)

Open a second terminal, activate your virtual environment, and run:

```bash
python sniffer.py
```

Packet capture may require additional permissions and the correct network interface. Only monitor devices and networks you own or are explicitly authorized to test.

Stop the sniffer using `Ctrl+C`.

## 🗄️ Database Configuration

### SQLite

SQLite is the default database option. It does not require a separate database server, making it convenient for local development.

### Optional MySQL Configuration

The application supports optional MySQL configuration through environment variables.

| Variable | Purpose |
|---|---|
| `USE_MYSQL` | Enables the MySQL connection path |
| `DB_HOST` | MySQL server hostname |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |

**Example — Windows PowerShell**

```powershell
$env:USE_MYSQL = "true"
$env:DB_HOST = "localhost"
$env:DB_USER = "firewall_user"
$env:DB_PASSWORD = "your-local-password"
$env:DB_NAME = "firewall_db"

python dashboard.py
```

**Example — Linux**

```bash
export USE_MYSQL=true
export DB_HOST=localhost
export DB_USER=firewall_user
export DB_PASSWORD='your-local-password'
export DB_NAME=firewall_db

python dashboard.py
```

Create the database and configure the necessary permissions before enabling MySQL.

**Security:** Never commit real passwords, API keys, or other secrets to GitHub. Use environment variables and deployment secrets.

## 🌐 API Endpoints

The documented Flask endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Loads the dashboard |
| `GET` | `/api/logs` | Retrieves firewall log data |
| `GET` | `/api/stats` | Retrieves dashboard statistics |

Check `dashboard.py` for the exact route definitions, query parameters, and response formats.

Example local requests:

```bash
curl http://127.0.0.1:5000/api/logs
```

```bash
curl http://127.0.0.1:5000/api/stats
```

These examples assume the Flask application is running locally and the endpoints are available.

## 🔐 Security Considerations

- **Monitoring vs. enforcement:** Rule evaluation does not automatically install operating-system firewall rules or guarantee that packets are dropped.
- **Authorized monitoring:** Use packet capture only on systems and networks you have permission to inspect.
- **Credentials:** Store secrets in environment variables or a secure secret manager.
- **Dashboard protection:** Add authentication and authorization before exposing sensitive controls to untrusted users.
- **Input validation:** Validate user-supplied IP addresses, ports, and other inputs.
- **Production deployment:** Use secure configuration, appropriate logging, error handling, and a production-ready server setup.
- **Demo data:** Treat simulated threat indicators or illustrative IP locations as demonstrations unless they are verified against a reliable data source.
- **Privacy:** Avoid collecting or retaining unnecessary network information.

## ☁️ Deployment

The project has a deployed web interface available at:

**Live URL:** https://ashu-firewall.vercel.app/

**Deployment platform:** Vercel

When deploying or updating the project:

1. Push the latest project changes to GitHub.
2. Confirm that Vercel is connected to the correct repository and branch.
3. Configure the required environment variables in the deployment settings.
4. Verify that the configured build and start process matches the application's architecture.
5. Test the deployed routes and dashboard after deployment.

### Deployment Limitation

Vercel serverless deployments do not provide the same environment as a continuously running machine with direct network-interface access. Consequently, packet sniffing and local firewall enforcement generally require a separate host or service designed for those tasks.

SQLite files written to temporary or ephemeral storage may also not persist reliably between serverless executions. A persistent database is more appropriate if the deployed application needs durable logs.

## 🧪 Testing

Run the test script included in the repository:

```bash
python test.py
```

If you add a pytest-based test suite, install pytest and run:

```bash
pip install pytest
pytest
```

Document test results only after running the relevant tests.

## 🛣️ Future Improvements

- [ ] Add automated tests for IP and port rule evaluation.
- [ ] Make port policies and default rules configurable.
- [ ] Add authentication and role-based access control.
- [ ] Improve input validation and error handling.
- [ ] Add persistent database support for deployed environments.
- [ ] Add structured logs and log-retention settings.
- [ ] Integrate verified threat-intelligence sources.
- [ ] Improve reporting and alert notifications.
- [ ] Add an authorized, platform-specific OS firewall enforcement module.
- [ ] Separate simulated events from live network observations.
- [ ] Improve deployment documentation and monitoring.

## 🎓 Skills Demonstrated

- Python programming
- Flask web application development
- REST API fundamentals
- Network packet observation with Scapy
- IP and port rule evaluation
- SQLite and MySQL integration
- Security event logging
- HTML, CSS, and JavaScript
- Git and GitHub
- Web application deployment
- Cybersecurity fundamentals

## 👨‍💻 Author

**Ashfaq Ahmed M**

Computer Science Engineering Student | Network Security | Python | Cybersecurity

- **GitHub:** [@ashfaq-ahmed02](https://github.com/ashfaq-ahmed02)
- **Project Repository:** [Project-firewall](https://github.com/ashfaq-ahmed02/Project-firewall)
- **Live Demo:** [ashu-firewall.vercel.app](https://ashu-firewall.vercel.app/)
- **LinkedIn:** [Ashfaq Ahmed M](https://www.linkedin.com/in/ashfaq-ahmed-m-b3a49a2a5/)

## 🤝 Contributing

Suggestions, bug reports, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make and test your changes.
4. Submit a pull request with a clear description.

## 📜 License

Add a `LICENSE` file to the repository if you want to distribute this project under a specific open-source license. Make sure the README and license file agree.

---

<p align="center">
  <strong>Built by Ashfaq Ahmed M</strong>
  <br>
  Exploring Network Security, Python, and Cybersecurity.
  <br><br>
  🚀 <a href="https://ashu-firewall.vercel.app/">Live Demo</a> ·
  💻 <a href="https://github.com/ashfaq-ahmed02/Project-firewall">GitHub Repository</a>
</p>
