import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/useAuthStore';

// Protected Route component
const ProtectedRoute = () => {
  const { authUser, isCheckingAuth } = useAuthStore();
  
  if (isCheckingAuth) {
    return (
        <div className="flex items-center justify-center h-screen w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );
  }
  
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

// Main App Layout component
const AppLayout = () => {
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  useEffect(() => {
    const handleChatSelect = () => setMobileShowChat(true);
    const handleBackToContacts = () => setMobileShowChat(false);
    
    window.addEventListener('chat:selected', handleChatSelect);
    window.addEventListener('chat:back-to-contacts', handleBackToContacts);
    
    let resizeTimer: number;
    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => setIsResizing(false), 300);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('chat:selected', handleChatSelect);
      window.removeEventListener('chat:back-to-contacts', handleBackToContacts);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    if (mobileShowChat) {
      document.body.classList.add('mobile-chat-visible');
    } else {
      document.body.classList.remove('mobile-chat-visible');
    }
    
    if (isResizing) {
      document.body.classList.remove('resize-transition');
    } else {
      document.body.classList.add('resize-transition');
    }
  }, [mobileShowChat, isResizing]);

  return <Outlet context={{ mobileShowChat, setMobileShowChat }} />;
};

function App() {
  const { checkAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If user is already authenticated, redirect from login/register to chat
  const RedirectIfAuthenticated = ({ children }: { children: React.ReactNode }) => {
     if (authUser) return <Navigate to="/chat" />;
     return <>{children}</>;
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
          <div className="h-full w-full">
            <Routes>
              <Route path="/" element={authUser ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
              <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
              <Route path="/register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/chat/:id" element={<Chat />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

