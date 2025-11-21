import { useState } from 'react';
import { X, Variable as VariableIcon, GitBranch, Repeat, Link2, Square, Plus } from 'lucide-react';
import { SelectionInfo, ConditionDefinition } from '../types/template';
import { useTheme } from '../contexts/ThemeContext';

interface SelectionToolbarProps {
  selection: SelectionInfo | null;
  position: { x: number; y: number };
  conditions: ConditionDefinition[];
  onMakeVariable: (variableName: string) => void;
  onWrapCondition: (conditionName: string) => void;
  onWrapLoop: (arrayVariable: string) => void;
  onInsertLink: (url: string, text: string) => void;
  onInsertCTA: (text: string, url: string) => void;
  onClose: () => void;
}

export default function SelectionToolbar({
  selection,
  position,
  conditions,
  onMakeVariable,
  onWrapCondition,
  onWrapLoop,
  onInsertLink,
  onInsertCTA,
  onClose
}: SelectionToolbarProps) {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'menu' | 'variable' | 'condition' | 'loop' | 'link' | 'cta'>('menu');
  const [variableName, setVariableName] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [showCreateNewCondition, setShowCreateNewCondition] = useState(false);
  const [loopVar, setLoopVar] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState(selection?.content || '');
  const [ctaText, setCtaText] = useState(selection?.content || '');
  const [ctaUrl, setCtaUrl] = useState('');

  if (!selection) return null;

  const handleMakeVariable = () => {
    if (variableName.trim()) {
      onMakeVariable(variableName.trim());
      setVariableName('');
      setMode('menu');
      onClose();
    }
  };

  const handleWrapCondition = () => {
    if (selectedCondition) {
      onWrapCondition(selectedCondition);
      setSelectedCondition('');
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
            onClick={() => setMode('condition')}
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

      {mode === 'condition' && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${textClass}`}>Wrap in Condition</h3>
            <button onClick={() => setMode('menu')} className="text-gray-400 hover:text-wf-red">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {conditions.length === 0 ? (
            <div className={`text-sm ${textSecondaryClass} mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg`}>
              No conditions created yet.
            </div>
          ) : (
            <>
              <label className={`block text-xs font-bold ${textSecondaryClass} mb-2`}>
                Select Condition
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className={`w-full px-3 py-2 border-2 rounded-lg text-sm mb-3 font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${inputClass}`}
                autoFocus
              >
                <option value="">Choose a condition...</option>
                {conditions.map((cond) => (
                  <option key={cond.id} value={cond.name}>
                    {cond.name} {cond.description ? `- ${cond.description}` : ''}
                  </option>
                ))}
              </select>
            </>
          )}

          <div className={`text-xs ${textSecondaryClass} mb-2 text-center`}>
            Need a new condition? Create one in the Conditions panel on the left.
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleWrapCondition}
              disabled={!selectedCondition}
              className="flex-1 bg-wf-red text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all border-2 border-red-800"
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
    </div>
  );
}
