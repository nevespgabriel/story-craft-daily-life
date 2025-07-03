import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Film, Tv, Gamepad2, X } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type StoryType = 'movie' | 'series' | 'book' | 'game';
type FavoriteStory = Tables<'favorite_stories'>;

interface StorySelectionProps {
  onComplete: () => void;
}

const storyTypeIcons = {
  movie: Film,
  series: Tv,
  book: BookOpen,
  game: Gamepad2
};

const storyTypeLabels = {
  movie: 'Filme',
  series: 'Série',
  book: 'Livro',
  game: 'Jogo'
};

export function StorySelection({ onComplete }: StorySelectionProps) {
  const { user } = useAuth();
  const [stories, setStories] = useState<FavoriteStory[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<StoryType>('movie');
  const [narrativeTag, setNarrativeTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStories();
  }, [user]);

  const fetchStories = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('favorite_stories')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching stories:', error);
    } else {
      setStories(data || []);
    }
  };

  const addStory = async () => {
    if (!user || !title.trim()) return;

    if (stories.length >= 5) {
      toast({
        title: "Limite atingido",
        description: "Você pode selecionar no máximo 5 histórias.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('favorite_stories')
      .insert({
        user_id: user.id,
        title: title.trim(),
        type,
        narrative_tag: narrativeTag.trim() || null
      });

    if (error) {
      toast({
        title: "Erro ao adicionar história",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setTitle('');
      setNarrativeTag('');
      fetchStories();
      toast({
        title: "História adicionada!",
        description: `${title} foi adicionada às suas favoritas.`
      });
    }

    setLoading(false);
  };

  const removeStory = async (id: string) => {
    const { error } = await supabase
      .from('favorite_stories')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Erro ao remover história",
        description: error.message,
        variant: "destructive"
      });
    } else {
      fetchStories();
      toast({
        title: "História removida",
        description: "A história foi removida das suas favoritas."
      });
    }
  };

  const canComplete = stories.length >= 3; // Minimum 3 stories required

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Escolha suas Histórias Favoritas</CardTitle>
            <CardDescription>
              Selecione de 3 a 5 histórias que você ama. Elas serão a base da sua aventura épica personalizada!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Story Form */}
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da História</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: O Senhor dos Anéis"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={type} onValueChange={(value: StoryType) => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">Filme</SelectItem>
                      <SelectItem value="series">Série</SelectItem>
                      <SelectItem value="book">Livro</SelectItem>
                      <SelectItem value="game">Jogo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tag">Tag Narrativa (Opcional)</Label>
                <Input
                  id="tag"
                  value={narrativeTag}
                  onChange={(e) => setNarrativeTag(e.target.value)}
                  placeholder="Ex: fantasia épica, aventura, mistério..."
                />
              </div>
              
              <Button 
                onClick={addStory} 
                disabled={loading || !title.trim() || stories.length >= 5}
                className="w-full"
              >
                {loading ? "Adicionando..." : "Adicionar História"}
              </Button>
            </div>

            {/* Selected Stories */}
            <div className="space-y-3">
              <h3 className="font-medium">
                Histórias Selecionadas ({stories.length}/5)
              </h3>
              
              {stories.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma história selecionada ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {stories.map((story) => {
                    const Icon = storyTypeIcons[story.type as StoryType];
                    return (
                      <div
                        key={story.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">{story.title}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">
                                {storyTypeLabels[story.type as StoryType]}
                              </Badge>
                              {story.narrative_tag && (
                                <span>{story.narrative_tag}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStory(story.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Complete Button */}
            {canComplete && (
              <div className="pt-4 border-t">
                <Button 
                  onClick={onComplete} 
                  className="w-full"
                  size="lg"
                >
                  Começar Minha Aventura!
                </Button>
              </div>
            )}
            
            {!canComplete && stories.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Adicione pelo menos {3 - stories.length} história{3 - stories.length > 1 ? 's' : ''} para continuar.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}