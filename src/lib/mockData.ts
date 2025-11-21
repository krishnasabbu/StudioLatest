import { EmailTemplate } from '../types/template';

let mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    description: 'Welcome new users to the platform',
    original_html: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining us.</p>',
    template_html: '<h1>Welcome {{firstName}}!</h1><p>Thank you for joining us.</p>',
    variables: [
      { id: 'v1', name: 'firstName', type: 'string', description: 'User first name' },
    ],
    conditions: [],
    hyperlinks: [],
    cta_buttons: [],
    preview_data: { firstName: 'John' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Monthly Newsletter',
    description: 'Monthly update to subscribers',
    original_html: '<h2>Newsletter</h2><p>Hello {{name}}, here are the updates for {{month}}.</p>',
    template_html: '<h2>Newsletter</h2><p>Hello {{name}}, here are the updates for {{month}}.</p>',
    variables: [
      { id: 'v2', name: 'name', type: 'string', description: 'Subscriber name' },
      { id: 'v3', name: 'month', type: 'string', description: 'Current month' },
    ],
    conditions: [],
    hyperlinks: [],
    cta_buttons: [],
    preview_data: { name: 'Jane', month: 'November' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const getMockTemplates = (): EmailTemplate[] => {
  return [...mockTemplates];
};

export const getMockTemplate = (id: string): EmailTemplate | null => {
  return mockTemplates.find(t => t.id === id) || null;
};

export const createMockTemplate = (template: Partial<EmailTemplate>): EmailTemplate => {
  const newTemplate: EmailTemplate = {
    id: Date.now().toString(),
    name: template.name || 'Untitled Template',
    description: template.description || '',
    original_html: template.original_html || '',
    template_html: template.template_html || template.original_html || '',
    variables: template.variables || [],
    conditions: template.conditions || [],
    hyperlinks: template.hyperlinks || [],
    cta_buttons: template.cta_buttons || [],
    preview_data: template.preview_data || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockTemplates.push(newTemplate);
  return newTemplate;
};

export const updateMockTemplate = (id: string, updates: Partial<EmailTemplate>): EmailTemplate | null => {
  const index = mockTemplates.findIndex(t => t.id === id);
  if (index === -1) return null;

  mockTemplates[index] = {
    ...mockTemplates[index],
    ...updates,
    id: mockTemplates[index].id,
    created_at: mockTemplates[index].created_at,
    updated_at: new Date().toISOString(),
  };
  return mockTemplates[index];
};

export const deleteMockTemplate = (id: string): boolean => {
  const index = mockTemplates.findIndex(t => t.id === id);
  if (index === -1) return false;
  mockTemplates.splice(index, 1);
  return true;
};
