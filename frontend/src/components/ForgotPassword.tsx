import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Register.css'; // Re-use the styles from the register page

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
      setMessage(response.data);
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Forgot Password</h2>
        <p style={{color: 'var(--text-secondary)', marginTop: '-1rem', marginBottom: '2rem'}}>
            Enter your email and we'll send a reset link.
        </p>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
          {message && <p className="success-message">{message}</p>}
          <button type="submit">Send Reset Link</button>
        </form>
        <p className="login-link">
          Remembered your password? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;