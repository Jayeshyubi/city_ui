import React, { useState, useCallback } from 'react';
import { City, Connection } from '../types';

interface ConnectionLineProps {
  connection: Connection;
  cities: City[];
  onDelete: (connectionId: string) => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  cities,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const fromCity = cities.find(city => city.id === connection.fromCityId);
  const toCity = cities.find(city => city.id === connection.toCityId);

  if (!fromCity || !toCity) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this connection?')) {
      onDelete(connection.id);
    }
    return false;
  };
  
  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    // Only hide if mouse leaves the connection line area
    const target = e.relatedTarget as HTMLElement;
    if (!target || !target.closest('.connection-line')) {
      setIsHovered(false);
    }
  }, []);

  // Calculate the middle point of the line
  const midX = (fromCity.position.x + toCity.position.x) / 2;
  const midY = (fromCity.position.y + toCity.position.y) / 2;
  
  // Calculate the angle of the line
  const angle = Math.atan2(
    toCity.position.y - fromCity.position.y,
    toCity.position.x - fromCity.position.x
  );
  
  // Calculate the middle point for the arrow (slightly offset when hovered to avoid overlap with delete button)
  const arrowOffset = isHovered ? 15 : 0;
  const arrowX = midX - Math.cos(angle) * (arrowOffset / 2);
  const arrowY = midY - Math.sin(angle) * (arrowOffset / 2);
  
  // Arrow dimensions
  const arrowSize = 8;
  const arrowPoints = [
    [arrowX, arrowY],
    [arrowX - arrowSize * Math.cos(angle - Math.PI/6), arrowY - arrowSize * Math.sin(angle - Math.PI/6)],
    [arrowX - arrowSize * Math.cos(angle + Math.PI/6), arrowY - arrowSize * Math.sin(angle + Math.PI/6)]
  ].map(p => p.join(',')).join(' ');

  return (
    <g className="connection-line" onMouseLeave={handleMouseLeave}>
      {/* Solid connection line */}
      <line
        x1={fromCity.position.x}
        y1={fromCity.position.y}
        x2={toCity.position.x}
        y2={toCity.position.y}
        stroke="#6B7280"
        strokeWidth="2"
        className={`transition-all duration-200 ${isHovered ? 'stroke-blue-400' : ''}`}
      />
      
      {/* Arrow in the middle */}
      <polygon
        points={arrowPoints}
        fill={isHovered ? '#3B82F6' : '#6B7280'}
        className="transition-colors duration-200"
      />
      
          {/* Invisible hover target for the entire line */}
      <line
        x1={fromCity.position.x}
        y1={fromCity.position.y}
        x2={toCity.position.x}
        y2={toCity.position.y}
        stroke="transparent"
        strokeWidth="30"
        className="cursor-pointer hover-target"
        onMouseEnter={handleMouseEnter}
        pointerEvents="stroke"
      />
      
          {/* Delete button - only shown on hover */}
      <g style={{ pointerEvents: isHovered ? 'auto' : 'none' }}>
        {isHovered && (
          <g 
            className="cursor-pointer transition-all duration-200"
            onClick={handleDelete}
            onMouseDown={e => e.stopPropagation()}
          >
            {/* White background circle */}
            <circle
              cx={midX}
              cy={midY}
              r="16"
              fill="white"
              stroke="#EF4444"
              strokeWidth="2"
              className="shadow-md"
              style={{ pointerEvents: 'visible' }}
            />
            
            {/* X symbol */}
            <text
              x={midX}
              y={midY + 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-red-500 font-bold text-xl select-none"
            >
              ×
            </text>
            
            {/* Tooltip */}
            <text
              x={midX}
              y={midY - 20}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700"
            >
              Click to delete
            </text>
          </g>
        )}
      </g>
    </g>
  );
};