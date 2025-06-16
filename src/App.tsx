import React, { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import AboutPage from './components/AboutPage';
import Preloader from './components/Preloader';
import { Settings } from 'lucide-react';

interface ProjectData {
  id: number;
  name: string;
  description: string;
  link: string;
  thumbnail: string;
  x: number;
  y: number;
  z: number;
  width?: number; // Optional width for individual project
  height?: number; // Optional height for individual project
}

interface SocialLinks {
  instagram: string;
  linkedin: string;
  youtube: string;
  github: string;
  twitter: string;
}

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if we have a valid admin session
    const adminSession = localStorage.getItem('adminSession');
    const sessionTime = localStorage.getItem('adminSessionTime');
    if (adminSession && sessionTime) {
      // Check if session is less than 24 hours old
      const isValid = Date.now() - parseInt(sessionTime) < 24 * 60 * 60 * 1000;
      if (isValid) {
        return true;
      } else {
        // Clear expired session
        localStorage.removeItem('adminSession');
        localStorage.removeItem('adminSessionTime');
      }
    }
    return false;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [worldSize, setWorldSize] = useState(4000); // Default to desktop size
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
    const savedLinks = localStorage.getItem('socialLinks');
    return savedLinks ? JSON.parse(savedLinks) : {
      instagram: '#',
      linkedin: '#',
      youtube: '#',
      github: '#',
      twitter: '#'
    };
  });
  const [preloaderConfig, setPreloaderConfig] = useState({
    show: false,
    theme: 'light' as 'light' | 'dark',
    message: 'Loading...'
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425);
      setWorldSize(window.innerWidth <= 425 ? 1500 : 4000); // Increased worldSize for mobile to allow more panning
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Load projects from localStorage on component mount
    const savedProjects = localStorage.getItem('portfolioProjects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Check for admin access key in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminKey = urlParams.get('admin');
    
    if (adminKey === 'hemuuuuu11@gmail.com_9623742747') {
      // Set admin session
      localStorage.setItem('adminSession', 'true');
      localStorage.setItem('adminSessionTime', Date.now().toString());
      setIsAuthenticated(true);
      
      // Remove the key from URL without refreshing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    // Set admin session
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('adminSessionTime', Date.now().toString());
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setIsAuthenticated(false);
    // Clear admin session
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionTime');
  };

  const handleProjectUpdate = (updatedProject: ProjectData) => {
    const updatedProjects = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedProjects);
    localStorage.setItem('portfolioProjects', JSON.stringify(updatedProjects));
  };

  const handleProjectAdd = (newProjectData: Omit<ProjectData, 'id'>) => {
    const newId = Math.max(...projects.map(p => p.id), 0) + 1;
    const newProject: ProjectData = {
      ...newProjectData,
      id: newId
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem('portfolioProjects', JSON.stringify(updatedProjects));
  };

  const handleProjectDelete = (id: number) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('portfolioProjects', JSON.stringify(updatedProjects));
  };

  const handleSocialLinksUpdate = (newLinks: SocialLinks) => {
    setSocialLinks(newLinks);
    localStorage.setItem('socialLinks', JSON.stringify(newLinks));
  };

  const handleSettingsClick = () => {
    if (isAuthenticated) {
      setIsAdminMode(!isAdminMode);
    } else {
      setShowLogin(true);
    }
  };

  const handleShowAbout = () => {
    setPreloaderConfig({ show: true, theme: 'dark', message: 'Loading About...' });
    setTimeout(() => {
      setShowAbout(true);
      setPreloaderConfig(prev => ({ ...prev, show: false }));
    }, 500); // Simulate loading for 500ms
  };

  const handleCloseAbout = () => {
    // No preloader for closing About page, directly return to portfolio
    setShowAbout(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {preloaderConfig.show ? (
        <Preloader theme={preloaderConfig.theme} message={preloaderConfig.message} />
      ) : showAbout ? (
        <AboutPage
          onClose={handleCloseAbout}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      ) : !isAdminMode ? (
        <Portfolio 
          projects={projects} 
          onOffsetChange={setOffset}
          socialLinks={socialLinks}
          isMobile={isMobile}
          worldSize={worldSize}
          onShowAbout={handleShowAbout}
          isAuthenticated={isAuthenticated}
        />
      ) : (
        <AdminPanel 
          projects={projects} 
          onProjectUpdate={handleProjectUpdate}
          onProjectAdd={handleProjectAdd}
          onProjectDelete={handleProjectDelete}
          onLogout={handleLogout}
          socialLinks={socialLinks}
          onSocialLinksUpdate={handleSocialLinksUpdate}
        />
      )}

      {/* Position Display with Admin Toggle */}
      <div 
        onClick={() => {
          if (isAuthenticated) {
            setIsAdminMode(!isAdminMode);
          } else {
            setShowLogin(true);
          }
        }}
        className={`fixed bottom-8 right-3 font-mono text-[10px] px-2 py-1.5 border z-50 min-w-[50px] cursor-pointer hover:bg-gray-50 transition-all duration-300
                   md:bottom-16 md:right-5 md:text-xs md:px-3 md:py-2 md:min-w-30
                   flex flex-col items-start md:flex-row md:items-center md:justify-start md:gap-2 whitespace-nowrap
                   ${showAbout ? 'bg-white border-gray-300 text-gray-800' : 'bg-transparent border-gray-800 text-gray-600'}`}
      >
        {isAdminMode ? 'Exit Admin' : (
          <>
            <span>X: {Math.round(offset.x)}</span>
            <span>Y: {Math.round(offset.y)}</span>
            <span>Z: {Math.round(offset.z)}</span>
          </>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}

export default App;