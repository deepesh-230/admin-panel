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
import { cn } from '../../utils/cn';

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
  accent = 'bg-[#eff6ff] text-[#3b82f6]',
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{count}</h3>
      </div>
      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', accent)}>
        {icon}
      </div>
    </div>
  );
};

export const Sample2Dashboard = () => {
  const [stats, setStats] = useState({
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setStats({
          totalUsers: 1240,
          activeUsers: 980,
          inactiveUsers: 260,
          totalServiceProviders: 186,
          activeServiceProviders: 152,
          inactiveServiceProviders: 34,
          listings: 432,
          activeListings: 390,
          listEnquiries: 78,
          productEnquiries: 112,
        });
        setLoading(false);
      });
  }, []);

  const display = (value: number) => (loading ? '...' : value);

  const recentActivity = [
    { id: 1, label: 'New enquiry from John Doe', meta: 'ThinkPad X1 · 2 mins ago', badge: 'System' as const },
    { id: 2, label: 'Listing published by Jane Smith', meta: 'Office 365 · 18 mins ago', badge: 'User' as const },
    { id: 3, label: 'New enquiry from Robert Brown', meta: 'Premium Care · 1 hour ago', badge: 'System' as const },
    { id: 4, label: 'User registered: Emily Davis', meta: 'admin@suite.com · 3 hours ago', badge: 'User' as const },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-full">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Home <span className="mx-1">&gt;</span> Dashboard
        </p>
      </div>

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
        {/* Latest 7 days */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Latest 7 days</h2>
              <p className="text-sm text-gray-400 mt-0.5">Recent platform activity overview</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Active Users"
              count={display(stats.activeUsers)}
              icon={<UserCheck size={20} />}
            />
            <StatCard
              title="Active Providers"
              count={display(stats.activeServiceProviders)}
              icon={<Briefcase size={20} />}
            />
            <StatCard
              title="Active Listings"
              count={display(stats.activeListings)}
              icon={<Package size={20} />}
            />
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
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
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#dbeafe] text-[#1d4ed8]'
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
