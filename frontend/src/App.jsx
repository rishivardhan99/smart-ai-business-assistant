// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads'; // 1. Added this import!
import AdminLayout from './layouts/AdminLayout';
import Documents from './pages/Documents';
import Traces from './pages/Traces';
import Automations from './pages/Automations';
// Simple protection wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE: Customer AI Assistant */}
        <Route path="/" element={<Chat />} />

        {/* PUBLIC ROUTE: Admin Login */}
        <Route path="/login" element={<Login />} />

        {/* PROTECTED ROUTES: Admin Dashboard */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          {/* These render inside the AdminLayout's <Outlet /> */}
          <Route index element={<Dashboard />} />
          
          {/* 2. Uncommented this route to make the Leads page work! */}
          <Route path="leads" element={<Leads />} /> 
          <Route path="documents" element={<Documents />} />
          <Route path="traces" element={<Traces />} />
          <Route path="automations" element={<Automations />} />
          
          {/* Future routes: */}
          {/* <Route path="documents" element={<Documents />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}