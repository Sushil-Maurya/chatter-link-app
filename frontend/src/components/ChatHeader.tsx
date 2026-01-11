
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Phone, Video, MoreVertical, Users, User, ArrowLeft } from "lucide-react";
import { useTheme } from '../context/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';

interface ChatHeaderProps {
  contactName: string;
  contactStatus: string;
  contactAvatar?: string;
  isGroup?: boolean;
  onInfoClick?: () => void;
  onCallClick?: () => void;
  onVideoClick?: () => void;
  onBackClick?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  contactName,
  contactStatus,
  contactAvatar,
  isGroup = false,
  onInfoClick,
  onCallClick,
  onVideoClick,
  onBackClick
}) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-center justify-between px-4 py-2 border-b ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        {isMobile && onBackClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden mr-1" 
            onClick={onBackClick}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={contactAvatar} />
          <AvatarFallback className={`${isGroup ? 'bg-blue-500' : 'bg-gray-400'} text-white font-semibold`}>
            {isGroup ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium flex items-center gap-1">
            {contactName}
          </h3>
          <p className={`text-xs ${
            contactStatus === 'typing' 
              ? 'text-green-500' 
              : contactStatus === 'online' 
                ? 'text-green-500' 
                : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {contactStatus === 'typing' 
              ? 'typing...' 
              : contactStatus === 'online' 
                ? 'online' 
                : 'last seen recently'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onCallClick} className="cursor-pointer">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onVideoClick} className="cursor-pointer">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onInfoClick} className="cursor-pointer">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
