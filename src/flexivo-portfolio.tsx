import { useState, useRef, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Sun, Moon, Menu, X, ArrowRight, Mail, Phone, MapPin, Palette, Monitor, FileText, Smartphone, TrendingUp, Package, Diamond } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import Lenis from 'lenis';


// 3D Components - Multi-Color Infinity Drawing Blooming Particles
const InfinityBloomingParticles = ({ isDark }: { isDark: boolean }) => {
  const infinityRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const bloomParticlesRef = useRef<THREE.InstancedMesh>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);
  
  const particleCount = 200;
  const bloomCount = 60;
  const trailCount = 40;
  
  // Generate infinity particle data with multi-color properties
  const particleData: Array<{
    t: number;
    phase: number;
    speed: number;
    colorIndex: number;
    bloomPhase: number;
  }> = [];
  
  // Blue and purple color palette
  const colors = [
    '#3b82f6', '#1d4ed8', '#2563eb', '#1e40af', '#6366f1', 
    '#4f46e5', '#7c3aed', '#8b5cf6', '#a855f7', '#9333ea'
  ];
  
  for (let i = 0; i < particleCount; i++) {
    particleData.push({
      t: (i / particleCount) * Math.PI * 4, // Parameter for infinity curve
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.0,
      colorIndex: Math.floor(Math.random() * colors.length),
      bloomPhase: Math.random() * Math.PI * 2
    });
  }
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Animate infinity shape rotation
    if (infinityRef.current) {
      infinityRef.current.rotation.y += delta * 0.1;
      infinityRef.current.rotation.x = Math.sin(time * 0.2) * 0.1;
      infinityRef.current.rotation.z = Math.cos(time * 0.15) * 0.05;
    }
    
    // Animate infinity curve particles
    if (particlesRef.current) {
      const matrix = new THREE.Matrix4();
      
      particleData.forEach((particle, i) => {
        // Infinity symbol parametric equation: x = a*cos(t), y = a*sin(t)*cos(t)
        const animatedT = particle.t + time * particle.speed * 0.1;
        const scale_factor = 2.5;
        
        // Basic infinity curve
        const x = scale_factor * Math.cos(animatedT);
        const y = scale_factor * Math.sin(animatedT) * Math.cos(animatedT);
        const z = Math.sin(time * 0.3 + particle.phase) * 0.5;
        
        // Blooming effect - particles expand outward
        const bloomProgress = (Math.sin(time * particle.speed + particle.bloomPhase) + 1) * 0.5;
        const bloomRadius = 1 + bloomProgress * 1.5;
        
        const finalX = x * bloomRadius;
        const finalY = y * bloomRadius;
        const finalZ = z + Math.sin(time * 0.4 + i * 0.1) * 0.3;
        
        // Dynamic scaling based on position and bloom
        const scale = 0.008 + bloomProgress * 0.015 + Math.sin(time + i * 0.2) * 0.005;
        
        matrix.identity();
        matrix.setPosition(finalX, finalY, finalZ);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        particlesRef.current!.setMatrixAt(i, matrix);
      });
      
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Animate secondary blooming particles
    if (bloomParticlesRef.current) {
      const matrix = new THREE.Matrix4();
      
      for (let i = 0; i < bloomCount; i++) {
        const angle = (i / bloomCount) * Math.PI * 2;
        const bloomTime = time * 0.8 + i * 0.1;
        
        // Expanding circles that bloom outward
        const radius = 1 + Math.sin(bloomTime) * 2;
        const x = Math.cos(angle + time * 0.2) * radius;
        const y = Math.sin(angle + time * 0.2) * radius;
        const z = Math.sin(time * 0.5 + i * 0.3) * 0.8;
        
        // Pulsing scale
        const scale = 0.005 + Math.abs(Math.sin(bloomTime)) * 0.01;
        
        matrix.identity();
        matrix.setPosition(x, y, z);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        bloomParticlesRef.current!.setMatrixAt(i, matrix);
      }
      
      bloomParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Animate trailing particles for drawing effect
    if (trailRef.current) {
      const matrix = new THREE.Matrix4();
      
      for (let i = 0; i < trailCount; i++) {
        const t = (i / trailCount) * Math.PI * 8 + time * 0.5;
        const radius = 3.5 + Math.sin(time * 0.4 + i * 0.2) * 0.5;
        
        // Create trailing spiral effect
        const x = Math.cos(t) * radius * (1 - i / trailCount);
        const y = Math.sin(t) * radius * (1 - i / trailCount);
        const z = Math.sin(time * 0.6 + i * 0.4) * 1.2;
        
        // Fading trail effect
        const scale = 0.003 + (1 - i / trailCount) * 0.008;
        
        matrix.identity();
        matrix.setPosition(x, y, z);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        trailRef.current!.setMatrixAt(i, matrix);
      }
      
      trailRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={infinityRef}>
      {/* Main infinity curve particles */}
      <instancedMesh
        ref={particlesRef}
        args={[undefined, undefined, particleCount]}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshLambertMaterial 
          color={isDark ? "#3b82f6" : "#2563eb"} 
          transparent 
          opacity={0.8}
        />
      </instancedMesh>
      
      {/* Secondary blooming particles */}
      <instancedMesh
        ref={bloomParticlesRef}
        args={[undefined, undefined, bloomCount]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshLambertMaterial 
          color={isDark ? "#8b5cf6" : "#7c3aed"} 
          transparent 
          opacity={0.7}
        />
      </instancedMesh>
      
      {/* Trailing drawing particles */}
      <instancedMesh
        ref={trailRef}
        args={[undefined, undefined, trailCount]}
      >
        <sphereGeometry args={[1, 4, 4]} />
        <meshLambertMaterial 
          color={isDark ? "#6366f1" : "#4f46e5"} 
          transparent 
          opacity={0.5}
        />
      </instancedMesh>
    </group>
  );
};

const Scene3D = ({ isDark }: { isDark: boolean }) => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={isDark ? 0.3 : 0.6} />
      <pointLight position={[5, 5, 5]} intensity={isDark ? 0.8 : 1} color={isDark ? "#3b82f6" : "#2563eb"} />
      <pointLight position={[-5, -5, 5]} intensity={isDark ? 0.4 : 0.6} color={isDark ? "#8b5cf6" : "#7c3aed"} />
      <pointLight position={[0, 5, -5]} intensity={isDark ? 0.3 : 0.4} color={isDark ? "#06b6d4" : "#0891b2"} />
      <InfinityBloomingParticles isDark={isDark} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 1.3}
        minPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
};

// Enhanced Sphere - Sophisticated, dynamic, and responsive
const FlexivoEnhancedSphere = ({ isDark }: { isDark: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const innerSphereRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Orbital particles data
  const particleCount = 60;
  const particleData = useRef(
    Array.from({ length: particleCount }, (_, i) => ({
      radius: 2 + Math.random() * 1.5,
      angle: (i / particleCount) * Math.PI * 2,
      elevation: (Math.random() - 0.5) * Math.PI,
      speed: 0.5 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      size: 0.8 + Math.random() * 0.4
    }))
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (groupRef.current) {
      // Smooth mouse-responsive rotation
      const targetRotY = mouse.x * 0.4 + Math.sin(time * 0.2) * 0.1;
      const targetRotX = mouse.y * 0.2 + Math.cos(time * 0.3) * 0.05;
      
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.03;
      
      // Gentle floating motion
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.08;
    }

    if (sphereRef.current) {
      // Breathing effect with subtle morphing
      const breathe = 1 + Math.sin(time * 0.7) * 0.03;
      const morphX = 1 + Math.sin(time * 0.4) * 0.02;
      const morphY = 1 + Math.cos(time * 0.6) * 0.02;
      const morphZ = 1 + Math.sin(time * 0.8) * 0.015;
      
      sphereRef.current.scale.set(morphX * breathe, morphY * breathe, morphZ * breathe);
      
      // Continuous rotation
      sphereRef.current.rotation.x = time * 0.1;
      sphereRef.current.rotation.y = time * 0.15;
    }

    if (innerSphereRef.current) {
      // Counter-rotation for inner sphere
      innerSphereRef.current.rotation.x = -time * 0.2;
      innerSphereRef.current.rotation.z = time * 0.1;
      
      // Pulsing effect
      const pulse = 0.7 + Math.sin(time * 2) * 0.1;
      innerSphereRef.current.scale.setScalar(pulse);
    }

    if (ringsRef.current) {
      // Rotating rings at different speeds
      ringsRef.current.children.forEach((ring, i) => {
        ring.rotation.x = time * (0.3 + i * 0.1);
        ring.rotation.y = time * (0.2 - i * 0.05);
        ring.rotation.z = time * (0.1 + i * 0.03);
      });
    }

    // Animate orbital particles
    if (particlesRef.current) {
      const matrix = new THREE.Matrix4();
      
      particleData.current.forEach((particle, i) => {
        // Update orbital motion
        particle.angle += particle.speed * 0.005;
        particle.elevation += Math.sin(time * 0.3 + particle.phase) * 0.001;
        
        // Calculate 3D orbital position
        const x = Math.cos(particle.angle) * Math.cos(particle.elevation) * particle.radius;
        const y = Math.sin(particle.elevation) * particle.radius;
        const z = Math.sin(particle.angle) * Math.cos(particle.elevation) * particle.radius;
        
        // Add mouse influence to particles
        const mouseInfluence = 0.2;
        const offsetX = mouse.x * mouseInfluence;
        const offsetY = mouse.y * mouseInfluence;
        
        // Dynamic scaling with breathing effect
        const breatheScale = 1 + Math.sin(time * 1.5 + particle.phase) * 0.3;
        const scale = (particle.size * 0.01) * breatheScale;
        
        matrix.identity();
        matrix.setPosition(x + offsetX, y + offsetY, z);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        particlesRef.current!.setMatrixAt(i, matrix);
      });
      
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main sphere with sophisticated material */}
      <mesh ref={sphereRef}>
        <icosahedronGeometry args={[1.2, 3]} />
        <meshStandardMaterial
          color={isDark ? "#3b82f6" : "#2563eb"}
          metalness={0.9}
          roughness={0.1}
          transparent
          opacity={0.9}
          envMapIntensity={1.5}
        />
      </mesh>
      
      {/* Inner energy core */}
      <mesh ref={innerSphereRef}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial
          color={isDark ? "#06b6d4" : "#0891b2"}
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Wireframe overlay for structure */}
      <mesh>
        <icosahedronGeometry args={[1.25, 2]} />
        <meshBasicMaterial
          color={isDark ? "#8b5cf6" : "#7c3aed"}
          wireframe={true}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Orbital particles system */}
      <instancedMesh
        ref={particlesRef}
        args={[undefined, undefined, particleCount]}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color={isDark ? "#fbbf24" : "#f59e0b"}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
      
      {/* Rotating rings for complexity */}
      <group ref={ringsRef}>
        {[1.8, 2.1, 2.4].map((radius, i) => (
          <mesh key={i}>
            <torusGeometry args={[radius, 0.015, 8, 32]} />
            <meshBasicMaterial
              color={isDark ? "#3b82f6" : "#2563eb"}
              transparent
              opacity={0.15 - i * 0.03}
            />
          </mesh>
        ))}
        
        {/* Additional perpendicular rings */}
        {[1.6, 1.9, 2.2].map((radius, i) => (
          <mesh key={`perp-${i}`} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.01, 6, 24]} />
            <meshBasicMaterial
              color={isDark ? "#8b5cf6" : "#7c3aed"}
              transparent
              opacity={0.1 - i * 0.02}
            />
          </mesh>
        ))}
      </group>
      
      {/* Outer energy field */}
      <mesh>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial
          color={isDark ? "#1e40af" : "#1d4ed8"}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

const About3DScene = ({ isDark }: { isDark: boolean }) => {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={isDark ? 0.4 : 0.6} />
      <pointLight 
        position={[5, 5, 5]} 
        intensity={isDark ? 1 : 1.2} 
        color={isDark ? "#3b82f6" : "#2563eb"} 
      />
      <pointLight 
        position={[-5, -5, 5]} 
        intensity={isDark ? 0.5 : 0.7} 
        color={isDark ? "#8b5cf6" : "#7c3aed"} 
      />
      <FlexivoEnhancedSphere isDark={isDark} />
    </Canvas>
  );
};

// Main Component
const FlexivoPortfolio = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Sample project data
  const projects = [
    {
      id: 1,
      title: "Brand Identity - TechFlow",
      category: "Branding",
      description: "Complete brand identity redesign for a fintech startup, including logo, color palette, and brand guidelines.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
      tags: ["Logo Design", "Brand Guidelines", "Typography"]
    },
    {
      id: 2,
      title: "E-commerce Platform UI",
      category: "Web Design",
      description: "Modern, user-centric interface design for a sustainable fashion e-commerce platform.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      tags: ["UI/UX", "E-commerce", "Responsive Design"]
    },
    {
      id: 3,
      title: "Restaurant Menu Design",
      category: "Print Design",
      description: "Elegant menu design combining modern typography with food photography for upscale dining.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      tags: ["Print Design", "Typography", "Food Photography"]
    },
    {
      id: 4,
      title: "Mobile App Interface",
      category: "UI/UX",
      description: "Intuitive mobile app design for a meditation and wellness platform with calming aesthetics.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
      tags: ["Mobile Design", "Wellness", "User Experience"]
    },
    {
      id: 5,
      title: "Event Poster Series",
      category: "Marketing",
      description: "Dynamic poster series for a music festival featuring bold typography and vibrant gradients.",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
      tags: ["Poster Design", "Event Marketing", "Visual Identity"]
    },
    {
      id: 6,
      title: "Corporate Website",
      category: "Web Design",
      description: "Professional website redesign for a consulting firm with focus on trust and expertise.",
      image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop",
      tags: ["Corporate Design", "Professional", "Responsive"]
    }
  ];

  const services = [
    {
      title: "Brand Identity Design",
      description: "Complete brand identity development including logos, color palettes, and brand guidelines.",
      icon: Palette
    },
    {
      title: "Web Design & Development",
      description: "Modern, responsive websites that combine beautiful design with seamless functionality.",
      icon: Monitor
    },
    {
      title: "Print Design",
      description: "From business cards to large format prints, creating impactful print materials.",
      icon: FileText
    },
    {
      title: "UI/UX Design",
      description: "User-centered design solutions that enhance digital experiences and drive engagement.",
      icon: Smartphone
    },
    {
      title: "Digital Marketing",
      description: "Creative assets for digital campaigns, social media, and online advertising.",
      icon: TrendingUp
    },
    {
      title: "Packaging Design",
      description: "Innovative packaging solutions that stand out on shelves and connect with consumers.",
      icon: Package
    }
  ];

  const stats = [
    { number: "150+", label: "Projects Completed" },
    { number: "50+", label: "Happy Clients" },
    { number: "5+", label: "Years Experience" },
    { number: "98%", label: "Client Satisfaction" }
  ];

  // Smooth scroll function with Lenis
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(element, { duration: 1.5 });
      } else {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  // Theme toggle
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={`${isDark ? 'dark' : ''} font-tinos`}>
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#0f172a] dark:text-white transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] overflow-x-hidden">
        
        {/* Header */}
        <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-[#0a0a0a]/80 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <motion.div 
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={isDark ? "/logo-white.png" : "/logo-black.png"}
                  alt="Flexivo Logo"
                  className="h-6 w-auto"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8 font-inter" role="navigation" aria-label="Main navigation">
                {['Work', 'Services', 'About', 'Contact'].map((item) => (
                  <motion.button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a] rounded-md px-3 py-2 uppercase tracking-wider text-sm font-medium"
                    whileHover={{ 
                      y: -2, 
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 400, damping: 15 }
                    }}
                    whileTap={{ y: 0, scale: 0.98 }}
                    aria-label={`Navigate to ${item} section`}
                  >
                    {item}
                  </motion.button>
                ))}
              </nav>

              {/* Theme Toggle & Mobile Menu */}
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-[#f8fafc] dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a]"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 10,
                    transition: { type: "spring", stiffness: 400, damping: 15 }
                  }}
                  whileTap={{ scale: 0.9, rotate: -5 }}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.button>

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 rounded-lg bg-[#f8fafc] dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a]"
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMenuOpen}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#1a1a1a]"
              >
                <div className="px-4 py-6 space-y-4">
                  {['Work', 'Services', 'About', 'Contact'].map((item) => (
                    <button
                      key={item}
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="block w-full text-left text-[#64748b] dark:text-[#a3a3a3] hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a] rounded-md p-2 uppercase tracking-wider text-sm font-medium"
                      aria-label={`Navigate to ${item} section`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden" aria-label="Hero section">
          {/* 3D Background */}
          <div className="absolute inset-0 z-0">
            <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[#1a1a1a] dark:to-[#0a0a0a]" />}>
              <Scene3D isDark={isDark} />
            </Suspense>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-2 sm:px-4 lg:px-6">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="font-higuen-serif text-4xl md:text-6xl font-bold mb-6 text-[#0f172a] dark:text-white leading-normal pb-2">
                <span className="relative">
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-7xl">C</span>ontrol{' '}
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-7xl">W</span>ithin{' '}
                  the{' '}
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-7xl">F</span>low,{' '}
                  <br className="hidden sm:block" />
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-7xl">J</span>ust{' '}
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-7xl">L</span>ike{' '}
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-7xl">L</span>iquid
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-[#64748b] dark:text-[#a3a3a3] mb-8 max-w-4xl mx-auto">
                Modify your requested designs as your creativity desire, just like liquid - you control the flow. From detailed overview to varied options of input, you can control from decorative intensity to visualization of every layers in your posters; all in your hand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => scrollToSection('work')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex items-center justify-center gap-2"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    transition: { type: "spring", stiffness: 400, damping: 15 }
                  }}
                  whileTap={{ scale: 0.95, y: 0 }}
                >
                  View My Work <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:text-white rounded-lg font-medium transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    transition: { type: "spring", stiffness: 400, damping: 15 }
                  }}
                  whileTap={{ scale: 0.95, y: 0 }}
                >
                  Get In Touch
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 dark:bg-gray-600 rounded-full mt-2"></div>
            </div>
          </motion.div>
        </section>

        {/* Work Section */}
        <section id="work" className="pt-16 lg:pt-20 pb-12 lg:pb-16 bg-[#f8fafc] dark:bg-[#1a1a1a]" aria-label="Featured work portfolio">
          <div className="w-full px-2 sm:px-4">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-4">
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: 45 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <Diamond className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <span className="font-higuen-serif">
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-6xl">F</span>eatured{' '}
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-6xl">W</span>ork
                </span>
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: -45 }}
                  transition={{ duration: 1, delay: 0.7 }}
                >
                  <Diamond className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-[#64748b] dark:text-[#a3a3a3] max-w-3xl mx-auto">
                A selection of projects that showcase my approach to solving design challenges and creating meaningful visual experiences.
              </motion.p>
            </motion.div>

            {/* Auto-scrolling carousel */}
            <div className="relative overflow-hidden w-full max-w-full">
              <motion.div
                className="flex gap-8"
                animate={{
                  x: [0, -312 * projects.length] // Move continuously right to left
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: projects.length * 4, // Even slower scrolling speed
                    ease: "linear"
                  }
                }}
                style={{ 
                  width: `${312 * projects.length * 3}px` // 280px card + 32px gap = 312px per item
                }}
              >
                {/* First set of projects */}
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    className="group bg-white dark:bg-[#0a0a0a] rounded-xl overflow-hidden w-[280px] flex-shrink-0 relative"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                    whileHover={{ 
                      y: -15,
                      rotateX: -5,
                      rotateY: 5,
                      scale: 1.05,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1)'
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }}
                    initial={{
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <motion.div 
                      className="relative overflow-hidden"
                      whileHover={{
                        z: 20,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        whileHover={{
                          scale: 1.15,
                          rotateZ: 1
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div 
                        className="absolute bottom-4 left-4 right-4 text-white"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <p className="text-sm font-medium bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-md inline-block">
                          {project.category}
                        </p>
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="p-4"
                      whileHover={{
                        z: 10,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-[#64748b] dark:text-[#a3a3a3] mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
                {/* Second set for seamless loop */}
                {projects.map((project) => (
                  <motion.div
                    key={`${project.id}-set2`}
                    className="group bg-white dark:bg-[#0a0a0a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 w-[280px] flex-shrink-0"
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <motion.div 
                      className="relative overflow-hidden"
                      whileHover={{
                        z: 20,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        whileHover={{
                          scale: 1.15,
                          rotateZ: 1
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div 
                        className="absolute bottom-4 left-4 right-4 text-white"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <p className="text-sm font-medium bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-md inline-block">
                          {project.category}
                        </p>
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="p-4"
                      whileHover={{
                        z: 10,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-[#64748b] dark:text-[#a3a3a3] mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
                {/* Third set for extra seamless coverage */}
                {projects.map((project) => (
                  <motion.div
                    key={`${project.id}-set3`}
                    className="group bg-white dark:bg-[#0a0a0a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 w-[280px] flex-shrink-0"
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <motion.div 
                      className="relative overflow-hidden"
                      whileHover={{
                        z: 20,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <motion.img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        whileHover={{
                          scale: 1.15,
                          rotateZ: 1
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div 
                        className="absolute bottom-4 left-4 right-4 text-white"
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        <p className="text-sm font-medium bg-blue-600/80 backdrop-blur-sm px-2 py-1 rounded-md inline-block">
                          {project.category}
                        </p>
                      </motion.div>
                    </motion.div>
                    <motion.div 
                      className="p-4"
                      whileHover={{
                        z: 10,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                      }}
                    >
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-[#64748b] dark:text-[#a3a3a3] mb-4 line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Stats Section */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl"
            >
              {stats.map((stat, index) => (
                <motion.div key={index} variants={fadeInUp} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-[#64748b] dark:text-[#a3a3a3]">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="pt-16 lg:pt-20 pb-16 lg:pb-20" aria-label="Services offered">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-4">
                <motion.div
                  initial={{ rotate: 0, scale: 0 }}
                  whileInView={{ rotate: 90, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Diamond className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <span className="font-higuen-serif">
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-6xl">S</span>ervices
                </span>
                <motion.div
                  initial={{ rotate: 0, scale: 0 }}
                  whileInView={{ rotate: -90, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <Diamond className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </motion.div>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-[#64748b] dark:text-[#a3a3a3] max-w-3xl mx-auto">
                Comprehensive design solutions tailored to elevate your brand and achieve your business objectives.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12"
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                  whileHover={{ y: -5 }}
                >
                  <motion.div 
                    className="mb-4 flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg"
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      backgroundColor: isDark ? "#1e40af20" : "#dbeafe"
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20 
                    }}
                  >
                    <service.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-[#64748b] dark:text-[#a3a3a3]">{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="pt-16 lg:pt-20 pb-8 lg:pb-12 bg-[#f8fafc] dark:bg-[#1a1a1a]" aria-label="About the designer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative w-full max-w-md mx-auto h-96">
                  <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[#1a1a1a] dark:to-[#0a0a0a] rounded-2xl" />}>
                    <About3DScene isDark={isDark} />
                  </Suspense>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-lg"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 font-higuen-serif">
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-6xl">O</span>ur{' '}
                  <span className="text-blue-600 dark:text-blue-400 text-5xl md:text-6xl">S</span>tudio
                </h2>
                <p className="text-lg text-[#64748b] dark:text-[#a3a3a3] mb-6">
                  Flexivo is a creative design studio specializing in visual storytelling and brand development. With over 5 years of industry experience, we craft compelling design solutions that bridge the gap between brands and their audiences through strategic visual communication.
                </p>
                <p className="text-lg text-[#64748b] dark:text-[#a3a3a3] mb-8">
                  Our philosophy centers on collaborative design thinking and innovative problem-solving. From comprehensive brand identities to digital experiences, we deliver design solutions that not only captivate visually but also drive meaningful business results for our clients.
                </p>

                {/* Skills */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Core Skills</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {['Adobe Creative Suite', 'Figma & Sketch', 'Brand Strategy', 'Typography', 'Color Theory', 'User Experience'].map((skill, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-[#64748b] dark:text-[#a3a3a3]">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="pt-16 lg:pt-20 pb-12 bg-[#0a0a0a] text-white" aria-label="Contact information and form">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6 font-higuen-serif">
                Let's Work Together
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-[#a3a3a3] max-w-3xl mx-auto">
                Ready to bring your vision to life? I'm currently available for new projects and would love to hear about your design needs.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-2xl font-semibold mb-8">Get In Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:hello@flexivo.com" className="text-[#a3a3a3] hover:text-white transition-colors">
                        hello@flexivo.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <a href="tel:++6287872597290" className="text-[#a3a3a3] hover:text-white transition-colors">                        
                        +62 878-7259-7290
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-[#a3a3a3]">Jakarta, Indonesia</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-8">
                  <h4 className="text-lg font-medium mb-4">Follow Me</h4>
                  <div className="flex gap-4">
                    {[
                      { name: 'GitHub', href: '#', icon: FaGithub },
                      { name: 'LinkedIn', href: '#', icon: FaLinkedin },
                      { name: 'Instagram', href: '#', icon: FaInstagram }
                    ].map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        className="w-10 h-10 bg-[#1a1a1a] hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Follow on ${social.name}`}
                      >
                        <social.icon className="w-5 h-5" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-[#1a1a1a] p-8 rounded-2xl"
              >
                <h3 className="text-2xl font-semibold mb-6">Send a Message</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                      placeholder="Project inquiry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors resize-none"
                      placeholder="Tell me about your project..."
                    ></textarea>
                  </div>
                  <motion.button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mt-16 pt-8 border-t border-[#3a3a3a] text-center"
            >
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[#a3a3a3]">
                  © 2025 Flexivo. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <p className="text-[#a3a3a3] text-sm">
                    Let's connect • Response within 24h
                  </p>
                  <motion.button
                    onClick={() => scrollToSection('hero')}
                    className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] rounded-lg transition-colors duration-200 flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowRight className="w-4 h-4 rotate-[-90deg]" />
                    Back to Top
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FlexivoPortfolio;