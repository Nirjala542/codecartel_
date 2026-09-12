import React, { useState } from 'react';
import { FileText, Upload, Copy, Check, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScoreDial } from '@/components/ScoreDial';
import { SkillPill } from '@/components/SkillPill';
import { Label } from '@/components/ui/label';
import { useMutation, useQuery } from '@tanstack/react-query';
import { atsService } from '@/services/atsService';
import { profileService } from '@/services/profileService';

export const AtsPolish = () => {
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfileData
  });

  const scoreMutation = useMutation({
    mutationFn: atsService.scoreResume,
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleScore = () => {
    if (jdText.split(' ').length < 30) return;
    scoreMutation.mutate(jdText);
  };

  const handleCopy = () => {
    if (!result?.polishedResume) return;
    navigator.clipboard.writeText(result.polishedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isJdValid = jdText.split(' ').length >= 30;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">ATS Polish</h1>
        <p className="text-lg text-muted-foreground">Optimize your resume for any job description</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Your Resume
              </CardTitle>
              <CardDescription>We'll use your currently active resume</CardDescription>
            </CardHeader>
            <CardContent>
              {isProfileLoading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : profile?.resume?.uploaded ? (
                <div className="p-4 rounded-lg border border-border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="font-medium">{profile.resume.filename}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Uploaded {new Date(profile.resume.uploadDate || Date.now()).toLocaleDateString()}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/student/dashboard'}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Different Version
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-border bg-muted/50 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-500 mb-2" />
                  <p className="font-medium">No Resume Uploaded</p>
                  <p className="text-sm text-muted-foreground mb-4">Please upload a resume in the dashboard first.</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.href = '/student/dashboard'}>
                    <Upload className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Paste the full job description below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jd-input">Job Description</Label>
                <Textarea
                  id="jd-input"
                  data-testid="ats-jd-input"
                  placeholder="Paste the complete job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  {jdText.length} characters {jdText.length < 30 && '(minimum 30 required)'}
                </p>
              </div>
              <Button
                onClick={handleScore}
                data-testid="ats-score-polish-btn"
                disabled={jdText.length < 30 || scoreMutation.isPending}
                className="w-full"
              >
                {scoreMutation.isPending ? (
                  'Analyzing...'
                ) : (
                  <>
                    <Sparkles className="mr-2 w-4 h-4" />
                    Score & Polish Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {!result && (
            <Card className="lg:h-full">
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Ready to Optimize</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Paste a job description and we'll analyze your ATS score and generate an optimized resume
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              <Card data-testid="ats-score-dial">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-8">
                    <ScoreDial score={result.atsScore} size="lg" />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">ATS Score</h3>
                      <p className="text-sm text-muted-foreground">
                        {result.atsScore >= 70 
                          ? 'Great score! Your resume should pass most ATS systems.'
                          : 'Room for improvement. Add the missing keywords below.'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result.missingKeywords.length > 0 && (
                <Card data-testid="ats-missing-keywords">
                  <CardHeader>
                    <CardTitle>Missing Keywords</CardTitle>
                    <CardDescription>Add these to improve your ATS score</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.missingKeywords.map((keyword, idx) => (
                        <SkillPill key={idx} skill={keyword} variant="attention" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Polished Resume</CardTitle>
                      <CardDescription>ATS-optimized version with keywords</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      data-testid="ats-copy-btn"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    data-testid="ats-polished-textarea"
                    value={result.polishedResume}
                    onChange={(e) => setResult({ ...result, polishedResume: e.target.value })}
                    rows={20}
                    className="resize-none font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};