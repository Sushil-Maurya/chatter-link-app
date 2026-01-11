
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Mail, Share2, Check, Copy } from "lucide-react";
import { useToast } from '../hooks/use-toast';
import { useTheme } from '../context/ThemeProvider';

interface InviteSharingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  invitee: {
    name: string;
    email?: string;
    phone?: string;
    inviteUrl: string;
  } | null;
}

const InviteSharingModal: React.FC<InviteSharingModalProps> = ({ isOpen, onOpenChange, invitee }) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  if (!invitee) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitee.inviteUrl);
    setIsCopied(true);
    toast({ title: "Copied", description: "Invite link copied to clipboard" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle>Invite {invitee.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Share this link with them to connect on ChatterLink.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-md border border-gray-700">
            <span className="text-sm truncate flex-1 font-mono text-gray-300">
                {invitee.inviteUrl || "Generating link..."}
            </span>
            <Button size="icon" variant="ghost" onClick={handleCopyLink} className="h-8 w-8 hover:bg-white/10 text-white border-0">
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-800 text-white" onClick={() => window.open(`mailto:${invitee.email}?subject=Join me on ChatterLink&body=Hi ${invitee.name}, I'm using ChatterLink for secure messaging. Join me here: ${invitee.inviteUrl}`)}>
                <Mail className="h-4 w-4 text-red-500" />
                Email
             </Button>
             <Button variant="outline" className="gap-2 border-gray-700 hover:bg-gray-800 text-white" onClick={() => window.open(`sms:${invitee.phone}?body=Hi ${invitee.name}, join me on ChatterLink: ${invitee.inviteUrl}`)}>
                <Share2 className="h-4 w-4 text-primary" />
                SMS
             </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteSharingModal;
