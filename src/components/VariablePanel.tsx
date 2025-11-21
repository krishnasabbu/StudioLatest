import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { Variable, VariableType } from '../types/template';
import { useTheme } from '../contexts/ThemeContext';

interface VariablePanelProps {
  variables: Variable[];
  onVariablesChange: (variables: Variable[]) => void;
}

export default function VariablePanel({ variables, onVariablesChange }: VariablePanelProps) {
  const { theme } = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Variable>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariable, setNewVariable] = useState<Partial<Variable>>({
    name: '',
    type: 'string',
    description: '',
  });

  const handleAdd = () => {
    if (!newVariable.name?.trim()) return;

    const variable: Variable = {
      id: Date.now().toString(),
      name: newVariable.name.trim(),
      type: newVariable.type || 'string',
      description: newVariable.description || '',
    };

    onVariablesChange([...variables, variable]);
    setNewVariable({ name: '', type: 'string', description: '' });
    setShowAddForm(false);
  };

  const handleEdit = (variable: Variable) => {
    setEditingId(variable.id);
    setEditForm(variable);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editForm.name?.trim()) return;

    const updated = variables.map((v) =>
      v.id === editingId
        ? { ...v, name: editForm.name!, type: editForm.type!, description: editForm.description || '' }
        : v
    );

    onVariablesChange(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id: string) => {
    onVariablesChange(variables.filter((v) => v.id !== id));
  };

  const typeColors: Record<VariableType, string> = {
    string: 'bg-blue-100 text-blue-800',
    number: 'bg-green-100 text-green-800',
    boolean: 'bg-purple-100 text-purple-800',
    image: 'bg-orange-100 text-orange-800',
    url: 'bg-cyan-100 text-cyan-800',
    array: 'bg-pink-100 text-pink-800',
    object: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className={`h-full flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-800">Variables</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-wf-red text-white rounded-lg hover:bg-red-700 text-sm font-bold shadow-lg hover:shadow-xl transition-all border-2 border-red-800"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500">
          {variables.length} variable{variables.length !== 1 ? 's' : ''} defined
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {showAddForm && (
          <div className={`mb-4 p-3 border-2 rounded-lg shadow-sm ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">New Variable</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Variable name"
              value={newVariable.name}
              onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
            />
            <select
              value={newVariable.type}
              onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value as VariableType })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-2"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="image">Image</option>
              <option value="url">URL</option>
              <option value="array">Array</option>
              <option value="object">Object</option>
            </select>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newVariable.description}
              onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm mb-3"
            />
            <button
              onClick={handleAdd}
              disabled={!newVariable.name?.trim()}
              className="w-full bg-wf-red text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all border-2 border-red-800"
            >
              Add Variable
            </button>
          </div>
        )}

        <div className="space-y-2">
          {variables.map((variable) => (
            <div
              key={variable.id}
              className={`p-3 border-2 rounded-lg hover:shadow-md transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              {editingId === variable.id ? (
                <div>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                  />
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({ ...editForm, type: e.target.value as VariableType })
                    }
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="image">Image</option>
                    <option value="url">URL</option>
                    <option value="array">Array</option>
                    <option value="object">Object</option>
                  </select>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-wf-red text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-md hover:shadow-lg transition-all border border-red-800"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className={`px-2 py-1.5 border-2 rounded-lg text-xs font-bold transition-all ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono font-medium text-gray-800">
                          {variable.name}
                        </code>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            typeColors[variable.type]
                          }`}
                        >
                          {variable.type}
                        </span>
                      </div>
                      {variable.description && (
                        <p className="text-xs text-gray-500">{variable.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(variable)}
                        className="p-1.5 text-wf-red hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(variable.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    {`{{${variable.name}}}`}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {variables.length === 0 && !showAddForm && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No variables yet</p>
            <p className="text-xs mt-1">Click Add or select text to create variables</p>
          </div>
        )}
      </div>
    </div>
  );
}
