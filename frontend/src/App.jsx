import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AgentDashboard from './pages/AgentDashboard';
import api from './api';
import Signup from './pages/Signup'; // Add this line!

// The Traffic Cop Component
function DashboardRouter() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const response = await api.get('users/me/');
                setRole(response.data.role);
            } catch (error) {
                console.error("Failed to fetch user role", error);
                // If the token is invalid or expired, kick them back to login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkUserRole();
    }, [navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-700 font-medium">Loading your workspace...</div>;
    }

    // Serve the correct dashboard based on the Django response
    if (role === 'ADMIN') {
        return <AdminDashboard />;
    } else {
        return <AgentDashboard />;
    }
}

// Main App Structure
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardRouter />} /> 
      </Routes>
    </Router>
  );
}

export default App;