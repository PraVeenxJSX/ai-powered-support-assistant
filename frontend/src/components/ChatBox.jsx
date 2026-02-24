import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCcw, Loader2 } from 'lucide-react';
import { chatAPI } from '../services/api';

const ChatBox = ({ sessionId, messages, setMessages, startNewChat }) => {
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');

        // Optimistic UI update
        const newUserMessage = { id: Date.now(), role: 'user', content: userMsg, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);

        try {
            const { reply } = await chatAPI.sendMessage(sessionId, userMsg);
            const newAiMessage = { id: Date.now() + 1, role: 'assistant', content: reply, created_at: new Date().toISOString() };
            setMessages(prev => [...prev, newAiMessage]);
        } catch (error) {
            console.error("Failed to send msg:", error);
            // Add error message to UI
            const errorMsg = { id: Date.now() + 1, role: 'assistant', content: "⚠️ Sorry, I encountered an error. Please try again later.", created_at: new Date().toISOString() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">

            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-700/50 bg-slate-800/40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Bot className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-100">AI Support Assistant</h2>
                        <p className="text-xs text-slate-400">Session: {sessionId.substring(0, 8)}...</p>
                    </div>
                </div>
                <button
                    onClick={startNewChat}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors text-sm font-medium text-slate-200"
                    title="Start a new conversation"
                >
                    <RefreshCcw className="w-4 h-4" />
                    <span className="hidden sm:inline">New Chat</span>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 animate-fade-in-up">
                        <Bot className="w-16 h-16 text-slate-600/50" />
                        <p className="text-lg font-medium text-slate-400">How can I help you today?</p>
                        <p className="text-sm max-w-sm text-center">Ask me anything about our products, billing, or technical support.</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={msg.id || idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                        >
                            <div className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                {/* Avatar */}
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 border
                  ${msg.role === 'user'
                                        ? 'bg-slate-700/80 border-slate-600 text-slate-300'
                                        : 'bg-blue-500/20 border-blue-500/30 text-blue-400'}`}
                                >
                                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                </div>

                                {/* Message Bubble */}
                                <div className={`px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-tr-sm'
                                        : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-sm'}`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                    {msg.created_at && (
                                        <span className={`text-[10px] block mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start animate-fade-in-up">
                        <div className="flex gap-3 max-w-[85%] sm:max-w-[75%] flex-row">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mt-1 border border-blue-500/30 text-blue-400">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="px-5 py-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 rounded-tl-sm flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full typing-dot"></div>
                                <div className="w-2 h-2 rounded-full typing-dot"></div>
                                <div className="w-2 h-2 rounded-full typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800/60 border-t border-slate-700/50">
                <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-4xl mx-auto">
                    <div className="relative flex-1">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            placeholder="Type your message here..."
                            className="w-full bg-slate-900/50 border border-slate-600/50 text-slate-100 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none min-h-[52px] max-h-32 transition-all placeholder:text-slate-500"
                            rows={1}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="flex-shrink-0 mb-0.5 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-800"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[11px] text-slate-500">AI Support Assistant can make mistakes. Verify important information.</p>
                </div>
            </div>

        </div>
    );
};

export default ChatBox;
