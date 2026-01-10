
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, User, Camera, Bell, Moon, Sun, Lock, LogOut, ChevronRight } from "lucide-react";
import { useTheme } from '../context/ThemeProvider';
import { useToast } from '../hooks/use-toast';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [username, setUsername] = useState("Your Name");
  const [about, setAbout] = useState("Hey there! I'm using WhatsApp.");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully."
      });
    }
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    toast({
      title: "Name updated",
      description: "Your name has been updated successfully."
    });
  };

  const handleSaveAbout = () => {
    setIsEditingAbout(false);
    toast({
      title: "About updated",
      description: "Your about info has been updated successfully."
    });
  };

  const handlePasswordChange = () => {
    // This would navigate to password change page in a real app
    toast({
      title: "Coming soon",
      description: "Password change functionality will be available soon."
    });
  };

  const handleNotificationSettings = () => {
    // This would navigate to notifications settings in a real app
    toast({
      title: "Coming soon",
      description: "Notification settings will be available soon."
    });
  };

  const handleLogout = () => {
    // This would handle logout in a real app
    toast({
      title: "Logging out",
      description: "You have been logged out successfully."
    });
    
    // Redirect to login after a short delay
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-neutral-dark text-white' : 'bg-neutral-light text-gray-900'}`}>
      {/* Header */}
      <header className={`flex items-center p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-primary text-white'}`}>
        <Link to="/chat" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-xl font-medium">Settings</h1>
      </header>
      
      {/* Main content */}
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Profile section */}
        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative">
              <Avatar className="w-28 h-28">
                <AvatarImage src={profileImage || ""} />
                <AvatarFallback className="bg-primary text-white text-3xl">
                  {username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="profile-image-upload" 
                className={`absolute bottom-0 right-0 p-2 rounded-full cursor-pointer ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Camera className="h-5 w-5" />
                <input 
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1 space-y-4 w-full text-center sm:text-left">
              <div>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveName}>Save</Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium">{username}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your Name</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                      <User className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div>
                {isEditingAbout ? (
                  <div className="flex gap-2">
                    <Input
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSaveAbout}>Save</Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{about}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">About</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingAbout(true)}>
                      <User className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Preferences section */}
        <div className={`rounded-xl overflow-hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className="px-6 py-3 font-medium border-b dark:border-gray-700">Preferences</h3>
          
          <div 
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-blue-500" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark appearance</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          
          <div 
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-t dark:border-gray-700"
            onClick={handleNotificationSettings}
          >
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage notification preferences</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          
          <div 
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 border-t dark:border-gray-700"
            onClick={handlePasswordChange}
          >
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your password</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {/* Logout button */}
        <div className="flex justify-center">
          <Button 
            variant="destructive" 
            className="px-8" 
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
