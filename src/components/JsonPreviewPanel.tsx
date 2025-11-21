import { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface JsonPreviewPanelProps {
  data: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
}

export default function JsonPreviewPanel({ data, onDataChange }: JsonPreviewPanelProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      setJsonText(JSON.stringify(data, null, 2));
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError('Invalid JSON data');
      setIsValid(false);
    }
  }, [data]);

  const handleTextChange = (value: string) => {
    setJsonText(value);

    try {
      const parsed = JSON.parse(value);
      onDataChange(parsed);
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setIsValid(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Preview Data (JSON)</h2>
          <div className="flex items-center gap-2">
            {isValid ? (
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <Check size={16} />
                Valid
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle size={16} />
                Invalid
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Edit JSON data to see live preview changes
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea
          value={jsonText}
          onChange={(e) => handleTextChange(e.target.value)}
          className={`flex-1 p-4 font-mono text-sm resize-none outline-none border-0 ${
            isValid ? 'bg-white' : 'bg-red-50'
          }`}
          spellCheck={false}
        />
        {error && (
          <div className="p-3 bg-red-50 border-t border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">JSON Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
