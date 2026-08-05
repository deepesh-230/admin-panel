import React from 'react';
import { cn } from '../../utils/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'danger' | 'default' | 'primary';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, icon, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      danger: 'text-red-500 hover:text-red-700 hover:bg-red-50',
      primary: 'text-blue-500 hover:text-blue-700 hover:bg-blue-50',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
