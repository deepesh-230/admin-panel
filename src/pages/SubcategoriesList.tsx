import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import {
  categoriesApi,
  keywordsApi,
  subcategoriesApi,
  type Category,
  type Keyword,
  type Subcategory,
} from '../api/masterData';

export const SubcategoriesList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [items, setItems] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [keywordModal, setKeywordModal] = useState<Subcategory | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordTerm, setKeywordTerm] = useState('');
  const [editing, setEditing] = useState<Subcategory | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    sortOrder: 0,
    categoryId: '',
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    categoriesApi.getAll().then((data) => {
      setCategories(data);
      if (data[0] && !categoryId) setCategoryId(data[0].id);
    });
  }, []);

  const load = async () => {
    if (!categoryId) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      setItems(await categoriesApi.getSubcategories(categoryId));
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [categoryId]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      sortOrder: 0,
      categoryId,
    });
    setModalOpen(true);
  };

  const openEdit = (item: Subcategory) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug || '',
      description: item.description || '',
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      categoryId: item.categoryId,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder) || 0,
        categoryId: form.categoryId,
      };
      if (editing) await subcategoriesApi.update(editing.id, payload);
      else await subcategoriesApi.create({ ...payload, categoryId: form.categoryId, name: payload.name });
      setModalOpen(false);
      setToast({ visible: true, message: 'Subcategory saved', type: 'success' });
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

  const handleDelete = async (item: Subcategory) => {
    if (!window.confirm(`Delete subcategory "${item.name}"?`)) return;
    try {
      await subcategoriesApi.remove(item.id);
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

  const openKeywords = async (item: Subcategory) => {
    setKeywordModal(item);
    setKeywordTerm('');
    setKeywords(await subcategoriesApi.getKeywords(item.id));
  };

  const addKeyword = async (e: FormEvent) => {
    e.preventDefault();
    if (!keywordModal || !keywordTerm.trim()) return;
    try {
      await keywordsApi.create({ subcategoryId: keywordModal.id, term: keywordTerm.trim() });
      setKeywordTerm('');
      setKeywords(await subcategoriesApi.getKeywords(keywordModal.id));
      setToast({ visible: true, message: 'Keyword added', type: 'success' });
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to add keyword',
        type: 'error',
      });
    }
  };

  const removeKeyword = async (id: string) => {
    if (!keywordModal) return;
    await keywordsApi.remove(id);
    setKeywords(await subcategoriesApi.getKeywords(keywordModal.id));
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
      <Breadcrumb title="Sub Category" paths={[{ name: 'Master Data' }, { name: 'Sub Categories' }]} />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm min-w-[220px]"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={openCreate} disabled={!categoryId} icon={<Plus size={16} />}>
            Add Sub Category
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
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.slug || '—'}</td>
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
                        <button
                          onClick={() => openKeywords(item)}
                          className="px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded"
                        >
                          Keywords
                        </button>
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
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                      {categoryId ? 'No subcategories found.' : 'Select a category first.'}
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
        title={editing ? 'Edit Sub Category' : 'Add Sub Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
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

      <Modal
        isOpen={Boolean(keywordModal)}
        onClose={() => setKeywordModal(null)}
        title={`Keywords — ${keywordModal?.name || ''}`}
      >
        <form onSubmit={addKeyword} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={keywordTerm}
              onChange={(e) => setKeywordTerm(e.target.value)}
              placeholder="Add keyword..."
              className="w-full h-10 pl-9 pr-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <Button type="submit" icon={<Plus size={16} />}>
            Add
          </Button>
        </form>
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {keywords.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between px-3 py-2 rounded-md bg-gray-50 text-sm"
            >
              <span>{k.term}</span>
              <button onClick={() => removeKeyword(k.id)} className="text-red-500 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
          {!keywords.length && <li className="text-sm text-gray-500 text-center py-4">No keywords yet.</li>}
        </ul>
      </Modal>
    </div>
  );
};
