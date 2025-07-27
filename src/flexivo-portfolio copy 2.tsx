import { useState, useRef, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Sun, Moon, Menu, X, ArrowRight, Mail, Phone, MapPin, Download, ExternalLink, Palette, Monitor, FileText, Smartphone, TrendingUp, Package } from 'lucide-react';
import Lenis from 'lenis';

// 3D Components - Dual Blooming Flower Particles
const DualBloomingFlowers = ({ isDark }: { isDark: boolean }) => {
  const leftFlowerRef = useRef<THREE.Group>(null);
  const rightFlowerRef = useRef<THREE.Group>(null);
  const leftParticlesRef = useRef<THREE.InstancedMesh>(null);
  const rightParticlesRef = useRef<THREE.InstancedMesh>(null);
  const leftPetalsRef = useRef<THREE.InstancedMesh>(null);
  const rightPetalsRef = useRef<THREE.InstancedMesh>(null);
  
  const particlesPerFlower = 80;
  const petalsPerFlower = 24;
  
  // Generate flower particle data for both flowers
  const generateFlowerData = () => {
    const data: Array<{
      petalIndex: number;
      layer: number;
      phase: number;
      speed: number;
    }> = [];
    
    const petalLayers = 3;
    const particlesPerLayer = particlesPerFlower / petalLayers;
    
    for (let layer = 0; layer < petalLayers; layer++) {
      for (let i = 0; i < particlesPerLayer; i++) {
        data.push({
          petalIndex: i,
          layer: layer,
          phase: Math.random() * Math.PI * 2,
          speed: 0.6 + Math.random() * 0.6
        });
      }
    }
    return data;
  };
  
  const leftFlowerData = generateFlowerData();
  const rightFlowerData = generateFlowerData();
  
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    // Animate flower rotations
    if (leftFlowerRef.current) {
      leftFlowerRef.current.rotation.y += delta * 0.06;
      leftFlowerRef.current.rotation.z = Math.sin(time * 0.3) * 0.1;
    }
    if (rightFlowerRef.current) {
      rightFlowerRef.current.rotation.y -= delta * 0.06;
      rightFlowerRef.current.rotation.z = Math.cos(time * 0.3) * 0.1;
    }
    
    // Animate left flower particles
    if (leftParticlesRef.current) {
      const matrix = new THREE.Matrix4();
      
      leftFlowerData.forEach((particle, i) => {
        const t = particle.petalIndex / (particlesPerFlower / 3);
        const layerRadius = 0.5 + particle.layer * 0.8;
        
        // Flower blooming effect
        const bloomProgress = (Math.sin(time * particle.speed + particle.phase) + 1) * 0.5;
        const currentRadius = bloomProgress * layerRadius;
        
        // Petal-like arrangement (8 petals)
        const petalAngle = (particle.petalIndex % 8) * (Math.PI * 2 / 8);
        const petalCurve = Math.sin(t * Math.PI) * currentRadius;
        
        const x = Math.cos(petalAngle) * petalCurve - 3; // Left position
        const z = Math.sin(petalAngle) * petalCurve;
        const y = Math.sin(t * Math.PI * 2 + time * 0.4) * 0.3 + (particle.layer - 1) * 0.2;
        
        // Organic flutter
        const flutter = Math.sin(time * 2 + i * 0.2) * 0.05 * bloomProgress;
        
        const scale = 0.01 + bloomProgress * 0.015 + (1 - particle.layer / 3) * 0.01;
        
        matrix.identity();
        matrix.setPosition(x + flutter, y, z + flutter);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        leftParticlesRef.current!.setMatrixAt(i, matrix);
      });
      
      leftParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Animate right flower particles
    if (rightParticlesRef.current) {
      const matrix = new THREE.Matrix4();
      
      rightFlowerData.forEach((particle, i) => {
        const t = particle.petalIndex / (particlesPerFlower / 3);
        const layerRadius = 0.5 + particle.layer * 0.8;
        
        // Flower blooming effect (offset timing)
        const bloomProgress = (Math.sin(time * particle.speed + particle.phase + Math.PI) + 1) * 0.5;
        const currentRadius = bloomProgress * layerRadius;
        
        // Petal-like arrangement (6 petals for variety)
        const petalAngle = (particle.petalIndex % 6) * (Math.PI * 2 / 6);
        const petalCurve = Math.sin(t * Math.PI) * currentRadius;
        
        const x = Math.cos(petalAngle) * petalCurve + 3; // Right position
        const z = Math.sin(petalAngle) * petalCurve;
        const y = Math.cos(t * Math.PI * 2 + time * 0.5) * 0.3 + (particle.layer - 1) * 0.2;
        
        // Organic flutter
        const flutter = Math.cos(time * 2.2 + i * 0.15) * 0.05 * bloomProgress;
        
        const scale = 0.01 + bloomProgress * 0.015 + (1 - particle.layer / 3) * 0.01;
        
        matrix.identity();
        matrix.setPosition(x + flutter, y, z + flutter);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        rightParticlesRef.current!.setMatrixAt(i, matrix);
      });
      
      rightParticlesRef.current.instanceMatrix.needsUpdate = true;
    }
    
    // Animate petal particles for both flowers
    if (leftPetalsRef.current) {
      const matrix = new THREE.Matrix4();
      
      for (let i = 0; i < petalsPerFlower; i++) {
        const angle = (i / petalsPerFlower) * Math.PI * 2;
        const radius = 1.2 + Math.sin(time * 0.8 + i * 0.3) * 0.4;
        
        const x = Math.cos(angle + time * 0.1) * radius - 3;
        const z = Math.sin(angle + time * 0.1) * radius;
        const y = Math.sin(time * 0.6 + i * 0.4) * 0.2;
        
        const scale = 0.008 + Math.sin(time + i * 0.5) * 0.004;
        
        matrix.identity();
        matrix.setPosition(x, y, z);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        leftPetalsRef.current!.setMatrixAt(i, matrix);
      }
      
      leftPetalsRef.current.instanceMatrix.needsUpdate = true;
    }
    
    if (rightPetalsRef.current) {
      const matrix = new THREE.Matrix4();
      
      for (let i = 0; i < petalsPerFlower; i++) {
        const angle = (i / petalsPerFlower) * Math.PI * 2;
        const radius = 1.2 + Math.cos(time * 0.7 + i * 0.25) * 0.4;
        
        const x = Math.cos(angle - time * 0.1) * radius + 3;
        const z = Math.sin(angle - time * 0.1) * radius;
        const y = Math.cos(time * 0.5 + i * 0.3) * 0.2;
        
        const scale = 0.008 + Math.cos(time * 1.2 + i * 0.4) * 0.004;
        
        matrix.identity();
        matrix.setPosition(x, y, z);
        matrix.scale(new THREE.Vector3(scale, scale, scale));
        
        rightPetalsRef.current!.setMatrixAt(i, matrix);
      }
      
      rightPetalsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Left Flower */}
      <group ref={leftFlowerRef}>
        <instancedMesh
          ref={leftParticlesRef}
          args={[undefined, undefined, particlesPerFlower]}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshLambertMaterial 
            color={isDark ? "#3b82f6" : "#2563eb"} 
            transparent 
            opacity={0.8}
          />
        </instancedMesh>
        
        <instancedMesh
          ref={leftPetalsRef}
          args={[undefined, undefined, petalsPerFlower]}
        >
          <sphereGeometry args={[1, 4, 4]} />
          <meshLambertMaterial 
            color={isDark ? "#8b5cf6" : "#7c3aed"} 
            transparent 
            opacity={0.6}
          />
        </instancedMesh>
      </group>
      
      {/* Right Flower */}
      <group ref={rightFlowerRef}>
        <instancedMesh
          ref={rightParticlesRef}
          args={[undefined, undefined, particlesPerFlower]}
        >
          <sphereGeometry args={[1, 6, 6]} />
          <meshLambertMaterial 
            color={isDark ? "#06b6d4" : "#0891b2"} 
            transparent 
            opacity={0.8}
          />
        </instancedMesh>
        
        <instancedMesh
          ref={rightPetalsRef}
          args={[undefined, undefined, petalsPerFlower]}
        >
          <sphereGeometry args={[1, 4, 4]} />
          <meshLambertMaterial 
            color={isDark ? "#f59e0b" : "#d97706"} 
            transparent 
            opacity={0.6}
          />
        </instancedMesh>
      </group>
    </>
  );
};

const Scene3D = ({ isDark }: { isDark: boolean }) => {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
      <ambientLight intensity={isDark ? 0.3 : 0.6} />
      <pointLight position={[5, 5, 5]} intensity={isDark ? 0.8 : 1} color={isDark ? "#3b82f6" : "#2563eb"} />
      <pointLight position={[-5, -5, 5]} intensity={isDark ? 0.4 : 0.6} color={isDark ? "#8b5cf6" : "#7c3aed"} />
      <pointLight position={[0, 5, -5]} intensity={isDark ? 0.3 : 0.4} color={isDark ? "#06b6d4" : "#0891b2"} />
      <DualBloomingFlowers isDark={isDark} />
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
    <div className={`${isDark ? 'dark' : ''} font-inter`}>
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-[#0f172a] dark:text-white transition-colors duration-300">
        
        {/* Header */}
        <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-[#0a0a0a]/80 border-b border-gray-200 dark:border-[#1a1a1a]">
          <div className="max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <motion.div 
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Flexivo
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Main navigation">
                {['Work', 'Services', 'About', 'Contact'].map((item) => (
                  <motion.button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a] rounded-md px-3 py-2"
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
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
                  className="p-2 rounded-lg bg-[#f8fafc] dark:bg-[#1a1a1a] hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                      className="block w-full text-left text-[#64748b] dark:text-[#a3a3a3] hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#0a0a0a] rounded-md p-2"
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
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-normal pb-2">
                Crafting Visual Stories
              </h1>
              <p className="text-xl md:text-2xl text-[#64748b] dark:text-[#a3a3a3] mb-8 max-w-3xl mx-auto">
                Graphic design portfolio showcasing creative solutions that elevate brands and engage audiences through thoughtful visual communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => scrollToSection('work')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View My Work <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:text-white rounded-lg font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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
        <section id="work" className="py-20 bg-[#f8fafc] dark:bg-[#1a1a1a]" aria-label="Featured work portfolio">
          <div className="max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
                Featured Work
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-[#64748b] dark:text-[#a3a3a3] max-w-3xl mx-auto">
                A selection of projects that showcase my approach to solving design challenges and creating meaningful visual experiences.
              </motion.p>
            </motion.div>

            {/* Auto-scrolling carousel */}
            <div className="relative overflow-hidden">
              <motion.div
                className="flex gap-8"
                animate={{
                  x: ["-0%", "-50%"]
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 8,
                    ease: "linear"
                  }
                }}
              >
                {/* First set of projects */}
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    className="group bg-white dark:bg-[#0a0a0a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 w-[280px] flex-shrink-0"
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-medium">{project.category}</p>
                      </div>
                    </div>
                    <div className="p-4">
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
                      <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        View Project <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {/* Duplicate set for seamless loop */}
                {projects.map((project) => (
                  <motion.div
                    key={`${project.id}-duplicate`}
                    className="group bg-white dark:bg-[#0a0a0a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 w-[280px] flex-shrink-0"
                    whileHover={{ y: -10, scale: 1.02 }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-sm font-medium">{project.category}</p>
                      </div>
                    </div>
                    <div className="p-4">
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
                      <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                        View Project <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
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
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 p-8 bg-white dark:bg-[#0a0a0a] rounded-2xl"
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
        <section id="services" className="py-20" aria-label="Services offered">
          <div className="max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
                Services
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="p-6 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 group"
                  whileHover={{ y: -5 }}
                >
                  <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-[#64748b] dark:text-[#a3a3a3]">{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-[#f8fafc] dark:bg-[#1a1a1a]" aria-label="About the designer">
          <div className="max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&crop=face"
                    alt="Designer Portrait"
                    className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-20 blur-lg"></div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">About Me</h2>
                <p className="text-lg text-[#64748b] dark:text-[#a3a3a3] mb-6">
                  I'm a passionate graphic designer with over 5 years of experience creating visual solutions that connect brands with their audiences. My approach combines strategic thinking with creative execution to deliver designs that not only look great but also achieve business objectives.
                </p>
                <p className="text-lg text-[#64748b] dark:text-[#a3a3a3] mb-8">
                  I believe in the power of collaboration and always strive to understand the unique challenges and goals of each project. Whether it's developing a complete brand identity or designing digital experiences, I'm committed to delivering work that exceeds expectations.
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

                <motion.button
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-5 h-5" />
                  Download Resume
                </motion.button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 bg-[#0a0a0a] text-white" aria-label="Contact information and form">
          <div className="max-w-none mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
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
                      <a href="tel:+1234567890" className="text-[#a3a3a3] hover:text-white transition-colors">
                        +1 (234) 567-890
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-[#a3a3a3]">San Francisco, CA</p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="mt-8">
                  <h4 className="text-lg font-medium mb-4">Follow Me</h4>
                  <div className="flex gap-4">
                    {[
                      { name: 'GitHub', href: '#', icon: '🐙' },
                      { name: 'LinkedIn', href: '#', icon: '💼' },
                      { name: 'Instagram', href: '#', icon: '📸' }
                    ].map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        className="w-10 h-10 bg-[#1a1a1a] hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] text-lg"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Follow on ${social.name}`}
                      >
                        {social.icon}
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
                  © 2024 Flexivo. All rights reserved.
                </p>
                <div className="flex items-center gap-6">
                  <p className="text-[#a3a3a3] text-sm">
                    Available for projects • Response within 24h
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