import React from 'react';
import { User, Search, MoreVertical, Plus, Bell, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import ContactList from './ContactList';

export interface SidebarContentProps {
  theme: string;
  search: string;
  userProfile: {
    name: string;
    avatar: string | null;
    status: string;
  };
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSettings: () => void;
  onLogout: () => void;
  onNewChat: () => void;
  onContactSelect: () => void;
}

export const SidebarContent: React.FC<SidebarContentProps> = ({
  theme,
  search,
  userProfile,
  onSearchChange,
  onSettings,
  onLogout,
  onNewChat,
  onContactSelect
}) => {
  return (
    <>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={userProfile.avatar || ""} />
              <AvatarFallback className="bg-primary text-white">
                {userProfile.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{userProfile.name}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onNewChat}>
              <Plus className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : ''}>
                <DropdownMenuItem onClick={onSettings}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            value={search}
            onChange={onSearchChange}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ContactList onSelect={onContactSelect} />
      </div>

      <div className={`p-3 border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile.avatar || ""} />
              <AvatarFallback className="text-xs">
                {userProfile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userProfile.name}</p>
              <p className="text-xs text-green-500">{userProfile.status}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onSettings}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
