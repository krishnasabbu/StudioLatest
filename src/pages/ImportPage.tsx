import { useState } from 'react';
import { Upload, FileCode, ArrowRight, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ImportPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  const [htmlContent, setHtmlContent] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setHtmlContent(content);
        if (!templateName) {
          setTemplateName(file.name.replace(/\.[^/.]+$/, ''));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleProceed = () => {
    if (htmlContent.trim()) {
      navigate('/editor', {
        state: {
          html: htmlContent,
          name: templateName || 'Untitled Template',
          description: description,
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-wf-red dark:bg-gray-800 py-6 shadow-lg mb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">Import HTML Template</h1>
              <p className="text-red-100 dark:text-gray-300">
                Upload or paste your HTML email template to get started
              </p>
            </div>
            
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6">

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Welcome Email"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-wf-red focus:border-transparent font-medium"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this template"
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-wf-red focus:border-transparent font-medium"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload HTML File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-wf-red dark:hover:border-wf-red transition-colors bg-gray-50 dark:bg-gray-900/50">
              <input
                type="file"
                accept=".html,.htm"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="text-gray-400 dark:text-gray-500 mb-3" size={48} strokeWidth={1.5} />
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Click to upload HTML file
                </span>
                <span className="text-xs text-gray-500">or drag and drop</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Paste HTML Code
            </label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Paste your HTML code here..."
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 font-bold transition-colors shadow-sm"
            >
              Back to Templates
            </button>
            <button
              onClick={handleProceed}
              disabled={!htmlContent.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-wf-red text-white rounded-lg hover:bg-wf-red-700 font-bold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              Proceed to Editor
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
