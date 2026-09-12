import React, { useState } from 'react';
import { Search, MapPin, SlidersHorizontal, ExternalLink, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScoreDial } from '@/components/ScoreDial';
import { SkillPill } from '@/components/SkillPill';
import { useQuery } from '@tanstack/react-query';
import { jobService } from '@/services/jobService';

export const JobSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [autoMatch, setAutoMatch] = useState(true);
  const [sortBy, setSortBy] = useState('match');
  const [expandedJob, setExpandedJob] = useState(null);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', searchQuery, location],
    queryFn: () => jobService.searchJobs(searchQuery, location)
  });

  const sortedJobs = [...jobs].sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'recent') return new Date(b.posted) - new Date(a.posted);
      return a.company.localeCompare(b.company);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Job Search</h1>
        <p className="text-lg text-muted-foreground">Opportunities matched to your skills</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-role">Role</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search-role"
                  data-testid="jobs-search-input"
                  placeholder="e.g., Frontend Developer"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  data-testid="jobs-location-input"
                  placeholder="Remote, City, etc."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort" data-testid="jobs-sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Match Score</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auto-match">Auto Match</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch
                  id="auto-match"
                  checked={autoMatch}
                  onCheckedChange={setAutoMatch}
                  data-testid="jobs-automatch-toggle"
                />
                <span className="text-sm text-muted-foreground">
                  {autoMatch ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Searching...' : `${sortedJobs.length} opportunities found`}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Live from RemoteOK & Arbeitnow
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="animate-pulse">Loading jobs...</div>
          </div>
        ) : sortedJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-2">No jobs found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </CardContent>
          </Card>
        ) : (
          sortedJobs.map((job) => {
            const isExpanded = expandedJob === job.id;
            
            return (
              <Card
                key={job.id}
                data-testid={`job-card-${job.id}`}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{job.role}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span className="font-medium">{job.company}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                              </span>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded bg-secondary text-xs">
                                {job.platform}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div data-testid={`job-match-dial-${job.id}`}>
                              <ScoreDial score={job.matchScore} size="sm" />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-accent flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {job.matchScore >= 80 ? 'Excellent match' : job.matchScore >= 70 ? 'Good match' : 'Potential match'} based on your profile
                          </p>
                        </div>
                      </div>

                      {!isExpanded && (
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.slice(0, 5).map((req, idx) => (
                            <SkillPill key={idx} skill={req} variant="default" />
                          ))}
                          {job.requirements.length > 5 && (
                            <span className="text-sm text-muted-foreground">+{job.requirements.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 space-y-6 pt-6 border-t border-border">
                      <div>
                        <h4 className="font-semibold mb-3">Job Description</h4>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3">Requirements</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, idx) => (
                            <SkillPill key={idx} skill={req} variant="default" />
                          ))}
                        </div>
                      </div>

                      {job.missingSkills.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <span>Missing Skills</span>
                            <span className="text-xs text-muted-foreground font-normal">(Can improve match score)</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.missingSkills.map((skill, idx) => (
                              <SkillPill key={idx} skill={skill} variant="attention" />
                            ))}
                          </div>
                        </div>
                      )}

                      {job.learnableSkills.length > 0 && (
                        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                          <h4 className="font-semibold mb-2 text-accent">Skill Gap Booster</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            These skills are learnable before the application deadline
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {job.learnableSkills.map((skill, idx) => (
                              <SkillPill key={idx} skill={skill} variant="positive" />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button className="w-full">
                            Apply Now
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </Button>
                        </a>
                        {job.salary && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Salary Range</p>
                            <p className="font-semibold">{job.salary}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    data-testid={`job-expand-${job.id}`}
                    className="mt-4 w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    {isExpanded ? (
                      <>
                        Show Less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show Details <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};