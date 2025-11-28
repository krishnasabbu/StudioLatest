import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  level?: number;
}

export default function JsonViewer({ data, level = 0 }: JsonViewerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpanded(newExpanded);
  };

  const renderValue = (value: any, key: string, currentLevel: number): JSX.Element => {
    const indent = currentLevel * 16;

    if (value === null) {
      return <span className="text-gray-500">null</span>;
    }

    if (value === undefined) {
      return <span className="text-gray-500">undefined</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="text-purple-600 font-semibold">{value.toString()}</span>;
    }

    if (typeof value === 'number') {
      return <span className="text-blue-600 font-semibold">{value}</span>;
    }

    if (typeof value === 'string') {
      return <span className="text-green-600">"{value}"</span>;
    }

    if (Array.isArray(value)) {
      const isExpanded = expanded.has(key);
      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center gap-1 hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="text-gray-600 font-semibold">Array({value.length})</span>
          </button>
          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 pl-2 mt-1">
              {value.map((item, index) => (
                <div key={index} className="py-1">
                  <span className="text-gray-500 mr-2">{index}:</span>
                  {renderValue(item, `${key}.${index}`, currentLevel + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const isExpanded = expanded.has(key);
      const keys = Object.keys(value);
      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="inline-flex items-center gap-1 hover:bg-gray-100 rounded px-1"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span className="text-gray-600 font-semibold">Object({keys.length})</span>
          </button>
          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 pl-2 mt-1">
              {keys.map((objKey) => (
                <div key={objKey} className="py-1">
                  <span className="text-wf-red font-medium mr-2">{objKey}:</span>
                  {renderValue(value[objKey], `${key}.${objKey}`, currentLevel + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    return (
      <div className="font-mono text-sm">
        {keys.map((key) => (
          <div key={key} className="py-1">
            <span className="text-wf-red font-medium mr-2">{key}:</span>
            {renderValue(data[key], key, level)}
          </div>
        ))}
      </div>
    );
  }

  return <div className="font-mono text-sm">{renderValue(data, 'root', level)}</div>;
}
