import React from 'react';
import { MapPin } from 'lucide-react';
import { CityBase } from '../types';

interface SidebarProps {
  onDragStart: (e: React.DragEvent, city: CityBase) => void;
  availableCities: CityBase[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onDragStart, availableCities }) => {
  return (
    <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Indian Cities</h2>
      <div className="space-y-2">
        {availableCities.map((city, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => {
              console.log('Starting drag with city:', city);
              e.dataTransfer.effectAllowed = 'copy';
              onDragStart(e, city);
            }}
            className="p-3 bg-white rounded-md shadow-sm cursor-move hover:bg-blue-50 border border-gray-200"
          >
            <div className="flex items-center">
              <MapPin className="mr-2 text-blue-500" size={16} />
              <span>{city.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-gray-600">
          Drag and drop cities to the canvas to create connections
        </p>
      </div>
    </div>
  );
};
