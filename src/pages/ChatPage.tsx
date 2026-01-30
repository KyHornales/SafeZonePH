import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Send, Phone, Video, MoreVertical, Image, 
  Paperclip, ArrowLeft, Check, CheckCheck, RefreshCw
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';
import apiService from '../services/api';

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  id: number;
  participant_id: number;
  participant_name: string;
  participant_email: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
}

interface Buddy {
  id: number;
  name: string;
  email: string;
  location: string;
  points: number;
  rank: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);
  const [error, setError] = useState('');

  // Load conversations and buddies
  useEffect(() => {
    loadConversations();
    loadBuddies();
    // Refresh conversations every 5 seconds
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.participant_id);
      // Refresh messages every 3 seconds when conversation is open
      const interval = setInterval(() => {
        loadMessages(selectedConversation.participant_id, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      if (response.data) {
        setConversations(response.data);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBuddies = async () => {
    try {
      const response = await apiService.getBuddies();
      if (response.data) {
        setBuddies(response.data);
      }
    } catch (err) {
      console.error('Failed to load buddies:', err);
    }
  };

  const loadMessages = async (participantId: number, silent = false) => {
    try {
      const response = await apiService.getConversationMessages(participantId);
      if (response.data) {
        setMessages(response.data);
      }
    } catch (err) {
      if (!silent) {
        console.error('Failed to load messages:', err);
      }
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsMobileConversationOpen(true);
    loadMessages(conv.participant_id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await apiService.sendMessage(
        selectedConversation.participant_id,
        newMessage.trim()
      );

      if (response.data) {
        setMessages(prev => [...prev, response.data!]);
        setNewMessage('');
        loadConversations();
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const startNewConversation = (buddy: Buddy) => {
    const existingConv = conversations.find(c => c.participant_id === buddy.id);
    
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      const newConv: Conversation = {
        id: 0,
        participant_id: buddy.id,
        participant_name: buddy.name,
        participant_email: buddy.email,
        last_message: null,
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      };
      setSelectedConversation(newConv);
      setIsMobileConversationOpen(true);
      setMessages([]);
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] md:h-[calc(100vh-180px)]">
        <div className="card h-full flex overflow-hidden">
          {/* Conversations List */}
          <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-deep-slate/10 flex flex-col ${
            isMobileConversationOpen ? 'hidden md:flex' : 'flex'
          }`}>
            <div className="p-3 sm:p-4 border-b border-deep-slate/10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-deep-slate">Messages</h2>
                <button
                  onClick={loadConversations}
                  className="p-2 hover:bg-deep-slate/5 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4 text-deep-slate/60" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-deep-slate/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-deep-slate/60">
                  <p>Loading conversations...</p>
                </div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conv => {
                  const isSelected = selectedConversation?.participant_id === conv.participant_id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-deep-slate/5 transition-colors text-left ${
                        isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                        {conv.participant_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-deep-slate truncate">{conv.participant_name}</span>
                          <span className="text-xs text-deep-slate/40 flex-shrink-0">
                            {timeAgo(conv.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-deep-slate/60 truncate">
                            {conv.last_message || 'No messages yet'}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <p className="text-deep-slate/60 mb-4">No conversations yet</p>
                  <p className="text-sm text-deep-slate/40 mb-4">Start a conversation with a buddy:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {buddies.slice(0, 5).map(buddy => (
                      <button
                        key={buddy.id}
                        onClick={() => startNewConversation(buddy)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-primary/5 rounded-lg transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {buddy.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-deep-slate truncate">{buddy.name}</div>
                          <div className="text-xs text-deep-slate/60 truncate">{buddy.rank}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${
            !isMobileConversationOpen && !selectedConversation ? 'hidden md:flex' : 'flex'
          }`}>
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-deep-slate/10 flex items-center gap-4">
                  <button 
                    onClick={() => setIsMobileConversationOpen(false)}
                    className="md:hidden p-2 -ml-2 text-deep-slate/60 hover:text-deep-slate"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {selectedConversation.participant_name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-deep-slate">{selectedConversation.participant_name}</h3>
                    <p className="text-xs text-deep-slate/60">{selectedConversation.participant_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-deep-slate/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-deep-slate/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-deep-slate/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-sand/30">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-deep-slate/40">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isOwnMessage = message.sender_id === parseInt(user?.id || '0');
                      const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.sender_id === parseInt(user?.id || '0'));
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwnMessage && showAvatar && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                              {selectedConversation.participant_name[0]}
                            </div>
                          )}
                          {!isOwnMessage && !showAvatar && <div className="w-8" />}
                          <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isOwnMessage ? 'bg-primary text-white rounded-br-sm' : 'bg-white text-deep-slate rounded-bl-sm shadow-sm'
                            }`}>
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwnMessage ? 'text-white/60' : 'text-deep-slate/40'
                            }`}>
                              <span className="text-xs">
                                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOwnMessage && (message.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {error && (
                  <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-600 text-sm">{error}</div>
                )}

                <div className="p-4 border-t border-deep-slate/10 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    <div className="hidden sm:flex items-center gap-1">
                      <button type="button" className="p-2 text-deep-slate/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button type="button" className="p-2 text-deep-slate/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <Image className="w-5 h-5" />
                      </button>
                    </div>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-4 py-2 border border-deep-slate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="btn-primary px-4 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ minHeight: '44px' }}
                    >
                      <Send className="w-5 h-5" />
                      <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center justify-center h-full text-deep-slate/40">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Send className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-deep-slate mb-2">Select a conversation</h3>
                  <p className="text-deep-slate/60">Choose a conversation from the list or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;
