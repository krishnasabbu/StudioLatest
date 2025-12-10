import { useState, useEffect } from 'react';
import { Save, Download, ArrowLeft, Eye, Code2, HelpCircle, X, Moon, Sun, ChevronRight, ChevronDown, FileText, Play } from 'lucide-react';
import HTMLCanvasEditor from '../components/HTMLCanvasEditor';
import SelectionToolbar from '../components/SelectionToolbar';
import VariablePanel from '../components/VariablePanel';
import ConditionPanel from '../components/ConditionPanel';
import HyperlinkPanel from '../components/HyperlinkPanel';
import CTAPanel from '../components/CTAPanel';
import EditorChatPanel from '../components/EditorChatPanel';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { convertWidgetType, WidgetType } from '../lib/widgetTypes';
import { generateFRDDocument } from '../lib/frdGenerator';

export default function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as any) || {};
  

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
  const [isGeneratingFRD, setIsGeneratingFRD] = useState(false);

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
    if (!selection?.range) return;

    const placeholder = `{{%${conditionName}%}}`;
    const range = selection.range;

    range.deleteContents();
    const textNode = document.createTextNode(placeholder);
    range.insertNode(textNode);

    const parent = range.commonAncestorContainer.parentElement;
    if (parent) {
      const editor = parent.closest('[contenteditable]');
      if (editor) {
        setTemplateHtml(editor.innerHTML);
      }
    }

    setSelection(null);
  };

  const handleCreateAndWrapCondition = (condition: ConditionDefinition) => {
    setConditions((prev) => [...prev, condition]);

    if (!selection?.range) return;

    const placeholder = `{{%${condition.name}%}}`;
    const range = selection.range;

    range.deleteContents();
    const textNode = document.createTextNode(placeholder);
    range.insertNode(textNode);

    const parent = range.commonAncestorContainer.parentElement;
    if (parent) {
      const editor = parent.closest('[contenteditable]');
      if (editor) {
        setTemplateHtml(editor.innerHTML);
      }
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

  const handleDownloadFRD = async () => {
    setIsGeneratingFRD(true);
    try {
      const formattedHtml = htmlToFormattedText(templateHtml);
      await generateFRDDocument({
        templateName,
        templateDescription,
        templateHtml: formattedHtml,
        variables,
        conditions,
        hyperlinks,
        ctaButtons,
      });
    } catch (error) {
      console.error('Error generating FRD document:', error);
      alert('Failed to generate FRD document. Please try again.');
    } finally {
      setIsGeneratingFRD(false);
    }
  };

  function htmlToFormattedText(html: string): string {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("style, script").forEach((el) => el.remove());

    function nodeToText(node: Node): string {
      let text = "";

      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const value = child.textContent || "";
          text += value.replace(/\s+/g, " ").trim();
        }

        if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child as HTMLElement;

          if (["BR"].includes(el.tagName)) {
            text += "\n";
          }

          if (["P", "DIV", "SECTION", "ARTICLE"].includes(el.tagName)) {
            text += "\n" + nodeToText(el) + "\n";
          }

          else if (["H1","H2","H3","H4","H5","H6"].includes(el.tagName)) {
            text += "\n" + nodeToText(el) + "\n";
          }

          else if (el.tagName === "LI") {
            text += "• " + nodeToText(el) + "\n";
          }

          else if (["A", "BUTTON"].includes(el.tagName)) {
            text += "[" + (el.textContent?.trim() || "") + "] ";
          }

          else if (!["P","DIV","SECTION","ARTICLE","H1","H2","H3","H4","H5","H6","LI","BR","A","BUTTON"].includes(el.tagName)) {
            text += nodeToText(el);
          }
        }
      });

      return text;
    }

    let result = nodeToText(doc.body);
    result = result.replace(/\n{3,}/g, "\n\n");

    return result.trim();
  }

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

  const handleChangeWidget = (widgetType: WidgetType) => {
    if (!selection?.element) return;

    const element = selection.element;
    const newElement = convertWidgetType(element, widgetType, true);
    element.parentNode?.replaceChild(newElement, element);

    const parent = newElement.parentElement;
    if (parent) {
      const editor = parent.closest('[contenteditable]');
      if (editor) {
        setTemplateHtml(editor.innerHTML);
      }
    }

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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors">
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-slate-400 hover:text-wf-red dark:hover:text-wf-red hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-semibold">Back</span>
              </button>
              <div className="h-8 w-px bg-gray-300 dark:bg-slate-700"></div>
              <div className="flex-1 max-w-2xl">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="text-xl font-bold text-gray-900 dark:text-white dark:bg-slate-900 w-full border-0 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded px-2 py-1 placeholder-gray-400 dark:placeholder-slate-500"
                  placeholder="Template name"
                />
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="text-sm text-gray-600 dark:text-slate-300 dark:bg-slate-900 w-full border-0 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded px-2 py-1 mt-1 placeholder-gray-400 dark:placeholder-slate-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">

              <button
                onClick={() => setShowHelp(!showHelp)}
                className="p-2 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Help"
              >
                <HelpCircle size={20} />
              </button>
              <button
                onClick={() => setShowLivePreview(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-wf-gold hover:bg-yellow-500 dark:bg-yellow-600 dark:hover:bg-yellow-500 text-gray-900 dark:text-white rounded-lg font-semibold transition-all shadow-sm"
              >
                <Play size={18} strokeWidth={2.5} />
                Live Preview
              </button>
              <button
                onClick={handleDownloadFRD}
                disabled={isGeneratingFRD}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg font-semibold transition-all shadow-sm disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                <FileText size={18} strokeWidth={2.5} />
                {isGeneratingFRD ? 'Generating...' : 'Download FRD'}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 font-semibold transition-all shadow-sm"
              >
                <Download size={18} strokeWidth={2.5} />
                Export
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 bg-wf-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all disabled:bg-gray-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                <Save size={18} strokeWidth={2.5} />
                {isSaving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showHelp && (
        <div className="bg-blue-50 dark:bg-slate-900 border-b border-blue-200 dark:border-slate-700 px-6 py-3">
          <div className="flex items-start gap-3">
            <HelpCircle size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm text-gray-900 dark:text-slate-100">
              <p className="font-bold mb-2 text-blue-700 dark:text-blue-300">Quick Guide:</p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700 dark:text-slate-300">
                <li>Select text in the editor and click actions to create variables or add conditions</li>
                <li>Variables use notation: <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-300 dark:border-slate-600 font-mono text-blue-600 dark:text-blue-400">{'{{variableName}}'}</code></li>
                <li>Conditions use notation: <code className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-300 dark:border-slate-600 font-mono text-blue-600 dark:text-blue-400">{'{{%conditionName%}}'}</code></li>
                <li>Create conditions in the left panel first, then wrap content with them</li>
                <li>Edit JSON data on the right to see live preview changes</li>
              </ul>
            </div>
            <button onClick={() => setShowHelp(false)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[500px] border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
          <div className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Template Assistant</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <EditorChatPanel
              variables={variables}
              currentHTML={templateHtml}
              onHTMLUpdate={setTemplateHtml}
              onVariablesUpdate={setVariables}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-slate-900">
          <div className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 px-4 py-3">
            <div className="flex items-center gap-2">
              <Code2 size={18} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">HTML Template Editor</span>
              <div className="ml-auto text-xs text-gray-600 dark:text-slate-400 font-medium">
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
              variables={variables}
              onMakeVariable={handleMakeVariable}
              onWrapCondition={handleWrapCondition}
              onCreateAndWrapCondition={handleCreateAndWrapCondition}
              onWrapLoop={handleWrapLoop}
              onInsertLink={handleInsertLink}
              onInsertCTA={handleInsertCTA}
              onChangeWidget={handleChangeWidget}
              onClose={() => setSelection(null)}
            />
          )}
        </div>

        <div className="w-80 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-y-auto">
          {/* Variables Section */}
          <div className="border-b border-gray-200 dark:border-slate-800">
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
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Variables
                <span className="text-xs font-semibold px-2 py-0.5 bg-wf-red dark:bg-red-600 text-white rounded-full">
                  {variables.length}
                </span>
              </span>
              {expandedSections.has('variables') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
              )}
            </button>
            {expandedSections.has('variables') && (
              <div className="max-h-96 overflow-y-auto">
                <VariablePanel variables={variables} onVariablesChange={setVariables} />
              </div>
            )}
          </div>

          {/* Conditions Section */}
          <div className="border-b border-gray-200 dark:border-slate-800">
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
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Conditions
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-full">
                  {conditions.length}
                </span>
              </span>
              {expandedSections.has('conditions') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
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
          <div className="border-b border-gray-200 dark:border-slate-800">
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
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Hyperlinks
                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full">
                  {hyperlinks.length}
                </span>
              </span>
              {expandedSections.has('hyperlinks') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
              )}
            </button>
            {expandedSections.has('hyperlinks') && (
              <div className="max-h-96 overflow-y-auto">
                <HyperlinkPanel hyperlinks={hyperlinks} onHyperlinksChange={setHyperlinks} />
              </div>
            )}
          </div>

          {/* CTA Buttons Section */}
          <div className="border-b border-gray-200 dark:border-slate-800">
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
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                CTA Buttons
                <span className="text-xs font-semibold px-2 py-0.5 bg-amber-600 dark:bg-amber-500 text-white rounded-full">
                  {ctaButtons.length}
                </span>
              </span>
              {expandedSections.has('cta') ? (
                <ChevronDown size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
              ) : (
                <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" strokeWidth={2} />
              )}
            </button>
            {expandedSections.has('cta') && (
              <div className="max-h-96 overflow-y-auto">
                <CTAPanel ctaButtons={ctaButtons} onCTAButtonsChange={setCtaButtons} />
              </div>
            )}
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
