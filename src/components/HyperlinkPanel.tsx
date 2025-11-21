import { Trash2, ExternalLink, Plus } from 'lucide-react';
import { Hyperlink } from '../types/template';
import { useTheme } from '../contexts/ThemeContext';

interface HyperlinkPanelProps {
  hyperlinks: Hyperlink[];
  onHyperlinksChange: (hyperlinks: Hyperlink[]) => void;
}

export default function HyperlinkPanel({ hyperlinks, onHyperlinksChange }: HyperlinkPanelProps) {
  const { theme } = useTheme();

  const handleDelete = (id: string) => {
    if (confirm('Delete this hyperlink?')) {
      onHyperlinksChange(hyperlinks.filter((h) => h.id !== id));
    }
  };

  const sortedLinks = [...hyperlinks].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className={`h-full flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className={`text-lg font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Hyperlinks</h2>
          <div className="flex items-center gap-2">
            <ExternalLink size={16} className="text-wf-red" strokeWidth={2.5} />
          </div>
        </div>
        <p className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {hyperlinks.length} hyperlink{hyperlinks.length !== 1 ? 's' : ''} in template
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sortedLinks.length === 0 ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <ExternalLink size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">No hyperlinks yet</p>
            <p className="text-xs">
              Select text in the editor and click<br />
              "Insert Hyperlink" to add links
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedLinks.map((link) => (
              <div
                key={link.id}
                className={`p-3 border-2 rounded-lg hover:shadow-md transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink size={14} className="text-wf-red flex-shrink-0" strokeWidth={2.5} />
                      <span className={`text-sm font-bold truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {link.text}
                      </span>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-wf-red hover:underline block truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {link.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    title="Delete hyperlink"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
                {link.description && (
                  <p className={`text-xs mt-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {link.description}
                  </p>
                )}
                <div className={`text-xs mt-2 pt-2 border-t ${
                  theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                  Added: {new Date(link.created_at).toLocaleDateString()} at{' '}
                  {new Date(link.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="bg-blue-50 dark:bg-gray-700 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
          <p className="text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">How to add hyperlinks:</p>
          <ol className="text-xs text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
            <li>Select text in the editor</li>
            <li>Click "Insert Hyperlink" in the popup</li>
            <li>Enter URL and link text</li>
            <li>Link appears here automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
