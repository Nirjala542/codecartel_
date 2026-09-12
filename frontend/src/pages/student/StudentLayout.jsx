import React from 'react';
import { Outlet } from 'react-router-dom';
import { StudentSidebar } from '@/components/StudentSidebar';

export const StudentLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <StudentSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};