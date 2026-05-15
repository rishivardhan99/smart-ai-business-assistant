// src/pages/Leads.jsx
import { useState, useEffect } from 'react';
import { api } from '../api/apiConfig';
import { 
  Search, 
  Mail, 
  Building2, 
  Flame, 
  Snowflake, 
  Sun, 
  FileText, 
  X, 
  CheckCircle, 
  MessageSquare, 
  ShieldAlert,
  Calendar,
  Clock
} from 'lucide-react';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableDraft, setEditableDraft] = useState("");

  const fetchLeads = async () => {
    try {
      const response = await api.get('/leads/');
      setLeads(response.data.leads || response.data); 
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // --- Calendar Download Logic ---
  const downloadCalendar = async (leadId, leadName) => {
    try {
      const response = await api.get(`/leads/${leadId}/calendar`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meeting_${leadName || 'client'}.ics`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to download calendar", err);
      alert("Could not generate calendar invite.");
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      hot: "bg-red-50 text-red-700 border-red-200",
      warm: "bg-orange-50 text-orange-700 border-orange-200",
      cold: "bg-blue-50 text-blue-700 border-blue-200",
      synced: "bg-green-50 text-green-700 border-green-200",
      "awaiting review": "bg-yellow-50 text-yellow-700 border-yellow-200"
    };
    const icons = {
      hot: <Flame size={14} className="mr-1" />,
      warm: <Sun size={14} className="mr-1" />,
      cold: <Snowflake size={14} className="mr-1" />,
      synced: <CheckCircle size={14} className="mr-1" />,
      "awaiting review": <Clock size={14} className="mr-1" />
    };
    const safeStatus = status?.toLowerCase() || 'awaiting review';
    const style = styles[safeStatus] || "bg-gray-50 text-gray-700 border-gray-200";
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${style}`}>
        {icons[safeStatus]} {status?.toUpperCase() || 'AWAITING REVIEW'}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Intelligence</h1>
          <p className="mt-1 text-sm text-gray-500">Autonomous capture, scoring, and follow-up generation.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex gap-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">AI Confidence</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Automation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading leads...</td></tr>
            ) : filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                      {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{lead.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Mail size={12} /> {lead.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${lead.confidence_score > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${lead.confidence_score || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{lead.confidence_score || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {lead.follow_up_draft ? (
                    <button 
                      onClick={() => {
                        setSelectedDraft(lead);
                        setEditableDraft(lead.follow_up_draft || ""); // Load draft for editing
                        setIsEditing(false); // Default to view mode
                      }}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${
                        lead.status === 'synced' 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {lead.status === 'synced' ? <CheckCircle size={14} /> : <FileText size={14} />}
                      {lead.status === 'synced' ? 'View Handoff' : 'Review Draft'}
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">No draft</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Draft & Context Modal */}
      {selectedDraft && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  Lead Handoff: {selectedDraft.name}
                  {selectedDraft.status === 'synced' && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <CheckCircle size={12} /> SYNCED
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-500">{selectedDraft.email}</p>
              </div>
              <button onClick={() => {
                setSelectedDraft(null);
                fetchLeads(); 
              }} className="text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Context */}
                <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-500" />
                    Conversation Context
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1 min-h-[350px] overflow-y-auto text-sm space-y-4 shadow-inner">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <p className="font-semibold text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Building2 size={12} /> User ({selectedDraft.name})
                      </p>
                      <p className="text-gray-800">Hi, I need a demo of your platform. My budget is around {selectedDraft.budget_range || "$5000"}.</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg shadow-sm border border-blue-200 ml-4">
                      <p className="font-semibold text-xs text-blue-600 mb-1 flex items-center gap-1">
                        <Sun size={12} /> AI Assistant
                      </p>
                      <p className="text-blue-900">I'd be happy to help set up a demo! To get started, could I get your email address so our sales team can reach out?</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200">
                      <p className="font-semibold text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Building2 size={12} /> User ({selectedDraft.name})
                      </p>
                      <p className="text-gray-800">Sure, it's {selectedDraft.email}.</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Draft & Edit Toggle */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <FileText size={16} className="text-indigo-500" />
                      Autonomous Follow-Up Draft
                    </h4>
                    
                    {/* EDIT BUTTON */}
                    {selectedDraft.status !== 'synced' && (
                      <button 
                        onClick={async () => {
                          if (isEditing) {
                            // Save the draft to the database
                            try {
                              await api.put(`/leads/${selectedDraft.id}/draft`, { draft: editableDraft });
                              setSelectedDraft({...selectedDraft, follow_up_draft: editableDraft});
                              fetchLeads(); // Refresh table behind modal
                            } catch (err) {
                              alert("Failed to save draft");
                            }
                          }
                          setIsEditing(!isEditing);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200"
                      >
                        {isEditing ? '💾 Save Changes' : '✏️ Edit Draft'}
                      </button>
                    )}
                  </div>

                  <div className="bg-indigo-50/30 p-5 rounded-xl border border-indigo-100 flex-1 min-h-[350px] overflow-y-auto shadow-inner relative flex flex-col">
                    {selectedDraft.status === 'synced' && (
                      <div className="absolute top-4 right-4 rotate-12 opacity-20 pointer-events-none z-0">
                        <span className="text-4xl font-black text-green-600 uppercase tracking-widest border-4 border-green-600 p-2 rounded-lg">SENT</span>
                      </div>
                    )}
                    
                    {/* TEXT AREA VS PARAGRAPH TOGGLE */}
                    {isEditing ? (
                      <textarea
                        value={editableDraft}
                        onChange={(e) => setEditableDraft(e.target.value)}
                        className="w-full flex-1 min-h-[300px] p-3 text-sm text-gray-700 bg-white border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono relative z-10 resize-none shadow-sm"
                        placeholder="Write your email draft here..."
                      />
                    ) : (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed relative z-10">
                        {selectedDraft.follow_up_draft || "No draft available."}
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <span className="text-xs text-gray-500 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" /> 
                Review AI drafts before pushing to the CRM pipeline.
              </span>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => downloadCalendar(selectedDraft.id, selectedDraft.name)}
                  className="px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 bg-indigo-50 rounded-lg transition-colors border border-indigo-200 flex items-center gap-2"
                >
                  <Calendar size={16} /> Download .ics
                </button>
                
                <button 
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    const originalContent = btn.innerHTML;
                    btn.innerHTML = '<span class="flex items-center gap-2">Syncing...</span>';
                    btn.disabled = true;
                    
                    try {
                      await api.post(`/leads/${selectedDraft.id}/sync`);
                      btn.innerHTML = '<span class="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Synced to Google Sheets</span>';
                      btn.className = "px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg shadow-sm flex items-center justify-center min-w-[150px] transition-all cursor-not-allowed";
                      setSelectedDraft({...selectedDraft, status: 'synced'}); 
                    } catch (err) {
                      console.error(err);
                      btn.innerHTML = 'Sync Failed (See Console)';
                      btn.className = "px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg shadow-sm flex items-center justify-center min-w-[150px] transition-all";
                      setTimeout(() => {
                         btn.innerHTML = originalContent;
                         btn.disabled = false;
                         btn.className = "px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm flex items-center justify-center min-w-[150px] transition-all bg-blue-600 hover:bg-blue-700";
                      }, 3000);
                    }
                  }}
                  disabled={selectedDraft.status === 'synced'}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm flex items-center justify-center min-w-[150px] transition-all ${
                    selectedDraft.status === 'synced' 
                    ? 'bg-green-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {selectedDraft.status === 'synced' ? (
                    <span className="flex items-center gap-2"><CheckCircle size={16} /> Synced</span>
                  ) : 'Approve & Sync'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}