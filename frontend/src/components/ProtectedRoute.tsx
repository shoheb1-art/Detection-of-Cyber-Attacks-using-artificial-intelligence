import { Outlet } from 'react-router-dom';
import LoginModal from './LoginModal'; // Import the new modal

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // If a token exists, the user is logged in. Render the requested page.
  if (token) {
    return <Outlet />;
  }

  // If no token, show the requested page content behind the login modal.
  return (
    <>
      <div style={{ filter: 'blur(4px)', pointerEvents: 'none' }}>
        <Outlet />
      </div>
      <LoginModal />
    </>
  );
};

export default ProtectedRoute;