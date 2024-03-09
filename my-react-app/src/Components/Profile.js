import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const navigate = useNavigate();

  const handleChangeUsername = async (newUsername) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/user/change-username', { newUsername }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Handle successful username change
      alert('Username successfully changed.');
    } catch (error) {
      // Handle error
      console.error('Failed to change username', error);
    }
  };

  const handleChangePassword = async (newPassword) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('/api/user/change-password', { newPassword }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Handle successful password change
      alert('Password successfully changed.');
      handleLogout(); // Optionally log the user out
    } catch (error) {
      // Handle error
      console.error('Failed to change password', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Assuming token is stored in localStorage
    // setIsAuthenticated(false); // Update authentication state
    // Redirect user
    navigate('/login'); // Redirect to the /login page
  };

  const updateUserName = () => {
    handleChangeUsername(username);
  };

  const updatePassword = () => {
    if (password === repeatPassword) {
      handleChangePassword(password);
    } else {
      alert("Passwords don't match");
    }
  };

  return (
    <div className="clip">
      <div className="auth container">
        <h2>Welcome to Watch Party!</h2>
        <div className="alignedForm">
          <label htmlFor="username">Username: </label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <button onClick={()=>{handleChangeUsername(username)}}>update</button>
          <label htmlFor="password">Password: </label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          <button onClick={updatePassword}>update</button>
          <label htmlFor="repeatPassword">Repeat: </label>
          <input type="password" value={repeatPassword} onChange={(e) => setRepeatPassword(e.target.value)} placeholder="Repeat Password" />
          {/* Error handling for password match can be done here */}
          <button className="exit logout" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
