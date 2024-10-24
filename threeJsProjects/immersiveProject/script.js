import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * Base
 */

// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// AxesHelper
const axesHelper = new THREE.AxesHelper(10);
// scene.add(axesHelper);

/**
 * Objects
 */

// Porsche Model
const gltfLoader = new GLTFLoader();
let mixer = null;
let model; // Porsche Model

// Musik
const music = document.getElementById('background-music');
let musicPlaying = false;

let appStarted = false;

// Event Listener für Start-Buttons
document.getElementById('start-button').addEventListener('click', () => {
    musicPlaying = true; 
    appStarted = true;
    music.play(); 
    startAnimation(); 
});



// Funktion zum Starten der Animation
function startAnimation() {
    if (musicPlaying) {
        document.getElementById('overlay').style.display = 'none'; // Overlay ausblenden
    }

    gltfLoader.load('models/p/Porsche2020111.glb', (gltf) => {
        console.log(gltf);
        mixer = new THREE.AnimationMixer(gltf.scene);
        const action1 = mixer.clipAction(gltf.animations[1]);
        action1.timeScale = 2
        const action2 = mixer.clipAction(gltf.animations[2]);
        action2.timeScale = 2
        const action3 = mixer.clipAction(gltf.animations[3]);
        action3.timeScale = 2
        const action4 = mixer.clipAction(gltf.animations[4]);
        action4.timeScale = 2

        action1.play();
        action2.play();
        action3.play();
        action4.play();

        model = gltf.scene;
        scene.add(model);

        model.traverse(function (child) {
            if (child.isMesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: '#8ffbff',
                    wireframe: true,
                    emissive: 0x00FFFF,
                    emissiveIntensity: 0.2,
                    roughness: 0.1,
                    metalness: 0.8
                });
            }
        });

        
        model.position.set(0, 0, 0); 
    });
}

// Partikel erstellen
const particleCount = 1000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3); 
const colors = new Float32Array(particleCount * 3); 

// Partikel-Positionen und Farben initialisieren
for (let i = 0; i < particleCount; i++) {
    // Position
    positions[i * 3] = 0; 
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0; 

    // Farbe (zufällige Farben für Funken)
    const color = Math.random() * 0xffffff;
    colors[i * 3] = (color >> 16) / 255;   
    colors[i * 3 + 1] = ((color >> 8) & 0xff) / 255; 
    colors[i * 3 + 2] = (color & 0xff) / 255; 
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Partikel-Material
const particleMaterial = new THREE.PointsMaterial({ size: 0.02, vertexColors: true });

// Partikel-Objekt erstellen
const particleSystem = new THREE.Points(particles, particleMaterial);
particleSystem.position.set(0, 0, -5)
scene.add(particleSystem);





/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);

scene.add(camera);

const isMobile = window.innerWidth < 768;

const startCameraPosition = isMobile ? new THREE.Vector3(0, 3, -15) : new THREE.Vector3(0, 3, -9); 
const endCameraPosition = isMobile ? new THREE.Vector3(-12, 6, 8) : new THREE.Vector3(-5, 5, 4); 

const cameraMoveDuration = 2; 
const cameraMoveDelay = 3;
let cameraMoveElapsed = 0;
let delayElapsed = 0;

// Setze die Kamera auf die Startposition
camera.position.set(startCameraPosition.x, startCameraPosition.y, startCameraPosition.z);


// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1, 0);
controls.dampingFactor = 0.25;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Update controls
    controls.update();

    // Update mixer
    if (mixer) {
        mixer.update(deltaTime);
    }

    if (appStarted) {
        // Kameraanimation mit 3 Sekunden Verzögerung
        if (delayElapsed < cameraMoveDelay) {
            delayElapsed += deltaTime;
        } else if (cameraMoveElapsed < cameraMoveDuration) {
            cameraMoveElapsed += deltaTime;
            const t = Math.min(cameraMoveElapsed / cameraMoveDuration, 1);
            camera.position.lerpVectors(startCameraPosition, endCameraPosition, t); 
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        }
    }


    // Partikel bewegen
    const positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      
        positions[i * 3] += (Math.random() - 0.5) * 0.14; 
        positions[i * 3 + 2] += (Math.random() - 0.5) * 1; 

        // Wenn das Partikel außerhalb eines größeren Bereichs ist, zurücksetzen
        if (Math.abs(positions[i * 3]) > 12 || Math.abs(positions[i * 3 + 2]) > 12) { 
            positions[i * 3] = (Math.random() - 0.5) * 2; 
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
        }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true; 

    particleSystem.geometry.attributes.position.needsUpdate = true; 

    // Render
    renderer.render(scene, camera);

    window.requestAnimationFrame(tick);
};

tick();
