import React, { useCallback } from 'react';
import { X, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { City } from '../types';

interface CityNodeProps {
  city: City;
  isSelected?: boolean;
  isDragging?: boolean;
  isConnecting?: boolean;
  onMouseDown: (e: React.MouseEvent, cityId: string) => void;
  onClick: (e: React.MouseEvent, cityId: string) => void;
  onDelete: (cityId: string) => void;
  onSetAsSource: (cityId: string) => void;
  onSetAsSink: (cityId: string) => void;
}

export const CityNode: React.FC<CityNodeProps> = ({
  city,
  isSelected = false,
  isDragging = false,
  isConnecting = false,
  onMouseDown,
  onClick,
  onDelete,
  onSetAsSource,
  onSetAsSink
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMouseDown(e, city.id);
  };

  const handleSetAsSource = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSetAsSource(city.id);
  }, [city.id, onSetAsSource]);

  const handleSetAsSink = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSetAsSink(city.id);
  }, [city.id, onSetAsSink]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e, city.id);
  };

  return (
    <div
      className={`absolute cursor-move transition-transform duration-200 group ${isDragging ? 'scale-110 z-10' : 'z-0'}`}
      style={{
        left: `${city.position.x}px`,
        top: `${city.position.y}px`,
        transform: isSelected ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      draggable={false}
    >
      {/* Source/Sink indicators */}
      {(city.isSource || city.isSink) && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {city.isSource && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <ArrowUpFromLine size={10} className="mr-1" /> Source
            </span>
          )}
          {city.isSink && (
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <ArrowDownToLine size={10} className="mr-1" /> Sink
            </span>
          )}
        </div>
      )}
      
      <div 
        className={`relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-200 ${
          city.isSource 
            ? 'bg-green-500 text-white' 
            : city.isSink 
              ? 'bg-purple-500 text-white'
              : isSelected 
                ? 'bg-blue-500 text-white' 
                : isConnecting 
                  ? 'bg-yellow-400 text-gray-800' 
                  : 'bg-white text-gray-800 border-2 border-blue-400'
        }`}
      >
        <div className="flex flex-col items-center">
          <span className="text-base font-medium">{city.name.split(' ')[0]}</span>
          <span className="text-sm opacity-80">{city.population ? (city.population / 1000).toFixed(0) + 'k' : ''}</span>
        </div>
        
        {/* Action buttons - shown on hover */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-600 transition-colors"
            onClick={handleSetAsSource}
            title="Set as source"
          >
            <ArrowUpFromLine size={10} />
          </button>
          <button
            className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-purple-600 transition-colors"
            onClick={handleSetAsSink}
            title="Set as sink"
          >
            <ArrowDownToLine size={10} />
          </button>
          <button
            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(city.id);
            }}
            title="Delete city"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      
      {/* Connection points - only show when connecting */}
      {isConnecting && (
        <>
          <div className="absolute top-1/2 -left-1 w-2 h-2 bg-blue-400 rounded-full transform -translate-y-1/2"></div>
          <div className="absolute top-1/2 -right-1 w-2 h-2 bg-blue-400 rounded-full transform -translate-y-1/2"></div>
          <div className="absolute -top-1 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2"></div>
          <div className="absolute -bottom-1 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2"></div>
        </>
      )}
    </div>
  );
};