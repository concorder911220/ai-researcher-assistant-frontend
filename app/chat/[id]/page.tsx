'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from '@/components/ChatSidebar';
import ChatMessages from '@/components/ChatMessages';
import ChatInput from '@/components/ChatInput';
import NewChatModal from '@/components/NewChatModal';

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

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const [chats, setChats] = useState<Chat[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadChats();
    loadDocuments();
  }, [refreshKey]);

  useEffect(() => {
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c.id === chatId);
      setSelectedChat(chat || null);
    }
  }, [chatId, chats]);

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
        router.push(`/chat/${newChat.id}`);
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleMessageSent = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        selectedChatId={chatId}
        onNewChat={() => setShowNewChatModal(true)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {selectedChat.personality ? (
                      <span className="capitalize">{selectedChat.personality} Assistant</span>
                    ) : (
                      'AI Research Assistant'
                    )}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Chat with your documents using RAG
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {selectedChat.personality || 'Default'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ChatMessages chatId={chatId} refreshTrigger={refreshKey} />

            {/* Input */}
            <ChatInput
              chatId={chatId}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Chat not found
              </h3>
              <p className="text-gray-500 mb-6">
                The chat you're looking for doesn't exist
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>

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

