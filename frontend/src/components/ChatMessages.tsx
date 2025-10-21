
import React, { useEffect, useRef, useState } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import { useTheme } from './ThemeProvider';

interface ChatMessagesProps {
  messages: Message[];
  isTyping?: boolean;
  contactName: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isTyping = false, contactName }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle scroll events to show/hide scroll to bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    // Extract date from timestamp (assuming format "10:30 AM" or "Yesterday", etc)
    let dateKey = 'Today';
    if (message.timestamp.includes('Yesterday')) {
      dateKey = 'Yesterday';
    } else if (!message.timestamp.includes('AM') && !message.timestamp.includes('PM')) {
      dateKey = message.timestamp;
    }
    
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    groupedMessages[dateKey].push(message);
  });

  // Group messages by sender to avoid showing avatar for consecutive messages
  const renderMessages = (messagesGroup: Message[]) => {
    return messagesGroup.map((message, index) => {
      // Show avatar only if it's the first message in a sequence from the same sender
      const showAvatar = index === 0 || messagesGroup[index - 1].sender !== message.sender;
      
      return (
        <MessageBubble 
          key={message.id} 
          message={message} 
          showAvatar={showAvatar}
        />
      );
    });
  };

  return (
    <div 
      ref={messagesContainerRef}
      className={`flex-1 overflow-y-auto p-4 space-y-4 relative ${
        theme === 'dark' ? 'bg-[url("/chat-bg-dark.png")]' : 'bg-[url("/chat-bg-light.png")]'
      } bg-opacity-50`}
      style={{ backgroundSize: '250px', backgroundRepeat: 'repeat' }}
    >
      {/* Render messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, messagesGroup]) => (
        <div key={date} className="space-y-2">
          <div className="flex justify-center">
            <div className={`px-3 py-1 rounded-full text-xs ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              {date}
            </div>
          </div>
          {renderMessages(messagesGroup)}
        </div>
      ))}
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="flex items-center gap-2 ml-12 animate-pulse">
          <div className={`px-4 py-3 rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } inline-block`}>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {contactName} is typing...
          </span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
      
      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          className={`absolute bottom-4 right-4 rounded-full p-2 shadow-md ${
            theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7 7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatMessages;
