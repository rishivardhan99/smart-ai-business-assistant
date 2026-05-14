import { useState } from 'react'
import { UploadCloud, File, CheckCircle2, XCircle } from 'lucide-react'
import api from '../lib/api'

export default function Knowledge() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle') // idle, uploading, success, error

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setStatus('uploading')
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setStatus('success')
      setFile(null)
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="p-10 max-w-4xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
      <h1 className="text-4xl font-bold mb-3 tracking-tight text-gray-900 dark:text-white">Knowledge Base (RAG)</h1>
      <p className="text-gray-500 text-lg mb-10">Upload text or markdown documents to give your AI assistant context about your business.</p>

      <div className="bg-card p-8 rounded-xl border shadow-sm">
        
        <div className="border-2 border-dashed bg-muted/20 hover:bg-muted/50 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer">
          <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload a Document</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">Drag and drop your .txt or .md file here, or click to browse from your computer.</p>
          
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".txt,.md"
            onChange={handleFileChange}
          />
          <label 
            htmlFor="file-upload"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md font-medium cursor-pointer transition shadow-sm"
          >
            Select File
          </label>
        </div>

        {/* Selected File Area */}
        {file && (
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <File className="text-gray-400" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            
            <button 
              onClick={handleUpload}
              disabled={status === 'uploading'}
              className="bg-primary text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {status === 'uploading' ? 'Uploading & Chunking...' : 'Upload to Vector DB'}
            </button>
          </div>
        )}

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 />
            <p>Document successfully vectorized and stored in ChromaDB!</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
            <XCircle />
            <p>Failed to upload. Make sure it's a .txt or .md file.</p>
          </div>
        )}
      </div>
    </div>
  )
}
