'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Props {
  onUploadComplete?: () => void;
}

export default function DocumentUpload({ onUploadComplete }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Notify parent of successful upload
      if (onUploadComplete) {
        setTimeout(() => onUploadComplete(), 2000); // Give user time to see the summary
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Upload className="text-blue-500" />
        Upload Document
      </h2>

      {/* File Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a document (PDF, DOCX, TXT, MD)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {file && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} />
            <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
      >
        {loading ? 'Uploading & Processing...' : 'Upload Document'}
      </button>

      {/* Loading */}
      {loading && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-blue-700">
              Processing document... This may take a minute.
            </span>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div className="mt-6 p-6 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-500 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-2">
                Document Uploaded Successfully!
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <strong>Document ID:</strong>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {result.document_id}
                  </code>
                </p>
                <p>
                  <strong>Chunks Created:</strong> {result.chunk_count}
                </p>
                <p>
                  <strong>Storage Path:</strong>{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {result.storage_path}
                  </code>
                </p>
                <div className="mt-4 p-4 bg-white rounded border">
                  <strong>Summary:</strong>
                  <p className="mt-2 text-gray-600">{result.summary}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 rounded-md border border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-1" />
            <div>
              <h3 className="font-semibold text-red-800">Upload Failed</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

