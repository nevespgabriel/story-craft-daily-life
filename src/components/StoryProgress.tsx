import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Scroll, Wand2, Calendar, TrendingUp, TrendingDown, Star, AlertTriangle, Sparkles } from 'lucide-react';
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
  const [aiGenerating, setAiGenerating] = useState(false);

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

  const generateAIStory = async (impactType: string, goalData: any, userName: string) => {
    setAiGenerating(true);
    
    try {
      // Get the last few story entries for context
      const recentStories = storyEntries
        .filter(entry => entry.date !== new Date().toISOString().split('T')[0])
        .slice(0, 3)
        .reverse(); // Get chronological order

      // Prepare the context for AI
      const storyContext = {
        userName,
        favoriteStories: favoriteStories.map(story => ({
          title: story.title,
          type: story.type,
          narrativeTag: story.narrative_tag
        })),
        recentStories: recentStories.map(story => ({
          date: story.date,
          summary: story.summary,
          impactType: story.impact_type
        })),
        todayPerformance: {
          impactType,
          totalGoals: goalData.totalGoals,
          completedGoals: goalData.completedGoals,
          goals: goalData.goals
        }
      };

      // Call AI service (this would be your actual AI API call)
      const aiStory = await callAIStoryGenerator(storyContext);
      
      setAiGenerating(false);
      return aiStory;
    } catch (error) {
      console.error('Error generating AI story:', error);
      setAiGenerating(false);
      
      // Fallback to basic story generation
      return generateBasicStory(impactType, goalData, userName);
    }
  };

  const callAIStoryGenerator = async (context: any): Promise<string> => {
    // This is where you would integrate with your AI service
    // For now, I'll create a more sophisticated prompt-based generation
    
    const prompt = createStoryPrompt(context);
    
    // Simulate AI call - replace this with actual AI service call
    // Example: OpenAI, Claude, or your preferred AI service
    /*
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context })
    });
    
    const result = await response.json();
    return result.story;
    */
    
    // For now, return an enhanced story based on the context
    return generateEnhancedStory(context);
  };

  const createStoryPrompt = (context: any): string => {
    const { userName, favoriteStories, recentStories, todayPerformance } = context;
    
    return `
You are a master storyteller creating an epic, personalized adventure narrative. 

PROTAGONIST: ${userName}

STORY UNIVERSE: Blend elements from these favorite stories:
${favoriteStories.map((story: any) => `- ${story.title} (${story.type}${story.narrativeTag ? `, ${story.narrativeTag}` : ''})`).join('\n')}

RECENT STORY CONTEXT:
${recentStories.length > 0 ? recentStories.map((story: any) => 
  `${story.date}: ${story.summary} [${story.impactType}]`
).join('\n') : 'This is the beginning of the adventure.'}

TODAY'S PERFORMANCE:
- Impact Type: ${todayPerformance.impactType}
- Goals Set: ${todayPerformance.totalGoals}
- Goals Completed: ${todayPerformance.completedGoals}
- Specific Goals: ${todayPerformance.goals?.map((g: any) => `"${g.goal_text}" (${g.completed ? 'completed' : 'not completed'})`).join(', ')}

INSTRUCTIONS:
1. Continue the narrative from where the recent stories left off
2. Incorporate consequences based on today's performance
3. Blend themes and elements from the favorite stories naturally
4. Keep the story engaging, around 150-200 words
5. End with a hook for tomorrow's adventure
6. Make ${userName} feel like the hero of their own epic tale

Write the next chapter of ${userName}'s adventure:
    `;
  };

  const generateEnhancedStory = (context: any): string => {
    const { userName, favoriteStories, recentStories, todayPerformance } = context;
    
    // Create a more sophisticated story based on context
    const storyElements = favoriteStories.map((story: any) => story.title).slice(0, 2);
    const hasRecentContext = recentStories.length > 0;
    
    let story = '';
    
    // Opening based on recent context
    if (hasRecentContext) {
      const lastStory = recentStories[recentStories.length - 1];
      if (lastStory.impactType === 'positive') {
        story += `Riding the wave of recent victories, ${userName} faced today's challenges with renewed confidence. `;
      } else if (lastStory.impactType === 'negative') {
        story += `Still recovering from recent setbacks, ${userName} approached today with determination to turn things around. `;
      } else {
        story += `Building upon recent experiences, ${userName} stepped into today's adventure. `;
      }
    } else {
      story += `In a world where ${storyElements.join(' and ')} converge, ${userName} begins an epic journey. `;
    }

    // Main story based on performance
    switch (todayPerformance.impactType) {
      case 'positive':
        story += `Today's disciplined pursuit of goals paid off magnificently. Like the heroes of ${storyElements[0] || 'legend'}, ${userName} demonstrated unwavering focus and achieved every objective set forth. The universe responded with favor - new allies emerged, hidden paths revealed themselves, and the protagonist's reputation grew among both friends and rivals. `;
        break;
      case 'negative':
        story += `Today brought challenges that tested ${userName}'s resolve. Some goals remained unfinished, creating ripples of consequence throughout the adventure. Like the trials faced in ${storyElements[0] || 'great tales'}, these setbacks serve as lessons. The path ahead grows more treacherous, but also more rewarding for those who persevere. `;
        break;
      case 'extra_reward':
        story += `Today was nothing short of legendary! ${userName} not only conquered every planned objective but went beyond, achieving feats that surprised even the most optimistic expectations. The cosmos itself seemed to celebrate - rare treasures appeared, powerful allies pledged their support, and whispers of ${userName}'s extraordinary deeds spread across the realm. `;
        break;
      case 'severe_penalty':
        story += `A dark day in ${userName}'s chronicle. With no goals achieved, the adventure took a perilous turn. Like the darkest moments in ${storyElements[0] || 'epic tales'}, when heroes face their greatest trials, the world around ${userName} grew hostile. Allies questioned their faith, enemies grew bolder, and the path forward became shrouded in uncertainty. `;
        break;
    }

    // Closing hook
    const hooks = [
      "Tomorrow's dawn brings new mysteries to unravel...",
      "But this is merely the prelude to greater adventures ahead...",
      "The next chapter of this epic tale awaits...",
      "What challenges will tomorrow's sunrise reveal?",
      "The adventure continues, with destiny calling..."
    ];
    
    story += hooks[Math.floor(Math.random() * hooks.length)];
    
    return story;
  };

  const generateBasicStory = (impactType: string, goalData: any, userName: string): string => {
    // Fallback basic story generation (your existing logic)
    const storyTitles = favoriteStories.map(s => s.title).join(', ');
    
    switch (impactType) {
      case 'positive':
        return `${userName} demonstrou determinação hoje, conquistando todas as suas metas. Inspirado pelos mundos de ${storyTitles}, nosso protagonista avança com confiança em sua jornada épica. Uma nova habilidade foi desbloqueada e o caminho adiante se ilumina com possibilidades.`;
      case 'negative':
        return `${userName} enfrentou desafios hoje e algumas metas ficaram incompletas. Como nos momentos difíceis de ${storyTitles}, nosso herói deve aprender com os obstáculos. A jornada continua, mas com maior cautela e sabedoria adquirida através da adversidade.`;
      case 'extra_reward':
        return `${userName} superou todas as expectativas hoje! Assim como os grandes heróis de ${storyTitles}, nosso protagonista não apenas cumpriu suas metas, mas foi além. Uma recompensa especial aguarda: um artefato mágico foi descoberto e novos caminhos se abrem na aventura.`;
      case 'severe_penalty':
        return `${userName} enfrentou um dia sombrio sem conseguir completar nenhuma meta. Como nos momentos mais desesperadores de ${storyTitles}, nosso herói deve encontrar força interior para superar esta queda. O caminho se tornou mais perigoso, mas ainda há esperança de redenção.`;
      default:
        return `${userName} continua sua jornada épica, enfrentando novos desafios inspirados pelos mundos de ${storyTitles}.`;
    }
  };

  const generateStoryUpdate = async () => {
    if (!user) return;

    setLoading(true);
    setAiGenerating(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Se há custom summary, usar diretamente sem chamar n8n
      if (customSummary.trim()) {
        // Get today's goals para determinar impact type
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

        // Save story progress with custom summary
        const { error: insertError } = await supabase
          .from('story_progress')
          .upsert({
            user_id: user.id,
            date: today,
            summary: customSummary.trim(),
            impact_type: impactType
          }, {
            onConflict: 'user_id,date'
          });

        if (insertError) throw insertError;

        setCustomSummary('');
        fetchStoryProgress();
        
        toast({
          title: "História personalizada salva!",
          description: "Sua aventura épica foi registrada com sucesso!"
        });
        
        setLoading(false);
        setAiGenerating(false);
        return;
      }

      // Buscar histórias favoritas do usuário
      const { data: userFavoriteStories, error: favoritesError } = await supabase
        .from('favorite_stories')
        .select('*')
        .eq('user_id', user.id);

      if (favoritesError) {
        throw new Error('Não foi possível acessar suas memórias. Por favor, tente novamente.');
      }

      // Buscar os 5 capítulos recentes
      const { data: recentChapters, error: chaptersError } = await supabase
        .from('story_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (chaptersError) {
        throw new Error('Não foi possível acessar suas memórias. Por favor, tente novamente.');
      }

      // Construir payload JSON para n8n
      const payload = {
        action: "generate_story_with_context",
        userId: user.id,
        userContext: {
          favoriteStories: (userFavoriteStories || []).map(story => ({
            title: story.title,
            summary: story.narrative_tag || `Uma ${story.type} chamada ${story.title}.`
          })),
          recentChapters: (recentChapters || []).map((chapter, index) => ({
            chapterNumber: recentChapters.length - index,
            content: chapter.summary
          }))
        }
      };

      // Chamar webhook do n8n
      const response = await fetch('https://nevespgabriel.app.n8n.cloud/webhook-test/fc28ddee-5f20-4965-acee-5443ac01e862', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Nosso contador de histórias está tirando um cochilo. Por favor, tente mais tarde.');
      }

      const result = await response.json();
      
      // Extrair o texto da história do formato correto: array[0].output
      const generatedStory = result[0]?.output;

      if (!generatedStory) {
        throw new Error('Nosso contador de histórias está tirando um cochilo. Por favor, tente mais tarde.');
      }

      // Get today's goals para determinar impact type
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

      // Save story progress
      const { error: insertError } = await supabase
        .from('story_progress')
        .upsert({
          user_id: user.id,
          date: today,
          summary: generatedStory,
          impact_type: impactType
        }, {
          onConflict: 'user_id,date'
        });

      if (insertError) throw insertError;

      setCustomSummary('');
      fetchStoryProgress();
      
      toast({
        title: "História gerada pela IA!",
        description: "Sua aventura épica foi criada com sucesso!"
      });

    } catch (error: any) {
      toast({
        title: "Erro ao gerar história",
        description: error.message,
        variant: "destructive"
      });
    }

    setLoading(false);
    setAiGenerating(false);
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
            {aiGenerating && <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />}
          </div>
          
          <Textarea
            value={customSummary}
            onChange={(e) => setCustomSummary(e.target.value)}
            placeholder="Personalize sua história de hoje (opcional) ou deixe em branco para gerar automaticamente com IA baseado no seu desempenho e histórias anteriores..."
            rows={3}
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={generateStoryUpdate} 
              disabled={loading || aiGenerating} 
              className="flex-1"
            >
              {aiGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Consultando os anais da sua história...
                </>
              ) : loading ? (
                "Salvando..."
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Gerar história do dia
                </>
              )}
            </Button>
          </div>
          
          {favoriteStories.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <strong>Universo da História:</strong> {favoriteStories.map(s => s.title).join(', ')}
            </div>
          )}
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
          <span className="font-medium">Capítulos Anteriores</span>
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