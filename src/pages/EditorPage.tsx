import { useState, useEffect } from 'react';
import { Save, Download, ArrowLeft, Eye, Code2, HelpCircle, X, Moon, Sun, ChevronRight, ChevronDown, FileText, Play } from 'lucide-react';
import HTMLCanvasEditor from '../components/HTMLCanvasEditor';
import SelectionToolbar from '../components/SelectionToolbar';
import VariablePanel from '../components/VariablePanel';
import ConditionPanel from '../components/ConditionPanel';
import HyperlinkPanel from '../components/HyperlinkPanel';
import CTAPanel from '../components/CTAPanel';
import FRDGeneratorPanel from '../components/FRDGeneratorPanel';
import LiveEmailPreview from '../components/LiveEmailPreview';
import LivePreviewModal from '../components/modals/LivePreviewModal';
import { SelectionInfo, Variable, ConditionDefinition, Hyperlink, CTAButton } from '../types/template';
import {
  renderTemplate,
  insertVariable,
  wrapWithNamedCondition,
  wrapWithLoop,
  extractVariables,
} from '../lib/templateEngine';
import { templateService } from '../services/templateService';
import { useNavigate, getNavigationState } from './useNavigate';
import { useTheme } from '../contexts/ThemeContext';

export default function EditorPage() {
  const navigate = useNavigate();
  const navState = getNavigationState();
  const { theme, toggleTheme } = useTheme();

  const [templateName, setTemplateName] = useState(navState.name || 'Untitled Template');
  const [templateDescription, setTemplateDescription] = useState(navState.description || '');
  const [originalHtml, setOriginalHtml] = useState(navState.html || '');
  const [templateHtml, setTemplateHtml] = useState(navState.html || '');
  const [variables, setVariables] = useState<Variable[]>([]);
  const [conditions, setConditions] = useState<ConditionDefinition[]>([]);
  const [hyperlinks, setHyperlinks] = useState<Hyperlink[]>([]);
  const [ctaButtons, setCtaButtons] = useState<CTAButton[]>([]);
  const [previewData, setPreviewData] = useState<Record<string, any>>({});
  const [renderedHtml, setRenderedHtml] = useState('');
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(
    navState.templateId || null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['variables']));
  const [showHelp, setShowHelp] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);

  useEffect(() => {
    const loadExistingTemplate = async () => {
      if (currentTemplateId) {
        try {
          const template = await templateService.getTemplate(currentTemplateId);
          if (template) {
            setVariables(template.variables || []);
            setConditions(template.conditions || []);
            setHyperlinks(template.hyperlinks || []);
            setCtaButtons(template.cta_buttons || []);
            setPreviewData(template.preview_data || {});
          }
        } catch (error) {
          console.error('Error loading template:', error);
        }
      }
    };
    loadExistingTemplate();
  }, [currentTemplateId]);

  useEffect(() => {
    const rendered = renderTemplate(templateHtml, previewData, conditions);
    setRenderedHtml(rendered);
  }, [templateHtml, previewData, conditions]);

  useEffect(() => {
    const detectedVars = extractVariables(templateHtml);
    const newVars = detectedVars
      .filter((varName) => !variables.find((v) => v.name === varName))
      .map((varName) => ({
        id: Date.now().toString() + Math.random(),
        name: varName,
        type: 'string' as const,
        description: '',
      }));

    if (newVars.length > 0) {
      setVariables((prev) => [...prev, ...newVars]);
    }
  }, [templateHtml]);

  const handleMakeVariable = (variableName: string) => {
    if (!selection?.range) return;

    const variableTag = insertVariable(variableName);
    const range = selection.range;

    range.deleteContents();
    const textNode = document.createTextNode(variableTag);
    range.insertNode(textNode);

    const parent = range.commonAncestorContainer.parentElement;
    if (parent) {
      setTemplateHtml(parent.closest('[contenteditable]')?.innerHTML || templateHtml);
    }

    const newVar: Variable = {
      id: Date.now().toString(),
      name: variableName,
      type: 'string',
      description: '',
    };

    if (!variables.find((v) => v.name === variableName)) {
      setVariables([...variables, newVar]);
    }

    setSelection(null);
  };

  const handleWrapCondition = (conditionName: string) => {
    if (!selection?.element) return;

    const element = selection.element;
    const wrappedHtml = wrapWithNamedCondition(element.outerHTML, conditionName);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = wrappedHtml;

    element.parentNode?.replaceChild(tempDiv.firstChild!, element);

    const parent = tempDiv.closest('[contenteditable]');
    if (parent) {
      setTemplateHtml(parent.innerHTML);
    }

    setSelection(null);
  };

  const handleWrapLoop = (arrayVariable: string) => {
    if (!selection?.element) return;

    const element = selection.element;
    const wrappedHtml = wrapWithLoop(element.outerHTML, arrayVariable);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = wrappedHtml;

    element.parentNode?.replaceChild(tempDiv.firstChild!, element);

    const parent = tempDiv.closest('[contenteditable]');
    if (parent) {
      setTemplateHtml(parent.innerHTML);
    }

    setSelection(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (currentTemplateId) {
        await templateService.updateTemplate(currentTemplateId, {
          name: templateName,
          description: templateDescription,
          template_html: templateHtml,
          variables,
          conditions,
          hyperlinks,
          cta_buttons: ctaButtons,
          preview_data: previewData,
        });
      } else {
        const created = await templateService.createTemplate({
          name: templateName,
          description: templateDescription,
          original_html: originalHtml,
          template_html: templateHtml,
          variables,
          conditions,
          hyperlinks,
          cta_buttons: ctaButtons,
          preview_data: previewData,
        });
        setCurrentTemplateId(created.id);
      }
      alert('✓ Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(
      {
        name: templateName,
        description: templateDescription,
        template: templateHtml,
        variables,
        conditions,
        sampleData: previewData,
      },
      null,
      2
    );
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${templateName.replace(/\s+/g, '_')}_template.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleInsertLink = (url: string, text: string) => {
    if (!selection?.range) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('/') && !finalUrl.startsWith('mailto:')) {
      finalUrl = 'https://' + finalUrl;
    }

    const link = document.createElement('a');
    link.href = finalUrl;
    link.textContent = text;
    link.target = '_blank';
    link.style.color = '#D71E28';
    link.style.textDecoration = 'underline';

    const range = selection.range;
    range.deleteContents();
    range.insertNode(link);

    const parent = range.commonAncestorContainer.parentElement;
    if (parent) {
      const editor = parent.closest('[contenteditable]');
      if (editor) {
        setTemplateHtml(editor.innerHTML);
      }
    }

    const newHyperlink: Hyperlink = {
      id: Date.now().toString() + Math.random(),
      url: finalUrl,
      text: text,
      created_at: new Date().toISOString(),
    };
    setHyperlinks((prev) => [newHyperlink, ...prev]);

    setSelection(null);
  };

  const handleInsertCTA = (text: string, url: string) => {
    if (!selection?.range) return;

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('/') && !finalUrl.startsWith('mailto:')) {
      finalUrl = 'https://' + finalUrl;
    }

    const buttonHtml = `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 16px 0;"><tr><td style="border-radius: 8px; background-color: #D71E28;"><a href="${finalUrl}" style="background-color: #D71E28; border: none; color: #FFFFFF; padding: 12px 24px; text-decoration: none; display: inline-block; font-size: 16px; font-weight: 700; border-radius: 8px;" target="_blank">${text}</a></td></tr></table>`;

    const range = selection.range;
    range.deleteContents();
    const temp = document.createElement('div');
    temp.innerHTML = buttonHtml;
    const frag = document.createDocumentFragment();
    while (temp.firstChild) {
      frag.appendChild(temp.firstChild);
    }
    range.insertNode(frag);

    const parent = range.commonAncestorContainer.parentElement;
    if (parent) {
      const editor = parent.closest('[contenteditable]');
      if (editor) {
        setTemplateHtml(editor.innerHTML);
      }
    }

    const newCTAButton: CTAButton = {
      id: Date.now().toString() + Math.random(),
      text: text,
      url: finalUrl,
      created_at: new Date().toISOString(),
    };
    setCtaButtons((prev) => [newCTAButton, ...prev]);

    setSelection(null);
  };

  const handleSelectionChange = (newSelection: SelectionInfo | null) => {
    setSelection(newSelection);

    if (newSelection) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setToolbarPosition({
          x: Math.max(10, rect.left + rect.width / 2 - 128),
          y: rect.bottom + window.scrollY + 10,
        });
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => navigate('list')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-wf-red hover:bg-red-50 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="flex-1 max-w-2xl">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="text-xl font-bold text-gray-900 dark:text-white dark:bg-gray-800 w-full border-0 outline-none focus:ring-2 focus:ring-wf-red rounded px-2 py-1"
                  placeholder="Template name"
                />
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="text-sm text-gray-600 dark:text-gray-300 dark:bg-gray-800 w-full border-0 outline-none focus:ring-2 focus:ring-wf-red rounded px-2 py-1 mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-gold hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-wf-red dark:hover:text-wf-gold hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Help"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={() => setShowLivePreview(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-wf-gold bg-wf-gold text-gray-900 rounded-lg hover:bg-yellow-500 hover:border-yellow-600 font-bold transition-all shadow-md"
              >
                <Play size={18} strokeWidth={2.5} />
                Live Preview
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 font-bold transition-all shadow-md"
              >
                <Download size={18} strokeWidth={2.5} />
                Export
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-wf-red text-white rounded-lg hover:bg-wf-red-700 font-bold shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Save size={18} strokeWidth={2.5} />
                {isSaving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showHelp && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-start gap-3">
            <HelpCircle size={18} className="text-wf-red mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm text-gray-900">
              <p className="font-semibold mb-1 text-wf-red">Quick Guide:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Select text in the editor and click actions to create variables or add conditions</li>
                <li>Variables use notation: <code className="bg-white px-2 py-0.5 rounded border border-gray-300 font-mono">{'{{variableName}}'}</code></li>
                <li>Conditions use notation: <code className="bg-white px-2 py-0.5 rounded border border-gray-300 font-mono">{'{{%conditionName%}}'}</code></li>
                <li>Create conditions in the left panel first, then wrap content with them</li>
                <li>Edit JSON data on the right to see live preview changes</li>
              </ul>
            </div>
            <button onClick={() => setShowHelp(false)} className="text-wf-red hover:text-wf-red-800">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r bg-white dark:bg-gray-800 flex flex-col overflow-y-auto">
          {/* Variables Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (newExpanded.has('variables')) {
                  newExpanded.delete('variables');
                } else {
                  newExpanded.add('variables');
                }
                setExpandedSections(newExpanded);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Variables
                <span className="text-xs font-normal px-2 py-0.5 bg-wf-red text-white rounded-full">
                  {variables.length}
                </span>
              </span>
              {expandedSections.has('variables') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              )}
            </button>
            {expandedSections.has('variables') && (
              <div className="max-h-96 overflow-y-auto">
                <VariablePanel variables={variables} onVariablesChange={setVariables} />
              </div>
            )}
          </div>

          {/* Conditions Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (newExpanded.has('conditions')) {
                  newExpanded.delete('conditions');
                } else {
                  newExpanded.add('conditions');
                }
                setExpandedSections(newExpanded);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Conditions
                <span className="text-xs font-normal px-2 py-0.5 bg-green-600 text-white rounded-full">
                  {conditions.length}
                </span>
              </span>
              {expandedSections.has('conditions') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              )}
            </button>
            {expandedSections.has('conditions') && (
              <div className="max-h-96 overflow-y-auto">
                <ConditionPanel
                  conditions={conditions}
                  variables={variables}
                  onConditionsChange={setConditions}
                />
              </div>
            )}
          </div>

          {/* Hyperlinks Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (newExpanded.has('hyperlinks')) {
                  newExpanded.delete('hyperlinks');
                } else {
                  newExpanded.add('hyperlinks');
                }
                setExpandedSections(newExpanded);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Hyperlinks
                <span className="text-xs font-normal px-2 py-0.5 bg-blue-600 text-white rounded-full">
                  {hyperlinks.length}
                </span>
              </span>
              {expandedSections.has('hyperlinks') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              )}
            </button>
            {expandedSections.has('hyperlinks') && (
              <div className="max-h-96 overflow-y-auto">
                <HyperlinkPanel hyperlinks={hyperlinks} onHyperlinksChange={setHyperlinks} />
              </div>
            )}
          </div>

          {/* CTA Buttons Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                const newExpanded = new Set(expandedSections);
                if (newExpanded.has('cta')) {
                  newExpanded.delete('cta');
                } else {
                  newExpanded.add('cta');
                }
                setExpandedSections(newExpanded);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                CTA Buttons
                <span className="text-xs font-normal px-2 py-0.5 bg-amber-600 text-white rounded-full">
                  {ctaButtons.length}
                </span>
              </span>
              {expandedSections.has('cta') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
              )}
            </button>
            {expandedSections.has('cta') && (
              <div className="max-h-96 overflow-y-auto">
                <CTAPanel ctaButtons={ctaButtons} onCTAButtonsChange={setCtaButtons} />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative bg-white">
          <div className="border-b bg-gray-50 px-4 py-2">
            <div className="flex items-center gap-2">
              <Code2 size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">HTML Template Editor</span>
              <div className="ml-auto text-xs text-gray-500">
                Select text to add variables or conditions
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <HTMLCanvasEditor
              html={templateHtml}
              onHtmlChange={setTemplateHtml}
              onSelectionChange={handleSelectionChange}
            />
          </div>

          {selection && (
            <SelectionToolbar
              selection={selection}
              position={toolbarPosition}
              conditions={conditions}
              onMakeVariable={handleMakeVariable}
              onWrapCondition={handleWrapCondition}
              onWrapLoop={handleWrapLoop}
              onInsertLink={handleInsertLink}
              onInsertCTA={handleInsertCTA}
              onClose={() => setSelection(null)}
            />
          )}
        </div>

        <div className="w-96 border-l bg-white dark:bg-gray-800 flex flex-col">
          <div className="border-b bg-gray-50 dark:bg-gray-900 px-4 py-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">FRD Generator</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <FRDGeneratorPanel
              templateName={templateName}
              templateDescription={templateDescription}
              templateHtml={templateHtml}
              variables={variables}
              conditions={conditions}
              hyperlinks={hyperlinks}
              ctaButtons={ctaButtons}
            />
          </div>
        </div>
      </div>

      <LivePreviewModal
        isOpen={showLivePreview}
        onClose={() => setShowLivePreview(false)}
        templateHtml={templateHtml}
        variables={variables}
        conditions={conditions}
        hyperlinks={hyperlinks}
        ctaButtons={ctaButtons}
      />
    </div>
  );
}
