import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth';
import { db } from '@/main';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Message, studentAdminService } from '@/services/communication/studentAdminService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ConversationListProps {
  onSelectConversation: (userId: string, userName: string, type: 'application' | 'maintenance' | 'general', relatedId?: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Array<{
    userId: string;
    userName: string;
    lastMessage: Message;
    unreadCount: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Get all messages where user is either sender or receiver
      const messagesQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      
      const receivedMessagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', user.id),
        orderBy('createdAt', 'desc')
      );

      const [sentMessages, receivedMessages] = await Promise.all([
        getDocs(messagesQuery),
        getDocs(receivedMessagesQuery)
      ]);

      // Group messages by conversation
      const conversationMap = new Map();
      
      // Process sent messages
      sentMessages.docs.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() } as Message;
        const otherUserId = message.receiverId;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: message.receiverName || 'Unknown User',
            lastMessage: message,
            unreadCount: 0
          });
        }
      });

      // Process received messages
      receivedMessages.docs.forEach((doc) => {
        const message = { id: doc.id, ...doc.data() } as Message;
        const otherUserId = message.senderId;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            userName: message.senderName || 'Unknown User',
            lastMessage: message,
            unreadCount: 0
          });
        }
      });

      // Get unread counts for each conversation
      const conversations = Array.from(conversationMap.values());
      for (const conversation of conversations) {
        const count = await studentAdminService.getUnreadCount(conversation.userId);
        conversation.unreadCount = count;
      }

      setConversations(conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-80 border-r">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversations</h2>
      </div>

      <ScrollArea className="h-[600px]">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
        ) : (
          <div className="divide-y">
            {conversations.map((conversation) => (
              <button
                key={conversation.userId}
                className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
                onClick={() => onSelectConversation(
                  conversation.userId,
                  conversation.userName,
                  'general',
                  undefined
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://avatar.vercel.sh/${conversation.userId}`} />
                    <AvatarFallback>{conversation.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(conversation.lastMessage.createdAt.toDate(), 'MMM d')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}; 