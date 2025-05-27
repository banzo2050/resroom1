import { useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export const useMessages = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMessages = async (otherUserId: string) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', user?.uid),
        orderBy('created_at', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string, type: string = 'general', relatedId?: string) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'messages'), {
        sender_id: user?.uid,
        receiver_id: receiverId,
        content,
        type,
        related_id: relatedId,
        participants: [user?.uid, receiverId],
        created_at: new Date().toISOString(),
        read: false
      });
      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      setLoading(true);
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = (callback: (messages: any[]) => void) => {
    if (!user) return () => {};

    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', user.uid),
      orderBy('created_at', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  };

  return {
    loading,
    error,
    getMessages,
    sendMessage,
    markAsRead,
    subscribeToMessages
  };
}; 