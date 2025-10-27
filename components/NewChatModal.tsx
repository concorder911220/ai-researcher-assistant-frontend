'use client';

import { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  mime_type: string;
  summary: string;
  created_at: string;
}

interface Props {
  onClose: () => void;
  onSubmit: (
    systemPrompt: string,
    personality: string,
    documentIds: string[],
    llmProvider?: string,
    llmModel?: string,
    llmTemperature?: number
  ) => void;
  availableDocuments: Document[];
}

const personalities = [
  { value: 'friendly', label: 'Friendly', description: 'Warm and conversational' },
  { value: 'factual', label: 'Factual', description: 'Precise and data-driven' },
  { value: 'humorous', label: 'Humorous', description: 'Witty and entertaining' },
];

const systemPrompts = [
  { value: 'You are a helpful AI research assistant.', label: 'Research Assistant' },
  { value: 'You are an expert document analyzer.', label: 'Document Analyzer' },
  { value: 'You are a knowledgeable tutor helping students learn.', label: 'Tutor' },
  { value: 'You are a professional consultant providing expert advice.', label: 'Consultant' },
  { value: 'You are a creative writer helping with content.', label: 'Writer' },
];

  const llmProviders = [
    { value: 'openai', label: 'OpenAI', models: [
      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ]},
    { value: 'anthropic', label: 'Anthropic (Claude)', models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
    ]},
  ];

export default function NewChatModal({ onClose, onSubmit, availableDocuments }: Props) {
  const [systemPrompt, setSystemPrompt] = useState(systemPrompts[0].value);
  const [personality, setPersonality] = useState('friendly');
  const [llmProvider, setLlmProvider] = useState('openai');
  const [llmModel, setLlmModel] = useState('gpt-4-turbo-preview');
  const [llmTemperature, setLlmTemperature] = useState(0.7);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    availableDocuments.map(d => d.id) // Select all by default
  );

  const currentProvider = llmProviders.find(p => p.value === llmProvider);

  const handleProviderChange = (provider: string) => {
    setLlmProvider(provider);
    const newProvider = llmProviders.find(p => p.value === provider);
    if (newProvider && newProvider.models.length > 0) {
      setLlmModel(newProvider.models[0].value);
    }
  };
  
  const toggleDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSubmit = () => {
    onSubmit(systemPrompt, personality, selectedDocuments, llmProvider, llmModel, llmTemperature);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Create New Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* System Prompt */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assistant Role
            </label>
            <select
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {systemPrompts.map((prompt) => (
                <option key={prompt.value} value={prompt.value}>
                  {prompt.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-2">
              Choose the role and expertise of your AI assistant
            </p>
          </div>

          {/* Personality */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Personality Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {personalities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPersonality(p.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    personality === p.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{p.label}</div>
                  <div className="text-sm text-gray-500 mt-1">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* LLM Provider */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              LLM Provider
            </label>
            <select
              value={llmProvider}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {llmProviders.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Model
            </label>
            <select
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {currentProvider?.models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>

          {/* Temperature Slider */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Temperature: {llmTemperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={llmTemperature}
              onChange={(e) => setLlmTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Precise (0)</span>
              <span>Balanced (0.5)</span>
              <span>Creative (1)</span>
            </div>
          </div>

          {/* Document Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Documents ({selectedDocuments.length}/{availableDocuments.length})
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {availableDocuments.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => toggleDocument(doc.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedDocuments.includes(doc.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedDocuments.includes(doc.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedDocuments.includes(doc.id) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-500" />
                        <span className="font-medium text-gray-800">{doc.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{doc.summary?.substring(0, 100)}...</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Selected documents will be used for RAG retrieval in this chat
            </p>
          </div>

          {/* Custom Prompt (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Custom System Prompt (Optional)
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="You are a helpful assistant..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedDocuments.length === 0}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            title={selectedDocuments.length === 0 ? 'Please select at least one document' : ''}
          >
            Create Chat with {selectedDocuments.length} {selectedDocuments.length === 1 ? 'Document' : 'Documents'}
          </button>
        </div>
      </div>
    </div>
  );
}

