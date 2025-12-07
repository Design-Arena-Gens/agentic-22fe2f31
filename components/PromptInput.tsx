'use client';

import { useState, ChangeEvent } from 'react';
import { PromptInput as PromptInputType } from '@/lib/types';

interface PromptInputProps {
  prompt: PromptInputType;
  onPromptChange: (prompt: PromptInputType) => void;
}

export default function PromptInput({
  prompt,
  onPromptChange,
}: PromptInputProps) {
  const [imagePreview, setImagePreview] = useState<string[]>([]);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange({ ...prompt, text: e.target.value });
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      await new Promise((resolve) => {
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          newImages.push(base64);
          newPreviews.push(base64);
          resolve(null);
        };
        reader.readAsDataURL(file);
      });
    }

    setImagePreview([...imagePreview, ...newPreviews]);
    onPromptChange({
      ...prompt,
      images: [...(prompt.images || []), ...newImages],
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...(prompt.images || [])];
    const newPreviews = [...imagePreview];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
    onPromptChange({ ...prompt, images: newImages });
  };

  return (
    <div className="space-y-4">
      <textarea
        value={prompt.text}
        onChange={handleTextChange}
        placeholder="Enter your prompt here... (e.g., 'Explain quantum computing in simple terms' or 'Describe what you see in these images')"
        className="w-full h-32 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
      />

      <div className="space-y-2">
        <label className="flex items-center space-x-2 cursor-pointer w-fit px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-gray-600 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Add Images (Optional)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {imagePreview.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imagePreview.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-700"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
