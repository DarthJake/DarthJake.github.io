// import * as THREE from 'three';
// import { InteractionManager } from "three.interactive";
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import Stats from 'three/examples/jsm/libs/stats.module'

import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
import { InteractionManager } from 'https://cdn.skypack.dev/three.interactive';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.131.3/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'https://cdn.skypack.dev/three@0.131.3/examples/jsm/libs/stats.module'

import { SolarSystemManager } from "./SolarSystemManager.js"
import { TextManager } from "./TextManager.js"
import { CameraManager } from "./CameraManager.js"

// Setup threejs vars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#background'),
  powerPreference: "high-performance",
	antialias: false,
	stencil: false,
});
const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
const loader = new GLTFLoader();

// My Object Managers
const solarSystem = new SolarSystemManager();
const cameraManager = new CameraManager(camera);
const textManager = new TextManager();

// Timer for animation
var time = 0;
var pageLoad = 0;
var mixer;
var clock;

// Stats
var stats;

// Non Planet Objects
var hand;
var handTarget

// Astroid Planet for Rotation
var astroid;

// Flag
var handFlag = false;
var doStats = false;

// START!
init();

function init() {
  // Setup scene/camera/controls
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onWindowResize, false);

  // Clock
  clock = new THREE.Clock();

  // Stats
  stats = Stats();
  if (doStats) {
    document.body.appendChild(stats.dom);
  }
  
  // Create Scene Elements
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff);

  // Pointer Hand
  hand = new THREE.Mesh();
  handTarget = null;

  // ----- Planets -----
  const planetPromises = [];

  // Earth
  planetPromises.push(new Promise((resolve, reject) => {
    loader.load('models/EarthWithClouds.glb', function (gltf) { // Called after success
      gltf.scene.scale.set(0.025, 0.025, 0.025);

      scene.add(gltf.scene);

      resolve();
    }, function (xhr) { // Called during execution
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) { // called when loading has errors
      reject("Failed loading Earth Planet: " + error);
      return;
    });
}));

  // About Planet
  planetPromises.push(new Promise((resolve, reject) => {
    loader.load('models/AstronautFloating3.glb', function (gltf) { // Called after success

      gltf.scene.scale.set(2, 2, 2);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(-20));
      gltf.scene.rotateY(THREE.MathUtils.degToRad(20));

      // Animation setup and start
      mixer = new THREE.AnimationMixer(gltf.scene);
      var action = mixer.clipAction(gltf.animations[0]);
      action.play();

      solarSystem.addPlanet({
        planetMesh: gltf.scene,
        orbitRadius: 20,
        orbitSpeed: 3,
        positionalVerticalOffset: -10,
        cameraVerticalLookAtOffset: 10,
        focusedDistance: 12,
        focusedHorizontalOffset: 150,
        focusedVerticalAngle: THREE.MathUtils.degToRad(65),
        id: 1,
      });

      handTarget = gltf.scene;
      resolve();
    }, function (xhr) { // Called during execution
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) { // called when loading has errors
      reject("Failed loading About Planet: " + error);
      return;
    });
  }));

  // Skills Planet
  planetPromises.push(new Promise((resolve, reject) => {
    loader.load('models/spaceship.glb', function (gltf) { // Called after success

      gltf.scene.scale.set(3, 3, 3);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(-10));
      gltf.scene.rotateY(THREE.MathUtils.degToRad(10));

      solarSystem.addPlanet({
        planetMesh: gltf.scene,
        orbitRadius: 30.5,
        orbitSpeed: 2.1,
        positionalVerticalOffset: -7,
        cameraVerticalLookAtOffset: 8,
        focusedDistance: 10,
        focusedHorizontalOffset: 140,
        focusedVerticalAngle: THREE.MathUtils.degToRad(50),
        id: 2,
      });

      resolve();
    }, function (xhr) { // Called during execution
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) { // called when loading has errors
      reject("Failed loading Skills Planet: " + error);
      return;
    });
  }));

  // Projects Planet
  planetPromises.push(new Promise((resolve, reject) => {
    // loader.load('models/questionBox.gltf', function (gltf) { // Called after success
    loader.load('models/satellite.glb', function (gltf) { // Called after success

      gltf.scene.scale.set(1.8, 1.8, 1.8);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(-20));
      gltf.scene.rotateY(THREE.MathUtils.degToRad(20));
      gltf.scene.rotateZ(THREE.MathUtils.degToRad(70));

      solarSystem.addPlanet({
        planetMesh: gltf.scene,
        orbitRadius: 36,
        orbitSpeed: 2.5,
        // positionalVerticalOffset: -8,
        // cameraVerticalLookAtOffset: 8,
        focusedDistance: 12,
        // focusedHorizontalOffset: 150,
        focusedVerticalAngle: THREE.MathUtils.degToRad(60),
        id: 3
      });

      resolve();
    }, function (xhr) { // Called during execution
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) { // called when loading has errors
      reject("Failed loading Projects Planet: " + error);
      return;
    });
  }));

  // Contact Me Planet
  planetPromises.push(new Promise((resolve, reject) => {
    loader.load('models/Asteroid1.glb', function (gltf) { // Called after success
      gltf.scene.scale.set(0.5, 0.5, 0.5);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(-20));
      gltf.scene.rotateY(THREE.MathUtils.degToRad(-20));

      solarSystem.addPlanet({
        planetMesh: gltf.scene,
        orbitRadius: 45,
        orbitSpeed: 3.5,
        // cameraVerticalLookAtOffset: 2,
        focusedDistance: 15,
        focusedHorizontalOffset: 120,
        focusedVerticalAngle: THREE.MathUtils.degToRad(65),
        id: 4,
      });

      astroid = gltf.scene;
      resolve();
    }, function (xhr) { // Called during execution
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) { // called when loading has errors
      reject("Failed loading Contact Me Planet: " + error);
      return;
    });
  }));

  // Pointing Hand
  planetPromises.push(new Promise((resolve, reject) => {
    loader.load('models/pointer.gltf', function (gltf) { // Called after success
      gltf.scene.scale.set(0.06, 0.06, 0.06);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(180));
      gltf.scene.visible = false;
      hand = gltf.scene;

      resolve();
    }, function (xhr) { // Called during execution
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) { // called when loading has errors
      reject("Failed loading Pointer Hand: " + error);
      return;
    });
  }));

  // Proceed when all elements are loaded
  Promise.all(planetPromises).then(() => {
    console.log("Promises resolved. Adding elements to the scene:");
    scene.add(ambientLight);
    Array(650).fill().forEach(addStar); // Stars
    solarSystem.getPlanets().forEach(planet => {
      scene.add(planet.planetMesh);
      scene.add(planet.orbit);
      interactionManager.add(planet.planetMesh);
    });
    scene.add(hand);

    // Setup Back Arrow
    const backArrow = document.getElementById("backArrow");
    backArrow.addEventListener('click', event => {
        solarSystem.unfocus();
    });

    pageLoad = Date.now();
    animate(); // Begin!
  });
}

function animate() {
  requestAnimationFrame(animate);
  time = Date.now() * 0.0001;
  var delta = clock.getDelta();
  if (mixer) { mixer.update(delta * 0.3) };

  // Planets Stuff
  solarSystem.getPlanets().forEach(planet => {
    planet.planetMesh.position.x = Math.cos(time * planet.orbitSpeed) * planet.orbitRadius;
    planet.planetMesh.position.z = Math.sin(time * planet.orbitSpeed) * planet.orbitRadius;
  });

  // Hand
  if (hand.visible == false && Date.now() - pageLoad >= 1 * 7000 && !handFlag) {
    hand.visible = true;
  }
  if (hand.visible == true) {
    hand.rotation.y += 0.008;
    hand.position.y = 15 + Math.sin(time * 40) * 1.5;
    hand.position.x = handTarget.position.x + 1;
    hand.position.z = handTarget.position.z - 5;
  }
  if (solarSystem.isFocused()) {
    hand.visible = false;
    handFlag = true;
  }

  // Astroid Rotation
  astroid.rotation.y = -Math.atan2(astroid.position.z, astroid.position.x) + THREE.MathUtils.degToRad(85);

  if (doStats) {
    stats.update();
  }

  interactionManager.update();
  cameraManager.update(solarSystem);
  textManager.update(solarSystem);

  renderer.render(scene, camera);
}

function addStar() {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.25, 1, 1), new THREE.MeshBasicMaterial());

  const [x, y, z] = [
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(350)),
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(200)),
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(350))
  ];

  star.position.set(x, y, z);
  scene.add(star);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}