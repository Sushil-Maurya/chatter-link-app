
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/toaster';

function App() {
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  useEffect(() => {
    // Listen for custom events for mobile navigation
    const handleChatSelect = () => {
      setMobileShowChat(true);
    };
    
    const handleBackToContacts = () => {
      setMobileShowChat(false);
    };
    
    window.addEventListener('chat:selected', handleChatSelect);
    window.addEventListener('chat:back-to-contacts', handleBackToContacts);
    
    // Handle window resize events to prevent UI disappearing during resize
    let resizeTimer: number;
    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        setIsResizing(false);
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('chat:selected', handleChatSelect);
      window.removeEventListener('chat:back-to-contacts', handleBackToContacts);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Add this class to the body for mobile layout management
  useEffect(() => {
    if (mobileShowChat) {
      document.body.classList.add('mobile-chat-visible');
    } else {
      document.body.classList.remove('mobile-chat-visible');
    }
    
    // Add resize-transition class when not actively resizing
    if (isResizing) {
      document.body.classList.remove('resize-transition');
    } else {
      document.body.classList.add('resize-transition');
    }
  }, [mobileShowChat, isResizing]);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="h-full w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
