import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function MediaThumb({
  src,
  alt = '',
  className = 'h-10 w-10 rounded object-cover border border-gray-200',
}: Props) {
  const url = resolveMediaUrl(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-100 text-gray-400`}
        title={url ? 'Image could not be loaded' : 'No image'}
      >
        <ImageOff size={14} />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
