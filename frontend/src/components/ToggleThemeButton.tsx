
import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from './ThemeProvider';

export const ToggleThemeButton: React.FC<{
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}> = ({ 
  className, 
  variant = "ghost", 
  size = "icon" 
}) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={toggleTheme} 
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className={className}
    >
      {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
};
