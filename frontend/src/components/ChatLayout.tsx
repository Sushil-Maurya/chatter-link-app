
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarTrigger, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarContent,
  useSidebar 
} from "../components/ui/sidebar";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { User, Bell, Search, Plus, MoreVertical } from "lucide-react";
import ContactList from './ContactList';
import { useIsMobile } from '../hooks/use-mobile';
import { useTheme } from './ThemeProvider';
import { useToast } from "../hooks/use-toast";
import ContactDrawer from './ContactDrawer';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const getCurrentUser = ()=> ''
const getUserProfile = (id:string)=> ''
const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [showNewChatMenu, setShowNewChatMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [userProfile, setUserProfile] = useState({ name: 'Your Name', avatar: null, status: 'online' });
  const [loading, setLoading] = useState(true);
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  const handleSettings = () => {
    setShowNewChatMenu(false);
    navigate('/settings');
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  
  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true);
        const user:any = await getCurrentUser();
        if (user) {
          const profile:any = await getUserProfile(user?.id);
          if (profile) {
            setUserProfile({
              name: profile?.name,
              avatar: profile?.avatar,
              status: 'online'
            });
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserProfile();
  }, []);
  
  const handleNewChat = () => {
    setShowNewChatMenu((prev) => !prev);
  };

  const closeNewChatMenu = () => {
    setShowNewChatMenu(false);
  };

  const NewChatMenuOverlay = () => (
    <div
      className="fixed inset-0 z-40 bg-black/30"
      onClick={closeNewChatMenu}
      aria-label="Close New Chat Menu"
    />
  );

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <ChatLayoutContent 
        isMobile={isMobile} 
        theme={theme} 
        userProfile={userProfile}
        search={search}
        onSearchChange={handleSearch}
        onSettings={handleSettings}
        onLogout={handleLogout}
        onNewChat={handleNewChat}
        onCloseNewChatMenu={closeNewChatMenu}
      >
        {children}
      </ChatLayoutContent>
      {showNewChatMenu && <NewChatMenuOverlay />}
    </SidebarProvider>
  );
};

interface ChatLayoutContentProps {
  isMobile: boolean;
  theme: string;
  userProfile: { name: string; avatar: string | null; status: string };
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSettings: () => void;
  onLogout: () => void;
  onNewChat: () => void;
  onCloseNewChatMenu: () => void;
  children: React.ReactNode;
}

const ChatLayoutContent: React.FC<ChatLayoutContentProps> = ({
  isMobile,
  theme,
  userProfile,
  search,
  onSearchChange,
  onSettings,
  onLogout,
  onNewChat,
  onCloseNewChatMenu,
  children
}) => {
  const { open, setOpen } = useSidebar();
  const { toast } = useToast();
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e);
  };
  
  // Handle new chat button click
  const handleNewChatClick = () => {
    onNewChat();
    if (isMobile) {
      setOpen(false);
    }
  };
  
  // Handle settings button click
  const handleSettingsClick = () => {
    onSettings();
    if (isMobile) {
      setOpen(false);
    }
  };
  
  // Handle logout button click
  const handleLogoutClick = () => {
    onLogout();
    if (isMobile) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isMobile, setOpen]);

  return (
      <div className={`min-h-screen w-full flex flex-col md:flex-row ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        {/* Mobile header with menu button */}
        {isMobile && (
          <div className="md:hidden p-3 border-b border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-900 sticky top-0 z-20">
            <SidebarTrigger 
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-2 mr-3"
              onClick={() => setOpen(!open)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </SidebarTrigger>
            <h1 className="text-lg font-semibold">ChatterLink</h1>
          </div>
        )}
        
        {/* Mobile overlay when sidebar is open */}
        {isMobile && open && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        
        <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out' : 'w-auto'} ${!open && isMobile ? '-translate-x-full' : 'translate-x-0'}`}>
          <Sidebar 
            className={`h-screen w-64 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} 
              text-foreground flex flex-col shadow-2xl
              transition-transform duration-300 ease-in-out fixed md:static z-40
              ${isMobile ? 'w-[85%] max-w-[320px] -translate-x-full data-[state=open]:translate-x-0' : 'w-[350px]'}
            `}
          >
            <SidebarHeader className={`flex flex-col gap-2 justify-start px-4 pt-1 pb-3 h-auto ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} border-b`}>
              <div className="flex items-center justify-between w-full h-12 mt-1 mb-2">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={userProfile.avatar || ""} />
                    <AvatarFallback className="bg-primary text-white font-bold">
                      {userProfile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-base">{userProfile.name}</span>
                </div>
                <div className="flex gap-1 items-center">
                  <ContactDrawer />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} z-[1000]`}>
                      <DropdownMenuItem onClick={handleSettingsClick}>
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        toast({
                          title: "Archived Chats",
                          description: "This feature is not yet implemented",
                        });
                      }}>
                        Archived
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogoutClick}>
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search or start new chat"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm ${
                      theme === 'dark' 
                        ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
                        : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200'
                    } border focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="overflow-y-auto flex-1 px-0 py-0">
              <ContactList onSelect={() => {
                if (isMobile) {
                  setOpen(false);
                }
              }} />
            </SidebarContent>
            
            <SidebarFooter className={`border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={userProfile.avatar || ""} />
                    <AvatarFallback className={`${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{userProfile.name}</p>
                    <p className="text-xs text-green-500">{userProfile.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => {
                    toast({
                      title: "Notifications",
                      description: "This feature is not yet implemented",
                    });
                  }}>
                    <Bell className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
        </div>
        
        <div 
          className={`flex-1 overflow-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}
          style={{ minHeight: 'calc(100vh - 60px)' }}
        >
          <div className="h-full w-full">
            {children}
          </div>
        </div>
      </div>
  );
};

export default ChatLayout;
