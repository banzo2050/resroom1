import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Edit, 
  Trash2,
  CalendarIcon,
  Clock,
  Users
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/main';
import { collection, query, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  type: "general" | "emergency" | "event";
  publish_at: Date;
  target_blocks: string[];
  created_at: Date;
  updated_at: Date;
  blocks?: {
    name: string;
  } | null;
}

const AdminAnnouncements: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [publishDate, setPublishDate] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  // Fetch blocks
  const { data: blocks = [] } = useQuery({
    queryKey: ['blocks'],
    queryFn: async () => {
      const blocksQuery = query(collection(db, 'blocks'), orderBy('name'));
      const querySnapshot = await getDocs(blocksQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }
  });

  // Fetch announcements
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(announcementsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
    }
  });

  // Create announcement mutation
  const createAnnouncementMutation = useMutation({
    mutationFn: async (announcementData: Partial<Announcement>) => {
      const docRef = await addDoc(collection(db, 'announcements'), {
        title: announcementData.title,
        content: announcementData.content,
        author_id: announcementData.author_id,
        type: announcementData.type,
        target_blocks: announcementData.target_blocks,
        publish_at: Timestamp.fromDate(publishDate),
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });

      const doc = await getDocs(docRef);
      return { id: docRef.id, ...doc.data() } as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement created successfully');
      setShowCreateDialog(false);
      setPublishDate(new Date());
    },
    onError: (error) => {
      toast.error('Failed to create announcement: ' + error.message);
    }
  });

  // Update announcement mutation
  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Announcement> }) => {
      const announcementRef = doc(db, 'announcements', id);
      await updateDoc(announcementRef, {
        title: updates.title,
        content: updates.content,
        type: updates.type,
        target_blocks: updates.target_blocks,
        publish_at: Timestamp.fromDate(publishDate),
        updated_at: Timestamp.now()
      });

      const doc = await getDocs(announcementRef);
      return { id, ...doc.data() } as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement updated successfully');
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast.error('Failed to update announcement: ' + error.message);
    }
  });

  // Delete announcement mutation
  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const announcementRef = doc(db, 'announcements', id);
      await deleteDoc(announcementRef);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('Announcement deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete announcement: ' + error.message);
    }
  });
  
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = 
      ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPublished = 
      filterPublished === 'all' || 
      (filterPublished === 'published' && ann.publish_at <= new Date()) ||
      (filterPublished === 'scheduled' && ann.publish_at > new Date());
    
    return matchesSearch && matchesPublished;
  });

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setPublishDate(announcement.publish_at);
    setShowEditDialog(true);
  };
  
  const handleDeleteAnnouncement = (announcementId: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncementMutation.mutate(announcementId);
    }
  };
  
  const handleSaveAnnouncement = (event: React.FormEvent<HTMLFormElement>, isEditing: boolean) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const announcementData: Partial<Announcement> = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      type: formData.get('type') as "general" | "emergency" | "event",
      target_blocks: formData.get('target_blocks') ? [formData.get('target_blocks') as string] : [],
      author_id: 'admin-123', // Replace with actual admin ID
    };
    
    if (isEditing && editingAnnouncement) {
      updateAnnouncementMutation.mutate({
        id: editingAnnouncement.id,
        updates: announcementData
      });
    } else {
      createAnnouncementMutation.mutate(announcementData);
    }
  };
  
  const getTargetBadge = (type: string) => {
    switch (type) {
      case 'general': 
        return <Badge className="bg-blue-500">General</Badge>;
      case 'emergency': 
        return <Badge className="bg-red-500">Emergency</Badge>;
      case 'event': 
        return <Badge className="bg-green-500">Event</Badge>;
      default: 
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <AppShell>
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Announcements</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search announcements..."
                className="pl-8 w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterPublished} onValueChange={setFilterPublished}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                  <DialogDescription>
                    Create a new announcement to be displayed to students
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={e => handleSaveAnnouncement(e, false)}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" name="title" placeholder="Announcement title" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea 
                        id="content" 
                        name="content"
                        placeholder="Enter announcement content here..."
                        rows={6}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select name="type" defaultValue="general">
                        <SelectTrigger>
                          <SelectValue placeholder="Select announcement type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                          <SelectItem value="event">Event</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Block (Optional)</Label>
                      <Select name="target_blocks">
                        <SelectTrigger>
                          <SelectValue placeholder="Select target block" />
                        </SelectTrigger>
                        <SelectContent>
                          {blocks.map((block) => (
                            <SelectItem key={block.id} value={block.id}>
                              {block.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                      <div className="space-y-2">
                        <Label>Publish Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !publishDate && "text-muted-foreground"
                            )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {publishDate ? format(publishDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={publishDate}
                              onSelect={setPublishDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Create Announcement</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                      <CardTitle>{announcement.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {getTargetBadge(announcement.type)}
                      {announcement.target_blocks.length > 0 && (
                        <Badge className="ml-2 bg-purple-500">
                          {blocks.find(b => b.id === announcement.target_blocks[0])?.name || 'Specific Block'}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditAnnouncement(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Admin</span>
                      </div>
                <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                    <span>Published: {format(new Date(announcement.publish_at), "PPP")}</span>
                        </div>
                  {announcement.type === 'event' && (
                      <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Event Date: {format(new Date(announcement.publish_at), "PPP")}</span>
                    </div>
                  )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
      </div>

      {/* Edit Announcement Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          {editingAnnouncement && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Announcement</DialogTitle>
                <DialogDescription>
                  Update the announcement details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={e => handleSaveAnnouncement(e, true)}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input 
                      id="edit-title" 
                      name="title" 
                      defaultValue={editingAnnouncement.title}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-content">Content</Label>
                    <Textarea 
                      id="edit-content" 
                      name="content"
                      defaultValue={editingAnnouncement.content}
                      rows={6}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select name="type" defaultValue={editingAnnouncement.type}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select announcement type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Block (Optional)</Label>
                    <Select name="target_blocks">
                      <SelectTrigger>
                        <SelectValue placeholder="Select target block" />
                      </SelectTrigger>
                      <SelectContent>
                        {blocks.map((block) => (
                          <SelectItem key={block.id} value={block.id}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                    <div className="space-y-2">
                      <Label>Publish Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !publishDate && "text-muted-foreground"
                          )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {publishDate ? format(publishDate, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={publishDate}
                            onSelect={setPublishDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
};

export default AdminAnnouncements;
