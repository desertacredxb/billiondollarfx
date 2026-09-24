'use client';

import React, { useState, useEffect, useRef } from 'react';
import { aiService, HistoryMessage } from '../../services/ai';
import { ChatMarkdown } from './ChatMarkdown';

const QUICK_ACTIONS = [
  'Login Issues', 'Verify KYC', 'Deposit Funds', 
  'Withdraw Funds', 'Referral Program', 'Trading Packages', 
  'Subscriptions', 'Contact Support'
];

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [messages, setMessages] = useState<HistoryMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedId = localStorage.getItem('bdfx_conv_id');
    if (savedId) {
      setConversationId(savedId);
      loadChatHistory(savedId);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const loadChatHistory = async (id: string) => {
    try {
      const res = await aiService.getHistory(id);
      if (res.success) setMessages(res.history);
    } catch (err) {
      console.error("Failed historical message reconstruction sync", err);
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: HistoryMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await aiService.sendMessage(textToSend, conversationId);
      if (data.success) {
        if (!conversationId) {
          setConversationId(data.conversationId);
          localStorage.setItem('bdfx_conv_id', data.conversationId);
        }
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: "⚠️ Connecting to server timed out. Please verify operational network conditions." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (conversationId) {
      await aiService.resetConversation(conversationId);
      localStorage.removeItem('bdfx_conv_id');
      setConversationId(undefined);
    }
    setMessages([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans antialiased text-gray-200">
      {/* Floating Entry Button Trigger */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-3">
          {showWelcome && (
            <div className="relative max-w-[260px] rounded-xl border border-[#927948] bg-[#0a0f1c] p-3 text-sm text-white shadow-xl" role="status">
              <button className="absolute right-2 top-1 text-gray-400 hover:text-white" aria-label="Dismiss welcome message" onClick={() => setShowWelcome(false)}>×</button>
              <p className="pr-4 font-semibold text-[#d6b877]">Welcome to Billion Dollar FX 👋</p>
              <p className="mt-1 text-gray-200">How can we assist you today?</p>
              <p className="mt-1 text-xs text-gray-300">We don't accept clients from the UAE.</p>
              <button className="mt-2 text-xs font-semibold text-[#d6b877] underline" onClick={() => { setShowWelcome(false); setIsOpen(true); }}>Chat with us</button>
            </div>
          )}
        <button
          onClick={() => { setShowWelcome(false); setIsOpen(true); }}
          title='BDFX AI Assistant'
          className="flex h-12 w-12 md:w-16 md:h-16 items-center justify-center rounded-full bg-gradient-to-r from-[#927948]  to-[#43340c]  hover:from-[#43340c] hover:to-[#927948] text-white shadow-2xl hover:scale-105 transition transform duration-200 focus:outline-none cursor-pointer"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
        </button>
        </div>
      )}

      {/* Main Container interface shell context */}
      {isOpen && (
        <div className="flex h-[600px] w-[400px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-gray-800 bg-[#0a0f1c] shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-6 duration-300">
          
          {/* Header Component */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#927948] to-[#7d673b] px-4 py-3.5 text-white border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-semibold tracking-wide text-white">BillionDollerFX AI</h3>
                <p className="text-[10px] text-gray-300">Official Platform Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={clearChat} title="Reset Chat" className="p-1 hover:bg-[#6c5932] rounded transition text-gray-200 cursor-pointer">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[#6c5932] rounded transition text-gray-200 cursor-pointer">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          {/* Interactive Chat Log Window Body viewport element */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1527]">
            
            {/* Standard Initialization Message */}
            <div className="flex flex-col space-y-1.5 max-w-[85%] rounded-2xl rounded-tl-none bg-[#0a0f1c] border border-gray-800 p-3.5 shadow-sm">
              <p className="text-sm text-gray-200">Hello 👋</p>
              <p className="text-sm font-medium text-[#927948]">Welcome to BillionDollerFX.</p>
              <p className="text-sm text-gray-400">I'm your AI Support Assistant. How can I help you today?</p>
              <p className="text-xs text-gray-400">We don't accept clients from the UAE.</p>
            </div>

            {/* Render loop sequence targeting current context logs array structure */}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm border ${
                  msg.role === 'user' 
                    ? 'bg-[#927948] border-[#7d673b] text-white rounded-tr-none' 
                    : 'bg-[#0a0f1c] border-gray-800 text-gray-300 rounded-tl-none'
                }`}>
                  <ChatMarkdown content={msg.content} />
                </div>
              </div>
            ))}

            {/* Simulated Stream Generation Interface Element */}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-none bg-[#0a0f1c] border border-gray-800 p-4 shadow-sm flex items-center space-x-1.5">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />
                </div>
              </div>
            )}

            {/* Context Suggestions Layer Grid rendering dynamic chip entities */}
            {messages.length === 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase mb-2">Suggested Actions</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      onClick={() => handleSend(action)}
                      className="text-xs bg-[#0a0f1c] border border-gray-800 text-gray-300 px-3 py-1.5 rounded-lg hover:border-[#927948] hover:text-[#927948] transition cursor-pointer"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Console Input Dock System */}
          <div className="border-t border-gray-800 bg-[#0a0f1c] p-3">
            <a href="https://wa.me/441157911131?text=Hello%20BDFX%2C%20I%20need%20support"
              target="_blank" rel="noopener noreferrer"
              className="mb-2 inline-block text-xs font-medium text-[#d6b877] underline">
              Continue on WhatsApp (+44 115 791 1131)
            </a>
            <div className="flex items-center space-x-2 rounded-xl border border-gray-800 px-3 py-1.5 bg-[#0d1527] focus-within:ring-2 focus-within:ring-[#927948] focus-within:border-transparent transition">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(input);
                  }
                }}
                placeholder="Ask about BillionDollerFX..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-gray-200 resize-none focus:outline-none max-h-20 placeholder-gray-600"
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading}
                className="p-1.5 rounded-lg bg-[#927948] text-white disabled:opacity-40 disabled:hover:scale-100 hover:scale-105 transition cursor-pointer"
              >
                <svg className="h-4 w-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
