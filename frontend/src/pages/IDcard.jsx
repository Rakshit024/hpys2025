import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// --- Configuration ---
// Removed import.meta.env for broader compatibility.
const BACKEND_URL = "http://localhost:3001";

// --- React Component ---
const Card = () => {
  // --- Refs for DOM elements and Three.js objects ---
  const containerRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const cardGroupRef = useRef(null);
  const cardBackGroupRef = useRef(null);
  const animationIdRef = useRef(null);
  const bgAnimationIdRef = useRef(null);

  // --- State for user data and UI ---
  const [user, setUser] = useState({
      name: 'Dharmik Mistry',
      group: 'Pulkit',
      profileImage: 'https://i.imgur.com/sO49t69.jpeg'
  });
  const [showAlert, setShowAlert] = useState(false);
  const [webGLError, setWebGLError] = useState(null);

  // --- React Router hooks (mocked for this environment) ---
  // const location = useLocation();
  // const navigate = useNavigate();
  // const email = new URLSearchParams(location.search).get("email");

  // --- Mutable state for Three.js logic ---
  const fadeableMeshes = useRef([]);
  const backFadeableMeshes = useRef([]);
  const targetYRotation = useRef(0);
  const isFlippedByClick = useRef(false);

  /*
  // --- Fetch user data (commented out for preview) ---
  useEffect(() => {
    if (!email) return;

    axios
      .get(${BACKEND_URL}/api/getUserByEmail?email=${email})
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
            navigate("/show-card"); // Redirect if user not found
          }, 3000);
        }
      });
  }, [email, navigate]);
  */

  // --- Main Three.js Initialization ---
  useEffect(() => {
    let cleanupInit;
    let cleanupBg;

    // We define an async function to handle the setup
    const initializeScene = async () => {
      cleanupInit = await initMainScene();
      cleanupBg = initBackgroundAnimation();
      animate();
    };

    initializeScene();

    // --- Cleanup function on component unmount ---
    return () => {
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (bgAnimationIdRef.current) cancelAnimationFrame(bgAnimationIdRef.current);
      
      cleanupInit?.();
      cleanupBg?.();

      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, [user]); // Re-initialize the scene if the user data changes

  // --- Helper function to create canvas-based text textures ---
  const createTextTexture = (text, options = {}) => {
    const {
        fontFamily = 'Arial',
        fontSize = 48,
        fontWeight = 'bold',
        color = 'white',
        padding = 10,
        shadowColor = 'rgba(0,0,0,0.5)',
        shadowBlur = 4,
        shadowOffsetX = 2,
        shadowOffsetY = 2,
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // Correctly format the font string using a template literal
    const font ='${fontWeight} ${fontSize}px ${fontFamily}';
    ctx.font = font;

    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    canvas.width = textWidth + padding * 2 + shadowBlur * 2;
    canvas.height = fontSize + padding * 2 + shadowBlur * 2;

    // Re-apply font after resize
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;

    ctx.fillStyle = color;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const aspectRatio = canvas.width / canvas.height;
    return { texture, aspectRatio };
  };

  /**
   * Creates a text plane with a 3D drop-shadow effect.
   * @param {object} options - The options for creating the text.
   */
  const create3DText = (options) => {
    const { text, size, color, weight, position, scale } = options;
    
    const { texture, aspectRatio } = createTextTexture(text, { fontSize: size, color, fontWeight: weight });

    const planeHeight = size / 100 * scale; // Heuristic scaling
    const planeWidth = planeHeight * aspectRatio;
    const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeWidth, planeHeight),
        new THREE.MeshBasicMaterial({ map: texture, transparent: true })
    );
    plane.position.set(position.x, position.y, position.z);

    // Create the shadow
    const shadowMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      color: '#000000',
      transparent: true,
      opacity: 0.7
    });
    const shadowPlane = plane.clone();
    shadowPlane.material = shadowMaterial;
    // Offset the shadow
    shadowPlane.position.set(position.x + 0.02, position.y - 0.02, position.z - 0.01);

    return { main: plane, shadow: shadowPlane };
  };


  // --- Main Scene Setup ---
  const initMainScene = async () => {
    if (!containerRef.current) return;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 11);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Store refs
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      // --- Lighting ---
      scene.add(new THREE.AmbientLight(0xffffff, 1.4));
      const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
      dirLight.position.set(5, 10, 8);
      scene.add(dirLight);

      // --- Controls ---
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.minPolarAngle = Math.PI / 4;
      controls.maxPolarAngle = (3 * Math.PI) / 4;
      controlsRef.current = controls;

      // --- Card Groups ---
      cardGroupRef.current = new THREE.Group();
      cardBackGroupRef.current = new THREE.Group();
      cardBackGroupRef.current.rotation.y = Math.PI;
      scene.add(cardGroupRef.current, cardBackGroupRef.current);

      // --- Card Geometry ---
      const cardWidth = 3.5;
      const cardHeight = 5.0;
      const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(cardWidth, cardHeight));
      const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, transparent: true });
      
      // --- Front of Card ---
      const border = new THREE.LineSegments(borderGeometry, borderMaterial);
      border.position.z = 0.01;
      cardGroupRef.current.add(border);
      fadeableMeshes.current.push(border);

      // --- Create all text elements with the 3D effect ---
      const textElements = [
        { text: 'Hariprabodham', size: 80, color: '#ffffff', weight: 'bold', position: { x: 0, y: 2.1, z: 0.1 }, scale: 1.0 },
        { text: 'Youth Shibir', size: 65, color: '#ffffff', weight: 'bold', position: { x: 0, y: 1.7, z: 0.1 }, scale: 1.0 },
        { text: '"A Journey Within"', size: 35, color: '#ffffff', weight: 'normal', position: { x: 0, y: 1.3, z: 0.1 }, scale: 1.0 },
        { text: user?.name || 'Dharmik Mistry', size: 45, color: '#ffffff', weight: 'bold', position: { x: 0.5, y: 0.6, z: 0.2 }, scale: 1.0 },
        { text: user?.group || 'Pulkit', size: 38, color: '#f0c43f', weight: 'bold', position: { x: 0.5, y: 0.3, z: 0.2 }, scale: 1.0 },
        { text: '1 - 3 AUGUST 2025', size: 40, color: '#ffffff', weight: 'bold', position: { x: 0.6, y: -2.2, z: 0.1 }, scale: 1.0 }
      ];

      textElements.forEach(el => {
        const { main, shadow } = create3DText(el);
        cardGroupRef.current.add(main, shadow);
        fadeableMeshes.current.push(main, shadow);
      });

      // --- 3D Avatar ---
      new GLTFLoader().load('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb', (gltf) => {
        const avatar = gltf.scene;
        avatar.scale.set(0.42, 0.42, 0.42);
        avatar.position.set(-1.0, -2.2, 0);
        avatar.traverse(child => {
          if (child.isMesh) {
            child.material.transparent = true;
            fadeableMeshes.current.push(child);
          }
        });
        cardGroupRef.current.add(avatar);
      });

      // --- Profile Picture ---
      const profileImageUrl = user?.profileImage || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg';
      const profileTexture = await createProfileCircleTexture(profileImageUrl);
      const profileMat = new THREE.MeshBasicMaterial({ map: profileTexture, transparent: true });
      const profileCircle = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48), profileMat);
      profileCircle.position.set(-0.9, 0.6, 0.3);
      cardGroupRef.current.add(profileCircle);
      fadeableMeshes.current.push(profileCircle);

      // --- Back of Card ---
      const backBorder = new THREE.LineSegments(borderGeometry.clone(), borderMaterial.clone());
      backBorder.position.z = 0.01;
      cardBackGroupRef.current.add(backBorder);
      backFadeableMeshes.current.push(backBorder);

      const backBgMat = new THREE.MeshBasicMaterial({ color: 0x232445 });
      const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), backBgMat);
      cardBackGroupRef.current.add(backPlane);
      
      const qrTexture = await new THREE.TextureLoader().loadAsync('https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://hariprabodham.org');
      const qrMat = new THREE.MeshBasicMaterial({ map: qrTexture, transparent: true });
      const qrMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), qrMat);
      qrMesh.position.set(0, 0.2, 0.12);
      cardBackGroupRef.current.add(qrMesh);
      backFadeableMeshes.current.push(qrMesh);


      // --- Event Listeners and Cleanup ---
      const cleanupPointers = attachPointerListeners();
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        cleanupPointers?.();
      };

    } catch (error) {
      console.error("WebGL initialization error:", error);
      setWebGLError("WebGL is not supported or failed to initialize.");
    }
  };
  
  // --- Background Animation ---
  const initBackgroundAnimation = () => {
    if (!bgCanvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    const renderer = new THREE.WebGLRenderer({ canvas: bgCanvasRef.current, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const starGeo = new THREE.BufferGeometry();
    const starCount = 5000;
    const posArray = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x8888aa, size: 0.015 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const animateBg = () => {
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.0001;
      renderer.render(scene, camera);
      bgAnimationIdRef.current = requestAnimationFrame(animateBg);
    };
    animateBg();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  // --- Pointer/Touch Interaction ---
  const attachPointerListeners = () => {
    const element = rendererRef.current?.domElement;
    if (!element) return;

    let pointerIsDown = false;
    let pointerMoved = false;
    let downPos = { x: 0, y: 0 };
    const DRAG_THRESHOLD = 8;

    const getPointerPos = (e) => ({ x: e.clientX, y: e.clientY });

    const onPointerDown = (e) => {
      pointerIsDown = true;
      pointerMoved = false;
      downPos = getPointerPos(e);
    };
    const onPointerMove = (e) => {
      if (!pointerIsDown) return;
      const pos = getPointerPos(e);
      const dx = pos.x - downPos.x;
      const dy = pos.y - downPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        pointerMoved = true;
      }
    };
    const onPointerUp = () => {
      if (!pointerIsDown) return;
      pointerIsDown = false;
      if (!pointerMoved) {
        isFlippedByClick.current = !isFlippedByClick.current;
        targetYRotation.current = isFlippedByClick.current ? Math.PI : 0;
      }
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);

    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
    };
  };

  // --- Animation Loop ---
  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate);

    const { current: renderer } = rendererRef;
    const { current: scene } = sceneRef;
    const { current: camera } = cameraRef;
    const { current: controls } = controlsRef;
    const { current: cardGroup } = cardGroupRef;
    const { current: cardBackGroup } = cardBackGroupRef;

    if (!renderer || !scene || !camera || !controls || !cardGroup || !cardBackGroup) return;

    controls.update();

    // Smoothly interpolate card rotation
    cardGroup.rotation.y += (targetYRotation.current - cardGroup.rotation.y) * 0.15;
    cardBackGroup.rotation.y = cardGroup.rotation.y + Math.PI;

    // --- Visibility and Fading Logic ---
    const cardNormal = new THREE.Vector3(0, 0, 1);
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);
    const cardPos = new THREE.Vector3();
    cardGroup.getWorldPosition(cardPos);
    const toCam = camPos.clone().sub(cardPos).normalize();
    const matrix = new THREE.Matrix4().extractRotation(cardGroup.matrixWorld);
    const normal = cardNormal.clone().applyMatrix4(matrix);
    const dot = normal.dot(toCam);

    cardGroup.visible = dot > 0;
    cardBackGroup.visible = dot <= 0;

    const setOpacity = (meshes, opacity) => {
        meshes.forEach(mesh => {
            if (mesh.material) {
                mesh.material.opacity = opacity;
                mesh.material.depthWrite = opacity > 0.1;
            } else if (mesh.isGroup || mesh.isScene) {
                mesh.traverse(child => {
                    if (child.isMesh && child.material) {
                        child.material.opacity = opacity;
                        child.material.depthWrite = opacity > 0.1;
                    }
                });
            }
        });
    };

    const opacityFront = THREE.MathUtils.smoothstep(Math.abs(dot), 0.13, 0.5);
    setOpacity(fadeableMeshes.current, opacityFront);
    const opacityBack = THREE.MathUtils.smoothstep(Math.abs(-dot), 0.13, 0.5);
    setOpacity(backFadeableMeshes.current, opacityBack);

    renderer.render(scene, camera);
  };
  
  const createProfileCircleTexture = async (imageUrl, size = 256) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    return new Promise((resolve) => {
        img.onload = () => {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, 0, 0, size, size);
            resolve(new THREE.CanvasTexture(canvas));
        };
        img.onerror = () => { // Fallback for broken image
            ctx.fillStyle = '#555';
            ctx.fillRect(0,0,size,size);
            resolve(new THREE.CanvasTexture(canvas));
        }
    });
  };

  // --- Render JSX ---
  if (webGLError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-center text-white">
        <div>
          <h2 className="text-2xl font-bold mb-4">Rendering Error</h2>
          <p>{webGLError}</p>
          <p className="mt-2 text-sm text-gray-400">Please try a different browser or update your graphics drivers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <canvas ref={bgCanvasRef} className="fixed top-0 left-0 w-full h-full" style={{ zIndex: -1 }} />
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white font-sans bg-black bg-opacity-50 px-4 py-2 rounded-lg pointer-events-none">
        Drag to rotate the card
      </div>

      {showAlert && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          User not found. Redirecting...
        </div>
      )}
    </div>
  );
};

// Main App component to render the Card
export default function App() {
    return <Card />;
}