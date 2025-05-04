import React from 'react';

interface StatusIndicatorProps {
  isActive: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive }) => {
  return (
    <div className="absolute top-12 left-0 right-0 flex justify-center items-center z-20">
      <div className="bg-[hsl(var(--navy))] bg-opacity-70 rounded-full px-4 py-2 text-white flex items-center">
        <div className={`h-3 w-3 ${isActive ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-2 ${isActive ? 'animate-pulse' : ''}`}></div>
        <span className="text-sm font-medium">
          {isActive ? 'Monitoring for fire' : 'Detection paused'}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator;
