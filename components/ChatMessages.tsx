'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, User, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Message {
  id: string;
  role: string;
  content: string;
  sources?: any;
  created_at: string;
}

interface Props {
  chatId: string;
  refreshTrigger?: number;
}

// Separate component for sources list to manage expansion state
function SourcesList({ sources }: { sources: any[] }) {
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});
  
  const toggleExpand = (idx: number) => {
    setExpandedSources(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };
  
  return (
    <div className="mt-3 pt-3 border-t border-gray-300">
      <p className="text-xs font-semibold mb-2 flex items-center gap-1">
        <FileText size={14} />
        Sources ({sources.length}):
      </p>
      <div className="space-y-2">
        {sources.map((source: any, idx: number) => {
          const isExpanded = expandedSources[idx] || false;
          const contentPreview = source.content ? 
            (source.content.length > 150 ? source.content.substring(0, 150) + '...' : source.content) : 
            null;
          
          return (
            <div key={idx} className="text-xs bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  [{source.citation_id || idx + 1}]
                </span>
                <div className="flex-1 min-w-0">
                  {/* Document name/title */}
                  <div className="font-semibold text-gray-800 mb-1">
                    {source.title || source.document_name || 'Document'}
                  </div>
                  
                  {/* Page number */}
                  {source.page && source.page !== 'N/A' && (
                    <div className="text-gray-600 text-xs mb-1">
                      📄 Page {source.page}
                    </div>
                  )}
                  
                  {/* Chunk index if no page */}
                  {!source.page && source.chunk_index !== undefined && (
                    <div className="text-gray-600 text-xs mb-1">
                      📝 Chunk #{source.chunk_index + 1}
                    </div>
                  )}
                  
                  {/* Relevance score */}
                  {(source.score || source.hybrid_score) && (
                    <div className="text-gray-500 text-xs mb-2">
                      Relevance: {((source.score || source.hybrid_score) * 100).toFixed(0)}%
                    </div>
                  )}
                  
                  {/* Chunk content */}
                  {source.content && (
                    <div className="mt-2">
                      <div className="bg-white rounded p-2 border border-gray-200">
                        <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                          {isExpanded ? source.content : contentPreview}
                        </p>
                      </div>
                      {source.content.length > 150 && (
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="mt-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          {isExpanded ? '↑ Show less' : '↓ Show more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ChatMessages({ chatId, refreshTrigger }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, [chatId, refreshTrigger]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/chat/${chatId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Bot size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Start a Conversation
          </h3>
          <p className="text-gray-500">
            Upload documents and ask questions. I'll search through them and provide answers with citations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bot size={24} className="text-blue-600" />
            </div>
          )}

          <div
            className={`max-w-[70%] rounded-2xl p-4 ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

            {/* Sources */}
            {message.role === 'assistant' && (() => {
              // Get sources array from either format
              const sourcesArray = message.sources?.sources || (Array.isArray(message.sources) ? message.sources : null);
              
              if (!sourcesArray || sourcesArray.length === 0) return null;
              
              return <SourcesList sources={sourcesArray} />;
            })()}

            <p className="text-xs opacity-60 mt-2">
              {new Date(message.created_at).toLocaleTimeString()}
            </p>
          </div>

          {message.role === 'user' && (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-gray-600" />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

