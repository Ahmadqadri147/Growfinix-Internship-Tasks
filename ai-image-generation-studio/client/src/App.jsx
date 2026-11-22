import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Github, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from './context/ThemeProvider';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import GeneratePage from './pages/Generate';
import GalleryPage from './pages/Gallery';
import AboutPage from './pages/About';
import toast, { Toaster } from 'react-hot-toast';

const App = () => {
  const { theme, toggleTheme, mounted } = useTheme();
  const [isNavbarScrolled, setIsNavbarScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeToggle = () => {
    toggleTheme();
    toast.success(
      theme === 'dark' ? 'Light mode enabled' : 'Dark mode enabled',
      {
        icon: theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
      }
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-dark' : 'bg-gray-100'}`}>
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>

        {/* Toast Container */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: theme === 'dark' ? 'rgba(30, 27, 75, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              color: theme === 'dark' ? '#ffffff' : '#1f2937',
              backdropFilter: 'blur(10px)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
            },
            success: {
              icon: <CheckCircle className="w-5 h-5 text-green-500" />,
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-red-500" />,
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;