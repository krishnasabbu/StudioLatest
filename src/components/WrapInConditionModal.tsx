import { useState } from 'react';
import { X, GitBranch, Info, PlusCircle, Trash2 } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'existing' | 'form' | 'chat'>('form');
  const [theme] = useState(localStorage.getItem('theme') || 'light');

  const [selectedCondition, setSelectedCondition] = useState('');

  const [conditionName, setConditionName] = useState('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [clauses, setClauses] = useState<ConditionClause[]>([
    { variable: '', operator: '==', value: '', valueType: 'literal' },
  ]);
  const [logicOperator, setLogicOperator] = useState<LogicOperator>('AND');
  const [hasElse, setHasElse] = useState(false);
  const [elseContent, setElseContent] = useState('');

  const handleAddClause = () => {
    setClauses([...clauses, { variable: '', operator: '==', value: '', valueType: 'literal' }]);
  };

  const handleRemoveClause = (index: number) => {
    const newClauses = [...clauses];
    newClauses.splice(index, 1);
    setClauses(newClauses);
  };

  const handleUpdateClause = (index: number, field: keyof ConditionClause, value: any) => {
    const newClauses = [...clauses];
    newClauses[index] = { ...newClauses[index], [field]: value };
    setClauses(newClauses);
  };

  const handleWrapExisting = () => {
    if (selectedCondition) {
      onWrapCondition(selectedCondition);
      onClose();
    }
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

  const handleChatConditionUpdate = (data: {
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

  const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const inputClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`${bgClass} rounded-lg shadow-2xl w-full max-w-7xl h-[85vh] flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <GitBranch className="text-green-600" size={24} />
            <h2 className={`text-xl font-bold ${textClass}`}>Wrap in Condition</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex border-b border-gray-300 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('existing')}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'existing'
                ? 'border-b-2 border-green-600 text-green-600'
                : `${textSecondaryClass} hover:text-green-600`
            }`}
          >
            Use Existing Condition
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'form'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : `${textSecondaryClass} hover:text-blue-600`
            }`}
          >
            Create with Form
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-semibold text-sm transition-colors ${
              activeTab === 'chat'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : `${textSecondaryClass} hover:text-purple-600`
            }`}
          >
            Create with AI Chat
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {activeTab === 'existing' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className={`mb-4 p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className={`text-sm ${textSecondaryClass}`}>
                      <div className="font-semibold mb-1">Selected Content:</div>
                      <div className="font-mono bg-white dark:bg-gray-700 p-2 rounded border">
                        {selectedContent}
                      </div>
                    </div>
                  </div>
                </div>

                {conditions.length === 0 ? (
                  <div className={`text-center py-12 ${textSecondaryClass}`}>
                    <GitBranch size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-semibold">No conditions available</p>
                    <p className="text-sm mt-1">Create a new condition using the Form or AI Chat tabs</p>
                  </div>
                ) : (
                  <>
                    <label className={`block text-sm font-bold ${textSecondaryClass} mb-2`}>
                      Select a Condition to Apply
                    </label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-transparent ${inputClass}`}
                    >
                      <option value="">Choose a condition...</option>
                      {conditions.map((cond) => (
                        <option key={cond.id} value={cond.name}>
                          {cond.name} {cond.description ? `- ${cond.description}` : ''}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleWrapExisting}
                      disabled={!selectedCondition}
                      className="w-full mt-4 bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                      Wrap with Selected Condition
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div className="flex-1 flex">
              <div className="flex-1 p-6 overflow-y-auto border-r border-gray-300 dark:border-gray-700">
                <h3 className={`text-lg font-bold ${textClass} mb-4`}>HTML Form Builder</h3>

                <div className={`mb-4 p-4 rounded-lg border-2 ${
                  theme === 'dark' ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className={`text-xs font-bold ${textSecondaryClass} mb-2`}>
                    Selected Content (will be shown when condition is TRUE):
                  </div>
                  <div className={`text-xs ${textClass} font-mono bg-white dark:bg-gray-700 p-2 rounded border max-h-20 overflow-auto`}>
                    {selectedContent}
                  </div>
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold ${textSecondaryClass} mb-2`}>
                    Condition Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., isPremiumCustomer"
                    value={conditionName}
                    onChange={(e) => setConditionName(e.target.value)}
                    className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-bold ${textSecondaryClass} mb-2`}>
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of this condition"
                    value={conditionDescription}
                    onChange={(e) => setConditionDescription(e.target.value)}
                    className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-sm font-bold ${textSecondaryClass}`}>Clauses</label>
                    {clauses.length > 1 && (
                      <select
                        value={logicOperator}
                        onChange={(e) => setLogicOperator(e.target.value as LogicOperator)}
                        className={`px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 ${inputClass}`}
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
                        className={`p-3 rounded-lg border-2 ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-2 mb-2">
                          <div className="col-span-4">
                            <label className={`block text-xs font-medium ${textSecondaryClass} mb-1`}>
                              Variable
                            </label>
                            <select
                              value={clause.variable}
                              onChange={(e) => handleUpdateClause(idx, 'variable', e.target.value)}
                              className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
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
                              className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
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
                              className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
                            />
                          </div>
                          {clauses.length > 1 && (
                            <div className="col-span-1 flex items-end">
                              <button
                                onClick={() => handleRemoveClause(idx)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title="Remove clause"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <label className={`flex items-center gap-2 ${textSecondaryClass}`}>
                            <input
                              type="radio"
                              checked={clause.valueType === 'literal'}
                              onChange={() => handleUpdateClause(idx, 'valueType', 'literal')}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            Literal Value
                          </label>
                          <label className={`flex items-center gap-2 ${textSecondaryClass}`}>
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
                    className="mt-2 flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-300 dark:border-blue-700 font-medium"
                  >
                    <PlusCircle size={14} />
                    Add Clause
                  </button>
                </div>

                <div className={`mb-4 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasElse}
                      onChange={(e) => setHasElse(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm font-bold ${textSecondaryClass}`}>
                      Add ELSE block (content when condition is FALSE)
                    </span>
                  </label>
                  {hasElse && (
                    <textarea
                      placeholder="Enter content to show when condition is false..."
                      value={elseContent}
                      onChange={(e) => setElseContent(e.target.value)}
                      rows={3}
                      className={`w-full mt-2 px-3 py-2 border-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClass}`}
                    />
                  )}
                </div>

                <button
                  onClick={handleCreateAndWrap}
                  disabled={!conditionName.trim() || !clauses.some((c) => c.variable && c.value)}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                >
                  Create & Wrap Condition
                </button>
              </div>

              <div className="w-80 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <h4 className={`text-sm font-bold ${textClass} mb-3`}>Quick Tips</h4>
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                    <strong>Variable:</strong> Select the data field to check
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                    <strong>Operator:</strong> Choose how to compare (equals, contains, etc.)
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                    <strong>Value:</strong> Enter the value to compare against
                  </div>
                  <div className="p-2 bg-white dark:bg-gray-800 rounded border">
                    <strong>ELSE Block:</strong> Optional content when condition fails
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="flex-1">
              <ChatConditionBuilder
                variables={variables}
                onConditionUpdate={handleChatConditionUpdate}
                onClose={onClose}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
