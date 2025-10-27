'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, Zap } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Props {
  chatId: string;
  onMessageSent: () => void;
}

export default function ChatInput({ chatId, onMessageSent }: Props) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showLlmDropdown, setShowLlmDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Per-message LLM selection
  const [llmProvider, setLlmProvider] = useState('openai');
  const [llmModel, setLlmModel] = useState('gpt-4-turbo-preview');
  const [llmTemperature, setLlmTemperature] = useState(0.7);

  const llmOptions = {
    openai: [
      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo', icon: '🚀' },
      { value: 'gpt-4', label: 'GPT-4', icon: '🤖' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', icon: '⚡' },
    ],
    anthropic: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', icon: '✨' },
    ],
  };

  const handleProviderChange = (provider: string, modelValue: string) => {
    setLlmProvider(provider);
    setLlmModel(modelValue);
    setShowLlmDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLlmDropdown(false);
      }
    };

    if (showLlmDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLlmDropdown]);

  // Get current model label
  const getCurrentModelLabel = () => {
    const allModels = [...llmOptions.openai, ...llmOptions.anthropic];
    const current = allModels.find(m => m.value === llmModel);
    return current ? `${current.icon} ${current.label}` : 'Select Model';
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    const userMessage = message;
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message: userMessage,
          stream: false,
          llm_provider: llmProvider,
          llm_model: llmModel,
          llm_temperature: llmTemperature,
        }),
      });

      if (response.ok) {
        onMessageSent();
      } else {
        alert('Failed to send message');
        setMessage(userMessage); // Restore message
      }
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to send message');
      setMessage(userMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-gradient-to-b from-white to-gray-50 p-4 shadow-sm">
      <div className="flex gap-3 items-end">
        {/* Message Input Container */}
        <div className="flex-1 flex flex-col gap-2">
          {/* LLM Selector Dropdown Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLlmDropdown(!showLlmDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg text-sm transition-all border border-blue-200 shadow-sm"
            >
              <Zap size={14} className="text-blue-600" />
              <span className="font-semibold text-gray-800">{getCurrentModelLabel()}</span>
              <ChevronDown size={14} className={`text-gray-600 transition-transform ${showLlmDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showLlmDropdown && (
              <div className="absolute bottom-full mb-2 left-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                {/* OpenAI Section */}
                <div className="p-2 border-b">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1">OpenAI</div>
                  {llmOptions.openai.map((model) => (
                    <button
                      key={model.value}
                      onClick={() => handleProviderChange('openai', model.value)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                        llmProvider === 'openai' && llmModel === model.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span className="text-lg">{model.icon}</span>
                      <span className="font-medium text-sm">{model.label}</span>
                      {llmProvider === 'openai' && llmModel === model.value && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Anthropic Section */}
                <div className="p-2 border-b">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1">Anthropic</div>
                  {llmOptions.anthropic.map((model) => (
                    <button
                      key={model.value}
                      onClick={() => handleProviderChange('anthropic', model.value)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                        llmProvider === 'anthropic' && llmModel === model.value ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span className="text-lg">{model.icon}</span>
                      <span className="font-medium text-sm">{model.label}</span>
                      {llmProvider === 'anthropic' && llmModel === model.value && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Temperature Control */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Temperature</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{llmTemperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={llmTemperature}
                    onChange={(e) => setLlmTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Precise</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              disabled={sending}
              className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 shadow-sm transition-all text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className={`px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 flex-shrink-0 font-medium ${
            !message.trim() || sending
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
          }`}
          title="Send message (Enter)"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send size={20} />
              <span>Send</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
        <Zap size={12} />
        <p>Select LLM model per message • Documents are linked when creating chat</p>
      </div>
    </div>
  );
}

