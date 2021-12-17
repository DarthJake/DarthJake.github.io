import * as THREE from 'three';
import {InteractionManager} from "three.interactive";
// import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
// import { InteractionManager } from "https://cdn.skypack.dev/three.interactive";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {SolarSystemManager} from "./SolarSystemManager.js"
import {TextManager} from "./TextManager.js"
import {CameraManager} from "./CameraManager.js"
// import { EffectComposer } from 'https://threejs.org/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'https://threejs.org/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'https://threejs.org/examples/jsm/postprocessing/UnrealBloomPass.js';

// import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer, RenderPass, SelectiveBloomEffect, EffectPass, BlendFunction, KernelSize } from "postprocessing";

// Constants
const bloomOptions = {
  blendFunction: BlendFunction.SCREEN,
  kernelSize: KernelSize.LARGE,
  luminanceThreshold: 0.1,
  luminanceSmoothing: 0.9,
  intensity: 2.2,
  // height: 480
};

// Setup threejs vars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#background'),
  powerPreference: "high-performance",
	antialias: false,
	stencil: false,
  depth: false
});
const renderPass = new RenderPass(scene, camera);
// const bloomPass = new UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85); // strength, radius, threshold
const bloomEffect = new SelectiveBloomEffect(scene, camera, bloomOptions);
const composer = new EffectComposer(renderer);
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

// Non Planet Objects
// var torus;
var hand;
var handTarget

// Astroid Planet for Rotation
var astroid;

// Flag
var handFlag = false;

// START!
init();
animate();

function init() {
  // Setup scene/camera/controls
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onWindowResize, false);

  // Composer
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.addPass(renderPass);
  composer.addPass(new EffectPass(camera, bloomEffect));

  // Clock
  clock = new THREE.Clock();

  // Create Scene Elements
  // Torus
  // const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  // const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
  // torus = new THREE.Mesh(geometry, material);
 
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
      // gltf.scene.scale.set(0.025, 0.025, 0.025);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(-10));
      gltf.scene.rotateY(THREE.MathUtils.degToRad(10));

      solarSystem.addPlanet({
        planetMesh: gltf.scene,
        orbitRadius: 30.5,
        orbitSpeed: 2.1,
        positionalVerticalOffset: -8,
        cameraVerticalLookAtOffset: 8,
        focusedDistance: 10,
        focusedHorizontalOffset: 150,
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

      gltf.scene.scale.set(2, 2, 2);
      // gltf.scene.scale.set(0.025, 0.025, 0.025);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(-20));
      gltf.scene.rotateY(THREE.MathUtils.degToRad(20));
      gltf.scene.rotateZ(THREE.MathUtils.degToRad(70));

      solarSystem.addPlanet({
        planetMesh: gltf.scene,
        orbitRadius: 35,
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

  // Moon Planet
  // planetPromises.push(new Promise((resolve, reject) => {
  //   const moonTexture = new THREE.TextureLoader().load('moon.jpg');
  //   const moon = new THREE.Mesh(
  //     new THREE.SphereBufferGeometry(5, 32, 32),
  //     new THREE.MeshStandardMaterial({
  //       map: moonTexture
  //     })
  //   );
  //   solarSystem.addPlanet({
  //     planetMesh: moon.clone(true),
  //     orbitRadius: 35,
  //     orbitSpeed: 1,
  //     id: 3,
  //   });
  //   resolve();
  // }));

  // Contact Me Planet
  planetPromises.push(new Promise((resolve, reject) => {
    loader.load('models/Asteroid1.glb', function (gltf) { // Called after success
      gltf.scene.scale.set(0.5, 0.5, 0.5);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(-20));
      gltf.scene.rotateY(THREE.MathUtils.degToRad(-20));

      solarSystem.addPlanet({
        planetMesh: gltf.scene,
        orbitRadius: 45,
        // orbitSpeed: 2.6,
        orbitSpeed: 10,
        // positionalVerticalOffset: -3,
        // cameraVerticalLookAtOffset: 2,
        // focusedDistance: 8.5,
        // focusedHorizontalOffset: 150,
        // focusedVerticalAngle: THREE.MathUtils.degToRad(65),
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
      // gltf.scene.scale.set(.5, 0.5, 0.5);
      gltf.scene.rotateX(THREE.MathUtils.degToRad(180));
      gltf.scene.visible = false;
      // gltf.scene.rotateY(THREE.MathUtils.degToRad(20));
      // bloomEffect.selection.add(gltf.scene);
      hand = gltf.scene;
      hand.name = "HAND!!!"
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
    // scene.add(torus);
    scene.add(ambientLight);
    Array(650).fill().forEach(addStar); // Stars

    

    solarSystem.getPlanets().forEach(planet => {
      // console.log("\t- Adding planet id '" + planet.id + "' to scene and interaction manager.");
      scene.add(planet.planetMesh);
      scene.add(planet.orbit);
      // if (planet.childMesh != null) {
      //   console.log(`Added2!! - ${planet.id}`)
      //   scene.add(planet.childMesh);
      //   planet.addChildMesh();
      // }
      interactionManager.add(planet.planetMesh);
      // bloomEffect.selection.add(planet.planetMesh);
    });

    scene.add(hand);
    // solarSystem.getPlanetByIndex(0).planetMesh.add(hand);
    // hand.position.y = 10;
    // hand.visible = true;

    // Setup Back Arrow
    const backArrow = document.getElementById("backArrow");
    backArrow.addEventListener('click', event => {
        solarSystem.unfocus();
    });

    pageLoad = Date.now();
  });
}

function animate() {
  requestAnimationFrame(animate);
  time = Date.now() * 0.0001;
  var delta = clock.getDelta();
  if (mixer) { mixer.update(delta * 0.3) };

  // Animate Torus
  // torus.rotation.x += 0.01;
  // torus.rotation.y += 0.005;
  // torus.rotation.z += 0.01;

  // Planets Stuff
  solarSystem.getPlanets().forEach(planet => {
    // Animate planet positions
    planet.planetMesh.position.x = Math.cos(time * planet.orbitSpeed) * planet.orbitRadius;
    planet.planetMesh.position.z = Math.sin(time * planet.orbitSpeed) * planet.orbitRadius;
  });

  // Hand Stuff
  if (hand.visible == false && Date.now() - pageLoad >= 1 * 1000 && !handFlag) {
    hand.visible = true;
  }
  if (hand.visible == true) {
    hand.rotation.y += 0.008;
    hand.position.y = 15 + Math.sin(time * 40) * 1.5;
    hand.position.x = handTarget.position.x + 1;
    hand.position.z = handTarget.position.z - 5;
    // hand.position.x = 0;
    // hand.position.z = 0;
  }
  if (solarSystem.isFocused()) {
    hand.visible = false;
    handFlag = true;
  }

  // Astroid Rotation
  astroid.rotation.y = Math.atan2(astroid.position.z, astroid.position.x);
  console.log(astroid.rotation.y);

  interactionManager.update();
  cameraManager.update(solarSystem);
  textManager.update(solarSystem);

  // renderer.render(scene, camera);
  composer.render();
}

function addStar() {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.25, 1, 1), new THREE.MeshBasicMaterial());

  const [x, y, z] = [
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(350)),
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(200)),
    Array(1).fill().map(() => THREE.MathUtils.randFloatSpread(350))
  ];

  star.position.set(x, y, z);
  bloomEffect.selection.add(star);
  scene.add(star);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  composer.setSize(width, height);
}