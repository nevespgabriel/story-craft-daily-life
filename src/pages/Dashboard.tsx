import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LogOut, Settings, Target, BookOpen, Calendar, Trophy, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DailyGoals } from '@/components/DailyGoals';
import { StorySelection } from '@/components/StorySelection';
import { StoryProgress } from '@/components/StoryProgress';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type FavoriteStory = Tables<'favorite_stories'>;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favoriteStories, setFavoriteStories] = useState<FavoriteStory[]>([]);
  const [showStorySelection, setShowStorySelection] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    completionPercentage: 0,
    currentStreak: 0
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchFavoriteStories();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const fetchFavoriteStories = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('favorite_stories')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching stories:', error);
    } else {
      setFavoriteStories(data || []);
      
      // Show story selection if user has less than 5 stories
      if ((data || []).length < 5) {
        setShowStorySelection(true);
      }
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching stats:', error);
    } else if (data) {
      setStats({
        totalGoals: data.total_goals_set || 0,
        completedGoals: data.total_goals_completed || 0,
        completionPercentage: data.completion_percentage || 0,
        currentStreak: data.positive_days || 0
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleStoriesUpdated = () => {
    fetchFavoriteStories();
    setShowStorySelection(false);
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite sua opinião antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('https://nevespgabriel.app.n8n.cloud/webhook-test/b3bc651e-d519-4f93-b0e3-d99142aac100', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Feedback: feedback,
          userEmail: user?.email || 'nao_informado@exemplo.com',
          leadId: user?.id || 'gerado_automaticamente_pela_aplicacao'
        }),
      });

      if (response.ok) {
        toast({
          title: "Opinião enviada!",
          description: "Sua opinião foi enviada com sucesso! Agradecemos seu feedback.",
        });
        setFeedback('');
        setFeedbackOpen(false);
      } else {
        throw new Error('Erro ao enviar feedback');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua opinião. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (showStorySelection) {
    return <StorySelection onComplete={handleStoriesUpdated} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Story Craft</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Olá, {profile?.name || 'Usuário'}!
            </span>
            <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1"
                >
                  <Star className="h-4 w-4" />
                  Avaliar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Avaliar Aplicativo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="feedback">Qual a sua opinião sobre nosso aplicativo?</Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Digite sua opinião aqui..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitFeedback}
                    className="w-full"
                  >
                    Enviar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStorySelection(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Totais</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGoals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedGoals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionPercentage.toFixed(1)}%</div>
              <Progress value={stats.completionPercentage} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dias Positivos</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Metas de Hoje</CardTitle>
              <CardDescription>
                Defina e acompanhe suas metas diárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DailyGoals onGoalsUpdated={fetchStats} />
            </CardContent>
          </Card>

          {/* Story Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Sua História</CardTitle>
              <CardDescription>
                O progresso da sua aventura épica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoryProgress favoriteStories={favoriteStories} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}