import { supabase } from '../lib/supabase';
import { EmailTemplate, Variable } from '../types/template';

export const templateService = {
  async getAllTemplates(): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getTemplate(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        name: template.name || 'Untitled Template',
        description: template.description || '',
        original_html: template.original_html || '',
        template_html: template.template_html || template.original_html || '',
        variables: template.variables || [],
        conditions: template.conditions || [],
        hyperlinks: template.hyperlinks || [],
        cta_buttons: template.cta_buttons || [],
        preview_data: template.preview_data || {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({
        name: updates.name,
        description: updates.description,
        template_html: updates.template_html,
        variables: updates.variables,
        conditions: updates.conditions,
        hyperlinks: updates.hyperlinks,
        cta_buttons: updates.cta_buttons,
        preview_data: updates.preview_data,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
