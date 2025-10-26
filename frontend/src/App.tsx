import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Home from './components/Home';
import ThreatDetector from './components/ThreatDetector';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import VerifyEmail from './components/VerifyEmail';
import './App.css';

export interface Activity {
  id: number;
  scan_type: string;
  query_text: string;
  result: 'Threat' | 'Clean';
  timestamp: Date;
}

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const token = localStorage.getItem('token');

  const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const fetchData = async () => {
    if (!token) return;
    try {
      const response = await api.get('/api/scans');
      setActivities(response.data);
    } catch (error) {
      console.error("Failed to fetch scan data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleNewScan = () => {
    fetchData();
  };
  
  const totalScans = activities.length;
  const threatsDetected = activities.filter(act => act.result === 'Threat').length;

  return (
    <BrowserRouter>
      <div className="app-container">
        {token && <Header />}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home totalScans={totalScans} threatsDetected={threatsDetected} recentActivities={activities.slice(0, 3)} />} />
            <Route path="/detector" element={<ThreatDetector onScanComplete={handleNewScan} />} />
            <Route path="/dashboard" element={<Dashboard totalScans={totalScans} threatsDetected={threatsDetected} recentActivities={activities.slice(0, 4)} />} />
            <Route path="/profile" element={<Profile totalScans={totalScans} threatsDetected={threatsDetected} recentActivities={activities.slice(0, 3)} />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;