import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, MessageSquare, Briefcase, FileText, Sparkles, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { path: '/student/profile', label: 'Profile', icon: User },
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/interview', label: 'AI Interview', icon: MessageSquare },
  { path: '/student/jobs', label: 'Job Search', icon: Briefcase },
  { path: '/student/ats', label: 'ATS Polish', icon: FileText },
  { path: '/student/twin', label: 'Career Twin', icon: Sparkles },
];

export const StudentSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">SkillProof</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`sidebar-nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                'hover:bg-secondary',
                isActive && 'bg-primary/10 text-primary border-l-2 border-primary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center gap-3 px-4">
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
            alt="Avatar"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-4">
          <ThemeToggle />
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};