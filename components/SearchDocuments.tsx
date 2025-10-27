'use client';

import { useState } from 'react';
import { Search, FileText } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SearchDocuments() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/search/?query=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Search className="text-blue-500" />
        Search Documents
      </h2>

      {/* Search Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your search query..."
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Found {results.results?.length || 0} results for &quot;{results.query}&quot;
          </div>

          {results.results && results.results.length > 0 ? (
            <div className="space-y-4">
              {results.results.map((result: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <FileText className="text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Chunk #{result.chunk_index}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Score: {result.hybrid_score?.toFixed(3)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {result.content.substring(0, 300)}
                        {result.content.length > 300 && '...'}
                      </p>
                      {result.document_title && (
                        <p className="text-xs text-gray-500 mt-2">
                          From: {result.document_title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Search size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

