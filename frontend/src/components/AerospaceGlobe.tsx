import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AerospaceGlobeProps {
  mode?: 'earth' | 'station' | 'tactical';
  className?: string;
}

export const AerospaceGlobe: React.FC<AerospaceGlobeProps> = ({ mode = 'earth', className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group for earth system
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Procedural High-tech Earth Core Sphere
    const globeGeometry = new THREE.SphereGeometry(1.6, 64, 64);
    
    // Shader or canvas procedural texture for high tech dark continents / grid
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark deep oceanic void
      ctx.fillStyle = '#060d19';
      ctx.fillRect(0, 0, 1024, 512);

      // Lat-Long Coordinate Wire lines
      ctx.strokeStyle = '#0f2942';
      ctx.lineWidth = 1;
      for (let y = 32; y < 512; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
      for (let x = 32; x < 1024; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Stylized landmass / continent clusters
      ctx.fillStyle = '#163b5c';
      const continents = [
        // North America
        { x: 230, y: 160, rx: 90, ry: 60 },
        // South America
        { x: 320, y: 340, rx: 50, ry: 90 },
        // Europe
        { x: 530, y: 140, rx: 50, ry: 40 },
        // Africa
        { x: 540, y: 270, rx: 70, ry: 80 },
        // Asia
        { x: 740, y: 170, rx: 120, ry: 75 },
        // Australia
        { x: 860, y: 360, rx: 50, ry: 40 }
      ];

      continents.forEach(c => {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      // City / telemetry light hubs
      ctx.fillStyle = '#38bdf8';
      for (let i = 0; i < 90; i++) {
        const x = Math.random() * 1024;
        const y = 80 + Math.random() * 320;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const globeMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.2,
      emissive: new THREE.Color(0x021324),
      emissiveIntensity: 0.6
    });

    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // 2. Tactical Wireframe Meridian Shell
    const wireGeo = new THREE.SphereGeometry(1.608, 36, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // 3. Atmospheric Outer Glow Shell (Fresnel simulation)
    const atmosphereGeo = new THREE.SphereGeometry(1.72, 48, 48);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
          gl_FragColor = vec4(0.05, 0.65, 0.98, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // 4. Orbital Trajectory Rings
    const createOrbitRing = (radius: number, tiltX: number, tiltZ: number, color: number, opacity: number) => {
      const ringGroup = new THREE.Group();
      ringGroup.rotation.x = tiltX;
      ringGroup.rotation.z = tiltZ;

      const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.95, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(120);
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
      
      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity
      });
      const ring = new THREE.Line(geometry, material);
      ringGroup.add(ring);

      // Orbiting Station / Satellite Beacon
      const satGeo = new THREE.BoxGeometry(0.04, 0.04, 0.08);
      const satMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      ringGroup.add(satMesh);

      return { ringGroup, radius, satMesh, speed: (Math.random() * 0.005 + 0.003) };
    };

    const orbit1 = createOrbitRing(2.05, 0.45, 0.35, 0x0284c7, 0.5);
    const orbit2 = createOrbitRing(2.35, -0.65, 0.8, 0x06b6d4, 0.35);
    const orbit3 = createOrbitRing(2.65, 1.1, -0.4, 0x38bdf8, 0.25);

    globeGroup.add(orbit1.ringGroup);
    globeGroup.add(orbit2.ringGroup);
    globeGroup.add(orbit3.ringGroup);

    // 5. Surrounding Deep Space Starfield & Quantum Dust
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 450;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 25;
      starPositions[i + 1] = (Math.random() - 0.5) * 25;
      starPositions[i + 2] = (Math.random() - 0.5) * 15 - 3;
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.6
    });
    const starPoints = new THREE.Points(starsGeo, starsMat);
    scene.add(starPoints);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0c1e33, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xe0f2fe, 3.2);
    sunLight.position.set(5, 3, 4);
    scene.add(sunLight);

    const cyanRimLight = new THREE.PointLight(0x0284c7, 4.5, 15);
    cyanRimLight.position.set(-4, -2, -2);
    scene.add(cyanRimLight);

    // Interactive mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / width - 0.5;
      const y = (event.clientY - rect.top) / height - 0.5;
      targetX = x * 0.4;
      targetY = y * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    let angle1 = 0;
    let angle2 = Math.PI * 0.5;
    let angle3 = Math.PI * 1.2;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth mouse easing
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate Earth & wireframe
      globeGroup.rotation.y += 0.0016;
      globeMesh.rotation.y += 0.0006;
      globeGroup.rotation.x = mouseY * 0.3;
      globeGroup.rotation.z = mouseX * 0.3;

      // Orbit satellites
      angle1 += orbit1.speed;
      angle2 += orbit2.speed;
      angle3 += orbit3.speed;

      orbit1.satMesh.position.x = Math.cos(angle1) * orbit1.radius;
      orbit1.satMesh.position.z = Math.sin(angle1) * (orbit1.radius * 0.95);

      orbit2.satMesh.position.x = Math.cos(angle2) * orbit2.radius;
      orbit2.satMesh.position.z = Math.sin(angle2) * (orbit2.radius * 0.95);

      orbit3.satMesh.position.x = Math.cos(angle3) * orbit3.radius;
      orbit3.satMesh.position.z = Math.sin(angle3) * (orbit3.radius * 0.95);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      globeGeometry.dispose();
      wireGeo.dispose();
      atmosphereGeo.dispose();
      starsGeo.dispose();
      texture.dispose();
    };
  }, [mode]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
