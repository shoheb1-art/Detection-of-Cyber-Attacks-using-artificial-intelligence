import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove the token from local storage
    localStorage.removeItem('token');
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <header className="app-header">
      <NavLink to="/" className="logo">
        <svg /* ... your logo svg ... */ ></svg>
        <h1>Cyber attack Detector</h1>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" className="nav-link">
          <svg /* ... home icon svg ... */ ></svg>
          <span>Home</span>
        </NavLink>
        <NavLink to="/detector" className="nav-link">
          <svg /* ... detector icon svg ... */ ></svg>
          <span>Threat Detector</span>
        </NavLink>
        <NavLink to="/dashboard" className="nav-link">
          <svg /* ... dashboard icon svg ... */ ></svg>
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/profile" className="nav-link">
          <svg /* ... profile icon svg ... */ ></svg>
          <span>Profile</span>
        </NavLink>
        {/* ADD THE LOGOUT BUTTON */}
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header;