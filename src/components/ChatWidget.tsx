import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';

interface Message {
  id?: number;
  sessionId: string;
  sender: 'buyer' | 'seller';
  content: string;
  timestamp: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate or get session ID
    let currentSessionId = localStorage.getItem('buyer_session_id');
    if (!currentSessionId) {
      currentSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('buyer_session_id', currentSessionId);
    }
    setSessionId(currentSessionId);

    // Fetch previous messages
    fetch(`/api/messages/${currentSessionId}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Failed to fetch messages:', err));

    // Connect socket
    socketRef.current = io();

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join_session', currentSessionId);
    });

    socketRef.current.on('new_message', (msg: Message) => {
      setMessages(prev => {
        // Prevent duplicate messages
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current || !sessionId) return;

    const messageData = {
      sessionId,
      sender: 'buyer',
      content: inputValue.trim(),
    };

    socketRef.current.emit('send_message', messageData);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white flex flex-col w-80 sm:w-96 h-[500px] shadow-2xl border border-slate-200 rounded-2xl overflow-hidden mb-4 transition-all duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <h3 className="text-sm font-bold text-slate-900">Owner Messaging</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase hidden sm:inline">Typically replies in 1hr</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors ml-2 font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#f1f3f5]">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 px-4">
                <span className="text-2xl mb-2">💬</span>
                <p className="text-xs">Have a question about the truck? Send me a message directly here.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isBuyer = msg.sender === 'buyer';
                
                return (
                  <div key={msg.id || index} className={`flex flex-col gap-1 max-w-[85%] ${isBuyer ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div 
                      className={`p-3 text-xs leading-relaxed shadow-sm ${
                        isBuyer 
                          ? 'bg-slate-900 text-white rounded-2xl rounded-tr-none' 
                          : 'bg-white text-slate-900 rounded-2xl rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className={`text-[10px] text-slate-400 ${isBuyer ? 'mr-1' : 'ml-1'}`}>
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form onSubmit={sendMessage} className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message to the owner..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 rounded-full text-xs border-none focus:ring-2 focus:ring-red-600 text-slate-700 outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
              >
                <span className="text-sm font-bold">➔</span>
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-3 uppercase tracking-tighter">
              Buyers are protected by our secure communication policy.
            </p>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
        </button>
      )}
    </div>
  );
}
