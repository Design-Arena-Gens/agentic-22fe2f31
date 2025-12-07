'use client';

import { AVAILABLE_MODELS } from '@/lib/models';

interface ModelSelectorProps {
  selectedModels: string[];
  onModelSelect: (models: string[]) => void;
}

export default function ModelSelector({
  selectedModels,
  onModelSelect,
}: ModelSelectorProps) {
  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onModelSelect(selectedModels.filter((id) => id !== modelId));
    } else {
      if (selectedModels.length < 5) {
        onModelSelect([...selectedModels, modelId]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        Selected: {selectedModels.length}/5 models
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const isDisabled = !isSelected && selectedModels.length >= 5;

          return (
            <button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              disabled={isDisabled}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-900/30'
                  : isDisabled
                  ? 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                  : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-semibold">{model.name}</h3>
                  <p className="text-sm text-gray-400 capitalize">
                    {model.provider}
                  </p>
                </div>
                {model.supportsVision && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    Vision
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
