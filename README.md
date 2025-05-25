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
├── main_collector.py             # ✅ Script principal qui lance la collecte
│
├── collector/                    # 📦 Partie "collecte de données"
│   ├── __init__.py               # Déclare le dossier comme un module Python
│   ├── data_collector.py         # Contient la logique SSH pour récupérer les infos réseau
│   ├── database.py               # Initialise et gère la base de données SQLite
│   └── device_manager.py         # (optionnel) gestion des devices à partir de devices.json
│
├── config/                       # ⚙️ Fichiers de configuration
│   └── devices.json              # Liste des équipements à surveiller (IP, login, type)
│
├── database/                     # 💾 Données persistantes
│   └── network_history.db        # Base de données SQLite (créée automatiquement)
│
├── web/                          # 🌐 Interface Web (Flask)
│   ├── site.html                 # Page principale HTML (équivalent à index.html)
│   ├── site.css                  # Feuille de style CSS
│   └── site.js                   # Logique JS pour l'affichage dynamique
│
└── README.md                     # 📘 Présentation du projet pour GitHub (à ajouter)
