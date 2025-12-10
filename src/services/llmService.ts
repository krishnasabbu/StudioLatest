import { Variable, ConditionClause, LogicOperator, ConditionOperator } from '../types/template';

export interface LLMRequest {
  message: string;
  context: {
    variables: Array<{ name: string; type: string }>;
    conditions: Array<{ name: string }>;
    currentStep: string;
  };
}

export interface LLMResponse {
  intent: 'select_variable' | 'select_operator' | 'enter_value' | 'add_else' | 'add_clause' | 'complete' | 'unknown';
  extractedData?: {
    variable?: string;
    operator?: string;
    value?: string;
    valueType?: 'literal' | 'variable' | 'condition';
    addElse?: boolean;
  };
  suggestions?: string[];
  message: string;
}

interface ConversationMessage {
  role: string;
  content: string;
}

interface ConditionAnalysisResult {
  success: boolean;
  condition?: {
    name: string;
    description: string;
    clauses: ConditionClause[];
    logicOperator: LogicOperator;
    hasElse: boolean;
    elseContent: string;
  };
  error?: string;
}

const operatorMappings: Record<string, ConditionOperator> = {
  'equals': '==',
  'equal': '==',
  'is': '==',
  '=': '==',
  '==': '==',
  'not equals': '!=',
  'not equal': '!=',
  'isn\'t': '!=',
  'is not': '!=',
  '!=': '!=',
  'greater than': '>',
  'more than': '>',
  '>': '>',
  'less than': '<',
  'fewer than': '<',
  '<': '<',
  'greater or equal': '>=',
  'greater than or equal': '>=',
  'at least': '>=',
  '>=': '>=',
  'less or equal': '<=',
  'less than or equal': '<=',
  'at most': '<=',
  '<=': '<=',
  'contains': 'contains',
  'includes': 'contains',
  'has': 'contains',
  'not contains': 'notContains',
  'doesn\'t contain': 'notContains',
  'does not contain': 'notContains',
  'excludes': 'notContains',
};

function simulateStreamingResponse(text: string, onChunk: (chunk: string) => void): Promise<void> {
  return new Promise((resolve) => {
    const words = text.split(' ');
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        const chunk = (index === 0 ? '' : ' ') + words[index];
        onChunk(chunk);
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 50);
  });
}

function extractVariableFromText(text: string, variables: Variable[]): string | null {
  const lowerText = text.toLowerCase();

  for (const variable of variables) {
    const lowerVarName = variable.name.toLowerCase();
    if (lowerText.includes(lowerVarName)) {
      return variable.name;
    }
  }

  return null;
}

function extractOperatorFromText(text: string): ConditionOperator | null {
  const lowerText = text.toLowerCase();

  for (const [keyword, operator] of Object.entries(operatorMappings)) {
    if (lowerText.includes(keyword)) {
      return operator;
    }
  }

  return null;
}

function extractValueFromText(text: string): string | null {
  const quoteMatch = text.match(/["']([^"']+)["']/);
  if (quoteMatch) {
    return quoteMatch[1];
  }

  const trueMatch = text.match(/\b(true|yes|on|enabled)\b/i);
  if (trueMatch) {
    return 'true';
  }

  const falseMatch = text.match(/\b(false|no|off|disabled)\b/i);
  if (falseMatch) {
    return 'false';
  }

  const numberMatch = text.match(/\b(\d+)\b/);
  if (numberMatch) {
    return numberMatch[1];
  }

  return null;
}

function generateConditionName(variable: string, operator: string, value: string): string {
  const operatorMap: Record<string, string> = {
    '==': 'Is',
    '!=': 'IsNot',
    '>': 'GreaterThan',
    '<': 'LessThan',
    '>=': 'AtLeast',
    '<=': 'AtMost',
    'contains': 'Contains',
    'notContains': 'DoesNotContain'
  };

  const operatorPart = operatorMap[operator] || 'Check';
  const valuePart = value.replace(/[^a-zA-Z0-9]/g, '');

  return `${variable}${operatorPart}${valuePart.charAt(0).toUpperCase()}${valuePart.slice(1)}`;
}

export async function chatWithLLM(
  conversationHistory: ConversationMessage[],
  variables: Variable[],
  onChunk: (chunk: string) => void
): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));

  const lastUserMessage = conversationHistory
    .filter(m => m.role === 'user')
    .pop()?.content || '';

  const lowerMessage = lastUserMessage.toLowerCase();

  const variable = extractVariableFromText(lastUserMessage, variables);
  const operator = extractOperatorFromText(lastUserMessage);
  const value = extractValueFromText(lastUserMessage);

  let response = '';

  if (variable && operator && value) {
    response = `Perfect! I understand you want to check if **${variable}** ${operator === '==' ? 'equals' : operator === '!=' ? 'does not equal' : operator === '>' ? 'is greater than' : operator === '<' ? 'is less than' : operator === 'contains' ? 'contains' : ''} **"${value}"**.\n\nThis will create a condition that shows content only when this rule is true. Would you like to add any additional conditions, or should I proceed with this?`;
  } else if (variable && operator) {
    response = `Great! I see you want to use the variable **${variable}** with a ${operator === '==' ? 'equals' : operator === '!=' ? 'not equals' : operator === '>' ? 'greater than' : operator === '<' ? 'less than' : ''} comparison.\n\nWhat value should **${variable}** be compared against? For example, you could say "true", "false", a number, or any text value.`;
  } else if (variable) {
    response = `Excellent! You've mentioned the variable **${variable}**.\n\nNow, what kind of comparison would you like to make? For example:\n• "equals" or "is"\n• "not equals" or "isn't"\n• "greater than" or "less than"\n• "contains"`;
  } else if (lowerMessage.includes('premium') || lowerMessage.includes('customer') || lowerMessage.includes('user')) {
    const suggestedVar = variables.find(v =>
      v.name.toLowerCase().includes('premium') ||
      v.name.toLowerCase().includes('customer') ||
      v.name.toLowerCase().includes('user')
    );

    if (suggestedVar) {
      response = `I think you're referring to the **${suggestedVar.name}** variable. Is that correct?\n\nIf so, what condition would you like to apply? For example, "equals true" or "is active"?`;
    } else {
      response = `I understand you want to create a condition related to ${lowerMessage.includes('premium') ? 'premium' : 'customer'} status.\n\nWhich variable from your template would you like to use? Here are your available variables:\n${variables.map(v => `• ${v.name}`).join('\n')}`;
    }
  } else if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what')) {
    response = `I'm here to help you create conditions for your email template!\n\nYou can describe what you want in plain English. For example:\n• "Show this if isPremiumUser is true"\n• "Display when accountStatus equals active"\n• "Hide if balance is less than 100"\n\nYour available variables are:\n${variables.map(v => `• **${v.name}** (${v.type})`).join('\n')}\n\nJust tell me what you'd like to check!`;
  } else if (conversationHistory.filter(m => m.role === 'user').length === 1) {
    response = `Thanks for starting! To help you create a condition, I need to know:\n\n1. **Which variable** you want to check (from: ${variables.map(v => v.name).join(', ')})\n2. **What comparison** to make (equals, not equals, greater than, etc.)\n3. **What value** to compare against\n\nYou can describe it naturally, like: "Check if isPremiumUser equals true" or "Show when accountBalance is greater than 100"`;
  } else {
    response = `I'm trying to help you build a condition, but I need a bit more information.\n\nCould you tell me which variable you'd like to check and what condition you want to apply?\n\nFor example: "I want to check if userStatus equals premium" or "Display this when isActive is true"`;
  }

  await simulateStreamingResponse(response, onChunk);
}

export async function analyzeConversationForCondition(
  conversationHistory: ConversationMessage[],
  variables: Variable[]
): Promise<ConditionAnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const userMessages = conversationHistory
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .join(' ');

  const lowerMessages = userMessages.toLowerCase();

  let variable: string | null = null;
  let operator: ConditionOperator | null = null;
  let value: string | null = null;
  let hasElse = false;
  let elseContent = '';

  variable = extractVariableFromText(userMessages, variables);
  operator = extractOperatorFromText(userMessages);
  value = extractValueFromText(userMessages);

  if (lowerMessages.includes('else') || lowerMessages.includes('otherwise') || lowerMessages.includes('when false')) {
    hasElse = true;
  }

  if (!variable || !operator || !value) {
    return {
      success: false,
      error: 'Could not extract complete condition from conversation. Please provide variable, operator, and value.'
    };
  }

  const conditionName = generateConditionName(variable, operator, value);
  const description = `Checks if ${variable} ${operator === '==' ? 'equals' : operator === '!=' ? 'does not equal' : operator === '>' ? 'is greater than' : operator === '<' ? 'is less than' : operator === 'contains' ? 'contains' : operator} ${value}`;

  const clause: ConditionClause = {
    variable,
    operator,
    value,
    valueType: 'literal'
  };

  return {
    success: true,
    condition: {
      name: conditionName,
      description,
      clauses: [clause],
      logicOperator: 'AND' as LogicOperator,
      hasElse,
      elseContent
    }
  };
}

function extractVariable(message: string, variables: Array<{ name: string }>): string | undefined {
  const lowerMessage = message.toLowerCase();
  for (const variable of variables) {
    if (lowerMessage.includes(variable.name.toLowerCase())) {
      return variable.name;
    }
  }
  return undefined;
}

function extractOperator(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();
  for (const [keyword, operator] of Object.entries(operatorMappings)) {
    if (lowerMessage.includes(keyword)) {
      return operator;
    }
  }
  return undefined;
}

function extractValue(message: string): { value: string; valueType: 'literal' | 'variable' | 'condition' } | undefined {
  const quoteMatch = message.match(/["']([^"']+)["']/);
  if (quoteMatch) {
    return { value: quoteMatch[1], valueType: 'literal' };
  }

  const words = message.split(/\s+/);
  const lastWord = words[words.length - 1];
  if (lastWord && lastWord.length > 0) {
    return { value: lastWord, valueType: 'literal' };
  }

  return undefined;
}

function detectIntent(message: string, currentStep: string): LLMResponse['intent'] {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('else') || lowerMessage.includes('otherwise')) {
    return 'add_else';
  }

  if (lowerMessage.includes('add') && (lowerMessage.includes('clause') || lowerMessage.includes('condition'))) {
    return 'add_clause';
  }

  if (lowerMessage.includes('done') || lowerMessage.includes('complete') || lowerMessage.includes('finish')) {
    return 'complete';
  }

  if (currentStep === 'select_variable') {
    return 'select_variable';
  }

  if (currentStep === 'select_operator') {
    return 'select_operator';
  }

  if (currentStep === 'enter_value') {
    return 'enter_value';
  }

  if (currentStep === 'ask_else') {
    return 'add_else';
  }

  return 'unknown';
}

export async function processNaturalLanguage(request: LLMRequest): Promise<LLMResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { message, context } = request;
      const lowerMessage = message.toLowerCase();

      const intent = detectIntent(message, context.currentStep);
      const extractedData: LLMResponse['extractedData'] = {};

      const variable = extractVariable(message, context.variables);
      if (variable) {
        extractedData.variable = variable;
      }

      const operator = extractOperator(message);
      if (operator) {
        extractedData.operator = operator;
      }

      const valueInfo = extractValue(message);
      if (valueInfo) {
        extractedData.value = valueInfo.value;
        extractedData.valueType = valueInfo.valueType;
      }

      if (lowerMessage.includes('yes') || lowerMessage.includes('add else')) {
        extractedData.addElse = true;
      } else if (lowerMessage.includes('no') || lowerMessage.includes('skip')) {
        extractedData.addElse = false;
      }

      let responseMessage = '';
      let suggestions: string[] = [];

      switch (intent) {
        case 'select_variable':
          if (extractedData.variable) {
            responseMessage = `Great! I've selected the variable "${extractedData.variable}". Now, what condition would you like to apply?`;
            suggestions = ['equals', 'not equals', 'greater than', 'less than', 'contains'];
          } else {
            responseMessage = "I couldn't find that variable. Please select one from the available options.";
          }
          break;

        case 'select_operator':
          if (extractedData.operator) {
            responseMessage = `Perfect! I've set the operator. Now, please provide the value to compare against.`;
          } else {
            responseMessage = "Please specify a comparison operator like 'equals', 'greater than', or 'contains'.";
          }
          break;

        case 'enter_value':
          if (extractedData.value) {
            responseMessage = `Value "${extractedData.value}" has been set. Would you like to add an ELSE condition?`;
            suggestions = ['Yes', 'No'];
          } else {
            responseMessage = "Please provide a value to compare against.";
          }
          break;

        case 'add_else':
          if (extractedData.addElse !== undefined) {
            responseMessage = extractedData.addElse
              ? "Great! Please provide the content to display when the condition is FALSE."
              : "Understood. Would you like to add another clause or finish?";
            suggestions = extractedData.addElse ? [] : ['Add another clause', 'Finish'];
          } else {
            responseMessage = "Would you like to add an ELSE condition? (Yes/No)";
            suggestions = ['Yes', 'No'];
          }
          break;

        case 'add_clause':
          responseMessage = "Let's add another clause. Please select a variable.";
          extractedData.addElse = false;
          break;

        case 'complete':
          responseMessage = "Perfect! Your condition has been created successfully.";
          break;

        default:
          responseMessage = "I'm here to help you build a condition. Let's start by selecting a variable.";
      }

      resolve({
        intent,
        extractedData,
        suggestions,
        message: responseMessage,
      });
    }, 500);
  });
}
