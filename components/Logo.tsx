import React from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-xl' },
    lg: { icon: 40, text: 'text-3xl' },
  };

  const { icon, text } = sizeClasses[size];

  return (
    <div className={`flex items-center gap-2 font-bold text-gray-900 ${className}`}>
      <div className="bg-brand-500 text-white p-1.5 rounded-lg shadow-lg shadow-brand-500/30">
        <Zap size={icon} fill="currentColor" />
      </div>
      <span className={`${text} tracking-tight`}>
        Eletro<span className="text-brand-500">R</span>
      </span>
    </div>
  );
};