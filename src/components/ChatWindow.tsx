
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { Message } from './MessageBubble';
import { useTheme } from './ThemeProvider';
import { useIsMobile } from '../hooks/use-mobile';
import { useToast } from '../hooks/use-toast';
import { Avatar, AvatarFallback } from './ui/avatar';
import { User, Phone, Mail } from 'lucide-react';
import { Button } from './ui/button';

interface ChatWindowProps {
  contactId: string;
}

const getContact = (id:string)=> ''
const getContacts = ()=>[]
const updateMessageStatus = (id:string,status:string)=> ''
const markMessagesAsRead = (id:string,userId:string)=> ''
const getMessages = (id:string)=> []
const sendMessage = (msg:any)=> ''


const ChatWindow: React.FC<ChatWindowProps> = ({ contactId }) => {
  const navigate = useNavigate();
  const [contact, setContact] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const previousContactId = useRef<string | null>(null);
  const initialLoadComplete = useRef<boolean>(false);

  // Fetch contact and messages data
  useEffect(() => {
    // Skip re-fetching if we already loaded the same contact
    if (contactId === previousContactId.current && contact && initialLoadComplete.current) {
      return;
    }
    
    previousContactId.current = contactId;
    
    async function loadChatData() {
      if (!contactId) return;
      
      setIsLoading(true);
      setLoadError(null);
      
      try {
        console.log('Loading chat data for contact ID:', contactId);
        const contactData = await getContact(contactId);
        
        if (contactData) {
          console.log('Contact data loaded:', contactData);
          setContact(contactData);
          initialLoadComplete.current = true;
          
          // Load messages now that we have contact data
          await loadMessages(contactData);
        } else {
          console.error('Contact not found with ID:', contactId);
          
          // If we haven't reached max retries, try again after a delay
          if (retryCount < maxRetries) {
            console.log(`Retry ${retryCount + 1}/${maxRetries} for contact ID: ${contactId}`);
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              loadChatData();
            }, 1000); // Retry after 1 second
            return;
          }
          
          setLoadError(`Contact with ID ${contactId} not found`);
        }
      } catch (error) {
        console.error('Error loading contact:', error);
        setLoadError('Failed to load contact information');
        toast({
          title: "Error",
          description: "Failed to load contact information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Load messages for a contact
    const loadMessages = async (currentContact: any) => {
      try {
        console.log('Loading messages for contact ID:', contactId);
        const messagesData = await getMessages(contactId);
        console.log('Messages loaded:', messagesData.length);
        
        // Convert database messages to the Message format used by MessageBubble
        const formattedMessages: any[] = messagesData.map((msg:any) => ({
          id: Number(msg.id),
          text: msg.text,
          sender: msg.sender_id === 'current-user' ? 'user' : 'contact',
          timestamp: formatTimestamp(msg.timestamp),
          senderName: msg.sender_name,
          status: msg.status,
          isGroup: currentContact?.is_group,
          fileUrl: msg.file_url,
          fileName: msg.file_name,
          fileType: msg.file_type,
        }));

        setMessages(formattedMessages);
        
        // Mark messages as read
        if (messagesData.some((msg:any) => msg.status === 'delivered' && msg.sender_id !== 'current-user')) {
          await markMessagesAsRead(contactId, 'current-user');
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (contactId) {
      loadChatData();
    }
    
    // Reset retry count when contactId changes
    return () => {
      setRetryCount(0);
    };
  }, [contactId, toast, retryCount]);

  // Subscribe to messages
  useEffect(() => {
    if (!contactId || !contact) return;

    // // Set up real-time subscription to new messages
    // const subscription = supabase
    //   .channel('messages')
    //   .on('postgres_changes', { 
    //     event: 'INSERT', 
    //     schema: 'public', 
    //     table: 'messages',
    //     filter: `chat_id=eq.${contactId}`
    //   }, (payload) => {
    //     const newMsg = payload.new as any;
    //     const formattedMessage: any = {
    //       id: Number(newMsg.id),
    //       text: newMsg.text,
    //       sender: newMsg.sender_id === 'current-user' ? 'user' : 'contact',
    //       timestamp: formatTimestamp(newMsg.timestamp),
    //       senderName: newMsg.sender_name,
    //       status: newMsg.status,
    //       isGroup: contact?.is_group,
    //       fileUrl: newMsg.file_url,
    //       fileName: newMsg.file_name,
    //       fileType: newMsg.file_type,
    //     };
        
    //     setMessages(prev => [...prev, formattedMessage]);
        
    //     // If the message is from the contact, mark it as read
    //     if (newMsg.sender_id !== 'current-user') {
    //       updateMessageStatus(newMsg.id, 'read');
    //     }
    //   })
    //   .subscribe();

    // return () => {
    //   supabase.removeChannel(subscription);
    // };
  }, [contactId, contact]);

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async (text: string, file?: File) => {
    if (!contact) return;
    
    let fileUrl;
    let fileName;
    let fileType;
    
    // Handle file upload if present
    // if (file) {
    //   try {
    //     fileName = file.name;
        
    //     if (file.type.startsWith('image/')) {
    //       fileType = 'image';
    //     } else {
    //       fileType = 'document';
    //     }
        
    //     const { data, error } = await supabase.storage
    //       .from('chat-attachments')
    //       .upload(`${contactId}/${Date.now()}_${file.name}`, file);
        
    //     if (error) throw error;
        
    //     // Get public URL
    //     const { data: urlData } = supabase.storage
    //       .from('chat-attachments')
    //       .getPublicUrl(data.path);
          
    //     fileUrl = urlData.publicUrl;
    //   } catch (error) {
    //     console.error('Error uploading file:', error);
    //     toast({
    //       title: "Upload Failed",
    //       description: "Could not upload the file",
    //       variant: "destructive",
    //     });
    //   }
    // }
    
    // Create a new message
    const newMessageData: Omit<Message, 'id' | 'created_at'> = {
      text,
      sender_id: 'current-user',
      chat_id: contactId,
      timestamp: new Date().toISOString(),
      status: 'sent',
      sender_name: 'Your Name',
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
    };
    
    // Send to database
    const sentMessage:any = await sendMessage(newMessageData);
    if (!sentMessage) {
      toast({
        title: "Message Failed",
        description: "Could not send the message",
        variant: "destructive",
      });
      return;
    }
    
    // Add message to UI immediately
    const formattedMessage: Message = {
      id: Number(sentMessage.id),
      text: sentMessage.text,
      sender: 'user',
      timestamp: formatTimestamp(sentMessage.timestamp),
      senderName: 'You',
      status: sentMessage.status,
      isGroup: contact.is_group,
      fileUrl: sentMessage.file_url,
      fileName: sentMessage.file_name,
      fileType: sentMessage.file_type,
    };
    
    setMessages(prev => [...prev, formattedMessage]);
    
    // Show typing indicator after a delay
    setTimeout(() => {
      setIsTyping(true);
      
      // Simulate reply after typing
      setTimeout(() => {
        setIsTyping(false);
        
        // Create response message
        const replyText = file 
          ? "Thanks for sharing that file with me!" 
          : "That sounds great! Let's schedule a meeting for next week.";
        
        // Send the reply message
        // sendMessage({
        //   text: replyText,
        //   sender_id: contactId,
        //   chat_id: contactId,
        //   timestamp: new Date().toISOString(),
        //   status: 'delivered',
        //   sender_name: contact.name
        // }).then(responseMsg => {
        //   if (responseMsg) {
        //     // Add response to UI
        //     const responseFormattedMsg: Message = {
        //       id: Number(responseMsg.id),
        //       text: responseMsg.text,
        //       sender: 'contact',
        //       timestamp: formatTimestamp(responseMsg.timestamp),
        //       senderName: contact.name,
        //       status: 'delivered',
        //       isGroup: contact.is_group,
        //     };
            
        //     setMessages(prev => [...prev, responseFormattedMsg]);
        //   }
        // });
      }, 2500);
    }, 1000);
  };

  const handleInfoClick = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  const handleCallClick = () => {
    // Would implement call functionality here
    toast({
      title: "Starting Call",
      description: `Starting audio call with ${contact?.name || 'contact'}`,
    });
  };

  const handleVideoClick = () => {
    // Would implement video call functionality here
    toast({
      title: "Starting Video",
      description: `Starting video call with ${contact?.name || 'contact'}`,
    });
  };
  
  const handleBackClick = () => {
    // This will trigger the mobile view to show contacts list
    const event = new CustomEvent('chat:back-to-contacts');
    window.dispatchEvent(event);
  };

  if (isLoading) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadError || !contact) {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
      }`}>
        <div className="text-center p-8">
          <h3 className="text-xl font-medium mb-4">Error Loading Chat</h3>
          <p className="mb-6">{loadError || "Contact information could not be loaded"}</p>
          <Button onClick={() => navigate("/chat")}>
            Return to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        contactName={contact.name} 
        contactStatus={isTyping ? 'typing' : contact.status} 
        contactAvatar={contact.avatar || undefined}
        isGroup={contact.is_group}
        onInfoClick={handleInfoClick}
        onCallClick={handleCallClick}
        onVideoClick={handleVideoClick}
        onBackClick={isMobile ? handleBackClick : undefined}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <ChatMessages 
            messages={messages} 
            isTyping={isTyping}
            contactName={contact.name}
          />
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
        
        {/* Right Info Panel (optional) */}
        {isInfoOpen && (
          <div className={`w-80 border-l flex flex-col ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-4 border-b flex flex-col items-center">
              <div className="mb-4">
                <img 
                  src={contact.avatar || "https://via.placeholder.com/150"} 
                  alt={contact.name}
                  className="w-32 h-32 rounded-full object-cover"
                />
              </div>
              <h3 className="text-lg font-medium">{contact.name}</h3>
              <p className={`text-sm ${contact.status === 'online' ? 'text-green-500' : 'text-gray-500'}`}>
                {contact.status === 'online' ? 'Online' : 'Last seen recently'}
              </p>
            </div>
            
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium mb-2">About</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contact.is_group 
                  ? "This is a group chat created for team collaboration." 
                  : "Hey there! I'm using ChatterLink."}
              </p>
            </div>
            
            <div className="p-4 border-b">
              <h4 className="text-sm font-medium mb-2">Media, Links and Docs</h4>
              <div className="grid grid-cols-3 gap-2">
                {messages
                  .filter(m => m.fileUrl && m.fileType === 'image')
                  .slice(0, 3)
                  .map((m, idx) => (
                    <div key={idx} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                      <img src={m.fileUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
              </div>
            </div>
            
            {contact.is_group && (
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium mb-2">Participants (5)</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">A</div>
                    <span className="text-sm">Alice Smith</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">B</div>
                    <span className="text-sm">Bob Johnson</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">C</div>
                    <span className="text-sm">Charlie Brown</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-auto p-4">
              <button className={`w-full py-2 rounded-lg text-sm font-medium text-red-500 ${
                theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
                {contact.is_group ? 'Exit Group' : 'Block Contact'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
