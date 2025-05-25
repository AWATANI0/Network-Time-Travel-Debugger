# 🕰️ Network Time Travel Debugger

A smart Python-based tool to **track, visualize, and debug network behavior over time**, simulating network changes and failures using GNS3.

---

## 🧠 Project Overview

**Network Time Travel Debugger** is a powerful network analysis tool designed to:

- 👁️ Monitor routing tables, interfaces, and connectivity
- 📊 Compare network states between different timestamps
- 🧭 Detect configuration changes, interface drops, and routing anomalies
- 🌐 Provide a clean and interactive **web interface** for analysis
- 🔁 Automatically collect data every 30 seconds

The project combines:
- Python (Flask, SQLite, Paramiko, Netmiko, Scapy)
- Network simulation via **GNS3**
- A full-stack dashboard (HTML, CSS, JavaScript)

---

## 🚀 How It Works

1. You create a simulated network in **GNS3** (routers, switches, PCs).
2. Python connects to each device (via SSH) and runs:
   - `show ip route` (routing table)
   - `show interfaces` (interface stats)
   - Ping tests between devices
3. The data is stored in a local **SQLite database**.
4. A **Flask web server** displays the historical data, changes, and timeline.

---

## 📁 Project Structure

network-time-travel-debugger/
├── main_collector.py           # ✅ Main script that launches the data collection
│
├── collector/                  # 📦 Data collection module
│   ├── __init__.py             # Declares the folder as a Python package
│   ├── data_collector.py       # Contains the SSH logic to collect routing/interface info
│   ├── database.py             # Initializes and manages the SQLite database
│   └── device_manager.py       # (Optional) Loads device settings from devices.json
│
├── config/                     # ⚙️ Configuration files
│   └── devices.json            # List of monitored devices (IP, username, password, type)
│
├── database/                   # 💾 Persistent data
│   └── network_history.db      # SQLite database file (auto-generated)
│
├── web/                        # 🌐 Web interface (Flask)
│   ├── site.html               # Main HTML page (should be renamed to index.html)
│   ├── site.css                # CSS stylesheet
│   └── site.js                 # JavaScript logic for dynamic content
│
└── README.md                   # 📘 Project description for GitHub (to be added)

