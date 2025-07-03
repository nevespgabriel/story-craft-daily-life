import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Target } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type DailyGoal = Tables<'daily_goals'>;

interface DailyGoalsProps {
  onGoalsUpdated?: () => void;
}

export function DailyGoals({ onGoalsUpdated }: DailyGoalsProps) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodayGoals();
  }, [user]);

  const fetchTodayGoals = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
    }
  };

  const addGoal = async () => {
    if (!user || !newGoal.trim()) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('daily_goals')
      .insert({
        user_id: user.id,
        goal_text: newGoal.trim(),
        date: today,
        completed: false
      });

    if (error) {
      toast({
        title: "Erro ao adicionar meta",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setNewGoal('');
      fetchTodayGoals();
      onGoalsUpdated?.();
      toast({
        title: "Meta adicionada!",
        description: "Sua nova meta foi registrada."
      });
    }

    setLoading(false);
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    const { error } = await supabase
      .from('daily_goals')
      .update({ completed })
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Erro ao atualizar meta",
        description: error.message,
        variant: "destructive"
      });
    } else {
      fetchTodayGoals();
      onGoalsUpdated?.();
      
      const action = completed ? "concluída" : "desmarcada";
      toast({
        title: `Meta ${action}!`,
        description: completed ? "Parabéns pelo progresso!" : "Meta desmarcada."
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from('daily_goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      toast({
        title: "Erro ao remover meta",
        description: error.message,
        variant: "destructive"
      });
    } else {
      fetchTodayGoals();
      onGoalsUpdated?.();
      toast({
        title: "Meta removida",
        description: "A meta foi removida da sua lista."
      });
    }
  };

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;

  return (
    <div className="space-y-4">
      {/* Progress Summary */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Progresso de Hoje
            </span>
          </div>
          <div className="text-sm font-bold">
            {completedCount}/{totalCount} concluídas
          </div>
        </div>
      )}

      {/* Add New Goal */}
      <div className="flex gap-2">
        <Input
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Digite uma nova meta..."
          onKeyPress={(e) => e.key === 'Enter' && addGoal()}
        />
        <Button onClick={addGoal} disabled={loading || !newGoal.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-2">
        {goals.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            Nenhuma meta definida para hoje. Que tal adicionar uma?
          </p>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-3 p-3 border rounded-lg group hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={goal.completed || false}
                onCheckedChange={(checked) => toggleGoal(goal.id, checked as boolean)}
              />
              <div className={`flex-1 ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                {goal.goal_text}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* End of Day Summary */}
      {totalCount > 0 && (
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            {completedCount === 0 && totalCount > 0 && "⚠️ Consequência negativa severa na história"}
            {completedCount > 0 && completedCount < totalCount && "📖 Consequência negativa leve na história"}
            {completedCount === totalCount && completedCount > 0 && "✨ Evento positivo na história!"}
            {completedCount > totalCount && "🏆 Recompensa especial na história!"}
          </p>
        </div>
      )}
    </div>
  );
}