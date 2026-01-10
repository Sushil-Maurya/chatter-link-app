
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { cn } from "../lib/utils";
import { CheckCircle, User, Users } from "lucide-react";
import { useTheme } from '../context/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';
import { useToast } from '../hooks/use-toast';

interface ContactWithChat  {
  lastMessage: string;
  unread: number;
  timestamp: string;
}

interface ContactListProps {
  onSelect?: (id: string) => void;
}

const getContacts = ()=>[]
const getChats = ()=>[]

const ContactList: React.FC<ContactListProps> = ({ onSelect }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeContactId, setActiveContactId] = useState<string | null>(id || null);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups'>('all');
  const [contacts, setContacts] = useState<ContactWithChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingContact, setPendingContact] = useState<string | null>(null);

  // Function to load contacts and their chat data
  const loadContactsWithChats = async () => {
    try {
      setLoading(true);
      const [contactsData, chatsData] = await Promise.all([getContacts(), getChats()]);
      console.log('ContactList: Loaded contacts:', contactsData.length);

      // Merge contacts with their respective chat data
      const contactsWithChats: ContactWithChat[] = contactsData.map((contact: any) => {
        const chat = (chatsData as any).find((chat: any) => chat?.contact_id === contact?.id);
        return {
          ...contact,
          lastMessage:  chat?.last_message || 'No messages yet',
          unread: chat?.unread_count || 0,
          timestamp: chat?.last_message_time ? formatTimestamp(chat?.last_message_time) : 'Never'
        };
      });

      setContacts(contactsWithChats);
      
      // If we have a pending contact to select, select it now
      if (pendingContact) {
        const exists = contactsWithChats.some((c:any) => c?.id === pendingContact);
        if (exists) {
          handleContactClick(pendingContact);
          setPendingContact(null);
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Error",
        description: "Failed to load contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Update active contact ID when route parameter changes
    if (id) {
      setActiveContactId(id);
    }
  }, [id]);

  useEffect(() => {
    loadContactsWithChats();
    
    // Listen for the contact:added custom event
    const handleContactAdded = (event: CustomEvent<{ contact: any }>) => {
      console.log('ContactList: Contact added event received');
      if (event.detail?.contact?.id) {
        // Set the pending contact to be selected after reload
        setPendingContact(event.detail.contact.id);
        // Navigate to the new contact's chat
        navigate(`/chat/${event.detail.contact.id}`);
      }
      loadContactsWithChats();
    };
    
    window.addEventListener('contact:added', handleContactAdded as EventListener);
    
    // Listen for message:sent custom event to refresh contacts list
    const handleMessageSent = () => {
      loadContactsWithChats();
    };
    
    window.addEventListener('message:sent', handleMessageSent);
    
    return () => {
      window.removeEventListener('contact:added', handleContactAdded as EventListener);
      window.removeEventListener('message:sent', handleMessageSent);
    };
  }, [toast, navigate]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleContactClick = (contactId: string) => {
    // Don't re-navigate if it's already the active contact
    if (activeContactId === contactId) return;
    
    setActiveContactId(contactId);
    
    // Trigger a custom event for mobile layouts to handle showing the chat
    if (isMobile) {
      const event = new CustomEvent('chat:selected', { detail: { contactId } });
      window.dispatchEvent(event);
    }
    
    if (onSelect) {
      onSelect(contactId);
    } else {
      console.log('ContactList: Navigating to chat with ID:', contactId);
      navigate(`/chat/${contactId}`);
    }
  };

  const filteredContacts = contacts.filter((contact:any) => {
    if (filterType === 'unread') return contact.unread > 0;
    if (filterType === 'groups') return contact?.is_group;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filter tabs */}
      <div className="flex space-x-2 px-4 pt-2 pb-3">
        <button
          className={cn(
            "px-3 py-1 text-sm rounded-full transition-colors",
            filterType === 'all' 
              ? theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-primary text-white'
              : theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
          )}
          onClick={() => setFilterType('all')}
        >
          All
        </button>
        <button
          className={cn(
            "px-3 py-1 text-sm rounded-full transition-colors",
            filterType === 'unread' 
              ? theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-primary text-white'
              : theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
          )}
          onClick={() => setFilterType('unread')}
        >
          Unread
        </button>
        <button
          className={cn(
            "px-3 py-1 text-sm rounded-full transition-colors",
            filterType === 'groups' 
              ? theme === 'dark' 
                ? 'bg-gray-700 text-white' 
                : 'bg-primary text-white'
              : theme === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
          )}
          onClick={() => setFilterType('groups')}
        >
          Groups
        </button>
      </div>

      {/* Chat list */}
      <div className="overflow-y-auto flex-1">
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p>No conversations found</p>
          </div>
        ) : (
          filteredContacts.map((contact:any) => (
            <div
              key={contact.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                theme === 'dark' 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-100',
                activeContactId === contact.id && (
                  theme === 'dark' 
                    ? 'bg-gray-800' 
                    : 'bg-gray-100'
                )
              )}
              onClick={() => handleContactClick(contact.id)}
            >
              <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={contact.avatar || ''} />
                  <AvatarFallback className={cn(
                    contact.is_group
                      ? theme === 'dark' ? 'bg-blue-700' : 'bg-blue-500' 
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300',
                    "text-white font-semibold"
                  )}>
                    {contact.is_group ? <Users className="h-6 w-6" /> : contact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2",
                    theme === 'dark' ? 'border-gray-900' : 'border-white',
                    contact.status === "online"
                      ? "bg-green-500"
                      : "bg-gray-400"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <span className={cn(
                    "font-medium text-base truncate",
                    contact.unread > 0 && "font-semibold"
                  )}>
                    {contact.name}
                  </span>
                  <span className={cn(
                    "ml-2 text-xs whitespace-nowrap",
                    contact.unread > 0
                      ? "text-primary font-medium"
                      : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                  )}>
                    {contact.timestamp}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={cn(
                    "text-sm truncate max-w-[220px]",
                    contact.unread > 0
                      ? theme === 'dark' ? "text-gray-300" : "text-gray-900"
                      : theme === 'dark' ? "text-gray-400" : "text-gray-500"
                  )}>
                    {contact.lastMessage}
                  </p>
                  {contact.unread > 0 && (
                    <span className="ml-2 bg-primary text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactList;
