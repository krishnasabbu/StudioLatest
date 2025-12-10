import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, Sparkles, X, Zap, CheckCircle2, MessageCircle } from 'lucide-react';
import { Variable, ConditionClause, ConditionOperator, LogicOperator } from '../types/template';
import { chatWithLLM, analyzeConversationForCondition } from '../services/llmService';

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
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [showConstructButton, setShowConstructButton] = useState(false);
  const [isConstructing, setIsConstructing] = useState(false);

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
      `Hi! I'm your AI assistant for creating email template conditions. I can help you build conditions using natural language. Just tell me what you want to check for!\n\nFor example, you could say:\n• "Show this content if the user is a premium customer"\n• "Only display this if accountStatus equals active"\n• "Hide this section when isPremiumUser is false"`,
      false
    );

    const systemMessage = {
      role: 'system',
      content: `You are an intelligent assistant helping users create conditional logic for email templates. The user has these variables available: ${variables.map(v => v.name).join(', ')}.

Your job is to:
1. Understand what condition the user wants to create using natural language
2. Extract the variable name, operator, and value from their description
3. Help them refine the condition if needed
4. Ask clarifying questions when unclear

Be conversational, helpful, and guide them through the process naturally. When they describe a condition, acknowledge it and help them build it step by step.`
    };
    setConversationHistory([systemMessage]);
  }, [variables]);

  useEffect(() => {
    if (messageCount >= 3) {
      setShowConstructButton(true);
    }
  }, [messageCount]);

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
    setMessageCount(prev => prev + 1);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    addUserMessage(userMessage);
    setInput('');
    setIsLoading(true);

    const userMsg = { role: 'user', content: userMessage };
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

      const assistantMsg = { role: 'assistant', content: accumulatedResponse };
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
    if (isConstructing) return;

    setIsConstructing(true);
    addBotMessage('', true);
    updateLastBotMessage('🔍 Analyzing our conversation to extract the condition...');

    try {
      const analysisResult = await analyzeConversationForCondition(conversationHistory, variables);

      if (analysisResult.success && analysisResult.condition) {
        updateLastBotMessage(
          `✅ Perfect! I've extracted your condition:\n\n**Name:** ${analysisResult.condition.name}\n**Description:** ${analysisResult.condition.description}\n\n**Condition Logic:**\n${analysisResult.condition.clauses.map((c, i) => `${i + 1}. ${c.variable} ${c.operator} "${c.value}"`).join('\n')}\n\nApplying this condition now...`
        );
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
          `⚠️ I need more information to create the condition. Please tell me:\n\n1. What variable do you want to check?\n2. What comparison do you want to make?\n3. What value should it be compared against?\n\nFor example: "Check if isPremiumUser equals true"`
        );
        finalizeLastBotMessage();
      }
    } catch (error) {
      console.error('Error constructing condition:', error);
      updateLastBotMessage('Sorry, I had trouble analyzing the conversation. Could you describe the condition more clearly?');
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

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageCircle className="text-purple-600" size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              AI Condition Builder
              <Sparkles className="text-purple-500 animate-pulse" size={16} />
            </h3>
            <p className="text-xs text-gray-500">Chat naturally to build your condition</p>
          </div>
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

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 animate-fade-in ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                message.type === 'bot'
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                  : 'bg-gradient-to-br from-gray-700 to-gray-900 text-white'
              }`}
            >
              {message.type === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>

            <div className={`flex-1 ${message.type === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`inline-block max-w-[85%] p-4 rounded-2xl shadow-md ${
                  message.type === 'bot'
                    ? 'bg-white border border-gray-200 text-gray-800'
                    : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                {message.isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-purple-600 animate-pulse" />
                )}
              </div>
              <p className={`text-xs text-gray-400 mt-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-md">
              <Bot size={20} />
            </div>
            <div className="inline-block p-4 rounded-2xl bg-white border border-gray-200 shadow-md">
              <Loader className="animate-spin text-purple-600" size={20} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showConstructButton && (
        <div className="px-6 pb-4">
          <button
            onClick={handleConstruct}
            disabled={isConstructing}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
              isConstructing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 animate-pulse-subtle'
            }`}
          >
            {isConstructing ? (
              <>
                <Loader className="animate-spin" size={20} />
                Constructing...
              </>
            ) : (
              <>
                <Zap size={20} />
                Construct Condition from Chat
                <CheckCircle2 size={20} />
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">
            Click to automatically extract condition from conversation
          </p>
        </div>
      )}

      <div className="p-4 bg-white border-t shadow-lg">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe the condition you want to create..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm transition-all"
            disabled={isLoading}
            aria-label="Chat message input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> to send
          </p>
          <p className="text-xs text-gray-400">
            {messageCount} message{messageCount !== 1 ? 's' : ''} exchanged
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes pulse-subtle {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s infinite;
        }
      `}</style>
    </div>
  );
}
