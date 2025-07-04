// AI Story Generation Service
// This file handles the integration with AI services for story generation

interface StoryContext {
  userName: string;
  favoriteStories: Array<{
    title: string;
    type: string;
    narrativeTag?: string;
  }>;
  recentStories: Array<{
    date: string;
    summary: string;
    impactType: string;
  }>;
  todayPerformance: {
    impactType: string;
    totalGoals: number;
    completedGoals: number;
    goals?: Array<{
      goal_text: string;
      completed: boolean;
    }>;
  };
}

interface AIProvider {
  name: string;
  generateStory: (context: StoryContext) => Promise<string>;
}

// OpenAI Integration
class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateStory(context: StoryContext): Promise<string> {
    const prompt = this.createPrompt(context);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a master storyteller creating personalized epic adventures. Write engaging, immersive narratives that make the user feel like the hero of their own story.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content || this.generateFallbackStory(context);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateFallbackStory(context);
    }
  }

  private createPrompt(context: StoryContext): string {
    const { userName, favoriteStories, recentStories, todayPerformance } = context;
    
    return `
Create the next chapter in ${userName}'s epic adventure story.

STORY UNIVERSE: Blend elements from these favorite stories:
${favoriteStories.map(story => `- ${story.title} (${story.type}${story.narrativeTag ? `, ${story.narrativeTag}` : ''})`).join('\n')}

RECENT STORY CONTEXT:
${recentStories.length > 0 ? recentStories.map(story => 
  `${story.date}: ${story.summary} [Impact: ${story.impactType}]`
).join('\n') : 'This is the beginning of the adventure.'}

TODAY'S PERFORMANCE:
- Impact Type: ${todayPerformance.impactType}
- Goals Set: ${todayPerformance.totalGoals}
- Goals Completed: ${todayPerformance.completedGoals}
${todayPerformance.goals ? `- Specific Goals: ${todayPerformance.goals.map(g => `"${g.goal_text}" (${g.completed ? 'completed' : 'not completed'})`).join(', ')}` : ''}

REQUIREMENTS:
1. Continue seamlessly from the recent story context
2. Incorporate consequences based on today's performance (${todayPerformance.impactType})
3. Blend themes from the favorite stories naturally
4. Keep it engaging and around 150-200 words
5. End with intrigue for tomorrow
6. Make ${userName} feel heroic and central to the story
7. Write in Portuguese (Brazilian)

Write the next chapter:
    `;
  }

  private generateFallbackStory(context: StoryContext): string {
    // Fallback story generation logic
    return generateEnhancedFallbackStory(context);
  }
}

// Claude Integration
class ClaudeProvider implements AIProvider {
  name = 'Claude';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-sonnet-20240229') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateStory(context: StoryContext): Promise<string> {
    const prompt = this.createPrompt(context);
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
        }),
      });

      const data = await response.json();
      return data.content[0]?.text || this.generateFallbackStory(context);
    } catch (error) {
      console.error('Claude API error:', error);
      return this.generateFallbackStory(context);
    }
  }

  private createPrompt(context: StoryContext): string {
    // Similar to OpenAI prompt but optimized for Claude
    const { userName, favoriteStories, recentStories, todayPerformance } = context;
    
    return `
Você é um contador de histórias mestre criando uma aventura épica personalizada para ${userName}.

UNIVERSO DA HISTÓRIA: Misture elementos dessas histórias favoritas:
${favoriteStories.map(story => `- ${story.title} (${story.type}${story.narrativeTag ? `, ${story.narrativeTag}` : ''})`).join('\n')}

CONTEXTO RECENTE:
${recentStories.length > 0 ? recentStories.map(story => 
  `${story.date}: ${story.summary} [Impacto: ${story.impactType}]`
).join('\n') : 'Este é o início da aventura.'}

DESEMPENHO DE HOJE:
- Tipo de Impacto: ${todayPerformance.impactType}
- Metas Definidas: ${todayPerformance.totalGoals}
- Metas Concluídas: ${todayPerformance.completedGoals}

Escreva o próximo capítulo da aventura de ${userName}, incorporando as consequências do desempenho de hoje e continuando naturalmente a partir do contexto recente. Mantenha entre 150-200 palavras, termine com suspense para amanhã, e faça ${userName} se sentir como o herói central da história.
    `;
  }

  private generateFallbackStory(context: StoryContext): string {
    return generateEnhancedFallbackStory(context);
  }
}

// Enhanced fallback story generation
function generateEnhancedFallbackStory(context: StoryContext): string {
  const { userName, favoriteStories, recentStories, todayPerformance } = context;
  
  const storyElements = favoriteStories.slice(0, 2);
  const hasRecentContext = recentStories.length > 0;
  
  let story = '';
  
  // Dynamic opening based on recent context
  if (hasRecentContext) {
    const lastStory = recentStories[recentStories.length - 1];
    const contextOpeners = {
      positive: `Fortalecido pelas vitórias recentes, ${userName} enfrentou os desafios de hoje com renovada confiança. `,
      negative: `Ainda se recuperando dos contratempos recentes, ${userName} abordou o dia de hoje com determinação para reverter a situação. `,
      extra_reward: `Inspirado pelos triunfos extraordinários recentes, ${userName} entrou no dia de hoje com expectativas elevadas. `,
      severe_penalty: `Carregando o peso das dificuldades recentes, ${userName} buscou redenção nos desafios de hoje. `
    };
    story += contextOpeners[lastStory.impactType as keyof typeof contextOpeners] || `Continuando sua jornada épica, ${userName} enfrentou um novo dia. `;
  } else {
    story += `Em um mundo onde ${storyElements.map(s => s.title).join(' e ')} convergem, ${userName} inicia uma jornada épica. `;
  }

  // Performance-based narrative
  const narratives = {
    positive: `A disciplina demonstrada hoje rendeu frutos magníficos. Como os heróis de ${storyElements[0]?.title || 'lendas antigas'}, ${userName} mostrou foco inabalável e conquistou cada objetivo traçado. O universo respondeu com favor - novos aliados surgiram, caminhos ocultos se revelaram, e a reputação do protagonista cresceu entre amigos e rivais. `,
    negative: `O dia trouxe desafios que testaram a determinação de ${userName}. Algumas metas permaneceram inacabadas, criando ondas de consequência pela aventura. Como as provações enfrentadas em ${storyElements[0]?.title || 'grandes épicos'}, esses contratempos servem como lições. O caminho à frente se torna mais traiçoeiro, mas também mais recompensador para quem persevera. `,
    extra_reward: `Hoje foi simplesmente lendário! ${userName} não apenas conquistou cada objetivo planejado, mas foi além, alcançando feitos que surpreenderam até as expectativas mais otimistas. O próprio cosmos pareceu celebrar - tesouros raros apareceram, aliados poderosos juraram lealdade, e sussurros dos feitos extraordinários de ${userName} se espalharam pelo reino. `,
    severe_penalty: `Um dia sombrio na crônica de ${userName}. Sem nenhuma meta alcançada, a aventura tomou um rumo perigoso. Como nos momentos mais sombrios de ${storyElements[0]?.title || 'épicos clássicos'}, quando heróis enfrentam suas maiores provações, o mundo ao redor de ${userName} se tornou hostil. Aliados questionaram sua fé, inimigos se tornaram mais audaciosos, e o caminho à frente se envolveu em incerteza. `
  };

  story += narratives[todayPerformance.impactType as keyof typeof narratives] || narratives.positive;

  // Dynamic closing hooks
  const hooks = [
    "O amanhecer de amanhã traz novos mistérios para desvendar...",
    "Mas isso é apenas o prelúdio de aventuras ainda maiores...",
    "O próximo capítulo desta saga épica aguarda...",
    "Que desafios o nascer do sol de amanhã revelará?",
    "A aventura continua, com o destino chamando...",
    "Nas sombras, forças antigas começam a se mover...",
    "Uma profecia antiga sussurra sobre os dias vindouros..."
  ];
  
  story += hooks[Math.floor(Math.random() * hooks.length)];
  
  return story;
}

// Main AI Story Service
export class AIStoryService {
  private providers: AIProvider[] = [];
  private currentProvider: AIProvider | null = null;

  constructor() {
    // Initialize providers based on available API keys
    this.initializeProviders();
  }

  private initializeProviders() {
    // Check for OpenAI API key
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      this.providers.push(new OpenAIProvider(openaiKey));
    }

    // Check for Claude API key
    const claudeKey = import.meta.env.VITE_CLAUDE_API_KEY;
    if (claudeKey) {
      this.providers.push(new ClaudeProvider(claudeKey));
    }

    // Set the first available provider as current
    this.currentProvider = this.providers[0] || null;
  }

  async generateStory(context: StoryContext): Promise<string> {
    if (this.currentProvider) {
      try {
        return await this.currentProvider.generateStory(context);
      } catch (error) {
        console.error(`Error with ${this.currentProvider.name}:`, error);
        // Try next provider or fallback
        return this.generateFallbackStory(context);
      }
    }
    
    // No AI providers available, use enhanced fallback
    return this.generateFallbackStory(context);
  }

  private generateFallbackStory(context: StoryContext): string {
    return generateEnhancedFallbackStory(context);
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  setProvider(providerName: string): boolean {
    const provider = this.providers.find(p => p.name === providerName);
    if (provider) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const aiStoryService = new AIStoryService();