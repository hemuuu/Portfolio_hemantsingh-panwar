import React, { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425);
      setWorldSize(window.innerWidth <= 425 ? 1500 : 4000); // Increased worldSize for mobile to allow more panning
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize projects data
  useEffect(() => {
    const savedProjects = localStorage.getItem('portfolioProjects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    } else {
      // Generate initial placeholder projects only if no saved projects exist
      const initialProjects: ProjectData[] = [];
      for (let i = 0; i < 50; i++) {
        initialProjects.push({
          id: i + 1,
          name: `Project ${i + 1}`,
          description: `Description for project ${i + 1}`,
          link: '#',
          thumbnail: `https://picsum.photos/1080/1500?random=${i}`,
          x: Math.random() * worldSize - worldSize / 2, // Use dynamic worldSize for initial X generation
          y: Math.random() * worldSize - worldSize / 2, // Use dynamic worldSize for initial Y generation
          z: Math.random() * (isMobile ? 700 : 1000), // Reduce initial z-range for mobile devices
          width: 280, // Default width for new projects
          height: 380 // Default height for new projects
        });
      }
      setProjects(initialProjects);
      localStorage.setItem('portfolioProjects', JSON.stringify(initialProjects));
    }
  }, []); // Remove worldSize and isMobile dependencies

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setIsAdminMode(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdminMode(false);
  };

  const handleProjectUpdate = (updatedProject: ProjectData) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
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

  return (
    <div className="min-h-screen bg-gray-100">
      {!isAdminMode ? (
        <Portfolio 
          projects={projects} 
          onOffsetChange={setOffset}
          socialLinks={socialLinks}
          isMobile={isMobile}
          worldSize={worldSize}
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
        className="fixed bottom-8 right-3 font-mono text-[10px] px-2 py-1.5 border border-gray-300 z-50 min-w-[50px] cursor-pointer hover:bg-gray-50 transition-all duration-300
                   md:bottom-16 md:right-5 md:text-xs md:px-3 md:py-2 md:min-w-30
                   flex flex-col items-start md:flex-row md:items-center md:justify-start md:gap-2 whitespace-nowrap"
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