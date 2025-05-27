import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, Loader2, Mail, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    student_id: '',
    gender: '',
    phone: '',
    faculty: '',
    program: '',
    year_of_study: ''
  });
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    try {
      const { confirmPassword, ...userData } = formData;
      setIsLoading(true);
      const user = await signup(formData.email, formData.password, userData);
      if (user) {
      toast.success('Registration successful! Please check your email for verification.');
        // Wait for a short delay to ensure the user is properly set in the auth state
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      // Error is handled by the useAuth hook
      console.error('Registration failed:', err);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Register to access the ResRoom platform
        </CardDescription>
      </CardHeader>
      {error && (
        <div className="px-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID</Label>
              <Input 
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="border-muted"
                placeholder="e.g., S12345678"
                autoComplete="off"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <select
              id="gender"
              name="gender"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1">
              <Mail size={14} />
              Email
            </Label>
            <Input 
              id="email"
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password"
              name="password"
                type="password" 
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword"
              name="confirmPassword"
                type="password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
                required
              />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty</Label>
            <Input 
              id="faculty"
              name="faculty"
              type="text"
              value={formData.faculty}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Input 
              id="program"
              name="program"
              type="text"
              value={formData.program}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_of_study">Year of Study</Label>
            <Input 
              id="year_of_study"
              name="year_of_study"
              type="number"
              min="1"
              max="4"
              value={formData.year_of_study}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Registering...</> : 'Register'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegisterForm;
