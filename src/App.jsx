import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import CustomCursor from './components/effects/CustomCursor';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import AllProjects from './pages/AllProjects';
import Marketplace from './pages/Marketplace';
import TemplateDetail from './pages/TemplateDetail';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Orders from './pages/Orders';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="antialiased text-white bg-background min-h-screen selection:bg-primary/30 selection:text-white">
          <CustomCursor />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/all-projects" element={<AllProjects />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/:id" element={<TemplateDetail />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
