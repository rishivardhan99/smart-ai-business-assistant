// src/pages/Automations.jsx
import { useState, useEffect } from 'react';
import { api } from '../api/apiConfig';
import { Zap, Mail, CheckCircle2 } from 'lucide-react';

export default function Automations() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    try {
      const response = await api.get('/automations/emails');
      setEmails(response.data.emails || []);
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
    // Auto-refresh the feed every 5 seconds to catch real background webhook processing
    const interval = setInterval(fetchEmails, 5000);
    return () => clearInterval(interval);
  }, []);

  const UrgencyBadge = ({ level }) => {
    const styles = {
      High: 'bg-red-100 text-red-700 border-red-200',
      Medium: 'bg-amber-100 text-amber-700 border-amber-200',
      Low: 'bg-green-100 text-green-700 border-green-200'
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[level] || styles.Medium}`}>
        {level} Priority
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="text-indigo-600" /> Autonomous Inbox Triage
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Emails forwarded to the webhook are autonomously analyzed and converted into action items.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="text-center p-12 text-gray-500">Loading automation feed...</div>
        ) : emails.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl border border-gray-200 text-gray-500">
            <Mail className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No emails have been triaged yet.</p>
            <p className="text-xs mt-1">Submit an email through the public support portal to see it arrive here.</p>
          </div>
        ) : (
          emails.map((email) => (
            <div key={email.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Side: Original Email Info */}
              <div className="bg-gray-50 p-6 md:w-2/5 border-r border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    {email.sender_email}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(email.created_at).toLocaleTimeString()}</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{email.subject}</h4>
                <p className="text-sm text-gray-600 line-clamp-4 font-serif italic border-l-4 border-gray-300 pl-3">
                  "{email.original_content}"
                </p>
              </div>

              {/* Right Side: AI Extracted Data */}
              <div className="p-6 md:w-3/5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Executive Summary</h4>
                  <UrgencyBadge level={email.urgency} />
                </div>
                <div className="mb-6 text-sm text-gray-800 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  {email.summary}
                </div>

                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Extracted Action Items</h4>
                <div className="space-y-2 flex-1">
                  {email.action_items?.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="mt-0.5 text-indigo-500">
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-sm text-gray-700 leading-tight">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}