// src/pages/AuthSuccess.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Try to validate session
    fetch('https://inbox-pilot-production.up.railway.app/me', {
      credentials: 'include'
    })
      .then(res => {
        if (res.ok) return res.json();
        else throw new Error('Not authenticated');
      })
      .then(data => {
        console.log("User is authenticated:", data);
        navigate('/dashboard');
      })
      .catch(err => {
        console.error('Auth check failed:', err);
        navigate('/');
      });
  }, []);

  return <p>Authenticating...</p>;
}

export default AuthSuccess;
