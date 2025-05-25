import os
import json

class DeviceManager:
    def __init__(self, config_file=None):
        if config_file:
            self.config_path = config_file
        else:
            self.config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'devices.json')
            self.config_path = os.path.abspath(self.config_path)
        
        self.devices = self.load_devices()
    
    def load_devices(self):
        try:
            with open(self.config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"❌ Error loading devices: {e}")
            return {}
    
    def get_all_devices(self):
        return self.devices
    
    def get_device(self, device_id):
        return self.devices.get(device_id, None)

    def add_device(self, device_id, device_info):
        self.devices[device_id] = device_info
        self.save_devices()
    
    def save_devices(self):
        try:
            with open(self.config_path, 'w') as f:
                json.dump(self.devices, f, indent=4)
        except Exception as e:
            print(f"❌ Error saving devices: {e}")
