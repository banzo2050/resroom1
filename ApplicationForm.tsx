import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { createApplication } from '@/services/applications';
import { fetchBlocks } from '@/services/blockService';
import { useQuery } from '@tanstack/react-query';
import { Block } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/main';
import { Loader2 } from 'lucide-react';

const ApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentGender, setStudentGender] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    academicYear: "2025-2026",
    semester: "",
    blockPreference: "",
    roomTypePreference: "",
    specialRequirements: ""
  });

  // Fetch student profile to get gender
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user?.id) {
        setProfileError('User not authenticated');
        setIsLoadingProfile(false);
        return;
      }

      try {
        const profileDoc = await getDoc(doc(db, 'profiles', user.id));
        
        if (!profileDoc.exists()) {
          setProfileError('Profile not found');
          return;
        }

        const profileData = profileDoc.data();
        if (!profileData?.gender) {
          setProfileError('Gender information not found in profile');
        } else {
          setStudentGender(profileData.gender);
        }
      } catch (error) {
        console.error('Error fetching student profile:', error);
        setProfileError('Failed to load profile information');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchStudentProfile();
  }, [user?.id]);

  // Fetch available blocks filtered by gender
  const { data: blocks = [], isLoading: isLoadingBlocks } = useQuery({
    queryKey: ['blocks', studentGender],
    queryFn: async () => {
      if (!studentGender) return [];
      return fetchBlocks(studentGender);
    },
    enabled: !!studentGender
  });
  
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.semester || !formData.roomTypePreference) {
      toast.error("Please complete all required fields");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to submit an application");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create application in database
      await createApplication({
        student_id: user.id,
        preferred_block_id: formData.blockPreference || undefined,
        room_type: formData.roomTypePreference as any,
        special_requirements: formData.specialRequirements
      });
      
      toast.success('Application submitted successfully!');
      // Navigate to applications list
      navigate('/applications');
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <AppShell>
        <div className="page-container max-w-3xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              Loading your profile information...
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (profileError) {
    return (
      <AppShell>
        <div className="page-container max-w-3xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-destructive mb-4">{profileError}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!studentGender) {
    return (
      <AppShell>
        <div className="page-container max-w-3xl">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-destructive mb-4">Your profile is missing gender information. Please update your profile first.</p>
            <Button onClick={() => navigate('/profile')}>
              Update Profile
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page-container max-w-3xl">
        <div className="mb-6">
          <h1 className="mb-2">Accommodation Application</h1>
          <p className="text-muted-foreground">
            Please complete all required fields to apply for student accommodation
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Residence Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input 
                  id="academicYear" 
                  value={formData.academicYear} 
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="semester">Semester <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.semester} 
                  onValueChange={(value) => handleChange('semester', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="First">First Semester</SelectItem>
                    <SelectItem value="Second">Second Semester</SelectItem>
                    <SelectItem value="Both">Both Semesters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="blockPreference">Block Preference</Label>
                <Select 
                  value={formData.blockPreference} 
                  onValueChange={(value) => handleChange('blockPreference', value)}
                  disabled={isLoadingBlocks}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingBlocks ? "Loading blocks..." : "Select preferred block (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks.length > 0 ? (
                      blocks.map((block: Block) => (
                        <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No blocks available for your gender</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomTypePreference">Room Type <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.roomTypePreference} 
                  onValueChange={(value) => handleChange('roomTypePreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Room</SelectItem>
                    <SelectItem value="double">Double Room</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-2">
                <Label htmlFor="specialRequirements">Special Requirements or Accommodations</Label>
                <Textarea 
                  id="specialRequirements" 
                  placeholder="Please describe any special needs or accommodation requirements" 
                  className="min-h-28"
                  value={formData.specialRequirements}
                  onChange={(e) => handleChange('specialRequirements', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};

export default ApplicationForm;
