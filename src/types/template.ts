export type VariableType = 'string' | 'number' | 'boolean' | 'image' | 'url' | 'array' | 'object';
export type FormatterType = 'none' | 'currency' | 'date' | 'datetime' | 'time' | 'percentage' | 'uppercase' | 'lowercase' | 'capitalize';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  description?: string;
  formatter?: FormatterType;
}

export type ConditionOperator = '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'notContains';
export type LogicOperator = 'AND' | 'OR';
export type ValueType = 'literal' | 'variable' | 'condition';

export interface ConditionClause {
  variable: string;
  operator: ConditionOperator;
  value: string;
  valueType: ValueType;
}

export interface ConditionDefinition {
  id: string;
  name: string;
  description?: string;
  clauses: ConditionClause[];
  logicOperator: LogicOperator;
  content: string;
  hasElse: boolean;
  elseContent?: string;
}

export interface Hyperlink {
  id: string;
  url: string;
  text: string;
  description?: string;
  created_at: string;
}

export interface CTAButton {
  id: string;
  text: string;
  url: string;
  description?: string;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  original_html: string;
  template_html: string;
  variables: Variable[];
  conditions: ConditionDefinition[];
  hyperlinks: Hyperlink[];
  cta_buttons: CTAButton[];
  preview_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface SelectionInfo {
  type: 'text' | 'image' | 'link' | 'block';
  content: string;
  range?: Range;
  element?: HTMLElement;
}
