import React, { useState, useEffect } from 'react';

interface PreloaderProps {
  theme?: 'light' | 'dark'; // 'light' for Portfolio, 'dark' for About
  message?: string;
}

const Preloader: React.FC<PreloaderProps> = ({ theme = 'light', message = 'Loading...' }) => {
  const [progress, setProgress] = useState(0);

  const isDark = theme === 'dark';

  const bgColor = isDark ? 'bg-[#111]' : 'bg-gray-50';
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const barBgColor = isDark ? 'bg-gray-700' : 'bg-gray-300';
  const barFillColor = isDark ? 'bg-blue-400' : 'bg-blue-500';

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
    <div className={`fixed inset-0 ${bgColor} flex items-center justify-center flex-col z-50`}>
      <div className={`font-mono text-base ${textColor} mb-8`}>
        {message}
      </div>
      
      <div className={`relative w-20 h-4 ${barBgColor} overflow-hidden`}>
        <div 
          className={`absolute top-0 left-0 h-full ${barFillColor} transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        <div className={`absolute inset-0 flex items-center justify-center font-mono text-xs font-bold ${textColor}`}>
          {Math.round(Math.min(progress, 100))}%
        </div>
      </div>
    </div>
  );
};

export default Preloader;