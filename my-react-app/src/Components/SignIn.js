import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ---- UseState vs. Static
// https://legacy.reactjs.org/docs/hooks-state.html#:~:text=Normally%2C%20variables%20%E2%80%9Cdisappear%E2%80%9D%20when,have%20to%20be%20an%20object.
// React UseState : React remember the current state between each re-render.
  // Any change to the variable's state will trigger a re-render of the component, allowing you to react dynamically to changes.
// Static Value : you only need to check the token once when the component loads.
// --------------------------

function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // const [ isAuthenticated, setIsAuthenticated ] = useState(false);
    const USERTOKEN = localStorage.getItem('nichada_belay_auth_key');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ref : Property Value Shorthand EC6
              // { username, password } same as { "username": username, "password": password }
              // https://medium.com/@musturi.rakesh/best-es6-features-in-javascript-69a0b16425ce
            const response = await axios.post('/api/login', { username, password });

                                                            // Update the global auth state to true
            localStorage.setItem('nichada_belay_auth_key', response.data.token);        // TODO: get toekn. save the session-token for later use
            localStorage.setItem('userId', response.data.id);
            localStorage.setItem('userName', response.data.username);
            localStorage.setItem('isAuthenticated', 'true');

            alert('Login successful');

            navigate('/');              // Redirect to the / page

        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'An error occurred. Please try again.';
            console.error('Login failed:', errorMessage);
            alert(errorMessage);
        }
    };

    const handleUserNameUI = () => {
      var user_name = '';
      user_name = localStorage.getItem('user_name');
      const allUserNameUI = document.querySelectorAll('.username');
      allUserNameUI.forEach(element => {
        element.textContent = user_name;
      });
    };

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
          </div>
          <div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          </div>
          <div>
            <button type="submit">Sign In</button>
          </div>
        </form>
      </div>
    );
}

export default SignIn;
