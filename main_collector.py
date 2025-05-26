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
        self.collection_interval = 30  # Intervalle de collecte en secondes

    def start_monitoring(self):
        self.running = True
        collection_thread = threading.Thread(target=self.collection_loop)
        collection_thread.start()
        print("✅ Monitoring démarré...")
        print(f"⏱️ Collecte toutes les {self.collection_interval} secondes.")

    def collection_loop(self):
        while self.running:
            try:
                print(f"[{datetime.now()}] 🔄 Début de la collecte...")

                for device_id in self.collector.devices.keys():
                    print(f"  📡 Collecte des données depuis {device_id}")
                    self.collector.collect_routing_table(device_id)
                    self.collector.collect_interface_stats(device_id)

                self.collector.collect_connectivity()
                print("✅ Collecte terminée.\n")

            except Exception as e:
                print(f"❌ Erreur pendant la collecte : {e}")

            time.sleep(self.collection_interval)

    def stop_monitoring(self):
        self.running = False
        print("🛑 Monitoring arrêté.")

# ---------------------------------------------------------------
# ✅ Point d'entrée du script principal
# ---------------------------------------------------------------
if __name__ == "__main__":
    db = NetworkDB()
    collector = NetworkCollector(db)

    print("📥 Collecte initiale des tables de routage :")
    for device_id in collector.devices:
        result = collector.collect_routing_table(device_id)
        print(f"\n--- 📄 Table de routage pour {device_id} ---")
        print(result)

    print("\n📥 Collecte initiale des interfaces :")
    for device_id in collector.devices:
        result = collector.collect_interface_stats(device_id)
        print(f"\n--- 📄 Statistiques des interfaces pour {device_id} ---")
        print(result)

    print("\n🌐 Test de connectivité entre les équipements :")
    result = collector.collect_connectivity()
    print(result)

    try:
        monitor = NetworkMonitor()
        monitor.start_monitoring()

        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        monitor.stop_monitoring()
