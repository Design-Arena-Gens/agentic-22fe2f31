export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'cohere';
  supportsVision: boolean;
}

export interface PromptInput {
  text: string;
  images?: string[]; // base64 encoded images
}

export interface ModelResponse {
  modelId: string;
  modelName: string;
  response: string;
  timestamp: number;
}

export interface EvaluationScore {
  evaluatorModelId: string;
  targetModelId: string;
  score: number;
  reasoning: string;
}

export interface TestResult {
  id: string;
  prompt: PromptInput;
  selectedModels: string[];
  responses: ModelResponse[];
  evaluations: EvaluationScore[];
  topThree: string[];
  geminiRanking: string[];
  userChoice?: string;
  timestamp: number;
}
