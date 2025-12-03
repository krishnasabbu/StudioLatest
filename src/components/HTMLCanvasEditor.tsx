import { useEffect, useRef, useState } from 'react';
import { SelectionInfo } from '../types/template';
import { convertWidgetType, WidgetType, detectWidgetType, getWidgetTypeIcon, getWidgetTypeLabel, widgetTypes } from '../lib/widgetTypes';

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
      }
    });
  };

  const updateLineWidgets = () => {
    if (!editorRef.current || !containerRef.current) return;

    const elements = editorRef.current.querySelectorAll('[data-widget-enhanced]');
    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    const scrollLeft = containerRef.current.scrollLeft;
    const widgets: LineWidget[] = [];

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const rect = htmlEl.getBoundingClientRect();

      widgets.push({
        element: htmlEl,
        top: rect.top - containerRect.top + scrollTop,
        left: rect.left - containerRect.left + scrollLeft,
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
    const handleScroll = () => updateLineWidgets();

    window.addEventListener('resize', handleResize);

    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll);
    }

    const intervalId = setInterval(updateLineWidgets, 500);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
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

  const getWidgetPreview = (element: HTMLElement): string => {
    const text = element.textContent || '';
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  };

  return (
    <div className="h-full flex transition-colors bg-white">
      {/* Labels Section */}
      <div className="w-72 border-r-2 border-gray-200 bg-gradient-to-b from-gray-50 to-white overflow-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-md z-10">
          <h3 className="font-bold text-sm uppercase tracking-wider">Widget Structure</h3>
          <p className="text-xs text-blue-100 mt-1">Click to transform elements</p>
        </div>
        <div className="p-3 space-y-2">
          {lineWidgets.map((widget, index) => {
            const isActive = widget.element === activeElement;
            const widgetType = detectWidgetType(widget.element);
            const Icon = getWidgetTypeIcon(widgetType);
            const label = getWidgetTypeLabel(widgetType);
            const preview = getWidgetPreview(widget.element);

            const getIconBgColor = () => {
              switch (widgetType) {
                case 'heading1':
                case 'heading2':
                case 'heading3':
                  return 'bg-purple-100 text-purple-600';
                case 'hyperlink':
                  return 'bg-blue-100 text-blue-600';
                case 'button':
                case 'cta':
                  return 'bg-green-100 text-green-600';
                case 'image':
                  return 'bg-orange-100 text-orange-600';
                case 'condition':
                  return 'bg-amber-100 text-amber-600';
                default:
                  return 'bg-gray-100 text-gray-600';
              }
            };

            return (
              <div
                key={index}
                className={`group relative rounded-lg border-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
                onClick={() => handleBadgeClick(widget.element)}
              >
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-md ${getIconBgColor()}`}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                        {label}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {preview}
                      </div>
                    </div>
                  </div>
                </div>

                {isActive && (
                  <div className="border-t-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-2 px-1">
                      Transform to:
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {widgetTypes.slice(0, 6).map((type) => {
                        const TypeIcon = type.icon;
                        const isCurrentType = type.type === widgetType;
                        return (
                          <button
                            key={type.type}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWidgetTypeChange(widget.element, type.type);
                            }}
                            disabled={isCurrentType}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                              isCurrentType
                                ? 'bg-blue-600 text-white cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-blue-100 border border-gray-200'
                            }`}
                            title={type.description}
                          >
                            <TypeIcon size={14} />
                            <span className="truncate">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {lineWidgets.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">No widgets found</p>
              <p className="text-xs mt-1">Start typing in the editor</p>
            </div>
          )}
        </div>
      </div>

      {/* HTML Editor Section */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 px-6 py-3 shadow-sm">
          <h3 className="font-bold text-sm text-gray-700 uppercase tracking-wider">HTML Editor</h3>
          <p className="text-xs text-gray-500 mt-0.5">Edit your content directly</p>
        </div>
        <div className="flex-1 overflow-auto p-6" ref={containerRef}>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onMouseUp={handleMouseUp}
            onClick={handleEditorClick}
            onKeyUp={handleSelection}
            onBlur={handleBlur}
            className="min-h-full outline-none border-2 rounded-lg p-6 transition-all bg-white border-gray-200 text-gray-900 hover:border-blue-300 focus:border-blue-500 focus:shadow-lg"
            style={{
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
            suppressContentEditableWarning
          />
        </div>
      </div>
    </div>
  );
}
