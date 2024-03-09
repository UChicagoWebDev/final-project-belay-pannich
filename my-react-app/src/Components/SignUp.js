import { useState } from 'react';
import axios from 'axios';

const USERTOKEN = localStorage.getItem('nichada_belay_auth_key');
const USER_ID = localStorage.getItem('userId');

function SignUp() {

  console.log(USER_ID);
  
  const handleSubmit = async (e) => {
      console.log(username);
      e.preventDefault();
      try {
          await axios.post('/api/signup', { username, password });
          alert('User created successfully');
      } catch (error) {
          alert(error.response.data.message);
      }
  };

  return (
      <form onSubmit={handleSubmit}>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <button type="submit">Sign Up</button>
      </form>
  );
}

export default SignUp;
