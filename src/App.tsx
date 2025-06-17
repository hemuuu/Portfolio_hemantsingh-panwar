import React, { useState, useEffect, SetStateAction, Dispatch } from 'react';
import Portfolio from './components/Portfolio';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import AboutPage from './components/AboutPage';
import AboutAdminPanel from './components/AboutAdminPanel';
import Preloader from './components/Preloader';
import { Settings } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import AboutLoginModal from './components/AboutLoginModal';

interface ProjectData {
  id: string; // Change id to string for Firestore document ID
  name: string;
  description: string;
  link: string;
  thumbnail: string;
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
  status?: string; // Added status field
  category?: string; // Added category field
}

interface SocialLinks {
  instagram: string;
  linkedin: string;
  youtube: string;
  github: string;
  twitter: string;
}

// Protected Route Component
const ProtectedRoute = ({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// App Content Component that can use useNavigate
const AppContent = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAdminSession = localStorage.getItem('adminSession');
    const savedAdminSessionTime = localStorage.getItem('adminSessionTime');
    if (savedAdminSession === 'true' && savedAdminSessionTime) {
      const sessionTime = parseInt(savedAdminSessionTime, 10);
      const fifteenMinutes = 15 * 60 * 1000; // 15 minutes
      if (Date.now() - sessionTime < fifteenMinutes) {
        return true;
      }
    }
    return false;
  });
  const [showAboutLoginModal, setShowAboutLoginModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [worldSize, setWorldSize] = useState(4000);
  const [migrationNotification, setMigrationNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' | ''; } | null>(null);
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

  // State to hold About page content for initial migration
  const [initialAboutContent, setInitialAboutContent] = useState({
    aboutText: "ABOUT & SKILLS",
    descriptionText: "As a third-year Computer Engineering student, I am deeply passionate about the intersection of technology and creativity. My journey through competitive programming and various personal projects has equipped me with a strong foundation in problem-solving and software development. I thrive on challenges and am constantly exploring new technologies to build impactful and innovative solutions.",
    logEntries: [
      { id: 1, text: "Started competitive programming." },
      { id: 2, text: "Built first full-stack application." },
      { id: 3, text: "Contributed to open source project." },
      { id: 4, text: "Completed major machine learning project." },
      { id: 5, text: "Launched personal portfolio website." },
      { id: 6, text: "Began exploring blockchain technology." },
      { id: 7, text: "Attended AI/ML hackathon." },
      { id: 8, text: "Published a technical blog post." },
      { id: 9, text: "Mentored junior developers." },
      { id: 10, text: "Presented at a tech conference." },
    ],
    skills: [
      "React", "TypeScript", "Node.js", "Express.js", "MongoDB", "Firebase", "Python", "C++", "Java", "Tailwind CSS", "Material-UI", "Git", "RESTful APIs", "GraphQL", "Docker", "AWS (S3, EC2)", "Data Structures & Algorithms", "Competitive Programming"
    ],
    workExperience: [
      {
        id: 1,
        title: "Software Development Intern",
        company: "Innovatech Solutions",
        period: "May 2023 - Aug 2023",
        description: "Developed and maintained scalable web applications using React and Node.js. Implemented new features, optimized existing codebase, and participated in agile development cycles.",
      },
      {
        id: 2,
        title: "Teaching Assistant - Data Structures",
        company: "University of Tech",
        period: "Sep 2022 - Dec 2022",
        description: "Assisted professors in teaching data structures and algorithms to undergraduate students. Held weekly office hours and graded assignments.",
      },
    ],
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 425);
      setWorldSize(window.innerWidth <= 425 ? 1500 : 4000);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Simulate loading time for the preloader
    setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Firebase auth state changed:', user ? 'User logged in' : 'No user');
      
      // Check if we have a valid localStorage session
      const savedAdminSession = localStorage.getItem('adminSession');
      const savedAdminSessionTime = localStorage.getItem('adminSessionTime');
      const hasValidLocalSession = savedAdminSession === 'true' && savedAdminSessionTime && 
        (Date.now() - parseInt(savedAdminSessionTime, 10) < 15 * 60 * 1000);
      
      console.log('Local session check:', { savedAdminSession, hasValidLocalSession });
      
      // User is authenticated if either Firebase user exists OR we have a valid local session
      const isUserAuthenticated = Boolean(user || hasValidLocalSession);
      console.log('Setting authentication state to:', isUserAuthenticated);
      setIsAuthenticated(isUserAuthenticated);
    });

    fetchProjects(); // Initial fetch on component mount

    return () => unsubscribe();
  }, []);

  // Check for admin access key in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminKey = urlParams.get('admin');
    
    if (adminKey === 'hemuuuuu11@gmail.com_9623742747') {
      localStorage.setItem('adminSession', 'true');
      localStorage.setItem('adminSessionTime', Date.now().toString());
      setIsAuthenticated(true);
      
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Function to fetch projects from Firestore
  const fetchProjects = async () => {
    try {
      const projectsCollectionRef = collection(db, "projects");
      const projectSnapshot = await getDocs(projectsCollectionRef);
      const projectsList = projectSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectData[];
      console.log('Fetched projects from Firestore:', projectsList);
      projectsList.forEach(project => {
        console.log(`Project ID: ${project.id}, Thumbnail: ${(project.thumbnail || '').substring(0, 50)}...`);
      });
      setProjects(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Optionally, set an error notification here
    }
  };

  const handleLogin = () => {
    console.log('Login successful, setting authentication state...');
    setIsAuthenticated(true);
    setShowLogin(false);
    localStorage.setItem('adminSession', 'true');
    localStorage.setItem('adminSessionTime', Date.now().toString());
    console.log('Redirecting to admin panel...');
    // Use React Router navigation instead of window.location.href
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsAdminMode(false);
    setIsAuthenticated(false);
    localStorage.removeItem('adminSession');
    localStorage.removeItem('adminSessionTime');
    setShowAdminPanel(false);
    setShowAboutLoginModal(false);
    // Use React Router navigation instead of window.location.href
    navigate('/');
  };

  const handleProjectUpdate = async (updatedProject: ProjectData) => {
    try {
      const projectDocRef = doc(db, "projects", updatedProject.id);
      console.log('Updating project in Firestore with data:', updatedProject);
      await updateDoc(projectDocRef, {
        name: updatedProject.name,
        description: updatedProject.description,
        link: updatedProject.link,
        thumbnail: updatedProject.thumbnail,
        x: updatedProject.x,
        y: updatedProject.y,
        z: updatedProject.z,
        width: updatedProject.width,
        height: updatedProject.height,
        status: updatedProject.status,
        category: updatedProject.category,
      });
      console.log('Project updated successfully in Firestore');
      await fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleProjectAdd = async (newProject: Omit<ProjectData, 'id'>) => {
    try {
      const projectsCollectionRef = collection(db, "projects");
      const docRef = await addDoc(projectsCollectionRef, newProject);
      console.log('Project added successfully with ID:', docRef.id);
      await fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const handleProjectDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "projects", id));
      console.log('Project deleted successfully');
      await fetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleSocialLinksUpdate = (links: SocialLinks) => {
    setSocialLinks(links);
    localStorage.setItem('socialLinks', JSON.stringify(links));
  };

  const handleShowAbout = () => {
    setShowAbout(true);
    setShowPortfolio(false);
  };

  const handleCloseAbout = () => {
    setShowAbout(false);
    setShowPortfolio(true);
  };

  const handleAdminToggle = () => {
    if (isAuthenticated) {
      setShowAdminPanel(!showAdminPanel);
    } else {
      setShowLogin(true);
    }
  };

  const handleAboutAdminToggle = () => {
    if (isAuthenticated) {
      setShowAboutLoginModal(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowAboutLoginModal(false);
    setShowAbout(true);
    setShowPortfolio(false);
  };

  // Temporary function to migrate localStorage projects to Firestore
  const migrateLocalStorageProjects = async () => {
    setMigrationNotification({ message: 'Migrating localStorage projects to Firestore...', type: 'info' });
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      const projectsToMigrate = JSON.parse(storedProjects);
      if (projectsToMigrate && projectsToMigrate.length > 0) {
        const projectsCollectionRef = collection(db, "projects");
        try {
          for (const project of projectsToMigrate) {
            // Remove the old id and let Firestore generate a new one
            const { id, ...projectData } = project;
            await addDoc(projectsCollectionRef, projectData);
          }
          console.log("Projects migrated to Firestore successfully!");
          setMigrationNotification({ message: 'Projects migrated to Firestore successfully!', type: 'success' });
          setTimeout(() => setMigrationNotification(null), 3000);
          // Clear localStorage projects after successful migration
          localStorage.removeItem('projects');
          // Refresh projects state
          const projectSnapshot = await getDocs(projectsCollectionRef);
          const projectsList = projectSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as ProjectData[];
          setProjects(projectsList);
        } catch (error) {
          console.error("Error migrating projects to Firestore:", error);
          setMigrationNotification({ message: `Error migrating projects: ${(error as Error).message}`, type: 'error' });
          setTimeout(() => setMigrationNotification(null), 5000);
        }
      } else {
        console.log("No projects found in localStorage to migrate.");
        setMigrationNotification({ message: 'No local projects found to migrate.', type: 'info' });
        setTimeout(() => setMigrationNotification(null), 3000);
      }
    } else {
      setMigrationNotification({ message: 'No local projects found to migrate.', type: 'info' });
      setTimeout(() => setMigrationNotification(null), 3000);
    }
  };

  // Temporary function to migrate About page content to Firestore
  const migrateAboutContentToFirestore = async () => {
    setMigrationNotification({ message: 'Migrating About page content to Firestore...', type: 'info' });
    const aboutDocRef = doc(db, "content", "about");
    try {
      await setDoc(aboutDocRef, initialAboutContent, { merge: true });
      console.log("About page content migrated to Firestore!");
      setMigrationNotification({ message: 'About page content migrated to Firestore successfully!', type: 'success' });
      setTimeout(() => setMigrationNotification(null), 3000);
      // Optionally clear local state if you had it, but in this case, we're taking from initial state
    } catch (error) {
      console.error("Error migrating About page content to Firestore:", error);
      setMigrationNotification({ message: `Error migrating About page content: ${(error as Error).message}`, type: 'error' });
      setTimeout(() => setMigrationNotification(null), 5000);
    }
  };

  // Function to add dummy projects to Firestore
  const addDummyProjectsToFirestore = async () => {
    setMigrationNotification({ message: 'Adding 30 dummy projects to Firestore...', type: 'info' });
    const projectsCollectionRef = collection(db, "projects");
    try {
      for (let i = 1; i <= 30; i++) {
        const dummyProject = {
          name: `Dummy Project ${i}`,
          description: `This is a description for dummy project ${i}. It's a sample project to test the admin panel.`, 
          link: `https://example.com/project${i}`,
          thumbnail: `https://via.placeholder.com/280x380?text=Project${i}`,
          x: Math.random() * 4000 - 2000,
          y: Math.random() * 4000 - 2000,
          z: Math.random() * 1000,
          width: 280,
          height: 380,
          status: i % 2 === 0 ? 'Completed' : 'In Progress',
          category: i % 3 === 0 ? 'Web' : i % 3 === 1 ? 'Mobile' : 'Design',
        };
        await addDoc(projectsCollectionRef, dummyProject);
      }
      setMigrationNotification({ message: '30 dummy projects added successfully!', type: 'success' });
      setTimeout(() => setMigrationNotification(null), 3000);
      // Refresh projects state after adding dummy projects
      const projectSnapshot = await getDocs(projectsCollectionRef);
      const projectsList = projectSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProjectData[];
      setProjects(projectsList);
    } catch (error) {
      console.error("Error adding dummy projects:", error);
      setMigrationNotification({ message: `Error adding dummy projects: ${(error as Error).message}`, type: 'error' });
      setTimeout(() => setMigrationNotification(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {migrationNotification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg text-white font-semibold
          ${migrationNotification.type === 'success' ? 'bg-green-500' :
            migrationNotification.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'}
        `}>
          {migrationNotification.message}
        </div>
      )}
      {loading ? (
        <Preloader />
      ) : (
        <>
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    {showPortfolio && (
        <Portfolio 
          projects={projects} 
                        onAdminToggle={handleAdminToggle}
                        isAuthenticated={isAuthenticated}
                        onLogout={handleLogout}
                        onAboutToggle={handleAboutAdminToggle}
          onOffsetChange={setOffset}
          socialLinks={socialLinks}
          isMobile={isMobile}
          worldSize={worldSize}
                        onShowAbout={handleShowAbout}
                      />
                    )}
                    {showAbout && (
                      <AboutPage
                        onClose={handleCloseAbout}
                        isAuthenticated={isAuthenticated}
                        onLogout={handleLogout}
                      />
                    )}
                  </>
                }
              />
              <Route
                path="/login"
                element={
                  <LoginModal
                    onLogin={handleLogin}
                    onClose={() => navigate('/')}
                  />
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
        <AdminPanel 
          projects={projects} 
          onProjectUpdate={handleProjectUpdate}
          onProjectAdd={handleProjectAdd}
          onProjectDelete={handleProjectDelete}
                      onClose={() => navigate('/')}
          onLogout={handleLogout}
          socialLinks={socialLinks}
          onSocialLinksUpdate={handleSocialLinksUpdate}
        />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about-admin"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <AboutAdminPanel
                      initialAboutText="ABOUT"
                      initialDescriptionText="A creative developer crafting immersive digital experiences through code and design."
                      initialLogEntries={[
                        { id: 1, text: 'Led dev. of AI-powered portfolio platform' },
                        { id: 2, text: 'Developed real-time 3D viz. engine' },
                        { id: 3, text: 'Created interactive web experiences' },
                        { id: 4, text: 'Implemented adv. motion tracking' },
                        { id: 5, text: 'Optimized rendering pipeline' },
                        { id: 6, text: 'Developed custom shader library' },
                        { id: 7, text: 'Created responsive design system' },
                        { id: 8, text: 'Built real-time collaboration' },
                      ]}
                      initialSkills={[
                        'UI/UX',
                        'MOBILE & WEB DESIGN',
                        'BRANDING',
                        'GRAPHIC DESIGN',
                        'ART DIRECTION'
                      ]}
                      initialWorkExperience={[
                        {
                          id: 1,
                          title: 'Senior Web Developer',
                          company: 'Tech Solutions Inc.',
                          period: '2020 - 2023',
                          description: 'Developed and maintained high-traffic web applications, focusing on front-end performance and user experience. Collaborated with cross-functional teams.'
                        },
                        {
                          id: 2,
                          title: 'Front-End Lead',
                          company: 'Creative Agency',
                          period: '2018 - 2020',
                          description: 'Led a team of front-end developers in creating responsive and interactive websites for various clients. Implemented cutting-edge UI/UX designs.'
                        },
                        {
                          id: 3,
                          title: 'Junior Developer',
                          company: 'Startup Innovators',
                          period: '2016 - 2018',
                          description: 'Assisted in the development of web applications, contributed to code reviews, and learned best practices in software development. Gained foundational skills.'
                        }
                      ]}
                      onSave={async (aboutText, descriptionText, newLogEntries, newSkills, newWorkExperience) => {
                        try {
                          await setDoc(doc(db, 'content', 'about'), {
                            aboutText,
                            descriptionText,
                            logEntries: newLogEntries,
                            skills: newSkills,
                            workExperience: newWorkExperience,
                            updatedAt: new Date()
                          });
                          navigate('/');
                        } catch (error) {
                          console.error('Error saving about content:', error);
                        }
                      }}
                      onCancel={() => navigate('/')}
                      onLogout={handleLogout}
                    />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>

          {isAuthenticated && showAboutLoginModal && (
            <AboutLoginModal
              onLogin={handleLoginSuccess}
              onClose={() => setShowAboutLoginModal(false)}
            />
          )}

          {isAdminMode && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex space-x-2">
              <button
                onClick={migrateLocalStorageProjects}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm"
              >
                Migrate Local Projects to Firestore (One-time)
              </button>
              <button
                onClick={migrateAboutContentToFirestore}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Migrate About Content to Firestore (One-time)
              </button>
              <button
                onClick={addDummyProjectsToFirestore}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              >
                Add 30 Dummy Projects (One-time)
              </button>
            </div>
          )}

          {/* Position Display - Removed click trigger */}
          <div 
            className={`fixed bottom-8 right-3 font-mono text-[10px] px-2 py-1.5 border z-50 min-w-[50px] transition-all duration-300
                   md:bottom-16 md:right-5 md:text-xs md:px-3 md:py-2 md:min-w-30
                       flex flex-col items-start md:flex-row md:items-center md:justify-start md:gap-2 whitespace-nowrap
                       ${showAbout ? 'bg-white border-gray-300 text-gray-800' : 'bg-transparent border-gray-800 text-gray-600'}`}
      >
            <span>X: {Math.round(offset.x)}</span>
            <span>Y: {Math.round(offset.y)}</span>
            <span>Z: {Math.round(offset.z)}</span>
      </div>

      {/* Login Modal */}
      {showLogin && (
        <LoginModal 
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}
        </>
      )}
    </div>
  );
}

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;