import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Scroll, Wand2, Calendar, TrendingUp, TrendingDown, Star, AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type StoryProgress = Tables<'story_progress'>;
type FavoriteStory = Tables<'favorite_stories'>;

interface StoryProgressProps {
  favoriteStories: FavoriteStory[];
}

const impactIcons = {
  positive: TrendingUp,
  negative: TrendingDown,
  extra_reward: Star,
  severe_penalty: AlertTriangle
};

const impactLabels = {
  positive: 'Positivo',
  negative: 'Negativo',
  extra_reward: 'Recompensa Extra',
  severe_penalty: 'Punição Severa'
};

const impactColors = {
  positive: 'bg-green-500',
  negative: 'bg-orange-500',
  extra_reward: 'bg-yellow-500',
  severe_penalty: 'bg-red-500'
};

export function StoryProgress({ favoriteStories }: StoryProgressProps) {
  const { user } = useAuth();
  const [storyEntries, setStoryEntries] = useState<StoryProgress[]>([]);
  const [todayEntry, setTodayEntry] = useState<StoryProgress | null>(null);
  const [customSummary, setCustomSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStoryProgress();
  }, [user]);

  const fetchStoryProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('story_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching story progress:', error);
    } else {
      setStoryEntries(data || []);
      
      // Check if there's an entry for today
      const today = new Date().toISOString().split('T')[0];
      const todayStory = data?.find(entry => entry.date === today);
      setTodayEntry(todayStory || null);
    }
  };

  const generateStoryUpdate = async () => {
    if (!user) return;

    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Get today's goals
      const { data: todayGoals, error: goalsError } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      if (goalsError) throw goalsError;

      const totalGoals = todayGoals?.length || 0;
      const completedGoals = todayGoals?.filter(g => g.completed).length || 0;

      // Determine impact type
      let impactType: 'positive' | 'negative' | 'extra_reward' | 'severe_penalty';
      
      if (totalGoals === 0) {
        impactType = 'negative';
      } else if (completedGoals === 0) {
        impactType = 'severe_penalty';
      } else if (completedGoals < totalGoals) {
        impactType = 'negative';
      } else if (completedGoals === totalGoals) {
        impactType = 'positive';
      } else {
        impactType = 'extra_reward';
      }

      // Generate a simple story based on favorite stories and performance
      const storyTitles = favoriteStories.map(s => s.title).join(', ');
      const userName = user.user_metadata?.name || 'Herói';
      
      let generatedSummary = '';
      
      switch (impactType) {
        case 'positive':
          generatedSummary = `${userName} demonstrou determinação hoje, conquistando todas as suas metas. Inspirado pelos mundos de ${storyTitles}, nosso protagonista avança com confiança em sua jornada épica. Uma nova habilidade foi desbloqueada e o caminho adiante se ilumina com possibilidades.`;
          break;
        case 'negative':
          generatedSummary = `${userName} enfrentou desafios hoje e algumas metas ficaram incompletas. Como nos momentos difíceis de ${storyTitles}, nosso herói deve aprender com os obstáculos. A jornada continua, mas com maior cautela e sabedoria adquirida através da adversidade.`;
          break;
        case 'extra_reward':
          generatedSummary = `${userName} superou todas as expectativas hoje! Assim como os grandes heróis de ${storyTitles}, nosso protagonista não apenas cumpriu suas metas, mas foi além. Uma recompensa especial aguarda: um artefato mágico foi descoberto e novos caminhos se abrem na aventura.`;
          break;
        case 'severe_penalty':
          generatedSummary = `${userName} enfrentou um dia sombrio sem conseguir completar nenhuma meta. Como nos momentos mais desesperadores de ${storyTitles}, nosso herói deve encontrar força interior para superar esta queda. O caminho se tornou mais perigoso, mas ainda há esperança de redenção.`;
          break;
      }

      const finalSummary = customSummary.trim() || generatedSummary;

      // Save story progress
      const { error: insertError } = await supabase
        .from('story_progress')
        .upsert({
          user_id: user.id,
          date: today,
          summary: finalSummary,
          impact_type: impactType
        }, {
          onConflict: 'user_id,date'
        });

      if (insertError) throw insertError;

      setCustomSummary('');
      fetchStoryProgress();
      
      toast({
        title: "História atualizada!",
        description: "Sua aventura épica continua..."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar história",
        description: error.message,
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Generate Today's Story */}
      {!todayEntry && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="font-medium">Gerar História de Hoje</span>
          </div>
          
          <Textarea
            value={customSummary}
            onChange={(e) => setCustomSummary(e.target.value)}
            placeholder="Personalize sua história de hoje (opcional) ou deixe em branco para gerar automaticamente baseado no seu desempenho..."
            rows={3}
          />
          
          <Button onClick={generateStoryUpdate} disabled={loading} className="w-full">
            {loading ? "Gerando..." : "Gerar História de Hoje"}
          </Button>
        </div>
      )}

      {/* Today's Entry */}
      {todayEntry && (
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium">Hoje</span>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                {React.createElement(impactIcons[todayEntry.impact_type as keyof typeof impactIcons], {
                  className: "h-3 w-3"
                })}
                {impactLabels[todayEntry.impact_type as keyof typeof impactLabels]}
              </Badge>
            </div>
            <p className="text-sm leading-relaxed">{todayEntry.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Story History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scroll className="h-4 w-4 text-primary" />
          <span className="font-medium">História Anterior</span>
        </div>
        
        {storyEntries.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            Sua aventura épica começará quando você definir suas primeiras metas!
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {storyEntries
              .filter(entry => entry.date !== new Date().toISOString().split('T')[0])
              .map((entry) => {
                const Icon = impactIcons[entry.impact_type as keyof typeof impactIcons];
                return (
                  <Card key={entry.id} className="border-l-4" style={{
                    borderLeftColor: `hsl(var(--${entry.impact_type === 'positive' ? 'green' : 
                      entry.impact_type === 'negative' ? 'orange' :
                      entry.impact_type === 'extra_reward' ? 'yellow' : 'red'}-500) / 0.5)`
                  }}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.date)}
                        </span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {impactLabels[entry.impact_type as keyof typeof impactLabels]}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{entry.summary}</p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}