import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowDownUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { cmsApi, type CmsRecord } from '../api/cms';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { LifecycleFlagSelect } from '../components/ui/LifecycleFlagSelect';
import { formatFaqDate, truncateText } from '../utils/html';

type TicketStatus = 'OPEN' | 'CLOSED' | 'NEW';

type Suggestion = CmsRecord & {
  title: string;
  description?: string | null;
  receivedFrom?: string | null;
  status?: TicketStatus | string;
  isActive?: boolean;
  adminFlag?: 'READ' | 'ACTIVE' | 'DELETE';
  createdAt?: string;
};

type StatusFilter = 'all' | 'active' | 'inactive';
type TicketFilter = 'all' | 'OPEN' | 'CLOSED';
type View = 'list' | 'form';
type SortKey =
  | 'title'
  | 'description'
  | 'receivedFrom'
  | 'status'
  | 'createdAt'
  | 'isActive';
type SortDir = 'asc' | 'desc';

const emptyForm = {
  title: '',
  description: '',
  receivedFrom: '',
  status: 'OPEN' as TicketStatus,
  isActive: true,
};

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: null, label: 'S No' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Comment' },
  { key: 'receivedFrom', label: 'Received From' },
  { key: 'status', label: 'Ticket Status' },
  { key: 'createdAt', label: 'Created Date' },
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

function normalizeTicketStatus(status: string | null | undefined): 'OPEN' | 'CLOSED' {
  const value = (status || 'OPEN').toUpperCase();
  return value === 'CLOSED' ? 'CLOSED' : 'OPEN';
}

function TicketStatusBadge({ status }: { status: string | null | undefined }) {
  const normalized = normalizeTicketStatus(status);
  if (normalized === 'CLOSED') {
    return (
      <span className="inline-block rounded bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Closed
      </span>
    );
  }
  return (
    <span className="inline-block rounded bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
      Open
    </span>
  );
}

export const SuggestionsList = () => {
  const api = cmsApi('suggestions');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<Suggestion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [ticketFilter, setTicketFilter] = useState<TicketFilter>('all');
  const [showCount, setShowCount] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readMore, setReadMore] = useState<Suggestion | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems((await api.getAll(search)) as Suggestion[]);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load suggestions',
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
      if (ticketFilter !== 'all' && normalizeTicketStatus(item.status) !== ticketFilter) return false;
      return true;
    });
  }, [items, statusFilter, ticketFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'title':
          cmp = (a.title || '').localeCompare(b.title || '');
          break;
        case 'description':
          cmp = (a.description || '').localeCompare(b.description || '');
          break;
        case 'receivedFrom':
          cmp = (a.receivedFrom || '').localeCompare(b.receivedFrom || '');
          break;
        case 'status':
          cmp = normalizeTicketStatus(a.status).localeCompare(normalizeTicketStatus(b.status));
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
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

  const openEdit = (item: Suggestion) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      receivedFrom: item.receivedFrom || '',
      status: normalizeTicketStatus(item.status),
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
        receivedFrom: form.receivedFrom.trim() || undefined,
        status: form.status,
        isActive: form.isActive,
      };
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      setToast({
        visible: true,
        message: editing ? 'Suggestion updated' : 'Suggestion created',
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

  const handleDelete = async (item: Suggestion) => {
    if (!window.confirm(`Delete suggestion "${item.title}"?`)) return;
    try {
      await api.remove(item.id);
      setToast({ visible: true, message: 'Suggestion deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  const handleStatusToggle = async (item: Suggestion, isActive: boolean) => {
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
          title="Suggestions"
          paths={[
            { name: 'Suggestions', href: '/suggestions' },
            { name: editing ? 'Edit Suggestion' : 'Add Suggestion' },
          ]}
        />
        <div className="border-t-2 border-primary pt-6">
          <h2 className="mb-6 text-lg font-semibold text-primary">
            {editing ? 'Edit Suggestion' : 'Add Suggestion'}
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
              <label className="mb-1 block text-sm font-semibold text-gray-800">Comment</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Received From</label>
                <input
                  value={form.receivedFrom}
                  onChange={(e) => setForm((prev) => ({ ...prev, receivedFrom: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Ticket Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status: e.target.value as TicketStatus }))
                  }
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
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
      <Breadcrumb title="Suggestions" paths={[{ name: 'Suggestions' }]} />

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
              <label className="mb-1 block text-sm font-semibold text-gray-700">Ticket Status</label>
              <select
                value={ticketFilter}
                onChange={(e) => setTicketFilter(e.target.value as TicketFilter)}
                className="h-10 rounded-md border border-gray-300 px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
              </select>
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
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Add Suggestion
          </Button>
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
                      No suggestions found
                    </td>
                  </tr>
                ) : (
                  paged.map((item, index) => {
                    const comment = item.description || '';
                    const preview = truncateText(comment, 90);
                    const canEdit = normalizeTicketStatus(item.status) === 'OPEN';
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="max-w-xs px-4 py-3 font-medium text-gray-800">{item.title}</td>
                        <td className="max-w-md px-4 py-3 text-gray-600">
                          {comment ? (
                            <>
                              {preview}
                              {comment.length > 90 && (
                                <button
                                  type="button"
                                  onClick={() => setReadMore(item)}
                                  className="ml-1 text-primary hover:underline"
                                >
                                  Read More
                                </button>
                              )}
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.receivedFrom || '—'}</td>
                        <td className="px-4 py-3">
                          <TicketStatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatFaqDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={Boolean(item.isActive)}
                            onChange={(checked) => handleStatusToggle(item, checked)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <LifecycleFlagSelect
                            entity="suggestion"
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
                            {canEdit ? (
                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                className="rounded bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                            ) : null}
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

      <Modal
        isOpen={Boolean(readMore)}
        onClose={() => setReadMore(null)}
        title={readMore?.title || 'Comment'}
      >
        <p className="whitespace-pre-wrap text-sm text-gray-700">{readMore?.description || '—'}</p>
      </Modal>
    </div>
  );
};
