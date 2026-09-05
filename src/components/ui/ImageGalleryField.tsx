import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { uploadsApi } from '../../api/uploads';
import { Button } from '../common/Button';
import { MediaThumb } from './MediaThumb';

type Props = {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
};

export function ImageGalleryField({
  label,
  value,
  onChange,
  hint = 'JPEG, PNG, WebP or GIF',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const result = await uploadsApi.uploadImage(file);
        urls.push(result.url);
      }
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Upload images'}
        </Button>
        <span className="text-xs text-gray-500">{hint}</span>
      </div>
      {value.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative">
              <MediaThumb
                src={url}
                alt=""
                className="h-24 w-24 rounded-md border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(index)}
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
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
