import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, X, Zap } from 'lucide-react';
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 400)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  return (
    <div className="flex flex-col h-full bg-[#0e0e0e]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-[#e8e8e8]">
            AI Condition Builder
          </h3>
        </div>
        {!hideCloseButton && (
          <button
            onClick={onClose}
            className="p-2 text-[#a0a0a0] hover:text-[#e8e8e8] hover:bg-[#1a1a1a] rounded-lg transition-colors"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#0e0e0e]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                message.type === 'bot'
                  ? 'bg-[#1a1a1a] border border-[#2a2a2a]'
                  : 'bg-[#2563eb]'
              }`}
            >
              {message.type === 'bot' ? (
                <Bot size={14} className="text-[#e8e8e8]" />
              ) : (
                <User size={14} className="text-white" />
              )}
            </div>

            <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`inline-block max-w-[85%] ${
                  message.type === 'bot'
                    ? 'text-[#e8e8e8]'
                    : 'bg-[#2563eb] text-white px-4 py-2.5 rounded-2xl'
                }`}
              >
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 bg-[#1a1a1a] rounded text-xs font-mono border border-[#2a2a2a]">$1</code>')
                      .replace(/^• (.+)$/gm, '<div class="flex items-start gap-2 my-1"><span class="text-[#2563eb]">•</span><span>$1</span></div>')
                  }}
                />
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-[#2563eb] animate-pulse" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
              <Bot size={14} className="text-[#e8e8e8]" />
            </div>
            <div className="inline-block">
              <Loader className="animate-spin text-[#2563eb]" size={16} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-[#171717] rounded-lg mx-4 mb-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="How can I help you build a condition? (or describe your logic)"
            className="w-full pl-5 pt-5 pr-16 pb-3 focus:outline-none resize-none text-[#e8e8e8] placeholder-[#6b6b6b] bg-transparent text-sm"
            style={{ minHeight: '80px', maxHeight: '400px', overflowY: 'hidden' }}
            disabled={isLoading}
            aria-label="Chat message input"
          />
        </div>

        <div className="flex justify-between items-center text-sm px-3 pb-3 pt-2 gap-2">
          <div className="flex gap-2 items-center min-w-0 flex-shrink">
            <div className="flex items-center text-xs text-[#6b6b6b]">
              {conversationHistory.filter(m => m.role === 'user').length} message{conversationHistory.filter(m => m.role === 'user').length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex-1 hidden sm:block"></div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleConstruct}
              disabled={isConstructing || conversationHistory.length < 2 || isLoading}
              className="rounded-full px-3 h-7 flex items-center gap-1.5 text-xs bg-[#10b981] hover:brightness-110 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              aria-label="Construct condition"
            >
              {isConstructing ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span className="hidden sm:inline">Constructing...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span className="hidden sm:inline">Construct</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="flex justify-center bg-[#2563eb] hover:brightness-110 text-white rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-50 shrink-0 items-center p-1 size-7"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
