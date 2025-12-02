import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, Info, GitBranch, PlusCircle, MessageSquare } from 'lucide-react';
import { ConditionDefinition, ConditionClause, Variable, LogicOperator, ConditionOperator } from '../types/template';
import ChatConditionBuilder from './ChatConditionBuilder';

interface ConditionPanelProps {
  conditions: ConditionDefinition[];
  variables: Variable[];
  onConditionsChange: (conditions: ConditionDefinition[]) => void;
}

export default function ConditionPanel({ conditions, variables, onConditionsChange }: ConditionPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ConditionDefinition | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showChatBuilder, setShowChatBuilder] = useState(false);
  const [newCondition, setNewCondition] = useState<Partial<ConditionDefinition>>({
    name: '',
    description: '',
    clauses: [{ variable: '', operator: '==', value: '', valueType: 'literal' }],
    logicOperator: 'AND',
    content: '',
    hasElse: false,
    elseContent: '',
  });

  const [theme, setTheme] = useState(
      localStorage.getItem('theme') || 'light'
    );

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

  const handleAddClause = (isNew: boolean = false) => {
    const newClause: ConditionClause = {
      variable: '',
      operator: '==',
      value: '',
      valueType: 'literal',
    };

    if (isNew) {
      setNewCondition({
        ...newCondition,
        clauses: [...(newCondition.clauses || []), newClause],
      });
    } else if (editForm) {
      setEditForm({
        ...editForm,
        clauses: [...editForm.clauses, newClause],
      });
    }
  };

  const handleRemoveClause = (index: number, isNew: boolean = false) => {
    if (isNew) {
      const clauses = [...(newCondition.clauses || [])];
      clauses.splice(index, 1);
      setNewCondition({ ...newCondition, clauses });
    } else if (editForm) {
      const clauses = [...editForm.clauses];
      clauses.splice(index, 1);
      setEditForm({ ...editForm, clauses });
    }
  };

  const handleUpdateClause = (index: number, field: keyof ConditionClause, value: any, isNew: boolean = false) => {
    if (isNew) {
      const clauses = [...(newCondition.clauses || [])];
      clauses[index] = { ...clauses[index], [field]: value };
      setNewCondition({ ...newCondition, clauses });
    } else if (editForm) {
      const clauses = [...editForm.clauses];
      clauses[index] = { ...clauses[index], [field]: value };
      setEditForm({ ...editForm, clauses });
    }
  };

  const handleAdd = () => {
    if (!newCondition.name?.trim() || !newCondition.clauses?.length) return;

    const condition: ConditionDefinition = {
      id: Date.now().toString(),
      name: newCondition.name.trim(),
      description: newCondition.description || '',
      clauses: newCondition.clauses,
      logicOperator: newCondition.logicOperator || 'AND',
      content: newCondition.content || '',
      hasElse: newCondition.hasElse || false,
      elseContent: newCondition.elseContent || '',
    };

    onConditionsChange([...conditions, condition]);
    setNewCondition({
      name: '',
      description: '',
      clauses: [{ variable: '', operator: '==', value: '', valueType: 'literal' }],
      logicOperator: 'AND',
      content: '',
      hasElse: false,
      elseContent: '',
    });
    setShowAddForm(false);
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
      content: data.content,
      hasElse: data.hasElse,
      elseContent: data.elseContent || '',
    };

    onConditionsChange([...conditions, condition]);
    setShowChatBuilder(false);
  };

  const handleEdit = (condition: ConditionDefinition) => {
    setEditingId(condition.id);
    setEditForm(JSON.parse(JSON.stringify(condition)));
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm || !editForm.name?.trim()) return;

    const updated = conditions.map((c) => (c.id === editingId ? editForm : c));
    onConditionsChange(updated);
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this condition? This will remove it from the template.')) {
      onConditionsChange(conditions.filter((c) => c.id !== id));
    }
  };

  const renderClauseEditor = (
    clause: ConditionClause,
    index: number,
    isNew: boolean,
    showRemove: boolean
  ) => (
    <div key={index} className={`p-3 rounded-lg border-2 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="grid grid-cols-12 gap-2 mb-2">
        <div className="col-span-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Variable</label>
          <select
            value={clause.variable}
            onChange={(e) => handleUpdateClause(index, 'variable', e.target.value, isNew)}
            className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Operator</label>
          <select
            value={clause.operator}
            onChange={(e) => handleUpdateClause(index, 'operator', e.target.value, isNew)}
            className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {Object.entries(operatorLabels).map(([op, label]) => (
              <option key={op} value={op}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
          {clause.valueType === 'variable' ? (
            <select
              value={clause.value}
              onChange={(e) => handleUpdateClause(index, 'value', e.target.value, isNew)}
              className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            >
              <option value="">Select variable...</option>
              {variables.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          ) : clause.valueType === 'condition' ? (
            <select
              value={clause.value}
              onChange={(e) => handleUpdateClause(index, 'value', e.target.value, isNew)}
              className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            >
              <option value="">Select condition...</option>
              {conditions.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={clause.value}
              onChange={(e) => handleUpdateClause(index, 'value', e.target.value, isNew)}
              placeholder="Value"
              className={`w-full px-2 py-1.5 text-xs border-2 rounded-lg font-medium focus:ring-2 focus:ring-wf-red focus:border-transparent ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            />
          )}
        </div>
        {showRemove && (
          <div className="col-span-1 flex items-end">
            <button
              onClick={() => handleRemoveClause(index, isNew)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
              title="Remove clause"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="radio"
            name={`valueType-${index}-${isNew ? 'new' : editingId}`}
            checked={clause.valueType === 'literal'}
            onChange={() => handleUpdateClause(index, 'valueType', 'literal', isNew)}
            className="text-wf-red focus:ring-wf-red"
          />
          Literal Value
        </label>
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="radio"
            name={`valueType-${index}-${isNew ? 'new' : editingId}`}
            checked={clause.valueType === 'variable'}
            onChange={() => handleUpdateClause(index, 'valueType', 'variable', isNew)}
            className="text-wf-red focus:ring-wf-red"
          />
          Variable
        </label>
        <label className="flex items-center gap-2 text-gray-600">
          <input
            type="radio"
            name={`valueType-${index}-${isNew ? 'new' : editingId}`}
            checked={clause.valueType === 'condition'}
            onChange={() => handleUpdateClause(index, 'valueType', 'condition', isNew)}
            className="text-wf-red focus:ring-wf-red"
          />
          Condition
        </label>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitBranch className="text-wf-red" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Conditions</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowChatBuilder(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-lg hover:shadow-xl transition-all border-2 border-blue-800"
              title="Build condition with AI assistant"
            >
              <MessageSquare size={16} />
              Chat Builder
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-wf-red text-white rounded-lg hover:bg-red-700 text-sm font-bold shadow-lg hover:shadow-xl transition-all border-2 border-red-800"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600">
            Create reusable conditions with multiple clauses. Use notation: <code className="bg-gray-100 px-1 py-0.5 rounded">{'{{%conditionName%}}'}</code>
          </p>
        </div>
      </div>

      {showChatBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex">
            <div className="flex-1">
              <ChatConditionBuilder
                variables={variables}
                onConditionUpdate={handleChatConditionUpdate}
                onClose={() => setShowChatBuilder(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {showAddForm && (
          <div className="mb-4 p-4 bg-white border-2 border-wf-red-200 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-800">New Condition</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Condition name (e.g., isPremium)"
              value={newCondition.name}
              onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-wf-red focus:border-transparent"
            />

            <input
              type="text"
              placeholder="Description (optional)"
              value={newCondition.description}
              onChange={(e) => setNewCondition({ ...newCondition, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-wf-red focus:border-transparent"
            />

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Clauses</label>
                {(newCondition.clauses?.length || 0) > 1 && (
                  <select
                    value={newCondition.logicOperator}
                    onChange={(e) => setNewCondition({ ...newCondition, logicOperator: e.target.value as LogicOperator })}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-wf-red"
                  >
                    <option value="AND">AND (all must match)</option>
                    <option value="OR">OR (any can match)</option>
                  </select>
                )}
              </div>

              <div className="space-y-2">
                {newCondition.clauses?.map((clause, idx) =>
                  renderClauseEditor(clause, idx, true, (newCondition.clauses?.length || 0) > 1)
                )}
              </div>

              <button
                onClick={() => handleAddClause(true)}
                className="mt-2 flex items-center gap-1 px-2 py-1 text-xs text-wf-red hover:bg-red-50 rounded border border-wf-red-200"
              >
                <PlusCircle size={14} />
                Add Clause
              </button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content to Display (when condition is TRUE)
              </label>
              <textarea
                placeholder="Enter HTML/text to display when condition is true... e.g., <p>Name is Sabbu</p>"
                value={newCondition.content}
                onChange={(e) => setNewCondition({ ...newCondition, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-wf-red focus:border-transparent font-mono"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">This content will be shown when the condition evaluates to TRUE</p>
            </div>

            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={newCondition.hasElse}
                  onChange={(e) => setNewCondition({ ...newCondition, hasElse: e.target.checked })}
                  className="rounded border-gray-300 text-wf-red focus:ring-wf-red"
                />
                Include ELSE block
              </label>
              {newCondition.hasElse && (
                <textarea
                  placeholder="Else content (optional)"
                  value={newCondition.elseContent}
                  onChange={(e) => setNewCondition({ ...newCondition, elseContent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-wf-red"
                  rows={2}
                />
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={!newCondition.name?.trim() || !newCondition.clauses?.some(c => c.variable)}
              className="w-full bg-wf-red text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all border-2 border-red-800"
            >
              Create Condition
            </button>
          </div>
        )}

        <div className="space-y-3">
          {conditions.map((condition) => (
            <div key={condition.id} className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              {editingId === condition.id && editForm ? (
                <div>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2 focus:ring-2 focus:ring-wf-red"
                  />
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-3 focus:ring-2 focus:ring-wf-red"
                  />

                  {editForm.clauses.length > 1 && (
                    <select
                      value={editForm.logicOperator}
                      onChange={(e) => setEditForm({ ...editForm, logicOperator: e.target.value as LogicOperator })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-wf-red"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}

                  <div className="space-y-2 mb-3">
                    {editForm.clauses.map((clause, idx) => renderClauseEditor(clause, idx, false, editForm.clauses.length > 1))}
                  </div>

                  <button
                    onClick={() => handleAddClause(false)}
                    className="mb-3 flex items-center gap-1 px-2 py-1 text-xs text-wf-red hover:bg-red-50 rounded border border-wf-red-200"
                  >
                    <PlusCircle size={14} />
                    Add Clause
                  </button>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content (when TRUE)
                    </label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      placeholder="Content to display when true"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-wf-red font-mono"
                      rows={2}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm mb-2">
                    <input
                      type="checkbox"
                      checked={editForm.hasElse}
                      onChange={(e) => setEditForm({ ...editForm, hasElse: e.target.checked })}
                      className="rounded border-gray-300 text-wf-red focus:ring-wf-red"
                    />
                    Include ELSE
                  </label>

                  {editForm.hasElse && (
                    <textarea
                      value={editForm.elseContent}
                      onChange={(e) => setEditForm({ ...editForm, elseContent: e.target.value })}
                      placeholder="Else content"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-2 focus:ring-2 focus:ring-wf-red"
                      rows={2}
                    />
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-medium"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm(null);
                      }}
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-semibold text-gray-800">{condition.name}</code>
                        {condition.hasElse && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                            has else
                          </span>
                        )}
                      </div>
                      {condition.description && (
                        <p className="text-xs text-gray-600 mb-2">{condition.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {condition.clauses.map((clause, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-xs rounded">
                            <code className="text-blue-600">{clause.variable}</code>
                            <span className="text-gray-500">{operatorLabels[clause.operator]}</span>
                            <code className={
                              clause.valueType === 'variable' ? 'text-blue-600' :
                              clause.valueType === 'condition' ? 'text-purple-600' :
                              'text-green-600'
                            }>
                              {clause.value}
                            </code>
                            {clause.valueType === 'condition' && (
                              <span className="text-purple-600 text-[10px]">(cond)</span>
                            )}
                            {idx < condition.clauses.length - 1 && (
                              <span className="ml-1 font-semibold text-wf-red">{condition.logicOperator}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEdit(condition)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit condition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(condition.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Delete condition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs font-mono bg-gray-50 px-2 py-1.5 rounded border border-gray-200">
                    {'{{%'}{condition.name}{'%}}'}
                  </div>
                  {condition.content && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-xs font-semibold text-green-800 mb-1">✓ Display when TRUE:</div>
                      <div className="text-xs text-gray-700 font-mono">{condition.content}</div>
                    </div>
                  )}
                  {condition.hasElse && condition.elseContent && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <div className="text-xs font-semibold text-amber-800 mb-1">✗ Display when FALSE (ELSE):</div>
                      <div className="text-xs text-gray-700 font-mono">{condition.elseContent}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {conditions.length === 0 && !showAddForm && (
          <div className="text-center py-12 text-gray-400">
            <GitBranch size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No conditions yet</p>
            <p className="text-xs mt-1">Click Add to create your first condition</p>
          </div>
        )}
      </div>
    </div>
  );
}
