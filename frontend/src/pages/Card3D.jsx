import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
// Removed OrbitControls for manual drag
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

const Card3D = () => {
  const mountRef = useRef(null);
  const bgCanvasRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, cardGroup, cardBackGroup;
    const fadeableMeshes = [];
    const backFadeableMeshes = [];
    const cardNormal = new THREE.Vector3(0, 0, 1);
    let targetYRotation = 0;
    let isFlippedByClick = false;
    let pointerIsDown = false;
    let pointerMoved = false;
    const DRAG_THRESHOLD = 8;
    // Manual drag state
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let rotationY = 0.3; // Default rotation so card is not flat
    let rotationX = -0.1;
    // Handlers for cleanup
    let canvas = null;
    let robotMixer = null;
    let robotAction = null;
    let robotAvatar = null;
    let hiMesh = null;
    let hiTimeout = null;
    function onPointerDown(e) {
      isDragging = true;
      if (e.touches && e.touches.length > 0) {
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      } else {
        lastX = e.clientX;
        lastY = e.clientY;
      }
      if (canvas) canvas.style.cursor = 'grabbing';
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault(); // Prevent scrolling while dragging
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const deltaX = clientX - lastX;
      const deltaY = clientY - lastY;
      rotationY += deltaX * 0.01;
      rotationX += deltaY * 0.01;
      const maxX = Math.PI * 0.3;
      rotationX = Math.max(-maxX, Math.min(maxX, rotationX));
      lastX = clientX;
      lastY = clientY;
    }
    function onPointerUp() {
      isDragging = false;
      if (canvas) canvas.style.cursor = 'grab';
    }
    // --- Canvas Text Utility ---
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
      const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.font = font;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      canvas.width = textWidth + padding * 2 + shadowBlur * 2;
      canvas.height = fontSize + padding * 2 + shadowBlur * 2;
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
    // --- Profile Circle Utility ---
    const createProfileCircleTexture = (imageUrl, size = 256) => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 4, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();
      const img = new window.Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;
      return new Promise(resolve => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, size, size);
          ctx.restore();
          resolve(new THREE.CanvasTexture(canvas));
        };
        img.onerror = () => {
          ctx.fillStyle = '#555';
          ctx.fillRect(0, 0, size, size);
          ctx.restore();
          resolve(new THREE.CanvasTexture(canvas));
        };
      });
    };
    // --- Main Scene ---
    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 11);
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch (e) {
        alert('WebGL could not be initialized. Try restarting your browser or updating your graphics drivers.');
        return;
      }
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      // Remove any existing canvas before appending a new one
      if (mountRef.current) {
        const oldCanvas = mountRef.current.querySelector('canvas');
        if (oldCanvas) mountRef.current.removeChild(oldCanvas);
      }
      mountRef.current.appendChild(renderer.domElement);
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.1);
      directionalLight.position.set(5, 10, 8);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      // Manual drag-to-rotate controls (attach after mount)
      canvas = renderer.domElement;
      canvas.style.cursor = 'grab';
      canvas.style.zIndex = 2;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'auto';
      // Card geometry
      const cardWidth = 3.5;
      const cardHeight = 5.0;
      const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(cardWidth, cardHeight));
      const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 6, transparent: true });
      // --- Front of card ---
      cardGroup = new THREE.Group();
      scene.add(cardGroup);
      const border = new THREE.LineSegments(borderGeometry, borderMaterial);
      border.position.set(0, 0, 0.02); // More z-offset
      cardGroup.add(border);
      fadeableMeshes.push(border);
      // Canvas text as PlaneGeometry
      const createTextPlane = (text, height, position, options) => {
        const { texture, aspectRatio } = createTextTexture(text, options);
        const planeHeight = height;
        const planeWidth = planeHeight * aspectRatio;
        const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.position.copy(position);
        cardGroup.add(mesh);
        fadeableMeshes.push(mesh);
      };
      // Add text layers
      createTextPlane('Hariprabodham', 0.5, new THREE.Vector3(0, 2.1, 0.1), { fontSize: 90, color: '#FFFFFF' });
      // Add h.png and p.png side by side above the heading, centered
      const texLoader = new THREE.TextureLoader();
      const yImages = 2.7; // above the main title
      const imgZ = 0.13;
      texLoader.load('/assets/h.png', function(hTex) {
        const hMat = new THREE.MeshBasicMaterial({ map: hTex, transparent: true });
        const hMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), hMat);
        hMesh.position.set(-0.4, yImages, imgZ);
        cardGroup.add(hMesh);
      });
      texLoader.load('/assets/p.png', function(pTex) {
        const pMat = new THREE.MeshBasicMaterial({ map: pTex, transparent: true });
        const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), pMat);
        pMesh.position.set(0.4, yImages, imgZ);
        cardGroup.add(pMesh);
      });
      createTextPlane('Youth Shibir', 0.42, new THREE.Vector3(0, 1.7, 0.1), { fontSize: 75, color: '#FFFFFF' });
      // Add '2025' under 'Youth Shibir' (larger)
      createTextPlane('2025', 0.32, new THREE.Vector3(0, 1.4, 0.1), { fontSize: 70, color: '#FFFFFF' });
      // Add a horizontal line under 2025, spanning the card
      const lineY = 1.18; // just below 2025
      const lineZ = 0.12;
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-cardWidth*0.45, lineY, lineZ),
        new THREE.Vector3(cardWidth*0.45, lineY, lineZ)
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
      const horizLine = new THREE.Line(lineGeom, lineMat);
      cardGroup.add(horizLine);
      createTextPlane('Dharmik Mistry', 0.28, new THREE.Vector3(0.5, 1.0, 0.2), { fontSize: 60, color: '#FFFFFF' });
      createTextPlane('Pulkit', 0.25, new THREE.Vector3(0.5, 0.6, 0.2), { fontSize: 52, color: '#f0c43f' });
      createTextPlane('example@email.com', 0.25, new THREE.Vector3(0.5, 0.2, 0.2), { fontSize: 52, color: '#FFFFFF' });
      createTextPlane('1 - 3 AUGUST 2025', 0.22, new THREE.Vector3(0.3, -2.2, 0.1), { fontSize: 48, color: '#FFFFFF' });
      // GLTF Avatar
      const loader = new GLTFLoader();
      loader.load('/assets/RobotExpressive.glb', (gltf) => {
        const avatar = gltf.scene;
        avatar.scale.set(0.32, 0.32, 0.32);
        avatar.position.set(-1.0, -2.2, 0);
        avatar.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.transparent = true;
            fadeableMeshes.push(child);
          }
        });
        cardGroup.add(avatar);
        robotAvatar = avatar;
        // Animation setup
        if (gltf.animations && gltf.animations.length > 0) {
          robotMixer = new AnimationMixer(avatar);
          robotAction = robotMixer.clipAction(gltf.animations[0]);
        }
        // Remove error overlay if present
        const errDiv = document.getElementById('robot-error');
        if (errDiv) errDiv.remove();
      }, undefined, (err) => {
        console.error('Failed to load robot GLB:', err);
        let errDiv = document.getElementById('robot-error');
        if (!errDiv) {
          errDiv = document.createElement('div');
          errDiv.id = 'robot-error';
          errDiv.style.position = 'fixed';
          errDiv.style.top = '10px';
          errDiv.style.left = '50%';
          errDiv.style.transform = 'translateX(-50%)';
          errDiv.style.background = 'rgba(200,0,0,0.9)';
          errDiv.style.color = 'white';
          errDiv.style.padding = '1rem 2rem';
          errDiv.style.zIndex = 10000;
          errDiv.style.fontSize = '1.2rem';
          errDiv.style.borderRadius = '8px';
          errDiv.innerText = 'Failed to load robot GLB. Check /assets/RobotExpressive.glb';
          document.body.appendChild(errDiv);
        }
      });
      // Profile Picture
      createProfileCircleTexture('/assets/profile.png', 192).then(profileTexture => {
        // Add rp.png as a filled image inside the circle border, slightly smaller, and in front
        const rpTexture = new THREE.TextureLoader().load('/assets/rp.png');
        const imgMat = new THREE.MeshBasicMaterial({ map: rpTexture, color: 0xffffff, toneMapped: false, transparent: false, opacity: 1 });
        const imgCircle = new THREE.Mesh(new THREE.CircleGeometry(0.48, 48), imgMat);
        imgCircle.position.set(-1.1, 0.45, 0.31); // slightly up
        cardGroup.add(imgCircle);
        fadeableMeshes.push(imgCircle);
        // 2D unfilled circle (just border) using EllipseCurve
        const curve = new THREE.EllipseCurve(
          0, 0, // ax, aY
          0.52, 0.52, // xRadius, yRadius
          0, 2 * Math.PI, // startAngle, endAngle
          false, // clockwise
          0 // rotation
        );
        const points = curve.getPoints(64);
        const circleGeom = new THREE.BufferGeometry().setFromPoints(points);
        const circleMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 4, depthTest: false });
        const profileCircle = new THREE.LineLoop(circleGeom, circleMat);
        profileCircle.position.set(-1.1, 0.45, 0.3);
        cardGroup.add(profileCircle);
        fadeableMeshes.push(profileCircle);
      });
      // Add 3D quote under the card
      createTextPlane('"With Us, Within Us"', 0.22, new THREE.Vector3(0, -3.2, 0.1), { fontSize: 48, color: '#FFFFFF' });
      // --- Back of card ---
      cardBackGroup = new THREE.Group();
      cardBackGroup.rotation.y = Math.PI;
      scene.add(cardBackGroup);
      const backBorder = new THREE.LineSegments(borderGeometry.clone(), borderMaterial.clone());
      backBorder.position.set(0, 0, 0.02); // More z-offset
      cardBackGroup.add(backBorder);
      backFadeableMeshes.push(backBorder);
      const backBgMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
      const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), backBgMat);
      backPlane.position.set(0, 0, 0.0);
      cardBackGroup.add(backPlane);
      // Replicate front side elements on the back (except personal details and profile pic)
      // h.png and p.png
      texLoader.load('/assets/h.png', function(hTex) {
        const hMat = new THREE.MeshBasicMaterial({ map: hTex, transparent: true });
        const hMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), hMat);
        hMesh.position.set(-0.4, yImages, imgZ);
        cardBackGroup.add(hMesh);
        backFadeableMeshes.push(hMesh);
      });
      texLoader.load('/assets/p.png', function(pTex) {
        const pMat = new THREE.MeshBasicMaterial({ map: pTex, transparent: true });
        const pMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), pMat);
        pMesh.position.set(0.4, yImages, imgZ);
        cardBackGroup.add(pMesh);
        backFadeableMeshes.push(pMesh);
      });
      // Hariprabodham
      (function() {
        const { texture, aspectRatio } = createTextTexture('Hariprabodham', { fontSize: 90, color: '#FFFFFF' });
        const planeHeight = 0.5;
        const planeWidth = planeHeight * aspectRatio;
        const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.position.set(0, 2.1, 0.1);
        cardBackGroup.add(mesh);
        backFadeableMeshes.push(mesh);
      })();
      // Youth Shibir
      (function() {
        const { texture, aspectRatio } = createTextTexture('Youth Shibir', { fontSize: 75, color: '#FFFFFF' });
        const planeHeight = 0.42;
        const planeWidth = planeHeight * aspectRatio;
        const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.position.set(0, 1.7, 0.1);
        cardBackGroup.add(mesh);
        backFadeableMeshes.push(mesh);
      })();
      // 2025
      (function() {
        const { texture, aspectRatio } = createTextTexture('2025', { fontSize: 70, color: '#FFFFFF' });
        const planeHeight = 0.32;
        const planeWidth = planeHeight * aspectRatio;
        const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const planeMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(planeGeo, planeMat);
        mesh.position.set(0, 1.4, 0.1);
        cardBackGroup.add(mesh);
        backFadeableMeshes.push(mesh);
      })();
      // Horizontal line (90% width)
      (function() {
        const lineGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-cardWidth*0.45, lineY, lineZ),
          new THREE.Vector3(cardWidth*0.45, lineY, lineZ)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 3 });
        const horizLine = new THREE.Line(lineGeom, lineMat);
        cardBackGroup.add(horizLine);
        backFadeableMeshes.push(horizLine);
      })();
      // 3D quote under the card
      createTextPlane('"With Us, Within Us"', 0.22, new THREE.Vector3(0, -3.2, 0.1), { fontSize: 48, color: '#FFFFFF' });
      // QR code (already present, but move below the line)
      texLoader.load('/assets/qr.jpg', function(texture) {
        const qrMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
        const qrMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 2.7), qrMat);
        qrMesh.position.set(0, -0.4, 0.13); // larger and shifted up
        cardBackGroup.add(qrMesh);
        backFadeableMeshes.push(qrMesh);
      });
    };
    // --- Background Animation ---
    const initBackgroundAnimation = () => {
      const bgScene = new THREE.Scene();
      const bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      bgCamera.position.z = 5;
      const bgRenderer = new THREE.WebGLRenderer({ canvas: bgCanvasRef.current, antialias: true });
      bgRenderer.setSize(window.innerWidth, window.innerHeight);
      const starGeo = new THREE.BufferGeometry();
      const starCount = 5000;
      const posArray = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const starMat = new THREE.PointsMaterial({ color: 0x8888aa, size: 0.015 });
      const stars = new THREE.Points(starGeo, starMat);
      bgScene.add(stars);
      let bgAnimFrameId;
      const animateBg = () => {
        stars.rotation.y += 0.0001;
        stars.rotation.x += 0.0001;
        bgRenderer.render(bgScene, bgCamera);
        bgAnimFrameId = requestAnimationFrame(animateBg);
      };
      animateBg();
      const onBgResize = () => {
        bgCamera.aspect = window.innerWidth / window.innerHeight;
        bgCamera.updateProjectionMatrix();
        bgRenderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onBgResize);
      // Cleanup for background
      return () => {
        window.removeEventListener('resize', onBgResize);
        cancelAnimationFrame(bgAnimFrameId);
      };
    };
    // --- Raycaster for robot click ---
    function onCanvasClick(event) {
      if (!robotAvatar) return;
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(robotAvatar, true);
      if (intersects.length > 0) {
        // Play animation only if not already running
        if (robotMixer && robotAction && !robotAction.isRunning()) {
          robotAction.reset();
          robotAction.setLoop(THREE.LoopOnce, 1);
          robotAction.clampWhenFinished = true;
          robotAction.play();
        }
      }
    }
    // --- Animation Loop ---
    let animFrameId;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      if (robotMixer) robotMixer.update(1/60);
      // Apply manual rotation
      if (cardGroup) {
        cardGroup.rotation.y = rotationY;
        cardGroup.rotation.x = rotationX;
        cardBackGroup.rotation.y = cardGroup.rotation.y + Math.PI;
        cardBackGroup.rotation.x = rotationX;
        // Show/hide side facing camera, edge fade
        const camPos = new THREE.Vector3();
        camera.getWorldPosition(camPos);
        const cardPos = new THREE.Vector3();
        cardGroup.getWorldPosition(cardPos);
        const toCam = camPos.clone().sub(cardPos).normalize();
        const matrix = new THREE.Matrix4().extractRotation(cardGroup.matrixWorld);
        const normal = cardNormal.clone().applyMatrix4(matrix);
        const dot = normal.dot(toCam);
        // Only one group is ever in the scene at a time
        scene.remove(cardGroup);
        scene.remove(cardBackGroup);
        if (dot > 0.01) {
          scene.add(cardGroup);
        } else if (dot < -0.01) {
          scene.add(cardBackGroup);
        }
      }
      renderer.render(scene, camera);
    };
    // --- INIT ---
    init();
    const cleanupBg = initBackgroundAnimation();
    animate();
    // --- Attach Events ---
    if (canvas) {
      canvas.addEventListener('click', onCanvasClick);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointerleave', onPointerUp);
      // Touch events (for mobile smoothness)
      canvas.addEventListener('touchstart', onPointerDown);
      canvas.addEventListener('touchmove', onPointerMove);
      canvas.addEventListener('touchend', onPointerUp);
      canvas.addEventListener('touchcancel', onPointerUp);
    }
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animFrameId);
      if (renderer) {
        if (renderer.forceContextLoss) renderer.forceContextLoss();
        renderer.dispose();
        if (renderer.domElement && mountRef.current && mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      if (canvas) {
        canvas.removeEventListener('click', onCanvasClick);
      }
      // Remove manual drag listeners
      if (canvas) {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointerleave', onPointerUp);
        canvas.removeEventListener('touchstart', onPointerDown);
        canvas.removeEventListener('touchmove', onPointerMove);
        canvas.removeEventListener('touchend', onPointerUp);
        canvas.removeEventListener('touchcancel', onPointerUp);
      }
      cleanupBg();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0c0a1a' }}>
      <canvas
        ref={bgCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          pointerEvents: 'none', // allow pointer events to pass through to card canvas
        }}
      />
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          width: '100vw',
          height: '100vh',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          fontFamily: 'sans-serif',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          zIndex: 2,
        }}
      >
        Drag to rotate the card
      </div>
    </div>
  );
};

export default Card3D; 