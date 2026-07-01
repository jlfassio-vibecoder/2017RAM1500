import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { format } from 'date-fns';
import { Send, User, Clock, CheckCircle2, MessageCircle, Settings, Users, Save, Upload } from 'lucide-react';

interface Message {
  id: number;
  sessionId: string;
  sender: 'buyer' | 'seller';
  content: string;
  timestamp: string;
  isRead: number;
}

interface Conversation {
  id: number;
  sessionId: string;
  sender: 'buyer' | 'seller';
  content: string;
  timestamp: string;
  isRead: number;
  unreadCount: number;
}

interface Inquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  message: string;
  timestamp: string;
}

interface TruckDetails {
  mileage: string;
  price: string;
  windowStickerUrl?: string;
  carfaxReportUrl?: string;
  kbbReportUrl?: string;
  smogReportUrl?: string;
  subtitle?: string;
  msrp?: string;
  sellersNoteIntro?: string;
  peaceOfMindText?: string;
  maintenanceText?: string;
  utilityTowingText?: string;
  luxuryOptionsText?: string;
  ctaText?: string;
  mechanicalIntegrityIntro?: string;
  mechanicalItem1Title?: string;
  mechanicalItem1Text?: string;
  mechanicalItem2Title?: string;
  mechanicalItem2Text?: string;
  mechanicalItem3Title?: string;
  mechanicalItem3Text?: string;
  marketValuationIntro?: string;
  marketDealerReality?: string;
  marketKbbValue?: string;
  marketThisTruck?: string;
  highlight1Title?: string;
  highlight1Text?: string;
  highlight2Title?: string;
  highlight2Text?: string;
  highlight3Title?: string;
  highlight3Text?: string;
  highlight4Title?: string;
  highlight4Text?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
}

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<'messages' | 'inquiries' | 'details'>('messages');
  
  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  
  // Inquiries state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  
  // Details state
  const [truckDetails, setTruckDetails] = useState<TruckDetails>({ 
    mileage: '', 
    price: '',
    subtitle: '',
    msrp: '',
    sellersNoteIntro: '',
    peaceOfMindText: '',
    maintenanceText: '',
    utilityTowingText: '',
    luxuryOptionsText: '',
    ctaText: '',
    mechanicalIntegrityIntro: '',
    mechanicalItem1Title: '',
    mechanicalItem1Text: '',
    mechanicalItem2Title: '',
    mechanicalItem2Text: '',
    mechanicalItem3Title: '',
    mechanicalItem3Text: '',
    marketValuationIntro: '',
    marketDealerReality: '',
    marketKbbValue: '',
    marketThisTruck: '',
    highlight1Title: '',
    highlight1Text: '',
    highlight2Title: '',
    highlight2Text: '',
    highlight3Title: '',
    highlight3Text: '',
    highlight4Title: '',
    highlight4Text: '',
    videoUrl: '',
    videoPosterUrl: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const carfaxInputRef = useRef<HTMLInputElement>(null);
  const kbbInputRef = useRef<HTMLInputElement>(null);
  const smogInputRef = useRef<HTMLInputElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setTruckDetails(prev => ({ ...prev, windowStickerUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleCarfaxUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setTruckDetails(prev => ({ ...prev, carfaxReportUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleKbbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setTruckDetails(prev => ({ ...prev, kbbReportUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSmogUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setTruckDetails(prev => ({ ...prev, smogReportUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const fetchData = async () => {
    try {
      // Fetch conversations
      const resConv = await fetch('/api/admin/conversations');
      const dataConv = await resConv.json();
      setConversations(dataConv);

      // Fetch inquiries
      const resInq = await fetch('/api/admin/inquiries');
      const dataInq = await resInq.json();
      setInquiries(dataInq);

      // Fetch truck details
      const resDetails = await fetch('/api/truck-details');
      const dataDetails = await resDetails.json();
      setTruckDetails(dataDetails);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/messages/${sessionId}`);
      const data = await res.json();
      setMessages(data);
      
      await fetch(`/api/admin/read/${sessionId}`, { method: 'POST' });
      
      setConversations(prev => prev.map(c => 
        c.sessionId === sessionId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    fetchData();

    socketRef.current = io();
    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join_admin');
    });

    socketRef.current.on('admin_new_message', (msg: Message) => {
      setConversations(prev => {
        const existingIdx = prev.findIndex(c => c.sessionId === msg.sessionId);
        let updated = [...prev];
        
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            content: msg.content,
            timestamp: msg.timestamp,
            sender: msg.sender,
            unreadCount: activeSession === msg.sessionId ? 0 : updated[existingIdx].unreadCount + 1
          };
          const [moved] = updated.splice(existingIdx, 1);
          updated.unshift(moved);
        } else {
          updated.unshift({
            id: msg.id,
            sessionId: msg.sessionId,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
            isRead: 0,
            unreadCount: activeSession === msg.sessionId ? 0 : 1
          });
        }
        return updated;
      });

      if (activeSession === msg.sessionId) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        fetch(`/api/admin/read/${msg.sessionId}`, { method: 'POST' }).catch(console.error);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [activeSession]);

  useEffect(() => {
    if (activeSession && activeTab === 'messages') {
      fetchMessages(activeSession);
    } else {
      setMessages([]);
    }
  }, [activeSession, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current || !activeSession) return;

    const messageData = {
      sessionId: activeSession,
      sender: 'seller' as 'seller' | 'buyer',
      content: inputValue.trim(),
    };

    socketRef.current.emit('send_message', messageData);
    
    const tempMsg: Message = {
      id: Date.now(),
      ...messageData,
      timestamp: new Date().toISOString(),
      isRead: 1
    };
    
    setMessages(prev => [...prev, tempMsg]);
    
    setConversations(prev => {
      const existingIdx = prev.findIndex(c => c.sessionId === activeSession);
      if (existingIdx >= 0) {
        let updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          content: tempMsg.content,
          timestamp: tempMsg.timestamp,
          sender: tempMsg.sender
        };
        const [moved] = updated.splice(existingIdx, 1);
        updated.unshift(moved);
        return updated;
      }
      return prev;
    });

    setInputValue('');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/truck-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(truckDetails)
      });
      alert('Truck details updated successfully!');
    } catch (err) {
      console.error('Failed to update details', err);
      alert('Error updating details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="font-sans bg-[#f8f9fa] min-h-screen flex flex-col h-screen text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2 rounded-lg">
              <MessageCircle size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Seller Dashboard</h1>
              <p className="text-xs text-slate-400">Manage listing & inquiries</p>
            </div>
          </div>
          
          <nav className="hidden md:flex ml-4 gap-2">
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'messages' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <MessageCircle size={16} /> Live Chat
            </button>
            <button 
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'inquiries' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Users size={16} /> Contact Forms {inquiries.length > 0 && <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{inquiries.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'details' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <Settings size={16} /> Truck Details
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <CheckCircle2 size={16} className="text-green-500" />
          System Online
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {activeTab === 'messages' && (
          <>
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Conversations</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                    <Clock size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No live chats yet.</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const isActive = activeSession === conv.sessionId;
                    return (
                      <button
                        key={conv.sessionId}
                        onClick={() => setActiveSession(conv.sessionId)}
                        className={`w-full text-left p-4 border-b border-slate-100 transition-colors flex items-start gap-3 hover:bg-slate-50 ${isActive ? 'bg-[#f1f3f5] border-l-4 border-l-slate-900 border-b-slate-100 hover:bg-[#f1f3f5]' : 'border-l-4 border-l-transparent'}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 mt-1">
                          <User size={18} />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm truncate">Buyer {conv.sessionId.slice(-4)}</span>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                              {format(new Date(conv.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {conv.sender === 'seller' ? 'You: ' : ''}{conv.content}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-1">
                            {conv.unreadCount}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* Chat Area */}
            <section className="flex-1 flex flex-col bg-slate-50">
              {activeSession ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white p-4 border-b border-slate-200 flex items-center gap-3 shadow-sm z-10 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Buyer {activeSession.slice(-4)}</h3>
                      <p className="text-xs text-gray-500">Interested in: 2017 Ram 1500 Night Edition</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
                    {messages.map((msg, index) => {
                      const isSeller = msg.sender === 'seller';
                      const showTime = index === 0 || new Date(msg.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 300000;
                      
                      return (
                        <div key={msg.id || index} className={`flex flex-col ${isSeller ? 'items-end' : 'items-start'}`}>
                          {showTime && (
                            <span className="text-xs font-medium text-gray-400 mb-2 px-1">
                              {format(new Date(msg.timestamp), 'MMM d, h:mm a')}
                            </span>
                          )}
                          <div className={`flex max-w-[70%] ${isSeller ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                            <div 
                              className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isSeller 
                                  ? 'bg-slate-900 text-white rounded-tr-none' 
                                  : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                              }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                    <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3 relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-all shadow-sm"
                      />
                      <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all flex items-center justify-center shadow-sm font-medium"
                      >
                        <Send size={18} className="mr-2" />
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <MessageCircle size={48} className="mb-4 opacity-20 text-gray-600" />
                  <p className="text-lg font-medium text-gray-500">Select a conversation</p>
                  <p className="text-sm">Choose a buyer from the sidebar to view messages</p>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'inquiries' && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Form Inquiries</h2>
              
              {inquiries.length === 0 ? (
                 <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-sm">
                   <Users size={48} className="mx-auto mb-4 opacity-20 text-gray-600" />
                   <p className="text-lg font-medium text-gray-500">No inquiries yet</p>
                   <p className="text-sm text-gray-400 mt-2">When buyers submit the contact form, they will appear here.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{inq.name}</h3>
                          <div className="flex gap-4 mt-2 text-sm text-slate-600">
                            <span className="flex items-center gap-1">📞 {inq.phone}</span>
                            <span className="flex items-center gap-1">✉️ {inq.email}</span>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                          {format(new Date(inq.timestamp), 'MMM d, yyyy • h:mm a')}
                        </span>
                      </div>
                      {inq.message && (
                        <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 italic border-l-4 border-red-600">
                          "{inq.message}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Settings className="text-slate-400" /> Manage Truck Details
                </h2>
                
                <form onSubmit={handleDetailsSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-slate-700 mb-2">Current Mileage</label>
                    <input
                      type="text"
                      id="mileage"
                      value={truckDetails.mileage}
                      onChange={(e) => setTruckDetails({...truckDetails, mileage: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-slate-900"
                      placeholder="e.g. 78,000"
                    />
                    <p className="text-xs text-slate-500 mt-2">This is displayed in the Seller's Note section.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">Asking Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">$</span>
                      </div>
                      <input
                        type="text"
                        id="price"
                        value={truckDetails.price}
                        onChange={(e) => setTruckDetails({...truckDetails, price: e.target.value})}
                        className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-slate-900"
                        placeholder="e.g. 23,900"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">This is displayed in the Seller's Note and Market Valuation sections.</p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Overview & Seller's Note</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle / Tagline</label>
                        <input type="text" value={truckDetails.subtitle || ''} onChange={e => setTruckDetails({...truckDetails, subtitle: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900" placeholder="2017 Ram 1500 Crew Cab Night Edition..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Original MSRP</label>
                        <input type="text" value={truckDetails.msrp || ''} onChange={e => setTruckDetails({...truckDetails, msrp: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900" placeholder="$59,895" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Seller's Note Intro Paragraphs</label>
                        <textarea value={truckDetails.sellersNoteIntro || ''} onChange={e => setTruckDetails({...truckDetails, sellersNoteIntro: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[100px]" placeholder="If you are looking for a fully-loaded..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Peace of Mind Guarantee Text</label>
                        <textarea value={truckDetails.peaceOfMindText || ''} onChange={e => setTruckDetails({...truckDetails, peaceOfMindText: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[100px]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Recent Maintenance Text/List</label>
                        <textarea value={truckDetails.maintenanceText || ''} onChange={e => setTruckDetails({...truckDetails, maintenanceText: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[100px]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Utility & Towing Text/List</label>
                        <textarea value={truckDetails.utilityTowingText || ''} onChange={e => setTruckDetails({...truckDetails, utilityTowingText: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[100px]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Luxury Options Text/List</label>
                        <textarea value={truckDetails.luxuryOptionsText || ''} onChange={e => setTruckDetails({...truckDetails, luxuryOptionsText: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[100px]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Call to Action Box Text</label>
                        <textarea value={truckDetails.ctaText || ''} onChange={e => setTruckDetails({...truckDetails, ctaText: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[100px]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Mechanical Integrity & Upgrades</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Section Intro Text</label>
                        <textarea value={truckDetails.mechanicalIntegrityIntro || ''} onChange={e => setTruckDetails({...truckDetails, mechanicalIntegrityIntro: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[80px]" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="text" value={truckDetails.mechanicalItem1Title || ''} onChange={e => setTruckDetails({...truckDetails, mechanicalItem1Title: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg" placeholder="Item 1 Title" />
                        <textarea value={truckDetails.mechanicalItem1Text || ''} onChange={e => setTruckDetails({...truckDetails, mechanicalItem1Text: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg min-h-[60px]" placeholder="Item 1 Text" />
                        
                        <input type="text" value={truckDetails.mechanicalItem2Title || ''} onChange={e => setTruckDetails({...truckDetails, mechanicalItem2Title: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg" placeholder="Item 2 Title" />
                        <textarea value={truckDetails.mechanicalItem2Text || ''} onChange={e => setTruckDetails({...truckDetails, mechanicalItem2Text: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg min-h-[60px]" placeholder="Item 2 Text" />
                        
                        <input type="text" value={truckDetails.mechanicalItem3Title || ''} onChange={e => setTruckDetails({...truckDetails, mechanicalItem3Title: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg" placeholder="Item 3 Title" />
                        <textarea value={truckDetails.mechanicalItem3Text || ''} onChange={e => setTruckDetails({...truckDetails, mechanicalItem3Text: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg min-h-[60px]" placeholder="Item 3 Text" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Market Valuation Context</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Intro Text</label>
                        <textarea value={truckDetails.marketValuationIntro || ''} onChange={e => setTruckDetails({...truckDetails, marketValuationIntro: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[80px]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Dealer Retail Reality Text</label>
                        <textarea value={truckDetails.marketDealerReality || ''} onChange={e => setTruckDetails({...truckDetails, marketDealerReality: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[80px]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">KBB Private Party Value Text</label>
                        <textarea value={truckDetails.marketKbbValue || ''} onChange={e => setTruckDetails({...truckDetails, marketKbbValue: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[80px]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">This Truck Text</label>
                        <textarea value={truckDetails.marketThisTruck || ''} onChange={e => setTruckDetails({...truckDetails, marketThisTruck: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900 min-h-[80px]" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Vehicle Highlights & Utility</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={truckDetails.highlight1Title || ''} onChange={e => setTruckDetails({...truckDetails, highlight1Title: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg" placeholder="Highlight 1 Title" />
                      <textarea value={truckDetails.highlight1Text || ''} onChange={e => setTruckDetails({...truckDetails, highlight1Text: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg min-h-[60px]" placeholder="Highlight 1 Text" />
                      
                      <input type="text" value={truckDetails.highlight2Title || ''} onChange={e => setTruckDetails({...truckDetails, highlight2Title: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg" placeholder="Highlight 2 Title" />
                      <textarea value={truckDetails.highlight2Text || ''} onChange={e => setTruckDetails({...truckDetails, highlight2Text: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg min-h-[60px]" placeholder="Highlight 2 Text" />
                      
                      <input type="text" value={truckDetails.highlight3Title || ''} onChange={e => setTruckDetails({...truckDetails, highlight3Title: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg" placeholder="Highlight 3 Title" />
                      <textarea value={truckDetails.highlight3Text || ''} onChange={e => setTruckDetails({...truckDetails, highlight3Text: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg min-h-[60px]" placeholder="Highlight 3 Text" />
                      
                      <input type="text" value={truckDetails.highlight4Title || ''} onChange={e => setTruckDetails({...truckDetails, highlight4Title: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg" placeholder="Highlight 4 Title" />
                      <textarea value={truckDetails.highlight4Text || ''} onChange={e => setTruckDetails({...truckDetails, highlight4Text: e.target.value})} className="px-4 py-2 border border-slate-300 rounded-lg min-h-[60px]" placeholder="Highlight 4 Text" />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Video Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Walkaround Video URL (MP4)</label>
                        <input 
                          type="text" 
                          value={truckDetails.videoUrl || ''} 
                          onChange={e => setTruckDetails({...truckDetails, videoUrl: e.target.value})} 
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900" 
                          placeholder="https://example.com/video.mp4" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Video Poster / Thumbnail URL</label>
                        <input 
                          type="text" 
                          value={truckDetails.videoPosterUrl || ''} 
                          onChange={e => setTruckDetails({...truckDetails, videoPosterUrl: e.target.value})} 
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none text-slate-900" 
                          placeholder="https://example.com/poster.jpg" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Documents</h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Window Sticker Document</label>
                      <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setTruckDetails(prev => ({ ...prev, windowStickerUrl: event.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center flex flex-col items-center hover:bg-slate-50 transition-colors cursor-pointer group mb-6"
                    >
                      {truckDetails.windowStickerUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 size={32} className="text-green-500 mb-3" />
                          <p className="text-sm font-medium text-slate-900 mb-1">Document uploaded</p>
                          <p className="text-xs text-slate-500">Click or drag here to change document</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-slate-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">Click or drag to upload original window sticker</p>
                          <p className="text-xs text-slate-500">PDF, PNG, or JPG (max. 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Carfax Report</label>
                    <input
                      type="file"
                      ref={carfaxInputRef}
                      onChange={handleCarfaxUpload}
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg"
                    />
                    <div 
                      onClick={() => carfaxInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setTruckDetails(prev => ({ ...prev, carfaxReportUrl: event.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center flex flex-col items-center hover:bg-slate-50 transition-colors cursor-pointer group mb-6"
                    >
                      {truckDetails.carfaxReportUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 size={32} className="text-green-500 mb-3" />
                          <p className="text-sm font-medium text-slate-900 mb-1">Carfax Report uploaded</p>
                          <p className="text-xs text-slate-500">Click or drag here to change report</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-slate-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">Click or drag to upload Carfax Report</p>
                          <p className="text-xs text-slate-500">PDF, PNG, or JPG (max. 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kelley Blue Book Report</label>
                    <input
                      type="file"
                      ref={kbbInputRef}
                      onChange={handleKbbUpload}
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg"
                    />
                    <div 
                      onClick={() => kbbInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setTruckDetails(prev => ({ ...prev, kbbReportUrl: event.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center flex flex-col items-center hover:bg-slate-50 transition-colors cursor-pointer group mb-6"
                    >
                      {truckDetails.kbbReportUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 size={32} className="text-green-500 mb-3" />
                          <p className="text-sm font-medium text-slate-900 mb-1">KBB Report uploaded</p>
                          <p className="text-xs text-slate-500">Click or drag here to change report</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-slate-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">Click or drag to upload KBB Report</p>
                          <p className="text-xs text-slate-500">PDF, PNG, or JPG (max. 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Smog Report</label>
                    <input
                      type="file"
                      ref={smogInputRef}
                      onChange={handleSmogUpload}
                      className="hidden"
                      accept=".pdf,image/png,image/jpeg"
                    />
                    <div 
                      onClick={() => smogInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          if (file.size > 5 * 1024 * 1024) {
                            alert("File size exceeds 5MB limit.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setTruckDetails(prev => ({ ...prev, smogReportUrl: event.target?.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center flex flex-col items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      {truckDetails.smogReportUrl ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 size={32} className="text-green-500 mb-3" />
                          <p className="text-sm font-medium text-slate-900 mb-1">Smog Report uploaded</p>
                          <p className="text-xs text-slate-500">Click or drag here to change report</p>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Upload size={20} className="text-slate-500" />
                          </div>
                          <p className="text-sm font-medium text-slate-900 mb-1">Click or drag to upload Smog Report</p>
                          <p className="text-xs text-slate-500">PDF, PNG, or JPG (max. 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      <Save size={18} />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
