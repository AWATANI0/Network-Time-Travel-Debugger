class NetworkTimeTravel {
    constructor() {
        this.timelineData = [];
        this.currentTimeIndex = 0;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadDevices();
        this.loadTimelineData();
    }
    
    setupEventListeners() {
        document.getElementById('timeRange').addEventListener('change', () => {
            this.loadTimelineData();
        });
        
        document.getElementById('timeSlider').addEventListener('input', (e) => {
            const index = Math.floor((e.target.value / 100) * (this.timelineData.length - 1));
            this.showNetworkStateAtIndex(index);
        });
        
        document.getElementById('compareBtn').addEventListener('click', () => {
            this.compareStates();
        });
    }
    
    async loadDevices() {
        try {
            const response = await fetch('/api/devices');
            const devices = await response.json();
            
            const deviceFilter = document.getElementById('deviceFilter');
            deviceFilter.innerHTML = '<option value="">Tous les équipements</option>';
            
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device;
                option.textContent = device;
                deviceFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Erreur chargement équipements:', error);
        }
    }
    
    async loadTimelineData() {
        try {
            const hours = document.getElementById('timeRange').value;
            const response = await fetch(`/api/timeline?hours=${hours}`);
            this.timelineData = await response.json();
            
            this.updateTimeLabels();
            this.showLatestState();
        } catch (error) {
            console.error('Erreur chargement timeline:', error);
        }
    }
    
    updateTimeLabels() {
        if (this.timelineData.length === 0) return;
        
        const startTime = new Date(this.timelineData[0].timestamp).toLocaleString();
        const endTime = new Date(this.timelineData[this.timelineData.length - 1].timestamp).toLocaleString();
        
        document.getElementById('startTime').textContent = startTime;
        document.getElementById('endTime').textContent = endTime;
    }
    
    showLatestState() {
        if (this.timelineData.length > 0) {
            this.showNetworkStateAtIndex(this.timelineData.length - 1);
        }
    }
    
    showNetworkStateAtIndex(index) {
        if (index < 0 || index >= this.timelineData.length) return;
        
        this.currentTimeIndex = index;
        const snapshot = this.timelineData[index];
        
        // Mettre à jour l'affichage du temps sélectionné
        const selectedTime = new Date(snapshot.timestamp).toLocaleString();
        document.getElementById('selectedTime').textContent = selectedTime;
        document.getElementById('currentTime').textContent = selectedTime;
        
        // Grouper les données par équipement
        const deviceStates = this.groupSnapshotsByDevice(index);
        this.displayNetworkState(deviceStates);
        
        // Détecter les changements
        this.detectAndDisplayChanges(index);
    }
    
    groupSnapshotsByDevice(index) {
        const deviceStates = {};
        const currentTime = this.timelineData[index].timestamp;
        
        // Récupérer tous les snapshots à ce moment
        const snapshots = this.timelineData.filter(item => 
            item.timestamp === currentTime
        );
        
        snapshots.forEach(snapshot => {
            if (!deviceStates[snapshot.device_id]) {
                deviceStates[snapshot.device_id] = {};
            }
            deviceStates[snapshot.device_id][snapshot.type] = snapshot.data;
        });
        
        return deviceStates;
    }
    
    displayNetworkState(deviceStates) {
        const networkStateDiv = document.getElementById('networkState');
        networkStateDiv.innerHTML = '';
        
        Object.keys(deviceStates).forEach(deviceId => {
            const deviceDiv = document.createElement('div');
            deviceDiv.className = 'device-state';
            
            let deviceHtml = `<h4>📡 ${deviceId}</h4>`;
            
            // Afficher la table de routage
            if (deviceStates[deviceId].routing_table) {
                deviceHtml += '<h5>Table de routage:</h5>';
                deviceHtml += '<div class="route-table">';
                deviceStates[deviceId].routing_table.forEach(route => {
                    deviceHtml += `${route.line || JSON.stringify(route)}<br>`;
                });
                deviceHtml += '</div>';
            }
            
            // Afficher les interfaces
            if (deviceStates[deviceId].interfaces) {
                deviceHtml += '<h5>Interfaces:</h5>';
                deviceStates[deviceId].interfaces.forEach(iface => {
                    const status = iface.status === 'up' ? '🟢' : '🔴';
                    deviceHtml += `<div>${status} ${iface.name} - ${iface.status}</div>`;
                });
            }
            
            // Afficher la connectivité
            if (deviceStates[deviceId].connectivity) {
                deviceHtml += '<h5>Connectivité:</h5>';
                Object.keys(deviceStates[deviceId].connectivity).forEach(target => {
                    const status = deviceStates[deviceId].connectivity[target] ? '✅' : '❌';
                    deviceHtml += `<div>${status} vers ${target}</div>`;
                });
            }
            
            deviceDiv.innerHTML = deviceHtml;
            networkStateDiv.appendChild(deviceDiv);
        });
    }
    
    detectAndDisplayChanges(currentIndex) {
        const changesDiv = document.getElementById('changesList');
        changesDiv.innerHTML = '';
        
        if (currentIndex === 0) {
            changesDiv.innerHTML = '<p>Premier snapshot - aucun changement à détecter</p>';
            return;
        }
        
        // Comparer avec le snapshot précédent
        const currentStates = this.groupSnapshotsByDevice(currentIndex);
        const previousStates = this.groupSnapshotsByDevice(currentIndex - 1);
        
        const changes = this.findChanges(previousStates, currentStates);
        
        if (changes.length === 0) {
            changesDiv.innerHTML = '<p>✅ Aucun changement détecté</p>';
            return;
        }
        
        changes.forEach(change => {
            const changeDiv = document.createElement('div');
            changeDiv.className = `change-item ${change.type}`;
            
            let changeHtml = `<strong>${change.device_id}</strong> - ${change.description}`;
            if (change.details) {
                changeHtml += `<div style="margin-top: 5px; font-size: 12px;">${change.details}</div>`;
            }
            
            changeDiv.innerHTML = changeHtml;
            changesDiv.appendChild(changeDiv);
        });
    }
    findChanges(previousStates, currentStates) {
        const changes = [];
        
        // Vérifier chaque équipement
        Object.keys(currentStates).forEach(deviceId => {
            const currentDevice = currentStates[deviceId];
            const previousDevice = previousStates[deviceId];
            
            if (!previousDevice) {
                changes.push({
                    type: 'added',
                    device_id: deviceId,
                    description: 'Nouvel équipement détecté'
                });
                return;
            }
            
            // Comparer les tables de routage
            if (currentDevice.routing_table && previousDevice.routing_table) {
                const routeChanges = this.compareRoutingTables(
                    previousDevice.routing_table,
                    currentDevice.routing_table
                );
                
                routeChanges.forEach(change => {
                    changes.push({
                        type: change.type,
                        device_id: deviceId,
                        description: `Changement de routage - ${change.description}`,
                        details: change.details
                    });
                });
            }
            
            // Comparer les interfaces
            if (currentDevice.interfaces && previousDevice.interfaces) {
                const interfaceChanges = this.compareInterfaces(
                    previousDevice.interfaces,
                    currentDevice.interfaces
                );
                
                interfaceChanges.forEach(change => {
                    changes.push({
                        type: change.type,
                        device_id: deviceId,
                        description: `Interface ${change.interface} - ${change.description}`,
                        details: change.details
                    });
                });
            }
            
            // Comparer la connectivité
            if (currentDevice.connectivity && previousDevice.connectivity) {
                const connectivityChanges = this.compareConnectivity(
                    previousDevice.connectivity,
                    currentDevice.connectivity
                );
                
                connectivityChanges.forEach(change => {
                    changes.push({
                        type: change.type,
                        device_id: deviceId,
                        description: `Connectivité vers ${change.target} - ${change.description}`
                    });
                });
            }
        });
        
        // Vérifier les équipements supprimés
        Object.keys(previousStates).forEach(deviceId => {
            if (!currentStates[deviceId]) {
                changes.push({
                    type: 'removed',
                    device_id: deviceId,
                    description: 'Équipement supprimé ou inaccessible'
                });
            }
        });
        
        return changes;
    }
    
    compareRoutingTables(previous, current) {
        const changes = [];
        const previousRoutes = new Set(previous.map(r => r.line || JSON.stringify(r)));
        const currentRoutes = new Set(current.map(r => r.line || JSON.stringify(r)));
        
        // Routes ajoutées
        currentRoutes.forEach(route => {
            if (!previousRoutes.has(route)) {
                changes.push({
                    type: 'added',
                    description: 'Route ajoutée',
                    details: route
                });
            }
        });
        
        // Routes supprimées
        previousRoutes.forEach(route => {
            if (!currentRoutes.has(route)) {
                changes.push({
                    type: 'removed',
                    description: 'Route supprimée',
                    details: route
                });
            }
        });
        
        return changes;
    }
    
    compareInterfaces(previous, current) {
        const changes = [];
        const previousMap = new Map(previous.map(i => [i.name, i]));
        const currentMap = new Map(current.map(i => [i.name, i]));
        
        // Interfaces modifiées
        currentMap.forEach((currentIface, name) => {
            const previousIface = previousMap.get(name);
            
            if (!previousIface) {
                changes.push({
                    type: 'added',
                    interface: name,
                    description: 'Interface ajoutée'
                });
            } else if (previousIface.status !== currentIface.status) {
                changes.push({
                    type: 'modified',
                    interface: name,
                    description: `Changement de statut: ${previousIface.status} → ${currentIface.status}`
                });
            }
        });
        
        // Interfaces supprimées
        previousMap.forEach((previousIface, name) => {
            if (!currentMap.has(name)) {
                changes.push({
                    type: 'removed',
                    interface: name,
                    description: 'Interface supprimée'
                });
            }
        });
        
        return changes;
    }
    
    compareConnectivity(previous, current) {
        const changes = [];
        
        Object.keys(current).forEach(target => {
            if (previous[target] !== current[target]) {
                changes.push({
                    type: current[target] ? 'added' : 'removed',
                    target: target,
                    description: current[target] ? 'Connexion rétablie' : 'Connexion perdue'
                });
            }
        });
        
        return changes;
    }
    
    async compareStates() {
        const time1 = document.getElementById('compareTime1').value;
        const time2 = document.getElementById('compareTime2').value;
        
        if (!time1 || !time2) {
            alert('Veuillez sélectionner deux moments à comparer');
            return;
        }
        
        try {
            const response = await fetch(
                `/api/compare?timestamp1=${time1}&timestamp2=${time2}&type=routing_table`
            );
            const differences = await response.json();
            
            this.displayComparison(differences);
        } catch (error) {
            console.error('Erreur comparaison:', error);
        }
    }
    
    displayComparison(differences) {
        const resultDiv = document.getElementById('comparisonResult');
        resultDiv.innerHTML = '<h3>Résultats de la comparaison:</h3>';
        
        if (differences.length === 0) {
            resultDiv.innerHTML += '<p>Aucune différence détectée</p>';
            return;
        }
        
        differences.forEach(diff => {
            const diffDiv = document.createElement('div');
            diffDiv.className = 'device-state';
            
            let diffHtml = `<h4>🔍 ${diff.device_id}</h4>`;
            
            diff.changes.forEach(change => {
                diffHtml += `<div class="change-item ${change.type}">`;
                diffHtml += `<strong>${change.type.toUpperCase()}:</strong><br>`;
                
                change.items.forEach(item => {
                    diffHtml += `<code>${item}</code><br>`;
                });
                
                diffHtml += '</div>';
            });
            
            diffDiv.innerHTML = diffHtml;
            resultDiv.appendChild(diffDiv);
        });
    }
 }
 
 // Initialiser l'application quand la page est chargée
 document.addEventListener('DOMContentLoaded', () => {
    new NetworkTimeTravel();
 });
