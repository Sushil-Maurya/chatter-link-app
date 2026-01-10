
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useTheme } from '../context/ThemeProvider';

const Index = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // In a real app, you would check authentication status here
  const isAuthenticated = false; // This would come from your auth system
  
  useEffect(() => {
    // Auto-redirect to chat or login based on auth status
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${
      theme === 'dark' ? 'bg-neutral-dark text-white' : 'bg-neutral-light text-gray-900'
    } p-4`}>
      <div className="w-full max-w-lg">
        <div className={`rounded-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } p-8 shadow-soft-lg text-center`}>
          <img
            src="/lovable-uploads/5b9440a6-5041-4de3-98b1-7ba1752d4422.png"
            alt="WhatsApp"
            className="w-72 mx-auto mb-8"
            draggable={false}
          />
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Welcome to WhatsApp
          </h2>
          <div className="text-base mb-8 text-gray-600 dark:text-gray-300">
            Send and receive messages, make calls, and connect with people around the world.
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full py-6 text-lg bg-primary hover:bg-primary/90"
            >
              Login
            </Button>
            
            <Button 
              onClick={() => navigate('/register')}
              variant="outline"
              className="w-full py-6 text-lg"
            >
              Create New Account
            </Button>
          </div>
          
          <div className="mt-8 text-xs text-gray-500 dark:text-gray-400">
            Your personal messages are end-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
