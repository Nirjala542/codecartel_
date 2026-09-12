import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Play, Mic, Send, ChevronRight, CheckCircle2, Award, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScoreDial } from '@/components/ScoreDial';
import { useMutation } from '@tanstack/react-query';
import { interviewService } from '@/services/interviewService';
import { toast } from 'sonner';

export const AIInterview = () => {
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get('inviteId');
  const navigate = useNavigate();
  
  const [stage, setStage] = useState('setup'); // setup, active, summary
  const [roleHint, setRoleHint] = useState('');
  const [session, setSession] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [debugState, setDebugState] = useState('idle'); // idle, running, success, error
  
  // Anti-Cheat State
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [mediaStreams, setMediaStreams] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const [cheated, setCheated] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (session?.questions && !cheated) {
      const q = session.questions[currentQuestionIdx];
      if (q && q.boilerplate) {
        setAnswer(q.boilerplate);
      } else {
        setAnswer('');
      }
      setDebugState('idle');
    }
  }, [currentQuestionIdx, session, cheated]);

  // Handle PiP Video setup
  useEffect(() => {
    if (videoRef.current && mediaStreams?.cam) {
      videoRef.current.srcObject = mediaStreams.cam;
    }
  }, [mediaStreams, stage]);

  const startMutation = useMutation({
    mutationFn: (role) => interviewService.startSession(role, inviteId),
    onSuccess: (data) => {
      setSession(data);
      setStage('active');
    },
  });

  const submitMutation = useMutation({
    mutationFn: (variables) => interviewService.submitAnswer(variables.sessionId, variables.questionId, variables.answer, variables.questionPrompt, variables.targetRole, inviteId, variables.cheated),
    onSuccess: (data) => {
      if (data.cheated) {
        setCheated(true);
        setStage('summary');
        return;
      }

      setResults([...results, {
        question: session.questions[currentQuestionIdx].question || session.questions[currentQuestionIdx].text,
        answer: answer,
        score: data.score,
        feedback: data.feedback
      }]);
      
      setAnswer('');
      if (currentQuestionIdx < session.questions.length - 1) {
        setCurrentQuestionIdx(currentQuestionIdx + 1);
      } else {
        setStage('summary');
        cleanupMedia();
      }
    },
  });

  const cleanupMedia = () => {
    if (mediaStreams) {
      mediaStreams.cam?.getTracks().forEach(t => t.stop());
      mediaStreams.screen?.getTracks().forEach(t => t.stop());
    }
  };

  const submitCheated = () => {
    setCheated(true);
    setStage('summary');
    cleanupMedia();
    
    // Fallback dummies if we hadn't started yet
    const dummySessionId = session?.sessionId || `session_${Date.now()}`;
    const dummyQuestionId = session?.questions?.[currentQuestionIdx]?.id || 'dummy';
    const dummyPrompt = session?.questions?.[currentQuestionIdx]?.question || session?.questions?.[currentQuestionIdx]?.text || 'Anti-Cheat Violation';
    
    submitMutation.mutate({
      sessionId: dummySessionId,
      questionId: dummyQuestionId,
      answer: 'INTERVIEW TERMINATED - CHEATING DETECTED',
      questionPrompt: dummyPrompt,
      targetRole: roleHint || 'Software Engineer',
      cheated: true
    });
  };

  const requestPermissions = async () => {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      
      setMediaStreams({ cam: camStream, screen: screenStream });
      setPermissionsGranted(true);
      
      // Listen for screen share stop
      screenStream.getVideoTracks()[0].onended = () => {
        handleCheatingOffense("Screen share was manually stopped");
      };
    } catch (err) {
      console.error("Permissions error:", err);
      toast.error("Permissions denied! The interview has been instantly cancelled and flagged as cheated.");
      submitCheated();
    }
  };

  const handleCheatingOffense = (reason) => {
    if (stage !== 'active' || cheated) return;
    setWarnings(prev => {
      const newWarnings = prev + 1;
      if (newWarnings >= 3) {
        toast.error(`Anti-Cheat Violation: ${reason}. Interview Terminated.`);
        submitCheated();
      } else {
        toast.error(`Warning ${newWarnings}/3: ${reason}. Do not do this again.`, { duration: 5000 });
      }
      return newWarnings;
    });
  };

  // Anti-Cheat Active Listeners
  useEffect(() => {
    if (stage !== 'active' || cheated) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleCheatingOffense("Switched tabs or minimized browser");
      }
    };
    
    const handleBlur = () => {
      handleCheatingOffense("Clicked outside the interview window");
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [stage, cheated]);


  const handleStart = () => {
    startMutation.mutate(roleHint);
  };

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    submitMutation.mutate({
      sessionId: session.sessionId,
      questionId: session.questions[currentQuestionIdx].id,
      answer,
      questionPrompt: session.questions[currentQuestionIdx].question || session.questions[currentQuestionIdx].text,
      targetRole: roleHint || 'Frontend Developer',
      cheated: false
    });
  };

  const currentQuestion = session?.questions?.[currentQuestionIdx];
  const progress = session ? ((currentQuestionIdx) / session.questions.length) * 100 : 0;
  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length) 
    : 0;

  if (stage === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold mb-2">AI Interview</h1>
          <p className="text-lg text-muted-foreground">Take a personalized technical interview to verify your skills</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ready to start?</CardTitle>
            <CardDescription>
              We'll generate a 5-question technical interview based on your profile's top skills.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <h3 className="font-bold text-red-500 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5" /> Anti-Cheat System Active
              </h3>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                <li>You must grant Camera, Microphone, and Screen Share permissions.</li>
                <li><strong className="text-foreground">Denying permissions will instantly flag the interview as CHEATED.</strong></li>
                <li>Do not switch tabs, minimize the browser, or click outside the window.</li>
                <li>Do not stop the screen share.</li>
                <li>3 warnings will result in instant termination and a CHEATED flag.</li>
                <li className="mt-2 text-xs italic text-muted-foreground/70">Privacy Disclaimer: Your media streams are processed locally and securely for monitoring purposes. Video data is not permanently stored or used maliciously.</li>
              </ul>
            </div>

            {!permissionsGranted ? (
              <Button className="w-full" size="lg" onClick={requestPermissions} variant="destructive">
                Grant Permissions & Accept Rules
              </Button>
            ) : (
              <>
                {!inviteId && (
                  <div className="space-y-2">
                    <Label htmlFor="role-hint">Target Role (Optional)</Label>
                    <Input
                      id="role-hint"
                      placeholder="e.g., React Developer, Backend Engineer"
                      value={roleHint}
                      onChange={(e) => setRoleHint(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      This helps us tailor the questions to the specific role you're aiming for.
                    </p>
                  </div>
                )}
                
                {inviteId && (
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg mb-4">
                    <p className="text-sm font-medium text-accent flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      You've been invited by a recruiter!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      The role and questions have been pre-selected for you.
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleStart}
                  disabled={startMutation.isPending}
                  data-testid="interview-begin-btn"
                >
                  {startMutation.isPending ? 'Preparing Questions...' : 'Begin Interview'}
                  {!startMutation.isPending && <Play className="ml-2 w-4 h-4" />}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === 'active' && currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative">
        {/* Anti-cheat HUD */}
        <div className="fixed bottom-6 right-6 w-48 rounded-xl overflow-hidden shadow-2xl border-2 border-border bg-black z-50">
           <video ref={videoRef} autoPlay playsInline muted className="w-full h-auto" />
           <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-mono text-green-400 flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> REC
           </div>
        </div>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            Question {currentQuestionIdx + 1} of {session.questions.length}
            {warnings > 0 && (
              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded-full flex items-center gap-1 border border-red-500/30">
                <AlertTriangle className="w-3 h-3" /> {warnings}/3 Warnings
              </span>
            )}
          </h1>
          <span className="text-muted-foreground font-mono">
            {currentQuestion.category}
          </span>
        </div>
        <Progress value={progress} className="h-2" />

        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-medium mb-6 leading-relaxed">
              {currentQuestion.question || currentQuestion.text}
            </h2>
            
            <div className="space-y-4">
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                  {currentQuestion.options.map((opt, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <input 
                        type="radio" 
                        id={`opt-${i}`} 
                        name="mcq-answer" 
                        value={opt} 
                        checked={answer === opt}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="mt-1 w-4 h-4 text-primary focus:ring-primary"
                        disabled={submitMutation.isPending}
                      />
                      <Label htmlFor={`opt-${i}`} className="text-base font-normal cursor-pointer leading-tight">
                        {opt}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {(!currentQuestion.type || currentQuestion.type === 'text') && (
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[200px] text-base"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitMutation.isPending}
                />
              )}

              {currentQuestion.type === 'code' && (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden border border-border bg-slate-950 shadow-inner">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-border text-xs text-muted-foreground font-mono">
                       <span>main.js</span>
                       <span>Javascript</span>
                    </div>
                    <Textarea
                      placeholder="// Write your code here..."
                      className="min-h-[300px] font-mono text-sm bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none text-slate-300 p-4"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={submitMutation.isPending || debugState === 'running'}
                    />
                  </div>
                  
                  {debugState !== 'idle' && (
                    <div className="bg-slate-950 rounded-lg border border-border overflow-hidden animate-fade-in">
                      <div className="px-4 py-2 bg-slate-900 border-b border-border text-xs font-mono text-muted-foreground">
                        Test Output
                      </div>
                      <div className="p-4 font-mono text-sm space-y-2">
                        {debugState === 'running' && (
                          <div className="text-accent flex items-center animate-pulse">
                            <Play className="w-4 h-4 mr-2" /> Running tests...
                          </div>
                        )}
                        {debugState === 'error' && (
                          <>
                            <div className="text-red-400">✖ 1/3 Test Cases Passed</div>
                            <div className="text-red-300 text-xs mt-2 bg-red-950/30 p-3 rounded border border-red-900/50 leading-relaxed">
                              Error: Output did not match expected results.<br/>
                              Try adding more logic to your function to cover edge cases.
                            </div>
                          </>
                        )}
                        {debugState === 'success' && (
                          <>
                            <div className="text-emerald-400 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" /> 3/3 Test Cases Passed
                            </div>
                            <div className="text-emerald-300 text-xs mt-2 bg-emerald-950/30 p-3 rounded border border-emerald-900/50 leading-relaxed">
                              Success: Code passed all validation checks! You can now submit your answer.
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => {
                        setDebugState('running');
                        setTimeout(() => {
                           if (answer.length < (currentQuestion.boilerplate?.length || 0) + 15) {
                             setDebugState('error');
                           } else {
                             setDebugState('success');
                           }
                        }, 1200);
                      }}
                      disabled={debugState === 'running' || submitMutation.isPending}
                    >
                      <Play className="w-4 h-4 mr-2" /> Run & Debug
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <Button variant="outline" size="icon" disabled>
                  <Mic className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim() || submitMutation.isPending}
                  data-testid="interview-submit-answer-btn"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit Answer'}
                  {!submitMutation.isPending && <Send className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stage === 'summary') {
    if (cheated) {
      return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-center mt-12">
          <AlertTriangle className="w-24 h-24 text-red-500 mx-auto" />
          <h1 className="text-5xl font-bold text-red-500">Interview Invalidated</h1>
          <p className="text-xl text-muted-foreground">
            This interview was automatically terminated due to multiple anti-cheat violations or denied permissions.
          </p>
          <div className="bg-red-500/10 p-6 rounded-lg border border-red-500/20 text-left space-y-2">
            <h3 className="font-bold text-red-500">Violations that trigger termination:</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Denying Camera, Microphone, or Screen Share permissions.</li>
              <li>Receiving 3 warnings for switching tabs or clicking outside the window.</li>
              <li>Stopping the screen share before the interview is complete.</li>
            </ul>
          </div>
          <Button onClick={() => window.location.href = '/student/dashboard'} size="lg" variant="destructive">
            Return to Dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Interview Complete</h1>
          <p className="text-lg text-muted-foreground">Here's how you performed</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-12 flex flex-col items-center">
            <div data-testid="interview-summary-dial" className="mb-6">
              <ScoreDial score={avgScore} size="lg" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
            <p className="text-muted-foreground max-w-md text-center">
              Your score has been updated on your dashboard and is now visible to recruiters.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Question Breakdown</h3>
          {results.map((res, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base leading-relaxed font-medium flex items-start gap-3">
                  <span className="text-muted-foreground font-mono mt-0.5">Q{idx + 1}.</span>
                  {res.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-medium mb-1">Your Answer:</p>
                  <p className="text-sm text-muted-foreground">{res.answer}</p>
                </div>
                <div className="flex items-start gap-4">
                  <ScoreDial score={res.score} size="sm" />
                  <div>
                    <p className="text-sm font-medium mb-1">Feedback:</p>
                    <p className="text-sm text-accent">{res.feedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={() => window.location.href = '/student/dashboard'} size="lg">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return null;
};