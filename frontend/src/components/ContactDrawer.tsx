
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  DrawerContent, 
  DrawerTrigger,
} from "../components/ui/drawer";
import { Sheet, SheetContent,  SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { UserPlus, X, Mail, RefreshCw, Loader2, Share2, Plus } from "lucide-react";
import InviteSharingModal from './InviteSharingModal';
import { useTheme } from '../context/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';
import { useToast } from '../hooks/use-toast';
import { useUserStore } from '../stores/useUserStore';
import { useContactStore } from '../stores/useContactStore';

import { getAvatar } from '../lib/utils'; // Import helper

interface ContactDrawerProps {
  onContactSelected?: (contactId: string) => void;
}

const ContactDrawer: React.FC<ContactDrawerProps> = ({ onContactSelected }) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  // Use store instead of local state
  const { users, pendingInvites, getUsers, addContact, isLoading } = useUserStore();
  
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  // Fetch contacts on mount/open
  useEffect(() => {
    if (isOpen) {
        getUsers();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Combine users and invites whenever they change
  useEffect(() => {
    const mappedUsers = users.map(user => ({
      ...user,
      isInvite: false
    }));
    
    const mappedInvites = pendingInvites.map(invite => ({
      _id: invite._id,
      name: invite.targetName || "Invited User",
      email: invite.targetEmail,
      phone: invite.targetPhone,
      inviteUrl: invite.inviteUrl,
      isInvite: true
    }));
    
    setAllContacts([...mappedUsers, ...mappedInvites]);
  }, [users, pendingInvites]);

  // Filter contacts based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = allContacts.filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        (contact.email && contact.email.toLowerCase().includes(query)) ||
        (contact.phone && contact.phone.toLowerCase().includes(query))
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(allContacts);
    }
  }, [searchQuery, allContacts]);

  const [selectedInvite, setSelectedInvite] = useState<any | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleContactSelect = (contact: any) => {
    if (contact.isInvite) {
      // Don't select, just show invite options if clicked on the row (optional)
      // or we can just let people click the button.
      // For now, let's open the modal if they click anywhere on an invite row.
      setSelectedInvite(contact);
      setIsShareModalOpen(true);
      return;
    }
    setIsOpen(false);
    onContactSelected?.(contact._id);
  };



  // Add Contact Form
  const AddContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
            toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const res = await addContact(formData);
            
            if (res.result?.status === 'invited') {
                const inviteData = {
                    name: res.result.targetName,
                    email: formData.email,
                    phone: formData.phone,
                    inviteUrl: res.result.inviteUrl
                };
                setSelectedInvite(inviteData);
                setIsShareModalOpen(true);
                toast({ title: "User not found", description: "You can invite them to join ChatterLink" });
                setIsAddContactOpen(false); // Close form to show list with modal over it
            } else {
                toast({ title: "Success", description: `${formData.name} added to contacts` });
                setIsAddContactOpen(false);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to add contact", variant: "destructive" });
        } finally {
            setIsSaving(false);
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

        <div className="flex-1 p-4 space-y-6 overflow-y-auto bg-gray-900 dark:bg-gray-900 text-white">
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Name</label>
                <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contact Name"
                    className="bg-gray-800 border-gray-700 text-white"
                 />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email</label>
                <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@example.com"
                    className="bg-gray-800 border-gray-700 text-white"
                 />
             </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Phone</label>
                <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1234567890"
                    className="bg-gray-800 border-gray-700 text-white"
                 />
             </div>
             
             <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4" disabled={isSaving}>
                 {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                 {isSaving ? "Saving..." : "Save Contact"}
             </Button>
          </form>
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
          <div className="divide-y divide-gray-800">
            {filteredContacts.map(contact => (
              <div 
                key={contact._id} 
                className={`flex items-center justify-between p-4 transition-colors ${theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} ${!contact.isInvite ? 'cursor-pointer' : ''}`}
                onClick={() => !contact.isInvite && handleContactSelect(contact)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar>
                      <AvatarImage src={contact.isInvite ? "" : getAvatar(contact.profilePic, contact.gender)} alt={contact.name} />
                      <AvatarFallback className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        {contact.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{contact.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.isInvite ? (contact.email || contact.phone) : (contact.bio || contact.email)}
                      </p>
                    </div>
                </div>
                
                {contact.isInvite && (
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        className="ml-2 shrink-0 bg-primary/20 text-primary hover:bg-primary/30"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvite(contact);
                            setIsShareModalOpen(true);
                        }}
                    >
                        Invite
                    </Button>
                )}
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
        <InviteSharingModal 
          isOpen={isShareModalOpen} 
          onOpenChange={setIsShareModalOpen} 
          invitee={selectedInvite} 
        />
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
        <InviteSharingModal 
          isOpen={isShareModalOpen} 
          onOpenChange={setIsShareModalOpen} 
          invitee={selectedInvite} 
        />
      </Sheet>
    );
  }
};

export default ContactDrawer;
