'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Upload, FileText } from 'lucide-react';
import ChatSidebar from '@/components/ChatSidebar';
import NewChatModal from '@/components/NewChatModal';
import DocumentUpload from '@/components/DocumentUpload';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Chat {
  id: string;
  system_prompt: string;
  personality: string | null;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  mime_type: string;
  summary: string;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadChats();
    loadDocuments();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/`);
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };
  
  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_URL}/docs/`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleNewChat = async (
    systemPrompt: string,
    personality: string,
    documentIds: string[],
    llmProvider?: string,
    llmModel?: string,
    llmTemperature?: number
  ) => {
    try {
      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: systemPrompt,
          personality: personality || null,
          document_ids: documentIds,
          llm_provider: llmProvider || 'openai',
          llm_model: llmModel || 'gpt-4-turbo-preview',
          llm_temperature: llmTemperature !== undefined ? llmTemperature : 0.7,
        }),
      });
      
      if (response.ok) {
        const newChat = await response.json();
        setShowNewChatModal(false);
        // Navigate to the new chat
        router.push(`/chat/${newChat.id}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };
  
  const handleUploadComplete = () => {
    loadDocuments();
    setShowUploadModal(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        selectedChatId={null}
        onNewChat={() => setShowNewChatModal(true)}
      />

      {/* Main Welcome Area */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto p-8">
        <div className="text-center max-w-4xl">
          <MessageSquare size={80} className="mx-auto mb-6 text-gray-300" />
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Research Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Upload documents → Create chat → Ask questions
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-8 py-4 bg-green-500 text-white text-lg rounded-lg hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2"
            >
              <Upload size={24} />
              Upload Document
            </button>
            <button
              onClick={() => setShowNewChatModal(true)}
              disabled={documents.length === 0}
              className="px-8 py-4 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              title={documents.length === 0 ? 'Upload a document first' : ''}
            >
              <Plus size={24} />
              Create Chat ({documents.length} docs)
            </button>
          </div>
          
          {/* Documents List */}
          {documents.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm border mb-8 text-left">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Available Documents ({documents.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {documents.map(doc => (
                  <div key={doc.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="font-medium text-gray-800">{doc.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{doc.summary}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Features */}
          <div className="space-y-4 text-left bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-800 mb-3">✨ Features:</h3>
            <ul className="space-y-2 text-gray-600">
              <li>📄 Upload and parse documents (PDF, DOCX, TXT, MD)</li>
              <li>🔍 Hybrid search with vector + keyword retrieval</li>
              <li>💬 Conversational AI with context and memory</li>
              <li>📚 Source citations for every answer</li>
              <li>🎭 Multiple personality styles</li>
              <li>🌐 Web search for external information</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-2">
              <DocumentUpload onUploadComplete={handleUploadComplete} />
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onSubmit={handleNewChat}
          availableDocuments={documents}
        />
      )}
    </div>
  );
}
