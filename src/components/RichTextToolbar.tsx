/**
 * RichTextToolbar Component
 *
 * Provides a comprehensive formatting toolbar for the HTML canvas editor
 * Features:
 * - Text formatting (bold, italic, underline, strikethrough)
 * - Headings (H1-H6) and paragraph formatting
 * - Text alignment (left, center, right, justify)
 * - Lists (ordered, unordered)
 * - Link insertion
 * - Image insertion
 * - CTA button creation
 * - Text color and background color
 * - Font size adjustment
 *
 * Wells Fargo Brand Compliance:
 * - Uses official Wells Fargo red (#D71E28) for primary actions
 * - Implements proper button styling per brand guidelines
 * - Maintains accessibility standards (WCAG 2.1 AA)
 */

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link2,
  Image,
  Square,
  Type,
  Palette,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface RichTextToolbarProps {
  onFormatClick: (command: string, value?: string) => void;
  onLinkClick: () => void;
  onImageClick: () => void;
  onCtaClick: () => void;
}

export default function RichTextToolbar({
  onFormatClick,
  onLinkClick,
  onImageClick,
  onCtaClick,
}: RichTextToolbarProps) {
  const { theme } = useTheme();

  // Execute formatting command
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    onFormatClick(command, value);
  };

  // Check if a format is currently active
  const isFormatActive = (command: string, value?: string): boolean => {
    try {
      if (value) {
        return document.queryCommandValue(command) === value;
      }
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  };

  // Button base classes with Wells Fargo styling
  const getButtonClasses = (isActive: boolean = false) => {
    const base = 'p-2 rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-wf-red';

    if (isActive) {
      return `${base} bg-wf-red text-white shadow-md`;
    }

    return theme === 'dark'
      ? `${base} text-gray-300 hover:bg-gray-700 hover:text-white`
      : `${base} text-gray-700 hover:bg-gray-100 hover:text-wf-red`;
  };

  return (
    <div className={`sticky top-0 z-10 border-b ${
      theme === 'dark'
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    } shadow-sm`}>
      <div className="px-4 py-2 flex flex-wrap items-center gap-1">

        {/* Text Formatting Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          <button
            onClick={() => executeCommand('bold')}
            className={getButtonClasses(isFormatActive('bold'))}
            title="Bold (Ctrl+B)"
            type="button"
          >
            <Bold size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => executeCommand('italic')}
            className={getButtonClasses(isFormatActive('italic'))}
            title="Italic (Ctrl+I)"
            type="button"
          >
            <Italic size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => executeCommand('underline')}
            className={getButtonClasses(isFormatActive('underline'))}
            title="Underline (Ctrl+U)"
            type="button"
          >
            <Underline size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => executeCommand('strikeThrough')}
            className={getButtonClasses(isFormatActive('strikeThrough'))}
            title="Strikethrough"
            type="button"
          >
            <Strikethrough size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Heading & Format Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          <select
            onChange={(e) => executeCommand('formatBlock', e.target.value)}
            className={`px-2 py-1.5 rounded-md text-sm font-medium border-2 transition-all ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-700 hover:border-wf-red'
            } focus:outline-none focus:ring-2 focus:ring-wf-red`}
            defaultValue="p"
            title="Paragraph style"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <select
            onChange={(e) => executeCommand('fontSize', e.target.value)}
            className={`px-2 py-1.5 rounded-md text-sm font-medium border-2 transition-all ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                : 'bg-white border-gray-300 text-gray-700 hover:border-wf-red'
            } focus:outline-none focus:ring-2 focus:ring-wf-red`}
            defaultValue="3"
            title="Font size"
          >
            <option value="1">Very Small</option>
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="4">Large</option>
            <option value="5">Very Large</option>
            <option value="6">Huge</option>
          </select>
        </div>

        {/* Alignment Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          <button
            onClick={() => executeCommand('justifyLeft')}
            className={getButtonClasses(isFormatActive('justifyLeft'))}
            title="Align Left"
            type="button"
          >
            <AlignLeft size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => executeCommand('justifyCenter')}
            className={getButtonClasses(isFormatActive('justifyCenter'))}
            title="Align Center"
            type="button"
          >
            <AlignCenter size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => executeCommand('justifyRight')}
            className={getButtonClasses(isFormatActive('justifyRight'))}
            title="Align Right"
            type="button"
          >
            <AlignRight size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => executeCommand('justifyFull')}
            className={getButtonClasses(isFormatActive('justifyFull'))}
            title="Justify"
            type="button"
          >
            <AlignJustify size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* List Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          <button
            onClick={() => executeCommand('insertUnorderedList')}
            className={getButtonClasses(isFormatActive('insertUnorderedList'))}
            title="Bullet List"
            type="button"
          >
            <List size={18} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => executeCommand('insertOrderedList')}
            className={getButtonClasses(isFormatActive('insertOrderedList'))}
            title="Numbered List"
            type="button"
          >
            <ListOrdered size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Color Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300 dark:border-gray-600">
          <div className="relative group">
            <button
              className={getButtonClasses()}
              title="Text Color"
              type="button"
            >
              <Type size={18} strokeWidth={2.5} />
            </button>
            <input
              type="color"
              onChange={(e) => executeCommand('foreColor', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Choose text color"
            />
          </div>

          <div className="relative group">
            <button
              className={getButtonClasses()}
              title="Background Color"
              type="button"
            >
              <Palette size={18} strokeWidth={2.5} />
            </button>
            <input
              type="color"
              onChange={(e) => executeCommand('backColor', e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title="Choose background color"
            />
          </div>
        </div>

        {/* Insert Group - Wells Fargo Primary Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onLinkClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-wf-red text-white rounded-md font-semibold text-sm hover:bg-wf-red-700 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-wf-red"
            title="Insert Link"
            type="button"
          >
            <Link2 size={16} strokeWidth={2.5} />
            <span>Link</span>
          </button>

          <button
            onClick={onImageClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-wf-red text-white rounded-md font-semibold text-sm hover:bg-wf-red-700 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-wf-red"
            title="Insert Image"
            type="button"
          >
            <Image size={16} strokeWidth={2.5} />
            <span>Image</span>
          </button>

          <button
            onClick={onCtaClick}
            className="flex items-center gap-2 px-3 py-1.5 bg-wf-gold text-gray-900 rounded-md font-semibold text-sm hover:bg-wf-gold-600 transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-wf-gold"
            title="Insert CTA Button"
            type="button"
          >
            <Square size={16} strokeWidth={2.5} />
            <span>CTA Button</span>
          </button>
        </div>
      </div>
    </div>
  );
}
