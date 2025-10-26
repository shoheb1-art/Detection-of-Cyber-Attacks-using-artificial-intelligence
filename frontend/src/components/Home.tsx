import { Link } from 'react-router-dom';
import './Home.css';
import type { Activity } from '../App';

// Define the types for the props we'll receive from App.tsx
interface HomeProps {
  totalScans: number;
  threatsDetected: number;
  recentActivities: Activity[];
}

const Home = ({ totalScans, threatsDetected, recentActivities }: HomeProps) => {
  const successRate = totalScans > 0 ? (((totalScans - threatsDetected) / totalScans) * 100).toFixed(1) : '100.0';

  // Helper to format time
  const timeSince = (dateString: string | Date) => {
  const date = new Date(dateString); // Convert the string to a Date object
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min ago";
  return Math.floor(seconds) + " seconds ago";
};

  return (
    <main className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <h1>Cyber attack Detector</h1>
        <p>Advanced threat detection powered by machine learning. Protect your applications from SQL injection, phishing attempts, and malicious files.</p>
        <div className="hero-buttons">
          <Link to="/detector" className="btn btn-primary">Start Detection →</Link>
          <Link to="/dashboard" className="btn btn-secondary">View Analytics</Link>
        </div>
      </div>

      {/* Dynamic Stats Section */}
      <div className="stats-section">
        <div className="home-stat-card">
          <h4>Threats Detected</h4>
          <p>{threatsDetected.toLocaleString()}</p>
        </div>
        <div className="home-stat-card">
          <h4>Scans Performed</h4>
          <p>{totalScans.toLocaleString()}</p>
        </div>
        <div className="home-stat-card">
          <h4>Success Rate</h4>
          <p>{successRate}%</p>
        </div>
      </div>

      {/* Features and Activity Section */}
      <div className="features-grid">
        <div className="key-features">
          <h3>Key Features</h3>
          <div className="feature-item"><h4>Multi-Threat Detection</h4><p>Advanced detection for SQL Injection, Phishing URLs, and malicious files.</p></div>
          <div className="feature-item"><h4>Real-Time Analysis</h4><p>Instant threat assessment with high-confidence ML predictions.</p></div>
          <div className="feature-item"><h4>Analytics Dashboard</h4><p>Comprehensive insights and threat trend visualization.</p></div>
          <div className="feature-item"><h4>Team Collaboration</h4><p>Share findings and collaborate with your security team.</p></div>
        </div>
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          {recentActivities.length === 0 ? <p className="no-activity">Perform a scan to see activity here.</p> :
            recentActivities.map(activity => (
              <div className="home-activity-item" key={activity.id}>
                <div className="activity-info">
                  <div className={`activity-dot ${activity.result === 'Threat' ? 'red' : 'orange'}`}></div>
                  <div className="activity-text">
                    <h4>{activity.scan_type}</h4>
                    <p>{timeSince(activity.timestamp)}</p>
                  </div>
                </div>
                <div className={`home-activity-status ${activity.result === 'Threat' ? 'blocked' : 'clean'}`}>
                  {activity.result === 'Threat' ? 'Blocked' : 'High'}
                </div>
              </div>
            ))
          }
          <Link to="/dashboard" className="view-all-link">View All Activity →</Link>
        </div>
      </div>
    </main>
  );
};

export default Home;