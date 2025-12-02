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

const operatorMappings: Record<string, string> = {
  'equals': '==',
  'equal': '==',
  'is': '==',
  'not equals': '!=',
  'not equal': '!=',
  'isn\'t': '!=',
  'greater than': '>',
  'more than': '>',
  'less than': '<',
  'fewer than': '<',
  'greater or equal': '>=',
  'at least': '>=',
  'less or equal': '<=',
  'at most': '<=',
  'contains': 'contains',
  'includes': 'contains',
  'has': 'contains',
  'not contains': 'notContains',
  'doesn\'t contain': 'notContains',
  'excludes': 'notContains',
};

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
