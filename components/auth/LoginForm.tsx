import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { AlertCircle, Loader2, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to access your ResRoom account
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
            <Label htmlFor="password" className="flex items-center gap-1">
              <Lock size={14} />
              Password
            </Label>
            <Input 
              id="password"
              name="password"
              type="password" 
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 size={16} className="mr-2 animate-spin" /> Signing in...</> : 'Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm; 