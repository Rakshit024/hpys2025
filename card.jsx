import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Component to render the 3D ID Card
const IDCard3D = () => {
    // Refs for the main scene container and the background canvas
    const mountRef = useRef(null);
    const bgCanvasRef = useRef(null);

    // useEffect hook to set up the scene, camera, renderer, and animations.
    // This runs once when the component mounts.
    useEffect(() => {
        // --- Core Scene Variables ---
        let scene, camera, renderer, controls, cardGroup, cardBackGroup;
        const fadeableMeshes = [];
        const backFadeableMeshes = [];
        const cardNormal = new THREE.Vector3(0, 0, 1);
        let targetYRotation = 0;
        let isFlippedByClick = false;

        // --- Interaction State ---
        let pointerIsDown = false;
        let pointerMoved = false;
        const DRAG_THRESHOLD = 8; // pixels

        // --- Helper to create text on a 2D Canvas and return it as a texture ---
        const createTextTexture = (text, options) => {
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
            
            // Measure text to size canvas correctly
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;
            canvas.width = textWidth + padding * 2 + shadowBlur * 2;
            canvas.height = fontSize + padding * 2 + shadowBlur * 2;

            // Re-apply font and settings after resizing
            ctx.font = font;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Add a subtle shadow for a pseudo-3D effect
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

        // --- Initialize Main Scene ---
        const init = () => {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 11);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            mountRef.current.appendChild(renderer.domElement);

            // --- Lighting ---
            const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
            scene.add(ambientLight);
            const directionalLight = new THREE.DirectionalLight(0xffffff, 2.2);
            directionalLight.position.set(5, 10, 8);
            directionalLight.castShadow = true;
            scene.add(directionalLight);

            // --- Controls ---
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableZoom = false;
            controls.autoRotate = false;
            controls.minPolarAngle = Math.PI / 4;
            controls.maxPolarAngle = 3 * Math.PI / 4;

            // --- Card Dimensions & Geometry ---
            const cardWidth = 3.5;
            const cardHeight = 5.0;
            const borderGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(cardWidth, cardHeight));
            const borderMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, transparent: true });

            // --- FRONT OF CARD ---
            cardGroup = new THREE.Group();
            scene.add(cardGroup);

            const border = new THREE.LineSegments(borderGeometry, borderMaterial);
            border.position.set(0, 0, 0.01);
            cardGroup.add(border);
            fadeableMeshes.push(border);

            // --- Text Creation using Canvas Texture method ---
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

            // Create all text elements
            createTextPlane('Hariprabodham', 0.35, new THREE.Vector3(0, 2.1, 0.1), { fontSize: 64, color: '#FFFFFF' });
            createTextPlane('Youth Shibir', 0.3, new THREE.Vector3(0, 1.7, 0.1), { fontSize: 52, color: '#FFFFFF' });
            createTextPlane('"A Journey Within"', 0.15, new THREE.Vector3(0, 1.3, 0.1), { fontSize: 32, fontWeight: 'normal', color: '#DDDDDD' });
            createTextPlane('Dharmik Mistry', 0.2, new THREE.Vector3(-0.28, 0.6, 0.2), { fontSize: 40, color: '#FFFFFF' });
            createTextPlane('Pulkit', 0.18, new THREE.Vector3(-0.28, 0.3, 0.2), { fontSize: 36, color: '#f0c43f' });
            createTextPlane('1 - 3 AUGUST 2025', 0.15, new THREE.Vector3(0.3, -2.2, 0.1), { fontSize: 32, color: '#FFFFFF' });

            // --- GLTF Avatar Loading ---
            const loader = new GLTFLoader();
            loader.load('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb', (gltf) => {
                const avatar = gltf.scene;
                avatar.scale.set(0.42, 0.42, 0.42);
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
            });

            // --- Profile Picture ---
            createProfileCircleTexture('https://placehold.co/192x192/333/FFF?text=DM', 192).then(profileTexture => {
                const profileMat = new THREE.MeshBasicMaterial({ map: profileTexture, transparent: true });
                const profileCircle = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48), profileMat);
                profileCircle.position.set(-0.9, 0.6, 0.3);
                cardGroup.add(profileCircle);
                fadeableMeshes.push(profileCircle);
            });

            // --- BACK OF CARD ---
            cardBackGroup = new THREE.Group();
            cardBackGroup.rotation.y = Math.PI;
            scene.add(cardBackGroup);

            const backBorder = new THREE.LineSegments(borderGeometry.clone(), borderMaterial.clone());
            backBorder.position.set(0, 0, 0.01);
            cardBackGroup.add(backBorder);
            backFadeableMeshes.push(backBorder);

            const backBgMat = new THREE.MeshBasicMaterial({ color: 0x232445 });
            const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), backBgMat);
            cardBackGroup.add(backPlane);

            const texLoader = new THREE.TextureLoader();
            texLoader.load('https://placehold.co/256x256/FFFFFF/000000?text=QR+CODE', function(texture) {
                const qrMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
                const qrMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), qrMat);
                qrMesh.position.set(0, 0.2, 0.12);
                cardBackGroup.add(qrMesh);
                backFadeableMeshes.push(qrMesh);
            });
        };

        // --- Helper to create circular profile texture ---
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
            img.crossOrigin = "Anonymous"; // Handle potential CORS issues
            img.src = imageUrl;
            return new Promise(resolve => {
                img.onload = () => {
                    ctx.drawImage(img, 0, 0, size, size);
                    ctx.restore();
                    resolve(new THREE.CanvasTexture(canvas));
                };
                img.onerror = () => { // Fallback if image fails to load
                    ctx.fillStyle = '#555';
                    ctx.fillRect(0, 0, size, size);
                    ctx.restore();
                    resolve(new THREE.CanvasTexture(canvas));
                };
            });
        };

        // --- Background Starfield ---
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
            
            // Return cleanup for background
            return () => {
                window.removeEventListener('resize', onBgResize);
                cancelAnimationFrame(bgAnimFrameId);
            };
        };

        // --- Event Handlers ---
        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        const onPointerDown = () => {
            pointerIsDown = true;
            pointerMoved = false;
        };

        const onPointerMove = (e) => {
            if (e.pointerType === 'mouse' ? e.buttons : true) {
                 if (pointerIsDown) pointerMoved = true;
            }
        };

        const onPointerUp = () => {
            if (pointerIsDown && !pointerMoved) {
                isFlippedByClick = !isFlippedByClick;
                targetYRotation = isFlippedByClick ? Math.PI : 0;
            }
            pointerIsDown = false;
        };

        // --- Animation Loop ---
        let animFrameId;
        const animate = () => {
            animFrameId = requestAnimationFrame(animate);
            controls.update();

            // Smoothly interpolate card rotation
            if (cardGroup) {
                cardGroup.rotation.y += (targetYRotation - cardGroup.rotation.y) * 0.15;
                cardBackGroup.rotation.y = cardGroup.rotation.y + Math.PI;

                // Determine which side is facing the camera
                const camPos = new THREE.Vector3();
                camera.getWorldPosition(camPos);
                const cardPos = new THREE.Vector3();
                cardGroup.getWorldPosition(cardPos);
                const toCam = camPos.clone().sub(cardPos).normalize();
                const matrix = new THREE.Matrix4().extractRotation(cardGroup.matrixWorld);
                const normal = cardNormal.clone().applyMatrix4(matrix);
                const dot = normal.dot(toCam);

                cardGroup.visible = (dot > 0);
                cardBackGroup.visible = (dot <= 0);

                // Fade in/out front and back faces
                const updateOpacity = (meshes, currentDot) => {
                    const opacity = THREE.MathUtils.smoothstep(Math.abs(currentDot), 0.13, 0.5);
                    meshes.forEach(mesh => {
                        const applyOpacity = (obj) => {
                            if (obj.isMesh && obj.material) {
                                obj.material.opacity = opacity;
                                obj.material.depthWrite = opacity > 0.1;
                            }
                        };
                        if (mesh.isGroup || mesh.isScene) {
                            mesh.traverse(applyOpacity);
                        } else {
                            applyOpacity(mesh);
                        }
                    });
                };

                updateOpacity(fadeableMeshes, dot);
                updateOpacity(backFadeableMeshes, -dot);
            }

            renderer.render(scene, camera);
        };

        // --- Run Initialization ---
        init();
        const cleanupBg = initBackgroundAnimation();
        animate();

        // --- Attach Event Listeners ---
        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('pointerdown', onPointerDown);
        renderer.domElement.addEventListener('pointermove', onPointerMove);
        renderer.domElement.addEventListener('pointerup', onPointerUp);

        // --- Cleanup on Unmount ---
        return () => {
            cancelAnimationFrame(animFrameId);
            window.removeEventListener('resize', onWindowResize);
            if(renderer && renderer.domElement) {
                renderer.domElement.removeEventListener('pointerdown', onPointerDown);
                renderer.domElement.removeEventListener('pointermove', onPointerMove);
                renderer.domElement.removeEventListener('pointerup', onPointerUp);
            }
            cleanupBg(); // Cleanup background listeners
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };

    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0c0a1a' }}>
            <canvas ref={bgCanvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }} />
            <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }} />
            <div style={{
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
            }}>
                Drag to rotate the card
            </div>
        </div>
    );
};


// Main App component to render our 3D scene
export default function App() {
  return (
    <IDCard3D />
  );
}
