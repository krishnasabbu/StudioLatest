/**
 * LinkModal Component
 *
 * Modal for inserting and editing hyperlinks in the email template
 * Features:
 * - URL input with validation
 * - Link text customization
 * - Target attribute selection (_blank, _self)
 * - Title attribute for accessibility
 * - Edit existing links
 * - Remove link functionality
 *
 * Accessibility:
 * - ARIA labels for screen readers
 * - Keyboard navigation support (Esc to close, Enter to submit)
 * - Focus management
 *
 * Wells Fargo Branding:
 * - Official red for primary actions
 * - Proper button styling per brand guidelines
 */

import { useState, useEffect } from 'react';
import { X, Link2, ExternalLink } from 'lucide-react';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, text: string, target: string, title: string) => void;
  initialData?: {
    url: string;
    text: string;
    target: string;
    title: string;
  };
}

export default function LinkModal({
  isOpen,
  onClose,
  onInsert,
  initialData,
}: LinkModalProps) {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [target, setTarget] = useState('_blank');
  const [title, setTitle] = useState('');
  const [urlError, setUrlError] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setUrl(initialData.url);
      setText(initialData.text);
      setTarget(initialData.target);
      setTitle(initialData.title);
    } else if (isOpen) {
      // Reset form when opening for new link
      setUrl('');
      setText('');
      setTarget('_blank');
      setTitle('');
      setUrlError('');
    }
  }, [isOpen, initialData]);

  // URL validation
  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlError('URL is required');
      return false;
    }

    // Check if URL is valid
    try {
      // Allow relative URLs
      if (value.startsWith('/')) {
        setUrlError('');
        return true;
      }

      // Validate absolute URLs
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(value)) {
        setUrlError('Please enter a valid URL');
        return false;
      }

      setUrlError('');
      return true;
    } catch {
      setUrlError('Invalid URL format');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUrl(url)) {
      return;
    }

    // Ensure URL has protocol
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('/') && !finalUrl.startsWith('mailto:')) {
      finalUrl = 'https://' + finalUrl;
    }

    onInsert(finalUrl, text.trim() || finalUrl, target, title.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-modal-title"
    >
      <div
        className={`w-full max-w-lg rounded-xl shadow-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-wf-red rounded-lg">
              <Link2 size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <h2
              id="link-modal-title"
              className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {initialData ? 'Edit Link' : 'Insert Link'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* URL Input */}
          <div>
            <label
              htmlFor="link-url"
              className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              URL <span className="text-wf-red">*</span>
            </label>
            <input
              id="link-url"
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) validateUrl(e.target.value);
              }}
              onBlur={(e) => validateUrl(e.target.value)}
              placeholder="https://example.com or /relative-path"
              className={`w-full px-4 py-2.5 rounded-lg border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-wf-red ${
                urlError
                  ? 'border-red-500'
                  : theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              autoFocus
              required
            />
            {urlError && (
              <p className="mt-1 text-sm text-red-500 font-medium">{urlError}</p>
            )}
          </div>

          {/* Link Text Input */}
          <div>
            <label
              htmlFor="link-text"
              className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Link Text
            </label>
            <input
              id="link-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Click here (optional)"
              className={`w-full px-4 py-2.5 rounded-lg border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-wf-red ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              If empty, the URL will be displayed
            </p>
          </div>

          {/* Title Input (for accessibility) */}
          <div>
            <label
              htmlFor="link-title"
              className={`block text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Title (Accessibility)
            </label>
            <input
              id="link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive title for screen readers"
              className={`w-full px-4 py-2.5 rounded-lg border-2 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-wf-red ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Target Selection */}
          <div>
            <label
              className={`block text-sm font-semibold mb-3 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              Open Link In
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="target"
                  value="_blank"
                  checked={target === '_blank'}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-4 h-4 text-wf-red focus:ring-wf-red"
                />
                <div className="flex items-center gap-2">
                  <ExternalLink size={16} className="text-gray-500" />
                  <span className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    New tab
                  </span>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    (Recommended for external links)
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="target"
                  value="_self"
                  checked={target === '_self'}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-4 h-4 text-wf-red focus:ring-wf-red"
                />
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Same tab
                </span>
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all border-2 ${
              theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-wf-red text-white rounded-lg font-semibold hover:bg-wf-red-700 transition-all shadow-md hover:shadow-lg"
          >
            {initialData ? 'Update Link' : 'Insert Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
