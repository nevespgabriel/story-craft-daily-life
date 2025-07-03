import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Trophy, Sparkles } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <BookOpen className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Story Craft
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transforme sua vida em uma aventura épica personalizada. 
            Defina metas diárias e veja sua história se desenrolar baseada nas suas conquistas.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
            Começar Minha Aventura
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Metas Diárias</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Defina e acompanhe suas metas diárias. Cada conquista influencia o rumo da sua história épica.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Narrativa Personalizada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Suas histórias favoritas inspiram uma aventura única onde você é o protagonista.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Progresso Épico</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Veja sua jornada evoluir com consequências positivas ou negativas baseadas no seu desempenho.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold mb-12">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h3 className="font-semibold">Cadastre-se</h3>
              <p className="text-sm text-muted-foreground">
                Crie sua conta e conte-nos seu nome
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h3 className="font-semibold">Escolha Histórias</h3>
              <p className="text-sm text-muted-foreground">
                Selecione 5 histórias favoritas que inspirarão sua aventura
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h3 className="font-semibold">Defina Metas</h3>
              <p className="text-sm text-muted-foreground">
                Crie metas diárias e marque-as conforme completa
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                4
              </div>
              <h3 className="font-semibold">Viva a História</h3>
              <p className="text-sm text-muted-foreground">
                Veja sua narrativa épica evoluir baseada nas suas conquistas
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">
                Pronto para Ser o Herói da Sua Própria História?
              </h3>
              <p className="mb-6 opacity-90">
                Junte-se a milhares de pessoas que já transformaram suas vidas em aventuras épicas.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6"
              >
                Começar Agora - É Grátis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
