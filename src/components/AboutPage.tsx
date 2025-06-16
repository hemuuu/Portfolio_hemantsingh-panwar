import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Github, Linkedin, Youtube, Instagram, Twitter, Mail, Edit3 } from 'lucide-react'; // Import social icons and Edit3
import AboutAdminPanel from './AboutAdminPanel'; // Import the new admin panel component
import AboutLoginModal from './AboutLoginModal';
import bgResume from '../assets/bg_resume.png';

interface LogEntry {
  id: number;
  text: string;
}

interface WorkExperience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface AboutPageProps {
  onClose: () => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const initialAboutTextContent = 'ABOUT';
const initialDescriptionTextContent = 'A creative developer crafting immersive digital experiences through code and design.';
const initialLogEntriesContent: LogEntry[] = [
  { id: 1, text: 'Led dev. of AI-powered portfolio platform' },
  { id: 2, text: 'Developed real-time 3D viz. engine' },
  { id: 3, text: 'Created interactive web experiences' },
  { id: 4, text: 'Implemented adv. motion tracking' },
  { id: 5, text: 'Optimized rendering pipeline' },
  { id: 6, text: 'Developed custom shader library' },
  { id: 7, text: 'Created responsive design system' },
  { id: 8, text: 'Built real-time collaboration' },
  // Duplicate entries for continuous scroll
  { id: 9, text: 'Led dev. of AI-powered portfolio platform' },
  { id: 10, text: 'Developed real-time 3D viz. engine' },
  { id: 11, text: 'Created interactive web experiences' },
  { id: 12, text: 'Implemented adv. motion tracking' },
  { id: 13, text: 'Optimized rendering pipeline' },
  { id: 14, text: 'Developed custom shader library' },
  { id: 15, text: 'Created responsive design system' },
  { id: 16, text: 'Built real-time collaboration' },
];

const initialSkillsContent = [
  'UI/UX',
  'MOBILE & WEB DESIGN',
  'BRANDING',
  'GRAPHIC DESIGN',
  'ART DIRECTION'
];

const initialWorkExperienceContent: WorkExperience[] = [
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
];

const AboutPage: React.FC<AboutPageProps> = ({ onClose, isAuthenticated, onLogout }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const targetRef = useRef({ x: 0.5, y: 0.5 });
  const currentRef = useRef({ x: 0.5, y: 0.5 });
  const aberrationRef = useRef(0);
  const [showContent, setShowContent] = useState(false);
  const [nameText, setNameText] = useState('Hemantsingh Panwar');
  const nameIntervalRef = useRef<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [aboutPageMousePos, setAboutPageMousePos] = useState({ x: 0, y: 0 });
  const [aboutPageCursorTrail, setAboutPageCursorTrail] = useState<Array<{ x: number; y: number; time: number }>>([]);
  const [isMobileScreen, setIsMobileScreen] = useState(window.innerWidth < 768); // New state for mobile screen

  // States for top header interactivity
  const [isAboutHovered, setIsAboutHovered] = useState(false);
  const [isNameHovered, setIsNameHovered] = useState(false);
  const [aboutText, setAboutText] = useState('About');
  const aboutIntervalRef = useRef<number | null>(null);

  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [aboutSectionContent, setAboutSectionContent] = useState(initialAboutTextContent);
  const [descriptionContent, setDescriptionContent] = useState(initialDescriptionTextContent);
  const [logPanelEntries, setLogPanelEntries] = useState<LogEntry[]>(initialLogEntriesContent);
  const [skills, setSkills] = useState<string[]>(initialSkillsContent);
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(initialWorkExperienceContent);

  // ASCII animation characters
  const asciiChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

  const animateText = (text: string, setText: (text: string) => void, intervalRef: React.MutableRefObject<number | null>) => {
    let iterations = 0;
    const maxIterations = 20;
    const originalText = text;

    intervalRef.current = setInterval(() => {
      setText(
        originalText
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (iterations > index * 3) return originalText[index];
            return asciiChars[Math.floor(Math.random() * asciiChars.length)];
          })
          .join('')
      );

      iterations += 1;
      if (iterations >= maxIterations) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setText(originalText);
      }
    }, 50);
  };

  // Default social links for About page (can be passed as prop if dynamic)
  const socialLinks = {
    instagram: '#',
    linkedin: '#',
    youtube: '#',
    github: '#',
    twitter: '#'
  };

  const vertex = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragment = `
    varying vec2 vUv;
    uniform sampler2D u_texture;
    uniform vec2 u_mouse;
    uniform vec2 u_prevMouse;
    uniform float u_aberrationIntensity;

    void main() {
        vec2 gridUV = floor(vUv * vec2(20.0, 20.0)) / vec2(20.0, 20.0);
        vec2 center = gridUV + vec2(1.0/20.0, 1.0/20.0);
        vec2 moveDir = u_mouse - u_prevMouse;
        vec2 diff = center - u_mouse;
        float dist = length(diff);
        float str = smoothstep(0.3, 0.0, dist);
        vec2 offset = str * -moveDir * 0.2;
        vec2 uv = vUv - offset;

        vec4 r = texture2D(u_texture, uv + vec2(str * u_aberrationIntensity * 0.01, 0.0));
        vec4 g = texture2D(u_texture, uv);
        vec4 b = texture2D(u_texture, uv - vec2(str * u_aberrationIntensity * 0.01, 0.0));

        gl_FragColor = vec4(r.r, g.g, b.b, 1.0);
    }
  `;

  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const imageElement = new Image();
    imageElement.src = bgResume;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let mesh: THREE.Mesh;
    const ease = 0.02;

    function initScene(texture: THREE.Texture) {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(80, container.offsetWidth / container.offsetHeight, 0.01, 10);
      camera.position.z = 1;

      const uniforms = {
        u_texture: { value: texture },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_prevMouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_aberrationIntensity: { value: 0.0 },
      };

      const geometry = new THREE.PlaneGeometry(1.0, 519 / 426);
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms,
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(container.offsetWidth, container.offsetHeight);
      
      // Ensure only one canvas is present
      if (container.firstElementChild instanceof HTMLCanvasElement) {
        container.removeChild(container.firstElementChild);
      }
      container.appendChild(renderer.domElement);

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      meshRef.current = mesh;

      // Load background texture
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(bgResume, (texture) => {
        // These lines caused the issue, removing them.
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(2, 2);
        // scene.background = texture;
      });
    }

    function animate() {
      if (!meshRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      requestAnimationFrame(animate);
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;

      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.u_mouse.value.set(currentRef.current.x, 1.0 - currentRef.current.y);
      material.uniforms.u_prevMouse.value.set(targetRef.current.x, 1.0 - targetRef.current.y);

      aberrationRef.current = Math.max(0, aberrationRef.current - 0.05);
      material.uniforms.u_aberrationIntensity.value = aberrationRef.current;

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }

    function handleMove(e: MouseEvent) {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      targetRef.current.x = x;
      targetRef.current.y = y;
      aberrationRef.current = 1;
    }

    const loader = new THREE.TextureLoader();
    loader.load(imageElement.src, (texture: THREE.Texture) => {
      initScene(texture);
      animate();
    });

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseenter", handleMove);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseenter", handleMove);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        // Explicitly remove the canvas element from the DOM
        if (containerRef.current && rendererRef.current.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  useEffect(() => {
    // Fade in content after a short delay
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 200); // Adjust delay as needed
    return () => clearTimeout(timer);
  }, []);

  // New useEffect to track screen size for conditional animation
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });

      // Update About page specific cursor/trail
      setAboutPageMousePos({ x: clientX, y: clientY });
      const now = Date.now();
      setAboutPageCursorTrail(prev => {
        const newTrail = [...prev, { x: clientX, y: clientY, time: now }];
        return newTrail.filter(point => now - point.time < 300); // Keep trail for 300ms
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const parallaxIntensity = 20; // Adjust for stronger/ weaker effect
  const parallaxIntensityImage = 10; // Adjust for image-specific effect, making it seem closer/further
  const parallaxX = (mousePosition.x / window.innerWidth - 0.5) * parallaxIntensity;
  const parallaxY = (mousePosition.y / window.innerHeight - 0.5) * parallaxIntensity;
  const parallaxXImage = (mousePosition.x / window.innerWidth - 0.5) * parallaxIntensityImage;
  const parallaxYImage = (mousePosition.y / window.innerHeight - 0.5) * parallaxIntensityImage;

  const handleSaveContent = (
    aboutText: string,
    descriptionText: string,
    newLogEntries: LogEntry[],
    newSkills: string[],
    newWorkExperience: WorkExperience[]
  ) => {
    setAboutSectionContent(aboutText);
    setDescriptionContent(descriptionText);
    setLogPanelEntries(newLogEntries);
    setSkills(newSkills);
    setWorkExperience(newWorkExperience);
    setShowAdminPanel(false);
  };

  const handleCancelEdit = () => {
    setShowAdminPanel(false);
  };

  const handleEditClick = () => {
    if (isAuthenticated) {
      setShowAdminPanel(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogin = () => {
    setShowLoginModal(false);
    setShowAdminPanel(true);
  };

  const handleLogout = () => {
    setShowAdminPanel(false);
  };

  const handleMailMe = () => {
    window.location.href = 'mailto:hemuuuuu11@gmail.com';
  };

  return (
    <div 
      className="relative bg-[#111] text-[#eaeaea] font-mono flex flex-col items-center justify-center min-h-screen overflow-y-auto"
      style={{ cursor: 'none' }}
    >
      {showLoginModal && (
        <AboutLoginModal
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {showAdminPanel && (
        <div className="fixed inset-0 z-[70] bg-black bg-opacity-75 flex items-center justify-center p-2">
          <AboutAdminPanel
            initialAboutText={aboutSectionContent}
            initialDescriptionText={descriptionContent}
            initialLogEntries={logPanelEntries}
            initialSkills={skills}
            initialWorkExperience={workExperience}
            onSave={handleSaveContent}
            onCancel={handleCancelEdit}
            onLogout={onLogout}
          />
        </div>
      )}

      {/* Social Icons (Light Mode) */}
      <div className="fixed top-1 left-3 mt-2 md:top-3 md:left-5 flex gap-1 md:gap-3 z-[60] select-none">
        <a 
          href={socialLinks.youtube} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-5 h-5 md:w-6 md:h-6 bg-transparent border border-white flex items-center justify-center transition-all duration-300 hover:bg-white hover:border-white hover:border-solid"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="white">
            <path d="M10 15.5V8.5L16 12L10 15.5Z" fill="white"/>
          </svg>
        </a>
        <a 
          href={socialLinks.instagram} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-5 h-5 md:w-6 md:h-6 bg-transparent border border-white flex items-center justify-center transition-all duration-300 hover:bg-white hover:border-white hover:border-solid"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="white">
            <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6.5-1.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="white"/>
          </svg>
        </a>
        <a 
          href={socialLinks.linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-5 h-5 md:w-6 md:h-6 bg-transparent border border-white flex items-center justify-center transition-all duration-300 hover:bg-white hover:border-white hover:border-solid"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="white">
            <path d="M6.94 19V9.75H4.25V19h2.69ZM5.6 8.56c.86 0 1.39-.57 1.39-1.28-.02-.73-.53-1.28-1.37-1.28-.84 0-1.39.55-1.39 1.28 0 .71.53 1.28 1.36 1.28h.01ZM8.98 19h2.69v-5.13c0-.27.02-.54.1-.73.22-.54.72-1.1 1.56-1.1 1.1 0 1.54.83 1.54 2.05V19h2.69v-5.5c0-2.95-1.57-4.32-3.67-4.32-1.7 0-2.45.94-2.87 1.6h.02V9.75H8.98c.04.86 0 9.25 0 9.25Z" fill="white"/>
          </svg>
        </a>
      </div>

      {/* Header (Light Mode) */}
      <div
        className="fixed top-1 left-1/2 mt-2 transform -translate-x-1/2 flex items-center justify-center gap-4 z-[60] md:top-3 select-none"
      >
      <button
          onClick={() => {
            onClose(); // Call the prop to close the About page
          }}
          onMouseEnter={() => {
            setIsAboutHovered(true);
            animateText('About', setAboutText, aboutIntervalRef);
          }}
          onMouseLeave={() => {
            setIsAboutHovered(false);
            if (aboutIntervalRef.current) {
              clearInterval(aboutIntervalRef.current);
              aboutIntervalRef.current = null;
            }
            setAboutText('About');
          }}
          className="font-mono text-xs md:text-base cursor-pointer hover:underline text-white"
          style={{ filter: isAboutHovered ? 'grayscale(1) contrast(200%)' : 'none', transition: 'filter 0.1s ease-out' }}
        >
          {aboutText}
        </button>
        <button 
          className="font-mono text-xs md:text-base text-gray-400"
          onClick={() => window.location.reload()} // Reload page to go to homepage
          onMouseEnter={() => {
            setIsNameHovered(true);
            animateText('Hemantsingh Panwar', setNameText, nameIntervalRef);
          }}
          onMouseLeave={() => {
            setIsNameHovered(false);
            if (nameIntervalRef.current) {
              clearInterval(nameIntervalRef.current);
              nameIntervalRef.current = null;
            }
            setNameText('Hemantsingh Panwar');
          }}
          style={{ filter: isNameHovered ? 'grayscale(1) contrast(200%)' : 'none', transition: 'filter 0.1s ease-out' }}
        >
          {nameText}
      </button>
      </div>

      {/* Log Panel - Re-enabled admin trigger */}
      <div className="fixed top-4 right-4 w-[80px] h-[65px] md:w-[180px] md:h-[120px] bg-black/80 border border-gray-700 p-0.5 font-mono z-50 select-none overflow-hidden flex flex-col cursor-pointer hover:bg-black/90 transition-colors"
           onClick={() => {
             if (isAuthenticated) {
               setShowAdminPanel(true);
             } else {
               setShowLoginModal(true);
             }
           }}>
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[6px] text-white">UPDATES</span>
          <span className="text-[6px] text-gray-500">[ACTIVE]</span>
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div className={`space-y-0.5 text-[6px] leading-tight ${!isMobileScreen ? 'animate-scroll' : ''}`}>
            {logPanelEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-0.5">
                <span className="text-gray-500">[202X]</span>
                <span>{entry.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-0.5 pt-0.5 border-t border-gray-700 flex justify-between text-[6px] text-gray-500">
          <span>LOG_ENTRIES: {logPanelEntries.length}</span>
          <span>STATUS: VERIFIED</span>
        </div>
      </div>

      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div 
        className="max-w-[1000px] w-full flex flex-col md:flex-row justify-center md:justify-between items-center p-10 gap-10"
      >
        <div 
          className={`flex-1 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'} flex flex-col items-center md:items-start justify-center text-center md:text-left mt-10 md:mt-0`}
          style={{ transform: `translate(${parallaxX}px, ${parallaxY}px)` }}
        >
          <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
            <span className="text-[8px] md:text-[10px] text-gray-600 font-mono">{aboutSectionContent}</span>
            <svg 
              className="w-3 h-3 text-gray-600 rotate-180 md:rotate-0" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          <h1 
            className="text-xl md:text-3xl text-white font-mono mb-2 text-center md:text-left"
            onMouseEnter={() => {
              animateText('Hemantsingh Panwar', setNameText, nameIntervalRef);
            }}
            onMouseLeave={() => {
              if (nameIntervalRef.current) {
                clearInterval(nameIntervalRef.current);
                nameIntervalRef.current = null;
              }
              setNameText('Hemantsingh Panwar');
            }}
          >
            {nameText}
          </h1>
          <p className="text-xs text-gray-400 mb-10 text-center md:text-left">{descriptionContent}</p>

          <div 
            className="flex flex-col items-center md:items-start font-mono text-gray-600 select-none text-center md:text-left"
          >
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="text-[10px] text-gray-600">Skills</span>
              <svg 
                className="w-3 h-3 text-gray-600"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start text-xs">
              {skills.map((skill, index) => (
                <React.Fragment key={index}>
                  <span className="mr-4 text-white">{skill}</span>
                  {index < skills.length - 1 && (
                    <span className="w-16 border-t border-gray-400 mx-4"></span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="flex-1 w-full h-[300px] md:w-[426px] md:h-[519px] relative flex justify-center items-center"
          style={{ transform: `translate(${parallaxXImage}px, ${parallaxYImage}px)` }}
        />
        
        <div 
          className={`flex-1 transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'} flex flex-col items-center md:items-end text-center md:text-right mx-auto`}
          style={{ transform: `translate(${-parallaxX}px, ${-parallaxY}px)` }}
        >
          {/* Work Experience Section */}
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-end">
            <span className="text-[10px] text-gray-600 font-mono">WORK EXPERIENCE</span>
            <svg 
              className="w-3 h-3 text-gray-600 rotate-0 md:rotate-180" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            {workExperience.map((exp) => (
              <div key={exp.id}>
                <h3 className="text-white text-sm font-bold text-center md:text-right">{exp.title}</h3>
                <p className="text-gray-400 text-xs text-center md:text-right">{exp.company} ({exp.period})</p>
                <p className="text-gray-500 text-[10px] leading-tight mt-1 text-center md:text-right">
                  {exp.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Cursor for About Page */}
      <div
        className="fixed z-50 pointer-events-none flex items-center gap-1.5 text-xs font-bold select-none"
        style={{
          left: `${aboutPageMousePos.x}px`,
          top: `${aboutPageMousePos.y}px`,
          transform: 'translate(-50%, -50%)',
          display: aboutPageMousePos.x === 0 && aboutPageMousePos.y === 0 ? 'none' : 'flex',
          color: 'white',
          mixBlendMode: 'normal'
        }}
      >
        <div className="text-xl">+</div>
      </div>

      {/* Cursor Trail for About Page */}
      {aboutPageCursorTrail.map((point, index) => {
        if (index === 0) return null;
        const prevPoint = aboutPageCursorTrail[index - 1];
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        return (
          <div
            key={`${point.x}-${point.y}-${point.time}`}
            className="absolute w-px bg-white z-5"
            style={{
              width: `${length}px`,
              height: '1px',
              left: `${prevPoint.x}px`,
              top: `${prevPoint.y}px`,
              transform: `rotate(${angle}deg)`,
              transformOrigin: 'top left'
            }}
          />
        );
      })}

      {/* Mail Me Button */}
      <button
        onClick={handleMailMe}
        className="fixed bottom-8 left-3 font-mono text-[10px] px-2 py-1.5 border border-white text-white z-50 min-w-[50px] cursor-pointer hover:bg-white/10 transition-all duration-300
                   md:bottom-16 md:left-5 md:text-xs md:px-3 md:py-2 md:min-w-30
                   flex flex-col items-start md:flex-row md:items-center md:justify-start md:gap-2 whitespace-nowrap"
      >
        <Mail size={12} className="md:w-4 md:h-4" />
        <span>MAIL ME</span>
      </button>
    </div>
  );
};

export default AboutPage; 