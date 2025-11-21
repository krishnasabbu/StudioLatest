import { Variable, ConditionDefinition, Hyperlink, CTAButton, FormatterType } from '../types/template';

export function applyFormatter(value: any, formatter: FormatterType): string {
  if (!formatter || formatter === 'none') {
    return String(value);
  }

  switch (formatter) {
    case 'currency':
      const num = Number(value);
      return isNaN(num) ? String(value) : `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

    case 'datetime':
      const datetime = new Date(value);
      if (isNaN(datetime.getTime())) return String(value);
      return datetime.toLocaleString('en-US');

    case 'time':
      const time = new Date(value);
      if (isNaN(time.getTime())) return String(value);
      return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    case 'percentage':
      const percent = Number(value);
      return isNaN(percent) ? String(value) : `${percent}%`;

    case 'uppercase':
      return String(value).toUpperCase();

    case 'lowercase':
      return String(value).toLowerCase();

    case 'capitalize':
      return String(value).replace(/\b\w/g, (char) => char.toUpperCase());

    default:
      return String(value);
  }
}

export function applyFormatters(
  values: Record<string, any>,
  variables: Variable[]
): Record<string, string> {
  const formatted: Record<string, string> = {};

  variables.forEach((variable) => {
    const value = values[variable.name];
    formatted[variable.name] = applyFormatter(value, variable.formatter || 'none');
  });

  return formatted;
}

export function evaluateCondition(
  clause: { variable: string; operator: string; value: string },
  values: Record<string, any>
): boolean {
  const varValue = values[clause.variable];
  const compareValue = clause.value;

  switch (clause.operator) {
    case '==':
      return String(varValue) === compareValue;
    case '!=':
      return String(varValue) !== compareValue;
    case '>':
      return Number(varValue) > Number(compareValue);
    case '<':
      return Number(varValue) < Number(compareValue);
    case '>=':
      return Number(varValue) >= Number(compareValue);
    case '<=':
      return Number(varValue) <= Number(compareValue);
    case 'contains':
      return String(varValue).includes(compareValue);
    case 'notContains':
      return !String(varValue).includes(compareValue);
    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: ConditionDefinition[],
  values: Record<string, any>
): Record<string, boolean> {
  const results: Record<string, boolean> = {};

  conditions.forEach((condition) => {
    if (condition.clauses.length === 0) {
      results[condition.name] = false;
      return;
    }

    const clauseResults = condition.clauses.map((clause) =>
      evaluateCondition(clause, values)
    );

    if (condition.logicOperator === 'AND') {
      results[condition.name] = clauseResults.every((r) => r);
    } else {
      results[condition.name] = clauseResults.some((r) => r);
    }
  });

  return results;
}

export function processTemplate(
  templateHtml: string,
  values: Record<string, any>,
  variables: Variable[],
  conditions: ConditionDefinition[],
  hyperlinks: Hyperlink[],
  ctaButtons: CTAButton[]
): string {
  let processed = templateHtml;

  const conditionResults = evaluateConditions(conditions, values);

  conditions.forEach((condition) => {
    const isTrue = conditionResults[condition.name];
    const placeholder = `{{%${condition.name}%}}`;
    const closePlaceholder = `{{/%${condition.name}%}}`;

    const regex = new RegExp(
      `${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([\\s\\S]*?)${closePlaceholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'g'
    );

    processed = processed.replace(regex, (match, content) => {
      if (isTrue) {
        return content || '';
      } else if (condition.hasElse && condition.elseContent) {
        return condition.elseContent;
      }
      return '';
    });
  });

  const formattedValues = applyFormatters(values, variables);

  Object.keys(formattedValues).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, formattedValues[key]);
  });

  hyperlinks.forEach((link) => {
    const linkRegex = new RegExp(
      `data-hyperlink-id="${link.id}"[^>]*>([^<]*)<`,
      'g'
    );
    processed = processed.replace(
      linkRegex,
      `href="${link.url}" data-hyperlink-id="${link.id}">$1<`
    );
  });

  ctaButtons.forEach((button) => {
    const buttonRegex = new RegExp(
      `data-cta-id="${button.id}"[^>]*>([^<]*)<`,
      'g'
    );
    processed = processed.replace(
      buttonRegex,
      `href="${button.url}" data-cta-id="${button.id}">$1<`
    );
  });

  return processed;
}
