import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function CyberGlobe3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 220;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Constellation Particles (Star Globe)
    const particleCount = 200;
    const radius = 90;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const initialPositions = []; // To store original coordinates for morphing

    for (let i = 0; i < particleCount; i++) {
      // Uniform spherical distribution (Fibonacci lattice or random spherical coords)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      initialPositions.push({ x, y, z });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Glow shader or standard point texture
    const material = new THREE.PointsMaterial({
      color: 0x00d4ff, // Cyan neon
      size: 3,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // 4. Lines Connecting Constellation Nodes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.15,
      linewidth: 1
    });

    // Create lines between close particles
    const lineIndices = [];
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const p1 = initialPositions[i];
        const p2 = initialPositions[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Connect if close
        if (dist < 40) {
          lineIndices.push(i, j);
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineGeometry.setIndex(lineIndices);

    const lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSystem);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x4ecdc4, 1.5, 300);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // 6. Interaction & Mouse Movements
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Map to normalized coordinates [-1, 1]
      targetX = (x / width) * 2 - 1;
      targetY = -(y / height) * 2 + 1;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 7. Animation Loop
    let clock = new THREE.Clock();
    let animationId;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera lerping based on mouse movement (interactive parallax)
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 50;
      camera.position.y = mouseY * 50;
      camera.lookAt(scene.position);

      // Rotate globe system
      particleSystem.rotation.y = elapsedTime * 0.08;
      particleSystem.rotation.x = elapsedTime * 0.04;
      lineSystem.rotation.y = elapsedTime * 0.08;
      lineSystem.rotation.x = elapsedTime * 0.04;

      // Morph geometry coordinates slightly based on mouse hover (ripple effect)
      const positionAttr = geometry.attributes.position;
      const posArray = positionAttr.array;

      for (let i = 0; i < particleCount; i++) {
        const orig = initialPositions[i];
        
        // Dynamic ripple scaling factor
        const wave = Math.sin(elapsedTime * 1.5 + (orig.x + orig.y) * 0.05) * 2.5;
        
        posArray[i * 3] = orig.x + (orig.x / radius) * wave;
        posArray[i * 3 + 1] = orig.y + (orig.y / radius) * wave;
        posArray[i * 3 + 2] = orig.z + (orig.z / radius) * wave;
      }

      positionAttr.needsUpdate = true;
      lineGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resizing handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanups on unmount
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      }
      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '400px', 
        height: '400px', 
        position: 'relative',
        cursor: 'grab' 
      }} 
    />
  );
}
