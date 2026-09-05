import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Users,
  UserCheck,
  Briefcase,
  Package,
  MessageSquare,
  ShoppingBag,
  Bell,
  Megaphone,
  Lightbulb,
  CalendarDays,
  Shield,
  BadgeDollarSign,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { apiClient } from '../utils/apiClient';
import { dashboardApi } from '../api/dashboard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

interface StatCardProps {
  title: string;
  count: number | string;
  icon: ReactNode;
  accent?: string;
  hint?: string;
}

const StatCard = ({
  title,
  count,
  icon,
  accent = 'bg-sidebar-active text-primary',
  hint,
}: StatCardProps) => (
  <div className="bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5 flex items-start justify-between hover:shadow-md transition-shadow">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 tracking-tight tabular-nums">{count}</h3>
      {hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
    </div>
    <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', accent)}>
      {icon}
    </div>
  </div>
);

type RoleCounts = { endUser: number; providerAdmin: number };

type DashboardStats = {
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
  overview?: {
    activeUsers: number;
    serviceProviders: number;
    enquiries: number;
    openEnquiries: number;
    closedEnquiries: number;
    newSaleListingsLast7Days: number;
    suggestions: number;
    pushNotifications: number;
    pushUnread: number;
    activeJobAlerts: number;
  };
  users?: {
    byState: Array<{
      stateId: string | null;
      stateName: string;
      submitted: RoleCounts;
      verified: RoleCounts;
      unverified: RoleCounts;
    }>;
    volunteersByState: Array<{ stateId: string | null; stateName: string; count: number }>;
  };
  serviceProviders?: {
    byState: Array<{
      stateId: string;
      stateName: string;
      total: number;
      verified: number;
      unverified: number;
    }>;
    verified: number;
    unverified: number;
  };
  sales?: {
    byState: Array<{ stateId: string | null; stateName: string; count: number }>;
    approved: number;
    unapproved: number;
    rejected: number;
    last7Days: number;
    bySubmitter: {
      approved: Record<string, number>;
      unapproved: Record<string, number>;
    };
  };
  enquiries?: {
    centralAdmin: number;
    providerAdmin: number;
    open: number;
    closed: number;
  };
  suggestions?: {
    total: number;
    open: number;
    closed: number;
    byStatus: Array<{ status: string; count: number }>;
  };
  jobAlerts?: {
    activeInWindow: number;
    windowDays: number;
    latest: Array<{ id: string; title: string; createdAt: string }>;
  };
  events?: {
    windowDays: number;
    total: number;
    byLocation: Array<{ location: string; count: number }>;
  };
  centralAdmin?: {
    stateAdmins: Array<{
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      isActive: boolean;
      state: { id: string; name: string; code: string | null } | null;
      sessions: Array<{
        id: string;
        loginAt: string;
        logoutAt: string | null;
        isActive: boolean;
        ipAddress: string | null;
      }>;
    }>;
    sponsors: {
      activeCount: number;
      invalidCount: number;
      recent: Array<{
        id: string;
        payerName: string | null;
        payerEmail: string | null;
        amount: number;
        planId: string | null;
        paidAt: string | null;
        validUntil: string | null;
        isValid: boolean;
      }>;
    };
  } | null;
};

const EMPTY: DashboardStats = {
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

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-[#eef0f3] shadow-sm p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-[#f8fafc] text-gray-600 font-semibold border-y border-gray-100">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/60">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 tabular-nums text-gray-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={headers.length} className="px-3 py-6 text-center text-gray-400">
                No data yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [sponsorFilter, setSponsorFilter] = useState<'all' | 'active' | 'invalid'>('active');
  const isCentral = user?.role === 'ADMIN';

  const load = () => {
    setLoading(true);
    dashboardApi
      .getStats({ from, to })
      .then((data) => {
        setStats(data as unknown as DashboardStats);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch stats', err);
        // fallback for older backends
        apiClient
          .get<DashboardStats>('/api/v1/dashboard/stats')
          .then((data) => setStats(data))
          .finally(() => setLoading(false));
      });
  };

  useEffect(() => {
    load();
  }, [from, to]);

  const runBackfill = async () => {
    try {
      await dashboardApi.backfill();
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const display = (value: number | undefined) =>
    loading ? '...' : (value ?? 0).toLocaleString();

  const overview = stats.overview;
  const filteredSponsors = useMemo(() => {
    const list = stats.centralAdmin?.sponsors.recent || [];
    if (sponsorFilter === 'active') return list.filter((s) => s.isValid);
    if (sponsorFilter === 'invalid') return list.filter((s) => !s.isValid);
    return list;
  }, [stats.centralAdmin, sponsorFilter]);

  return (
    <div className="flex flex-col gap-6 max-w-full">
      <Breadcrumb title="Dashboard" paths={[{ name: 'Dashboard' }]} />

      <div className="flex flex-wrap items-end gap-3 bg-white rounded-xl border border-[#eef0f3] shadow-sm p-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Window from</label>
          <DatePicker value={from} onChange={setFrom} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Window to</label>
          <DatePicker value={to} onChange={setTo} />
        </div>
        <p className="text-xs text-gray-400 pb-2">
          Applies to job alerts & events sections (default next 30 days).
        </p>
        {isCentral ? (
          <Button type="button" variant="outline" className="ml-auto h-10" onClick={runBackfill}>
            Backfill legacy data
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Users"
          count={display(overview?.activeUsers ?? stats.activeUsers)}
          icon={<UserCheck size={20} />}
        />
        <StatCard
          title="Service Providers"
          count={display(overview?.serviceProviders ?? stats.totalServiceProviders)}
          icon={<Briefcase size={20} />}
        />
        <StatCard
          title="Enquiries"
          count={display(overview?.enquiries)}
          icon={<MessageSquare size={20} />}
          hint={`${display(overview?.openEnquiries)} open · ${display(overview?.closedEnquiries)} closed`}
        />
        <StatCard
          title="New Sale Listings"
          count={display(overview?.newSaleListingsLast7Days)}
          icon={<ShoppingBag size={20} />}
          hint="Last 7 days"
        />
        <StatCard
          title="Suggestions"
          count={display(overview?.suggestions)}
          icon={<Lightbulb size={20} />}
        />
        <StatCard
          title="Push Notifications"
          count={display(overview?.pushNotifications)}
          icon={<Bell size={20} />}
          hint={`${display(overview?.pushUnread)} unread`}
        />
        <StatCard
          title="Active Job Alerts"
          count={display(overview?.activeJobAlerts)}
          icon={<Megaphone size={20} />}
          hint="Next 30 days window"
        />
        <StatCard
          title="Active Events"
          count={display(stats.events?.total)}
          icon={<CalendarDays size={20} />}
          hint="Next 30 days by location"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Section title="Users by state" subtitle="Submitted / verified / unverified · end user & provider admin">
          <SimpleTable
            headers={['State', 'Submitted EU', 'Submitted PA', 'Verified EU', 'Verified PA', 'Unverified EU', 'Unverified PA']}
            rows={(stats.users?.byState || []).map((r) => [
              r.stateName,
              r.submitted.endUser,
              r.submitted.providerAdmin,
              r.verified.endUser,
              r.verified.providerAdmin,
              r.unverified.endUser,
              r.unverified.providerAdmin,
            ])}
          />
        </Section>

        <Section title="Volunteers by state" subtitle="Users with VOLUNTEER role">
          <SimpleTable
            headers={['State', 'Count']}
            rows={(stats.users?.volunteersByState || []).map((r) => [r.stateName, r.count])}
          />
        </Section>

        <Section title="Service providers by state" subtitle="Verified = approved">
          <SimpleTable
            headers={['State', 'Total', 'Verified', 'Unverified']}
            rows={(stats.serviceProviders?.byState || []).map((r) => [
              r.stateName,
              r.total,
              r.verified,
              r.unverified,
            ])}
          />
          <p className="text-xs text-gray-500 mt-3">
            Totals — verified {display(stats.serviceProviders?.verified)}, unverified{' '}
            {display(stats.serviceProviders?.unverified)}
          </p>
        </Section>

        <Section title="Sale items" subtitle="By state and approval · submitter role/verification">
          <SimpleTable
            headers={['State', 'Submissions']}
            rows={(stats.sales?.byState || []).map((r) => [r.stateName, r.count])}
          />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm">
              Approved <span className="font-semibold">{display(stats.sales?.approved)}</span>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm">
              Pending <span className="font-semibold">{display(stats.sales?.unapproved)}</span>
            </div>
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm">
              Rejected <span className="font-semibold">{display(stats.sales?.rejected)}</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Approved by submitter
            </p>
            <SimpleTable
              headers={['EU verified', 'EU unverified', 'PA verified', 'PA unverified', 'Unknown']}
              rows={[
                [
                  stats.sales?.bySubmitter.approved.endUserVerified ?? 0,
                  stats.sales?.bySubmitter.approved.endUserUnverified ?? 0,
                  stats.sales?.bySubmitter.approved.providerAdminVerified ?? 0,
                  stats.sales?.bySubmitter.approved.providerAdminUnverified ?? 0,
                  stats.sales?.bySubmitter.approved.unknown ?? 0,
                ],
              ]}
            />
            <p className="text-xs font-semibold text-gray-500 mb-2 mt-3 uppercase tracking-wide">
              Unapproved by submitter
            </p>
            <SimpleTable
              headers={['EU verified', 'EU unverified', 'PA verified', 'PA unverified', 'Unknown']}
              rows={[
                [
                  stats.sales?.bySubmitter.unapproved.endUserVerified ?? 0,
                  stats.sales?.bySubmitter.unapproved.endUserUnverified ?? 0,
                  stats.sales?.bySubmitter.unapproved.providerAdminVerified ?? 0,
                  stats.sales?.bySubmitter.unapproved.providerAdminUnverified ?? 0,
                  stats.sales?.bySubmitter.unapproved.unknown ?? 0,
                ],
              ]}
            />
          </div>
        </Section>

        <Section title="Enquiries" subtitle="Recipient and status">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Central admin</p>
              <p className="text-2xl font-bold tabular-nums">{display(stats.enquiries?.centralAdmin)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Provider admin</p>
              <p className="text-2xl font-bold tabular-nums">{display(stats.enquiries?.providerAdmin)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Open</p>
              <p className="text-2xl font-bold tabular-nums">{display(stats.enquiries?.open)}</p>
            </div>
            <div className="rounded-lg border border-gray-100 p-3">
              <p className="text-xs text-gray-500">Closed</p>
              <p className="text-2xl font-bold tabular-nums">{display(stats.enquiries?.closed)}</p>
            </div>
          </div>
        </Section>

        <Section title="Suggestions by status">
          <SimpleTable
            headers={['Status', 'Count']}
            rows={(stats.suggestions?.byStatus || []).map((r) => [r.status, r.count])}
          />
        </Section>

        <Section
          title="Job alerts"
          subtitle={`Active in next ${stats.jobAlerts?.windowDays ?? 30} days`}
        >
          <p className="text-sm text-gray-600 mb-3">
            Active in window: <strong>{display(stats.jobAlerts?.activeInWindow)}</strong>
          </p>
          <SimpleTable
            headers={['Title', 'Created']}
            rows={(stats.jobAlerts?.latest || []).map((j) => [
              j.title,
              new Date(j.createdAt).toLocaleDateString(),
            ])}
          />
        </Section>

        <Section
          title="Events by location"
          subtitle={`Default window: next ${stats.events?.windowDays ?? 30} days`}
        >
          <SimpleTable
            headers={['Location', 'Count']}
            rows={(stats.events?.byLocation || []).map((e) => [e.location, e.count])}
          />
        </Section>
      </div>

      {isCentral && stats.centralAdmin && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Section
            title="State admins & sessions"
            subtitle="Central admin only · login = session start, logout = revoked"
          >
            <div className="space-y-4">
              {stats.centralAdmin.stateAdmins.map((admin) => (
                <div key={admin.id} className="rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <Shield size={14} className="text-primary" />
                        {admin.name || admin.email}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {admin.email}
                        {admin.state ? ` · ${admin.state.name}` : ''}
                        {admin.phone ? ` · ${admin.phone}` : ''}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-2 py-0.5 rounded',
                        admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500',
                      )}
                    >
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <SimpleTable
                      headers={['Login', 'Logout', 'IP', 'Status']}
                      rows={admin.sessions.map((s) => [
                        new Date(s.loginAt).toLocaleString(),
                        s.logoutAt ? new Date(s.logoutAt).toLocaleString() : '—',
                        s.ipAddress || '—',
                        s.isActive ? 'Online' : 'Ended',
                      ])}
                    />
                  </div>
                </div>
              ))}
              {!stats.centralAdmin.stateAdmins.length && (
                <p className="text-sm text-gray-400 text-center py-6">No state admins found</p>
              )}
            </div>
          </Section>

          <Section title="Sponsors" subtitle="Valid after successful sponsorship payment">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm flex items-center gap-2">
                <BadgeDollarSign size={16} />
                Active <strong>{display(stats.centralAdmin.sponsors.activeCount)}</strong>
              </div>
              <div className="rounded-lg bg-gray-100 px-3 py-2 text-sm">
                Invalid <strong>{display(stats.centralAdmin.sponsors.invalidCount)}</strong>
              </div>
              <select
                value={sponsorFilter}
                onChange={(e) => setSponsorFilter(e.target.value as typeof sponsorFilter)}
                className="ml-auto h-9 rounded-md border border-gray-300 px-2 text-sm"
              >
                <option value="active">Active only</option>
                <option value="invalid">Invalid / expired</option>
                <option value="all">All history</option>
              </select>
            </div>
            <SimpleTable
              headers={['Payer', 'Plan', 'Amount', 'Paid', 'Valid until', 'Status']}
              rows={filteredSponsors.map((s) => [
                s.payerName || s.payerEmail || '—',
                s.planId || '—',
                s.amount,
                s.paidAt ? new Date(s.paidAt).toLocaleDateString() : '—',
                s.validUntil ? new Date(s.validUntil).toLocaleDateString() : '—',
                s.isValid ? 'Valid' : 'Invalid',
              ])}
            />
          </Section>
        </div>
      )}

      <Section title="Quick legacy totals" subtitle="Previous dashboard cards for continuity">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <Users size={14} className="text-gray-400 mb-1" />
            Total users {display(stats.totalUsers)}
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <Package size={14} className="text-gray-400 mb-1" />
            Listings {display(stats.listings)}
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            List enquiries {display(stats.listEnquiries)}
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            Product enquiries {display(stats.productEnquiries)}
          </div>
        </div>
      </Section>
    </div>
  );
};
