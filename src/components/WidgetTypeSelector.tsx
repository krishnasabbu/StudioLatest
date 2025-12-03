import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { widgetTypes, WidgetType, getWidgetTypeLabel, getWidgetTypeIcon, detectWidgetType } from '../lib/widgetTypes';

interface WidgetTypeSelectorProps {
  element: HTMLElement | null;
  position: { x: number; y: number };
  onTypeChange: (newType: WidgetType) => void;
  onClose: () => void;
}

export default function WidgetTypeSelector({
  element,
  position,
  onTypeChange,
  onClose,
}: WidgetTypeSelectorProps) {
  const [currentType, setCurrentType] = useState<WidgetType>('plaintext');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme] = useState(localStorage.getItem('theme') || 'light');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (element) {
      setCurrentType(detectWidgetType(element));
    }
  }, [element]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!element) return null;

  const CurrentIcon = getWidgetTypeIcon(currentType);
  const currentLabel = getWidgetTypeLabel(currentType);

  const handleTypeSelect = (type: WidgetType) => {
    setCurrentType(type);
    onTypeChange(type);
    setIsDropdownOpen(false);
  };

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      ref={dropdownRef}
      className="fixed z-[1000]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-lg transition-all ${bgClass} ${hoverClass} ${textClass} group`}
          title="Change widget type"
        >
          <CurrentIcon size={14} className="text-blue-600" />
          <span className="text-xs font-semibold">{currentLabel}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isDropdownOpen && (
        <div
          className={`absolute left-0 top-full mt-1 w-64 rounded-lg border shadow-xl ${bgClass} overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        >
          <div className={`p-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`text-xs font-bold ${textSecondaryClass} uppercase tracking-wide px-2`}>
              Change to
            </div>
          </div>
          <div className="p-1">
            {widgetTypes.map((widget) => {
              const Icon = widget.icon;
              const isActive = widget.type === currentType;

              return (
                <button
                  key={widget.type}
                  onClick={() => handleTypeSelect(widget.type)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${hoverClass} ${
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`text-sm font-semibold ${textClass} ${isActive ? 'text-blue-600' : ''}`}>
                      {widget.label}
                    </div>
                    <div className={`text-xs ${textSecondaryClass}`}>
                      {widget.description}
                    </div>
                  </div>
                  {isActive && (
                    <Check size={16} className="text-blue-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
