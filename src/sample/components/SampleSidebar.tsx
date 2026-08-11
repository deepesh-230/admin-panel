import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  User,
  Users,
  HelpCircle,
  Link as LinkIcon,
  LifeBuoy,
  FileText,
  MessageSquare,
  Briefcase,
  Lightbulb,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSampleSidebar } from '../contexts/SampleSidebarContext';

interface NavItem {
  title: string;
  icon: ReactNode;
  href?: string;
  children?: NavItem[];
  isExpanded?: boolean;
}

const BulletIcon = () => (
  <span className="w-5 h-5 flex items-center justify-center">
    <div className="w-1.5 h-1.5 rounded-full bg-current" />
  </span>
);

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/sample/dashboard' },
  {
    title: 'Listings',
    icon: <List size={18} />,
    isExpanded: true,
    children: [
      { title: 'Category', icon: <BulletIcon /> },
      { title: 'Sub Category', icon: <BulletIcon /> },
      { title: 'Listings', icon: <BulletIcon />, href: '/sample/listings' },
      { title: 'uploads Listings', icon: <BulletIcon /> },
    ],
  },
  { title: 'User', icon: <User size={18} /> },
  {
    title: 'Enquiries',
    icon: <Users size={18} />,
    children: [
      { title: 'Listing Enquiries', icon: <BulletIcon /> },
      { title: 'Product Enquiries', icon: <BulletIcon /> },
    ],
  },
  { title: 'Faq', icon: <HelpCircle size={18} /> },
  { title: 'Useful links', icon: <LinkIcon size={18} /> },
  { title: 'Help & support', icon: <LifeBuoy size={18} /> },
  { title: 'Pages', icon: <FileText size={18} /> },
  { title: 'Blog', icon: <MessageSquare size={18} /> },
  { title: 'Job Alerts', icon: <Briefcase size={18} /> },
  { title: 'Suggestions', icon: <Lightbulb size={18} /> },
  { title: 'Sales List', icon: <TrendingUp size={18} /> },
];

const itemBase =
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors';
const itemIdle = 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900';
const itemActive = 'bg-[#009f7f]/10 text-[#009f7f] font-semibold';

export const SampleSidebar = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useSampleSidebar();

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
          'bg-[#f9fafb] border-r border-[#e5e7eb] flex flex-col h-[calc(100vh-4rem)] fixed left-0 top-16 z-40 transition-transform duration-300 w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 md:hidden border-b border-[#e5e7eb]">
          <span className="text-sm font-semibold text-gray-700">Menu</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-md hover:bg-gray-200 text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="py-4 flex-1 overflow-y-auto">
          <nav className="space-y-0.5 px-3">
            {navItems.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) => {
  const { pathname } = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const childActive = item.children?.some((c) => c.href && pathname === c.href) ?? false;
  const [isExpanded, setIsExpanded] = useState(item.isExpanded || childActive);

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className={cn(itemBase, 'justify-between', childActive ? itemActive : itemIdle)}
        >
          <span className="flex items-center gap-3">
            <span className={childActive ? 'text-[#009f7f]' : 'text-gray-400'}>{item.icon}</span>
            <span>{item.title}</span>
          </span>
          {isExpanded ? (
            <ChevronDown size={15} className="text-gray-400" />
          ) : (
            <ChevronRight size={15} className="text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-0.5 ml-4 space-y-0.5 border-l border-gray-200 pl-3">
            {item.children?.map((child) => {
              if (!child.href) {
                return (
                  <div
                    key={child.title}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] text-gray-400 cursor-default"
                  >
                    {child.icon}
                    <span>{child.title}</span>
                  </div>
                );
              }

              const active = pathname === child.href;
              return (
                <NavLink
                  key={child.title}
                  to={child.href}
                  end
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] transition-colors',
                    active
                      ? 'bg-[#009f7f]/10 text-[#009f7f] font-semibold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/80'
                  )}
                >
                  {child.icon}
                  <span>{child.title}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (!item.href) {
    return (
      <div className={cn(itemBase, itemIdle, 'cursor-default')}>
        <span className="text-gray-400">{item.icon}</span>
        <span>{item.title}</span>
      </div>
    );
  }

  const active = pathname === item.href;

  return (
    <NavLink
      to={item.href}
      end
      onClick={onNavigate}
      className={cn(itemBase, active ? itemActive : itemIdle)}
    >
      <span className={active ? 'text-[#009f7f]' : 'text-gray-400'}>{item.icon}</span>
      <span>{item.title}</span>
    </NavLink>
  );
};
