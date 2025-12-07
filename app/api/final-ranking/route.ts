import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelResponse } from '@/lib/types';

const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'dummy-key');

function createRankingPrompt(
  originalPrompt: string,
  topThreeResponses: ModelResponse[]
): string {
  let prompt = `You are an expert AI evaluator. You must rank these 3 responses to the following prompt from best to worst:\n\nOriginal Prompt: "${originalPrompt}"\n\n`;

  topThreeResponses.forEach((r, i) => {
    prompt += `\nResponse ${i + 1} (Model: ${r.modelName}):\n${r.response}\n`;
  });

  prompt += `\n\nAnalyze each response based on:
- Accuracy and correctness
- Clarity and coherence
- Completeness
- Relevance to the prompt
- Overall quality

Return ONLY a JSON object with this exact format:
{
  "ranking": [0, 1, 2],
  "reasoning": "brief explanation of your ranking decision"
}

The "ranking" array should contain the response indices (0, 1, 2) ordered from best to worst.
Important: Return ONLY the JSON object, no other text.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, topThreeResponses } = await request.json();

    const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const rankingPrompt = createRankingPrompt(prompt.text, topThreeResponses);

    const result = await model.generateContent(rankingPrompt);
    const responseText = result.response.text();

    // Parse the JSON response
    const rankingData = JSON.parse(responseText);

    // Convert indices to model IDs
    const rankedModelIds = rankingData.ranking.map(
      (index: number) => topThreeResponses[index].modelId
    );

    return NextResponse.json({
      ranking: rankedModelIds,
      reasoning: rankingData.reasoning,
    });
  } catch (error) {
    console.error('Error in final-ranking:', error);
    return NextResponse.json(
      { error: 'Failed to generate final ranking' },
      { status: 500 }
    );
  }
}
