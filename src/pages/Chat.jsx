import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Sparkles, Zap, Trash2, Cpu, Terminal } from 'lucide-react';

const SARVAM_API_KEY = 'sk_ktwb9tvu_3sPEf22HsaZJqpO1oVhI2NPY';
const API_URL = 'https://api.sarvam.ai/v1/chat/completions';

const TypingEffect = ({ text, onComplete, scrollToBottom }) => {
    const [display, setDisplay] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        let i = 0;
        const speed = 5; // Ultra fast typing speed

        // Initial delay for realism
        const startDelay = setTimeout(() => {
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplay(text.substring(0, i + 1));
                    i++;
                    if (scrollToBottom) scrollToBottom();
                } else {
                    clearInterval(timer);
                    setIsTyping(false);
                    if (onComplete) onComplete();
                }
            }, speed);

            return () => clearInterval(timer);
        }, 50);

        return () => clearTimeout(startDelay);
    }, [text]);

    return (
        <span className="relative">
            {display}
            {isTyping && (
                <span className="inline-block w-2 h-5 ml-1 bg-primary align-middle animate-pulse shadow-[0_0_10px_rgba(222,28,28,0.8)]" />
            )}
        </span>
    );
};

const Chat = () => {
    const [messages, setMessages] = useState([
        { role: 'system', content: 'You are a helpful AI assistant powered by Sarvam AI.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { role: 'user', content: inputValue.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SARVAM_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'sarvam-m',
                    messages: [...messages, userMessage].filter(m => m.role !== 'system' || m === messages[0]),
                    max_tokens: 1000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message;

            setMessages(prev => [...prev, { ...assistantMessage, isNew: true }]);

        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Error: ${err.message || 'Something went wrong.'} Please try again.`,
                isError: true,
                isNew: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'system', content: 'You are a helpful AI assistant powered by Sarvam AI.' }]);
    };

    return (
        <div className="min-h-screen pt-24 pb-8 px-4 md:px-8 max-w-6xl mx-auto flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 z-10 flex flex-col md:flex-row items-center justify-between gap-4"
            >
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 flex items-center justify-center md:justify-start gap-3">
                        <Cpu className="w-8 h-8 text-primary animate-pulse" />
                        Sarvam <span className="text-primary">Furiouss</span>
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2 justify-center md:justify-start">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="font-mono text-xs tracking-wider">SYSTEM_ONLINE • MODEL: SARVAM-M</span>
                    </div>
                </div>

                <button
                    onClick={clearChat}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-gray-400 hover:text-white text-sm backdrop-blur-md group"
                >
                    <Trash2 className="w-4 h-4 group-hover:text-primary transition-colors" /> Clear Context
                </button>
            </motion.div>

            <div className="flex-1 bg-black/40 border border-white/10 rounded-[2rem] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-10">
                {/* Decorative Grid */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {messages.length === 1 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-80"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/10 flex items-center justify-center relative z-10">
                                    <Sparkles className="w-10 h-10 text-primary" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2 font-mono">INITIALIZING INTERFACE</h2>
                                <p className="text-gray-400 max-w-sm">
                                    Sarvam AI Neural Link Established.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence mode="popLayout">
                        {messages.filter(m => m.role !== 'system').map((msg, idx) => {
                            const isUser = msg.role === 'user';
                            const isNew = msg.isNew;
                            // Only animate if it's new and from assistant. 
                            // Using a key hack to force static render after initial load if needed, but simple boolean is simpler.

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden ${isUser
                                        ? 'bg-gradient-to-br from-primary to-red-600 text-white border border-primary/50'
                                        : msg.isError
                                            ? 'bg-red-900/50 text-red-400 border border-red-500/30'
                                            : 'bg-black/50 text-purple-400 border border-purple-500/50'
                                        }`}>
                                        {!isUser && <div className="absolute inset-0 bg-purple-500/20 animate-pulse" />}
                                        {isUser ? <User className="w-5 h-5 relative z-10" /> : <Bot className="w-5 h-5 relative z-10" />}
                                    </div>
                                    <div className={`relative max-w-[85%] p-5 rounded-2xl shadow-lg backdrop-blur-sm overflow-hidden ${isUser
                                        ? 'bg-primary/10 border border-primary/20 text-gray-100 rounded-tr-none'
                                        : msg.isError
                                            ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none'
                                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none group hover:border-purple-500/30 transition-colors'
                                        }`}>
                                        {/* Cinematic edge glow for AI messages */}
                                        {!isUser && !msg.isError && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent pointer-events-none" />
                                        )}

                                        <div className="relative z-10 text-[0.95rem] font-medium tracking-wide leading-relaxed">
                                            {!isUser && isNew && !msg.isError ? (
                                                <TypingEffect text={msg.content} scrollToBottom={scrollToBottom} />
                                            ) : (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-4"
                        >
                            <div className="w-10 h-10 rounded-full bg-black/50 text-purple-400 border border-purple-500/50 flex items-center justify-center shrink-0 shadow-lg">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-3 items-center backdrop-blur-md">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-6 bg-purple-500/50 rounded-sm animate-pulse" style={{ animationDuration: '1s' }} />
                                    <span className="w-1.5 h-6 bg-purple-500/50 rounded-sm animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.2s' }} />
                                    <span className="w-1.5 h-6 bg-purple-500/50 rounded-sm animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.4s' }} />
                                </div>
                                <span className="text-xs font-mono text-purple-300 tracking-widest animate-pulse">PROCESSING_REQUEST</span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 border-t border-white/10 bg-black/60 backdrop-blur-xl">
                    <form onSubmit={handleSendMessage} className="relative flex gap-3 max-w-5xl mx-auto">
                        <div className="relative flex-1 group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter command or query..."
                                className="relative w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-4 pl-6 pr-4 focus:outline-none focus:border-white/20 focus:bg-black/50 transition-all font-mono text-sm"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className={`aspect-square flex items-center justify-center rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(222,28,28,0.2)] hover:shadow-[0_0_30px_rgba(222,28,28,0.4)] ${!inputValue.trim() || isLoading
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                                : 'bg-primary text-white hover:scale-110 active:scale-95'
                                }`}
                        >
                            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chat;
