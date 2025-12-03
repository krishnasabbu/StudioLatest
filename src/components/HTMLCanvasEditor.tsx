import { useEffect, useRef, useState } from 'react';
import { SelectionInfo } from '../types/template';
import InlineWidgetBadge from './InlineWidgetBadge';
import { convertWidgetType, WidgetType } from '../lib/widgetTypes';

interface HTMLCanvasEditorProps {
  html: string;
  onHtmlChange: (html: string) => void;
  onSelectionChange: (selection: SelectionInfo | null) => void;
}

interface LineWidget {
  element: HTMLElement;
  top: number;
  left: number;
  height: number;
}

export default function HTMLCanvasEditor({
  html,
  onHtmlChange,
  onSelectionChange
}: HTMLCanvasEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme] = useState(localStorage.getItem('theme') || 'light');
  const [isSelecting, setIsSelecting] = useState(false);
  const [lineWidgets, setLineWidgets] = useState<LineWidget[]>([]);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
      setTimeout(() => {
        enhanceEditableElements();
        updateLineWidgets();
      }, 50);
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
        htmlEl.style.paddingLeft = '8px';
      }
    });
  };

  const updateLineWidgets = () => {
    if (!editorRef.current || !containerRef.current) return;

    const elements = editorRef.current.querySelectorAll('[data-widget-enhanced]');
    const containerRect = containerRef.current.getBoundingClientRect();
    const widgets: LineWidget[] = [];

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();

      widgets.push({
        element: htmlEl,
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
        height: rect.height
      });
    });

    setLineWidgets(widgets);
  };


  const findBlockElement = (element: HTMLElement): HTMLElement | null => {
    if (!editorRef.current) return null;

    let current: HTMLElement | null = element;

    while (current && current !== editorRef.current) {
      if (current.hasAttribute('data-widget-enhanced')) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  };

  const handleBadgeClick = (element: HTMLElement) => {
    setActiveElement(element === activeElement ? null : element);
  };

  const handleWidgetTypeChange = (element: HTMLElement, newType: WidgetType) => {
    if (!editorRef.current) return;

    const newElement = convertWidgetType(element, newType, true);
    element.parentNode?.replaceChild(newElement, element);

    setActiveElement(null);

    if (editorRef.current) {
      onHtmlChange(editorRef.current.innerHTML);
    }

    setTimeout(() => {
      enhanceEditableElements();
      updateLineWidgets();
    }, 50);
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
      setTimeout(updateLineWidgets, 50);
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

  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target === editorRef.current || !findBlockElement(target)) {
      setActiveElement(null);
    }
  };

  useEffect(() => {
    enhanceEditableElements();
    updateLineWidgets();

    const handleResize = () => updateLineWidgets();
    window.addEventListener('resize', handleResize);

    const intervalId = setInterval(updateLineWidgets, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeElement && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveElement(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeElement]);

  return (
    <div className="h-full flex flex-col transition-colors bg-white relative">
      <div className="flex-1 overflow-auto p-6" ref={containerRef}>
        <div className="relative">
          {lineWidgets.map((widget, index) => {
            const isActive = widget.element === activeElement;

            return (
              <div
                key={index}
                className="absolute pointer-events-none"
                style={{
                  top: `${widget.top}px`,
                  left: `${widget.left}px`,
                  height: `${widget.height}px`,
                }}
              >
                <InlineWidgetBadge
                  element={widget.element}
                  isActive={isActive}
                  onTypeChange={(newType) => handleWidgetTypeChange(widget.element, newType)}
                  onClick={() => handleBadgeClick(widget.element)}
                />
              </div>
            );
          })}

          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={handleMouseUp}
            onClick={handleEditorClick}
            onKeyUp={handleSelection}
            onBlur={handleBlur}
            className="min-h-full outline-none border-2 rounded-lg p-4 transition-colors bg-white border-gray-200 text-gray-900"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              paddingLeft: '60px'
            }}
            suppressContentEditableWarning
          />
        </div>
      </div>
    </div>
  );
}
