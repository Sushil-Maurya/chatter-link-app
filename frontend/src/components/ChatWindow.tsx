import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useTheme } from '../context/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { useChatStore } from '../stores/useChatStore';
import { useUserStore } from '../stores/useUserStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Message as UIMessage } from './MessageBubble';

interface ChatWindowProps {
  contactId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contactId }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const { messages: storeMessages, getMessages, sendMessage, subscribeToMessages, unsubscribeFromMessages, isMessagesLoading, setActiveConversation, typingUsers } = useChatStore();
  const { users } = useUserStore();
  const { authUser } = useAuthStore();
  
  const contact = users.find(u => u._id === contactId);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  
  // Derive typing status from store
  const isTyping = Boolean(contactId && typingUsers[contactId]?.has(contactId));

  useEffect(() => {
    setActiveConversation(contactId);
    getMessages(contactId);
    subscribeToMessages();

    return () => {
      unsubscribeFromMessages();
      setActiveConversation(null);
    };
  }, [contactId, getMessages, subscribeToMessages, unsubscribeFromMessages, setActiveConversation]);
  
  // Map store messages to UI messages
  const uiMessages: UIMessage[] = storeMessages.map(msg => {
    let fileUrl = undefined;
    let fileType: 'image' | 'video' | undefined = undefined;
    
    if (msg.image) {
      fileUrl = msg.image;
      fileType = 'image';
    } else if (msg.video) {
      fileUrl = msg.video;
      fileType = 'video';
    }

    return {
      id: parseInt(msg._id.substring(0, 8), 16) || Date.now(), // Fallback ID conversion
      text: msg.text,
      sender: msg.sender === authUser?._id ? 'user' : 'contact',
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderName: msg.sender === authUser?._id ? 'You' : contact?.name || 'Contact',
      status: msg.read ? 'read' : 'delivered',
      isGroup: false,
      fileUrl,
      fileType
    };
  });

  const isLoading = isMessagesLoading;
  const loadError = !contact ? "Contact not found" : null;
  
  const handleSendMessage = async (text: string, file?: File) => {
    if (!contact) return;
    
    // Create new message payload expected by backend
    const newMessageData = {
      text,
      image: null // Handle image upload later
    };
    
    try {
      await sendMessage(newMessageData);
    } catch (error) {
       console.error("Failed to send message", error);
    }
  };

  const handleInfoClick = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  const handleCallClick = () => {
    toast({
      title: "Feature Unavailable",
      description: "Audio calls are coming soon!",
    });
  };

  const handleVideoClick = () => {
    toast({
      title: "Feature Unavailable",
      description: "Video calls are coming soon!",
    });
  };
  
  const handleBackClick = () => {
    navigate('/chat');
  };

  if (isLoading && storeMessages.length === 0) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadError || !contact) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
      }`}>
        <div className="text-center p-8">
          <h3 className="text-xl font-medium mb-4">Error Loading Chat</h3>
          <p className="mb-6">{loadError || "Contact information could not be loaded"}</p>
          <Button onClick={() => navigate("/chat")}>
            Return to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        contactName={contact.name} 
        contactStatus={isTyping ? 'typing' : (contact.online ? 'online' : 'offline')} 
        contactAvatar={contact.profilePic || undefined}
        isGroup={false}
        onInfoClick={handleInfoClick}
        onCallClick={handleCallClick}
        onVideoClick={handleVideoClick}
        onBackClick={isMobile ? handleBackClick : undefined}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatMessages 
            messages={uiMessages} 
            isTyping={isTyping}
            contactName={contact.name}
          />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
        
        {/* Right Info Panel (optional) */}
        {isInfoOpen && (
          <div className={`w-80 border-l flex flex-col ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 border-b flex flex-col items-center">
              <div className="mb-4">
                <img 
                  src={contact.profilePic || "https://via.placeholder.com/150"} 
                  alt={contact.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">{contact.name}</h3>
              <p className={`text-sm ${contact.online ? 'text-green-500' : 'text-gray-500'}`}>
                {contact.online ? 'Online' : 'Offline'}
              </p>
            </div>
            
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium mb-2">About</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contact.bio || "Hey there! I'm using ChatterLink."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
