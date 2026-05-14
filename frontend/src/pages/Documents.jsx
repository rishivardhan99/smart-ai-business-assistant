// src/pages/Documents.jsx
import { useState, useEffect, useRef } from 'react';
import { api } from '../api/apiConfig';
import { UploadCloud, FileText, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/');
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Only PDF files are supported.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: '', message: '' });
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setUploadStatus({ type: 'success', message: `${file.name} indexed successfully!` });
      fetchDocuments(); 
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus({ type: 'error', message: 'Failed to upload and index document.' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- NEW: Delete functionality ---
  const handleDelete = async (docId, filename) => {
    // Prevent accidental deletions
    if (!window.confirm(`Are you sure you want to delete "${filename}"? The AI will no longer use this for RAG.`)) {
      return;
    }

    setUploadStatus({ type: '', message: '' });

    try {
      await api.delete(`/documents/${docId}`);
      setUploadStatus({ type: 'success', message: `${filename} was deleted.` });
      fetchDocuments(); // Refresh the list
    } catch (err) {
      console.error("Delete failed:", err);
      setUploadStatus({ type: 'error', message: 'Failed to delete the document.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload PDFs to train your AI Assistant. The AI will use these documents to answer customer questions.
        </p>
      </div>

      {uploadStatus.message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
          uploadStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {uploadStatus.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <p className="text-sm font-medium">{uploadStatus.message}</p>
        </div>
      )}

      <div 
        className={`relative bg-white border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {isUploading ? 'Uploading & Indexing...' : 'Click or drag file to this area to upload'}
          </h3>
          <p className="text-sm text-gray-500">Support for a single PDF upload (Max 10MB)</p>
        </label>
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Indexed Documents</h3>
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <FileText size={48} className="text-gray-300 mb-4" />
              <p>No documents uploaded yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{doc.filename}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CheckCircle size={12} className="text-green-500" /> Indexed
                        </span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* NEW: Attached the onClick handler here */}
                  <button 
                    onClick={() => handleDelete(doc.id, doc.filename)}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Document"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}