import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const USERTOKEN = localStorage.getItem('nichada_belay_auth_key')
  // If not authenticated, redirect to the login page
  if (!USERTOKEN) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child components
  return <Outlet />;
};
