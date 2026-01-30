import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Send, Phone, Video, MoreVertical, Image, 
  Paperclip, Smile, ArrowLeft, Check, CheckCheck
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { mockConversations, mockBuddies } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';
import { Message, Conversation, Buddy } from '../types';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);

  const filteredConversations = mockConversations.filter(conv => {
    const buddy = mockBuddies.find(b => b.id === conv.participantId);
    return buddy?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsMobileConversationOpen(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user!.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate reply after 1-2 seconds
    setTimeout(() => {
      const replyMessage: Message = {
        id: `msg-${Date.now()}-reply`,
        senderId: selectedConversation.participantId,
        content: getRandomReply(),
        timestamp: new Date().toISOString(),
        read: false,
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1500);
  };

  const getRandomReply = () => {
    const replies = [
      "Salamat sa message! 😊",
      "Noted po! I'll get back to you soon.",
      "Okay po, maraming salamat!",
      "That sounds good! Let me check.",
      "Ingat palagi! 💪",
      "Sure, I can help with that.",
      "Naintindihan ko na po. Thank you!",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const getBuddy = (participantId: string): Buddy | undefined => {
    return mockBuddies.find(b => b.id === participantId);
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] md:h-[calc(100vh-180px)]">
        <div className="card h-full flex overflow-hidden">
          {/* Conversations List */}
          <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-deep-slate/10 flex flex-col ${
            isMobileConversationOpen ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-deep-slate/10">
              <h2 className="font-display text-lg sm:text-xl font-bold text-deep-slate mb-3 sm:mb-4">Messages</h2>
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

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map(conv => {
                const buddy = getBuddy(conv.participantId);
                const lastMessage = conv.messages[conv.messages.length - 1];
                const isSelected = selectedConversation?.id === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-deep-slate/5 transition-colors text-left ${
                      isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {buddy?.name[0]}
                      </div>
                      {buddy?.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-deep-slate truncate">{buddy?.name}</span>
                        <span className="text-xs text-deep-slate/40 flex-shrink-0">
                          {timeAgo(lastMessage?.timestamp || conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-deep-slate/60 truncate">{lastMessage?.content}</p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-deep-slate/60">
                  <p>No conversations found</p>
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
                {/* Chat Header */}
                <div className="p-4 border-b border-deep-slate/10 flex items-center gap-4">
                  <button 
                    onClick={() => setIsMobileConversationOpen(false)}
                    className="md:hidden p-2 -ml-2 text-deep-slate/60 hover:text-deep-slate"
                    title="Go back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {getBuddy(selectedConversation.participantId)?.name[0]}
                    </div>
                    {getBuddy(selectedConversation.participantId)?.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-deep-slate">
                      {getBuddy(selectedConversation.participantId)?.name}
                    </h3>
                    <p className="text-xs text-deep-slate/60 capitalize">
                      {getBuddy(selectedConversation.participantId)?.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-deep-slate/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Voice call">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-deep-slate/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Video call">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-deep-slate/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="More options">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-warm-sand/30">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.senderId === user?.id;
                    const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.senderId === user?.id);

                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwnMessage && showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                            {getBuddy(selectedConversation.participantId)?.name[0]}
                          </div>
                        )}
                        {!isOwnMessage && !showAvatar && <div className="w-8" />}
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-white text-deep-slate rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            isOwnMessage ? 'text-white/60' : 'text-deep-slate/40'
                          }`}>
                            <span className="text-xs">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isOwnMessage && (
                              message.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-deep-slate/10 bg-white">
                  <div className="flex items-center gap-2">
                    <button type="button" className="p-2 text-deep-slate/40 hover:text-primary transition-colors" title="Attach file">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-deep-slate/40 hover:text-primary transition-colors" title="Send image">
                      <Image className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 input-field py-2"
                    />
                    <button type="button" className="p-2 text-deep-slate/40 hover:text-primary transition-colors" title="Add emoji">
                      <Smile className="w-5 h-5" />
                    </button>
                    <button 
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-20 h-20 rounded-full bg-deep-slate/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-10 h-10 text-deep-slate/40" />
                  </div>
                  <h3 className="font-bold text-xl text-deep-slate mb-2">Your Messages</h3>
                  <p className="text-deep-slate/60 max-w-sm">
                    Select a conversation to start chatting with your buddies
                  </p>
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
