
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { testFirestoreConnection, setupFirestoreSchema } from '../lib/firestore-schema';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, Check, X } from 'lucide-react';

const FirebaseStatus = ({ showSetupButton = true }) => {
  const [connectionStatus, setConnectionStatus] = useState<'initial' | 'connected' | 'failed'>('initial');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSettingUpSchema, setIsSettingUpSchema] = useState(false);

  const checkConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testFirestoreConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      if (isConnected) {
        toast.success('Firebase connection successful!');
      } else {
        toast.error('Firebase connection failed!');
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast.error('Firebase connection failed!');
      console.error('Error checking Firebase connection:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const setupSchema = async () => {
    setIsSettingUpSchema(true);
    try {
      const isSetupSuccessful = await setupFirestoreSchema();
      if (isSetupSuccessful) {
        toast.success('Firestore schema setup completed successfully!');
      } else {
        toast.error('Failed to set up Firestore schema!');
      }
    } catch (error) {
      toast.error('Error setting up Firestore schema!');
      console.error('Error setting up Firestore schema:', error);
    } finally {
      setIsSettingUpSchema(false);
    }
  };

  useEffect(() => {
    // Check connection on component mount
    checkConnection();
  }, []);

  return (
    <div className="p-4 border rounded-md bg-card shadow-sm transition-all hover:shadow-md">
      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
        <AlertCircle size={16} className="text-muted-foreground" />
        Firebase Status
      </h3>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              connectionStatus === 'initial' ? 'bg-yellow-500 animate-pulse' : 
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            }`} 
          />
          <span className={connectionStatus === 'failed' ? 'text-red-500' : ''}>
            {connectionStatus === 'initial' ? 'Checking connection...' : 
             connectionStatus === 'connected' ? 'Connected to Firebase' : 'Failed to connect to Firebase'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnection}
            disabled={isTestingConnection}
            className="flex items-center gap-1"
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
            {connectionStatus === 'connected' && !isTestingConnection && <Check size={14} className="text-green-500" />}
            {connectionStatus === 'failed' && !isTestingConnection && <X size={14} className="text-red-500" />}
          </Button>
          {showSetupButton && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={setupSchema}
              disabled={isSettingUpSchema || connectionStatus !== 'connected'}
              className="flex items-center gap-1"
            >
              {isSettingUpSchema ? 'Setting Up...' : 'Setup Database Schema'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseStatus;
