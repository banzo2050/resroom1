import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { ConversationList } from '@/components/communication/ConversationList';
import { MessageThread } from '@/components/communication/MessageThread';

const Messages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<{
    userId: string;
    userName: string;
    type: 'application' | 'maintenance' | 'general';
    relatedId?: string;
  } | null>(null);

  return (
    <AppShell>
      <div className="page-container">
        <h1 className="mb-8">Messages</h1>
        
        <div className="flex border rounded-lg">
          <ConversationList
            onSelectConversation={(userId, userName, type, relatedId) => {
              setSelectedConversation({ userId, userName, type, relatedId });
            }}
          />
          
          <div className="flex-1">
            {selectedConversation ? (
              <MessageThread
                otherUserId={selectedConversation.userId}
                otherUserName={selectedConversation.userName}
                type={selectedConversation.type}
                relatedId={selectedConversation.relatedId}
              />
            ) : (
              <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Messages; 