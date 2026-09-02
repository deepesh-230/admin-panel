import { useEffect, useRef } from 'react';
import { Bold, Italic, Link, List, ListOrdered, Strikethrough, Underline } from 'lucide-react';

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 220 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value || '';
  }, [value]);

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || '');
  };

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) exec('createLink', url);
    handleInput();
  };

  const tools = [
    { icon: Bold, action: () => exec('bold') },
    { icon: Italic, action: () => exec('italic') },
    { icon: Underline, action: () => exec('underline') },
    { icon: Strikethrough, action: () => exec('strikeThrough') },
    { icon: List, action: () => exec('insertUnorderedList') },
    { icon: ListOrdered, action: () => exec('insertOrderedList') },
    { icon: Link, action: addLink },
  ];

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-2">
        {tools.map(({ icon: Icon, action }) => (
          <button
            key={Icon.displayName || Icon.name}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              action();
              handleInput();
            }}
            className="rounded p-1.5 text-gray-600 hover:bg-white hover:text-primary"
          >
            <Icon size={15} />
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        data-placeholder={placeholder}
        onInput={handleInput}
        className="min-w-full px-3 py-2 text-sm text-gray-800 outline-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]"
        style={{ minHeight }}
        suppressContentEditableWarning
      />
    </div>
  );
}
