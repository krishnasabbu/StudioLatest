import { useState, useEffect } from 'react';
import { ChevronDown, Check, GripVertical } from 'lucide-react';
import { widgetTypes, WidgetType, getWidgetTypeLabel, getWidgetTypeIcon, detectWidgetType } from '../lib/widgetTypes';

interface InlineWidgetBadgeProps {
  element: HTMLElement;
  isHovered: boolean;
  isActive: boolean;
  onTypeChange: (newType: WidgetType) => void;
  onClick: () => void;
}

export default function InlineWidgetBadge({
  element,
  isHovered,
  isActive,
  onTypeChange,
  onClick
}: InlineWidgetBadgeProps) {
  const [currentType, setCurrentType] = useState<WidgetType>('plaintext');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    setCurrentType(detectWidgetType(element));
  }, [element]);

  useEffect(() => {
    setIsDropdownOpen(isActive);
  }, [isActive]);

  const CurrentIcon = getWidgetTypeIcon(currentType);

  const handleTypeSelect = (type: WidgetType) => {
    setCurrentType(type);
    onTypeChange(type);
    setIsDropdownOpen(false);
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const showBadge = isHovered || isActive;

  return (
    <div className="absolute left-0 top-0 z-[100] pointer-events-none" style={{ transform: 'translateX(-100%)' }}>
      <div className="flex items-center gap-1 pr-2 pointer-events-auto">
        <div
          className={`flex items-center transition-all duration-200 ${
            showBadge ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}
        >
          <button
            onClick={handleBadgeClick}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${bgClass} ${hoverClass} ${textClass} shadow-sm`}
            title="Change widget type"
          >
            <GripVertical size={12} className="text-gray-400" />
            <CurrentIcon size={13} className="text-blue-600" />
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {isDropdownOpen && (
          <div
            className={`absolute left-0 top-full mt-1 w-64 rounded-lg border shadow-xl ${bgClass} overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
            style={{ maxHeight: '400px', overflowY: 'auto' }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className={`p-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`text-xs font-bold ${textSecondaryClass} uppercase tracking-wide px-2`}>
                Turn into
              </div>
            </div>
            <div className="p-1">
              {widgetTypes.map((widget) => {
                const Icon = widget.icon;
                const isActiveType = widget.type === currentType;

                return (
                  <button
                    key={widget.type}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleTypeSelect(widget.type);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${hoverClass} ${
                      isActiveType ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 ${isActiveType ? 'text-blue-600' : 'text-gray-400'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-medium ${textClass} ${isActiveType ? 'text-blue-600' : ''}`}>
                        {widget.label}
                      </div>
                      <div className={`text-xs ${textSecondaryClass}`}>
                        {widget.description}
                      </div>
                    </div>
                    {isActiveType && (
                      <Check size={16} className="text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
