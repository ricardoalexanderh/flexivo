import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { ArrowLeft, X } from 'lucide-react';

interface MoonProps {
  onBack: () => void;
}

// Featured work data for 3D gallery
const galleryProjects = [
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

const Moon: React.FC<MoonProps> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [distance, setDistance] = useState(0);
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [selectedProject, setSelectedProject] = useState<typeof galleryProjects[0] | null>(null);
  const [nearGalleryItem, setNearGalleryItem] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Global variables
    let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
    let moon: THREE.Mesh, astronaut: THREE.Group, flag: THREE.Group;
    const galleryFrames: THREE.Group[] = [];
    let blinkingStars: THREE.Group;
    const joystick = { x: 0, y: 0, active: false };
    const cameraTarget = new THREE.Vector3();
    const isMobile = window.innerWidth <= 768;
    
    // Camera control variables
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;
    let cameraRotationX = 0, cameraRotationY = 0;
    const cameraRotationSpeed = isMobile ? 0.005 : 0.008;
    
    // Astronaut movement
    const astronautSpeed = isMobile ? 0.03 : 0.04;
    const astronautPosition = { x: 0, z: 0 };
    const flagPosition = { x: 3, z: -3 };
    let isNearFlag = false;
    let wasNearFlag = false;
    let animationId: number;

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
      
      // Enable shadows for better visual quality
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
      
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
      const starCount = isMobile ? 100 : 200;
      const starsGroup = new THREE.Group();

      // Create visible stars positioned correctly
      for (let i = 0; i < starCount; i++) {
        // Position stars much closer and in visible range
        const x = (Math.random() - 0.5) * 200; // Spread across X
        const y = 30 + Math.random() * 100; // Above the moon surface, within visible range
        const z = (Math.random() - 0.5) * 200; // Spread across Z

        // Create larger, more visible stars
        const starGeometry = new THREE.SphereGeometry(0.2, 6, 6);
        const starMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff,
          transparent: false, // Make them solid for better visibility
          fog: false // Don't let fog affect the stars
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(x, y, z);
        
        // Store blinking properties
        (star as any).blinkSpeed = 0.5 + Math.random() * 2;
        (star as any).blinkPhase = Math.random() * Math.PI * 2;
        (star as any).baseOpacity = 1.0;
        
        starsGroup.add(star);
      }

      scene.add(starsGroup);
      console.log(`Added ${starCount} stars to the scene`); // Debug log
      
      // Store for blinking animation
      (starsGroup as any).isBlinkingStars = true;
      
      return starsGroup;
    };

    const addLighting = () => {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
      scene.add(ambientLight);

      // Main directional light (sun)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      
      // Shadow camera settings
      directionalLight.shadow.mapSize.width = isMobile ? 512 : 1024;
      directionalLight.shadow.mapSize.height = isMobile ? 512 : 1024;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      directionalLight.shadow.camera.left = -20;
      directionalLight.shadow.camera.right = 20;
      directionalLight.shadow.camera.top = 20;
      directionalLight.shadow.camera.bottom = -20;
      
      scene.add(directionalLight);

      // Moon surface lighting
      const moonLight = new THREE.PointLight(0xaaaaff, 0.5, 20);
      moonLight.position.set(0, 2, 0);
      scene.add(moonLight);

      // Additional lighting for gallery visibility
      const galleryLight = new THREE.PointLight(0xffffff, 0.8, 30);
      galleryLight.position.set(0, 8, 0); // High up to illuminate gallery
      scene.add(galleryLight);
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
      moon.receiveShadow = true; // Always receive shadows
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
        rock.castShadow = true; // Always cast shadow
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
      body.castShadow = true; // Always cast shadow
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
      helmet.castShadow = true; // Always cast shadow
      group.add(helmet);

      // Arms
      const armGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.7, 8);
      const leftArm = new THREE.Mesh(armGeometry, bodyMaterial);
      leftArm.position.set(-0.45, 1.1, 0);
      leftArm.rotation.z = 0.2;
      leftArm.castShadow = true; // Always cast shadow
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeometry, bodyMaterial);
      rightArm.position.set(0.45, 1.1, 0);
      rightArm.rotation.z = -0.2;
      rightArm.castShadow = true; // Always cast shadow
      group.add(rightArm);

      // Legs
      const legGeometry = new THREE.CylinderGeometry(0.1, 0.14, 0.8, 8);
      const leftLeg = new THREE.Mesh(legGeometry, bodyMaterial);
      leftLeg.position.set(-0.18, 0.4, 0);
      leftLeg.castShadow = true; // Always cast shadow
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeometry, bodyMaterial);
      rightLeg.position.set(0.18, 0.4, 0);
      rightLeg.castShadow = true; // Always cast shadow
      group.add(rightLeg);

      // Boots/feet on the ground
      const bootGeometry = new THREE.BoxGeometry(0.18, 0.12, 0.3);
      const bootMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const leftBoot = new THREE.Mesh(bootGeometry, bootMaterial);
      leftBoot.position.set(-0.18, 0.06, 0.05); // On ground level
      leftBoot.castShadow = true; // Always cast shadow
      group.add(leftBoot);

      const rightBoot = new THREE.Mesh(bootGeometry, bootMaterial);
      rightBoot.position.set(0.18, 0.06, 0.05); // On ground level
      rightBoot.castShadow = true; // Always cast shadow
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
      base.castShadow = true; // Always cast shadow
      group.add(base);

      // Flag pole (from ground up)
      const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2.5, 8);
      const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 1.25; // Half of pole height to sit on ground
      pole.castShadow = true; // Always cast shadow
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
      flagMesh.castShadow = true; // Always cast shadow
      group.add(flagMesh);

      flag = group;
      flag.position.set(flagPosition.x, 0, flagPosition.z);
      scene.add(flag);
    };

    const createGallery = () => {
      const radius = 12; // Distance from center
      const height = 2; // Reachable height for astronaut (astronaut is ~1.8 units tall)
      
      galleryProjects.forEach((project, index) => {
        const angle = (index / galleryProjects.length) * Math.PI * 2;
        const group = new THREE.Group();
        
        // Frame background
        const frameGeometry = new THREE.PlaneGeometry(2.4, 1.8);
        const frameMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x2a2a2a,
          transparent: true,
          opacity: 0.9
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        group.add(frame);
        
        // Frame border
        const borderGeometry = new THREE.PlaneGeometry(2.6, 2.0);
        const borderMaterial = new THREE.MeshLambertMaterial({ 
          color: 0x4f46e5,
          transparent: true,
          opacity: 0.8
        });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.position.z = -0.01; // Slightly behind frame
        group.add(border);
        
        // Load project image
        const loader = new THREE.TextureLoader();
        loader.load(project.image, (texture) => {
          const imageGeometry = new THREE.PlaneGeometry(2.2, 1.6);
          // Use MeshBasicMaterial for consistent brightness, unaffected by lighting
          const imageMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.95
          });
          const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
          imageMesh.position.z = 0.01; // Slightly in front of frame
          group.add(imageMesh);
        });
        
        // Position gallery item
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        group.position.set(x, height, z);
        
        // Face towards center
        group.lookAt(0, height, 0);
        
        // Store reference
        galleryFrames.push(group);
        scene.add(group);
      });
    };

    const getDistanceToFlag = () => {
      return Math.sqrt(
        Math.pow(astronautPosition.x - flagPosition.x, 2) +
        Math.pow(astronautPosition.z - flagPosition.z, 2)
      );
    };

    const getDistanceToGalleryItem = (index: number) => {
      const angle = (index / galleryProjects.length) * Math.PI * 2;
      const radius = 12;
      const galleryX = Math.cos(angle) * radius;
      const galleryZ = Math.sin(angle) * radius;
      
      return Math.sqrt(
        Math.pow(astronautPosition.x - galleryX, 2) +
        Math.pow(astronautPosition.z - galleryZ, 2)
      );
    };

    const updateAstronaut = () => {
      if (joystick.active) {
        // Transform joystick input based on camera rotation for intuitive movement
        // Corrected coordinate transformation to align with camera direction
        const cameraForwardX = Math.cos(cameraRotationY);
        const cameraForwardZ = Math.sin(cameraRotationY);
        const cameraRightX = Math.sin(cameraRotationY);  // Fixed: removed negative sign
        const cameraRightZ = -Math.cos(cameraRotationY); // Fixed: added negative sign
        
        // Apply joystick input relative to camera orientation
        // joystick.y (forward/back) moves along camera forward direction
        // joystick.x (left/right) moves along camera right direction
        const transformedX = (joystick.y * cameraForwardX) + (joystick.x * cameraRightX);
        const transformedZ = (joystick.y * cameraForwardZ) + (joystick.x * cameraRightZ);
        
        // Move astronaut based on camera-aligned joystick input
        astronautPosition.x += transformedX * astronautSpeed;
        astronautPosition.z += transformedZ * astronautSpeed;

        // Keep astronaut on the moon surface
        astronautPosition.x = Math.max(-18, Math.min(18, astronautPosition.x));
        astronautPosition.z = Math.max(-18, Math.min(18, astronautPosition.z));

        astronaut.position.x = astronautPosition.x;
        astronaut.position.z = astronautPosition.z;

        // Rotate astronaut in movement direction (based on world coordinates)
        if (transformedX !== 0 || transformedZ !== 0) {
          const angle = Math.atan2(transformedX, transformedZ);
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

      // Check gallery proximity
      let nearestGalleryIndex = null;
      let nearestDistance = Infinity;
      
      for (let i = 0; i < galleryProjects.length; i++) {
        const distance = getDistanceToGalleryItem(i);
        if (distance < 3 && distance < nearestDistance) {
          nearestDistance = distance;
          nearestGalleryIndex = i;
        }
      }
      
      setNearGalleryItem(nearestGalleryIndex);

      // Update UI state
      setDistance(flagDistance);
      setPosition({ x: astronautPosition.x, z: astronautPosition.z });
    };

    const updateCamera = () => {
      // True orbital camera that can rotate 360 degrees around astronaut
      const followDistance = isMobile ? 6 : 5;
      const baseHeight = 3;
      
      // Calculate orbital position around astronaut
      // Note: Using negative sin for Z to match Three.js coordinate system
      const targetX = astronautPosition.x + Math.cos(cameraRotationY) * followDistance;
      const targetZ = astronautPosition.z + Math.sin(cameraRotationY) * followDistance;
      const targetY = baseHeight + (cameraRotationX * 3); // Vertical offset based on vertical rotation
      
      // Smooth camera movement
      camera.position.x += (targetX - camera.position.x) * 0.08;
      camera.position.z += (targetZ - camera.position.z) * 0.08;
      camera.position.y += (targetY - camera.position.y) * 0.08;

      // Always look at the astronaut
      cameraTarget.set(astronautPosition.x, 1.5, astronautPosition.z);
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

      // Animate gallery frames
      galleryFrames.forEach((frame, index) => {
        const time = Date.now() * 0.001;
        const baseY = 2; // Match the reachable height
        const floatAmount = Math.sin(time + index * 0.5) * 0.1; // Reduced float for reachability
        frame.position.y = baseY + floatAmount;
        
        // Keep frames facing center instead of rotating
        frame.lookAt(0, baseY + floatAmount, 0);
        
        // Glow effect when near
        if (nearGalleryItem === index) {
          const glowIntensity = 1 + Math.sin(time * 3) * 0.3;
          frame.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
              if (child === frame.children[1]) { // Border
                child.material.opacity = 0.8 * glowIntensity;
              }
            }
          });
        } else {
          frame.children.forEach((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
              if (child === frame.children[1]) { // Border
                child.material.opacity = 0.6;
              }
            }
          });
        }
      });

      // Animate blinking stars
      if (blinkingStars && (blinkingStars as any).isBlinkingStars) {
        const time = Date.now() * 0.001;
        
        // Animate each star individually
        blinkingStars.children.forEach((star) => {
          const mesh = star as THREE.Mesh;
          const material = mesh.material as THREE.MeshBasicMaterial;
          const blinkSpeed = (star as any).blinkSpeed;
          const blinkPhase = (star as any).blinkPhase;
          
          // Create individual twinkling effect by changing scale
          const blink = Math.sin(time * blinkSpeed + blinkPhase) * 0.3 + 0.7;
          mesh.scale.setScalar(blink);
          
          // Also vary the color intensity
          const intensity = Math.sin(time * blinkSpeed * 0.8 + blinkPhase) * 0.2 + 0.8;
          material.color.setRGB(intensity, intensity, intensity);
        });
      }

      renderer.render(scene, camera);
    };

    // Initialize everything
    const cleanup = init();
    blinkingStars = addStars();
    addLighting();
    createMoon();
    createAstronaut();
    createFlag();
    createGallery();

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

        // Calculate proper knob offset (half of knob size)
        const knobOffset = isMobile ? 16 : 20; // 32px/2 for mobile, 40px/2 for desktop
        
        if (distance <= maxDistance) {
          // Full 360-degree joystick movement
          joystick.x = deltaX / maxDistance;
          joystick.y = deltaY / maxDistance;
          joystickKnob.style.transform = `translate(${deltaX - knobOffset}px, ${deltaY - knobOffset}px)`;
        } else {
          // Clamp to circle edge but maintain full 360-degree direction
          const angle = Math.atan2(deltaY, deltaX);
          const limitedX = Math.cos(angle) * maxDistance;
          const limitedY = Math.sin(angle) * maxDistance;
          joystick.x = limitedX / maxDistance;
          joystick.y = limitedY / maxDistance;
          joystickKnob.style.transform = `translate(${limitedX - knobOffset}px, ${limitedY - knobOffset}px)`;
        }
      };

      const endDrag = () => {
        isDragging = false;
        joystick.active = false;
        joystick.x = 0;
        joystick.y = 0;
        // Reset to center using proper knob offset
        const knobOffset = isMobile ? 16 : 20;
        joystickKnob.style.transform = `translate(${-knobOffset}px, ${-knobOffset}px)`;
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

    // Setup drag controls for camera
    const setupCameraControls = () => {
      if (!renderer || !renderer.domElement) return;

      // Mouse controls for desktop
      const handleMouseDown = (event: MouseEvent) => {
        if (event.button === 0) { // Left mouse button
          isDragging = true;
          previousMouseX = event.clientX;
          previousMouseY = event.clientY;
          renderer.domElement.style.cursor = 'grabbing';
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (isDragging) {
          const deltaX = event.clientX - previousMouseX;
          const deltaY = event.clientY - previousMouseY;
          
          // Reverse X for more intuitive camera control (drag left = rotate left)
          cameraRotationY -= deltaX * cameraRotationSpeed;
          cameraRotationX -= deltaY * cameraRotationSpeed;
          
          // Limit vertical rotation to prevent flipping
          cameraRotationX = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, cameraRotationX));
          
          previousMouseX = event.clientX;
          previousMouseY = event.clientY;
        }
      };

      const handleMouseUp = () => {
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
      };

      // Touch controls for mobile
      const handleTouchStart = (event: TouchEvent) => {
        event.preventDefault();
        if (event.touches.length === 1 && !showPopup && !selectedProject) {
          isDragging = true;
          previousMouseX = event.touches[0].clientX;
          previousMouseY = event.touches[0].clientY;
        }
      };

      const handleTouchMove = (event: TouchEvent) => {
        event.preventDefault();
        if (isDragging && event.touches.length === 1 && !showPopup && !selectedProject) {
          const deltaX = event.touches[0].clientX - previousMouseX;
          const deltaY = event.touches[0].clientY - previousMouseY;
          
          // Reverse X for more intuitive camera control (drag left = rotate left)
          cameraRotationY -= deltaX * cameraRotationSpeed;
          cameraRotationX -= deltaY * cameraRotationSpeed;
          
          // Limit vertical rotation to prevent flipping
          cameraRotationX = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, cameraRotationX));
          
          previousMouseX = event.touches[0].clientX;
          previousMouseY = event.touches[0].clientY;
        }
      };

      const handleTouchEnd = (event: TouchEvent) => {
        event.preventDefault();
        isDragging = false;
      };

      // Add event listeners
      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      renderer.domElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      renderer.domElement.addEventListener('touchmove', handleTouchMove, { passive: false });
      renderer.domElement.addEventListener('touchend', handleTouchEnd, { passive: false });

      // Set initial cursor
      renderer.domElement.style.cursor = 'grab';

      // Return cleanup function
      return () => {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        renderer.domElement.removeEventListener('touchstart', handleTouchStart);
        renderer.domElement.removeEventListener('touchmove', handleTouchMove);
        renderer.domElement.removeEventListener('touchend', handleTouchEnd);
      };
    };

    // Setup joystick after a short delay to ensure DOM elements exist
    setTimeout(setupJoystick, 100);

    // Setup camera controls after renderer is ready
    let cameraControlsCleanup: (() => void) | undefined;
    setTimeout(() => {
      if (renderer) {
        cameraControlsCleanup = setupCameraControls();
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
      
      // Cleanup camera controls
      if (cameraControlsCleanup) {
        cameraControlsCleanup();
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
            <p className="text-sm">👆 Drag to look around</p>
          ) : (
            <p className="text-sm">🖱️ Click & drag to look around</p>
          )}
          <p className="text-sm">🚀 Use joystick to move</p>
          <p className="text-sm">🚩 Visit the flag to see portfolio</p>
          <p className="text-sm">🖼️ Approach floating frames to view work</p>
        </div>
      )}

      {/* Gallery Item Preview */}
      {!isLoading && nearGalleryItem !== null && (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-30 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white max-w-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-400 font-medium">
              {galleryProjects[nearGalleryItem].category}
            </span>
            <button
              onClick={() => setSelectedProject(galleryProjects[nearGalleryItem])}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedProject(galleryProjects[nearGalleryItem]);
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              View
            </button>
          </div>
          <h3 className="text-sm font-semibold mb-1">
            {galleryProjects[nearGalleryItem].title}
          </h3>
          <p className="text-xs text-gray-300 line-clamp-2">
            {galleryProjects[nearGalleryItem].description}
          </p>
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

      {/* Project Popup */}
      {selectedProject && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-50"
          style={{ touchAction: 'none' }}
        >
          <div 
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-2 border-white/30 rounded-xl p-6 max-w-2xl mx-4 text-white transform perspective-1000"
            style={{ touchAction: 'auto' }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedProject(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors touch-manipulation"
              style={{ touchAction: 'manipulation' }}
              aria-label="Close project details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Project Image */}
            <div className="mb-6">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-64 object-cover rounded-lg"
                loading="lazy"
              />
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full">
                  {selectedProject.category}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {selectedProject.title}
              </h2>
              
              <p className="text-gray-300 leading-relaxed">
                {selectedProject.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {selectedProject.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-white/20 border border-white/30 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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