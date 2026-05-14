// src/pages/Traces.jsx
import { useState, useEffect } from 'react';
import { api } from '../api/apiConfig';
import { Activity, Clock, ShieldCheck, Database, GitMerge, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Traces() {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTraces = async () => {
      try {
        const response = await api.get('/traces/');
        setTraces(response.data.traces || []);
      } catch (err) {
        console.error("Failed to load traces", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTraces();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="text-blue-600" /> LangGraph Agent Traces
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Live monitoring of multi-agent orchestration, RAG retrieval, and hallucination validation.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center p-12 text-gray-500">Loading agent telemetry...</div>
        ) : traces.length === 0 ? (
          <div className="text-center p-12 text-gray-500 bg-white rounded-xl border border-gray-200">No traces recorded yet. Chat with the bot!</div>
        ) : (
          traces.map((trace) => (
            <div key={trace.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
              
              {/* Left Column: The Request */}
              <div className="p-5 md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    {new Date(trace.created_at).toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 font-mono">
                    <Clock size={12}/> {trace.execution_time_ms}ms
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900 line-clamp-3">"{trace.user_input}"</p>
              </div>

              {/* Right Column: The Visual Agent Pipeline */}
              <div className="p-5 md:w-2/3 flex items-center justify-between gap-2 overflow-x-auto">
                
                {/* Node 1: Planner */}
                <div className="flex flex-col items-center flex-shrink-0 w-24">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2 border border-purple-200">
                    <GitMerge size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Planner</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    trace.intent === 'qa' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    trace.intent === 'lead_capture' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-gray-100 text-gray-700 border-gray-200'
                  }`}>
                    {trace.intent}
                  </span>
                </div>

                <div className="h-0.5 w-12 bg-gray-200 flex-shrink-0"></div>

                {/* Node 2: Retriever (Only active if QA) */}
                <div className={`flex flex-col items-center flex-shrink-0 w-24 ${trace.intent !== 'qa' ? 'opacity-40 grayscale' : ''}`}>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 border border-blue-200">
                    <Database size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Retriever</span>
                  <span className="text-xs font-medium text-gray-700">
                    {trace.chunks_retrieved} Chunks
                  </span>
                </div>

                <div className="h-0.5 w-12 bg-gray-200 flex-shrink-0"></div>

                {/* Node 3: Validator */}
                <div className={`flex flex-col items-center flex-shrink-0 w-28 ${trace.intent !== 'qa' ? 'opacity-40 grayscale' : ''}`}>
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-2 border ${
                    !trace.is_grounded ? 'bg-red-100 text-red-600 border-red-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'
                  }`}>
                    {trace.is_grounded ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Validator</span>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={`text-[10px] font-bold ${trace.is_grounded ? 'text-emerald-600' : 'text-red-600'}`}>
                      {trace.is_grounded ? 'GROUNDED' : 'HALLUCINATED'}
                    </span>
                    {trace.retry_count > 0 && (
                      <span className="text-[10px] text-amber-600 font-medium">Retries: {trace.retry_count}</span>
                    )}
                  </div>
                </div>

                <div className="h-0.5 w-12 bg-gray-200 flex-shrink-0"></div>

                {/* Node 4: Executor */}
                <div className="flex flex-col items-center flex-shrink-0 w-24">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 border border-indigo-200">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Executor</span>
                  <span className="text-xs font-medium text-gray-700">Responded</span>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}