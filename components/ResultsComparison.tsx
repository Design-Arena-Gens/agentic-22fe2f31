'use client';

import { useState } from 'react';
import { TestResult } from '@/lib/types';
import { AVAILABLE_MODELS } from '@/lib/models';

interface ResultsComparisonProps {
  testResult: TestResult;
  onUserChoice: (modelId: string) => void;
}

export default function ResultsComparison({
  testResult,
  onUserChoice,
}: ResultsComparisonProps) {
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);

  const getModelName = (modelId: string) => {
    return (
      AVAILABLE_MODELS.find((m) => m.id === modelId)?.name || modelId
    );
  };

  const handleUserVote = (modelId: string) => {
    setSelectedResponse(modelId);
    onUserChoice(modelId);
  };

  const topThreeResponses = testResult.responses.filter((r) =>
    testResult.topThree.includes(r.modelId)
  );

  const getAlignmentMessage = () => {
    if (!testResult.userChoice) return null;

    const geminiFirstChoice = testResult.geminiRanking[0];
    const userChoice = testResult.userChoice;

    if (geminiFirstChoice === userChoice) {
      return {
        type: 'perfect',
        message: 'Perfect alignment! Your choice matches Gemini 1.5 Pro\'s top pick.',
      };
    } else if (testResult.geminiRanking.includes(userChoice)) {
      const position = testResult.geminiRanking.indexOf(userChoice) + 1;
      return {
        type: 'partial',
        message: `Your choice ranked #${position} in Gemini 1.5 Pro's evaluation.`,
      };
    } else {
      return {
        type: 'different',
        message: 'Your choice differs from Gemini 1.5 Pro\'s top 3 selection.',
      };
    }
  };

  const alignment = getAlignmentMessage();

  return (
    <div className="space-y-8">
      {/* Evaluation Scores */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6">Cross-Evaluation Scores</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Model</th>
                <th className="text-center py-3 px-4">Average Score</th>
                <th className="text-center py-3 px-4">Rank</th>
              </tr>
            </thead>
            <tbody>
              {testResult.topThree.map((modelId, index) => {
                const scores = testResult.evaluations.filter(
                  (e) => e.targetModelId === modelId
                );
                const avgScore =
                  scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

                return (
                  <tr
                    key={modelId}
                    className="border-b border-gray-800 hover:bg-gray-700/30"
                  >
                    <td className="py-3 px-4 font-medium">
                      {getModelName(modelId)}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="inline-block px-3 py-1 bg-blue-900/30 rounded-full">
                        {avgScore.toFixed(2)}/10
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full ${
                          index === 0
                            ? 'bg-yellow-900/30 text-yellow-300'
                            : index === 1
                            ? 'bg-gray-600/30 text-gray-300'
                            : 'bg-orange-900/30 text-orange-300'
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gemini Final Ranking */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm rounded-2xl p-6 border border-purple-700">
        <h2 className="text-2xl font-semibold mb-6">
          Gemini 1.5 Pro Final Ranking
        </h2>
        <div className="space-y-4">
          {testResult.geminiRanking.map((modelId, index) => {
            const response = testResult.responses.find(
              (r) => r.modelId === modelId
            );
            return (
              <div
                key={modelId}
                className="bg-gray-900/50 rounded-xl p-4 border border-gray-700"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                      index === 0
                        ? 'bg-yellow-500 text-black'
                        : index === 1
                        ? 'bg-gray-400 text-black'
                        : 'bg-orange-600 text-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {getModelName(modelId)}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {response?.response}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Vote */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6">Your Turn: Pick the Best Response</h2>
        <div className="grid grid-cols-1 gap-6">
          {testResult.responses.map((response) => (
            <button
              key={response.modelId}
              onClick={() => handleUserVote(response.modelId)}
              className={`text-left p-6 rounded-xl border-2 transition-all ${
                selectedResponse === response.modelId
                  ? 'border-green-500 bg-green-900/30'
                  : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">{response.modelName}</h3>
                {selectedResponse === response.modelId && (
                  <span className="flex items-center space-x-2 text-green-400">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Selected</span>
                  </span>
                )}
              </div>
              <p className="text-gray-300">{response.response}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Alignment Analysis */}
      {alignment && (
        <div
          className={`backdrop-blur-sm rounded-2xl p-6 border ${
            alignment.type === 'perfect'
              ? 'bg-green-900/30 border-green-700'
              : alignment.type === 'partial'
              ? 'bg-blue-900/30 border-blue-700'
              : 'bg-orange-900/30 border-orange-700'
          }`}
        >
          <h2 className="text-2xl font-semibold mb-4">Alignment Analysis</h2>
          <div className="flex items-center space-x-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                alignment.type === 'perfect'
                  ? 'bg-green-500'
                  : alignment.type === 'partial'
                  ? 'bg-blue-500'
                  : 'bg-orange-500'
              }`}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {alignment.type === 'perfect' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : alignment.type === 'partial' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium">{alignment.message}</p>
              <p className="text-sm text-gray-400 mt-1">
                Your choice: {getModelName(testResult.userChoice!)} | Gemini's top pick:{' '}
                {getModelName(testResult.geminiRanking[0])}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
