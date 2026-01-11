
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { cn, getAvatar } from "../lib/utils";
import { Users, Search, Loader2, Plus } from "lucide-react";
import { useTheme } from '../context/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';
import { useToast } from '../hooks/use-toast';
import { useUserStore } from '../stores/useUserStore';
import { useAuthStore } from '../stores/useAuthStore';

interface ContactWithChat  {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  unread: number;
  timestamp: string;
  is_group: boolean;
}

interface ContactListProps {
  onSelect?: (id: string) => void;
  searchQuery?: string; // Add prop for search
}

const ContactList: React.FC<ContactListProps> = ({ onSelect, searchQuery: externalSearchQuery }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeContactId, setActiveContactId] = useState<string | null>(id || null);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'groups'>('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [contacts, setContacts] = useState<ContactWithChat[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state for global results in sidebar
  const [globalResults, setGlobalResults] = useState<any[]>([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);

  const { users, getUsers, onlineUsers, searchGlobalUsers } = useUserStore();
  const { authUser } = useAuthStore();

  const currentSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;

  // Fetch users only once on mount
  useEffect(() => {
    getUsers();
  }, []);

  const loadContactsWithChats = () => {
    // Transform users to ContactWithChat format
    const contactsWithChats: ContactWithChat[] = users.map((user) => {
      const isSelf = user._id === authUser?._id;
      return {
        id: user._id,
        name: isSelf ? `${user.name} (You)` : user.name,
        avatar: getAvatar(user.profilePic, user.gender),
        status: onlineUsers.has(user._id) ? "online" : "offline",
        lastMessage: isSelf ? "Message yourself" : "Start a conversation", // Placeholder
        unread: 0,
        timestamp: "", 
        is_group: false
      };
    });

    setContacts(contactsWithChats);
    setLoading(false);
  };
   
  useEffect(() => {
    loadContactsWithChats(); 
  }, [users, onlineUsers]);

  // Handle Global Search when query changes
  useEffect(() => {
    const searchGlobally = async () => {
        if (!currentSearchQuery.trim() || currentSearchQuery.length < 3) {
            setGlobalResults([]);
            return;
        }

        // Only search globally if it's an email/phone or explicit attempt?
        // User request: "allow to global search via phone number or email address"
        setIsSearchingGlobal(true);
        try {
            const results = await searchGlobalUsers(currentSearchQuery);
            // Filter out existing contacts
            const existingIds = new Set(users.map(u => u._id));
            setGlobalResults(results.filter(u => !existingIds.has(u._id)));
        } catch (error) {
            console.error("Global search failed", error);
        } finally {
            setIsSearchingGlobal(false);
        }
    };

    const timer = setTimeout(searchGlobally, 500);
    return () => clearTimeout(timer);
  }, [currentSearchQuery, users, searchGlobalUsers]);

  useEffect(() => {
    // Update active contact ID when route parameter changes
    if (id) {
      setActiveContactId(id);
    }
  }, [id]);

  useEffect(() => {
    // Listen for the contact:added custom event
    const handleContactAdded = (event: CustomEvent<{ contact: any }>) => {
      console.log('ContactList: Contact added event received');
      if (event.detail?.contact?.id) {
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

  // Handler for global search results - adds contact first, then navigates
  const handleGlobalContactClick = async (user: any, event?: React.MouseEvent) => {
    // Prevent event bubbling if clicking the Plus button
    if (event) {
      event.stopPropagation();
    }

    try {
      // Add contact first
      await useUserStore.getState().addContact(user._id);
      
      // Show success message
      toast({
        title: "Contact Added",
        description: `${user.name} has been added to your contacts`,
      });

      // Remove from global results
      setGlobalResults(prev => prev.filter(u => u._id !== user._id));

      // Navigate to chat
      handleContactClick(user._id);
    } catch (error) {
      console.error('Failed to add contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter((contact:any) => {
    const matchesSearch = !currentSearchQuery.trim() || 
                         contact.name.toLowerCase().includes(currentSearchQuery.toLowerCase());
                         
    if (!matchesSearch) return false;
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
      {/* Search Input if no external prop provided */}
      {externalSearchQuery === undefined && (
        <div className="px-4 pt-2">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    placeholder="Search contacts..."
                    className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} focus:outline-none ring-primary/30 focus:ring-2`}
                />
            </div>
        </div>
      )}

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
                : 'text-gray-600 hover:bg-gray-100',
            "cursor-pointer"
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
                : 'text-gray-600 hover:bg-gray-100',
            "cursor-pointer"
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
                : 'text-gray-600 hover:bg-gray-100',
            "cursor-pointer"
          )}
          onClick={() => setFilterType('groups')}
        >
          Groups
        </button>
      </div>

      {/* Chat list + Global Search */}
      <div className="overflow-y-auto flex-1">
        {filteredContacts.length === 0 && globalResults.length === 0 && !isSearchingGlobal ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 px-4 text-center">
            <p>No conversations found</p>
            {currentSearchQuery && <p className="text-sm mt-1">Try searching globally by email or phone</p>}
          </div>
        ) : (
          <>
            {/* Local Contacts */}
            {filteredContacts.map((contact:any) => (
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
            ))}

            {/* Global Results Section */}
            {(globalResults.length > 0 || isSearchingGlobal) && (
                <div className="mt-4 pb-4">
                    <div className="px-4 py-2 border-t border-b bg-gray-50 dark:bg-gray-800/50">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Global Search Results</span>
                    </div>
                    {isSearchingGlobal ? (
                        <div className="p-4 flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    ) : (
                        globalResults.map((user) => (
                            <div
                                key={user._id}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                )}
                                onClick={() => handleGlobalContactClick(user)}
                            >
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={getAvatar(user.profilePic, user.gender)} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between">
                                        <p className="font-medium text-sm truncate">{user.name}</p>
                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">New</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{user.email || user.phone || "On ChatterLink"}</p>
                                </div>
                                <button
                                    onClick={(e) => handleGlobalContactClick(user, e)}
                                    className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                                    title="Add to contacts"
                                >
                                    <Plus className="h-4 w-4 text-primary" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContactList;
