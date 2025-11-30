import React from 'react';

const ProgressBar = ({ progress, label, showPercentage = true }) => {
  const percentage = Math.min(100, Math.max(0, progress));
  
  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <span className="travel-label text-sm">{label}</span>
          {showPercentage && (
            <span className="travel-subtle-text text-sm">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="travel-progress-bar">
        <div 
          className="travel-progress-fill transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

