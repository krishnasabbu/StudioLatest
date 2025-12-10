import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, Zap } from 'lucide-react';
import { Variable } from '../types/template';
import { chatWithLLM, manipulateHTMLWithLLM, ConversationMessage, HTMLManipulationRequest } from '../services/llmService';

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  content: string;
  isStreaming?: boolean;
  timestamp: Date;
}

interface EditorChatPanelProps {
  variables: Variable[];
  currentHTML: string;
  onHTMLUpdate: (html: string) => void;
  onVariablesUpdate: (variables: Variable[]) => void;
}

export default function EditorChatPanel({
  variables,
  currentHTML,
  onHTMLUpdate,
  onVariablesUpdate,
}: EditorChatPanelProps) {
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
    const welcomeMessage = `Hi! I'm your AI assistant for editing email templates.

I can help you:
• **Create dynamic variables** - Replace text with placeholders
• **Add conditions** - Show/hide content based on logic
• **Modify HTML structure** - Edit your template naturally

**Available variables:** ${variables.length > 0 ? variables.map(v => `\`${v.name}\``).join(', ') : 'None yet'}

**Examples:**
• "Replace 'John' with a firstName variable"
• "Add a condition to show premium content only for VIP users"
• "Create a variable for the user's account balance"

What would you like to do?`;

    addBotMessage(welcomeMessage, false);

    const systemMessage: ConversationMessage = {
      role: 'system',
      content: `You are an intelligent assistant helping users modify HTML email templates.

You can:
1. Create dynamic variables by identifying content that should be replaced
2. Add conditional logic to show/hide sections
3. Modify HTML structure based on natural language requests

Available variables: ${variables.map(v => `${v.name} (${v.type})`).join(', ')}

Be conversational and guide users through their requests. Ask clarifying questions when needed.`
    };
    setConversationHistory([systemMessage]);
  }, []);

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
    updateLastBotMessage('🔍 Analyzing your request and modifying the HTML template...');

    try {
      const lastUserMessage = conversationHistory
        .filter(m => m.role === 'user')
        .pop()?.content || '';

      const request: HTMLManipulationRequest = {
        userRequest: lastUserMessage,
        currentHTML,
        variables,
        conversationHistory,
      };

      let explanationText = '';
      const result = await manipulateHTMLWithLLM(request, (chunk) => {
        explanationText = chunk;
      });

      if (result.success && result.updatedHTML) {
        const summary = `✅ **Template Updated Successfully!**

${result.explanation || 'I\'ve modified your HTML template based on your request.'}

**Changes applied:**
${result.newVariables && result.newVariables.length > 0
  ? `\n• Added ${result.newVariables.length} new variable${result.newVariables.length > 1 ? 's' : ''}: ${result.newVariables.map(v => `\`${v.name}\``).join(', ')}`
  : ''}

The editor has been updated with your changes!`;

        updateLastBotMessage(summary);
        finalizeLastBotMessage();

        setTimeout(() => {
          onHTMLUpdate(result.updatedHTML!);

          if (result.newVariables && result.newVariables.length > 0) {
            const updatedVariables = [...variables];
            result.newVariables.forEach(newVar => {
              if (!updatedVariables.find(v => v.name === newVar.name)) {
                updatedVariables.push({
                  id: Date.now().toString() + Math.random(),
                  name: newVar.name,
                  type: newVar.type || 'string',
                  description: newVar.description || '',
                });
              }
            });
            onVariablesUpdate(updatedVariables);
          }
        }, 500);
      } else {
        updateLastBotMessage(
          `⚠️ I had trouble modifying the template.

${result.error || 'Please try rephrasing your request or providing more details about what you\'d like to change.'}

**Tips:**
• Be specific about which text or section to modify
• Mention variable names clearly
• Describe the condition logic in detail`
        );
        finalizeLastBotMessage();
      }
    } catch (error) {
      console.error('Error constructing template:', error);
      updateLastBotMessage('❌ Sorry, I encountered an error while processing your request. Please try again.');
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white dark:bg-slate-900">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                message.type === 'bot'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700'
                  : 'bg-gradient-to-br from-wf-red to-red-700'
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
                className={`inline-block max-w-[85%] ${
                  message.type === 'bot'
                    ? 'text-gray-900 dark:text-slate-100'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl shadow-md'
                }`}
              >
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                      .replace(/`(.*?)`/g, '<code class="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded text-xs font-mono border border-gray-200 dark:border-slate-700">$1</code>')
                      .replace(/^• (.+)$/gm, '<div class="flex items-start gap-2 my-1.5"><span class="text-blue-500 dark:text-blue-400 font-bold">•</span><span>$1</span></div>')
                  }}
                />
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse rounded" />
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-sm">
              <Bot size={16} className="text-white" />
            </div>
            <div className="inline-block">
              <Loader className="animate-spin text-blue-500 dark:text-blue-400" size={18} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl mx-4 mb-4 border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to change in your template..."
            className="w-full pl-5 pt-5 pr-16 pb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-xl resize-none text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-500 bg-transparent text-sm"
            style={{ minHeight: '80px', maxHeight: '400px', overflowY: 'hidden' }}
            disabled={isLoading}
            aria-label="Chat message input"
          />
        </div>

        <div className="flex justify-between items-center text-sm px-4 pb-4 pt-2 gap-3">
          <div className="flex gap-2 items-center min-w-0 flex-shrink">
            <div className="flex items-center text-xs text-gray-500 dark:text-slate-400 font-medium">
              {conversationHistory.filter(m => m.role === 'user').length} message{conversationHistory.filter(m => m.role === 'user').length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex-1 hidden sm:block"></div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleConstruct}
              disabled={isConstructing || conversationHistory.length < 2 || isLoading}
              className="rounded-lg px-4 h-9 flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-sm"
              aria-label="Apply changes"
            >
              {isConstructing ? (
                <>
                  <Loader className="animate-spin" size={14} />
                  <span className="hidden sm:inline">Applying...</span>
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
              className="flex justify-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 shrink-0 items-center size-9 shadow-sm"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
