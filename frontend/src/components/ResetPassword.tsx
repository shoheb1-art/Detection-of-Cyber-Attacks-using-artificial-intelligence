import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Register.css'; // Re-use the styles from the register page

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams(); // Gets the token from the URL
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', { token, password });
      setMessage(response.data);
      setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
    } catch (err: any) {
      setMessage(err.response?.data || 'An error occurred.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Set a New Password</h2>
        <form onSubmit={handleSubmit}>
          <input type="password" placeholder="Enter new password" value={password} onChange={e => setPassword(e.target.value)} required />
          {message && <p className={message.includes('successfully') ? 'success-message' : 'error-message'}>{message}</p>}
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;