import { useState } from 'react';
import { Download } from 'lucide-react';
import { Variable, ConditionDefinition, Hyperlink, CTAButton } from '../types/template';
import { generateFRDDocument } from '../lib/frdGenerator';
import HTMLCanvasEditor from './HTMLCanvasEditor';

interface FRDGeneratorPanelProps {
  templateName: string;
  templateDescription: string;
  templateHtml: string;
  variables: Variable[];
  conditions: ConditionDefinition[];
  hyperlinks: Hyperlink[];
  ctaButtons: CTAButton[];
}

export default function FRDGeneratorPanel({
  templateName,
  templateDescription,
  templateHtml,
  variables,
  conditions,
  hyperlinks,
  ctaButtons,
}: FRDGeneratorPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadFRD = async () => {
    setIsGenerating(true);
    try {
      templateHtml = htmlToFormattedText(templateHtml);
      await generateFRDDocument({
        templateName,
        templateDescription,
        templateHtml,
        variables,
        conditions,
        hyperlinks,
        ctaButtons,
      });
    } catch (error) {
      console.error('Error generating FRD document:', error);
      alert('Failed to generate FRD document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  function htmlToFormattedText(html: string): string {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove style/script tags
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

        // Line break elements
        if (["BR"].includes(el.tagName)) {
          text += "\n";
        }

        // Block elements → add line breaks before & after
        if (["P", "DIV", "SECTION", "ARTICLE"].includes(el.tagName)) {
          text += "\n" + nodeToText(el) + "\n";
        }

        // Headings → add blank line
        else if (["H1","H2","H3","H4","H5","H6"].includes(el.tagName)) {
          text += "\n" + nodeToText(el) + "\n";
        }

        // List items
        else if (el.tagName === "LI") {
          text += "• " + nodeToText(el) + "\n";
        }

        // Buttons or anchors
        else if (["A", "BUTTON"].includes(el.tagName)) {
          text += "[" + (el.textContent?.trim() || "") + "] ";
        }

        // Default: recurse
        else if (!["P","DIV","SECTION","ARTICLE","H1","H2","H3","H4","H5","H6","LI","BR","A","BUTTON"].includes(el.tagName)) {
          text += nodeToText(el);
        }
      }
    });

    return text;
  }

  let result = nodeToText(doc.body);

  // Cleanup multiple blank lines
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
              Dynamic Variables
            </h3>
            {variables.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No variables detected in template
              </p>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Variable Name
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {variables.map((variable) => (
                      <tr key={variable.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-2 font-mono text-wf-red dark:text-wf-gold">
                          {variable.name}
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {variable.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
              Conditions
            </h3>
            {conditions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No conditions defined in template
              </p>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Condition Name
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {conditions.map((condition) => (
                      <tr key={condition.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-2 font-mono text-green-600 dark:text-green-400">
                          {condition.name}
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                          {condition.description || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
              Hyperlinks
            </h3>
            {hyperlinks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No hyperlinks added to template
              </p>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Text
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {hyperlinks.map((link) => (
                      <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{link.text}</td>
                        <td className="px-4 py-2 text-blue-600 dark:text-blue-400 font-mono text-xs break-all">
                          {link.url}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
              CTA Buttons
            </h3>
            {ctaButtons.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No CTA buttons added to template
              </p>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        Button Text
                      </th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">
                        URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {ctaButtons.map((button) => (
                      <tr key={button.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{button.text}</td>
                        <td className="px-4 py-2 text-blue-600 dark:text-blue-400 font-mono text-xs break-all">
                          {button.url}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
              HTML Email Content
            </h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
              <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                {htmlToFormattedText(templateHtml) || "No content yet"}
                
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
        <button
          onClick={handleDownloadFRD}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-wf-red text-white rounded-lg hover:bg-wf-red-700 font-bold shadow-lg hover:shadow-xl transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download size={20} strokeWidth={2.5} />
          {isGenerating ? 'Generating...' : 'Download FRD (.docx)'}
        </button>
      </div>
    </div>
  );
}
