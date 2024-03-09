import './App.css';
// import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import ProtectedRoute from './Components/ProtectedRoute';

import SignIn  from './Components/SignIn';
import Profile  from './Components/Profile';
import ChannelsList from './Components/Channel';
import Welcome from './Components/Welcome';
import Menubar from './Components/Menubar';

// react router : https://reactrouter.com/en/main/routers/picking-a-router
// https://www.w3schools.com/react/react_router.asp

function App() {
  return (
    <BrowserRouter>
       <Menubar /> {/* This places the menu bar at the top */}
        <Routes>
            <Route path="/login" element={<SignIn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/channel/:channelId" element={<ChannelsList />} />
            <Route path="/" element={<Welcome />} />
        </Routes>
    </BrowserRouter>
  )
}

export default App;
