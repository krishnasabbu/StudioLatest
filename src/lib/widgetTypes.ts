import { Type, Heading1, Heading2, Heading3, AlignLeft, Image, Link, Square, List, ListOrdered, Quote, Code } from 'lucide-react';

export type WidgetType =
  | 'header'
  | 'subheader'
  | 'heading3'
  | 'plaintext'
  | 'paragraph'
  | 'image'
  | 'link'
  | 'button'
  | 'list'
  | 'orderedlist'
  | 'quote'
  | 'code';

export interface WidgetTypeDefinition {
  type: WidgetType;
  label: string;
  icon: any;
  htmlTag: string;
  description: string;
  defaultStyle?: string;
}

export const widgetTypes: WidgetTypeDefinition[] = [
  {
    type: 'header',
    label: 'Header',
    icon: Heading1,
    htmlTag: 'h1',
    description: 'Large header text',
    defaultStyle: 'font-size: 32px; font-weight: bold; margin: 16px 0;'
  },
  {
    type: 'subheader',
    label: 'Subheader',
    icon: Heading2,
    htmlTag: 'h2',
    description: 'Medium header text',
    defaultStyle: 'font-size: 24px; font-weight: bold; margin: 12px 0;'
  },
  {
    type: 'heading3',
    label: 'Heading 3',
    icon: Heading3,
    htmlTag: 'h3',
    description: 'Small header text',
    defaultStyle: 'font-size: 20px; font-weight: bold; margin: 10px 0;'
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: AlignLeft,
    htmlTag: 'p',
    description: 'Regular paragraph',
    defaultStyle: 'font-size: 16px; line-height: 1.5; margin: 8px 0;'
  },
  {
    type: 'plaintext',
    label: 'Plain Text',
    icon: Type,
    htmlTag: 'div',
    description: 'Plain text block',
    defaultStyle: 'font-size: 14px; margin: 4px 0;'
  },
  {
    type: 'quote',
    label: 'Quote',
    icon: Quote,
    htmlTag: 'blockquote',
    description: 'Blockquote text',
    defaultStyle: 'font-size: 16px; font-style: italic; border-left: 4px solid #ccc; padding-left: 16px; margin: 12px 0;'
  },
  {
    type: 'list',
    label: 'Bullet List',
    icon: List,
    htmlTag: 'ul',
    description: 'Unordered list',
    defaultStyle: 'margin: 8px 0; padding-left: 24px;'
  },
  {
    type: 'orderedlist',
    label: 'Numbered List',
    icon: ListOrdered,
    htmlTag: 'ol',
    description: 'Ordered list',
    defaultStyle: 'margin: 8px 0; padding-left: 24px;'
  },
  {
    type: 'code',
    label: 'Code Block',
    icon: Code,
    htmlTag: 'pre',
    description: 'Code snippet',
    defaultStyle: 'font-family: monospace; background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 8px 0;'
  },
  {
    type: 'button',
    label: 'Button',
    icon: Square,
    htmlTag: 'a',
    description: 'Call-to-action button',
    defaultStyle: 'display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 8px 0;'
  },
];

export function detectWidgetType(element: HTMLElement): WidgetType {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case 'h1':
      return 'header';
    case 'h2':
      return 'subheader';
    case 'h3':
      return 'heading3';
    case 'p':
      return 'paragraph';
    case 'blockquote':
      return 'quote';
    case 'ul':
      return 'list';
    case 'ol':
      return 'orderedlist';
    case 'pre':
    case 'code':
      return 'code';
    case 'a':
      if (element.style.display === 'inline-block' || element.classList.contains('button')) {
        return 'button';
      }
      return 'paragraph';
    case 'img':
      return 'image';
    case 'div':
    default:
      return 'plaintext';
  }
}

export function convertWidgetType(
  element: HTMLElement,
  newType: WidgetType,
  preserveStyles: boolean = true
): HTMLElement {
  const widgetDef = widgetTypes.find(w => w.type === newType);
  if (!widgetDef) return element;

  const newElement = document.createElement(widgetDef.htmlTag);

  if (widgetDef.htmlTag === 'ul' || widgetDef.htmlTag === 'ol') {
    const textContent = element.textContent || '';
    const lines = textContent.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line.trim();
      newElement.appendChild(li);
    });
  } else if (widgetDef.htmlTag === 'pre') {
    const code = document.createElement('code');
    code.textContent = element.textContent || '';
    newElement.appendChild(code);
  } else {
    newElement.innerHTML = element.innerHTML;
  }

  if (preserveStyles && element.hasAttribute('style')) {
    newElement.setAttribute('style', element.getAttribute('style') || '');
  } else if (widgetDef.defaultStyle) {
    newElement.setAttribute('style', widgetDef.defaultStyle);
  }

  Array.from(element.attributes).forEach(attr => {
    if (attr.name !== 'style' && attr.name !== 'contenteditable') {
      newElement.setAttribute(attr.name, attr.value);
    }
  });

  if (widgetDef.type === 'button' && !newElement.hasAttribute('href')) {
    newElement.setAttribute('href', '#');
  }

  return newElement;
}

export function getWidgetTypeLabel(type: WidgetType): string {
  return widgetTypes.find(w => w.type === type)?.label || 'Unknown';
}

export function getWidgetTypeIcon(type: WidgetType): any {
  return widgetTypes.find(w => w.type === type)?.icon || Type;
}
