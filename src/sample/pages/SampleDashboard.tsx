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
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  count: number | string;
  icon: ReactNode;
  accent?: string;
}

const StatCard = ({ title, count, icon, accent = 'bg-[#009f7f]/10 text-[#009f7f]' }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 tracking-tight">{count}</h3>
      </div>
      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', accent)}>
        {icon}
      </div>
    </div>
  );
};

export const SampleDashboard = () => {
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

  return (
    <div className="flex flex-col gap-8 max-w-full">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of users, service providers, listings and enquiries from here.
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
            accent="bg-amber-50 text-amber-600"
          />
          <StatCard
            title="Product Enquiries"
            count={display(stats.productEnquiries)}
            icon={<ShoppingBag size={20} />}
            accent="bg-sky-50 text-sky-600"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Latest 7 days</h2>
          <p className="text-sm text-gray-500 mt-1">
            Quick snapshot of recent activity across your platform.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard
            title="Active Users"
            count={display(stats.activeUsers)}
            icon={<UserCheck size={20} />}
            accent="bg-slate-100 text-slate-700"
          />
          <StatCard
            title="Active Service Providers"
            count={display(stats.activeServiceProviders)}
            icon={<Briefcase size={20} />}
          />
          <StatCard
            title="Active Listings"
            count={display(stats.activeListings)}
            icon={<Package size={20} />}
            accent="bg-amber-50 text-amber-600"
          />
        </div>
      </div>
    </div>
  );
};
