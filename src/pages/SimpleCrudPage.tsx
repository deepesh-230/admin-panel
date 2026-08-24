import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { cmsApi, type CmsRecord } from '../api/cms';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';

export type CrudField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'url' | 'checkbox';
  required?: boolean;
};

type Props = {
  title: string;
  parent: string;
  endpoint: string;
  fields: CrudField[];
  listColumns?: string[];
  extraQuery?: Record<string, string>;
  createDefaults?: Record<string, unknown>;
  broadcast?: boolean;
};

function emptyForm(fields: CrudField[], defaults?: Record<string, unknown>) {
  const form: Record<string, unknown> = { ...defaults };
  fields.forEach((f) => {
    if (form[f.key] === undefined) form[f.key] = f.type === 'checkbox' ? true : '';
  });
  return form;
}

export function SimpleCrudPage({
  title,
  parent,
  endpoint,
  fields,
  listColumns,
  extraQuery,
  createDefaults,
  broadcast,
}: Props) {
  const api = cmsApi(endpoint);
  const columns = listColumns ?? fields.map((f) => f.key);
  const [items, setItems] = useState<CmsRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CmsRecord | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(emptyForm(fields, createDefaults));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      setItems(await api.getAll(search, extraQuery));
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
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, endpoint, JSON.stringify(extraQuery)]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(fields, createDefaults));
    setModalOpen(true);
  };

  const openEdit = (item: CmsRecord) => {
    setEditing(item);
    const next = emptyForm(fields, createDefaults);
    fields.forEach((f) => {
      next[f.key] = item[f.key] ?? next[f.key];
    });
    setForm(next);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, ...createDefaults };
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      setModalOpen(false);
      setToast({ visible: true, message: 'Saved', type: 'success' });
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

  const handleDelete = async (item: CmsRecord) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.remove(item.id);
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

  const handleBroadcast = async (item: CmsRecord) => {
    try {
      await api.broadcast(item.id);
      setToast({ visible: true, message: 'Link broadcast to all users', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Broadcast failed',
        type: 'error',
      });
    }
  };

  const display = (item: CmsRecord, key: string) => {
    const value = item[key];
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value == null) return '—';
    return String(value);
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
      <Breadcrumb title={title} paths={[{ name: parent }, { name: title }]} />

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-10 w-64 pl-9 pr-3 rounded-md border border-gray-300 text-sm"
            />
          </div>
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Add
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No records</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 font-medium capitalize">
                      {col}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-3 text-gray-700 max-w-xs truncate">
                        {display(item, col)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {broadcast && (
                          <button
                            type="button"
                            className="text-xs text-primary font-medium"
                            onClick={() => handleBroadcast(item)}
                          >
                            Broadcast
                          </button>
                        )}
                        <button type="button" onClick={() => openEdit(item)} className="text-gray-500 hover:text-primary">
                          <Pencil size={15} />
                        </button>
                        <button type="button" onClick={() => handleDelete(item)} className="text-gray-500 hover:text-red-600">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${title}` : `Add ${title}`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          {fields.map((field) => (
            <div key={field.key}>
              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.checked }))}
                  />
                  {field.label}
                </label>
              ) : field.type === 'textarea' ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <textarea
                    required={field.required}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[90px]"
                  />
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input
                    required={field.required}
                    type={field.type === 'url' ? 'url' : 'text'}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
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
}
