// frontend/src/pages/Card.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import axios from "axios";
import { Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
// import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
// import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
// import hariLogo from "../assets/hari.png";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Card = () => {
  const containerRef = useRef();
  const [user, setUser] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [webGLError, setWebGLError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const email = new URLSearchParams(location.search).get("email");

  useEffect(() => {
    if (!email) return;

    axios
      .get(`${BACKEND_URL}/api/getUserByEmail?email=${email}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
            navigate("/show-card");
          }, 3000);
        }
      });
  }, [email, navigate]);

  useEffect(() => {
    if (!user || !user._id || !containerRef.current) return;

    // WebGL support check
    const canvasTest = document.createElement("canvas");
    const gl =
      canvasTest.getContext("webgl") ||
      canvasTest.getContext("experimental-webgl");
    if (!gl) {
      setWebGLError(
        "WebGL is not supported on your device or browser. Please use a modern browser with hardware acceleration enabled."
      );
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
    } catch (e) {
      setWebGLError(
        "Error creating WebGL context. Try restarting your browser or device."
      );
      return;
    }

    // Set up scene background with gradient
    const scene = new THREE.Scene();
    const gradientTexture = createGradientTexture();
    scene.background = gradientTexture;

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Responsive sizing
    function setRendererSize() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const width = Math.min(
        window.innerWidth,
        rect.width || window.innerWidth
      );
      const height = Math.min(
        window.innerHeight,
        rect.height || window.innerHeight
      );
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function setCameraPosition() {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const margin = 0.5;
      const aspect = rect.width / rect.height;
      const cardHeight = 6 + margin;
      const cardWidth = 3.5 + margin;
      const fov = camera.fov * (Math.PI / 180);
      let distance;
      if (aspect > cardWidth / cardHeight) {
        distance = cardHeight / 2 / Math.tan(fov / 2);
      } else {
        distance = cardWidth / aspect / 2 / Math.tan(fov / 2);
      }
      camera.position.set(0, 0, distance * 1.2);
      camera.lookAt(0, 0, 0);
    }

    setRendererSize();
    setCameraPosition();
    window.addEventListener("resize", setRendererSize);
    window.addEventListener("resize", setCameraPosition);

    // Enhanced lighting system
    const ambientLight = new THREE.AmbientLight(0x4a148c, 0.3);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd700, 2);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x9c27b0, 1.5);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(0x00e5ff, 0.8, 20);
    accentLight.position.set(0, 0, 8);
    scene.add(accentLight);

    // Create enhanced card geometry
    const cardShape = new THREE.Shape();
    const width = 3.5,
      height = 6,
      r = 0.4;
    cardShape.moveTo(-width / 2 + r, -height / 2);
    cardShape.lineTo(width / 2 - r, -height / 2);
    cardShape.quadraticCurveTo(
      width / 2,
      -height / 2,
      width / 2,
      -height / 2 + r
    );
    cardShape.lineTo(width / 2, height / 2 - r);
    cardShape.quadraticCurveTo(
      width / 2,
      height / 2,
      width / 2 - r,
      height / 2
    );
    cardShape.lineTo(-width / 2 + r, height / 2);
    cardShape.quadraticCurveTo(
      -width / 2,
      height / 2,
      -width / 2,
      height / 2 - r
    );
    cardShape.lineTo(-width / 2, -height / 2 + r);
    cardShape.quadraticCurveTo(
      -width / 2,
      -height / 2,
      -width / 2 + r,
      -height / 2
    );

    const extrudeSettings = {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 8,
      steps: 2,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const cardGeometry = new THREE.ExtrudeGeometry(cardShape, extrudeSettings);

    // Create holographic card material
    const cardMaterial = createHolographicMaterial();
    const cardMesh = new THREE.Mesh(cardGeometry, cardMaterial);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    scene.add(cardMesh);

    // Add elegant border with glow effect
    const borderGeometry = new THREE.EdgesGeometry(cardGeometry, 1);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0xffd700,
      linewidth: 3,
      transparent: true,
      opacity: 0.9,
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.z = 0.01;
    cardMesh.add(border);

    // Create front and back groups
    const front = new THREE.Group();
    front.position.z = 0.12;
    cardMesh.add(front);

    const back = new THREE.Group();
    back.position.z = -0.12;
    back.rotation.y = Math.PI;
    cardMesh.add(back);

    // Add floating particles around the card
    const particles = createFloatingParticles();
    scene.add(particles);

    // Enhanced logo and heading
    const logoImg = new window.Image();
    logoImg.src = "/assets/hari.png";
    logoImg.onload = () => {
      const logoCanvas = createEnhancedLogoCanvas(
        logoImg,
        "HariPrabodham Yuva Shibir 2025"
      );
      const logoTexture = new THREE.CanvasTexture(logoCanvas);
      const logoMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.5, 0.8),
        new THREE.MeshBasicMaterial({
          map: logoTexture,
          transparent: true,
          alphaTest: 0.1,
        })
      );
      // Center the heading panel, and shift text inside canvas to the right of logo
      logoMesh.position.set(0, 2.4, 0.15); // ✅ Move heading to top

      front.add(logoMesh);
    };

    // Enhanced profile photo with holographic frame
    const photoTexture = new THREE.TextureLoader().load(
      user.photo
        ? `${BACKEND_URL}/uploads/${user.photo}`
        : "/profile.jpeg"
    );
    photoTexture.minFilter = THREE.LinearFilter;
    photoTexture.magFilter = THREE.LinearFilter;

    // Create photo frame with glow
    const photoFrame = createPhotoFrame();
    photoFrame.position.set(1.8, 0.1, 0.16);
    front.add(photoFrame);

    const photo = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 64),
      new THREE.MeshBasicMaterial({
        map: photoTexture,
        transparent: true,
      })
    );
    photo.position.set(1.8, 0.1, 0.17);
    front.add(photo);

    // Enhanced name display
    const nameCanvas = createEnhancedNameCanvas(
      user.first_name,
      user.last_name
    );
    const nameTexture = new THREE.CanvasTexture(nameCanvas);
    const nameMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.35),
      new THREE.MeshBasicMaterial({
        map: nameTexture,
        transparent: true,
        alphaTest: 0.1,
      })
    );
    nameMesh.position.set(1.8, -1.0, 0.15); // shift name further down
    front.add(nameMesh);

    // Enhanced details panel
    const detailsPanel = createDetailsPanel(user);
    detailsPanel.position.set(-1.8, 0, 0.15);
    front.add(detailsPanel);

    // Enhanced QR code for back
    const qrTexture = new THREE.TextureLoader().load(
      user.qr
        ? `${BACKEND_URL}/uploads/${user.qr}`
        : "/fallbacks/default-qr.png"
    );
    qrTexture.minFilter = THREE.LinearFilter;
    qrTexture.magFilter = THREE.LinearFilter;

    const qrFrame = createQRFrame();
    qrFrame.position.set(0, 0.2, 0.05);
    back.add(qrFrame);

    const qrMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({
        map: qrTexture,
        transparent: true,
      })
    );
    qrMesh.position.set(0, 0.2, 0.07);
    back.add(qrMesh);

    // QR instruction text
    const qrInstructionCanvas = createQRInstructionCanvas();
    const qrInstructionTexture = new THREE.CanvasTexture(qrInstructionCanvas);
    const qrInstructionMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 0.4),
      new THREE.MeshBasicMaterial({
        map: qrInstructionTexture,
        transparent: true,
        alphaTest: 0.1,
      })
    );
    qrInstructionMesh.position.set(0, -1.0, 0.02);
    back.add(qrInstructionMesh);

    // Add floating gems around the card
    const gems = createFloatingGems();
    gems.forEach((gem) => scene.add(gem));

    // Enhanced controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.maxDistance = 15;
    controls.minDistance = 8;

    let flipped = false;
    let isAnimating = false;

    renderer.domElement.addEventListener("click", (event) => {
      if (isAnimating) return;
      flipped = !flipped;
      isAnimating = true;
      setTimeout(() => {
        isAnimating = false;
      }, 800);
    });

    // Animation loop with time-based effects
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate card flip
      const target = flipped ? Math.PI : 0;
      cardMesh.rotation.y += (target - cardMesh.rotation.y) * 0.08;

      // Animate particles
      if (particles) {
        particles.rotation.z += 0.001;
        particles.children.forEach((particle, i) => {
          particle.position.y += Math.sin(time * 2 + i) * 0.001;
        });
      }

      // Animate gems
      gems.forEach((gem, i) => {
        gem.rotation.x += 0.01;
        gem.rotation.y += 0.02;
        gem.position.y += Math.sin(time * 1.5 + i) * 0.002;
      });

      // Animate border glow
      if (border.material) {
        border.material.opacity = 0.8 + Math.sin(time * 3) * 0.2;
      }

      // Animate accent light
      accentLight.intensity = 0.8 + Math.sin(time * 2) * 0.3;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Helper functions
    function createGradientTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      gradient.addColorStop(0, "#1a0033");
      gradient.addColorStop(0.5, "#2d1b69");
      gradient.addColorStop(1, "#0a0a0a");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      return new THREE.CanvasTexture(canvas);
    }

    function createHolographicMaterial() {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");

      // Create holographic background
      const gradient = ctx.createLinearGradient(0, 0, 1024, 640);
      gradient.addColorStop(0, "rgba(138, 43, 226, 0.95)");
      gradient.addColorStop(0.3, "rgba(75, 0, 130, 0.9)");
      gradient.addColorStop(0.7, "rgba(25, 25, 112, 0.9)");
      gradient.addColorStop(1, "rgba(72, 61, 139, 0.95)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1024, 640);

      // Add holographic pattern
      ctx.globalCompositeOperation = "overlay";
      for (let i = 0; i < 20; i++) {
        const grad = ctx.createLinearGradient(0, i * 32, 1024, i * 32 + 16);
        grad.addColorStop(0, "rgba(72, 61, 2, 0.1)");
        grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
        grad.addColorStop(1, "rgba(255, 215, 0, 0.1)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, i * 32, 1024, 16);
      }

      const texture = new THREE.CanvasTexture(canvas);

      return new THREE.MeshPhysicalMaterial({
        map: texture,
        transparent: true,
        roughness: 0.1,
        metalness: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.8,
        transmission: 0.2,
        ior: 1.6,
        thickness: 0.5,
        envMapIntensity: 1.5,
      });
    }

    function createFloatingParticles() {
      const particlesGroup = new THREE.Group();
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.02, 8, 8),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.8),
            transparent: true,
            opacity: 0.6,
          })
        );

        particle.position.set(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        );

        particlesGroup.add(particle);
      }

      return particlesGroup;
    }

    function createEnhancedLogoCanvas(logoImg, text) {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 160;
      const ctx = canvas.getContext("2d");
      // Background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 1200, 160);
      gradient.addColorStop(0, "rgba(255, 215, 0, 0.9)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.95)");
      gradient.addColorStop(1, "rgba(255, 215, 0, 0.9)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1200, 160);
      // Add border
      ctx.strokeStyle = "#4a148c";
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 1196, 156);
      // Draw logo
      const logoHeight = 100;
      const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
      ctx.drawImage(logoImg, 20, 30, logoWidth, logoHeight);
      // Draw text with shadow, shifted right of logo
      ctx.font = 'bold 48px "Cinzel", "Trajan Pro", serif';
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      // Text shadow
      ctx.fillStyle = "rgba(74, 20, 140, 0.5)";
      ctx.fillText(text, logoWidth + 60, 82);
      // Main text
      ctx.fillStyle = "#4a148c";
      ctx.fillText(text, logoWidth + 58, 80);
      return canvas;
    }

    function createPhotoFrame() {
      const frameGroup = new THREE.Group();

      // Outer glow ring
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.75, 0.85, 64),
        new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.6,
        })
      );
      frameGroup.add(outerRing);

      // Inner frame
      const innerFrame = new THREE.Mesh(
        new THREE.RingGeometry(0.7, 0.75, 64),
        new THREE.MeshStandardMaterial({
          color: 0x4a148c,
          metalness: 0.8,
          roughness: 0.2,
        })
      );
      frameGroup.add(innerFrame);

      return frameGroup;
    }

    function createEnhancedNameCanvas(firstName, lastName) {
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = 80;
      const ctx = canvas.getContext("2d");

      // Background with gradient
      const gradient = ctx.createLinearGradient(0, 0, 500, 80);
      gradient.addColorStop(0, "rgba(255, 215, 0, 0.9)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.9)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 500, 80);

      // Border
      ctx.strokeStyle = "#4a148c";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 498, 78);

      // Text
      ctx.font = 'bold 3rem "Cinzel", serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow
      ctx.fillStyle = "rgba(60, 52, 71, 0.5)";
      ctx.fillText(`${firstName || ""} ${lastName || ""}`.trim(), 252, 42);

      // Main text
      ctx.fillStyle = "#4a148c";
      ctx.fillText(`${firstName || ""} ${lastName || ""}`.trim(), 250, 40);

      return canvas;
    }

    function createDetailsPanel(user) {
      const panelGroup = new THREE.Group();
      const details = [
        { label: "ID", value: user._id.slice(0, 8), icon: "🆔" },
        {
          label: "DOB",
          value: user.dob
            ? new Date(user.dob).toLocaleDateString()
            : "Not Provided",
          icon: "🎂",
        },
        { label: "Email", value: user.email, icon: "✉️" },
      ];
      details.forEach((detail, index) => {
        const canvas = document.createElement("canvas");
        canvas.width = 450;
        canvas.height = 90;
        const ctx = canvas.getContext("2d");
        // Background
        const gradient = ctx.createLinearGradient(0, 0, 450, 90);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(1, "rgba(255, 215, 0, 0.8)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 450, 90);
        // Border
        ctx.strokeStyle = "#4a148c";
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 448, 88);
        // Icon
        ctx.font = "32px Arial";
        ctx.fillStyle = "#4a148c";
        ctx.fillText(detail.icon, 15, 45);
        // Label
        ctx.font = 'bold 24px "Cinzel", serif';
        ctx.fillStyle = "#4a148c";
        ctx.fillText(`${detail.label}:`, 65, 38);
        // Value (bolder, darker, larger)
        ctx.font = 'bold 26px "Cinzel", serif';
        ctx.fillStyle = "#1a0033";
        ctx.fillText(detail.value, 65, 75);
        const texture = new THREE.CanvasTexture(canvas);
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 0.38),
          new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
          })
        );
        mesh.position.set(0, 0.7 - index * 0.42, 0.02);
        panelGroup.add(mesh);
      });
      return panelGroup;
    }

    function createQRFrame() {
      const frameGroup = new THREE.Group();

      // Outer glow
      const outerGlow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 1.9),
        new THREE.MeshBasicMaterial({
          color: 0xffd700,
          transparent: true,
          opacity: 0.3,
        })
      );
      frameGroup.add(outerGlow);

      // Frame
      const frame = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 1.8),
        new THREE.MeshStandardMaterial({
          color: 0x4a148c,
          metalness: 0.8,
          roughness: 0.2,
        })
      );
      frameGroup.add(frame);

      // Inner background
      const innerBg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.7, 1.7),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.9,
        })
      );
      innerBg.position.z = 0.01;
      frameGroup.add(innerBg);

      return frameGroup;
    }

    function createQRInstructionCanvas() {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 80;
      const ctx = canvas.getContext("2d");

      // Background
      const gradient = ctx.createLinearGradient(0, 0, 600, 80);
      gradient.addColorStop(0, "rgba(255, 215, 0, 0.9)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.9)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 600, 80);

      // Border
      ctx.strokeStyle = "#4a148c";
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 598, 78);

      // Text
      ctx.font = 'bold 24px "Cinzel", serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow
      ctx.fillStyle = "rgba(74, 20, 140, 0.5)";
      ctx.fillText("Show this QR to mark attendance", 302, 42);

      // Main text
      ctx.fillStyle = "#4a148c";
      ctx.fillText("Show this QR to mark attendance", 300, 40);

      return canvas;
    }

    function createFloatingGems() {
      const gems = [];
      const gemCount = 12;

      for (let i = 0; i < gemCount; i++) {
        const gem = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.15, 0),
          new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(i / gemCount, 0.8, 0.6),
            metalness: 0.3,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8,
          })
        );

        const angle = (i / gemCount) * Math.PI * 2;
        const radius = 8;
        gem.position.set(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.3,
          Math.sin(angle) * 2
        );

        gems.push(gem);
      }

      return gems;
    }

    // Cleanup
    return () => {
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      while (containerRef.current?.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      window.removeEventListener("resize", setRendererSize);
      window.removeEventListener("resize", setCameraPosition);
    };
  }, [user]);

  return (
    <>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          position: "fixed",

          top: 0,
          left: 0,
          zIndex: 0,
          background:
            "linear-gradient(135deg, #1a0033 0%, #2d1b69 50%, #0a0a0a 100%)",
        }}
      >
        {showAlert && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setShowAlert(false)}
            style={{
              position: "absolute",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              width: "fit-content",
              maxWidth: "90%",
              background: "linear-gradient(135deg, #4a148c, #2d1b69)",
              color: "#fff",
              border: "2px solid #ffd700",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(255, 215, 0, 0.3)",
            }}
          >
            User not found or not registered yet.
          </Alert>
        )}

        {webGLError ? (
          user && (
            <div
              style={{
                maxWidth: 500,
                margin: "40px auto",
                padding: 32,
                borderRadius: 25,
                background: "linear-gradient(135deg, #4a148c, #2d1b69)",
                boxShadow: "0 20px 60px rgba(255, 215, 0, 0.3)",
                textAlign: "center",
                border: "3px solid #ffd700",
                color: "#fff",
              }}
            >
              <h2
                style={{
                  color: "#ffd700",
                  marginBottom: 20,
                  fontFamily: '"Cinzel", serif',
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                HariPrabodham Yuva Shibir 2025
              </h2>
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  margin: "0 auto 20px",
                  border: "4px solid #ffd700",
                  overflow: "hidden",
                  boxShadow: "0 8px 25px rgba(255, 215, 0, 0.4)",
                }}
              >
                <img
                  src={`${BACKEND_URL}/uploads/${user.photo}`}
                  alt="User"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/profile.jpeg";
                  }}
                />
              </div>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: 26,
                  color: "#ffd700",
                  marginBottom: 15,
                  fontFamily: '"Cinzel", serif',
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {user.first_name} {user.last_name}
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: 20,
                  borderRadius: 15,
                  marginBottom: 20,
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                }}
              >
                <div style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
                  <b style={{ color: "#ffd700" }}>ID:</b> {user._id.slice(0, 8)}
                </div>
                <div style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
                  <b style={{ color: "#ffd700" }}>DOB:</b>{" "}
                  {user.dob
                    ? new Date(user.dob).toLocaleDateString()
                    : "Not Provided"}
                </div>
                <div style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
                  <b style={{ color: "#ffd700" }}>Email:</b> {user.email}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.9)",
                  padding: 15,
                  borderRadius: 15,
                  display: "inline-block",
                  border: "3px solid #ffd700",
                  boxShadow: "0 8px 25px rgba(255, 215, 0, 0.4)",
                }}
              >
                <img
                  src={`${BACKEND_URL}/uploads/${user.qr}`}
                  alt="QR Code"
                  style={{
                    width: 120,

                    height: 120,
                    borderRadius: 8,
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/fallbacks/default-qr.png";
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "#ffd700",
                  marginTop: 15,
                  fontFamily: '"Cinzel", serif',
                  textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                Show this QR to mark attendance
              </div>
            </div>
          )
        ) : (
          <div
            ref={containerRef}
            className="card-container"
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </div>

      {/* Enhanced floating home button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          bottom: 40,
          right: 40,
          zIndex: 2000,
          background:
            "linear-gradient(135deg, #4a148c 0%, #2d1b69 50%, #6a1b9a 100%)",
          color: "#ffd700",
          border: "3px solid #ffd700",
          borderRadius: "50%",
          width: 70,
          height: 70,
          boxShadow:
            "0 8px 25px rgba(255, 215, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.2)",
          fontSize: 28,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          fontFamily: '"Cinzel", serif',
          textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow =
            "0 12px 35px rgba(255, 215, 0, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow =
            "0 8px 25px rgba(255, 215, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.2)";
        }}
        title="Go Home"
      >
        🏠
      </button>

      {/* Loading overlay for enhanced experience */}
      {!user && !showAlert && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #1a0033 0%, #2d1b69 50%, #0a0a0a 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1500,
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#ffd700",
              fontFamily: '"Cinzel", serif',
            }}
          >
            <div
              style={{
                fontSize: 48,
                marginBottom: 20,
                animation: "pulse 2s infinite",
              }}
            >
              ✨
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Preparing Your Royal Card...
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .card-container {
          cursor: grab;
        }
        
        .card-container:active {
          cursor: grabbing;
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          font-family: 'Cinzel', serif;
        }
      `}</style>
    </>
  );
};

export default Card;
