# AI Model Comparison Platform

A powerful web application for testing, comparing, and ranking responses from multiple multimodal AI models.

## 🚀 Deployed Application

**Live URL:** https://agentic-22fe2f31.vercel.app

## ✨ Features

### 1. **Multi-Model Selection**
- Select 4-5 AI models from leading providers:
  - OpenAI (GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo)
  - Anthropic (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)
  - Google (Gemini 1.5 Pro, Gemini 1.5 Flash)
  - Cohere (Command R+)
- Visual indicators for vision-capable models

### 2. **Multimodal Prompt Input**
- Text-based prompts
- Image upload support (multiple images)
- Combined text + image prompts for vision models

### 3. **Automated Response Generation**
- Simultaneous query to all selected models
- Real-time progress tracking
- Error handling for API failures

### 4. **Cross-Model Evaluation**
- Each selected model evaluates all responses
- Scoring based on quality, clarity, relevance, and completeness
- Automatic identification of top 3 responses

### 5. **Gemini 1.5 Pro Final Ranking**
- Independent final evaluation by Gemini 1.5 Pro
- Ranks the top 3 responses
- Provides reasoning for ranking decisions

### 6. **User Voting System**
- Manual response selection
- Side-by-side comparison view
- Visual selection indicators

### 7. **Alignment Analysis**
- Compares user choice with Gemini's ranking
- Three alignment levels: Perfect, Partial, or Different

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI SDKs**: OpenAI, Anthropic, Google Generative AI, Cohere
- **Deployment**: Vercel

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- API keys for the AI providers you want to use

### Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
```

**Note**: You need at least 4 API keys to use the platform (minimum model selection requirement).

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 How to Use

1. **Select Models**: Choose 4-5 AI models you want to compare
2. **Enter Prompt**: Type your question or task description
3. **Add Images** (Optional): Upload images if testing vision capabilities
4. **Run Test**: Click "Run Comparison Test" to start
5. **Review Responses**: All model responses are displayed
6. **View Cross-Evaluation**: See how models scored each other
7. **Check Gemini Ranking**: View the final ranking from Gemini 1.5 Pro
8. **Vote**: Select your preferred response
9. **Analyze Alignment**: Compare your choice with Gemini's ranking

## 🎨 UI Highlights

- Dark gradient background (gray → blue → purple)
- Glassmorphism effects with backdrop blur
- Smooth animations and transitions
- Responsive design for all screen sizes
- Real-time status updates during processing

## 📊 Evaluation Criteria

Models evaluate responses based on:
- **Quality & Accuracy**: Correctness of information
- **Clarity & Coherence**: Easy to understand and well-structured
- **Relevance**: Addresses the prompt effectively
- **Completeness**: Provides comprehensive answer

## 🔐 Security Notes

- API keys are stored in environment variables
- Keys are never exposed to the client
- All API calls happen server-side

## 📝 API Routes

- `/api/generate-responses`: Generates responses from selected models
- `/api/evaluate-responses`: Performs cross-model evaluation
- `/api/final-ranking`: Gets final ranking from Gemini 1.5 Pro

## 📄 License

MIT License - feel free to use this project for your own purposes.
