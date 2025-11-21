import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Variable, ConditionDefinition, Hyperlink, CTAButton } from '../../types/template';
import { useTheme } from '../../contexts/ThemeContext';
import { applyFormatters, evaluateConditions, processTemplate } from '../../lib/previewEngine';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateHtml: string;
  variables: Variable[];
  conditions: ConditionDefinition[];
  hyperlinks: Hyperlink[];
  ctaButtons: CTAButton[];
}

export default function LivePreviewModal({
  isOpen,
  onClose,
  templateHtml,
  variables,
  conditions,
  hyperlinks,
  ctaButtons,
}: LivePreviewModalProps) {
  const { theme } = useTheme();
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [conditionResults, setConditionResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialValues: Record<string, any> = {};
    variables.forEach((v) => {
      switch (v.type) {
        case 'number':
          initialValues[v.name] = 0;
          break;
        case 'boolean':
          initialValues[v.name] = false;
          break;
        case 'array':
          initialValues[v.name] = [];
          break;
        case 'object':
          initialValues[v.name] = {};
          break;
        default:
          initialValues[v.name] = '';
      }
    });
    setVariableValues(initialValues);
  }, [variables]);

  useEffect(() => {
    const results = evaluateConditions(conditions, variableValues);
    setConditionResults(results);

    const processed = processTemplate(
      templateHtml,
      variableValues,
      variables,
      conditions,
      hyperlinks,
      ctaButtons
    );
    setPreviewHtml(processed);
  }, [templateHtml, variableValues, variables, conditions, hyperlinks, ctaButtons]);

  if (!isOpen) return null;

  const handleVariableChange = (name: string, value: any) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`w-[95vw] h-[90vh] rounded-lg shadow-2xl flex flex-col ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2 className="text-xl font-bold">Live Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div
            className={`w-80 border-r overflow-y-auto ${
              theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                  Variable Values
                </h3>
                <div className="space-y-3">
                  {variables.map((variable) => (
                    <div key={variable.id}>
                      <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                        {variable.name}
                        {variable.formatter && variable.formatter !== 'none' && (
                          <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {variable.formatter}
                          </span>
                        )}
                      </label>
                      {variable.type === 'boolean' ? (
                        <select
                          value={String(variableValues[variable.name])}
                          onChange={(e) =>
                            handleVariableChange(variable.name, e.target.value === 'true')
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : variable.type === 'number' ? (
                        <input
                          type="number"
                          value={variableValues[variable.name] || ''}
                          onChange={(e) =>
                            handleVariableChange(variable.name, Number(e.target.value))
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <input
                          type="text"
                          value={variableValues[variable.name] || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {conditions.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                    Conditions
                  </h3>
                  <div className="space-y-2">
                    {conditions.map((condition) => {
                      const isTrue = conditionResults[condition.name];
                      return (
                        <div
                          key={condition.id}
                          className={`p-2 rounded text-xs border-2 ${
                            isTrue
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <code className="font-mono font-medium">{condition.name}</code>
                            {isTrue ? (
                              <CheckCircle size={14} className="text-green-600" />
                            ) : (
                              <XCircle size={14} className="text-red-600" />
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {condition.clauses.map((clause, idx) => (
                              <div key={idx}>
                                {clause.variable} {clause.operator} {clause.value}
                              </div>
                            ))}
                          </div>
                          <div className={`text-xs font-bold mt-1 ${isTrue ? 'text-green-700' : 'text-red-700'}`}>
                            {isTrue ? 'TRUE - Content Shown' : 'FALSE - Content Hidden'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {hyperlinks.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                    Hyperlinks
                  </h3>
                  <div className="space-y-2">
                    {hyperlinks.map((link) => (
                      <div
                        key={link.id}
                        className={`p-2 rounded text-xs ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        }`}
                      >
                        <div className="font-medium">{link.text}</div>
                        <div className="text-gray-500 truncate">{link.url}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ctaButtons.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                    CTA Buttons
                  </h3>
                  <div className="space-y-2">
                    {ctaButtons.map((button) => (
                      <div
                        key={button.id}
                        className={`p-2 rounded text-xs ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        }`}
                      >
                        <div className="font-medium">{button.text}</div>
                        <div className="text-gray-500 truncate">{button.url}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div
              className={`min-h-full rounded-lg border ${
                theme === 'dark' ? 'bg-white border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div
                className="p-6"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
