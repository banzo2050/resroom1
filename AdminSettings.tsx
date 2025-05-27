
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth';
import AppShell from '@/components/layout/AppShell';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { AlertTriangle, CheckCircle2, Loader2, Mail, KeyRound, User } from 'lucide-react';
import { updateUserEmail, updateUserPassword, updateUserProfile } from '@/services/authService';

const profileFormSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
});

const emailFormSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type EmailFormValues = z.infer<typeof emailFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const AdminSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: '',
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return;
    
    try {
      setIsLoadingProfile(true);
      
      const fullName = `${data.firstName} ${data.lastName}`;
      
      const { error } = await updateUserProfile(user.id, {
        full_name: fullName,
        phone: data.phone || undefined,
      });
      
      if (error) {
        throw error;
      }
      
      await refreshUser();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function onEmailSubmit(data: EmailFormValues) {
    try {
      setIsLoadingEmail(true);
      
      const { error } = await updateUserEmail(data.email);
      
      if (error) {
        throw error;
      }
      
      toast.success('Email update initiated. Please check your inbox for verification.', {
        duration: 6000,
      });
    } catch (error: any) {
      console.error('Failed to update email:', error);
      toast.error(error.message || 'Failed to update email');
    } finally {
      setIsLoadingEmail(false);
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    try {
      setIsLoadingPassword(true);
      
      const { error } = await updateUserPassword(data.newPassword);
      
      if (error) {
        throw error;
      }
      
      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (error: any) {
      console.error('Failed to update password:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsLoadingPassword(false);
    }
  }

  return (
    <AppShell>
      <div className="container max-w-screen-lg py-6">
        <h1 className="text-2xl font-bold mb-6">Admin Account Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Password
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone number</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number (optional)" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will be used for important notifications.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoadingProfile}>
                      {isLoadingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>
                  Change the email address associated with your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" type="email" {...field} />
                          </FormControl>
                          <FormDescription>
                            A verification email will be sent to the new address.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-sm text-amber-800">
                        After changing your email, you'll need to verify it before using it to log in.
                      </p>
                    </div>
                    <Button type="submit" disabled={isLoadingEmail}>
                      {isLoadingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Update Email
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to maintain account security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            At least 8 characters with a mix of letters, numbers and symbols.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input placeholder="••••••••" type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isLoadingPassword}>
                      {isLoadingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default AdminSettings;
