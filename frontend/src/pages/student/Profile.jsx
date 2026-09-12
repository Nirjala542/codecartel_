import React, { useState } from 'react';
import { Github, Upload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillPill } from '@/components/SkillPill';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';

export const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profileData'],
    queryFn: profileService.getProfileData
  });

  const github = profileData?.github || null;
  const resume = profileData?.resume || null;

  const syncMutation = useMutation({
    mutationFn: profileService.syncGithub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileData'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: profileService.uploadResume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileData'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-lg text-muted-foreground">Manage your GitHub connection and resume</p>
      </div>

      {/* GitHub Card */}
      <Card data-testid="profile-github-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Github className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>GitHub Connection</CardTitle>
                <CardDescription>
                  {github?.connected ? (
                    <span className="flex items-center gap-1 text-accent">
                      <CheckCircle className="w-4 h-4" />
                      Connected as @{github.username}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      Not connected
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
            {github?.connected ? (
              <Button
                variant="outline"
                size="sm"
                data-testid="profile-github-resync-btn"
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                {syncMutation.isPending ? 'Syncing...' : 'Re-sync'}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => window.location.href = 'http://localhost:5000/api/auth/github'}
              >
                Connect GitHub
              </Button>
            )}
          </div>
        </CardHeader>
        {github?.connected && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Repositories</p>
                <p className="text-2xl font-bold">{github.repos}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Stars</p>
                <p className="text-2xl font-bold">{github.stars}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Commits</p>
                <p className="text-2xl font-bold">{github.activity?.commits}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Top Languages</p>
              <div className="flex flex-wrap gap-2">
                {github.topLanguages?.map((lang, idx) => (
                  <SkillPill key={idx} skill={lang} variant="positive" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Top Repositories</p>
              <div className="space-y-3">
                {github.topRepos?.map((repo, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{repo.name}</h4>
                        <p className="text-sm text-muted-foreground">{repo.description}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{repo.language}</span>
                        <span className="flex items-center gap-1">
                          ⭐ {repo.stars}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Last synced: {format(new Date(github.lastSync), 'MMM d, yyyy h:mm a')}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Resume Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <div>
                <CardTitle>Resume</CardTitle>
                <CardDescription>
                  {resume?.uploaded ? (
                    <span className="flex items-center gap-1 text-accent">
                      <CheckCircle className="w-4 h-4" />
                      Resume uploaded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertCircle className="w-4 h-4" />
                      No resume uploaded
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {resume?.uploaded ? (
            <>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium" data-testid="profile-resume-filename">{resume.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded: {format(new Date(resume.uploadDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploadMutation.isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && !uploadMutation.isPending) {
                          uploadMutation.mutate(file);
                        }
                      }}
                    />
                    <Button variant="outline" size="sm" disabled={uploadMutation.isPending}>
                      {uploadMutation.isPending ? 'Replacing...' : 'Replace'}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Parsed Skills</p>
                <div className="flex flex-wrap gap-2">
                  {resume.parsed?.skills?.map((skill, idx) => (
                    <SkillPill key={idx} skill={skill} />
                  ))}
                </div>
              </div>
              {resume.parsed?.experience && (
                <div>
                  <p className="text-sm font-medium mb-3">Experience</p>
                  <div className="space-y-2">
                    {resume.parsed.experience.map((exp, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="font-semibold">{exp.role}</p>
                        <p className="text-sm text-muted-foreground">{exp.company} • {exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.docx"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={uploadMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !uploadMutation.isPending) {
                    uploadMutation.mutate(file);
                  }
                }}
              />
              <div
                data-testid="profile-resume-dropzone"
                className={`border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors ${uploadMutation.isPending ? 'opacity-50' : ''}`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  {uploadMutation.isPending ? 'Parsing Resume with AI...' : 'Drop your resume here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse (PDF, DOCX)</p>
                <Button type="button" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? 'Uploading...' : 'Choose File'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>
            Complete these steps to unlock your full dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            {github?.connected ? (
              <CheckCircle className="w-5 h-5 text-accent" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
            )}
            <span className={!github?.connected ? "text-muted-foreground" : ""}>GitHub connected</span>
          </div>
          <div className="flex items-center gap-3">
            {resume?.uploaded ? (
              <CheckCircle className="w-5 h-5 text-accent" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
            )}
            <span className={!resume?.uploaded ? "text-muted-foreground" : ""}>Resume uploaded</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
            <span className="text-muted-foreground">Complete AI Interview</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};