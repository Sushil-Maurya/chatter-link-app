
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { cn } from "../lib/utils";
import { Check, CheckCheck, User, Users } from "lucide-react";
import { useTheme } from '../context/ThemeProvider';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'contact';
  timestamp: string;
  avatar?: string;
  senderName: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  isGroup?: boolean;
  fileUrl?: string;
  fileType?: 'image' | 'document' | 'audio' | 'video';
  fileName?: string;
}

interface MessageBubbleProps {
  message: Message;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, showAvatar = true }) => {
  const isUser = message.sender === 'user';
  const { theme } = useTheme();
  
  // Define status icon based on message status
  const StatusIcon = () => {
    if (message.status === 'read') {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    } else if (message.status === 'sent') {
      return <Check className="h-4 w-4 text-gray-400" />;
    } else if (message.status === 'failed') {
      return <span className="text-red-500 text-xs">!</span>;
    }
    return null;
  };
  
  // Render file attachment if present
  const renderFileAttachment = () => {
    if (!message.fileUrl) return null;
    
    if (message.fileType === 'image') {
      return (
        <div className="mb-1 rounded-lg overflow-hidden">
          <img src={message.fileUrl} alt={message.fileName || "Image"} className="max-w-full h-auto" />
        </div>
      );
    }
    
    if (message.fileType === 'document') {
      return (
        <div className={`flex items-center gap-2 p-3 mb-1 rounded-lg ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div className="bg-blue-100 p-2 rounded text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{message.fileName || "Document"}</p>
            <p className="text-xs text-gray-500">Click to download</p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%] animate-message-appear my-1",
      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      {showAvatar && !isUser ? (
        <Avatar className="h-8 w-8 mt-2">
          <AvatarImage src={message.avatar} />
          <AvatarFallback className={cn(
            message.isGroup
              ? theme === 'dark' ? 'bg-blue-700' : 'bg-blue-500'
              : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300',
            "text-white"
          )}>
            {message.isGroup ? <Users className="h-4 w-4" /> : message.senderName.charAt(0)}
          </AvatarFallback>
        </Avatar>
      ) : (
        !isUser && <div className="w-8" />
      )}
      <div className="space-y-1 max-w-full">
        {/* Show sender name in group chats */}
        {message.isGroup && !isUser && (
          <p className="text-xs font-medium pl-1" style={{ color: '#00BCD4' }}>
            {message.senderName}
          </p>
        )}
        
        <div className={cn(
          "px-3 py-2 rounded-lg max-w-full",
          isUser 
            ? theme === 'dark' 
              ? 'bg-primary/90 text-white rounded-tr-none' 
              : 'bg-chat-sent text-gray-800 rounded-tr-none' 
            : theme === 'dark'
              ? 'bg-gray-800 text-white rounded-tl-none'
              : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
        )}>
          {renderFileAttachment()}
          <p className="text-sm break-words">{message.text}</p>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 text-xs",
          isUser ? "justify-end pr-1" : "pl-1"
        )}>
          <span className={theme === 'dark' ? "text-gray-400" : "text-gray-500"}>
            {message.timestamp}
          </span>
          {isUser && <StatusIcon />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
