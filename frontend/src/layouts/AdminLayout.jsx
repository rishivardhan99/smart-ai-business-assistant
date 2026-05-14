// src/layouts/AdminLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { setAuthToken } from '../api/apiConfig';
import { Activity, Users, FileText, Settings, LogOut, Network, Zap } from 'lucide-react';
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setAuthToken(null);
    navigate('/login');
  };

 const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Activity },
    { name: 'Leads', path: '/admin/leads', icon: Users },
    { name: 'Documents', path: '/admin/documents', icon: FileText },
    { name: 'Automations', path: '/admin/automations', icon: Zap }, // NEW ROUTE
    { name: 'Agent Traces', path: '/admin/traces', icon: Network },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">SmartAI Admin</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* This injects Dashboard.jsx, Leads.jsx, Traces.jsx, etc. */}
      </main>
    </div>
  );
}