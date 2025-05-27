import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/auth';
import { createAnnouncement, fetchAnnouncements, updateAnnouncement, deleteAnnouncement } from '@/services/announcements/announcementService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AnnouncementsManagement: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    target_audience: 'all' as 'all' | 'students' | 'staff',
    expires_at: ''
  });

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => fetchAnnouncements('admin')
  });

  // Create announcement mutation
  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Announcement created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create announcement');
      console.error('Error creating announcement:', error);
    }
  });

  // Update announcement mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsDialogOpen(false);
      resetForm();
      toast.success('Announcement updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update announcement');
      console.error('Error updating announcement:', error);
    }
  });

  // Delete announcement mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete announcement');
      console.error('Error deleting announcement:', error);
    }
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'medium',
      target_audience: 'all',
      expires_at: ''
    });
    setEditingAnnouncement(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create an announcement");
      return;
    }

    const announcementData = {
      ...formData,
      created_by: user.id
    };

    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, data: announcementData });
    } else {
      createMutation.mutate(announcementData);
    }
  };

  const handleEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      target_audience: announcement.target_audience,
      expires_at: announcement.expires_at || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex items-center justify-between mb-6">
          <h1>Announcements Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new announcement
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                  <Input 
                    id="title" 
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="content" 
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className="min-h-32"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => handleChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Select 
                      value={formData.target_audience} 
                      onValueChange={(value) => handleChange('target_audience', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="staff">Staff Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                  <Input 
                    id="expires_at" 
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleChange('expires_at', e.target.value)}
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingAnnouncement ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingAnnouncement ? 'Update Announcement' : 'Create Announcement'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No announcements found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Create First Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-medium">
                    {announcement.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {announcement.content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <span>Priority: {announcement.priority}</span>
                      <span>Target: {announcement.target_audience}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>Created: {format(new Date(announcement.created_at), 'PPp')}</span>
                      {announcement.expires_at && (
                        <span>Expires: {format(new Date(announcement.expires_at), 'PPp')}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AnnouncementsManagement; 