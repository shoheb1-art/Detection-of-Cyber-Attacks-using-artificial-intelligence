import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Register.css'; // Re-use styles

const VerifyEmail = () => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/verify-email', { email, code });
      setMessage(response.data);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data || 'Verification failed.');
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/resend-verification', { email });
      setMessage(response.data);
    } catch (err: any) {
      setError(err.response?.data || 'Failed to resend code.');
    }
  };

  if (!email) {
    return (
        <div className="register-container">
            <div className="register-card">
                <h2>Error</h2>
                <p>No email address was provided. Please register first.</p>
                <Link to="/register">Go to Register</Link>
            </div>
        </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Verify Your Account</h2>
        <p style={{color: 'var(--text-secondary)'}}>A 6-digit code was sent to {email}.</p>
        <form onSubmit={handleVerify}>
          <input type="text" placeholder="Enter verification code" value={code} onChange={e => setCode(e.target.value)} required />
          {error && <p className="error-message">{error}</p>}
          {message && <p className="success-message">{message}</p>}
          <button type="submit">Verify</button>
        </form>
        <div className="login-link">
          Didn't receive a code? <button onClick={handleResend} style={{background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, fontSize: 'inherit', fontWeight: 500}}>Resend Code</button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;