import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CohereClient } from 'cohere-ai';
import { AVAILABLE_MODELS } from '@/lib/models';
import { PromptInput, ModelResponse } from '@/lib/types';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy-key' });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'dummy-key' });
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'dummy-key');
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY || 'dummy-key' });

async function generateOpenAIResponse(
  modelId: string,
  prompt: PromptInput
): Promise<string> {
  const messages: any[] = [];

  if (prompt.images && prompt.images.length > 0) {
    const content: any[] = [{ type: 'text', text: prompt.text }];
    prompt.images.forEach((img) => {
      content.push({
        type: 'image_url',
        image_url: { url: img },
      });
    });
    messages.push({ role: 'user', content });
  } else {
    messages.push({ role: 'user', content: prompt.text });
  }

  const response = await openai.chat.completions.create({
    model: modelId,
    messages,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || 'No response';
}

async function generateAnthropicResponse(
  modelId: string,
  prompt: PromptInput
): Promise<string> {
  const content: any[] = [{ type: 'text', text: prompt.text }];

  if (prompt.images && prompt.images.length > 0) {
    prompt.images.forEach((img) => {
      const base64Data = img.split(',')[1] || img;
      const mediaType = img.includes('image/png')
        ? 'image/png'
        : img.includes('image/webp')
        ? 'image/webp'
        : img.includes('image/gif')
        ? 'image/gif'
        : 'image/jpeg';

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      });
    });
  }

  const response = await anthropic.messages.create({
    model: modelId,
    max_tokens: 1000,
    messages: [{ role: 'user', content }],
  });

  const textContent = response.content.find((c) => c.type === 'text');
  return textContent && 'text' in textContent ? textContent.text : 'No response';
}

async function generateGoogleResponse(
  modelId: string,
  prompt: PromptInput
): Promise<string> {
  const model = googleAI.getGenerativeModel({ model: modelId });

  if (prompt.images && prompt.images.length > 0) {
    const parts: any[] = [{ text: prompt.text }];

    prompt.images.forEach((img) => {
      const base64Data = img.split(',')[1] || img;
      const mimeType = img.includes('image/png')
        ? 'image/png'
        : img.includes('image/webp')
        ? 'image/webp'
        : img.includes('image/gif')
        ? 'image/gif'
        : 'image/jpeg';

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    });

    const result = await model.generateContent(parts);
    return result.response.text();
  } else {
    const result = await model.generateContent(prompt.text);
    return result.response.text();
  }
}

async function generateCohereResponse(
  modelId: string,
  prompt: PromptInput
): Promise<string> {
  const response = await cohere.chat({
    model: modelId,
    message: prompt.text,
  });

  return response.text || 'No response';
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, modelIds } = await request.json();

    const responses: ModelResponse[] = [];

    for (const modelId of modelIds) {
      const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (!model) continue;

      let responseText = '';

      try {
        switch (model.provider) {
          case 'openai':
            responseText = await generateOpenAIResponse(modelId, prompt);
            break;
          case 'anthropic':
            responseText = await generateAnthropicResponse(modelId, prompt);
            break;
          case 'google':
            responseText = await generateGoogleResponse(modelId, prompt);
            break;
          case 'cohere':
            responseText = await generateCohereResponse(modelId, prompt);
            break;
        }
      } catch (error) {
        console.error(`Error generating response for ${modelId}:`, error);
        responseText = `Error: Failed to generate response from ${model.name}`;
      }

      responses.push({
        modelId,
        modelName: model.name,
        response: responseText,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Error in generate-responses:', error);
    return NextResponse.json(
      { error: 'Failed to generate responses' },
      { status: 500 }
    );
  }
}
