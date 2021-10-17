import * as THREE from 'three';
import {InteractionManager} from "three.interactive";
// import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
// import { InteractionManager } from "https://cdn.skypack.dev/three.interactive";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {SolarSystemManager} from "./SolarSystemManager.js"
import {CameraManager} from "./CameraManager.js"

// Setup threejs vars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#background')});
const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);
const loader = new GLTFLoader();

// My Object Managers
const solarSystem = new SolarSystemManager();
const cameraManager = new CameraManager(camera);

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

  // Moon Planet
  const moonPlanetPromise = new Promise((resolve, reject) => {
    const moonTexture = new THREE.TextureLoader().load('moon.jpg');
    const moon = new THREE.Mesh(
      new THREE.SphereBufferGeometry(5, 32, 32),
      new THREE.MeshStandardMaterial({
        map: moonTexture
      })
    );
    solarSystem.addPlanet(moon.clone(true), 20, 5, 0, 1);
    resolve("Completed Promise!");
  });

  // About Planet
  const aboutPlanetPromise = new Promise((resolve, reject) => {
      loader.load('models/questionBox.gltf', function (gltf) { // Called after success
        gltf.scene.scale.set(0.008, 0.008, 0.008);
        gltf.scene.rotateX(THREE.MathUtils.degToRad(20));
        gltf.scene.rotateY(THREE.MathUtils.degToRad(20));

        solarSystem.addPlanet(gltf.scene, 40, 3, -4, 2);
        resolve("Completed Promise!");
      }, function (xhr) { // Called during execution
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function (error) { // called when loading has errors
        reject("Failed loading About Planet: " + error);
        return;
      });
  });

  // Proceed when all elements are loaded
  Promise.all([moonPlanetPromise, aboutPlanetPromise]).then(() => {
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
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}