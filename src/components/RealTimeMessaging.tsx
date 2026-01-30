import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Image, 
  Smile, 
  MoreVertical,
  Phone,
  Video,
  MapPin,
  AlertTriangle,
  Check,
  CheckCheck,
  Clock,
  X,
  ChevronLeft
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'location' | 'alert';
  attachments?: {
    type: string;
    url: string;
    name?: string;
  }[];
}

interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface RealTimeMessagingProps {
  currentUserId: string;
  chatPartner: ChatUser;
  messages: Message[];
  onSendMessage: (text: string, attachments?: File[]) => void;
  onSendLocation: () => void;
  onSendAlert: () => void;
  onBack?: () => void;
  isTyping?: boolean;
  className?: string;
}

const RealTimeMessaging: React.FC<RealTimeMessagingProps> = ({
  currentUserId,
  chatPartner,
  messages,
  onSendMessage,
  onSendLocation,
  onSendAlert,
  onBack,
  isTyping = false,
  className = '',
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  const handleSend = () => {
    if (newMessage.trim() || selectedFiles.length > 0) {
      onSendMessage(newMessage.trim(), selectedFiles);
      setNewMessage('');
      setSelectedFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setShowAttachMenu(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    
    if (mins < 1) return 'Active now';
    if (mins < 60) return `Active ${mins}m ago`;
    return `Active ${Math.floor(mins / 60)}h ago`;
  };

  const renderMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-deep-slate/40" />;
      case 'sent':
        return <Check className="w-3 h-3 text-deep-slate/40" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-deep-slate/40" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary" />;
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach(message => {
      const date = message.timestamp.toLocaleDateString();
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ date, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className={`flex flex-col h-full bg-warm-sand ${className}`}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1 -ml-1 lg:hidden">
              <ChevronLeft className="w-6 h-6 text-deep-slate" />
            </button>
          )}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {chatPartner.avatar ? (
                <img src={chatPartner.avatar} alt={chatPartner.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-primary">{chatPartner.name.charAt(0)}</span>
              )}
            </div>
            {chatPartner.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-deep-slate">{chatPartner.name}</h3>
            <p className="text-xs text-deep-slate/60">
              {chatPartner.isOnline ? 'Online' : formatLastSeen(chatPartner.lastSeen)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-deep-slate/60">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-deep-slate/60">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-deep-slate/60">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date Divider */}
            <div className="flex items-center justify-center mb-4">
              <span className="text-xs text-deep-slate/50 bg-warm-sand px-3 py-1 rounded-full">
                {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
              </span>
            </div>

            {/* Messages in group */}
            <div className="space-y-2">
              {group.messages.map((message, index) => {
                const isOwn = message.senderId === currentUserId;
                const showAvatar = !isOwn && 
                  (index === 0 || group.messages[index - 1]?.senderId !== message.senderId);

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOwn && showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
                        {chatPartner.avatar ? (
                          <img src={chatPartner.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-primary">{chatPartner.name.charAt(0)}</span>
                        )}
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-8 mr-2" />}

                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {message.type === 'alert' ? (
                        <div className="bg-red-100 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-red-700">{message.text}</span>
                        </div>
                      ) : message.type === 'location' ? (
                        <div className="bg-primary/10 rounded-lg p-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span className="text-sm text-deep-slate">{message.text}</span>
                        </div>
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-white text-deep-slate rounded-bl-sm shadow-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                      )}

                      {/* Attachments */}
                      {message.attachments?.map((attachment, i) => (
                        <div key={i} className="mt-1">
                          {attachment.type.startsWith('image/') && (
                            <img 
                              src={attachment.url} 
                              alt="" 
                              className="max-w-[200px] rounded-lg"
                            />
                          )}
                        </div>
                      ))}

                      {/* Time & Status */}
                      <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-xs text-deep-slate/40">
                          {formatTime(message.timestamp)}
                        </span>
                        {isOwn && renderMessageStatus(message.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{chatPartner.name.charAt(0)}</span>
            </div>
            <div className="bg-white rounded-2xl px-4 py-2 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-deep-slate/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-deep-slate/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-deep-slate/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 bg-white border-t flex gap-2 overflow-x-auto">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative flex-shrink-0">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-deep-slate/40" />
                </div>
              )}
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-3">
        <div className="flex items-end gap-2">
          {/* Attachment Button */}
          <div className="relative">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2 hover:bg-gray-100 rounded-full text-deep-slate/60"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-lg border p-2 space-y-1 w-40">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  <Image className="w-4 h-4 text-primary" />
                  Photo
                </button>
                <button
                  onClick={() => {
                    onSendLocation();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </button>
                <button
                  onClick={() => {
                    onSendAlert();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm text-red-500"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Send Alert
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Text Input */}
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full bg-transparent resize-none text-sm focus:outline-none max-h-[120px]"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() && selectedFiles.length === 0}
            className={`p-2 rounded-full transition-colors ${
              newMessage.trim() || selectedFiles.length > 0
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-deep-slate/40'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMessaging;
