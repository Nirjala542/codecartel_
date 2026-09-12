import React, { useState } from 'react';
import { Search, Users, SlidersHorizontal, Github, Award, Mail, ExternalLink, Calendar, GitCommit, Star, CheckCircle2, Clock, Send, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ScoreDial } from '@/components/ScoreDial';
import { SkillPill } from '@/components/SkillPill';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { recruiterService } from '@/services/recruiterService';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { InviteCandidateModal } from '@/components/InviteCandidateModal';

export const RecruiterDashboard = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [skillFilter, setSkillFilter] = useState('');
  const [minScore, setMinScore] = useState([0]);
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'invites'

  // Debounce the skill filter by 500ms to prevent rapid API calls
  const debouncedSkillFilter = useDebounce(skillFilter, 500);

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates', debouncedSkillFilter, minScore[0], locationFilter],
    queryFn: () => recruiterService.searchCandidates(debouncedSkillFilter, minScore[0], locationFilter)
  });

  const { data: sentInvites = [], isLoading: loadingInvites } = useQuery({
    queryKey: ['sentInvites'],
    queryFn: recruiterService.getInvites
  });

  const [invitedCandidates, setInvitedCandidates] = useState(new Set());
  const [inviteModalCandidate, setInviteModalCandidate] = useState(null);

  const handleInvite = async (studentId, targetRole, customQuestions) => {
    try {
      await recruiterService.sendInvite(studentId, targetRole, customQuestions);
      setInvitedCandidates((prev) => new Set(prev).add(studentId));
      queryClient.invalidateQueries(['sentInvites']);
      toast.success(`Invite sent successfully`);
    } catch (err) {
      if (err.response?.data?.msg) {
        toast.error(err.response.data.msg);
      } else {
        toast.error('Failed to send invite');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">SkillProof</h1>
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                Recruiter
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-2">Candidate Search</h2>
              <p className="text-lg text-muted-foreground">Find verified talent with real skills</p>
            </div>
            
            <div className="flex bg-secondary/50 p-1 rounded-lg">
              <Button 
                variant={activeTab === 'search' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('search')}
              >
                <Search className="w-4 h-4 mr-2" />
                Find Candidates
              </Button>
              <Button 
                variant={activeTab === 'invites' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setActiveTab('invites')}
              >
                <Send className="w-4 h-4 mr-2" />
                Sent Invites
              </Button>
            </div>
          </div>

          {activeTab === 'search' ? (
            <>
              {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </CardTitle>
              <CardDescription>Refine your candidate search</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="skills">Name or Skills</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="skills"
                      data-testid="recruiter-skills-filter"
                      placeholder="e.g., Alex, React, Python"
                      value={skillFilter}
                      onChange={(e) => setSkillFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-score">Minimum Score: {minScore[0]}</Label>
                  <Slider
                    id="min-score"
                    data-testid="recruiter-min-score-slider"
                    value={minScore}
                    onValueChange={setMinScore}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Remote, San Francisco"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Searching...' : `${candidates.length} candidates found`}
            </p>
            <Button data-testid="recruiter-search-btn">Export Results</Button>
          </div>

          {/* Candidate Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6 space-y-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Skeleton className="w-32 h-32 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No candidates found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSkillFilter('');
                    setMinScore([0]);
                    setLocationFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {candidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  data-testid={`recruiter-candidate-card-${candidate.id}`}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-start gap-4">
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Github className="w-3 h-3" />
                            @{candidate.github.username}
                          </p>
                          <p className="text-sm text-muted-foreground">{candidate.location}</p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex items-center justify-center" data-testid={`recruiter-candidate-dial-${candidate.id}`}>
                        <ScoreDial score={candidate.overallScore} size="md" />
                      </div>

                      {/* Skills */}
                      <div>
                        <p className="text-sm font-medium mb-2">Top Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.topSkills.map((skill, idx) => (
                            <SkillPill key={idx} skill={skill} variant="default" />
                          ))}
                        </div>
                      </div>

                      {/* GitHub Activity */}
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          GitHub Activity
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Commits</p>
                            <p className="font-semibold">{candidate.github.commits}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Stars</p>
                            <p className="font-semibold">{candidate.github.stars}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {candidate.github.activity}
                        </p>
                      </div>

                      {/* Latest Interview */}
                      {candidate.latestInterview && (
                        <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                          <p className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-accent" />
                            Latest AI Interview
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold">Score: {candidate.latestInterview.score}%</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(candidate.latestInterview.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => setSelectedCandidate(candidate)}>
                            View Profile
                          </Button>
                          <Button variant="outline" className="flex-1">Contact</Button>
                        </div>
                        <Button 
                          className="w-full"
                          variant={invitedCandidates.has(candidate.id) ? "secondary" : "default"}
                          onClick={() => setInviteModalCandidate(candidate)}
                          disabled={invitedCandidates.has(candidate.id)}
                        >
                          {invitedCandidates.has(candidate.id) ? "✓ Invite Sent" : "Request Live AI Interview"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
            /* Sent Invites View */
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold mb-4">Your Interview Invites</h3>
              
              {loadingInvites ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                </div>
              ) : sentInvites.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Send className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                    <h3 className="text-xl font-semibold mb-2">No invites sent yet</h3>
                    <p className="text-muted-foreground">Search for candidates and request live AI interviews to see them here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sentInvites.map(invite => (
                    <Card key={invite.id} className={invite.status === 'COMPLETED' ? (invite.flaggedForCheating ? 'border-red-500/50 bg-red-500/5' : 'border-primary/50 bg-primary/5') : ''}>
                      <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <img src={invite.student?.avatar} alt={invite.student?.name} className="w-12 h-12 rounded-full" />
                          <div>
                            <h4 className="font-bold text-lg">{invite.student?.name}</h4>
                            <p className="text-sm text-muted-foreground">{invite.student?.email}</p>
                          </div>
                        </div>

                        <div className="flex-1 max-w-sm">
                          {invite.status === 'COMPLETED' ? (
                            invite.flaggedForCheating ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold flex items-center gap-1 text-red-500">
                                    <AlertTriangle className="w-4 h-4" /> CHEATING DETECTED
                                  </span>
                                </div>
                                <p className="text-xs text-red-500/80">Interview automatically terminated due to anti-cheat violations.</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium flex items-center gap-1 text-primary">
                                    <CheckCircle2 className="w-4 h-4" /> Completed
                                  </span>
                                  <span className="font-bold text-xl">{invite.score}%</span>
                                </div>
                                <Progress value={invite.score} className="h-2" />
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                              <Clock className="w-5 h-5" />
                              <span className="font-medium">Pending Candidate Completion</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <p className="text-xs text-muted-foreground text-right mb-1">
                            Sent: {format(new Date(invite.createdAt), 'MMM d, yyyy')}
                          </p>
                          {invite.status === 'COMPLETED' && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                alert(`AI Feedback for ${invite.student?.name}:\n\n${invite.aiFeedback}`);
                              }}
                            >
                              View Full Result
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Detailed Candidate Profile Sheet */}
      <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedCandidate && (
            <div className="space-y-8 py-6">
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <img src={selectedCandidate.avatar} alt={selectedCandidate.name} className="w-20 h-20 rounded-full" />
                  <div>
                    <SheetTitle className="text-2xl">{selectedCandidate.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-1 mt-1">
                      <Github className="w-4 h-4" />
                      @{selectedCandidate.github.username}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Overall Score */}
                <div className="flex flex-col items-center p-6 bg-accent/5 rounded-xl border border-accent/10">
                  <h3 className="text-lg font-medium mb-4">SkillProof Score</h3>
                  <ScoreDial score={selectedCandidate.overallScore} size="lg" />
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Verified Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.topSkills.map((skill, idx) => (
                      <SkillPill key={idx} skill={skill} variant="default" />
                    ))}
                    {/* Removed hardcoded skills */}
                  </div>
                </div>

                {/* GitHub Deep Dive */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">GitHub Deep Dive</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-secondary/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <GitCommit className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xl font-bold">{selectedCandidate.github.commits}</p>
                          <p className="text-xs text-muted-foreground">Commits</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary/20">
                      <CardContent className="p-4 flex items-center gap-3">
                        <Star className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xl font-bold">{selectedCandidate.github.stars}</p>
                          <p className="text-xs text-muted-foreground">Stars Earned</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <p className="text-sm mt-3 bg-secondary/50 p-3 rounded-md text-muted-foreground">
                    {selectedCandidate.github.activity}
                  </p>
                </div>

                {/* Interview Analysis */}
                {selectedCandidate.latestInterview && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Latest AI Interview</h3>
                    <Card className="bg-accent/5 border-accent/20">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <span className="font-medium text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> 
                            {format(new Date(selectedCandidate.latestInterview.date), 'MMMM d, yyyy')}
                          </span>
                          <span className="text-accent font-bold">{selectedCandidate.latestInterview.score}% Score</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {selectedCandidate.latestInterview.feedback || "Detailed AI feedback is available in the full profile."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button className="flex-1" onClick={() => setInviteModalCandidate(selectedCandidate)} disabled={invitedCandidates.has(selectedCandidate.id)}>
                    <Mail className="w-4 h-4 mr-2" />
                    {invitedCandidates.has(selectedCandidate.id) ? "Invite Sent" : "Send Invite"}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Full Resume
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <InviteCandidateModal 
        isOpen={!!inviteModalCandidate} 
        onClose={() => setInviteModalCandidate(null)} 
        student={inviteModalCandidate}
        onInvite={handleInvite}
      />
    </div>
  );
};