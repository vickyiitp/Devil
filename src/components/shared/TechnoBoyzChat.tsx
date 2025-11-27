import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    url: string;
  }>;
}

interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isTyping: boolean;
  input: string;
}

// allow runtime override via window.__API_URL
const runtimeChatUrl = (typeof window !== 'undefined' && (window as any).__API_URL) || import.meta.env.VITE_CHAT_API_URL;
const BACKEND_URL = runtimeChatUrl || 'http://localhost:8000';

export const TechnoBoyzChat: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    isOpen: false,
    messages: [],
    isTyping: false,
    input: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  useEffect(() => {
    if (state.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.isOpen]);

  const sendWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Yo! I'm **Techno Boyz** — your personal AI from Devil Labs. Ask me anything about Vicky's tools, projects, or services! ⚡",
      timestamp: new Date().toISOString(),
      suggestions: [
        "Show me AI tools",
        "What services do you offer?",
        "Tell me about Devil Labs"
      ]
    };
    setState(prev => ({ ...prev, messages: [welcomeMsg] }));
  };

  const toggleChat = () => {
    setState(prev => {
      const newIsOpen = !prev.isOpen;
      if (newIsOpen && prev.messages.length === 0) {
        // Send welcome message on first open
        setTimeout(sendWelcomeMessage, 300);
      }
      return { ...prev, isOpen: newIsOpen };
    });
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || state.input.trim();
    if (!textToSend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      input: '',
      isTyping: true
    }));

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: state.messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        suggestions: data.suggestions,
        actions: data.actions
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isTyping: false
      }));
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry boss, something went wrong. Try again in a sec! 🔧",
        timestamp: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isTyping: false
      }));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleActionClick = (action: { type: string; url: string }) => {
    if (action.type === 'navigate') {
      window.location.href = action.url;
    } else if (action.type === 'download') {
      window.open(action.url, '_blank');
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-accent-blue via-accent-magenta to-devil-red shadow-[0_0_30px_rgba(0,209,255,0.6)] hover:shadow-[0_0_40px_rgba(0,209,255,0.8)] transition-shadow duration-300"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open Techno Boyz chatbot"
      >
        <div className="flex items-center justify-center h-full w-full">
          {state.isOpen ? (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )}
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {state.isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md h-[calc(100vh-8rem)] sm:h-[600px] max-h-[600px] rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(11,18,32,0.95) 0%, rgba(19,7,32,0.95) 100%)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,209,255,0.3)'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-accent-blue/20 to-accent-magenta/20 border-b border-white/10 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-accent-blue to-devil-red flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-base sm:text-lg">TB</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm sm:text-base">Techno Boyz</h3>
                  <p className="text-xs text-neutral-300 truncate">Devil Labs AI Assistant</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[calc(100%-140px)] sm:h-[calc(100%-180px)] overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
              {state.messages.map((message) => (
                <div key={message.id}>
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-accent-blue to-accent-magenta text-white'
                          : 'bg-white/10 text-neutral-100 border border-white/10'
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(action)}
                          className="text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-accent-gold/20 border border-accent-gold/40 text-accent-gold hover:bg-accent-gold/30 transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 hover:bg-white/10 hover:border-accent-blue/40 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {state.isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent-blue animate-bounce [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent-magenta animate-bounce [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent-gold animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-black/40 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={state.input}
                  onChange={(e) => setState(prev => ({ ...prev, input: e.target.value }))}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 sm:px-4 py-2 text-sm sm:text-base text-white placeholder-neutral-400 focus:outline-none focus:border-accent-blue/50 transition-colors"
                  disabled={state.isTyping}
                />
                <button
                  type="submit"
                  disabled={!state.input.trim() || state.isTyping}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-accent-blue to-accent-magenta text-white text-sm sm:text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <span className="hidden sm:inline">Send</span>
                  <span className="sm:hidden">→</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
