import React, { useEffect } from 'react';
import CustomCursor from './components/effects/CustomCursor';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

// Prompt said "Scroll Animations ... Smooth easing".
// I'll stick to native smooth scroll (CSS) and whatever I implemented in components.
// If I want "Premium" scroll, Lenis is standard, but I didn't install it. I'll rely on CSS `scroll-behavior: smooth`.

const App = () => {
  return (
    <div className="antialiased text-white bg-background min-h-screen selection:bg-primary/30 selection:text-white">
      <Navbar />
      <Home />
      <Footer />
    </div>
  );
};

export default App;
