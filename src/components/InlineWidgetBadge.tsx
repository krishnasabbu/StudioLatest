import { useState, useEffect } from 'react';
import { ChevronDown, Check, GripVertical } from 'lucide-react';
import { widgetTypes, WidgetType, getWidgetTypeLabel, getWidgetTypeIcon, detectWidgetType } from '../lib/widgetTypes';

interface InlineWidgetBadgeProps {
  element: HTMLElement;
  isActive: boolean;
  onTypeChange: (newType: WidgetType) => void;
  onClick: () => void;
}

export default function InlineWidgetBadge({
  element,
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

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-300';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:from-blue-50 hover:to-blue-100 hover:border-blue-300';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  const getIconColor = () => {
    switch (currentType) {
      case 'heading1':
      case 'heading2':
      case 'heading3':
        return 'text-purple-600';
      case 'hyperlink':
        return 'text-blue-600';
      case 'button':
      case 'cta':
        return 'text-green-600';
      case 'image':
        return 'text-orange-600';
      case 'condition':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="absolute left-0 top-0 z-[100] pointer-events-none" style={{ transform: 'translateX(-100%)' }}>
      <div className="flex items-center gap-1 pr-2 pointer-events-auto">
        <button
          onClick={handleBadgeClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border-2 transition-all ${bgClass} ${hoverClass} ${textClass} shadow-lg hover:shadow-xl backdrop-blur-sm`}
          title="Change widget type"
        >
          <GripVertical size={14} className="text-gray-400" />
          <CurrentIcon size={15} className={`${getIconColor()} font-semibold`} />
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${getIconColor()}`}
          />
        </button>

        {isDropdownOpen && (
          <div
            className={`absolute left-0 top-full mt-2 w-72 rounded-xl border-2 shadow-2xl ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-lg`}
            style={{ maxHeight: '450px', overflowY: 'auto' }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className={`p-3 border-b-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50'}`}>
              <div className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} uppercase tracking-wider px-2`}>
                Transform Widget
              </div>
            </div>
            <div className="p-2">
              {widgetTypes.map((widget) => {
                const Icon = widget.icon;
                const isActiveType = widget.type === currentType;

                const getWidgetIconColor = () => {
                  switch (widget.type) {
                    case 'heading1':
                    case 'heading2':
                    case 'heading3':
                      return isActiveType ? 'text-purple-600 bg-purple-100' : 'text-purple-500 bg-purple-50';
                    case 'hyperlink':
                      return isActiveType ? 'text-blue-600 bg-blue-100' : 'text-blue-500 bg-blue-50';
                    case 'button':
                    case 'cta':
                      return isActiveType ? 'text-green-600 bg-green-100' : 'text-green-500 bg-green-50';
                    case 'image':
                      return isActiveType ? 'text-orange-600 bg-orange-100' : 'text-orange-500 bg-orange-50';
                    case 'condition':
                      return isActiveType ? 'text-amber-600 bg-amber-100' : 'text-amber-500 bg-amber-50';
                    default:
                      return isActiveType ? 'text-gray-600 bg-gray-100' : 'text-gray-500 bg-gray-50';
                  }
                };

                return (
                  <button
                    key={widget.type}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleTypeSelect(widget.type);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      isActiveType
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md'
                        : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-md ${getWidgetIconColor()}`}>
                      <Icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`text-sm font-semibold ${isActiveType ? 'text-blue-700' : textClass}`}>
                        {widget.label}
                      </div>
                      <div className={`text-xs ${textSecondaryClass} mt-0.5`}>
                        {widget.description}
                      </div>
                    </div>
                    {isActiveType && (
                      <div className="flex-shrink-0 p-1.5 rounded-full bg-blue-600">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
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
