import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockData = [
  { name: 'Mon', interactions: 120 },
  { name: 'Tue', interactions: 180 },
  { name: 'Wed', interactions: 250 },
  { name: 'Thu', interactions: 210 },
  { name: 'Fri', interactions: 160 },
  { name: 'Sat', interactions: 90 },
  { name: 'Sun', interactions: 70 },
]

export default function Analytics() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">AI Analytics</h1>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-6">Weekly AI Interactions</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{ borderRadius: '8px' }} />
              <Bar dataKey="interactions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
