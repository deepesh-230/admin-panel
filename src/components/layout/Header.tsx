import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { cn } from '../../utils/cn';

export const Header = () => {
  const { isCollapsed, setIsMobileMenuOpen } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <header
      className={cn(
        'h-16 bg-white border-b border-border-light flex items-center justify-between md:justify-end px-4 md:px-6 fixed top-0 left-0 right-0 z-10 transition-all duration-300',
        isCollapsed ? 'md:left-20' : 'md:left-64',
      )}
    >
      <button
        className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-800 leading-tight">
            {user?.name || 'Administrator'}
          </p>
          <p className="text-xs text-gray-500">{user?.role || 'admin'}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-green-100 to-red-100 flex items-center justify-center text-sm font-semibold text-gray-700">
            {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
