import { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import type { Activity } from '../App';

// Define the types for the props we'll receive
interface ProfileProps {
  totalScans: number;
  threatsDetected: number;
  recentActivities: Activity[];
}

// Define the type for the user state
interface UserData {
    name: string;
    email: string;
    member_since?: string;
    last_login?: string;
}

const Profile = ({ totalScans, threatsDetected, recentActivities }: ProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserData>({ name: '', email: '' });
  
  const api = axios.create({
      baseURL: 'http://localhost:5000',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

  useEffect(() => {
    api.get('/api/profile')
      .then(response => setUser(response.data))
      .catch(error => console.error("Failed to fetch user data:", error));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put('/api/profile', user);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };
  
  const successRate = totalScans > 0 ? (((totalScans - threatsDetected) / totalScans) * 100).toFixed(1) : '100.0';

  // Calculate the number of days the user has been active
  let daysActive = 0;
  if (user.member_since) {
    const registrationDate = new Date(user.member_since);
    const today = new Date();
    const timeDifference = today.getTime() - registrationDate.getTime();
    daysActive = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  }

  // Format the "Member Since" date for display
  const memberSinceFormatted = user.member_since
    ? new Date(user.member_since).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })
    : 'N/A';

  return (
    <main className="profile-container">
      <div className="profile-card">
        {isEditing ? (
          <div className="profile-edit-form">
            <div className="avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
            </div>
            <div className="form-inputs">
              <input type="text" name="name" value={user.name} onChange={handleInputChange} />
              <input type="email" name="email" value={user.email} onChange={handleInputChange} />
              <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>Save</button>
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-header">
              <div className="avatar">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <div className="profile-info">
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <div className="tags">
                  <span className="tag green">Security Analyst</span>
                  <span className="tag blue">Cybersecurity</span>
                </div>
              </div>
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                <span>Edit</span>
              </button>
            </div>
            <div className="profile-details">
              <div><h4>Member Since</h4><p>{memberSinceFormatted}</p></div>
              <div><h4>Last Login</h4><p>{new Date(user.last_login || Date.now()).toLocaleString()}</p></div>
              <div><h4>Account Status</h4><p className="status-active">Active</p></div>
            </div>
          </>
        )}
      </div>

      <div className="profile-stats-grid">
        <div className="profile-stat-card"><h4>Scans Performed</h4><p>{totalScans.toLocaleString()}</p><span>This month</span></div>
        <div className="profile-stat-card"><h4>Threats Found</h4><p>{threatsDetected.toLocaleString()}</p><span>This month</span></div>
        <div className="profile-stat-card"><h4>Days Active</h4><p>{daysActive}</p><span>Since registration</span></div>
        <div className="profile-stat-card"><h4>Success Rate</h4><p>{successRate}%</p><span>This month</span></div>
      </div>

      <div className="profile-bottom-grid">
        <div className="profile-activity-card">
          <h3>Recent Activity</h3>
          <ul className="profile-activity-list">
            {recentActivities.length > 0 ? (
              recentActivities.map(activity => (
                <li className="profile-activity-item" key={activity.id}>
                  <div className={`activity-dot ${activity.result === 'Threat' ? 'red' : 'green'}`}></div>
                  <span>{activity.scan_type} scan completed</span>
                  <span className={`status-tag ${activity.result === 'Threat' ? 'threat' : 'clean'}`}>{activity.result}</span>
                </li>
              ))
            ) : (
              <p className="no-activity-text">No recent activity to show.</p>
            )}
          </ul>
        </div>
        <div className="profile-activity-card">
          <h3>Security Settings</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Two-Factor Authentication is enabled.</p>
        </div>
      </div>
    </main>
  );
};

export default Profile;