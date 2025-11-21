import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileCode, Calendar, Moon, Sun } from 'lucide-react';
import { EmailTemplate } from '../types/template';
import { templateService } from '../services/templateService';
import { useNavigate } from './useNavigate';
import { useTheme } from '../contexts/ThemeContext';

export default function TemplateListPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleEdit = async (template: EmailTemplate) => {
    navigate('editor', {
      html: template.template_html,
      name: template.name,
      description: template.description,
      templateId: template.id,
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="bg-wf-red dark:bg-gray-800 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Email Template Manager</h1>
              <p className="text-red-100 dark:text-gray-300 text-lg">
                Create and manage dynamic email templates with variables and conditions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
              </button>
              <button
                onClick={() => navigate('import')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-wf-red rounded-lg hover:bg-gray-100 font-bold shadow-xl hover:shadow-2xl transition-all text-lg"
              >
                <Plus size={24} strokeWidth={3} />
                New Template
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-wf-red border-t-transparent"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-16 text-center">
            <FileCode size={80} className="mx-auto text-gray-300 dark:text-gray-600 mb-6" strokeWidth={1.5} />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">No Templates Yet</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Create your first email template to get started
            </p>
            <button
              onClick={() => navigate('import')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-wf-red text-white rounded-lg hover:bg-wf-red-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={24} strokeWidth={3} />
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} />
                      {formatDate(template.created_at)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCode size={16} />
                      {template.variables?.length || 0} vars
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-wf-red text-white rounded-lg hover:bg-wf-red-700 font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      <Edit size={18} strokeWidth={2.5} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deleting === template.id}
                      className="px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 font-bold disabled:opacity-50 transition-all shadow-sm"
                    >
                      {deleting === template.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-700 dark:border-gray-300 border-t-transparent"></div>
                      ) : (
                        <Trash2 size={18} strokeWidth={2.5} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
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
