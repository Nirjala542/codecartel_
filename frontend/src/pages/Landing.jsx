import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Users, Target, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ThemeToggle';
import { RecruiterAuthModal } from '@/components/RecruiterAuthModal';

export const Landing = () => {
  const [isRecruiterModalOpen, setIsRecruiterModalOpen] = useState(false);

  const handleRecruiterLogin = () => {
    setIsRecruiterModalOpen(true);
  };

  const features = [
    {
      icon: Shield,
      title: 'Verified Skills',
      description: 'Skills verified through GitHub, resume analysis, and AI interviews - not just self-reported claims.'
    },
    {
      icon: Target,
      title: 'Skill Dashboard',
      description: 'Get a comprehensive view of your Frontend, Backend, DSA, Communication, and AI readiness scores.'
    },
    {
      icon: Sparkles,
      title: 'Career Twin',
      description: 'AI-powered career advisor that gives personalized readiness scores and actionable improvement plans.'
    },
    {
      icon: TrendingUp,
      title: 'Smart Job Matching',
      description: 'Auto-matched opportunities from RemoteOK and Wellfound with skill-gap boosters and match scores.'
    },
    {
      icon: Users,
      title: 'Recruiter Search',
      description: 'Recruiters can filter candidates by verified skills, GitHub activity, and AI interview performance.'
    },
    {
      icon: Github,
      title: 'GitHub Integration',
      description: 'Seamlessly sync your GitHub repos, languages, commits, and contributions for automatic profile building.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">SkillProof</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Skills, <span className="text-primary">Verified</span>.
            <br />Not Claimed.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Prove your skills once — GitHub + Resume + AI Interview — and get a live Skill Dashboard that powers job matching, ATS resume polish, and personalized career guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              data-testid="landing-github-login-btn"
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
            >
              <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/github`}>
                <Github className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleRecruiterLogin}
              data-testid="landing-recruiter-link"
              className="text-lg px-8 py-6"
            >
              I'm a Recruiter →
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h3>
          <p className="text-lg text-muted-foreground">A complete career OS for students and recruiters</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-16">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h3>
          <p className="text-lg text-muted-foreground">Get started in minutes</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Connect GitHub</h4>
              <p className="text-muted-foreground">Sign in with GitHub OAuth. We'll analyze your repos, languages, and commit activity automatically.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Upload Resume</h4>
              <p className="text-muted-foreground">Upload your resume (PDF/DOCX). We'll parse skills, experience, and education to build your profile.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Take AI Interview</h4>
              <p className="text-muted-foreground">Complete a 5-question technical interview. Our AI evaluates your answers and generates a verified score.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-xl shrink-0">
              4
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Unlock Your Dashboard</h4>
              <p className="text-muted-foreground">Access matched jobs, ATS resume polish, Career Twin insights, and get discovered by recruiters.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center space-y-8 p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border">
          <h3 className="text-3xl sm:text-4xl font-bold">Ready to prove your skills?</h3>
          <p className="text-lg text-muted-foreground">Join students and recruiters using SkillProof to connect verified talent with real opportunities.</p>
          <Button
            asChild
            size="lg"
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
          >
            <a href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/github`}>
              <Github className="mr-2 h-5 w-5" />
              Get Started for Free
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 SkillProof. Built for Nerds Hack Days Lucknow.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      <RecruiterAuthModal 
        isOpen={isRecruiterModalOpen} 
        onClose={() => setIsRecruiterModalOpen(false)} 
      />
    </div>
  );
};