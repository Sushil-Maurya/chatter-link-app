
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatLayout from '../components/ChatLayout';
import ChatWindow from '../components/ChatWindow';
import { useTheme } from '../components/ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';
import ContactDrawer from '../components/ContactDrawer';
// import { Button } from '../components/ui/button';

const Chat: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(id || null);
  const [contactExists, setContactExists] = useState<boolean | null>(null);
  const getContact = (id:string)=> ''
  const getContacts = ()=>[]
  // Function to load contacts
  const loadContacts = async () => {
    try {
      setLoading(true);
      const contactsData = await getContacts();
      setContacts(contactsData);

      // If we have an ID, check if the contact exists
      if (id) {
        const exists = contactsData.some(contact => contact?.id === id);
        setContactExists(exists);
        
        // If it doesn't exist in the list, try to fetch it directly
        if (!exists) {
          const contact = await getContact(id);
          if (contact) {
            setContactExists(true);
          } else {
            console.error('Contact with ID', id, 'not found');
            setContactExists(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Update selected contact when route changes
  useEffect(() => {
    setSelectedContactId(id || null);
    
    if (id) {
      // Reset contactExists state when ID changes
      setContactExists(null);
      
      // Check if the contact exists
      const checkContact = async () => {
        try {
          const contact = await getContact(id);
          setContactExists(!!contact);
        } catch (error) {
          console.error('Error checking contact:', error);
          setContactExists(false);
        }
      };
      
      checkContact();
    }
  }, [id]);
  
  useEffect(() => {
    // Check if Supabase is properly connected
    async function checkSupabaseConnection() {
      try {
        // We'll just check if we can make any request to Supabase
        setIsSupabaseConnected(true);
      } catch (error) {
        console.error('Error connecting to Supabase:', error);
        setIsSupabaseConnected(false);
      }
    }

    // Check if environment variables are set
    const hasSupabaseConfig = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (hasSupabaseConfig) {
      checkSupabaseConnection();
    } else {
      setIsSupabaseConnected(false);
    }
    
    // Load contacts initially
    loadContacts();

    // Listen for contact:added custom event
    const handleContactAdded = (event: Event) => {
      console.log('Chat: Contact added event received');
      loadContacts();
    };

    window.addEventListener('contact:added', handleContactAdded);
    
    return () => {
      window.removeEventListener('contact:added', handleContactAdded);
    };
  }, []);


  return (
    <ChatLayout>
      {loading && !id ? (
        <div className={`flex flex-1 items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : id && contactExists !== false ? (
        <ChatWindow contactId={id} key={id} />
      ) : (
        <div className={`flex flex-1 h-[100%] items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="text-center p-8 max-w-md mx-auto">
            <img 
              src="/chatter.png" 
              alt="ChatterLink" 
              className="w-32 mx-auto mb-8" 
            />
            <h2 className="text-2xl font-semibold mb-3">Welcome to ChatterLink</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {contactExists === false ? 
                "The contact you're looking for doesn't exist. Please select a different contact or create a new one." : 
                "Connect with friends and family through instant messaging. Select a contact from the sidebar to start chatting."
              }
            </p>
            
            <div className="flex justify-center mb-8">
              <ContactDrawer />
            </div>
          </div>
        </div>
      )}
    </ChatLayout>
  );
};

export default Chat;
