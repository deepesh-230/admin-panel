import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { paymentsApi, type Payment, type PaymentPurpose, type PaymentStatus, type PaymentSummary } from '../api/payments';
import { DateTimePicker } from '../components/ui/DateTimePicker';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';

const STATUS_TABS: { label: string; value: PaymentStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Success', value: 'SUCCESS' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Refunded', value: 'REFUNDED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

const PURPOSE_OPTIONS: { label: string; value: PaymentPurpose }[] = [
  { label: 'Sponsorship', value: 'SPONSORSHIP' },
  { label: 'Marketplace', value: 'MARKETPLACE' },
  { label: 'Subscription', value: 'SUBSCRIPTION' },
  { label: 'Donation', value: 'DONATION' },
  { label: 'Other', value: 'OTHER' },
];

const PLAN_OPTIONS = ['silver', 'gold', 'diamond'];

const GATEWAY_OPTIONS = ['razorpay', 'manual', 'upi', 'cash', 'card'];

const emptyForm = {
  payerName: '',
  payerEmail: '',
  payerPhone: '',
  amount: '',
  currency: 'INR',
  status: 'PENDING' as PaymentStatus,
  purpose: 'OTHER' as PaymentPurpose,
  planId: '',
  gateway: 'manual',
  orderId: '',
  paymentId: '',
  referenceNo: '',
  notes: '',
  paidAt: '',
};

function formatMoney(amount: number, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const PaymentsList = () => {
  const [items, setItems] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | ''>('');
  const [purposeFilter, setPurposeFilter] = useState<PaymentPurpose | ''>('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const load = async () => {
    try {
      setLoading(true);
      const [rows, stats] = await Promise.all([
        paymentsApi.getAll({
          search,
          status: statusFilter,
          purpose: purposeFilter,
        }),
        paymentsApi.getSummary(),
      ]);
      setItems(rows);
      setSummary(stats);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Failed to load payments',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [search, statusFilter, purposeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: Payment) => {
    setEditing(item);
    setForm({
      payerName: item.payerName || '',
      payerEmail: item.payerEmail || '',
      payerPhone: item.payerPhone || '',
      amount: String(item.amount),
      currency: item.currency || 'INR',
      status: item.status,
      purpose: item.purpose,
      planId: item.planId || '',
      gateway: item.gateway || 'manual',
      orderId: item.orderId || '',
      paymentId: item.paymentId || '',
      referenceNo: item.referenceNo || '',
      notes: item.notes || '',
      paidAt: item.paidAt || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast({ visible: true, message: 'Enter a valid amount', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        payerName: form.payerName || undefined,
        payerEmail: form.payerEmail || undefined,
        payerPhone: form.payerPhone || undefined,
        amount,
        currency: form.currency,
        status: form.status,
        purpose: form.purpose,
        planId: form.planId || undefined,
        gateway: form.gateway || undefined,
        orderId: form.orderId || undefined,
        paymentId: form.paymentId || undefined,
        referenceNo: form.referenceNo || undefined,
        notes: form.notes || undefined,
        paidAt: form.paidAt ? new Date(form.paidAt).toISOString() : undefined,
      };

      if (editing) {
        await paymentsApi.update(editing.id, payload);
      } else {
        await paymentsApi.create(payload);
      }

      setModalOpen(false);
      setToast({
        visible: true,
        message: editing ? 'Payment updated' : 'Payment recorded',
        type: 'success',
      });
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

  const handleDelete = async (item: Payment) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await paymentsApi.remove(item.id);
      setToast({ visible: true, message: 'Payment deleted', type: 'success' });
      load();
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Delete failed',
        type: 'error',
      });
    }
  };

  const handleQuickStatus = async (item: Payment, status: PaymentStatus) => {
    try {
      await paymentsApi.update(item.id, { status });
      setItems((rows) => rows.map((r) => (r.id === item.id ? { ...r, status } : r)));
      paymentsApi.getSummary().then(setSummary).catch(() => undefined);
    } catch (err) {
      setToast({
        visible: true,
        message: err instanceof Error ? err.message : 'Status update failed',
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

      <Breadcrumb title="Payments" paths={[{ name: 'Finance' }, { name: 'Payments' }]} />

      {summary && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Successful payments</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{summary.successCount}</p>
            <p className="text-sm text-emerald-700">{formatMoney(summary.successAmount)}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">{summary.pendingCount}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="mt-1 text-2xl font-semibold text-red-700">{summary.failedCount}</p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Refunded</p>
            <p className="mt-1 text-2xl font-semibold text-violet-700">{summary.refundedCount}</p>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                statusFilter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payer, ref, order, payment id..."
                className="h-10 w-72 max-w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm"
              />
            </div>
            <select
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value as PaymentPurpose | '')}
              className="h-10 rounded-md border border-gray-300 px-3 text-sm"
            >
              <option value="">All purposes</option>
              {PURPOSE_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Record payment
          </Button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-gray-200 bg-[#f8fafc] font-semibold text-gray-700">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Gateway</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(item.paidAt || item.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{item.payerName || '—'}</div>
                        <div className="text-xs text-gray-500">
                          {[item.payerEmail, item.payerPhone].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {formatMoney(item.amount, item.currency)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.purpose}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{item.planId || '—'}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{item.gateway || '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <div>{item.referenceNo || '—'}</div>
                        {item.paymentId && (
                          <div className="text-xs text-gray-400">{item.paymentId}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleQuickStatus(item, e.target.value as PaymentStatus)
                          }
                          className="rounded border border-gray-200 px-2 py-1 text-xs"
                        >
                          {STATUS_TABS.filter((t) => t.value).map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-primary"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit payment' : 'Record payment'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-gray-600">Payer name</span>
              <input
                value={form.payerName}
                onChange={(e) => setForm({ ...form, payerName: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-gray-600">Phone</span>
              <input
                value={form.payerPhone}
                onChange={(e) => setForm({ ...form, payerPhone: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-gray-600">Email</span>
            <input
              type="email"
              value={form.payerEmail}
              onChange={(e) => setForm({ ...form, payerEmail: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block sm:col-span-1">
              <span className="mb-1 block text-gray-600">Amount *</span>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-gray-600">Currency</span>
              <input
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-gray-600">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {STATUS_TABS.filter((t) => t.value).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-gray-600">Purpose</span>
              <select
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value as PaymentPurpose })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {PURPOSE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-gray-600">Plan (sponsorship)</span>
              <select
                value={form.planId}
                onChange={(e) => setForm({ ...form, planId: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">—</option>
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-gray-600">Gateway</span>
              <select
                value={form.gateway}
                onChange={(e) => setForm({ ...form, gateway: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {GATEWAY_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <DateTimePicker
              label="Paid at"
              value={form.paidAt}
              onChange={(paidAt) => setForm({ ...form, paidAt })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-gray-600">Order ID</span>
              <input
                value={form.orderId}
                onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-gray-600">Payment ID</span>
              <input
                value={form.paymentId}
                onChange={(e) => setForm({ ...form, paymentId: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-gray-600">Reference no.</span>
            <input
              value={form.referenceNo}
              onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-gray-600">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
