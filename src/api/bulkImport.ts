import { apiClient } from '../utils/apiClient';

export type BulkImportEntity =
  | 'categories'
  | 'subcategories'
  | 'keywords'
  | 'service-providers'
  | 'marketplace-products'
  | 'volunteers'
  | 'faqs'
  | 'blogs'
  | 'job-alerts'
  | 'useful-links';

export type BulkImportResult = {
  dryRun: boolean;
  total: number;
  created: number;
  skipped: number;
  failed: number;
  errors: { row: number; message: string }[];
};

export type BulkImportTemplate = {
  columns: string[];
  sample: string[];
};

export const bulkImportApi = {
  getTemplate: (entity: BulkImportEntity) =>
    apiClient.get<BulkImportTemplate>(`/api/v1/bulk-import/${entity}/template`),

  import: (
    entity: BulkImportEntity,
    rows: Record<string, string>[],
    options?: { dryRun?: boolean; categoryId?: string; subcategoryId?: string },
  ) =>
    apiClient.post<BulkImportResult>('/api/v1/bulk-import', {
      entity,
      rows,
      dryRun: options?.dryRun ?? false,
      categoryId: options?.categoryId,
      subcategoryId: options?.subcategoryId,
    }),
};
