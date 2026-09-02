import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowDownUp, Eye, Plus, Trash2, X } from 'lucide-react';
import { cmsApi, type CmsRecord } from '../api/cms';
import { uploadsApi } from '../api/uploads';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { BulkImportButton } from '../components/BulkImportButton';
import { formatFaqDate } from '../utils/html';

type MarketplaceProduct = CmsRecord & {
  name: string;
  actualPrice?: string | null;
  offerPrice?: string | null;
  color?: string | null;
  brand?: string | null;
  sellerName?: string | null;
  phone?: string | null;
  listingIntent?: string;
  description?: string | null;
  address?: string | null;
  features?: string | null;
  gallery?: string[];
  isActive?: boolean;
  createdAt?: string;
  createdBy?: { id: string; name?: string | null; email?: string | null } | null;
};

type StatusFilter = 'all' | 'active' | 'inactive';
type IntentFilter = 'all' | 'sell' | 'buy';
type View = 'list' | 'form';
type SortKey =
  | 'name'
  | 'listingIntent'
  | 'actualPrice'
  | 'offerPrice'
  | 'color'
  | 'brand'
  | 'createdBy'
  | 'isActive'
  | 'createdAt';
type SortDir = 'asc' | 'desc';

const emptyForm = {
  name: '',
  actualPrice: '',
  offerPrice: '',
  phone: '',
  listingIntent: 'sell',
  sellerName: '',
  description: '',
  address: '',
  color: '',
  brand: '',
  features: '',
  gallery: [] as string[],
  isActive: true,
};

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: null, label: 'S No' },
  { key: 'name', label: 'Product Name' },
  { key: 'listingIntent', label: 'Intent' },
  { key: 'actualPrice', label: 'Actual Price' },
  { key: 'offerPrice', label: 'Offer Price' },
  { key: 'color', label: 'Color' },
  { key: 'brand', label: 'Brand' },
  { key: 'createdBy', label: 'Created By' },
  { key: 'isActive', label: 'Status' },
  { key: 'createdAt', label: 'Created Date' },
];

function formatInrPrice(value: string | null | undefined): string {
  if (!value?.trim()) return '—';
  const num = Number(value.replace(/[^\d.]/g, ''));
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
}

function priceNumber(value: string | null | undefined): number {
  if (!value?.trim()) return 0;
  const num = Number(value.replace(/[^\d.]/g, ''));
  return Number.isNaN(num) ? 0 : num;
}

function getCreatedByName(item: MarketplaceProduct): string {
  if (item.createdBy?.name?.trim()) return item.createdBy.name.trim();
  if (item.sellerName?.trim()) return item.sellerName.trim();
  return '';
}

function normalizeIntent(value: string | null | undefined): 'sell' | 'buy' {
  return value?.toLowerCase() === 'buy' ? 'buy' : 'sell';
}

function intentLabel(value: string | null | undefined): string {
  return normalizeIntent(value) === 'buy' ? 'Want to buy' : 'Want to sell';
}

function IntentBadge({ value }: { value: string | null | undefined }) {
  const intent = normalizeIntent(value);
  return (
    <span
      className={
        intent === 'buy'
          ? 'inline-block rounded bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800'
          : 'inline-block rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'
      }
    >
      {intentLabel(value)}
    </span>
  );
}

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
  if (!sortKey) {
    return <span>{label}</span>;
  }
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

export const MarketplaceProductsList = () => {
  const api = cmsApi('marketplace/products');
  const [items, setItems] = useState<MarketplaceProduct[]>([]);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [intentFilter, setIntentFilter] = useState<IntentFilter>('all');
  const [showCount, setShowCount] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey | null>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [viewing, setViewing] = useState<MarketplaceProduct | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      const extra: Record<string, string> = {};
      if (intentFilter !== 'all') extra.listingIntent = intentFilter;
      setItems((await api.getAll(search, extra)) as MarketplaceProduct[]);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load products',
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
  }, [search, intentFilter, view]);

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
        case 'name':
          cmp = (a.name || '').localeCompare(b.name || '');
          break;
        case 'listingIntent':
          cmp = normalizeIntent(a.listingIntent).localeCompare(normalizeIntent(b.listingIntent));
          break;
        case 'actualPrice':
          cmp = priceNumber(a.actualPrice) - priceNumber(b.actualPrice);
          break;
        case 'offerPrice':
          cmp = priceNumber(a.offerPrice) - priceNumber(b.offerPrice);
          break;
        case 'color':
          cmp = (a.color || '').localeCompare(b.color || '');
          break;
        case 'brand':
          cmp = (a.brand || '').localeCompare(b.brand || '');
          break;
        case 'createdBy':
          cmp = getCreatedByName(a).localeCompare(getCreatedByName(b));
          break;
        case 'isActive':
          cmp = Number(Boolean(a.isActive)) - Number(Boolean(b.isActive));
          break;
        case 'createdAt':
          cmp =
            new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
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

  const backToList = () => {
    setView('list');
    setEditing(null);
    setForm(emptyForm);
  };

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setGalleryUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadsApi.uploadImage(file);
        urls.push(result.url);
      }
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Image upload failed',
        type: 'error',
      });
    } finally {
      setGalleryUploading(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setToast({ visible: true, message: 'Product name is required', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        actualPrice: form.actualPrice.trim() || undefined,
        offerPrice: form.offerPrice.trim() || undefined,
        phone: form.phone.trim() || undefined,
        listingIntent: form.listingIntent,
        sellerName: form.sellerName.trim() || undefined,
        description: form.description.trim() || undefined,
        address: form.address.trim() || undefined,
        color: form.color.trim() || undefined,
        brand: form.brand.trim() || undefined,
        features: form.features.trim() || undefined,
        gallery: form.gallery,
        isActive: form.isActive,
      };
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      setToast({
        visible: true,
        message: editing ? 'Product updated' : 'Product created',
        type: 'success',
      });
      backToList();
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

  const handleDelete = async (item: MarketplaceProduct) => {
    if (!window.confirm(`Delete product "${item.name}"?`)) return;
    try {
      await api.remove(item.id);
      setToast({ visible: true, message: 'Product deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  const handleStatusToggle = async (item: MarketplaceProduct, isActive: boolean) => {
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
          title="Product listing"
          paths={[
            { name: 'Market Place', href: '/marketplace/products' },
            { name: editing ? 'Edit Product' : 'Add Product' },
          ]}
        />
        <div className="border-t-2 border-primary pt-6">
          <h2 className="mb-6 text-lg font-semibold text-primary">
            {editing ? 'Edit Product' : 'Add Product'}
          </h2>
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">
                  Product Name: <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Actual Price</label>
                <input
                  value={form.actualPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, actualPrice: e.target.value }))}
                  placeholder="e.g. 1000"
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Offer Price</label>
                <input
                  value={form.offerPrice}
                  onChange={(e) => setForm((prev) => ({ ...prev, offerPrice: e.target.value }))}
                  placeholder="e.g. 800"
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Color</label>
                <input
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Brand</label>
                <input
                  value={form.brand}
                  onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Seller / Buyer Name</label>
                <input
                  value={form.sellerName}
                  onChange={(e) => setForm((prev) => ({ ...prev, sellerName: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-800">Intent</label>
                <select
                  value={form.listingIntent}
                  onChange={(e) => setForm((prev) => ({ ...prev, listingIntent: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                >
                  <option value="sell">Sell</option>
                  <option value="buy">Buy</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Features</label>
                <input
                  value={form.features}
                  onChange={(e) => setForm((prev) => ({ ...prev, features: e.target.value }))}
                  className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Product Images</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                    onChange={(e) => handleGalleryUpload(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={galleryUploading}
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    {galleryUploading ? 'Uploading…' : 'Upload images'}
                  </Button>
                  <span className="text-xs text-gray-500">JPEG, PNG, WebP or GIF</span>
                </div>
                {form.gallery.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {form.gallery.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative">
                        <img
                          src={url}
                          alt=""
                          className="h-24 w-24 rounded-md border border-gray-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white shadow hover:bg-red-600"
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-gray-500">No images uploaded yet.</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-semibold text-gray-800">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
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
      <Breadcrumb
        title="Product listing"
        paths={[{ name: 'Market Place' }, { name: 'Product listing' }]}
      />

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
                placeholder="Search by product, brand, color..."
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">Intent</label>
              <select
                value={intentFilter}
                onChange={(e) => setIntentFilter(e.target.value as IntentFilter)}
                className="h-10 rounded-md border border-gray-300 px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="sell">Want to sell</option>
                <option value="buy">Want to buy</option>
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
            {/* <Button type="button" variant="primary" className="h-10" onClick={load}>
              Filter
            </Button> */}
          </div>
          <div className="flex gap-2">
            <BulkImportButton entity="marketplace-products" onSuccess={load} />
            <Button onClick={openCreate} icon={<Plus size={16} />}>
              Add Product
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
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paged.map((item, index) => {
                    const createdBy = getCreatedByName(item);
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                        <td className="px-4 py-3">
                          <IntentBadge value={item.listingIntent} />
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatInrPrice(item.actualPrice)}
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatInrPrice(item.offerPrice)}
                        </td>
                        <td className="px-4 py-3">
                          {item.color ? (
                            <span className="inline-block rounded bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700">
                              {item.color}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.brand ? (
                            <span className="inline-block rounded bg-cyan-50 px-2.5 py-0.5 text-xs font-medium text-cyan-700">
                              {item.brand}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{createdBy || '—'}</td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={Boolean(item.isActive)}
                            onChange={(checked) => handleStatusToggle(item, checked)}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                          {formatFaqDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewing(item)}
                              className="rounded bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
                              title="View"
                            >
                              <Eye size={15} />
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
        isOpen={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || 'Product details'}
      >
        {viewing && (
          <div className="space-y-4 text-sm text-gray-700">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Actual Price</p>
                <p>{formatInrPrice(viewing.actualPrice)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Offer Price</p>
                <p>{formatInrPrice(viewing.offerPrice)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Color</p>
                <p>{viewing.color || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Brand</p>
                <p>{viewing.brand || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Created By</p>
                <p>{getCreatedByName(viewing) || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Created Date</p>
                <p>{formatFaqDate(viewing.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Phone</p>
                <p>{viewing.phone || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">Intent</p>
                <p>{intentLabel(viewing.listingIntent)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-gray-500">Address</p>
                <p>{viewing.address || '—'}</p>
              </div>
              {viewing.features && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">Features</p>
                  <p>{viewing.features}</p>
                </div>
              )}
              {viewing.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase text-gray-500">Description</p>
                  <p className="whitespace-pre-wrap">{viewing.description}</p>
                </div>
              )}
            </div>
            {viewing.gallery && viewing.gallery.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Gallery</p>
                <div className="flex flex-wrap gap-2">
                  {viewing.gallery.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="h-20 w-20 rounded border border-gray-200 object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
