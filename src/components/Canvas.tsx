import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CityNode } from './CityNode';
import { ConnectionLine } from './ConnectionLine';
import { Sidebar } from './Sidebar';
import { FlowInfo } from './FlowInfo';
import { INDIAN_CITIES } from '../constants/cities';
import { City, Connection, DragState, ConnectionState, Position, CityBase } from '../types';
import { Download } from 'lucide-react';

interface CanvasProps {
  cities: City[];
  connections: Connection[];
  onUpdateCity: (city: City) => void;
  onDeleteCity: (cityId: string) => void;
  onAddConnection: (connection: Omit<Connection, 'id'>) => void;
  onDeleteConnection: (connectionId: string) => void;
  onSelectCity: (cityId: string) => void;
  selectedCityId: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  cities,
  connections,
  onUpdateCity,
  onDeleteCity,
  onAddConnection,
  onDeleteConnection,
  onSelectCity,
  selectedCityId
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  // Always show all cities in the sidebar
  const availableCities = useMemo(() => {
    return INDIAN_CITIES;
  }, []);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedCityId: null,
    dragOffset: { x: 0, y: 0 }
  });
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    fromCityId: null,
    toCityId: null
  });
  
  // State for source and sink cities
  const [sourceCityId, setSourceCityId] = useState<string | null>(() => {
    // Initialize with the first city that is a source, if any
    const source = cities.find(city => city.isSource);
    return source?.id || null;
  });
  
  const [sinkCityId, setSinkCityId] = useState<string | null>(() => {
    // Initialize with the first city that is a sink, if any
    const sink = cities.find(city => city.isSink);
    return sink?.id || null;
  });

  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const updateSize = useCallback(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newSize = {
        width: rect.width,
        height: rect.height
      };
      console.log('Canvas size updated:', newSize);
      setCanvasSize(newSize);
    } else {
      console.warn('Canvas ref is not available');
    }
  }, [canvasRef]);

  useEffect(() => {
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [updateSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent, cityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const city = cities.find(c => c.id === cityId);
    if (!city) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Store initial positions and state
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...city.position };
    
    // Update drag state
    setDragState({
      isDragging: true,
      draggedCityId: cityId,
      dragOffset: {
        x: startX - rect.left - city.position.x,
        y: startY - rect.top - city.position.y
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      
      // Get the latest city data from state
      const currentCity = cities.find(c => c.id === cityId);
      if (!currentCity) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const offsetX = e.clientX - startX;
      const offsetY = e.clientY - startY;
      
      const newX = Math.max(75, Math.min(canvasSize.width - 75, startPos.x + offsetX));
      const newY = Math.max(75, Math.min(canvasSize.height - 75, startPos.y + offsetY));
      
      // Only update if position changed
      if (newX !== currentCity.position.x || newY !== currentCity.position.y) {
        onUpdateCity({
          ...currentCity,
          position: { x: newX, y: newY }
        });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.stopPropagation();
      setDragState({
        isDragging: false,
        draggedCityId: null,
        dragOffset: { x: 0, y: 0 }
      });
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
    
    // Return cleanup function
    return cleanup;
  }, [cities, onUpdateCity, canvasSize]);

  // Remove the old handleMouseMove and handleMouseUp functions as they're now handled within handleMouseDown

  const handleCityClick = useCallback((e: React.MouseEvent, cityId: string) => {
    e.stopPropagation();
    onSelectCity(cityId);
    
    if (connectionState.isConnecting) {
      if (connectionState.fromCityId && connectionState.fromCityId !== cityId) {
        // Create connection
        const existingConnection = connections.find(
          conn => 
            (conn.fromCityId === connectionState.fromCityId && conn.toCityId === cityId) ||
            (conn.fromCityId === cityId && conn.toCityId === connectionState.fromCityId)
        );

        if (!existingConnection) {
          onAddConnection({
            fromCityId: connectionState.fromCityId,
            toCityId: cityId
          });
        }
        
        setConnectionState({
          isConnecting: false,
          fromCityId: null
        });
      } else if (connectionState.fromCityId === cityId) {
        // Cancel connection
        setConnectionState({
          isConnecting: false,
          fromCityId: null
        });
      } else {
        // Start connection
        setConnectionState({
          isConnecting: true,
          fromCityId: cityId
        });
      }
    } else {
      // Start connection mode
      setConnectionState({
        isConnecting: true,
        fromCityId: cityId
      });
    }
  }, [connectionState, connections, onAddConnection, onSelectCity]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (connectionState.isConnecting) {
      setConnectionState({ isConnecting: false, fromCityId: null });
    }
  }, [connectionState]);

  // Mouse up is now handled within handleMouseDown

  // Handle drag start for cities in the sidebar
  const handleDragStart = useCallback((e: React.DragEvent, city: CityBase) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(city));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas ref is null');
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('Drop at coordinates:', { x, y, clientX: e.clientX, clientY: e.clientY, rect });
    
    try {
      const cityData = JSON.parse(e.dataTransfer.getData('text/plain')) as CityBase;
      console.log('Dropped city data:', cityData);
      
      // Always create a new city with a unique ID and all properties
      const newCity: City = {
        ...cityData,  // Spread all properties from cityData
        id: uuidv4(), // Generate a new unique ID
        position: { x, y } // Set the new position
      };
      
      // Ensure required fields are set
      if (!newCity.country) newCity.country = '';
      if (!newCity.population) newCity.population = 0;
      
      console.log('Adding new city:', newCity);
      onUpdateCity(newCity);
    } catch (error) {
      console.error('Error processing dropped city:', error);
    }
  };

  const findAllPaths = useCallback((startId: string, endId: string): string[][] => {
    const graph = new Map<string, string[]>();
    
    // Build adjacency list
    connections.forEach(conn => {
      if (!graph.has(conn.fromCityId)) {
        graph.set(conn.fromCityId, []);
      }
      graph.get(conn.fromCityId)?.push(conn.toCityId);
    });
    
    const paths: string[][] = [];
    const queue: { node: string; path: string[] }[] = [];
    
    // Start BFS from source
    queue.push({ node: startId, path: [startId] });
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.node === endId) {
        paths.push(current.path);
        continue;
      }
      
      const neighbors = graph.get(current.node) || [];
      for (const neighbor of neighbors) {
        if (!current.path.includes(neighbor)) {
          queue.push({
            node: neighbor,
            path: [...current.path, neighbor]
          });
        }
      }
    }
    
    return paths;
  }, [connections]);

  // Handle setting a city as source
  const handleSetAsSource = useCallback((cityId: string) => {
    // If this city is already the source, unset it
    if (sourceCityId === cityId) {
      setSourceCityId(null);
      // Update the city to remove source status
      const city = cities.find(c => c.id === cityId);
      if (city) {
        onUpdateCity({ ...city, isSource: false });
      }
    } else {
      // If another city is the source, unset it first
      if (sourceCityId) {
        const prevSource = cities.find(c => c.id === sourceCityId);
        if (prevSource) {
          onUpdateCity({ ...prevSource, isSource: false });
        }
      }
      // Set new source
      setSourceCityId(cityId);
      const city = cities.find(c => c.id === cityId);
      if (city) {
        onUpdateCity({ ...city, isSource: true });
      }
    }
  }, [cities, onUpdateCity, sourceCityId]);

  // Handle setting a city as sink
  const handleSetAsSink = useCallback((cityId: string) => {
    // If this city is already the sink, unset it
    if (sinkCityId === cityId) {
      setSinkCityId(null);
      // Update the city to remove sink status
      const city = cities.find(c => c.id === cityId);
      if (city) {
        onUpdateCity({ ...city, isSink: false });
      }
    } else {
      // If another city is the sink, unset it first
      if (sinkCityId) {
        const prevSink = cities.find(c => c.id === sinkCityId);
        if (prevSink) {
          onUpdateCity({ ...prevSink, isSink: false });
        }
      }
      // Set new sink
      setSinkCityId(cityId);
      const city = cities.find(c => c.id === cityId);
      if (city) {
        onUpdateCity({ ...city, isSink: true });
      }
    }
  }, [cities, onUpdateCity, sinkCityId]);

  // Flow information state
  const [showFlowInfo, setShowFlowInfo] = useState(true);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [allPaths, setAllPaths] = useState<string[][]>([]);

  // Calculate all possible paths when source or sink changes
  useEffect(() => {
    if (!sourceCityId || !sinkCityId) {
      setAllPaths([]);
      return;
    }

    const source = cities.find(city => city.id === sourceCityId);
    const sink = cities.find(city => city.id === sinkCityId);

    if (!source || !sink) {
      setAllPaths([]);
      return;
    }

    const paths = findAllPaths(sourceCityId, sinkCityId);
    setAllPaths(paths);
    
    // Set the first path as current by default if no path is selected
    if (paths.length > 0 && currentPath.length === 0) {
      setCurrentPath(paths[0]);
    }
  }, [cities, findAllPaths, sourceCityId, sinkCityId, currentPath.length]);
  
  const maxFlow = allPaths.length;

  // Render city nodes
  const cityNodes = useMemo(() => {
    return cities.map(city => (
      <CityNode
        key={city.id}
        city={city}
        isSelected={selectedCityId === city.id}
        isDragging={dragState.isDragging && dragState.draggedCityId === city.id}
        isConnecting={connectionState.isConnecting}
        onMouseDown={handleMouseDown}
        onClick={handleCityClick}
        onDelete={onDeleteCity}
        onSetAsSource={handleSetAsSource}
        onSetAsSink={handleSetAsSink}
      />
    ));
  }, [
    cities, 
    selectedCityId, 
    dragState, 
    connectionState, 
    handleMouseDown, 
    handleCityClick, 
    onDeleteCity, 
    handleSetAsSource, 
    handleSetAsSink
  ]);

  return (
    <div className="flex h-screen">
      <Sidebar 
        onDragStart={handleDragStart} 
        availableCities={availableCities} 
      />
      <div 
        ref={canvasRef}
        className="relative flex-1 bg-gray-50 overflow-hidden"
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* SVG for connections */}
        <svg
          className="absolute inset-0"
          width={canvasSize.width}
          height={canvasSize.height}
          style={{ pointerEvents: 'none' }}
        >
          <g style={{ pointerEvents: 'auto' }}>
            {connections.map(connection => (
              <ConnectionLine
                key={connection.id}
                connection={connection}
                cities={cities}
                onDelete={onDeleteConnection}
              />
            ))}
          </g>
        </svg>

        {/* Debug info */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-2 rounded-md shadow-md text-sm space-y-1">
          <div>Cities: {cities.length}</div>
          <div>Connections: {connections.length}</div>
          <button 
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              const workflow = {
                cities: cities.map(({ id, name, position, population, isSource, isSink }) => ({
                  id,
                  name,
                  position,
                  population,
                  isSource: !!isSource,
                  isSink: !!isSink
                })),
                connections: connections.map(({ id, fromCityId, toCityId, capacity, flow }) => ({
                  id,
                  fromCityId,
                  toCityId,
                  capacity,
                  flow
                }))
              };
              
              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workflow, null, 2));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute('href', dataStr);
              downloadAnchorNode.setAttribute('download', 'workflow-export.json');
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
          >
            <Download size={16} className="w-4 h-4" />
            <span>Export Workflow</span>
          </button>
        </div>

        {/* Cities */}
        {cityNodes}

        {/* Flow Information Panel */}
        {showFlowInfo && sourceCityId && sinkCityId && (
          <FlowInfo 
            currentPath={currentPath}
            allPaths={allPaths}
            cities={cities}
            onClose={() => setShowFlowInfo(false)}
            onPathSelect={(path) => setCurrentPath(path)}
          />
        )}

        {/* Show Flow Info Button */}
        {!showFlowInfo && (
          <button 
            onClick={() => setShowFlowInfo(true)}
            className="fixed top-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg z-40 transition-all"
            aria-label="Show flow information"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {/* Connection mode indicator */}
        {connectionState.isConnecting && (
          <div className="absolute top-4 left-72 bg-orange-100 border border-orange-300 rounded-lg px-4 py-2">
            <span className="text-orange-800 text-sm font-medium">
              Click another city to create a connection, or click the selected city to cancel
            </span>
          </div>
        )}
      </div>
    </div>
  );
};