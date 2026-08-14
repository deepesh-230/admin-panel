import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { stateAdminsApi, statesApi, type State, type StateAdmin } from '../api/masterData';

export const StateAdminsList = () => {
  const [items, setItems] = useState<StateAdmin[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StateAdmin | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    stateId: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    statesApi.getAll().then(setStates).catch(() => setStates([]));
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setItems(await stateAdminsApi.getAll({ search }));
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load state admins',
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
    setForm({
      email: '',
      password: '',
      name: '',
      phone: '',
      stateId: states[0]?.id || '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (item: StateAdmin) => {
    setEditing(item);
    setForm({
      email: item.email,
      password: '',
      name: item.name || '',
      phone: item.phone || '',
      stateId: item.stateId || '',
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await stateAdminsApi.update(editing.id, {
          name: form.name || undefined,
          phone: form.phone || undefined,
          stateId: form.stateId,
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await stateAdminsApi.create({
          email: form.email.trim(),
          password: form.password,
          name: form.name || undefined,
          phone: form.phone || undefined,
          stateId: form.stateId,
        });
      }
      setModalOpen(false);
      setToast({ visible: true, message: 'State admin saved', type: 'success' });
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

  const handleDelete = async (item: StateAdmin) => {
    if (!window.confirm(`Delete state admin "${item.email}"?`)) return;
    try {
      await stateAdminsApi.remove(item.id);
      setToast({ visible: true, message: 'Deleted', type: 'success' });
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
      <Breadcrumb title="State Admins" paths={[{ name: 'Master Data' }, { name: 'State Admins' }]} />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search state admins..."
              className="h-10 w-64 pl-9 pr-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Add State Admin
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#f8fafc] text-gray-700 font-semibold border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{item.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.email}</td>
                    <td className="px-4 py-3 text-gray-600">{item.state?.name || '—'}</td>
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
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-primary hover:bg-primary/10 rounded">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(item)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                      No state admins found.
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
        title={editing ? 'Edit State Admin' : 'Add State Admin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              {editing ? 'New password (optional)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!editing}
              minLength={editing ? undefined : 8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State *</label>
            <select
              required
              value={form.stateId}
              onChange={(e) => setForm({ ...form, stateId: e.target.value })}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">Select state</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
              Active
            </label>
          )}
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
