'use client';

import { Plus, MessageSquare, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Chat {
  id: string;
  system_prompt: string;
  personality: string | null;
  created_at: string;
}

interface Props {
  chats: Chat[];
  selectedChatId: string | null;
  onNewChat: () => void;
}

export default function ChatSidebar({ chats, selectedChatId, onNewChat }: Props) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getChatTitle = (chat: Chat) => {
    if (chat.personality) {
      return `${chat.personality.charAt(0).toUpperCase()}${chat.personality.slice(1)} Chat`;
    }
    return chat.system_prompt.slice(0, 30) + (chat.system_prompt.length > 30 ? '...' : '');
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="w-80 bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span className="font-semibold">New Chat</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-gray-800 border border-gray-700'
                    : 'hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare
                    size={18}
                    className={`mt-1 flex-shrink-0 ${
                      selectedChatId === chat.id ? 'text-blue-400' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {getChatTitle(chat)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {chat.personality && (
                        <span className="px-2 py-0.5 bg-blue-900 text-blue-200 text-xs rounded">
                          {chat.personality}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(chat.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          <p>AI Research Assistant</p>
          <p className="mt-1">Powered by FastAPI + OpenAI</p>
        </div>
      </div>
    </div>
  );
}
