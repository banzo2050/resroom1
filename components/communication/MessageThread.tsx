import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/auth';
import { Message, getConversation, sendMessage, markMessagesAsRead } from '@/services/communication/studentAdminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

interface MessageThreadProps {
  otherUserId: string;
  otherUserName: string;
  type: 'application' | 'maintenance' | 'general';
  relatedId?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  otherUserId,
  otherUserName,
  type,
  relatedId
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user, otherUserId]);

  const loadMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await getConversation(user.id, otherUserId);
      if (error) throw error;
      
      if (data) {
        setMessages(data);
        // Mark unread messages as read
        const unreadMessages = data.filter(m => !m.read && m.receiver_id === user.id);
        if (unreadMessages.length > 0) {
          await markMessagesAsRead(unreadMessages.map(m => m.id));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    try {
      const { data, error } = await sendMessage({
        sender_id: user.id,
        receiver_id: otherUserId,
        content: newMessage.trim(),
        type,
        related_id: relatedId
      });

      if (error) throw error;
      
      if (data) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Conversation with {otherUserName}</h3>
        <p className="text-sm text-muted-foreground">Type: {type}</p>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex items-end gap-2 max-w-[80%] ${
                  message.sender_id === user.id ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://avatar.vercel.sh/${message.sender_id}`} />
                  <AvatarFallback>
                    {message.sender_id === user.id ? 'You' : otherUserName[0]}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    message.sender_id === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {format(new Date(message.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}; 