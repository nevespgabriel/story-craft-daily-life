# Story Craft - Epic Life Adventure

Transform your daily life into an epic, personalized adventure story powered by AI.

## Features

### 🎯 Daily Goal Management
- Set and track daily goals
- Mark goals as completed throughout the day
- Visual progress tracking with completion percentages

### 📚 Personalized Story Universe
- Choose 5 favorite stories (movies, series, books, games) to inspire your adventure
- AI blends elements from your favorite stories into your personal narrative
- Each story choice influences the themes and style of your adventure

### 🤖 AI-Powered Story Generation
- **Advanced AI Integration**: Stories are generated using OpenAI GPT-4 or Claude AI
- **Contextual Continuity**: Each day's story builds upon previous chapters
- **Performance-Based Consequences**: Your goal completion directly affects story outcomes
- **Dynamic Narrative**: Stories evolve based on your choices and performance patterns

### 📖 Story Progression System
- **Positive Impact**: Complete all goals → Heroic achievements and rewards
- **Negative Impact**: Some goals incomplete → Challenges and learning opportunities  
- **Extra Reward**: Exceed expectations → Legendary feats and special bonuses
- **Severe Penalty**: No goals completed → Dark trials and redemption arcs

### 📊 Progress Analytics
- Track your goal completion rates over time
- View statistics on positive vs negative story days
- Monitor your epic journey's progression

## AI Story Generation

### Supported AI Providers
1. **OpenAI GPT-4** - Premium story generation with excellent creativity
2. **Claude AI** - High-quality narrative generation with strong context awareness
3. **Enhanced Fallback** - Sophisticated local story generation when AI services are unavailable

### How AI Stories Work
1. **Context Analysis**: AI analyzes your recent story chapters, favorite stories, and today's performance
2. **Narrative Continuity**: Each story seamlessly continues from previous chapters
3. **Personalized Elements**: Your favorite stories' themes are woven into the narrative
4. **Performance Integration**: Goal completion affects story direction and consequences
5. **Character Development**: You remain the central hero throughout your epic journey

### Setting Up AI Integration

#### Option 1: OpenAI Integration
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add to your `.env` file:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

#### Option 2: Claude Integration  
1. Get an API key from [Anthropic](https://console.anthropic.com/)
2. Add to your `.env` file:
   ```
   VITE_CLAUDE_API_KEY=your_claude_api_key_here
   ```

#### Option 3: Custom AI Service
You can integrate your own AI service by modifying `src/services/aiStoryService.ts`

### Story Generation Process
1. **Context Gathering**: System collects your recent stories, favorite story themes, and today's goal performance
2. **Prompt Creation**: A sophisticated prompt is created that includes narrative continuity instructions
3. **AI Generation**: The AI service generates a 150-200 word story chapter
4. **Quality Assurance**: Fallback systems ensure you always get a quality story
5. **Narrative Storage**: Stories are saved with metadata for future context

## Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Tanstack Query** for data management

### Backend
- **Supabase** for database and authentication
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates

### Database Schema
- `profiles` - User information
- `favorite_stories` - User's chosen story inspirations  
- `daily_goals` - Daily goal tracking
- `story_progress` - Generated story chapters with metadata
- `user_statistics` - Aggregated progress analytics

### AI Integration
- Modular AI service architecture
- Support for multiple AI providers
- Intelligent fallback systems
- Context-aware prompt engineering

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials and optionally AI API keys.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Supabase Setup
1. Create a new Supabase project
2. Run the provided migrations to set up the database schema
3. Configure Row Level Security policies
4. Update your `.env` file with Supabase credentials

## Usage

### First Time Setup
1. **Register/Login**: Create your account with email and password
2. **Choose Stories**: Select 5 favorite stories that will inspire your adventure
3. **Set Goals**: Create your first daily goals
4. **Generate Story**: Let AI create your first adventure chapter

### Daily Workflow  
1. **Morning**: Set your daily goals
2. **Throughout Day**: Mark goals as completed
3. **Evening**: Generate your story chapter based on performance
4. **Reflection**: Read your personalized adventure and prepare for tomorrow

### Story Customization
- **Manual Override**: Write custom story chapters when desired
- **Theme Adjustment**: Update your favorite stories to change narrative direction
- **Performance Impact**: Understand how goal completion affects your story

## AI Story Examples

### Positive Performance Story
*"Strengthened by recent victories, Alex faced today's challenges with renewed confidence. Like the heroes of The Lord of the Rings, Alex demonstrated unwavering focus and achieved every objective set forth. The universe responded with favor - new allies emerged, hidden paths revealed themselves, and the protagonist's reputation grew among both friends and rivals. Tomorrow's dawn brings new mysteries to unravel..."*

### Negative Performance Story  
*"Still recovering from recent setbacks, Alex approached today with determination to turn things around. Today brought challenges that tested Alex's resolve. Some goals remained unfinished, creating ripples of consequence throughout the adventure. Like the trials faced in The Witcher, these setbacks serve as lessons. The path ahead grows more treacherous, but also more rewarding for those who persevere..."*

## Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and standards
- Pull request process  
- Issue reporting
- Feature requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- 📧 Email: support@storycraft.app
- 💬 Discord: [Join our community](https://discord.gg/storycraft)
- 📖 Documentation: [Full docs](https://docs.storycraft.app)

---

**Transform your life into an epic adventure. Start your journey today!** 🚀