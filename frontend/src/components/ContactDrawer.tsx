
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger,
} from "../components/ui/drawer";
import { Sheet, SheetContent,  SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { UserPlus, X, Mail, RefreshCw, Search, Loader2 } from "lucide-react";
import { useTheme } from '../context/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';
import { useToast } from '../hooks/use-toast';
import { useUserStore } from '../stores/useUserStore';
import { useContactStore } from '../stores/useContactStore';
import { userService } from '../services/userService';
import { getAvatar } from '../lib/utils'; // Import helper

interface ContactDrawerProps {
  onContactSelected?: (contactId: string) => void;
}

const ContactDrawer: React.FC<ContactDrawerProps> = ({ onContactSelected }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use store instead of local state
  const { users: contacts, getUsers, searchGlobalUsers, addContact, isLoading } = useUserStore();
  
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // Fetch contacts on mount/open
  useEffect(() => {
    if (isOpen) {
        getUsers();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const handleContactSelect = async (contact: any) => {
    try {
      setIsOpen(false);
      if (onContactSelected) {
        onContactSelected(contact._id);
      } else {
        navigate(`/chat/${contact._id}`);
      }
    } catch (error) {
      console.error('Error selecting contact:', error);
    }
  };

  // Add Contact Form (Now Search User)
  const AddContactForm = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [inviteInfo, setInviteInfo] = useState<{ identifier: string, url: string } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!query.trim()) return;
        setIsSearching(true);
        setInviteInfo(null);
        try {
            const res = await searchGlobalUsers(query);
            // Filter out existing contacts
            const existingIds = new Set(contacts.map(c => c._id));
            const searchResults = res.filter(u => !existingIds.has(u._id));
            setResults(searchResults);
            
            // If no results and it looks like email/phone, maybe they want to invite
            if (searchResults.length === 0) {
                // Try to add as manual identifier to check for invite
                const addRes = await userService.addContact({ identifier: query });
                if (addRes.status === 'invited') {
                    setInviteInfo({ identifier: addRes.identifier, url: addRes.inviteUrl });
                }
            }
        } catch (error) {
            toast({ title: "Error", description: "Search failed", variant: "destructive" });
        } finally {
            setIsSearching(false);
        }
    };

    const onAdd = async (user: any) => {
        try {
            await addContact(user._id);
            setAddedIds(prev => new Set(prev).add(user._id));
            toast({ title: "Success", description: `${user.name} added to contacts` });
            setResults(prev => prev.filter(p => p._id !== user._id));
        } catch (error) {
             toast({ title: "Error", description: "Failed to add contact", variant: "destructive" });
        }
    };

    const copyInvite = () => {
        if (inviteInfo) {
            navigator.clipboard.writeText(inviteInfo.url);
            toast({ title: "Copied", description: "Invite link copied to clipboard" });
        }
    };

    return (
      <div className="h-full flex flex-col">
        <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-900 dark:bg-gray-900 text-white">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsAddContactOpen(false)}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="text-lg font-semibold">Add New Contact</div>
          <div className="w-9" />
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-900 dark:bg-gray-900 text-white">
          <form onSubmit={handleSearch} className="flex gap-2">
             <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, Email or Phone..."
                className="bg-gray-800 border-gray-700 text-white"
                autoFocus
             />
             <Button type="submit" disabled={isSearching || !query.trim()}>
                 {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
             </Button>
          </form>

          <div className="space-y-2 mt-4">
              {results.length === 0 && !isSearching && query && !inviteInfo && (
                  <p className="text-center text-gray-400">No users found</p>
              )}
              
              {inviteInfo && (
                  <div className="p-4 bg-gray-800 rounded-lg border border-primary/20 text-center space-y-3">
                      <p className="text-sm font-medium">User "{inviteInfo.identifier}" is not on ChatApp yet.</p>
                      <Button variant="outline" className="w-full text-white border-white/20" onClick={copyInvite}>
                          Copy Invite Link
                      </Button>
                      <p className="text-xs text-gray-500">Share this link with them to connect automatically when they sign up.</p>
                  </div>
              )}
              
              {results.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={getAvatar(user.profilePic, user.gender)} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => onAdd(user)} disabled={addedIds.has(user._id)}>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add
                      </Button>
                  </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  // Contact List View component
  const ContactListView = () => (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 relative">
        <div className="text-lg font-semibold">Contacts</div>
                 {!isMobile && (
          <button 
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
      
      <div className="p-4">
        <div className="relative">
          <Input
            placeholder="Search my contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-8"
            autoComplete="off"
          />
          {searchQuery && (
            <button 
              className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col px-4 py-2 border-b space-y-2">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3"
          onClick={() => setIsAddContactOpen(true)}
        >
          <UserPlus className="h-5 w-5 text-primary" />
          <span>Add New Contact</span>
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start gap-2"
              onClick={() => {
                  toast({ title: "Syncing", description: "Fetching phone contacts..." });
                  // In a real app, this would use a native bridge.
                  // Mocking for now.
                  const mockPhoneContacts = [
                      { name: "John Doe", phone: "1234567890", email: "john@example.com" }
                  ];
                  useContactStore.getState().syncPhoneContacts(mockPhoneContacts);
              }}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Sync Phone</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="justify-start gap-2"
              onClick={() => {
                  toast({ title: "Google Sync", description: "Connecting to Google..." });
                  // oauth logic here
              }}
            >
              <Mail className="h-4 w-4 text-red-500" />
              <span>Google Sync</span>
            </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            {searchQuery ? (
              <p>No contacts found for "{searchQuery}"</p>
            ) : (
              <>
                <UserPlus className="h-12 w-12 mb-2 text-primary/40" />
                <p>No contacts yet</p>
                <p className="text-sm">Search and add people to start chatting</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredContacts.map(contact => (
              <div 
                key={contact._id} 
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                onClick={() => handleContactSelect(contact)}
              >
                <Avatar>
                  <AvatarImage src={getAvatar(contact.profilePic, contact.gender)} alt={contact.name} />
                  <AvatarFallback className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    {contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.bio || contact.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Content to be displayed based on the current view state
  const Content = () => {
    if (isAddContactOpen) {
      return <AddContactForm />;
    } else {
      return <ContactListView />;
    }
  };

  // Render mobile or desktop version based on device
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsOpen(true)}
            className="text-primary hover:bg-primary/10 cursor-pointer"
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'} p-0 h-[85vh]`}>
          <Content />
        </DrawerContent>
      </Drawer>
    );
  } else {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-primary hover:bg-primary/10 cursor-pointer"
          >
            <UserPlus className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'} p-0`} 
          side="left"
          hideCloseButton={isAddContactOpen}
        >
          <Content />
        </SheetContent>
      </Sheet>
    );
  }
};

export default ContactDrawer;
