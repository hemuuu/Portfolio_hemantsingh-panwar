import React, { useState, useEffect } from 'react';

const Preloader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-50 flex items-center justify-center flex-col z-50">
      <div className="font-mono text-base text-gray-800 mb-8">
        Loading Portfolio...
      </div>
      
      <div className="relative w-20 h-4 bg-gray-300 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs font-bold text-white">
          {Math.round(Math.min(progress, 100))}%
        </div>
      </div>
    </div>
  );
};

export default Preloader;