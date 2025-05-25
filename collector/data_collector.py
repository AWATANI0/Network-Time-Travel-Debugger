import paramiko
import subprocess
import re
import time
from datetime import datetime

class NetworkCollector:
    def __init__(self, db):
        self.db = db
        self.devices = self.load_devices()
    
from collector.device_manager import DeviceManager

class NetworkCollector:
    def __init__(self, db):
        self.db = db
        self.device_manager = DeviceManager()
        self.devices = self.device_manager.get_all_devices()
    
    def collect_routing_table(self, device_id):
        device = self.devices[device_id]
        
        try:
            # SSH connection
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(device['ip'], username=device['username'], 
                       password=device['password'])
            
            # Execute routing table command
            if device['type'] == 'cisco':
                stdin, stdout, stderr = ssh.exec_command('show ip route')
            elif device['type'] == 'linux':
                stdin, stdout, stderr = ssh.exec_command('ip route show')
            
            routing_data = stdout.read().decode()
            ssh.close()
            
            # Parse and save
            parsed_routes = self.parse_routing_table(routing_data, device['type'])
            self.db.save_snapshot(device_id, 'routing_table', parsed_routes)
            
            return parsed_routes
            
        except Exception as e:
            print(f"Erreur collecte {device_id}: {e}")
            return None
    
    def parse_routing_table(self, data, device_type):
        routes = []
        lines = data.split('\n')
        
        for line in lines:
            if device_type == 'cisco':
                # Parse Cisco format: "C    192.168.1.0/24 is directly connected, FastEthernet0/0"
                match = re.search(r'([CDRS*])\s+(\d+\.\d+\.\d+\.\d+/\d+)', line)
                if match:
                    routes.append({
                        'type': match.group(1),
                        'network': match.group(2),
                        'line': line.strip()
                    })
            elif device_type == 'linux':
                # Parse Linux format
                if 'via' in line or 'dev' in line:
                    routes.append({'line': line.strip()})
        
        return routes
    
    def collect_interface_stats(self, device_id):
        device = self.devices[device_id]
        
        try:
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(device['ip'], username=device['username'], 
                       password=device['password'])
            
            stdin, stdout, stderr = ssh.exec_command('show interfaces')
            interface_data = stdout.read().decode()
            ssh.close()
            
            # Parse interface statistics
            parsed_interfaces = self.parse_interfaces(interface_data)
            self.db.save_snapshot(device_id, 'interfaces', parsed_interfaces)
            
            return parsed_interfaces
            
        except Exception as e:
            print(f"Erreur interfaces {device_id}: {e}")
            return None
    
    def parse_interfaces(self, data):
        interfaces = []
        current_interface = None
        
        for line in data.split('\n'):
            # Detect interface name
            if 'Ethernet' in line or 'Serial' in line:
                if current_interface:
                    interfaces.append(current_interface)
                current_interface = {
                    'name': line.split()[0],
                    'status': 'up' if 'up' in line else 'down',
                    'stats': {}
                }
            
            # Parse statistics
            elif current_interface and 'packets input' in line:
                match = re.search(r'(\d+) packets input', line)
                if match:
                    current_interface['stats']['packets_in'] = int(match.group(1))
            
            elif current_interface and 'packets output' in line:
                match = re.search(r'(\d+) packets output', line)
                if match:
                    current_interface['stats']['packets_out'] = int(match.group(1))
        
        if current_interface:
            interfaces.append(current_interface)
        
        return interfaces
    
    def ping_test(self, target_ip):
        """Test de connectivité simple"""
        try:
            result = subprocess.run(['ping', '-c', '1', target_ip], 
                                  capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            return False
    
    def collect_connectivity(self):
        """Test de connectivité entre tous les équipements"""
        connectivity_map = {}
        
        for device_id, device in self.devices.items():
            connectivity_map[device_id] = {}
            
            for target_id, target in self.devices.items():
                if device_id != target_id:
                    is_reachable = self.ping_test(target['ip'])
                    connectivity_map[device_id][target_id] = is_reachable
        
        self.db.save_snapshot('network', 'connectivity', connectivity_map)
        return connectivity_map
