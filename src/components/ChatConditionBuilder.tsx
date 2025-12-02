import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, Sparkles, X } from 'lucide-react';
import { Variable, ConditionClause, ConditionOperator, LogicOperator } from '../types/template';
import { processNaturalLanguage, LLMResponse } from '../services/llmService';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  chips?: Array<{ label: string; value: string; type?: string }>;
  timestamp: Date;
}

interface ChatConditionBuilderProps {
  variables: Variable[];
  onConditionUpdate: (data: {
    name: string;
    description: string;
    clauses: ConditionClause[];
    logicOperator: LogicOperator;
    content: string;
    hasElse: boolean;
    elseContent: string;
  }) => void;
  onClose: () => void;
  onRealtimeUpdate?: (data: {
    name?: string;
    description?: string;
    clauses?: ConditionClause[];
    logicOperator?: LogicOperator;
    content?: string;
    hasElse?: boolean;
    elseContent?: string;
  }) => void;
  hideCloseButton?: boolean;
}

type ChatStep =
  | 'welcome'
  | 'condition_name'
  | 'select_variable'
  | 'select_operator'
  | 'enter_value'
  | 'enter_content'
  | 'ask_else'
  | 'enter_else_content'
  | 'ask_add_clause'
  | 'complete';

const operatorLabels: Record<ConditionOperator, string> = {
  '==': 'equals',
  '!=': 'not equals',
  '>': 'greater than',
  '<': 'less than',
  '>=': 'greater or equal',
  '<=': 'less or equal',
  'contains': 'contains',
  'notContains': 'not contains',
};

export default function ChatConditionBuilder({
  variables,
  onConditionUpdate,
  onClose,
  onRealtimeUpdate,
  hideCloseButton = false
}: ChatConditionBuilderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ChatStep>('welcome');
  const [currentClause, setCurrentClause] = useState<Partial<ConditionClause>>({});
  const [clauses, setClauses] = useState<ConditionClause[]>([]);
  const [conditionName, setConditionName] = useState('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [logicOperator, setLogicOperator] = useState<LogicOperator>('AND');
  const [content, setContent] = useState('');
  const [hasElse, setHasElse] = useState(false);
  const [elseContent, setElseContent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    addBotMessage(
      "Hi! I'll help you create a condition. Let's start by giving your condition a name.",
      []
    );
    setCurrentStep('condition_name');
  }, []);

  const sendRealtimeUpdate = (data: {
    name?: string;
    description?: string;
    clauses?: ConditionClause[];
    logicOperator?: LogicOperator;
    content?: string;
    hasElse?: boolean;
    elseContent?: string;
  }) => {
    if (onRealtimeUpdate) {
      onRealtimeUpdate(data);
    }
  };

  const addBotMessage = (content: string, chips: Array<{ label: string; value: string; type?: string }> = []) => {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      type: 'bot',
      content,
      chips,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleChipClick = async (value: string, type?: string) => {
    addUserMessage(value);

    switch (currentStep) {
      case 'select_variable':
        setCurrentClause({ ...currentClause, variable: value });
        addBotMessage(
          `Great! Variable "${value}" selected. Now choose an operator:`,
          Object.entries(operatorLabels).map(([op, label]) => ({
            label,
            value: op,
            type: 'operator',
          }))
        );
        setCurrentStep('select_operator');
        break;

      case 'select_operator':
        setCurrentClause({ ...currentClause, operator: value as ConditionOperator });
        addBotMessage(
          `Perfect! Operator "${operatorLabels[value as ConditionOperator]}" selected. Now enter the value to compare against:`,
          [
            { label: 'Enter literal value', value: 'literal', type: 'valueType' },
            { label: 'Use another variable', value: 'variable', type: 'valueType' },
          ]
        );
        setCurrentStep('enter_value');
        break;

      case 'enter_value':
        if (type === 'valueType') {
          if (value === 'variable') {
            addBotMessage(
              'Select a variable to compare against:',
              variables.map((v) => ({ label: v.name, value: v.name, type: 'variableValue' }))
            );
          } else {
            addBotMessage('Please type the value you want to compare against (then press Enter).');
          }
          setCurrentClause({ ...currentClause, valueType: value as 'literal' | 'variable' });
        } else if (type === 'variableValue') {
          const newClause: ConditionClause = {
            variable: currentClause.variable!,
            operator: currentClause.operator!,
            value: value,
            valueType: 'variable',
          };
          const updatedClauses = [...clauses, newClause];
          setClauses(updatedClauses);
          setCurrentClause({});
          sendRealtimeUpdate({ clauses: updatedClauses });

          addBotMessage(
            `Clause added: ${newClause.variable} ${operatorLabels[newClause.operator]} ${newClause.value}`,
            []
          );
          addBotMessage(
            'Now, enter the content to display when this condition is TRUE:',
            []
          );
          setCurrentStep('enter_content');
        }
        break;

      case 'ask_else':
        if (value.toLowerCase() === 'yes') {
          setHasElse(true);
          sendRealtimeUpdate({ hasElse: true });
          addBotMessage('Please enter the content to display when the condition is FALSE (ELSE):');
          setCurrentStep('enter_else_content');
        } else {
          setHasElse(false);
          sendRealtimeUpdate({ hasElse: false });
          addBotMessage(
            'Would you like to add another clause?',
            [
              { label: 'Yes, add another clause', value: 'yes', type: 'addClause' },
              { label: 'No, finish', value: 'no', type: 'addClause' },
            ]
          );
          setCurrentStep('ask_add_clause');
        }
        break;

      case 'ask_add_clause':
        if (value.toLowerCase() === 'yes') {
          addBotMessage(
            'Select a variable for the new clause:',
            variables.map((v) => ({ label: v.name, value: v.name, type: 'variable' }))
          );
          setCurrentStep('select_variable');
        } else {
          completeCondition();
        }
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    addUserMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      switch (currentStep) {
        case 'condition_name':
          setConditionName(userMessage);
          sendRealtimeUpdate({ name: userMessage });
          addBotMessage(
            `Perfect! Condition name set to "${userMessage}". Would you like to add a description? (Optional - type description or say "skip")`,
            [{ label: 'Skip', value: 'skip', type: 'skip' }]
          );
          setCurrentStep('select_variable');
          setTimeout(() => {
            addBotMessage(
              'Now, select a variable to start building your condition:',
              variables.map((v) => ({ label: v.name, value: v.name, type: 'variable' }))
            );
          }, 500);
          break;

        case 'select_variable':
          if (userMessage.toLowerCase() !== 'skip' && currentStep === 'select_variable' && !currentClause.variable) {
            setConditionDescription(userMessage);
            sendRealtimeUpdate({ description: userMessage });
          }

          const llmResponse = await processNaturalLanguage({
            message: userMessage,
            context: {
              variables: variables.map(v => ({ name: v.name, type: v.type })),
              conditions: [],
              currentStep: 'select_variable',
            },
          });

          if (llmResponse.extractedData?.variable) {
            handleChipClick(llmResponse.extractedData.variable, 'variable');
          } else {
            addBotMessage(llmResponse.message);
          }
          break;

        case 'select_operator':
          const operatorResponse = await processNaturalLanguage({
            message: userMessage,
            context: {
              variables: variables.map(v => ({ name: v.name, type: v.type })),
              conditions: [],
              currentStep: 'select_operator',
            },
          });

          if (operatorResponse.extractedData?.operator) {
            handleChipClick(operatorResponse.extractedData.operator, 'operator');
          } else {
            addBotMessage(operatorResponse.message);
          }
          break;

        case 'enter_value':
          if (!currentClause.valueType) {
            addBotMessage('Please select whether you want to enter a literal value or use a variable.');
          } else if (currentClause.valueType === 'literal') {
            const newClause: ConditionClause = {
              variable: currentClause.variable!,
              operator: currentClause.operator!,
              value: userMessage,
              valueType: 'literal',
            };
            const updatedClauses = [...clauses, newClause];
            setClauses(updatedClauses);
            setCurrentClause({});
            sendRealtimeUpdate({ clauses: updatedClauses });

            addBotMessage(
              `Clause added: ${newClause.variable} ${operatorLabels[newClause.operator]} "${newClause.value}"`,
              []
            );
            addBotMessage(
              'Now, enter the content to display when this condition is TRUE:',
              []
            );
            setCurrentStep('enter_content');
          }
          break;

        case 'enter_content':
          setContent(userMessage);
          sendRealtimeUpdate({ content: userMessage });
          addBotMessage(
            'Content saved! Would you like to add an ELSE condition (content to show when FALSE)?',
            [
              { label: 'Yes', value: 'yes', type: 'else' },
              { label: 'No', value: 'no', type: 'else' },
            ]
          );
          setCurrentStep('ask_else');
          break;

        case 'enter_else_content':
          setElseContent(userMessage);
          sendRealtimeUpdate({ elseContent: userMessage });
          addBotMessage(
            'ELSE content saved! Would you like to add another clause?',
            [
              { label: 'Yes, add another clause', value: 'yes', type: 'addClause' },
              { label: 'No, finish', value: 'no', type: 'addClause' },
            ]
          );
          setCurrentStep('ask_add_clause');
          break;

        default:
          addBotMessage("I'm not sure what you mean. Please use the options provided or try again.");
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addBotMessage('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeCondition = () => {
    addBotMessage('Perfect! Your condition has been created successfully. 🎉');

    onConditionUpdate({
      name: conditionName,
      description: conditionDescription,
      clauses,
      logicOperator,
      content,
      hasElse,
      elseContent,
    });

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">Condition Builder Assistant</h3>
        </div>
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'bot'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-white'
              }`}
            >
              {message.type === 'bot' ? <Bot size={18} /> : <User size={18} />}
            </div>

            <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  message.type === 'bot'
                    ? 'bg-white border border-gray-200 text-gray-800'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {message.chips && message.chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {message.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip.value, chip.type)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        aria-label={`Select ${chip.label}`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div className="inline-block p-3 rounded-lg bg-white border border-gray-200">
              <Loader className="animate-spin text-blue-600" size={18} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Use chips for quick selection
        </p>
      </div>
    </div>
  );
}
