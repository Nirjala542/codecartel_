import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      loginWithToken(token)
        .then(() => {
          navigate('/student/dashboard');
        })
        .catch(() => {
          toast.error("Failed to authenticate with GitHub");
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-lg text-muted-foreground">Verifying GitHub Authentication...</p>
      </div>
    </div>
  );
};
