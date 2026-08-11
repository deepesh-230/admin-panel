import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  User,
  MessageSquare,
  HelpCircle,
  Link as LinkIcon,
  LifeBuoy,
  FileText,
  Newspaper,
  Briefcase,
  Lightbulb,
  TrendingUp,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSample2Sidebar } from '../contexts/Sample2SidebarContext';

interface NavItem {
  title: string;
  icon: ReactNode;
  href: string;
  match?: string;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/sample2/dashboard', match: '/sample2/dashboard' },
  { title: 'Listings', icon: <List size={18} />, href: '/sample2/listings', match: '/sample2/listings' },
  { title: 'User', icon: <User size={18} />, href: '#' },
  { title: 'Enquiries', icon: <MessageSquare size={18} />, href: '/sample2/listings', match: '/sample2/listings' },
  { title: 'FAQ', icon: <HelpCircle size={18} />, href: '#' },
  { title: 'Useful links', icon: <LinkIcon size={18} />, href: '#' },
  { title: 'Help & support', icon: <LifeBuoy size={18} />, href: '#' },
  { title: 'Pages', icon: <FileText size={18} />, href: '#' },
  { title: 'Blog', icon: <Newspaper size={18} />, href: '#' },
  { title: 'Job Alerts', icon: <Briefcase size={18} />, href: '#' },
  { title: 'Suggestions', icon: <Lightbulb size={18} />, href: '#' },
  { title: 'Sales List', icon: <TrendingUp size={18} />, href: '#' },
];

export const Sample2Sidebar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSample2Sidebar();
  const { pathname } = useLocation();

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'bg-white border-r border-[#e5e7eb] flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 w-[260px]',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-5 h-16 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#3b82f6] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <span className="text-[18px] font-bold text-[#3b82f6] tracking-tight">AdminSuite</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-5 border-t border-[#e5e7eb]" />

        <div className="flex items-center gap-3 px-5 py-4">
          <img
            src="https://i.pravatar.cc/80?img=47"
            alt="Administrator"
            className="w-10 h-10 rounded-full object-cover border border-[#e5e7eb]"
          />
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">Administrator</p>
            <p className="text-xs text-gray-400 truncate">admin@suite.com</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6 space-y-0.5">
          {navItems.map((item) => {
            // Prefer Enquiries as active on listings page (matches screenshot)
            const isActive =
              item.match === pathname &&
              !(item.title === 'Listings' && pathname === '/sample2/listings');

            const content = (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-[#3b82f6]" />
                )}
                <span className={cn(isActive ? 'text-[#3b82f6]' : 'text-gray-400')}>{item.icon}</span>
                <span>{item.title}</span>
              </>
            );

            if (item.href === '#') {
              return (
                <div
                  key={item.title}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] text-gray-600 cursor-default"
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span>{item.title}</span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.title}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] transition-colors',
                  isActive
                    ? 'bg-[#eff6ff] text-[#3b82f6] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                {content}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
