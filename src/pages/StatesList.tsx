import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { statesApi, type State } from '../api/masterData';
import { useAuth } from '../contexts/AuthContext';
import { canAccess } from '../utils/roleAccess';

export const StatesList = () => {
  const { user } = useAuth();
  const canWrite = canAccess(user?.permissions, 'states.write');
  const [items, setItems] = useState<State[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<State | null>(null);
  const [form, setForm] = useState({ name: '', code: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems(await statesApi.getAll(search));
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load states',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (item: State) => {
    setEditing(item);
    setForm({ name: item.name, code: item.code || '', isActive: item.isActive });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        isActive: form.isActive,
      };
      if (editing) await statesApi.update(editing.id, payload);
      else await statesApi.create(payload);
      setModalOpen(false);
      setToast({ visible: true, message: 'State saved', type: 'success' });
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

  const handleDelete = async (item: State) => {
    if (!window.confirm(`Delete state "${item.name}"?`)) return;
    try {
      await statesApi.remove(item.id);
      setToast({ visible: true, message: 'State deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  return (
    <div className="flex flex-col max-w-full">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <Breadcrumb title="States" paths={[{ name: 'Master Data' }, { name: 'States' }]} />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search states..."
              className="h-10 w-64 pl-9 pr-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          {canWrite && (
            <Button onClick={openCreate} icon={<Plus size={16} />}>
              Add State
            </Button>
          )}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.code || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                          item.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canWrite ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(item)} className="p-1.5 text-primary hover:bg-primary/10 rounded">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ) : (
                        <span className="block text-center text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                      No states found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit State' : 'Add State'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              placeholder="e.g. TS"
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
