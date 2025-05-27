import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import RegisterForm from '@/components/auth/RegisterForm';

const Register: React.FC = () => {
  const isMobile = useMobile();

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat py-10"
      style={{ backgroundImage: 'url("/lovable-uploads/49c3b406-9639-4be0-a86c-2721695dc060.png")' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/70" />

      <div className={`${isMobile ? 'w-full' : 'w-2/5'} px-6 mx-auto z-10`}>
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">ResRoom</h1>
          <p className="text-white/80">Create your account</p>
        </div>
        
        <Card className="border-2 border-white/10 shadow-xl backdrop-blur-sm bg-white/80 animate-fade-in">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <UserPlus size={24} />
              </div>
            </div>
            <CardTitle className="text-xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to register
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <RegisterForm />
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
