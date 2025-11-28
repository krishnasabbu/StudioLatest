import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileCode, Calendar, Moon, Sun } from 'lucide-react';
import { EmailTemplate } from '../types/template';
import { templateService } from '../services/templateService';
import { useNavigate } from 'react-router-dom';

export default function TemplateListPage() {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );

  // Sync theme class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateService.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setDeleting(id);
    try {
      await templateService.deleteTemplate(id);
      setTemplates(templates.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    navigate('/editor', {
      state: {
        html: template.template_html,
        name: template.name,
        description: template.description,
        templateId: template.id,
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

      {/* ===================== TOP NAV BAR (Option A) ===================== */}
      <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Left: Title */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Email Template Manager
          </h1>

          {/* Right: Nav + Theme Toggle */}
          <div className="flex items-center gap-4">

            {/* Templates */}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-red transition"
            >
              Templates
            </button>

            {/* Import Template */}
            <button
              onClick={() => navigate('/import')}
              className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-red transition"
            >
              Import Template
            </button>

            {/* Editor */}
            <button
              onClick={() => navigate('/editor')}
              className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-red transition"
            >
              Editor
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ===================== PAGE CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-wf-red border-t-transparent"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-16 text-center">
            <FileCode size={80} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
              No Templates Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Create your first email template to get started
            </p>

            <button
              onClick={() => navigate('/import')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-wf-red text-white rounded-lg hover:bg-wf-red-700 font-bold text-lg shadow-lg"
            >
              <Plus size={24} />
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border-2 border-transparent hover:border-wf-red/20"
              >
                <div className="p-6">

                  {/* Title + Description */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 my-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} />
                      {formatDate(template.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCode size={16} />
                      {template.variables?.length || 0} vars
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-wf-red text-white rounded-lg hover:bg-wf-red-700 font-bold"
                    >
                      <Edit size={18} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deleting === template.id}
                      className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      {deleting === template.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 dark:border-gray-300 border-t-transparent"></div>
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {formatDate(template.updated_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
