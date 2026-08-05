import React from 'react';
import { useSidebar } from '../../contexts/SidebarContext';
import { cn } from '../../utils/cn';

export const Header = () => {
  const { isCollapsed } = useSidebar();
  
  return (
    <header className={cn("h-16 bg-white border-b border-border-light flex items-center justify-end px-6 fixed top-0 right-0 z-10 transition-all duration-300", isCollapsed ? "left-20" : "left-64")}>
      <div className="flex items-center gap-3 cursor-pointer">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800 leading-tight">Administrator</p>
          <p className="text-xs text-gray-500">admin</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
          {/* Avatar placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-red-100 flex items-center justify-center">
             <div className="w-5 h-5 flex space-x-1">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                 <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

