
import React, { useState, useRef } from 'react';
import { Button } from "../components/ui/button";
import { Paperclip, Send, Smile, Mic, Image, File, X } from "lucide-react";
import { useTheme } from './ThemeProvider';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFile) {
      onSendMessage(message, selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
      setIsEmojiPickerOpen(false);
      setIsAttachmentMenuOpen(false);
    }
  };

  const handleAttachmentClick = () => {
    setIsAttachmentMenuOpen(!isAttachmentMenuOpen);
    setIsEmojiPickerOpen(false);
  };

  const handleEmojiClick = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
    setIsAttachmentMenuOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsAttachmentMenuOpen(false);
    }
  };

  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start/stop audio recording
  };

  return (
    <div className={`border-t p-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {/* Attachment menu popup */}
      {isAttachmentMenuOpen && (
        <div className={`absolute bottom-20 left-4 p-2 rounded-lg shadow-lg z-10 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
          <div className="flex flex-col gap-2">
            <button 
              onClick={handleImageUpload}
              className={`flex items-center gap-2 p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
            >
              <Image className="h-5 w-5 text-blue-500" />
              <span>Image</span>
            </button>
            <button 
              onClick={handleImageUpload}
              className={`flex items-center gap-2 p-2 rounded ${theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
            >
              <File className="h-5 w-5 text-green-500" />
              <span>Document</span>
            </button>
          </div>
        </div>
      )}
      
      {/* File input (hidden) */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      />
      
      {/* Selected file preview */}
      {selectedFile && (
        <div className={`mb-2 p-2 rounded-lg flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <div className={`p-2 rounded ${selectedFile.type.startsWith('image/') ? 'bg-blue-100' : 'bg-green-100'}`}>
            {selectedFile.type.startsWith('image/') ? (
              <Image className="h-5 w-5 text-blue-600" />
            ) : (
              <File className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          onClick={handleAttachmentClick}
          className={isAttachmentMenuOpen ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon"
          onClick={handleEmojiClick}
          className={isEmojiPickerOpen ? 'bg-gray-200 dark:bg-gray-700' : ''}
        >
          <Smile className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className={`w-full p-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              theme === 'dark' 
                ? 'bg-gray-700 text-white placeholder-gray-400' 
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        {message.trim() || selectedFile ? (
          <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90">
            <Send className="h-5 w-5" />
          </Button>
        ) : (
          <Button 
            type="button" 
            size="icon" 
            className={`rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}
            onClick={toggleRecording}
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </form>
    </div>
  );
};

export default ChatInput;
