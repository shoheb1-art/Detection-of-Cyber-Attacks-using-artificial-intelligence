import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

const LoginModal = () => {
  const navigate = useNavigate();

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
          </svg>
        </div>
        <h2>Authentication Required</h2>
        <p>Please log in to access this feature and view your personalized dashboard.</p>
        <button onClick={() => navigate('/login')}>Go to Login Page</button>
      </div>
    </div>
  );
};

export default LoginModal;