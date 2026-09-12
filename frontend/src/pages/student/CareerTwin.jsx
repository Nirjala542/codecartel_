import React, { useState } from 'react';
import { Sparkles, Send, TrendingUp, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { SkillPill } from '@/components/SkillPill';
import { mockCareerTwinQuestions } from '@/data/mockData';
import { useMutation } from '@tanstack/react-query';
import { careerTwinService } from '@/services/careerTwinService';

export const CareerTwin = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState(mockCareerTwinQuestions);

  const askMutation = useMutation({
    mutationFn: careerTwinService.askQuestion,
    onSuccess: (data, variables) => {
      setAnswer(data);
      if (!recentQuestions.includes(variables)) {
        setRecentQuestions([variables, ...recentQuestions.slice(0, 2)]);
      }
      setQuestion('');
    },
  });

  const handleAsk = (q = question) => {
    if (!q || q.length < 5) return;
    askMutation.mutate(q);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold mb-2">Career Twin</h1>
        <p className="text-lg text-muted-foreground">Your AI career advisor powered by your verified profile</p>
      </div>

      {/* Answer Card */}
      {!answer && !askMutation.isPending && (
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Ask About Your Career Readiness</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ask questions like "Am I ready for Amazon SDE-1?" or "What skills do I need for a Senior React Developer role?" 
              and get personalized, grounded answers based on your verified profile.
            </p>
          </CardContent>
        </Card>
      )}

      {askMutation.isPending && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium">Analyzing your profile...</p>
            <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
          </CardContent>
        </Card>
      )}

      {answer && !askMutation.isPending && (
        <Card data-testid="career-twin-answer-card">
          <CardHeader>
            <CardTitle className="text-2xl">{answer.question}</CardTitle>
            <CardDescription>Based on your GitHub, resume, and interview performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 pb-6 border-b border-border">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold mb-1">Readiness Score</h3>
                  <p className="text-sm text-muted-foreground">
                    {answer.readinessScore >= 70 
                      ? 'You\'re in a strong position to apply!'
                      : answer.readinessScore >= 50
                      ? 'You\'re on the right track. Focus on the gaps below.'
                      : 'Build these skills before applying for best results.'
                    }
                  </p>
                </div>
                <span className="text-3xl font-bold text-primary">{answer.readinessScore}%</span>
              </div>
              <Progress value={answer.readinessScore} className="h-3" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div data-testid="career-twin-strengths-list">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Mastered Skills
                </h4>
                <div className="flex flex-col gap-3">
                  {answer.strengths.map((strength, idx) => (
                    <div key={idx} className="flex flex-col items-start gap-1 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                      <SkillPill skill={strength.text} variant="positive" />
                      <p className="text-xs text-muted-foreground ml-1">{strength.citation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div data-testid="career-twin-weaknesses-list">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Missing Skills
                </h4>
                <div className="flex flex-col gap-3">
                  {answer.weaknesses.map((weakness, idx) => (
                    <div key={idx} className="flex flex-col items-start gap-1 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <SkillPill skill={weakness.text} variant="attention" />
                      <p className="text-xs text-muted-foreground ml-1">{weakness.citation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div data-testid="career-twin-booster-plan" className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Step-by-Step Roadmap
              </h4>
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/80"></div>
                {answer.boosterPlan.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-6 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    </div>
                    <div className="bg-background/80 backdrop-blur-sm border border-border p-4 rounded-lg ml-4 shadow-sm hover:border-primary/50 transition-colors">
                      <p className="font-semibold text-foreground">{item.action}</p>
                      <p className="text-sm font-medium text-accent mt-2 flex items-center gap-1">
                        ⏱️ Estimated time: {item.days} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Questions */}
      {recentQuestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Questions</h3>
          <div className="flex flex-wrap gap-2">
            {recentQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(q)}
                data-testid={`career-twin-recent-${idx}`}
                className="px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-sm transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Input
              placeholder="Ask about your readiness for a role or company..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
              data-testid="career-twin-question-input"
              className="flex-1"
            />
            <Button
              onClick={() => handleAsk()}
              disabled={question.length < 5 || askMutation.isPending}
              data-testid="career-twin-submit-btn"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Example: "Am I ready for Google Frontend Engineer?" or "What skills do I need for Senior Full Stack role?"
          </p>
        </CardContent>
      </Card>

      {/* Profile Completion Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-1">Get More Accurate Answers</p>
              <p className="text-sm text-muted-foreground">
                Complete your AI Interview and keep your GitHub synced for the most personalized career guidance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};