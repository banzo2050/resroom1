import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/auth';
import { createMaintenanceRequest } from '@/services/maintenance/maintenanceService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MaintenanceRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit a maintenance request");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await createMaintenanceRequest({
        student_id: user.id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority
      });
      
      navigate('/maintenance');
    } catch (error) {
      console.error('Failed to submit maintenance request:', error);
      toast.error("Failed to submit maintenance request. Please try again.");
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
            Please provide details about the maintenance issue you're experiencing
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title <span className="text-destructive">*</span></Label>
                <Input 
                  id="title" 
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => handleChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Not Urgent</SelectItem>
                    <SelectItem value="medium">Medium - Standard</SelectItem>
                    <SelectItem value="high">High - Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="description" 
                  placeholder="Please provide a detailed description of the issue, including any relevant details that might help us address it"
                  className="min-h-32"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};

export default MaintenanceRequestForm; 