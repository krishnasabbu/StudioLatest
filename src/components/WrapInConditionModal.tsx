import { useState, useEffect } from 'react';
import { X, GitBranch, Info, PlusCircle, Trash2, MessageSquare, FileEdit, Sparkles, CheckCircle } from 'lucide-react';
import { Variable, ConditionClause, ConditionOperator, LogicOperator, ConditionDefinition } from '../types/template';
import ChatConditionBuilder from './ChatConditionBuilder';

interface WrapInConditionModalProps {
  selectedContent: string;
  variables: Variable[];
  conditions: ConditionDefinition[];
  onWrapCondition: (conditionName: string) => void;
  onCreateAndWrapCondition: (condition: ConditionDefinition) => void;
  onClose: () => void;
}

const operatorLabels: Record<ConditionOperator, string> = {
  '==': 'equals',
  '!=': 'not equals',
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater or equal',
  '<=': 'less or equal',
  'contains': 'contains',
  'notContains': 'not contains',
};

export default function WrapInConditionModal({
  selectedContent,
  variables,
  conditions,
  onWrapCondition,
  onCreateAndWrapCondition,
  onClose,
}: WrapInConditionModalProps) {
  const [theme] = useState(localStorage.getItem('theme') || 'light');

  const [conditionName, setConditionName] = useState('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [clauses, setClauses] = useState<ConditionClause[]>([
    { variable: '', operator: '==', value: '', valueType: 'literal' },
  ]);
  const [logicOperator, setLogicOperator] = useState<LogicOperator>('AND');
  const [hasElse, setHasElse] = useState(false);
  const [elseContent, setElseContent] = useState('');

  const [syncedFields, setSyncedFields] = useState<Set<string>>(new Set());
  const [lastSyncedField, setLastSyncedField] = useState<string>('');

  const showSyncIndicator = (fieldName: string) => {
    setSyncedFields(prev => new Set([...prev, fieldName]));
    setLastSyncedField(fieldName);
    setTimeout(() => {
      setLastSyncedField('');
    }, 2000);
  };

  const handleChatUpdate = (data: {
    name?: string;
    description?: string;
    clauses?: ConditionClause[];
    logicOperator?: LogicOperator;
    content?: string;
    hasElse?: boolean;
    elseContent?: string;
  }) => {
    if (data.name !== undefined && data.name !== conditionName) {
      setConditionName(data.name);
      showSyncIndicator('name');
    }
    if (data.description !== undefined && data.description !== conditionDescription) {
      setConditionDescription(data.description);
      showSyncIndicator('description');
    }
    if (data.clauses !== undefined && JSON.stringify(data.clauses) !== JSON.stringify(clauses)) {
      setClauses(data.clauses);
      showSyncIndicator('clauses');
    }
    if (data.logicOperator !== undefined && data.logicOperator !== logicOperator) {
      setLogicOperator(data.logicOperator);
      showSyncIndicator('logic');
    }
    if (data.hasElse !== undefined && data.hasElse !== hasElse) {
      setHasElse(data.hasElse);
      showSyncIndicator('hasElse');
    }
    if (data.elseContent !== undefined && data.elseContent !== elseContent) {
      setElseContent(data.elseContent);
      showSyncIndicator('elseContent');
    }
  };

  const handleAddClause = () => {
    setClauses([...clauses, { variable: '', operator: '==', value: '', valueType: 'literal' }]);
  };

  const handleRemoveClause = (index: number) => {
    if (clauses.length > 1) {
      const newClauses = [...clauses];
      newClauses.splice(index, 1);
      setClauses(newClauses);
    }
  };

  const handleUpdateClause = (index: number, field: keyof ConditionClause, value: any) => {
    const newClauses = [...clauses];
    newClauses[index] = { ...newClauses[index], [field]: value };
    setClauses(newClauses);
  };

  const handleCreateAndWrap = () => {
    if (!conditionName.trim() || !clauses.some((c) => c.variable && c.value)) return;

    const condition: ConditionDefinition = {
      id: Date.now().toString(),
      name: conditionName.trim(),
      description: conditionDescription.trim(),
      clauses: clauses.filter((c) => c.variable && c.value),
      logicOperator,
      content: selectedContent,
      hasElse,
      elseContent: hasElse ? elseContent : '',
    };

    onCreateAndWrapCondition(condition);
    onClose();
  };

  const handleChatComplete = (data: {
    name: string;
    description: string;
    clauses: ConditionClause[];
    logicOperator: LogicOperator;
    content: string;
    hasElse: boolean;
    elseContent: string;
  }) => {
    const condition: ConditionDefinition = {
      id: Date.now().toString(),
      name: data.name.trim(),
      description: data.description || '',
      clauses: data.clauses,
      logicOperator: data.logicOperator,
      content: selectedContent,
      hasElse: data.hasElse,
      elseContent: data.elseContent || '',
    };

    onCreateAndWrapCondition(condition);
    onClose();
  };

  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const inputClass = theme === 'dark'
    ? 'bg-gray-800 border-gray-700 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  const isFormValid = conditionName.trim() && clauses.some((c) => c.variable && c.value);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`${bgClass} rounded-2xl shadow-2xl w-full max-w-[1400px] h-[90vh] flex flex-col border-2 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gradient-to-r from-green-50 to-blue-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <GitBranch className="text-white" size={24} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${textClass}`}>Wrap in Condition</h2>
              <p className={`text-sm ${textSecondaryClass}`}>Create conditions using form or AI chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-1/2 border-r border-gray-300 dark:border-gray-700 flex flex-col">
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-blue-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <FileEdit className="text-blue-600" size={20} />
                <h3 className={`text-lg font-bold ${textClass}`}>Manual Form Builder</h3>
              </div>
              <p className={`text-xs ${textSecondaryClass}`}>Fill in the fields manually or use the chat assistant on the right</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className={`mb-4 p-4 rounded-lg border-2 ${
                theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className={`text-xs ${textSecondaryClass}`}>
                    <div className="font-semibold mb-1">Selected Content (will be wrapped):</div>
                    <div className={`font-mono ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-3 rounded border max-h-20 overflow-auto`}>
                      {selectedContent}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 relative">
                <label className={`block text-sm font-bold ${textSecondaryClass} mb-2 flex items-center justify-between`}>
                  <span>Condition Name <span className="text-red-600">*</span></span>
                  {lastSyncedField === 'name' && (
                    <span className="flex items-center gap-1 text-green-600 text-xs animate-pulse">
                      <CheckCircle size={14} />
                      Synced from chat
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="e.g., isPremiumCustomer"
                  value={conditionName}
                  onChange={(e) => setConditionName(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputClass} ${
                    syncedFields.has('name') ? 'ring-2 ring-green-500 border-green-500' : ''
                  }`}
                />
              </div>

              <div className="mb-4 relative">
                <label className={`block text-sm font-bold ${textSecondaryClass} mb-2 flex items-center justify-between`}>
                  <span>Description (optional)</span>
                  {lastSyncedField === 'description' && (
                    <span className="flex items-center gap-1 text-green-600 text-xs animate-pulse">
                      <CheckCircle size={14} />
                      Synced from chat
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="Brief description of this condition"
                  value={conditionDescription}
                  onChange={(e) => setConditionDescription(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputClass} ${
                    syncedFields.has('description') ? 'ring-2 ring-green-500 border-green-500' : ''
                  }`}
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-bold ${textSecondaryClass} flex items-center gap-2`}>
                    Clauses
                    {lastSyncedField === 'clauses' && (
                      <span className="flex items-center gap-1 text-green-600 text-xs animate-pulse">
                        <CheckCircle size={14} />
                        Updated
                      </span>
                    )}
                  </label>
                  {clauses.length > 1 && (
                    <select
                      value={logicOperator}
                      onChange={(e) => setLogicOperator(e.target.value as LogicOperator)}
                      className={`px-3 py-1.5 text-xs border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium ${inputClass}`}
                    >
                      <option value="AND">AND (all must match)</option>
                      <option value="OR">OR (any can match)</option>
                    </select>
                  )}
                </div>

                <div className="space-y-3">
                  {clauses.map((clause, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                      } ${syncedFields.has('clauses') ? 'ring-2 ring-green-500 border-green-500' : ''}`}
                    >
                      <div className="grid grid-cols-12 gap-3 mb-3">
                        <div className="col-span-4">
                          <label className={`block text-xs font-medium ${textSecondaryClass} mb-1`}>
                            Variable
                          </label>
                          <select
                            value={clause.variable}
                            onChange={(e) => handleUpdateClause(idx, 'variable', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
                          >
                            <option value="">Select...</option>
                            {variables.map((v) => (
                              <option key={v.id} value={v.name}>
                                {v.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <label className={`block text-xs font-medium ${textSecondaryClass} mb-1`}>
                            Operator
                          </label>
                          <select
                            value={clause.operator}
                            onChange={(e) => handleUpdateClause(idx, 'operator', e.target.value)}
                            className={`w-full px-3 py-2 text-sm border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
                          >
                            {Object.entries(operatorLabels).map(([op, label]) => (
                              <option key={op} value={op}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-4">
                          <label className={`block text-xs font-medium ${textSecondaryClass} mb-1`}>
                            Value
                          </label>
                          <input
                            type="text"
                            value={clause.value}
                            onChange={(e) => handleUpdateClause(idx, 'value', e.target.value)}
                            placeholder="Value"
                            className={`w-full px-3 py-2 text-sm border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
                          />
                        </div>
                        {clauses.length > 1 && (
                          <div className="col-span-1 flex items-end">
                            <button
                              onClick={() => handleRemoveClause(idx)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Remove clause"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <label className={`flex items-center gap-2 ${textSecondaryClass} cursor-pointer`}>
                          <input
                            type="radio"
                            checked={clause.valueType === 'literal'}
                            onChange={() => handleUpdateClause(idx, 'valueType', 'literal')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          Literal Value
                        </label>
                        <label className={`flex items-center gap-2 ${textSecondaryClass} cursor-pointer`}>
                          <input
                            type="radio"
                            checked={clause.valueType === 'variable'}
                            onChange={() => handleUpdateClause(idx, 'valueType', 'variable')}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          Variable
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddClause}
                  className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700 font-semibold transition-colors"
                >
                  <PlusCircle size={16} />
                  Add Clause
                </button>
              </div>

              <div className={`mb-4 p-4 rounded-lg transition-all ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              } ${syncedFields.has('hasElse') ? 'ring-2 ring-green-500' : ''}`}>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={hasElse}
                    onChange={(e) => setHasElse(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-bold ${textSecondaryClass} flex items-center gap-2`}>
                    Add ELSE block (content when condition is FALSE)
                    {lastSyncedField === 'hasElse' && (
                      <span className="flex items-center gap-1 text-green-600 text-xs animate-pulse">
                        <CheckCircle size={14} />
                        Synced
                      </span>
                    )}
                  </span>
                </label>
                {hasElse && (
                  <textarea
                    placeholder="Enter content to show when condition is false..."
                    value={elseContent}
                    onChange={(e) => setElseContent(e.target.value)}
                    rows={3}
                    className={`w-full mt-2 px-4 py-3 border-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass} ${
                      syncedFields.has('elseContent') ? 'ring-2 ring-green-500 border-green-500' : ''
                    }`}
                  />
                )}
              </div>

              <button
                onClick={handleCreateAndWrap}
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg text-base font-bold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <GitBranch size={20} />
                Create & Wrap Condition
              </button>
            </div>
          </div>

          <div className="w-1/2 flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
            <div className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-purple-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="text-purple-600" size={20} />
                <h3 className={`text-lg font-bold ${textClass}`}>AI Chat Assistant</h3>
              </div>
              <p className={`text-xs ${textSecondaryClass}`}>Chat selections automatically update the form on the left</p>
            </div>

            <div className="flex-1 relative">
              <div className="absolute inset-0">
                <ChatConditionBuilder
                  variables={variables}
                  onConditionUpdate={handleChatComplete}
                  onClose={onClose}
                  onRealtimeUpdate={handleChatUpdate}
                  hideCloseButton={true}
                />
              </div>
            </div>

            <div className={`p-3 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Sparkles size={14} className="text-purple-500" />
                <span>Selections in chat sync automatically with the form</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
