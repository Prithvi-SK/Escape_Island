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
import { Sky } from 'three/addons/objects/Sky.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import * as Ammo from "ammo.js"
import { Water } from 'three/examples/jsm/objects/Water.js';




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






const waterGeometry = new THREE.PlaneGeometry(500, 500);
const water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('https://threejs.org/examples/textures/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x00dcd6,  // Darker water for stormy effect
    distortionScale: 10.0,  // Larger distortion for bigger waves
    fog: scene.fog !== undefined,
});
water.rotation.x = -Math.PI / 2;
water.position.set(-1,-1,-1)
scene.add(water);

// Sky setup (cloudy and stormy)
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 50;  // Increase turbidity for more dense clouds
skyUniforms['rayleigh'].value = 0.5;  // Less scattering for a darker stormy sky
skyUniforms['mieCoefficient'].value = 0.1;  // Increase for a more diffused look
skyUniforms['mieDirectionalG'].value = 0.9;  // High value for more light scattering

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const parameters = {
    elevation: 1,  // Low sun to enhance stormy effect
    azimuth: 200
};

// Update sun position based on sky parameters
function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    const sunPosition = new THREE.Vector3();
    sunPosition.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms['sunPosition'].value.copy(sunPosition);
    water.material.uniforms['sunDirection'].value.copy(sunPosition).normalize();

    scene.environment = pmremGenerator.fromScene(sky).texture;
}

updateSun();









// camera
// const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
// camera.position.set(10, 15, 10);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.enablePan = false;
// controls.minDistance = 5;
// controls.maxDistance = 50;
// controls.minPolarAngle = 0.5;
// controls.maxPolarAngle = 1.5;
// controls.autoRotate = false;
// controls.target = new THREE.Vector3(10, 0, -10);
// controls.update();


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);




//spotlight falling only on the island
const sunlight = new THREE.SpotLight(0xffffff, 50000, 0, 0.5, 1);
// const sunlight = new THREE.DirectionalLight(0xffffff, 50000);
// sunlight.position.set(0, 100, 0);
// sunlight.castShadow = true;
// sunlight.shadow.bias = -0.0001;
// scene.add(sunlight);
// Create directional light to act as sunlight
// const sunlight = new THREE.DirectionalLight(0xffffff, 1); // White light with full intensity
sunlight.position.set(50, 100, 50); // Positioning light as the sun at a high angle
sunlight.castShadow = true; // Enable shadow casting

// Shadow settings for quality and performance
// sunlight.shadow.mapSize.width = 1024; // Shadow map resolution
// sunlight.shadow.mapSize.height = 1024;
sunlight.shadow.camera.near = 0.5; // Shadow camera settings
sunlight.shadow.camera.far = 500;
sunlight.shadow.camera.left = -50;
sunlight.shadow.camera.right = 50;
sunlight.shadow.camera.top = 50;
sunlight.shadow.camera.bottom = -50;

// Add sunlight to the scene
scene.add(sunlight);

// Optional: add ambient light for general brightness
// const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft ambient light for shadowed areas
// scene.add(ambientLight);






// const sky = new Sky();
// sky.scale.setScalar( 45000 );

// const phi = THREE.MathUtils.degToRad(90);
// const theta = THREE.MathUtils.degToRad( 90 );
// const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );

// sky.material.uniforms.sunPosition.value = sunPosition;

// scene.add( sky );
let boatobj = new THREE.Box3();
const boatloader = new GLTFLoader();
console.log("PPP");
boatloader.load('boat.glb', (gltf) => {
//   console.log('loading model');
//   console.log("Prithvi");
  const boatmesh = gltf.scene;

//   const woodenObject = mesh.getObjectByName("Object_51");
//   woodenObjectBox.setFromObject(woodenObject);
	boatobj=boatmesh;
  boatmesh.traverse((child) => {
    if (child.isMesh) {
    	child.castShadow = true;
    	child.receiveShadow = true;
    	console.log(child)
		// if (child.name==woodenObject.name)
		// {
		// 	console.log("BOATWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw")
		// 	const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
		// 	// Apply the red material to the mesh
		// 	child.material = redMaterial;

		// }
	  
    }
  });
  console.log(boatmesh)
  console.log("Q\nq\nq\nq\nq\nq\nq\nq\n")
  boatmesh.visible=false;
  boatmesh.position.set(21, -0.3, -4);
  boatmesh.rotation.y=Math.PI/2
  scene.add(boatmesh);

//   document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});





let woodenObjectBox = new THREE.Box3();
const colliders = []; // Array to store colliders
let islandmodel=null;
let children=[];
const loader = new GLTFLoader();
console.log("PPP");
loader.load(
  'minimodel2.glb',
  (gltf) => {
    console.log('loading model');
    console.log("Prithvi");
    const mesh = gltf.scene;
	islandmodel=gltf.scene;
    // Traverse the scene to process each object
    mesh.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Set visibility for specific objects
        if (!child.name.startsWith("wall")) {
          child.material.transparent= true;
        } else {
          child.visible = false;
        }

        // If the object is visible, create a collider
        if (child.name.startsWith("Object_7") || child.name.startsWith("Object_8")) {
			console.log("")
		}
		else{

        //   const box = new THREE.Box3().setFromObject(child); // Create bounding box
		//   const offset = new THREE.Vector3(100, 100, 100); // Adjust this if necessary
		//   box.translate(offset);
        //   colliders.push(box); // Add bounding box to colliders array

        //   // Optional: Visualize the bounding box
        //   const boxHelper = new THREE.BoxHelper(child, 0xff0000); // Red color for debugging
        //   scene.add(boxHelper);
		// Recenter geometry to fix alignment issues
		child.geometry.computeBoundingBox(); // Ensure bounding box is calculated
		const geometryCenter = new THREE.Vector3();
		child.geometry.boundingBox.getCenter(geometryCenter); // Get the geometry center
		child.geometry.center(); // Center the geometry around its origin
		
		// Offset the object's position to maintain world-space alignment
		child.position.add(geometryCenter);
	
		// Compute the bounding box in world space
		const boundingBox = new THREE.Box3().setFromObject(child);
	
		// Add the bounding box to the colliders array
		colliders.push({
			obj: child,
			box: boundingBox,
			health:5
		  });
		children.push(child);
		// For debugging: Visualize the bounding box
		const boxHelper = new THREE.BoxHelper(child, 0xff0000); // Red color
		scene.add(boxHelper);
        }
      }
    });
	// function eliminate(nam)
	// {
	// 	mesh.getObjectByName(nam).position-=5
	// }
    // Position and add the loaded model to the scene
    mesh.position.set(0, 0, 0);
    scene.add(mesh);

    // Hide progress container
    document.getElementById('progress-container').style.display = 'none';
  },
  (xhr) => {
    console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
  },
  (error) => {
    console.error(error);
  }
);

console.log("BBBBB");

  

// // loading the model
// const loader = new GLTFLoader();
// console.log("PPP");
// loader.load('minimodel.glb', (gltf) => {
//   console.log('loading model');
//   console.log("Prithvi");
//   const mesh = gltf.scene;

//   const woodenObject = mesh.getObjectByName("Object_2007");
// //   woodenObjectBox.setFromObject(woodenObject);

//   mesh.traverse((child) => {
//     if (child.isMesh) {
//     	child.castShadow = true;
//     	child.receiveShadow = true;
// 		child.visible=false
//     	console.log(child)
// 		if (child.name.startsWith("Object_30"))
// 		{
// 			// console.log("WOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOD")
// 			// const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
// 			// // Apply the red material to the mesh
// 			// child.material = redMaterial;
// 			// const outlineGeometry = new THREE.EdgesGeometry(woodenObject.geometry);
// 			// const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red color
// 			// const outlineMesh = new THREE.LineSegments(outlineGeometry, outlineMaterial);
		
// 			// // Position the outline mesh at the same position as the target object
// 			// outlineMesh.position.copy(woodenObject.position);
// 			// outlineMesh.rotation.copy(woodenObject.rotation);
// 			// outlineMesh.scale.copy(woodenObject.scale);
		
// 			// // Add the outline mesh to the scene
// 			// scene.add(outlineMesh);
// 			child.visible=true
// 		}
	  
//     //   // Create and store a bounding box for each child mesh
// 	//   if (child.name=="Object_51" || child.name=="Object_22")
// 	//   {
// 	// 	const box = new THREE.Box3().setFromObject(child);
// 	// 	colliders.push(box);  // Add bounding box to colliders array

// 	// 	const boxHelper = new THREE.BoxHelper(child, 0xff0000); // Red color
// 	// 	scene.add(boxHelper);  // Add the BoxHelper to the scene
// 	//   }

//       // Create a collider (bounding box) for each mesh
//       // child.geometry.computeBoundingBox(); // Compute bounding box based on geometry
//       // child.collider = child.geometry.boundingBox.clone(); // Clone the bounding box

//       // // Optional: Adjust the collider's position relative to the scene
//       // child.collider.min.add(child.position);
//       // child.collider.max.add(child.position);
// 	  // Create a convex hull using the vertices of the mesh
//     //   const vertices = [];
//     //   child.geometry.attributes.position.array.forEach((_, index) => {
//     //     vertices.push(new THREE.Vector3(
//     //       child.geometry.attributes.position.getX(index),
//     //       child.geometry.attributes.position.getY(index),
//     //       child.geometry.attributes.position.getZ(index)
//     //     ));
//     //   });

//     //   // Generate ConvexGeometry from vertices
//     //   const convexGeometry = new ConvexGeometry(vertices);
      
//     //   // Create a wireframe material for the convex hull
//     //   const convexMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
      
//     //   // Create a mesh for the convex hull and add it to the scene
//     //   const convexHullMesh = new THREE.Mesh(convexGeometry, convexMaterial);
//     //   convexHullMesh.position.copy(child.position);
//     //   convexHullMesh.rotation.copy(child.rotation);
//     //   convexHullMesh.scale.copy(child.scale);
      
//     // //   scene.add(convexHullMesh);  // Add the convex hull to the scene

//     //   // Add the convex hull as a collider if needed
//     //   colliders.push(convexGeometry.boundingBox);

//     }
//   });

//   mesh.position.set(0, 1.05, -1);
//   scene.add(mesh);

//   document.getElementById('progress-container').style.display = 'none';
// }, (xhr) => {
//   console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
// }, (error) => {
//   console.error(error);
// });

// console.log("BBBBB")

console.log(children)


// const chloader = new GLTFLoader();
//     let character;
//     let mixer;

//     chloader.load('MD.glb', (gltf) => {
//         character = gltf.scene;
//         character.traverse((node) => {
//             if (node.isMesh) {
//                 node.castShadow = true;
//             }
//         });
//         scene.add(character);

//         // Animation setup (if the model includes animations)
//         if (gltf.animations.length > 0) {
//             mixer = new THREE.AnimationMixer(character);
//             gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
//         }
//     });

// Material
const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });

// Character parts (scaled down)
const head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), material); // Smaller head
head.position.set(0, 0.695, 0); // Adjusted for smaller size

const body = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.375, 0.125), material); // Smaller body
body.position.set(0, 0.375, 0); // Adjusted position

const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.25, 0.125), material); // Smaller left leg
leftLeg.position.set(-0.0625, 0.125, 0); // Adjusted position

const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.25, 0.125), material); // Smaller right leg
rightLeg.position.set(0.0625, 0.125, 0); // Adjusted position

const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.25, 0.125), material); // Smaller left arm
leftArm.position.set(-0.1875, 0.6, 0); // Adjusted position

const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.125, 0.25, 0.125), material); // Smaller right arm
rightArm.position.set(0.1875, 0.6, 0); // Adjusted position

// Adjust camera position for the smaller character
head.add(camera);
camera.position.set(0, 0.1, 0.1); // Adjust for first-person view
camera.lookAt(new THREE.Vector3(0, 0.75, -0.5)); // Look slightly downward

// Group character parts for movement
const character = new THREE.Group();
character.add(head, body, leftLeg, rightLeg, leftArm, rightArm);

// Scale down the entire group to make the character even smaller (if needed)
character.scale.set(0.5, 0.5, 0.5); // Scale to 50% of its current size

character.position.set(12, 0.125, -12); // Adjust ground-level position
scene.add(character);




let isPointerLocked = false;
let rotationSpeed = 0.005; // Adjust rotation sensitivity
let characterRotation = 0; // Track current rotation

// Add event listener for pointer lock
document.addEventListener('click', () => {
    // Request pointer lock on canvas
    if (!isPointerLocked) {
        document.body.requestPointerLock();
    }
});

// Pointer lock change event
document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === document.body;
});

// Mouse movement handler
document.addEventListener('mousemove', (event) => {
    if (isPointerLocked) {
        const deltaX = event.movementX; // Movement along the X-axis
        characterRotation -= deltaX * rotationSpeed;
        character.rotation.y = characterRotation;
    }
});


// Player 1 (Red box)
// const player1Geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
// const player1Material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const player1 = new THREE.Mesh(player1Geometry, player1Material);
// player1.position.set(10, 0.25, -10);
// scene.add(player1);
// let player1BB=new THREE.Box3(new THREE.Vector3(),new THREE.Vector3()).set




// const player1Material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

// // Define body parts
// const bodyGeometry = new THREE.BoxGeometry(0.25, 0.5, 0.25);
// const headGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
// const armGeometry = new THREE.BoxGeometry(0.125, 0.375, 0.125);

// // Position parts
// const body = new THREE.Mesh(bodyGeometry, player1Material);
// body.position.set(0, 0.25, 0);

// const head = new THREE.Mesh(headGeometry, player1Material);
// head.position.set(0, 0.625, 0);

// const leftArm = new THREE.Mesh(armGeometry, player1Material);
// leftArm.position.set(-0.1875, 0.4375, 0);

// const rightArm = new THREE.Mesh(armGeometry, player1Material);
// rightArm.position.set(0.1875, 0.4375, 0);

// // Grouping character parts
// const player1 = new THREE.Group();
// player1.add(body);
// player1.add(head);
// player1.add(leftArm);
// player1.add(rightArm);
// player1.position.set(0, 0.8, 0)
// scene.add(player1);

// let armSwingDirection = 1; 

// Player 2 (Blue box)
// const player2Geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
// const player2Material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
// const player2 = new THREE.Mesh(player2Geometry, player2Material);
// player2.position.set(10, 0.25, -8.5);
// scene.add(player2);

// Movement speed
const speed = 0.1;

const moveSpeed = 0.1;
let armSwingDirection = 1; // 1 = swinging up, -1 = swinging down
// const keysPressed = {};

let legAngle = 0;
let swingDirection = 1;

const jumpHeight = 0.1;
const gravity = -0.01;
let isJumping = false;
let jumpVelocity = 0;


// Key state tracking
const keyState = {
  character: { w: false, a: false, s: false, d: false, q: false, e: false, c: false, f: false },

};


// window.addEventListener('keydown', (event) => keysPressed[event.key.toLowerCase()] = true);
// window.addEventListener('keyup', (event) => keysPressed[event.key.toLowerCase()] = false);


window.addEventListener('keydown', (event) => {
	const key = event.key.toLowerCase(); // Normalize to lowercase
	// console.log(`Key down: ${key}`);
	if (key in keyState.character) keyState.character[key] = true;
	// if (key in keyState.player2) keyState.player2[key] = true;
	if (event.code === 'Space' && !isJumping) {
	  isJumping = true;
	  jumpVelocity = jumpHeight;
	}
  });
  
window.addEventListener('keyup', (event) => {
	const key = event.key.toLowerCase(); // Normalize to lowercase
	// console.log(`Key up: ${key}`);
	if (key in keyState.character) keyState.character[key] = false;
	// if (key in keyState.player2) keyState.player2[key] = false;
});
  
let characterBox = new THREE.Box3().setFromObject(character);
// let player2Box = new THREE.Box3().setFromObject(player2);
// let characterBox= new THREE.Box3().setFromObject(character);

// // player 1 red box
// const geometry1 = new THREE.BoxGeometry(0.05, 0.05, 0.05);
// const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
// const playerMesh1 = new THREE.Mesh(geometry1, material1);
// // Position the player
// playerMesh1.position.set(0, 1.3, 0);
// // Add player to the scene
// scene.add(playerMesh1); 


// // player 2 blue box
// const geometry2 = new THREE.BoxGeometry(0.05, 0.05, 0.05);
// const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Red color
// const playerMesh2 = new THREE.Mesh(geometry2, material2);
// // Position the player
// playerMesh2.position.set(0.08, 1.3, 0);
// // Add player to the scene
// scene.add(playerMesh2); 


var touching=[];

function checkCollisions(playerBox) {
	for (const collider of colliders) {
	  if (playerBox.intersectsBox(collider.box)) {
		touching.push(collider)
		return [true,collider]; // Collision detected
	  }
	}
	touching=[]
	return [false,0]; // No collision
  }
  
  function updatePlayers() {
	// Update the bounding boxes
	characterBox.setFromObject(character);
	// player2Box.setFromObject(player2);
  // characterBox.setFromObject(character)
  
	// Player 1 Movement
	if (keyState.character.w) {
    character.position.z -= Math.cos(characterRotation) * speed;
    character.position.x -= Math.sin(characterRotation) * speed;
    // legAngle += 0.1;
    // leftLeg.rotation.x = Math.sin(legAngle) * 0.5;
    // rightLeg.rotation.x = -Math.sin(legAngle) * 0.5;
	  characterBox.setFromObject(character); // Update bounding box
	  if (checkCollisions(characterBox)[0]) {
		// character.position.z += speed; // Undo movement
    character.position.z += Math.cos(characterRotation) * speed;
    character.position.x += Math.sin(characterRotation) * speed; // Undo movement

	  }
	  console.log(checkCollisions(characterBox))
	}
  else
  {
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
  }
	if (keyState.character.s) {
	  // character.position.z += speed;
    character.position.z += Math.cos(characterRotation) * speed;
    character.position.x += Math.sin(characterRotation) * speed;
    // legAngle += 0.1;
    // leftLeg.rotation.x = Math.sin(legAngle) * 0.5;
    // rightLeg.rotation.x = -Math.sin(legAngle) * 0.5;
	  characterBox.setFromObject(character);
	  if (checkCollisions(characterBox)[0]) {
		// character.position.z -= speed;
    character.position.z -= Math.cos(characterRotation) * speed;
    character.position.x -= Math.sin(characterRotation) * speed; // Undo movement
	  }
	}
  else
  {
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
  }
	if (keyState.character.a) {
	  // character.position.x -= speed;
    character.position.z += Math.sin(characterRotation) * speed;
    character.position.x -= Math.cos(characterRotation) * speed;
    // legAngle += 0.1;
    // leftLeg.rotation.x = Math.sin(legAngle) * 0.5;
    // rightLeg.rotation.x = -Math.sin(legAngle) * 0.5;
	  characterBox.setFromObject(character);
	  if (checkCollisions(characterBox)[0]) {
		// character.position.x += speed;
    character.position.z -= Math.sin(characterRotation) * speed;
    character.position.x += Math.cos(characterRotation) * speed; // Undo movement
	  }
	}
  else
  {
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
  }
	if (keyState.character.d) {
	  // character.position.x += speed;
    character.position.z -= Math.sin(characterRotation) * speed;
    character.position.x += Math.cos(characterRotation) * speed;
    // legAngle += 0.1;
    // leftLeg.rotation.x = Math.sin(legAngle) * 0.5;
    // rightLeg.rotation.x = -Math.sin(legAngle) * 0.5;
	  characterBox.setFromObject(character);
	  if (checkCollisions(characterBox)[0]) {
		// character.position.x -= speed;
    character.position.z += Math.sin(characterRotation) * speed;
    character.position.x -= Math.cos(characterRotation) * speed; // Undo movement
	  }
	}
  else
  {
    leftLeg.rotation.x = 0;
    rightLeg.rotation.x = 0;
  }
    if (touching.length>0 && keyState.character.q) {
      swingDirection = swingDirection === 1 ? -1 : 1;
      rightArm.rotation.z += swingDirection * 0.5;
      if (Math.abs(rightArm.rotation.z) > Math.PI / 4) {
        swingDirection = -swingDirection;
      }
		if (touching[0].obj.name.startsWith("Object_3"))
		{
			
			if (document.getElementById("wcount").innerHTML!="500")
			{
				document.getElementById("wcount").innerHTML=(parseInt(document.getElementById("wcount").innerHTML)+10).toString();
				keyState.character.q=false;
				if (document.getElementById("wcount").innerHTML=="500")
				{
					document.getElementById("wcount").style.color="green";
				}
			}
		}
		if (touching[0].obj.name.startsWith("Object_5"))
		{
			if (document.getElementById("mcount").innerHTML!="5")
			{
				document.getElementById("mcount").innerHTML=(parseInt(document.getElementById("mcount").innerHTML)+1).toString();
				keyState.character.q=false;
				if (document.getElementById("mcount").innerHTML=="5")
				{
					document.getElementById("mcount").style.color="green";
				}
			}
		}
		if (touching[0].obj.name.startsWith("C"))
		{
			if (document.getElementById("fcount").innerHTML!="100")
			{
				document.getElementById("fcount").innerHTML=(parseInt(document.getElementById("fcount").innerHTML)+5).toString();
				keyState.character.q=false;
				if (document.getElementById("fcount").innerHTML=="100")
				{
					document.getElementById("fcount").style.color="green";
				}
			}
		}
		// touching[0].visible=false;
		let originalEmissive = touching[0].obj.material
		touching[0].obj.material = new THREE.Color(0xffffff);
		// touching[0].material.emissiveIntensity = 1;
		setTimeout(() => {
			touching[0].obj.material=(originalEmissive); // Restore original color
		}, 250);

		// touching[0].obj.position-=5;
		for (let i of colliders)
		{
			if (i==touching[0].obj)
			{
				i.health-=1;
				if (i.health<1)
				{
					// i.visible=false
					// touching[0].obj.position-=5;
					// touching=[];
				}
				break;
			}
		}
	}
  else {
    rightArm.rotation.z = 0;
  }
	if (touching.length>0 && keyState.character.e) {
    swingDirection = swingDirection === 1 ? -1 : 1;
      leftArm.rotation.z += swingDirection * 0.5;
      if (Math.abs(leftArm.rotation.z) > Math.PI / 4) {
        swingDirection = -swingDirection;
      }
		if (touching[0].obj.name.startsWith("Object_4"))
		{
			if (document.getElementById("rcount").innerHTML!="50")
			{
				document.getElementById("rcount").innerHTML=(parseInt(document.getElementById("rcount").innerHTML)+5).toString();
				keyState.character.e=false;
				if (document.getElementById("rcount").innerHTML=="50")
				{
					document.getElementById("rcount").style.color="green";
				}
				// touching[0].obj.visible=false
			}
		}

		if (touching[0].obj.name.startsWith("C"))
		{
			if (document.getElementById("scount").innerHTML!="30")
				{
					document.getElementById("scount").innerHTML=(parseInt(document.getElementById("scount").innerHTML)+5).toString();
					keyState.character.e=false;
					if (document.getElementById("scount").innerHTML=="30")
					{
						document.getElementById("scount").style.color="green";
					}
				}
		}
			// touching[0].visible=false;
		let originalEmissive = touching[0].obj.material
		touching[0].obj.material = new THREE.Color(0xffffff);
		// touching[0].material.emissiveIntensity = 1;
		setTimeout(() => {
			touching[0].obj.material=(originalEmissive); // Restore original color
		}, 100);

		// touching[0].obj.position-=5;
		for (let i of colliders)
		{
			if (i==touching[0].obj)
			{
				i.health-=1;
				if (i.health<1)
				{
					// i.visible=false
					// touching[0].obj.position-=5;
					// touching=[];
				}
				break;
			}
		}
	//   if (checkCollisions(characterBox)) character.position.x -= speed;
	}
  else {
    leftArm.rotation.z = 0;
  }
	if (keyState.character.c) {
		if (document.getElementById("scount").innerHTML=="30" && document.getElementById("rcount").innerHTML=="50" && document.getElementById("fabcount").innerHTML!="2")
			{
				// document.getElementById("fabricbut").disabled=false;
				document.getElementById("scount").innerHTML="0"
				document.getElementById("rcount").innerHTML="0"
				document.getElementById("fabcount").innerHTML=(parseInt(document.getElementById("fabcount").innerHTML)+1).toString();
				document.getElementById("scount").style.color="red"
				document.getElementById("rcount").style.color="red"
				keyState.character.c=false;
				if (document.getElementById("fabcount").innerHTML=="2")
				{
					document.getElementById("fabcount").style.color="green"
				}
			}

	//   if (checkCollisions(characterBox)) character.position.x -= speed;
	}
  if (keyState.character.f) {
  		// character.position.z -= speed;
  		if ((document.getElementById("wcount").style.color=="green") &&
  			(document.getElementById("rcount").style.color=="green") &&
  			(document.getElementById("scount").style.color=="green") &&
  			(document.getElementById("fcount").style.color=="green") && 
  			(document.getElementById("fabcount").style.color=="green") )
  		{
  			boatobj.visible=true
  			document.getElementById("successdiv").innerHTML="Congratulations!!\n You have crafted your boat at the harbour"
  		}
  	//   if (checkCollisions(player1Box)) player1.position.z += speed;
  	}
	// Player 1 Jump Logic
	if (isJumping) {
	  character.position.y += jumpVelocity;
	  jumpVelocity += gravity;
	  if (character.position.y <= 0) {
		character.position.y = 0.125; // Reset position
		isJumping = false; // Stop jumping
		jumpVelocity = 0;
	  }
	}
  
	// // Player 2 Movement
	// if (keyState.player2.ArrowUp) {
	//   player2.position.z -= speed;
	//   player2Box.setFromObject(player2);
	//   if (checkCollisions(player2Box)[0]) {
	// 	player2.position.z += speed;
	//   }
	// }
	// if (keyState.player2.ArrowDown) {
	//   player2.position.z += speed;
	//   player2Box.setFromObject(player2);
	//   if (checkCollisions(player2Box)[0]) {
	// 	player2.position.z -= speed;
	//   }
	// }
	// if (keyState.player2.ArrowLeft) {
	//   player2.position.x -= speed;
	//   player2Box.setFromObject(player2);
	//   if (checkCollisions(player2Box)[0]) {
	// 	player2.position.x += speed;
	//   }
	// }
	// if (keyState.player2.ArrowRight) {
	//   player2.position.x += speed;
	//   player2Box.setFromObject(player2);
	//   if (checkCollisions(player2Box)[0]) {
	// 	player2.position.x -= speed;
	//   }
	// }
  }
  

  function animate() {
    // requestAnimationFrame(animate);
    // controls.update();
    // // renderer.render(scene, camera);
  
    requestAnimationFrame(animate);
    water.material.uniforms['time'].value += 1.0 / 50.0;  // Slower, more intense waves
    // controls.update();
    updatePlayers();
    // let a = document.getElementById("toolbar")
  //   checkColl()
    // player1Box.setFromObject(player1);
    // if (player1Box.intersectsBox(woodenObjectBox)) 
    // {
      // 	console.log("Player 1 intersects with the wooden object!");
    // }
    renderer.render(scene, camera);
  
    // // Update player positions
    // // updatePlayerPositions();
  
    // // Render the scene
    // renderer.render(scene, camera);
  }
  
  animate();

// function updatePlayers() {
// 	// console.log('Updating players...');
// 	// console.log(keyState); // Track the current key states
	
	
// 	// Update Player 1 position
// 	if (keyState.character.f) {
// 		// character.position.z -= speed;
// 		if ((document.getElementById("wcount").style.color=="green") &&
// 			(document.getElementById("rcount").style.color=="green") &&
// 			(document.getElementById("scount").style.color=="green") &&
// 			(document.getElementById("mcount").style.color=="green") &&
// 			(document.getElementById("fcount").style.color=="green") && 
// 			(document.getElementById("fabcount").style.color=="green") )
// 		{
// 			boatobj.visible=true
// 			document.getElementById("successdiv").innerHTML="Congratulations!!\n You have crafted your boat at the harbour"
// 		}
// 	//   if (checkCollisions(player1Box)) player1.position.z += speed;
// 	}
// 	if (keyState.player1.w) {
// 		player1.position.z -= speed;
// 	//   if (checkCollisions(player1Box)) player1.position.z += speed;
// 	}
// 	if (keyState.player1.s) {
// 		player1.position.z += speed;
// 	//   if (checkCollisions(player1Box)) player1.position.z -= speed;
// 	}
// 	if (keyState.player1.a) {
// 		player1.position.x -= speed;
// 	//   if (checkCollisions(player1Box)) player1.position.x += speed;
// 	}
// 	if (keyState.player1.d) {
// 		player1.position.x += speed;
// 	//   if (checkCollisions(player1Box)) player1.position.x -= speed;
// 	}
// 	if (keyState.player1.q) {
// 		if (document.getElementById("wcount").innerHTML!="500")
// 		{
// 			document.getElementById("wcount").innerHTML=(parseInt(document.getElementById("wcount").innerHTML)+10).toString();
// 			keyState.player1.q=false;
// 			if (document.getElementById("wcount").innerHTML=="500")
// 			{
// 				document.getElementById("wcount").style.color="green";
// 			}
// 		}
// 		if (document.getElementById("rcount").innerHTML!="50")
// 		{
// 			document.getElementById("rcount").innerHTML=(parseInt(document.getElementById("rcount").innerHTML)+5).toString();
// 			keyState.player1.q=false;
// 			if (document.getElementById("rcount").innerHTML=="50")
// 			{
// 				document.getElementById("rcount").style.color="green";
// 			}
// 		}
		
// 	//   if (checkCollisions(player1Box)) player1.position.x -= speed;
// 	}
// 	if (keyState.player1.e) {
// 		if (document.getElementById("mcount").innerHTML!="5")
// 		{
// 			document.getElementById("mcount").innerHTML=(parseInt(document.getElementById("mcount").innerHTML)+1).toString();
// 			keyState.player1.e=false;
// 			if (document.getElementById("mcount").innerHTML=="5")
// 			{
// 				document.getElementById("mcount").style.color="green";
// 			}
// 		}
// 		if (document.getElementById("fcount").innerHTML!="100")
// 		{
// 			document.getElementById("fcount").innerHTML=(parseInt(document.getElementById("fcount").innerHTML)+5).toString();
// 			keyState.player1.e=false;
// 			if (document.getElementById("fcount").innerHTML=="100")
// 			{
// 				document.getElementById("fcount").style.color="green";
// 			}
// 		}
// 		if (document.getElementById("scount").innerHTML!="30")
// 			{
// 				document.getElementById("scount").innerHTML=(parseInt(document.getElementById("scount").innerHTML)+5).toString();
// 				keyState.player1.e=false;
// 				if (document.getElementById("scount").innerHTML=="30")
// 				{
// 					document.getElementById("scount").style.color="green";
// 				}
// 			}
		
// 	//   if (checkCollisions(player1Box)) player1.position.x -= speed;
// 	}

// 	if (keyState.player1.c) {
// 		if (document.getElementById("scount").innerHTML=="30" && document.getElementById("rcount").innerHTML=="50" && document.getElementById("fabcount").innerHTML!="2")
// 			{
// 				// document.getElementById("fabricbut").disabled=false;
// 				document.getElementById("scount").innerHTML="0"
// 				document.getElementById("rcount").innerHTML="0"
// 				document.getElementById("fabcount").innerHTML=(parseInt(document.getElementById("fabcount").innerHTML)+1).toString();
// 				document.getElementById("scount").style.color="red"
// 				document.getElementById("rcount").style.color="red"
// 				keyState.player1.c=false;
// 				if (document.getElementById("fabcount").innerHTML=="2")
// 				{
// 					document.getElementById("fabcount").style.color="green"
// 				}
// 			}

// 	//   if (checkCollisions(player1Box)) player1.position.x -= speed;
// 	}
// 	// if (document.getElementById("scount").innerHTML=="30" && document.getElementById("rcount").innerHTML=="100")
// 	// {
// 	// 	document.getElementById("fabricbut").disabled=false;
// 	// }
// 	// Player 1 Jump Logic
// 	if (isJumping) {
// 		player1.position.y += jumpVelocity;
// 		jumpVelocity += gravity;
// 		if (player1.position.y <= 1.9) {
// 		player1.position.y = 1.9;
// 		isJumping = false;
// 		jumpVelocity = 0;
// 		}
// 	}

// 	// Update Player 2 position
// 	if (keyState.player2.arrowup) {
// 		player2.position.z -= speed;
// 	//   if (checkCollisions(player2Box)) player2.position.z += speed;
// 	}
// 	if (keyState.player2.arrowdown) {
// 		player2.position.z += speed;
// 	//   if (checkCollisions(player2Box)) player2.position.z -= speed;
// 	}
// 	if (keyState.player2.arrowleft) {
// 		player2.position.x -= speed;
// 	//   if (checkCollisions(player2Box)) player2.position.x += speed;
// 	}
// 	if (keyState.player2.arrowright) {
// 		player2.position.x += speed;
// 	//   if (checkCollisions(player2Box)) player2.position.x -= speed;
// 	}
// }
  










// function toggleboat(){
// 	woodb=(document.getElementById("wcount").style.color=="green")
// 	ropeb=(document.getElementById("rcount").style.color=="green")
// 	woolb=(document.getElementById("scount").style.color=="green")
// 	torchb=(document.getElementById("mcount").style.color=="green")
// 	foodb=(document.getElementById("fcount").style.color=="green")
// 	fabricb=(document.getElementById("fabcount").style.color=="green")
// 	if (woodb && ropeb && woolb && torchb && foodb && fabricb)
// 	{
// 		boatmesh.visible=!boatmesh.visible
// 	}

// }
// document.getElementById("fabricbut").addEventListener("click",toggleboat);
// // Event listeners for key down and up
// window.addEventListener('keydown', (event) => {
//   if (event.key in keyState.player1) keyState.player1[event.key] = true;
//   if (event.key in keyState.player2) keyState.player2[event.key] = true;
//   if (event.code === 'Space' && !isJumping) {
//     isJumping = true;
//     jumpVelocity = jumpHeight;
//   }
// });

// window.addEventListener('keyup', (event) => {
//   if (event.key in keyState.player1) keyState.player1[event.key] = false;
//   if (event.key in keyState.player2) keyState.player2[event.key] = false;
// });


// // Update player positions
// function updatePlayers() {
//   const player1Box = new THREE.Box3().setFromObject(player1);
//   const player2Box = new THREE.Box3().setFromObject(player2);
//   // Update Player 1 position
//   if (keyState.player1.w) 
//   {
//     player1.position.z -= speed;
//     if (checkCollisions(player1Box)) player1.position.z += speed;  // Revert if collision
//   }
//   if (keyState.player1.s)
//   {
//     player1.position.z += speed;
//     if (checkCollisions(player1Box)) player1.position.z -= speed;
//   }
//   if (keyState.player1.a)
//   {
//     player1.position.x -= speed;
//     if (checkCollisions(player1Box)) player1.position.x += speed;
//   }
//   if (keyState.player1.d)
//   {
//     player1.position.x += speed;
// 	if (checkCollisions(player1Box)) player1.position.x -= speed;
//   }



//   // Jump logic
//   if (isJumping) {
//     player1.position.y += jumpVelocity;
//     jumpVelocity += gravity;

//     if (player1.position.y <= 1.9) {
//       player1.position.y = 1.9;
//       isJumping = false;
//       jumpVelocity = 0;
//     }
//   }


//   // Update Player 2 position
//   if (keyState.player2.ArrowUp)
//   {
// 	player2.position.z -= speed;
// 	if (checkCollisions(player2Box)) player2.position.z += speed;
//   }
//   if (keyState.player2.ArrowDown)
//   {
// 	player2.position.z += speed;
// 	if (checkCollisions(player2Box)) player2.position.z -= speed;
//   }
//   if (keyState.player2.ArrowLeft)
//   {
// 	player2.position.x -= speed;
// 	if (checkCollisions(player2Box)) player2.position.x += speed;
//   }
//   if (keyState.player2.ArrowRight)
//   {
// 	player2.position.x += speed;
// 	if (checkCollisions(player2Box)) player2.position.x -= speed;
//   }
// }


// function checkCollisions(playerBox) {
// 	for (const collider of colliders) {
// 	  if (playerBox.intersectsBox(collider)) {
// 		console.log(collider.name)
// 		console.log("Collided")
// 		return false;  // Collision detected
// 	  }
// 	}
// 	return true;  // No collision
//   }















// // player 1 red box
// const geometry1 = new THREE.BoxGeometry(0.05, 0.05, 0.05);
// const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
// const playerMesh1 = new THREE.Mesh(geometry1, material1);
// // Position the player
// playerMesh1.position.set(0, 1.4, 0);
// // Add player to the scene
// scene.add(playerMesh1); 


// // player 2 blue box
// const geometry2 = new THREE.BoxGeometry(0.05, 0.05, 0.05);
// const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Red color
// const playerMesh2 = new THREE.Mesh(geometry2, material2);
// // Position the player
// playerMesh2.position.set(0.08, 1.4, 0);
// // Add player to the scene
// scene.add(playerMesh2); 







// // Movement variables
// const player1Velocity = new THREE.Vector3();
// const player2Velocity = new THREE.Vector3();
// const speed = 0.02;

// // Key states for both players
// const keysPressed = {
//   player1: { w: false, a: false, s: false, d: false },
//   player2: { i: false, j: false, k: false, l: false }
// };

// // Event listeners for keydown and keyup
// window.addEventListener('keydown', (event) => {
//   switch (event.key) {
//     case 'w': keysPressed.player1.w = true; break;
//     case 'a': keysPressed.player1.a = true; break;
//     case 's': keysPressed.player1.s = true; break;
//     case 'd': keysPressed.player1.d = true; break;
//     case 'i': keysPressed.player2.i = true; break;
//     case 'j': keysPressed.player2.j = true; break;
//     case 'k': keysPressed.player2.k = true; break;
//     case 'l': keysPressed.player2.l = true; break;
//   }
// });

// window.addEventListener('keyup', (event) => {
//   switch (event.key) {
//     case 'w': keysPressed.player1.w = false; break;
//     case 'a': keysPressed.player1.a = false; break;
//     case 's': keysPressed.player1.s = false; break;
//     case 'd': keysPressed.player1.d = false; break;
//     case 'i': keysPressed.player2.i = false; break;
//     case 'j': keysPressed.player2.j = false; break;
//     case 'k': keysPressed.player2.k = false; break;
//     case 'l': keysPressed.player2.l = false; break;
//   }
// });

// // Update player positions based on key states
// function updatePlayerPositions() {
//   // Update Player 1's velocity
//   player1Velocity.set(0, 0, 0);
//   if (keysPressed.player1.w) player1Velocity.z -= speed;
//   if (keysPressed.player1.s) player1Velocity.z += speed;
//   if (keysPressed.player1.a) player1Velocity.x -= speed;
//   if (keysPressed.player1.d) player1Velocity.x += speed;

//   // Apply velocity to Player 1's position
//   playerMesh1.position.add(player1Velocity);

//   // Update Player 2's velocity
//   player2Velocity.set(0, 0, 0);
//   if (keysPressed.player2.i) player2Velocity.z -= speed;
//   if (keysPressed.player2.k) player2Velocity.z += speed;
//   if (keysPressed.player2.j) player2Velocity.x -= speed;
//   if (keysPressed.player2.l) player2Velocity.x += speed;

//   // Apply velocity to Player 2's position
//   playerMesh2.position.add(player2Velocity);


  
// }







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










// // loading the model
// const loader = new GLTFLoader();
// console.log("PPP");
// loader.load('isl.glb', (gltf) => {
//   console.log('loading model');
//   console.log("Prithvi");
//   const mesh = gltf.scene;

//   mesh.traverse((child) => {
//     if (child.isMesh) {
//       child.castShadow = true;
//       child.receiveShadow = true;
//     }
//   });

//   mesh.position.set(0, 1.05, -1);
//   scene.add(mesh);

//   document.getElementById('progress-container').style.display = 'none';
// }, (xhr) => {
//   console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
// }, (error) => {
//   console.error(error);
// });

// console.log("BBBBB")






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














// function animate() {
//   requestAnimationFrame(animate);
//   controls.update();
//   renderer.render(scene, camera);
// }

// animate();