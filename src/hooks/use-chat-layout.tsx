
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export function useChatLayout() {
  const isMobile = useIsMobile();
  const [isSidebarVisible, setIsSidebarVisible] = useState(!isMobile);
  const [isChatVisible, setIsChatVisible] = useState(!isMobile);
  
  // Update visibility states when mobile status changes
  useEffect(() => {
    if (isMobile) {
      // On mobile, show sidebar by default, hide chat
      setIsSidebarVisible(true);
      setIsChatVisible(false);
    } else {
      // On desktop, always show both
      setIsSidebarVisible(true);
      setIsChatVisible(true);
    }
  }, [isMobile]);
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
    // Only toggle chat visibility on mobile
    if (isMobile) {
      setIsChatVisible(prev => !prev);
    }
  };
  
  // Handle chat selection (particularly important for mobile)
  const handleChatSelect = () => {
    if (isMobile) {
      // On mobile, when selecting a chat, hide sidebar and show chat
      setIsSidebarVisible(false);
      setIsChatVisible(true);
      
      // Trigger custom event for mobile layout
      const event = new CustomEvent('chat:selected');
      window.dispatchEvent(event);
    }
  };
  
  // Go back to contacts list on mobile
  const backToContacts = () => {
    if (isMobile) {
      setIsSidebarVisible(true);
      setIsChatVisible(false);
      
      // Trigger custom event for mobile layout
      const event = new CustomEvent('chat:back-to-contacts');
      window.dispatchEvent(event);
    }
  };
  
  return {
    isMobile,
    isSidebarVisible,
    isChatVisible,
    toggleSidebar,
    handleChatSelect,
    backToContacts
  };
}
