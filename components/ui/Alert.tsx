import React from 'react';
import { XCircleIcon } from './icons';

interface AlertProps {
  message: string;
  type?: 'error';
  title: string;
}

const Alert: React.FC<AlertProps> = ({ message, type = 'error', title }) => {
  const baseStyles = 'p-4 rounded-lg border';
  const typeStyles = {
    error: 'bg-red-900/40 border-red-700/50 text-red-300',
  };

  const icons = {
      error: <XCircleIcon className="h-6 w-6 text-red-400" />,
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-md font-bold text-white">{title}</h3>
          <div className="mt-2 text-sm">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alert;
