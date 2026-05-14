// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { api } from '../api/apiConfig';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Users, Flame, Target, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/dashboard-kpis');
        setMetrics(response.data.metrics);
        setChartData(response.data.chartData || []);
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Map string icon names from backend to Lucide components
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Users': return <Users size={24} className="text-blue-500" />;
      case 'Flame': return <Flame size={24} className="text-orange-500" />;
      case 'Target': return <Target size={24} className="text-indigo-500" />;
      case 'ShieldAlert': return <ShieldAlert size={24} className="text-red-500" />;
      default: return <Activity size={24} className="text-gray-500" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-sm font-semibold text-gray-600 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-500 capitalize">{entry.name}:</span>
              <span className="font-bold text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-500 mt-1">Real-time metrics for your AI Assistant operations.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold border border-green-200">
          <CheckCircle2 size={16} /> Systems Operational
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-100 rounded-xl"></div>
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg group-hover:scale-110 transition-transform">
                    {getIcon(stat.icon)}
                  </div>
                </div>
                {/* Decorative bottom bar */}
                <div className={`absolute bottom-0 left-0 w-full h-1 ${
                  stat.icon === 'Flame' ? 'bg-orange-500' : 
                  stat.icon === 'ShieldAlert' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
              </div>
            ))}
          </div>

          {/* Recharts Area Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Traffic & Lead Conversion</h3>
                <p className="text-sm text-gray-500">7-day performance overview</p>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConvos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Area type="monotone" dataKey="conversations" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorConvos)" />
                  <Area type="monotone" dataKey="leads" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}