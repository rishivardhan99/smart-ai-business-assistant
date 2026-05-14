import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>
      
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Account Actions</h3>
          <p className="text-sm text-muted-foreground mb-4">Manage your authentication session.</p>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}
