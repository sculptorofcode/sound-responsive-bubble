
import { useState } from 'react';
import { ArrowLeft, History, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface ChatDisplayProps {
  onBackClick: () => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatDisplay = ({ onBackClick }: ChatDisplayProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I am your AI assistant. You can ask me questions while continuing to use voice mode. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a sample response to "${inputValue}". The voice visualization remains active in the background.`,
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBackClick} aria-label="Back to voice mode">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">Chat Assistant</h2>
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open history">
              <History className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-[80vh]">
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Conversation History</h3>
                <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">Today</p>
                <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer">
                  <p className="font-medium">Voice Visualization Assistance</p>
                  <p className="text-sm text-muted-foreground truncate">Help with the voice visualization features...</p>
                </div>
                <p className="text-muted-foreground text-sm">Yesterday</p>
                <div className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer">
                  <p className="font-medium">Sound Visualization Setup</p>
                  <p className="text-sm text-muted-foreground truncate">Initial setup of sound visualization...</p>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex max-w-[80%] rounded-lg p-4",
                message.isUser
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-secondary"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] resize-none"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={inputValue.trim() === ''}
            size="icon" 
            className="h-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
