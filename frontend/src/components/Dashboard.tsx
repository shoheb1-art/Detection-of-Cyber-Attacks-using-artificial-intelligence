import './Dashboard.css';
import type { Activity } from '../App';

// Define the type for the props we'll receive
interface DashboardProps {
  totalScans: number;
  threatsDetected: number;
  recentActivities: Activity[];
}

const Dashboard = ({ totalScans, threatsDetected, recentActivities }: DashboardProps) => {
  const cleanResults = totalScans - threatsDetected;
  const successRate = totalScans > 0 ? ((cleanResults / totalScans) * 100).toFixed(1) : '0.0';

  // Helper to format time like "2 minutes ago"
  const timeSince = (dateString: string | Date) => {
  const date = new Date(dateString); // Convert the string to a Date object
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};
  
  return (
    <main className="dashboard-container">
       <div className="header">
        <h2>Security Dashboard</h2>
        <div className="status-indicator">System Active</div>
      </div>

      {/* Top Statistics Grid - NOW DYNAMIC */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header"><h4>Total Scans</h4></div>
          <h3 className="stat-card-value">{totalScans.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><h4>Threats Detected</h4></div>
          <h3 className="stat-card-value" style={{color: 'var(--red)'}}>{threatsDetected.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><h4>Clean Results</h4></div>
          <h3 className="stat-card-value" style={{color: 'var(--green)'}}>{cleanResults.toLocaleString()}</h3>
        </div>
        <div className="stat-card">
          <div className="stat-card-header"><h4>Success Rate</h4></div>
          <h3 className="stat-card-value">{successRate}%</h3>
        </div>
      </div>

      {/* Activity and Distribution Grid */}
      <div className="activity-grid">
        <div className="activity-card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {recentActivities.length === 0 && <p>No scans performed yet.</p>}
            {recentActivities.map(activity => (
              <li className="activity-item" key={activity.id}>
                <div className="activity-info">
                  <div className={`activity-dot ${activity.result === 'Threat' ? 'red' : 'green'}`}></div>
                  <div className="activity-text">
                    <h4>{activity.scan_type}</h4>
                    <p>{timeSince(activity.timestamp)}</p>
                  </div>
                </div>
                <div className={`activity-status ${activity.result === 'Threat' ? 'threat' : 'clean'}`}>
                  {activity.result}
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Other cards like Threat Distribution can be made dynamic similarly */}
        <div className="activity-card">
             <h3>Threat Distribution</h3>
              {/* This part can be made dynamic later by calculating stats from the 'activities' array */}
              <p style={{color: 'var(--text-secondary)'}}>No threats detected yet.</p>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;