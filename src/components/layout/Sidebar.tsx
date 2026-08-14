import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSidebar } from '../../contexts/SidebarContext';

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
  isExpanded?: boolean;
}

const BulletIcon = () => (
  <span className="w-5 h-5 flex items-center justify-center">
    <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
  </span>
);

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
  {
    title: 'Listings',
    icon: <List size={20} />,
    isExpanded: true,
    children: [
      { title: 'Category', icon: <BulletIcon />, href: '/listings/category' },
      { title: 'Sub Category', icon: <BulletIcon />, href: '/listings/sub-category' },
      { title: 'Service Providers', icon: <BulletIcon />, href: '/listings/providers' },
      { title: 'Listings', icon: <BulletIcon />, href: '/listings/list' },
      { title: 'uploads Listings', icon: <BulletIcon />, href: '/listings/uploads' },
    ]
  },
  {
    title: 'User',
    icon: <User size={20} />,
    children: [
      { title: 'States', icon: <BulletIcon />, href: '/master/states' },
      { title: 'State Admins', icon: <BulletIcon />, href: '/master/state-admins' },
      { title: 'Users', icon: <BulletIcon />, href: '/user' },
      { title: 'Active Users', icon: <BulletIcon />, href: '/user?status=active' },
      { title: 'Inactive Users', icon: <BulletIcon />, href: '/user?status=inactive' },
    ]
  },
  {
    title: 'Enquiries',
    icon: <Users size={20} />,
    children: [
      { title: 'Listing Enquiries', icon: <BulletIcon />, href: '/enquiries/listing' },
      { title: 'Product Enquiries', icon: <BulletIcon />, href: '/enquiries/product' },
    ]
  },
  { title: 'Faq', icon: <HelpCircle size={20} />, href: '/faq' },
  { title: 'Useful links', icon: <LinkIcon size={20} />, href: '/useful-links' },
  { title: 'Help & support', icon: <LifeBuoy size={20} />, href: '/support' },
  { title: 'Pages', icon: <FileText size={20} />, href: '/pages' },
  { title: 'Blog', icon: <MessageSquare size={20} />, href: '/blog' },
  { title: 'Job Alerts', icon: <Briefcase size={20} />, href: '/jobs' },
  { title: 'Suggestions', icon: <Lightbulb size={20} />, href: '/suggestions' },
  { title: 'Sales List', icon: <TrendingUp size={20} />, href: '/sales' },
];

export const Sidebar = () => {
  const { isCollapsed, toggleSidebar, isMobileMenuOpen, setIsMobileMenuOpen } = useSidebar();

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={cn(
        "bg-white border-r border-border-light flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-40",
        isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
        isCollapsed ? "md:translate-x-0 md:w-20" : "md:translate-x-0 md:w-64"
      )}>
        <div className={`h-16 flex items-center px-4 border-b border-border-light flex-shrink-0 justify-between bg-white`}>
          <div className={cn("flex items-center gap-2 overflow-hidden", isCollapsed ? "md:w-0 md:opacity-0 md:hidden" : "w-auto opacity-100")}>
          <div className="w-8 h-8 rounded-full border border-blue-200 flex flex-shrink-0 items-center justify-center bg-white shadow-sm overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-red-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className={`hidden md:block p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors ${isCollapsed ? "mx-auto" : ""}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>
      <div className="py-4 flex-1 overflow-y-auto overflow-x-hidden">
        <nav className="space-y-0.5 px-3">
          {navItems.map((item, index) => (
            <SidebarItem key={index} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </div>
    </aside>
    </>
  );
};

const SidebarItem = ({ item, isCollapsed }: { item: NavItem, isCollapsed: boolean }) => {
  const hasChildren = item.children && item.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(item.isExpanded || false);

  if (hasChildren) {
    return (
      <div>
        <div
          onClick={() => {
            if (!isCollapsed) setIsExpanded(!isExpanded);
          }}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer text-gray-600 hover:bg-gray-50 transition-colors",
            isExpanded && !isCollapsed && "text-gray-900 bg-gray-50",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? item.title : undefined}
        >
          <div className="flex items-center gap-3">
            {item.icon}
            {!isCollapsed && <span className="font-medium text-[15px]">{item.title}</span>}
          </div>
          {!isCollapsed && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </div>
        {isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-0.5">
            {item.children?.map((child, idx) => (
              <NavLink
                key={idx}
                to={child.href || '#'}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-active text-primary font-medium border-l-4 border-primary rounded-l-none -ml-[12px] pl-[calc(32px+0.75rem)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 ml-6"
                )}
              >
                {child.icon}
                <span className="text-[14.5px]">{child.title}</span>
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
      className={({ isActive }) => cn(
        "flex items-center justify-between px-3 py-2.5 rounded-md transition-colors",
        isActive
          ? "bg-sidebar-active text-primary font-medium border-l-4 border-primary rounded-l-none -ml-[12px] pl-[calc(12px+0.75rem)]"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        isCollapsed && "justify-center px-0 rounded-l-md ml-0 pl-0 border-l-0"
      )}
      style={isCollapsed ? { paddingLeft: 0, marginLeft: 0 } : {}}
      title={isCollapsed ? item.title : undefined}
    >
      <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
        {item.icon}
        {!isCollapsed && <span className="font-medium text-[15px]">{item.title}</span>}
      </div>
    </NavLink>
  );
};


