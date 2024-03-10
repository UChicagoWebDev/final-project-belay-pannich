import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./Menubar.css";

export default function Menubar() {
  const userName = localStorage.getItem('userName')

  return (
    <nav className="navbar">
      <div className="userDisplay">{userName}</div>
      <ul>
        <li><Link to="/" className="nav-link">Home</Link></li>
        <li><Link to="/login" className="nav-link">Login</Link></li>
        <li><Link to="/profile" className="nav-link">Profile</Link></li>
        <li><Link to="/channel" className="nav-link">Channels</Link></li> {/* Example channel ID */}
      </ul>
    </nav>
  );
}
