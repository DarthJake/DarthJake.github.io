// import * as THREE from 'three';
// import { InteractionManager } from "three.interactive";
import * as THREE from 'https://cdn.skypack.dev/three@0.131.3/build/three.module.js';
import { InteractionManager } from "https://cdn.skypack.dev/three.interactive";
import { SolarSystemManager } from "./SolarSystemManager.js"
import { CameraManager } from "./CameraManager.js"

// Setup threejs vars
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer({canvas: document.querySelector( '#background' )});
const interactionManager = new InteractionManager(renderer, camera, renderer.domElement);

const solarSystem = new SolarSystemManager();
const cameraManager = new CameraManager(camera);

var time = 0;

init();
animate();

function init() {
  // Setup scene/camera/controls
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.look
  window.addEventListener('resize', onWindowResize, false);

  // Torus
  const geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
  const material = new THREE.MeshStandardMaterial( { color: 0xFF6347 } );
  const torus = new THREE.Mesh( geometry, material );
  scene.add( torus );

  // Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  // Moon Mesh
  const moonTexture = new THREE.TextureLoader().load('moon.jpg');
  const moon = new THREE.Mesh(
    new THREE.SphereBufferGeometry(5, 32, 32),
    new THREE.MeshStandardMaterial( {
      map: moonTexture
    })
  );

  // Make stars
  Array(650).fill().forEach(addStar);
  // Make Planets
  solarSystem.addPlanet(moon.clone(true), 20, 5, 1);
  solarSystem.addPlanet(moon.clone(true), 40, 3, 2);
  solarSystem.addPlanet(moon.clone(true), 50, 2, 3);
  solarSystem.addPlanet(moon.clone(true), 70, 0.5, 4);

  solarSystem.getPlanets().forEach(planet => {
    scene.add(planet.planetMesh);
    scene.add(planet.orbit);
    interactionManager.add(planet.planetMesh);
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
  renderer.render( scene, camera );
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
	renderer.setSize( window.innerWidth, window.innerHeight );
}
