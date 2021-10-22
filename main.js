import * as THREE from 'three';
import {InteractionManager} from "three.interactive";
// import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
// import { InteractionManager } from "https://cdn.skypack.dev/three.interactive";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {SolarSystemManager} from "./SolarSystemManager.js"
import {TextManager} from "./TextManager.js"
import {CameraManager} from "./CameraManager.js"
import { CompressedTextureLoader } from 'three';

// Setup threejs vars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#background')});
const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
const loader = new GLTFLoader();


// My Object Managers
const solarSystem = new SolarSystemManager();
const cameraManager = new CameraManager(camera);
const textManager = new TextManager();

// Timer for animation
var time = 0;

// START!
init();
animate();

function init() {
  // Setup scene/camera/controls
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onWindowResize, false);

  // Create Scene Elements
  // Torus
  const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
  const material = new THREE.MeshStandardMaterial({color: 0xFF6347});
  const torus = new THREE.Mesh(geometry, material);
 
  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff);

  // ----- Planets -----
  const planetPromises = [];
  // Moon Planet
  planetPromises.push(new Promise((resolve, reject) => {
    const moonTexture = new THREE.TextureLoader().load('moon.jpg');
    const moon = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 32, 32),
      new THREE.MeshStandardMaterial({
        map: moonTexture
      })
    );
    solarSystem.addPlanet({
      planetMesh: moon.clone(true),
      orbitRadius: 20,
      orbitSpeed: 3,
      id: 1,
    });
    resolve();
  }));

  // About Planet
  planetPromises.push(new Promise((resolve, reject) => {
      loader.load('models/questionBox.gltf', function (gltf) { // Called after success
        gltf.scene.scale.set(0.0075, 0.0075, 0.0075);
        gltf.scene.rotateX(THREE.MathUtils.degToRad(20));
        gltf.scene.rotateY(THREE.MathUtils.degToRad(20));

        solarSystem.addPlanet({
          planetMesh: gltf.scene,
          orbitRadius: 30,
          orbitSpeed: 1,
          positionalVerticalOffset: -3,
          cameraVerticalLookAtOffset: 2,
          focusedDistance: 8.5,
          focusedHorizontalOffset: 150,
          focusedVerticalAngle: THREE.MathUtils.degToRad(65),
          id: 2,
        });
        resolve();
      }, function (xhr) { // Called during execution
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function (error) { // called when loading has errors
        reject("Failed loading About Planet: " + error);
        return;
      });
  }));

  // Proceed when all elements are loaded
  Promise.all(planetPromises).then(() => {
    console.log("Promises resolved. Adding elements to the scene:");
    scene.add(torus);
    scene.add(ambientLight);
    Array(650).fill().forEach(addStar); // Stars

    solarSystem.getPlanets().forEach(planet => {
      console.log("\t- Adding planet id '" + planet.id + "' to scene and interaction manager.");
      scene.add(planet.planetMesh);
      scene.add(planet.orbit);
      interactionManager.add(planet.planetMesh);
    });
  });
}

function animate() {
  requestAnimationFrame(animate);
  time = Date.now() * 0.0001;

  // Animate Torus
  // torus.rotation.x += 0.01;
  // torus.rotation.y += 0.005;
  // torus.rotation.z += 0.01;

  // Animate Planets
  solarSystem.getPlanets().forEach(planet => {
    planet.planetMesh.position.x = Math.cos(time * planet.orbitSpeed) * planet.orbitRadius;
    planet.planetMesh.position.z = Math.sin(time * planet.orbitSpeed) * planet.orbitRadius;
  });

  interactionManager.update();
  cameraManager.update(solarSystem);
  textManager.update(solarSystem);
  renderer.render(scene, camera);
}

function addStar() {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 24), new THREE.MeshBasicMaterial());

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