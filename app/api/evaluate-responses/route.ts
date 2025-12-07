import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CohereClient } from 'cohere-ai';
import { AVAILABLE_MODELS } from '@/lib/models';
import { PromptInput, ModelResponse, EvaluationScore } from '@/lib/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key' });
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'dummy-key');
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY || 'dummy-key' });

function createEvaluationPrompt(
  originalPrompt: string,
  responses: ModelResponse[]
): string {
  let prompt = `You are an expert evaluator of AI responses. Please evaluate the following responses to this prompt:\n\nOriginal Prompt: "${originalPrompt}"\n\n`;

  responses.forEach((r, i) => {
    prompt += `\nResponse ${i + 1} (from ${r.modelName}):\n${r.response}\n`;
  });

  prompt += `\n\nFor each response, provide a score from 1-10 based on:
- Quality and accuracy
- Clarity and coherence
- Relevance to the prompt
- Completeness

Return ONLY a JSON array with this exact format:
[
  {"responseIndex": 0, "score": 8.5, "reasoning": "brief explanation"},
  {"responseIndex": 1, "score": 7.0, "reasoning": "brief explanation"}
]

Important: Return ONLY the JSON array, no other text.`;

  return prompt;
}

async function evaluateWithOpenAI(
  modelId: string,
  evaluationPrompt: string
): Promise<any> {
  const response = await openai.chat.completions.create({
    model: modelId,
    messages: [{ role: 'user', content: evaluationPrompt }],
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || '[]';
  return JSON.parse(content);
}

async function evaluateWithAnthropic(
  modelId: string,
  evaluationPrompt: string
): Promise<any> {
  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: 2000,
    messages: [{ role: 'user', content: evaluationPrompt }],
    temperature: 0.3,
  });

  const textContent = response.content.find((c) => c.type === 'text');
  const content = textContent && 'text' in textContent ? textContent.text : '[]';
  return JSON.parse(content);
}

async function evaluateWithGoogle(
  modelId: string,
  evaluationPrompt: string
): Promise<any> {
  const model = googleAI.getGenerativeModel({ model: modelId });
  const result = await model.generateContent(evaluationPrompt);
  const content = result.response.text();
  return JSON.parse(content);
}

async function evaluateWithCohere(
  modelId: string,
  evaluationPrompt: string
): Promise<any> {
  const response = await cohere.chat({
    model: modelId,
    message: evaluationPrompt,
    temperature: 0.3,
  });

  const content = response.text || '[]';
  return JSON.parse(content);
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, responses, modelIds } = await request.json();

    const evaluations: EvaluationScore[] = [];
    const evaluationPrompt = createEvaluationPrompt(prompt.text, responses);

    // Each model evaluates all responses
    for (const evaluatorModelId of modelIds) {
      const evaluatorModel = AVAILABLE_MODELS.find(
        (m) => m.id === evaluatorModelId
      );
      if (!evaluatorModel) continue;

      try {
        let evaluationResults: any[] = [];

        switch (evaluatorModel.provider) {
          case 'openai':
            evaluationResults = await evaluateWithOpenAI(
              evaluatorModelId,
              evaluationPrompt
            );
            break;
          case 'anthropic':
            evaluationResults = await evaluateWithAnthropic(
              evaluatorModelId,
              evaluationPrompt
            );
            break;
          case 'google':
            evaluationResults = await evaluateWithGoogle(
              evaluatorModelId,
              evaluationPrompt
            );
            break;
          case 'cohere':
            evaluationResults = await evaluateWithCohere(
              evaluatorModelId,
              evaluationPrompt
            );
            break;
        }

        // Process evaluation results
        evaluationResults.forEach((result) => {
          const targetResponse = responses[result.responseIndex];
          if (targetResponse) {
            evaluations.push({
              evaluatorModelId,
              targetModelId: targetResponse.modelId,
              score: result.score,
              reasoning: result.reasoning,
            });
          }
        });
      } catch (error) {
        console.error(
          `Error evaluating with ${evaluatorModelId}:`,
          error
        );
        // Continue with other evaluators even if one fails
      }
    }

    // Calculate average scores for each model
    const modelScores = new Map<string, number>();
    responses.forEach((response: ModelResponse) => {
      const scores = evaluations
        .filter((e) => e.targetModelId === response.modelId)
        .map((e) => e.score);

      if (scores.length > 0) {
        const avgScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        modelScores.set(response.modelId, avgScore);
      }
    });

    // Get top 3 models
    const sortedModels = Array.from(modelScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    const topThreeResponses = responses.filter((r: ModelResponse) =>
      sortedModels.includes(r.modelId)
    );

    return NextResponse.json({
      evaluations,
      topThree: sortedModels,
      topThreeResponses,
    });
  } catch (error) {
    console.error('Error in evaluate-responses:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate responses' },
      { status: 500 }
    );
  }
}
