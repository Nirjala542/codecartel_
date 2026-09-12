import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import { Landing } from '@/pages/Landing';
import { StudentLayout } from '@/pages/student/StudentLayout';
import { Profile } from '@/pages/student/Profile';
import { Dashboard } from '@/pages/student/Dashboard';
import { AIInterview } from '@/pages/student/AIInterview';
import { JobSearch } from '@/pages/student/JobSearch';
import { AtsPolish } from '@/pages/student/AtsPolish';
import { CareerTwin } from '@/pages/student/CareerTwin';
import { RecruiterDashboard } from '@/pages/recruiter/RecruiterDashboard';
import { AuthSuccess } from '@/pages/AuthSuccess';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRole && user.role.toUpperCase() !== allowedRole.toUpperCase()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role.toUpperCase() === 'STUDENT' ? '/student/dashboard' : '/recruiter'} replace /> : <Landing />} />
      <Route path="/auth/success" element={<AuthSuccess />} />
      
      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRole="STUDENT">
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="interview" element={<AIInterview />} />
        <Route path="jobs" element={<JobSearch />} />
        <Route path="ats" element={<AtsPolish />} />
        <Route path="twin" element={<CareerTwin />} />
      </Route>
      
      {/* Recruiter Routes */}
      <Route path="/recruiter" element={
        <ProtectedRoute allowedRole="RECRUITER">
          <RecruiterDashboard />
        </ProtectedRoute>
      } />
      
      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="App">
              <AppRoutes />
              <Toaster />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
