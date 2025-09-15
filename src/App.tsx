import React, { useState } from 'react';
import { Network } from 'lucide-react';
import { Canvas } from './components/Canvas';
import { City, Connection } from './types';

function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const [selectedCityId, setSelectedCityId] = useState<string>('');

  const handleUpdateCity = (updatedCity: City) => {
    const cityExists = cities.some(city => city.id === updatedCity.id);
    
    if (cityExists) {
      // Update existing city
      setCities(cities.map(city => 
        city.id === updatedCity.id ? updatedCity : city
      ));
    } else {
      // Add new city
      setCities([...cities, updatedCity]);
    }
  };

  const handleDeleteCity = (cityId: string) => {
    setCities(cities.filter(city => city.id !== cityId));
    setConnections(connections.filter(conn => 
      conn.fromCityId !== cityId && conn.toCityId !== cityId
    ));
  };

  const handleAddConnection = (connection: Omit<Connection, 'id'>) => {
    const newConnection: Connection = {
      ...connection,
      id: Date.now().toString(),
      type: 'road'
    };
    setConnections([...connections, newConnection]);
  };

  const handleDeleteConnection = (connectionId: string) => {
    setConnections(connections.filter(conn => conn.id !== connectionId));
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Network className="text-blue-500" size={28} />
            <h1 className="text-2xl font-bold text-gray-800">City Network Editor</h1>
          </div>
          
          <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm text-gray-600">
            {cities.length} cities • {connections.length} connections
          </div>
        </div>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        <Canvas
          cities={cities}
          connections={connections}
          onUpdateCity={handleUpdateCity}
          onDeleteCity={handleDeleteCity}
          onAddConnection={handleAddConnection}
          onDeleteConnection={handleDeleteConnection}
          onSelectCity={setSelectedCityId}
          selectedCityId={selectedCityId}
        />
        
      </div>

      {/* Add City Modal */}
    </div>
  );
}

export default App;