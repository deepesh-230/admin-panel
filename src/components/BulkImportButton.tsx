import { useEffect, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import {
  bulkImportApi,
  type BulkImportEntity,
  type BulkImportResult,
} from '../api/bulkImport';
import { Button } from './common/Button';
import { Modal } from './common/Modal';
import { downloadTextFile, parseCsv, rowsToCsv } from '../utils/csv';

type Props = {
  entity: BulkImportEntity;
  label?: string;
  context?: { categoryId?: string; subcategoryId?: string };
  onSuccess?: () => void;
  disabled?: boolean;
};

export function BulkImportButton({
  entity,
  label = 'Import CSV',
  context,
  onSuccess,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [preview, setPreview] = useState<BulkImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState<{ columns: string[]; sample: string[] } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    bulkImportApi
      .getTemplate(entity)
      .then(setTemplate)
      .catch(() => setTemplate(null));
  }, [open, entity]);

  const reset = () => {
    setFileName('');
    setRows([]);
    setPreview(null);
    setError('');
    setLoading(false);
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const onFileChange = async (file: File | null) => {
    setPreview(null);
    setError('');
    if (!file) {
      setFileName('');
      setRows([]);
      return;
    }
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.length) {
      setError('No data rows found. Include a header row and at least one record.');
      setRows([]);
      setFileName(file.name);
      return;
    }
    setFileName(file.name);
    setRows(parsed);
  };

  const runPreview = async () => {
    if (!rows.length) return;
    setLoading(true);
    setError('');
    try {
      const result = await bulkImportApi.import(entity, rows, {
        dryRun: true,
        ...context,
      });
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    } finally {
      setLoading(false);
    }
  };

  const runImport = async () => {
    if (!rows.length) return;
    setLoading(true);
    setError('');
    try {
      const result = await bulkImportApi.import(entity, rows, context);
      setPreview(result);
      if (result.failed === 0) {
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    if (!template) return;
    downloadTextFile(`${entity}-template.csv`, rowsToCsv(template.columns, template.sample));
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        icon={<Upload size={16} />}
        disabled={disabled}
      >
        {label}
      </Button>

      <Modal isOpen={open} onClose={close} title="Bulk import (CSV)">
        <div className="space-y-4 text-sm">
          <p className="text-gray-600">
            Upload a CSV with a header row. Up to 500 rows per import. Existing records with the
            same unique key are skipped.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={downloadTemplate} icon={<Download size={14} />}>
              Download template
            </Button>
            <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Choose file
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {fileName && <p className="text-gray-700">Selected: {fileName} ({rows.length} rows)</p>}
          {error && <p className="text-red-600">{error}</p>}

          {preview && (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="font-medium text-gray-800">
                {preview.dryRun ? 'Preview' : 'Import result'}
              </p>
              <p className="mt-1 text-gray-600">
                Total {preview.total} · Created {preview.created} · Skipped {preview.skipped} ·
                Failed {preview.failed}
              </p>
              {preview.errors.length > 0 && (
                <ul className="mt-2 max-h-32 overflow-y-auto text-red-600">
                  {preview.errors.slice(0, 20).map((e) => (
                    <li key={`${e.row}-${e.message}`}>
                      Row {e.row}: {e.message}
                    </li>
                  ))}
                  {preview.errors.length > 20 && (
                    <li>…and {preview.errors.length - 20} more errors</li>
                  )}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={close}>
              Close
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!rows.length || loading}
              onClick={runPreview}
            >
              Preview
            </Button>
            <Button
              type="button"
              disabled={!rows.length || loading}
              onClick={runImport}
            >
              {loading ? 'Working…' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
