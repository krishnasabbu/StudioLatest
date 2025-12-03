import { useEffect, useRef, useState } from 'react';
import { SelectionInfo } from '../types/template';
import WidgetTypeSelector from './WidgetTypeSelector';
import { convertWidgetType, WidgetType } from '../lib/widgetTypes';

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
  const [theme] = useState(localStorage.getItem('theme') || 'light');
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [widgetSelectorElement, setWidgetSelectorElement] = useState<HTMLElement | null>(null);
  const [widgetSelectorPosition, setWidgetSelectorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
      enhanceEditableElements();
    }
  }, [html]);

  const enhanceEditableElements = () => {
    if (!editorRef.current) return;

    const elements = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6, p, div, blockquote, ul, ol, pre, a');
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (!htmlEl.hasAttribute('data-widget-enhanced')) {
        htmlEl.setAttribute('data-widget-enhanced', 'true');
        htmlEl.style.position = 'relative';
        htmlEl.style.transition = 'all 0.2s ease';
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!editorRef.current || isSelecting) return;

    const target = e.target as HTMLElement;

    if (target === editorRef.current) {
      setHoveredElement(null);
      return;
    }

    const blockElement = findBlockElement(target);
    if (blockElement && blockElement !== hoveredElement) {
      setHoveredElement(blockElement);
      updateWidgetSelectorPosition(blockElement);
    }
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setHoveredElement(null);
    }, 100);
  };

  const findBlockElement = (element: HTMLElement): HTMLElement | null => {
    if (!editorRef.current) return null;

    let current: HTMLElement | null = element;

    while (current && current !== editorRef.current) {
      const tagName = current.tagName.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'blockquote', 'ul', 'ol', 'pre', 'a'].includes(tagName)) {
        if (current.parentElement === editorRef.current || current.hasAttribute('data-widget-enhanced')) {
          return current;
        }
      }
      current = current.parentElement;
    }

    return null;
  };

  const updateWidgetSelectorPosition = (element: HTMLElement) => {
    if (!editorRef.current) return;

    const editorRect = editorRef.current.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    setWidgetSelectorPosition({
      x: elementRect.left - 10,
      y: elementRect.top
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const blockElement = findBlockElement(target);

    if (blockElement) {
      setWidgetSelectorElement(blockElement);
      updateWidgetSelectorPosition(blockElement);
    }
  };

  const handleWidgetTypeChange = (newType: WidgetType) => {
    if (!widgetSelectorElement || !editorRef.current) return;

    const newElement = convertWidgetType(widgetSelectorElement, newType, true);

    widgetSelectorElement.parentNode?.replaceChild(newElement, widgetSelectorElement);

    setWidgetSelectorElement(null);
    setHoveredElement(null);

    if (editorRef.current) {
      onHtmlChange(editorRef.current.innerHTML);
    }

    setTimeout(enhanceEditableElements, 100);
  };

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

  useEffect(() => {
    enhanceEditableElements();
  }, []);

  return (
    <div className="h-full flex flex-col transition-colors bg-white relative">
      {(hoveredElement || widgetSelectorElement) && (
        <WidgetTypeSelector
          element={widgetSelectorElement || hoveredElement}
          position={widgetSelectorPosition}
          onTypeChange={handleWidgetTypeChange}
          onClose={() => {
            setWidgetSelectorElement(null);
            setHoveredElement(null);
          }}
        />
      )}

      <div className="flex-1 overflow-auto p-6">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          onKeyUp={handleSelection}
          onBlur={handleBlur}
          className="min-h-full outline-none border-2 rounded-lg p-4 transition-colors bg-white border-gray-200 text-gray-900"
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
