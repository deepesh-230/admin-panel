import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BriefcaseMedical,
  User,
  Shield,
  MessageSquareWarning,
  Store,
  HeartHandshake,
  HelpCircle,
  Link as LinkIcon,
  LifeBuoy,
  FileText,
  Newspaper,
  Briefcase,
  CalendarDays,
  Lightbulb,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../contexts/AuthContext';
import { ENQUIRY_NAV_ITEMS } from '../../constants/enquiryKinds';
import { canAccess } from '../../utils/roleAccess';

interface NavItem {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  permission?: string;
  children?: NavItem[];
  isExpanded?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/dashboard', permission: 'dashboard.read' },
  // { title: 'States', icon: <MapPin size={18} />, href: '/states', permission: 'states.read' },
  {
    title: 'Service Provider',
    icon: <BriefcaseMedical size={18} />,
    permission: 'providers.read',
    children: [
      { title: 'Category', href: '/service-provider/category', permission: 'categories.read' },
      { title: 'Sub Category', href: '/service-provider/sub-category', permission: 'categories.read' },
      { title: 'Listing', href: '/service-provider/listing', permission: 'providers.read' },
      { title: 'Provider admins', href: '/provider-admins', permission: 'users.read' },
    ],
  },
  {
    title: 'App user',
    icon: <User size={18} />,
    permission: 'users.read',
    children: [
      { title: 'Listing', href: '/app-users', permission: 'users.read' },
      { title: 'Volunteers', href: '/app-volunteers', permission: 'users.read' },
    ],
  },
  {
    title: 'State Admin',
    icon: <Shield size={18} />,
    permission: 'state_admins.read',
    children: [{ title: 'Listing', href: '/state-admins', permission: 'state_admins.read' }],
  },
  {
    title: 'Enquiry',
    icon: <MessageSquareWarning size={18} />,
    permission: 'enquiries.read',
    children: ENQUIRY_NAV_ITEMS.map((item) => ({
      title: item.title,
      href: item.href,
      permission: 'enquiries.read',
    })),
  },
  {
    title: 'Market Place',
    icon: <Store size={18} />,
    href: '/marketplace/products',
    permission: 'marketplace.read',
  },
  { title: 'Volunteers', icon: <HeartHandshake size={18} />, href: '/volunteers', permission: 'volunteers.read' },
  { title: 'Payments', icon: <CreditCard size={18} />, href: '/payments', permission: 'payments.read' },
  { title: 'FAQ', icon: <HelpCircle size={18} />, href: '/faq', permission: 'cms.read' },
  { title: 'Useful link', icon: <LinkIcon size={18} />, href: '/useful-links', permission: 'cms.read' },
  { title: 'Help & support', icon: <LifeBuoy size={18} />, href: '/#', permission: 'cms.read' },
  { title: 'Pages', icon: <FileText size={18} />, href: '/pages', permission: 'cms.read' },
  { title: 'Blogs', icon: <Newspaper size={18} />, href: '/blogs', permission: 'cms.read' },
  { title: 'Job alerts', icon: <Briefcase size={18} />, href: '/jobs', permission: 'cms.read' },
  { title: 'Events', icon: <CalendarDays size={18} />, href: '/events', permission: 'dashboard.read' },
  { title: 'Suggestions', icon: <Lightbulb size={18} />, href: '/suggestions', permission: 'cms.read' },
  {
    title: 'Settings',
    icon: <Settings size={18} />,
    permission: 'settings.write',
    children: [
      { title: 'Access control', href: '/settings/permissions', permission: 'settings.write' },
    ],
  },
];

function filterNavItems(
  items: NavItem[],
  permissions: string[],
  role?: string,
): NavItem[] {
  return items
    .map((item) => {
      if (item.children?.length) {
        const children = filterNavItems(item.children, permissions, role);
        if (!children.length) return null;
        return { ...item, children };
      }
      if (item.permission && !canAccess(permissions, item.permission, role)) return null;
      return item;
    })
    .filter(Boolean) as NavItem[];
}

const itemBase =
  'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors';
const itemIdle = 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
const itemActive = 'bg-sidebar-active text-primary font-semibold';

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();
  const { user } = useAuth();
  const navItems = useMemo(
    () => filterNavItems(ALL_NAV_ITEMS, user?.permissions || [], user?.role),
    [user?.permissions, user?.role],
  );

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={cn(
          'bg-white border-r border-border-light flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-40',
          isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64',
          isCollapsed ? 'md:translate-x-0 md:w-20' : 'md:translate-x-0 md:w-64',
        )}
      >
        {/* Brand header — Sample2 style */}
        <div className="h-16 flex items-center px-4 border-b border-border-light flex-shrink-0 justify-between">
          <div
            className={cn(
              'flex items-center gap-2.5 overflow-hidden',
              isCollapsed ? 'md:w-0 md:opacity-0 md:hidden' : 'w-auto opacity-100',
            )}
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
              DD
            </div>
            <span className="text-[17px] font-bold text-primary tracking-tight whitespace-nowrap">
              Divyaang Disha
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden md:block p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors',
              isCollapsed && 'mx-auto',
            )}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* User chip — Sample2 style */}
        {/* {!isCollapsed && (
          <div className="px-4 py-3 border-b border-border-light">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sidebar-active border border-border-light flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-400 truncate">{user?.email || user?.role || 'admin'}</p>
              </div>
            </div>
          </div>
        )} */}

        <div className="py-3 flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-0.5 px-3">
            {navItems.map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isCollapsed={isCollapsed}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

const SidebarItem = ({
  item,
  isCollapsed,
  onNavigate,
}: {
  item: NavItem;
  isCollapsed: boolean;
  onNavigate: () => void;
}) => {
  const { pathname } = useLocation();
  const hasChildren = Boolean(item.children?.length);
  const childActive =
    item.children?.some((c) => c.href && (pathname === c.href || pathname.startsWith(c.href + '/'))) ??
    false;
  const [isExpanded, setIsExpanded] = useState(item.isExpanded || childActive);

  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            if (!isCollapsed) setIsExpanded((v) => !v);
          }}
          className={cn(
            itemBase,
            'justify-between',
            childActive ? itemActive : itemIdle,
            isCollapsed && 'justify-center px-0',
          )}
          title={isCollapsed ? item.title : undefined}
        >
          {childActive && !isCollapsed && (
            <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" />
          )}
          <span className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
            <span className={childActive ? 'text-primary' : 'text-gray-400'}>{item.icon}</span>
            {!isCollapsed && <span>{item.title}</span>}
          </span>
          {!isCollapsed &&
            (isExpanded ? (
              <ChevronDown size={15} className="text-gray-400 shrink-0" />
            ) : (
              <ChevronRight size={15} className="text-gray-400 shrink-0" />
            ))}
        </button>

        {isExpanded && !isCollapsed && (
          <div className="mt-0.5 ml-4 space-y-0.5 border-l border-gray-200 pl-3">
            {item.children?.map((child) => (
              <NavLink
                key={child.title}
                to={child.href || '#'}
                end
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'relative flex items-center gap-3 px-3 py-2 rounded-md text-[13.5px] transition-colors',
                    isActive
                      ? 'bg-sidebar-active text-primary font-semibold'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" />
                    )}
                    <span>{child.title}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href || '#'}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          itemBase,
          isActive ? itemActive : itemIdle,
          isCollapsed && 'justify-center px-0',
        )
      }
      title={isCollapsed ? item.title : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && !isCollapsed && (
            <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full bg-primary" />
          )}
          <span className={cn('flex items-center gap-3', isCollapsed && 'justify-center w-full')}>
            <span className={isActive ? 'text-primary' : 'text-gray-400'}>{item.icon}</span>
            {!isCollapsed && <span>{item.title}</span>}
          </span>
        </>
      )}
    </NavLink>
  );
};
