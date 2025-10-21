import React from 'react';
import { SidebarTrigger } from "./ui/sidebar";
import { Button } from "./ui/button";

export interface MobileHeaderProps {
  theme: string;
  onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ theme, onMenuClick }) => (
  <div className={`md:hidden p-3 border-b flex items-center sticky top-0 z-20 ${
    theme === 'dark' ? 'bg-[#2D3748] border-gray-700' : 'bg-[#F3F4F5] border-gray-200'
  }`}>
    <Button 
      variant="ghost" 
      size="icon" 
      className="p-2 mr-3 rounded-full border"
      onClick={onMenuClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </Button>
    <h1 className="text-lg font-semibold">ChatterLink</h1>
  </div>
);
