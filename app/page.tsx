'use client';

import { useState } from 'react';
import ModelSelector from '@/components/ModelSelector';
import PromptInput from '@/components/PromptInput';
import ResponseDisplay from '@/components/ResponseDisplay';
import ResultsComparison from '@/components/ResultsComparison';
import { PromptInput as PromptInputType, ModelResponse, TestResult } from '@/lib/types';

export default function Home() {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState<PromptInputType>({ text: '', images: [] });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [responses, setResponses] = useState<ModelResponse[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleRunTest = async () => {
    if (selectedModels.length < 4 || !prompt.text.trim()) {
      alert('Please select at least 4 models and enter a prompt');
      return;
    }

    setIsProcessing(true);
    setResponses([]);
    setTestResult(null);

    try {
      // Step 1: Get responses from all models
      setCurrentStep('Generating responses from selected models...');
      const responseRes = await fetch('/api/generate-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelIds: selectedModels }),
      });

      if (!responseRes.ok) throw new Error('Failed to generate responses');
      const responseData = await responseRes.json();
      setResponses(responseData.responses);

      // Step 2: Cross-evaluate responses
      setCurrentStep('Models evaluating each other\'s responses...');
      const evalRes = await fetch('/api/evaluate-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          responses: responseData.responses,
          modelIds: selectedModels,
        }),
      });

      if (!evalRes.ok) throw new Error('Failed to evaluate responses');
      const evalData = await evalRes.json();

      // Step 3: Get final ranking from Gemini
      setCurrentStep('Getting final ranking from Gemini 1.5 Pro...');
      const finalRes = await fetch('/api/final-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          topThreeResponses: evalData.topThreeResponses,
        }),
      });

      if (!finalRes.ok) throw new Error('Failed to get final ranking');
      const finalData = await finalRes.json();

      setTestResult({
        id: Date.now().toString(),
        prompt,
        selectedModels,
        responses: responseData.responses,
        evaluations: evalData.evaluations,
        topThree: evalData.topThree,
        geminiRanking: finalData.ranking,
        timestamp: Date.now(),
      });

      setCurrentStep('');
    } catch (error) {
      console.error('Error running test:', error);
      alert('An error occurred while running the test. Please check your API keys.');
      setCurrentStep('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            AI Model Comparison Platform
          </h1>
          <p className="text-xl text-gray-300">
            Test, compare, and rank responses from multiple multimodal AI models
          </p>
        </header>

        <div className="space-y-8">
          {/* Model Selection */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">1. Select Models (4-5)</h2>
            <ModelSelector
              selectedModels={selectedModels}
              onModelSelect={setSelectedModels}
            />
          </div>

          {/* Prompt Input */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold mb-4">2. Enter Your Prompt</h2>
            <PromptInput prompt={prompt} onPromptChange={setPrompt} />
          </div>

          {/* Run Test Button */}
          <div className="flex justify-center">
            <button
              onClick={handleRunTest}
              disabled={isProcessing || selectedModels.length < 4}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
            >
              {isProcessing ? 'Processing...' : 'Run Comparison Test'}
            </button>
          </div>

          {/* Processing Status */}
          {currentStep && (
            <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <p className="text-lg">{currentStep}</p>
              </div>
            </div>
          )}

          {/* Responses Display */}
          {responses.length > 0 && !testResult && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-4">Model Responses</h2>
              <ResponseDisplay responses={responses} />
            </div>
          )}

          {/* Final Results */}
          {testResult && (
            <ResultsComparison
              testResult={testResult}
              onUserChoice={(choice) =>
                setTestResult({ ...testResult, userChoice: choice })
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}
