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

```plaintext
network-time-travel-debugger/
├── main_collector.py           # ✅ Main script that launches the data collection
│
├── collector/                  # 📦 Data collection module
│   ├── __init__.py             # Declares the folder as a Python package
│   ├── data_collector.py       # SSH logic for routing/interface info
│   ├── database.py             # Manages SQLite database
│   └── device_manager.py       # (Optional) Loads devices.json
│
├── config/                     # ⚙️ Configuration files
│   └── devices.json            # Device list (IP, credentials, type)
│
├── database/                   # 💾 Persistent data
│   └── network_history.db      # SQLite DB (auto-generated)
│
├── web/                        # 🌐 Web interface (Flask)
│   ├── site.html               # Main HTML page (à renommer en index.html)
│   ├── site.css                # CSS stylesheet
│   └── site.js                 # JavaScript logic
│
└── README.md                   # 📘 Project documentation
```
---

## ⚙️ Requirements

✅ You need more than just Python:

| Tool / Tech        | Purpose                                          |
|--------------------|--------------------------------------------------|
| 🐍 Python 3.10+    | Run scripts and collect network data             |
| 📦 pip             | Install Python packages                          |
| 🧪 GNS3            | Simulate network devices and scenarios           |
| 💻 Wireshark       | (Optional) Inspect real-time traffic             |
| 🌐 Web browser     | Access the web interface (http://localhost:5000) |

---

## 📦 Required Python Packages

Install with pip:

```bash
pip install flask paramiko netmiko scapy pandas matplotlib scikit-learn aiohttp
```
Or use the requirements file:

Sample `requirements.txt`:
```bash
nginx
Copy
Edit
flask
paramiko
netmiko
scapy
pandas
matplotlib
scikit-learn
aiohttp
```

```bash
pip install -r requirements.txt
```

---

## 🛠️ Installation Steps
### 1. Clone the repository

```bash
git clone https://github.com/AWATANI0/Network-Time-Travel-Debugger.git
cd network-time-travel-debugger
```

### 2. Set up the folders
Make sure this structure exists:

```bash
mkdir -p collector database config web/static web/templates
touch collector/__init__.py
```
### 3. Configure Devices
Edit `config/devices.json`:

```json
{  
  "router1": {  
    "ip": "192.168.1.1",  
    "username": "admin",  
    "password": "admin",  
    "type": "cisco"  
  }  
}  
```

### 4. Run the main collector

```bash
python main_collector.py
```

### 5. Launch the web interface
In a new terminal:

```bash
cd Network-Time-Travel-Debugger/web/
python -m http.server 8000
```
Visit http://localhost:8000 in your browser.

---
## 🧪 Test Scenarios

Pre-built scripts to validate detection capabilities:

Scenario       |      	Command	                           |   Effect
---------------|--------------------------------------------|-----------------------
Router failure |	python tests/scenarios/router_failure.py	| Shuts down an interface
Route hijack	|  python tests/scenarios/route_change.py	   | Adds/removes static routes
Traffic flood	|  python tests/scenarios/link_flood.py	   | Saturates a link with ICMP

---
## 🔒 Security Notes
SSH credentials should be protected (you can move them to devices.json)
Avoid using default passwords in production

## 🤝 Contributing
Pull requests and contributions are welcome! Fork this repo and feel free to suggest improvements, new features, or bug fixes.

## 📜 License
MIT License – free to use, modify, and distribute.

## 🙌 Author
Created  by Abdellah TAHIRI
