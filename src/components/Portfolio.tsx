import React, { useState, useEffect, useRef } from 'react';
import Preloader from './Preloader';
import { Github, Linkedin, Youtube, Instagram, Twitter } from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  description: string;
  link: string;
  thumbnail: string;
  x: number;
  y: number;
  z: number;
  width?: number;
  height?: number;
}

interface SocialLinks {
  instagram: string;
  linkedin: string;
  youtube: string;
  github: string;
  twitter: string;
}

interface PortfolioProps {
  projects: ProjectData[];
  onOffsetChange: (offset: { x: number; y: number; z: number }) => void;
  socialLinks: SocialLinks;
  isMobile: boolean;
  worldSize: number;
  onShowAbout: () => void;
  isAuthenticated: boolean;
  onAdminToggle: () => void;
  onLogout: () => void;
  onAboutToggle: () => void;
}

const Portfolio: React.FC<PortfolioProps> = ({
  projects: initialProjects,
  onOffsetChange,
  socialLinks = {
  instagram: '#',
  linkedin: '#',
  youtube: '#',
  github: '#',
    twitter: '#',
  },
  isMobile,
  worldSize,
  onShowAbout,
  isAuthenticated,
  onAdminToggle,
  onLogout,
  onAboutToggle,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingMinimap, setIsDraggingMinimap] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0, z: 0 });
  const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0, z: 0 });
  const [blurFlash, setBlurFlash] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isPanningDisabled, setIsPanningDisabled] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<ProjectData | null>(null);
  const [cursorTrail, setCursorTrail] = useState<Array<{ x: number; y: number; time: number }>>([]);
  const [projects, setProjects] = useState<ProjectData[]>(initialProjects);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const lastTouchPosRef = useRef({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [initialOffsetOnDragStart, setInitialOffsetOnDragStart] = useState({ x: 0, y: 0, z: 0 });
  const targetOffsetRef = useRef(targetOffset);
  const offsetRef = useRef(offset);
  const lastTimeRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isEdgePanning, setIsEdgePanning] = useState(false);
  const edgePanSpeed = 25;
  const edgePanThreshold = 100;

  const canvasRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerRect, setHeaderRect] = useState<DOMRect | null>(null);
  const [isHeaderOverlapping, setIsHeaderOverlapping] = useState(false);
  const [isAboutHovered, setIsAboutHovered] = useState(false);
  const [isNameHovered, setIsNameHovered] = useState(false);
  const [aboutText, setAboutText] = useState('About');
  const [nameText, setNameText] = useState('Hemantsingh Panwar');
  const aboutIntervalRef = useRef<number | NodeJS.Timeout | null>(null);
  const nameIntervalRef = useRef<number | NodeJS.Timeout | null>(null);
  const [headerTextColor, setHeaderTextColor] = useState<'dark' | 'light'>('dark');

  const mapWidth = 180;
  const mapHeight = 120;

  const dragTimeoutRef = useRef<number | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Initialize offset based on mobile state
  useEffect(() => {
    setOffset({ x: 0, y: 0, z: isMobile ? 3000 : 0 }); // Set Z offset to 3000 for mobile
    setTargetOffset({ x: 0, y: 0, z: isMobile ? 3000 : 0 }); // Apply to target as well
  }, [isMobile]);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // ... (existing resize logic for isMobile and worldSize in App.tsx)
    };

    // Removed: updateMinimapScale and its event listener from Portfolio.tsx

    const updateMinimapContentScale = () => {
      if (minimapRef.current) {
        const currentMapWidth = minimapRef.current.clientWidth;
        const currentMapHeight = minimapRef.current.clientHeight;

        // No need for separate state, use directly in JSX for project dot positioning
      }
    };

    window.addEventListener('resize', updateMinimapContentScale);
    updateMinimapContentScale(); // Initial call

    return () => {
      window.removeEventListener('resize', updateMinimapContentScale);
    };
  }, [worldSize]); // Depend on worldSize as it affects minimap content scaling

  useEffect(() => {
    const updateHeaderRect = () => {
      if (headerRef.current) {
        setHeaderRect(headerRef.current.getBoundingClientRect());
      }
    };

    updateHeaderRect(); // Initial call
    window.addEventListener('resize', updateHeaderRect);
    return () => window.removeEventListener('resize', updateHeaderRect);
  }, []);

  useEffect(() => {
    // Check for overlap between header and projects
    let overlapping = false;
    if (headerRect) {
      for (const project of projects) {
        const z = project.z + offset.z;
        const depthScaleReference = isMobile ? 20000 : 3000;
        const scaleZ = 1 - z / depthScaleReference;
        
        // Ensure scaleZ is always positive to avoid inverted rendering causing incorrect overlap checks
        if (scaleZ <= 0) continue; 

        const px = (project.x + offset.x) * scaleZ + window.innerWidth / 2;
        const py = (project.y + offset.y) * scaleZ + window.innerHeight / 2;

        const baseWidth = isMobile ? 40 : 280;
        const baseHeight = isMobile ? 60 : 380;

        let currentProjectWidth = project.width || baseWidth;
        let currentProjectHeight = project.height || baseHeight;

        if (isMobile && project.width && project.height) {
          const scaleFactor = 40 / 280; // Mobile base width / Desktop base width
          currentProjectWidth = project.width * scaleFactor;
          currentProjectHeight = project.height * scaleFactor;
        }

        const projectRect = {
          left: px,
          top: py,
          right: px + currentProjectWidth * scaleZ,
          bottom: py + currentProjectHeight * scaleZ
        };

        const overlapX = Math.max(0, Math.min(projectRect.right, headerRect.right) - Math.max(projectRect.left, headerRect.left));
        const overlapY = Math.max(0, Math.min(projectRect.bottom, headerRect.bottom) - Math.max(projectRect.top, headerRect.top));
        
        if (overlapX > 0 && overlapY > 0) {
          overlapping = true;
          break;
        }
      }
    }
    setIsHeaderOverlapping(overlapping);
  }, [headerRect, projects, offset, isMobile]);

  // Add smooth movement interpolation
  useEffect(() => {
    const interpolate = () => {
      const currentTime = performance.now();
      const deltaTime = Math.min(currentTime - lastTimeRef.current, 32) / 16.67; // Cap at ~60fps
      lastTimeRef.current = currentTime;

      // Smooth interpolation between current and target offset
      setOffset(prev => {
        const newX = prev.x + (targetOffset.x - prev.x) * 0.15 * deltaTime;
        const newY = prev.y + (targetOffset.y - prev.y) * 0.15 * deltaTime;
        const newZ = prev.z + (targetOffset.z - prev.z) * 0.15 * deltaTime;

        // Apply velocity-based movement when not dragging
        if (!isDragging && !isDraggingMinimap) {
          velocity.x *= 0.95;
          velocity.y *= 0.95;
          
          if (Math.abs(velocity.x) > 0.01 || Math.abs(velocity.y) > 0.01) {
            return {
              x: newX + velocity.x,
              y: newY + velocity.y,
              z: newZ
            };
          }
        }

        return { x: newX, y: newY, z: newZ };
      });

      animationFrameRef.current = requestAnimationFrame(interpolate);
    };

    animationFrameRef.current = requestAnimationFrame(interpolate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetOffset, isDragging, isDraggingMinimap, velocity]);

  useEffect(() => {
    targetOffsetRef.current = targetOffset;
  }, [targetOffset]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const handleEdgePanning = (e: MouseEvent) => {
    if (isPanningDisabled) return;

    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    
    let currentTargetOffset = targetOffsetRef.current;
    let currentOffset = offsetRef.current;

    let newTargetOffset = { ...currentTargetOffset };
    let isPanning = false;

    // Calculate distance from edges
    const distFromLeft = clientX;
    const distFromRight = innerWidth - clientX;
    const distFromTop = clientY;
    const distFromBottom = innerHeight - clientY;

    // Calculate intensity based on distance from edge (closer = stronger)
    const getIntensity = (distance: number) => {
      if (distance >= edgePanThreshold) return 0;
      // Increase the intensity for smoother movement
      return edgePanSpeed * Math.pow(1 - distance / edgePanThreshold, 2);
    };

    // Apply panning with intensity
    if (distFromLeft < edgePanThreshold) {
      newTargetOffset.x += getIntensity(distFromLeft);
      isPanning = true;
    }
    if (distFromRight < edgePanThreshold) {
      newTargetOffset.x -= getIntensity(distFromRight);
      isPanning = true;
    }
    if (distFromTop < edgePanThreshold) {
      newTargetOffset.y += getIntensity(distFromTop);
      isPanning = true;
    }
    if (distFromBottom < edgePanThreshold) {
      newTargetOffset.y -= getIntensity(distFromBottom);
      isPanning = true;
    }

    // Apply the new offset immediately for smoother movement
    if (isPanning) {
      setTargetOffset(newTargetOffset);
      // Update velocity for momentum
      setVelocity({
        x: (newTargetOffset.x - currentOffset.x) * 0.1,
        y: (newTargetOffset.y - currentOffset.y) * 0.1
      });
    }

    if (isPanning !== isEdgePanning) {
      setIsEdgePanning(isPanning);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanningDisabled) return;

      setMousePos({ x: e.clientX, y: e.clientY });
      handleEdgePanning(e);

      if (isDragging && !isDraggingMinimap) {
        const deltaX = e.clientX - lastPosRef.current.x;
        const deltaY = e.clientY - lastPosRef.current.y;
        
        // Calculate velocity
        const currentTime = performance.now();
        const timeDelta = currentTime - lastTimeRef.current;
        if (timeDelta > 0) {
          const newVelocityX = (deltaX * 2) / timeDelta;
          const newVelocityY = (deltaY * 2) / timeDelta;
          setVelocity({ x: newVelocityX, y: newVelocityY });
        }
        
        setTargetOffset(prev => ({
          ...prev,
          x: prev.x + deltaX * 2,
          y: prev.y + deltaY * 2
        }));
        
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        lastTimeRef.current = performance.now();
      }

      if (isDraggingMinimap && minimapRef.current) {
        const rect = minimapRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        // Use dynamically calculated mapScaleX/Y from updateMinimapScale
        const currentMapWidth = minimapRef.current.clientWidth;
        const currentMapHeight = minimapRef.current.clientHeight;
        const dynamicMapScaleX = currentMapWidth / worldSize;
        const dynamicMapScaleY = currentMapHeight / worldSize;

        setTargetOffset(prev => ({
          ...prev,
          x: Math.max(-worldSize / 2, Math.min(worldSize / 2, (mx / dynamicMapScaleX) - (window.innerWidth / 2))),
          y: Math.max(-worldSize / 2, Math.min(worldSize / 2, (my / dynamicMapScaleY) - (window.innerHeight / 2)))
        }));
      }

      // Update cursor trail
      const now = Date.now();
      setCursorTrail(prev => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, time: now }];
        return newTrail.filter(point => now - point.time < 300);
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
        lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
        setIsDragging(true);
        setInitialOffsetOnDragStart(offset);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastTouchPosRef.current.x;
        const deltaY = touch.clientY - lastTouchPosRef.current.y;
        
        // Calculate velocity
        const currentTime = performance.now();
        const timeDelta = currentTime - lastTimeRef.current;
        if (timeDelta > 0) {
          const newVelocityX = (deltaX * 2) / timeDelta;
          const newVelocityY = (deltaY * 2) / timeDelta;
          setVelocity({ x: newVelocityX, y: newVelocityY });
        }
        
        setTargetOffset(prev => ({
          ...prev,
          x: prev.x + deltaX * 2,
          y: prev.y + deltaY * 2
        }));
        
        lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
        lastTimeRef.current = performance.now();
        e.preventDefault();
      }

      if (e.touches.length === 1 && isDraggingMinimap && minimapRef.current) {
        const touch = e.touches[0];
        const rect = minimapRef.current.getBoundingClientRect();
        const mx = touch.clientX - rect.left;
        const my = touch.clientY - rect.top;

        const currentMapWidth = minimapRef.current.clientWidth;
        const currentMapHeight = minimapRef.current.clientHeight;
        const dynamicMapScaleX = currentMapWidth / worldSize;
        const dynamicMapScaleY = currentMapHeight / worldSize;

        setTargetOffset(prev => ({
          ...prev,
          x: Math.max(-worldSize / 2, Math.min(worldSize / 2, (mx / dynamicMapScaleX) - (window.innerWidth / 2))),
          y: Math.max(-worldSize / 2, Math.min(worldSize / 2, (my / dynamicMapScaleY) - (window.innerHeight / 2)))
        }));
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Check if left mouse button is pressed (button 0)
      if (e.button === 0) {
        setIsDragging(true);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        setInitialOffsetOnDragStart(offset);
      }
      // Check if middle mouse button is pressed (button 1)
      else if (e.button === 1 || e.buttons === 4) {
        setIsDragging(true);
        startPosRef.current = { x: e.clientX, y: e.clientY };
        lastPosRef.current = { x: e.clientX, y: e.clientY };
        setInitialOffsetOnDragStart(offset);
        e.preventDefault(); // Prevent default middle-click behavior
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsDraggingMinimap(false);
    };

    const handleWheel = (e: WheelEvent) => {
      setTargetOffset(prev => ({
        ...prev,
        z: prev.z + e.deltaY * 0.4
      }));
      setBlurFlash(1);
    };

    // Add event listeners
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', handleWheel);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, isDraggingMinimap, isPanningDisabled, offset]);

  useEffect(() => {
    // Auto-update blur flash
    const interval = setInterval(() => {
      setBlurFlash(prev => prev * 0.9);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update projects when initialProjects changes
    setProjects(initialProjects);
  }, [initialProjects]);

  // Update parent component when offset changes
  useEffect(() => {
    onOffsetChange?.(offset);
  }, [offset, onOffsetChange]);

  const handleShuffle = () => {
    // Determine the effective world size for x and y spread for mobile
    const effectiveWorldSizeForMobile = isMobile ? worldSize * 1.5 : worldSize; // Use a smaller virtual world for mobile x/y spread

    // Randomize project positions with more spread
    const updatedProjects = projects.map(project => ({
      ...project,
      x: (Math.random() - 0.5) * effectiveWorldSizeForMobile, // Use dynamic worldSize for x and y spread
      y: (Math.random() - 0.5) * effectiveWorldSizeForMobile, // Use dynamic worldSize for x and y spread
      z: Math.random() * (isMobile ? worldSize * 1.5 : 1000) + (isMobile ? 1000 : 0) // Adjust z-range for mobile to a larger portion of worldSize and add a minimum z
    }));
    
    setProjects(updatedProjects);
    localStorage.setItem('portfolioProjects', JSON.stringify(updatedProjects));
    
    // Reset view position with animation, randomize x and y offsets for mobile
    setTargetOffset({
      x: isMobile ? (Math.random() - 0.5) * effectiveWorldSizeForMobile * 0.8 : 0, // Randomize x target offset for mobile
      y: isMobile ? (Math.random() - 0.5) * effectiveWorldSizeForMobile * 0.8 : 0, // Randomize y target offset for mobile
      z: isMobile ? 3000 : 0 
    }); 
    setVelocity({ x: 0, y: 0 });
    setBlurFlash(2);
    
    setTimeout(() => {
      setBlurFlash(0);
    }, 300);
  };

  const handleProjectClick = (project: ProjectData) => {
    if (project.link && project.link !== '#') {
      window.open(project.link, '_blank');
    }
  };

  // Initialize mouse position immediately
  useEffect(() => {
    const handleInitialMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      window.removeEventListener('mousemove', handleInitialMouseMove);
    };
    window.addEventListener('mousemove', handleInitialMouseMove);
    return () => window.removeEventListener('mousemove', handleInitialMouseMove);
  }, []);

  // Function to check if a point is over a dark area
  const isPointOverDarkArea = (x: number, y: number, project: ProjectData, scaleZ: number): boolean => {
    const px = (project.x + offset.x) * scaleZ + window.innerWidth / 2;
    const py = (project.y + offset.y) * scaleZ + window.innerHeight / 2;
    
    // Check if the point is within the project bounds
    const baseWidth = isMobile ? 40 : 280;
    const baseHeight = isMobile ? 60 : 380;
    const currentProjectWidth = project.width || baseWidth;
    const currentProjectHeight = project.height || baseHeight;
    
    return (
      x >= px &&
      x <= px + currentProjectWidth * scaleZ &&
      y >= py &&
      y <= py + currentProjectHeight * scaleZ
    );
  };

  // Update header text color based on background
  useEffect(() => {
    if (headerRect) {
      const centerX = headerRect.left + headerRect.width / 2;
      const centerY = headerRect.top + headerRect.height / 2;
      
      let isOverDarkArea = false;
      
      for (const project of projects) {
        const z = project.z + offset.z;
        const depthScaleReference = isMobile ? 20000 : 3000;
        const scaleZ = 1 - z / depthScaleReference;
        
        if (scaleZ <= 0) continue;
        
        if (isPointOverDarkArea(centerX, centerY, project, scaleZ)) {
          isOverDarkArea = true;
          break;
        }
      }
      
      setHeaderTextColor(isOverDarkArea ? 'light' : 'dark');
    }
  }, [headerRect, projects, offset, isMobile]);

  if (isLoading) {
    return <Preloader message="Loading Portfolio..." />;
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-gray-100 select-none"
      style={{ cursor: 'none' }}
      onMouseDown={(e) => {
        if (e.button === 0 && !isPanningDisabled) { // Left click only
          setIsDragging(true);
          lastPosRef.current = { x: e.clientX, y: e.clientY };
          lastTimeRef.current = performance.now();
          setInitialOffsetOnDragStart(offset);
        }
      }}
    >
      {/* Social Icons */}
      <div className="fixed top-1 left-3 mt-2 md:top-3 md:left-5 flex gap-1 md:gap-3 z-[60] select-none">
        <a 
          href={socialLinks.youtube} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-5 h-5 md:w-6 md:h-6 bg-white border border-black flex items-center justify-center transition-all duration-300 hover:bg-transparent hover:border-black hover:border-dashed"
          onMouseEnter={() => setIsPanningDisabled(true)}
          onMouseLeave={() => setIsPanningDisabled(false)}
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill={isHeaderOverlapping ? "white" : "black"}>
            <path d="M10 15.5V8.5L16 12L10 15.5Z" fill={isHeaderOverlapping ? "white" : "black"}/>
          </svg>
        </a>
        <a 
          href={socialLinks.instagram} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-5 h-5 md:w-6 md:h-6 bg-white border border-black flex items-center justify-center transition-all duration-300 hover:bg-transparent hover:border-black hover:border-dashed"
          onMouseEnter={() => setIsPanningDisabled(true)}
          onMouseLeave={() => setIsPanningDisabled(false)}
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill={isHeaderOverlapping ? "white" : "black"}>
            <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm5 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm6.5-1.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill={isHeaderOverlapping ? "white" : "black"}/>
          </svg>
        </a>
        <a 
          href={socialLinks.linkedin} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-5 h-5 md:w-6 md:h-6 bg-white border border-black flex items-center justify-center transition-all duration-300 hover:bg-transparent hover:border-black hover:border-dashed"
          onMouseEnter={() => setIsPanningDisabled(true)}
          onMouseLeave={() => setIsPanningDisabled(false)}
        >
          <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill={isHeaderOverlapping ? "white" : "black"}>
            <path d="M6.94 19V9.75H4.25V19h2.69ZM5.6 8.56c.86 0 1.39-.57 1.39-1.28-.02-.73-.53-1.28-1.37-1.28-.84 0-1.39.55-1.39 1.28 0 .71.53 1.28 1.36 1.28h.01ZM8.98 19h2.69v-5.13c0-.27.02-.54.1-.73.22-.54.72-1.1 1.56-1.1 1.1 0 1.54.83 1.54 2.05V19h2.69v-5.5c0-2.95-1.57-4.32-3.67-4.32-1.7 0-2.45.94-2.87 1.6h.02V9.75H8.98c.04.86 0 9.25 0 9.25Z" fill={isHeaderOverlapping ? "white" : "black"}/>
          </svg>
        </a>
      </div>

      {/* Header */}
      <div
        ref={headerRef}
        className="fixed top-1 left-1/2 mt-2 transform -translate-x-1/2 flex items-center justify-center gap-4 z-[60] md:top-3 select-none"
      >
        <button
          onClick={() => {
            onShowAbout();
          }}
          onMouseEnter={() => {
            setIsPanningDisabled(true);
            setIsAboutHovered(true);
            let counter = 0;
            const originalText = 'About';
            aboutIntervalRef.current = setInterval(() => {
              let newText = '';
              for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.7) {
                  newText += String.fromCharCode(33 + Math.floor(Math.random() * 94));
                } else {
                  newText += originalText[i];
                }
              }
              setAboutText(newText);
              counter++;
              if (counter > 10) {
                clearInterval(aboutIntervalRef.current!);
                aboutIntervalRef.current = null;
                setAboutText(originalText);
              }
            }, 50);
          }}
          onMouseLeave={() => {
            setIsPanningDisabled(false);
            setIsAboutHovered(false);
            if (aboutIntervalRef.current) {
              clearInterval(aboutIntervalRef.current);
              aboutIntervalRef.current = null;
            }
            setAboutText('About');
          }}
          className={`font-mono text-xs md:text-base cursor-pointer hover:underline text-gray-500`}
        >
          {aboutText}
        </button>
        <button 
          className={`font-mono text-xs md:text-base text-gray-800`}
          onClick={() => window.location.reload()}
          onMouseEnter={() => {
            setIsPanningDisabled(true);
            setIsNameHovered(true);
            let counter = 0;
            const originalText = 'Hemantsingh Panwar';
            nameIntervalRef.current = setInterval(() => {
              let newText = '';
              for (let i = 0; i < originalText.length; i++) {
                if (Math.random() < 0.7) {
                  newText += String.fromCharCode(33 + Math.floor(Math.random() * 94));
                } else {
                  newText += originalText[i];
                }
              }
              setNameText(newText);
              counter++;
              if (counter > 10) {
                clearInterval(nameIntervalRef.current!);
                nameIntervalRef.current = null;
                setNameText(originalText);
              }
            }, 50);
          }}
          onMouseLeave={() => {
            setIsPanningDisabled(false);
            setIsNameHovered(false);
            if (nameIntervalRef.current) {
              clearInterval(nameIntervalRef.current);
              nameIntervalRef.current = null;
            }
            setNameText('Hemantsingh Panwar');
          }}
        >
          {nameText}
        </button>
      </div>

      {/* Center Buttons */}
      <div id="center-buttons" className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2 md:gap-5 z-50 pointer-events-auto select-none">
        <button
          id="showreel-btn"
          className="px-[10px] py-1 bg-blue-500 text-white border-none font-mono text-[0.75rem] md:text-sm font-bold cursor-pointer transition-all duration-300 tracking-normal md:tracking-wider hover:bg-blue-700 hover:-translate-y-0.5 whitespace-nowrap md:px-6 min-w-[60px]"
        >
          SHOW REEL
        </button>
        <button
          id="download-btn"
          className="w-12 h-12 bg-white border-2 border-gray-800 cursor-pointer transition-all duration-300 flex items-center justify-center text-xl text-gray-800 font-bold hover:bg-gray-800 hover:text-white hover:-translate-y-0.5"
        >
          ↓
        </button>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-1 left-1/2 transform -translate-x-1/2 text-[10px] md:text-xs font-mono text-gray-600 z-50 text-center px-4 md:bottom-3 select-none">
        2025 Hemantsinghpanwar. All rights reserved.
      </footer>

      {/* Shuffle Button */}
      <button
        id="shuffle-btn"
        onClick={handleShuffle}
        onMouseEnter={() => setIsPanningDisabled(true)}
        onMouseLeave={() => setIsPanningDisabled(false)}
        className="fixed bottom-8 left-3 px-3 bg-white border border-gray-800 font-mono text-xs text-gray-800 transition-all duration-300 flex items-center gap-1.5 z-[60] hover:bg-gray-50 hover:-translate-y-0.5 md:bottom-16 md:left-5 select-none"
      >
        <span className="text-lg">⚂</span>
        <span className="hidden md:inline">SHUFFLE</span>
      </button>

      {/* Canvas */}
      <div ref={canvasRef} className="w-full h-full relative overflow-hidden select-none">
        {/* Minimap */}
        <div
          id="minimap"
          ref={minimapRef}
          className="absolute top-1 right-3 mt-2 bg-white bg-opacity-90 border border-gray-300 z-[60] overflow-hidden w-[80px] h-[50px] md:w-[180px] md:h-[120px] md:top-3 select-none"
          onMouseDown={(e) => {
            setIsDraggingMinimap(true);
            startPosRef.current = { x: e.clientX, y: e.clientY };
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              setIsDraggingMinimap(true);
              touchStartPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
          }}
        >
          <div
            id="viewportBox"
            className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-15 pointer-events-none"
            style={{
              width: `${(window.innerWidth / worldSize) * (minimapRef.current?.clientWidth || mapWidth)}px`,
              height: `${(window.innerHeight / worldSize) * (minimapRef.current?.clientHeight || mapHeight)}px`,
              left: `${(offset.x + worldSize / 2) * (minimapRef.current?.clientWidth || mapWidth) / worldSize}px`,
              top: `${(offset.y + worldSize / 2) * (minimapRef.current?.clientHeight || mapHeight) / worldSize}px`
            }}
          />
          {projects.map((project) => (
            <div
              key={project.id}
              className="absolute w-1 h-1 bg-black"
              style={{
                left: `${(project.x + worldSize / 2) * (minimapRef.current?.clientWidth || mapWidth) / worldSize}px`,
                top: `${(project.y + worldSize / 2) * (minimapRef.current?.clientHeight || mapHeight) / worldSize}px`
              }}
            />
          ))}
        </div>

        {/* Projects */}
        {projects.map((project) => {
          const z = project.z + offset.z;
          // Use a smaller depth reference for mobile to ensure more aggressive scaling
          const depthScaleReference = isMobile ? 20000 : 3000; // Adjusted value for mobile depth scaling to prevent negative scaleZ and improve spread
          const scaleZ = 1 - z / depthScaleReference;
          
          const px = (project.x + offset.x) * scaleZ + window.innerWidth / 2;
          const py = (project.y + offset.y) * scaleZ + window.innerHeight / 2;

          // Use individual project width/height or default to desktop values for calculations
          const baseWidth = isMobile ? 40 : 280;
          const baseHeight = isMobile ? 60 : 380;

          let currentProjectWidth = project.width || baseWidth;
          let currentProjectHeight = project.height || baseHeight;

          if (isMobile && project.width && project.height) {
            const scaleFactor = 40 / 280; // Mobile base width / Desktop base width
            currentProjectWidth = project.width * scaleFactor;
            currentProjectHeight = project.height * scaleFactor;
          }

          // Calculate project bounding box (relative to viewport)
          const projectRect = {
            left: px,
            top: py,
            right: px + currentProjectWidth * scaleZ,
            bottom: py + currentProjectHeight * scaleZ
          };

          // Check for overlap with header
          let isInverted = false;
          if (headerRect) {
            const overlapX = Math.max(0, Math.min(projectRect.right, headerRect.right) - Math.max(projectRect.left, headerRect.left));
            const overlapY = Math.max(0, Math.min(projectRect.bottom, headerRect.bottom) - Math.max(projectRect.top, headerRect.top));
            
            if (overlapX > 0 && overlapY > 0) {
              isInverted = true;
            }
          }

          const dx = mousePos.x - (px + (currentProjectWidth / 2)); // Calculate distance from center of project
          const dy = mousePos.y - (py + (currentProjectHeight / 2)); // Calculate distance from center of project
          const dist = Math.hypot(dx, dy);

          let scale = 0.3; // Default scale for mobile to be smaller
          if (dist < (currentProjectWidth * 0.5)) scale = isMobile ? 0.7 : 2.0; // Reduced max scale for mobile
          else if (dist < (currentProjectWidth * 1)) scale = isMobile ? 0.5 : 1.4; // Reduced mid scale for mobile
          else if (dist < (currentProjectWidth * 1.5)) scale = isMobile ? 0.4 : 0.9; // Reduced min scale for mobile

          const isHovered = dist < (currentProjectWidth * 0.9);

          return (
            <div
              key={project.id}
              className="absolute bg-gray-800 flex justify-center transition-all duration-700 ease-out cursor-pointer group select-none"
              style={{
                width: `${currentProjectWidth}px`,
                height: `${currentProjectHeight}px`,
                transform: `translate(${px}px, ${py}px) scale(${scaleZ * scale})`,
                zIndex: scale > 0.7 ? 20 : 1,
                filter: `blur(${blurFlash * 4}px)`,
                willChange: 'transform'
              }}
              onClick={() => handleProjectClick(project)}
              onMouseEnter={() => setHoveredProject(project)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <img
                src={project.thumbnail}
                alt={project.name}
                className={`w-full h-full object-cover transition-all duration-700 ease-out ${isHovered ? 'grayscale-0' : 'grayscale'}`}
                style={{ imageRendering: 'crisp-edges' }}
                draggable="false"
              />
              {/* Project Description Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center p-4 select-none">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center transform translate-y-4 group-hover:translate-y-0 max-h-[80%] overflow-y-auto">
                  <p className="text-[7px] leading-relaxed font-mono tracking-wide">{project.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Custom Cursor */}
        <div
          className="fixed z-50 pointer-events-none flex items-center gap-1.5 text-xs font-bold select-none"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
            display: mousePos.x === 0 && mousePos.y === 0 ? 'none' : 'flex',
            color: hoveredProject ? 'white' : 'black',
            mixBlendMode: hoveredProject ? 'difference' : 'normal'
          }}
        >
          <div className="text-xl">+</div>
          {hoveredProject && (
            <div className="text-sm">{hoveredProject.name}</div>
          )}
        </div>

        {/* Cursor Trail */}
        {cursorTrail.map((point, index) => {
          if (index === 0) return null;
          const prevPoint = cursorTrail[index - 1];
          const dx = point.x - prevPoint.x;
          const dy = point.y - prevPoint.y;
          const length = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;

          return (
            <div
              key={`${point.x}-${point.y}-${point.time}`}
              className="absolute w-px bg-gray-600 z-5"
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
      </div>
    </div>
  );
};

export default Portfolio;