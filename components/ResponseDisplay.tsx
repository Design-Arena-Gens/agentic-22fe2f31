'use client';

import { ModelResponse } from '@/lib/types';

interface ResponseDisplayProps {
  responses: ModelResponse[];
}

export default function ResponseDisplay({ responses }: ResponseDisplayProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {responses.map((response) => (
        <div
          key={response.modelId}
          className="bg-gray-900/50 rounded-xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-400">
              {response.modelName}
            </h3>
            <span className="text-xs text-gray-500">
              {new Date(response.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-200 whitespace-pre-wrap">
              {response.response}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
