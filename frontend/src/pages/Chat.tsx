
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatLayout from '../components/ChatLayout';
import ChatWindow from '../components/ChatWindow';
import { useTheme } from '../context/ThemeProvider';
import ContactDrawer from '../components/ContactDrawer';
import { useUserStore } from '../stores/useUserStore';

const Chat: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { theme } = useTheme();
  const { users, getUsers, isLoading: isUsersLoading } = useUserStore();
  const [contactExists, setContactExists] = useState<boolean | null>(null);

  // Load contacts (users) on mount if empty
  useEffect(() => {
    if (users.length === 0) {
      getUsers();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check if contact exists when id or users change
  useEffect(() => {
    if (id) {
       // If users are still loading, don't decide yet (or assume true until loaded)
       // But better to wait. If users are loaded:
       if (users.length > 0) {
          const exists = users.some(u => u._id === id);
          setContactExists(exists);
       } else if (!isUsersLoading) {
           // Users loaded but empty, or failed.
           // Maybe try fetching specific user if we had that API, but currently we fetch all.
           // If users list is empty after loading, then contact definitely doesn't exist (or we have no friends)
           setContactExists(false); 
       }
    } else {
      setContactExists(null);
    }
  }, [id, users, isUsersLoading]);

  // If we are loading and have an ID, we show loading spinner
  // If we have ID and we know contact exists, show ChatWindow
  // If we have ID and contact does NOT exist, show "not found"
  // If no ID, show welcome screen

  const showLoading = isUsersLoading && users.length === 0;

  return (
    <ChatLayout>
      {showLoading ? (
        <div className={`flex flex-1 items-center justify-center ${
          theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : id && contactExists ? (
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
               {id && contactExists === false 
                 ? "The contact you're looking for doesn't exist." 
                 : "Connect with friends and family through instant messaging. Select a contact from the sidebar to start chatting."
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
