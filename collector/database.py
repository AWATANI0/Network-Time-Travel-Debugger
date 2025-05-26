import sqlite3
import json
from datetime import datetime
import os  

class NetworkDB:
    def __init__(self, db_path='database/network_history.db'):
        # Créer le répertoire si inexistant
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Table pour les snapshots généraux
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            device_id TEXT,
            snapshot_type TEXT,
            data TEXT
        )
        ''')
        
        # Table pour les métriques
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            device_id TEXT,
            metric_name TEXT,
            metric_value REAL
        )
        ''')
        
        # Table pour les événements
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME,
            event_type TEXT,
            device_id TEXT,
            description TEXT,
            severity INTEGER
        )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_snapshot(self, device_id, snapshot_type, data):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        INSERT INTO snapshots (timestamp, device_id, snapshot_type, data)
        VALUES (?, ?, ?, ?)
        ''', (datetime.now(), device_id, snapshot_type, json.dumps(data)))
        
        conn.commit()
        conn.close()
