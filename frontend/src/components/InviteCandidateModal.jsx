import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

export const InviteCandidateModal = ({ isOpen, onClose, student, onInvite }) => {
  const [role, setRole] = useState('');
  const [questions, setQuestions] = useState(['']); // Start with one empty question box
  const [loading, setLoading] = useState(false);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Filter out any empty question boxes
      const customQuestions = questions
        .map((q) => q.trim())
        .filter((q) => q.length > 0);

      await onInvite(student.id, role, customQuestions);
      onClose();
      // Reset form
      setRole('');
      setQuestions(['']);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite {student?.name} to Interview</DialogTitle>
          <DialogDescription>
            Specify the role you are hiring for. Optionally, provide custom questions.
            If you leave questions blank, our AI will generate them for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="target-role">Target Role <span className="text-red-500">*</span></Label>
            <Input 
              id="target-role" 
              placeholder="e.g. Senior Frontend Developer" 
              required 
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <Label>Custom Questions (Optional)</Label>
            {questions.map((q, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input 
                  placeholder={`Question ${index + 1}...`}
                  value={q}
                  onChange={(e) => handleQuestionChange(index, e.target.value)}
                  className="flex-1"
                />
                {questions.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeQuestion(index)}
                    className="text-muted-foreground hover:text-red-500 shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addQuestion}
              className="mt-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Question
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={loading || !role.trim()}>
            {loading ? 'Sending Invite...' : 'Send Interview Invite'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
