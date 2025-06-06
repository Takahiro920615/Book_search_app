import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Users() {
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No token found, please log in.');
        navigate('/');
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/api/user', {
          headers: { Authorization: token },
        });
        setUserData(response.data);
        setMessage('User data loaded successfully!');
      } catch (error) {
        setMessage(`Failed to load user data: ${error.response?.data?.error || error.message}`);
        console.error('User data error:', error.response || error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/');
        }
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('No token found, already logged out!');
      navigate('/');
      return;
    }
    try {
      await axios.delete('http://localhost:3000/api/sign_out', {
        headers: { Authorization: token },
      });
      localStorage.removeItem('token');
      setMessage('Logout successful!');
      navigate('/');
    } catch (error) {
      setMessage(`Logout failed: ${error.response?.data?.error || error.message}`);
      console.error('Logout error:', error.response || error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
      {userData ? (
        <div>
          <p className="text-lg">Welcome, {userData.email || 'User'}!</p>
          <p className="text-gray-600">User ID: {userData.id}</p>
          <p className="text-gray-600">Last Login: {userData.last_login || 'N/A'}</p>
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Logout
      </button>
      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
}

export default Users;