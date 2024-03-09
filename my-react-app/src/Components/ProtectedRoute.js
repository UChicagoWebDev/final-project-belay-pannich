// // ProtectedRoute.js
// // This component will check if the user is authenticated. If not, it redirects them to the login page.
// import { useAuth } from '../contexts/AuthContext';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated } = useAuth();

//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;
