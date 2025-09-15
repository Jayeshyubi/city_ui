export interface Position {
  x: number;
  y: number;
}

export interface CityBase {
  name: string;
  position: Position;
  country?: string;
  population?: number;
  state?: string;
}

export interface City extends CityBase {
  id: string;
  population?: number;
  country?: string;
  state?: string;
  isSource?: boolean;
  isSink?: boolean;
}

export interface Connection {
  id: string;
  fromCityId: string;
  toCityId: string;
  distance?: number;
  type?: 'road' | 'rail' | 'air' | 'sea';
  flow?: number;
  capacity?: number;
}

export interface DragState {
  isDragging: boolean;
  draggedCityId: string | null;
  dragOffset: Position;
}

export interface ConnectionState {
  isConnecting: boolean;
  fromCityId: string | null;
  toCityId?: string | null; // Added for connection preview
}