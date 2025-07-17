import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('atom-container').appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
document.getElementById('atom-container').appendChild(labelRenderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffd700, 1.5, 100);
scene.add(pointLight);

// --- ATOM GROUP ---
const atom = new THREE.Group();
scene.add(atom);

// --- NUCLEUS ---
const nucleusGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const nucleusMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffd700,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.3,
});
const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
atom.add(nucleus);

const nucleusDiv = document.createElement('div');
nucleusDiv.className = 'nucleus-label';
nucleusDiv.textContent = 'Value';
const nucleusLabel = new CSS2DObject(nucleusDiv);
nucleusLabel.position.set(0, 0, 0);
nucleus.add(nucleusLabel);

// --- ELECTRONS & ORBITS ---
const electrons = [];
const electronData = [
    { name: 'Confidence', affirmation: 'I am a confident creator of my financial reality.' },
    { name: 'Flow', affirmation: 'Money flows to me easily, frequently, and abundantly.' },
    { name: 'Service', affirmation: 'The more I serve, the more I earn. My service is valuable.' },
    { name: 'Vision', affirmation: 'My vision is clear and I attract all the resources I need to realize it.' },
    { name: 'Desire', affirmation: 'My desires are pure and guide me to my highest potential and prosperity.' },
    { name: 'Worthiness', affirmation: 'I deserve to receive wealth without guilt or effort.' },
];

const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffd700,
    opacity: 0.3,
    transparent: true,
});

electronData.forEach((data, i) => {
    const orbitGroup = new THREE.Group();
    const radiusX = 4 + i * 0.8;
    const radiusZ = 6 + i * 0.4;

    const orbitPoints = new THREE.Path().ellipse(0, 0, radiusX, radiusZ, 0, 2 * Math.PI, false, 0).getPoints(128);
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    orbitGroup.add(orbit);

    orbitGroup.rotation.y = Math.random() * Math.PI;
    orbitGroup.rotation.x = Math.random() * Math.PI - Math.PI / 2;
    atom.add(orbitGroup);

    const electronGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const electronMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        emissive: 0x00ffff,
        emissiveIntensity: 0,
        metalness: 0.9,
        roughness: 0.2,
    });
    const electron = new THREE.Mesh(electronGeometry, electronMaterial);
    electron.userData = { ...data, radiusX, radiusZ, speed: 0.005 + Math.random() * 0.005, offset: Math.random() * 2 * Math.PI, isPaused: false };
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'label';
    labelDiv.textContent = data.name;
    const electronLabel = new CSS2DObject(labelDiv);
    electron.add(electronLabel);
    electron.userData.label = electronLabel;
    
    orbitGroup.add(electron);
    electrons.push(electron);
});

// --- INTERACTIVITY ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const affirmationModal = new bootstrap.Modal(document.getElementById('affirmationModal'));
let activeElectron = null;

function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(electrons);

    if (intersects.length > 0) {
        const clickedElectron = intersects[0].object;

        if (activeElectron === clickedElectron) { // Unpause if clicking the active one
            clickedElectron.userData.isPaused = false;
            clickedElectron.material.emissiveIntensity = 0;
            activeElectron = null;
            affirmationModal.hide();
        } else {
            // Unpause previously active electron
            if (activeElectron) {
                activeElectron.userData.isPaused = false;
                activeElectron.material.emissiveIntensity = 0;
            }
            
            // Pause new one
            activeElectron = clickedElectron;
            activeElectron.userData.isPaused = true;
            activeElectron.material.emissiveIntensity = 1.5;
            
            // Show modal
            document.getElementById('affirmationModalLabel').innerText = activeElectron.userData.name;
            document.getElementById('affirmation-text').innerText = activeElectron.userData.affirmation;
            affirmationModal.show();
        }
    }
}

document.getElementById('affirmationModal').addEventListener('hidden.bs.modal', () => {
    if (activeElectron) {
        activeElectron.userData.isPaused = false;
        activeElectron.material.emissiveIntensity = 0;
        activeElectron = null;
    }
});


window.addEventListener('click', onClick);

// --- ANIMATION LOOP ---
function animate(time) {
    requestAnimationFrame(animate);

    atom.rotation.y += 0.001;

    electrons.forEach(electron => {
        const { userData } = electron;
        if (!userData.isPaused) {
            const t = (time * userData.speed) + userData.offset;
            electron.position.x = userData.radiusX * Math.cos(t);
            electron.position.z = userData.radiusZ * Math.sin(t);
        }
        userData.label.lookAt(camera.position); // Make label always face camera
    });

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// --- RESIZE HANDLING ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// Start animation
animate(0);

