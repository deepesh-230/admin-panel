import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cmsApi, type CmsRecord } from '../api/cms';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { BulkImportButton } from '../components/BulkImportButton';
import { formatFaqDate, stripHtml, truncateText } from '../utils/html';
import { slugify } from '../utils/slugify';

type Faq = CmsRecord & {
  title: string;
  slug?: string | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

type StatusFilter = 'all' | 'active' | 'inactive';
type View = 'list' | 'form';

const emptyForm = {
  title: '',
  description: '',
  slug: '',
  isActive: true,
};

export const FaqsList = () => {
  const api = cmsApi('faqs');
  const [items, setItems] = useState<Faq[]>([]);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showCount, setShowCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readMore, setReadMore] = useState<Faq | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems((await api.getAll(search)) as Faq[]);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load FAQs',
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

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter === 'active' && !item.isActive) return false;
      if (statusFilter === 'inactive' && item.isActive) return false;
      return true;
    });
  }, [items, statusFilter]);

  const paged = filtered.slice(0, showCount);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setView('form');
  };

  const openEdit = (item: Faq) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      description: item.description || '',
      slug: item.slug || '',
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
      setToast({ visible: true, message: 'Question is required', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.title);
      const payload = {
        title: form.title.trim(),
        description: form.description || undefined,
        slug,
        isActive: form.isActive,
      };
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      setToast({
        visible: true,
        message: editing ? 'FAQ updated' : 'FAQ created',
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

  const handleDelete = async (item: Faq) => {
    if (!window.confirm(`Delete FAQ "${item.title}"?`)) return;
    try {
      await api.remove(item.id);
      setToast({ visible: true, message: 'FAQ deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  const handleStatusToggle = async (item: Faq, isActive: boolean) => {
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
          title="Faq"
          paths={[
            { name: 'Faq', href: '/faq' },
            { name: editing ? 'Edit Faq' : 'Add Faq' },
          ]}
        />
        <div className="border-t-2 border-primary pt-6">
          <h2 className="mb-6 text-lg font-semibold text-primary">
            {editing ? 'Edit Faq' : 'Add Faq'}
          </h2>
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">
                Question: <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">
                Short Description
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(html) => setForm((prev) => ({ ...prev, description: html }))}
                placeholder="Enter answer..."
              />
            </div>
            <div className="max-w-md">
              <label className="mb-1 block text-sm font-semibold text-gray-800">Slug:</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder={slugify(form.title) || 'auto-generated-from-question'}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
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
      <Breadcrumb title="Faq" paths={[{ name: 'Faq' }]} />

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
                placeholder="Search by Question or Answer"
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
            <BulkImportButton entity="faqs" onSuccess={load} />
            <Button onClick={openCreate} icon={<Plus size={16} />}>
              Add New Faq
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
                  <th className="px-4 py-3">S No</th>
                  <th className="px-4 py-3">Question</th>
                  <th className="px-4 py-3">Answer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No FAQs found
                    </td>
                  </tr>
                ) : (
                  paged.map((item, index) => {
                    const plain = stripHtml(item.description || '');
                    const preview = truncateText(plain, 90);
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
                        <td className="max-w-md px-4 py-3 text-gray-600">
                          {plain ? (
                            <>
                              {preview}
                              {plain.length > 90 && (
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
                          <div className="flex items-center justify-center gap-2">
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

      <Modal
        isOpen={Boolean(readMore)}
        onClose={() => setReadMore(null)}
        title={readMore?.title || 'FAQ Answer'}
      >
        <div
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: readMore?.description || '' }}
        />
      </Modal>
    </div>
  );
};
