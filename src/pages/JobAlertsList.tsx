import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDownUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { cmsApi, type CmsRecord } from '../api/cms';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { DatePicker } from '../components/ui/DatePicker';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { BulkImportButton } from '../components/BulkImportButton';
import { LifecycleFlagSelect } from '../components/ui/LifecycleFlagSelect';
import { formatFaqDate } from '../utils/html';
import {
  dateSortValue,
  formatCreatedTime,
  formatDashDate,
  isDateExpired,
} from '../utils/dates';

type JobAlert = CmsRecord & {
  title: string;
  description?: string | null;
  postDate?: string | null;
  lastDate?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  adminFlag?: 'READ' | 'ACTIVE' | 'DELETE';
  broadcastAt?: string | null;
  createdAt?: string;
};

type StatusFilter = 'all' | 'active' | 'inactive';
type View = 'list' | 'form';
type SortKey = 'title' | 'postDate' | 'lastDate' | 'createdAt' | 'createdTime' | 'isActive';
type SortDir = 'asc' | 'desc';

const emptyForm = {
  title: '',
  description: '',
  postDate: '',
  lastDate: '',
  isActive: true,
};

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: null, label: 'S No' },
  { key: 'title', label: 'Title' },
  { key: 'postDate', label: 'Post Date' },
  { key: 'lastDate', label: 'Last Date' },
  { key: 'createdAt', label: 'Created Date' },
  { key: 'createdTime', label: 'Created Time' },
  { key: 'isActive', label: 'Status' },
  { key: null, label: 'Flag' },
];

function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey | null;
  activeKey: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  if (!sortKey) return <span>{label}</span>;
  const active = activeKey === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className="inline-flex items-center gap-1.5 hover:text-primary"
    >
      {label}
      <ArrowDownUp
        size={13}
        className={active ? 'text-primary' : 'text-primary/60'}
        style={active && dir === 'desc' ? { transform: 'rotate(180deg)' } : undefined}
      />
    </button>
  );
}

export const JobAlertsList = () => {
  const api = cmsApi('job-alerts');
  const [items, setItems] = useState<JobAlert[]>([]);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<JobAlert | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCount, setShowCount] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems((await api.getAll(search)) as JobAlert[]);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load job alerts',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== 'list') return;
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, view]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'active' && !item.isActive) return false;
      if (statusFilter === 'inactive' && item.isActive) return false;
      return true;
    });
  }, [items, statusFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title':
          cmp = (a.title || '').localeCompare(b.title || '');
          break;
        case 'postDate':
          cmp = dateSortValue(a.postDate) - dateSortValue(b.postDate);
          break;
        case 'lastDate':
          cmp = dateSortValue(a.lastDate) - dateSortValue(b.lastDate);
          break;
        case 'createdAt':
        case 'createdTime':
          cmp =
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
        case 'isActive':
          cmp = Number(Boolean(a.isActive)) - Number(Boolean(b.isActive));
          break;
      }
      return cmp * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(0, showCount);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setView('form');
  };

  const openEdit = (item: JobAlert) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      postDate: item.postDate || '',
      lastDate: item.lastDate || '',
      isActive: item.isActive ?? true,
    });
    setView('form');
  };

  const backToList = () => {
    setView('list');
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setToast({ visible: true, message: 'Title is required', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        postDate: form.postDate || undefined,
        lastDate: form.lastDate || undefined,
        startsAt: form.postDate ? new Date(form.postDate).toISOString() : undefined,
        endsAt: form.lastDate ? new Date(form.lastDate).toISOString() : undefined,
        isActive: form.isActive,
      };
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      setToast({
        visible: true,
        message: editing ? 'Job alert updated' : 'Job alert created',
        type: 'success',
      });
      backToList();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Save failed',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: JobAlert) => {
    if (!window.confirm(`Delete job alert "${item.title}"?`)) return;
    try {
      await api.remove(item.id);
      setToast({ visible: true, message: 'Job alert deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  const handleStatusToggle = async (item: JobAlert, isActive: boolean) => {
    try {
      await api.update(item.id, { isActive });
      setItems((rows) => rows.map((r) => (r.id === item.id ? { ...r, isActive } : r)));
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Status update failed',
        type: 'error',
      });
    }
  };

  const handleBroadcast = async (item: JobAlert) => {
    try {
      const result = await api.broadcast(item.id);
      setToast({
        visible: true,
        message:
          result.message ||
          (typeof result.recipientCount === 'number'
            ? `Broadcast sent to ${result.recipientCount} app user(s)`
            : 'Broadcast sent to app users'),
        type: 'success',
      });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Broadcast failed',
        type: 'error',
      });
    }
  };

  if (view === 'form') {
    return (
      <div className="flex flex-col max-w-full">
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, visible: false })}
          />
        )}
        <Breadcrumb
          title="Job Alert"
          paths={[
            { name: 'Job Alert', href: '/jobs' },
            { name: editing ? 'Edit Job Alert' : 'Add Job Alert' },
          ]}
        />
        <div className="border-t-2 border-primary pt-6">
          <h2 className="mb-6 text-lg font-semibold text-primary">
            {editing ? 'Edit Job Alert' : 'Add Job Alert'}
          </h2>
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">
                Title: <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <DatePicker
                label="Post date"
                value={form.postDate}
                onChange={(postDate) => setForm((prev) => ({ ...prev, postDate }))}
              />
              <DatePicker
                label="Last date"
                value={form.lastDate}
                onChange={(lastDate) => setForm((prev) => ({ ...prev, lastDate }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Submitting…' : 'Submit'}
              </Button>
              <Button type="button" variant="secondary" onClick={backToList}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-full">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <Breadcrumb title="Job Alert" paths={[{ name: 'Job Alert' }, { name: 'List Job Alert' }]} />

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Show</label>
              <select
                value={showCount}
                onChange={(e) => setShowCount(Number(e.target.value))}
                className="h-10 w-24 rounded-md border border-gray-300 px-3 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="min-w-[260px] flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-700">Search</label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Title"
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-10 rounded-md border border-gray-300 px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button type="button" variant="primary" className="h-10" onClick={load}>
              Filter
            </Button>
          </div>
          <div className="flex gap-2">
            <BulkImportButton entity="job-alerts" onSuccess={load} />
            <Button onClick={openCreate} icon={<Plus size={16} />}>
              Add Job Alert
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-gray-200 bg-[#f8fafc] font-semibold text-gray-700">
                <tr>
                  {COLUMNS.map((col) => (
                    <th key={col.label} className="px-4 py-3 whitespace-nowrap">
                      <SortHeader
                        label={col.label}
                        sortKey={col.key}
                        activeKey={sortKey}
                        dir={sortDir}
                        onSort={handleSort}
                      />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No job alerts found
                    </td>
                  </tr>
                ) : (
                  paged.map((item, index) => {
                    const expired = isDateExpired(item.lastDate);
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="max-w-md px-4 py-3 font-medium text-gray-800">{item.title}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatDashDate(item.postDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={expired ? 'text-red-600' : 'text-gray-600'}>
                              {formatDashDate(item.lastDate)}
                            </span>
                            {expired ? (
                              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                Expired
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatFaqDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatCreatedTime(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={Boolean(item.isActive)}
                            onChange={(checked) => handleStatusToggle(item, checked)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <LifecycleFlagSelect
                            entity="jobAlert"
                            id={item.id}
                            value={item.adminFlag}
                            onChanged={(flag) =>
                              setItems((rows) =>
                                rows.map((r) => (r.id === item.id ? { ...r, adminFlag: flag } : r)),
                              )
                            }
                            onError={(message) =>
                              setToast({ visible: true, message, type: 'error' })
                            }
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleBroadcast(item)}
                              className="text-xs font-medium text-primary hover:underline"
                              title="Broadcast to app users"
                            >
                              Broadcast
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="rounded bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
                              title="Edit"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
