import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import * as Ammo from "ammo.js";
import { Water } from 'three/examples/jsm/objects/Water.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';

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

// Water setup with stormy effect
const waterGeometry = new THREE.PlaneGeometry(200, 200);
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
water.position.set(-1, -1, -1);
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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// spotlight falling only on the island
const sunlight = new THREE.SpotLight(0xffffff, 50000, 0, 0.5, 1);

sunlight.position.set(50, 100, 50); // Positioning light as the sun at a high angle
sunlight.castShadow = true; // Enable shadow casting

sunlight.shadow.camera.near = 0.5; // Shadow camera settings
sunlight.shadow.camera.far = 500;
sunlight.shadow.camera.left = -50;
sunlight.shadow.camera.right = 50;
sunlight.shadow.camera.top = 50;
sunlight.shadow.camera.bottom = -50;

// Add sunlight to the scene
scene.add(sunlight);


// Compressor
const boatloader = new GLTFLoader();
const loader = new GLTFLoader();

const dLoader=new DRACOLoader();
dLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
dLoader.setDecoderConfig({type:"js"});
boatloader.setDRACOLoader(dLoader);
loader.setDRACOLoader(dLoader);


// Boat to escape in
let boatobj = new THREE.Box3();

boatloader.load('boat2.glb', (gltf) => {
    const boatmesh = gltf.scene;

    boatobj = boatmesh;
    boatmesh.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            console.log(child);
        }
    });
    console.log(boatmesh);
    boatmesh.visible = false;	// will be made visible at the end of the game
    boatmesh.position.set(21, -0.3, -4);	// location at harbour
    boatmesh.rotation.y = Math.PI / 2;
    scene.add(boatmesh);
}, (xhr) => {
    console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
    console.error(error);
});

const colliders = []; // Array to store colliders
let islandmodel = null;
let children = [];

// loading main island model made in blender
loader.load(
    'minimodel3.glb',
    (gltf) => {
        console.log('loading model');
        const mesh = gltf.scene;
        islandmodel = gltf.scene;

        // Traverse the scene to process each object
        mesh.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Boundaries around the island are made invisible so that the player does not fall out of the island
                if (!child.name.startsWith("wall")) {
                    child.material.transparent = true;
                } else {
                    child.visible = false;
                }

                // No collider for a few objects
                if (child.name.startsWith("Object_7") || child.name.startsWith("Object_8")) {
                    console.log("");
                } else {
                    // For collider
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
                        health: 5
                    });
                    children.push(child);
                }
            }
        });

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

console.log(children);

// Character creation
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

// For FPP view
head.add(camera);
camera.position.set(0, 0.1, 0.1); // Adjust for first-person view
camera.lookAt(new THREE.Vector3(0, 0.75, -0.5)); // Look slightly downward

// Group character parts for movement
const character = new THREE.Group();
character.add(head, body, leftLeg, rightLeg, leftArm, rightArm);

// Scale down the entire group to make the character even smaller (if needed)
character.scale.set(0.5, 0.5, 0.5); // Scale to 50% of its current size

character.position.set(12, 0, -3); // Set starting position for the character

// Add the character to the scene
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

// Movement speed
const speed = 0.1;
const moveSpeed = 0.1;
let armSwingDirection = 1; // 1 = swinging up, -1 = swinging down
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

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase(); // Normalize to lowercase
    // console.log(`Key down: ${key}`);
    if (key in keyState.character) keyState.character[key] = true;
    if (event.code === 'Space' && !isJumping) {
        isJumping = true;
        jumpVelocity = jumpHeight;
    }
});

window.addEventListener('keyup', (event) => {
    const key = event.key.toLowerCase(); // Normalize to lowercase
    if (key in keyState.character) keyState.character[key] = false;
});

let characterBox = new THREE.Box3().setFromObject(character);

// Array to store all the objects the character is touching
var touching = [];

function checkCollisions(playerBox) {
    for (const collider of colliders) {
        if (playerBox.intersectsBox(collider.box)) {
            touching.push(collider);
            return [true, collider]; // Collision detected
        }
    }
    touching = [];
    return [false, 0]; // No collision
}

function updatePlayers() {
    // Update the bounding boxes
    characterBox.setFromObject(character);

    // Player movement

    // Forward W
    if (keyState.character.w) {
        character.position.z -= Math.cos(characterRotation) * speed;
        character.position.x -= Math.sin(characterRotation) * speed;
        characterBox.setFromObject(character); // Update bounding box
        if (checkCollisions(characterBox)[0]) {
            character.position.z += Math.cos(characterRotation) * speed;
            character.position.x += Math.sin(characterRotation) * speed; // Undo movement
        }
        console.log(checkCollisions(characterBox));
    } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }

    // Backward S
    if (keyState.character.s) {
        character.position.z += Math.cos(characterRotation) * speed;
        character.position.x += Math.sin(characterRotation) * speed;
        characterBox.setFromObject(character);
        if (checkCollisions(characterBox)[0]) {
            character.position.z -= Math.cos(characterRotation) * speed;
            character.position.x -= Math.sin(characterRotation) * speed; // Undo movement
        }
    } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }

    // Left A
    if (keyState.character.a) {
        character.position.z += Math.sin(characterRotation) * speed;
        character.position.x -= Math.cos(characterRotation) * speed;
        characterBox.setFromObject(character);
        if (checkCollisions(characterBox)[0]) {
            character.position.z -= Math.sin(characterRotation) * speed;
            character.position.x += Math.cos(characterRotation) * speed; // Undo movement
        }
    } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }

    // Right D
    if (keyState.character.d) {
        character.position.z -= Math.sin(characterRotation) * speed;
        character.position.x += Math.cos(characterRotation) * speed;
        characterBox.setFromObject(character);
        if (checkCollisions(characterBox)[0]) {
            character.position.z += Math.sin(characterRotation) * speed;
            character.position.x -= Math.cos(characterRotation) * speed; // Undo movement
        }
    } else {
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }

    // Harvest Q
    if (touching.length > 0 && keyState.character.q) {
        // Swing right arm
        swingDirection = swingDirection === 1 ? -1 : 1;
        rightArm.rotation.z += swingDirection * 0.5;
        if (Math.abs(rightArm.rotation.z) > Math.PI / 4) {
            swingDirection = -swingDirection;
        }
        // Check if wood
        if (touching[0].obj.name.startsWith("Object_3")) {
            if (document.getElementById("wcount").innerHTML != "500") {
                document.getElementById("wcount").innerHTML = (parseInt(document.getElementById("wcount").innerHTML) + 10).toString();
                keyState.character.q = false;
                if (document.getElementById("wcount").innerHTML == "500") {
                    document.getElementById("wcount").style.color = "green";
                }
            }
        }

        if (touching[0].obj.name.startsWith("C")) {
            if (document.getElementById("fcount").innerHTML != "100") {
                document.getElementById("fcount").innerHTML = (parseInt(document.getElementById("fcount").innerHTML) + 5).toString();
                keyState.character.q = false;
                if (document.getElementById("fcount").innerHTML == "100") {
                    document.getElementById("fcount").style.color = "green";
                }
            }
        }
        // blinking of object on pickaxing
        let originalEmissive = touching[0].obj.material;
        touching[0].obj.material = new THREE.Color(0xffffff);

        setTimeout(() => {
            touching[0].obj.material = originalEmissive; // Restore original color
        }, 250);

    } else {
        rightArm.rotation.z = 0;
    }

    // Collect E
    if (touching.length > 0 && keyState.character.e) {
        // swing left arm
        swingDirection = swingDirection === 1 ? -1 : 1;
        leftArm.rotation.z += swingDirection * 0.5;
        if (Math.abs(leftArm.rotation.z) > Math.PI / 4) {
            swingDirection = -swingDirection;
        }
        // Check if tall grass to collect rope
        if (touching[0].obj.name.startsWith("Object_4")) {
            if (document.getElementById("rcount").innerHTML != "50") {
                document.getElementById("rcount").innerHTML = (parseInt(document.getElementById("rcount").innerHTML) + 5).toString();
                keyState.character.e = false;
                if (document.getElementById("rcount").innerHTML == "50") {
                    document.getElementById("rcount").style.color = "green";
                }

            }
        }
        // Check if Cow to collect fur/wool
        if (touching[0].obj.name.startsWith("C")) {
            if (document.getElementById("scount").innerHTML != "30") {
                document.getElementById("scount").innerHTML = (parseInt(document.getElementById("scount").innerHTML) + 5).toString();
                keyState.character.e = false;
                if (document.getElementById("scount").innerHTML == "30") {
                    document.getElementById("scount").style.color = "green";
                }
            }
        }

        let originalEmissive = touching[0].obj.material;
        touching[0].obj.material = new THREE.Color(0xffffff);

        setTimeout(() => {
            touching[0].obj.material = originalEmissive; // Restore original color
        }, 100);

    } else {
        leftArm.rotation.z = 0;
    }

    // Craft C
    if (keyState.character.c) {
        // craft fabric only if enough rope and wool is there
        if (document.getElementById("scount").innerHTML == "30" && document.getElementById("rcount").innerHTML == "50" && document.getElementById("fabcount").innerHTML != "2") {
            document.getElementById("scount").innerHTML = "0";
            document.getElementById("rcount").innerHTML = "0";
            document.getElementById("fabcount").innerHTML = (parseInt(document.getElementById("fabcount").innerHTML) + 1).toString();
            document.getElementById("scount").style.color = "red";
            document.getElementById("rcount").style.color = "red";
            keyState.character.c = false;
            if (document.getElementById("fabcount").innerHTML == "2") {
                document.getElementById("fabcount").style.color = "green";
            }
        }
    }

    // Make Boat F
    if (keyState.character.f) {
        if ((document.getElementById("wcount").style.color == "green") &&
            (document.getElementById("rcount").style.color == "green") &&
            (document.getElementById("scount").style.color == "green") &&
            (document.getElementById("fcount").style.color == "green") &&
            (document.getElementById("fabcount").style.color == "green")) {
            // boat made visible
            boatobj.visible = true;
            document.getElementById("successdiv").innerHTML = "Congratulations!!\n You have crafted your boat at the harbour";
        }
    }

    // Jump Spacebar
    if (isJumping) {
        character.position.y += jumpVelocity;
        jumpVelocity += gravity;
        if (character.position.y <= 0) {
            character.position.y = 0.125; // Reset position
            isJumping = false; // Stop jumping
            jumpVelocity = 0;
        }
    }
}

// Animate all 
function animate() {
    requestAnimationFrame(animate);
    water.material.uniforms['time'].value += 1.0 / 50.0;  // Slower, more intense waves
    updatePlayers();
    renderer.render(scene, camera);
}

animate();
