import { useEffect, useState, type FormEvent } from 'react';
import { Pencil } from 'lucide-react';
import { cmsApi, type CmsRecord } from '../api/cms';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { RichTextEditor } from '../components/ui/RichTextEditor';
import { Button } from '../components/common/Button';
import { Toast } from '../components/common/Toast';
import { ToggleSwitch } from '../components/common/ToggleSwitch';
import { formatFaqDate } from '../utils/html';

type CmsPageItem = CmsRecord & {
  slug: string;
  title: string;
  content: string;
  isActive?: boolean;
  createdAt?: string;
};

type View = 'list' | 'form';

const emptyForm = {
  title: '',
  content: '',
};

export const PagesList = () => {
  const api = cmsApi('pages');
  const [items, setItems] = useState<CmsPageItem[]>([]);
  const [view, setView] = useState<View>('list');
  const [editing, setEditing] = useState<CmsPageItem | null>(null);
  const [form, setForm] = useState(emptyForm);
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
      setItems((await api.getAll()) as CmsPageItem[]);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load pages',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') load();
  }, [view]);

  const openEdit = (item: CmsPageItem) => {
    setEditing(item);
    setForm({
      title: item.title || '',
      content: item.content || '',
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
    if (!editing) return;
    if (!form.title.trim()) {
      setToast({ visible: true, message: 'Title is required', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await api.update(editing.id, {
        title: form.title.trim(),
        content: form.content,
        slug: editing.slug,
      });
      setToast({ visible: true, message: 'Page updated successfully', type: 'success' });
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

  const handleStatusToggle = async (item: CmsPageItem, isActive: boolean) => {
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

  if (view === 'form' && editing) {
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
          title="Pages"
          paths={[
            { name: 'Pages', href: '/pages' },
            { name: 'Edit Information' },
          ]}
        />
        <div className="border-t-2 border-primary pt-6">
          <h2 className="mb-6 text-lg font-semibold text-primary">Edit Information</h2>
          <form onSubmit={handleSubmit} className="max-w-5xl space-y-5">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Title</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-800">Description</label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
                placeholder="Enter page content..."
              />
            </div>
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
      <Breadcrumb title="Pages" paths={[{ name: 'Pages' }]} />

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-gray-200 bg-[#f8fafc] font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">S No</th>
                  <th className="px-4 py-3">Information Title</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No pages found
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                      <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{item.title}</td>
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
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded bg-emerald-50 p-1.5 text-emerald-600 hover:bg-emerald-100"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
