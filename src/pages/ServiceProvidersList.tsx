import { useEffect, useState, type FormEvent } from 'react';
import { Check, Plus, Pencil, Trash2, Search, UserPlus, X } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { ImageUrlField } from '../components/ui/ImageUrlField';
import { BulkImportButton } from '../components/BulkImportButton';
import {
  categoriesApi,
  statesApi,
  type Category,
  type State,
  type Subcategory,
} from '../api/masterData';
import { usersApi, type AppUser } from '../api/users';
import {
  serviceProvidersApi,
  type ProviderApprovalStatus,
  type ServiceProvider,
} from '../api/serviceProviders';
import { useAuth } from '../contexts/AuthContext';

const APPROVAL_TABS: { key: 'all' | ProviderApprovalStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'PENDING_APPROVAL', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'DRAFT', label: 'Draft' },
];

const emptyForm = {
  name: '',
  categoryId: '',
  subcategoryId: '',
  description: '',
  phone: '',
  landline: '',
  email: '',
  website: '',
  address: '',
  city: '',
  stateId: '',
  latitude: '',
  longitude: '',
  about: '',
  services: '',
  coverPhotoUrl: '',
  isActive: true,
};

const statusBadge = (status: ProviderApprovalStatus) => {
  const styles: Record<ProviderApprovalStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-rose-100 text-rose-800',
  };
  return styles[status];
};

export const ServiceProvidersList = () => {
  const { user } = useAuth();
  const isProviderAdmin = user?.role === 'SERVICE_PROVIDER_ADMIN';
  const [items, setItems] = useState<ServiceProvider[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [search, setSearch] = useState('');
  const [stateId, setStateId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState('');
  const [approvalTab, setApprovalTab] = useState<'all' | ProviderApprovalStatus>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceProvider | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [adminsProvider, setAdminsProvider] = useState<ServiceProvider | null>(null);
  const [adminUsers, setAdminUsers] = useState<AppUser[]>([]);
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPrimary, setAdminPrimary] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<ServiceProvider | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    Promise.all([statesApi.getAll(), categoriesApi.getAll()])
      .then(([s, c]) => {
        setStates(s);
        setCategories(c);
      })
      .catch(() => {
        setStates([]);
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    if (!form.categoryId) {
      setSubcategories([]);
      return;
    }
    categoriesApi
      .getSubcategories(form.categoryId)
      .then(setSubcategories)
      .catch(() => setSubcategories([]));
  }, [form.categoryId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await serviceProvidersApi.getAll({
        search,
        keyword: keyword || undefined,
        stateId: stateId || undefined,
        categoryId: categoryId || undefined,
        city: city || undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        radius: radius || undefined,
        approvalStatus: approvalTab === 'all' ? undefined : approvalTab,
        page,
        limit: 10,
        sortBy: latitude && longitude && radius ? 'distance' : 'createdAt',
        sortOrder: latitude && longitude && radius ? 'asc' : 'desc',
      });
      setItems(data.items);
      setTotalPages(data.pagination.totalPages || 1);
      setTotal(data.pagination.total);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load providers',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, keyword, stateId, categoryId, city, latitude, longitude, radius, approvalTab, page]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, stateId: states[0]?.id || '', categoryId: categories[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (item: ServiceProvider) => {
    setEditing(item);
    setForm({
      name: item.name,
      categoryId: item.categoryId,
      subcategoryId: item.subcategoryId || '',
      description: item.description || '',
      phone: item.phone || '',
      landline: item.landline || '',
      email: item.email || '',
      website: item.website || '',
      address: item.address || '',
      city: item.city || '',
      stateId: item.stateId,
      latitude: item.latitude != null ? String(item.latitude) : '',
      longitude: item.longitude != null ? String(item.longitude) : '',
      about: item.about || '',
      services: item.services || '',
      coverPhotoUrl: item.coverPhotoUrl || '',
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId,
        subcategoryId: form.subcategoryId || undefined,
        description: form.description.trim() || undefined,
        phone: form.phone.trim() || undefined,
        landline: form.landline.trim() || undefined,
        email: form.email.trim() || undefined,
        website: form.website.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        stateId: form.stateId,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        about: form.about.trim() || undefined,
        services: form.services.trim() || undefined,
        coverPhotoUrl: form.coverPhotoUrl.trim() || undefined,
        isActive: form.isActive,
      };
      if (editing) await serviceProvidersApi.update(editing.id, payload);
      else await serviceProvidersApi.create(payload);
      setModalOpen(false);
      setToast({ visible: true, message: 'Provider saved', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to save provider',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ServiceProvider) => {
    if (!confirm(`Delete provider "${item.name}"?`)) return;
    try {
      await serviceProvidersApi.remove(item.id);
      setToast({ visible: true, message: 'Provider deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to delete',
        type: 'error',
      });
    }
  };

  const handleApprove = async (item: ServiceProvider) => {
    try {
      await serviceProvidersApi.approve(item.id);
      setToast({ visible: true, message: 'Provider approved', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to approve',
        type: 'error',
      });
    }
  };

  const openReject = (item: ServiceProvider) => {
    setRejectTarget(item);
    setRejectReason('');
    setRejectOpen(true);
  };

  const handleReject = async (e: FormEvent) => {
    e.preventDefault();
    if (!rejectTarget) return;
    setSaving(true);
    try {
      await serviceProvidersApi.reject(rejectTarget.id, rejectReason.trim());
      setRejectOpen(false);
      setToast({ visible: true, message: 'Provider rejected', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to reject',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const openAdmins = async (item: ServiceProvider) => {
    setAdminsProvider(item);
    setAdminUserId('');
    setAdminPrimary(false);
    setAdminsOpen(true);
    try {
      const [fresh, spaUsers, endUsers] = await Promise.all([
        serviceProvidersApi.getOne(item.id),
        usersApi.getAll({ role: 'SERVICE_PROVIDER_ADMIN', limit: 100 }),
        usersApi.getAll({ role: 'END_USER', limit: 100 }),
      ]);
      setAdminsProvider(fresh);
      const merged = [...spaUsers.items, ...endUsers.items];
      const unique = Array.from(new Map(merged.map((u) => [u.id, u])).values());
      setAdminUsers(unique);
    } catch {
      setAdminUsers([]);
    }
  };

  const handleAssignAdmin = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminsProvider || !adminUserId) return;
    setSaving(true);
    try {
      await serviceProvidersApi.assignAdmin(adminsProvider.id, {
        userId: adminUserId,
        isPrimary: adminPrimary,
      });
      const fresh = await serviceProvidersApi.getOne(adminsProvider.id);
      setAdminsProvider(fresh);
      setAdminUserId('');
      setAdminPrimary(false);
      setToast({ visible: true, message: 'Admin assigned', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to assign admin',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!adminsProvider) return;
    try {
      await serviceProvidersApi.removeAdmin(adminsProvider.id, userId);
      const fresh = await serviceProvidersApi.getOne(adminsProvider.id);
      setAdminsProvider(fresh);
      setToast({ visible: true, message: 'Admin removed', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to remove admin',
        type: 'error',
      });
    }
  };

  const handleToggleActive = async (item: ServiceProvider) => {
    try {
      await serviceProvidersApi.update(item.id, { isActive: !item.isActive });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to update status',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb
          title="Listing"
          paths={[{ name: 'Service Provider' }, { name: 'Listing' }]}
        />
        <div className="flex gap-2">
          {!isProviderAdmin && (
            <BulkImportButton entity="service-providers" onSuccess={load} />
          )}
          <Button onClick={openCreate} icon={<Plus size={16} />} className={isProviderAdmin ? 'hidden' : ''}>
            Add Provider
          </Button>
        </div>
      </div>

      {!isProviderAdmin && (
      <div className="flex flex-wrap gap-2">
        {APPROVAL_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setApprovalTab(tab.key);
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              approvalTab === tab.key
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, phone, services..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm"
            />
          </div>
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            placeholder="Keyword (e.g. wheelchair)"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm lg:w-48"
          />
          <input
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            placeholder="City"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm lg:w-40"
          />
          <select
            value={stateId}
            onChange={(e) => {
              setStateId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nearby</span>
          <input
            value={latitude}
            onChange={(e) => {
              setLatitude(e.target.value);
              setPage(1);
            }}
            placeholder="Latitude"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm w-36"
          />
          <input
            value={longitude}
            onChange={(e) => {
              setLongitude(e.target.value);
              setPage(1);
            }}
            placeholder="Longitude"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm w-36"
          />
          <input
            value={radius}
            onChange={(e) => {
              setRadius(e.target.value);
              setPage(1);
            }}
            placeholder="Radius km"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm w-28"
          />
          {(latitude || longitude || radius) && (
            <button
              type="button"
              className="text-sm text-slate-500 hover:text-slate-800"
              onClick={() => {
                setLatitude('');
                setLongitude('');
                setRadius('');
                setPage(1);
              }}
            >
              Clear location
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">State / City</th>
              <th className="px-4 py-3 font-medium">Distance</th>
              <th className="px-4 py-3 font-medium">Approval</th>
              <th className="px-4 py-3 font-medium">Active</th>
              {!isProviderAdmin && <th className="px-4 py-3 font-medium">Admins</th>}
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No providers found
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.phone || item.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{item.category?.name || '—'}</div>
                    <div className="text-xs text-slate-400">{item.subcategory?.name}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{item.state?.name || '—'}</div>
                    <div className="text-xs text-slate-400">{item.city || '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {item.distanceKm != null ? `${item.distanceKm} km` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(item.approvalStatus)}`}
                    >
                      {item.approvalStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!isProviderAdmin && (
                      <ToggleSwitch checked={item.isActive} onChange={() => handleToggleActive(item)} />
                    )}
                    {isProviderAdmin && (
                      <span className="text-xs text-slate-500">{item.isActive ? 'Active' : 'Inactive'}</span>
                    )}
                  </td>
                  {!isProviderAdmin && <td className="px-4 py-3 text-slate-600">{item.adminCount ?? 0}</td>}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {!isProviderAdmin && item.approvalStatus !== 'APPROVED' && (
                        <button
                          type="button"
                          title="Approve"
                          onClick={() => handleApprove(item)}
                          className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {!isProviderAdmin && item.approvalStatus !== 'REJECTED' && (
                        <button
                          type="button"
                          title="Reject"
                          onClick={() => openReject(item)}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                        >
                          <X size={16} />
                        </button>
                      )}
                      {!isProviderAdmin && (
                      <button
                        type="button"
                        title="Admins"
                        onClick={() => openAdmins(item)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <UserPlus size={16} />
                      </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                      >
                        <Pencil size={16} />
                      </button>
                      {!isProviderAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {total} provider{total === 1 ? '' : 's'}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="px-2 py-2">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Provider' : 'Add Provider'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Provider name"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={form.subcategoryId}
              onChange={(e) => setForm({ ...form, subcategoryId: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Subcategory (optional)</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              required
              value={form.stateId}
              onChange={(e) => setForm({ ...form, stateId: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">State</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="City"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="Latitude"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="Longitude"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={form.landline}
              onChange={(e) => setForm({ ...form, landline: e.target.value })}
              placeholder="Landline"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="Website"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Address"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            value={form.services}
            onChange={(e) => setForm({ ...form, services: e.target.value })}
            placeholder="Services offered"
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <textarea
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            placeholder="About / company info"
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <ImageUrlField
            label="Cover photo"
            value={form.coverPhotoUrl}
            onChange={(url) => setForm({ ...form, coverPhotoUrl: url })}
            placeholder="Cover photo URL"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <ToggleSwitch
              checked={form.isActive}
              onChange={(checked) => setForm({ ...form, isActive: checked })}
            />
            Active
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject Provider">
        <form onSubmit={handleReject} className="space-y-3">
          <p className="text-sm text-slate-600">
            Reject <span className="font-medium">{rejectTarget?.name}</span>
          </p>
          <textarea
            required
            minLength={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Rejection reason"
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              Reject
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={adminsOpen}
        onClose={() => setAdminsOpen(false)}
        title={`Admins — ${adminsProvider?.name || ''}`}
      >
        <div className="space-y-4">
          <ul className="space-y-2">
            {(adminsProvider?.admins || []).length === 0 ? (
              <li className="text-sm text-slate-400">No admins assigned</li>
            ) : (
              (adminsProvider?.admins || []).map((admin) => (
                <li
                  key={admin.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-800">
                      {admin.user.name || admin.user.email}
                      {admin.isPrimary ? (
                        <span className="ml-2 text-xs text-emerald-700">Primary</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500">{admin.user.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAdmin(admin.userId)}
                    className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))
            )}
          </ul>

          <form onSubmit={handleAssignAdmin} className="space-y-3 border-t border-slate-100 pt-3">
            <select
              required
              value={adminUserId}
              onChange={(e) => setAdminUserId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Select user (END_USER or SPA)</option>
              {adminUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email} — {u.role}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={adminPrimary}
                onChange={(e) => setAdminPrimary(e.target.checked)}
              />
              Set as primary admin
            </label>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !adminUserId}>
                Assign Admin
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
