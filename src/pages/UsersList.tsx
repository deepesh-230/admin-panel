import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { statesApi, type State } from '../api/masterData';
import { usersApi, type AppUser } from '../api/users';

const ROLES = ['END_USER', 'SERVICE_PROVIDER_ADMIN', 'STATE_ADMIN', 'ADMIN'] as const;

type StatusTab = 'all' | 'active' | 'inactive';

export const UsersList = () => {
  const [searchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status');
  const initialTab: StatusTab =
    statusFromUrl === 'active' || statusFromUrl === 'inactive' ? statusFromUrl : 'all';

  const [items, setItems] = useState<AppUser[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [stateId, setStateId] = useState('');
  const [statusTab, setStatusTab] = useState<StatusTab>(initialTab);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    role: 'END_USER',
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

  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'active' || status === 'inactive') {
      setStatusTab(status);
      setPage(1);
    } else if (!status) {
      setStatusTab('all');
    }
  }, [searchParams]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll({
        search,
        role: role || undefined,
        stateId: stateId || undefined,
        isActive: statusTab === 'all' ? undefined : statusTab === 'active' ? 'true' : 'false',
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setItems(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotal(data.pagination.total);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load users',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, role, stateId, statusTab, page]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      email: '',
      password: '',
      name: '',
      phone: '',
      role: 'END_USER',
      stateId: '',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEdit = (user: AppUser) => {
    setEditing(user);
    setForm({
      email: user.email,
      password: '',
      name: user.name || '',
      phone: user.phone || '',
      role: user.role,
      stateId: user.stateId || '',
      isActive: user.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await usersApi.update(editing.id, {
          name: form.name || undefined,
          phone: form.phone || undefined,
          role: form.role,
          stateId: form.stateId || null,
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        });
      } else {
        await usersApi.create({
          email: form.email.trim(),
          password: form.password,
          name: form.name || undefined,
          phone: form.phone || undefined,
          role: form.role,
          stateId: form.stateId || undefined,
          isActive: form.isActive,
        });
      }
      setModalOpen(false);
      setToast({ visible: true, message: 'User saved', type: 'success' });
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

  const handleToggle = async (user: AppUser, isActive: boolean) => {
    try {
      await usersApi.updateStatus(user.id, isActive);
      setItems((prev) => prev.map((u) => (u.id === user.id ? { ...u, isActive } : u)));
      setToast({
        visible: true,
        message: `User ${isActive ? 'activated' : 'deactivated'}`,
        type: 'success',
      });
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Status update failed',
        type: 'error',
      });
    }
  };

  const handleDelete = async (user: AppUser) => {
    if (!window.confirm(`Delete user "${user.email}"?`)) return;
    try {
      await usersApi.remove(user.id);
      setToast({ visible: true, message: 'User deleted', type: 'success' });
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
      <Breadcrumb title="Users" paths={[{ name: 'User Management' }, { name: 'Users' }]} />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-100">
          {([
            ['all', 'All Users'],
            ['active', 'Active Users'],
            ['inactive', 'Inactive Users'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setStatusTab(key);
                setPage(1);
              }}
              className={`h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                statusTab === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search users..."
                className="h-10 w-56 pl-9 pr-3 rounded-md border border-gray-300 text-sm"
              />
            </div>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={stateId}
              onChange={(e) => {
                setStateId(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm min-w-[160px]"
            >
              <option value="">All states</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Add User
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
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.state?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        checked={user.isActive}
                        onChange={(checked) => handleToggle(user, checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>
            Showing page {page} of {totalPages} ({total} users)
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User' : 'Add User'}
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
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <select
              value={form.stateId}
              onChange={(e) => setForm({ ...form, stateId: e.target.value })}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">None</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
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
