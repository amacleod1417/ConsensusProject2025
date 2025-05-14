import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import App from './App'; // this should contain your post-login RoleRouter
import Login from './Login';
import Signup from './Signup';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<App />} /> {/* App = RoleRouter */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);