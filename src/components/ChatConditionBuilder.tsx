import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, Sparkles, X, Zap, MessageCircle } from 'lucide-react';
import { Variable, ConditionClause, ConditionOperator, LogicOperator } from '../types/template';
import { chatWithLLM, analyzeConversationForCondition, ConversationMessage } from '../services/llmService';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  isStreaming?: boolean;
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
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isConstructing, setIsConstructing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcomeMessage = `Hi! I'm your AI assistant for creating email template conditions.

I'll help you build conditions using natural language. Just describe what you want to check!

**Examples:**
• "Show this content if the user is a premium customer"
• "Only display this if accountStatus equals active"
• "Hide this section when balance is less than 100"

**Available variables:** ${variables.map(v => `\`${v.name}\``).join(', ')}

What condition would you like to create?`;

    addBotMessage(welcomeMessage, false);

    const systemMessage: ConversationMessage = {
      role: 'system',
      content: `You are an intelligent assistant helping users create conditional logic for email templates.

Available variables: ${variables.map(v => `${v.name} (${v.type})`).join(', ')}

Your role:
1. Understand what condition the user wants to create using natural language
2. Help extract variable names, operators, and values
3. Guide them through refining the condition
4. Ask clarifying questions when needed

Be conversational, helpful, and guide them naturally. When they describe a condition, acknowledge it clearly and help them build it step by step.`
    };
    setConversationHistory([systemMessage]);
  }, [variables]);

  const addBotMessage = (content: string, isStreaming: boolean = false) => {
    const message: ChatMessage = {
      id: Date.now().toString() + Math.random(),
      type: 'bot',
      content,
      isStreaming,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const updateLastBotMessage = (content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0 && newMessages[newMessages.length - 1].type === 'bot') {
        newMessages[newMessages.length - 1].content = content;
        newMessages[newMessages.length - 1].isStreaming = true;
      }
      return newMessages;
    });
  };

  const finalizeLastBotMessage = () => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages.length > 0 && newMessages[newMessages.length - 1].type === 'bot') {
        newMessages[newMessages.length - 1].isStreaming = false;
      }
      return newMessages;
    });
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    addUserMessage(userMessage);
    setInput('');
    setIsLoading(true);

    const userMsg: ConversationMessage = { role: 'user', content: userMessage };
    const updatedHistory = [...conversationHistory, userMsg];
    setConversationHistory(updatedHistory);

    try {
      addBotMessage('', true);

      let accumulatedResponse = '';
      await chatWithLLM(updatedHistory, variables, (chunk) => {
        accumulatedResponse += chunk;
        updateLastBotMessage(accumulatedResponse);
      });

      finalizeLastBotMessage();

      const assistantMsg: ConversationMessage = { role: 'assistant', content: accumulatedResponse };
      setConversationHistory([...updatedHistory, assistantMsg]);

    } catch (error) {
      console.error('Error in chat:', error);
      updateLastBotMessage('Sorry, I encountered an error. Please try again.');
      finalizeLastBotMessage();
    } finally {
      setIsLoading(false);
    }
  };

  const handleConstruct = async () => {
    if (isConstructing || conversationHistory.length < 2) return;

    setIsConstructing(true);
    addBotMessage('', true);
    updateLastBotMessage('🔍 Analyzing our conversation to extract the condition...');

    try {
      const analysisResult = await analyzeConversationForCondition(conversationHistory, variables);

      if (analysisResult.success && analysisResult.condition) {
        const conditionSummary = `✅ **Condition Successfully Extracted!**

**Name:** ${analysisResult.condition.name}
**Description:** ${analysisResult.condition.description}

**Condition Logic:**
${analysisResult.condition.clauses.map((c, i) => `${i + 1}. \`${c.variable}\` ${c.operator} \`"${c.value}"\``).join('\n')}
${analysisResult.condition.logicOperator === 'AND' ? '\n*All conditions must be true*' : '\n*Any condition can be true*'}

Applying this condition now...`;

        updateLastBotMessage(conditionSummary);
        finalizeLastBotMessage();

        if (onRealtimeUpdate) {
          onRealtimeUpdate({
            name: analysisResult.condition.name,
            description: analysisResult.condition.description,
            clauses: analysisResult.condition.clauses,
            logicOperator: analysisResult.condition.logicOperator,
            hasElse: analysisResult.condition.hasElse,
            elseContent: analysisResult.condition.elseContent
          });
        }

        setTimeout(() => {
          onConditionUpdate({
            name: analysisResult.condition!.name,
            description: analysisResult.condition!.description,
            clauses: analysisResult.condition!.clauses,
            logicOperator: analysisResult.condition!.logicOperator,
            content: '',
            hasElse: analysisResult.condition!.hasElse,
            elseContent: analysisResult.condition!.elseContent
          });
        }, 1500);
      } else {
        updateLastBotMessage(
          `⚠️ I need more information to create the condition.

Please provide:
1. **Which variable** to check
2. **What comparison** to make (equals, greater than, etc.)
3. **What value** to compare against

Example: "Check if isPremiumUser equals true"`
        );
        finalizeLastBotMessage();
      }
    } catch (error) {
      console.error('Error constructing condition:', error);
      updateLastBotMessage('❌ Sorry, I had trouble analyzing the conversation. Could you describe the condition more clearly?');
      finalizeLastBotMessage();
    } finally {
      setIsConstructing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-950" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Condition Builder
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Chat naturally to build your condition
            </p>
          </div>
        </div>
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50 dark:bg-gray-900">
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
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                  : 'bg-gray-700 dark:bg-gray-600'
              }`}
            >
              {message.type === 'bot' ? (
                <Bot size={16} className="text-white" />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>

            <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl ${
                  message.type === 'bot'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">$1</code>')
                      .replace(/^• (.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-blue-600">•</span><span>$1</span></div>')
                  }}
                />
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-600 dark:bg-blue-400 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="inline-block px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
              <Loader className="animate-spin text-blue-600 dark:text-blue-400" size={18} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the condition you want to create..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all"
              style={{ minHeight: '48px', maxHeight: '200px' }}
              rows={1}
              disabled={isLoading}
              aria-label="Chat message input"
            />
          </div>

          <button
            onClick={handleConstruct}
            disabled={isConstructing || conversationHistory.length < 2 || isLoading}
            className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-medium flex items-center gap-2 whitespace-nowrap"
            aria-label="Construct condition"
            title="Extract condition from conversation"
          >
            {isConstructing ? (
              <>
                <Loader className="animate-spin" size={18} />
                <span className="hidden sm:inline">Constructing...</span>
              </>
            ) : (
              <>
                <Zap size={18} />
                <span className="hidden sm:inline">Construct</span>
              </>
            )}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs font-mono">Enter</kbd> to send
          </p>
          <p>
            {conversationHistory.filter(m => m.role === 'user').length} message{conversationHistory.filter(m => m.role === 'user').length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
