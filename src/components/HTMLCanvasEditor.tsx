import { useEffect, useRef, useState } from 'react';
import { SelectionInfo } from '../types/template';

interface HTMLCanvasEditorProps {
  html: string;
  onHtmlChange: (html: string) => void;
  onSelectionChange: (selection: SelectionInfo | null) => void;
}

export default function HTMLCanvasEditor({
  html,
  onHtmlChange,
  onSelectionChange
}: HTMLCanvasEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  const handleSelection = () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      onSelectionChange(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    if (!selectedText) {
      onSelectionChange(null);
      return;
    }

    let element = range.commonAncestorContainer as HTMLElement;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement as HTMLElement;
    }

    let selectionType: SelectionInfo['type'] = 'text';

    if (element.tagName === 'IMG') {
      selectionType = 'image';
    } else if (element.tagName === 'A' || element.closest('a')) {
      selectionType = 'link';
    } else if (element.tagName === 'DIV' || element.tagName === 'SECTION') {
      selectionType = 'block';
    }

    onSelectionChange({
      type: selectionType,
      content: selectedText,
      range,
      element,
    });

    setIsSelecting(true);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onHtmlChange(editorRef.current.innerHTML);
    }
  };

  const handleMouseUp = () => {
    setTimeout(handleSelection, 10);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsSelecting(false);
    }, 200);
  };

  return (
    <div className={`h-full flex flex-col transition-colors ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="flex-1 overflow-auto p-6">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onMouseUp={handleMouseUp}
          onKeyUp={handleSelection}
          onBlur={handleBlur}
          className={`min-h-full outline-none border-2 rounded-lg p-4 transition-colors ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
          }`}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
