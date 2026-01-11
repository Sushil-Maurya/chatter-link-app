
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerFooter
} from "../components/ui/drawer";
import { Sheet, SheetContent,  SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { UserPlus, X, Phone, Mail, User, RefreshCw, Contact as ContactIcon } from "lucide-react";
import { useTheme } from '../context/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';

import { useToast } from '../hooks/use-toast';

interface ContactDrawerProps {
  onContactSelected?: (contactId: string) => void;
}

// Separate type for new contact to improve type safety
interface NewContact {
  name: string;
  phone: string;
  email: string;
}

const ContactDrawer: React.FC<ContactDrawerProps> = ({ onContactSelected }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContact, setNewContact] = useState<NewContact>({
    name: '',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [triggerRef, setTriggerRef] = useState<HTMLButtonElement | null>(null);
  const [showSystemContactsPrompt, setShowSystemContactsPrompt] = useState(false);
  const [isLoadingSystemContacts, setIsLoadingSystemContacts] = useState(false);
  
  // Fetch contacts from database or mock data
  useEffect(() => {
    async function fetchContacts() {
      try {
        setLoading(true);
        let contactsData: any[] = [];
        
        // Try to fetch from Supabase if connected
        try {
          // Since we don't have the tables created yet, we'll use local data
          // This code will be replaced once tables are created
          const localContacts = await getContacts();
          contactsData = localContacts;
        } catch (error) {
          console.error('Error fetching contacts:', error);
          // Fall back to local data
          const localContacts = await getContacts();
          contactsData = localContacts;
        }

        setContacts(contactsData);
        setFilteredContacts(contactsData);
      } catch (error) {
        console.error('Error loading contacts:', error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchContacts();
  }, [toast]);
  
  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.phone && contact.phone.includes(searchQuery)) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  // Handle importing system contacts - now will use real API if available
  const handleImportSystemContacts = async () => {
    setIsLoadingSystemContacts(true);
    
    try {
      // In a real implementation, this would use the Contacts API
      // For browsers, this would require user permission
      if ('contacts' in navigator && 'ContactsManager' in window) {
        try {
          // This is a placeholder for the actual Contacts API
          // The real implementation would use navigator.contacts.select()
          toast({
            title: "Information",
            description: "Your browser supports the Contact Picker API. This would request real contacts.",
          });
          
          // Since most browsers don't fully support this yet, we'll just show a message
          setShowSystemContactsPrompt(false);
        } catch (error) {
          console.error('Error accessing contacts API:', error);
          toast({
            title: "Error",
            description: "Failed to access system contacts. Permission may have been denied.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Not Supported",
          description: "Contact picking is not supported in this browser.",
        });
      }
      
      setShowSystemContactsPrompt(false);
    } catch (error) {
      console.error('Error importing system contacts:', error);
      toast({
        title: "Error",
        description: "Failed to import system contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSystemContacts(false);
    }
  };

  // Helper function to get contacts from local data
  async function getContacts() {
    try {
      // This is a fallback function that returns an empty array
      // Eventually this will be replaced with actual database queries
      return [] as any[];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [] as any[];
    }
  }

  const handleContactSelect = async (contact: any) => {
    try {
      // For demo or when Supabase is not connected
      setIsOpen(false);
      if (onContactSelected) {
        onContactSelected(contact.id);
      } else {
        navigate(`/chat/${contact.id}`);
      }
    } catch (error) {
      console.error('Error selecting contact:', error);
      toast({
        title: "Error",
        description: "Failed to open chat",
        variant: "destructive",
      });
    }
  };

  // Fixed: This function now directly uses the localContact from the AddContactForm component
  const handleAddContact = async (contactData: NewContact) => {
    // Basic validation
    if (!contactData.name.trim()) {
      toast({
        title: "Missing information",
        description: "Contact name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a mock new contact since we don't have Supabase tables yet
      const newContactData: any = {
        id: Date.now().toString(),
        name: contactData.name.trim(),
        status: 'offline' as 'offline',
        is_group: false,
        created_at: new Date().toISOString(),
        avatar: null,
        phone: contactData.phone.trim() || null,
        email: contactData.email.trim() || null
      };

      // Add the new contact to the local state
      setContacts(prev => [...prev, newContactData]);
      
      // Reset form and close add contact panel
      setNewContact({ name: '', phone: '', email: '' });
      setIsAddContactOpen(false);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('contact:added', { detail: { contact: newContactData } }));
      
      toast({
        title: "Success",
        description: `${newContactData.name} has been added to your contacts`,
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    }
  };

  // System Contacts Permission UI
  const SystemContactsPrompt = () => (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowSystemContactsPrompt(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="text-lg font-semibold">Import Contacts</div>
        <div className="w-9"></div> {/* Empty div for alignment */}
      </div>
      
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="mb-6 p-4 rounded-full bg-primary/10">
          <ContactIcon className="h-12 w-12 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Access Your Contacts</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          ChatterLink would like to access your contacts to help you connect with friends and family more easily.
        </p>
        
        {isLoadingSystemContacts ? (
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Importing contacts...</p>
          </div>
        ) : (
          <div className="space-y-3 w-full max-w-xs">
            <Button 
              variant="default" 
              className="w-full" 
              onClick={handleImportSystemContacts}
            >
              Allow Access
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowSystemContactsPrompt(false)}
            >
              Not Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Updated: Add Contact Form to maintain its own local state and pass to parent only on save
  const AddContactForm = () => {
    const nameInputRef = useRef<HTMLInputElement>(null);
    
    // Use local state to prevent focus issues
    const [localContact, setLocalContact] = useState<NewContact>({
      name: '',
      phone: '',
      email: ''
    });
    
    // Focus on name input when component mounts
    useEffect(() => {
      if (nameInputRef.current) {
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 100);
      }
    }, []);
    
    // Updated: Now passes the localContact directly to the handleAddContact function
    const handleSave = () => {
      handleAddContact(localContact);
    };
    
    return (
      <div className="h-full flex flex-col">
        <div className="border-b px-4 py-3 flex justify-between items-center bg-gray-900 dark:bg-gray-900">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsAddContactOpen(false)}
            className="text-white"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="text-lg font-semibold text-white">Add New Contact</div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSave}
            disabled={!localContact.name.trim()}
            className="text-white"
          >
            Save
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-900 dark:bg-gray-900 text-white">
          <div className="flex items-center justify-center mb-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-3xl bg-blue-900/50 text-blue-500">
                {localContact.name.charAt(0).toUpperCase() || <User className="h-12 w-12" />}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Name *</label>
              <Input
                ref={nameInputRef}
                placeholder="Enter name"
                value={localContact.name}
                onChange={(e) => setLocalContact({...localContact, name: e.target.value})}
                className="w-full bg-gray-800 border-gray-700 text-white"
                autoFocus
                autoComplete="off"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Phone</label>
              <div className="relative">
                <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter phone number"
                  value={localContact.phone}
                  onChange={(e) => setLocalContact({...localContact, phone: e.target.value})}
                  className="pl-8 w-full bg-gray-800 border-gray-700 text-white"
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block text-white">Email</label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter email address"
                  value={localContact.email}
                  onChange={(e) => setLocalContact({...localContact, email: e.target.value})}
                  className="pl-8 w-full bg-gray-800 border-gray-700 text-white"
                  type="email"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Contact List View component
  const ContactListView = () => (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3">
        <div className="text-lg font-semibold">New Chat</div>
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
            placeholder="Search contacts"
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
      
      <div className="flex flex-col px-4 py-2 border-b">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 mb-2"
          onClick={() => setIsAddContactOpen(true)}
        >
          <UserPlus className="h-5 w-5 text-primary" />
          <span>New Contact</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3"
          onClick={() => setShowSystemContactsPrompt(true)}
        >
          <ContactIcon className="h-5 w-5 text-primary" />
          <span>Import System Contacts</span>
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading ? (
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
                <p className="text-sm">Add your first contact to start chatting</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredContacts.map(contact => (
              <div 
                key={contact.id} 
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                onClick={() => handleContactSelect(contact)}
              >
                <Avatar>
                  <AvatarImage src={contact.avatar || undefined} alt={contact.name} />
                  <AvatarFallback className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    {contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.status || (contact.phone || contact.email || 'New contact')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {isMobile && (
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      )}
    </div>
  );

  // Content to be displayed based on the current view state
  const Content = () => {
    if (showSystemContactsPrompt) {
      return <SystemContactsPrompt />;
    } else if (isAddContactOpen) {
      return <AddContactForm />;
    } else {
      return <ContactListView />;
    }
  };

  // Render mobile or desktop version based on device
  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(true)}
              className="text-primary hover:bg-primary/10"
            >
              <UserPlus className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'} p-0`}>
            <Content />
          </DrawerContent>
        </Drawer>
      </>
    );
  } else {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary hover:bg-primary/10 cursor-pointer"
              ref={setTriggerRef}
            >
              <UserPlus className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'} p-0`} 
            side="left"
            hideCloseButton={isAddContactOpen || showSystemContactsPrompt}
          >
            <Content />
          </SheetContent>
        </Sheet>
      </>
    );
  }
};

export default ContactDrawer;
