import React, { useMemo } from 'react';
import { X, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';

interface FlowInfoProps {
  currentPath: string[];
  allPaths: string[][];
  cities: Array<{ id: string; name: string }>;
  onClose: () => void;
  onPathSelect: (path: string[]) => void;
}

const PathVisualization: React.FC<{ path: string[]; cities: Array<{ id: string; name: string }> }> = ({ path, cities }) => {
  const getCityName = (id: string) => cities.find(c => c.id === id)?.name || id;
  
  return (
    <div className="flex items-center space-x-1 text-sm overflow-x-auto py-1">
      {path.map((nodeId, idx) => (
        <React.Fragment key={nodeId + idx}>
          <span className="px-2 py-1 bg-blue-50 rounded-md whitespace-nowrap">
            {getCityName(nodeId)}
          </span>
          {idx < path.length - 1 && (
            <ArrowRight className="text-gray-400 flex-shrink-0" size={16} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const FlowInfo: React.FC<FlowInfoProps> = ({ 
  currentPath, 
  allPaths, 
  cities, 
  onClose, 
  onPathSelect 
}) => {
  const [expandedPaths, setExpandedPaths] = React.useState<Record<string, boolean>>({});
  
  // Group paths by their starting segments
  const pathGroups = useMemo(() => {
    const groups: {[key: string]: string[][]} = {};
    
    allPaths.forEach(path => {
      // Create a key based on the first 2 nodes (or just first if path is too short)
      const key = path.length > 1 ? `${path[0]}-${path[1]}` : path[0];
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(path);
    });
    
    return Object.entries(groups).map(([key, paths]) => ({
      key,
      paths,
      startNode: paths[0][0],
      endNode: paths[0][paths[0].length - 1],
      isExpanded: expandedPaths[paths[0][0]] !== false
    }));
  }, [allPaths, expandedPaths]);

  const togglePathGroup = (startNode: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [startNode]: !prev[startNode]
    }));
  };

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-xl w-80 z-50 overflow-hidden">
      <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold">Flow Information</h3>
        <button 
          onClick={onClose}
          className="text-white hover:bg-blue-700 rounded-full p-1"
          aria-label="Close flow information"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="p-4 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Current Flow Path */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Flow Path</h4>
            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
              {currentPath.length > 0 ? (
                <PathVisualization path={currentPath} cities={cities} />
              ) : (
                <p className="text-gray-400 text-sm">No active path selected</p>
              )}
            </div>
          </div>

          {/* All Possible Paths */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              All Possible Paths ({allPaths.length})
            </h4>
            <div className="space-y-2">
              {pathGroups.map((group) => (
                <div key={group.key} className="border border-gray-200 rounded-md overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 text-left"
                    onClick={() => togglePathGroup(group.startNode)}
                  >
                    <div className="flex items-center space-x-2">
                      {group.isExpanded ? (
                        <ChevronDown size={16} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-500" />
                      )}
                      <span className="font-medium">
                        {cities.find(c => c.id === group.startNode)?.name || group.startNode}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium">
                        {cities.find(c => c.id === group.endNode)?.name || group.endNode}
                      </span>
                      <span className="text-gray-500 text-xs">({group.paths.length} paths)</span>
                    </div>
                  </button>
                  
                  {group.isExpanded && (
                    <div className="p-2 space-y-2 bg-white">
                      {group.paths.map((path, pathIdx) => (
                        <button
                          key={pathIdx}
                          className={`w-full text-left p-2 rounded text-sm ${JSON.stringify(path) === JSON.stringify(currentPath) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                          onClick={() => onPathSelect(path)}
                        >
                          <PathVisualization path={path} cities={cities} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
