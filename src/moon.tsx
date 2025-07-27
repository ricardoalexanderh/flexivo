import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { ArrowLeft } from 'lucide-react';

interface MoonProps {
  onBack: () => void;
}

const Moon: React.FC<MoonProps> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [distance, setDistance] = useState(0);
  const [position, setPosition] = useState({ x: 0, z: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Global variables
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let moon: THREE.Mesh, astronaut: THREE.Group, flag: THREE.Group;
    const joystick = { x: 0, y: 0, active: false };
    let mouseX = 0, mouseY = 0;
    const cameraTarget = new THREE.Vector3();
    const isMobile = window.innerWidth <= 768;
    
    // Astronaut movement
    const astronautSpeed = isMobile ? 0.015 : 0.02;
    const astronautPosition = { x: 0, z: 0 };
    const flagPosition = { x: 3, z: -3 };
    let isNearFlag = false;
    let wasNearFlag = false;
    let animationId: number;
    let cameraRotationX = 0, cameraRotationY = 0;

    const init = () => {
      // Scene setup
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000011, 10, 50);

      // Camera setup
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      // Better camera positioning for mobile vs desktop
      if (isMobile) {
        camera.position.set(0, 4, 6); // Higher and further back for mobile
        camera.lookAt(0, 0, 0); // Look at center/astronaut
      } else {
        camera.position.set(0, 3, 5);
      }

      // Renderer setup
      renderer = new THREE.WebGLRenderer({ 
        antialias: !isMobile,
        powerPreference: isMobile ? "low-power" : "high-performance"
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000011);
      renderer.shadowMap.enabled = !isMobile;
      if (!isMobile) {
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }
      
      container.appendChild(renderer.domElement);

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    const addStars = () => {
      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: isMobile ? 1 : 2 });

      const starsVertices = [];
      const starCount = isMobile ? 500 : 1000;
      for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
      }

      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
    };

    const addLighting = () => {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);

      // Main directional light (sun)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 5);
      if (!isMobile) {
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
      }
      scene.add(directionalLight);

      // Moon surface lighting
      const moonLight = new THREE.PointLight(0xaaaaff, 0.5, 20);
      moonLight.position.set(0, 2, 0);
      scene.add(moonLight);
    };

    const createMoon = () => {
      // Flat moon surface for proper astronaut positioning
      const moonGeometry = new THREE.PlaneGeometry(40, 40);
      
      // Keep the geometry flat - no height variations
      // This ensures the astronaut always stands on level ground at y=0

      // More realistic moon material with texture-like appearance
      const moonMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xa0a0a0, // Slightly darker, more realistic moon color
        wireframe: false
      });

      moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.rotation.x = -Math.PI / 2;
      moon.position.y = 0; // Ensure surface is at ground level
      if (!isMobile) {
        moon.receiveShadow = true;
      }
      scene.add(moon);

      // Add realistic craters on flat surface
      const craterCount = isMobile ? 6 : 12;
      for (let i = 0; i < craterCount; i++) {
        // Outer crater rim
        const craterGeometry = new THREE.RingGeometry(0.4, 0.8, 16);
        const craterMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x909090,
          transparent: true,
          opacity: 0.6 
        });
        const crater = new THREE.Mesh(craterGeometry, craterMaterial);
        crater.position.set(
          (Math.random() - 0.5) * 30,
          0.001, // Very slightly above surface
          (Math.random() - 0.5) * 30
        );
        crater.rotation.x = -Math.PI / 2;
        scene.add(crater);

        // Inner crater depression
        const innerCraterGeometry = new THREE.CircleGeometry(0.3, 12);
        const innerCraterMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x808080,
          transparent: true,
          opacity: 0.7 
        });
        const innerCrater = new THREE.Mesh(innerCraterGeometry, innerCraterMaterial);
        innerCrater.position.set(
          crater.position.x,
          0.0005, // Slightly below outer crater
          crater.position.z
        );
        innerCrater.rotation.x = -Math.PI / 2;
        scene.add(innerCrater);
      }

      // Add some moon rocks/boulders
      const rockCount = isMobile ? 8 : 16;
      for (let i = 0; i < rockCount; i++) {
        const rockSize = 0.1 + Math.random() * 0.2;
        const rockGeometry = new THREE.SphereGeometry(
          rockSize, 
          6, 
          6
        );
        const rockMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x808080 
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        
        // Position rocks properly on the flat surface
        rock.position.set(
          (Math.random() - 0.5) * 35,
          rockSize * 0.5, // Half the rock sits on surface, half below
          (Math.random() - 0.5) * 35
        );
        rock.scale.set(
          1 + Math.random() * 0.5,
          0.5 + Math.random() * 0.3,
          1 + Math.random() * 0.5
        );
        if (!isMobile) rock.castShadow = true;
        scene.add(rock);
      }
    };

    const createAstronaut = () => {
      const group = new THREE.Group();

      // Main body
      const bodyGeometry = new THREE.CylinderGeometry(0.35, 0.3, 1.0, 12);
      const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xf8f8f8 });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 1.0;
      if (!isMobile) body.castShadow = true;
      group.add(body);

      // Helmet
      const helmetGeometry = new THREE.SphereGeometry(0.28, 16, 16);
      const helmetMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x222222,
        transparent: true,
        opacity: 0.85 
      });
      const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
      helmet.position.y = 1.65;
      if (!isMobile) helmet.castShadow = true;
      group.add(helmet);

      // Arms
      const armGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8);
      const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
      leftArm.position.set(-0.45, 1.1, 0);
      leftArm.rotation.z = 0.2;
      if (!isMobile) leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
      rightArm.position.set(0.45, 1.1, 0);
      rightArm.rotation.z = -0.2;
      if (!isMobile) rightArm.castShadow = true;
      group.add(rightArm);

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.1, 0.14, 0.8, 8);
      const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
      leftLeg.position.set(-0.18, 0.4, 0);
      if (!isMobile) leftLeg.castShadow = true;
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
      rightLeg.position.set(0.18, 0.4, 0);
      if (!isMobile) rightLeg.castShadow = true;
      group.add(rightLeg);

      // Boots/feet on the ground
      const bootGeometry = new THREE.BoxGeometry(0.18, 0.12, 0.3);
      const bootMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
      leftBoot.position.set(-0.18, 0.06, 0.05); // On ground level
      if (!isMobile) leftBoot.castShadow = true;
      group.add(leftBoot);

      const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
      rightBoot.position.set(0.18, 0.06, 0.05); // On ground level
      if (!isMobile) rightBoot.castShadow = true;
      group.add(rightBoot);

      astronaut = group;
      astronaut.position.set(0, 0, 0);
      scene.add(astronaut);
    };

    const createFlag = () => {
      const group = new THREE.Group();

      // Flag base (buried in ground)
      const baseGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.3, 12);
      const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = -0.05; // Partially buried
      if (!isMobile) base.castShadow = true;
      group.add(base);

      // Flag pole (from ground up)
      const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2.5, 8);
      const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 1.25; // Half of pole height to sit on ground
      if (!isMobile) pole.castShadow = true;
      group.add(pole);

      // Flag with Flexivo logo
      const flagGeometry = new THREE.PlaneGeometry(1.2, 0.8);
      
      // Create canvas for flag texture with Flexivo logo
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;
      
      canvas.width = 512;
      canvas.height = 342; // Maintain aspect ratio (1.2:0.8 = 512:342)
      
      // Flag background - Flexivo brand color
      context.fillStyle = '#4f46e5';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Load and draw Flexivo logo
      const img = new Image();
      img.onload = () => {
        // Center the logo on the flag
        const logoWidth = 300;
        const logoHeight = 80;
        const x = (canvas.width - logoWidth) / 2;
        const y = (canvas.height - logoHeight) / 2;
        
        context.drawImage(img, x, y, logoWidth, logoHeight);
        
        // Update texture
        const texture = new THREE.CanvasTexture(canvas);
        flagMaterial.map = texture;
        flagMaterial.needsUpdate = true;
      };
      img.src = '/logo-white.png';
      
      const flagMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
      });
      
      const flagMesh = new THREE.Mesh(flagGeometry, flagMaterial);
      flagMesh.position.set(0.6, 2, 0);
      if (!isMobile) flagMesh.castShadow = true;
      group.add(flagMesh);

      flag = group;
      flag.position.set(flagPosition.x, 0, flagPosition.z);
      scene.add(flag);
    };

    const getDistanceToFlag = () => {
      return Math.sqrt(
        Math.pow(astronautPosition.x - flagPosition.x, 2) +
        Math.pow(astronautPosition.z - flagPosition.z, 2)
      );
    };

    const updateAstronaut = () => {
      if (joystick.active) {
        // Move astronaut based on joystick
        astronautPosition.x += joystick.x * astronautSpeed;
        astronautPosition.z += joystick.y * astronautSpeed;

        // Keep astronaut on the moon surface
        astronautPosition.x = Math.max(-18, Math.min(18, astronautPosition.x));
        astronautPosition.z = Math.max(-18, Math.min(18, astronautPosition.z));

        astronaut.position.x = astronautPosition.x;
        astronaut.position.z = astronautPosition.z;

        // Rotate astronaut in movement direction
        if (joystick.x !== 0 || joystick.y !== 0) {
          const angle = Math.atan2(joystick.x, joystick.y);
          astronaut.rotation.y = angle;
        }

        // Walking animation - astronaut feet on surface
        const walkCycle = Date.now() * 0.015;
        astronaut.position.y = Math.sin(walkCycle) * 0.03; // Reduced bounce, feet on ground
      } else {
        // Idle breathing animation - astronaut feet on surface
        astronaut.position.y = Math.sin(Date.now() * 0.003) * 0.015; // Subtle breathing, feet on ground
      }

      // Check flag proximity - allow multiple visits
      const flagDistance = getDistanceToFlag();
      isNearFlag = flagDistance < 1.5;
      
      // Show popup when entering flag area (not when already there)
      if (isNearFlag && !wasNearFlag) {
        setShowPopup(true);
      }
      
      // Update previous state
      wasNearFlag = isNearFlag;

      // Update UI state
      setDistance(flagDistance);
      setPosition({ x: astronautPosition.x, z: astronautPosition.z });
    };

    const updateCamera = () => {
      // Follow astronaut with camera
      const targetX = astronautPosition.x;
      const targetZ = astronautPosition.z + (isMobile ? 6 : 5);
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.z += (targetZ - camera.position.z) * 0.05;

      if (isMobile) {
        // Touch-based camera rotation for mobile - more centered view
        cameraTarget.x = astronautPosition.x + Math.sin(cameraRotationY) * 2;
        cameraTarget.y = 1.2 + cameraRotationX * 1.5;
        cameraTarget.z = astronautPosition.z + Math.cos(cameraRotationY) * 2;
      } else {
        // Mouse look around for desktop
        cameraTarget.x = astronautPosition.x + mouseX * 2;
        cameraTarget.y = 1.5;
        cameraTarget.z = astronautPosition.z + mouseY * 2;
      }
      
      camera.lookAt(cameraTarget);
    };

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      updateAstronaut();
      updateCamera();

      // Animate flag waving
      if (flag) {
        const time = Date.now() * 0.003;
        flag.children[1].rotation.y = Math.sin(time) * 0.1;
      }

      renderer.render(scene, camera);
    };

    // Initialize everything
    const cleanup = init();
    addStars();
    addLighting();
    createMoon();
    createAstronaut();
    createFlag();

    // Setup joystick controls
    const setupJoystick = () => {
      const joystickBase = document.getElementById('joystick-base');
      const joystickKnob = document.getElementById('joystick-knob');
      
      if (!joystickBase || !joystickKnob) return;
      
      let isDragging = false;
      const getBaseRect = () => joystickBase.getBoundingClientRect();
      
      const getBaseCenter = () => {
        const rect = getBaseRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      };

      const startDrag = () => {
        isDragging = true;
        joystick.active = true;
      };

      const drag = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const baseCenter = getBaseCenter();
        const deltaX = clientX - baseCenter.x;
        const deltaY = clientY - baseCenter.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = isMobile ? 32 : 40;

        if (distance <= maxDistance) {
          joystick.x = deltaX / maxDistance;
          joystick.y = deltaY / maxDistance;
          joystickKnob.style.transform = `translate(${deltaX - (isMobile ? 17.5 : 20)}px, ${deltaY - (isMobile ? 17.5 : 20)}px)`;
        } else {
          const angle = Math.atan2(deltaY, deltaX);
          const limitedX = Math.cos(angle) * maxDistance;
          const limitedY = Math.sin(angle) * maxDistance;
          joystick.x = limitedX / maxDistance;
          joystick.y = limitedY / maxDistance;
          joystickKnob.style.transform = `translate(${limitedX - (isMobile ? 17.5 : 20)}px, ${limitedY - (isMobile ? 17.5 : 20)}px)`;
        }
      };

      const endDrag = () => {
        isDragging = false;
        joystick.active = false;
        joystick.x = 0;
        joystick.y = 0;
        joystickKnob.style.transform = `translate(${isMobile ? -17.5 : -20}px, ${isMobile ? -17.5 : -20}px)`;
      };

      // Mouse events
      joystickKnob.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startDrag();
      });

      document.addEventListener('mousemove', (e) => {
        drag(e.clientX, e.clientY);
      });

      document.addEventListener('mouseup', endDrag);

      // Touch events for mobile
      joystickKnob.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrag();
      });

      document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        drag(touch.clientX, touch.clientY);
      });

      document.addEventListener('touchend', (e) => {
        e.preventDefault();
        endDrag();
      });
    };

    // Setup controls
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Mobile touch controls for camera
    let touchStartX = 0, touchStartY = 0;
    const handleTouchStart = (event: TouchEvent) => {
      // Prevent scrolling and pull-to-refresh
      event.preventDefault();
      
      if (event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Prevent scrolling and pull-to-refresh during camera control
      event.preventDefault();
      
      // Don't handle touch if popup is open
      if (showPopup) return;
      
      if (event.touches.length === 1) {
        const deltaX = event.touches[0].clientX - touchStartX;
        const deltaY = event.touches[0].clientY - touchStartY;
        
        cameraRotationY += deltaX * 0.005;
        cameraRotationX += deltaY * 0.005;
        
        cameraRotationX = Math.max(-0.5, Math.min(0.5, cameraRotationX));
        
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      }
    };

    if (!isMobile) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    // Setup joystick after a short delay to ensure DOM elements exist
    setTimeout(setupJoystick, 100);

    // Setup mobile touch controls after renderer is ready
    setTimeout(() => {
      if (isMobile && renderer) {
        renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
        renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      }
    }, 200);

    // Prevent document-level scrolling and pull-to-refresh
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    document.addEventListener('touchstart', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('touchend', preventScroll, { passive: false });

    setIsLoading(false);
    animate();

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (!isMobile) {
        document.removeEventListener('mousemove', handleMouseMove);
      } else {
        renderer?.domElement.removeEventListener('touchstart', handleTouchStart);
        renderer?.domElement.removeEventListener('touchmove', handleTouchMove);
      }
      
      // Remove document-level scroll prevention
      document.removeEventListener('touchstart', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('touchend', preventScroll);
      
      if (cleanup) cleanup();
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [showPopup]);

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-b from-[#000011] to-[#000033] overflow-hidden"
      style={{ 
        touchAction: 'none',
        overscrollBehavior: 'none',
        WebkitOverflowScrolling: 'auto'
      }}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        onTouchEnd={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBack();
        }}
        className="absolute top-4 left-4 z-50 p-3 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        style={{ touchAction: 'manipulation' }}
        aria-label="Back to portfolio"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-40">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-inter">Loading Moon Experience...</p>
          </div>
        </div>
      )}

      {/* Hero Title and Description */}
      {!isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center text-white pointer-events-none">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 font-inter tracking-tight"
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Creative Designer
            </span>
            <br />            
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-inter"
          >
            Crafting immersive digital experiences through innovative design and cutting-edge technology
          </motion.p>
        </div>
      )}

      {/* Info Panel */}
      {!isLoading && (
        <div className="absolute top-4 right-4 z-30 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white max-w-xs">
          <h2 className="text-lg font-bold mb-2 font-inter">The Moon 🌙</h2>
          <p className="text-sm">Distance to flag: {distance.toFixed(1)}m</p>
          <p className="text-sm">Position: {position.x.toFixed(1)}, {position.z.toFixed(1)}</p>
        </div>
      )}

      {/* Instructions */}
      {!isLoading && (
        <div className="absolute bottom-4 left-4 z-30 bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3 text-white max-w-xs">          
          {!window.innerWidth || window.innerWidth <= 768 ? (
            <p className="text-sm">👆 Tap screen to look around</p>
          ) : (
            <p className="text-sm">🖱️ Move mouse to look around</p>
          )}
          <p className="text-sm">🚀 Use joystick to move</p>
          <p className="text-sm">🚩 Visit the flag to see portfolio</p>
        </div>
      )}

      {/* Joystick */}
      {!isLoading && (
        <div 
          id="joystick-container" 
          className="absolute bottom-8 right-8 w-24 h-24 md:w-28 md:h-28 z-30"
          style={{ touchAction: 'none' }}
        >
          <div 
            id="joystick-base"
            className="w-full h-full rounded-full bg-gradient-to-br from-white/15 to-white/5 border-2 border-white/40 backdrop-blur-md shadow-lg relative"
          >
            <div 
              id="joystick-knob"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-white to-gray-300 absolute top-1/2 left-1/2 cursor-pointer shadow-md border-2 border-white/90 transition-all duration-100"
              style={{ 
                transform: 'translate(-50%, -50%)',
                touchAction: 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Portfolio Popup */}
      {showPopup && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50"
          style={{ touchAction: 'none' }}
        >
          <div 
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/30 rounded-xl p-8 max-w-md mx-4 text-white text-center transform perspective-1000 rotate-x-10 rotate-y-5"
            style={{ touchAction: 'auto' }}
          >
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-inter">
              🚀 Welcome to Flexivo
            </h2>
            <div className="mb-6">
              <p className="mb-4 font-inter">
                <strong>Creative Designer & Developer</strong>
              </p>
              <p className="text-sm mb-4 font-inter">
                Passionate about creating immersive digital experiences with cutting-edge design and technology.
              </p>
              <div className="space-y-2 text-left">
                <div>
                  <span className="text-sm font-inter">Design</span>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full w-11/12"></div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-inter">Development</span>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full w-10/12"></div>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-inter">3D/Motion</span>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-1">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full w-9/12"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-center">
              <button
                onClick={onBack}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBack();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                View Portfolio
              </button>
              <button
                onClick={() => setShowPopup(false)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPopup(false);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white/20 border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 font-inter touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default Moon;