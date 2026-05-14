import { useState } from 'react'
import { PlayCircle } from 'lucide-react'
import api from '../lib/api'

export default function Workflows() {
  const [status, setStatus] = useState('')

  const triggerAutomation = async (endpoint, data) => {
    setStatus('Running...')
    try {
      const res = await api.post(`/automations${endpoint}`, data)
      setStatus(`Success: ${JSON.stringify(res.data)}`)
    } catch (err) {
      setStatus('Error running automation')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Workflows & Automations</h1>
      
      {status && (
        <div className="mb-6 p-4 bg-muted border rounded-md text-sm font-mono">
          {status}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Summarize Email</h3>
          <p className="text-muted-foreground text-sm mb-4">Extracts action items and summary from a block of text.</p>
          <button 
            onClick={() => triggerAutomation('/summarize-email', { email_body: 'Hello, please send me the Q4 reports and schedule a meeting for Friday. Thanks!' })}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition"
          >
            <PlayCircle size={16} /> Run Test
          </button>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Generate Follow-up</h3>
          <p className="text-muted-foreground text-sm mb-4">Drafts a personalized follow-up email for a lead.</p>
          <button 
            onClick={() => triggerAutomation('/generate-followup', { lead_name: 'John Doe', use_case: 'Interested in API integration' })}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition"
          >
            <PlayCircle size={16} /> Run Test
          </button>
        </div>
        
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-2">Google Sheets Sync</h3>
          <p className="text-muted-foreground text-sm mb-4">Pushes a captured lead into the CRM Google Sheet.</p>
          <button 
            onClick={() => triggerAutomation('/sync-sheets', { name: 'Alice', email: 'alice@test.com' })}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium transition"
          >
            <PlayCircle size={16} /> Run Test
          </button>
        </div>
      </div>
    </div>
  )
}
