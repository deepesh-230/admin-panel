import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { dashboardApi, type DashboardEvent } from '../api/dashboard';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { DatePicker } from '../components/ui/DatePicker';
import { LifecycleFlagSelect } from '../components/ui/LifecycleFlagSelect';
import { formatFaqDate } from '../utils/html';

const emptyForm = {
  title: '',
  description: '',
  location: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
};

function toInputDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export const EventsList = () => {
  const [items, setItems] = useState<DashboardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DashboardEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [to, setTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems(await dashboardApi.listEvents({ from, to }));
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load events',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [from, to]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: DashboardEvent) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      startsAt: toInputDate(item.startsAt),
      endsAt: toInputDate(item.endsAt),
      isActive: item.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startsAt) {
      setToast({ visible: true, message: 'Title and start date are required', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        isActive: form.isActive,
      };
      if (editing) await dashboardApi.updateEvent(editing.id, payload);
      else await dashboardApi.createEvent(payload);
      setModalOpen(false);
      setToast({ visible: true, message: 'Event saved', type: 'success' });
      load();
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

  const handleDelete = async (item: DashboardEvent) => {
    if (!window.confirm(`Delete event "${item.title}"?`)) return;
    try {
      await dashboardApi.removeEvent(item.id);
      setToast({ visible: true, message: 'Event marked deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  const rows = useMemo(() => items, [items]);

  return (
    <div className="flex flex-col max-w-full">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <Breadcrumb title="Events" paths={[{ name: 'CMS' }, { name: 'Events' }]} />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <DatePicker value={from} onChange={setFrom} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <DatePicker value={to} onChange={setTo} />
            </div>
          </div>
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Add Event
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Starts</th>
                  <th className="px-4 py-3">Ends</th>
                  <th className="px-4 py-3">Flag</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                    <td className="px-4 py-3 text-gray-600">{item.location || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatFaqDate(item.startsAt)}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {item.endsAt ? formatFaqDate(item.endsAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <LifecycleFlagSelect
                        entity="event"
                        id={item.id}
                        value={item.adminFlag}
                        onChanged={() => load()}
                        onError={(message) =>
                          setToast({ visible: true, message, type: 'error' })
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      No events in this date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Event' : 'Add Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Starts *</label>
              <DatePicker
                value={form.startsAt}
                onChange={(startsAt) => setForm({ ...form, startsAt })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ends</label>
              <DatePicker
                value={form.endsAt}
                onChange={(endsAt) => setForm({ ...form, endsAt })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
