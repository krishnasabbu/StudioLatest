import { useState, useEffect } from 'react';
import { X, Variable as VariableIcon, GitBranch, Repeat, Link2, Square, Wand2 } from 'lucide-react';
import { SelectionInfo, ConditionDefinition, Variable as VariableType } from '../types/template';
import WrapInConditionModal from './WrapInConditionModal';
import { detectWidgetType, getWidgetTypeLabel, getWidgetTypeIcon, widgetTypes, WidgetType } from '../lib/widgetTypes';

interface SelectionToolbarProps {
  selection: SelectionInfo | null;
  position: { x: number; y: number };
  conditions: ConditionDefinition[];
  variables: VariableType[];
  onMakeVariable: (variableName: string) => void;
  onWrapCondition: (conditionName: string) => void;
  onCreateAndWrapCondition: (condition: ConditionDefinition) => void;
  onWrapLoop: (arrayVariable: string) => void;
  onInsertLink: (url: string, text: string) => void;
  onInsertCTA: (text: string, url: string) => void;
  onChangeWidget: (widgetType: WidgetType) => void;
  onClose: () => void;
}

export default function SelectionToolbar({
  selection,
  position,
  conditions,
  variables,
  onMakeVariable,
  onWrapCondition,
  onCreateAndWrapCondition,
  onWrapLoop,
  onInsertLink,
  onInsertCTA,
  onChangeWidget,
  onClose
}: SelectionToolbarProps) {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const [mode, setMode] = useState<'menu' | 'variable' | 'loop' | 'link' | 'cta' | 'widget'>('menu');
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [variableName, setVariableName] = useState('');
  const [loopVar, setLoopVar] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState(selection?.content || '');
  const [ctaText, setCtaText] = useState(selection?.content || '');
  const [ctaUrl, setCtaUrl] = useState('');
  const [currentWidgetType, setCurrentWidgetType] = useState<WidgetType>('plaintext');

  useEffect(() => {
    if (selection?.element) {
      setCurrentWidgetType(detectWidgetType(selection.element));
    }
  }, [selection]);

  if (!selection) return null;

  const handleMakeVariable = () => {
    if (variableName.trim()) {
      onMakeVariable(variableName.trim());
      setVariableName('');
      setMode('menu');
      onClose();
    }
  };


  const handleWrapLoop = () => {
    if (loopVar.trim()) {
      onWrapLoop(loopVar.trim());
      setLoopVar('');
      setMode('menu');
      onClose();
    }
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      onInsertLink(linkUrl.trim(), linkText.trim() || linkUrl.trim());
      setLinkUrl('');
      setLinkText('');
      setMode('menu');
      onClose();
    }
  };

  const handleInsertCTA = () => {
    if (ctaText.trim() && ctaUrl.trim()) {
      onInsertCTA(ctaText.trim(), ctaUrl.trim());
      setCtaText('');
      setCtaUrl('');
      setMode('menu');
      onClose();
    }
  };

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const inputClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  return (
    <>
      {showConditionModal && (
        <WrapInConditionModal
          selectedContent={selection?.content || ''}
          variables={variables}
          conditions={conditions}
          onWrapCondition={(conditionName) => {
            onWrapCondition(conditionName);
            setShowConditionModal(false);
            onClose();
          }}
          onCreateAndWrapCondition={(condition) => {
            onCreateAndWrapCondition(condition);
            setShowConditionModal(false);
            onClose();
          }}
          onClose={() => {
            setShowConditionModal(false);
            onClose();
          }}
        />
      )}

    <div
      className={`fixed ${bgClass} border-2 rounded-xl shadow-2xl z-50 min-w-72`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {mode === 'menu' && (
        <div className="p-2">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-300 dark:border-gray-600">
            <span className={`text-sm font-bold ${textClass}`}>Selection Actions</span>
            <button onClick={onClose} className="text-gray-400 hover:text-wf-red transition-colors">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <button
            onClick={() => setMode('variable')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-left ${hoverClass} rounded-lg transition-colors ${textClass}`}
          >
            <VariableIcon size={18} className="text-blue-600" strokeWidth={2.5} />
            Make Variable
          </button>
          <button
            onClick={() => {
              setShowConditionModal(true);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-left ${hoverClass} rounded-lg transition-colors ${textClass}`}
          >
            <GitBranch size={18} className="text-green-600" strokeWidth={2.5} />
            Wrap in Condition
          </button>
          <button
            onClick={() => setMode('loop')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-left ${hoverClass} rounded-lg transition-colors ${textClass}`}
          >
            <Repeat size={18} className="text-purple-600" strokeWidth={2.5} />
            Wrap in Loop
          </button>
          <button
            onClick={() => {
              setLinkText(selection?.content || '');
              setMode('link');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-left ${hoverClass} rounded-lg transition-colors ${textClass}`}
          >
            <Link2 size={18} className="text-wf-red" strokeWidth={2.5} />
            Insert Hyperlink
          </button>
          <button
            onClick={() => {
              setCtaText(selection?.content || '');
              setMode('cta');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-left ${hoverClass} rounded-lg transition-colors ${textClass}`}
          >
            <Square size={18} className="text-wf-gold" strokeWidth={2.5} />
            Insert CTA Button
          </button>
          <div className="border-t border-gray-300 dark:border-gray-600 my-2"></div>
          <button
            onClick={() => setMode('widget')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-left ${hoverClass} rounded-lg transition-colors ${textClass}`}
          >
            <Wand2 size={18} className="text-orange-600" strokeWidth={2.5} />
            <div className="flex-1">
              <div>Transform Widget</div>
              <div className="text-xs text-gray-500 font-normal">
                Current: {getWidgetTypeLabel(currentWidgetType)}
              </div>
            </div>
          </button>
        </div>
      )}

      {mode === 'variable' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${textClass}`}>Create Variable</h3>
            <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-wf-red">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Variable name (e.g., userName)"
            value={variableName}
            onChange={(e) => setVariableName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleMakeVariable()}
            className={`w-full px-3 py-2 border-2 rounded-lg text-sm mb-3 font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${inputClass}`}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleMakeVariable}
              disabled={!variableName.trim()}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all"
            >
              Create
            </button>
            <button
              onClick={() => setMode('menu')}
              className={`px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold ${hoverClass} ${textClass} transition-all`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}


      {mode === 'loop' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${textClass}`}>Create Loop</h3>
            <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-wf-red">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <input
            type="text"
            placeholder="Array variable (e.g., items)"
            value={loopVar}
            onChange={(e) => setLoopVar(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleWrapLoop()}
            className={`w-full px-3 py-2 border-2 rounded-lg text-sm mb-3 font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${inputClass}`}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleWrapLoop}
              disabled={!loopVar.trim()}
              className="flex-1 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md transition-all"
            >
              Apply
            </button>
            <button
              onClick={() => setMode('menu')}
              className={`px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold ${hoverClass} ${textClass} transition-all`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'link' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${textClass}`}>Insert Hyperlink</h3>
            <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-wf-red">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <label className={`block text-xs font-bold ${textSecondaryClass} mb-2`}>
            URL <span className="text-wf-red">*</span>
          </label>
          <input
            type="text"
            placeholder="https://wellsfargo.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className={`w-full px-3 py-2 border-2 rounded-lg text-sm mb-3 font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${inputClass}`}
            autoFocus
          />
          <label className={`block text-xs font-bold ${textSecondaryClass} mb-2`}>
            Link Text (optional)
          </label>
          <input
            type="text"
            placeholder="Click here"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsertLink()}
            className={`w-full px-3 py-2 border-2 rounded-lg text-sm mb-3 font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${inputClass}`}
          />
          <div className="flex gap-2">
            <button
              onClick={handleInsertLink}
              disabled={!linkUrl.trim()}
              className="flex-1 bg-wf-red text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all border-2 border-red-800"
            >
              Insert Link
            </button>
            <button
              onClick={() => setMode('menu')}
              className={`px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold ${hoverClass} ${textClass} transition-all`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'cta' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${textClass}`}>Insert CTA Button</h3>
            <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-wf-red">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <label className={`block text-xs font-bold ${textSecondaryClass} mb-2`}>
            Button Text <span className="text-wf-red">*</span>
          </label>
          <input
            type="text"
            placeholder="Get Started"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            className={`w-full px-3 py-2 border-2 rounded-lg text-sm mb-3 font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${inputClass}`}
            autoFocus
          />
          <label className={`block text-xs font-bold ${textSecondaryClass} mb-2`}>
            Button URL <span className="text-wf-red">*</span>
          </label>
          <input
            type="text"
            placeholder="https://wellsfargo.com"
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsertCTA()}
            className={`w-full px-3 py-2 border-2 rounded-lg text-sm mb-3 font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${inputClass}`}
          />
          <div className="flex gap-2">
            <button
              onClick={handleInsertCTA}
              disabled={!ctaText.trim() || !ctaUrl.trim()}
              className="flex-1 bg-wf-red text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all border-2 border-red-800"
            >
              Insert Button
            </button>
            <button
              onClick={() => setMode('menu')}
              className={`px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold ${hoverClass} ${textClass} transition-all`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {mode === 'widget' && (
        <div className="p-4 max-w-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${textClass}`}>Transform Widget</h3>
            <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-wf-red">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex items-center gap-3">
              {(() => {
                const CurrentIcon = getWidgetTypeIcon(currentWidgetType);
                return <CurrentIcon size={20} className="text-blue-600" strokeWidth={2.5} />;
              })()}
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Current Widget</div>
                <div className={`text-sm font-bold ${textClass}`}>{getWidgetTypeLabel(currentWidgetType)}</div>
              </div>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">
            Transform to:
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {widgetTypes.map((widget) => {
              const Icon = widget.icon;
              const isCurrentType = widget.type === currentWidgetType;

              const getWidgetIconColor = () => {
                switch (widget.type) {
                  case 'heading1':
                  case 'heading2':
                  case 'heading3':
                    return 'text-purple-600 bg-purple-50';
                  case 'hyperlink':
                    return 'text-blue-600 bg-blue-50';
                  case 'button':
                  case 'cta':
                    return 'text-green-600 bg-green-50';
                  case 'image':
                    return 'text-orange-600 bg-orange-50';
                  case 'condition':
                    return 'text-amber-600 bg-amber-50';
                  default:
                    return 'text-gray-600 bg-gray-50';
                }
              };

              return (
                <button
                  key={widget.type}
                  onClick={() => {
                    onChangeWidget(widget.type);
                    setMode('menu');
                    onClose();
                  }}
                  disabled={isCurrentType}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg text-center transition-all ${
                    isCurrentType
                      ? 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed opacity-50'
                      : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 hover:shadow-md'
                  }`}
                  title={widget.description}
                >
                  <div className={`p-2 rounded-md ${getWidgetIconColor()}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div className={`text-xs font-semibold ${textClass}`}>
                    {widget.label}
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setMode('menu')}
            className={`w-full mt-3 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-bold ${hoverClass} ${textClass} transition-all`}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
    </>
  );
}
