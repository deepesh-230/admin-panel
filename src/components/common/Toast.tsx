import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type = 'success', onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-[#4ade80]/90 text-white',
    error: 'bg-red-500/90 text-white',
    info: 'bg-blue-500/90 text-white',
  };

  return (
    <div className={cn("fixed top-4 right-4 z-50 rounded shadow-lg px-4 py-3 flex items-center gap-3 backdrop-blur-sm transition-all animate-in fade-in slide-in-from-top-5", bgColors[type])}>
      {type === 'success' && <Check size={18} className="text-white flex-shrink-0" />}
      <div className="text-sm font-medium">
        <span className="block text-xs opacity-90 mb-0.5 text-right w-full">Administrator</span>
        {message}
      </div>
      <button onClick={onClose} className="ml-2 hover:opacity-75 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};
