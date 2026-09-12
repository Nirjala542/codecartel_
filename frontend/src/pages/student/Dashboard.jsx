import React from 'react';
import { TrendingUp, Clock, Award, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScoreDial } from '@/components/ScoreDial';
import { SkillPill } from '@/components/SkillPill';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';
import { interviewService } from '@/services/interviewService';
import { Skeleton } from '@/components/ui/skeleton';

export const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['dashboard', user?.github?.username],
    queryFn: profileService.getDashboard,
    enabled: !!user
  });

  const { data: invites = [] } = useQuery({
    queryKey: ['invites'],
    queryFn: interviewService.getInvites,
    enabled: !!user
  });

  const latestInterview = user?.interviews?.[0];

  const categories = [
    { key: 'frontend', label: 'Frontend', score: profile?.categories?.frontend || 0 },
    { key: 'backend', label: 'Backend', score: profile?.categories?.backend || 0 },
    { key: 'dsa', label: 'DSA', score: profile?.categories?.dsa || 0 },
    { key: 'communication', label: 'Communication', score: profile?.categories?.communication || 0 },
    { key: 'ai_readiness', label: 'AI Readiness', score: profile?.categories?.ai_readiness || 0 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <Skeleton className="w-48 h-48 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-4 w-full">
                <Skeleton className="h-8 w-64 mb-1" />
                <Skeleton className="h-4 w-full max-w-md" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-24" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Skill Dashboard</h1>
        <p className="text-lg text-muted-foreground">Your verified skills at a glance</p>
      </div>

      {profile?.isDataEstimated && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Unverified Estimated Data</p>
            <p>The dataset shown in this profile is not verified as you haven't taken an AI interview yet. This is an AI-generated estimation based on your resume.</p>
          </div>
        </div>
      )}

      {invites?.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">You have {invites.length} pending interview request(s)</p>
              <p>Companies have requested you to take a Live AI Interview based on your profile.</p>
            </div>
          </div>
          <Link to={`/student/interview?inviteId=${invites[0]._id}`}>
            <Button variant="default">Accept & Start Interview</Button>
          </Link>
        </div>
      )}

      {/* Overall Score */}
      <Card data-testid="dashboard-overall-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0" data-testid="dashboard-overall-dial">
              <ScoreDial score={profile?.overallScore || 0} size="lg" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">Overall Skill Score</h3>
                <p className="text-muted-foreground">
                  Based on your GitHub activity, resume analysis, and AI interview performance
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Skills</p>
                  <p className="font-semibold">{profile?.topSkills?.length || 0} skills</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Growth Areas</p>
                  <p className="font-semibold">{profile?.growthAreas?.length || 0} areas</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-semibold">Today</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Skill Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Card key={category.key} data-testid={`dashboard-category-dial-${category.key}`}>
              <CardContent className="pt-6 flex flex-col items-center">
                <ScoreDial score={category.score} size="sm" />
                <p className="mt-3 font-medium text-center">{category.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Skills */}
        <Card data-testid="dashboard-top-skills">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              Top Skills
            </CardTitle>
            <CardDescription>Your strongest areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.topSkills?.map((skill, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.strength}%</span>
                </div>
                <Progress value={skill.strength} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Growth Areas */}
        <Card data-testid="dashboard-growth-areas">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Growth Areas
            </CardTitle>
            <CardDescription>Skills to develop next</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.growthAreas?.map((skill, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.strength}%</span>
                </div>
                <Progress value={skill.strength} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Interview */}
      {latestInterview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent AI Interview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{latestInterview.role}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(latestInterview.date), 'MMM d, yyyy')} • {latestInterview.questions} questions
                </p>
              </div>
              <div className="flex items-center gap-6">
                <ScoreDial score={latestInterview.score} size="sm" />
                <Link to="/student/interview">
                  <Button variant="outline">Take Another</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Continue building your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link to="/student/interview">
              <Button variant="outline" className="w-full">Take AI Interview</Button>
            </Link>
            <Link to="/student/jobs">
              <Button variant="outline" className="w-full">Find Jobs</Button>
            </Link>
            <Link to="/student/twin">
              <Button variant="outline" className="w-full">Ask Career Twin</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};