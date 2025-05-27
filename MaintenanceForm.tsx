
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/auth';
import { createMaintenanceRequest } from '@/services/maintenanceService';
import { fetchRoomAssignment } from '@/services/roomService';

const MaintenanceForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomAssignment, setRoomAssignment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    category: "",
    priority: "",
    description: "",
  });
  
  useEffect(() => {
    const loadUserRoom = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const assignment = await fetchRoomAssignment(user.id);
        setRoomAssignment(assignment);
      } catch (error) {
        console.error('Error loading room assignment:', error);
        toast.error('Could not load your room information. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserRoom();
  }, [user]);
  
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.priority) {
      toast.error("Please complete all required fields");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to submit a request");
      return;
    }
    
    if (!roomAssignment?.room_id) {
      toast.error("You don't have a room assigned. Please apply for accommodation first.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the request
      await createMaintenanceRequest({
        student_id: user.id,
        room_id: roomAssignment.room_id,
        category: formData.category,
        priority: formData.priority as "low" | "medium" | "high" | "emergency",
        description: formData.description
      });
      
      toast.success("Maintenance request submitted successfully!");
      navigate('/maintenance');
    } catch (error) {
      toast.error("Failed to submit request. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="page-container max-w-3xl">
        <div className="mb-6">
          <h1 className="mb-2">Submit Maintenance Request</h1>
          <p className="text-muted-foreground">
            Report an issue with your accommodation that needs attention
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Loading your room information...</p>
          </div>
        ) : !roomAssignment ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No Room Assigned</h3>
                <p className="text-muted-foreground mb-4">
                  You need to have a room assignment before you can submit a maintenance request.
                </p>
                <Button onClick={() => navigate('/apply')}>
                  Apply for Accommodation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Room Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Number</Label>
                    <Input value={roomAssignment.rooms?.room_number || 'Unknown'} disabled />
                  </div>
                  <div>
                    <Label>Block</Label>
                    <Input value={roomAssignment.rooms?.blocks?.name || 'Unknown'} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Maintenance Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Not urgent</SelectItem>
                        <SelectItem value="medium">Medium - Needs attention</SelectItem>
                        <SelectItem value="high">High - Causing disruption</SelectItem>
                        <SelectItem value="emergency">Emergency - Safety concern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Please provide details about the issue, including location, when it started, etc." 
                    className="min-h-28"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => navigate('/maintenance')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
};

export default MaintenanceForm;
