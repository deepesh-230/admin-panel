import { useEffect, useState, type ReactNode } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Briefcase,
  Package,
  MessageSquare,
  ShoppingBag,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { apiClient } from '../utils/apiClient';
import { Breadcrumb } from '../components/ui/Breadcrumb';

interface StatCardProps {
  title: string;
  count: number | string;
  icon: ReactNode;
  accent?: string;
}

const StatCard = ({
  title,
  count,
  icon,
  accent = 'bg-sidebar-active text-primary',
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">
          {count}
        </h3>
      </div>
      <div
        className={cn(
          'w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
          accent,
        )}
      >
        {icon}
      </div>
    </div>
  );
};

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalServiceProviders: number;
  activeServiceProviders: number;
  inactiveServiceProviders: number;
  listings: number;
  activeListings: number;
  listEnquiries: number;
  productEnquiries: number;
  last7ActiveUsers: number;
  last7ActiveServiceProviders: number;
  last7ActiveListings: number;
}

const EMPTY_STATS: DashboardStats = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  totalServiceProviders: 0,
  activeServiceProviders: 0,
  inactiveServiceProviders: 0,
  listings: 0,
  activeListings: 0,
  listEnquiries: 0,
  productEnquiries: 0,
  last7ActiveUsers: 0,
  last7ActiveServiceProviders: 0,
  last7ActiveListings: 0,
};

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<DashboardStats>('/api/v1/dashboard/stats')
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch stats', err);
        setLoading(false);
      });
  }, []);

  const display = (value: number) => (loading ? '...' : value.toLocaleString());

  const recentActivity = [
    {
      id: 1,
      label: `${display(stats.listEnquiries)} listing enquiries pending`,
      meta: 'Enquiries · updated just now',
      badge: 'System' as const,
    },
    {
      id: 2,
      label: `${display(stats.activeListings)} active listings live`,
      meta: 'Service providers · overview',
      badge: 'User' as const,
    },
    {
      id: 3,
      label: `${display(stats.productEnquiries)} product enquiries received`,
      meta: 'Marketplace · overview',
      badge: 'System' as const,
    },
    {
      id: 4,
      label: `${display(stats.activeUsers)} users currently active`,
      meta: 'App users · overview',
      badge: 'User' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-full">
      <Breadcrumb title="Dashboard" paths={[{ name: 'Dashboard' }]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Total Users" count={display(stats.totalUsers)} icon={<Users size={20} />} />
        <StatCard title="Active Users" count={display(stats.activeUsers)} icon={<UserCheck size={20} />} />
        <StatCard
          title="Inactive Users"
          count={display(stats.inactiveUsers)}
          icon={<UserX size={20} />}
          accent="bg-gray-100 text-gray-500"
        />
        <StatCard
          title="Total Service Providers"
          count={display(stats.totalServiceProviders)}
          icon={<Briefcase size={20} />}
        />
        <StatCard
          title="Active Service Providers"
          count={display(stats.activeServiceProviders)}
          icon={<Activity size={20} />}
        />
        <StatCard
          title="Inactive Service Providers"
          count={display(stats.inactiveServiceProviders)}
          icon={<UserX size={20} />}
          accent="bg-gray-100 text-gray-500"
        />
        <StatCard title="Listings" count={display(stats.listings)} icon={<Package size={20} />} />
        <StatCard
          title="List Enquiry"
          count={display(stats.listEnquiries)}
          icon={<MessageSquare size={20} />}
        />
        <StatCard
          title="Product Enquiries"
          count={display(stats.productEnquiries)}
          icon={<ShoppingBag size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Latest 7 days</h2>
              <p className="text-sm text-gray-400 mt-0.5">Recent platform activity overview</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sidebar-active text-primary flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Active Users"
              count={display(stats.last7ActiveUsers)}
              icon={<UserCheck size={20} />}
            />
            <StatCard
              title="Active Providers"
              count={display(stats.last7ActiveServiceProviders)}
              icon={<Briefcase size={20} />}
            />
            <StatCard
              title="Active Listings"
              count={display(stats.last7ActiveListings)}
              icon={<Package size={20} />}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Overview</h2>
          <ul className="space-y-4">
            {recentActivity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.meta}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold',
                    item.badge === 'System'
                      ? 'bg-primary text-white'
                      : 'bg-sidebar-active text-primary',
                  )}
                >
                  {item.badge}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
