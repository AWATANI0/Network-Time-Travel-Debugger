import time
import threading
from datetime import datetime
from collector.database import NetworkDB
from collector.data_collector import NetworkCollector

class NetworkMonitor:
    def __init__(self):
        self.db = NetworkDB()
        self.collector = NetworkCollector(self.db)
        self.running = False
        self.collection_interval = 30  # 30 secondes
    
    def start_monitoring(self):
        self.running = True
        
        # Thread pour collecte périodique
        collection_thread = threading.Thread(target=self.collection_loop)
        collection_thread.start()
        
        print("Monitoring démarré...")
        print(f"Collecte toutes les {self.collection_interval} secondes")
    
    def collection_loop(self):
        while self.running:
            try:
                print(f"[{datetime.now()}] Collecte en cours...")
                
                # Collecte pour chaque équipement
                for device_id in self.collector.devices.keys():
                    print(f"  - Collecte {device_id}")
                    
                    # Table de routage
                    self.collector.collect_routing_table(device_id)
                    
                    # Statistiques interfaces
                    self.collector.collect_interface_stats(device_id)
                
                # Test de connectivité globale
                self.collector.collect_connectivity()
                
                print("  Collecte terminée\n")
                
            except Exception as e:
                print(f"Erreur pendant la collecte: {e}")
            
            time.sleep(self.collection_interval)
    
    def stop_monitoring(self):
        self.running = False
        print("Monitoring arrêté")

if __name__ == "__main__":
    monitor = NetworkMonitor()
    
    try:
        monitor.start_monitoring()
        
        # Garder le programme actif
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        monitor.stop_monitoring()
