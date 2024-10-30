// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'


// ReactDOM.createRoot(document.getElementById('root')).render(<App />)

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';



// initial set up of window
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();





// camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(4, 5, 8);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 5;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();



// player 1 red box
const geometry1 = new THREE.BoxGeometry(0.05, 0.05, 0.05);
const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
const playerMesh1 = new THREE.Mesh(geometry1, material1);
// Position the player
playerMesh1.position.set(0, 1.3, 0);
// Add player to the scene
scene.add(playerMesh1); 


// player 2 blue box
const geometry2 = new THREE.BoxGeometry(0.05, 0.05, 0.05);
const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Red color
const playerMesh2 = new THREE.Mesh(geometry2, material2);
// Position the player
playerMesh2.position.set(0.08, 1.3, 0);
// Add player to the scene
scene.add(playerMesh2); 













// const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
// groundGeometry.rotateX(-Math.PI / 2);
// const groundMaterial = new THREE.MeshStandardMaterial({
//   color: 0x555555,
//   side: THREE.DoubleSide
// });
// const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
// groundMesh.castShadow = false;
// groundMesh.receiveShadow = true;
// scene.add(groundMesh);







//spotlight falling only on the island
const sunlight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
sunlight.position.set(0, 25, 0);
sunlight.castShadow = true;
sunlight.shadow.bias = -0.0001;
scene.add(sunlight);



// loading the model
const loader = new GLTFLoader();
console.log("PPP");
loader.load('isl.glb', (gltf) => {
  console.log('loading model');
  console.log("Prithvi");
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mesh.position.set(0, 1.05, -1);
  scene.add(mesh);

  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});

console.log("BBBBB")






// window.addEventListener('resize', () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();
//   renderer.setSize(window.innerWidth, window.innerHeight);
// });












// const plcam = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// camera.position.set( 0, 10, 10 ); // Initial camera position

// const playercontr = new OrbitControls( plcam, renderer.domElement );

// const plcont = new FlyControls( plcam, renderer.domElement );

// plcont.movementSpeed = 10; // Adjust movement speed

// window.addEventListener('keydown', onKeyDown, false);

    

// function onKeyDown(event) {

//     switch (event.key) {

//         case 'w': // Move forward

//             controls.moveForward(true);

//             break;

//         case 's': // Move backward

//             controls.moveForward(false);

//             break;

//         case 'a': // Move left

//             controls.moveRight(false);

//             break;

//         case 'd': // Move right

//             controls.moveRight(true);

//             break;

//         // ... add more controls for up/down movement as needed

//     }

// }


















function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();