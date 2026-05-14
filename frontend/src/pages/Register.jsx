import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/signup', { email, password })
      navigate('/login')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setError(detail[0].msg)
      } else if (typeof detail === 'string') {
        setError(detail)
      } else {
        setError('Registration failed')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md bg-card border shadow-sm rounded-xl p-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Create Account</h1>
        <p className="text-muted-foreground mb-6">Enter your details to create your admin account.</p>
        
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">{error}</div>}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition">
            Register
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
