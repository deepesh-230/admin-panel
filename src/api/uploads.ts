import { apiClient } from '../utils/apiClient';

export type UploadResult = {
  url: string;
  filename: string;
};

export const uploadsApi = {
  uploadImage: (file: File) =>
    apiClient.upload<UploadResult>('/api/v1/uploads', file),
};
