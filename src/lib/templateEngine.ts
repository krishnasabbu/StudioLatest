import Handlebars from 'handlebars';
import { ConditionDefinition } from '../types/template';

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function(arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifGreaterThan', function(arg1, arg2, options) {
  return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifLessThan', function(arg1, arg2, options) {
  return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifContains', function(arg1, arg2, options) {
  if (!arg1) return options.inverse(this);
  return (String(arg1).includes(arg2)) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotContains', function(arg1, arg2, options) {
  if (!arg1) return options.fn(this);
  return (!String(arg1).includes(arg2)) ? options.fn(this) : options.inverse(this);
});

export const renderTemplate = (
  templateHtml: string,
  data: Record<string, any>,
  conditions: ConditionDefinition[] = []
): string => {
  try {
    const processedHtml = replaceConditionPlaceholders(templateHtml, conditions);
    const template = Handlebars.compile(processedHtml);
    return template(data);
  } catch (error) {
    console.error('Template rendering error:', error);
    return `<div style="color: red; padding: 20px;">Error rendering template: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
  }
};

export const extractVariables = (templateHtml: string): string[] => {
  const variableRegex = /\{\{(?:#(?:if|each|unless|with)\s+)?([a-zA-Z_][a-zA-Z0-9_\.]*)/g;
  const variables = new Set<string>();
  let match;

  while ((match = variableRegex.exec(templateHtml)) !== null) {
    const varName = match[1].split('.')[0];
    if (!['if', 'each', 'unless', 'with', 'else', 'ifEquals', 'ifNotEquals', 'ifGreaterThan', 'ifLessThan', 'ifContains', 'ifNotContains'].includes(varName)) {
      variables.add(varName);
    }
  }

  return Array.from(variables);
};

export const buildConditionFromDefinition = (condition: ConditionDefinition): string => {
  const helperMap: Record<string, string> = {
    '==': 'ifEquals',
    '!=': 'ifNotEquals',
    '>': 'ifGreaterThan',
    '<': 'ifLessThan',
    'contains': 'ifContains',
    'notContains': 'ifNotContains',
  };

  if (condition.clauses.length === 1) {
    const clause = condition.clauses[0];
    const helper = helperMap[clause.operator];
    const value = (clause.valueType === 'variable' || clause.valueType === 'condition')
      ? clause.value
      : `"${clause.value}"`;
    return helper ? `${helper} ${clause.variable} ${value}` : `if ${clause.variable}`;
  }

  const clauseStrings = condition.clauses.map(clause => {
    const helper = helperMap[clause.operator];
    const value = (clause.valueType === 'variable' || clause.valueType === 'condition')
      ? clause.value
      : `"${clause.value}"`;
    return helper ? `(${helper} ${clause.variable} ${value})` : clause.variable;
  });

  return condition.logicOperator === 'AND'
    ? clauseStrings.join(' && ')
    : clauseStrings.join(' || ');
};

export const wrapWithNamedCondition = (
  html: string,
  conditionName: string,
  hasElse: boolean = false,
  elseContent: string = ''
): string => {
  const elseBlock = hasElse ? `{{else}}\n${elseContent}\n` : '';
  return `{{%${conditionName}%}}\n${html}\n${elseBlock}{{/%${conditionName}%}}`;
};

export const wrapWithCondition = (
  html: string,
  variable: string,
  operator: string,
  value: string,
  valueIsVariable: boolean = false,
  hasElse: boolean = false,
  elseContent: string = ''
): string => {
  const helperMap: Record<string, string> = {
    '==': 'ifEquals',
    '!=': 'ifNotEquals',
    '>': 'ifGreaterThan',
    '<': 'ifLessThan',
    'contains': 'ifContains',
    'notContains': 'ifNotContains',
  };

  const helper = helperMap[operator];
  const val = valueIsVariable ? value : `"${value}"`;
  const elseBlock = hasElse ? `{{else}}\n${elseContent}\n` : '';

  if (helper) {
    return `{{#${helper} ${variable} ${val}}}\n${html}\n${elseBlock}{{/${helper}}}`;
  }

  return `{{#if ${variable}}}\n${html}\n${elseBlock}{{/if}}`;
};

export const wrapWithLoop = (html: string, arrayVariable: string): string => {
  return `{{#each ${arrayVariable}}}\n${html}\n{{/each}}`;
};

export const insertVariable = (variableName: string): string => {
  return `{{${variableName}}}`;
};

export const insertConditionPlaceholder = (conditionName: string): string => {
  return `{{%${conditionName}%}}`;
};

export const extractConditions = (templateHtml: string): string[] => {
  const conditionRegex = /\{\{%([a-zA-Z_][a-zA-Z0-9_]*)%\}\}/g;
  const conditions = new Set<string>();
  let match;

  while ((match = conditionRegex.exec(templateHtml)) !== null) {
    conditions.add(match[1]);
  }

  return Array.from(conditions);
};

export const replaceConditionPlaceholders = (
  templateHtml: string,
  conditions: ConditionDefinition[]
): string => {
  let result = templateHtml;

  conditions.forEach(condition => {
    const placeholder = `{{%${condition.name}%}}`;
    const closePlaceholder = `{{/%${condition.name}%}}`;
    const regex = new RegExp(`${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${closePlaceholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');

    result = result.replace(regex, (match, content) => {
      const conditionLogic = buildConditionFromDefinition(condition);
      const elseBlock = condition.hasElse && condition.elseContent
        ? `{{else}}\n${condition.elseContent}\n`
        : '';
      return `{{#${conditionLogic}}}\n${content}\n${elseBlock}{{/${conditionLogic.split(' ')[0]}}}`;
    });
  });

  return result;
};
