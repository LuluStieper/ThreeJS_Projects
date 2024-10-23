import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import sky2 from '../img/sky2.png';

const islandURL = new URL('../assets/scenePink.glb', import.meta.url);
const carURL = new URL('../assets/car.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    .1,
    1000
);

// Textur als Hintergrund
const textureLoader = new THREE.TextureLoader();
scene.background = textureLoader.load(sky2);


// 3d Scrollem
const orbitControls = new OrbitControls(camera, renderer.domElement);

orbitControls.minPolarAngle = 1.1; 
orbitControls.maxPolarAngle = Math.PI / 2.2; 

orbitControls.minDistance = 10; 
orbitControls.maxDistance = 14; 

camera.position.set(10, 0, -20);
orbitControls.update();

// Beleuchtung
const ambientLight = new THREE.AmbientLight(0xffffff, 1); 
scene.add(ambientLight);

const centerLight = new THREE.PointLight(0xff00ff, 20, 100); 
centerLight.position.set(0, 0, 0);
scene.add(centerLight);

const tickLight = new THREE.PointLight(0xffffff, 5, 15); 
tickLight.position.set(6, 0, 4);
scene.add(tickLight);

const questionLight = new THREE.PointLight(0xffffff, 10, 15); 
questionLight.position.set(6, 0, -3);
scene.add(questionLight);

const laptopLight = new THREE.PointLight(0xffffff, 5, 15); 
laptopLight.position.set(-3, 0, 6);
scene.add(laptopLight);

const bookLight = new THREE.PointLight(0xffffff, 5, 15); 
scene.add(bookLight);

const berlinLight = new THREE.PointLight(0xffffff, 5, 15); 
berlinLight.position.set(-6, 0, -.5);
scene.add(berlinLight);

// Objekte

// Boden
// const planeGeometry = new THREE.CircleGeometry(30, 30);
// const planeMaterial = new THREE.MeshBasicMaterial({
//     color: 0xf4a3ff,
//     side: THREE.DoubleSide
// });
// const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
// planeMesh.rotation.x = -0.5 * Math.PI;
// planeMesh.position.set(0, -2, 0);
// scene.add(planeMesh);

// Insel
const assetLoader = new GLTFLoader();
assetLoader.load(islandURL.href, function (gltf) {
    const model = gltf.scene;
    scene.add(model);

   // Zentriere das Modell um den Punkt (0, 0, 0)
   const boundingBox = new THREE.Box3().setFromObject(model);
   const center = new THREE.Vector3();
   boundingBox.getCenter(center);
   model.position.sub(center);

})

// Checkpoints
const checkGeometry = new THREE.BoxGeometry(.3,.3,.3);

const redMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
const greenMaterial = new THREE.MeshBasicMaterial({color: 0x00FF00});
const orangeMaterial = new THREE.MeshBasicMaterial({color: 0xFFA500});
const lilaMaterial = new THREE.MeshBasicMaterial({color: 0x800080});
const pinkMaterial = new THREE.MeshBasicMaterial({color: 0xFFC0CB});

const check1 = new THREE.Mesh(checkGeometry, redMaterial);    
check1.position.set(0, -2, -7);
scene.add(check1);

const check2 = new THREE.Mesh(checkGeometry, greenMaterial);
check2.position.set(-6, -2, -.5);
scene.add(check2);

const check3 = new THREE.Mesh(checkGeometry, orangeMaterial);
check3.position.set(-3, -2, 6);
scene.add(check3);

const check4 = new THREE.Mesh(checkGeometry, lilaMaterial);
check4.position.set(6, -2, 4);
scene.add(check4);

const check5 = new THREE.Mesh(checkGeometry, pinkMaterial);
check5.position.set(6, -2, -3);
scene.add(check5);

// Arrays enthalten Würfel und ihre jeweiligen Textobjekte
const cubes = [check1, check2, check3, check4, check5]; 
const texts = [
    "In 2022 I passed my Abitur in Brandenburg",
    "Immediately afterwards I started studying media informatics in Berlin. <a href=''>Click here to view my courses!</a>",
    "Since March 2024 I've been working independently as a web and graphic designer. <a href='https://lulu-design.de'>Click here to visit my Website!</a>",
    "Things I've worked with: Java, JavaScript/TypeScript, HTML/CSS, Figma, Blender, Word/PowerPoint/Excel",
    "At the moment I'm looking for an internship. <a href='mailto:kontakt@lulu-design.de'>Contact me!</a>"
];


// Map zur Verwaltung der Text-Sichtbarkeit
const textVisibility = new Map();

// Initialisiere die Map mit allen Würfeln auf unsichtbar
cubes.forEach(cube => {
    textVisibility.set(cube, false);
});

// Überwachung der Kamera-Position
function checkCameraPosition() {
    let isTextVisible = false;

    // Schleife durch alle Würfel
    cubes.forEach((cube, index) => {
        const text = texts[index];

        // Bestimme die Entfernung zwischen Kamera und dem aktuellen Würfel
        const distance = camera.position.distanceTo(cube.position);

        // Entscheide basierend auf der Entfernung, ob der Text eingeblendet werden soll
        if (distance < 9) {
            // Setze den Text sichtbar und aktualisiere die Textanzeige
            textVisibility.set(cube, true);
            displayText(text);
            isTextVisible = true; // Setze isTextVisible auf true, falls irgendein Text sichtbar ist
        } else {
            // Setze den Text unsichtbar
            textVisibility.set(cube, false);
        }
    });

    // Verstecke den Text, falls kein Würfel nah genug ist
    if (!isTextVisible) {
        hideText();
    }
}

// Funktion zum Einblenden des Textes
function displayText(text) {
    const textDisplay = document.getElementById('text-display');
    textDisplay.innerHTML = text; // Verwenden Sie innerHTML, um HTML-Inhalte anzuzeigen
    textDisplay.classList.remove('empty'); // Entfernen Sie die 'empty'-Klasse, wenn Text vorhanden ist
}

// Funktion zum Verstecken des Textes
function hideText() {
    const textDisplay = document.getElementById('text-display');
    if (!Array.from(textVisibility.values()).some(visible => visible)) {
        textDisplay.innerText = '';
        textDisplay.classList.add('empty'); // Füge die 'empty'-Klasse hinzu, wenn kein Text angezeigt wird
    }
}

// Ring Koordinaten und grüner Würfel
const ringRadius = 8.3;
const ringGeometry = new THREE.CircleGeometry(ringRadius, 64);
const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00, side: THREE.DoubleSide });
const ring = new THREE.LineLoop(ringGeometry, ringMaterial);

// Plane
let carModel = null; // Variable zur Speicherung des geladenen Modells
assetLoader.load(carURL.href, function (gltf) {
    carModel = gltf.scene;
    scene.add(carModel);
    carModel.scale.set(0.3, 0.3, 0.3); // Skalierung des Modells
});

// Animation entlang des Rings
let angle = 0;

// Animationsschleife
function animate() {
    // Überprüfe die Kameraposition
    const cameraDirection = camera.getWorldDirection(new THREE.Vector3());
    angle = Math.atan2(cameraDirection.z, cameraDirection.x) + Math.PI; // + Math.PI um 180 Grad zu verschieben

    if (carModel) {
        carModel.position.set(
            ringRadius * Math.cos(angle),
            -1.42,
            ringRadius * Math.sin(angle)
        );
        carModel.lookAt(0, 0, 0);
    }

    checkCameraPosition();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', function() {
    location.reload();
});
