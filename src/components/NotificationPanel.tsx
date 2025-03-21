
import React, { useState } from 'react';
import { X, AlertTriangle, Info, WarningTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'error' | 'system';
  timestamp: Date;
  read: boolean;
}

export const NotificationPanel = ({ onClose }: NotificationPanelProps) => {
  // Sample notifications - in a real app, these would come from a context or state management
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Microphone Access',
      message: 'Successfully granted access to the microphone',
      type: 'system',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      title: 'Warning',
      message: 'Low audio levels detected, try speaking louder',
      type: 'warning',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      read: true,
    },
    {
      id: '3',
      title: 'Error',
      message: 'Failed to process audio data',
      type: 'error',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getFilteredNotifications = (type: 'warning' | 'error' | 'system') => {
    return notifications.filter(notification => notification.type === type);
  };

  const renderNotification = (notification: Notification) => (
    <div 
      key={notification.id}
      className={cn(
        "relative p-4 mb-2 rounded-lg border",
        notification.read ? "bg-secondary/40" : "bg-secondary",
        notification.type === 'error' ? "border-destructive/50" : "border-border"
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium flex items-center">
          {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />}
          {notification.type === 'error' && <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />}
          {notification.type === 'system' && <Info className="h-4 w-4 mr-2 text-blue-500" />}
          {notification.title}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={() => removeNotification(notification.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
      <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground">
        <span>
          {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        {!notification.read && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs" 
            onClick={() => markAsRead(notification.id)}
          >
            Mark as read
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[350px]">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-medium">Notifications</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="flex-1">
        <div className="border-b px-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="warnings">Warnings</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <TabsContent value="all" className="mt-0">
            {notifications.length > 0 ? (
              notifications.map(renderNotification)
            ) : (
              <p className="text-center text-muted-foreground p-4">No notifications</p>
            )}
          </TabsContent>
          
          <TabsContent value="warnings" className="mt-0">
            {getFilteredNotifications('warning').length > 0 ? (
              getFilteredNotifications('warning').map(renderNotification)
            ) : (
              <p className="text-center text-muted-foreground p-4">No warnings</p>
            )}
          </TabsContent>
          
          <TabsContent value="errors" className="mt-0">
            {getFilteredNotifications('error').length > 0 ? (
              getFilteredNotifications('error').map(renderNotification)
            ) : (
              <p className="text-center text-muted-foreground p-4">No errors</p>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
