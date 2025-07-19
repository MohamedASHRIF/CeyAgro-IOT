// "use client";
// import { useEffect, useRef } from "react";
// import * as THREE from "three";

// const ThreeJsBackground: React.FC = () => {
//   const canvasRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(
//       75,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     const renderer = new THREE.WebGLRenderer({ alpha: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);

//     const canvasContainer = canvasRef.current;
//     if (canvasContainer) {
//       canvasContainer.appendChild(renderer.domElement);
//     }

//     // Create particles
//     const particles = 1000;
//     const geometry = new THREE.BufferGeometry();
//     const positions = new Float32Array(particles * 3);
//     const colors = new Float32Array(particles * 3);

//     for (let i = 0; i < particles * 3; i += 3) {
//       positions[i] = (Math.random() - 0.5) * 100;
//       positions[i + 1] = (Math.random() - 0.5) * 100;
//       positions[i + 2] = (Math.random() - 0.5) * 100;
//       colors[i] = Math.random();
//       colors[i + 1] = Math.random();
//       colors[i + 2] = Math.random();
//     }

//     geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//     geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

//     const material = new THREE.PointsMaterial({
//       size: 0.5,
//       vertexColors: true,
//     });

//     const particleSystem = new THREE.Points(geometry, material);
//     scene.add(particleSystem);

//     camera.position.z = 50;

//     // Animation loop
//     const animate = () => {
//       requestAnimationFrame(animate);
//       particleSystem.rotation.y += 0.002;
//       renderer.render(scene, camera);
//     };
//     animate();

//     // Handle window resize
//     const handleResize = () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     };
//     window.addEventListener("resize", handleResize);

//     // Cleanup
//     return () => {
//       window.removeEventListener("resize", handleResize);
//       if (canvasContainer && renderer.domElement) {
//         canvasContainer.removeChild(renderer.domElement);
//       }
//     };
//   }, []);

//   return <div id="background-canvas" ref={canvasRef} className="absolute inset-0 z-0" />;
// };

// export default ThreeJsBackground;

"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeJsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setClearColor(0x1a1a1a, 1); // Dark gray background for dark theme
    renderer.setSize(window.innerWidth, window.innerHeight);

    const canvasContainer = canvasRef.current;
    if (canvasContainer) {
      canvasContainer.appendChild(renderer.domElement);
    }

    // Create particles
    const particles = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);
    const colors = new Float32Array(particles * 3);

    // Neon color palette (RGB normalized to 0-1)
    const neonColors = [
      [1.0, 1.0, 1.0], // Neon White (#FFFFFF)
      [0.0, 1.0, 0.8], // Neon Mint Green (#00FFCC)
    ];

    for (let i = 0; i < particles * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = (Math.random() - 0.5) * 100;
      positions[i + 2] = (Math.random() - 0.5) * 100;

      // Randomly select neon white or neon mint green
      const color = neonColors[Math.floor(Math.random() * neonColors.length)];
      colors[i] = color[0];
      colors[i + 1] = color[1];
      colors[i + 2] = color[2];
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.3, // Smaller size for dots
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending, // Glow effect for neon
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    camera.position.z = 50;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      particleSystem.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (canvasContainer && renderer.domElement) {
        canvasContainer.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      id="background-canvas"
      ref={canvasRef}
      className="absolute inset-0 z-0"
    />
  );
};

export default ThreeJsBackground;
