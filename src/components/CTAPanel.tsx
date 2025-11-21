import { Trash2, Square } from 'lucide-react';
import { CTAButton } from '../types/template';
import { useTheme } from '../contexts/ThemeContext';

interface CTAPanelProps {
  ctaButtons: CTAButton[];
  onCTAButtonsChange: (buttons: CTAButton[]) => void;
}

export default function CTAPanel({ ctaButtons, onCTAButtonsChange }: CTAPanelProps) {
  const { theme } = useTheme();

  const handleDelete = (id: string) => {
    if (confirm('Delete this CTA button?')) {
      onCTAButtonsChange(ctaButtons.filter((b) => b.id !== id));
    }
  };

  const sortedButtons = [...ctaButtons].sort((a, b) =>
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
          }`}>CTA Buttons</h2>
          <div className="flex items-center gap-2">
            <Square size={16} className="text-wf-gold" strokeWidth={2.5} />
          </div>
        </div>
        <p className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {ctaButtons.length} CTA button{ctaButtons.length !== 1 ? 's' : ''} in template
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sortedButtons.length === 0 ? (
          <div className={`text-center py-8 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <Square size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">No CTA buttons yet</p>
            <p className="text-xs">
              Select text in the editor and click<br />
              "Insert CTA Button" to add buttons
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedButtons.map((button) => (
              <div
                key={button.id}
                className={`p-3 border-2 rounded-lg hover:shadow-md transition-all ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Square size={14} className="text-wf-gold flex-shrink-0" strokeWidth={2.5} />
                      <span className={`text-sm font-bold truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {button.text}
                      </span>
                    </div>
                    <a
                      href={button.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-wf-red hover:underline block truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {button.url}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDelete(button.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                    title="Delete CTA button"
                  >
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                  <table role="presentation" cellSpacing="0" cellPadding="0" border={0} style={{margin: '0'}}>
                    <tbody>
                      <tr>
                        <td style={{borderRadius: '8px', backgroundColor: '#D71E28'}}>
                          <a
                            href={button.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: '#D71E28',
                              border: 'none',
                              color: '#FFFFFF',
                              padding: '10px 20px',
                              textDecoration: 'none',
                              display: 'inline-block',
                              fontSize: '13px',
                              fontWeight: 700,
                              borderRadius: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {button.text}
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {button.description && (
                  <p className={`text-xs mb-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {button.description}
                  </p>
                )}
                <div className={`text-xs pt-2 border-t ${
                  theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
                }`}>
                  Added: {new Date(button.created_at).toLocaleDateString()} at{' '}
                  {new Date(button.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`p-4 border-t ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="bg-amber-50 dark:bg-gray-700 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">How to add CTA buttons:</p>
          <ol className="text-xs text-amber-800 dark:text-amber-400 space-y-1 list-decimal list-inside">
            <li>Position cursor in the editor</li>
            <li>Click "Insert CTA Button" in the popup</li>
            <li>Enter button text and URL</li>
            <li>Button appears here automatically</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
